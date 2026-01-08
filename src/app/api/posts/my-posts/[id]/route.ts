import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  deleteFile,
  enhancePostsWithSignedUrls,
  extractKeyFromUrl,
} from "@/lib/aws-s3";
import { authOptions } from "@/lib/auth-providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required",
          code: "MISSING_POST_ID",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found",
          code: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        images: true,
        comments: {
          select: {
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found or access denied",
          code: "POST_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const [enhancedPost] = await enhancePostsWithSignedUrls([post]);

    return NextResponse.json({
      success: true,
      data: enhancedPost,
      message: "Post retrieved successfully",
      code: "POST_RETRIEVED",
    });
  } catch (error) {
    console.error("Post Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching the post",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
///Delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    // 1. Fetch the post and its images FIRST
    // We need the URLs for S3 cleanup and the coverImage for Collection updates
    const post = await prisma.post.findUnique({
      where: { id: postId, userId },
      include: { images: { select: { url: true } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 2. Perform Database Operations in a Transaction
    await prisma.$transaction(async (tx) => {
      // A. Update Collections that use this specific Post's coverImage
      // We null them out first. If you want to find a "new" cover,
      // it's better done as a separate background task or simplified here.
      if (post.coverImage) {
        await tx.collection.updateMany({
          where: {
            userId,
            coverImage: post.coverImage,
          },
          data: { coverImage: null },
        });
      }

      // B. Delete the Post
      // Because of 'onDelete: Cascade' in your schema, this AUTOMATICALLY deletes:
      // - SavedPosts, Likes, Comments, Images (the DB records)
      // It also automatically DISCONNECTS the post from all Collections.
      await tx.post.delete({
        where: { id: postId },
      });
    });

    // 3. S3 Cleanup (Post-Transaction)
    // We use Settled to ensure one failure doesn't stop the others.
    const keysToDelete = [
      ...(post.coverImage ? [post.coverImage] : []),
      ...post.images.map((img) => img.url),
    ]
      .map((url) => {
        try {
          return extractKeyFromUrl(url);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];

    // Fire and forget S3 cleanup so the user doesn't wait for AWS latencies
    const cleanupS3 = async () => {
      const results = await Promise.allSettled(
        keysToDelete.map((key) => deleteFile(key))
      );
      const errors = results.filter((r) => r.status === "rejected");
      if (errors.length > 0)
        console.error(`S3 Cleanup failed for ${errors.length} files`);
    };

    cleanupS3();

    return NextResponse.json({
      success: true,
      message: "Post and assets deleted",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

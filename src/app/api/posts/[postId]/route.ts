import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import prisma from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "Post ID is required", code: "MISSING_ID" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post || post.isDraft) {
      return NextResponse.json(
        { success: false, message: "Post not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Sign cover image
    const rawCover = post.coverImage || post.images[0]?.url || null;
    const signedCoverImage = rawCover
      ? await generatePresignedViewUrl(extractKeyFromUrl(rawCover))
      : null;

    // Sign each image
    const signedImages = await Promise.all(
      post.images.map(async (img) => ({
        ...img,
        url: await generatePresignedViewUrl(extractKeyFromUrl(img.url)),
      }))
    );

    // Sign avatar
    if (post.user.avatar) {
      post.user.avatar = await generatePresignedViewUrl(
        extractKeyFromUrl(post.user.avatar)
      );
    }

    // Check if saved by current user
    let isSaved = false;
    if (session?.user?.id) {
      const saved = await prisma.savedPost.findFirst({
        where: { postId, userId: session.user.id },
      });
      isSaved = !!saved;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        coverImage: signedCoverImage,
        images: signedImages,
        isSaved,
      },
      message: "Post fetched successfully",
      code: "POST_FETCHED_SUCCESSFULLY",
    },
    { status: 200 }
  );
  } catch (error) {
    console.error("Single post fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching post",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

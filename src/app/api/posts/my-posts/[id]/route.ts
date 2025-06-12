import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { enhancePostsWithSignedUrls } from "@/lib/aws-s3";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own posts
      },
      select: {
        title: true,
        description: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        visibility: true,
        tags: true,
        isDraft: true,
        coverImage: true,
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
        { error: "Post not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare post data for URL enhancement
    const postForEnhancement = {
        ...post,
        coverImage: post.coverImage,
        images: post.images.map((image) => ({
          id: image.id,
          url: image.url,
          description: image.description,
        })),
      };
      const [enhancedPost] = await enhancePostsWithSignedUrls([
        postForEnhancement,
      ]);

    
    return NextResponse.json(enhancedPost);
  } catch (error) {
    console.error("Post Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

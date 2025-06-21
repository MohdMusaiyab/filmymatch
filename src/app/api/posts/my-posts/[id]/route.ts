import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { enhancePostsWithSignedUrls } from "@/lib/aws-s3";
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

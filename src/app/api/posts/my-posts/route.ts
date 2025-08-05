import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  enhancePostsWithSignedUrls,
  extractKeyFromUrl,
  generatePresignedViewUrl,
} from "@/lib/aws-s3";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" ,code: "USER_NOT_FOUND",success: false}, { status: 404 });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          images: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: { userId: user.id },
      }),
    ]);

    const rawPostsWithMeta = await Promise.all(
      posts.map(async (post) => {
        // Get isSaved
        const isSaved = await prisma.savedPost.findFirst({
          where: {
            userId: user.id,
            postId: post.id,
          },
          select: { id: true },
        });

        // Sign avatar
        const signedAvatar = post.user.avatar
          ? await generatePresignedViewUrl(extractKeyFromUrl(post.user.avatar))
          : null;

        return {
          ...post,
          postId: post.id,
          isSaved: !!isSaved,
          images: post.images,
          user: {
            ...post.user,
            avatar: signedAvatar,
          },
        };
      })
    );

    const postsWithSignedUrls = await enhancePostsWithSignedUrls(
      rawPostsWithMeta
    );

    return NextResponse.json({
      success: true,
      message: "Posts retrieved successfully",
      data: {
        posts: postsWithSignedUrls,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error("My Posts Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal server error" ,code: "INTERNAL_SERVER_ERROR",success: false},
      { status: 500 }
    );
  }
}

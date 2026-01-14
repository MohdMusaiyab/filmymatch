import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  extractKeyFromUrl,
  generatePresignedViewUrl,
} from "@/lib/aws-s3";
import { authOptions } from "@/lib/auth-providers";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    // 1. Unified Query: Get posts, counts, likes, and saved status in ONE fetch
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: currentUserId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
          images: true,
          _count: {
            select: { likes: true, comments: true },
          },
          // ✅ FIX: No more loops! Check interaction status here
          likes: { where: { userId: currentUserId } },
          savedBy: { where: { userId: currentUserId } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: { userId: currentUserId },
      }),
    ]);

    // Helper for S3 signing
    const signUrl = async (url: string | null) => {
      if (!url) return null;
      try {
        const key = extractKeyFromUrl(url);
        return await generatePresignedViewUrl(key);
      } catch (e) {
        console.log(e);
        return url; 
      }
    };

    // 2. ✅ Parallel S3 Signing & Data Formatting
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Sign cover and avatar in parallel
        const [signedCover, signedAvatar, signedImages] = await Promise.all([
          signUrl(post.coverImage),
          signUrl(post.user.avatar),
          Promise.all((post.images || []).map(async (img) => ({
            ...img,
            url: await signUrl(img.url)
          })))
        ]);

        return {
          ...post,
          coverImage: signedCover,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          isLiked: post.likes.length > 0,
          isSaved: post.savedBy.length > 0,
          user: {
            ...post.user,
            avatar: signedAvatar,
          },
          images: signedImages,
          // Clean up technical relation arrays before sending to client
          likes: undefined,
          savedBy: undefined,
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "Posts retrieved successfully",
      data: {
        posts: formattedPosts,
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
      { message: "Internal server error", code: "INTERNAL_SERVER_ERROR", success: false },
      { status: 500 }
    );
  }
}
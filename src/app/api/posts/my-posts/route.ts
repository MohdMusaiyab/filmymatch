import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { enhancePostsWithSignedUrls } from "@/lib/aws-s3";
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    // Add this part to enhance posts with signed URLs

    const postsWithSignedUrls = await enhancePostsWithSignedUrls(
      posts.map((post) => ({
        ...post,
        coverImage: post.coverImage,
        images: post.images.map((image) => ({ url: image.url })),
      }))
    );
    console.log("Finished enhancing posts with signed URLs");

    return NextResponse.json({
      posts: postsWithSignedUrls, // Use the enhanced posts here
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("My Posts Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

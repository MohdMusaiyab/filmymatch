import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import prisma from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Fetching recent posts for user:", session.user.id);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        // Don't fetch all images, we’ll fetch one if needed later
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
      take: 3,
    });

    const postsWithSignedCover = await Promise.all(
      posts.map(async (post) => {
        let imageToUse = post.coverImage;

        // Fallback: fetch one image only if no coverImage
        if (!imageToUse) {
          const fallbackImage = await prisma.image.findFirst({
            where: { postId: post.id },
            select: { url: true },
          });
          imageToUse = fallbackImage?.url || null;
        }

        const signedCoverImage = imageToUse
          ? await generatePresignedViewUrl(extractKeyFromUrl(imageToUse))
          : null;

        return {
          ...post,
          coverImage: signedCoverImage,
        };
      })
    );

    return NextResponse.json({
      posts: postsWithSignedCover,
      count: posts.length,
    });
  } catch (error) {
    console.error("Recent Posts Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

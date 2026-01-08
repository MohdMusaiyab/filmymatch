import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import prisma from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access. Please log in.",
          code: "UNAUTHORIZED",
          data: null,
        },
        { status: 401 }
      );
    }

    const collections = await prisma.collection.findMany({
      where: {
        userId: session.user.id,
        isDraft: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        name: true,
        description: true,
        coverImage: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true, // ✅ POST COUNT
          },
        },
      },
    });


    const signedCollections = await Promise.all(
      collections.map(async (collection) => {
        const signedCoverImage = collection.coverImage
          ? await generatePresignedViewUrl(
            extractKeyFromUrl(collection.coverImage)
          )
          : null;

        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          coverImage: signedCoverImage,
          visibility: collection.visibility,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
          postCount: collection._count.posts,
        };
      })
    );


    return NextResponse.json(
      {
        success: true,
        message: "Recent collections fetched successfully.",
        code: "RECENT_COLLECTIONS_FETCHED",
        data: {
          collections: signedCollections,
          pagination: {
            total: signedCollections.length,
            limit: 4,
            offset: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Recent Collections Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching recent collections.",
        code: "INTERNAL_SERVER_ERROR",
        data: null,
      },
      { status: 500 }
    );
  }
}

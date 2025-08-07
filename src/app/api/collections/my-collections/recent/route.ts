import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import prisma from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      },
    });

    const signedCollections = await Promise.all(
      collections.map(async (collection) => {
        const signedCoverImage = collection.coverImage
          ? await generatePresignedViewUrl(extractKeyFromUrl(collection.coverImage))
          : null;

        return {
          ...collection,
          coverImage: signedCoverImage,
        };
      })
    );

    return NextResponse.json({ collections: signedCollections });
  } catch (error) {
    console.error("Recent Collections Fetch Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

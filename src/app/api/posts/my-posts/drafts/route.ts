import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { enhancePostsWithSignedUrls } from "@/lib/aws-s3";
import { authOptions } from "@/lib/auth-providers";

export async function GET(request: NextRequest) {
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

    const drafts = await prisma.post.findMany({
      where: {
        userId: user.id,
        isDraft: true,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        images: true,
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    const enhancedDrafts = await enhancePostsWithSignedUrls(drafts);

    return NextResponse.json(
      {
        success: true,
        message: "Draft posts retrieved successfully",
        code: "DRAFTS_RETRIEVED",
        data: {
          drafts: enhancedDrafts,
          pagination: {
            total: drafts.length,
            hasNextPage: false, // You can expand later
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Draft Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching drafts",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

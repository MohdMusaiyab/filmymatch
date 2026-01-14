"use server";
import { getSession } from "@/lib/auth";
import {  extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";
import prisma from "@/lib/prisma";
//Can modify it to accept userId also so that it works faster
export async function savePost(postId: string) {
  const session = await getSession();

  if (!session?.id) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      },
    };
  }

  if (!postId || typeof postId !== "string") {
    return {
      success: false,
      error: {
        message: "Invalid post ID",
        code: "INVALID_INPUT",
      },
    };
  }

  try {
    await prisma.savedPost.create({
      data: {
        userId: session.id,
        postId,
      },
    });

    return {
      success: true,
      message: "Post saved successfully",
      code: "SUCCESS",
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        error: {
          message: "Post already saved",
          code: "ALREADY_SAVED",
        },
      };
    }

    console.error("savePost error:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}
//Just check it
export async function unsavePost(postId: string) {
  const session = await getSession();

  if (!session?.id) {
    return {
      success: false,
      error: {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      },
    };
  }

  if (!postId || typeof postId !== "string") {
    return {
      success: false,
      error: {
        message: "Invalid post ID",
        code: "INVALID_INPUT",
      },
    };
  }

  try {
    const deleted = await prisma.savedPost.deleteMany({
      where: {
        userId: session.id,
        postId,
      },
    });

    if (deleted.count === 0) {
      return {
        success: false,
        error: {
          message: "Post was not saved",
          code: "NOT_SAVED",
        },
      };
    }

    return {
      success: true,
      message: "Post removed from saved",
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("unsavePost error:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        code: "SERVER_ERROR",
      },
    };
  }
}
interface GetSavedPostsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getSavedPosts({
  page = 1,
  limit = 10,
  search = "",
}: GetSavedPostsParams) {
  const session = await getSession();

  if (!session?.id) {
    return {
      success: false,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    };
  }

  try {
    const skip = (page - 1) * limit;
    const currentUserId = session.id;

    const [total, savedPosts] = await Promise.all([
      prisma.savedPost.count({
        where: {
          userId: currentUserId,
          post: {
            ...(search.trim() && {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
          },
        },
      }),
      prisma.savedPost.findMany({
        where: {
          userId: currentUserId,
          post: {
            ...(search.trim() && {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }),
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          post: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
              images: true,
              // ✅ ADDED: Interaction counts
              _count: {
                select: { likes: true, comments: true },
              },
              // ✅ ADDED: Personal interaction state
              likes: { where: { userId: currentUserId } },
            },
          },
        },
      }),
    ]);

    // 1. Extract posts and filter visibility
    const visiblePosts = savedPosts
      .map(({ post }) => post)
      .filter((post) => {
        if (post.visibility === "PUBLIC") return true;
        if (post.userId === currentUserId) return true;
        return false;
      });

    // Helper for S3 signing
    const signUrl = async (url: string | null) => {
      if (!url) return null;
      try {
        return await generatePresignedViewUrl(extractKeyFromUrl(url));
      } catch { return url; }
    };

    // 2. ✅ Parallel Image Signing & Data Transformation
    const transformedPosts = await Promise.all(
      visiblePosts.map(async (post) => {
        const [signedCover, signedAvatar, signedImages] = await Promise.all([
          signUrl(post.coverImage),
          signUrl(post.user.avatar),
          Promise.all(post.images.map(async (img) => ({
            ...img,
            url: await signUrl(img.url)
          })))
        ]);

        return {
          ...post,
          coverImage: signedCover,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          user: {
            ...post.user,
            avatar: signedAvatar
          },
          images: signedImages,
          // ✅ ADDED: Explicit booleans for Snippet
          isSaved: true, // They are coming from the SavedPost table
          isLiked: post.likes.length > 0,
        };
      })
    );

    return {
      success: true,
      data: {
        posts: transformedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      code: "SUCCESS",
    };
  } catch (error) {
    console.error("getSavedPosts error:", error);
    return {
      success: false,
      error: { message: "Internal server error", code: "SERVER_ERROR" },
    };
  }
}
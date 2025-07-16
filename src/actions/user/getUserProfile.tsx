"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { enhancePostsWithSignedUrls, extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

type Visibility = 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';

type UserProfileResponse = {
    success: boolean;
    data?: {
        profile: {
            id: string;
            username: string;
            avatar: string | null;
            bio: string | null;
            joinDate: Date;
            stats: {
                totalPosts: number;
                publicPosts: number;
                privatePosts: number;
                followersPosts: number;
                visiblePosts: number;
                followers: number;
                following: number;
                collections: number;
            };
        };
        posts: {
            items: Array<{
                id: string;
                title: string;
                description: string;
                category: string;
                coverImage: string | null;
                visibility: Visibility;
                createdAt: Date;
                _count: {
                    likes: number;
                    comments: number;
                };
            }>;
            total: number;
            page: number;
            hasMore: boolean;
        };
        highlights: {
            items: Array<{
                id: string;
                notes: string | null;
                createdAt: Date;
                post: {
                    id: string;
                    title: string;
                    coverImage: string | null;
                    category: string;
                };
            }>;
            total: number;
            page: number;
            hasMore: boolean;
        };
        permissions: {
            canSeePrivatePosts: boolean;
            canSeeFollowersPosts: boolean;
        };
    };
    error?: {
        message: string;
        code: string;
    };
};

export async function getUserProfile({
    userId,
    postsPage = 1,
    highlightsPage = 1,
    postsPerPage = 6,
    highlightsPerPage = 5,
  }: {
    userId: string;
    postsPage?: number;
    highlightsPage?: number;
    postsPerPage?: number;
    highlightsPerPage?: number;
  }): Promise<UserProfileResponse> {
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: {
          message: "Invalid user ID",
          code: "INVALID_INPUT",
        },
      };
    }
  
    try {
      const session = await getSession();
      if (!session) {
        return {
          success: false,
          error: {
            message: "Unauthorized access",
            code: "UNAUTHORIZED",
          },
        };
      }
  
      const currentUserId = session?.id;
      const isOwnProfile = currentUserId === userId;
  
      const isFollowing = currentUserId
        ? !!(await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUserId,
                followingId: userId,
              },
            },
          }))
        : false;
  
      const visiblePostFilter = isOwnProfile
        ? {}
        : isFollowing
        ? { OR: [{ visibility: "PUBLIC" as Visibility }, { visibility: "FOLLOWERS" as Visibility }] }
        : { visibility: "PUBLIC" as Visibility };
  
      const [
        user,
        publicPostCount,
        followersPostCount,
        privatePostCount,
        visiblePostCount,
        posts,
        highlights,
        totalHighlights,
      ] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true,
            _count: {
              select: {
                followers: true,
                followings: true,
                collections: true,
              },
            },
          },
        }),
        prisma.post.count({
          where: { userId, isDraft: false, visibility: "PUBLIC" },
        }),
        prisma.post.count({
          where: { userId, isDraft: false, visibility: "FOLLOWERS" },
        }),
        prisma.post.count({
          where: { userId, isDraft: false, visibility: "PRIVATE" },
        }),
        prisma.post.count({
          where: {
            userId,
            isDraft: false,
            ...visiblePostFilter,
          },
        }),
        prisma.post.findMany({
          where: {
            userId,
            isDraft: false,
            ...visiblePostFilter,
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            coverImage: true,
            visibility: true,
            createdAt: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (postsPage - 1) * postsPerPage,
          take: postsPerPage,
        }),
        prisma.highlightedPost.findMany({
          where: { userId },
          select: {
            id: true,
            notes: true,
            createdAt: true,
            post: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (highlightsPage - 1) * highlightsPerPage,
          take: highlightsPerPage,
        }),
        prisma.highlightedPost.count({ where: { userId } }),
      ]);
  
      if (!user) {
        return {
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        };
      }
  
      // ⛓️ Sign avatar if exists
      if (user.avatar) {
        try {
          const avatarKey = extractKeyFromUrl(user.avatar);
          user.avatar = await generatePresignedViewUrl(avatarKey);
        } catch (err) {
          console.warn("Avatar signing failed", err);
          user.avatar = null;
        }
      } else {
        user.avatar = null;
      }
  
      // 🔐 Dynamic `isSaved` post enhancement
      const postIds = posts.map((p) => p.id);
      let savedPostIds: Set<string> = new Set();
  
      if (currentUserId && postIds.length > 0) {
        const savedPosts = await prisma.savedPost.findMany({
          where: {
            userId: currentUserId,
            postId: { in: postIds },
          },
          select: { postId: true },
        });
  
        savedPostIds = new Set(savedPosts.map((sp) => sp.postId));
      }
  
      // 🔁 Sign cover images & add isSaved
      const signedPosts = await enhancePostsWithSignedUrls(
        posts.map((post) => ({
          ...post,
          images: [],
        }))
      ).then((enhancedPosts) =>
        enhancedPosts.map((post, index) => ({
          ...posts[index],
          coverImage: post.coverImage,
          isSaved: savedPostIds.has(posts[index].id), // ✅ Dynamic isSaved
        }))
      );
  
      // 🔁 Sign highlight post covers
      const signedHighlights = await enhancePostsWithSignedUrls(
        highlights.map((h) => ({
          ...h.post,
          images: [],
        }))
      );
  
      return {
        success: true,
        data: {
          profile: {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            joinDate: user.createdAt,
            stats: {
              totalPosts: publicPostCount + followersPostCount + privatePostCount,
              publicPosts: publicPostCount,
              privatePosts: privatePostCount,
              followersPosts: followersPostCount,
              visiblePosts: visiblePostCount,
              followers: user._count.followers,
              following: user._count.followings,
              collections: user._count.collections,
            },
          },
          posts: {
            items: signedPosts,
            total: visiblePostCount,
            page: postsPage,
            hasMore: postsPage * postsPerPage < visiblePostCount,
          },
          highlights: {
            items: highlights.map((highlight, index) => ({
              ...highlight,
              post: {
                ...highlight.post,
                coverImage: signedHighlights[index].coverImage,
              },
            })),
            total: totalHighlights,
            page: highlightsPage,
            hasMore: highlightsPage * highlightsPerPage < totalHighlights,
          },
          permissions: {
            canSeePrivatePosts: isOwnProfile,
            canSeeFollowersPosts: isFollowing || isOwnProfile,
          },
        },
      };
    } catch (error) {
      console.error("Profile fetch error:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
          code: "SERVER_ERROR",
        },
      };
    }
  }
  
import prisma from "@/lib/prisma";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";
import { Post as PostType } from "@/types/Post";

export async function getDashboardData(userId: string | undefined) {
  if (!userId) {
    return { posts: [], collections: [], drafts: [] };
  }

  try {
    // 1. Parallel Database Queries
    const [rawPosts, rawCollections, rawDrafts] = await Promise.all([
      prisma.post.findMany({
        where: { userId, isDraft: false },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true, avatar: true } },
          images: { select: { id: true, url: true, description: true } },
          likes: { where: { userId } },
          savedBy: { where: { userId } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.collection.findMany({
        where: { userId },
        take: 4,
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { posts: true } },
        },
      }),
      prisma.post.findMany({
        where: { userId, isDraft: true },
        take: 3,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // 2. Process Posts (Sign Cover and User Avatar)
    const posts: PostType[] = await Promise.all(
      rawPosts.map(async (post) => {
        let signedCover = undefined;
        if (post.coverImage) {
          try {
            const key = extractKeyFromUrl(post.coverImage);
            signedCover = await generatePresignedViewUrl(key);
          } catch (e) {
            signedCover = post.coverImage;
          }
        }

        let signedAvatar = post.user.avatar;
        if (post.user.avatar) {
          try {
            const avatarKey = extractKeyFromUrl(post.user.avatar);
            signedAvatar = await generatePresignedViewUrl(avatarKey);
          } catch (e) {
            signedAvatar = post.user.avatar;
          }
        }

        return {
          ...post,
          coverImage: signedCover,
          createdAt: post.createdAt.toISOString(),
          isLiked: post.likes.length > 0,
          isSaved: post.savedBy.length > 0,
          user: {
            ...post.user,
            avatar: signedAvatar, // Signed avatar for the post owner
          },
        } as PostType;
      })
    );

    // 3. Process Collections (Sign Collection Cover Images)
    const collections = await Promise.all(
      rawCollections.map(async (col) => {
        let signedColCover = (col as any).coverImage; // Casting to any to safely check for coverImage
        if (signedColCover) {
          try {
            const key = extractKeyFromUrl(signedColCover);
            signedColCover = await generatePresignedViewUrl(key);
          } catch (e) {
            signedColCover = (col as any).coverImage;
          }
        }
        return {
          ...col,
          coverImage: signedColCover,
          postCount: (col as any)._count?.posts || 0,
        };
      })
    );

    // 4. Process Drafts (Simple strings, but we ensure dates are serialized)
    const drafts = rawDrafts.map(draft => ({
      ...draft,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    }));

    return { posts, collections, drafts };
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return { posts: [], collections: [], drafts: [] };
  }
}
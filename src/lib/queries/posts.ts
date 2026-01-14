import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Post as PostType } from "@/types/Post";
import { Category, TAGS, Visibility } from "@prisma/client";
// Importing your specific AWS utilities
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

interface FetchPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string[];
  categories?: string[];
  visibility?: Visibility;
}

export async function getExplorePosts({
  page = 1,
  limit = 12,
  search,
  tags,
  categories,
  visibility,
}: FetchPostsParams = {}) {
  try {
    const session = await getSession();
    // Using session.id based on your provided type
    const currentUserId = session?.id; 
    const skip = (page - 1) * limit;

    // 1. Build the dynamic where clause
    const where: any = {
      isDraft: false,
      visibility: visibility || Visibility.PUBLIC,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categories && categories.length > 0) {
      where.category = { in: categories as Category[] };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags as TAGS[] };
    }

    // 2. Execute the Mega-Query
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              description: true,
            },
          },
          // Nested filters for N+1 fix
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
          savedBy: currentUserId ? { where: { userId: currentUserId } } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    console.log(`[DEBUG] Fetched ${posts.length} posts from DB.`);
    posts.forEach(p => {
      console.log(`Post ID: ${p.id} | Raw coverImage: ${p.coverImage || 'NULL'}`);
    });
    // 3. Map and Sign All URLs in Parallel
    const formattedPosts: PostType[] = await Promise.all(
      posts.map(async (post) => {
        
        // --- SIGN COVER IMAGE ---
        let signedCover = undefined;
        if (post.coverImage) {
          try {
            const coverKey = extractKeyFromUrl(post.coverImage);
            signedCover = await generatePresignedViewUrl(coverKey);
          } catch (e) {
            console.error("Cover image signing error:", e);
            signedCover = post.coverImage; 
          }
        }

        // --- SIGN USER AVATAR ---
        let signedAvatar = null;
        if (post.user.avatar) {
          try {
            const avatarKey = extractKeyFromUrl(post.user.avatar);
            signedAvatar = await generatePresignedViewUrl(avatarKey);
          } catch (e) {
            signedAvatar = post.user.avatar;
          }
        }

        // --- SIGN GALLERY IMAGES ---
        const signedGallery = await Promise.all(
          post.images.map(async (img) => {
            try {
              const key = extractKeyFromUrl(img.url);
              const signedUrl = await generatePresignedViewUrl(key);
              return { ...img, url: signedUrl };
            } catch (e) {
              return img;
            }
          })
        );

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          category: post.category,
          visibility: post.visibility,
          coverImage: signedCover,
          createdAt: post.createdAt.toISOString(),
          tags: post.tags,
          isDraft: post.isDraft,
          user: {
            id: post.user.id,
            username: post.user.username,
            avatar: signedAvatar,
          },
          images: signedGallery,
          _count: {
            likes: post._count.likes,
            comments: post._count.comments,
          },
          // Boolean logic from relational join
          isLiked: currentUserId ? (post.likes as any[]).length > 0 : false,
          isSaved: currentUserId ? (post.savedBy as any[]).length > 0 : false,
        };
      })
    );

    return {
      success: true,
      data: {
        posts: formattedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Error in getExplorePosts:", error);
    return {
      success: false,
      error: "Failed to fetch posts",
      data: { posts: [], pagination: { page: 1, limit, total: 0, pages: 0 } },
    };
  }
}
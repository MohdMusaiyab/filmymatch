import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { PrismaClient, Visibility, Category, TAGS, Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth-providers";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";
import { getServerSession } from "next-auth";
// import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

const prisma = new PrismaClient();

// Type definitions for raw SQL results
interface RawPost {
  id: string;
  description: string;
  category: string;
  visibility: string;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  userAvatar: string | null;
  likeCount: bigint;
  commentCount: bigint;
}

interface RawSavedPost {
  postId: string;
}

interface RawFollowing {
  followingId: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to create a post",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const requestBody = await request.json();

    const { title, description, category, tags } = requestBody;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Post title is required",
          code: "MISSING_TITLE",
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message: "Post description is required",
          code: "MISSING_DESCRIPTION",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Post category is required",
          code: "MISSING_CATEGORY",
        },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    // Create post first
    const post = await prisma.post.create({
      data: {
        title,
        description,
        category: category as Category,
        tags: tags as TAGS[],
        visibility: Visibility.PRIVATE,
        isDraft: true,
        userId: user.id,
      },
    });
    return NextResponse.json(
      {
        success: true,
        data: { postId: post.id },
        message:
          "Post created successfully and Saved as Draft, now move forward to upload files",
        code: "POST_CREATED",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while creating the post",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// export async function GET(request: NextRequest) {
//   const startTime = Date.now();
//   const requestId = Math.random().toString(36).substring(7);
  
//   console.log(`[${requestId}] 🚀 API Request Started`);
  
//   try {
//     const { searchParams } = new URL(request.url);

//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     const visibility = searchParams.get("visibility") as Visibility;
//     const category = searchParams.get("category") as Category;
//     const tags = searchParams.getAll("tags") as TAGS[];
//     const search = searchParams.get("search") || "";
//     const sort = searchParams.get("sort") || "recent";

//     const session = await getSession();
//     const sessionTime = Date.now();
//     console.log(`[${requestId}] ⏱️ Session check: ${sessionTime - startTime}ms`);

//     // 🔍 Get current user ID efficiently
//     const currentUserId = session?.id || null;

//     const userTime = Date.now();
//     console.log(`[${requestId}] 👤 User lookup: ${userTime - sessionTime}ms`);

//     // 🚀 Batch fetch saved posts and followings in parallel
//     const [savedPosts, followings] = await Promise.all([
//       currentUserId 
//         ? prisma.savedPost.findMany({
//             where: { userId: currentUserId },
//             select: { postId: true },
//           })
//         : Promise.resolve([]),
//       currentUserId && visibility === Visibility.FOLLOWERS
//         ? prisma.follow.findMany({
//             where: { followerId: currentUserId },
//             select: { followingId: true },
//           })
//         : Promise.resolve([]),
//     ]);

//     const savedPostIds = new Set(savedPosts.map(sp => sp.postId));
//     const followingIds = followings.map(f => f.followingId);
//     const batchTime = Date.now();
//     console.log(`[${requestId}] 📦 Batch queries: ${batchTime - userTime}ms (saved: ${savedPosts.length}, following: ${followings.length})`);

//     // 🎯 Build optimized where clause
//     const where: any = { 
//       isDraft: false,
//       ...(category && { category }),
//       ...(tags.length > 0 && { tags: { hasSome: tags } }),
//       ...(search.trim() && {
//         OR: [
//           { description: { contains: search.toLowerCase(), mode: "insensitive" } },
//         ],
//       }),
//     };

//     // 👀 Optimized visibility logic
//     if (!currentUserId) {
//       where.visibility = Visibility.PUBLIC;
//     } else if (visibility === Visibility.FOLLOWERS) {
//       where.AND = [
//         { visibility: Visibility.FOLLOWERS },
//         { userId: { in: followingIds } },
//       ];
//     } else {
//       where.visibility = Visibility.PUBLIC;
//     }

//     // 📊 Optimized sorting with proper Prisma syntax
//     const orderBy = sort === "likes" 
//       ? { likes: { _count: "desc" as const } }
//       : { createdAt: "desc" as const };

//     // 🗂 Single optimized query with all needed data
//     const queryStartTime = Date.now();
//     const [posts, total] = await Promise.all([
//       prisma.post.findMany({
//         where,
//         orderBy,
//         skip,
//         take: limit,
//         include: {
//           user: {
//             select: {
//               id: true,
//               username: true,
//               avatar: true,
//             },
//           },
//           images: {
//             select: { url: true },
//             take: 1, // Only get first image for cover
//           },
//           _count: {
//             select: {
//               likes: true,
//               comments: true,
//             },
//           },
//         },
//       }),
//       prisma.post.count({ where }),
//     ]);
//     const queryTime = Date.now();
//     console.log(`[${requestId}] 🗂️ Main query: ${queryTime - queryStartTime}ms (posts: ${posts.length}, total: ${total})`);
    
//     // Performance warning for slow queries
//     if (queryTime - queryStartTime > 1000) {
//       console.warn(`[${requestId}] ⚠️ Slow query detected: ${queryTime - queryStartTime}ms`);
//     }

//     // 🚀 Batch process presigned URLs efficiently
//     const imageUrls = new Set<string>();
//     const avatarUrls = new Set<string>();

//     // Collect all unique URLs for batch processing
//     posts.forEach(post => {
//       if (post.coverImage) imageUrls.add(post.coverImage);
//       if (post.images[0]?.url) imageUrls.add(post.images[0].url);
//       if (post.user.avatar) avatarUrls.add(post.user.avatar);
//     });

//     // Batch generate presigned URLs
//     const urlStartTime = Date.now();
//     const [signedImageUrls, signedAvatarUrls] = await Promise.all([
//       Promise.all(
//         Array.from(imageUrls).map(async (url) => ({
//           original: url,
//           signed: await generatePresignedViewUrl(extractKeyFromUrl(url)),
//         }))
//       ),
//       Promise.all(
//         Array.from(avatarUrls).map(async (url) => ({
//           original: url,
//           signed: await generatePresignedViewUrl(extractKeyFromUrl(url)),
//         }))
//       ),
//     ]);
//     const urlTime = Date.now();
//     console.log(`[${requestId}] 🖼️ Presigned URLs: ${urlTime - urlStartTime}ms (images: ${imageUrls.size}, avatars: ${avatarUrls.size})`);

//     // Create lookup maps for O(1) access
//     const imageUrlMap = new Map(signedImageUrls.map(item => [item.original, item.signed]));
//     const avatarUrlMap = new Map(signedAvatarUrls.map(item => [item.original, item.signed]));

//     // 📸 Format response with optimized data processing
//     const formatStartTime = Date.now();
//     const formattedPosts = posts.map(post => {
//       const coverImage = post.coverImage || post.images[0]?.url;
//       const signedCoverImage = coverImage ? imageUrlMap.get(coverImage) : null;
//       const signedAvatar = post.user.avatar ? avatarUrlMap.get(post.user.avatar) : null;

//       return {
//         id: post.id,
//         title: post.description.substring(0, 50) + (post.description.length > 50 ? '...' : ''),
//         description: post.description,
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//         visibility: post.visibility,
//         category: post.category,
//         tags: post.tags,
//         user: {
//           ...post.user,
//           avatar: signedAvatar,
//         },
//         coverImage: signedCoverImage,
//         _count: post._count,
//         isSaved: currentUserId ? savedPostIds.has(post.id) : false,
//       };
//     });
//     const formatTime = Date.now();
//     console.log(`[${requestId}] 📝 Response formatting: ${formatTime - formatStartTime}ms`);

//     const totalTime = Date.now();
//     console.log(`[${requestId}] ✅ Total API time: ${totalTime - startTime}ms`);

//     return NextResponse.json({
//       success: true,
//       data: {
//         posts: formattedPosts,
//         pagination: {
//           page,
//           limit,
//           total,
//           pages: Math.ceil(total / limit),
//         },
//       },
//     });
//   } catch (error) {
//     const errorTime = Date.now();
//     console.error(`[${requestId}] ❌ Error after ${errorTime - startTime}ms:`, error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "An unexpected error occurred while fetching posts",
//         code: "INTERNAL_SERVER_ERROR",
//       },
//       { status: 500 }
//     );
//   }
// }


// =========================From Here==================
export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 8);
  console.time(`[${requestId}] Total API Time`);

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const page = parseInt(url.searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search")?.trim();
  const tags = url.searchParams.getAll("tags");
  const sort = url.searchParams.get("sort");

  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id || null;

  const [savedStart, followStart] = [Date.now(), Date.now()];

  const savedPosts = currentUserId
    ? await prisma.savedPost.findMany({
        where: { userId: currentUserId },
        select: { postId: true },
        take: 200,
      })
    : [];
  console.log(`[${requestId}] 🧠 SavedPost Query: ${Date.now() - savedStart}ms`);

  const followingIds = currentUserId
    ? (
        await prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
          take: 200,
        })
      ).map(f => f.followingId)
    : [];
  console.log(`[${requestId}] 🔗 Followings Query: ${Date.now() - followStart}ms`);

  const where: any = { isDraft: false };

  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search] } },
    ];
  }
  if (tags.length > 0) where.tags = { hasSome: tags };

  where.visibility = currentUserId
    ? { in: [Visibility.PUBLIC, Visibility.PRIVATE, Visibility.FOLLOWERS] }
    : Visibility.PUBLIC;

  if (currentUserId && followingIds.length) {
    where.OR = [
      { visibility: { in: [Visibility.PUBLIC, Visibility.PRIVATE] } },
      { visibility: Visibility.FOLLOWERS, userId: { in: followingIds } },
    ];
  }

  const orderBy =
    sort === "likes"
      ? { createdAt: "desc" } // fallback to avoid expensive count join
      : { createdAt: "desc" };

  const queryStart = Date.now();
  const posts = await prisma.post.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      category: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
      coverImage: true,
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      images: {
        select: { url: true },
        take: 1,
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
  console.log(`[${requestId}] 🗂️ Main Query: ${Date.now() - queryStart}ms`);

  const imageStart = Date.now();
  const postsWithSignedUrls = await Promise.all(
    posts.map(async post => {
      const signedUrl =
        post.images.length > 0
          ? await generatePresignedViewUrl(extractKeyFromUrl(post.images[0].url))
          : null;
      const isSaved = currentUserId
        ? savedPosts.some(saved => saved.postId === post.id)
        : false;

      return {
        ...post,
        isSaved,
        signedUrl,
      };
    })
  );
  console.log(`[${requestId}] 🖼️ Presigned URLs: ${Date.now() - imageStart}ms`);

  console.timeEnd(`[${requestId}] Total API Time`);
  return NextResponse.json(postsWithSignedUrls);
}





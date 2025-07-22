import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, Visibility, Category, TAGS } from "@prisma/client";
import { authOptions } from "@/lib/auth-providers";
import { extractKeyFromUrl, generatePresignedViewUrl } from "@/lib/aws-s3";

const prisma = new PrismaClient();

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const visibility = searchParams.get("visibility") as Visibility;
    const category = searchParams.get("category") as Category;
    const tags = searchParams.getAll("tags") as TAGS[];
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "recent"; // 'recent' or 'likes'

    const session = await getServerSession();

    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id ?? null;
    }
    let savedPostIds: Set<string> = new Set();

    if (currentUserId) {
      const savedPosts = await prisma.savedPost.findMany({
        where: { userId: currentUserId },
        select: { postId: true },
      });

      savedPostIds = new Set(savedPosts.map((sp) => sp.postId));
    }

    // 🔎 Filters
    const where: any = { isDraft: false };

    // 👀 Visibility Logic
    if (!currentUserId) {
      where.visibility = Visibility.PUBLIC;
    } else {
      if (visibility === Visibility.FOLLOWERS) {
        const followings = await prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
        });
        const followingIds = followings.map((f) => f.followingId);

        where.AND = [
          { visibility: Visibility.FOLLOWERS },
          { userId: { in: followingIds } },
        ];
      } else {
        where.visibility = Visibility.PUBLIC;
      }
    }

    if (category) {
      where.category = category;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      where.OR = [
        { title: { contains: lowerSearch, mode: "insensitive" } },
        { description: { contains: lowerSearch, mode: "insensitive" } },
      ];
    }

    // 🧠 Determine sorting
    const orderBy =
      sort === "likes"
        ? { likes: { _count: "desc" as const } }
        : { createdAt: "desc" as const };
    // 🗂 Fetch posts
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        images: {
          select: { url: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // 📸 Format response
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        let coverImage = post.coverImage;
        let user = post.user;

        if (!coverImage && post.images.length > 0) {
          coverImage = post.images[0].url;
        }

        if (user?.avatar) {
          const avatarKey = extractKeyFromUrl(user.avatar);
          user.avatar = await generatePresignedViewUrl(avatarKey);
        } else {
          user.avatar = null;
        }
        const signedCoverImage = coverImage
          ? await generatePresignedViewUrl(extractKeyFromUrl(coverImage))
          : null;

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          visibility: post.visibility,
          category: post.category,
          tags: post.tags,
          user: post.user,
          coverImage: signedCoverImage,
          _count: post._count,
          isSaved: currentUserId ? savedPostIds.has(post.id) : false,
        };
      })
    );

    const total = await prisma.post.count({ where });

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while fetching posts",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

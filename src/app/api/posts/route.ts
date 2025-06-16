import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, Visibility, Category, TAGS } from "@prisma/client";
import {
  moveFileFromTemp,
  generateFinalKey,
  extractKeyFromUrl,
  generatePresignedViewUrl,
} from "@/lib/aws-s3";

const prisma = new PrismaClient();

interface FileData {
  s3Key: string;
  description: string;
  fileName: string;
  fileType: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

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

    const {
      title,
      description,
      category,
      tags,
      visibility,
      isDraft,
      coverImage,
      files,
    } = requestBody;

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

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one file is required",
          code: "MISSING_FILES",
        },
        { status: 400 }
      );
    }

    // Get user from database
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

    // Create post first
    const post = await prisma.post.create({
      data: {
        title,
        description,
        category: category as Category,
        tags: tags as TAGS[],
        visibility: visibility as Visibility,
        isDraft,
        userId: user.id,
        coverImage: "", // Will be updated later if coverImage is provided
      },
    });

    try {
      // Move files from temp to final location and create Image records
      const movedFiles: string[] = [];

      for (const file of files as FileData[]) {
        try {
          // Generate final key based on visibility
          const finalKey = generateFinalKey(
            user.id,
            post.id,
            file.fileName,
            visibility
          );

          // Move file from temp to final location
          const finalUrl = await moveFileFromTemp(file.s3Key, finalKey);
          movedFiles.push(finalUrl);

          // Create Image record
          await prisma.image.create({
            data: {
              url: finalUrl,
              description: file.description || null,
              postId: post.id,
            },
          });
        } catch (fileError) {
          console.error(`Error processing file ${file.fileName}:`, fileError);
          // Continue with other files, but log the error
        }
      }

      if (movedFiles.length === 0) {
        throw new Error("No files were successfully processed");
      }

      // Update post with cover image if provided
      let finalCoverImage = "";
      if (coverImage) {
        // Find the corresponding moved file
        const coverFile = files.find((f: FileData) =>
          coverImage.includes(f.s3Key.split("/").pop() || "")
        );

        if (coverFile) {
          const coverFinalKey = generateFinalKey(
            user.id,
            post.id,
            coverFile.fileName,
            visibility
          );
          finalCoverImage = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${coverFinalKey}`;
        }
      }

      // Update post with final cover image
      const updatedPost = await prisma.post.update({
        where: { id: post.id },
        data: {
          coverImage: finalCoverImage || movedFiles[0] || null, // Use first image as cover if none specified
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          images: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Post created successfully",
          post: updatedPost,
        },
        { status: 201 }
      );
    } catch (fileProcessingError) {
      console.error("File processing error:", fileProcessingError);

      // If file processing fails, we should clean up the post
      await prisma.post.delete({
        where: { id: post.id },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to process uploaded files",
          code: "FILE_PROCESSING_ERROR",
        },
        { status: 500 }
      );
    }
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

        if (!coverImage && post.images.length > 0) {
          coverImage = post.images[0].url;
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

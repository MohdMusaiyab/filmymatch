import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  moveFileFromTemp,
  deleteFile,
  generateFinalKey,
  extractKeyFromUrl,
} from "@/lib/aws-s3";
import { Visibility, Category, TAGS } from "@prisma/client";

interface FileData {
  s3Key: string;
  description: string;
  fileName: string;
  fileType: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const postId = (await params).id;

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
        userId: user.id,
      },
      include: {
        images: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const {
      title,
      description,
      category,
      tags,
      visibility,
      isDraft,
      files,
      coverImage,
      removedImageUrls,
    } = await request.json();

    // Update base post data
    const updatedFields: any = {};

    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (category) updatedFields.category = category as Category;
    if (tags) updatedFields.tags = tags as TAGS[];
    if (typeof isDraft === "boolean") updatedFields.isDraft = isDraft;

    let visibilityChanged = false;
    if (
      visibility &&
      visibility !== existingPost.visibility
    ) {
      updatedFields.visibility = visibility as Visibility;
      visibilityChanged = true;
    }

    // Move newly uploaded files from temp
    const newImageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files as FileData[]) {
        const finalKey = generateFinalKey(
          user.id,
          postId,
          file.fileName,
          visibility || existingPost.visibility
        );
        const finalUrl = await moveFileFromTemp(file.s3Key, finalKey);
        newImageUrls.push(finalUrl);

        await prisma.image.create({
          data: {
            url: finalUrl,
            description: file.description || null,
            postId: postId,
          },
        });
      }
    }

    
    // Delete removed images
    if (removedImageUrls && removedImageUrls.length > 0) {
      for (const url of removedImageUrls as string[]) {
        const key = extractKeyFromUrl(url);
        await deleteFile(key);

        await prisma.image.deleteMany({
          where: {
            postId,
            url,
          },
        });
      }
    }

    // If visibility changed → move existing images to new location
    if (visibilityChanged) {
      const newVisibility = visibility as Visibility;

      for (const image of existingPost.images) {
        const oldKey = extractKeyFromUrl(image.url);
        const finalKey = generateFinalKey(
          user.id,
          postId,
          oldKey.split("/").pop() || "",
          newVisibility
        );

        const newUrl = await moveFileFromTemp(oldKey, finalKey);
        await prisma.image.update({
          where: { id: image.id },
          data: { url: newUrl },
        });

        // Remove old image
        await deleteFile(oldKey);
      }
    }

    // Handle cover image logic
    let finalCoverImage = "";
    if (coverImage) {
      if (coverImage.startsWith("http")) {
        // Already a final URL
        finalCoverImage = coverImage;
      } else {
        const coverFile = files.find((f: FileData) =>
          coverImage.includes(f.s3Key.split("/").pop() || "")
        );

        if (coverFile) {
          const finalKey = generateFinalKey(
            user.id,
            postId,
            coverFile.fileName,
            visibility || existingPost.visibility
          );

          finalCoverImage = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalKey}`;
        }
      }

      updatedFields.coverImage = finalCoverImage;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updatedFields,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        images: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while updating the post",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

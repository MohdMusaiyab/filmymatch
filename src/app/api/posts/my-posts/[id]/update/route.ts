import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-providers";
import prisma from "@/lib/prisma";
import {
  changeFileVisibility,
  deleteFile,
  extractKeyFromUrl,
} from "@/lib/aws-s3";

interface ImageData {
  url: string;
  description: string;
}

// Add interface for existing images from database
interface ExistingImageData {
  id: string;
  url: string;
  description: string | null;
}

// Helper function to clean URLs (remove query parameters and hash)
function cleanUrl(url: string): string {
  return url.split('?')[0].split('#')[0];
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId } = await params;
    const {
      title,
      description,
      tags,
      category,
      visibility: requestedVisibility,
      images: incomingImages,
      coverImageUrl,
      isDraft,
    } = await request.json();

    console.log("=== API DEBUG START ===");
    console.log("Incoming coverImageUrl:", coverImageUrl);
    console.log("Incoming images count:", incomingImages?.length || 0);

    const finalVisibility = isDraft ? "PRIVATE" : requestedVisibility;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId, userId: session.user.id },
      select: { 
        images: true, 
        coverImage: true,
        userId: true // Added for security check
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Clean all URLs for consistent comparison
    const existingImageUrls = existingPost.images.map(
      (img: ExistingImageData) => cleanUrl(img.url)
    );
    console.log("Existing image URLs:", existingImageUrls);

    // Filter images using clean URLs
    const newImages: ImageData[] = incomingImages.filter(
      (img: ImageData) => !existingImageUrls.includes(cleanUrl(img.url))
    );

    const keptImages: ImageData[] = incomingImages.filter((img: ImageData) =>
      existingImageUrls.includes(cleanUrl(img.url))
    );

    const deletedImages = existingPost.images.filter(
      (img: ExistingImageData) =>
        !incomingImages.some((i: ImageData) => cleanUrl(i.url) === cleanUrl(img.url))
    );

    console.log("New images to process:", newImages.length);
    console.log("Kept images:", keptImages.length);
    console.log("Deleted images:", deletedImages.length);

    // Process new images (move from temp to permanent location)
    const processedNewImages: ImageData[] = [];
    const urlMapping: Map<string, string> = new Map(); // old URL -> new URL mapping

    for (const img of newImages) {
      try {
        const tempKey = extractKeyFromUrl(img.url);
        const newUrl = await changeFileVisibility(tempKey); // Moves to /uploads/...
        const processedImage = {
          url: newUrl,
          description: img.description,
        };
        processedNewImages.push(processedImage);

        // Store mapping of old URL to new URL
        urlMapping.set(cleanUrl(img.url), cleanUrl(newUrl));

        console.log(`Processed image: ${img.url} -> ${newUrl}`);
      } catch (error) {
        console.error("Failed to process new image:", img.url, error);
        // Continue with other images even if one fails
      }
    }

    // Delete removed images from S3
    await Promise.allSettled(
      deletedImages.map(async (img: ExistingImageData) => {
        try {
          const key = extractKeyFromUrl(img.url);
          await deleteFile(key);
          console.log("Deleted image from S3:", img.url);
        } catch (err) {
          console.error("Failed to delete image from S3:", img.url, err);
        }
      })
    );

    // ✅ Process cover image logic with automatic selection
    let finalCoverImage: string | null = existingPost.coverImage;
    console.log("Existing cover image:", finalCoverImage);

    if (coverImageUrl) {
      // User explicitly selected a cover image
      const cleanCoverUrl = cleanUrl(coverImageUrl);
      console.log("User selected cover URL:", cleanCoverUrl);

      // Check if this image exists in the final image set
      const allFinalImages = [
        ...keptImages.map((img: ImageData) => cleanUrl(img.url)),
        ...processedNewImages.map((img: ImageData) => cleanUrl(img.url))
      ];

      if (allFinalImages.includes(cleanCoverUrl)) {
        finalCoverImage = cleanCoverUrl;
        console.log("Cover image set to:", finalCoverImage);
      } else {
        console.warn("Selected cover image not found in final images, will auto-select");
        finalCoverImage = null; // Will trigger auto-selection below
      }
    }

    // Auto-select cover image if needed
    if (!finalCoverImage && (keptImages.length > 0 || processedNewImages.length > 0)) {
      // Prefer kept images first (existing), then new images
      if (keptImages.length > 0) {
        finalCoverImage = cleanUrl(keptImages[0].url);
        console.log("Auto-selected first kept image as cover:", finalCoverImage);
      } else if (processedNewImages.length > 0) {
        finalCoverImage = cleanUrl(processedNewImages[0].url);
        console.log("Auto-selected first new image as cover:", finalCoverImage);
      }
    }

    // If cover image was deleted but we have other images, auto-select
    if (finalCoverImage && deletedImages.some((img: ExistingImageData) => cleanUrl(img.url) === finalCoverImage)) {
      console.log("Previous cover image was deleted, auto-selecting new cover");
      
      if (keptImages.length > 0) {
        finalCoverImage = cleanUrl(keptImages[0].url);
      } else if (processedNewImages.length > 0) {
        finalCoverImage = cleanUrl(processedNewImages[0].url);
      } else {
        finalCoverImage = null;
      }
    }

    // If no images at all, set cover to null
    if (keptImages.length === 0 && processedNewImages.length === 0) {
      finalCoverImage = null;
      console.log("No images left, cover image set to null");
    }

    console.log("Final cover image URL:", finalCoverImage);

    // Update database
    const updatedPost = await prisma.$transaction(async (tx) => {
      // RE-VERIFY ownership inside transaction to prevent race conditions
      const ownedPost = await tx.post.findFirst({
        where: { id: postId, userId: session.user.id },
      });

      if (!ownedPost) {
        throw new Error("Post not found or access denied");
      }

      // 1. Delete removed image records
      if (deletedImages.length > 0) {
        await tx.image.deleteMany({
          where: {
            postId,
            url: { in: deletedImages.map((img: ExistingImageData) => img.url) },
          },
        });
        console.log("Deleted image records from DB:", deletedImages.length);
      }

      // 2. Update post metadata WITH SECURE WHERE CLAUSE
      const post = await tx.post.update({
        where: { id: postId, userId: session.user.id }, // ✅ ADDED userId here
        data: {
          title,
          description,
          category,
          tags,
          visibility: finalVisibility,
          isDraft,
          coverImage: finalCoverImage,
          updatedAt: new Date(),
        },
      });

      console.log("Updated post with cover image:", post.coverImage);

      // 3. Create new image records (store clean URLs)
      if (processedNewImages.length > 0) {
        await tx.image.createMany({
          data: processedNewImages.map((img: ImageData) => ({
            url: cleanUrl(img.url), // Store clean URL
            description: img.description,
            postId,
          })),
        });
        console.log("Created new image records:", processedNewImages.length);
      }

      // 4. Update descriptions for kept images
      for (const img of keptImages) {
        const existing = existingPost.images.find(
          (ex: ExistingImageData) => cleanUrl(ex.url) === cleanUrl(img.url)
        );
        if (existing && existing.description !== img.description) {
          await tx.image.update({
            where: { id: existing.id },
            data: { description: img.description },
          });
          console.log("Updated image description for:", cleanUrl(img.url));
        }
      }

      return post;
    });

    console.log("=== API DEBUG END ===");

    return NextResponse.json(
      {
        success: true,
        message: "Post updated successfully",
        data: updatedPost,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
        success: false,
      },
      { status: 500 }
    );
  }
}
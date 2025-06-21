// // route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import prisma from "@/lib/prisma";
// import {
//   changeFileVisibility,
//   deleteFile,
//   extractKeyFromUrl,
// } from "@/lib/aws-s3";
// import { authOptions } from "@/lib/auth-providers";

// interface ImageData {
//   url: string;
//   description: string;
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id: postId } = await params;
//     const {
//       title,
//       description,
//       tags,
//       category,
//       visibility: requestedVisibility,
//       images: finalImages,
//       coverImageUrl,
//       isDraft,
//     } = await request.json();

//     const finalVisibility = isDraft ? "PRIVATE" : requestedVisibility;

//     const existingPost = await prisma.post.findUnique({
//       where: { id: postId, userId: session.user.id },
//       include: { images: true },
//     });

//     if (!existingPost) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const existingImageUrls = existingPost.images.map((img) => img.url);
//     const newImages = (finalImages as ImageData[]).filter(
//       (img) => !existingImageUrls.includes(img.url)
//     );
//     const keptImages = (finalImages as ImageData[]).filter((img) =>
//       existingImageUrls.includes(img.url)
//     );
//     const deletedImages = existingPost.images.filter(
//       (img) => !(finalImages as ImageData[]).some((i) => i.url === img.url)
//     );

//     // --- ✅ Process New Images
//     const processedNewImages: ImageData[] = [];
//     for (const img of newImages) {
//       try {
//         const tempKey = extractKeyFromUrl(img.url);
//         const newUrl = await changeFileVisibility(tempKey, finalVisibility);
//         processedNewImages.push({
//           url: newUrl,
//           description: img.description,
//         });
//       } catch (error) {
//         console.error("Error processing new image:", img.url, error);
//       }
//     }

//     const processedKeptImages = [...keptImages];

//     // --- ✅ Delete removed S3 files
//     const deletionPromises = deletedImages.map(async (img) => {
//       try {
//         const key = extractKeyFromUrl(img.url);
//         await deleteFile(key);
//       } catch (error) {
//         console.error("Error deleting file:", img.url, error);
//       }
//     });
//     await Promise.allSettled(deletionPromises);

//     // --- ✅ Determine correct coverImage
//     let cleanCoverUrl: string | null = null;
//     const allImagesAfterChange = [...processedKeptImages, ...processedNewImages];

//     if (coverImageUrl) {
//       try {
//         const coverKey = extractKeyFromUrl(coverImageUrl);
//         const fullCleanUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${coverKey}`;

//         const isCoverImagePresent = allImagesAfterChange.some((img) => img.url === fullCleanUrl);

//         if (isCoverImagePresent) {
//           cleanCoverUrl = fullCleanUrl;
//         } else {
//           console.warn("Cover image was removed, defaulting to null.");
//           cleanCoverUrl = null;
//         }
//       } catch (error) {
//         console.error("Failed to clean coverImage URL:", error);
//         cleanCoverUrl = null;
//       }
//     }

//     // --- ✅ Update DB
//     const updatedPost = await prisma.$transaction(async (tx) => {
//       if (deletedImages.length > 0) {
//         await tx.image.deleteMany({
//           where: {
//             postId,
//             url: { in: deletedImages.map((img) => img.url) },
//           },
//         });
//       }

//       const post = await tx.post.update({
//         where: { id: postId },
//         data: {
//           title,
//           description,
//           category,
//           tags,
//           visibility: finalVisibility,
//           isDraft,
//           coverImage: cleanCoverUrl,
//           updatedAt: new Date(),
//         },
//       });

//       if (processedNewImages.length > 0) {
//         await tx.image.createMany({
//           data: processedNewImages.map((img) => ({
//             url: img.url,
//             description: img.description,
//             postId,
//           })),
//         });
//       }

//       for (const img of processedKeptImages) {
//         const existingImg = existingPost.images.find(
//           (existing) => existing.url === img.url
//         );
//         if (existingImg && existingImg.description !== img.description) {
//           await tx.image.update({
//             where: { id: existingImg.id },
//             data: { description: img.description },
//           });
//         }
//       }

//       return post;
//     });

//     return NextResponse.json(updatedPost, { status: 200 });
//   } catch (error) {
//     console.error("Post update error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/posts/my-posts/[id]/update/route.ts

//Working on correct best
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth-providers";
// import prisma from "@/lib/prisma";
// import {
//   changeFileVisibility,
//   deleteFile,
//   extractKeyFromUrl,
// } from "@/lib/aws-s3";

// interface ImageData {
//   url: string;
//   description: string;
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id: postId } = await params;
//     const {
//       title,
//       description,
//       tags,
//       category,
//       visibility: requestedVisibility,
//       images: incomingImages,
//       coverImageUrl,
//       isDraft,
//     } = await request.json();

//     const finalVisibility = isDraft ? "PRIVATE" : requestedVisibility;

//     const existingPost = await prisma.post.findUnique({
//       where: { id: postId, userId: session.user.id },
//       include: { images: true },
//     });

//     if (!existingPost) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const existingImageUrls = existingPost.images.map((img) => img.url);

//     const newImages: ImageData[] = incomingImages.filter(
//       (img) => !existingImageUrls.includes(img.url)
//     );

//     const keptImages: ImageData[] = incomingImages.filter((img) =>
//       existingImageUrls.includes(img.url)
//     );

//     const deletedImages = existingPost.images.filter(
//       (img) => !incomingImages.some((i) => i.url === img.url)
//     );

//     const processedNewImages: ImageData[] = [];
//     for (const img of newImages) {
//       try {
//         const tempKey = extractKeyFromUrl(img.url);
//         const newUrl = await changeFileVisibility(tempKey); // Moves to /uploads/...
//         processedNewImages.push({
//           url: newUrl,
//           description: img.description,
//         });
//       } catch (error) {
//         console.error("Failed to process new image:", img.url, error);
//       }
//     }

//     await Promise.allSettled(
//       deletedImages.map(async (img) => {
//         try {
//           const key = extractKeyFromUrl(img.url);
//           await deleteFile(key);
//         } catch (err) {
//           console.error("Failed to delete image from S3:", img.url, err);
//         }
//       })
//     );

//     // ✅ Get clean cover image URL (strip signed params if any)
//     const cleanCoverUrl = coverImageUrl ? coverImageUrl.split("?")[0] : null;
//     console.log("Clean cover URL:", cleanCoverUrl);
//     // ✅ If the selected cover image was deleted
//     const wasCoverDeleted = deletedImages.some(
//       (img) => img.url === cleanCoverUrl
//     );
//     const finalCoverImage = wasCoverDeleted ? null : cleanCoverUrl;

//     const updatedPost = await prisma.$transaction(async (tx) => {
//       // 1. Delete removed image records
//       if (deletedImages.length > 0) {
//         await tx.image.deleteMany({
//           where: {
//             postId,
//             url: { in: deletedImages.map((img) => img.url) },
//           },
//         });
//       }

//       // 2. Update post metadata
//       const post = await tx.post.update({
//         where: { id: postId },
//         data: {
//           title,
//           description,
//           category,
//           tags,
//           visibility: finalVisibility,
//           isDraft,
//           coverImage: finalCoverImage,
//           updatedAt: new Date(),
//         },
//       });

//       // 3. Create new image records
//       if (processedNewImages.length > 0) {
//         await tx.image.createMany({
//           data: processedNewImages.map((img) => ({
//             url: img.url,
//             description: img.description,
//             postId,
//           })),
//         });
//       }

//       // 4. Update descriptions for kept images
//       for (const img of keptImages) {
//         const existing = existingPost.images.find((ex) => ex.url === img.url);
//         if (existing && existing.description !== img.description) {
//           await tx.image.update({
//             where: { id: existing.id },
//             data: { description: img.description },
//           });
//         }
//       }

//       return post;
//     });

//     return NextResponse.json(updatedPost, { status: 200 });
//   } catch (error) {
//     console.error("Post update error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth-providers";
// import prisma from "@/lib/prisma";
// import {
//   changeFileVisibility,
//   deleteFile,
//   extractKeyFromUrl,
// } from "@/lib/aws-s3";

// interface ImageData {
//   url: string;
//   description: string;
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { id: postId } = await params;
//     const {
//       title,
//       description,
//       tags,
//       category,
//       visibility: requestedVisibility,
//       images: incomingImages,
//       coverImageUrl,
//       isDraft,
//     } = await request.json();

//     console.log("=== API DEBUG START ===");
//     console.log("Incoming coverImageUrl:", coverImageUrl);
//     console.log("Incoming images:", incomingImages);

//     const finalVisibility = isDraft ? "PRIVATE" : requestedVisibility;

//     const existingPost = await prisma.post.findUnique({
//       where: { id: postId, userId: session.user.id },
//       select: { images: true, coverImage: true },
//     });

//     if (!existingPost) {
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });
//     }

//     const existingImageUrls = existingPost.images.map((img) => img.url);
//     console.log("Existing image URLs:", existingImageUrls);

//     const newImages: ImageData[] = incomingImages.filter(
//       (img) => !existingImageUrls.includes(img.url)
//     );

//     const keptImages: ImageData[] = incomingImages.filter((img) =>
//       existingImageUrls.includes(img.url)
//     );

//     const deletedImages = existingPost.images.filter(
//       (img) => !incomingImages.some((i) => i.url === img.url)
//     );

//     console.log("New images to process:", newImages);
//     console.log("Kept images:", keptImages);
//     console.log("Deleted images:", deletedImages);

//     // Process new images (move from temp to permanent location)
//     const processedNewImages: ImageData[] = [];
//     const urlMapping: Map<string, string> = new Map(); // old URL -> new URL mapping

//     for (const img of newImages) {
//       try {
//         const tempKey = extractKeyFromUrl(img.url);
//         const newUrl = await changeFileVisibility(tempKey); // Moves to /uploads/...
//         const processedImage = {
//           url: newUrl,
//           description: img.description,
//         };
//         processedNewImages.push(processedImage);

//         // Store mapping of old URL to new URL
//         urlMapping.set(img.url.split("?")[0], newUrl.split("?")[0]);

//         console.log(`Processed image: ${img.url} -> ${newUrl}`);
//       } catch (error) {
//         console.error("Failed to process new image:", img.url, error);
//       }
//     }

//     // Delete removed images from S3
//     await Promise.allSettled(
//       deletedImages.map(async (img) => {
//         try {
//           const key = extractKeyFromUrl(img.url);
//           await deleteFile(key);
//           console.log("Deleted image from S3:", img.url);
//         } catch (err) {
//           console.error("Failed to delete image from S3:", img.url, err);
//         }
//       })
//     );

//     // ✅ Process cover image logic
//     // let finalCoverImage: string | null = null;
//     //Replacing above with this
//     let finalCoverImage: string | null = existingPost.coverImage; // Preserve existing by default
//     console.log("Existing cover image:", finalCoverImage);

//     if (coverImageUrl) {
//       const cleanCoverUrl = coverImageUrl.split("?")[0];
//       console.log("Clean cover URL from request:", cleanCoverUrl);

//       // Check if cover image is among kept images (existing images)
//       const isKeptImage = keptImages.some((img) => {
//         const cleanImgUrl = img.url.split("?")[0];
//         return cleanImgUrl === cleanCoverUrl;
//       });

//       if (isKeptImage) {
//         finalCoverImage = cleanCoverUrl;
//         console.log("Cover image is existing image:", finalCoverImage);
//       } else {
//         // Check if cover image is among new images (check both original and processed URLs)
//         const mappedUrl = urlMapping.get(cleanCoverUrl);
//         if (mappedUrl) {
//           finalCoverImage = mappedUrl;
//           console.log("Cover image is new image, mapped to:", finalCoverImage);
//         } else {
//           // Check if the cover URL matches any of the processed new images directly
//           const matchingProcessed = processedNewImages.find((img) => {
//             return img.url.split("?")[0] === cleanCoverUrl;
//           });

//           if (matchingProcessed) {
//             finalCoverImage = matchingProcessed.url.split("?")[0];
//             console.log(
//               "Cover image found in processed images:",
//               finalCoverImage
//             );
//           } else {
//             console.log(
//               "Cover image URL not found in any images, setting to null"
//             );
//             //Set to exisitng or noull
//             finalCoverImage = existingPost.coverImage || null;
//           }
//         }
//       }
//     } else {
//       console.log("No cover image URL provided");
//       finalCoverImage = existingPost.coverImage || null;
//     }

//     console.log("Final cover image URL:", finalCoverImage);

//     // Update database
//     const updatedPost = await prisma.$transaction(async (tx) => {
//       // 1. Delete removed image records
//       if (deletedImages.length > 0) {
//         await tx.image.deleteMany({
//           where: {
//             postId,
//             url: { in: deletedImages.map((img) => img.url) },
//           },
//         });
//         console.log("Deleted image records from DB:", deletedImages.length);
//       }

//       // 2. Update post metadata
//       const post = await tx.post.update({
//         where: { id: postId },
//         data: {
//           title,
//           description,
//           category,
//           tags,
//           visibility: finalVisibility,
//           isDraft,
//           coverImage: finalCoverImage,
//           updatedAt: new Date(),
//         },
//       });

//       console.log("Updated post with cover image:", post.coverImage);

//       // 3. Create new image records
//       if (processedNewImages.length > 0) {
//         await tx.image.createMany({
//           data: processedNewImages.map((img) => ({
//             url: img.url,
//             description: img.description,
//             postId,
//           })),
//         });
//         console.log("Created new image records:", processedNewImages.length);
//       }

//       // 4. Update descriptions for kept images
//       for (const img of keptImages) {
//         const existing = existingPost.images.find((ex) => ex.url === img.url);
//         if (existing && existing.description !== img.description) {
//           await tx.image.update({
//             where: { id: existing.id },
//             data: { description: img.description },
//           });
//           console.log("Updated image description for:", img.url);
//         }
//       }

//       return post;
//     });

//     console.log("=== API DEBUG END ===");

//     return NextResponse.json(updatedPost, { status: 200 });
//   } catch (error) {
//     console.error("Post update error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


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
    console.log("Incoming images:", incomingImages);

    const finalVisibility = isDraft ? "PRIVATE" : requestedVisibility;

    const existingPost = await prisma.post.findUnique({
      where: { id: postId, userId: session.user.id },
      select: { images: true, coverImage: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingImageUrls = existingPost.images.map((img: ExistingImageData) => img.url);
    console.log("Existing image URLs:", existingImageUrls);

    const newImages: ImageData[] = incomingImages.filter(
      (img: ImageData) => !existingImageUrls.includes(img.url)
    );

    const keptImages: ImageData[] = incomingImages.filter((img: ImageData) =>
      existingImageUrls.includes(img.url)
    );

    const deletedImages = existingPost.images.filter(
      (img: ExistingImageData) => !incomingImages.some((i: ImageData) => i.url === img.url)
    );

    console.log("New images to process:", newImages);
    console.log("Kept images:", keptImages);
    console.log("Deleted images:", deletedImages);

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
        urlMapping.set(img.url.split("?")[0], newUrl.split("?")[0]);

        console.log(`Processed image: ${img.url} -> ${newUrl}`);
      } catch (error) {
        console.error("Failed to process new image:", img.url, error);
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

    // ✅ Process cover image logic
    // let finalCoverImage: string | null = null;
    //Replacing above with this
    let finalCoverImage: string | null = existingPost.coverImage; // Preserve existing by default
    console.log("Existing cover image:", finalCoverImage);

    if (coverImageUrl) {
      const cleanCoverUrl = coverImageUrl.split("?")[0];
      console.log("Clean cover URL from request:", cleanCoverUrl);

      // Check if cover image is among kept images (existing images)
      const isKeptImage = keptImages.some((img: ImageData) => {
        const cleanImgUrl = img.url.split("?")[0];
        return cleanImgUrl === cleanCoverUrl;
      });

      if (isKeptImage) {
        finalCoverImage = cleanCoverUrl;
        console.log("Cover image is existing image:", finalCoverImage);
      } else {
        // Check if cover image is among new images (check both original and processed URLs)
        const mappedUrl = urlMapping.get(cleanCoverUrl);
        if (mappedUrl) {
          finalCoverImage = mappedUrl;
          console.log("Cover image is new image, mapped to:", finalCoverImage);
        } else {
          // Check if the cover URL matches any of the processed new images directly
          const matchingProcessed = processedNewImages.find((img: ImageData) => {
            return img.url.split("?")[0] === cleanCoverUrl;
          });

          if (matchingProcessed) {
            finalCoverImage = matchingProcessed.url.split("?")[0];
            console.log(
              "Cover image found in processed images:",
              finalCoverImage
            );
          } else {
            console.log(
              "Cover image URL not found in any images, setting to null"
            );
            //Set to exisitng or noull
            finalCoverImage = existingPost.coverImage || null;
          }
        }
      }
    } else {
      console.log("No cover image URL provided");
      finalCoverImage = existingPost.coverImage || null;
    }

    console.log("Final cover image URL:", finalCoverImage);

    // Update database
    const updatedPost = await prisma.$transaction(async (tx) => {
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

      // 2. Update post metadata
      const post = await tx.post.update({
        where: { id: postId },
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

      // 3. Create new image records
      if (processedNewImages.length > 0) {
        await tx.image.createMany({
          data: processedNewImages.map((img: ImageData) => ({
            url: img.url,
            description: img.description,
            postId,
          })),
        });
        console.log("Created new image records:", processedNewImages.length);
      }

      // 4. Update descriptions for kept images
      for (const img of keptImages) {
        const existing = existingPost.images.find((ex: ExistingImageData) => ex.url === img.url);
        if (existing && existing.description !== img.description) {
          await tx.image.update({
            where: { id: existing.id },
            data: { description: img.description },
          });
          console.log("Updated image description for:", img.url);
        }
      }

      return post;
    });

    console.log("=== API DEBUG END ===");

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error("Post update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
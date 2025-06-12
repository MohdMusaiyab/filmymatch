// lib/aws-s3.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  fileUrl: string;
}

export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  userId: string
): Promise<PresignedUrlResponse> {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `temp/${userId}/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    fileUrl,
  };
}

export async function moveFileFromTemp(
  tempKey: string,
  finalKey: string
): Promise<string> {
  // Copy from temp to final location
  const copyCommand = new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${tempKey}`,
    Key: finalKey,
  });

  await s3Client.send(copyCommand);

  // Delete temp file
  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: tempKey,
  });

  await s3Client.send(deleteCommand);

  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalKey}`;
}

export async function deleteFile(key: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(deleteCommand);
}

export function generateFinalKey(
  userId: string,
  postId: string,
  fileName: string,
  visibility: string
): string {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${visibility.toLowerCase()}/${userId}/${postId}/${sanitizedFileName}`;
}

export function extractKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch (error) {
    throw new Error("Invalid S3 URL format");
  }
}

//Utitlity function to get Images with presigned URLs
export async function generatePresignedViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60, // 1 hour
  });

  return signedUrl;
}
type PostWithImages = {
  coverImage: string | null;
  images: { url: string }[];
};
export async function enhancePostsWithSignedUrls(posts: PostWithImages[]) {
  
  return Promise.all(
    posts.map(async (post) => {
      if (post.coverImage) {
        const coverKey = extractKeyFromUrl(post.coverImage);
        post.coverImage = await generatePresignedViewUrl(coverKey);
      }

      post.images = await Promise.all(
        post.images.map(async (img) => {
          const key = extractKeyFromUrl(img.url);
          const signedUrl = await generatePresignedViewUrl(key);
          return { ...img, url: signedUrl };
        })
      );

      return post;
    })
  );
}

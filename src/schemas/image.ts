// src/lib/schemas/image.ts
import { z } from 'zod';

// Image Schemas
export const ImageCreateSchema = z.object({
  url: z.string().url(),
  description: z.string().max(200).nullable().optional(),
  postId: z.string().cuid(),
});

export const ImageUpdateSchema = z.object({
  url: z.string().url().optional(),
  description: z.string().max(200).nullable().optional(),
});

export const ImageSchema = z.object({
  id: z.string().cuid(),
  url: z.string(),
  description: z.string().nullable(),
  postId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Image = z.infer<typeof ImageSchema>;
export type ImageCreate = z.infer<typeof ImageCreateSchema>;
export type ImageUpdate = z.infer<typeof ImageUpdateSchema>;
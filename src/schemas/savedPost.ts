// src/lib/schemas/saved-post.ts
import { z } from 'zod';

// SavedPost Schemas
export const SavedPostCreateSchema = z.object({
  postId: z.string().cuid(),
});

export const SavedPostSchema = z.object({
  id: z.string().cuid(),
  postId: z.string().cuid(),
  userId: z.string().cuid(),
  createdAt: z.date(),
});

// Type exports
export type SavedPost = z.infer<typeof SavedPostSchema>;
export type SavedPostCreate = z.infer<typeof SavedPostCreateSchema>;
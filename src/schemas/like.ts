// src/lib/schemas/like.ts
import { z } from 'zod';

// Like Schemas
export const LikeCreateSchema = z.object({
  postId: z.string().cuid(),
});

export const LikeSchema = z.object({
  id: z.string().cuid(),
  postId: z.string().cuid(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Like = z.infer<typeof LikeSchema>;
export type LikeCreate = z.infer<typeof LikeCreateSchema>;
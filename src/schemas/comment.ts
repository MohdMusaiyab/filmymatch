// src/lib/schemas/comment.ts
import { z } from 'zod';

// Comment Schemas
export const CommentCreateSchema = z.object({
  content: z.string().min(1).max(1000),
  postId: z.string().cuid(),
});

export const CommentUpdateSchema = z.object({
  content: z.string().min(1).max(1000),
});

export const CommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string(),
  postId: z.string().cuid(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Comment = z.infer<typeof CommentSchema>;
export type CommentCreate = z.infer<typeof CommentCreateSchema>;
export type CommentUpdate = z.infer<typeof CommentUpdateSchema>;
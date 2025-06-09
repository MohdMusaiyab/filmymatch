// src/lib/schemas/highlighted-post.ts
import { z } from 'zod';

// HighlightedPost Schemas
export const HighlightedPostCreateSchema = z.object({
  postId: z.string().cuid(),
  notes: z.string().max(500).nullable().optional(),
});

export const HighlightedPostUpdateSchema = z.object({
  notes: z.string().max(500).nullable().optional(),
});

export const HighlightedPostSchema = z.object({
  id: z.string().cuid(),
  postId: z.string().cuid(),
  userId: z.string().cuid(),
  notes: z.string().nullable(),
  createdAt: z.date(),
});

// Type exports
export type HighlightedPost = z.infer<typeof HighlightedPostSchema>;
export type HighlightedPostCreate = z.infer<typeof HighlightedPostCreateSchema>;
export type HighlightedPostUpdate = z.infer<typeof HighlightedPostUpdateSchema>;
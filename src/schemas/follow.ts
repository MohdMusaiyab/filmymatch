// src/lib/schemas/follow.ts
import { z } from 'zod';

// Follow Schemas
export const FollowCreateSchema = z.object({
  followingId: z.string().cuid(),
});

export const FollowSchema = z.object({
  id: z.string().cuid(),
  followerId: z.string().cuid(),
  followingId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Follow = z.infer<typeof FollowSchema>;
export type FollowCreate = z.infer<typeof FollowCreateSchema>;
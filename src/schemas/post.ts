import { z } from "zod";
import { CategoryEnum, TagsEnum, VisibilityEnum } from "./common";

// Post Schemas
export const PostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: CategoryEnum,
  coverImage: z.string().url().nullable().optional(),
  visibility: VisibilityEnum.default("PRIVATE"),
  tags: z.array(TagsEnum).max(10),
  isDraft: z.boolean().default(false),
});

export const PostUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  category: CategoryEnum.optional(),
  coverImage: z.string().url().nullable().optional(),
  visibility: VisibilityEnum.optional(),
  tags: z.array(TagsEnum).max(10).optional(),
  isDraft: z.boolean().optional(),
});

export const PostSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string(),
  category: CategoryEnum,
  coverImage: z.string().nullable(),
  visibility: VisibilityEnum,
  tags: z.array(TagsEnum),
  isDraft: z.boolean(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Post Query Schema
export const PostQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  category: CategoryEnum.optional(),
  tags: z.array(TagsEnum).optional(),
  visibility: VisibilityEnum.optional(),
  userId: z.string().cuid().optional(),
  search: z.string().min(1).optional(),
  isDraft: z.coerce.boolean().optional(),
});

// Type exports
export type Post = z.infer<typeof PostSchema>;
export type PostCreate = z.infer<typeof PostCreateSchema>;
export type PostUpdate = z.infer<typeof PostUpdateSchema>;
export type PostQuery = z.infer<typeof PostQuerySchema>;

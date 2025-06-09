// src/lib/schemas/collection.ts
import { z } from 'zod';
import { VisibilityEnum } from './common';

// Collection Schemas
export const CollectionCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  visibility: VisibilityEnum.default('PRIVATE'),
  isDraft: z.boolean().default(false),
});

export const CollectionUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  visibility: VisibilityEnum.optional(),
  isDraft: z.boolean().optional(),
});

export const CollectionSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  visibility: VisibilityEnum,
  isDraft: z.boolean(),
  userId: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Collection Post Management
export const AddPostToCollectionSchema = z.object({
  collectionId: z.string().cuid(),
  postId: z.string().cuid(),
});

export const RemovePostFromCollectionSchema = z.object({
  collectionId: z.string().cuid(),
  postId: z.string().cuid(),
});

// Collection Query Schema
export const CollectionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  visibility: VisibilityEnum.optional(),
  userId: z.string().cuid().optional(),
  search: z.string().min(1).optional(),
  isDraft: z.coerce.boolean().optional(),
});

// Type exports
export type Collection = z.infer<typeof CollectionSchema>;
export type CollectionCreate = z.infer<typeof CollectionCreateSchema>;
export type CollectionUpdate = z.infer<typeof CollectionUpdateSchema>;
export type CollectionQuery = z.infer<typeof CollectionQuerySchema>;
export type AddPostToCollection = z.infer<typeof AddPostToCollectionSchema>;
export type RemovePostFromCollection = z.infer<typeof RemovePostFromCollectionSchema>;
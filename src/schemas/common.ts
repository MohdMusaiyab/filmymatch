// src/lib/schemas/common.ts
import { z } from 'zod';

// Enums
export const CategoryEnum = z.enum([
  'FILMREFLECTION',
  'ARTICLE',
  'BOOKS',
  'MUSIC',
  'YOUTUBE',
  'DOCUMENTARY',
  'PODCAST',
  'OTHER'
]);

export const TagsEnum = z.enum([
  'INSPIRATIONAL',
  'MOTIVATIONAL',
  'FUNNY',
  'LOVE',
  'SEX',
  'ROMANCE',
  'RELATIONSHIP',
  'FRIENDSHIP',
  'COLLEGE',
  'WORK',
  'FAMILY',
  'LIFE',
  'SELFIMPROVEMENT',
  'SELFHELP',
  'SELFLOVE',
  'SELFCARE',
  'PHILOSOPHY',
  'PSYCHOLOGY',
  'SPIRITUALITY',
  'MENTALHEALTH',
  'PERSONALDEVELOPMENT',
  'PERSONALGROWTH',
  'PERSONALBRAND',
  'FILMOGRAPHY',
  'FILMMAKING',
  'CINEMATOGRAPHY',
  'SCREENWRITING',
  'DIRECTING',
  'ACTING',
  'PRODUCING',
  'EDITING',
  'MUSICPRODUCTION',
  'OTHER'
]);

export const VisibilityEnum = z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS']);

// Common ID Validation Schemas
export const IdParamSchema = z.object({
  id: z.string().cuid(),
});

export const UserIdParamSchema = z.object({
  userId: z.string().cuid(),
});

export const PostIdParamSchema = z.object({
  postId: z.string().cuid(),
});

export const CollectionIdParamSchema = z.object({
  collectionId: z.string().cuid(),
});

// Type exports
export type Category = z.infer<typeof CategoryEnum>;
export type Tags = z.infer<typeof TagsEnum>;
export type Visibility = z.infer<typeof VisibilityEnum>;
import { z } from "zod";
//Base User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(),
  username: z.string(),
  bio: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

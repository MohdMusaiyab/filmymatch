import { z } from "zod";
import { SecurityQuestionSchema } from "./securityQuestion";

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  securityQuestion: SecurityQuestionSchema,
  securityAnswer: z.string().min(1, "Security answer is required"),
  bio: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Invalid phone number")
    .optional(),
  avatar: z.string().url("Invalid URL").optional(),
  emailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()), 
  updatedAt: z.date().default(() => new Date()), 
});

export type User = z.infer<typeof UserSchema>;

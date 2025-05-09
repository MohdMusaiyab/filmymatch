import { z } from "zod";


export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  bio: z.string().optional(),
  phone: z.string().refine(
    (value) => /^\+?\d{6,20}$/.test(value), // Allows optional '+' and 6-20 digits
    "Invalid phone number"
  ).optional(),
  avatar: z.string().url("Invalid URL").optional(),
  emailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  verificationToken: z.string().optional() // Added for verification
});

export type User = z.infer<typeof UserSchema>;

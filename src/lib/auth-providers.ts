import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { LoginSchema } from "@/schemas/auth";
import { verifyData } from "./auth";
import { AuthError } from "@/types/AuthError";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input with the Zod schema pattern
          const validatedFields = LoginSchema.safeParse(credentials);
          if (!validatedFields.success) {
            throw new AuthError(
              "VALIDATION_ERROR",
              "Invalid credentials format",
              400,
              validatedFields.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
              }))
            );
          }

          // Consistent database query style
          const user = await prisma.user.findUnique({
            where: { email: validatedFields.data.email },
            select: {
              id: true,
              email: true,
              password: true,
              emailVerified: true,
              username: true,
              isActive: true,
            },
          });

          if (!user) {
            throw new AuthError(
              "USER_NOT_FOUND",
              "No account found with this email",
              404
            );
          }
          const passwordValid = await verifyData(
            validatedFields.data.password,
            user.password
          );

          if (!passwordValid) {
            throw new AuthError(
              "INVALID_CREDENTIALS",
              "Incorrect password",
              401
            );
          }

          if (!user.isActive) {
            throw new AuthError(
              "ACCOUNT_INACTIVE",
              "Your account has been deactivated",
              403
            );
          }
          // Return minimal user data matching your API style

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Authentication error:", error);

          // Convert to NextAuth expected error format
          if (error instanceof AuthError) {
            throw new Error(
              JSON.stringify({
                code: error.code,
                message: error.message,
                status: error.status,
              })
            );
          }

          throw new Error(
            JSON.stringify({
              code: "AUTHENTICATION_FAILED",
              message: "Authentication failed",
              status: 500,
            })
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user ,trigger}) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.emailVerified = user.emailVerified;
      }
      // If it's a session update, refresh user data from database
      if (trigger === "update") {
        const refreshedUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            email: true,
            username: true,
            emailVerified: true,
          },
        });

        if (refreshedUser) {
          token.emailVerified = refreshedUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: process.env.NODE_ENV === "development",
};

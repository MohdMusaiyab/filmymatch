import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // Example: Check credentials against a database
        const user = { id: "1", username: "user", email: "user@example.com" };

        if (
          credentials?.email === user.email &&
          credentials?.password === "password"
        ) {
          return user; // Return the user object
        } else {
          return null; // Return null if authentication fails
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/auth/signin", // Custom sign-in page
//   },
};
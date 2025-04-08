// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // 1. Define public routes that don't require auth
  const publicRoutes = ["/", "/auth/sign-in", "/auth/sign-up", "/auth/verify-email"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

  // 2. Handle logged-in users trying to access auth pages
  if (token && (pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Handle unauthenticated users trying to access protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  // 4. Handle authenticated but unverified users
  if (token && !token.emailVerified && !pathname.startsWith("/auth/verify-email") && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/verify-email", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth.js endpoints)
     * - public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|public).*)",
  ],
};
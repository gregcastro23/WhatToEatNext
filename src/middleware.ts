import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware for protected routes.
 *
 * Wraps the Auth.js middleware with error handling so that misconfigured
 * environments (e.g., Vercel preview deployments missing AUTH_SECRET)
 * don't produce 500 errors. Instead, unauthenticated users are
 * redirected to /login.
 */
async function middleware(request: NextRequest) {
  try {
    return await (auth as any)(request);
  } catch (error) {
    // If auth fails due to missing secret or misconfiguration,
    // redirect to login rather than crashing with a 500
    const loginUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
}

export default middleware;

export const config = {
  matcher: [
    // Only run middleware on routes that need auth protection
    '/profile/:path*',
    '/onboarding/:path*',
  ],
};

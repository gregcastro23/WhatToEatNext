import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware for protected routes.
 *
 * - Unauthenticated users on protected routes -> /login
 * - Authenticated users who haven't completed onboarding:
 *     /profile -> redirect to /onboarding
 * - Authenticated users who HAVE completed onboarding:
 *     /onboarding -> redirect to /profile
 */
async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Not authenticated -> redirect to login for protected routes
    if (!session?.user) {
      if (pathname.startsWith("/profile") || pathname.startsWith("/onboarding") || pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
      }
      return NextResponse.next();
    }

    const user = session.user as any;
    const onboardingComplete = user.onboardingComplete === true;

    // Authenticated but onboarding incomplete -> force /onboarding
    if (!onboardingComplete && pathname.startsWith("/profile")) {
      return NextResponse.redirect(new URL("/onboarding", request.nextUrl.origin));
    }

    // Authenticated and onboarding complete -> skip onboarding page
    if (onboardingComplete && pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/profile", request.nextUrl.origin));
    }

    // Admin route protection
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/profile", request.nextUrl.origin));
    }

    return NextResponse.next();
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
    '/profile/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
  ],
};

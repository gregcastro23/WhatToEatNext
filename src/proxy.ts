import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateRequest } from "@/lib/auth/validateRequest";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Edge Filtering: Block bot probes for sensitive files
  const sensitivePaths = ["/.env", "/.git"];
  for (const path of sensitivePaths) {
    if (pathname.startsWith(path)) {
      console.warn(`Attempted access to sensitive path: ${pathname}`);
      return new NextResponse("Access Denied", { status: 403 });
    }
  }

  // Robust Authentication: Protect specific API routes
  if (
    pathname.startsWith("/api/user/profile") ||
    pathname.startsWith("/api/astrologize")
  ) {
    const authResult = await validateRequest(request);
    if ("error" in authResult) {
      return authResult.error; // Return the error response from validateRequest
    }
  }

  // Create a response object from the request
  const response = NextResponse.next();

  // NOTE: CSP and security headers are now configured in next.config.mjs
  // to ensure proper integration with Vercel deployments and build process.
  // This middleware is kept for future request processing needs.

  return response;
}

// Match all request paths except for most static files and _next
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and a few other specific JS files
     * This ensures that the middleware runs on API routes and pages.
     */
    "/((?!_next/static|_next/image|favicon.ico|empty.js|dummy-popup.js|popup-fix.js|block-popup.js|window-patching.js|lockdown-patch.js|popup.js).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Create a response object from the request
  const response = NextResponse.next();

  // NOTE: CSP and security headers are now configured in next.config.mjs
  // to ensure proper integration with Vercel deployments and build process.
  // This middleware is kept for future request processing needs.

  return response;
}

// Match all request paths except for API routes, static files, and _next
export const config = {
  matcher: [
    // Only apply to the website pages, not to API routes or static files
    "/((?!api|_next/static|_next/image|favicon.ico|empty.js|dummy-popup.js|popup-fix.js|block-popup.js|window-patching.js|lockdown-patch.js|popup.js).*)",
  ],
};

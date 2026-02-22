import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add any custom auth logic here if needed
  // For Privy client-side, we usually let the frontend handle the redirect
  // But if you are doing server-side redirects for unauthenticated users:
  
  const token = request.cookies.get('privy-token'); // Or however you store your session
  
  // Example: If a user tries to access /profile without a token, redirect to login
  if (!token && request.nextUrl.pathname.startsWith('/profile')) {
    // Only redirect if it's a page request, not a data fetch if possible
    // But for a simple fix, this works for the browser:
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();

  // We could add security headers here too if they aren't in next.config.mjs
  // But let's stick to the requested fix for now.

  return response;
}

// THE CRITICAL PART: The Matcher
// This tells Next.js exactly which paths the middleware should run on.
// We are explicitly ignoring static files, images, and public routes.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon-192x192.png, apple-icon.png (favicon file)
     * - robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon-192x192.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
};

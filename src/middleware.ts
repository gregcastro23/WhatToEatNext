import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('privy-token');
  
  // Example: If a user tries to access /profile without a token, redirect to login
  if (!token && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon-192x192.png, icon.svg (favicon files)
     * - login (login page)
     * - / (root/home page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon-192x192.png|icon.svg|login|$).*)',
  ],
};

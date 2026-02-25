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
    // Only run middleware on routes that need auth protection
    '/profile/:path*',
    '/onboarding/:path*',
  ],
};

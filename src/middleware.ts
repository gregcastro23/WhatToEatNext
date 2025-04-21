import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    // Get the NextResponse object
    const response = NextResponse.next();
    
    // Only add 'unsafe-eval' in development mode
    if (process.env.NODE_ENV === 'development') {
      // Add Content Security Policy header to allow 'unsafe-eval' for development only
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
      );
      
      console.log('Added CSP header with unsafe-eval for development mode');
    } else {
      // In production, use a stricter CSP without 'unsafe-eval'
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
      );
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 
import { NextRequest, NextResponse } from 'next/server';

export function middleware(_request: NextRequest) {
  // Create a response object from the request
  const response = NextResponse.next();
  // Define the environment
  const isDevelopment = process.env.NODE_ENV === 'development',

  // Add security headers with more permissive settings for development
  const cspHeader =
    `default-src 'self', ` +
    `script-src 'self' 'unsafe-inline' ${isDevelopment ? ''unsafe-eval'' : ''} https: //unpkg.com https://cdn.jsdelivr.net; ` +
    `style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; ` +
    `img-src 'self' data: blob: https:; ` +
    `font-src 'self' data: https:; ` +
    `connect-src 'self' https:; ` +
    `media-src 'self' https:; ` +
    `object-src 'none'; ` +
    `frame-src 'self' https:`

  // Add CSP header
  response.headers.set('Content-Security-Policy', cspHeader);

  // Add other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Match all request paths except for API routes, static files, and _next
export const _config = {
  _matcher: [
    // Only apply to the website pages, not to API routes or static files
    '/((?!api|_next/static|_next/image|favicon.ico|empty.js|dummy-popup.js|popup-fix.js|block-popup.js|window-patching.js|lockdown-patch.js|popup.js).*)'
  ]
};

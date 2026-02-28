export { auth as middleware } from "@/lib/auth/auth";

export const config = {
  matcher: [
    // Only run middleware on routes that need auth protection
    '/profile/:path*',
    '/onboarding/:path*',
  ],
};

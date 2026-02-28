/**
 * Next.js Middleware — Edge Runtime Compatible
 *
 * Uses the edge-safe auth config (auth.config.ts) which contains NO
 * Node.js-only imports (pg, jsonwebtoken, bcryptjs).
 *
 * All route-protection logic lives in the `authorized` callback
 * inside auth.config.ts. This file simply wires it up as middleware.
 *
 * @file src/middleware.ts
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/profile/:path*", "/onboarding/:path*", "/admin/:path*"],
};

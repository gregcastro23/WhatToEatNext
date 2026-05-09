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
import { applyRequestAuthOrigin } from "@/lib/auth/runtimeOrigin";
import type { NextRequest } from "next/server";

const authMiddleware = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
) => ReturnType<Response["clone"]> | Promise<Response | undefined> | undefined;

export default function middleware(request: NextRequest) {
  applyRequestAuthOrigin(request);
  return authMiddleware(request);
}

export const runtime = "nodejs";

export const config = {
  matcher: [
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/recipe-generator/:path*",
    "/planetary-chart/:path*",
  ],
};

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

// Slow-middleware diagnostic. Production tail-latency on /profile,
// /current-chart, /restaurant-creator etc. occasionally exceeds Vercel's 60s
// function timeout with no obvious code-path explanation; logging timings >1s
// gives us a real signal in Vercel logs the next time it happens (look for
// "[middleware] slow" in the error stream).
const SLOW_MIDDLEWARE_THRESHOLD_MS = 1000;

export default async function middleware(request: NextRequest) {
  const started = Date.now();
  applyRequestAuthOrigin(request);
  try {
    const result = await authMiddleware(request);
    const elapsed = Date.now() - started;
    if (elapsed > SLOW_MIDDLEWARE_THRESHOLD_MS) {
      console.warn(
        `[middleware] slow ${elapsed}ms ${request.method} ${request.nextUrl.pathname}`,
      );
    }
    return result;
  } catch (err) {
    const elapsed = Date.now() - started;
    console.error(
      `[middleware] failed after ${elapsed}ms ${request.method} ${request.nextUrl.pathname}:`,
      err,
    );
    // Don't let middleware errors block the request — return undefined so the
    // page handler runs and can apply its own auth gate. NextAuth normally
    // returns undefined here too when there's no redirect to issue.
    return undefined;
  }
}

export const runtime = "nodejs";

export const config = {
  matcher: [
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/birth-chart/:path*",
    "/current-chart/:path*",
    "/recipe-generator/:path*",
    // /planetary-chart is deliberately absent: the planetary-ecosystem surface
    // is fully public (the current sky is the same for everyone).
    "/restaurant-creator/:path*",
    "/premium-table/:path*",
  ],
};

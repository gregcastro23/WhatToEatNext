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

import { NextResponse } from "next/server";
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

/**
 * Dev-only surfaces (`/dev/*`) must not exist in production.
 *
 * The page's own `notFound()` guard was not enough: the route still answered
 * **HTTP 200** with 404 content — a soft 404 that search engines index as a
 * real page. Next begins streaming the layout shell before the page component
 * throws, so by the time `notFound()` runs the status line is already sent and
 * can no longer be changed. Middleware runs before any rendering, so the
 * rewrite below reaches Next's real `/_not-found` route and returns a genuine
 * 404 with the styled page.
 */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export default async function middleware(request: NextRequest) {
  if (IS_PRODUCTION && request.nextUrl.pathname.startsWith("/dev/")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

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
    // Dev-only surfaces: hard-404'd in production by the guard above.
    "/dev/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/admin/:path*",
    "/birth-chart/:path*",
    "/current-chart/:path*",
    "/recipe-generator/:path*",
    // /planetary-chart is deliberately absent: the planetary-ecosystem surface
    // is fully public (the current sky is the same for everyone).
    //
    // ── Celestial Lab ────────────────────────────────────────────────────
    // The two legacy paths above now redirect into /celestial-lab/*. Matchers
    // are path-prefixed, so the old entries do NOT follow them: without these
    // two lines /celestial-lab/standing-chart would serve a natal chart with
    // no middleware check at all.
    //
    // ⚠️ These MUST stay per-leaf. A blanket "/celestial-lab/:path*" would
    // also swallow /celestial-lab/mechanics, which is the new home of the
    // deliberately-public /planetary-chart — gating it would be a regression
    // in the opposite direction, and a silent one, since a signed-in developer
    // never sees the redirect.
    "/celestial-lab/standing-chart/:path*",
    "/celestial-lab/current-chart/:path*",
    "/restaurant-creator/:path*",
    "/premium-table/:path*",
  ],
};

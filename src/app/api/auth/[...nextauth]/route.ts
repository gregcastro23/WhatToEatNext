/**
 * NextAuth.js API Route Handler
 *
 * Catch-all route for /api/auth/* endpoints:
 *   - /api/auth/signin
 *   - /api/auth/signout
 *   - /api/auth/callback/google
 *   - /api/auth/session
 *   - /api/auth/csrf
 *   - /api/auth/providers
 */

import { handlers } from "@/lib/auth/auth";
import { applyRequestAuthOrigin } from "@/lib/auth/runtimeOrigin";
import { scheduleTouchFromSessionResponse } from "@/lib/auth/sessionResponseTouch";
import { deriveAuthRouteName } from "@/lib/observability/authRouteName";
import { withObservability } from "@/lib/observability/withObservability";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Record the URL that was actually served, not the filesystem route name.
 * A constant `"/api/auth/[...nextauth]"` cannot satisfy any URL prefix, which
 * left `probeGoogleOAuthDependency`'s `summarizePath("/api/auth/callback/google")`
 * permanently unobserved. See `authRouteName.ts`.
 *
 * `nextUrl` is read defensively: the wrapper's handler type accepts a plain
 * `Request` as well as a `NextRequest`.
 */
const authObservability = {
  routeName: "/api/auth/[...nextauth]",
  deriveRouteName: (req: NextRequest) =>
    deriveAuthRouteName(req.nextUrl?.pathname ?? new URL(req.url).pathname),
} as const;

export const GET = withObservability(
  authObservability,
  async (request: NextRequest) => {
    applyRequestAuthOrigin(request);
    const response = await handlers.GET(request);
    const { pathname } = request.nextUrl;
    if (pathname.endsWith("/session") && response.ok) {
      scheduleTouchFromSessionResponse(response, request);
    }
    return response;
  },
);

export const POST = withObservability(
  authObservability,
  async (request: NextRequest) => {
    applyRequestAuthOrigin(request);
    return handlers.POST(request);
  },
);


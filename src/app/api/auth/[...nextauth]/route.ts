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

import { after } from "next/server";
import { handlers } from "@/lib/auth/auth";
import { applyRequestAuthOrigin } from "@/lib/auth/runtimeOrigin";
import { touchSession } from "@/lib/auth/sessionTouch";
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

export function scheduleTouchFromSessionResponse(response: Response, request: NextRequest): void {
  try {
    const cloned = response.clone();
    const run = async (): Promise<void> => {
      try {
        const data: unknown = await cloned.json();
        if (
          data &&
          typeof data === "object" &&
          "user" in data &&
          data.user &&
          typeof data.user === "object" &&
          "sessionId" in data.user &&
          typeof data.user.sessionId === "string" &&
          data.user.sessionId.length > 0
        ) {
          await touchSession(data.user.sessionId, request);
        }
      } catch {
        // Non-blocking JSON parsing / touch error
      }
    };

    try {
      after(run);
    } catch {
      // Fallback outside Next.js request context (e.g. unit tests)
      run().catch(() => {});
    }
  } catch {
    // Non-blocking touch scheduling
  }
}

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


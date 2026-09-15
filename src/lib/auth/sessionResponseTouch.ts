/**
 * Inspects a GET /api/auth/session response body and schedules a touch if a valid sessionId is found.
 *
 * Separated from [...nextauth]/route.ts to preserve Next.js App Router route module type constraints
 * (route modules must only export HTTP method handlers and standard route segment configs).
 *
 * @file src/lib/auth/sessionResponseTouch.ts
 */

import { after } from "next/server";
import { touchSession } from "./sessionTouch";
import type { NextRequest } from "next/server";

export function scheduleTouchFromSessionResponse(
  response: Response,
  request?: NextRequest | Request,
): void {
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

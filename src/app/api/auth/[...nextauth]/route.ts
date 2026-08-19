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
import { withObservability } from "@/lib/observability/withObservability";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export const GET = withObservability(
  { routeName: "/api/auth/[...nextauth]" },
  async (request: NextRequest) => {
    applyRequestAuthOrigin(request);
    return handlers.GET(request);
  },
);

export const POST = withObservability(
  { routeName: "/api/auth/[...nextauth]" },
  async (request: NextRequest) => {
    applyRequestAuthOrigin(request);
    return handlers.POST(request);
  },
);


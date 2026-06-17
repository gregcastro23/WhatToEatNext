/**
 * SpacetimeDB Diagnostics API
 * GET /api/admin/diagnostics/spacetime
 *
 * Secure admin-only diagnostics endpoint to inspect the configured env variables
 * for SpacetimeDB connection and active sync flags in the production environment.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  return NextResponse.json({
    success: true,
    diagnostics: {
      NEXT_PUBLIC_SPACETIME_URI: process.env.NEXT_PUBLIC_SPACETIME_URI || null,
      NEXT_PUBLIC_SPACETIME_MODULE: process.env.NEXT_PUBLIC_SPACETIME_MODULE || null,
      flags: {
        NEXT_PUBLIC_SPACETIME_LIVE_CULINARY: process.env.NEXT_PUBLIC_SPACETIME_LIVE_CULINARY || null,
        NEXT_PUBLIC_SPACETIME_LIVE_PLANNER: process.env.NEXT_PUBLIC_SPACETIME_LIVE_PLANNER || null,
        NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL: process.env.NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL || null,
        NEXT_PUBLIC_SPACETIME_LIVE_CART: process.env.NEXT_PUBLIC_SPACETIME_LIVE_CART || null,
        NEXT_PUBLIC_SPACETIME_LIVE_FEED: process.env.NEXT_PUBLIC_SPACETIME_LIVE_FEED || null,
      },
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || null,
    },
  });
}

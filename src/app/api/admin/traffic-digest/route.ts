/**
 * Admin AI Daily Traffic & Friction Digest
 * GET /api/admin/traffic-digest?range=24h|7d&refresh=1
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { getCachedTrafficFrictionDigest } from "@/services/admin/trafficDigestService";
import type { TrafficDigestRange } from "@/services/admin/trafficDigestTypes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handleGet(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const rangeParam = request.nextUrl.searchParams.get("range");
  const range: TrafficDigestRange = rangeParam === "7d" ? "7d" : "24h";
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

  try {
    const payload = await getCachedTrafficFrictionDigest(range, forceRefresh);
    return NextResponse.json(payload);
  } catch (err) {
    _logger.error("[api/admin/traffic-digest] failed to build digest:", err);
    return NextResponse.json(
      { success: false, error: "Traffic digest unavailable" },
      { status: 503 },
    );
  }
}

export const GET = withObservability(
  { routeName: "/api/admin/traffic-digest" },
  handleGet,
);

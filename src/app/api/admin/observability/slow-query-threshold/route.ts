/**
 * Slow-query threshold admin endpoint.
 *
 * GET  /api/admin/observability/slow-query-threshold — current threshold
 * POST /api/admin/observability/slow-query-threshold — { ms: number }
 *
 * The slow-query ring (src/lib/observability/slowQueryLog.ts) captures
 * Postgres queries above a configurable threshold. Default is 200ms set
 * from SLOW_QUERY_THRESHOLD_MS at boot. This endpoint lets ops raise the
 * threshold during incident noise or drop it during regression hunts —
 * without a redeploy.
 *
 * Process-local: the change applies to this Node process only. Each Vercel
 * function instance has its own ring. That's fine for live tuning; for a
 * permanent change, also set SLOW_QUERY_THRESHOLD_MS in env and redeploy.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  getSlowQueryThresholdMs,
  setSlowQueryThresholdMs,
} from "@/lib/observability/slowQueryLog";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Clamp the threshold to defend against fat fingers — 5ms catches even
// trivial queries (noise flood), and 60s is past the connection timeout
// so anything slower is already a separate failure mode.
const MIN_MS = 5;
const MAX_MS = 60_000;

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  return NextResponse.json({
    success: true,
    thresholdMs: getSlowQueryThresholdMs(),
    bounds: { minMs: MIN_MS, maxMs: MAX_MS },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const raw = (body as { ms?: unknown })?.ms;
  const ms = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(ms)) {
    return NextResponse.json(
      { success: false, message: "Body must include numeric `ms`" },
      { status: 400 },
    );
  }
  if (ms < MIN_MS || ms > MAX_MS) {
    return NextResponse.json(
      {
        success: false,
        message: `ms must be between ${MIN_MS} and ${MAX_MS}`,
        bounds: { minMs: MIN_MS, maxMs: MAX_MS },
      },
      { status: 400 },
    );
  }

  const previous = getSlowQueryThresholdMs();
  setSlowQueryThresholdMs(ms);
  const next = getSlowQueryThresholdMs();

  return NextResponse.json({
    success: true,
    thresholdMs: next,
    previousMs: previous,
    note:
      "Process-local change. Restart or redeploy resets to SLOW_QUERY_THRESHOLD_MS env.",
  });
}

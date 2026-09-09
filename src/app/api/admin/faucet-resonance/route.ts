/**
 * Admin Faucet Resonance API
 * GET /api/admin/faucet-resonance?days=N — live band occupancy and emission
 * pace for the untethered daily faucet (ADR-016).
 *
 * @requires Authentication - Admin role required
 *
 * Response shape: `FaucetResonanceReport` from
 * src/services/faucetResonanceService.ts. Aggregates only — no individual
 * user's chart, baseline or income crosses the wire.
 *
 * @file src/app/api/admin/faucet-resonance/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getFaucetResonance } from "@/services/faucetResonanceService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_WINDOW_DAYS = 30;
const MAX_WINDOW_DAYS = 180; // matches the table's retention

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const parsed = Number.parseInt(
    new URL(request.url).searchParams.get("days") ?? "",
    10,
  );
  const windowDays =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_WINDOW_DAYS
      ? parsed
      : DEFAULT_WINDOW_DAYS;

  try {
    const report = await getFaucetResonance(windowDays);
    return NextResponse.json({ success: true, ...report });
  } catch (error) {
    _logger.error("[admin/faucet-resonance] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to read faucet resonance" },
      { status: 500 },
    );
  }
}

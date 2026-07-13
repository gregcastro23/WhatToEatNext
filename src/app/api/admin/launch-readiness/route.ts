/**
 * Admin Launch Readiness API
 * GET /api/admin/launch-readiness — presence-only config readiness for the
 * revenue + on-chain subsystems, plus the live restaurant settlement backlog.
 *
 * @requires Authentication - Admin role required
 *
 * Response shape: `LaunchReadinessReport` from
 * src/services/launchReadinessService.ts. Only booleans and counts cross the
 * wire — no secret value is ever serialized.
 *
 * @file src/app/api/admin/launch-readiness/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getLaunchReadiness } from "@/services/launchReadinessService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  try {
    const report = await getLaunchReadiness();
    return NextResponse.json({ success: true, ...report });
  } catch (error) {
    console.error("[admin/launch-readiness] failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute launch readiness" },
      { status: 500 },
    );
  }
}

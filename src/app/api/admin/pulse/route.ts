/**
 * Admin Pulse — the headline number from every live source, in one call.
 * GET /api/admin/pulse
 *
 * Backs the KPI strip at the top of /admin. Response: `AdminPulse` from
 * src/services/admin/adminPulseService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getAdminPulse } from "@/services/admin/adminPulseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const payload = await memoize("admin:pulse", 10_000, getAdminPulse);
  return NextResponse.json({ success: true, ...payload });
}

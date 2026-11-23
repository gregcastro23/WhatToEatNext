/**
 * Admin: why sync-debit refuses (402), by reason and hour.
 * GET /api/admin/debit-refusals?hours=168
 *
 * Reads the counter table written by POST /api/economy/sync-debit (migration 107). Counting
 * starts when the writer deploys: `recordingSince` is the first hour measured, and hours before
 * it are unmeasured, not zero. `live: false` means the table could not be read.
 *
 * Response shape: `DebitRefusalReport` from src/services/debitRefusalService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { clampWindowHours, getDebitRefusalReport } from "@/services/debitRefusalService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The counter moves once an hour per reason; 30 s keeps two open tabs from re-reading it. */
const CACHE_TTL_MS = 30_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const raw = request.nextUrl.searchParams.get("hours");
  const hours = clampWindowHours(raw === null || raw.trim() === "" ? null : Number(raw));

  const report = await memoize(`admin:debit-refusals:${hours}`, CACHE_TTL_MS, () =>
    getDebitRefusalReport(hours),
  );
  return NextResponse.json({ success: true, ...report });
}

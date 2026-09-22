/**
 * Admin Jobs & Probes
 * GET /api/admin/jobs
 *
 * Every scheduled job and synthetic probe: schedule, state (the same verdict
 * the alerting cron uses), runs owed vs recorded in 24h, 7-day success and
 * latency against the function limit, recent runs, plus per-component alert
 * volume. Response: `JobsPayload` from src/services/admin/jobs/jobsService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getJobsOverview } from "@/services/admin/jobs/jobsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const payload = await memoize("admin:jobs", 30_000, () => getJobsOverview());
  return NextResponse.json({ success: true, ...payload });
}

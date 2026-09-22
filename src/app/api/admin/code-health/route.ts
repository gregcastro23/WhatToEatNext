/**
 * Admin Code Health
 * GET /api/admin/code-health
 *
 * tsc / ESLint readings per commit (CI-ingested), the committed ratchet
 * baselines of the deployed commit, the ratchet's history from GitHub, CI
 * status on master, recent commits, and open PRs.
 * Response: `CodeHealthPayload` from src/services/admin/codeHealthService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getCodeHealth } from "@/services/admin/codeHealthService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const payload = await memoize("admin:code-health", 30_000, () => getCodeHealth());
  return NextResponse.json({ success: true, ...payload });
}

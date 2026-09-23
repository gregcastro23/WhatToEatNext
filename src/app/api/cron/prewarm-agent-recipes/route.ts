/**
 * GET /api/cron/prewarm-agent-recipes
 *
 * Hourly cron that generates full PA-LLM recipes for a rotating slice of
 * chart-bearing historical agents and caches them (calculation_cache). The
 * Live Network Feed reads that cache and prefers the real PA recipe, falling
 * back to the live alchemically-grounded recipe for not-yet-warmed agents.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel cron). Server-to-server PA
 * calls only — no user token economy. Degrades gracefully if PA is unavailable.
 * Heartbeat details carry selected / attempted / generated / skippedForBudget,
 * shown per run on /admin/jobs.
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { prewarmAgentRecipes } from "@/services/agentRecipePrewarm";
import { recordCronRun } from "@/services/cronHeartbeatService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Generations must finish this long before `maxDuration`, leaving room for
 * the heartbeat write (a 6s read timeout plus one retry) so a slow PA can
 * never again take the run record down with the function.
 */
const HEARTBEAT_RESERVE_MS = 12_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const startedAt = new Date();
  const deadlineMs = startedAt.getTime() + maxDuration * 1000 - HEARTBEAT_RESERVE_MS;
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "3", 10), 1), 8);
    const result = await prewarmAgentRecipes(limit, deadlineMs);
    // A run that started generations and landed none is PA failing, not a
    // healthy tick — record it as such so two in a row can alert.
    const status = result.attempted > 0 && result.generated === 0 ? "failure" : "success";
    await recordCronRun("prewarm-agent-recipes", {
      status,
      startedAt,
      details: { ...result },
      ...(status === "failure" ? { error: `PA generated 0 of ${result.attempted} attempted` } : {}),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    _logger.error("[cron/prewarm-agent-recipes] failed:", error);
    await recordCronRun("prewarm-agent-recipes", {
      status: "failure",
      startedAt,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

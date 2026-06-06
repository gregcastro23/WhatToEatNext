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
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { prewarmAgentRecipes } from "@/services/agentRecipePrewarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "3", 10), 1), 8);
    const result = await prewarmAgentRecipes(limit);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    _logger.error("[cron/prewarm-agent-recipes] failed:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

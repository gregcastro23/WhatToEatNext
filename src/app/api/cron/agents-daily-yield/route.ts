/**
 * GET /api/cron/agents-daily-yield
 *
 * Daily cron that mints each active, chart-bearing agent's personalized Cosmic
 * Yield (source_type "agents_yield") so the token ledger / Live Network economy
 * surfaces stay alive and demonstrate the yield loop to new visitors. Reuses the
 * human yield engine; claims are idempotent per agent per day.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel cron). No user token economy
 * is touched beyond the agents' own daily claim. Degrades gracefully on error.
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runAgentDailyYield } from "@/services/agentDailyYield";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "30", 10), 1), 60);
    const result = await runAgentDailyYield(limit);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    _logger.error("[cron/agents-daily-yield] failed:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "unknown" },
      { status: 500 },
    );
  }
}

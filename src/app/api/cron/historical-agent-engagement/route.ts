/**
 * GET /api/cron/historical-agent-engagement
 *
 * Hourly cron (:20) keeping chart-bearing historical agents actively rating
 * and commenting on catalog recipes, replying in `feed_comments`, and posting
 * chart-grounded culinary insights to `feed_events`.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel cron).
 *
 * @file src/app/api/cron/historical-agent-engagement/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { recordCronRun } from "@/services/cronHeartbeatService";
import { runHistoricalAgentEngagement } from "@/services/historicalAgentEngagementService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const HEARTBEAT_RESERVE_MS = 12_000;

async function handleGet(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  const startedAt = new Date();
  const deadlineMs = startedAt.getTime() + maxDuration * 1000 - HEARTBEAT_RESERVE_MS;
  try {
    const { searchParams } = new URL(request.url);
    const reviews = Math.min(Math.max(parseInt(searchParams.get("reviews") ?? "3", 10) || 3, 1), 10);
    const comments = Math.min(Math.max(parseInt(searchParams.get("comments") ?? "3", 10) || 3, 1), 10);
    const insights = Math.min(Math.max(parseInt(searchParams.get("insights") ?? "2", 10) || 2, 1), 10);

    const result = await runHistoricalAgentEngagement({
      reviewCount: reviews,
      commentCount: comments,
      insightCount: insights,
      deadlineMs,
    });

    const totalActions =
      result.recipesReviewed + result.feedCommentsPosted + result.feedInsightsPosted;
    const status =
      result.agentsEligible > 0 && totalActions === 0 ? "failure" : "success";
    await recordCronRun("historical-agent-engagement", {
      status,
      startedAt,
      details: { ...result },
      ...(status === "failure"
        ? { error: "Historical agent engagement produced 0 feed/recipe actions" }
        : {}),
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    _logger.error("[cron/historical-agent-engagement] failed:", error);
    await recordCronRun("historical-agent-engagement", {
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

export const GET = withObservability(
  { routeName: "/api/cron/historical-agent-engagement" },
  handleGet,
);

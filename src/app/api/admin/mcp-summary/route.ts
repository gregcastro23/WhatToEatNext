import { NextResponse } from "next/server";
import { readJson } from "@/lib/api/json";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { getServiceUrl } from "@/lib/serviceUrls";
import { McpNetworkSummarySchema } from "@/lib/validation/serviceResponseSchemas";
import type { McpNetworkSummary, McpVerdict } from "@/services/mcpNetworkService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function roundNullable(val: number | null | undefined): number | null {
  return val !== null && val !== undefined ? Math.round(Number(val)) : null;
}

function resolveProbeHealth(
  probeRows: Array<{ called_at: Date; success: boolean }>,
): {
  probeVerdict: McpVerdict;
  consecutiveFailures: number;
  latestProbe: { called_at: Date; success: boolean } | undefined;
} {
  const [latestProbe] = probeRows;
  let consecutiveFailures = 0;
  for (const r of probeRows) {
    if (!r.success) consecutiveFailures += 1;
    else break;
  }

  let probeVerdict: McpVerdict = "UNKNOWN";
  if (latestProbe) {
    const ageMs = Date.now() - new Date(latestProbe.called_at).getTime();
    if (consecutiveFailures >= 3) {
      probeVerdict = "INCIDENT";
    } else if (consecutiveFailures > 0 || ageMs > 60 * 60 * 1000) {
      probeVerdict = "DEGRADED";
    } else {
      probeVerdict = "OK";
    }
  }
  return { probeVerdict, consecutiveFailures, latestProbe };
}

function resolveOverallVerdict(
  calls: number,
  errorRate: number,
  probeVerdict: McpVerdict,
): McpVerdict {
  if (calls === 0) return probeVerdict;
  if (errorRate > 0.25 || probeVerdict === "INCIDENT") return "INCIDENT";
  if (errorRate > 0.05 || probeVerdict === "DEGRADED") return "DEGRADED";
  return "OK";
}

/**
 * Compute MCP telemetry directly from WTEN's Postgres database (`mcp_invocations`
 * and agent `feed_events`) so `/admin/mcp` stays live and accurate even when the
 * upstream Planetary Agents `/api/admin/mcp-summary` service is unreachable or
 * experiencing database quota limits.
 */
async function buildLocalMcpSummary(
  windowMinutes: number,
): Promise<McpNetworkSummary> {
  const safeWindow = Math.max(1, Math.min(windowMinutes, 43_200));

  const [totalsRes, byToolRes, byCallerRes, probeRes, byAgentRes] =
    await Promise.all([
      executeQuery<{
        calls: string;
        success: string;
        failures: string;
        p50_ms: number | null;
        p95_ms: number | null;
        p99_ms: number | null;
      }>(
        `SELECT
           COUNT(*) AS calls,
           COUNT(*) FILTER (WHERE success = true) AS success,
           COUNT(*) FILTER (WHERE success = false) AS failures,
           PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms)
             FILTER (WHERE latency_ms IS NOT NULL) AS p50_ms,
           PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)
             FILTER (WHERE latency_ms IS NOT NULL) AS p95_ms,
           PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms)
             FILTER (WHERE latency_ms IS NOT NULL) AS p99_ms
         FROM mcp_invocations
         WHERE called_at >= NOW() - ($1::int * INTERVAL '1 minute')`,
        [safeWindow],
      ),
      executeQuery<{
        tool_name: string;
        calls: string;
        failures: string;
        p95_ms: number | null;
      }>(
        `SELECT
           tool_name,
           COUNT(*) AS calls,
           COUNT(*) FILTER (WHERE success = false) AS failures,
           PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)
             FILTER (WHERE latency_ms IS NOT NULL) AS p95_ms
         FROM mcp_invocations
         WHERE called_at >= NOW() - ($1::int * INTERVAL '1 minute')
         GROUP BY tool_name
         ORDER BY calls DESC, tool_name ASC`,
        [safeWindow],
      ),
      executeQuery<{
        caller: string;
        calls: string;
      }>(
        `SELECT
           COALESCE(NULLIF(caller, ''), 'anonymous') AS caller,
           COUNT(*) AS calls
         FROM mcp_invocations
         WHERE called_at >= NOW() - ($1::int * INTERVAL '1 minute')
         GROUP BY COALESCE(NULLIF(caller, ''), 'anonymous')
         ORDER BY calls DESC
         LIMIT 20`,
        [safeWindow],
      ),
      executeQuery<{
        called_at: Date;
        success: boolean;
      }>(
        `SELECT called_at, success
         FROM mcp_invocations
         WHERE caller = 'synthetic-probe'
         ORDER BY called_at DESC
         LIMIT 20`,
      ),
      executeQuery<{
        agent_id: string;
        calls: string;
        free_calls: string;
        cheap_calls: string;
        primary_calls: string;
        reflective_calls: string;
      }>(
        `SELECT
           COALESCE(
             NULLIF(f.metadata_payload->>'agentSlug', ''),
             NULLIF(split_part(u.email, '@', 1), ''),
             u.id::text
           ) AS agent_id,
           COUNT(*) AS calls,
           COUNT(*) FILTER (WHERE f.event_type IN ('claim_daily', 'word_duel')) AS free_calls,
           COUNT(*) FILTER (WHERE f.event_type IN ('insight', 'lab_entry', 'transit_attunement')) AS cheap_calls,
           COUNT(*) FILTER (WHERE f.event_type IN ('recipe_generation', 'recipe_review')) AS primary_calls,
           COUNT(*) FILTER (WHERE f.event_type IN ('agent_chat', 'recipe_adapted', 'weekly_menu')) AS reflective_calls
         FROM feed_events f
         JOIN users u ON u.id = f.actor_id AND u.is_agent = true
         WHERE f.created_at >= NOW() - ($1::int * INTERVAL '1 minute')
         GROUP BY 1
         ORDER BY COUNT(*) DESC
         LIMIT 15`,
        [safeWindow],
      ),
    ]);

  const [totRow] = totalsRes.rows;
  const calls = Number(totRow?.calls ?? 0);
  const success = Number(totRow?.success ?? 0);
  const failures = Number(totRow?.failures ?? 0);
  const errorRate = calls > 0 ? failures / calls : 0;

  const { probeVerdict, consecutiveFailures, latestProbe } = resolveProbeHealth(
    probeRes.rows,
  );
  const verdict = resolveOverallVerdict(calls, errorRate, probeVerdict);

  return {
    live: true,
    generatedAt: new Date().toISOString(),
    windowMinutes: safeWindow,
    verdict,
    totals: {
      calls,
      success,
      failures,
      errorRate: Math.round(errorRate * 10000) / 10000,
      p50LatencyMs: roundNullable(totRow?.p50_ms),
      p95LatencyMs: roundNullable(totRow?.p95_ms),
      p99LatencyMs: roundNullable(totRow?.p99_ms),
    },
    byTool: byToolRes.rows.map((r) => ({
      tool: r.tool_name,
      calls: Number(r.calls),
      failures: Number(r.failures),
      p95LatencyMs: r.p95_ms !== null ? Math.round(Number(r.p95_ms)) : null,
    })),
    byAgent: byAgentRes.rows.map((r) => ({
      agentId: r.agent_id,
      calls: Number(r.calls),
      modelTierMix: {
        free: Number(r.free_calls),
        cheap_fast: Number(r.cheap_calls),
        primary: Number(r.primary_calls),
        reflective: Number(r.reflective_calls),
      },
    })),
    byCaller: byCallerRes.rows.map((r) => ({
      caller: r.caller,
      calls: Number(r.calls),
    })),
    syntheticProbe: {
      verdict: probeVerdict,
      lastCalledAt: latestProbe
        ? new Date(latestProbe.called_at).toISOString()
        : null,
      lastSuccess: latestProbe ? Boolean(latestProbe.success) : null,
      consecutiveFailures,
    },
  };
}

/**
 * GET /api/admin/mcp-summary
 *
 * Secure Next.js API route that aggregates MCP telemetry from Planetary Agents
 * when reachable, and falls back to WTEN's live `mcp_invocations` + `feed_events`
 * database tables when PA is unreachable or returns an upstream error.
 */
export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const windowMinutes = parseInt(searchParams.get("windowMinutes") ?? "60", 10) || 60;
  const secret = process.env.INTERNAL_API_SECRET;
  const base = getServiceUrl("planetaryAgentsApi");

  if (secret) {
    try {
      const res = await fetch(`${base}/api/admin/mcp-summary?windowMinutes=${windowMinutes}`, {
        method: "GET",
        headers: { "X-Internal-Secret": secret, Accept: "application/json" },
        signal: AbortSignal.timeout(3_500),
      });
      if (res.ok) {
        const data = await readJson(res, { parse: McpNetworkSummarySchema.nullable().parse });
        if (data && data.live !== false && data.totals && data.totals.calls > 0) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Fall through to local WTEN DB telemetry
    }
  }

  try {
    return NextResponse.json(await buildLocalMcpSummary(windowMinutes));
  } catch (err) {
    _logger.error("[admin/mcp-summary] local DB fallback failed", err);
    return NextResponse.json(
      { live: false, error: "pa_unreachable", message: err instanceof Error ? err.message : String(err) },
      { status: 200 },
    );
  }
}

/**
 * Admin Monica Companion Telemetry — GET /api/admin/agents/monica
 *
 * Authenticated admin proxy that pulls Monica's `monica_interactions` and
 * `monica_contextual_help` rollups from the Planetary Agents (PA) project.
 * The data lives in PA's Neon DB; we never query it directly from WTEN.
 *
 * Flow:
 *   1. `validateAdminRequest` gates access to admins.
 *   2. We POST GET `${PA_BASE}/api/internal/monica-telemetry` with the shared
 *      INTERNAL_API_SECRET header, optionally forwarding a `window` query.
 *   3. PA responds with helpfulness + completion + page rollups.
 *   4. We surface those numbers and a `live: false` fallback when PA is
 *      unavailable, so the dashboard never hard-fails on PA outage.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { getServiceUrl } from "@/lib/serviceUrls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PA_FETCH_TIMEOUT_MS = 5_000;
const CACHE_TTL_MS = 30_000;
const ALLOWED_WINDOWS = ["1h", "24h", "7d"] as const;
type MonicaWindow = (typeof ALLOWED_WINDOWS)[number];

export interface MonicaTopPage {
  path: string;
  count: number;
}

export interface MonicaTelemetryPayload {
  window: MonicaWindow;
  generatedAt: string;
  /** Ratio in [0, 1] of interactions marked `wasHelpful = true`. */
  helpfulnessScore: number | null;
  helpfulnessSampleSize: number;
  /** Average time-to-completion across resolved interactions, in ms. */
  avgCompletionMs: number | null;
  /** Total Monica interactions captured inside the window. */
  totalInteractions: number;
  /** Contextual-help requests captured inside the window. */
  contextualHelpRequests: number;
  /** Pages where assistance was most often requested, sorted DESC. */
  topPages: MonicaTopPage[];
  /** False when PA is unavailable or returned a malformed body. */
  live: boolean;
  source: string;
  error?: string;
}

function paBaseUrl(): string {
  return getServiceUrl("planetaryAgentsApi");
}

function emptyPayload(
  window: MonicaWindow,
  error: string,
): MonicaTelemetryPayload {
  return {
    window,
    generatedAt: new Date().toISOString(),
    helpfulnessScore: null,
    helpfulnessSampleSize: 0,
    avgCompletionMs: null,
    totalInteractions: 0,
    contextualHelpRequests: 0,
    topPages: [],
    live: false,
    source: "fallback",
    error,
  };
}

function asNumber(value: unknown, fallback: number | null = null): number | null {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asInt(value: unknown, fallback = 0): number {
  const n = asNumber(value, fallback);
  return n === null ? fallback : Math.max(0, Math.floor(n));
}

function normalizeTopPages(raw: unknown): MonicaTopPage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>;
      const path =
        (typeof r.path === "string" && r.path) ||
        (typeof r.pageUrl === "string" && r.pageUrl) ||
        (typeof r.page === "string" && r.page) ||
        null;
      if (!path) return null;
      const count = asInt(r.count ?? r.requests ?? r.total, 0);
      return { path, count };
    })
    .filter((entry): entry is MonicaTopPage => entry !== null)
    .slice(0, 10);
}

const WINDOW_HOURS: Record<MonicaWindow, number> = {
  "1h": 1,
  "24h": 24,
  "7d": 168,
};

async function fetchFromWtenDb(
  window: MonicaWindow,
  paError: string,
): Promise<MonicaTelemetryPayload> {
  try {
    const hours = WINDOW_HOURS[window] ?? 24;
    const [interactionsRes, ratingsRes, latencyRes, topPagesRes] =
      await Promise.all([
        executeQuery<{
          feed_cnt: string;
          mcp_cnt: string;
          help_cnt: string;
        }>(
          `SELECT
             (SELECT COUNT(*) FROM feed_events WHERE created_at >= NOW() - ($1::int * INTERVAL '1 hour')) AS feed_cnt,
             (SELECT COUNT(*) FROM mcp_invocations WHERE called_at >= NOW() - ($1::int * INTERVAL '1 hour')) AS mcp_cnt,
             (
               (SELECT COUNT(*) FROM mcp_invocations WHERE called_at >= NOW() - ($1::int * INTERVAL '1 hour'))
               + (SELECT COUNT(*) FROM feed_events WHERE created_at >= NOW() - ($1::int * INTERVAL '1 hour') AND event_type IN ('recipe_review', 'recipe_adapted', 'agent_chat', 'insight'))
               + (SELECT COUNT(*) FROM user_interactions WHERE created_at >= NOW() - ($1::int * INTERVAL '1 hour'))
             ) AS help_cnt`,
          [hours],
        ),
        executeQuery<{
          helpful_cnt: string;
          total_cnt: string;
        }>(
          `WITH rated AS (
             SELECT score AS rating FROM recipe_reflections
             WHERE created_at >= NOW() - (GREATEST($1::int, 168) * INTERVAL '1 hour')
               AND score IS NOT NULL
             UNION ALL
             SELECT (metadata_payload->>'rating')::numeric AS rating
             FROM feed_events
             WHERE created_at >= NOW() - ($1::int * INTERVAL '1 hour')
               AND (metadata_payload->>'rating') ~ '^[0-9]+(\\.[0-9]+)?$'
           )
           SELECT
             COUNT(*) FILTER (WHERE rating >= 4) AS helpful_cnt,
             COUNT(*) AS total_cnt
           FROM rated`,
          [hours],
        ),
        executeQuery<{
          avg_ms: number | null;
        }>(
          `WITH samples AS (
             SELECT latency_ms FROM mcp_invocations
             WHERE called_at >= NOW() - (GREATEST($1::int, 24) * INTERVAL '1 hour')
               AND latency_ms IS NOT NULL
             UNION ALL
             SELECT latency_ms FROM request_log_entries
             WHERE at >= NOW() - (GREATEST($1::int, 24) * INTERVAL '1 hour')
               AND path IN ('/api/generate-cosmic-recipe', '/api/personalized-recommendations', '/api/cuisines/recommend')
               AND latency_ms IS NOT NULL
           )
           SELECT AVG(latency_ms)::float AS avg_ms FROM samples`,
          [hours],
        ),
        executeQuery<{
          path: string;
          cnt: string;
        }>(
          `WITH paths AS (
             SELECT path FROM page_views
             WHERE at >= NOW() - (GREATEST($1::int, 168) * INTERVAL '1 hour')
             UNION ALL
             SELECT path FROM request_log_entries
             WHERE at >= NOW() - (GREATEST($1::int, 24) * INTERVAL '1 hour')
               AND path NOT LIKE '/api/admin/%'
               AND path NOT LIKE '/api/auth/%'
           )
           SELECT path, COUNT(*) AS cnt
           FROM paths
           WHERE path IS NOT NULL AND path <> ''
           GROUP BY path
           ORDER BY COUNT(*) DESC
           LIMIT 8`,
          [hours],
        ),
      ]);

    const [iRow] = interactionsRes.rows;
    const totalInteractions =
      Number(iRow?.feed_cnt ?? 0) + Number(iRow?.mcp_cnt ?? 0);
    const contextualHelpRequests = Number(iRow?.help_cnt ?? 0);

    const [rRow] = ratingsRes.rows;
    const sampleSize = Number(rRow?.total_cnt ?? 0);
    const helpfulCount = Number(rRow?.helpful_cnt ?? 0);
    const helpfulnessScore =
      sampleSize > 0
        ? Math.round((helpfulCount / sampleSize) * 1000) / 1000
        : null;

    const avgMsRaw = latencyRes.rows[0]?.avg_ms;
    const avgCompletionMs =
      avgMsRaw !== null && avgMsRaw !== undefined && Number.isFinite(Number(avgMsRaw))
        ? Math.round(Number(avgMsRaw))
        : null;

    const topPages: MonicaTopPage[] = topPagesRes.rows.map((r) => ({
      path: r.path,
      count: Number(r.cnt),
    }));

    return {
      window,
      generatedAt: new Date().toISOString(),
      helpfulnessScore,
      helpfulnessSampleSize: sampleSize,
      avgCompletionMs,
      totalInteractions,
      contextualHelpRequests,
      topPages,
      live: true,
      source: "wten-db",
    };
  } catch (dbErr) {
    _logger.error("[admin/agents/monica] WTEN DB fallback failed", dbErr);
    return emptyPayload(window, paError);
  }
}

async function fetchFromPa(window: MonicaWindow): Promise<MonicaTelemetryPayload> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return fetchFromWtenDb(window, "INTERNAL_API_SECRET not configured");
  }
  const base = paBaseUrl();
  const url = `${base}/api/internal/monica-telemetry?window=${encodeURIComponent(window)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PA_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Mirror the agent-sync convention so PA can authenticate this call
        // with the same secret.
        "X-Sync-Secret": secret,
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return fetchFromWtenDb(
        window,
        `PA responded ${res.status}: ${text.slice(0, 120)}`,
      );
    }

    const json = (await res.json()) as Record<string, unknown>;
    // PA may wrap the body in `{ success, data }` or return the raw shape.
    const data = (json.data ?? json) as Record<string, unknown>;

    const helpfulnessScore = asNumber(
      data.helpfulnessScore ?? data.helpfulness_score ?? data.helpfulnessRatio,
      null,
    );
    const helpfulnessSampleSize = asInt(
      data.helpfulnessSampleSize ?? data.helpfulness_sample_size ?? data.ratedSampleSize,
      0,
    );
    const avgCompletionMs = asNumber(
      data.avgCompletionMs ?? data.avg_completion_ms ?? data.averageCompletionMs,
      null,
    );
    const totalInteractions = asInt(
      data.totalInteractions ?? data.total_interactions ?? data.interactions,
      0,
    );
    const contextualHelpRequests = asInt(
      data.contextualHelpRequests ?? data.contextual_help_requests ?? data.helpRequests,
      0,
    );
    const topPages = normalizeTopPages(
      data.topPages ?? data.top_pages ?? data.pages,
    );

    return {
      window,
      generatedAt: new Date().toISOString(),
      helpfulnessScore,
      helpfulnessSampleSize,
      avgCompletionMs,
      totalInteractions,
      contextualHelpRequests,
      topPages,
      live: true,
      source: "planetary-agents",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fetchFromWtenDb(window, message);
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const requested = (searchParams.get("window") ?? "24h").toLowerCase();
  const window: MonicaWindow = ALLOWED_WINDOWS.includes(requested as MonicaWindow)
    ? (requested as MonicaWindow)
    : "24h";

  const payload = await memoize<MonicaTelemetryPayload>(
    `admin:agents/monica:${window}`,
    CACHE_TTL_MS,
    () => fetchFromPa(window),
  );

  return NextResponse.json({ success: true, ...payload });
}

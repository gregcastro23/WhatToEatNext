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

async function fetchFromPa(window: MonicaWindow): Promise<MonicaTelemetryPayload> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return emptyPayload(window, "INTERNAL_API_SECRET not configured");
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
      return emptyPayload(
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
    return emptyPayload(window, message);
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

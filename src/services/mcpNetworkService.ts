import { readJson } from "@/lib/api/json";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { McpNetworkSummarySchema } from "@/lib/validation/serviceResponseSchemas";
import {
  logMcpFallback,
  reasonFromError,
  reasonFromStatus,
  type McpFallbackReason,
  type McpSource,
} from "@/services/mcpFallback";

export type McpVerdict = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

export interface McpNetworkSummary {
  live: boolean;
  /** `wten-local` = WTEN's own tables, NOT Planetary Agents' view. Absent reads as PA. */
  source?: McpSource;
  /** Why PA was not used (set with `source: "wten-local"`), or why this read failed (set with `live: false`). */
  fallbackReason?: string;
  generatedAt: string;
  windowMinutes: number;
  verdict: McpVerdict;
  totals: {
    calls: number;
    success: number;
    failures: number;
    errorRate: number;
    p50LatencyMs: number | null;
    p95LatencyMs: number | null;
    p99LatencyMs: number | null;
  };
  byTool: Array<{
    tool: string;
    calls: number;
    failures: number;
    p95LatencyMs: number | null;
  }>;
  byAgent: Array<{
    agentId: string;
    calls: number;
    modelTierMix: Record<string, number>;
  }>;
  byCaller: Array<{ caller: string; calls: number }>;
  syntheticProbe: {
    verdict: McpVerdict;
    lastCalledAt: string | null;
    lastSuccess: boolean | null;
    consecutiveFailures: number;
  };
}

const DEFAULT_SUMMARY: McpNetworkSummary = {
  live: false,
  generatedAt: new Date().toISOString(),
  windowMinutes: 60,
  verdict: "UNKNOWN",
  totals: {
    calls: 0,
    success: 0,
    failures: 0,
    errorRate: 0,
    p50LatencyMs: null,
    p95LatencyMs: null,
    p99LatencyMs: null,
  },
  byTool: [],
  byAgent: [],
  byCaller: [],
  syntheticProbe: {
    verdict: "UNKNOWN",
    lastCalledAt: null,
    lastSuccess: null,
    consecutiveFailures: 0,
  },
};

let cachedSummary: { data: McpNetworkSummary; timestamp: number } | null = null;
const CACHE_TTL_MS = 30_000;

/**
 * Clear the telemetry cache. Exclusively used for unit tests.
 */
export function clearMcpNetworkSummaryCache(): void {
  cachedSummary = null;
}

/**
 * Fetch MCP network telemetry summary from Planetary Agents (PA).
 *
 * Automatically resolves the execution context:
 * - On server: Fetches PA endpoint directly with local secrets.
 * - On client: Fetches via WTEN's local Next.js API proxy route.
 *
 * Integrates a 30s cache TTL to shield the backend from concurrent component mounts,
 * and gracefully degrades to `{ live: false, ...stale }` rather than throwing on timeouts
 * or network failures.
 */
export async function getMcpNetworkSummary(windowMinutes = 60): Promise<McpNetworkSummary> {
  const isServer = typeof window === "undefined";
  const now = Date.now();

  // Check TTL cache
  if (
    cachedSummary &&
    now - cachedSummary.timestamp < CACHE_TTL_MS &&
    cachedSummary.data.windowMinutes === windowMinutes
  ) {
    return cachedSummary.data;
  }

  const stale = cachedSummary ? cachedSummary.data : DEFAULT_SUMMARY;

  // A read that failed says WHICH step failed, in the payload and (throttled) in the
  // production log: it used to be a bare `live: false`, so "PA telemetry unavailable"
  // had no reason attached anywhere.
  const degraded = (reason: McpFallbackReason): McpNetworkSummary => {
    logMcpFallback("mcpNetworkService", reason);
    return { ...stale, live: false, fallbackReason: reason };
  };

  try {
    let url = "";
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (isServer) {
      const secret = process.env.INTERNAL_API_SECRET ?? "";
      const base = getServiceUrlSafe("planetaryAgentsApi");
      url = `${base}/api/admin/mcp-summary?windowMinutes=${windowMinutes}`;
      if (secret) {
        headers["X-Internal-Secret"] = secret;
      }
    } else {
      url = `/api/admin/mcp-summary?windowMinutes=${windowMinutes}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return degraded(reasonFromStatus(res.status));
    }

    const data = await readJson(res, {
      parse: McpNetworkSummarySchema.nullable().parse,
    });

    // A 200 does not mean the upstream had data. The proxy reports its own
    // `live: false` when it could not reach the MCP source, and forcing
    // `live: true` over it relabelled a known-degraded payload as live.
    // A malformed body is likewise not live: the panel indexes into
    // `totals`/`byTool`, so caching a shape without them crashed /admin/mcp.
    const wellFormed =
      !!data &&
      typeof data.totals === "object" &&
      data.totals !== null &&
      Array.isArray(data.byTool) &&
      Array.isArray(data.byAgent);

    if (!wellFormed) {
      return degraded("malformed_response");
    }

    const liveData: McpNetworkSummary = {
      ...DEFAULT_SUMMARY,
      ...(data as McpNetworkSummary),
      // Respect the upstream's own verdict rather than asserting liveness.
      live: data.live !== false,
    };

    if (!liveData.live) {
      logMcpFallback("mcpNetworkService", "pa_not_live");
      return { ...liveData, fallbackReason: liveData.fallbackReason ?? "pa_not_live" };
    }

    // Only a genuinely live payload is worth caching as the stale fallback, and the
    // not-live case returned above.
    cachedSummary = {
      data: liveData,
      timestamp: now,
    };

    return liveData;
  } catch (error) {
    // Graceful fallback to stale or default summary
    return degraded(reasonFromError(error));
  }
}

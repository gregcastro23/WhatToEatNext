/**
 * What `/admin/mcp` says about where its numbers came from.
 *
 * The page printed "Planetary Agents status healthy" over whatever the proxy returned,
 * including WTEN's OWN `mcp_invocations` / `feed_events` when Planetary Agents could not
 * be read. `source` and `fallbackReason` (set by `/api/admin/mcp-summary`) now decide
 * the wording, so local data is never presented as Planetary Agents' view.
 *
 * @file src/app/admin/mcp/McpSourceBanner.tsx
 */

import React from "react";
import { describeFallbackReason } from "@/services/mcpFallback";
import type { McpNetworkSummary } from "@/services/mcpNetworkService";

/** The one-line status under the verdict. */
export function mcpStatusLine(summary: Pick<McpNetworkSummary, "live" | "source" | "generatedAt">): string {
  const at = new Date(summary.generatedAt).toLocaleTimeString();
  if (!summary.live) return "Showing cached/stale telemetry. Planetary Agents server is currently unreachable.";
  if (summary.source === "wten-local") return `WTEN-local telemetry · aggregated at ${at}`;
  return `Planetary Agents status healthy · aggregated at ${at}`;
}

/** The notice shown when the numbers are WTEN's own, or null when they are Planetary Agents'. */
export function mcpSourceNotice(
  summary: Pick<McpNetworkSummary, "source" | "fallbackReason">,
): { headline: string; detail: string } | null {
  if (summary.source !== "wten-local") return null;
  return {
    headline: "Showing WTEN's own MCP telemetry, not Planetary Agents'",
    detail:
      `Planetary Agents was not used: ${describeFallbackReason(summary.fallbackReason)}. ` +
      "These figures come from WTEN's mcp_invocations and agent feed_events tables.",
  };
}

export function McpSourceBanner({
  summary,
}: {
  summary: Pick<McpNetworkSummary, "source" | "fallbackReason">;
}): React.ReactElement | null {
  const notice = mcpSourceNotice(summary);
  if (!notice) return null;
  return (
    <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900">
      <p className="font-bold">{notice.headline}</p>
      <p className="mt-0.5">{notice.detail}</p>
    </div>
  );
}

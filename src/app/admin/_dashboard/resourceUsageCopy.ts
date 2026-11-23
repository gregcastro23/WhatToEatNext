/**
 * What the Resource Usage panel says when it has no numbers. One honest line
 * per cause, so "no token" and "token set but Railway refused" never look alike
 * (the panel used to say "set RAILWAY_API_TOKEN" even when it was set).
 *
 * @file src/app/admin/_dashboard/resourceUsageCopy.ts
 */

import type { ResourceUsageData } from "@/services/dashboardPanelsService";

export interface NoSourceCopy {
  /** Card subtitle. */
  subtitle: string;
  /** Empty-state headline. */
  headline: string;
  /** Empty-state detail line. */
  detail: string;
}

export function resourceUsageNoSourceCopy(data: Pick<ResourceUsageData, "status" | "failure">): NoSourceCopy {
  switch (data.status) {
    case "token-unset":
      return {
        subtitle: "Railway usage not connected",
        headline: "Railway usage not connected",
        detail: "set RAILWAY_API_TOKEN to populate",
      };
    case "call-failed":
      return {
        subtitle: "Railway usage unavailable",
        headline: "Railway usage unavailable",
        detail: `RAILWAY_API_TOKEN is set, but the Railway call failed: ${data.failure ?? "no reason recorded"}`,
      };
    case "unread":
      return {
        subtitle: "Railway usage not loaded",
        headline: "Railway usage not loaded",
        detail: "waiting for the dashboard payload",
      };
    case "live":
      return {
        subtitle: "Railway returned no usage rows",
        headline: "Railway returned no usage rows",
        detail: "the call succeeded but listed none of the tracked measurements",
      };
  }
}

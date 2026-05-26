/**
 * Synthetic MCP Probe — cron endpoint
 *
 * Triggered every 30 minutes by Vercel cron. Exercises the Alchm MCP
 * tool layer in-process (no subprocess) and records the result.
 *
 * The probe DOES not consume tokens — it identifies as the synthetic
 * probe via `_meta.internalSecret`, which the auth layer recognizes as
 * exempt from the per-tool ESMS debit.
 *
 * @file src/app/api/cron/synthetic-mcp/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runMcpProbe } from "@/services/syntheticProbeService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const result = await runMcpProbe();
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-mcp] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}

/**
 * Admin Agents API — GET /api/admin/agents
 *
 * Consolidated boundary telemetry between WTEN and Planetary Agents (ASOL):
 *   - Service reachability & latency (Planetary Agents API & UI)
 *   - Contract diagnostic probe results with negative controls (401 verification)
 *   - Inbound webhook delivery health (asol-sync-event, asol-feed, asol-agent-recipes)
 *   - Agent actions health (credit/debit paths, operational actions, crons, recipe pipeline)
 *   - Agent roster stats
 *
 * @requires Authentication - Admin role required
 * @file src/app/api/admin/agents/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { _logger } from "@/lib/logger";
import { getAdminAgentsOverview } from "@/services/admin/adminAgentsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 10_000;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = statusParam === "failed" ? "failed" : "all";

    const payload = await memoize(
      `admin:agents:${status}`,
      CACHE_TTL_MS,
      () => getAdminAgentsOverview({ status }),
    );

    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    _logger.error("[GET /api/admin/agents] Error loading overview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load agents overview" },
      { status: 500 },
    );
  }
}

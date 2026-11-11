/**
 * SpacetimeDB Diagnostics API
 * GET / POST /api/admin/diagnostics/spacetime
 *
 * Secure admin-only diagnostics endpoint to inspect the configured env variables
 * for SpacetimeDB connection, active sync flags, and circuit-breaker recovery state.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  probeAndRecoverSpacetimeCircuit,
  verifyAgentRatingSyncSweep,
  type AgentRatingSyncSweepReport,
} from "@/lib/spacetime/agentRatingProbe";
import { transitionSpacetimeCircuitToHalfOpen } from "@/lib/spacetime/spacetimeCircuitBreaker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ProbeCircuitBodySchema = z.object({
  action: z.enum(["probe_and_reset", "force_half_open"]).default("probe_and_reset"),
  sampleAgentId: z.string().trim().min(1).max(80).optional(),
});

function buildDiagnosticsPayload(agentRatingSync: AgentRatingSyncSweepReport): {
  NEXT_PUBLIC_SPACETIME_URI: string | null;
  NEXT_PUBLIC_SPACETIME_MODULE: string | null;
  flags: Record<string, string | null>;
  agentRatingSync: AgentRatingSyncSweepReport;
  timestamp: string;
  nodeEnv: string | null;
} {
  return {
    NEXT_PUBLIC_SPACETIME_URI: process.env.NEXT_PUBLIC_SPACETIME_URI ?? null,
    NEXT_PUBLIC_SPACETIME_MODULE: process.env.NEXT_PUBLIC_SPACETIME_MODULE ?? null,
    flags: {
      NEXT_PUBLIC_SPACETIME_LIVE_CULINARY: process.env.NEXT_PUBLIC_SPACETIME_LIVE_CULINARY ?? null,
      NEXT_PUBLIC_SPACETIME_LIVE_PLANNER: process.env.NEXT_PUBLIC_SPACETIME_LIVE_PLANNER ?? null,
      NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL: process.env.NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL ?? null,
      NEXT_PUBLIC_SPACETIME_LIVE_CART: process.env.NEXT_PUBLIC_SPACETIME_LIVE_CART ?? null,
      NEXT_PUBLIC_SPACETIME_LIVE_FEED: process.env.NEXT_PUBLIC_SPACETIME_LIVE_FEED ?? null,
    },
    agentRatingSync,
    timestamp: new Date().toISOString(),
    nodeEnv: typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : null,
  };
}

export async function GET(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { searchParams } = new URL(request.url);
  const sampleAgentId = searchParams.get("agentId")?.trim() ?? undefined;
  const agentRatingSync = await verifyAgentRatingSyncSweep(
    sampleAgentId ? { sampleAgentId } : undefined,
  );

  return NextResponse.json({
    success: true,
    diagnostics: buildDiagnosticsPayload(agentRatingSync),
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const rawBody: unknown = await request.json().catch(() => ({}));
  const parsed = ProbeCircuitBodySchema.safeParse(rawBody ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { action, sampleAgentId } = parsed.data;
  if (action === "force_half_open") {
    transitionSpacetimeCircuitToHalfOpen();
  }
  const agentRatingSync = await probeAndRecoverSpacetimeCircuit(
    sampleAgentId ? { sampleAgentId } : undefined,
  );

  return NextResponse.json({
    success: true,
    action,
    diagnostics: buildDiagnosticsPayload(agentRatingSync),
  });
}

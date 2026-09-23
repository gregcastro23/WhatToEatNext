/**
 * GET /api/internal/agent-roster
 *
 * Internal read-only endpoint returning the roster of agentic accounts
 * in WhatToEatNext (@agentic.alchm.kitchen namespace).
 *
 * Authenticated via Bearer INTERNAL_API_SECRET.
 * Response is never cached (Cache-Control: no-store).
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENT_EMAIL_PATTERN = "%@agentic.alchm.kitchen";

interface AgentRow {
  id: string;
  email: string;
  name: string | null;
  is_agent: boolean | null;
  is_active: boolean | null;
  dominant_element: string | null;
  has_natal_chart: boolean | null;
  created_at: string | Date;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  if (!bearerMatches(authHeader, process.env.INTERNAL_API_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await executeQuery<AgentRow>(
      `SELECT
         u.id,
         u.email,
         up.name,
         u.is_agent,
         u.is_active,
         up.dominant_element,
         (
           (up.natal_positions IS NOT NULL AND up.natal_positions::text NOT IN ('[]', 'null', '{}'))
           OR (up.natal_chart IS NOT NULL AND up.natal_chart::text NOT IN ('[]', 'null', '{}'))
         ) AS has_natal_chart,
         u.created_at
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE LOWER(u.email) LIKE $1
      ORDER BY u.created_at ASC`,
      [AGENT_EMAIL_PATTERN],
    );

    const { rows } = res;
    let notFlagged = 0;

    const agents = rows.map((r) => {
      const isAgent = r.is_agent === true;
      if (!isAgent) notFlagged += 1;

      return {
        id: String(r.id),
        email: r.email,
        name: r.name ?? null,
        isAgent,
        isActive: r.is_active !== false,
        dominantElement: r.dominant_element ?? null,
        hasNatalChart: Boolean(r.has_natal_chart),
        createdAt: new Date(r.created_at).toISOString(),
      };
    });

    return NextResponse.json(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        count: agents.length,
        notFlagged,
        agents,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    _logger.error("[GET /api/internal/agent-roster] failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

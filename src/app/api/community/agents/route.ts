/**
 * GET /api/community/agents
 *
 * Returns the synchronized planetary agents (users with is_agent = true) along
 * with their identity slice (bio, dominant element) and the most recent action
 * timestamp. Powers the "View Network" listing on the Live Network Feed page.
 */

import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { redisCached } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Polled every ~30s by the Live Network Feed. The backing query aggregates
// feed_events across every active agent, so a per-client poll storm is the
// expensive case. The agent roster changes slowly, so a short shared cache is
// safe and collapses the storm to one query per limit per TTL (fails open).
const AGENTS_CACHE_TTL_SECONDS = 30;

interface AgentRow {
  user_id: string;
  email: string;
  name: string | null;
  bio: string | null;
  dominant_element: string | null;
  monica_constant: string | null;
  last_action_at: string | null;
  action_count: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "60", 10), 200);

  try {
    const agents = await redisCached(
      `community:agents:${limit}`,
      AGENTS_CACHE_TTL_SECONDS,
      async () => {
        const result = await executeQuery<AgentRow>(
          `SELECT u.id AS user_id,
                  u.email,
                  up.name,
                  up.bio,
                  up.dominant_element,
                  up.monica_constant,
                  MAX(f.created_at) AS last_action_at,
                  COUNT(f.id) AS action_count
             FROM users u
             LEFT JOIN user_profiles up ON up.user_id = u.id
             LEFT JOIN feed_events f ON f.actor_id = u.id
            WHERE COALESCE(u.is_agent, false) = true
              AND u.is_active = true
            GROUP BY u.id, u.email, up.name, up.bio, up.dominant_element, up.monica_constant
            ORDER BY MAX(f.created_at) DESC NULLS LAST
            LIMIT $1`,
          [limit],
        );

        return result.rows.map((row) => ({
          userId: row.user_id,
          handle: row.email,
          name: row.name || row.email.split("@")[0],
          bio: row.bio,
          dominantElement: row.dominant_element,
          monicaConstant: row.monica_constant
            ? parseFloat(row.monica_constant)
            : null,
          lastActionAt: row.last_action_at,
          actionCount: parseInt(row.action_count, 10) || 0,
        }));
      },
    );

    return NextResponse.json(
      { success: true, agents },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${AGENTS_CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
        },
      },
    );
  } catch (error) {
    console.error("[GET /api/community/agents]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load agents", agents: [] },
      { status: 500 },
    );
  }
}

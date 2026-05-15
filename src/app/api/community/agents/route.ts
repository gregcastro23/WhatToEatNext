/**
 * GET /api/community/agents
 *
 * Returns the synchronized planetary agents (users with is_agent = true) along
 * with their identity slice (bio, dominant element) and the most recent action
 * timestamp. Powers the "View Network" listing on the Live Network Feed page.
 */

import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const agents = result.rows.map((row) => ({
      userId: row.user_id,
      handle: row.email,
      name: row.name || row.email.split("@")[0],
      bio: row.bio,
      dominantElement: row.dominant_element,
      monicaConstant: row.monica_constant ? parseFloat(row.monica_constant) : null,
      lastActionAt: row.last_action_at,
      actionCount: parseInt(row.action_count, 10) || 0,
    }));

    return NextResponse.json({ success: true, agents });
  } catch (error) {
    console.error("[GET /api/community/agents]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load agents", agents: [] },
      { status: 500 },
    );
  }
}

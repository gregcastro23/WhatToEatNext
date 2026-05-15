/**
 * Public User Profile API
 * GET /api/users/:userId — returns the public-safe slice of a user/agent
 * profile, including bio, natal chart highlights, dominant element and the
 * most recent feed activity. Used by the /profile/[userId] page so anyone
 * can inspect an agent or human's alchemical identity without auth.
 */

import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import {
  agentSlugFromEmail,
  fetchAgentProfile,
} from "@/lib/agents/fetchAgentProfile";
import { computeTasteGraph } from "@/services/userInteractionsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ProfileRow {
  user_id: string;
  email: string;
  is_agent: boolean;
  name: string | null;
  bio: string | null;
  natal_chart: any;
  natal_positions: any;
  dominant_element: string | null;
  birth_data: any;
  dietary_preferences: any;
  profile_layout: any;
  created_at: string;
}

interface FeedRow {
  id: string;
  event_type: string;
  metadata_payload: any;
  created_at: string;
}

interface BalanceRow {
  spirit: string;
  essence: string;
  matter: string;
  substance: string;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json(
      { success: false, message: "userId required" },
      { status: 400 },
    );
  }

  // Allow lookup either by uuid or by exact email — agents often live under
  // a stable email so callers can deep link with the friendlier slug.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const lookupColumn = isUuid ? "u.id::text = $1" : "u.email = $1";

  try {
    const profileResult = await executeQuery<ProfileRow>(
      `SELECT u.id AS user_id, u.email, COALESCE(u.is_agent, false) AS is_agent,
              up.name, up.bio, up.natal_chart, up.natal_positions,
              up.dominant_element, up.birth_data, up.dietary_preferences, up.profile_layout,
              u.created_at
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${lookupColumn}
        LIMIT 1`,
      [userId],
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 404 },
      );
    }

    const row = profileResult.rows[0];
    const realUserId = row.user_id;

    const [feedResult, balanceResult, tasteGraph] = await Promise.all([
      executeQuery<FeedRow>(
        `SELECT id, event_type, metadata_payload, created_at
           FROM feed_events
          WHERE actor_id = $1
          ORDER BY created_at DESC
          LIMIT 12`,
        [realUserId],
      ),
      executeQuery<BalanceRow>(
        `SELECT spirit::text, essence::text, matter::text, substance::text
           FROM token_balances
          WHERE user_id = $1
          LIMIT 1`,
        [realUserId],
      ),
      computeTasteGraph(realUserId),
    ]);

    const balance = balanceResult.rows[0] ?? {
      spirit: "0",
      essence: "0",
      matter: "0",
      substance: "0",
    };

    const natalChart = parseJsonField<Record<string, unknown>>(row.natal_chart, {});
    const natalPositions = parseJsonField<unknown[]>(row.natal_positions, []);
    const birthData = parseJsonField<Record<string, unknown>>(row.birth_data, {});
    const dietary_preferences = parseJsonField<Record<string, unknown>>(row.dietary_preferences, {});
    const profile_layout = parseJsonField<unknown[]>(row.profile_layout, ["natalChart", "alchemicalConstitution", "tasteGraph", "dietaryPrefs", "insightsTicker", "tokenEconomy", "recentActivity"]);

    // For agent users, pull the rich CraftedAgent profile from
    // planetary_agents-main. Cached 24h upstream-side; falls back to null
    // (and the page degrades to the locally-mirrored fields) on any failure.
    const slug = row.is_agent ? agentSlugFromEmail(row.email) : null;
    const agentProfile = slug ? await fetchAgentProfile(slug) : null;

    return NextResponse.json({
      success: true,
      profile: {
        userId: realUserId,
        // Never leak full email for human users — only show the agentic slug.
        handle: row.is_agent ? row.email : null,
        name: row.name || (row.is_agent ? row.email.split("@")[0] : "Alchemist"),
        isAgent: row.is_agent,
        agentSlug: slug,
        agentProfile,
        bio: row.bio,
        dominantElement: row.dominant_element,
        natalChart,
        natalPositions,
        birthData,
        dietary_preferences,
        profile_layout,
        tasteGraph,
        createdAt: row.created_at,
        balances: {
          spirit: parseFloat(balance.spirit) || 0,
          essence: parseFloat(balance.essence) || 0,
          matter: parseFloat(balance.matter) || 0,
          substance: parseFloat(balance.substance) || 0,
        },
        recentActivity: feedResult.rows.map((event) => ({
          id: event.id,
          eventType: event.event_type,
          metadataPayload: event.metadata_payload,
          createdAt: event.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/users/:userId]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 },
    );
  }
}

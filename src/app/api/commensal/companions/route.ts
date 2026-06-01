/**
 * GET /api/commensal/companions
 *
 * Resolves three distinct categories of dining companions to recommend:
 *   1. Present Moment Agents: Dynamically fetched active transits from PA, joined with WTEN coordinates.
 *   2. Historical Feed Companions: Agents recently active in the community activity feed.
 *   3. Cosmic Agent Roster: The full set of synchronized planetary agents from the database.
 */

import { NextResponse, type NextRequest } from "next/server";
import { executeQuery } from "@/lib/database";
import { fetchAgentsForDate } from "@/lib/planetaryAgentsClient";
import { safeJsonParse } from "@/utils/typeGuards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface LocalAgentRow {
  user_id: string;
  email: string;
  profile: any;
  name: string | null;
  bio: string | null;
  dominant_element: string | null;
  monica_constant: string | null;
  birth_data: any;
  natal_chart: any;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch active agents for the current date from Planetary Agents API
    let activations: any[] = [];
    try {
      activations = await fetchAgentsForDate(new Date());
    } catch (err) {
      console.warn("[companions] Failed to fetch active transits from PA, degrading gracefully:", err);
    }

    // 2. Fetch all local synchronized agents
    const agentsResult = await executeQuery<LocalAgentRow>(
      `SELECT u.id AS user_id,
              u.email,
              u.profile,
              up.name,
              up.bio,
              up.dominant_element,
              up.monica_constant,
              up.birth_data,
              up.natal_chart
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE COALESCE(u.is_agent, false) = true
          AND u.is_active = true`,
      []
    );

    const localAgents = agentsResult.rows || [];

    // Parse and normalize birth data + charts with bulletproof fallback structures
    const hydratedAgents = localAgents.map((row) => {
      const profile = typeof row.profile === "string" ? safeJsonParse(row.profile) : row.profile || {};
      const birthData = row.birth_data 
        ? (typeof row.birth_data === "string" ? safeJsonParse(row.birth_data) : row.birth_data)
        : (profile.birthData || profile.birth_data || profile.natalChart?.birthData || profile.natal_chart?.birthData);
      
      const natalChart = row.natal_chart
        ? (typeof row.natal_chart === "string" ? safeJsonParse(row.natal_chart) : row.natal_chart)
        : (profile.natalChart || profile.natal_chart);

      return {
        userId: row.user_id,
        email: row.email,
        slug: row.email.split("@")[0].toLowerCase(),
        name: row.name || row.email.split("@")[0],
        bio: row.bio || profile.bio || "Planetary sage guiding alchemical balance.",
        dominantElement: row.dominant_element || natalChart?.dominantElement || "Fire",
        monicaConstant: row.monica_constant ? parseFloat(row.monica_constant) : null,
        birthData: birthData && Object.keys(birthData).length > 0 ? birthData : null,
        natalChart: natalChart && Object.keys(natalChart).length > 0 ? natalChart : null,
      };
    }).filter(a => a.birthData !== null); // Filter out agents that do not have valid birth data

    // 3. Fetch historical feed activity for agents
    const feedResult = await executeQuery<{ actor_id: string; last_action_at: string }>(
      `SELECT actor_id, MAX(created_at) AS last_action_at
         FROM feed_events
        GROUP BY actor_id
        ORDER BY last_action_at DESC
        LIMIT 30`,
      []
    );
    const feedActors = feedResult.rows || [];
    const actorTimestamps = new Map(feedActors.map(f => [f.actor_id, f.last_action_at]));

    // --- Build Companion Categories ---

    // Category 1: Present Moment Agents (aligned with active transits)
    const activeAgents = activations.map((act: any) => {
      const actAgentId = String(act.agent?.id || "").toLowerCase();
      // Match by email slug (prefix before @)
      const matchedLocal = hydratedAgents.find(a => a.slug === actAgentId);
      
      if (!matchedLocal) return null;

      return {
        ...matchedLocal,
        activation: {
          strength: typeof act.strength === "number" ? act.strength : 1.0,
          dignity: act.dignity || "peregrine",
          element: act.element || matchedLocal.dominantElement,
          planetaryRuler: act.planetaryRuler || "Sun",
          description: act.agent?.description || matchedLocal.bio
        }
      };
    }).filter((a): a is NonNullable<typeof a> => a !== null);

    // Category 2: Historical Feed Companions (who recently posted in the feed)
    const historicalAgents = hydratedAgents
      .filter(a => actorTimestamps.has(a.userId))
      .map(a => ({
        ...a,
        lastActionAt: actorTimestamps.get(a.userId) || null
      }))
      .sort((a, b) => {
        const timeA = new Date(a.lastActionAt || 0).getTime();
        const timeB = new Date(b.lastActionAt || 0).getTime();
        return timeB - timeA;
      });

    // Category 3: Cosmic Agent Roster (All synchronized charts)
    const cosmicRoster = [...hydratedAgents].sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      activeAgents,
      historicalAgents,
      cosmicRoster,
    });
  } catch (error) {
    console.error("[GET /api/commensal/companions] Failed to resolve dining companions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resolve dining companions" },
      { status: 500 }
    );
  }
}

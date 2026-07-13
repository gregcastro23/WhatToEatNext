/**
 * GET /api/commensal/companions
 *
 * Resolves three distinct categories of dining companions to recommend:
 *   1. Present Moment Agents: Dynamically fetched active transits from PA, joined with WTEN coordinates.
 *   2. Historical Feed Companions: Agents recently active in the community activity feed.
 *   3. Cosmic Agent Roster: The full set of synchronized planetary agents from the database.
 */

import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { fetchAgentsForDate } from "@/lib/planetaryAgentsClient";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type { BirthData, NatalChart } from "@/types/natalChart";
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

interface CompanionView {
  userId: string;
  email: string;
  name: string;
  bio: string;
  dominantElement: string;
  monicaConstant: number | null;
  birthData: BirthData;
  natalChart: NatalChart | null;
}

// `fetchAgentsForDate` (in @/lib/planetaryAgentsClient) has an inferred
// `Promise<any>` return type (it proxies an external API's JSON response),
// so its resolved array is typed here based on the fields actually read
// below (`act.agent?.id`, `act.strength`, `act.dignity`, `act.element`,
// `act.planetaryRuler`, `act.agent?.description`).
interface PlanetaryActivation {
  agent?: {
    id?: string;
    description?: string;
  };
  strength?: number;
  dignity?: string;
  element?: string;
  planetaryRuler?: string;
}

function parseObject(value: unknown): Record<string, any> | null {
  const parsed =
    typeof value === "string"
      ? safeJsonParse<Record<string, any>>(value)
      : value;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, any>)
    : null;
}

function errorSummary(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "unavailable";
}

export async function GET(_req: NextRequest) {
  const warnings: string[] = [];

  // Planetary activations and the local roster are independent sources. A
  // failure in either one should not prevent saved companions from loading.
  const [activations, localAgents] = await Promise.all([
    (fetchAgentsForDate(new Date()) as Promise<PlanetaryActivation[]>).catch(
      (error) => {
        warnings.push("planetary-activations");
        console.warn(
          "[companions] Planetary activations unavailable:",
          errorSummary(error),
        );
        return [] as PlanetaryActivation[];
      },
    ),
    executeQuery<LocalAgentRow>(
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
      [],
    )
      .then((result) => result.rows || [])
      .catch((error) => {
        warnings.push("cosmic-roster");
        console.warn(
          "[companions] Local agent roster unavailable:",
          errorSummary(error),
        );
        return [] as LocalAgentRow[];
      }),
  ]);

  // Parse and normalize birth data + charts with defensive fallback structures.
  const hydratedAgents = localAgents
    .map((row): CompanionView | null => {
      const profile = parseObject(row.profile) || {};
      const birthData =
        parseObject(row.birth_data) ||
        parseObject(profile.birthData) ||
        parseObject(profile.birth_data) ||
        parseObject(profile.natalChart)?.birthData ||
        parseObject(profile.natal_chart)?.birthData;
      const natalChart =
        parseObject(row.natal_chart) ||
        parseObject(profile.natalChart) ||
        parseObject(profile.natal_chart);
      const email = typeof row.email === "string" ? row.email : "";

      if (!email || !birthData) return null;

      return {
        userId: row.user_id,
        email,
        name: row.name || email.split("@")[0],
        bio:
          row.bio ||
          profile.bio ||
          "Planetary sage guiding alchemical balance.",
        dominantElement:
          row.dominant_element || natalChart?.dominantElement || "Fire",
        monicaConstant: row.monica_constant
          ? parseFloat(row.monica_constant)
          : null,
        birthData: birthData as BirthData,
        natalChart: (natalChart as NatalChart | null) || null,
      };
    })
    .filter((agent): agent is CompanionView => agent !== null);

  // Historical activity is optional. If it is unavailable, the roster and
  // saved companions remain fully usable.
  const feedActors: Array<{
    actor_id: string;
    last_action_at: string;
  }> = await executeQuery<{
    actor_id: string;
    last_action_at: string;
  }>(
    `SELECT actor_id, MAX(created_at) AS last_action_at
         FROM feed_events
        GROUP BY actor_id
        ORDER BY last_action_at DESC
        LIMIT 30`,
    [],
  )
    .then((result) => result.rows || [])
    .catch((error) => {
      warnings.push("historical-feed");
      console.warn(
        "[companions] Historical feed unavailable:",
        errorSummary(error),
      );
      return [] as Array<{ actor_id: string; last_action_at: string }>;
    });
  const actorTimestamps = new Map<string, string>(
    feedActors.map((feed) => [feed.actor_id, feed.last_action_at] as const),
  );

  // --- Build Companion Categories ---

  // Category 1: Present Moment Agents (aligned with active transits)
  const activeAgents = activations
    .map((act: PlanetaryActivation) => {
      const actAgentId = String(act.agent?.id || "").toLowerCase();
      // Match by email slug (prefix before @)
      const matchedLocal = hydratedAgents.find(
        (agent) => agent.email.split("@")[0].toLowerCase() === actAgentId,
      );

      if (!matchedLocal) return null;

      return {
        ...matchedLocal,
        activation: {
          strength: typeof act.strength === "number" ? act.strength : 1.0,
          dignity: act.dignity || "peregrine",
          element: act.element || matchedLocal.dominantElement,
          planetaryRuler: act.planetaryRuler || "Sun",
          description: act.agent?.description || matchedLocal.bio,
        },
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Category 2: Historical Feed Companions (who recently posted in the feed)
  const historicalAgents = hydratedAgents
    .filter((a) => actorTimestamps.has(a.userId))
    .map((a) => ({
      ...a,
      lastActionAt: actorTimestamps.get(a.userId) || null,
    }))
    .sort((a, b) => {
      const timeA = new Date(a.lastActionAt || 0).getTime();
      const timeB = new Date(b.lastActionAt || 0).getTime();
      return timeB - timeA;
    });

  // Category 3: Cosmic Agent Roster (All synchronized charts)
  const cosmicRoster = [...hydratedAgents].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Custom and linked companions are also optional. Auth or persistence issues
  // should never hide the manual Add Commensal workflow.
  let savedCompanions: CompanionView[] = [];
  try {
    const user = await getDatabaseUserFromRequest(_req);
    if (user) {
      const [manual, linked] = await Promise.all([
        commensalDatabase.getManualCompanionsForUser(user.id),
        commensalDatabase.getLinkedCommensalsForUser(user.id),
      ]);
      savedCompanions = [
        ...manual.map((companion) => ({
          userId: companion.id,
          email: "",
          name: companion.name,
          bio: `Saved companion chart (${companion.relationship || "friend"})`,
          dominantElement: companion.natalChart.dominantElement || "Fire",
          monicaConstant: null,
          birthData: companion.birthData,
          natalChart: companion.natalChart,
        })),
        ...linked.map((companion) => ({
          userId: companion.userId,
          email: companion.email,
          name: companion.name || companion.email.split("@")[0],
          bio: "Linked dining companion",
          dominantElement: companion.natalChart.dominantElement || "Fire",
          monicaConstant: null,
          birthData: companion.birthData,
          natalChart: companion.natalChart,
        })),
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    warnings.push("saved-companions");
    console.warn(
      "[companions] Saved companions unavailable:",
      errorSummary(error),
    );
  }

  return NextResponse.json({
    success: true,
    activeAgents,
    historicalAgents,
    cosmicRoster,
    savedCompanions,
    degraded: warnings.length > 0,
    unavailableSources: [...new Set(warnings)],
  });
}

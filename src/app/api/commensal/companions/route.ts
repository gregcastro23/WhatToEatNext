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
import { _logger } from "@/lib/logger";
import { fetchAgentsForDate } from "@/lib/planetaryAgentsClient";
import { rateLimit } from "@/lib/rateLimit";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { isNatalChart, type CompanionSuggestion } from "@/types/apiResponses";
import { isElementType, type ElementType } from "@/types/constants";
import type { NatalChart } from "@/types/natalChart";
import {
  readFirstStoredBirth,
  type StoredBirth,
} from "@/utils/astrology/storedBirthData";
import { safeJsonParse } from "@/utils/typeGuards";

/** The local part of an email — everything before the first "@". */
function localPart(email: string): string {
  const at = email.indexOf("@");
  return at === -1 ? email : email.slice(0, at);
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface LocalAgentRow {
  user_id: string;
  email: string;
  profile: unknown;
  name: string | null;
  bio: string | null;
  dominant_element: string | null;
  monica_constant: string | null;
  birth_data: unknown;
  natal_chart: unknown;
}

/**
 * The wire row itself, so the route cannot drift from the contract the client
 * enforces. `birthData` is `null` for an agent with no birth record we can stand
 * behind (see `readStoredBirthData`); it is never the column's `{}` default.
 */
type CompanionView = CompanionSuggestion;

// `fetchAgentsForDate` (in @/lib/planetaryAgentsClient) has an inferred
// `Promise<any>` return type (it proxies an external API's JSON response),
// so its resolved array is typed here based on the fields actually read
// below (`act.agent?.id`, `act.strength`, `act.dignity`, `act.element`,
// `act.planetaryRuler`, `act.agent?.description`).
interface PlanetaryActivation {
  id?: string;
  name?: string;
  description?: string;
  agent?: {
    id?: string;
    name?: string;
    description?: string;
  };
  strength?: number;
  dignity?: string;
  element?: string;
  planetaryRuler?: string;
}

function parseObject(value: unknown): Record<string, unknown> | null {
  const parsed =
    typeof value === "string"
      ? safeJsonParse<Record<string, unknown>>(value)
      : value;
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
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

/**
 * Every place an agent's birth record may live, in precedence order. Each is
 * read in turn by `readFirstStoredBirth`, so an empty `{}` in the first cannot
 * hide a real record in a later one.
 */
function birthCandidates(
  row: LocalAgentRow,
  profile: Record<string, unknown>,
): unknown[] {
  const chartFromProfile =
    parseObject(profile.natalChart) ?? parseObject(profile.natal_chart);
  return [
    parseObject(row.birth_data),
    parseObject(profile.birthData),
    parseObject(profile.birth_data),
    parseObject(chartFromProfile?.birthData),
  ];
}

/** The first stored chart that satisfies the contract; the legacy shapes do not, and are not guessed at. */
function firstUsableChart(
  row: LocalAgentRow,
  profile: Record<string, unknown>,
): NatalChart | null {
  const candidates = [
    parseObject(row.natal_chart),
    parseObject(profile.natalChart),
    parseObject(profile.natal_chart),
  ];
  for (const candidate of candidates) {
    if (isNatalChart(candidate)) return candidate;
  }
  return null;
}

function asElement(value: unknown): ElementType | null {
  return typeof value === "string" && isElementType(value) ? value : null;
}

/** The stored element if it is one of the four; otherwise the chart's. Never a default. */
function readElement(
  row: LocalAgentRow,
  chart: NatalChart | null,
): ElementType | null {
  return asElement(row.dominant_element) ?? chart?.dominantElement ?? null;
}

function hydrateAgentRow(
  row: LocalAgentRow,
  profile: Record<string, unknown>,
  birth: StoredBirth,
): CompanionView | null {
  const email = typeof row.email === "string" ? row.email : "";
  if (!email) return null;

  // No birth, no chart: a chart stored beside a birth we cannot stand behind
  // describes a different moment than the one we would show.
  const birthData = birth.kind === "birth" ? birth.birthData : null;
  const natalChart =
    birthData === null ? null : firstUsableChart(row, profile);

  return {
    userId: row.user_id,
    email,
    name: row.name ?? localPart(email),
    bio:
      row.bio ??
      (typeof profile.bio === "string" ? profile.bio : undefined) ??
      "Planetary sage guiding alchemical balance.",
    dominantElement: readElement(row, natalChart),
    monicaConstant: row.monica_constant
      ? parseFloat(row.monica_constant)
      : null,
    birthData,
    natalChart,
  };
}

/**
 * Hydrate the roster, counting the rows whose stored birth record is present
 * but cannot be read — the one class worth an operator's attention. An empty
 * record, a placeholder and an unsupported year are expected and are not counted.
 */
function hydrateAgents(rows: readonly LocalAgentRow[]): {
  agents: CompanionView[];
  unreadable: number;
} {
  const agents: CompanionView[] = [];
  let unreadable = 0;
  for (const row of rows) {
    const profile = parseObject(row.profile) ?? {};
    const birth = readFirstStoredBirth(birthCandidates(row, profile));
    if (birth.kind === "none" && birth.reason === "unreadable") unreadable += 1;
    const agent = hydrateAgentRow(row, profile, birth);
    if (agent !== null) agents.push(agent);
  }
  return { agents, unreadable };
}

// Unauthenticated and fans out to the external PA API — moderate per-IP cap.
const COMPANIONS_LIMIT = {
  window: 60_000,
  max: 30,
  bucket: "commensal-companions",
} as const;

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const rl = await rateLimit(_req, COMPANIONS_LIMIT);
  if (!rl.allowed) return rl.response!;

  const warnings: string[] = [];

  // Planetary activations and the local roster are independent sources. A
  // failure in either one should not prevent saved companions from loading.
  const [activations, localAgents] = await Promise.all([
    (fetchAgentsForDate(new Date()) as Promise<PlanetaryActivation[]>).catch(
      (error) => {
        warnings.push("planetary-activations");
        _logger.error(
          "[companions] Planetary activations unavailable:",
          errorSummary(error),
        );
        return [] as PlanetaryActivation[];
      },
    ),
    executeQuery<LocalAgentRow>(
      // §18o: monica_constant is single-body only; COALESCE the other two
      // constructions so an agent of any kind still surfaces its real value.
      `SELECT u.id AS user_id,
              u.email,
              u.profile,
              up.name,
              up.bio,
              up.dominant_element,
              COALESCE(up.monica_constant, up.monica_two_body, up.monica_full_chart) AS monica_constant,
              up.birth_data,
              up.natal_chart
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE COALESCE(u.is_agent, false) = true
          AND u.is_active = true`,
      [],
    )
      .then((result) => result.rows)
      .catch((error) => {
        warnings.push("cosmic-roster");
        _logger.error(
          "[companions] Local agent roster unavailable:",
          errorSummary(error),
        );
        return [] as LocalAgentRow[];
      }),
  ]);

  // Read each agent's stored birth record for what it can honestly carry.
  const { agents: hydratedAgents, unreadable } = hydrateAgents(localAgents);
  if (unreadable > 0) {
    _logger.error(
      "[companions] Agent rows whose stored birth data cannot be read (listed without a chart):",
      unreadable,
    );
  }

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
    .then((result) => result.rows)
    .catch((error) => {
      warnings.push("historical-feed");
      _logger.error(
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
      const actAgentId = String(act.id ?? act.agent?.id ?? "").toLowerCase();
      const strippedActId = actAgentId.replace(/^planetary-/, "");
      // Match by email slug (prefix before @), tolerating planetary- prefix
      const matchedLocal = hydratedAgents.find((agent) => {
        const localSlug = localPart(agent.email).toLowerCase();
        return (
          localSlug === actAgentId ||
          localSlug === strippedActId ||
          localSlug.replace(/^planetary-/, "") === strippedActId
        );
      });

      if (!matchedLocal) return null;

      // The gateway names the element of THIS activation. A degree agent's row
      // stores none, and the old "Fire" default contradicted the gateway (Mercury
      // in Scorpio listed as Fire), so the stored value wins only when present.
      const activationElement =
        asElement(act.element) ?? matchedLocal.dominantElement;

      return {
        ...matchedLocal,
        dominantElement: matchedLocal.dominantElement ?? activationElement,
        activation: {
          strength: typeof act.strength === "number" ? act.strength : 1.0,
          dignity: act.dignity ?? "peregrine",
          element: activationElement,
          planetaryRuler: act.planetaryRuler ?? "Sun",
          description: act.description ?? act.agent?.description ?? matchedLocal.bio,
        },
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Category 2: Historical Feed Companions (who recently posted in the feed)
  const historicalAgents = hydratedAgents
    .filter((a) => actorTimestamps.has(a.userId))
    .map((a) => ({
      ...a,
      lastActionAt: actorTimestamps.get(a.userId) ?? null,
    }))
    .sort((a, b) => {
      const timeA = new Date(a.lastActionAt ?? 0).getTime();
      const timeB = new Date(b.lastActionAt ?? 0).getTime();
      return timeB - timeA;
    });

  // Category 3: Cosmic Agent Roster (synchronized charts). An agent with no
  // birth data has no chart to seat at a table — ~2,800 degree and moon-phase
  // agents among them — so it is not on the roster.
  const cosmicRoster = hydratedAgents
    .filter((a) => a.birthData !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

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
          bio: `Saved companion chart (${companion.relationship ?? "friend"})`,
          dominantElement: companion.natalChart.dominantElement,
          monicaConstant: null,
          birthData: companion.birthData,
          natalChart: companion.natalChart,
        })),
        ...linked.map((companion) => ({
          userId: companion.userId,
          email: companion.email,
          name: companion.name || localPart(companion.email),
          bio: "Linked dining companion",
          dominantElement: companion.natalChart.dominantElement,
          monicaConstant: null,
          birthData: companion.birthData,
          natalChart: companion.natalChart,
        })),
      ].sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    warnings.push("saved-companions");
    _logger.error(
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

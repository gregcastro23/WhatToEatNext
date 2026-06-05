/**
 * Historical-agent feed — REAL internal data source.
 *
 * Produces `agent_event` items from WTEN's own database: the real feed activity
 * of agents (`is_agent = true`) that actually have a birthchart (non-empty
 * `user_profiles.natal_positions` / `natal_chart` / `birth_data`). That
 * birthchart gate is the "historical agent" definition the commensal companions
 * route already uses, and it matches the contract's historical+hasBirthchart
 * rule — chart-less ("planetary") agents are excluded.
 *
 * In production, historical agents (Carl Sagan, Cleopatra, Mozart, …) post
 * insights and lab experiments (each carrying a planetary signature), not
 * literal recipes — so we surface their genuine activity, narrated via the
 * shared `narrateFeedEvent`, rather than forcing everything into a recipe shape.
 *
 * `recipe_post` / `yield_claim` remain the PA cross-network contract types
 * (served by this route when PA_HISTORICAL_FEED_URL is wired). No alchemical /
 * ESMS / formula logic here — sourcing + narration only.
 */

import { executeQuery } from "@/lib/database";
import { narrateFeedEvent } from "@/lib/feed/eventNarration";
import {
  type AgentEventFeedItem,
  type EsmsTag,
  type FeedAgentBirthchart,
  type FeedElement,
  type RecipePostFeedItem,
} from "@/lib/feed/historicalAgentFeed";
import { _logger } from "@/lib/logger";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";

/** Content event types that represent a historical agent's culinary activity. */
const CONTENT_EVENT_TYPES = ["insight", "lab_entry", "recipe_generation", "made_it"];

const ESMS_TAGS: EsmsTag[] = ["Spirit", "Essence", "Matter", "Substance"];
const ELEMENTS: FeedElement[] = ["Fire", "Water", "Earth", "Air"];
const MAX_NATAL_PLACEMENTS = 4;

export interface AgentEventRow {
  id: string;
  actor_id: string;
  event_type: string;
  metadata_payload: unknown;
  created_at: string | Date;
  email: string | null;
  name: string | null;
  dominant_element: string | null;
  natal_positions: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return {};
    }
  }
  return isRecord(candidate) ? candidate : {};
}

function asArray(value: unknown): unknown[] {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }
  return Array.isArray(candidate) ? candidate : [];
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function pickEsms(value: unknown): EsmsTag | undefined {
  const s = str(value);
  return s ? ESMS_TAGS.find((t) => t.toLowerCase() === s.toLowerCase()) : undefined;
}

function pickElement(value: unknown): FeedElement | undefined {
  const s = str(value);
  return s ? ELEMENTS.find((e) => e.toLowerCase() === s.toLowerCase()) : undefined;
}

/** Format `[{planet, sign}]` placements as `["Sun Aquarius", …]` (top few). */
export function formatNatalPlacements(value: unknown): string[] {
  const out: string[] = [];
  for (const entry of asArray(value)) {
    if (!isRecord(entry)) continue;
    const planet = str(entry.planet);
    const sign = str(entry.sign);
    if (planet && sign) out.push(`${planet} ${sign}`);
    if (out.length >= MAX_NATAL_PLACEMENTS) break;
  }
  return out;
}

/**
 * Pure mapper: a historical agent's feed_event row → an `agent_event` item.
 * Exported for unit testing (no DB).
 */
export function mapAgentEventRow(row: AgentEventRow): AgentEventFeedItem {
  const meta = asRecord(row.metadata_payload);
  const signature = asRecord(meta.planetarySignature);
  const emailLocal =
    typeof row.email === "string" && row.email.includes("@")
      ? row.email.split("@")[0]
      : undefined;

  const narration = narrateFeedEvent(row.event_type, meta);
  const element = pickElement(signature.dominantElement) ?? pickElement(row.dominant_element);
  const esmsTag = pickEsms(signature.esmsTag) ?? pickEsms(signature.sacredStat);
  const planetaryHour = str(signature.planetaryHour) ?? str(signature.dominantPlanet);
  const natalSignature = formatNatalPlacements(signature.natalPositions ?? row.natal_positions);

  return {
    id: row.id,
    type: "agent_event",
    agent: {
      id: row.actor_id,
      name: str(row.name) ?? emailLocal ?? "Historical Agent",
      kind: "historical",
      hasBirthchart: true,
      ...(emailLocal ? { slug: emailLocal } : {}),
    },
    action: narration.action,
    icon: narration.icon,
    ...(narration.href ? { href: narration.href } : {}),
    ...(element ? { element } : {}),
    ...(esmsTag ? { esmsTag } : {}),
    ...(planetaryHour ? { planetaryHour } : {}),
    ...(natalSignature.length > 0 ? { natalSignature } : {}),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Fetch real historical-agent activity (insights, experiments, recipes) from
 * the database, newest first. Degrades to an empty array on any failure.
 */
export async function getHistoricalAgentEvents(
  limit = 40,
): Promise<AgentEventFeedItem[]> {
  try {
    const result = await executeQuery<AgentEventRow>(
      `SELECT f.id,
              f.actor_id,
              f.event_type,
              f.metadata_payload,
              f.created_at,
              u.email,
              up.name,
              up.dominant_element,
              up.natal_positions
         FROM feed_events f
         JOIN users u ON u.id = f.actor_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE COALESCE(u.is_agent, false) = true
          AND COALESCE(u.is_active, true) = true
          AND f.event_type = ANY($2::text[])
          AND (
                (up.natal_positions IS NOT NULL AND up.natal_positions::text NOT IN ('[]', 'null', '{}'))
             OR (up.natal_chart     IS NOT NULL AND up.natal_chart::text     NOT IN ('{}', 'null'))
             OR (up.birth_data      IS NOT NULL AND up.birth_data::text      NOT IN ('{}', 'null'))
              )
        ORDER BY f.created_at DESC
        LIMIT $1`,
      [limit, CONTENT_EVENT_TYPES],
    );

    return result.rows.map(mapAgentEventRow);
  } catch (error) {
    _logger.error("[historicalAgentFeed] internal DB query failed:", error);
    return [];
  }
}

// ─── Historical-agent recipes (alchemically-grounded, live) ──────────────────
//
// Historical agents (chart-bearing) post a recipe resonant with their natal
// dominant element + the current moment. Grounded in the real ingredient index
// (findTopIngredientsForElement) and composed via element-keyed dish templates —
// no PA LLM call (which can't run per-agent on a live feed load) and no DB
// writes. Full PA-LLM prose recipes are a cron-prewarmed follow-up.

const DISH_TEMPLATES: Record<FeedElement, string[]> = {
  Fire: ["Flame-Seared {x}", "Charred {x} with Chili", "{x} al Fuego"],
  Water: ["{x} Velouté", "Poached {x} in Broth", "Steamed {x} Parcels"],
  Air: ["Shaved {x} Salad", "Herbed {x} Carpaccio", "Whipped {x} Cloud"],
  Earth: ["Slow-Roasted {x}", "{x} Confit", "Braised {x} with Roots"],
};

const ELEMENT_DISTRIBUTION: Record<FeedElement, Partial<Record<FeedElement, number>>> = {
  Fire: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
  Water: { Water: 0.5, Earth: 0.2, Air: 0.2, Fire: 0.1 },
  Air: { Air: 0.5, Fire: 0.2, Water: 0.2, Earth: 0.1 },
  Earth: { Earth: 0.5, Water: 0.2, Fire: 0.2, Air: 0.1 },
};

function titleCaseWords(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

function birthchartFromPositions(value: unknown): FeedAgentBirthchart | undefined {
  const birthchart: FeedAgentBirthchart = {};
  for (const entry of asArray(value)) {
    if (!isRecord(entry)) continue;
    const planet = str(entry.planet)?.toLowerCase();
    const sign = str(entry.sign);
    if (!sign) continue;
    if (planet === "sun" && !birthchart.sun) birthchart.sun = sign;
    else if (planet === "moon" && !birthchart.moon) birthchart.moon = sign;
    else if ((planet === "ascendant" || planet === "rising") && !birthchart.ascendant) {
      birthchart.ascendant = sign;
    }
  }
  return Object.keys(birthchart).length > 0 ? birthchart : undefined;
}

export interface HistoricalAgentRow {
  actor_id: string;
  email: string | null;
  name: string | null;
  dominant_element: string | null;
  natal_positions: unknown;
}

/** Pure mapper: a chart-bearing agent → a recipe_post resonant with their chart. */
export function mapAgentToRecipePost(
  row: HistoricalAgentRow,
  index: number,
  now: Date,
): RecipePostFeedItem {
  const emailLocal =
    typeof row.email === "string" && row.email.includes("@")
      ? row.email.split("@")[0]
      : undefined;
  const element = pickElement(row.dominant_element) ?? ELEMENTS[index % ELEMENTS.length];
  const hourBucket = Math.floor(now.getTime() / 3_600_000);

  let recipeName = "a cosmic dish";
  try {
    const tops = findTopIngredientsForElement(element, 12);
    if (tops.length > 0) {
      const ingredient = titleCaseWords(tops[(hourBucket + index) % tops.length]?.name ?? "");
      const templates = DISH_TEMPLATES[element];
      const template = templates[(hourBucket + index) % templates.length];
      if (ingredient) recipeName = template.replace("{x}", ingredient);
    }
  } catch {
    /* keep fallback name */
  }

  const birthchart = birthchartFromPositions(row.natal_positions);

  return {
    id: `recipe-${row.actor_id}-${hourBucket}`,
    type: "recipe_post",
    agent: {
      id: row.actor_id,
      name: str(row.name) ?? emailLocal ?? "Historical Agent",
      kind: "historical",
      hasBirthchart: true,
      ...(birthchart ? { birthchart } : {}),
      ...(emailLocal ? { slug: emailLocal } : {}),
    },
    recipe: {
      name: recipeName,
      elements: ELEMENT_DISTRIBUTION[element],
    },
    element,
    // Staggered so agent recipes interleave below the live planetary cluster.
    createdAt: new Date(now.getTime() - (index + 1) * 150_000).toISOString(),
  };
}

/**
 * Fetch real chart-bearing historical agents (most recently active first) and
 * compose a resonant recipe for each. Degrades to [] on failure.
 */
export async function getHistoricalAgentRecipes(
  limit = 24,
  now: Date = new Date(),
): Promise<RecipePostFeedItem[]> {
  try {
    const result = await executeQuery<HistoricalAgentRow>(
      `SELECT u.id AS actor_id,
              u.email,
              up.name,
              up.dominant_element,
              up.natal_positions
         FROM users u
         JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN feed_events f ON f.actor_id = u.id
        WHERE COALESCE(u.is_agent, false) = true
          AND COALESCE(u.is_active, true) = true
          AND (
                (up.natal_positions IS NOT NULL AND up.natal_positions::text NOT IN ('[]', 'null', '{}'))
             OR (up.natal_chart     IS NOT NULL AND up.natal_chart::text     NOT IN ('{}', 'null'))
             OR (up.birth_data      IS NOT NULL AND up.birth_data::text      NOT IN ('{}', 'null'))
              )
        GROUP BY u.id, u.email, up.name, up.dominant_element, up.natal_positions
        ORDER BY MAX(f.created_at) DESC NULLS LAST
        LIMIT $1`,
      [limit],
    );
    return result.rows.map((row, index) => mapAgentToRecipePost(row, index, now));
  } catch (error) {
    _logger.error("[historicalAgentFeed] recipe query failed:", error);
    return [];
  }
}

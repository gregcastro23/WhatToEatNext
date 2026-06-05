/**
 * Historical-agent feed — REAL internal data source.
 *
 * Produces `recipe_post` contract items from WTEN's own database: recipe-type
 * `feed_events` authored by agents (`is_agent = true`) that actually have a
 * birthchart (non-empty `user_profiles.natal_chart` / `birth_data`). That
 * birthchart gate is the same "historical agent" definition the commensal
 * companions route already uses, and it is exactly the contract's
 * `agent.kind === "historical" && agent.hasBirthchart === true` rule — so
 * chart-less ("planetary") agents are naturally excluded.
 *
 * `yield_claim` items are NOT produced here: a historical agent claiming yield
 * from a planetary agent is a cross-network event owned by Planetary Agents.
 * Those arrive via PA once `PA_HISTORICAL_FEED_URL` is wired.
 *
 * Sourcing + serialization only — no alchemical / ESMS / formula logic.
 */

import { executeQuery } from "@/lib/database";
import {
  type EsmsTag,
  type FeedAgentBirthchart,
  type FeedElement,
  type RecipePostFeedItem,
} from "@/lib/feed/historicalAgentFeed";
import { _logger } from "@/lib/logger";
import type { NatalChart } from "@/types/natalChart";
import { extractPlanetaryPositions } from "@/utils/astrology/chartDataUtils";

/** Feed event types that represent an agent posting a recipe. */
const RECIPE_EVENT_TYPES = ["recipe_generation"];

const ESMS_TAGS: EsmsTag[] = ["Spirit", "Essence", "Matter", "Substance"];
const ELEMENTS: FeedElement[] = ["Fire", "Water", "Earth", "Air"];

export interface AgentRecipeEventRow {
  id: string;
  actor_id: string;
  metadata_payload: unknown;
  created_at: string | Date;
  email: string | null;
  name: string | null;
  dominant_element: string | null;
  natal_chart: unknown;
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
  return candidate && typeof candidate === "object" && !Array.isArray(candidate)
    ? (candidate as Record<string, unknown>)
    : {};
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

/** Derive a {sun, moon, ascendant} birthchart from a stored natal_chart. */
export function birthchartFromNatalChart(natalChart: unknown): FeedAgentBirthchart | undefined {
  const chart = asRecord(natalChart);
  if (Object.keys(chart).length === 0) return undefined;

  let positions: Record<string, string> = {};
  try {
    positions = extractPlanetaryPositions(chart as unknown as NatalChart);
  } catch {
    positions = {};
  }

  const sun = str(positions.Sun);
  const moon = str(positions.Moon);
  const ascendant =
    str(chart.ascendant) ?? str(chart.rising) ?? str(positions.Ascendant) ?? str(positions.Rising);

  const birthchart: FeedAgentBirthchart = {};
  if (sun) birthchart.sun = sun;
  if (moon) birthchart.moon = moon;
  if (ascendant) birthchart.ascendant = ascendant;
  return Object.keys(birthchart).length > 0 ? birthchart : undefined;
}

/**
 * Pure mapper: a recipe-type agent feed_event row → a `recipe_post` item.
 * Exported for unit testing (no DB).
 */
export function mapAgentRecipeEventToPost(row: AgentRecipeEventRow): RecipePostFeedItem {
  const meta = asRecord(row.metadata_payload);
  const signature = asRecord(meta.planetarySignature);
  const emailLocal =
    typeof row.email === "string" && row.email.includes("@")
      ? row.email.split("@")[0]
      : undefined;

  const recipeName = str(meta.recipeName) ?? str(meta.recipe_name) ?? "a new recipe";
  const recipeId = str(meta.recipeId) ?? str(meta.recipe_id);
  const birthchart = birthchartFromNatalChart(row.natal_chart);
  const element = pickElement(signature.dominantElement) ?? pickElement(row.dominant_element);
  const esmsTag = pickEsms(signature.esmsTag) ?? pickEsms(signature.sacredStat);
  const planetaryHour = str(signature.planetaryHour) ?? str(signature.dominantPlanet);

  return {
    id: row.id,
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
      ...(recipeId ? { id: recipeId } : {}),
    },
    ...(planetaryHour ? { planetaryHour } : {}),
    ...(esmsTag ? { esmsTag } : {}),
    ...(element ? { element } : {}),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/**
 * Fetch real historical-agent recipe posts from the database, newest first.
 * Degrades to an empty array on any failure (graceful empty feed).
 */
export async function getHistoricalAgentRecipePosts(
  limit = 40,
): Promise<RecipePostFeedItem[]> {
  try {
    const result = await executeQuery<AgentRecipeEventRow>(
      `SELECT f.id,
              f.actor_id,
              f.metadata_payload,
              f.created_at,
              u.email,
              up.name,
              up.dominant_element,
              up.natal_chart
         FROM feed_events f
         JOIN users u ON u.id = f.actor_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE COALESCE(u.is_agent, false) = true
          AND COALESCE(u.is_active, true) = true
          AND f.event_type = ANY($2::text[])
          AND (
                (up.natal_chart IS NOT NULL AND up.natal_chart::text NOT IN ('{}', 'null'))
             OR (up.birth_data  IS NOT NULL AND up.birth_data::text  NOT IN ('{}', 'null'))
              )
        ORDER BY f.created_at DESC
        LIMIT $1`,
      [limit, RECIPE_EVENT_TYPES],
    );

    return result.rows.map(mapAgentRecipeEventToPost);
  } catch (error) {
    _logger.error("[historicalAgentFeed] internal DB query failed:", error);
    return [];
  }
}

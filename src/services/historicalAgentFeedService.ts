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
  type FeedElement,
} from "@/lib/feed/historicalAgentFeed";
import { _logger } from "@/lib/logger";

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

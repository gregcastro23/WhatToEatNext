/**
 * Historical-agent Live Network Feed — shared contract types + sourcing rule.
 *
 * These shapes mirror the cross-project contract produced by the Planetary
 * Agents (PA) session. They are ADDITIVE: they do not touch the existing
 * `feed_events` / {@link import("@/services/feedDatabaseService").FeedEvent}
 * pipeline (which still carries human-alchemist activity), and they touch none
 * of the alchemical / elemental / ESMS formula logic — this module is feed
 * sourcing + presentation typing only.
 *
 * Contract (reconcile field names with the PA session if it reports different):
 *
 *   recipe_post (historical agent, hasBirthchart: true only):
 *     { id, type: "recipe_post",
 *       agent: { id, name, kind: "historical", hasBirthchart: true,
 *                birthchart: { sun, moon, ascendant, ... } },
 *       recipe: { name, elements: { Fire/Water/Earth/Air } },
 *       planetaryHour, esmsTag, element, createdAt }
 *
 *   yield_claim (historical agent claims from a planetary agent):
 *     { id, type: "yield_claim", historicalAgentId, planetaryAgentId,
 *       amount, createdAt }
 */

/** Elemental keys used across the feed contract. */
export type FeedElement = "Fire" | "Water" | "Earth" | "Air";

/** ESMS pillar tags. */
export type EsmsTag = "Spirit" | "Essence" | "Matter" | "Substance";

/** Agent kind discriminator introduced by the PA contract. */
export type FeedAgentKind = "historical" | "planetary";

/**
 * Birthchart payload is intentionally open-ended — the contract lists
 * "sun, moon, ascendant, ..." without fixing the full set. We surface a few
 * well-known placements and tolerate any additional string/number fields.
 */
export interface FeedAgentBirthchart {
  sun?: string;
  moon?: string;
  ascendant?: string;
  [placement: string]: string | number | undefined;
}

export interface FeedAgentRef {
  id: string;
  name: string;
  kind: FeedAgentKind;
  hasBirthchart: boolean;
  birthchart?: FeedAgentBirthchart;
  /** Optional PA chat slug, if the producer supplies one (additive — not in the base contract). */
  slug?: string;
}

export interface RecipePostFeedItem {
  id: string;
  type: "recipe_post";
  agent: FeedAgentRef;
  recipe: {
    name: string;
    elements?: Partial<Record<FeedElement, number>>;
    /** Optional recipe permalink id, if supplied (additive). */
    id?: string;
  };
  planetaryHour?: string;
  esmsTag?: EsmsTag;
  element?: FeedElement;
  createdAt: string;
}

export interface YieldClaimFeedItem {
  id: string;
  type: "yield_claim";
  historicalAgentId: string;
  planetaryAgentId: string;
  amount: number;
  createdAt: string;
  /**
   * Display names are NOT in the base contract (which carries only IDs).
   * Optional + additive: the producer may supply them, otherwise the UI
   * degrades to a generic label. Reconcile with the PA session if it later
   * standardizes name fields.
   */
  historicalAgentName?: string;
  planetaryAgentName?: string;
}

/**
 * WTEN-internal item: a historical agent's real feed activity (insight, lab
 * experiment, recipe, …) rendered via the shared narration + its planetary
 * signature. Distinct from the PA `recipe_post` contract because historical
 * agents predominantly post insights/experiments, not literal recipes.
 */
export interface AgentEventFeedItem {
  id: string;
  type: "agent_event";
  agent: FeedAgentRef;
  /** Past-tense narrated phrase, e.g. `channeled an alchemical insight: "…"`. */
  action: string;
  /** Optional narrated link (e.g. a recipe permalink). */
  href?: string;
  /** Leading glyph from the narration. */
  icon: string;
  element?: FeedElement;
  esmsTag?: EsmsTag;
  planetaryHour?: string;
  /** Formatted natal placements, e.g. ["Sun Aquarius", "Moon Sagittarius"]. */
  natalSignature?: string[];
  createdAt: string;
}

export type HistoricalAgentFeedItem =
  | RecipePostFeedItem
  | YieldClaimFeedItem
  | AgentEventFeedItem;

/**
 * The feed-sourcing rule:
 *   - recipe_post  → keep ONLY historical agents that have a birthchart.
 *   - yield_claim  → keep (historical → planetary by definition).
 *   - everything else (e.g. planetary-agent posts) → drop.
 *
 * Applied on every path (fixture and real producer) so neither a hand-written
 * mock nor a drifting upstream can leak excluded items into the feed.
 */
export function filterHistoricalAgentFeed(
  items: HistoricalAgentFeedItem[],
): HistoricalAgentFeedItem[] {
  return items.filter((item) => {
    if (item.type === "recipe_post" || item.type === "agent_event") {
      return item.agent.kind === "historical" && item.agent.hasBirthchart === true;
    }
    if (item.type === "yield_claim") {
      return true;
    }
    return false;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Runtime narrowing for a single item from an untrusted producer response.
 * Validates the minimum fields the UI relies on; anything malformed is dropped.
 */
export function isHistoricalAgentFeedItem(value: unknown): value is HistoricalAgentFeedItem {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.createdAt !== "string") return false;

  if (value.type === "recipe_post") {
    const agent = value.agent;
    const recipe = value.recipe;
    return (
      isRecord(agent) &&
      typeof agent.id === "string" &&
      typeof agent.name === "string" &&
      typeof agent.kind === "string" &&
      typeof agent.hasBirthchart === "boolean" &&
      isRecord(recipe) &&
      typeof recipe.name === "string"
    );
  }

  if (value.type === "yield_claim") {
    return (
      typeof value.historicalAgentId === "string" &&
      typeof value.planetaryAgentId === "string" &&
      typeof value.amount === "number"
    );
  }

  if (value.type === "agent_event") {
    const agent = value.agent;
    return (
      isRecord(agent) &&
      typeof agent.id === "string" &&
      typeof agent.name === "string" &&
      typeof agent.kind === "string" &&
      typeof agent.hasBirthchart === "boolean" &&
      typeof value.action === "string" &&
      typeof value.icon === "string"
    );
  }

  return false;
}

/** Coerce an untrusted producer payload into a clean, well-typed item list. */
export function coerceFeedItems(raw: unknown): HistoricalAgentFeedItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isHistoricalAgentFeedItem);
}

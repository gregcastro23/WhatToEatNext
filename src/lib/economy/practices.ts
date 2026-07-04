/**
 * The practice catalog — the invisible reward layer's rulebook.
 *
 * A "practice" is a natural product action that quietly earns ESMS: no quest
 * UI advertises it; the reward reveals itself as a delight toast the moment it
 * happens. Each practice maps to ONE coin (the act's alchemical nature), has a
 * dedupe scope (how often the same act can pay), a per-day rewarded cap, and a
 * pool of causal hint lines for the toast.
 *
 * PR2 note: `baseAmount` is the flat testbed rate. The transit-modulated
 * multiplier and per-user celestial budget slot in at
 * practiceRewardService.computeReward() without touching this catalog.
 */

import type { TokenType } from "@/types/economy";

export type PracticeType =
  | "cooked_recipe"
  | "photo_added"
  | "recommendation_acted"
  | "feed_visit"
  | "feed_reaction"
  | "chat_joined"
  | "surface_discovered";

export type DedupeScope = "daily" | "ever";

export interface PracticeDefinition {
  type: PracticeType;
  /** The coin this act transmutes into (cooking = Matter, social = Spirit…). */
  tokenType: TokenType;
  baseAmount: number;
  /** How often the same (user, target) can be rewarded. */
  dedupe: DedupeScope;
  /** Max rewarded events of this type per user per day (0-amount rows still record past the cap). */
  dailyCap: number;
  /** Whether a targetId is required to scope the dedupe key. */
  requiresTarget: boolean;
  /** Causal lines for the delight toast — rotated deterministically. */
  hints: string[];
}

export const PRACTICES: Record<PracticeType, PracticeDefinition> = {
  cooked_recipe: {
    type: "cooked_recipe",
    tokenType: "Matter",
    baseAmount: 4,
    dedupe: "daily",
    dailyCap: 3,
    requiresTarget: true,
    hints: [
      "The Work remembers what your hands made",
      "Matter answers to a lit stove",
      "A dish cooked is a spell completed",
      "The kitchen is the true athanor",
    ],
  },
  photo_added: {
    type: "photo_added",
    tokenType: "Matter",
    baseAmount: 2,
    dedupe: "ever",
    dailyCap: 3,
    requiresTarget: true,
    hints: [
      "Proof of the Work, sealed in light",
      "The plate, witnessed",
    ],
  },
  recommendation_acted: {
    type: "recommendation_acted",
    tokenType: "Essence",
    baseAmount: 1,
    dedupe: "daily",
    dailyCap: 5,
    requiresTarget: true,
    hints: [
      "You followed the current — Essence flows",
      "The stars suggested; you listened",
      "Alignment tastes better when acted on",
    ],
  },
  feed_visit: {
    type: "feed_visit",
    tokenType: "Spirit",
    baseAmount: 1,
    dedupe: "daily",
    dailyCap: 1,
    requiresTarget: false,
    hints: [
      "You joined the commons under today's sky",
      "Spirit gathers where alchemists meet",
    ],
  },
  feed_reaction: {
    type: "feed_reaction",
    tokenType: "Spirit",
    baseAmount: 0.5,
    dedupe: "ever",
    dailyCap: 3,
    requiresTarget: true,
    hints: [
      "A spark passed between charts",
      "Recognition is its own small ritual",
    ],
  },
  chat_joined: {
    type: "chat_joined",
    tokenType: "Spirit",
    baseAmount: 2,
    dedupe: "ever",
    dailyCap: 2,
    requiresTarget: true,
    hints: [
      "You took a seat beneath the transit",
      "The table under this sky welcomes you",
    ],
  },
  surface_discovered: {
    type: "surface_discovered",
    tokenType: "Substance",
    baseAmount: 2,
    dedupe: "ever",
    dailyCap: 4,
    requiresTarget: true,
    hints: [
      "A new chamber of the kitchen, unlocked",
      "Substance rewards the explorer",
      "The map grows as you walk it",
    ],
  },
};

/**
 * Practices that only SERVER code may recognize (via practiceRewardService
 * directly) — they hinge on a real data transition the server observes (e.g.
 * made_it flipping false→true). The public /api/economy/practice door rejects
 * them so a bare POST can't fake a cooked dish.
 */
export const SERVER_ONLY_PRACTICES: ReadonlySet<PracticeType> = new Set([
  "cooked_recipe",
  "photo_added",
]);

/**
 * Surfaces eligible for the once-ever discovery reward, keyed by the route's
 * first path segment (an allowlist so a client can't invent infinite
 * "surfaces"). Keep in sync with src/app's navigable top-level routes.
 */
export const DISCOVERABLE_SURFACES = new Set([
  "cuisines",
  "restaurants",
  "cosmic-recipe",
  "recipe-builder",
  "lab",
  "lab-book",
  "sauces",
  "cooking-methods",
  "planetary-chart",
  "feed",
  "shop",
  "account",
  "quantities",
  "menu-planner",
  "ingredients",
  "commensal",
  "pantry",
  "birth-chart",
]);

/** Deterministic hint rotation — stable per (user, day) so retries repeat the line. */
export function pickHint(def: PracticeDefinition, userId: string, dayKey: string): string {
  let h = 0;
  const s = `${userId}:${def.type}:${dayKey}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return def.hints[h % def.hints.length];
}

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
  | "surface_discovered"
  | "work_resonated"
  | "list_conjured"
  | "follow_made"
  | "first_follower_gained"
  | "visage_revealed";

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
  /** In-world description shown in the grimoire. */
  description: string;
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
    description:
      "Cook a dish and mark it made — the deepest transmutation, recipe into Matter.",
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
    description:
      "Seal proof of a finished Work in light; the plate, witnessed.",
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
    description:
      "Follow the day's alignment into a cuisine, recipe, or table — Essence flows to those who act on the sky's suggestion.",
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
    description:
      "Walk the commons where alchemists gather beneath a shared sky.",
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
    description:
      "Recognize the work of another practitioner — a spark passed between charts.",
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
    description:
      "Take a seat at a transit table when the sky calls your chart to it.",
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
    description:
      "Cross the threshold of a chamber of the kitchen you have never entered.",
  },
  work_resonated: {
    type: "work_resonated",
    tokenType: "Spirit",
    baseAmount: 1,
    dedupe: "ever",
    dailyCap: 3,
    requiresTarget: true,
    hints: [
      "Your work found its witnesses",
      "The commons tasted what you made",
      "A dish shared returns as Spirit",
    ],
    description:
      "Share a finished Work and let it resonate — when others spark to your dish, Spirit returns to its maker.",
  },
  list_conjured: {
    type: "list_conjured",
    tokenType: "Substance",
    baseAmount: 1,
    dedupe: "daily",
    dailyCap: 2,
    requiresTarget: true,
    hints: [
      "Provisions summoned to the door",
      "The pantry hears the call",
      "Substance follows a well-made list",
    ],
    description:
      "Conjure an ingredient order from a recipe or menu — the market answers those who prepare.",
  },
  follow_made: {
    type: "follow_made",
    tokenType: "Spirit",
    baseAmount: 0.5,
    dedupe: "ever",
    dailyCap: 5,
    requiresTarget: true,
    hints: [
      "A thread tied between charts",
      "You chose a fellow traveler of the sky",
    ],
    description:
      "Tie a thread to another practitioner's chart — Spirit gathers along the lines we choose to follow.",
  },
  first_follower_gained: {
    type: "first_follower_gained",
    tokenType: "Spirit",
    baseAmount: 2,
    dedupe: "ever",
    dailyCap: 1,
    requiresTarget: false,
    hints: [
      "Your table has found its first witness",
      "Someone now walks by your light",
    ],
    description:
      "The moment your work gains its first witness — a follower ties the first thread to your chart.",
  },
  visage_revealed: {
    type: "visage_revealed",
    tokenType: "Matter",
    baseAmount: 2,
    dedupe: "ever",
    dailyCap: 1,
    requiresTarget: false,
    hints: [
      "The alchemist steps from behind the sigil",
      "A face given to the Work",
    ],
    description:
      "Reveal your visage — set a true likeness where the sigil stood.",
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
  // Both sides of a reaction are recognized inside POST /api/feed/react —
  // the reaction ROW is the proof, a bare practice POST is not.
  "feed_reaction",
  "work_resonated",
  // Both sides of a follow are recognized inside POST /api/follows —
  // the follows ROW is the proof (created === true), a bare POST is not.
  "follow_made",
  "first_follower_gained",
  // Recognized inside POST /api/user/avatar — the avatar_url write is the proof.
  "visage_revealed",
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
  "tables",
  "pantry",
  "birth-chart",
  "grimoire",
]);

/** Deterministic hint rotation — stable per (user, day) so retries repeat the line. */
export function pickHint(def: PracticeDefinition, userId: string, dayKey: string): string {
  let h = 0;
  const s = `${userId}:${def.type}:${dayKey}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return def.hints[h % def.hints.length];
}

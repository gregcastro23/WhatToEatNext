/**
 * Historical Agent Culinary Persona Dietary Screening & Recipe Selection.
 *
 * Centralizes dietary screening (vegetarian, alliums, pork, alcohol, sugar)
 * and deterministic catalog recipe selection for historical thinkers.
 *
 * @file src/lib/recipes/historicalAgentPersona.ts
 */

import { createHash } from "node:crypto";
import { verifyRecipeContent } from "../cooking/recipeVerificationGate";
import type { Recipe } from "../../types/recipe";

export interface DietaryProfile {
  requiresVegetarian: boolean;
  avoidAlliums: boolean;
  avoidPork: boolean;
  avoidAlcohol: boolean;
  avoidRefinedSugar: boolean;
  bannedSubstrings: string[];
  favoriteKeywords: string[];
  culturalCuisine: string;
  dietaryPhilosophy: string;
}

const MEAT_SEAFOOD_TERMS = [
  "chicken", "beef", "pork", "lamb", "veal", "turkey", "duck", "bacon",
  "ham", "prosciutto", "pancetta", "salami", "sausage", "chorizo", "steak",
  "brisket", "venison", "rabbit", "fish", "salmon", "tuna", "cod", "halibut",
  "trout", "sardine", "anchov", "mackerel", "tilapia", "snapper", "sea bass",
  "shrimp", "prawn", "crab", "lobster", "scallop", "clam", "mussel", "oyster",
  "squid", "octopus", "calamari", "ceviche", "gelatin", "lard", "tallow",
];

const ALLIUM_TERMS = ["garlic", "onion", "shallot", "scallion", "leek", "chive"];
const PORK_TERMS = ["pork", "bacon", "ham", "prosciutto", "pancetta", "salami", "chorizo", "lard", "guanciale"];
const ALCOHOL_TERMS = [
  "wine", "beer", "ale", "stout", "rum", "brandy", "cognac", "vodka",
  "whiskey", "bourbon", "tequila", "mezcal", "liqueur", "champagne",
  "prosecco", "sake", "mirin", "sherry", "vermouth", "marsala", "kirsch",
];
const SUGAR_TERMS = [
  "white sugar", "granulated sugar", "powdered sugar",
  "confectioners", "frosting", "marshmallows", "corn syrup",
];

const VEGETARIAN_SLUGS = new Set([
  "leonardo-da-vinci", "mahatma-gandhi", "albert-einstein",
  "jean-jacques-rousseau-1712", "murasaki-shikibu",
  "siddhartha-gautama-buddha", "benjamin-franklin", "lao-tzu",
]);
const VEGETARIAN_HINTS = ["vegetarian", "excess meat", "heavy meats", "meat on fast days", "meat from animals"];
const PORK_FREE_SLUGS = new Set(["cleopatra", "ibn-sina-avicenna", "rumi", "hildegard-of-bingen"]);
const BANNED_BY_SLUG: Record<string, readonly string[]> = {
  "hildegard-of-bingen": ["strawberr", "leek"],
  "claude-monet-1840": ["margarine"],
};
const STOP_WORDS = new Set([
  "with", "and", "the", "from", "for", "fresh", "simple", "roasted",
  "boiled", "plain", "wild", "dish", "dishes", "food", "foods", "meal", "meals",
]);

function hasAnyTerm(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function extractStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((item): item is string => typeof item === "string");
}

function tokenizeKeywords(items: string[]): string[] {
  const tokens = new Set<string>();
  for (const item of items) {
    const cleaned = item.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/[^a-z\s]/g, " ");
    for (const word of cleaned.split(/\s+/)) {
      if (word.length >= 4 && !STOP_WORDS.has(word)) {
        tokens.add(word);
      }
    }
  }
  return Array.from(tokens);
}

/** Derive dietary guardrails and culinary affinities from a stored agent profile. */
export function deriveAgentDietaryProfile(
  slug: string,
  prefs: Record<string, unknown> | null,
): DietaryProfile {
  const avoidedJoined = extractStringArray(prefs?.avoidedFoods).join(" | ").toLowerCase();
  const culturalCuisine = typeof prefs?.culturalCuisine === "string" ? prefs.culturalCuisine : "Classical";
  const dietaryPhilosophy =
    typeof prefs?.dietaryPhilosophy === "string"
      ? prefs.dietaryPhilosophy
      : "Balanced culinary nourishment in harmony with natural temperament.";
  const philosophyLower = dietaryPhilosophy.toLowerCase();

  const requiresVegetarian =
    VEGETARIAN_SLUGS.has(slug) ||
    hasAnyTerm(avoidedJoined, VEGETARIAN_HINTS) ||
    hasAnyTerm(philosophyLower, ["lifelong vegetarian", "tomb for animals"]);

  return {
    requiresVegetarian,
    avoidAlliums: hasAnyTerm(avoidedJoined, ["garlic", "onion", "strong-smelling"]),
    avoidPork: requiresVegetarian || PORK_FREE_SLUGS.has(slug) || avoidedJoined.includes("pork"),
    avoidAlcohol: hasAnyTerm(avoidedJoined, ["alcohol", "intoxication", "drunken"]),
    avoidRefinedSugar: hasAnyTerm(avoidedJoined, ["refined sugar", "excess sugar", "sweets and pastries"]),
    bannedSubstrings: [...(BANNED_BY_SLUG[slug] ?? [])],
    favoriteKeywords: tokenizeKeywords([
      ...extractStringArray(prefs?.favoriteFoods),
      ...extractStringArray(prefs?.staples),
    ]),
    culturalCuisine,
    dietaryPhilosophy,
  };
}

/** Flatten recipe name and ingredients into lowercase searchable text. */
export function recipeTextBlob(recipe: Recipe): string {
  const ingNames = recipe.ingredients.map((i) => i.name.toLowerCase()).join(" | ");
  return `${recipe.name.toLowerCase()} | ${ingNames}`;
}

/** Verify a recipe strictly satisfies the historical persona's dietary ethics. */
export function isRecipeCompliantForAgent(
  recipe: Recipe,
  profile: DietaryProfile,
): boolean {
  if (recipe.ingredients.length < 3 || recipe.instructions.length === 0) return false;
  const blob = recipeTextBlob(recipe);

  if (profile.requiresVegetarian) {
    if (hasAnyTerm(blob, MEAT_SEAFOOD_TERMS)) return false;
    const gate = verifyRecipeContent(
      {
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          quantity: String(i.amount || 1),
          unit: i.unit || "unit",
        })),
        steps: recipe.instructions.map((instruction) => ({ instruction })),
      },
      { requestedDiet: "vegetarian" },
    );
    if (!gate.valid || gate.audit.nonCompliantDietItems.length > 0) return false;
  }

  if (profile.avoidAlliums && hasAnyTerm(blob, ALLIUM_TERMS)) return false;
  if (profile.avoidPork && hasAnyTerm(blob, PORK_TERMS)) return false;
  if (profile.avoidAlcohol && hasAnyTerm(blob, ALCOHOL_TERMS)) return false;
  if (profile.avoidRefinedSugar && hasAnyTerm(blob, SUGAR_TERMS)) return false;
  return !hasAnyTerm(blob, profile.bannedSubstrings);
}

/** Deterministic integer hash from SHA-256 prefix for fair selection rotation. */
export function deterministicHashInt(input: string): number {
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16);
}

/** Deterministically pick diverse compliant catalog recipes preferring sparse coverage. */
export function selectRecipesForAgent(
  slug: string,
  profile: DietaryProfile,
  catalog: readonly Recipe[],
  count: number,
  usedCounts: Map<string, number>,
  salt = "",
): Recipe[] {
  const scored = catalog
    .filter((r) => isRecipeCompliantForAgent(r, profile))
    .map((recipe) => {
      const blob = recipeTextBlob(recipe);
      const keywordHits = profile.favoriteKeywords.reduce(
        (acc, kw) => (blob.includes(kw) ? acc + 1 : acc),
        0,
      );
      return {
        recipe,
        usagePenalty: usedCounts.get(recipe.id) ?? 0,
        keywordScore: Math.min(keywordHits, 3),
        hashRank: deterministicHashInt(`${slug}:${recipe.id}:${salt}`),
      };
    });

  scored.sort((a, b) => {
    if (a.usagePenalty !== b.usagePenalty) return a.usagePenalty - b.usagePenalty;
    if (b.keywordScore !== a.keywordScore) return b.keywordScore - a.keywordScore;
    return a.hashRank - b.hashRank;
  });

  return scored.slice(0, count).map((s) => s.recipe);
}

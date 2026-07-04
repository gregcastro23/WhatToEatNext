// src/utils/ingredientResolution.ts
//
// Shared free-text → catalog ingredient resolver.
//
// Recipe ingredient names (and other free-text references) are messy
// ("extra virgin olive oil", "eggs", "minced garlic", "pinch sea salt",
// "1-2 tablespoons vanilla"). The catalog keys are clean ("Olive Oil",
// "Chicken Egg", "garlic", "sea salt"). An exact-match lookup resolves under
// half of all recipe ingredient occurrences.
//
// This resolver closes that gap with conservative normalization: strip leading
// quantities/units, take the first option of "X or Y", drop preparation
// adjectives, singularize, then match by exact-normalized form and finally by
// token-subset (every word of the query noun-phrase present in the catalog
// entry). Token-subset matching is whole-word, so "egg" resolves "Chicken Egg"
// but "rice" never resolves "ice".
//
// Originally lived inside `ingredientNutritionAggregation.ts` (added in #555 for
// recipe nutrition). Lifted here so other consumers — notably
// `UnifiedIngredientService.getIngredientByName`, which backs the ESMS
// `matchRate` in `hierarchicalRecipeCalculations.ts` — can share it. Exact
// matches always win first, so adopting it only ever turns a previous miss into
// a hit (monotonic).

import { unifiedIngredients } from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";

/** Preparation/qualifier words that carry no identity and should be dropped. */
const PREP_WORDS = new Set([
  "pinch", "dash", "large", "small", "medium", "fresh", "freshly", "dried",
  "ground", "minced", "chopped", "diced", "sliced", "grated", "melted",
  "toasted", "warm", "boiling", "cold", "hot", "ripe", "raw", "cooked",
  "whole", "blanched", "peeled", "crushed", "extra", "virgin", "of", "a",
  "finely", "roughly", "thinly", "thick", "thin", "light", "dark", "plain",
  "pure", "organic", "free", "range", "boneless", "skinless", "unsalted",
  "granulated", "packed", "softened", "beaten", "cubed", "shredded", "halved",
  "quartered", "seeded", "stemmed", "trimmed", "rinsed", "drained", "to",
  "taste", "and",
]);

/** Common irregular plurals worth handling explicitly. */
const IRREGULAR_PLURALS: Record<string, string> = {
  leaves: "leaf",
  loaves: "loaf",
  halves: "half",
  knives: "knife",
  potatoes: "potato",
  tomatoes: "tomato",
};

export function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    // Treat underscores like spaces: some catalog `name` fields carry the slug
    // form ("rice_vinegar") instead of the human name, which would otherwise
    // never resolve against space-separated free-text.
    .replace(/_/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip a leading quantity + optional unit fragment ("1-2 tablespoons ..."). */
function stripLeadingQuantity(s: string): string {
  return s.replace(
    /^[-\d/.\s]+(tablespoons?|teaspoons?|tbsp|tsp|cups?|grams?|g|kg|oz|ounces?|lb|lbs?|pounds?|ml|l|cloves?|pieces?|slices?|pinch(?:es)?)?\b/i,
    " ",
  );
}

function singularizeWord(w: string): string {
  if (IRREGULAR_PLURALS[w]) return IRREGULAR_PLURALS[w];
  if (w.length <= 3) return w;
  if (w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ves")) return `${w.slice(0, -3)}f`;
  if (w.endsWith("oes")) return w.slice(0, -2);
  if (/(ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

/** Produce the cleaned core noun-phrase tokens for a free-text ingredient name. */
function coreTokens(name: string): string[] {
  let base = normName(stripLeadingQuantity(name));
  // "X or Y" / "X and Y" → take the first option.
  base = base.split(/\b(?:or)\b/)[0].trim();
  return base
    .split(" ")
    .filter((w) => w && !PREP_WORDS.has(w))
    .map(singularizeWord);
}

interface TokenEntry {
  tokens: Set<string>;
  count: number;
  ingredient: UnifiedIngredient;
}

let exactIndex: Map<string, UnifiedIngredient> | null = null;
let tokenIndex: TokenEntry[] | null = null;

function buildIndex(): void {
  exactIndex = new Map();
  tokenIndex = [];
  for (const ingredient of Object.values(unifiedIngredients)) {
    const name = ingredient?.name;
    if (typeof name !== "string" || !name) continue;
    const norm = normName(name);
    if (!exactIndex.has(norm)) exactIndex.set(norm, ingredient);
    const singular = norm.split(" ").map(singularizeWord).join(" ");
    if (!exactIndex.has(singular)) exactIndex.set(singular, ingredient);
    const tokens = new Set(coreTokens(name));
    if (tokens.size > 0) {
      tokenIndex.push({ tokens, count: tokens.size, ingredient });
    }
  }
  // Second pass: authored aliases ("shoyu" → soy sauce). Indexed after every
  // display name so an alias can never shadow another ingredient's real name.
  for (const ingredient of Object.values(unifiedIngredients)) {
    const aliases = (ingredient as { aliases?: unknown }).aliases;
    if (!Array.isArray(aliases)) continue;
    for (const alias of aliases) {
      if (typeof alias !== "string" || !alias) continue;
      const norm = normName(alias);
      if (!exactIndex.has(norm)) exactIndex.set(norm, ingredient);
      const singular = norm.split(" ").map(singularizeWord).join(" ");
      if (!exactIndex.has(singular)) exactIndex.set(singular, ingredient);
      const tokens = new Set(coreTokens(alias));
      if (tokens.size > 0) {
        tokenIndex.push({ tokens, count: tokens.size, ingredient });
      }
    }
  }
  // Stable order so token-subset ties resolve deterministically (fewest tokens,
  // then alphabetical) regardless of catalog iteration order.
  tokenIndex.sort((a, b) =>
    a.count !== b.count
      ? a.count - b.count
      : a.ingredient.name.localeCompare(b.ingredient.name),
  );
}

/**
 * Resolve a free-text ingredient name to a catalog ingredient.
 * Exact-normalized matches always win (preserving prior behavior); the
 * normalization fallbacks only ever turn a previous miss into a hit.
 */
export function resolveIngredientByName(
  name: string | undefined | null,
): UnifiedIngredient | undefined {
  if (!name || typeof name !== "string") return undefined;
  if (!exactIndex || !tokenIndex) buildIndex();
  const idx = exactIndex!;

  const norm = normName(name);
  const exact = idx.get(norm);
  if (exact) return exact;

  const tokens = coreTokens(name);
  if (tokens.length === 0) return undefined;

  const cleaned = tokens.join(" ");
  const cleanedHit = idx.get(cleaned);
  if (cleanedHit) return cleanedHit;

  // Token-subset: every query token must appear (whole-word) in the candidate.
  const query = new Set(tokens);
  for (const entry of tokenIndex!) {
    let all = true;
    for (const t of query) {
      if (!entry.tokens.has(t)) {
        all = false;
        break;
      }
    }
    if (all) return entry.ingredient;
  }

  // Compound lines ("sea salt and pepper to taste") resolve as their first
  // item. Query-side only — indexed catalog names keep their full identity —
  // and last, so it can only turn a miss into a hit.
  const firstSegment = name.split(/\s+and\s+/i)[0];
  if (firstSegment && firstSegment.trim() && firstSegment !== name) {
    return resolveIngredientByName(firstSegment);
  }
  return undefined;
}

/** Test-only hook: drop the memoized indexes so a fresh catalog is reindexed. */
export function __resetIngredientResolutionIndex(): void {
  exactIndex = null;
  tokenIndex = null;
}

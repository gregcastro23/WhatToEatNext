/**
 * Runtime accessors for the generated ingredient → recipe index.
 *
 * The JSON payload is produced by `scripts/buildIngredientRecipeIndex.ts` and
 * committed at `src/data/generated/ingredientRecipeIndex.json`. Regenerate it
 * whenever cuisines or ingredient slugs change:
 *
 *   yarn build:ingredient-recipe-index
 *
 * This module exposes O(1) lookups from an ingredient slug (or display name)
 * to the list of recipes that reference it, with the raw ingredient text and
 * measurement pulled verbatim from the recipe.
 */

import rawIndex from "./generated/ingredientRecipeIndex.json";

export interface IngredientRecipeMatch {
  recipeId: string;
  recipeName: string;
  cuisine: string;
  rawIngredientName: string;
  amount?: number | string;
  unit?: string;
}

type IngredientRecipeIndex = Record<string, IngredientRecipeMatch[]>;

function normalizeIngredientInput(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/_/g, " ")
    .replace(/\bgruye re\b/g, "gruyere")
    .replace(/\bgruy re\b/g, "gruyere")
    .replace(/\bcre me\b/g, "creme")
    .replace(/\bcr me\b/g, "creme")
    .replace(/\bpa tissie re\b/g, "patissiere")
    .replace(/\bp tissie re\b/g, "patissiere")
    .replace(/\bp tissi re\b/g, "patissiere")
    .replace(/\bjalapen os\b/g, "jalapenos")
    .replace(/\bjalape os\b/g, "jalapenos")
    .replace(/\bnu o c\b/g, "nuoc")
    .replace(/\bn c\b/g, "nuoc")
    .replace(/\bma m\b/g, "mam")
    .replace(/\bthi t\b/g, "thit")
    .replace(/\bla u\b/g, "lau")
    .replace(/\bcha o\b/g, "chao")
    .replace(/\bch o\b/g, "chao")
    .replace(/\bpa te\b/g, "pate")
    .replace(/\bba nh mi\b/g, "banh mi")
    .replace(/\bb nh\b/g, "banh")
    .replace(/\bo p la\b/g, "op la")
    .replace(/\bm p la\b/g, "mi op la")
    .replace(/\bmi p la\b/g, "mi op la")
    .replace(/\bt u\b/g, "tau")
    .replace(/\bth i\b/g, "thai")
    .replace(/\bqua y\b/g, "quay")
    .replace(/\bqu y\b/g, "quay")
    .replace(/\bche ba ma u\b/g, "che ba mau")
    .replace(/\bch ba m u\b/g, "che ba mau")
    .replace(/\bch m\b/g, "cham")
    .replace(/\bm u\b/g, "mau")
    .replace(/foundation of th t kho t u/g, "thit kho tau")
    .replace(/foundation of l u th i/g, "lau thai")
    .replace(/\bcha lu a\b/g, "cha lua")
    .replace(/\s+/g, " ")
    .trim();
}

function toSlug(value: string): string {
  return normalizeIngredientInput(value).replace(/\s+/g, "_");
}

function assertIndexPayload(payload: unknown): IngredientRecipeIndex {
  if (!payload || typeof payload !== "object") return {};
  const out: IngredientRecipeIndex = {};
  for (const [key, val] of Object.entries(payload as Record<string, unknown>)) {
    if (!Array.isArray(val)) continue;
    out[key] = val.filter((row) => {
      if (!row || typeof row !== "object") return false;
      const cast = row as Record<string, unknown>;
      return (
        typeof cast.recipeId === "string" &&
        typeof cast.recipeName === "string" &&
        typeof cast.cuisine === "string" &&
        typeof cast.rawIngredientName === "string"
      );
    }) as IngredientRecipeMatch[];
  }
  return out;
}

const INDEX = assertIndexPayload(rawIndex);
const INDEX_KEYS = new Set(Object.keys(INDEX));

const ALIAS_TO_SLUG = (() => {
  const map = new Map<string, string>();
  for (const slug of INDEX_KEYS) {
    const norm = normalizeIngredientInput(slug);
    const singular =
      norm.endsWith("ies") && norm.length > 4
        ? `${norm.slice(0, -3)}y`
        : norm.endsWith("es") && norm.length > 3
          ? norm.slice(0, -2)
          : norm.endsWith("s") && norm.length > 2
            ? norm.slice(0, -1)
            : norm;
    map.set(norm, slug);
    map.set(singular, slug);
  }
  return map;
})();

/**
 * Resolve a canonical index slug from a user-facing ingredient input.
 * Returns null when no slug can be resolved.
 */
export function resolveIngredientSlug(input: string): string | null {
  if (!input) return null;
  const normalized = normalizeIngredientInput(input);
  const candidates = new Set<string>();
  candidates.add(normalized);
  if (normalized.startsWith("foundation of ")) candidates.add(normalized.replace(/^foundation of\s+/, ""));
  if (normalized.startsWith("warm ")) candidates.add(normalized.replace(/^warm\s+/, ""));
  if (normalized.startsWith("caramel sauce ")) candidates.add(normalized.replace(/^caramel sauce\s+/, ""));
  const splitOr = normalized.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
  if (splitOr.length > 1) {
    for (const p of splitOr) candidates.add(p);
  }

  for (const candidateInput of candidates) {
    const slug = toSlug(candidateInput);
    if (INDEX_KEYS.has(slug)) return slug;

    const byAlias = ALIAS_TO_SLUG.get(candidateInput);
    if (byAlias) return byAlias;

    // Containment fallback for prefixed names like "fresh pandan leaves"
    for (const [alias, candidate] of ALIAS_TO_SLUG.entries()) {
      if (alias.length < 3) continue;
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
      if (re.test(candidateInput)) return candidate;
    }
  }
  return null;
}

/**
 * Return every recipe reference for an ingredient slug.
 * Returns [] for unknown slugs.
 */
export function getRecipesForIngredient(slug: string): IngredientRecipeMatch[] {
  const resolved = resolveIngredientSlug(slug) ?? slug;
  return INDEX[resolved] ?? [];
}

/**
 * Convenience — how many recipes reference this ingredient.
 */
export function getRecipeCountForIngredient(slug: string): number {
  return getRecipesForIngredient(slug).length;
}

/**
 * Return recipes grouped by cuisine for an ingredient slug.
 * Useful for UI that shows "Italian: 4 recipes, Thai: 2 recipes, …".
 */
export function getRecipesByCuisineForIngredient(
  slug: string,
): Record<string, IngredientRecipeMatch[]> {
  const matches = getRecipesForIngredient(slug);
  const grouped: Record<string, IngredientRecipeMatch[]> = {};
  for (const m of matches) {
    (grouped[m.cuisine] ??= []).push(m);
  }
  return grouped;
}

/**
 * Full index — prefer the accessor functions above; this is exposed for
 * bulk operations and tests.
 */
export function getIngredientRecipeIndex(): IngredientRecipeIndex {
  return INDEX;
}

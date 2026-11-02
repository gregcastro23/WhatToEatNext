/**
 * What the recipes page needs to narrow the catalog it already holds: a search
 * over the recipes in memory and the cuisine pills, with counts.
 *
 * Pure and client-safe. The cuisine match itself is `filterRecipes` from
 * catalogQuery, the function the API route runs, so a pill and a
 * `/api/recipes?cuisine=` request select the same recipes.
 */
import { cuisineKey, haystackOf } from "@/lib/recipes/catalogQuery";
import type { Recipe } from "@/types/recipe";

/** "Middle Eastern" → "middle-eastern": the form /cuisines links and /recipes?cuisine= use. */
export function cuisineSlugOf(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Letters with no accent to strip, as people type them without the letter. */
const FOLDED_LETTERS = new Map([
  ["œ", "oe"],
  ["æ", "ae"],
  ["ß", "ss"],
  ["ø", "o"],
  ["đ", "d"],
  ["ł", "l"],
  ["ı", "i"],
]);

/**
 * Lower case, accents removed, apostrophes dropped and œ æ ß ø đ ł ı folded to
 * ASCII, so "jalapeno" finds "Jalapeño", "boeuf" finds "Bœuf" and "shepherds
 * pie" or "shepherd's pie" finds "SHEPHERD’S PIE" (U+2019 is what the catalog
 * holds and nobody types).
 */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['‘’]/g, "")
    .replace(/[œæßøđłı]/g, (letter) => FOLDED_LETTERS.get(letter) ?? letter);
}

/**
 * "middle eastern" → "Middle Eastern". The bundled catalog spells cuisines in
 * lower case and live rows in Title Case; a pill takes the first spelling it
 * meets, so without this its label would follow the sort order.
 */
function titleCase(name: string): string {
  return name.replace(/(^|[\s-])(\p{L})/gu, (_match, boundary: string, letter: string) => boundary + letter.toUpperCase());
}

const haystacks = new WeakMap<Recipe, string>();

function normalizedHaystack(recipe: Recipe): string {
  let text = haystacks.get(recipe);
  if (text === undefined) {
    text = normalizeText(haystackOf(recipe));
    haystacks.set(recipe, text);
  }
  return text;
}

/**
 * The recipes that contain every word of the query (in the name, description,
 * cuisine or an ingredient name), in their original order. A blank query
 * selects everything, and returns the same array.
 */
export function searchRecipes(recipes: readonly Recipe[], query: string): readonly Recipe[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return recipes;
  return recipes.filter((recipe) => {
    const text = normalizedHaystack(recipe);
    return words.every((word) => text.includes(word));
  });
}

export interface CuisineFacet {
  /** Letters and digits only: compares equal across "Middle Eastern", "middle-eastern" and "MiddleEastern". */
  key: string;
  name: string;
  slug: string;
  /** Recipes of this cuisine in the whole catalog. */
  total: number;
  /** Of those, the ones in `matching` (the current search). */
  matching: number;
}

/**
 * Every cuisine in `all`, biggest first, with how many of its recipes are in
 * `matching`. A recipe with no cuisine belongs to no pill; "All" still shows it.
 */
export function cuisineFacets(all: readonly Recipe[], matching: readonly Recipe[]): CuisineFacet[] {
  const facets = new Map<string, CuisineFacet>();
  for (const recipe of all) {
    const name = recipe.cuisine?.trim();
    if (!name) continue;
    const key = cuisineKey(name);
    if (key === "") continue;
    const facet = facets.get(key);
    if (facet) facet.total += 1;
    else facets.set(key, { key, name: titleCase(name), slug: cuisineSlugOf(name), total: 1, matching: 0 });
  }
  for (const recipe of matching) {
    const key = cuisineKey(recipe.cuisine ?? "");
    const facet = facets.get(key);
    if (facet) facet.matching += 1;
  }
  return [...facets.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

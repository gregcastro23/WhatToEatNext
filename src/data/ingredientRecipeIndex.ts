/**
 * Runtime accessors for the generated ingredient → recipe index.
 *
 * The JSON payload is produced by `scripts/buildIngredientRecipeIndex.ts` and
 * committed at `src/data/generated/ingredientRecipeIndex.json`. Regenerate it
 * whenever cuisines or ingredient slugs change:
 *
 *   bun run build:ingredient-recipe-index
 *
 * This module exposes O(1) lookups from an ingredient slug (or display name)
 * to the list of recipes that reference it, with the raw ingredient text and
 * measurement pulled verbatim from the recipe.
 */

import { isInternalCuisineCode } from "@/utils/internalCuisineCodes";
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

/** "cherries" → "cherry", "tomatoes" → "tomato", "lemons" → "lemon". */
function singularForm(norm: string): string {
  if (norm.endsWith("ies") && norm.length > 4) return `${norm.slice(0, -3)}y`;
  if (norm.endsWith("es") && norm.length > 3) return norm.slice(0, -2);
  return norm.endsWith("s") && norm.length > 2 ? norm.slice(0, -1) : norm;
}

const ALIAS_TO_SLUG = new Map<string, string>();
for (const slug of INDEX_KEYS) {
  const norm = normalizeIngredientInput(slug);
  ALIAS_TO_SLUG.set(norm, slug);
  ALIAS_TO_SLUG.set(singularForm(norm), slug);
}

/**
 * Generic state/preparation descriptors that get promoted to slugs when a
 * recipe lists them as bare ingredients; never used for containment matches.
 */
const CONTAINMENT_STOPWORDS = new Set([
  "fresh", "dried", "frozen", "raw", "cooked", "ground", "whole",
  "plain", "unsalted", "salted", "sweet", "warm", "hot", "cold",
  "small", "medium", "large", "chopped", "minced", "sliced", "diced",
  "to taste", "for garnish", "for serving", "optional",
]);

/**
 * Words that name a portion of another ingredient rather than an ingredient:
 * "garlic cloves", "4 cloves garlic", "juice of 1 lemon", "thyme sprigs".
 * Basis: a clove is one segment of a garlic bulb, juice is the liquid pressed
 * from the fruit named with it, and heads, sprigs, stalks and leaves are how
 * a vegetable or herb is counted. "cloves" (the spice) and "juice" are index
 * slugs, so a portion word still resolves when it is the only name in the
 * text ("ground cloves"), but it never wins against another name.
 */
const PORTION_WORDS = new Set([
  "clove", "cloves", "juice", "head", "heads", "sprig", "sprigs",
  "stalk", "stalks", "leaf", "leaves",
]);

/**
 * Heads that make "<ingredient> <head>" a product of its own: neither the
 * ingredient nor the plain head. Basis: the index carries almond, cashew and
 * sunflower-seed butter as slugs distinct from the nut and from dairy butter,
 * so "peanut butter", which has no slug, is not peanuts and not butter.
 */
const PRODUCT_HEADS = new Set(["butter"]);

/** Containment aliases, matched as whole-token sequences of the input. */
const CONTAINMENT_ALIASES: ReadonlyMap<string, string> = new Map(
  Array.from(ALIAS_TO_SLUG.entries()).filter(
    ([alias]) => alias.length >= 4 && !CONTAINMENT_STOPWORDS.has(alias),
  ),
);
const MAX_ALIAS_TOKENS = Math.max(...Array.from(CONTAINMENT_ALIASES.keys(), (alias) => alias.split(" ").length));

interface AliasMatch {
  alias: string;
  slug: string;
  /** Token span [start, end) in the input. */
  start: number;
  end: number;
}

/** Every containment alias the input holds as whole words, with its span. */
function aliasMatches(input: string): AliasMatch[] {
  const tokens = input.split(" ");
  const matches: AliasMatch[] = [];
  for (let start = 0; start < tokens.length; start++) {
    const last = Math.min(tokens.length, start + MAX_ALIAS_TOKENS);
    for (let end = start + 1; end <= last; end++) {
      const alias = tokens.slice(start, end).join(" ");
      const slug = CONTAINMENT_ALIASES.get(alias);
      if (slug !== undefined) matches.push({ alias, slug, start, end });
    }
  }
  return matches;
}

function isInside(inner: AliasMatch, outer: AliasMatch): boolean {
  return outer !== inner && outer.start <= inner.start && outer.end >= inner.end;
}

/** Drop each product head and the name right before it ("peanut butter"). */
function withoutProducts(matches: readonly AliasMatch[]): AliasMatch[] {
  const heads = matches.filter((m) => PRODUCT_HEADS.has(m.alias) && matches.some((p) => p.end === m.start));
  return matches.filter((m) => !heads.some((head) => head === m || head.start === m.end));
}

/**
 * The slug an input names by containment. Rules, in order:
 *   1. A name inside a longer name drops out ("fresh pandan leaves").
 *   2. Portion words yield to any other name ("garlic cloves" → garlic).
 *   3. A product head and the name before it drop out ("peanut butter").
 *   4. The longest remaining name wins; on equal length the rightmost, since
 *      the last noun heads the phrase ("garlic chives" → chives).
 * Rules 1–3 used to be approximated by length alone, with ties going to
 * whichever slug came first in the JSON: "garlic cloves" → cloves.
 */
function containedSlug(input: string): string | null {
  const all = aliasMatches(input);
  const outer = all.filter((m) => !all.some((o) => isInside(m, o)));
  const named = outer.filter((m) => !PORTION_WORDS.has(m.alias));
  const kept = withoutProducts(named.length > 0 ? named : outer);
  const best = kept.reduce<AliasMatch | null>(
    (top, m) => (top === null || m.alias.length >= top.alias.length ? m : top),
    null,
  );
  return best?.slug ?? null;
}

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

    // Containment fallback for prefixed names like "fresh pandan leaves".
    const contained = containedSlug(candidateInput);
    if (contained !== null) return contained;
  }
  return null;
}

/**
 * Return every recipe reference for an ingredient slug.
 * Returns [] for unknown slugs.
 */
export function getRecipesForIngredient(slug: string): IngredientRecipeMatch[] {
  const resolved = resolveIngredientSlug(slug) ?? slug;
  const matches = INDEX[resolved] ?? [];
  // Internal archive codes (e.g. "hsca") must never surface as cuisine
  // labels — group those matches under "other" instead.
  return matches.map((m) =>
    isInternalCuisineCode(m.cuisine) ? { ...m, cuisine: "other" } : m,
  );
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

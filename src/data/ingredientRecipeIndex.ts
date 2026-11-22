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
import { containmentDetailMatcher, type ContainmentMatch, type SlugFilter } from "./ingredientContainment";

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
    // NFKD splits "ñ" into "n" plus a mark; the next replace used to turn the
    // mark into a space ("jalapen o"). The spelled-out repairs below predate this.
    .replace(/\p{M}/gu, "")
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

const CLAUSE_CAPTURE = /([,;()/])/;

/** Containment over every alias of 4+ characters that is not a bare descriptor. */
const containedMatch = containmentDetailMatcher(
  new Map(
    Array.from(ALIAS_TO_SLUG.entries()).filter(
      ([alias]) => alias.length >= 4 && !CONTAINMENT_STOPWORDS.has(alias),
    ),
  ),
);
const ANY_SLUG: SlugFilter = () => true;

interface CandidateText {
  plain: string;
  claused: string;
}

function normalizePreservingClauses(value: string): string {
  return value
    .split(CLAUSE_CAPTURE)
    .map((part) => (/^[,;()/]$/.test(part) ? part : normalizeIngredientInput(part)))
    .join(" ");
}

function buildCandidates(input: string): CandidateText[] {
  const plain = normalizeIngredientInput(input);
  const claused = normalizePreservingClauses(input);
  const candidates: CandidateText[] = [{ plain, claused }];
  for (const prefix of [/^foundation of\s+/, /^warm\s+/, /^caramel sauce\s+/]) {
    if (prefix.test(plain)) {
      candidates.push({ plain: plain.replace(prefix, ""), claused: claused.replace(prefix, "") });
    }
  }
  const splitPlain = plain.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
  if (splitPlain.length > 1) {
    const splitClaused = claused.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
    splitPlain.forEach((p, idx) => {
      candidates.push({ plain: p, claused: splitClaused[idx] ?? p });
    });
  }
  return candidates;
}

function slugMatchFor({ plain, claused }: CandidateText, accepts: SlugFilter): ContainmentMatch | null {
  const exact = toSlug(plain);
  if (INDEX_KEYS.has(exact) && accepts(exact)) return { slug: exact, derived: false };
  const byAlias = ALIAS_TO_SLUG.get(plain);
  if (byAlias !== undefined && accepts(byAlias)) return { slug: byAlias, derived: false };
  // Containment fallback for prefixed names and derived products.
  return containedMatch(claused, accepts);
}

/**
 * Resolve a canonical index slug and derived-product attribution from a
 * user-facing ingredient input. Returns null when no slug can be resolved.
 */
export function resolveIngredientSlugMatch(
  input: string,
  accepts: SlugFilter = ANY_SLUG,
): ContainmentMatch | null {
  if (!input) return null;
  for (const candidate of buildCandidates(input)) {
    const match = slugMatchFor(candidate, accepts);
    if (match !== null) return match;
  }
  return null;
}

/**
 * Resolve a canonical index slug from a user-facing ingredient input.
 * Returns null when no slug can be resolved.
 *
 * A slug `accepts` rejects is skipped at every step, so the input can still
 * reach a name the caller can use. For the omnibar, "ground beef" → beef:
 * the index has a ground_beef slug, but the catalog has no card for it.
 */
export function resolveIngredientSlug(input: string, accepts: SlugFilter = ANY_SLUG): string | null {
  return resolveIngredientSlugMatch(input, accepts)?.slug ?? null;
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
  return groupMatchesByCuisine(getRecipesForIngredient(slug));
}

/** Group matches by cuisine, for a caller that has filtered the list first. */
export function groupMatchesByCuisine(
  matches: readonly IngredientRecipeMatch[],
): Record<string, IngredientRecipeMatch[]> {
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

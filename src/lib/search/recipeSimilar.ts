/**
 * Dishes from other cuisines that cook from the same ingredients.
 *
 * Each recipe is a vector over the catalog ingredients it names, weighted by
 * how rare the ingredient is (inverse document frequency), so sharing tahini
 * counts for far more than sharing salt. An "X or Y" line or a derived product
 * counts half. Two recipes match by the cosine of their vectors, only when
 * they share at least {@link MIN_SHARED} ingredients that are not pantry
 * staples, and, when the dish is named for an ingredient ("Yu Xiang
 * Eggplant"), only with dishes that use it. Every match carries the shared
 * ingredients: they are the basis shown to the reader, not a bare percentage.
 */
import type { SearchIndex } from "./searchIndex";

/** An ingredient in more than this share of recipes is a staple. */
export const STAPLE_SHARE = 0.3;
/**
 * Pantry basics below that share. [MEASURED 2026-11-25, static catalog] black
 * pepper is 17%, flour 11%, sugar 11%, butter 8%; sharing them says little
 * about whether two dishes are alike. Onion and garlic are kept: they start the
 * same stews and sauces across cuisines.
 */
const PANTRY_STAPLES: ReadonlySet<string> = new Set([
  "salt", "sea salt", "kosher salt", "water", "olive oil", "vegetable oil", "coconut oil", "black pepper", "pepper",
  "sugar", "granulated sugar", "flour", "all-purpose flour", "butter", "unsalted butter",
]);
export const MIN_SHARED = 3;
/** Below this cosine the shared ingredients stop reading as the same kind of dish. */
export const MIN_SCORE = 0.22;
/** Alternative ("or") and derived uses weigh half a direct one. */
const WEAK_USE = 0.5;

interface Vector {
  weights: ReadonlyMap<string, number>;
  norm: number;
}

interface Corpus {
  vectors: ReadonlyMap<string, Vector>;
  idf: ReadonlyMap<string, number>;
  staples: ReadonlySet<string>;
  /** Per recipe, the non-staple ingredients its name mentions. */
  headline: ReadonlyMap<string, readonly string[]>;
}

export interface SimilarRecipe {
  id: string;
  score: number;
  /** Shared non-staple ingredient names, rarest first. */
  shared: readonly string[];
}

const corpora = new WeakMap<SearchIndex, Corpus>();

function vectorOf(weights: ReadonlyMap<string, number>): Vector {
  const squares = [...weights.values()].reduce((sum, weight) => sum + weight * weight, 0);
  return { weights, norm: Math.sqrt(squares) };
}

function isStaple(index: SearchIndex, key: string, uses: number): boolean {
  const name = index.ingredients.get(key)?.name.toLowerCase() ?? key;
  return PANTRY_STAPLES.has(name) || uses / Math.max(index.recipes.size, 1) > STAPLE_SHARE;
}

function weightsByRecipe(index: SearchIndex, idf: ReadonlyMap<string, number>): Map<string, Map<string, number>> {
  const byRecipe = new Map<string, Map<string, number>>();
  for (const [key, uses] of index.recipeUses) {
    for (const use of uses) {
      const weights = byRecipe.get(use.recipeId) ?? new Map<string, number>();
      weights.set(key, (idf.get(key) ?? 0) * (use.alternative || use.derived ? WEAK_USE : 1));
      byRecipe.set(use.recipeId, weights);
    }
  }
  return byRecipe;
}

function headlines(index: SearchIndex, staples: ReadonlySet<string>): Map<string, string[]> {
  const headline = new Map<string, string[]>();
  for (const [key, uses] of index.recipeUses) {
    if (staples.has(key)) continue;
    for (const use of uses.filter((candidate) => candidate.inTitle)) {
      headline.set(use.recipeId, [...(headline.get(use.recipeId) ?? []), key]);
    }
  }
  return headline;
}

function build(index: SearchIndex): Corpus {
  const total = Math.max(index.recipes.size, 1);
  const idf = new Map<string, number>();
  const staples = new Set<string>();
  for (const [key, uses] of index.recipeUses) {
    idf.set(key, Math.log((total + 1) / (uses.length + 1)));
    if (isStaple(index, key, uses.length)) staples.add(key);
  }
  const vectors = new Map([...weightsByRecipe(index, idf)].map(([id, weights]) => [id, vectorOf(weights)]));
  return { vectors, idf, staples, headline: headlines(index, staples) };
}

function corpusOf(index: SearchIndex): Corpus {
  const known = corpora.get(index);
  if (known) return known;
  const corpus = build(index);
  corpora.set(index, corpus);
  return corpus;
}

type DishKind = "sauce" | "drink" | "dessert" | "dish";

const SAUCE_WORDS = /\b(sauce|dressing|dip|salsa|vinaigrette|relish|chutney|pesto|aioli|mayonnaise|gravy|marinade|paste|jam|syrup)s?\b/i;
const DRINK_WORDS = /\b(drink|tea|coffee|smoothie|lassi|juice|punch|cocktail|lemonade)s?\b/i;

/** A coarse kind, so a dressing is never offered as a version of a dip's main dish. */
export function dishKind(name: string, meals: readonly string[]): DishKind {
  if (DRINK_WORDS.test(name)) return "drink";
  if (SAUCE_WORDS.test(name)) return "sauce";
  return meals.length > 0 && meals.every((meal) => meal === "dessert") ? "dessert" : "dish";
}

function kindOf(index: SearchIndex, id: string): DishKind {
  const record = index.recipes.get(id);
  return record ? dishKind(record.name, record.meals) : "dish";
}

function cosine(a: Vector, b: Vector): number {
  if (a.norm === 0 || b.norm === 0) return 0;
  let dot = 0;
  for (const [key, weight] of a.weights) dot += weight * (b.weights.get(key) ?? 0);
  return dot / (a.norm * b.norm);
}

function sharedKeys(corpus: Corpus, a: Vector, b: Vector): string[] {
  return [...a.weights.keys()]
    .filter((key) => b.weights.has(key) && !corpus.staples.has(key))
    .sort((x, y) => (corpus.idf.get(y) ?? 0) - (corpus.idf.get(x) ?? 0));
}

/** Recipes that share any non-staple ingredient with the anchor. */
function candidatesFor(index: SearchIndex, corpus: Corpus, anchor: Vector): Set<string> {
  const ids = new Set<string>();
  for (const key of anchor.weights.keys()) {
    if (corpus.staples.has(key)) continue;
    for (const use of index.recipeUses.get(key) ?? []) ids.add(use.recipeId);
  }
  return ids;
}

export interface SimilarOptions {
  limit: number;
  /** Whether a candidate may be offered (another cuisine, another family). */
  allow: (id: string) => boolean;
  /** Matches are one per group; usually the family key. */
  groupOf: (id: string) => string;
}

/** A dish named for ingredients only matches dishes that use one of them. */
function keepsHeadline(corpus: Corpus, anchorId: string, other: Vector): boolean {
  const named = corpus.headline.get(anchorId) ?? [];
  return named.length === 0 || named.some((key) => other.weights.has(key));
}

function matchOf(index: SearchIndex, anchorId: string, anchor: Vector, id: string): SimilarRecipe | null {
  const corpus = corpusOf(index);
  const other = corpus.vectors.get(id);
  if (!other || !keepsHeadline(corpus, anchorId, other) || kindOf(index, id) !== kindOf(index, anchorId)) return null;
  const keys = sharedKeys(corpus, anchor, other);
  const score = cosine(anchor, other);
  if (keys.length < MIN_SHARED || score < MIN_SCORE) return null;
  return { id, score, shared: keys.map((key) => index.ingredients.get(key)?.name ?? key) };
}

function scored(index: SearchIndex, anchorId: string, allow: SimilarOptions["allow"]): SimilarRecipe[] {
  const corpus = corpusOf(index);
  const anchor = corpus.vectors.get(anchorId);
  if (!anchor) return [];
  return [...candidatesFor(index, corpus, anchor)]
    .filter((id) => id !== anchorId && allow(id))
    .flatMap((id) => matchOf(index, anchorId, anchor, id) ?? []);
}

/** Matches across several versions of one dish, each candidate at its best score. */
export function similarRecipes(index: SearchIndex, anchorIds: readonly string[], options: SimilarOptions): SimilarRecipe[] {
  const nameOf = (id: string): string => index.recipes.get(id)?.name ?? id;
  const best = new Map<string, SimilarRecipe>();
  for (const match of anchorIds.flatMap((anchorId) => scored(index, anchorId, options.allow))) {
    if (match.score > (best.get(match.id)?.score ?? 0)) best.set(match.id, match);
  }
  const ranked = [...best.values()].sort((a, b) => b.score - a.score || nameOf(a.id).localeCompare(nameOf(b.id)));
  const taken = new Set<string>();
  return ranked
    .filter(({ id }) => {
      const group = options.groupOf(id);
      if (taken.has(group)) return false;
      taken.add(group);
      return true;
    })
    .slice(0, options.limit);
}

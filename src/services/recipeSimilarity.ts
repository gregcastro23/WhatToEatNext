/**
 * Recipe-to-recipe similarity behind "Also Recommended" on /recipes/[recipeId]
 * and /api/recipes/[recipeId].
 *
 * Four terms, weighted: cuisine 0.4, ingredients 0.3, cooking methods 0.2,
 * elemental balance 0.1. A term counts when the anchor (the recipe being
 * viewed) carries it; a candidate that lacks it earns 0 on that term, so
 * missing data never raises a score. The sum is normalised over the weights
 * that counted, as calculateRecipeScore normalises over the criteria it could
 * apply. Every candidate for one anchor shares that denominator, so the
 * ranking is the plain weighted sum.
 *
 * Measured 2026-09-26 on 50 live rows: none carries a cooking method and 24
 * carry no cuisine. Before this rule the method term was 0/0 (NaN on every
 * score) and two missing cuisines compared equal (a free 0.4).
 */
import type { Recipe } from "../types/recipe";

interface SimilarityWeights {
  readonly cuisine: number;
  readonly ingredients: number;
  readonly cookingMethods: number;
  readonly elemental: number;
}

const SIMILARITY_WEIGHTS: SimilarityWeights = {
  cuisine: 0.4,
  ingredients: 0.3,
  cookingMethods: 0.2,
  elemental: 0.1,
};

/** How many similar recipes the detail page and API show. */
const SIMILAR_RECIPE_COUNT = 3;

type ElementName = "Fire" | "Water" | "Earth" | "Air";
type ElementAmounts = Readonly<Partial<Record<ElementName, unknown>>>;

const ELEMENTS: readonly ElementName[] = ["Fire", "Water", "Earth", "Air"];

/** A weighted term; `match` is null when the anchor carries nothing to compare. */
interface Term {
  weight: number;
  match: number | null;
}

function normalisedName(entry: unknown): string {
  if (typeof entry === "string") return entry.trim().toLowerCase();
  if (typeof entry === "object" && entry !== null && "name" in entry && typeof entry.name === "string") {
    return entry.name.trim().toLowerCase();
  }
  return "";
}

/** Names from a string, a `{ name }` object, or an array of either. */
function nameSet(entries: unknown): Set<string> {
  const list: readonly unknown[] = Array.isArray(entries) ? entries : [entries];
  return new Set(list.map(normalisedName).filter((name) => name.length > 0));
}

/** Jaccard overlap, or null when the anchor names nothing. */
function overlap(anchor: Set<string>, candidate: Set<string>): number | null {
  if (anchor.size === 0) return null;
  const shared = [...anchor].filter((name) => candidate.has(name)).length;
  return shared / new Set([...anchor, ...candidate]).size;
}

function cuisineMatch(anchor: Recipe, candidate: Recipe): number | null {
  const own = normalisedName(anchor.cuisine);
  if (own === "") return null;
  return normalisedName(candidate.cuisine) === own ? 1 : 0;
}

/** Live rows carry neither key; the static catalog carries the singular. */
function cookingMethodNames(recipe: Recipe): Set<string> {
  return nameSet(recipe.cookingMethods ?? recipe.cookingMethod);
}

function elementVector(amounts: ElementAmounts | undefined): number[] | null {
  const vector: number[] = [];
  for (const element of ELEMENTS) {
    const amount = amounts?.[element];
    if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
    vector.push(amount);
  }
  return vector;
}

/** 1 − mean |Δ| over the four elements, the measure calculateElementMatch uses. */
function elementalMatch(anchor: Recipe, candidate: Recipe): number | null {
  const own = elementVector(anchor.elementalProperties);
  if (own === null) return null;
  const other = elementVector(candidate.elementalProperties);
  if (other === null) return 0;
  const totalGap = own.reduce((sum, amount, i) => sum + Math.abs(amount - (other[i] ?? 0)), 0);
  return Math.max(0, 1 - totalGap / own.length);
}

/** Similarity of `candidate` to `anchor` as a fraction in [0, 1]. */
function recipeSimilarity(anchor: Recipe, candidate: Recipe): number {
  const terms: Term[] = [
    { weight: SIMILARITY_WEIGHTS.cuisine, match: cuisineMatch(anchor, candidate) },
    {
      weight: SIMILARITY_WEIGHTS.ingredients,
      match: overlap(nameSet(anchor.ingredients), nameSet(candidate.ingredients)),
    },
    {
      weight: SIMILARITY_WEIGHTS.cookingMethods,
      match: overlap(cookingMethodNames(anchor), cookingMethodNames(candidate)),
    },
    { weight: SIMILARITY_WEIGHTS.elemental, match: elementalMatch(anchor, candidate) },
  ];
  let weighted = 0;
  let counted = 0;
  for (const { weight, match } of terms) {
    if (match === null) continue;
    weighted += weight * match;
    counted += weight;
  }
  return counted > 0 ? weighted / counted : 0;
}

/**
 * The recipes most similar to `anchor`, best first. Each carries `score` as a
 * whole percent (0–100): the scale RecipeCard prints ("62%", colour bands at
 * 80 and 60) and every other producer of Recipe.score writes.
 */
export function rankSimilarRecipes(
  anchor: Recipe,
  catalog: readonly Recipe[],
  count = SIMILAR_RECIPE_COUNT,
): Recipe[] {
  return catalog
    .filter((candidate) => candidate.id !== anchor.id)
    .map((candidate) => ({ candidate, similarity: recipeSimilarity(anchor, candidate) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, count)
    .map(({ candidate, similarity }) => ({ ...candidate, score: Math.round(similarity * 100) }));
}

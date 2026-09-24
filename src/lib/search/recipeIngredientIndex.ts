/**
 * Ingredient → recipes that use it, built from recipe ingredient lines
 * (plan §4.3). Recipe ids are whatever the catalog passed in. The loader passes
 * the live catalog, so every id resolves on /recipes/[recipeId] (D1).
 */
import { normalizeText, type NormalizedText } from "./text";
import type { RecipeRecord } from "./types";

export interface RecipeUse {
  recipeId: string;
  /** Only named as one side of an "X or Y" line, never as a required line. */
  alternative: boolean;
  /** The ingredient's name appears in the recipe's title ("Spinach Pasta"). */
  inTitle: boolean;
}

/** Maps free text (a recipe line, or one side of it) to a catalog ingredient key. */
export type IngredientKeyResolver = (text: string) => string | null;

const ALTERNATIVE_SPLIT = /\s+or\s+/i;

/** Catalog keys one recipe line names; every key of an "X or Y" line is an alternative. */
export function keysForLine(
  line: string,
  keyOf: IngredientKeyResolver,
): { keys: string[]; alternative: boolean } {
  const parts = line
    .split(ALTERNATIVE_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
  const keys = new Set<string>();
  for (const part of parts) {
    const key = keyOf(part);
    if (key !== null) keys.add(key);
  }
  return { keys: [...keys], alternative: parts.length > 1 };
}

/** Whole-word (stemmed) containment: "Spinach Pasta" mentions spinach. */
export function titleMentions(title: NormalizedText, ingredientName: string): boolean {
  const { stemmed } = normalizeText(ingredientName);
  return stemmed !== "" && ` ${title.stemmed} `.includes(` ${stemmed} `);
}

export function buildRecipeIngredientIndex(
  recipes: readonly RecipeRecord[],
  keyOf: IngredientKeyResolver,
  ingredientName: (key: string) => string,
): Map<string, RecipeUse[]> {
  const byKey = new Map<string, Map<string, RecipeUse>>();
  for (const recipe of recipes) {
    const title = normalizeText(recipe.name);
    for (const line of recipe.ingredientLines) {
      const { keys, alternative } = keysForLine(line, keyOf);
      for (const key of keys) {
        const uses = byKey.get(key) ?? new Map<string, RecipeUse>();
        const prior = uses.get(recipe.id);
        uses.set(recipe.id, {
          recipeId: recipe.id,
          // A recipe that requires the ingredient on any line is not an alternative use.
          alternative: (prior?.alternative ?? true) && alternative,
          inTitle: titleMentions(title, ingredientName(key)),
        });
        byKey.set(key, uses);
      }
    }
  }
  return new Map([...byKey].map(([key, uses]) => [key, [...uses.values()]]));
}

/** Title mentions first, then required before alternative, then name A→Z (plan §4.3). */
export function rankRecipeUses(
  uses: readonly RecipeUse[],
  recipeName: (id: string) => string,
): RecipeUse[] {
  return [...uses].sort(
    (a, b) =>
      Number(b.inTitle) - Number(a.inTitle) ||
      Number(a.alternative) - Number(b.alternative) ||
      recipeName(a.recipeId).localeCompare(recipeName(b.recipeId)),
  );
}

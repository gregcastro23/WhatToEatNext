/**
 * Ingredient → recipes that use it, built from recipe ingredient lines
 * (plan §4.3). Recipe ids are whatever the catalog passed in. The loader passes
 * the live catalog, so every id resolves on /recipes/[recipeId] (D1).
 */
import { normalizeText, type NormalizedText } from "./text";
import type { RecipeRecord } from "./types";

export interface ResolvedIngredientKey {
  key: string;
  derived: boolean;
}

export interface RecipeUse {
  recipeId: string;
  /** Only named as one side of an "X or Y" line, never as a required line. */
  alternative: boolean;
  /** Only named via a derived product ("peanut butter" → peanuts, "corn flour" → corn). */
  derived: boolean;
  /** The ingredient's name appears in the recipe's title ("Spinach Pasta"). */
  inTitle: boolean;
}

/** Maps free text (a recipe line, or one side of it) to catalog key(s). */
export type IngredientKeyResolver = (
  text: string,
) => string | null | ResolvedIngredientKey | readonly ResolvedIngredientKey[];

export interface LineKeys {
  keys: string[];
  alternative: boolean;
  derived: string[];
}

const ALTERNATIVE_SPLIT = /\s+or\s+/i;
/** In an "or" line, commas separate alternatives too: "lamb, beef, or chicken". */
const LIST_SPLIT = /,\s*/;

function pieces(text: string, separator: RegExp): string[] {
  return text
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeResolved(
  resolved: ReturnType<IngredientKeyResolver>,
): readonly ResolvedIngredientKey[] {
  if (resolved === null) return [];
  if (typeof resolved === "string") return [{ key: resolved, derived: false }];
  if ("key" in resolved) return [resolved];
  return resolved;
}

/**
 * Catalog keys one recipe line names; every key of an "X or Y" line is an
 * alternative, and keys only attributed via derived heads carry `derived`.
 */
export function keysForLine(line: string, keyOf: IngredientKeyResolver): LineKeys {
  const sides = pieces(line, ALTERNATIVE_SPLIT);
  const alternative = sides.length > 1;
  const parts = alternative ? sides.flatMap((side) => pieces(side, LIST_SPLIT)) : sides;
  const byKey = new Map<string, boolean>();
  for (const part of parts) {
    for (const entry of normalizeResolved(keyOf(part))) {
      const prior = byKey.get(entry.key);
      // Direct attribution on the same line overrides derived attribution.
      byKey.set(entry.key, prior === undefined ? entry.derived : prior && entry.derived);
    }
  }
  const keys = [...byKey.keys()];
  const derived = keys.filter((key) => byKey.get(key) === true);
  return { keys, alternative, derived };
}

/** Whole-word (stemmed) containment: "Spinach Pasta" mentions spinach. */
export function titleMentions(title: NormalizedText, ingredientName: string): boolean {
  const { stemmed } = normalizeText(ingredientName);
  return stemmed !== "" && ` ${title.stemmed} `.includes(` ${stemmed} `);
}

function tierOfUse(use: Pick<RecipeUse, "alternative" | "derived">): number {
  return Number(use.alternative) * 2 + Number(use.derived);
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
      const { keys, alternative, derived } = keysForLine(line, keyOf);
      const derivedSet = new Set(derived);
      for (const key of keys) {
        const uses = byKey.get(key) ?? new Map<string, RecipeUse>();
        const candidate: RecipeUse = {
          recipeId: recipe.id,
          alternative,
          derived: derivedSet.has(key),
          inTitle: titleMentions(title, ingredientName(key)),
        };
        const prior = uses.get(recipe.id);
        uses.set(
          recipe.id,
          prior && tierOfUse(prior) <= tierOfUse(candidate) ? prior : candidate,
        );
        byKey.set(key, uses);
      }
    }
  }
  return new Map([...byKey].map(([key, uses]) => [key, [...uses.values()]]));
}

/**
 * Title mentions first, then required direct before required derived, then
 * alternative direct before alternative derived, then name A→Z (Ruling 12).
 */
export function rankRecipeUses(
  uses: readonly RecipeUse[],
  recipeName: (id: string) => string,
): RecipeUse[] {
  return [...uses].sort(
    (a, b) =>
      Number(b.inTitle) - Number(a.inTitle) ||
      tierOfUse(a) - tierOfUse(b) ||
      recipeName(a.recipeId).localeCompare(recipeName(b.recipeId)),
  );
}

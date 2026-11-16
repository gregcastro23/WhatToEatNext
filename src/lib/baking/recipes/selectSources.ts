/**
 * Which served recipes are bakeable goods — and, for every other baked
 * recipe, why not.
 *
 * A bakeable good is BAKED (the recipe's own cooking methods include
 * baking), has a FLOUR, STARCH OR DOUGH line, and its NAME names a baked good
 * (goodCategory.ts). The name is the deciding signal because flour share is
 * not: measured 2026-11-16 over the 150 baked recipes with such a line, real
 * goods with wet fillings sit as low as 0.04 (a fruit pie) while every one of
 * the 13 whose name names no baked good is a dish that merely contains flour
 * (moussaka's béchamel 0.039, a wing dredge 0.066, gnocchi 0.123). The share
 * is still reported for every skipped recipe.
 *
 * @file src/lib/baking/recipes/selectSources.ts
 */
import { bakingIngredient } from "@/data/baking";
import type { Recipe } from "@/types/recipe";
import { classifyGood } from "./goodCategory";
import { readLines, type ReadLines } from "./readLines";
import type { RecipeSource, SourceLine } from "./sourceTypes";

export type SkipReason = "no-structure-line" | "not-a-baked-good";

export const SKIP_REASON_TEXT: Readonly<Record<SkipReason, string>> = {
  "no-structure-line": "baked, but no flour, starch or dough line (only finished bread, crumbs or none)",
  "not-a-baked-good": "baked, with flour, but its name names no baked good: a dish that contains flour",
};

export interface SkippedRecipe {
  id: string;
  name: string;
  reason: SkipReason;
  /** Flour/starch/dough share of weighable mass, when computed. */
  structureShare: number | null;
}

export interface Selection {
  sources: RecipeSource[];
  /** Baked recipes that are not bakeable goods, each with its reason. */
  skipped: SkippedRecipe[];
  /** Recipes with no baking method at all — counted, not listed. */
  notBaked: number;
}

function toLine(i: Recipe["ingredients"][number]): SourceLine {
  const notes = typeof i.notes === "string" && i.notes.trim() !== "" ? i.notes : null;
  return { name: i.name, amount: Number(i.amount), unit: typeof i.unit === "string" ? i.unit : "", notes, optional: i.optional === true };
}

function positive(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Flour, starch and prepared-dough mass over all weighable mass; prepared doughs of unknown mass count as structure present. */
export function structureShare(read: ReadLines): number {
  const flour = read.matched.filter((m) => bakingIngredient(m.vectorId).category === "flour_grain").reduce((s, m) => s + m.grams, 0);
  const dough = read.unmatched.filter((u) => u.structural).reduce((s, u) => s + (u.grams ?? 0), 0);
  const known = read.matched.reduce((s, m) => s + m.grams, 0) + read.unmatched.reduce((s, u) => s + (u.grams ?? 0), 0);
  if (known <= 0) return read.unmatched.some((u) => u.structural) ? 1 : 0;
  return (flour + dough) / known;
}

export function isBaked(recipe: Pick<Recipe, "cookingMethod">): boolean {
  return (recipe.cookingMethod ?? []).some((m) => /\bbak(e|ed|es|ing)\b/i.test(m));
}

function judge(recipe: Recipe): RecipeSource | SkippedRecipe {
  const lines = recipe.ingredients.map(toLine);
  const read = readLines(lines);
  const skip = (reason: SkipReason, share: number | null): SkippedRecipe => ({ id: recipe.id, name: recipe.name, reason, structureShare: share });
  const hasStructureLine = read.matched.some((m) => bakingIngredient(m.vectorId).category === "flour_grain") || read.unmatched.some((u) => u.structural);
  if (!hasStructureLine) return skip("no-structure-line", null);
  const category = classifyGood(recipe.name, read.matched);
  if (category === null) return skip("not-a-baked-good", structureShare(read));
  return {
    id: recipe.id,
    name: recipe.name,
    cuisine: typeof recipe.cuisine === "string" && recipe.cuisine !== "" ? recipe.cuisine : "unknown",
    category,
    servings: positive(recipe.numberOfServings ?? recipe.servingSize),
    cookMinutes: positive(recipe.cookTime),
    lines,
    steps: recipe.instructions.filter((s): s is string => typeof s === "string"),
  };
}

/** The bakeable goods among the served recipes, in served order, and the census of the rest. */
export function selectSources(recipes: readonly Recipe[]): Selection {
  const out: Selection = { sources: [], skipped: [], notBaked: 0 };
  for (const recipe of recipes) {
    if (!isBaked(recipe)) {
      out.notBaked += 1;
      continue;
    }
    const judged = judge(recipe);
    if ("reason" in judged) out.skipped.push(judged);
    else out.sources.push(judged);
  }
  return out;
}

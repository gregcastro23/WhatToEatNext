/**
 * Several ingredients in one query ("spinach eggs feta"): the recipes that
 * use them together, most of the named ingredients first (plan §3).
 *
 * Order, each a named rule: more of the named ingredients; then more of them
 * in the title; then more of them required rather than "X or Y"; then name
 * A→Z. No quality tie-breaks (owner decision, round 2).
 */
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import { recipeHref, type SearchIndex } from "./searchIndex";
import type { Keep } from "./intentFilter";
import type { Coverage, CoverageRow, SearchEntity } from "./types";

/** "Together" = at least two of the named ingredients; with two named, both. */
export const MIN_TOGETHER = 2;

interface Tally {
  id: string;
  used: Set<string>;
  inTitle: number;
  required: number;
}

function tally(index: SearchIndex, keys: readonly string[], keep: Keep): Tally[] {
  const byRecipe = new Map<string, Tally>();
  for (const key of keys) {
    for (const use of index.recipeUses.get(key) ?? []) {
      if (!keep(use.recipeId)) continue;
      const entry = byRecipe.get(use.recipeId) ?? { id: use.recipeId, used: new Set<string>(), inTitle: 0, required: 0 };
      entry.used.add(key);
      entry.inTitle += Number(use.inTitle);
      entry.required += Number(!use.alternative);
      byRecipe.set(use.recipeId, entry);
    }
  }
  return [...byRecipe.values()].filter((entry) => entry.used.size >= MIN_TOGETHER);
}

function entityOf(index: SearchIndex, key: string): SearchEntity | null {
  const card = index.ingredients.get(key);
  return card ? { kind: "ingredient", key, name: card.name, href: ingredientHref(card.slug) } : null;
}

export function coverageFor(index: SearchIndex, keys: readonly string[], keep: Keep, limit: number): Coverage {
  const nameOf = (id: string): string => index.recipes.get(id)?.name ?? id;
  const ranked = tally(index, keys, keep).sort(
    (a, b) => b.used.size - a.used.size || b.inTitle - a.inTitle || b.required - a.required || nameOf(a.id).localeCompare(nameOf(b.id)),
  );
  const rows = ranked.slice(0, limit).flatMap((entry): CoverageRow[] => {
    const recipe = index.recipes.get(entry.id);
    if (!recipe) return [];
    const missing = keys.filter((key) => !entry.used.has(key)).map((key) => index.ingredients.get(key)?.name ?? key);
    const { id, name, cuisine, totalMinutes, imageUrl } = recipe;
    return [{ id, name, href: recipeHref(id), cuisine, totalMinutes, imageUrl, uses: entry.used.size, missing }];
  });
  const of = keys.flatMap((key) => entityOf(index, key) ?? []);
  return { of, rows, total: ranked.length };
}

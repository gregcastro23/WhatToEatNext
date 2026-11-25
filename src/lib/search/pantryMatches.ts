/**
 * Recipes that use what the cook has: each typed ingredient is matched to a
 * catalog card (exact name, else a close search hit), then recipes are ranked
 * by how many of those cards they use, title mentions first.
 */
import { ingredientHref } from "@/lib/ingredients/ingredientSlug";
import type { PantryQuery, PantryResponse } from "@/lib/validation/pantrySearchSchemas";
import { publicCuisine } from "@/utils/internalCuisineCodes";
import { rankEntities } from "./rank";
import { cuisineLabel, displayName } from "./recipeFamilies";
import { recipeHref, type SearchIndex } from "./searchIndex";
import { normalizeText } from "./text";

export const PANTRY_LIMIT = 12;
/** A typed word names a card when it is exact or a whole-word match. */
const CARD_TIER = 1;

interface Resolved {
  term: string;
  key: string | null;
}

function resolveTerm(index: SearchIndex, term: string): Resolved {
  const exact = index.exactIngredient(term);
  if (exact !== null) return { term, key: exact };
  const hit = rankEntities(index, normalizeText(term)).find((candidate) => candidate.entity.kind === "ingredient" && candidate.tier <= CARD_TIER);
  return { term, key: hit?.entity.key ?? null };
}

interface Tally {
  id: string;
  keys: Set<string>;
  inTitle: number;
  direct: number;
}

function tally(index: SearchIndex, keys: readonly string[], keep: (id: string) => boolean): Tally[] {
  const byRecipe = new Map<string, Tally>();
  for (const key of keys) {
    for (const use of index.recipeUses.get(key) ?? []) {
      if (!keep(use.recipeId)) continue;
      const entry = byRecipe.get(use.recipeId) ?? { id: use.recipeId, keys: new Set<string>(), inTitle: 0, direct: 0 };
      entry.keys.add(key);
      entry.inTitle += Number(use.inTitle);
      entry.direct += Number(!use.alternative && !use.derived);
      byRecipe.set(use.recipeId, entry);
    }
  }
  return [...byRecipe.values()];
}

function keeps(index: SearchIndex, diet: PantryQuery["diet"]): (id: string) => boolean {
  return (id) => diet === null || index.recipeDiet.get(id)?.[diet] === "compliant";
}

function rows(index: SearchIndex, ranked: readonly Tally[], keys: readonly string[]): PantryResponse["recipes"] {
  const nameOf = (key: string): string => index.ingredients.get(key)?.name ?? key;
  return ranked.slice(0, PANTRY_LIMIT).flatMap((entry) => {
    const recipe = index.recipes.get(entry.id);
    if (!recipe) return [];
    return [
      {
        id: entry.id,
        name: displayName(recipe.name),
        href: recipeHref(entry.id),
        cuisine: cuisineLabel(publicCuisine(recipe.cuisine) ?? "") || null,
        uses: keys.filter((key) => entry.keys.has(key)).map(nameOf),
        missing: keys.filter((key) => !entry.keys.has(key)).map(nameOf),
      },
    ];
  });
}

export function pantryMatches(index: SearchIndex, query: PantryQuery): PantryResponse {
  const resolved = query.ingredients.map((term) => resolveTerm(index, term));
  const keys = [...new Set(resolved.flatMap(({ key }) => (key === null ? [] : [key])))];
  const nameOf = (id: string): string => index.recipes.get(id)?.name ?? id;
  const ranked = tally(index, keys, keeps(index, query.diet)).sort(
    (a, b) => b.keys.size - a.keys.size || b.inTitle - a.inTitle || b.direct - a.direct || nameOf(a.id).localeCompare(nameOf(b.id)),
  );
  return {
    success: true,
    ingredients: resolved.map(({ term, key }) => {
      const card = key === null ? undefined : index.ingredients.get(key);
      return { term, name: card?.name ?? null, href: card ? ingredientHref(card.slug) : null };
    }),
    recipes: rows(index, ranked, keys),
    total: ranked.length,
  };
}

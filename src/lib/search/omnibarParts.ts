/**
 * Pieces of an omnibar result shared by the plain name search (./omnibar)
 * and the intent search (./omnibarIntent): did-you-mean, the hero card, the
 * recipes that use it, and hits per kind.
 */
import type { Season } from "@/constants/seasons";
import { _getSeason } from "@/utils/dateUtils";
import { rankRecipeUses } from "./recipeIngredientIndex";
import { recipeHref, type SearchIndex } from "./searchIndex";
import type { ContainingRecipeRow, Correction, IngredientHero, OmnibarResult, RecipeRow, SearchEntity, SearchHit, SearchKind } from "./types";

export const DEFAULT_PER_KIND = 6;
/** Recipes listed under a hero; the dossier lists the same ones. */
export const DEFAULT_CONTAINING = 12;

const KEEP_ALL = (): boolean => true;

/** Shown when the best hit needed a synonym, a mid-word match, or an edit. */
export function correctionFor(top: SearchHit, query: string): Correction | null {
  if (top.via === "synonym") return { from: query, to: top.entity.name, basis: "synonym" };
  if (top.tier === 3) return { from: query, to: top.entity.name, basis: "mid-word" };
  if (top.tier >= 4) return { from: query, to: top.entity.name, basis: "edit-distance" };
  return null;
}

/** The meteorological season of `now`, spelled as cards store it (`fall` is stored as `autumn`). */
export function seasonOf(now: Date): Season {
  const season = _getSeason(now.getMonth());
  return season === "fall" ? "autumn" : season;
}

/** "all" means year-round. */
function inSeasonNow(seasons: readonly string[], now: Date): boolean {
  const current = seasonOf(now);
  return seasons.some((s) => s === "all" || s === current || (current === "autumn" && s === "fall"));
}

export function heroFor(index: SearchIndex, top: SearchHit, now: Date): IngredientHero | null {
  if (top.entity.kind !== "ingredient") return null;
  const record = index.ingredients.get(top.entity.key);
  if (!record) return null;
  return {
    key: record.key,
    name: record.name,
    href: top.entity.href,
    category: record.category,
    seasons: record.seasons,
    inSeasonNow: inSeasonNow(record.seasons, now),
    qualities: record.qualities.slice(0, 3),
    rulingPlanets: record.rulingPlanets,
    elemental: record.elemental,
    imageUrl: record.imageUrl,
    recipeCount: index.recipeUses.get(record.key)?.length ?? 0,
    pairings: record.pairings,
  };
}

export function recipeRow(index: SearchIndex, id: string): RecipeRow | null {
  const recipe = index.recipes.get(id);
  if (!recipe) return null;
  const { name, cuisine, totalMinutes, imageUrl } = recipe;
  return { id, name, href: recipeHref(id), cuisine, totalMinutes, imageUrl };
}

/** The recipes that use an ingredient and pass `keep`, ranked (title mentions, then required, then name). */
export function containingRows(index: SearchIndex, key: string, limit: number, keep: (id: string) => boolean = KEEP_ALL): { rows: ContainingRecipeRow[]; total: number } {
  const uses = (index.recipeUses.get(key) ?? []).filter((use) => keep(use.recipeId));
  const nameOf = (id: string): string => index.recipes.get(id)?.name ?? id;
  const rows = rankRecipeUses(uses, nameOf)
    .slice(0, limit)
    .flatMap((use) => {
      const row = recipeRow(index, use.recipeId);
      return row ? [{ ...row, alternative: use.alternative }] : [];
    });
  return { rows, total: uses.length };
}

export function entitiesOf(hits: readonly SearchHit[], kind: SearchKind, limit: number, skip: string | null): SearchEntity[] {
  return hits
    .filter((h) => h.entity.kind === kind && h.entity.key !== skip)
    .slice(0, limit)
    .map((h) => h.entity);
}

export function recipeRowsOf(index: SearchIndex, entities: readonly SearchEntity[]): RecipeRow[] {
  return entities.flatMap((entity) => recipeRow(index, entity.key) ?? []);
}

export function countKinds(hits: readonly SearchHit[]): Record<SearchKind, number> {
  const total: Record<SearchKind, number> = { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 };
  for (const hit of hits) total[hit.entity.kind] += 1;
  return total;
}

export function emptyResult(query: string): OmnibarResult {
  return {
    query,
    top: null,
    corrected: null,
    hero: null,
    recipesContaining: [],
    recipesContainingTotal: 0,
    chips: [],
    coverage: null,
    recipes: [],
    ingredients: [],
    cuisines: [],
    methods: [],
    sauces: [],
    total: { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 },
  };
}

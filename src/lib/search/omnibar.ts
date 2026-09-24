/**
 * Query → omnibar result (plan §4.4): did-you-mean, an ingredient hero card,
 * the recipes that use it, and ranked hits per kind.
 */
import { _getSeason } from "@/utils/dateUtils";
import { rankEntities } from "./rank";
import { rankRecipeUses } from "./recipeIngredientIndex";
import { recipeHref, type SearchIndex } from "./searchIndex";
import { normalizeText } from "./text";
import type {
  ContainingRecipeRow,
  Correction,
  IngredientHero,
  OmnibarResult,
  SearchEntity,
  SearchHit,
  SearchKind,
} from "./types";

export interface OmnibarOptions {
  /** Injected so "in season now" is testable. */
  now: Date;
  perKindLimit?: number;
  containingLimit?: number;
}

const DEFAULT_PER_KIND = 6;
/** Recipes listed under a hero; the dossier lists the same ones. */
export const DEFAULT_CONTAINING = 12;

/** Shown when the best hit needed a synonym, a mid-word match, or an edit. */
function correctionFor(top: SearchHit, query: string): Correction | null {
  if (top.via === "synonym") return { from: query, to: top.entity.name, basis: "synonym" };
  if (top.tier === 3) return { from: query, to: top.entity.name, basis: "mid-word" };
  if (top.tier >= 4) return { from: query, to: top.entity.name, basis: "edit-distance" };
  return null;
}

/** Meteorological season of `now`; "all" means year-round, fall and autumn are one season. */
function inSeasonNow(seasons: readonly string[], now: Date): boolean {
  const current = _getSeason(now.getMonth());
  const aliases = current === "fall" ? ["fall", "autumn"] : [current];
  return seasons.some((s) => s === "all" || aliases.includes(s));
}

function heroFor(index: SearchIndex, top: SearchHit, now: Date): IngredientHero | null {
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
  };
}

/** The recipes that use an ingredient, ranked (title mentions, then required, then name). */
export function containingRows(index: SearchIndex, key: string, limit: number): ContainingRecipeRow[] {
  const uses = index.recipeUses.get(key) ?? [];
  const nameOf = (id: string): string => index.recipes.get(id)?.name ?? id;
  return rankRecipeUses(uses, nameOf)
    .slice(0, limit)
    .flatMap((use) => {
      const recipe = index.recipes.get(use.recipeId);
      if (!recipe) return [];
      const { id, name, cuisine, totalMinutes, imageUrl } = recipe;
      return [{ id, name, href: recipeHref(id), cuisine, totalMinutes, imageUrl, alternative: use.alternative }];
    });
}

function emptyResult(query: string): OmnibarResult {
  return {
    query,
    corrected: null,
    hero: null,
    recipesContaining: [],
    recipes: [],
    ingredients: [],
    cuisines: [],
    methods: [],
    sauces: [],
    total: { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 },
  };
}

function entitiesOf(hits: readonly SearchHit[], kind: SearchKind, limit: number, skip: string | null): SearchEntity[] {
  return hits
    .filter((h) => h.entity.kind === kind && h.entity.key !== skip)
    .slice(0, limit)
    .map((h) => h.entity);
}

export function searchOmnibar(index: SearchIndex, rawQuery: string, options: OmnibarOptions): OmnibarResult {
  const query = rawQuery.trim();
  const hits = rankEntities(index, normalizeText(query));
  const [top] = hits;
  if (!top) return emptyResult(query);
  const perKind = options.perKindLimit ?? DEFAULT_PER_KIND;
  const hero = heroFor(index, top, options.now);
  const recipeRows = entitiesOf(hits, "recipe", perKind, null).flatMap((entity) => {
    const recipe = index.recipes.get(entity.key);
    return recipe ? [{ id: recipe.id, name: recipe.name, href: entity.href, cuisine: recipe.cuisine, totalMinutes: recipe.totalMinutes, imageUrl: recipe.imageUrl }] : [];
  });
  const total: Record<SearchKind, number> = { ingredient: 0, recipe: 0, cuisine: 0, method: 0, sauce: 0 };
  for (const hit of hits) total[hit.entity.kind] += 1;
  return {
    ...emptyResult(query),
    corrected: correctionFor(top, query),
    hero,
    recipesContaining: hero ? containingRows(index, hero.key, options.containingLimit ?? DEFAULT_CONTAINING) : [],
    recipes: recipeRows,
    ingredients: entitiesOf(hits, "ingredient", perKind, hero?.key ?? null),
    cuisines: entitiesOf(hits, "cuisine", perKind, null),
    methods: entitiesOf(hits, "method", perKind, null),
    sauces: entitiesOf(hits, "sauce", perKind, null),
    total,
  };
}

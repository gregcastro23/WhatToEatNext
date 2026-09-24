/**
 * Data modules → plain search records. Pure: the loader passes the live
 * recipe catalog; tests pass the static one.
 */
import { SERVABLE_COOKING_METHOD_KEYS } from "@/constants/cookingMethodKeys";
import { VALID_SEASONS, type Season } from "@/constants/seasons";
import { getAlchemicalProfile } from "@/data/cooking/profiles";
import type { Sauce } from "@/data/sauces";
import type { CatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import type { Cuisine } from "@/types/cuisine";
import type { Recipe } from "@/types/recipe";
import { cuisineToSlug } from "@/utils/cuisineSlug";
import { isInternalCuisineCode, publicCuisine } from "@/utils/internalCuisineCodes";
import type { ElementalVector, IngredientRecord, NamedRecord, RecipeRecord } from "./types";

const YEAR_ROUND = new Set(["all", "year round", "year-round", "all year", "all-year"]);

function toSeason(value: unknown): Season | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (YEAR_ROUND.has(normalized)) return "all";
  return VALID_SEASONS.find((s) => s === normalized) ?? null;
}

/** A season field as data actually stores it: an array, one string, or "spring, summer". */
function seasonValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? value.split(/,|\/|&|\band\b/) : [];
}

/**
 * `season` (untyped on most records) ∪ `seasonality`. Both read as unknown:
 * `seasonality` is typed Season[] but some records hold a plain string, which
 * the dossier page already handles. `fall` is stored as `autumn`: the Season
 * union carries both as aliases, and a card should not list the same season
 * twice.
 */
function seasonsOf(season: unknown, seasonality: unknown): Season[] {
  const seasons = new Set<Season>();
  for (const value of [...seasonValues(season), ...seasonValues(seasonality)]) {
    const parsed = toSeason(value);
    if (parsed) seasons.add(parsed === "fall" ? "autumn" : parsed);
  }
  return [...seasons];
}

function elementalOf(properties: ElementalVector | undefined): ElementalVector | null {
  if (!properties) return null;
  const { Fire, Water, Earth, Air } = properties;
  const values = [Fire, Water, Earth, Air];
  return values.every((v) => typeof v === "number" && Number.isFinite(v)) ? { Fire, Water, Earth, Air } : null;
}

/** A card's own field, read as unknown: some records carry fields their type omits. */
function field(card: object | null, name: string): unknown {
  return card && name in card ? Reflect.get(card, name) : undefined;
}

/** The first card that carries a field: src/data's, else the unified one. */
function firstDefined(cards: ReadonlyArray<object | null>, name: string): unknown {
  return cards.map((card) => field(card, name)).find((value) => value !== undefined);
}

type Classification = Pick<IngredientRecord, "category" | "qualities" | "rulingPlanets">;

function classificationOf({ source, unified }: CatalogIngredient): Classification {
  return {
    category: source?.category ?? unified?.category ?? "",
    qualities: source?.qualities ?? unified?.qualities ?? [],
    rulingPlanets: source?.astrologicalProfile?.rulingPlanets ?? unified?.astrologicalProfile?.rulingPlanets ?? [],
  };
}

function appearanceOf({ source, unified }: CatalogIngredient): Pick<IngredientRecord, "elemental" | "imageUrl"> {
  return {
    elemental: elementalOf(source?.elementalProperties) ?? elementalOf(unified?.elementalProperties),
    imageUrl: source?.image_url ?? source?.imageUrl ?? unified?.image_url ?? unified?.imageUrl ?? null,
  };
}

/**
 * Union entry → search record. src/data's card wins field by field (owner
 * ruling 2026-09-23); the unified card fills what src/data lacks, and is the
 * whole record for the 86 cards only it has.
 */
function ingredientRecord(entry: CatalogIngredient): IngredientRecord {
  const { key, slug, name, aliases, source, unified } = entry;
  const cards = [source, unified];
  return {
    key,
    slug,
    name,
    aliases,
    seasons: seasonsOf(firstDefined(cards, "season"), firstDefined(cards, "seasonality")),
    ...classificationOf(entry),
    ...appearanceOf(entry),
  };
}

export function ingredientRecords(entries: readonly CatalogIngredient[]): IngredientRecord[] {
  return entries.map(ingredientRecord);
}

/** Leading integer of "45", "45 minutes"; null when the recipe states none. */
function minutes(value: string | undefined): number | null {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function totalMinutesOf(recipe: Recipe): number | null {
  const stated = minutes(recipe.totalTime) ?? minutes(recipe.timeToMake);
  if (stated !== null && stated > 0) return stated;
  const prep = minutes(recipe.prepTime);
  const cook = minutes(recipe.cookTime);
  return prep === null && cook === null ? null : (prep ?? 0) + (cook ?? 0);
}

export function recipeRecords(recipes: readonly Recipe[]): RecipeRecord[] {
  return recipes.map((recipe) => ({
    id: String(recipe.id),
    name: recipe.name,
    cuisine: publicCuisine(recipe.cuisine) ?? null,
    totalMinutes: totalMinutesOf(recipe),
    imageUrl: recipe.imageUrl ?? recipe.image ?? null,
    ingredientLines: recipe.ingredients.map((ingredient) => ingredient.name).filter(Boolean),
  }));
}

export function cuisineRecords(metadata: Readonly<Record<string, Partial<Cuisine>>>): NamedRecord[] {
  return Object.entries(metadata)
    .filter(([key]) => !isInternalCuisineCode(key))
    .map(([key, meta]) => {
      const name = meta.name ?? key;
      return { key, name, href: `/cuisines/${cuisineToSlug(name)}`, terms: [key] };
    });
}

export function methodRecords(): NamedRecord[] {
  return SERVABLE_COOKING_METHOD_KEYS.map((key) => {
    const spaced = key.replace(/_/g, " ");
    const name = getAlchemicalProfile(key)?.displayName ?? spaced;
    return { key, name, href: `/cooking-methods/${key}`, terms: [spaced] };
  });
}

/**
 * Sauces have no per-sauce page yet; Phase 4 adds a `?focus=` deep link. The
 * data's `variants` are match terms: Béarnaise exists only as a variant of
 * Hollandaise, so "béarnaise" should reach Hollandaise.
 */
export function sauceRecords(all: Readonly<Record<string, Sauce>>): NamedRecord[] {
  return Object.entries(all).map(([key, sauce]) => ({
    key,
    name: sauce.name,
    href: "/sauces",
    terms: [key.replace(/([a-z])([A-Z])/g, "$1 $2"), ...(sauce.variants ?? [])],
  }));
}

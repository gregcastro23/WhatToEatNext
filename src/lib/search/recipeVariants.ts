/**
 * Versions the catalog holds back.
 *
 * `getServerRecipes` keeps one recipe per lower-cased name across all cuisines,
 * meals and seasons (actions/recipes `extractRecipesFromCuisines`), so a second
 * "Moussaka" with different ingredients has no id and no page. Owner ruling
 * 2026-11-25: show those inside the cuisine search results, without new pages
 * or ids.
 *
 * The walk below follows the loader's order exactly, so "the first one wins"
 * means the same recipe here. `recipeVariants.test.ts` holds the two together.
 */
import { loadRawCuisine, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { publicCuisine } from "@/utils/internalCuisineCodes";

const MEALS = ["breakfast", "lunch", "dinner", "dessert"] as const;
const SEASONS = ["spring", "summer", "autumn", "winter", "all"] as const;

export interface RecipeVariant {
  name: string;
  /** The lower-cased name the loader dedupes on, shared with the kept recipe. */
  nameKey: string;
  /** Null for the internal archive collection, which is never named. */
  cuisine: string | null;
  meal: (typeof MEALS)[number];
  description: string | null;
  totalMinutes: number | null;
  /** Lines as authored; an amount or unit the file omits is left out, not filled. */
  ingredients: readonly string[];
  steps: readonly string[];
}

interface AuthoredDish {
  variant: RecipeVariant;
  /** Which ingredients, ignoring amounts: what makes one version differ. */
  ingredientSet: string;
}

function member(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null ? Reflect.get(value, key) : undefined;
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function ingredientLine(entry: unknown): { line: string; name: string } | null {
  const name = typeof entry === "string" ? entry.trim() : text(member(entry, "name"));
  if (name === "") return null;
  const line = [text(member(entry, "amount")), text(member(entry, "unit")), name].filter((part) => part !== "").join(" ");
  return { line, name: name.toLowerCase() };
}

function minutes(dish: unknown): number | null {
  const details = member(dish, "details");
  const total = ["prepTimeMinutes", "cookTimeMinutes"]
    .map((key) => Number(member(dish, key) ?? member(details, key) ?? 0))
    .reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  return total > 0 ? total : null;
}

function authoredDish(dish: unknown, cuisine: string | null, meal: AuthoredDish["variant"]["meal"]): AuthoredDish | null {
  const name = text(member(dish, "name"));
  if (name === "") return null;
  const lines = list(member(dish, "ingredients")).flatMap((entry) => ingredientLine(entry) ?? []);
  const description = text(member(dish, "description"));
  const steps = list(member(dish, "instructions") ?? member(member(dish, "details"), "instructions")).map(text);
  return {
    ingredientSet: [...new Set(lines.map((entry) => entry.name))].sort().join("|"),
    variant: {
      name,
      nameKey: name.toLowerCase(),
      cuisine,
      meal,
      description: description === "" ? null : description,
      totalMinutes: minutes(dish),
      ingredients: lines.map((entry) => entry.line),
      steps: steps.filter((step) => step !== ""),
    },
  };
}

/** One cuisine file's dishes, in the loader's meal then season order. */
function dishesOf(key: string, raw: unknown): AuthoredDish[] {
  const cuisine = publicCuisine(text(member(raw, "name")) || key) ?? null;
  return MEALS.flatMap((meal) => {
    const bySeason = member(member(raw, "dishes"), meal);
    return SEASONS.flatMap((season) => list(member(bySeason, season)).flatMap((dish) => authoredDish(dish, cuisine, meal) ?? []));
  });
}

/**
 * Dishes after the first of each name whose ingredient set differs from every
 * version of that name already seen.
 */
export function distinctRepeats(dishes: readonly AuthoredDish[]): RecipeVariant[] {
  const seen = new Map<string, Set<string>>();
  const variants: RecipeVariant[] = [];
  for (const { variant, ingredientSet } of dishes) {
    const sets = seen.get(variant.nameKey);
    if (!sets) {
      seen.set(variant.nameKey, new Set([ingredientSet]));
    } else if (!sets.has(ingredientSet)) {
      sets.add(ingredientSet);
      variants.push(variant);
    }
  }
  return variants;
}

let loaded: Promise<readonly RecipeVariant[]> | null = null;

async function load(): Promise<readonly RecipeVariant[]> {
  const files = await Promise.all(
    PRIMARY_CUISINE_KEYS.map(async (key) => ({ key, raw: await loadRawCuisine(key) })),
  );
  return distinctRepeats(files.flatMap(({ key, raw }) => dishesOf(key, raw)));
}

/** Every held-back version, read once per process. A failed read is retried. */
export function getRecipeVariants(): Promise<readonly RecipeVariant[]> {
  loaded ??= load().catch((error: unknown) => {
    loaded = null;
    throw error;
  });
  return loaded;
}

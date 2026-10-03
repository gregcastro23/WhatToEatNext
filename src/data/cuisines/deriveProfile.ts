/**
 * A cuisine's elemental profile, COMPUTED from its own dishes.
 *
 * The profile is the mean of the cuisine's distinct dishes' profiles, each
 * taken as shares of 1. A dish listed under several meals or seasons counts
 * once, with its entries averaged; an entry missing any element is left out.
 * Values are rounded to 4 decimal places.
 *
 * scripts/generateCuisineProfiles.ts writes the result to derivedProfiles.json,
 * which the cuisine metadata, the cuisine files and the backend JSON all read.
 * cuisineDerivedProfiles.test.ts recomputes it so none of them can drift.
 */
import { normalizeRecipeName } from "@/utils/recipe/recipeStandardization";

export type ProfileElement = "Fire" | "Water" | "Earth" | "Air";
export type ElementShares = Record<ProfileElement, number>;

export interface DerivedCuisineProfile {
  /** Distinct dishes the mean is taken over */
  recipes: number;
  elementalProperties: ElementShares;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Every dish entry in `dishes[meal][season]` */
function listDishes(cuisine: unknown): Array<Record<string, unknown>> {
  if (!isRecord(cuisine) || !isRecord(cuisine.dishes)) return [];
  const dishes: Array<Record<string, unknown>> = [];
  for (const meal of Object.values(cuisine.dishes)) {
    if (!isRecord(meal)) continue;
    for (const list of Object.values(meal)) {
      if (Array.isArray(list)) dishes.push(...list.filter(isRecord));
    }
  }
  return dishes;
}

/** An entry's profile as shares of 1; undefined when any element is missing */
function entryShares(dish: Record<string, unknown>): ElementShares | undefined {
  const ep = dish.elementalProperties;
  if (!isRecord(ep)) return undefined;
  const { Fire, Water, Earth, Air } = ep;
  if (
    typeof Fire !== "number" ||
    typeof Water !== "number" ||
    typeof Earth !== "number" ||
    typeof Air !== "number"
  ) {
    return undefined;
  }
  const total = Fire + Water + Earth + Air;
  if (!(total > 0)) return undefined;
  return { Fire: Fire / total, Water: Water / total, Earth: Earth / total, Air: Air / total };
}

function mean(profiles: ElementShares[]): ElementShares {
  const avg = (element: ProfileElement) =>
    profiles.reduce((sum, profile) => sum + profile[element], 0) / profiles.length;
  return { Fire: avg("Fire"), Water: avg("Water"), Earth: avg("Earth"), Air: avg("Air") };
}

const round4 = (value: number): number => Math.round(value * 10_000) / 10_000;

/** The cuisine's profile, or undefined when no dish carries a full profile */
export function deriveCuisineProfile(cuisine: unknown): DerivedCuisineProfile | undefined {
  const byDish = new Map<string, ElementShares[]>();
  for (const dish of listDishes(cuisine)) {
    const shares = entryShares(dish);
    if (typeof dish.name !== "string" || shares === undefined) continue;
    const key = normalizeRecipeName(dish.name);
    byDish.set(key, [...(byDish.get(key) ?? []), shares]);
  }
  if (byDish.size === 0) return undefined;

  const profile = mean([...byDish.values()].map(mean));
  return {
    recipes: byDish.size,
    elementalProperties: {
      Fire: round4(profile.Fire),
      Water: round4(profile.Water),
      Earth: round4(profile.Earth),
      Air: round4(profile.Air),
    },
  };
}

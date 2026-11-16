/**
 * The Baking Lab ingredient registry.
 *
 * 42 functional vectors: 35 built on a pinned USDA FoodData Central record,
 * the rest derived (brown butter, levain, invert syrup), measured from a cited
 * study (aquafaba), or declared (xanthan, psyllium, allulose) — each one's
 * provenance says which.
 *
 * @file src/data/baking/index.ts
 */
import type { BakingCategory, BakingIngredient } from "@/lib/baking/types";
import { EGGS } from "./ingredients/eggs";
import { FATS } from "./ingredients/fats";
import { FLOURS } from "./ingredients/flours";
import { HYDROCOLLOIDS } from "./ingredients/hydrocolloids";
import { INCLUSIONS } from "./ingredients/inclusions";
import { LEAVENERS } from "./ingredients/leaveners";
import { LIQUIDS } from "./ingredients/liquids";
import { SWEETENERS } from "./ingredients/sweeteners";

export const BAKING_INGREDIENTS: readonly BakingIngredient[] = [
  ...FLOURS,
  ...FATS,
  ...SWEETENERS,
  ...LIQUIDS,
  ...EGGS,
  ...LEAVENERS,
  ...HYDROCOLLOIDS,
  ...INCLUSIONS,
];

const BY_ID = new Map(BAKING_INGREDIENTS.map((i) => [i.id, i]));

/** The ingredient with this id. Unknown ids THROW: a formula naming one is a caller bug, not a fact. */
export function bakingIngredient(id: string): BakingIngredient {
  const found = BY_ID.get(id);
  if (found === undefined) throw new RangeError(`unknown baking ingredient "${id}"`);
  return found;
}

export function hasBakingIngredient(id: string): boolean {
  return BY_ID.has(id);
}

export const CATEGORY_LABELS: Record<BakingCategory, string> = {
  flour_grain: "Flours & starches",
  fat_lipid: "Fats",
  sugar_sweetener: "Sweeteners",
  liquid_dairy: "Liquids & dairy",
  egg_binder: "Eggs & binders",
  leavener: "Leaveners",
  hydrocolloid_fiber: "Hydrocolloids & cocoa",
  inclusion_flavor: "Inclusions & flavour",
};

export function ingredientsInCategory(category: BakingCategory): BakingIngredient[] {
  return BAKING_INGREDIENTS.filter((i) => i.category === category);
}

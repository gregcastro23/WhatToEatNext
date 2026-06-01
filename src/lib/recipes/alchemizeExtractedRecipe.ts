/**
 * Alchemize an extracted recipe into the canonical custom-recipe payload.
 *
 * This is the "scripts-as-a-feature" core: it reuses the exact same elemental
 * + ESMS computation the HSCA backfill scripts use
 * (src/utils/recipeAlchemicalQuantities.ts), so an ingested recipe gets the
 * same alchemical enrichment as the seeded catalog. The result is stored as the
 * JSONB `payload` of a `user_custom_recipes` row (source = "scan").
 */
import type { ElementalProperties } from "@/types/recipe";
import {
  calculateRecipeAlchemicalQuantities,
  calculateRecipeElementalFromIngredients,
} from "@/utils/recipeAlchemicalQuantities";
import type { ExtractedRecipe } from "./extractRecipe";

/** Even split used only when no ingredient matched the catalog. */
const BALANCED_ELEMENTAL: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

export interface AlchemizedRecipePayload {
  name: string;
  description?: string;
  /** Left undefined on ingest — the user can set a cuisine in the preview. */
  cuisine?: string;
  yield?: string;
  categories: string[];
  /** Raw extracted ingredient lines (e.g. "1/2 cup sugar"). */
  ingredients: string[];
  instructions: string[];
  /** Fire/Water/Earth/Air, normalized to sum 1.0 (balanced default if unmatched). */
  elementalProperties: ElementalProperties;
  /** 0–1 fraction of ingredients that contributed an elemental profile. */
  elementalMatchRate: number;
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  /** Spirit + Essence + Matter + Substance. */
  aSharp: number;
  /** 0–1 fraction of ingredients matched in the alchemical catalog. */
  alchemicalMatchRate: number;
  source: "scan";
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function alchemizeExtractedRecipe(
  recipe: ExtractedRecipe,
): AlchemizedRecipePayload {
  const ingredients = recipe.ingredients ?? [];
  const esms = calculateRecipeAlchemicalQuantities(ingredients);
  const elemental = calculateRecipeElementalFromIngredients(ingredients);

  return {
    name: recipe.title,
    description: recipe.description ?? undefined,
    cuisine: undefined,
    yield: recipe.yield_amount ?? undefined,
    categories: recipe.categories ?? [],
    ingredients,
    instructions: recipe.instructions ?? [],
    elementalProperties: elemental?.elementalProperties ?? BALANCED_ELEMENTAL,
    elementalMatchRate: elemental?.matchRate ?? 0,
    spirit: round2(esms.totalSpirit),
    essence: round2(esms.totalEssence),
    matter: round2(esms.totalMatter),
    substance: round2(esms.totalSubstance),
    aSharp: round2(esms.totalASharp),
    alchemicalMatchRate: round2(esms.matchRate),
    source: "scan",
  };
}

/**
 * Fats and lipids — tenderisers, and (when plastic) the air-holders of creaming.
 *
 * ⚠️ No solid-fat-content curve for milk fat, coconut oil, lard or shortening
 * was found in the 2026-11-15 literature pass, so every solid fat index and
 * clear point here is DECLARED (a representative value, labelled as such),
 * not MEASURED. They drive creaming-plasticity comparisons only; replace them
 * with pulsed-NMR measurements when a source is in hand.
 *
 * @file src/data/baking/ingredients/fats.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, declared } from "../basis";
import { MILK_FAT_MELT, MILK_FAT_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_SETTING, NO_STARCH_GEL, LIQUID_OIL_SFI } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const LIPID: Pick<IngredientSpec, "category" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "fiberWaterBinding" | "acidMmolPerG"> = {
  category: "fat_lipid",
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
  acidMmolPerG: NEUTRAL_ACID,
};

const NO_AQUEOUS_PH = absent("no aqueous phase: pH is undefined");

export const BUTTER: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "butter",
  name: "Butter (unsalted)",
  roles: ["fat", "tenderizer", "moisture"],
  source: { kind: "fdc", key: "butter", starch: "none" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: { value: 6.25, basis: basisOf("DERIVED", "CLEMSON_PH", "midpoint of the listed 6.1–6.4") },
  notes: ["16 g water per 100 g: butter is a water-in-oil emulsion, and that water counts toward true hydration."],
});

/** Brown butter: butter with its water boiled off and its milk solids browned. */
function brownButterComposition(): IngredientSpec["source"] {
  const b = BUTTER.composition;
  const solids = 100 - b.water;
  const scale = 100 / solids;
  return {
    kind: "custom",
    composition: {
      water: 0,
      protein: b.protein * scale,
      fat: b.fat * scale,
      carbohydrate: b.carbohydrate * scale,
      fiber: 0,
      ash: b.ash * scale,
      ethanol: 0,
      starch: 0,
      sugars: b.sugars * scale,
    },
    sugars: { ...BUTTER.sugars, unspeciated: BUTTER.sugars.unspeciated * scale },
    basis: basisOf("DERIVED", "USDA_FDC", `FDC 173430 butter with all ${b.water} g water evaporated and no solids lost: ${solids.toFixed(1)} g brown butter per 100 g butter`),
    sugarBasis: basisOf("DERIVED", "USDA_FDC", "butter's sugars, concentrated; browning consumes some of them and is not modelled"),
  };
}

export const BROWN_BUTTER: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "brown-butter",
  name: "Brown butter",
  roles: ["fat", "tenderizer", "flavor", "browning"],
  source: brownButterComposition(),
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: NO_AQUEOUS_PH,
  notes: ["The water is gone, so swapping brown butter for butter removes hydration — weigh brown butter after browning, or add back the lost water."],
});

export const COCONUT_OIL: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "coconut-oil",
  name: "Coconut oil",
  roles: ["fat", "tenderizer"],
  source: { kind: "fdc", key: "coconut-oil", starch: "none" },
  solidFatIndex: declared<number | null>(0.35, "representative solid fraction at 20 °C; coconut oil is mostly solid in a cool kitchen"),
  meltingPointC: declared<number | null>(25, "representative clear point; coconut oil melts in a narrow band near room temperature"),
  pH: NO_AQUEOUS_PH,
});

export const OLIVE_OIL: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "olive-oil",
  name: "Olive oil",
  roles: ["fat", "tenderizer"],
  source: { kind: "fdc", key: "olive-oil", starch: "none" },
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: absent("liquid throughout baking"),
  pH: NO_AQUEOUS_PH,
  notes: ["A liquid fat coats flour proteins and tenderises, but holds no air: swapping it for creamed butter loses the creaming lift."],
});

export const VEGETABLE_OIL: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "vegetable-oil",
  name: "Vegetable oil (canola)",
  roles: ["fat", "tenderizer"],
  source: { kind: "fdc", key: "vegetable-oil", starch: "none" },
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: absent("liquid throughout baking"),
  pH: NO_AQUEOUS_PH,
  notes: ["Canola stands for a recipe's 'vegetable', 'neutral' or seed oil: all are ~100 % liquid fat, which is all this vector claims."],
});

export const VEGETABLE_SHORTENING: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "vegetable-shortening",
  name: "Vegetable shortening",
  roles: ["fat", "tenderizer"],
  source: { kind: "fdc", key: "vegetable-shortening", starch: "none" },
  solidFatIndex: declared<number | null>(0.2, "representative all-purpose shortening solid fraction near 21 °C"),
  meltingPointC: declared<number | null>(47, "representative clear point of all-purpose shortening"),
  pH: NO_AQUEOUS_PH,
  notes: ["No water: unlike butter it adds no hydration, and its high clear point delays cookie spread."],
});

export const LARD: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "lard",
  name: "Lard",
  roles: ["fat", "tenderizer"],
  source: { kind: "fdc", key: "lard", starch: "none" },
  solidFatIndex: declared<number | null>(0.25, "representative lard solid fraction at 20 °C"),
  meltingPointC: declared<number | null>(43, "representative clear point of lard"),
  pH: NO_AQUEOUS_PH,
});

export const GHEE: BakingIngredient = defineIngredient({
  ...LIPID,
  id: "ghee",
  name: "Ghee (anhydrous butterfat)",
  roles: ["fat", "tenderizer", "flavor"],
  source: { kind: "fdc", key: "ghee", starch: "none" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: NO_AQUEOUS_PH,
  notes: ["Clarified butter (FDC 'Butter oil, anhydrous'): 99.5 g fat and 0.24 g water per 100 g, so unlike whole butter it adds no hydration."],
});

export const FATS: readonly BakingIngredient[] = [BUTTER, BROWN_BUTTER, GHEE, COCONUT_OIL, OLIVE_OIL, VEGETABLE_OIL, VEGETABLE_SHORTENING, LARD];

/**
 * Liquids and dairy — hydration, lactose, milk fat, and (cultured or citrus)
 * the acid that baking soda needs.
 *
 * @file src/data/baking/ingredients/liquids.ts
 */
import { CITRIC_ACID_MMOL_PER_G, LACTIC_ACID_MMOL_PER_G } from "@/lib/baking/chemistry";
import type { BakingIngredient } from "@/lib/baking/types";
import { basisOf, computed, declared, phRange } from "../basis";
import { MILK_FAT_MELT, MILK_FAT_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const LIQUID: Pick<IngredientSpec, "category" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "fiberWaterBinding"> = {
  category: "liquid_dairy",
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
};

export const WATER: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "water",
  name: "Water",
  roles: ["moisture"],
  source: { kind: "fdc", key: "water", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: computed<number | null>(7, "CIAAW_2021", "pure water at 25 °C (Kw = 10⁻¹⁴); tap and bottled water range about 6.5–8.5"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const WHOLE_MILK: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "whole-milk",
  name: "Whole milk",
  roles: ["moisture", "browning", "tenderizer"],
  source: { kind: "fdc", key: "whole-milk", starch: "none" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: phRange(6.4, 6.8, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["Lactose is a reducing sugar: milk browns a crust that water would not."],
});

const BUTTERMILK_LACTIC_PCT = 0.85;

export const BUTTERMILK: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "buttermilk",
  name: "Buttermilk (cultured, low-fat)",
  roles: ["moisture", "acid", "tenderizer"],
  source: { kind: "fdc", key: "buttermilk", starch: "none", sugarsAs: "lactose" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: phRange(4.41, 4.83, "FDA_PH"),
  acidMmolPerG: declared<number | null>(
    (BUTTERMILK_LACTIC_PCT / 100) * LACTIC_ACID_MMOL_PER_G,
    `titratable acidity taken as ${BUTTERMILK_LACTIC_PCT} % lactic acid (21 CFR 131.112 requires ≥ 0.5 %; cultured buttermilk is typically higher)`,
    "CFR_131_112",
  ),
});

export const HEAVY_CREAM: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "heavy-cream",
  name: "Heavy cream",
  roles: ["fat", "moisture", "tenderizer"],
  source: { kind: "fdc", key: "heavy-cream", starch: "none" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: { value: null, basis: basisOf("ABSENT", "MODEL", "cream is not in the FDA table consulted; milk is 6.4–6.8") },
  acidMmolPerG: NEUTRAL_ACID,
});

/** Citric acid per mL of lemon juice (Penniston et al. 2008: ~1.44 g per fl oz), density taken as 1 g/mL. */
const LEMON_CITRIC_G_PER_G = 1.44 / 29.5735;

export const LEMON_JUICE: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "lemon-juice",
  name: "Lemon juice",
  roles: ["acid", "moisture", "flavor"],
  source: { kind: "fdc", key: "lemon-juice", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(2.0, 2.6, "FDA_PH"),
  acidMmolPerG: declared<number | null>(
    LEMON_CITRIC_G_PER_G * CITRIC_ACID_MMOL_PER_G,
    "all three citric-acid protons counted (titratable acidity); juice density taken as 1 g/mL",
    "PENNISTON_2008",
  ),
});

export const LIQUIDS: readonly BakingIngredient[] = [WATER, WHOLE_MILK, BUTTERMILK, HEAVY_CREAM, LEMON_JUICE];

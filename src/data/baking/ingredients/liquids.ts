/**
 * Liquids and dairy — hydration, lactose, milk fat, and (cultured or citrus)
 * the acid that baking soda needs.
 *
 * @file src/data/baking/ingredients/liquids.ts
 */
import { CITRIC_ACID_MMOL_PER_G, LACTIC_ACID_MMOL_PER_G } from "@/lib/baking/chemistry";
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, computed, declared, measured, phRange } from "../basis";
import { LIQUID_OIL_SFI, MILK_FAT_MELT, MILK_FAT_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL, UNQUANTIFIED_ACID } from "../common";
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

export const SOUR_CREAM: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "sour-cream",
  name: "Sour cream (cultured)",
  roles: ["fat", "moisture", "acid", "tenderizer"],
  source: { kind: "fdc", key: "sour-cream", starch: "none" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: absent("not in the FDA or Clemson tables consulted"),
  acidMmolPerG: declared<number | null>(
    (0.5 / 100) * LACTIC_ACID_MMOL_PER_G,
    "titratable acidity taken at the regulatory minimum, 0.5 % as lactic acid: a floor, so the soda it neutralises is a lower bound",
    "CFR_131_160",
  ),
});

export const PLAIN_YOGURT: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "plain-yogurt",
  name: "Plain yogurt (whole milk)",
  roles: ["moisture", "acid", "tenderizer"],
  source: { kind: "fdc", key: "plain-yogurt", starch: "none", sugarsAs: "lactose" },
  solidFatIndex: MILK_FAT_SFI,
  meltingPointC: MILK_FAT_MELT,
  pH: absent("21 CFR 131.200 requires pH 4.6 or lower: a bound, not a value"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["FDC reports 4.66 g sugars unspeciated, taken as lactose; culturing turns some of it to lactic acid, by an amount the yogurt standard does not fix."],
});

export const APPLE_JUICE: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "apple-juice",
  name: "Apple juice (unsweetened)",
  roles: ["moisture", "sweetener", "acid"],
  source: { kind: "fdc", key: "apple-juice", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(3.35, 4.0, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["8.4 of its 9.6 g sugars are fructose and glucose: reducing, so juice-sweetened batters brown more than sugar-sweetened ones."],
});

const PLANT_MILK: Pick<IngredientSpec, "roles" | "solidFatIndex" | "meltingPointC"> = {
  roles: ["moisture"],
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: NO_LIPID_PHASE,
};

export const ALMOND_MILK: BakingIngredient = defineIngredient({
  ...LIQUID,
  ...PLANT_MILK,
  id: "almond-milk",
  name: "Almond milk (unsweetened)",
  source: { kind: "fdc", key: "almond-milk", starch: "reported" },
  pH: absent("not in the FDA or Clemson tables consulted"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["96.5 g water per 100 g: in a batter it is close to water with a little fat and salt. FDC's 262 g cup is 11 % denser than water and is not used (water's cup stands in)."],
});

export const SOY_MILK: BakingIngredient = defineIngredient({
  ...LIQUID,
  ...PLANT_MILK,
  id: "soy-milk",
  name: "Soy milk (original, unfortified)",
  source: { kind: "fdc", key: "soy-milk", starch: "none" },
  pH: measured<number | null>(7, "FDA_PH", "listed as 'Soybean milk'"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["3.3 g protein per 100 g, nearly milk's, but no lactose: it browns less than dairy milk."],
});

export const ORANGE_JUICE: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "orange-juice",
  name: "Orange juice",
  roles: ["moisture", "sweetener", "acid", "flavor"],
  source: { kind: "fdc", key: "orange-juice", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(3.3, 4.19, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["pH is the FDA's 'Orange Juice, California' range. FDC reports its 8.4 g sugars unspeciated."],
});

export const APPLESAUCE: BakingIngredient = defineIngredient({
  ...LIQUID,
  id: "applesauce",
  name: "Applesauce (unsweetened)",
  roles: ["moisture", "sweetener", "tenderizer"],
  source: { kind: "fdc", key: "applesauce", starch: "reported" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(3.1, 3.6, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Used in place of fat or egg in vegan baking: 88 g water and 8.2 g reducing sugars per 100 g, with pectin the model does not count. pH is the FDA's 'Apples, sauce'."],
});

export const LIQUIDS: readonly BakingIngredient[] = [WATER, WHOLE_MILK, BUTTERMILK, HEAVY_CREAM, LEMON_JUICE, SOUR_CREAM, PLAIN_YOGURT, APPLE_JUICE, ORANGE_JUICE, APPLESAUCE, ALMOND_MILK, SOY_MILK];

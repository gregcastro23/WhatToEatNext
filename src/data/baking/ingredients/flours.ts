/**
 * Flours and starches — the baker's-percentage base.
 *
 * @file src/data/baking/ingredients/flours.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent } from "../basis";
import {
  CASSAVA_STARCH_GEL_ONSET,
  CORN_STARCH_GEL_ONSET,
  GLUTEN_SETTING,
  LIQUID_OIL_SFI,
  NEUTRAL_ACID,
  NO_FIBRE_BINDING,
  NO_GLUTEN,
  NO_LIPID_PHASE,
  NO_SETTING,
  WHEAT_GLUTEN_POTENCY,
  WHEAT_PH,
  WHEAT_STARCH_GEL_ONSET,
} from "../common";
import { defineIngredient } from "../defineIngredient";

const WHEAT_FLOUR = {
  category: "flour_grain",
  roles: ["structure"],
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: WHEAT_GLUTEN_POTENCY,
  coagulation: GLUTEN_SETTING,
  gelatinizationTempC: WHEAT_STARCH_GEL_ONSET,
  fiberWaterBinding: NO_FIBRE_BINDING,
  pH: WHEAT_PH,
  acidMmolPerG: NEUTRAL_ACID,
} satisfies Partial<Parameters<typeof defineIngredient>[0]>;

export const BREAD_FLOUR: BakingIngredient = defineIngredient({
  ...WHEAT_FLOUR,
  id: "bread-flour",
  name: "Bread flour",
  source: { kind: "fdc", key: "bread-flour", starch: "by-difference" },
  notes: ["Strong flour: 11.98 g protein per 100 g. Network strength (W) is not in FDC; gluten potency scales with protein."],
});

export const ALL_PURPOSE_FLOUR: BakingIngredient = defineIngredient({
  ...WHEAT_FLOUR,
  id: "all-purpose-flour",
  name: "All-purpose flour",
  source: { kind: "fdc", key: "all-purpose-flour", starch: "by-difference" },
});

export const CAKE_FLOUR: BakingIngredient = defineIngredient({
  ...WHEAT_FLOUR,
  id: "cake-flour",
  name: "Cake / pastry flour",
  roles: ["structure", "tenderizer"],
  source: { kind: "fdc", key: "cake-flour", starch: "by-difference" },
  notes: ["Soft wheat, 8.2 g protein per 100 g: less network, finer crumb. Chlorination (which raises batter viscosity) is not modelled."],
});

export const WHOLE_WHEAT_FLOUR: BakingIngredient = defineIngredient({
  ...WHEAT_FLOUR,
  id: "whole-wheat-flour",
  name: "Whole wheat flour",
  source: { kind: "fdc", key: "whole-wheat-flour", starch: "reported" },
  notes: ["Bran particles physically cut the gluten network; that weakening is not modelled beyond the protein figure."],
});

export const ALMOND_FLOUR: BakingIngredient = defineIngredient({
  id: "almond-flour",
  name: "Almond flour",
  category: "flour_grain",
  roles: ["fat", "tenderizer", "browning"],
  source: { kind: "fdc", key: "almond-flour", starch: "reported" },
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: absent("1 g starch per 100 g: too little to set structure"),
  fiberWaterBinding: NO_FIBRE_BINDING,
  pH: absent("not found in the pH tables consulted"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: [
    "Composition is FDC 'Nuts, almonds, blanched' (SR Legacy, fully speciated): almond flour is finely ground blanched almond. FDC's own Foundation 'Flour, almond' (2261420) agrees within 5 g on every proximate but reports no sugars or starch.",
  ],
});

export const CASSAVA_FLOUR: BakingIngredient = defineIngredient({
  id: "cassava-flour",
  name: "Cassava flour",
  category: "flour_grain",
  roles: ["structure"],
  source: { kind: "fdc", key: "cassava-flour", starch: "reported" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: CASSAVA_STARCH_GEL_ONSET,
  fiberWaterBinding: NO_FIBRE_BINDING,
  pH: absent("not found in the pH tables consulted"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["FDC Foundation record reports starch (79.72 g) but no sugar speciation; the 2.8 g carbohydrate residual is unassigned."],
});

export const CORNSTARCH: BakingIngredient = defineIngredient({
  id: "cornstarch",
  name: "Cornstarch",
  category: "flour_grain",
  roles: ["structure", "tenderizer"],
  source: { kind: "fdc", key: "cornstarch", starch: "by-difference" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: CORN_STARCH_GEL_ONSET,
  fiberWaterBinding: NO_FIBRE_BINDING,
  pH: absent("not found in the pH tables consulted"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["Dilutes gluten in a flour blend: the classic 'cake flour' substitute."],
});

/** Every flour_grain ingredient, for registries and substitution lists. */
export const FLOURS: readonly BakingIngredient[] = [
  BREAD_FLOUR,
  ALL_PURPOSE_FLOUR,
  CAKE_FLOUR,
  WHOLE_WHEAT_FLOUR,
  ALMOND_FLOUR,
  CASSAVA_FLOUR,
  CORNSTARCH,
];

/**
 * Eggs and egg replacers — coagulating protein (structure), lecithin-rich
 * yolk (emulsifier), and a great deal of water.
 *
 * @file src/data/baking/ingredients/eggs.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, declared } from "../basis";
import { EGG_WHITE_SETTING, EGG_YOLK_SETTING, emptySugars, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const EGG: Pick<IngredientSpec, "category" | "glutenPotency" | "gelatinizationTempC" | "fiberWaterBinding" | "acidMmolPerG"> = {
  category: "egg_binder",
  glutenPotency: NO_GLUTEN,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
  acidMmolPerG: NEUTRAL_ACID,
};

const NO_EGG_PH = absent("egg pH was not part of the 2026-11-15 literature pass (it also rises with storage)");
const YOLK_LIPID_SFI = declared<number | null>(0, "yolk lipid is emulsified and liquid at 20 °C");

export const WHOLE_EGG: BakingIngredient = defineIngredient({
  ...EGG,
  id: "whole-egg",
  name: "Whole egg",
  roles: ["structure", "emulsifier", "moisture", "binder"],
  source: { kind: "fdc", key: "whole-egg", starch: "none" },
  solidFatIndex: YOLK_LIPID_SFI,
  meltingPointC: NO_LIPID_PHASE,
  coagulation: { value: EGG_WHITE_SETTING.value, basis: basisOf("DERIVED", "DONOVAN_1975", "the white's window: white carries most of a whole egg's protein") },
  pH: NO_EGG_PH,
  notes: ["76 g water per 100 g. A large egg is about 50 g out of the shell."],
});

export const EGG_WHITE: BakingIngredient = defineIngredient({
  ...EGG,
  id: "egg-white",
  name: "Egg white",
  roles: ["structure", "leavening", "moisture"],
  source: { kind: "fdc", key: "egg-white", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  coagulation: EGG_WHITE_SETTING,
  pH: NO_EGG_PH,
  notes: ["Whipped whites carry the air in a genoise or sponge; that air enters through the batter density, not this vector."],
});

export const EGG_YOLK: BakingIngredient = defineIngredient({
  ...EGG,
  id: "egg-yolk",
  name: "Egg yolk",
  roles: ["emulsifier", "tenderizer", "structure"],
  source: { kind: "fdc", key: "egg-yolk", starch: "none" },
  solidFatIndex: YOLK_LIPID_SFI,
  meltingPointC: NO_LIPID_PHASE,
  coagulation: EGG_YOLK_SETTING,
  pH: NO_EGG_PH,
});

/** Aquafaba from Shim et al. (2018): the midpoints of ten commercial brands. */
function aquafabaSource(): IngredientSpec["source"] {
  const dryMatter = (4.88 + 7.02) / 2;
  const proteinOfSolids = (22.65 + 26.83) / 2 / 100;
  const protein = dryMatter * proteinOfSolids;
  return {
    kind: "custom",
    composition: { water: 100 - dryMatter, protein, fat: 0, carbohydrate: dryMatter - protein, fiber: 0, ash: 0, ethanol: 0, starch: 0, sugars: 0 },
    sugars: emptySugars(),
    basis: basisOf("DERIVED", "SHIM_2018", `dry matter ${dryMatter.toFixed(2)} % and protein ${(proteinOfSolids * 100).toFixed(2)} % of solids (brand-range midpoints); the remaining solids are assigned to carbohydrate — ash and fat were not reported`),
    sugarBasis: basisOf("ABSENT", "SHIM_2018", "sucrose and glucose were detected only qualitatively"),
  };
}

export const AQUAFABA: BakingIngredient = defineIngredient({
  ...EGG,
  id: "aquafaba",
  name: "Aquafaba",
  roles: ["binder", "leavening", "moisture"],
  source: aquafabaSource(),
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  coagulation: NO_SETTING,
  pH: absent("not reported by Shim et al. 2018"),
  notes: ["94 % water and ~1.5 % protein: it whips like egg white but cannot set like it. Swapping it for egg removes most of the coagulating structure."],
});

export const EGGS: readonly BakingIngredient[] = [WHOLE_EGG, EGG_WHITE, EGG_YOLK, AQUAFABA];

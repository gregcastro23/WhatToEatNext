/**
 * Inclusions and flavourings — chocolate, salt, vanilla.
 *
 * @file src/data/baking/ingredients/inclusions.ts
 */
import { naclFromSodiumMg } from "@/lib/baking/chemistry";
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, declared, derived } from "../basis";
import { COCOA_BUTTER_MELT, COCOA_BUTTER_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL } from "../common";
import { defineIngredient, fdcNutrient, type IngredientSpec } from "../defineIngredient";

const INCLUSION: Pick<IngredientSpec, "category" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "fiberWaterBinding"> = {
  category: "inclusion_flavor",
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
};

export const DARK_CHOCOLATE_70: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "dark-chocolate-70",
  name: "Dark chocolate (70–85 %)",
  roles: ["fat", "sweetener", "flavor"],
  source: { kind: "fdc", key: "dark-chocolate-70", starch: "none" },
  solidFatIndex: COCOA_BUTTER_SFI,
  meltingPointC: COCOA_BUTTER_MELT,
  pH: absent("no aqueous phase"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const SEMISWEET_CHOCOLATE: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "semisweet-chocolate",
  name: "Semisweet chocolate / chips",
  roles: ["fat", "sweetener", "flavor"],
  source: { kind: "fdc", key: "semisweet-chocolate", starch: "none", sugarsAs: "sucrose" },
  solidFatIndex: COCOA_BUTTER_SFI,
  meltingPointC: COCOA_BUTTER_MELT,
  pH: absent("no aqueous phase"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const SALT: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "salt",
  name: "Salt",
  roles: ["flavor", "structure"],
  source: { kind: "fdc", key: "salt", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: absent("not part of the pH tables consulted"),
  acidMmolPerG: NEUTRAL_ACID,
  naclPct: derived(naclFromSodiumMg(fdcNutrient("salt", "sodiumMg")), "USDA_FDC", "FDC sodium (38 800 mg) taken as all NaCl"),
  notes: ["Tightens gluten and slows yeast; in this model its job is water activity — two ions per formula unit, the strongest a_w depressant per gram here."],
});

export const VANILLA_EXTRACT: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "vanilla-extract",
  name: "Vanilla extract",
  roles: ["flavor"],
  source: { kind: "fdc", key: "vanilla-extract", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: absent("not part of the pH tables consulted"),
  acidMmolPerG: declared<number | null>(0, "acidity not measured; negligible at the 1–2 % a formula uses"),
  notes: ["34.4 g ethanol per 100 g (FDC) — the 'missing' third that kept its proximates from closing. It evaporates early in the bake."],
});

export const INCLUSIONS: readonly BakingIngredient[] = [DARK_CHOCOLATE_70, SEMISWEET_CHOCOLATE, SALT, VANILLA_EXTRACT];

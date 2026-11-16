/**
 * Inclusions and flavourings — chocolate, salt, vanilla.
 *
 * @file src/data/baking/ingredients/inclusions.ts
 */
import { naclFromSodiumMg } from "@/lib/baking/chemistry";
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, declared, derived, measured, phRange } from "../basis";
import { COCOA_BUTTER_MELT, COCOA_BUTTER_SFI, LIQUID_OIL_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL, UNQUANTIFIED_ACID } from "../common";
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
  naclPct: derived(naclFromSodiumMg(fdcNutrient("salt", "sodiumMg")), "USDA_FDC", "FDC sodium (38 758 mg) taken as all NaCl"),
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

/** Tree nuts: oil-rich solids that tenderise and stay liquid-fatted through the bake. */
const NUT: Pick<IngredientSpec, "roles" | "solidFatIndex" | "meltingPointC" | "acidMmolPerG"> = {
  roles: ["fat", "tenderizer", "flavor"],
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: NO_LIPID_PHASE,
  acidMmolPerG: UNQUANTIFIED_ACID,
};

export const WALNUTS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...NUT,
  id: "walnuts",
  name: "Walnuts (English)",
  source: { kind: "fdc", key: "walnuts", starch: "reported" },
  pH: measured<number | null>(5.42, "FDA_PH"),
});

export const PECANS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...NUT,
  id: "pecans",
  name: "Pecans",
  source: { kind: "fdc", key: "pecans", starch: "reported" },
  pH: absent("not found in the pH tables consulted"),
});

export const ALMONDS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...NUT,
  id: "almonds",
  name: "Almonds (blanched, whole or chopped)",
  source: { kind: "fdc", key: "almond-flour", starch: "reported" },
  pH: absent("not found in the pH tables consulted"),
  notes: ["The same FDC record as almond flour ('Nuts, almonds, blanched'), read as kernels: an inclusion, not part of the flour base, weighed by FDC's own kernel measures."],
});

export const PEANUT_BUTTER: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...NUT,
  id: "peanut-butter",
  name: "Peanut butter (smooth, unsalted)",
  source: { kind: "fdc", key: "peanut-butter", starch: "reported" },
  pH: measured<number | null>(6.28, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["51 g fat and 22 g protein per 100 g: in a peanut butter cookie it is the main fat and much of the structure-free protein."],
});

export const BANANA: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "banana",
  name: "Banana (ripe)",
  roles: ["moisture", "sweetener", "tenderizer", "flavor"],
  source: { kind: "fdc", key: "banana", starch: "reported" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(4.5, 5.2, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["FDC 'Bananas, raw': 75 g water and 12 g sugars per 100 g. A riper banana has turned more of its 5.4 g starch to sugar than this record."],
});

export const DRIED_CRANBERRIES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "dried-cranberries",
  name: "Dried cranberries (sweetened)",
  roles: ["sweetener", "flavor"],
  source: { kind: "fdc", key: "dried-cranberries", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: absent("only cranberry juice is listed (FDA 2.30–2.52), not the dried fruit"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const RAISINS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "raisins",
  name: "Raisins (seedless)",
  roles: ["sweetener", "moisture", "flavor"],
  source: { kind: "fdc", key: "raisins", starch: "none" },
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(3.8, 4.1, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Counted as dissolved into the batter: in a real bake a raisin keeps most of its sugar inside its skin, so the batter's water activity reads lower than it is."],
});

export const INCLUSIONS: readonly BakingIngredient[] = [DARK_CHOCOLATE_70, SEMISWEET_CHOCOLATE, SALT, VANILLA_EXTRACT, WALNUTS, PECANS, ALMONDS, PEANUT_BUTTER, RAISINS, DRIED_CRANBERRIES, BANANA];

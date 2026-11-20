/**
 * Sugars and sweeteners — sweetness (POD), softness (PAC), browning, and the
 * delay they put on starch setting.
 *
 * POD, PAC and the reducing share are COMPUTED by the builder from each
 * sugar profile; nothing here states them.
 *
 * @file src/data/baking/ingredients/sweeteners.ts
 */
import { MOLAR_MASS } from "@/lib/baking/chemistry";
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, declared, phRange } from "../basis";
import { emptySugars, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL, NEUTRAL_ACID, UNQUANTIFIED_ACID, CORN_STARCH_GEL_ONSET } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const SWEETENER: Pick<IngredientSpec, "category" | "solidFatIndex" | "meltingPointC" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "fiberWaterBinding"> = {
  category: "sugar_sweetener",
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
};

export const GRANULATED_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "granulated-sugar",
  name: "Granulated sugar (sucrose)",
  roles: ["sweetener", "tenderizer", "moisture"],
  source: { kind: "fdc", key: "granulated-sugar", starch: "none" },
  pH: phRange(5.0, 6.0, "CLEMSON_PH"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["Sucrose is NON-reducing: it browns by caramelising (from ~169 °C dry), not directly by Maillard."],
});

export const BROWN_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "brown-sugar",
  name: "Brown sugar",
  roles: ["sweetener", "tenderizer", "moisture", "acid", "browning"],
  source: { kind: "fdc", key: "brown-sugar", starch: "none" },
  pH: absent("not listed; molasses is 4.9–5.4 (FDA) but brown sugar itself is not"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const POWDERED_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "powdered-sugar",
  name: "Powdered sugar",
  roles: ["sweetener", "tenderizer"],
  source: { kind: "fdc", key: "powdered-sugar", starch: "reported", sugarsAs: "sucrose" },
  gelatinizationTempC: { value: CORN_STARCH_GEL_ONSET.value, basis: basisOf("DERIVED", "ALLAN_2020", "its 1.3 g anti-caking starch is cornstarch") },
  pH: phRange(5.0, 6.0, "CLEMSON_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const HONEY: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "honey",
  name: "Honey",
  roles: ["sweetener", "moisture", "acid", "browning"],
  source: { kind: "fdc", key: "honey", starch: "none" },
  pH: phRange(3.7, 4.2, "FDA_PH"),
  acidMmolPerG: declared<number | null>(0.03, "free acidity, mmol per g: Codex caps honey at 0.05; typical honeys sit lower", "CODEX_HONEY"),
  notes: ["77 g of honey's 82 g sugar is fructose and glucose — REDUCING sugars, which brown far faster than sucrose; and 17 g water per 100 g joins the hydration."],
});

export const MAPLE_SYRUP: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "maple-syrup",
  name: "Maple syrup",
  roles: ["sweetener", "moisture", "flavor"],
  source: { kind: "fdc", key: "maple-syrup", starch: "none" },
  pH: { value: 5.15, basis: basisOf("MEASURED", "FDA_PH") },
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const MAPLE_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "maple-sugar",
  name: "Maple sugar (crystals)",
  roles: ["sweetener", "tenderizer", "flavor"],
  source: { kind: "fdc", key: "maple-sugar", starch: "none", sugarsAs: "sucrose" },
  pH: absent("not listed; maple syrup is 5.15 (FDA) but maple sugar itself is not"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Maple syrup boiled to crystals: FDC reports its 84.9 g sugars unspeciated, taken as sucrose (the syrup's own speciation is 96 % sucrose)."],
});

export const MOLASSES: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "molasses",
  name: "Molasses",
  roles: ["sweetener", "moisture", "acid", "browning", "flavor"],
  source: { kind: "fdc", key: "molasses", starch: "none" },
  pH: phRange(4.9, 5.4, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["24.7 of its 74.7 g sugars are glucose and fructose — reducing, so molasses browns fast; and it is acidic enough to react with soda, by an amount no source here quantifies."],
});

export const CORN_SYRUP: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "corn-syrup",
  name: "Corn syrup (light)",
  roles: ["sweetener", "moisture", "browning"],
  source: { kind: "fdc", key: "corn-syrup", starch: "none" },
  pH: { value: 5, basis: basisOf("MEASURED", "CLEMSON_PH") },
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["FDC reports 76.8 g sugars unspeciated: glucose, maltose and longer glucose chains whose shares vary by grade, so its sweetness and softening are excluded rather than guessed."],
});

/** Invert syrup at a stated 80 °Brix, fully inverted: COMPUTED by the hydrolysis stoichiometry. */
function invertSyrup(): IngredientSpec["source"] {
  const solids = 80;
  const sucroseHydrolysed = (solids * MOLAR_MASS.sucrose) / (2 * MOLAR_MASS.hexose);
  const sugars = { ...emptySugars(), glucose: solids / 2, fructose: solids / 2 };
  return {
    kind: "custom",
    composition: { water: 100 - solids, protein: 0, fat: 0, carbohydrate: solids, fiber: 0, ash: 0, ethanol: 0, starch: 0, sugars: solids },
    sugars,
    basis: basisOf("COMPUTED", "CIAAW_2021", `a stated preparation: 80 g solids per 100 g, fully inverted (C₁₂H₂₂O₁₁ + H₂O → 2 C₆H₁₂O₆) from ${sucroseHydrolysed.toFixed(1)} g sucrose`),
    sugarBasis: basisOf("COMPUTED", "CIAAW_2021", "equimolar glucose and fructose — equal masses, both C₆H₁₂O₆"),
  };
}

export const INVERT_SUGAR_SYRUP: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "invert-sugar-syrup",
  name: "Invert sugar syrup (80 °Brix)",
  roles: ["sweetener", "moisture", "browning"],
  source: invertSyrup(),
  pH: absent("depends on the acid used to invert it"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Commercial invert syrups vary (70–80 % solids, partial inversion). This entry is the stated 80 °Brix, fully inverted preparation."],
});

export const ALLULOSE: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "allulose",
  name: "Allulose (crystalline)",
  roles: ["sweetener", "tenderizer", "browning"],
  source: {
    kind: "custom",
    composition: { water: 0, protein: 0, fat: 0, carbohydrate: 100, fiber: 0, ash: 0, ethanol: 0, starch: 0, sugars: 100 },
    sugars: { ...emptySugars(), allulose: 100 },
    basis: basisOf("DECLARED", "MODEL", "a stated reference substance: pure anhydrous crystalline D-allulose (C₆H₁₂O₆); commercial grades are ≥ 98.5 %"),
    sugarBasis: basisOf("DECLARED", "MODEL", "all of it is allulose by definition of the entry"),
  },
  pH: absent("not measured"),
  acidMmolPerG: NEUTRAL_ACID,
  notes: ["A reducing hexose with ~70 % of sucrose's sweetness but nearly twice its colligative power per gram: softer, browner, less sweet."],
});

export const COCONUT_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "coconut-sugar",
  name: "Coconut sugar",
  roles: ["sweetener", "tenderizer", "browning", "flavor"],
  source: { kind: "fdc", key: "brown-sugar", starch: "none" },
  pH: absent("not in the FDA or Clemson tables consulted"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["USDA SR Legacy and Foundation publish no unbranded coconut-palm sugar record; FDC 'Sugars, brown' (168833, ~95 % sucrose with ~2.5 % invert sugars and 0.45 % mineral ash) stands in."],
});

export const DATE_SUGAR: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "date-sugar",
  name: "Date sugar (ground dried dates)",
  roles: ["sweetener", "tenderizer", "browning", "flavor"],
  source: { kind: "fdc", key: "pitted-dates", starch: "none" },
  pH: phRange(5.3, 6.2, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["Date sugar is finely ground dehydrated dates: composition is FDC 'Dates, deglet noor' (171726), which carries the fruit's 8 g fibre per 100 g alongside its 63.4 g speciated sucrose, glucose and fructose."],
});

export const BROWN_RICE_SYRUP: BakingIngredient = defineIngredient({
  ...SWEETENER,
  id: "brown-rice-syrup",
  name: "Brown rice syrup",
  roles: ["sweetener", "moisture", "browning"],
  source: { kind: "fdc", key: "corn-syrup", starch: "none" },
  pH: absent("not in the FDA or Clemson tables consulted"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["USDA SR Legacy and Foundation publish no unbranded brown rice syrup record; FDC 'Syrups, corn, light' (168837, an enzyme-hydrolysed starch syrup at 76.8 % carbohydrate solids and 22.8 % water) stands in."],
});

export const SWEETENERS: readonly BakingIngredient[] = [
  GRANULATED_SUGAR,
  BROWN_SUGAR,
  POWDERED_SUGAR,
  HONEY,
  MAPLE_SYRUP,
  MAPLE_SUGAR,
  MOLASSES,
  CORN_SYRUP,
  INVERT_SUGAR_SYRUP,
  ALLULOSE,
  COCONUT_SUGAR,
  DATE_SUGAR,
  BROWN_RICE_SYRUP,
];

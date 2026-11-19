/**
 * Fruit, vegetable, seed, and nut inclusions — added 2026-11-19 to cover the
 * site's single-batter muffins, quick breads, bars, cookies, crackers, and
 * flatbreads.
 *
 * @file src/data/baking/ingredients/fruitAndSeeds.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, declared, phRange } from "../basis";
import { LIQUID_OIL_SFI, NEUTRAL_ACID, NO_FIBRE_BINDING, NO_GLUTEN, NO_LIPID_PHASE, NO_SETTING, NO_STARCH_GEL, UNQUANTIFIED_ACID } from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const INCLUSION: Pick<IngredientSpec, "category" | "glutenPotency" | "coagulation" | "gelatinizationTempC" | "fiberWaterBinding"> = {
  category: "inclusion_flavor",
  glutenPotency: NO_GLUTEN,
  coagulation: NO_SETTING,
  gelatinizationTempC: NO_STARCH_GEL,
  fiberWaterBinding: NO_FIBRE_BINDING,
};

const PRODUCE: Pick<IngredientSpec, "solidFatIndex" | "meltingPointC"> = {
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
};

const SEED_OR_NUT: Pick<IngredientSpec, "roles" | "solidFatIndex" | "meltingPointC" | "acidMmolPerG"> = {
  roles: ["fat", "tenderizer", "flavor"],
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: NO_LIPID_PHASE,
  acidMmolPerG: UNQUANTIFIED_ACID,
};

export const BLUEBERRIES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "blueberries",
  name: "Blueberries (fresh)",
  roles: ["moisture", "sweetener", "flavor"],
  source: { kind: "fdc", key: "blueberries", starch: "reported" },
  pH: phRange(3.12, 3.33, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const FRESH_CRANBERRIES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "fresh-cranberries",
  name: "Cranberries (fresh)",
  roles: ["moisture", "acid", "flavor"],
  source: { kind: "fdc", key: "fresh-cranberries", starch: "reported" },
  pH: phRange(2.3, 2.52, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const SHREDDED_COCONUT: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "shredded-coconut",
  name: "Shredded coconut (unsweetened)",
  roles: ["fat", "tenderizer", "flavor"],
  source: { kind: "fdc", key: "shredded-coconut", starch: "none", sugarsAs: "sucrose" },
  solidFatIndex: declared<number | null>(0.35, "representative coconut-fat solid fraction at 20 °C"),
  meltingPointC: declared<number | null>(25, "representative clear point of coconut fat"),
  pH: phRange(5.5, 7.8, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const GRATED_CARROT: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "grated-carrot",
  name: "Carrot (grated)",
  roles: ["moisture", "sweetener", "flavor"],
  source: { kind: "fdc", key: "grated-carrot", starch: "reported" },
  pH: phRange(5.88, 6.4, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const ZUCCHINI: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "zucchini",
  name: "Zucchini (grated)",
  roles: ["moisture", "tenderizer"],
  source: { kind: "fdc", key: "zucchini", starch: "reported" },
  pH: phRange(5.69, 6.1, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const APPLE: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "apple",
  name: "Apple (raw)",
  roles: ["moisture", "sweetener", "flavor"],
  source: { kind: "fdc", key: "apple", starch: "reported" },
  pH: phRange(3.3, 4.0, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const PEAR: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "pear",
  name: "Pear (raw)",
  roles: ["moisture", "sweetener", "flavor"],
  source: { kind: "fdc", key: "pear", starch: "none" },
  pH: phRange(3.5, 4.6, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const POTATO: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "potato",
  name: "Potato (mashed)",
  roles: ["moisture", "tenderizer"],
  source: { kind: "fdc", key: "potato", starch: "reported" },
  pH: phRange(5.4, 5.9, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const DRIED_FIGS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "dried-figs",
  name: "Dried figs",
  roles: ["sweetener", "moisture", "flavor"],
  source: { kind: "fdc", key: "dried-figs", starch: "reported" },
  pH: phRange(4.6, 5.8, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const PITTED_DATES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "pitted-dates",
  name: "Pitted dates",
  roles: ["sweetener", "moisture", "flavor"],
  source: { kind: "fdc", key: "pitted-dates", starch: "none" },
  pH: phRange(5.3, 6.2, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const DRIED_APRICOTS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "dried-apricots",
  name: "Dried apricots",
  roles: ["sweetener", "moisture", "flavor"],
  source: { kind: "fdc", key: "dried-apricots", starch: "reported" },
  pH: phRange(3.3, 4.0, "FDA_PH"),
  acidMmolPerG: UNQUANTIFIED_ACID,
});

export const DRIED_CHERRIES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...PRODUCE,
  id: "dried-cherries",
  name: "Dried cherries",
  roles: ["sweetener", "flavor"],
  source: { kind: "fdc", key: "dried-cranberries", starch: "none" },
  pH: absent("not in the FDA or Clemson tables consulted"),
  acidMmolPerG: UNQUANTIFIED_ACID,
  notes: ["USDA SR Legacy and Foundation publish no dried cherry record; FDC 'Cranberries, dried, sweetened' (171723) stands in as a dried berry inclusion."],
});

export const OLIVES: BakingIngredient = defineIngredient({
  ...INCLUSION,
  id: "olives",
  name: "Olives (pitted)",
  roles: ["fat", "moisture", "flavor"],
  source: { kind: "fdc", key: "olives", starch: "none" },
  solidFatIndex: LIQUID_OIL_SFI,
  meltingPointC: NO_LIPID_PHASE,
  pH: phRange(6.0, 7.5, "FDA_PH"),
  acidMmolPerG: NEUTRAL_ACID,
});

export const POPPY_SEEDS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "poppy-seeds",
  name: "Poppy seeds",
  source: { kind: "fdc", key: "poppy-seeds", starch: "none" },
  pH: absent("not found in the pH tables consulted"),
});

export const SESAME_SEEDS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "sesame-seeds",
  name: "Sesame seeds",
  source: { kind: "fdc", key: "sesame-seeds", starch: "none" },
  pH: absent("not found in the pH tables consulted"),
});

export const SUNFLOWER_SEEDS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "sunflower-seeds",
  name: "Sunflower seed kernels",
  source: { kind: "fdc", key: "sunflower-seeds", starch: "none" },
  pH: absent("not found in the pH tables consulted"),
});

export const FLAXSEED: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "flaxseed",
  name: "Flaxseed",
  source: { kind: "fdc", key: "flaxseed", starch: "none" },
  pH: absent("not found in the pH tables consulted"),
});

export const PISTACHIOS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "pistachios",
  name: "Pistachios",
  source: { kind: "fdc", key: "pistachios", starch: "reported" },
  pH: absent("not found in the pH tables consulted"),
});

export const CASHEWS: BakingIngredient = defineIngredient({
  ...INCLUSION,
  ...SEED_OR_NUT,
  id: "cashews",
  name: "Cashews",
  source: { kind: "fdc", key: "cashews", starch: "none" },
  pH: absent("not found in the pH tables consulted"),
});

export const FRUIT_AND_SEEDS: readonly BakingIngredient[] = [
  BLUEBERRIES,
  FRESH_CRANBERRIES,
  SHREDDED_COCONUT,
  GRATED_CARROT,
  ZUCCHINI,
  APPLE,
  PEAR,
  POTATO,
  DRIED_FIGS,
  PITTED_DATES,
  DRIED_APRICOTS,
  DRIED_CHERRIES,
  OLIVES,
  POPPY_SEEDS,
  SESAME_SEEDS,
  SUNFLOWER_SEEDS,
  FLAXSEED,
  PISTACHIOS,
  CASHEWS,
];

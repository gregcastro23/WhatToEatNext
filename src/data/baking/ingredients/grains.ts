/**
 * Grains, meals and starches beyond the white wheat flours — added
 * 2026-11-16 because the site's own baked recipes use them: whole wheat
 * pastry flour alone appears in 40 lines of the served catalogue.
 *
 * Where a claim borrows another species' measurement (spelt and durum starch
 * read as wheat starch) the borrowing is DECLARED and says so; where nothing
 * was found (oat starch onset) the value is ABSENT, never a neighbour's.
 *
 * @file src/data/baking/ingredients/grains.ts
 */
import type { BakingIngredient } from "@/lib/baking/types";
import { absent, basisOf, declared, derived } from "../basis";
import {
  CASSAVA_STARCH_GEL_ONSET,
  CORN_STARCH_GEL_ONSET,
  GLUTEN_SETTING,
  NEUTRAL_ACID,
  NO_FIBRE_BINDING,
  NO_GLUTEN,
  NO_LIPID_PHASE,
  NO_SETTING,
  WHEAT_GLUTEN_POTENCY,
  WHEAT_PH,
  WHEAT_STARCH_GEL_ONSET,
} from "../common";
import { defineIngredient, type IngredientSpec } from "../defineIngredient";

const GRAIN: Pick<IngredientSpec, "category" | "solidFatIndex" | "meltingPointC" | "fiberWaterBinding" | "acidMmolPerG"> = {
  category: "flour_grain",
  solidFatIndex: NO_LIPID_PHASE,
  meltingPointC: NO_LIPID_PHASE,
  fiberWaterBinding: NO_FIBRE_BINDING,
  acidMmolPerG: NEUTRAL_ACID,
};

/** A non-aestivum wheat read with bread wheat's claims, each one stated as borrowed. */
function borrowedWheat(species: string): Pick<IngredientSpec, "glutenPotency" | "coagulation" | "gelatinizationTempC" | "pH"> {
  return {
    glutenPotency: declared(WHEAT_GLUTEN_POTENCY.value, `${species} is a wheat; bread wheat's gluten share of protein (Wieser 2007) is applied`, "WIESER_2007"),
    coagulation: { value: GLUTEN_SETTING.value, basis: basisOf("DECLARED", "ROMBOUTS_2012", `bread-wheat gluten setting window applied to ${species}`) },
    gelatinizationTempC: declared<number | null>(WHEAT_STARCH_GEL_ONSET.value, `${species} starch read as wheat starch (Allan et al. 2020 onset); no ${species} measurement was read`, "ALLAN_2020"),
    pH: { value: WHEAT_PH.value, basis: basisOf("DECLARED", "CLEMSON_PH", `Clemson's unspecified "Flour" 6.0–6.3 applied to ${species}`) },
  };
}

const NON_WHEAT: Pick<IngredientSpec, "glutenPotency" | "coagulation"> = { glutenPotency: NO_GLUTEN, coagulation: NO_SETTING };

export const WHOLE_WHEAT_PASTRY_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  id: "whole-wheat-pastry-flour",
  name: "Whole wheat pastry flour",
  roles: ["structure", "tenderizer"],
  source: { kind: "fdc", key: "whole-wheat-pastry-flour", starch: "by-difference" },
  glutenPotency: WHEAT_GLUTEN_POTENCY,
  coagulation: GLUTEN_SETTING,
  gelatinizationTempC: WHEAT_STARCH_GEL_ONSET,
  pH: WHEAT_PH,
  notes: ["Whole-grain SOFT wheat (FDC 168944), 9.6 g protein: the pastry counterpart of whole wheat flour. FDC publishes no household portion for it."],
});

export const SPELT_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...borrowedWheat("spelt"),
  id: "spelt-flour",
  name: "Spelt flour (whole)",
  roles: ["structure"],
  source: { kind: "fdc", key: "spelt-flour", starch: "reported" },
  notes: ["Composition is FDC 'Spelt, uncooked', the whole grain: whole spelt flour is that grain milled. Its 1 cup = 174 g portion weighs grain, not flour, and is not used for a flour line."],
});

export const SEMOLINA: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...borrowedWheat("durum"),
  id: "semolina",
  name: "Semolina (durum)",
  roles: ["structure"],
  source: { kind: "fdc", key: "semolina", starch: "by-difference" },
  notes: ["Durum gluten is stronger but less extensible than bread wheat's; only its protein figure differs here."],
});

export const CORNMEAL: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "cornmeal",
  name: "Cornmeal (whole-grain, yellow)",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "cornmeal", starch: "by-difference" },
  gelatinizationTempC: derived<number | null>(CORN_STARCH_GEL_ONSET.value, "ALLAN_2020", "cornmeal's starch is corn starch: the dent-corn DSC onset"),
  pH: absent("Clemson lists the vegetable (corn 5.9–7.5), not the meal"),
  notes: ["Whole-grain meal chosen over degermed: 3.6 g fat and 7.3 g fibre per 100 g against degermed's lower figures. A recipe's 'cornmeal' does not say which."],
});

export const ROLLED_OATS: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "rolled-oats",
  name: "Rolled oats",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "rolled-oats", starch: "reported" },
  gelatinizationTempC: absent("no DSC onset for oat starch was found in the sources read: its starch sets nothing in the simulator"),
  pH: absent("FDA lists cooked oatmeal (6.2–6.6), not dry oats"),
  flour: { share: 0, waterPct: 0, basis: basisOf("DECLARED", "MODEL", "whole flakes are an inclusion, not part of the baker's flour base") },
  notes: ["Oats carry no gluten-forming protein (avenin does not network). Flakes keep their shape: they are counted out of the baker's percentage base."],
});

export const RICE_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "rice-flour",
  name: "Rice flour (white)",
  roles: ["structure"],
  source: { kind: "fdc", key: "rice-flour", starch: "by-difference" },
  gelatinizationTempC: derived<number | null>(59.2, "WANG_2018", "rice flour's starch is rice starch: the native rice starch DSC onset at water:starch 2.0 (v/w), 10 °C/min"),
  pH: absent("FDA lists cooked rice, not rice flour"),
});

export const TAPIOCA_STARCH: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "tapioca-starch",
  name: "Tapioca starch",
  roles: ["structure", "binder"],
  source: { kind: "fdc", key: "tapioca-starch", starch: "by-difference" },
  gelatinizationTempC: { value: CASSAVA_STARCH_GEL_ONSET.value, basis: basisOf("DERIVED", "CASSAVA_DSC_2019", "tapioca is cassava starch: midpoint of the cassava variety onsets 56.33–63.00 °C") },
  pH: absent("not found in the pH tables consulted"),
  notes: ["Composition is FDC 'Tapioca, pearl, dry' — the same cassava starch, pearled. Its 1 cup = 152 g weighs pearls, not powder, and is not used for a starch line."],
});

export const SORGHUM_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "sorghum-flour",
  name: "Sorghum flour (whole-grain)",
  roles: ["structure"],
  source: { kind: "fdc", key: "sorghum-flour", starch: "reported" },
  gelatinizationTempC: declared<number | null>(CORN_STARCH_GEL_ONSET.value, "sorghum is a C4 panicoid cereal alongside maize; dent-corn starch DSC onset (Allan et al. 2020) is applied", "ALLAN_2020"),
  pH: absent("not found in the pH tables consulted"),
});

export const BUCKWHEAT_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "buckwheat-flour",
  name: "Buckwheat flour (whole-groat)",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "buckwheat-flour", starch: "by-difference" },
  gelatinizationTempC: declared<number | null>(WHEAT_STARCH_GEL_ONSET.value, "buckwheat starch onset read as wheat starch (Allan et al. 2020); no buckwheat DSC measurement in the sources read", "ALLAN_2020"),
  pH: absent("not found in the pH tables consulted"),
});

export const BROWN_RICE_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "brown-rice-flour",
  name: "Brown rice flour",
  roles: ["structure"],
  source: { kind: "fdc", key: "brown-rice-flour", starch: "by-difference" },
  gelatinizationTempC: derived<number | null>(59.2, "WANG_2018", "brown rice flour's starch is rice starch: the native rice starch DSC onset (Wang et al. 2018)"),
  pH: absent("FDA lists cooked rice, not rice flour"),
});

export const SWEET_RICE_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "sweet-rice-flour",
  name: "Sweet (glutinous) rice flour",
  roles: ["structure", "binder"],
  source: { kind: "fdc", key: "sweet-rice-flour", starch: "by-difference" },
  gelatinizationTempC: derived<number | null>(59.2, "WANG_2018", "waxy rice starch read at the native rice starch DSC onset (Wang et al. 2018)"),
  pH: absent("FDA lists cooked rice, not rice flour"),
  notes: ["Composition is FDC 'Rice, white, glutinous, unenriched, uncooked': sweet rice flour is that grain milled. Its 1 cup = 185 g weighs whole grain, so white rice flour's measured cup (158 g) stands in for a flour line."],
});

export const BARLEY_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  id: "barley-flour",
  name: "Barley flour",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "barley-flour", starch: "by-difference" },
  glutenPotency: declared(0.15, "barley hordein does not form an elastic network on its own; a low residual potency is declared"),
  coagulation: { value: GLUTEN_SETTING.value, basis: basisOf("DECLARED", "ROMBOUTS_2012", "Triticeae prolamin setting window applied to barley") },
  gelatinizationTempC: declared<number | null>(WHEAT_STARCH_GEL_ONSET.value, "barley is a Triticeae cereal alongside wheat; wheat starch DSC onset (Allan et al. 2020) is applied", "ALLAN_2020"),
  pH: absent("not found in the pH tables consulted"),
});

export const RYE_FLOUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  id: "rye-flour",
  name: "Rye flour (medium)",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "rye-flour", starch: "by-difference" },
  glutenPotency: declared(0.2, "rye secalin is hindered by arabinoxylans from forming a wheat-like gluten network; a reduced potency is declared"),
  coagulation: { value: GLUTEN_SETTING.value, basis: basisOf("DECLARED", "ROMBOUTS_2012", "Triticeae prolamin setting window applied to rye") },
  gelatinizationTempC: declared<number | null>(WHEAT_STARCH_GEL_ONSET.value, "rye is a Triticeae cereal alongside wheat; wheat starch DSC onset (Allan et al. 2020) is applied", "ALLAN_2020"),
  pH: absent("not found in the pH tables consulted"),
});

export const ARROWROOT_STARCH: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "arrowroot-starch",
  name: "Arrowroot starch (flour)",
  roles: ["structure", "binder", "tenderizer"],
  source: { kind: "fdc", key: "arrowroot-starch", starch: "by-difference" },
  gelatinizationTempC: { value: CASSAVA_STARCH_GEL_ONSET.value, basis: basisOf("DECLARED", "CASSAVA_DSC_2019", "arrowroot is a tropical root starch alongside cassava; the cassava DSC onset midpoint is applied") },
  pH: absent("not found in the pH tables consulted"),
});

export const BULGUR: BakingIngredient = defineIngredient({
  ...GRAIN,
  ...NON_WHEAT,
  id: "bulgur",
  name: "Bulgur wheat",
  roles: ["structure", "flavor"],
  source: { kind: "fdc", key: "bulgur", starch: "by-difference" },
  gelatinizationTempC: absent("parboiled cracked wheat kernels are an inclusion, not a flour that sets the crumb"),
  pH: absent("not found in the pH tables consulted"),
  flour: { share: 0, waterPct: 0, basis: basisOf("DECLARED", "MODEL", "parboiled cracked kernels are an inclusion, not part of the baker's flour base") },
});

export const GRAINS: readonly BakingIngredient[] = [
  WHOLE_WHEAT_PASTRY_FLOUR,
  SPELT_FLOUR,
  SEMOLINA,
  CORNMEAL,
  ROLLED_OATS,
  RICE_FLOUR,
  TAPIOCA_STARCH,
  SORGHUM_FLOUR,
  BUCKWHEAT_FLOUR,
  BROWN_RICE_FLOUR,
  SWEET_RICE_FLOUR,
  BARLEY_FLOUR,
  RYE_FLOUR,
  ARROWROOT_STARCH,
  BULGUR,
];

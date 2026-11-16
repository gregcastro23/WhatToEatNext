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

export const GRAINS: readonly BakingIngredient[] = [WHOLE_WHEAT_PASTRY_FLOUR, SPELT_FLOUR, SEMOLINA, CORNMEAL, ROLLED_OATS, RICE_FLOUR, TAPIOCA_STARCH];

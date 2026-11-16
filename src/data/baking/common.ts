/**
 * Functional claims shared by several ingredients — stated once, so a
 * correction lands everywhere it applies.
 *
 * @file src/data/baking/common.ts
 */
import type { Composition, SugarProfile } from "@/lib/baking/types";
import { absent, basisOf, declared, derived, measured, none, phRange, type Valued } from "./basis";
import type { CoagulationWindow } from "./defineIngredient";

export const WHEAT_GLUTEN_POTENCY = measured(0.8, "WIESER_2007", "gluten proteins are ~80–85 % of wheat flour protein; the lower bound is taken");
export const WHEAT_STARCH_GEL_ONSET = measured(60.78, "ALLAN_2020", "wheat starch DSC onset in water, starch:water 1:2");
export const CORN_STARCH_GEL_ONSET = measured(66.19, "ALLAN_2020", "dent corn starch DSC onset in water");
export const CASSAVA_STARCH_GEL_ONSET = derived(59.665, "CASSAVA_DSC_2019", "midpoint of the variety onset range 56.33–63.00 °C");
export const WHEAT_PH = phRange(6.0, 6.3, "CLEMSON_PH");

export const GLUTEN_SETTING: Valued<CoagulationWindow | null> = {
  value: { onsetC: 60, endC: 75 },
  basis: basisOf("DECLARED", "ROMBOUTS_2012", "end 75 °C: gliadin and glutenin are both networked above it; onset 60 °C declared (glutenin polymerises first; no primary onset found)"),
};

export const EGG_WHITE_SETTING: Valued<CoagulationWindow | null> = {
  value: { onsetC: 65, endC: 84 },
  basis: basisOf("MEASURED", "DONOVAN_1975", "DSC peaks of conalbumin (~65 °C) and ovalbumin (~84 °C) at pH 7"),
};

export const EGG_YOLK_SETTING: Valued<CoagulationWindow | null> = {
  value: { onsetC: 69, endC: 75 },
  basis: basisOf("MEASURED", "PJFNS_YOLK", "native yolk denatures from 69 °C; LDL aggregates to a grainy gel above 75 °C"),
};

export const NO_SETTING: Valued<CoagulationWindow | null> = absent("no protein that sets into structure");
export const NO_GLUTEN = none("no gluten-forming protein (not wheat, rye or barley)");
export const NO_STARCH_GEL = absent("no starch that gelatinizes into structure");
export const NO_FIBRE_BINDING = declared(0, "fibre water-binding not modelled for this ingredient");
export const NEUTRAL_ACID = declared<number | null>(0, "near-neutral (pH ≥ 6) or no aqueous phase: no bicarbonate-reactive acid counted");
export const UNQUANTIFIED_ACID = absent("acidic, but its titratable acidity was not quantified — excluded from the acid–base balance");
export const NO_LIPID_PHASE = absent("no functional lipid phase");

/** Milk fat — butter, cream, milk. No SFC curve was found in the 2026-11-15 literature pass. */
export const MILK_FAT_SFI = declared<number | null>(0.25, "representative milk-fat solid fraction at 20 °C; no measured SFC curve was found");
export const MILK_FAT_MELT = declared<number | null>(37, "representative clear point of milk fat");

/** Cocoa butter — chocolate and cocoa powder. */
export const COCOA_BUTTER_SFI = declared<number | null>(0.75, "representative cocoa-butter solid fraction at 20 °C");
export const COCOA_BUTTER_MELT = measured<number | null>(33.8, "WILLE_LUTTON_1966", "form V, the tempered form");

/** Liquid at 20 °C: no solid fat to cream. */
export const LIQUID_OIL_SFI = declared<number | null>(0, "liquid at 20 °C");

export function emptySugars(): SugarProfile {
  return { sucrose: 0, glucose: 0, fructose: 0, lactose: 0, maltose: 0, galactose: 0, allulose: 0, unspeciated: 0 };
}

/** `a·x + b·y`, field by field. */
export function blend(a: number, x: Composition, b: number, y: Composition): Composition {
  return {
    water: a * x.water + b * y.water,
    protein: a * x.protein + b * y.protein,
    fat: a * x.fat + b * y.fat,
    carbohydrate: a * x.carbohydrate + b * y.carbohydrate,
    fiber: a * x.fiber + b * y.fiber,
    ash: a * x.ash + b * y.ash,
    ethanol: a * x.ethanol + b * y.ethanol,
    starch: a * x.starch + b * y.starch,
    sugars: a * x.sugars + b * y.sugars,
  };
}

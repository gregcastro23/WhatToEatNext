/**
 * Volumetrics — turning a volume into a mass, and a batch into an energy.
 *
 * Four separate questions, all of which a recipe implicitly asks and none of
 * which the codebase could answer before this:
 *
 *   1. MEASUREMENT   what does "1 cup" of this actually weigh?
 *   2. PACKING       how much of that cup is air?
 *   3. ENERGY        what does heating this batch cost, latent terms included?
 *   4. CHANGE        how much smaller is it when the water has gone?
 *
 * @file src/lib/cooking/volumetrics.ts
 */
import {
  PORTIONS_BY_INGREDIENT,
  type MeasuredPortion,
  type VolumeMeasure,
} from "@/data/cooking/measuredPortions";
import { componentDensity, foodProperties, type MassFractions } from "@/lib/cooking/choiOkos";
import {
  evaporativeEnergyLoss,
  foodFusionEnthalpy,
  latentHeatVaporisation,
} from "@/lib/cooking/latentHeat";

// ============================================================================
// 1. Measurement — volume to mass
// ============================================================================

/**
 * Nominal volume of each measure, millilitres.
 *
 * BASIS: the US customary cup as USDA uses it, 236.588 mL (exactly 8 US fluid
 * ounces), with tbsp = cup/16 and tsp = cup/48. NOT the 240 mL "legal cup" used
 * on nutrition labels — mixing the two is a 1.4 % error that would sit
 * underneath everything here.
 */
export const MEASURE_ML: Record<VolumeMeasure, number> = {
  cup: 236.588,
  tbsp: 236.588 / 16,
  tsp: 236.588 / 48,
};

/** Where a gram figure came from, so a caller can tell measured from modelled. */
export type MassBasis =
  /** USDA published a measured weight for this ingredient and measure. */
  | "usda-measured"
  /** Derived from the ingredient's own composition — valid for LIQUIDS only. */
  | "composition-derived";

export interface VolumeConversion {
  grams: number;
  basis: MassBasis;
  /** The FDC record backing a measured figure. */
  fdcId?: number;
  note?: string;
}

/**
 * What a given volume of a named ingredient weighs.
 *
 * ⚠️ RETURNS NULL RATHER THAN GUESSING. The function this replaces assumed
 * water density for everything and therefore always returned a number. That is
 * the defect: `[MEASURED 2026-08-18]` across the 1,078-recipe corpus the water
 * assumption overstates the mass of volume-measured ingredients by 11.6 %, and
 * a cup of chopped cilantro by **15×** (240 g assumed, 16 g measured).
 *
 * A null here means "nobody has measured this" and the caller must say so.
 * Silently substituting water is how a 15× error survives.
 */
export function volumeToMass(
  ingredient: string,
  amount: number,
  measure: VolumeMeasure,
): VolumeConversion | null {
  if (!(amount >= 0)) {
    throw new RangeError(`amount must be non-negative, received ${amount}`);
  }
  const row = PORTIONS_BY_INGREDIENT.get(ingredient.trim().toLowerCase());
  const perUnit = row?.gramsPer[measure];
  if (row === undefined || perUnit === undefined) return null;
  return {
    grams: amount * perUnit,
    basis: "usda-measured",
    fdcId: row.fdcId,
    note: `${row.fdcDescription} (FDC ${row.fdcId})`,
  };
}

/** The measured row behind an ingredient, if there is one. */
export function measuredPortionFor(ingredient: string): MeasuredPortion | undefined {
  return PORTIONS_BY_INGREDIENT.get(ingredient.trim().toLowerCase());
}

// ============================================================================
// 2. Packing — how much of that cup is air
// ============================================================================

export interface PackingAnalysis {
  /** Density of the material itself, kg·m⁻³ (Choi & Okos). */
  trueDensityKgM3: number;
  /** Density as actually scooped, kg·m⁻³ (measured weight ÷ nominal volume). */
  bulkDensityKgM3: number;
  /**
   * Void fraction — the share of the measured volume that is air, 0–1.
   *
   * Near zero for a liquid, where true and bulk density coincide. Large for
   * anything granular or leafy: flour is about 0.64, chopped herbs far more.
   * This is the `ε` term in ASHRAE Eq 6, and the reason composition alone
   * cannot convert a cup of a powder.
   */
  porosity: number;
}

/**
 * Compare what a material weighs with what a cup of it weighs.
 *
 * A negative porosity is not a rounding artefact — it means the bulk density
 * exceeds the true density, which is physically impossible and indicates the
 * measured portion and the composition describe different preparations (a
 * packed cup against a raw whole vegetable, say). It is returned as computed
 * rather than clamped, so that disagreement stays visible.
 */
export function analysePacking(
  fractions: MassFractions,
  gramsPerMeasure: number,
  measure: VolumeMeasure,
  celsius = 20,
): PackingAnalysis {
  const trueDensityKgM3 = foodProperties(fractions, celsius).densityKgM3;
  // g per mL → kg per m³ is ×1000.
  const bulkDensityKgM3 = (gramsPerMeasure / MEASURE_ML[measure]) * 1000;
  return {
    trueDensityKgM3,
    bulkDensityKgM3,
    porosity: 1 - bulkDensityKgM3 / trueDensityKgM3,
  };
}

// ============================================================================
// 3. Energy — what a batch costs to heat
// ============================================================================

export interface ThermalLoad {
  /** Energy to change the temperature, J. */
  sensibleJ: number;
  /** Energy spent evaporating water off, J. Zero when nothing is lost. */
  latentJ: number;
  totalJ: number;
  /** What share of the total is latent. The number that surprises people. */
  latentShare: number;
  /** Minutes at a given burner power. */
  minutesAt(watts: number): number;
}

/**
 * Energy to take a batch from one temperature to another, latent terms included.
 *
 * The volumetric statement of why doubling a recipe does not double the time —
 * the ENERGY doubles, but the burner's power did not, so the time doubles while
 * the surface area available to deliver it barely changes.
 *
 * @param massKg Batch mass.
 * @param fractions Composition, for the specific heat.
 * @param fromC Starting temperature, °C.
 * @param toC Target temperature, °C.
 * @param massLossFraction Share of the batch's mass evaporated on the way, 0–1.
 */
export function batchThermalLoad(
  massKg: number,
  fractions: MassFractions,
  fromC: number,
  toC: number,
  massLossFraction = 0,
): ThermalLoad {
  if (!(massKg > 0)) throw new RangeError(`massKg must be positive, received ${massKg}`);
  // Evaluate properties at the midpoint — specific heat varies across the span,
  // and using either endpoint biases the answer in a predictable direction.
  const midC = (fromC + toC) / 2;
  const { specificHeatJkgK } = foodProperties(fractions, midC);
  const sensibleJ = massKg * specificHeatJkgK * (toC - fromC);
  // Evaporation happens at the surface, which sits at the higher temperature.
  const latentJ =
    massLossFraction > 0 ? massKg * evaporativeEnergyLoss(massLossFraction, Math.max(fromC, toC)) : 0;
  const totalJ = sensibleJ + latentJ;
  return {
    sensibleJ,
    latentJ,
    totalJ,
    latentShare: totalJ === 0 ? 0 : latentJ / totalJ,
    minutesAt(watts: number): number {
      if (!(watts > 0)) throw new RangeError(`watts must be positive, received ${watts}`);
      return totalJ / watts / 60;
    },
  };
}

/** Energy to freeze or thaw a batch, J. */
export function batchFusionLoad(massKg: number, waterMassFraction: number): number {
  if (!(massKg > 0)) throw new RangeError(`massKg must be positive, received ${massKg}`);
  return massKg * foodFusionEnthalpy(waterMassFraction);
}

// ============================================================================
// 4. Change — volume after the water has gone
// ============================================================================

export interface VolumeChange {
  /** Remaining mass as a fraction of the original. */
  massRatio: number;
  /** Remaining volume as a fraction of the original. */
  volumeRatio: number;
  /** Water left, as a mass fraction of the REMAINING food. */
  finalWaterFraction: number;
}

/**
 * How a food shrinks as it loses water.
 *
 * Volume falls faster than mass, because the water leaving is the least dense
 * thing in there: the solids left behind pack into less space than the mixture
 * occupied. This is why a reduction concentrates flavour faster than the mass
 * loss alone suggests, and why a roast's visible shrinkage overstates its
 * weight loss.
 *
 * Modelled by recomputing the composition after removing water and asking
 * Choi & Okos for the new density — so it follows from the same correlation as
 * everything else rather than being an independent rule of thumb.
 */
export function volumeAfterMoistureLoss(
  fractions: MassFractions,
  massLossFraction: number,
  celsius = 20,
): VolumeChange {
  if (!(massLossFraction >= 0 && massLossFraction < 1)) {
    throw new RangeError(`massLossFraction must be in [0, 1), received ${massLossFraction}`);
  }
  const fibre = fractions.fibre ?? 0;
  if (massLossFraction > fractions.water) {
    throw new RangeError(
      `cannot lose ${massLossFraction} of the mass as water when the food is only ` +
        `${fractions.water} water — the remainder would have to come from the solids, ` +
        `which is rendering or pyrolysis, not evaporation.`,
    );
  }
  const massRatio = 1 - massLossFraction;
  // Solids are unchanged in absolute terms; their FRACTION rises.
  const scale = 1 / massRatio;
  const after: MassFractions = {
    water: (fractions.water - massLossFraction) * scale,
    protein: fractions.protein * scale,
    fat: fractions.fat * scale,
    carbohydrate: fractions.carbohydrate * scale,
    ash: fractions.ash * scale,
    fibre: fibre * scale,
  };
  const before = foodProperties(fractions, celsius).densityKgM3;
  const afterDensity = foodProperties(after, celsius).densityKgM3;
  // volume = mass / density, both relative to the original.
  return {
    massRatio,
    volumeRatio: (massRatio * before) / afterDensity,
    finalWaterFraction: after.water,
  };
}

/**
 * Volume change on freezing, as a ratio of the original.
 *
 * Water expands about 9 % on becoming ice, and only the FREEZABLE water does
 * it — which is why the expansion of a food is much smaller than the expansion
 * of the water it contains, and why a full container of stock splits while a
 * full container of oil does not.
 */
export function volumeOnFreezing(
  fractions: MassFractions,
  celsius = -18,
): { volumeRatio: number; note: string } {
  const liquid = foodProperties(fractions, 1).densityKgM3;
  // Recompute with the freezable water as ICE. `foodProperties` has no ice
  // slot, so this is done via the density ratio of the two phases directly.
  const waterRho = componentDensity("water", 1);
  const iceRho = componentDensity("ice", celsius);
  const freezable = fractions.water * 0.8;
  // Volume per kg of food: unchanged parts, plus the frozen part re-expanded.
  const beforeVol = 1 / liquid;
  const afterVol = beforeVol - freezable / waterRho + freezable / iceRho;
  return {
    volumeRatio: afterVol / beforeVol,
    note: "Only the freezable ~80 % of the water expands; bound water stays liquid.",
  };
}

/** Latent enthalpy available in a batch, for comparison against the sensible load. */
export function batchVaporisationCeiling(
  massKg: number,
  waterMassFraction: number,
  celsius: number,
): number {
  if (!(massKg > 0)) throw new RangeError(`massKg must be positive, received ${massKg}`);
  return massKg * waterMassFraction * latentHeatVaporisation(celsius);
}

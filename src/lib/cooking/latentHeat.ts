/**
 * Latent heat — the energy a phase change costs, and why it dominates cooking.
 *
 * Sensible heat gets the attention because it is what a thermometer shows, but
 * the latent terms are an order of magnitude larger and they are what actually
 * limits most methods:
 *
 *   heating 1 kg of water from 20 → 100 °C   ≈  335 kJ
 *   BOILING that same kilogram away          ≈ 2257 kJ
 *
 * Nearly seven times more energy to evaporate the water than to bring it to the
 * boil. That ratio is why an uncovered pot stalls below its setpoint, why a wet
 * surface cannot pass 100 °C and therefore cannot brown, and why condensing
 * steam moves heat three times better than boiling water at the same
 * temperature — the condensation gives the surface all of it back.
 *
 * ── The four transitions this file covers ───────────────────────────────────
 *
 *   evaporation    water leaving a surface. The dominant term in dry-heat
 *                  cooking, and an energy SINK.
 *   condensation   the same magnitude arriving, a SOURCE. Steaming is this.
 *   fusion         ice ⇄ water. Only the FREEZABLE water participates.
 *   fat melting    a smeared range, not a point, and genuinely uncertain.
 *
 * @file src/lib/cooking/latentHeat.ts
 */

// ============================================================================
// Vaporisation
// ============================================================================

/**
 * ── RECONCILIATION: the two h_fg values in this repo ───────────────────────
 *
 * There are deliberately TWO enthalpies of vaporisation, and they disagree by
 * 0.6848 % at their single overlap point:
 *
 *   this file          `latentHeatVaporisation(100)` → 2 272 456.9 J·kg⁻¹
 *   boundaryNetwork.ts  WATER_TABLE h_fg @ 373.15 K  → 2 257 000   J·kg⁻¹
 *
 * THIS IS NOT DUPLICATION AND MUST NOT BE UNIFIED. They are different
 * quantities with different bases and different validity domains:
 *
 *   - WATER_TABLE's value is a TRANSCRIBED ROW of Incropera & DeWitt Table A.6
 *     at the normal boiling point (373.15 K, 101.325 kPa). It is the steam-table
 *     ground truth AT THAT ONE STATE, and it is the value every boiling,
 *     condensation and lid-balance correlation uses — those correlations were
 *     fitted against the same tables.
 *   - This file's value is a LINEAR FIT in kelvin, valid 0–100 °C. It exists
 *     because evaporation happens at arbitrary sub-boiling surface temperatures
 *     where the table has no row, and interpolating a 2-point table would be a
 *     worse fit than the published one.
 *
 * Collapsing them breaks something real in BOTH directions. Forcing this
 * function to return 2 257 000 at 100 °C stops it reproducing from its stated
 * basis, which is the repo's provenance rule. Editing the table row corrupts a
 * transcription that is load-bearing in the Prandtl closure check — the same
 * check that already caught a bad viscosity transcription on that exact row.
 *
 * More importantly, the disagreement is a FEATURE. Two independent sources
 * landing within 1 % of each other is corroboration; one source can only ever
 * agree with itself. `cookingBoundaryNetwork.test.ts` pins the gap from both
 * sides, so a silent drift AND a well-meant unification both fail.
 *
 * WHICH TO USE: at or about the boiling point, or inside any correlation drawn
 * from the steam tables, use `saturatedWaterProperties(t).hfgJkg`. For
 * evaporation at a surface temperature below boiling, use this function.
 *
 * Enthalpy of vaporisation of water, J·kg⁻¹.
 *
 * BASIS: Fleagle & Andreas, *Atmospheric Dynamics*, as the linear fit
 * `Δh = 3.121×10⁶ − 2.274×10³·T` with T in KELVIN, giving J·kg⁻¹.
 *
 * ⚠️ VALIDITY IS 0–100 °C, AND THIS REFUSES OUTSIDE IT. `[MEASURED 2026-08-18]`
 * against steam-table saturation values the fit sits within 0.75 % across that
 * range — 0.04 % at 0 °C, 0.04 % at 20 °C, 0.71 % at 100 °C — but degrades to
 * 2.1 % by 150 °C. A linear fit to a curve that must reach ZERO at the critical
 * point cannot be extended; it stays finite and wrong. Superheated steam is a
 * different problem and needs a steam table.
 *
 * The temperature dependence is not a detail: evaporating water at 20 °C costs
 * 2454 kJ·kg⁻¹ and at 100 °C costs 2257 kJ·kg⁻¹, an 8 % difference between a
 * drying surface and a boiling one.
 */
export function latentHeatVaporisation(celsius: number): number {
  if (!(celsius >= VAPORISATION_MIN_C && celsius <= VAPORISATION_MAX_C)) {
    throw new RangeError(
      `latentHeatVaporisation is fitted for ${VAPORISATION_MIN_C}–${VAPORISATION_MAX_C} °C, ` +
        `received ${celsius}. The fit is linear and the true curve falls to zero at the ` +
        `critical point, so extrapolating returns a confident wrong number.`,
    );
  }
  return FLEAGLE_INTERCEPT_J_KG - FLEAGLE_SLOPE_J_KG_K * (celsius + KELVIN_OFFSET);
}

/** Fleagle & Andreas intercept, J·kg⁻¹ at 0 K. */
const FLEAGLE_INTERCEPT_J_KG = 3.121e6;
/** Fleagle & Andreas slope, J·kg⁻¹·K⁻¹. */
const FLEAGLE_SLOPE_J_KG_K = 2.274e3;
/** 0 °C in kelvin. */
const KELVIN_OFFSET = 273.15;

export const VAPORISATION_MIN_C = 0;
export const VAPORISATION_MAX_C = 100;

// ============================================================================
// Fusion
// ============================================================================

/** International Table BTU, joules. Exact by definition. */
const BTU_IT_J = 1055.05585262;
/** Pound, kilograms. Exact by definition. */
const POUND_KG = 0.45359237;

/**
 * Latent heat of fusion of PURE water, J·kg⁻¹.
 *
 * BASIS: 1998 ASHRAE Refrigeration Handbook Ch. 8, which states
 * `Lo = 143.4 Btu/lb` in its apparent-specific-heat models. Converted here
 * rather than transcribed as 333 550, so the constant regenerates from its own
 * stated basis — 1 Btu/lb is exactly 2326 J/kg.
 */
export const WATER_FUSION_J_KG = 143.4 * (BTU_IT_J / POUND_KG);

/**
 * Fraction of a food's water that will NOT freeze at ordinary freezer
 * temperatures.
 *
 * ⚠️ NOT A ROUNDING — this is the single most important correction in the
 * freezing calculation, and omitting it overstates the load by 25 %.
 *
 * BASIS: bound water is held by solutes and macromolecules and depresses out of
 * reach; the food-freezing literature converges on treating the latent release
 * as about 80 % of what the total water content would suggest. A rigorous
 * treatment resolves the ice fraction as a continuous function of temperature
 * below the initial freezing point (ASHRAE Ch. 8 Eq 4/5), which needs the food's
 * own initial freezing point — a datum this codebase does not hold. This
 * constant is the honest standing-in for that, and it is labelled as such.
 */
export const BOUND_WATER_FRACTION = 0.2;

/**
 * The part of a food's water that can actually freeze, as a mass fraction OF
 * THE FOOD.
 *
 * @param waterMassFraction Total water in the food, 0–1.
 */
export function freezableWaterFraction(waterMassFraction: number): number {
  assertFraction(waterMassFraction, "waterMassFraction");
  return waterMassFraction * (1 - BOUND_WATER_FRACTION);
}

/**
 * Energy to freeze or thaw one kilogram of FOOD, J·kg⁻¹.
 *
 * This is per kg of food, not per kg of water — the distinction that makes it
 * directly comparable with a specific heat.
 */
export function foodFusionEnthalpy(waterMassFraction: number): number {
  return freezableWaterFraction(waterMassFraction) * WATER_FUSION_J_KG;
}

// ============================================================================
// Evaporation from a food
// ============================================================================

/**
 * Energy to evaporate ALL the water out of one kilogram of food, J·kg⁻¹.
 *
 * A ceiling, not a prediction — no cooking process drives a food to zero
 * moisture. It is useful as the scale against which a real moisture loss is
 * read: losing 5 % of a chicken breast's mass to steam is 5 % of the *mass* and
 * a far larger share of the *energy* than the sensible heating alongside it.
 */
export function foodVaporisationEnthalpy(waterMassFraction: number, celsius: number): number {
  assertFraction(waterMassFraction, "waterMassFraction");
  return waterMassFraction * latentHeatVaporisation(celsius);
}

/**
 * Energy carried away by evaporating a given fraction of a food's MASS.
 *
 * `massLossFraction` is loss as a share of the food's starting mass — the thing
 * a scale measures — not a share of its water.
 */
export function evaporativeEnergyLoss(massLossFraction: number, celsius: number): number {
  assertFraction(massLossFraction, "massLossFraction");
  return massLossFraction * latentHeatVaporisation(celsius);
}

// ============================================================================
// Fat melting
// ============================================================================

/** A quantity known only to within a range, with the range stated. */
export interface EnthalpyBand {
  /** J·kg⁻¹ */
  low: number;
  /** J·kg⁻¹ */
  typical: number;
  /** J·kg⁻¹ */
  high: number;
  /** Why this is a band and not a number. */
  note: string;
}

/**
 * Enthalpy of fusion of culinary fat, J·kg⁻¹ of FAT.
 *
 * ⚠️ A BAND, DELIBERATELY. Unlike water, whose fusion enthalpy is a physical
 * constant to five figures, a fat's depends on its fatty-acid profile AND on
 * which polymorphic crystal form it happens to be in — the same fat can differ
 * by tens of percent between its α, β′ and β forms. Reported values for animal
 * fats span roughly 125–210 kJ·kg⁻¹.
 *
 * Publishing a single figure here would be inventing a precision that the
 * quantity does not have. Anything consuming this should carry the band through
 * to whatever it shows a reader.
 *
 * BASIS: the animal-fat lipid range reported in the triglyceride
 * enthalpy-of-fusion literature (≈30–50 cal·g⁻¹); the midpoint is a midpoint,
 * not a measurement.
 */
export const FAT_FUSION_BAND: EnthalpyBand = {
  low: 125e3,
  typical: 167e3,
  high: 210e3,
  note:
    "Depends on fatty-acid profile and polymorphic form (α/β′/β), which cooking " +
    "itself changes. The midpoint is the middle of the reported range, not a measured value.",
};

/**
 * Melting range of culinary fat, °C.
 *
 * Fat does not melt at a point. Beef fat begins softening around 25 °C and is
 * not fully liquid until nearer 45 °C, which is why "render slowly" is advice
 * about staying inside a range rather than crossing a threshold.
 */
export const FAT_MELTING_RANGE_C = { low: 25, high: 45 } as const;

/** Fat-melting enthalpy per kilogram of FOOD, as a band. */
export function foodFatMeltingEnthalpy(fatMassFraction: number): EnthalpyBand {
  assertFraction(fatMassFraction, "fatMassFraction");
  return {
    low: fatMassFraction * FAT_FUSION_BAND.low,
    typical: fatMassFraction * FAT_FUSION_BAND.typical,
    high: fatMassFraction * FAT_FUSION_BAND.high,
    note: FAT_FUSION_BAND.note,
  };
}

// ============================================================================
// Comparison against sensible heat
// ============================================================================

/**
 * How many kelvin of sensible heating one phase change is worth.
 *
 * The single most clarifying number in this file. Evaporating just 5 % of a
 * food's mass costs about the same energy as raising the whole thing by 30 °C —
 * which is why moisture loss, not the oven dial, sets the pace of a roast.
 *
 * @param latentJkg The latent term, J·kg⁻¹ of food.
 * @param specificHeatJkgK The food's specific heat — from `choiOkos.ts`.
 */
export function latentAsTemperatureRise(latentJkg: number, specificHeatJkgK: number): number {
  if (!(specificHeatJkgK > 0)) {
    throw new RangeError(`specificHeatJkgK must be positive, received ${specificHeatJkgK}`);
  }
  return latentJkg / specificHeatJkgK;
}

function assertFraction(value: number, name: string): void {
  if (!(value >= 0 && value <= 1)) {
    throw new RangeError(
      `${name} must be a mass fraction in [0, 1], received ${value}. ` +
        `A value above 1 is probably a percentage.`,
    );
  }
}

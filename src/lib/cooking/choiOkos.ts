/**
 * Thermophysical properties of a food from its composition — Choi & Okos (1986).
 *
 * Density, specific heat and thermal conductivity predicted from the five
 * proximate mass fractions, as functions of temperature. These are the numbers
 * the transient-conduction solver in `thermo.ts` needs and has so far had to
 * take as a single hardcoded "lean muscle" triple: `LEAN_MEAT_K_W_M_K = 0.45`,
 * `LEAN_MEAT_RHO_KG_M3 = 1050`, `LEAN_MEAT_C_J_KG_K = 3500`. That triple is
 * fine for a steak and wrong for a potato, an egg or a stick of butter.
 *
 * ── BASIS ───────────────────────────────────────────────────────────────────
 *
 * Choi, Y. and M.R. Okos (1986), *Effects of Temperature and Composition on the
 * Thermal Properties of Foods*, as tabulated in the **1998 ASHRAE Refrigeration
 * Handbook, Chapter 8 "Thermal Properties of Foods", Tables 1 and 2**, with the
 * mixture rules from that chapter's Equations 6, 7, 35 and 36.
 *
 * ⚠️ THE PUBLISHED COEFFICIENTS ARE IMPERIAL, AND THEY ARE STORED THAT WAY.
 *
 * ASHRAE prints Table 1 for −40 °F ≤ t ≤ 300 °F, with k in Btu/(h·ft·°F), ρ in
 * lb/ft³ and cp in Btu/(lb·°F). Re-fitting them into °C/SI form would produce
 * numbers that no longer match anything a reader can look up, and the arithmetic
 * to do so is exactly the kind of silent transcription this codebase has been
 * bitten by before. So the coefficients below are byte-for-byte what the table
 * prints, evaluation happens in °F, and the RESULT is converted using factors
 * derived from the exact SI definitions of the BTU, the pound and the foot.
 *
 * A worked example from the same chapter (lamb, Example 2) is reproduced by the
 * test suite as an external anchor, so the whole chain — coefficients, °C↔°F,
 * unit conversion, mixture rule — is pinned to a published answer rather than to
 * itself.
 *
 * ── ON FIBRE ────────────────────────────────────────────────────────────────
 *
 * Choi & Okos treat fibre as its own component. USDA reports *carbohydrate by
 * difference*, which ALREADY INCLUDES fibre. Passing USDA carbohydrate as
 * `carbohydrate` with `fibre` left at zero is therefore the correct reading of
 * the data we hold, not an omission — double-counting it would be the error.
 *
 * @file src/lib/cooking/choiOkos.ts
 */

// ============================================================================
// Unit conversion — derived from exact definitions, never transcribed
// ============================================================================

/** International Table BTU, joules. Exact by definition. */
const BTU_IT_J = 1055.05585262;
/** Pound, kilograms. Exact by definition. */
const POUND_KG = 0.45359237;
/** Foot, metres. Exact by definition. */
const FOOT_M = 0.3048;
/** A Fahrenheit degree is 5/9 of a kelvin. */
const F_DEGREE_IN_K = 5 / 9;

/** Btu/(h·ft·°F) → W/(m·K). */
const K_IMPERIAL_TO_SI = BTU_IT_J / (3600 * FOOT_M * F_DEGREE_IN_K);
/** lb/ft³ → kg/m³. */
const RHO_IMPERIAL_TO_SI = POUND_KG / (FOOT_M * FOOT_M * FOOT_M);
/** Btu/(lb·°F) → J/(kg·K). Works out to exactly 4186.8. */
const CP_IMPERIAL_TO_SI = BTU_IT_J / (POUND_KG * F_DEGREE_IN_K);

function cToF(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

// ============================================================================
// Validity
// ============================================================================

/** Lower bound of the Choi & Okos fits, °C. ASHRAE Table 1 states −40 °F. */
export const CHOI_OKOS_MIN_C = -40;
/**
 * Upper bound of the Choi & Okos fits, °C. ASHRAE Table 1 states 300 °F.
 *
 * `[MEASURED]` 300 °F is 148.888…88 °C, so this is stored as the conversion of
 * the published bound rather than a rounded 150 — the difference decides
 * whether a 149 °C reading is inside a fit or an extrapolation.
 */
export const CHOI_OKOS_MAX_C = (300 - 32) * (5 / 9);

/** Water's freezing point, the boundary between the two water-cp fits, °F. */
const WATER_FREEZE_F = 32;

// ============================================================================
// Published coefficients — ASHRAE 1998 Ch. 8, Tables 1 and 2
// ============================================================================

/** The components Choi & Okos fit separately. */
export type FoodComponent =
  | "water"
  | "protein"
  | "fat"
  | "carbohydrate"
  | "fibre"
  | "ash"
  | "ice";

/** Polynomial in t (°F): a + b·t + c·t². */
type Poly = readonly [number, number, number];

function evalPoly([a, b, c]: Poly, tF: number): number {
  return a + b * tF + c * tF * tF;
}

/** Thermal conductivity, Btu/(h·ft·°F). ASHRAE Table 1 (components), Table 2 (water/ice). */
const K_BTU: Record<FoodComponent, Poly> = {
  protein: [9.0535e-2, 4.1486e-4, -4.8467e-7],
  fat: [1.3273e-1, -8.8405e-4, -3.1652e-8],
  carbohydrate: [1.0133e-1, 4.9478e-4, -7.7238e-7],
  fibre: [9.2499e-2, 4.3731e-4, -5.65e-7],
  ash: [1.7553e-1, 4.8292e-4, -5.1839e-7],
  water: [3.1064e-1, 6.4226e-4, -1.1955e-6],
  ice: [1.3652, -3.1648e-3, 1.8108e-5],
};

/** Density, lb/ft³. The component fits are LINEAR; only water is quadratic. */
const RHO_LB: Record<FoodComponent, Poly> = {
  protein: [8.3599e1, -1.7979e-2, 0],
  fat: [5.8246e1, -1.4482e-2, 0],
  carbohydrate: [1.0017e2, -1.0767e-2, 0],
  fibre: [8.228e1, -1.269e-2, 0],
  ash: [1.5162e2, -9.7329e-3, 0],
  water: [6.2174e1, 4.7425e-3, -7.2397e-5],
  ice: [5.7385e1, -4.5333e-3, 0],
};

/** Specific heat, Btu/(lb·°F). Water is split at 32 °F — see {@link CP_WATER_BELOW_FREEZING}. */
const CP_BTU: Record<FoodComponent, Poly> = {
  protein: [4.7442e-1, 1.6661e-4, -9.6784e-8],
  fat: [4.673e-1, 2.1815e-4, -3.5391e-7],
  carbohydrate: [3.6114e-1, 2.8843e-4, -4.3788e-7],
  fibre: [4.3276e-1, 2.6485e-4, -3.4285e-7],
  ash: [2.5266e-1, 2.681e-4, -2.7141e-7],
  /** The 32–300 °F fit. */
  water: [9.9827e-1, -3.7879e-5, 4.0347e-7],
  ice: [4.6677e-1, 8.0636e-4, 0],
};

/**
 * Specific heat of SUPERCOOLED water, −40 to 32 °F, Btu/(lb·°F).
 *
 * A separate fit, and materially different from the above-freezing one: at
 * −40 °F it gives 1.406 against the warm fit's 1.000. Applying the wrong branch
 * is a 40 % error in the one term that dominates almost every food's specific
 * heat, so the branch is explicit rather than an extrapolation.
 */
const CP_WATER_BELOW_FREEZING: Poly = [1.0725, -5.3992e-3, 7.3361e-5];

// ============================================================================
// Component properties, SI
// ============================================================================

function assertInRange(celsius: number): void {
  if (!(celsius >= CHOI_OKOS_MIN_C && celsius <= CHOI_OKOS_MAX_C)) {
    throw new RangeError(
      `temperature ${celsius} °C is outside the Choi & Okos fits ` +
        `(${CHOI_OKOS_MIN_C} to ${CHOI_OKOS_MAX_C.toFixed(2)} °C). ` +
        `Extrapolating these polynomials is not a smaller error, it is a different curve.`,
    );
  }
}

/** Thermal conductivity of a pure food component, W·m⁻¹·K⁻¹. */
export function componentConductivity(component: FoodComponent, celsius: number): number {
  assertInRange(celsius);
  return evalPoly(K_BTU[component], cToF(celsius)) * K_IMPERIAL_TO_SI;
}

/** Density of a pure food component, kg·m⁻³. */
export function componentDensity(component: FoodComponent, celsius: number): number {
  assertInRange(celsius);
  return evalPoly(RHO_LB[component], cToF(celsius)) * RHO_IMPERIAL_TO_SI;
}

/** Specific heat capacity of a pure food component, J·kg⁻¹·K⁻¹. */
export function componentSpecificHeat(component: FoodComponent, celsius: number): number {
  assertInRange(celsius);
  const tF = cToF(celsius);
  const poly =
    component === "water" && tF < WATER_FREEZE_F ? CP_WATER_BELOW_FREEZING : CP_BTU[component];
  return evalPoly(poly, tF) * CP_IMPERIAL_TO_SI;
}

// ============================================================================
// Mixture rules
// ============================================================================

/**
 * Mass fractions of the proximate components, each 0–1.
 *
 * `fibre` defaults to 0 — see the note on fibre in the file header. Fractions
 * are used as given and are NOT renormalised: a set that does not sum to 1 is
 * describing a food with unnamed mass (vanilla extract is a third ethanol), and
 * quietly scaling it up would invent composition the source did not measure.
 */
export interface MassFractions {
  water: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  ash: number;
  fibre?: number;
}

/** Derived thermophysical properties of a food at a temperature. */
export interface FoodThermophysicalProperties {
  /** kg·m⁻³ */
  densityKgM3: number;
  /** J·kg⁻¹·K⁻¹ */
  specificHeatJkgK: number;
  /** W·m⁻¹·K⁻¹ */
  conductivityWmK: number;
  /** m²·s⁻¹, derived as k/(ρ·cp). */
  diffusivityM2S: number;
  /**
   * How much mass the fractions failed to account for, 0 when they sum to 1.
   *
   * Carried on the RESULT, not just checked at the door, because it bounds how
   * far the answer can be trusted: the correlation has no term for whatever the
   * missing fraction is, so it silently treats it as nothing.
   */
  unaccountedFraction: number;
}

const COMPONENT_ORDER = ["water", "protein", "fat", "carbohydrate", "fibre", "ash"] as const;

function asRecord(f: MassFractions): Record<(typeof COMPONENT_ORDER)[number], number> {
  return {
    water: f.water,
    protein: f.protein,
    fat: f.fat,
    carbohydrate: f.carbohydrate,
    fibre: f.fibre ?? 0,
    ash: f.ash,
  };
}

/**
 * Thermophysical properties of a food from its composition.
 *
 * Mixture rules, all from ASHRAE 1998 Ch. 8:
 *
 *   density        ρ  = (1 − ε) / Σ(xᵢ/ρᵢ)            Eq 6, ε = porosity
 *   specific heat  cp = Σ xᵢ·cpᵢ                       Eq 7, MASS fractions
 *   conductivity   k  = Σ xᵢᵛ·kᵢ                       Eq 35, VOLUME fractions
 *                  xᵢᵛ = (xᵢ/ρᵢ) / Σ(xⱼ/ρⱼ)           Eq 36
 *
 * ⚠️ The conductivity rule takes VOLUME fractions and the specific-heat rule
 * takes MASS fractions. They are not interchangeable and the difference is
 * large: fat's density is barely half of ash's, so a fatty food's volume
 * fractions look nothing like its mass fractions.
 *
 * @param fractions Mass fractions, each 0–1. Not renormalised — see {@link MassFractions}.
 * @param celsius Temperature, °C. Must lie inside the published fit range.
 * @param porosity Void fraction, for granular foods stored in bulk. Zero otherwise.
 */
export function foodProperties(
  fractions: MassFractions,
  celsius: number,
  porosity = 0,
): FoodThermophysicalProperties {
  assertInRange(celsius);
  if (!(porosity >= 0 && porosity < 1)) {
    throw new RangeError(`porosity must be in [0, 1), received ${porosity}`);
  }
  const x = asRecord(fractions);
  for (const component of COMPONENT_ORDER) {
    const value = x[component];
    if (!(value >= 0 && value <= 1)) {
      throw new RangeError(
        `${component} fraction must be in [0, 1], received ${value}. ` +
          `USDA reports g per 100 g — a value above 1 is almost certainly grams, not a fraction.`,
      );
    }
  }

  let specificHeat = 0;
  let volumePerMass = 0;
  const componentVolumePerMass: number[] = [];

  for (const component of COMPONENT_ORDER) {
    const massFraction = x[component];
    specificHeat += massFraction * componentSpecificHeat(component, celsius);
    const share = massFraction / componentDensity(component, celsius);
    componentVolumePerMass.push(share);
    volumePerMass += share;
  }

  // Σ(xᵢ/ρᵢ) is zero only when every fraction is zero, which is not a food.
  if (!(volumePerMass > 0)) {
    throw new RangeError("every mass fraction is zero — there is no food to describe");
  }

  let conductivity = 0;
  COMPONENT_ORDER.forEach((component, i) => {
    const componentVolume = componentVolumePerMass[i];
    if (componentVolume === undefined) {
      throw new RangeError(`choiOkos: no volume-per-mass entry for ${component}`);
    }
    const volumeFraction = componentVolume / volumePerMass;
    conductivity += volumeFraction * componentConductivity(component, celsius);
  });

  const density = (1 - porosity) / volumePerMass;
  const total = COMPONENT_ORDER.reduce((sum, component) => sum + x[component], 0);

  return {
    densityKgM3: density,
    specificHeatJkgK: specificHeat,
    conductivityWmK: conductivity,
    diffusivityM2S: conductivity / (density * specificHeat),
    unaccountedFraction: 1 - total,
  };
}

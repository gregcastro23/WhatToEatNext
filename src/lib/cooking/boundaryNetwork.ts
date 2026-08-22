/**
 * Boundary network — the resistance chain from the heat source to the core.
 *
 * Everything before this file computed a *property*: what a food is made of,
 * what its density and conductivity are, how much energy a phase change costs.
 * None of it answered the question a cook actually asks, which is **where the
 * bottleneck is**. A steak in a 250 °C oven and a steak in 80 °C water are the
 * same steak; what differs is which link in the chain is slowest.
 *
 * ── The chain ───────────────────────────────────────────────────────────────
 *
 *   source ──▶ vessel outer wall ──▶ vessel inner wall ──▶ liquid ──▶ food
 *              R_out (convection)    R_wall (conduction)   R_in       surface
 *                                                                       │
 *                                                              R_int (conduction)
 *                                                                       ▼
 *                                                                     core
 *
 * Resistances in series ADD, so the total is dominated by the largest single
 * term and everything else is nearly free. That single fact reorganises a lot
 * of cooking folklore:
 *
 *  - In an oven the outside link is enormous (h ≈ 5–25 W·m⁻²·K⁻¹) and the
 *    food's interior is comparatively cheap — the air is the bottleneck, which
 *    is why convection ovens work and why a heavier pan barely matters.
 *  - In boiling water the outside link nearly vanishes (h ≈ 3 000–35 000) and
 *    the food's interior becomes the whole answer — which is why a thicker
 *    potato takes quadratically longer and stirring does nothing.
 *  - The pan wall is almost never the bottleneck. `[MEASURED 2026-08-18]` 3 mm
 *    of cast iron over 0.05 m² is 1.15e-3 K·W⁻¹, against 1.33 K·W⁻¹ for the air
 *    above it — **1156×**. Pans matter for *storage* and *evenness*, not for
 *    resistance, which is what the vessel registry's thermal mass is for.
 *
 * ── Evaporative flux ────────────────────────────────────────────────────────
 *
 * The chain above is a pure conduction/convection story and it is not enough,
 * because a wet surface is also a *heat sink*: every kilogram that leaves as
 * vapour takes ~2.3 MJ with it. That term is what pins an open pot below its
 * setpoint and holds a roast's surface far under the oven's air temperature
 * until it dries. It is computed here from the Chilton–Colburn analogy rather
 * than assumed.
 *
 * ── What is a correlation and what is a table ───────────────────────────────
 *
 * Everything here is one of three things, and each is labelled:
 *  - a TABLE transcribed from a named source, validated by its own internal
 *    redundancy (see {@link airProperties});
 *  - a published CORRELATION with a stated envelope, which refuses outside it;
 *  - an ANALOGY (Chilton–Colburn) whose assumptions are stated at the call.
 *
 * Nothing here is tuned. Where a correlation's own accuracy is worse than the
 * property data feeding it, that is said out loud rather than implied by
 * significant figures.
 *
 * @file src/lib/cooking/boundaryNetwork.ts
 */
import {
  biotNumber,
  characteristicLengthRatio,
  type FoodGeometry,
} from "@/lib/cooking/thermo";

// ============================================================================
// Physical constants
// ============================================================================

/**
 * Standard acceleration of gravity, m·s⁻². Exact by definition (CGPM 1901).
 *
 * Buoyancy-driven convection is the reason this appears in a cooking library:
 * the Rayleigh number is proportional to it.
 */
export const STANDARD_GRAVITY = 9.80665;

/** Molar mass of water, kg·mol⁻¹. IUPAC 2021 standard atomic weights. */
export const MOLAR_MASS_WATER = 0.01801528;

/** Universal gas constant, J·mol⁻¹·K⁻¹. Exact by the 2019 SI redefinition. */
export const GAS_CONSTANT = 8.31446261815324;

/** kPa → mmHg, matching `thermo.ts` so the two Antoine directions agree. */
const KPA_TO_MMHG = 7.500617;

/**
 * Antoine coefficients for water, P in mmHg and T in °C.
 *
 * The SAME triple as `thermo.ts` uses for the inverse direction. It is repeated
 * rather than imported because `thermo.ts` keeps it private, and a shared
 * mutable constant across two modules is how the Antoine envelope drifted apart
 * between runtimes once already. The parity fixture pins both directions, so a
 * divergence here fails a test rather than propagating.
 *
 * BASIS: Stull (1947), as tabulated in Dean, *Lange's Handbook of Chemistry*.
 * Validity 1–100 °C.
 */
const ANTOINE_WATER = { A: 8.07131, B: 1730.63, C: 233.426 } as const;

const ANTOINE_MIN_C = 1;
const ANTOINE_MAX_C = 100;

// ============================================================================
// Fluid property tables
// ============================================================================

/** A fluid's transport properties at one temperature. */
export interface FluidState {
  celsius: number;
  kelvin: number;
  /** Density, kg·m⁻³. */
  rhoKgM3: number;
  /** Specific heat at constant pressure, J·kg⁻¹·K⁻¹. */
  cpJkgK: number;
  /** Dynamic viscosity, Pa·s. */
  muPaS: number;
  /** Thermal conductivity, W·m⁻¹·K⁻¹. */
  kWmK: number;
  /** Kinematic viscosity μ/ρ, m²·s⁻¹. DERIVED. */
  nuM2s: number;
  /** Thermal diffusivity k/(ρ·cp), m²·s⁻¹. DERIVED. */
  alphaM2s: number;
  /** Prandtl number ν/α = μ·cp/k. DERIVED. */
  prandtl: number;
  /** Volumetric thermal expansion coefficient, K⁻¹. */
  betaPerK: number;
}

/**
 * Dry air at 1 atm: `[K, ρ kg·m⁻³, cp J·kg⁻¹·K⁻¹, μ Pa·s, k W·m⁻¹·K⁻¹]`.
 *
 * BASIS: Incropera & DeWitt, *Fundamentals of Heat and Mass Transfer*,
 * Table A.4 (thermophysical properties of gases at atmospheric pressure).
 * Range 250–800 K covers a freezer through a broiler.
 *
 * ── Why only four columns ───────────────────────────────────────────────────
 *
 * The printed table also gives ν, α and Pr, and every one of them is REDUNDANT:
 * ν ≡ μ/ρ, α ≡ k/(ρ·cp), Pr ≡ ν/α. Storing them would mean four more chances to
 * mistype and no more information. They are derived instead, and the printed
 * values are used in the test file as an external check on the transcription —
 * which is the only job they can usefully do.
 *
 * `[MEASURED 2026-08-18]` Derived Pr reproduces the table's printed Pr to
 * within **0.067 %** at every one of the twelve rows, worst case 500 K. That
 * closure is what says the four stored columns were copied correctly; a single
 * transposed digit in any of them breaks it.
 */
const AIR_TABLE: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [250, 1.3947, 1006, 159.6e-7, 22.3e-3],
  [300, 1.1614, 1007, 184.6e-7, 26.3e-3],
  [350, 0.995, 1009, 208.2e-7, 30.0e-3],
  [400, 0.8711, 1014, 230.1e-7, 33.8e-3],
  [450, 0.774, 1021, 250.7e-7, 37.3e-3],
  [500, 0.6964, 1030, 270.1e-7, 40.7e-3],
  [550, 0.6329, 1040, 288.4e-7, 43.9e-3],
  [600, 0.5804, 1051, 305.8e-7, 46.9e-3],
  [650, 0.5356, 1063, 322.5e-7, 49.7e-3],
  [700, 0.4975, 1075, 338.8e-7, 52.4e-3],
  [750, 0.4643, 1087, 354.6e-7, 54.9e-3],
  [800, 0.4354, 1099, 369.8e-7, 57.3e-3],
];

/** Lowest air temperature the table covers, °C. */
export const AIR_MIN_C = 250 - 273.15;
/** Highest air temperature the table covers, °C. */
export const AIR_MAX_C = 800 - 273.15;

/**
 * Saturated liquid water: `[K, ρ, cp, μ, k, σ N·m⁻¹, h_fg J·kg⁻¹]`.
 *
 * ⚠️ The h_fg column here (2257e3 at 373.15 K) intentionally DISAGREES with
 * `latentHeatVaporisation()` in latentHeat.ts by 0.6848 %. That is two
 * independent sources corroborating each other, not a bug — see the
 * RECONCILIATION block at the top of latentHeat.ts before "fixing" either.
 * Editing this column also breaks the Prandtl closure check below.
 *
 * BASIS: Incropera & DeWitt Table A.6 (thermophysical properties of saturated
 * water). Density is `1/v_f`; the rest are as printed.
 *
 * `[MEASURED 2026-08-18]` The same Pr closure holds here to within **0.71 %**,
 * and that band is not decoration — it is how a bad row was caught. The 373.15 K
 * viscosity was first transcribed as 279e-6, which closes to Pr = 1.730 against
 * the printed 1.76 (1.7 %, an outlier against every other row's ≤0.4 %). The
 * stored value is the independently-known **0.2818 mPa·s at 100 °C**, which
 * closes to 1.748 and puts that row back in family with the rest.
 */
const WATER_TABLE: ReadonlyArray<
  readonly [number, number, number, number, number, number, number]
> = [
  [280, 1000.0, 4198, 1422e-6, 582e-3, 74.8e-3, 2485e3],
  [290, 999.0, 4184, 1080e-6, 598e-3, 73.7e-3, 2461e3],
  [300, 997.0, 4179, 855e-6, 613e-3, 71.7e-3, 2438e3],
  [310, 993.05, 4178, 695e-6, 628e-3, 70.0e-3, 2414e3],
  [320, 989.12, 4180, 577e-6, 640e-3, 68.3e-3, 2390e3],
  [330, 984.25, 4184, 489e-6, 650e-3, 66.6e-3, 2366e3],
  [340, 979.43, 4188, 420e-6, 660e-3, 64.9e-3, 2342e3],
  [350, 973.71, 4195, 365e-6, 668e-3, 63.2e-3, 2317e3],
  [360, 967.12, 4203, 324e-6, 674e-3, 61.4e-3, 2291e3],
  [370, 960.61, 4214, 289e-6, 679e-3, 59.5e-3, 2265e3],
  [373.15, 957.85, 4217, 281.8e-6, 680e-3, 58.9e-3, 2257e3],
];

/** Lowest water temperature the table covers, °C. */
export const WATER_MIN_C = 280 - 273.15;
/** Highest water temperature the table covers, °C — the normal boiling point. */
export const WATER_MAX_C = 373.15 - 273.15;

/** Locate `x` in a sorted column and return the bracketing index + weight. */
function bracket(rows: ReadonlyArray<readonly number[]>, x: number): [number, number] {
  let lo = 0;
  for (let i = 1; i < rows.length; i += 1) {
    if (rows[i][0] <= x) lo = i;
  }
  if (lo === rows.length - 1) lo = rows.length - 2;
  const span = rows[lo + 1][0] - rows[lo][0];
  return [lo, (x - rows[lo][0]) / span];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Dry air properties at 1 atm, linearly interpolated in temperature.
 *
 * ⚠️ **REFUSES outside 250–800 K** rather than extrapolating. Air's viscosity
 * and conductivity are smooth but distinctly non-linear over this span, and the
 * failure mode of extrapolation is silent — the number stays plausible while
 * being wrong, which is the exact failure this codebase keeps meeting.
 *
 * β is `1/T` exactly, not interpolated: air is an ideal gas to well within the
 * table's own precision at 1 atm, and Incropera's own instruction for gases is
 * to use the ideal-gas value.
 *
 * @param tempC Air temperature, °C. Use the FILM temperature (mean of surface
 *              and bulk) when feeding a convection correlation.
 * @throws RangeError outside the tabulated range.
 */
export function airProperties(tempC: number): FluidState {
  if (!Number.isFinite(tempC) || tempC < AIR_MIN_C || tempC > AIR_MAX_C) {
    throw new RangeError(
      `air properties are tabulated over ${AIR_MIN_C.toFixed(2)}–${AIR_MAX_C.toFixed(2)} °C, ` +
        `received ${tempC}`,
    );
  }
  const kelvin = tempC + 273.15;
  const [i, t] = bracket(AIR_TABLE, kelvin);
  const rhoKgM3 = lerp(AIR_TABLE[i][1], AIR_TABLE[i + 1][1], t);
  const cpJkgK = lerp(AIR_TABLE[i][2], AIR_TABLE[i + 1][2], t);
  const muPaS = lerp(AIR_TABLE[i][3], AIR_TABLE[i + 1][3], t);
  const kWmK = lerp(AIR_TABLE[i][4], AIR_TABLE[i + 1][4], t);
  const nuM2s = muPaS / rhoKgM3;
  const alphaM2s = kWmK / (rhoKgM3 * cpJkgK);
  return {
    celsius: tempC,
    kelvin,
    rhoKgM3,
    cpJkgK,
    muPaS,
    kWmK,
    nuM2s,
    alphaM2s,
    prandtl: nuM2s / alphaM2s,
    betaPerK: 1 / kelvin,
  };
}

/** Saturated liquid water, plus the two properties only a liquid–vapour pair has. */
export interface WaterState extends FluidState {
  /** Surface tension against its own vapour, N·m⁻¹. */
  sigmaNm: number;
  /** Latent heat of vaporisation, J·kg⁻¹. */
  hfgJkg: number;
  /** Saturated vapour density, kg·m⁻³. DERIVED from the ideal gas law. */
  rhoVapourKgM3: number;
}

/**
 * Saturated liquid water properties, linearly interpolated.
 *
 * β is derived by central difference on the stored density column rather than
 * transcribed. `[MEASURED 2026-08-18]` that reproduces the published
 * 276e-6 K⁻¹ at 300 K as 2.984e-4 — **8.1 % high**, because differencing a
 * four-significant-figure column loses precision. It is used anyway and said
 * out loud: natural-convection h scales as Ra^¼ ∝ β^¼, so 8.1 % in β is
 * **1.97 % in h**, against the Churchill–Chu correlation's own ±20–30 %.
 * Transcribing a fifth column to chase 2 % inside a 25 % envelope would be
 * false precision.
 *
 * ⚠️ REFUSES above the normal boiling point. Past 100 °C at 1 atm there is no
 * saturated *liquid* to have properties, and the caller has a phase-change
 * problem rather than a property lookup.
 *
 * @throws RangeError outside 6.85–100 °C.
 */
export function saturatedWaterProperties(tempC: number): WaterState {
  if (!Number.isFinite(tempC) || tempC < WATER_MIN_C || tempC > WATER_MAX_C) {
    throw new RangeError(
      `saturated water properties are tabulated over ${WATER_MIN_C.toFixed(2)}–` +
        `${WATER_MAX_C.toFixed(2)} °C, received ${tempC}`,
    );
  }
  const kelvin = tempC + 273.15;
  const [i, t] = bracket(WATER_TABLE, kelvin);
  const rhoKgM3 = lerp(WATER_TABLE[i][1], WATER_TABLE[i + 1][1], t);
  const cpJkgK = lerp(WATER_TABLE[i][2], WATER_TABLE[i + 1][2], t);
  const muPaS = lerp(WATER_TABLE[i][3], WATER_TABLE[i + 1][3], t);
  const kWmK = lerp(WATER_TABLE[i][4], WATER_TABLE[i + 1][4], t);
  const sigmaNm = lerp(WATER_TABLE[i][5], WATER_TABLE[i + 1][5], t);
  const hfgJkg = lerp(WATER_TABLE[i][6], WATER_TABLE[i + 1][6], t);
  const nuM2s = muPaS / rhoKgM3;
  const alphaM2s = kWmK / (rhoKgM3 * cpJkgK);

  // β = −(1/ρ)(∂ρ/∂T), central difference over the bracketing rows.
  const lo = Math.max(0, i - (t < 0.5 ? 1 : 0));
  const hi = Math.min(WATER_TABLE.length - 1, lo + 2);
  const betaPerK =
    -(WATER_TABLE[hi][1] - WATER_TABLE[lo][1]) /
    (rhoKgM3 * (WATER_TABLE[hi][0] - WATER_TABLE[lo][0]));

  const satKpa = saturationPressureKpa(Math.min(tempC, ANTOINE_MAX_C));
  return {
    celsius: tempC,
    kelvin,
    rhoKgM3,
    cpJkgK,
    muPaS,
    kWmK,
    nuM2s,
    alphaM2s,
    prandtl: nuM2s / alphaM2s,
    betaPerK,
    sigmaNm,
    hfgJkg,
    rhoVapourKgM3: vapourDensityKgM3(satKpa, tempC),
  };
}

// ============================================================================
// Vapour pressure and humidity
// ============================================================================

/**
 * Saturation vapour pressure of water, kPa — the FORWARD Antoine direction.
 *
 * `thermo.ts`'s `boilingPointC` is the inverse of this same curve. Having both
 * is not duplication of a constant (they share the one triple) but it IS a
 * round-trip that can be tested, and the parity fixture tests it: feeding this
 * function's output back through `boilingPointC` must return the input.
 *
 * @throws RangeError outside 1–100 °C, the Antoine validity window.
 */
export function saturationPressureKpa(tempC: number): number {
  if (!Number.isFinite(tempC) || tempC < ANTOINE_MIN_C || tempC > ANTOINE_MAX_C) {
    throw new RangeError(
      `saturation pressure is valid over ${ANTOINE_MIN_C}–${ANTOINE_MAX_C} °C ` +
        `(Antoine, water), received ${tempC}`,
    );
  }
  const { A, B, C } = ANTOINE_WATER;
  return Math.pow(10, A - B / (C + tempC)) / KPA_TO_MMHG;
}

/**
 * Density of water vapour at a stated partial pressure and temperature,
 * kg·m⁻³, from the ideal gas law.
 *
 * `[MEASURED 2026-08-18]` At the normal boiling point this gives 0.58842
 * against the steam table's 0.5956 — **1.21 % low**, because saturated steam is not
 * quite ideal. It is derived rather than tabulated anyway: the alternative is a
 * transcribed column used in exactly one correlation whose own scatter is
 * ±30 %, and a derived value cannot fall out of step with the pressure it came
 * from.
 */
export function vapourDensityKgM3(partialPressureKpa: number, tempC: number): number {
  return (partialPressureKpa * 1000 * MOLAR_MASS_WATER) / (GAS_CONSTANT * (tempC + 273.15));
}

/**
 * Absolute humidity of moist air, kg of water per m³.
 *
 * ⚠️ **REFUSES above 100 °C, and the reason is physics rather than an envelope.**
 * Relative humidity is a fraction of the saturation pressure, and above the
 * normal boiling point that saturation pressure exceeds the total pressure —
 * 15.5 bar at 200 °C. "10 % RH" would then mean 1.55 bar of vapour inside a
 * 1 bar oven, which is not a small error but an impossible state. Hot air is
 * not "dry" because its RH is low; RH has stopped being the right variable.
 *
 * For hot air, state the vapour content directly — {@link humidAirVapourDensity}
 * carries an ambient RH up to oven temperature the way a vented oven actually
 * does it.
 *
 * @param tempC Air temperature, °C.
 * @param relativeHumidityPct 0–100.
 */
export function absoluteHumidityKgM3(tempC: number, relativeHumidityPct: number): number {
  if (relativeHumidityPct < 0 || relativeHumidityPct > 100) {
    throw new RangeError(`relative humidity must be 0–100 %, received ${relativeHumidityPct}`);
  }
  if (tempC > ANTOINE_MAX_C) {
    throw new RangeError(
      `relative humidity is not a usable variable at ${tempC} °C: saturation pressure exceeds ` +
        `atmospheric above ${ANTOINE_MAX_C} °C, so any RH implies more vapour than the air can ` +
        `hold at 1 atm. State the vapour density directly (see humidAirVapourDensity).`,
    );
  }
  const partial = saturationPressureKpa(tempC) * (relativeHumidityPct / 100);
  return vapourDensityKgM3(partial, tempC);
}

/**
 * Vapour density of kitchen air that has been heated to `airC`, kg·m⁻³.
 *
 * A domestic oven is vented: its atmosphere is room air that got hot, so its
 * vapour *mole fraction* is the kitchen's and its vapour *density* is lower,
 * because the same molecules now occupy more volume. At constant pressure and
 * constant composition `ρ_v ∝ 1/T`, so the correction is the temperature ratio.
 *
 * `[MEASURED 2026-08-18]` A kitchen at 20 °C and 50 % RH carries
 * 8.61 g·m⁻³. At 200 °C that same air carries **5.33 g·m⁻³** — a 38 % fall
 * that is pure expansion, no water removed. Skipping it overstates the air's
 * ability to hold back evaporation and biases every surface temperature upward.
 *
 * @param ambientC Kitchen air temperature, °C.
 * @param relativeHumidityPct Kitchen relative humidity, 0–100.
 * @param airC Temperature the air has been heated to, °C.
 */
export function humidAirVapourDensity(
  ambientC: number,
  relativeHumidityPct: number,
  airC: number,
): number {
  const ambient = absoluteHumidityKgM3(ambientC, relativeHumidityPct);
  return (ambient * (ambientC + 273.15)) / (airC + 273.15);
}

// ============================================================================
// Convection correlations
// ============================================================================

/**
 * Rayleigh number — buoyancy driving force against viscous and thermal damping.
 *
 * `Ra = g·β·ΔT·L³/(ν·α)`. It is the single input to every natural-convection
 * correlation below, and the L³ is why vessel size matters so much more than
 * intuition suggests: doubling a pot's height multiplies Ra by eight.
 */
export function rayleighNumber(fluid: FluidState, deltaTK: number, lengthM: number): number {
  return (
    (STANDARD_GRAVITY * fluid.betaPerK * Math.abs(deltaTK) * lengthM * lengthM * lengthM) /
    (fluid.nuM2s * fluid.alphaM2s)
  );
}

/** Which face the correlation describes. The three differ by up to 2×. */
export type ConvectiveSurface =
  /** A vertical wall — a pot's side, an oven's door, a standing roast. */
  | "vertical"
  /** A horizontal surface losing heat upward — a pot's free liquid surface. */
  | "horizontal-up"
  /** A horizontal surface losing heat downward — the underside of a shelf. */
  | "horizontal-down"
  /** A horizontal cylinder in still air — a sausage, a rolled roast. */
  | "horizontal-cylinder";

export interface ConvectionResult {
  /** Heat transfer coefficient, W·m⁻²·K⁻¹. */
  hWm2K: number;
  nusselt: number;
  rayleigh: number;
  /** The named correlation actually used, so a reader can look it up. */
  correlation: string;
  /**
   * True when Ra fell outside the correlation's published envelope and the
   * result is an extrapolation. NOT a throw: natural convection at a low Ra is
   * a real physical situation (a barely-warm pan), the correlations simply run
   * out of data, and refusing would break the common case. The flag is the
   * honest middle — a caller can surface it, and the tests pin where it trips.
   */
  extrapolated: boolean;
}

/**
 * Natural-convection coefficient for a heated surface in a still fluid.
 *
 * BASIS, by surface:
 *  - `vertical` — Churchill & Chu (1975), *Int. J. Heat Mass Transfer* 18(11),
 *    the all-Ra form. Stated to hold over the entire Ra range for any Pr.
 *  - `horizontal-cylinder` — Churchill & Chu (1975), the companion cylinder
 *    form, Ra ≤ 10¹².
 *  - `horizontal-up` / `horizontal-down` — McAdams' plate correlations as
 *    tabulated in Incropera §9.6.3, with the characteristic length `A_s/P`.
 *
 * ⚠️ **THE CORRELATIONS' OWN ACCURACY IS ±20–30 %.** That is not a defect in
 * this implementation; it is what natural-convection correlations are. Any
 * downstream precision beyond two significant figures is illusory, and the
 * comparison this function is *good* at is relative: which of two arrangements
 * is faster, and by roughly how much.
 *
 * @param fluid Properties evaluated at the FILM temperature.
 * @param deltaTK Surface-to-bulk temperature difference, K. Sign ignored.
 * @param lengthM Characteristic length: plate height for `vertical`, diameter
 *                for `horizontal-cylinder`, and `A_s/P` for the flat plates
 *                (which is D/4 for a circle — see {@link plateCharacteristicLength}).
 */
export function naturalConvectionH(
  fluid: FluidState,
  surface: ConvectiveSurface,
  deltaTK: number,
  lengthM: number,
): ConvectionResult {
  if (!Number.isFinite(lengthM) || lengthM <= 0) {
    throw new RangeError(`lengthM must be positive, received ${lengthM}`);
  }
  const rayleigh = rayleighNumber(fluid, deltaTK, lengthM);
  const pr = fluid.prandtl;
  let nusselt: number;
  let correlation: string;
  let extrapolated = false;

  switch (surface) {
    case "vertical": {
      // Churchill & Chu all-Ra: Nu = {0.825 + 0.387 Ra^(1/6) / [1+(0.492/Pr)^(9/16)]^(8/27)}²
      const denom = Math.pow(1 + Math.pow(0.492 / pr, 9 / 16), 8 / 27);
      const root = 0.825 + (0.387 * Math.pow(rayleigh, 1 / 6)) / denom;
      nusselt = root * root;
      correlation = "Churchill & Chu (1975), vertical plate, all Ra";
      break;
    }
    case "horizontal-cylinder": {
      const denom = Math.pow(1 + Math.pow(0.559 / pr, 9 / 16), 8 / 27);
      const root = 0.6 + (0.387 * Math.pow(rayleigh, 1 / 6)) / denom;
      nusselt = root * root;
      correlation = "Churchill & Chu (1975), horizontal cylinder, Ra ≤ 1e12";
      extrapolated = rayleigh > 1e12;
      break;
    }
    case "horizontal-up": {
      if (rayleigh < 1e7) {
        nusselt = 0.54 * Math.pow(rayleigh, 0.25);
        correlation = "McAdams, hot plate facing up, 1e4 ≤ Ra ≤ 1e7";
        extrapolated = rayleigh < 1e4;
      } else {
        nusselt = 0.15 * Math.pow(rayleigh, 1 / 3);
        correlation = "McAdams, hot plate facing up, 1e7 ≤ Ra ≤ 1e11";
        extrapolated = rayleigh > 1e11;
      }
      break;
    }
    case "horizontal-down": {
      nusselt = 0.27 * Math.pow(rayleigh, 0.25);
      correlation = "McAdams, hot plate facing down, 1e5 ≤ Ra ≤ 1e10";
      extrapolated = rayleigh < 1e5 || rayleigh > 1e10;
      break;
    }
  }

  return { hWm2K: (nusselt * fluid.kWmK) / lengthM, nusselt, rayleigh, correlation, extrapolated };
}

/**
 * Characteristic length for a flat-plate natural-convection correlation:
 * surface area divided by perimeter.
 *
 * For a circular free surface this is **D/4**, not D — a distinction worth a
 * function because getting it wrong scales Ra by 64 and h by roughly 2.8×.
 */
export function plateCharacteristicLength(areaM2: number, perimeterM: number): number {
  if (areaM2 <= 0 || perimeterM <= 0) {
    throw new RangeError(`area and perimeter must be positive, got ${areaM2} / ${perimeterM}`);
  }
  return areaM2 / perimeterM;
}

/**
 * Forced-convection coefficient over a flat plate — a fan oven, a draught, a
 * blast chiller.
 *
 * BASIS: the classical flat-plate results (Incropera §7.2): laminar
 * `Nu = 0.664 Re^½ Pr^⅓` below Re = 5e5, and the mixed boundary-layer form
 * `Nu = (0.037 Re^0.8 − 871) Pr^⅓` above it. Both require Pr ≳ 0.6, which air
 * satisfies everywhere in the table above.
 *
 * The transition constant 871 is not a fudge: it is what makes the turbulent
 * expression continuous with the laminar one at Re_x,c = 5e5.
 */
export function forcedConvectionHFlatPlate(
  fluid: FluidState,
  velocityMs: number,
  lengthM: number,
): ConvectionResult {
  if (velocityMs < 0) throw new RangeError(`velocityMs must be ≥ 0, received ${velocityMs}`);
  if (lengthM <= 0) throw new RangeError(`lengthM must be positive, received ${lengthM}`);
  const reynolds = (velocityMs * lengthM) / fluid.nuM2s;
  // `Math.pow(x, 1/3)`, NOT `Math.cbrt`. `[MEASURED 2026-08-18]` the two
  // runtimes' `cbrt` disagree by 1 ULP at this film's Prandtl number, while
  // `pow` with a ⅓ exponent — the same call the natural-convection
  // correlations already make — agrees exactly. Different libm entry point,
  // different rounding; the fix is to make both halves call the same one.
  const prCube = Math.pow(fluid.prandtl, 1 / 3);
  let nusselt: number;
  let correlation: string;
  if (reynolds < 5e5) {
    nusselt = 0.664 * Math.sqrt(reynolds) * prCube;
    correlation = "flat plate, laminar, Re < 5e5";
  } else {
    nusselt = (0.037 * Math.pow(reynolds, 0.8) - 871) * prCube;
    correlation = "flat plate, mixed laminar–turbulent, Re ≥ 5e5";
  }
  return {
    hWm2K: (nusselt * fluid.kWmK) / lengthM,
    nusselt,
    rayleigh: reynolds,
    correlation,
    extrapolated: fluid.prandtl < 0.6,
  };
}

// ============================================================================
// Nucleate boiling
// ============================================================================

/**
 * Rohsenow surface–fluid coefficient `C_sf` for water on common cookware.
 *
 * BASIS: Rohsenow (1952), as tabulated in Incropera Table 10.1. `C_sf` is
 * CUBED in the correlation, so the spread here is not cosmetic: `[MEASURED
 * 2026-08-18]` scored stainless transfers **11.79×** the flux of a
 * mechanically polished surface at the same excess temperature — and the
 * factor is exactly the ratio of the two coefficients cubed, so it holds at
 * every temperature, not just the one it was measured at.
 *
 * It is large enough to change what is *possible*: at a 10 K excess a scored
 * surface is already past the critical heat flux and
 * {@link nucleateBoilingFlux} refuses, while the polished one is at 11 % of
 * burnout. Two pans, same dial, different regimes.
 *
 * That is the physics behind a piece of kitchen folklore that is usually
 * explained wrongly. A scratched, pitted or well-used pan boils faster than a
 * mirror-polished one — not because of the metal, but because nucleation sites
 * are cavities, and polishing removes them.
 */
export const BOILING_SURFACE_CSF = {
  /** Water on mechanically polished stainless steel. */
  "stainless-polished": 0.0132,
  /** Water on chemically etched stainless steel — a used pan. */
  "stainless-etched": 0.013,
  /** Water on ground and polished stainless steel. */
  "stainless-ground": 0.008,
  /** Water on scored/scratched stainless steel. */
  "stainless-scored": 0.0058,
  /** Water on polished copper. */
  "copper-polished": 0.0128,
  /** Water on scored copper. */
  "copper-scored": 0.0068,
  /** Water on brass. */
  brass: 0.006,
} as const;

export type BoilingSurface = keyof typeof BOILING_SURFACE_CSF;

/** Rohsenow's exponent on Pr. 1.0 for water; 1.7 for every other fluid. */
export const ROHSENOW_PR_EXPONENT_WATER = 1.0;

export interface BoilingResult {
  /** Surface heat flux, W·m⁻². */
  fluxWm2: number;
  /** Equivalent coefficient q″/ΔT_e, W·m⁻²·K⁻¹. */
  hWm2K: number;
  /** Zuber critical heat flux at this pressure, W·m⁻². */
  criticalFluxWm2: number;
  /** Fraction of the way to burnout. Above 1 the correlation is invalid. */
  burnoutFraction: number;
}

/**
 * Zuber's critical heat flux for saturated pool boiling, W·m⁻².
 *
 * `q″_max = 0.149·h_fg·ρ_v^½·[σ·g(ρ_l − ρ_v)]^¼`
 *
 * BASIS: Zuber (1959), with the 0.149 leading constant for a large horizontal
 * plate (Lienhard & Dhir). `[MEASURED 2026-08-18]` this returns **1.25 MW·m⁻²**
 * for water at 1 atm against the ~1.1 MW·m⁻² usually quoted for a finite
 * heater — the gap is the plate-size correction, and it is why this is used as
 * a validity ceiling rather than a design number.
 */
export function criticalHeatFluxWm2(water: WaterState): number {
  return (
    0.149 *
    water.hfgJkg *
    Math.sqrt(water.rhoVapourKgM3) *
    Math.pow(water.sigmaNm * STANDARD_GRAVITY * (water.rhoKgM3 - water.rhoVapourKgM3), 0.25)
  );
}

/**
 * Nucleate pool boiling flux from the Rohsenow correlation.
 *
 * `q″ = μ_l·h_fg·√[g(ρ_l−ρ_v)/σ]·[cp_l·ΔT_e/(C_sf·h_fg·Pr_l^n)]³`
 *
 * BASIS: Rohsenow (1952), *Trans. ASME* 74. The cube is the whole character of
 * the thing: **flux goes as the excess temperature CUBED**, so a pan 3 K above
 * saturation and one 9 K above differ by 27×, not 3×. That is why a pot goes
 * from "nothing happening" to a rolling boil over a few degrees of dial.
 *
 * ⚠️ **REFUSES above the critical heat flux.** Past burnout the vapour film
 * becomes continuous, the surface DRIES, and flux *falls* — Rohsenow's monotone
 * cube is not merely inaccurate there, it points the wrong way. This is
 * Leidenfrost's mechanism at industrial scale, and a correlation that happily
 * returned 4 MW·m⁻² for a hot enough pan would be inventing energy.
 *
 * ⚠️ Also refuses at or below saturation: with no excess temperature there is
 * no nucleate boiling, and the correlation returns 0 for a situation that is
 * really natural convection.
 *
 * @param water Saturated properties at the boiling point.
 * @param excessTempK Surface temperature minus saturation temperature, K.
 */
export function nucleateBoilingFlux(
  water: WaterState,
  excessTempK: number,
  surface: BoilingSurface = "stainless-etched",
): BoilingResult {
  if (!Number.isFinite(excessTempK) || excessTempK <= 0) {
    throw new RangeError(
      `excessTempK must be positive — at or below saturation there is no nucleate boiling, ` +
        `received ${excessTempK}`,
    );
  }
  const csf = BOILING_SURFACE_CSF[surface];
  const buoyancy = Math.sqrt(
    (STANDARD_GRAVITY * (water.rhoKgM3 - water.rhoVapourKgM3)) / water.sigmaNm,
  );
  const bracketTerm =
    (water.cpJkgK * excessTempK) /
    (csf * water.hfgJkg * Math.pow(water.prandtl, ROHSENOW_PR_EXPONENT_WATER));
  const fluxWm2 = water.muPaS * water.hfgJkg * buoyancy * Math.pow(bracketTerm, 3);
  const criticalFluxWm2 = criticalHeatFluxWm2(water);
  const burnoutFraction = fluxWm2 / criticalFluxWm2;
  if (burnoutFraction > 1) {
    throw new RangeError(
      `excessTempK ${excessTempK.toFixed(1)} K implies ${(fluxWm2 / 1e6).toFixed(2)} MW·m⁻², ` +
        `above the ${(criticalFluxWm2 / 1e6).toFixed(2)} MW·m⁻² critical flux. Past burnout the ` +
        `vapour film is continuous and flux FALLS — Rohsenow does not describe that branch.`,
    );
  }
  return { fluxWm2, hWm2K: fluxWm2 / excessTempK, criticalFluxWm2, burnoutFraction };
}

// ============================================================================
// Evaporative flux
// ============================================================================

/**
 * Binary diffusion coefficient of water vapour in air at 298 K, 1 atm, m²·s⁻¹.
 *
 * BASIS: Incropera Table A.8 (binary diffusion coefficients at 1 atm).
 */
export const D_WATER_AIR_298 = 0.26e-4;

/**
 * Diffusion coefficient of water vapour in air at a stated temperature.
 *
 * Scaled as `T^{3/2}` from the 298 K reference, which is the kinetic-theory
 * (Chapman–Enskog) temperature dependence at fixed pressure. The empirical
 * Fuller correlation prefers `T^{1.75}`; `[MEASURED 2026-08-18]` the two differ
 * by **10.9 % at 200 °C**, and the Lewis number that consumes this enters the
 * flux as `Le^{-2/3}`, so the disagreement reaches the answer as **7.4 %** —
 * inside the convection coefficient's own ±25 %, but not by a wide margin. If
 * this layer ever needs better than ±10 % on an oven-temperature evaporation
 * rate, this exponent is the first thing to replace.
 */
export function diffusionWaterInAir(tempC: number): number {
  return D_WATER_AIR_298 * Math.pow((tempC + 273.15) / 298, 1.5);
}

export interface EvaporationResult {
  /** Mass flux leaving the surface, kg·m⁻²·s⁻¹. */
  massFluxKgM2s: number;
  /** Latent heat carried away, W·m⁻². */
  latentFluxWm2: number;
  /** Convective mass transfer coefficient, m·s⁻¹. */
  hMassMs: number;
  /** Lewis number α/D at the film temperature. */
  lewis: number;
  /** Vapour density at the surface, kg·m⁻³. */
  surfaceVapourKgM3: number;
  /** Vapour density in the bulk air, kg·m⁻³. */
  bulkVapourKgM3: number;
}

/**
 * Evaporative mass and heat flux from a free water surface, by the
 * Chilton–Colburn heat-and-mass-transfer analogy.
 *
 * `h_m = h / (ρ·cp·Le^{2/3})`, then `ṁ″ = h_m·(ρ_v,s − ρ_v,∞)`.
 *
 * ── What this assumes, stated rather than buried ────────────────────────────
 *
 *  1. **The surface is free water.** Real food is not: once a crust forms,
 *     internal moisture migration limits the rate and the true flux is LOWER.
 *     So this is an upper bound on evaporation and, through
 *     {@link evaporativePinnedSurfaceC}, a lower bound on surface temperature.
 *  2. **Dilute vapour.** The analogy assumes the mass flux does not itself
 *     disturb the boundary layer, which holds while the vapour is a minor
 *     component. Near 100 °C at the surface that is getting marginal.
 *  3. **The same geometry drives both transfers**, which is what lets one
 *     coefficient stand in for the other.
 *
 * The negative case is meaningful and NOT clamped: when the air is wetter than
 * the surface, the flux reverses and the surface gains water. That is
 * condensation on a cold plate, and erasing it would erase a real mechanism.
 *
 * @param hWm2K Convective coefficient over the same surface, W·m⁻²·K⁻¹.
 * @param surfaceC Surface temperature, °C.
 * @param airC Bulk air temperature, °C.
 * @param bulkVapourKgM3 Vapour density in the bulk air, kg·m⁻³. Taken directly
 *        rather than as a relative humidity, because RH is meaningless above
 *        100 °C — see {@link absoluteHumidityKgM3}. For ambient air, convert
 *        with that function; for oven air, with {@link humidAirVapourDensity}.
 */
export function evaporativeFlux(
  hWm2K: number,
  surfaceC: number,
  airC: number,
  bulkVapourKgM3: number,
  latentHeatJkg: number,
): EvaporationResult {
  if (hWm2K < 0) throw new RangeError(`hWm2K must be ≥ 0, received ${hWm2K}`);
  const filmC = (surfaceC + airC) / 2;
  const film = airProperties(filmC);
  const lewis = film.alphaM2s / diffusionWaterInAir(filmC);
  const hMassMs = hWm2K / (film.rhoKgM3 * film.cpJkgK * Math.pow(lewis, 2 / 3));
  const surfaceVapourKgM3 = vapourDensityKgM3(saturationPressureKpa(surfaceC), surfaceC);
  const massFluxKgM2s = hMassMs * (surfaceVapourKgM3 - bulkVapourKgM3);
  return {
    massFluxKgM2s,
    latentFluxWm2: massFluxKgM2s * latentHeatJkg,
    hMassMs,
    lewis,
    surfaceVapourKgM3,
    bulkVapourKgM3,
  };
}

export interface PinnedSurfaceResult {
  /** Steady-state surface temperature, °C. */
  celsius: number;
  /** How far below the source temperature it sits, K. */
  depressionK: number;
  /** Convective gain at the solution, W·m⁻². */
  convectiveGainWm2: number;
  /** Radiative gain at the solution, W·m⁻². */
  radiativeGainWm2: number;
  /** Evaporative loss at the solution, W·m⁻². Balances the two gains. */
  evaporativeLossWm2: number;
  /** Water leaving the surface at the solution, kg·m⁻²·s⁻¹. */
  massFluxKgM2s: number;
  /** True when the balance never crosses and the surface reaches saturation. */
  saturated: boolean;
}

/**
 * The temperature a freely-evaporating surface settles at, °C.
 *
 * `thermo.ts` already states the CEILING — a wet surface cannot exceed the
 * local boiling point, because every extra joule goes into latent heat. This
 * function answers the sharper question: **where below that ceiling does it
 * actually sit?** In dry air the answer is far below, and that gap is why a
 * roast can spend an hour in a 200 °C oven without browning.
 *
 * Balances, per unit area:
 *
 *   `h(T_air − T_s) + εσ(T_wall⁴ − T_s⁴) = ṁ″(T_s)·h_fg`
 *
 * solved by bisection. The left side falls with T_s and the right side climbs
 * steeply (vapour pressure is exponential), so the crossing is unique and
 * bisection is the right tool — no derivative, no convergence surprises.
 *
 * ⚠️ **This is the FREE-WATER limit, and real food sits above it.** Once a
 * surface dries, moisture must migrate from within and the evaporative term
 * weakens, so the true surface temperature climbs toward the ceiling. Read the
 * result as "as cold as the surface can possibly be", which is exactly the
 * bound worth knowing when the question is why something has not browned.
 *
 * @param airC Air temperature, °C.
 * @param bulkVapourKgM3 Vapour density in the bulk air, kg·m⁻³.
 * @param hWm2K Convective coefficient at the surface.
 * @param radiantSourceC Temperature of the radiating enclosure, °C. Pass the
 *        air temperature for a still oven; pass a much higher value for a
 *        broiler element.
 * @param emissivity Surface emissivity, 0–1.
 * @param ceilingC The local boiling point — the surface cannot exceed it.
 */
export function evaporativePinnedSurfaceC(
  airC: number,
  bulkVapourKgM3: number,
  hWm2K: number,
  radiantSourceC: number,
  emissivity: number,
  ceilingC: number,
): PinnedSurfaceResult {
  const sigma = 5.670374419e-8;
  // Explicit squaring, not `Math.pow(x, 4)`. `[MEASURED 2026-08-18]` the two
  // runtimes' `pow` disagree by 1 ULP on a fourth power while `(x·x)·(x·x)`
  // agrees exactly — a reformulation, not a widened tolerance.
  const pow4 = (x: number): number => {
    const sq = x * x;
    return sq * sq;
  };
  const sourceK4 = pow4(radiantSourceC + 273.15);
  const hi = Math.min(ceilingC, ANTOINE_MAX_C);
  const lo = ANTOINE_MIN_C;

  const imbalance = (ts: number): number => {
    const water = saturatedWaterProperties(Math.max(WATER_MIN_C, Math.min(WATER_MAX_C, ts)));
    const evap = evaporativeFlux(hWm2K, ts, airC, bulkVapourKgM3, water.hfgJkg);
    const conv = hWm2K * (airC - ts);
    const rad = emissivity * sigma * (sourceK4 - pow4(ts + 273.15));
    return conv + rad - evap.latentFluxWm2;
  };

  // If the surface is still gaining at the ceiling, evaporation cannot hold it
  // down any further and it is boiling, not merely evaporating.
  if (imbalance(hi) > 0) {
    const water = saturatedWaterProperties(Math.max(WATER_MIN_C, Math.min(WATER_MAX_C, hi)));
    const evap = evaporativeFlux(hWm2K, hi, airC, bulkVapourKgM3, water.hfgJkg);
    return {
      celsius: hi,
      depressionK: airC - hi,
      convectiveGainWm2: hWm2K * (airC - hi),
      radiativeGainWm2: emissivity * sigma * (sourceK4 - pow4(hi + 273.15)),
      evaporativeLossWm2: evap.latentFluxWm2,
      massFluxKgM2s: evap.massFluxKgM2s,
      saturated: true,
    };
  }

  let a = lo;
  let b = hi;
  // 80 halvings takes a 99 K bracket below 1e-22 K — far past double precision,
  // so this terminates on the fixed count rather than on a tolerance that would
  // have to be justified.
  for (let i = 0; i < 80; i += 1) {
    const mid = (a + b) / 2;
    if (imbalance(mid) > 0) a = mid;
    else b = mid;
  }
  const celsius = (a + b) / 2;
  const water = saturatedWaterProperties(Math.max(WATER_MIN_C, Math.min(WATER_MAX_C, celsius)));
  const evap = evaporativeFlux(hWm2K, celsius, airC, bulkVapourKgM3, water.hfgJkg);
  return {
    celsius,
    depressionK: airC - celsius,
    convectiveGainWm2: hWm2K * (airC - celsius),
    radiativeGainWm2: emissivity * sigma * (sourceK4 - pow4(celsius + 273.15)),
    evaporativeLossWm2: evap.latentFluxWm2,
    massFluxKgM2s: evap.massFluxKgM2s,
    saturated: false,
  };
}

// ============================================================================
// The series resistance network
// ============================================================================

/** One link in the chain from source to core. */
export interface BoundaryLink {
  id: string;
  label: string;
  /** Absolute thermal resistance, K·W⁻¹. */
  resistanceKperW: number;
  /** The area this link acts over, m². */
  areaM2: number;
  /** The coefficient behind it, W·m⁻²·K⁻¹ — null for a pure conduction link. */
  hWm2K: number | null;
  /** Share of the total series resistance, 0–1. */
  share: number;
  /** Temperature drop across this link at the solved flow, K. */
  dropK: number;
}

export interface BoundaryNetworkResult {
  links: BoundaryLink[];
  /** Sum of the series resistances, K·W⁻¹. */
  totalResistanceKperW: number;
  /** Overall conductance 1/ΣR, W·K⁻¹. */
  uaWperK: number;
  /** Steady heat flow at the stated end-to-end difference, W. */
  heatFlowW: number;
  /** The single largest resistance — the thing to fix. */
  controlling: BoundaryLink;
  /** Node temperatures down the chain, °C. */
  nodes: Array<{ id: string; celsius: number }>;
  /**
   * Biot number of the food, computed from THIS network's own resistances as
   * `R_internal / R_external`.
   *
   * It is not a second definition — `Bi ≡ h·L_c/k` IS that ratio — so the two
   * can be computed independently and compared, which turns the chain into a
   * check on itself rather than a set of unrelated claims.
   *
   * ⚠️ They agree algebraically and NOT to the bit. The food's area cancels out
   * of the ratio on paper; in floating point the network's path rounds four
   * times (`k·A`, `L/(k·A)`, `h·A`, and the quotient) where `h·L/k` rounds
   * twice. `[MEASURED 2026-08-18]` the gap over a sweep of realistic
   * arrangements never exceeds a handful of ULP, and the test pins that budget
   * rather than asserting an equality that is about IEEE association rather
   * than about physics.
   */
  foodBiot: number | null;
}

export interface BoundaryNetworkInput {
  /** Hot end of the chain — burner surface, oven air, or bath water, °C. */
  sourceC: number;
  /** Cold end — the food's core, or the medium when there is no food, °C. */
  sinkC: number;
  /**
   * The vessel, when there is one.
   *
   * OPTIONAL, and the omission is the point: a roast on a rack sits directly in
   * the oven's air, and forcing a vessel into that chain would invent two
   * resistances and a wall that are not there. A chain with no vessel is the
   * radiant/convective case; a chain with one is the conducted case.
   */
  vessel?: {
    /** Source → vessel outside, W·m⁻²·K⁻¹. */
    sourceToVesselHWm2K: number;
    /** Contact area for all three vessel links — usually the base, m². */
    areaM2: number;
    /** Wall conductivity, W·m⁻¹·K⁻¹. */
    kWmK: number;
    /** Wall thickness on this path, m. */
    thicknessM: number;
    /** Vessel inside → medium, W·m⁻²·K⁻¹. */
    vesselToMediumHWm2K: number;
  };
  /** The food, when the chain reaches one. */
  food?: {
    /** Medium → food surface, W·m⁻²·K⁻¹. */
    mediumToFoodHWm2K: number;
    geometry: FoodGeometry;
    /** Half-thickness for a slab, radius for a cylinder or sphere, m. */
    halfDimensionM: number;
    /** Food thermal conductivity, W·m⁻¹·K⁻¹ — from Choi–Okos. */
    kWmK: number;
    /** Exposed surface area, m². */
    areaM2: number;
  };
}

/**
 * Solve the series chain and report which link controls.
 *
 * ── What a steady chain can and cannot say ──────────────────────────────────
 *
 * This is a STEADY-STATE network. Cooking is transient, and the transient
 * answer for the food's interior is the Heisler one-term series already
 * implemented in `thermo.ts` — that is what actually predicts a core
 * temperature against time.
 *
 * What the steady chain adds is the thing the transient solution takes as
 * given: **the value of h, and whether it matters at all.** `slabCoreTime`
 * accepts an `h` and asks no questions about where it came from; this function
 * derives it from the arrangement and shows what share of the total resistance
 * it represents. The two compose — the network sizes the boundary, the Heisler
 * solution runs the clock.
 *
 * ── The result worth reading ────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-18]` The same 5 cm potato, k = 0.55:
 *
 * | arrangement | food's share of R | Bi | controlling link |
 * |---|---|---|---|
 * | 200 °C oven, h = 15 | 14.7 % | 0.227 | medium → food surface (64.9 %) |
 * | boiling water, h = 1500 | 81.9 % | 22.7 | food surface → core (81.9 %) |
 *
 * Same food, opposite bottleneck. That is why stirring a pot does nothing for
 * a potato and why a convection fan transforms a roast.
 *
 * The vessel wall is nowhere near either. `[MEASURED]` 3 mm of cast iron over
 * 0.05 m² is 1.15e-3 K·W⁻¹ against 1.33 K·W⁻¹ for the air above it — **1156×**.
 * A pan's contribution is thermal mass and evenness, not resistance.
 */
export function solveBoundaryNetwork(input: BoundaryNetworkInput): BoundaryNetworkResult {
  const raw: Array<Omit<BoundaryLink, "share" | "dropK">> = [];

  const positive = (name: string, v: number): number => {
    if (!Number.isFinite(v) || v <= 0) {
      throw new RangeError(`${name} must be a positive finite number, received ${v}`);
    }
    return v;
  };

  if (input.vessel) {
    const v = input.vessel;
    positive("vessel.areaM2", v.areaM2);
    positive("vessel.sourceToVesselHWm2K", v.sourceToVesselHWm2K);
    positive("vessel.kWmK", v.kWmK);
    positive("vessel.thicknessM", v.thicknessM);
    positive("vessel.vesselToMediumHWm2K", v.vesselToMediumHWm2K);
    raw.push({
      id: "source-to-vessel",
      label: "source → vessel outside",
      resistanceKperW: 1 / (v.sourceToVesselHWm2K * v.areaM2),
      areaM2: v.areaM2,
      hWm2K: v.sourceToVesselHWm2K,
    });
    raw.push({
      id: "vessel-wall",
      label: "through the vessel wall",
      resistanceKperW: v.thicknessM / (v.kWmK * v.areaM2),
      areaM2: v.areaM2,
      hWm2K: null,
    });
    raw.push({
      id: "vessel-to-medium",
      label: "vessel inside → medium",
      resistanceKperW: 1 / (v.vesselToMediumHWm2K * v.areaM2),
      areaM2: v.areaM2,
      hWm2K: v.vesselToMediumHWm2K,
    });
  }

  let foodBiot: number | null = null;
  if (input.food) {
    const f = input.food;
    positive("food.mediumToFoodHWm2K", f.mediumToFoodHWm2K);
    positive("food.halfDimensionM", f.halfDimensionM);
    positive("food.kWmK", f.kWmK);
    positive("food.areaM2", f.areaM2);
    const external = 1 / (f.mediumToFoodHWm2K * f.areaM2);
    const lengthM = f.halfDimensionM * characteristicLengthRatio(f.geometry);
    const internal = lengthM / (f.kWmK * f.areaM2);
    raw.push({
      id: "medium-to-food",
      label: "medium → food surface",
      resistanceKperW: external,
      areaM2: f.areaM2,
      hWm2K: f.mediumToFoodHWm2K,
    });
    raw.push({
      id: "food-interior",
      label: "food surface → core",
      resistanceKperW: internal,
      areaM2: f.areaM2,
      hWm2K: null,
    });
    foodBiot = internal / external;
  }

  if (raw.length === 0) {
    throw new RangeError("a boundary network needs at least a vessel or a food — it has neither");
  }

  const totalResistanceKperW = raw.reduce((sum, l) => sum + l.resistanceKperW, 0);
  const uaWperK = 1 / totalResistanceKperW;
  const heatFlowW = (input.sourceC - input.sinkC) / totalResistanceKperW;

  const links: BoundaryLink[] = raw.map((l) => ({
    ...l,
    share: l.resistanceKperW / totalResistanceKperW,
    dropK: heatFlowW * l.resistanceKperW,
  }));

  const nodes: Array<{ id: string; celsius: number }> = [{ id: "source", celsius: input.sourceC }];
  let running = input.sourceC;
  for (const link of links) {
    running -= link.dropK;
    nodes.push({ id: link.id, celsius: running });
  }

  let [controlling] = links;
  for (const link of links) {
    if (link.resistanceKperW > controlling.resistanceKperW) controlling = link;
  }

  return { links, totalResistanceKperW, uaWperK, heatFlowW, controlling, nodes, foodBiot };
}

/**
 * Biot number computed the ordinary way, for comparison with a network's own
 * `foodBiot`. Re-exported here so the equivalence can be asserted without the
 * test importing two modules to say one thing.
 */
export { biotNumber };

// ============================================================================
// The lid — what its heat loss actually derives
// ============================================================================

/**
 * Convective coefficient for filmwise condensation of steam, W·m⁻²·K⁻¹.
 *
 * Steam condensing on a lid's underside is an extremely good heat-transfer
 * mode; published values for filmwise condensation of water run roughly
 * 5 000–15 000 W·m⁻²·K⁻¹ depending on film thickness and orientation, and
 * dropwise condensation is higher still.
 *
 * ⚠️ PICKING ONE VALUE HERE COSTS ALMOST NOTHING, AND THAT IS A MEASUREMENT,
 * NOT AN ASSUMPTION. `[MEASURED 2026-08-18]` sweeping 3 000 → 25 000 — more
 * than eightfold — moves a 26 cm lid's heat loss from 65.81 W to 66.20 W, a
 * spread of **0.27 %**. The reason is that this resistance is in series with
 * an outside air film around 1/12 W⁻¹·m²·K, so it contributes under 1 % of the
 * total no matter which end of the published range it sits at. The lid's
 * temperature is set by the room, not by the steam.
 */
export const CONDENSATION_H_WM2K = 10000;

export interface LidHeatBalance {
  /** Steady lid temperature, °C. */
  lidC: number;
  /** Convective loss from the lid's top face, W. */
  convectiveLossW: number;
  /** Radiative loss from the lid's top face, W. */
  radiativeLossW: number;
  /** Total outward loss, W. */
  totalLossW: number;
  /**
   * Mass of steam the lid can condense per second, kg·s⁻¹.
   *
   * This is the quantity the lid's heat loss genuinely derives: condensation
   * releases latent heat, and the lid can only condense as fast as it can shed
   * that heat to the room.
   */
  condensationCapacityKgS: number;
}

/**
 * Steady heat balance on a lid: how hot it runs, and how much steam it can
 * therefore condense back into the pot.
 *
 * Solves `(T_head − T_lid)/(1/h_cond + t/k) = h_out(T_lid − T_room) + εσ(T_lid⁴ − T_room⁴)`
 * for the lid temperature by bisection, then reports the loss at that solution.
 *
 * ── The finding this function exists to record ──────────────────────────────
 *
 * `[MEASURED 2026-08-18]` **A metal lid's steady heat loss does not depend on
 * its material or its gauge.** Over 1.2 mm stainless, 1.5 mm stainless and
 * 6 mm enamelled cast iron the loss is 66.21 / 66.19 / 66.12 W — a spread of
 * **0.14 %** — because condensing steam pins the underside to within a degree
 * of the headspace whatever the plate is made of, and the outside air film
 * then does all the resisting.
 *
 * **Glass is the exception, and it is not small.** At k ≈ 1.1 the conduction
 * term finally becomes comparable to the air film: 4 mm glass runs at 95.6 °C
 * and loses 61.8 W, 8 mm glass at 92.0 °C and 58.0 W — **12 % less** than any
 * metal lid. So "lid material" matters for the transient (thermal mass, which
 * `vessels.ts` already carries) and for glass, and for nothing else.
 *
 * What sets the loss instead is **area and the room**: `[MEASURED]` the flux is
 * 1247–1290 W·m⁻² across a 20 / 24 / 26 cm lid, and the total swings from 78 W
 * in a 5 °C kitchen to 58 W in a 30 °C one.
 *
 * Named rather than positional: eight interchangeable numbers is an invitation
 * to transpose two of them, and a transposed area and perimeter would still
 * return a plausible temperature.
 */
export interface LidHeatBalanceInput {
  /** Area of the lid's top face, m². */
  lidAreaM2: number;
  /** Perimeter, for the plate characteristic length A/P. */
  lidPerimeterM: number;
  /** Lid gauge, m. */
  lidThicknessM: number;
  /** Lid conductivity, W·m⁻¹·K⁻¹. */
  lidKWmK: number;
  /** Temperature of the saturated headspace, °C. */
  headspaceC: number;
  /** Kitchen air, °C. */
  ambientC: number;
  /** Latent heat at the headspace temperature, J·kg⁻¹. */
  latentHeatJkg: number;
  /** Lid's top-face emissivity. Defaults to 0.9. */
  emissivity?: number;
}

export function lidHeatBalance(input: LidHeatBalanceInput): LidHeatBalance {
  const {
    lidAreaM2,
    lidPerimeterM,
    lidThicknessM,
    lidKWmK,
    headspaceC,
    ambientC,
    latentHeatJkg,
    emissivity = 0.9,
  } = input;
  if (!(lidAreaM2 > 0) || !(lidPerimeterM > 0)) {
    throw new RangeError(`lid area and perimeter must be positive`);
  }
  if (!(lidThicknessM > 0) || !(lidKWmK > 0)) {
    throw new RangeError(`lid thickness and conductivity must be positive`);
  }
  if (headspaceC <= ambientC) {
    throw new RangeError(
      `headspace ${headspaceC} °C is not above ambient ${ambientC} °C — there is no ` +
        `condensation to balance, and the lid is not shedding heat outward`,
    );
  }
  const sigma = 5.670374419e-8;
  const pow4 = (x: number): number => {
    const sq = x * x;
    return sq * sq;
  };
  const lc = plateCharacteristicLength(lidAreaM2, lidPerimeterM);
  const ambientK4 = pow4(ambientC + 273.15);
  const innerResistance = 1 / CONDENSATION_H_WM2K + lidThicknessM / lidKWmK;

  const outwardFlux = (lidC: number): number => {
    const film = airProperties((lidC + ambientC) / 2);
    // The correlation needs a non-zero ΔT; at the bracket's lower end the lid
    // sits AT ambient and the true flux is zero, which the floor preserves.
    const deltaT = Math.max(1e-9, lidC - ambientC);
    const h = naturalConvectionH(film, "horizontal-up", deltaT, lc).hWm2K;
    return h * (lidC - ambientC) + emissivity * sigma * (pow4(lidC + 273.15) - ambientK4);
  };

  let lo = ambientC;
  let hi = headspaceC;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if ((headspaceC - mid) / innerResistance > outwardFlux(mid)) lo = mid;
    else hi = mid;
  }
  const lidC = (lo + hi) / 2;
  const film = airProperties((lidC + ambientC) / 2);
  const h = naturalConvectionH(
    film,
    "horizontal-up",
    Math.max(1e-9, lidC - ambientC),
    lc,
  ).hWm2K;
  const convectiveLossW = h * (lidC - ambientC) * lidAreaM2;
  const radiativeLossW =
    emissivity * sigma * (pow4(lidC + 273.15) - ambientK4) * lidAreaM2;
  const totalLossW = convectiveLossW + radiativeLossW;
  return {
    lidC,
    convectiveLossW,
    radiativeLossW,
    totalLossW,
    condensationCapacityKgS: totalLossW / latentHeatJkg,
  };
}

export interface CoveredWaterLoss {
  /** Steam raised by the net power input, kg·s⁻¹. */
  steamGeneratedKgS: number;
  /** Steam the lid condenses and returns, kg·s⁻¹. */
  condensateReturnedKgS: number;
  /** Water actually leaving the pot, kg·s⁻¹. Never negative. */
  netLossKgS: number;
  /**
   * True when the lid can condense everything the burner raises, so the pot
   * loses no water at all. This is what a covered pot at a bare simmer is
   * doing, and it is a REGIME, not a rounding of a small number.
   */
  holding: boolean;
  /** Share of raised steam that comes back. 1 when holding. */
  returnFraction: number;
}

/**
 * Water a covered pot actually loses, from a stated power input.
 *
 * ── Why this replaces a per-seal escape fraction ────────────────────────────
 *
 * `vessels.ts` declares a `VAPOUR_ESCAPE_FRACTION` per seal state, multiplying
 * the FREE-SURFACE evaporation rate. That was flagged in its own file as the
 * one modelling choice in the thermal stack, with a note promising the boundary
 * network would derive it. Doing the work showed the promise was wrong in a way
 * worth writing down: **the lid's heat loss does not derive that fraction, and
 * the fraction is the wrong shape.**
 *
 * `[MEASURED 2026-08-18]` The lid's condensation capacity is 41–66 W across
 * the four lidded vessels, or **53–106 g·h⁻¹**. The free-surface rate over the
 * same areas is **477–908 g·h⁻¹**. So a lid can return only **11.1–11.6 %** of
 * a free surface's evaporation, and — the part that matters — that figure is
 * near-identical for a tight Dutch oven and a loose stockpot lid, because it is
 * set by lid area and room temperature, not by seal quality. Substituting it
 * for the declared 0.92 return would make a Dutch oven lose MORE water than a
 * loose-lidded stockpot does today: wrong, and wrong in the direction anyone
 * can check with a kitchen scale.
 *
 * The resolution is that the free-surface rate does not apply under a lid at
 * all. A closed headspace saturates, the vapour-density driving force collapses
 * toward zero, and there is no 900 g·h⁻¹ of evaporation for a fraction to act
 * on. What is left is a circulation — raise steam, condense it, drip it back —
 * whose throughput is set by the lid, and a net loss set by **how much steam
 * the power input raises beyond what the lid can condense.**
 *
 * That is a function of the burner, which is exactly why a per-seal constant
 * could not express it. `[MEASURED 2026-08-18]` a 5.5 qt Dutch oven whose lid
 * returns 106 g·h⁻¹: at 50 W it loses nothing at all, at 200 W it loses
 * 214 g·h⁻¹ and at 800 W it loses 1171 g·h⁻¹ — same lid, same seal, three
 * regimes on the dial alone.
 *
 * ⚠️ **Leakage past the seal is still not modelled**, and cannot be from
 * anything here: it needs a gap dimension that is not a published property of
 * any pan. This function therefore gives the loss for a lid that vents freely
 * once the lid's condensation is saturated, which is an UPPER bound on the
 * water lost. A better seal shows up as a longer `holding` regime, not as a
 * fitted coefficient.
 *
 * @param powerIntoContentsW Net power reaching the water, W — burner output
 *        less what the vessel walls shed.
 * @param lidCondensationCapacityKgS From {@link lidHeatBalance}.
 * @param latentHeatJkg Latent heat at the boiling point, J·kg⁻¹.
 */
export function coveredWaterLoss(
  powerIntoContentsW: number,
  lidCondensationCapacityKgS: number,
  latentHeatJkg: number,
): CoveredWaterLoss {
  if (!Number.isFinite(powerIntoContentsW) || powerIntoContentsW < 0) {
    throw new RangeError(`powerIntoContentsW must be ≥ 0, received ${powerIntoContentsW}`);
  }
  if (!(latentHeatJkg > 0)) {
    throw new RangeError(`latentHeatJkg must be positive, received ${latentHeatJkg}`);
  }
  const steamGeneratedKgS = powerIntoContentsW / latentHeatJkg;
  const condensateReturnedKgS = Math.min(steamGeneratedKgS, lidCondensationCapacityKgS);
  const netLossKgS = steamGeneratedKgS - condensateReturnedKgS;
  return {
    steamGeneratedKgS,
    condensateReturnedKgS,
    netLossKgS,
    holding: netLossKgS === 0,
    returnFraction: steamGeneratedKgS === 0 ? 1 : condensateReturnedKgS / steamGeneratedKgS,
  };
}

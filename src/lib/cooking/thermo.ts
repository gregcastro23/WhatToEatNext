/**
 * Culinary heat-transfer physics.
 *
 * Every function here is a textbook relation with a named source and a stated
 * validity range. Nothing in this file is tuned, fitted to taste, or derived
 * from the alchemical engine — that separation is the entire point. The
 * alchemical quantities (ESMS, Kalchm, Monica, Greg's Energy) drive matching
 * against the sky; they must never set a temperature or a time.
 *
 * ── Why this file exists ────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-08-16]` Before this layer, the cooking-method surfaces
 * computed their headline "optimal temperature" as
 *
 *     200 + heat × 300 + monicaTemperatureAdjustment
 *
 * where `heat` is an elemental scalar and the Monica adjustment is a step
 * function of an alchemical constant. Run across all 26 servable methods, that
 * put 23 of them OUTSIDE the method's own published temperature envelope,
 * rendered on the same screen — including cryogenic cooking at +240 °F
 * (envelope −321 to 32 °F) and fermentation at +285 °F (envelope 55–95 °F,
 * i.e. hot enough to kill every culture involved).
 *
 * Reproduce with `scripts/audit-cooking-method-physics.ts`.
 *
 * @file src/lib/cooking/thermo.ts
 */

import { pressureFromElevation } from "@/lib/environment/isa";

// ============================================================================
// Constants
// ============================================================================

/** Stefan–Boltzmann constant, W·m⁻²·K⁻⁴ (CODATA 2018, exact by SI definition). */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/** kPa → mmHg. 1 kPa = 7.500617 mmHg (exact to the digits shown). */
const KPA_TO_MMHG = 7.500617;

/**
 * Antoine coefficients for water, P in mmHg and T in °C.
 *
 * BASIS: Stull (1947), as tabulated in Dean, *Lange's Handbook of Chemistry*.
 * Validity 1–100 °C. Round-trips 100 °C → 760.3 mmHg against the defining
 * 760 mmHg, i.e. +0.04 %; `cookingThermo.test.ts` pins that residual so a
 * future coefficient swap cannot silently degrade it.
 */
const ANTOINE_WATER = { A: 8.07131, B: 1730.63, C: 233.426 } as const;

/** Lower bound of Antoine validity for water, °C. */
const ANTOINE_MIN_C = 1;
/** Upper bound of Antoine validity for water, °C. */
const ANTOINE_MAX_C = 100;

// ============================================================================
// Unit helpers
// ============================================================================

export function cToF(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

export function fToC(fahrenheit: number): number {
  return (fahrenheit - 32) * (5 / 9);
}

export function cToK(celsius: number): number {
  return celsius + 273.15;
}

// ============================================================================
// Boiling point vs pressure
// ============================================================================

/**
 * Saturation temperature of water at a given absolute pressure.
 *
 * This is what actually caps every wet-heat method: boiling, steaming,
 * simmering, poaching, stewing and braising all run against the vapour-pressure
 * curve, so their ceiling moves with the weather and (far more) with altitude.
 *
 * @param pressureKpa Absolute pressure, kPa. Station pressure, NOT sea-level-adjusted.
 * @returns Boiling point in °C.
 * @throws RangeError if the implied temperature leaves Antoine validity (1–100 °C),
 *         which corresponds to roughly 0.65–101.3 kPa.
 */
export function boilingPointC(pressureKpa: number): number {
  if (!Number.isFinite(pressureKpa) || pressureKpa <= 0) {
    throw new RangeError(`pressureKpa must be a positive finite number, received ${pressureKpa}`);
  }
  const { A, B, C } = ANTOINE_WATER;
  const mmHg = pressureKpa * KPA_TO_MMHG;
  const denominator = A - Math.log10(mmHg);
  if (denominator <= 0) {
    throw new RangeError(`pressureKpa ${pressureKpa} is outside the Antoine range for water`);
  }
  const celsius = B / denominator - C;
  if (celsius < ANTOINE_MIN_C || celsius > ANTOINE_MAX_C + 0.01) {
    throw new RangeError(
      `pressureKpa ${pressureKpa} implies ${celsius.toFixed(1)} °C, outside Antoine validity ` +
        `(${ANTOINE_MIN_C}–${ANTOINE_MAX_C} °C). Pressurised systems need a steam-table lookup, not this.`,
    );
  }
  return celsius;
}

/**
 * Boiling point of water at a given elevation under the standard atmosphere.
 *
 * Composes the ISA barometric formula with the Antoine curve rather than the
 * folk rule of "1 °F per 500 ft", which is a linearisation that drifts badly
 * above ~1500 m.
 *
 * ⚠️ THROWS BELOW −3.98 m. `[MEASURED]` ISA pressure crosses Antoine's validity
 * ceiling at that elevation, so every point below it — the Netherlands
 * (−6.76 m), Death Valley (−86 m), the Turfan Depression (−154 m, ~600 000
 * residents), Jericho (−258 m), the Dead Sea resort strip (−430 m) — raises a
 * `RangeError` from this function. That is the correct contract for a physics
 * kernel and the wrong one for a UI, so **application code should call
 * {@link saturationCeilingAtElevation}**, which saturates and reports instead
 * of throwing.
 *
 * @param elevationM Metres above mean sea level.
 * @throws RangeError below ~−3.98 m (see above) and above the troposphere.
 */
export function boilingPointCAtElevation(elevationM: number): number {
  return boilingPointC(pressureFromElevation(elevationM));
}

/**
 * Highest pressure this library will feed to {@link boilingPointC}, kPa.
 *
 * BASIS: the ISA standard sea-level pressure, 101.325 kPa exactly. It is chosen
 * as the clamp target because it is a *defined* constant, not because it is
 * where Antoine actually fails. `[MEASURED]` Antoine (Stull 1947) hits its
 * 100.01 °C acceptance ceiling at **101.372841 kPa**, so there is 0.048 kPa of
 * headroom between this clamp and the throw.
 */
export const ANTOINE_CLAMP_KPA = 101.325;

/** A saturation temperature, plus whether we had to bend the input to get it. */
export interface SaturationCeiling {
  /** Boiling point at {@link appliedKpa}, °C. */
  celsius: number;
  /** True when the measurement exceeded {@link ANTOINE_CLAMP_KPA} and was capped. */
  clamped: boolean;
  /** What the barometer actually said, kPa — preserved even when clamped. */
  measuredKpa: number;
  /** What was fed to the correlation, kPa. */
  appliedKpa: number;
}

/**
 * Saturation temperature from a **measured absolute station pressure**, with
 * the Antoine validity ceiling applied as a reported clamp rather than a throw.
 *
 * ── Why clamp at all ────────────────────────────────────────────────────────
 *
 * {@link boilingPointC} throws above ~101.37 kPa, and that is the right
 * behaviour for a physics kernel: above 1 atm you need a steam table, and a
 * pressure cooker silently receiving an Antoine extrapolation would be a real
 * defect. But a live barometer is not a pressure vessel — it is a sensor that
 * routinely reads 102–103 kPa in an ordinary high-pressure system at sea level.
 * Letting the weather crash a cooking card is not a defensible failure mode.
 *
 * ── What the clamp costs ────────────────────────────────────────────────────
 *
 * `[MEASURED]` The clamp only bites above 101.325 kPa, and it understates:
 *
 * | station pressure | true ceiling | reported | understated by |
 * |------------------|--------------|----------|----------------|
 * | 101.325 kPa (ISA sea level) | 99.997 °C | 99.997 °C | 0 |
 * | 103 kPa (strong high)       | 100.455 °C | 99.997 °C | 0.46 °C |
 * | 105 kPa (exceptional)       | 100.994 °C | 99.997 °C | 1.00 °C |
 * | 107.8 kPa (record, low elevation) | 101.734 °C | 99.997 °C | 1.74 °C |
 *
 * So this is cheap in ordinary weather and NOT free in a record high — which is
 * exactly why `clamped` is returned rather than swallowed. A caller that wants
 * to hedge the number can; a caller that ignores it gets sea-level truth, which
 * is the same answer the app gave before it had a barometer at all.
 *
 * This is deliberately an interim measure. The correct fix is an IAPWS-IF97
 * saturation-line lookup, which is valid to 22 MPa and would serve pressure
 * cooking from the same code path.
 *
 * @param pressureKpa Absolute station pressure, kPa. NOT sea-level-reduced.
 * @throws RangeError only for non-finite, non-positive, or absurdly low input —
 *         i.e. a broken sensor, never weather.
 */
export function saturationCeilingFromStationPressure(pressureKpa: number): SaturationCeiling {
  if (!Number.isFinite(pressureKpa) || pressureKpa <= 0) {
    throw new RangeError(`pressureKpa must be a positive finite number, received ${pressureKpa}`);
  }
  const clamped = pressureKpa > ANTOINE_CLAMP_KPA;
  const appliedKpa = clamped ? ANTOINE_CLAMP_KPA : pressureKpa;
  return {
    celsius: boilingPointC(appliedKpa),
    clamped,
    measuredKpa: pressureKpa,
    appliedKpa,
  };
}

/**
 * Local water ceiling from elevation alone, with the Antoine limit applied as a
 * reported clamp — the safe counterpart to {@link boilingPointCAtElevation}.
 *
 * Use this anywhere the elevation came from a user, a device, or telemetry.
 * `[MEASURED]` Below −3.98 m the ISA pressure exceeds Antoine's validity and the
 * raw composition raises a `RangeError`; this saturates instead. The
 * understatement is real and bounded — 1.42 °C at the Dead Sea shore, the
 * lowest inhabited land on Earth — which is exactly why `clamped` is returned
 * rather than hidden.
 */
export function saturationCeilingAtElevation(elevationM: number): SaturationCeiling {
  return saturationCeilingFromStationPressure(pressureFromElevation(elevationM));
}

/**
 * How much longer a boil-limited method takes at elevation, as a multiplier.
 *
 * Returns 1.0 at sea level and grows as the water ceiling drops.
 *
 * ⚠️ THE z-VALUE IS THE WHOLE ANSWER, so it is a required argument rather than
 * a default. The two regimes differ by more than an order of magnitude and
 * picking the wrong one is not a rounding error:
 *
 *   Denver (1609 m), ceiling 94.7 °C — 5.3 °C below sea level
 *     softening / ordinary chemistry (z ≈ 33.2 °C)  →  ×1.4
 *     microbial lethality            (z = 5.6 °C)   →  ×9.0
 *
 * Both are correct for their own question. "How much longer do the potatoes
 * take" is the first; "how much longer to pasteurise" is the second. A single
 * blended number would be wrong for both, so this function refuses to choose.
 *
 * NOTE this applies only to methods whose rate is set by the water ceiling.
 * A 425 °F oven does not care about altitude this way — its air temperature is
 * unchanged; what shifts is the evaporative surface behaviour.
 */
export function altitudeTimeMultiplier(
  elevationM: number,
  regime: "softening" | "pasteurisation",
): number {
  const zValueC = regime === "pasteurisation" ? Z_VALUE_CULINARY_C : zValueFromQ10(Q10_CULINARY);
  // Saturating rather than raw: this takes a caller-supplied elevation, and
  // below −3.98 m the raw composition throws (see `boilingPointCAtElevation`).
  // Identical output at every non-negative elevation; the only behaviour change
  // is that below-sea-level input now returns ×1.00 instead of a RangeError.
  const seaLevel = saturationCeilingAtElevation(0).celsius;
  const atAltitude = saturationCeilingAtElevation(elevationM).celsius;
  return timeScaleFactor(atAltitude - seaLevel, zValueC);
}

// ============================================================================
// Rate vs temperature
// ============================================================================

/**
 * Generic culinary z-value, °C — the temperature change that moves a
 * time-to-effect by one decade (10×).
 *
 * BASIS: z ≈ 5.6 °C (10 °F) is the standard value for *Salmonella* in meat
 * used by USDA-FSIS lethality modelling, and is the conventional planning
 * figure for whole-muscle pasteurisation. It is a microbial-lethality constant;
 * do not read it as a doneness or texture constant.
 */
export const Z_VALUE_CULINARY_C = 5.6;

/**
 * Van 't Hoff Q10 for ordinary culinary chemistry — rate roughly doubles per
 * 10 °C. Equivalent to a z-value of 10/log10(2) ≈ 33.2 °C.
 *
 * BASIS: van 't Hoff's rule. It is a rule of thumb, not a measurement, and it
 * is much flatter than microbial lethality — which is exactly why a single
 * "time adjustment" number cannot serve both.
 */
export const Q10_CULINARY = 2;

/** z-value equivalent of a Q10, in °C. */
export function zValueFromQ10(q10: number): number {
  return 10 / Math.log10(q10);
}

/**
 * Multiplier on time-to-effect for a temperature change of `deltaC`.
 *
 * A negative delta (cooler) returns > 1 (slower); a positive delta returns < 1.
 * `factor = 10^(−deltaC / z)`.
 */
export function timeScaleFactor(deltaC: number, zValueC = Z_VALUE_CULINARY_C): number {
  if (!(zValueC > 0)) {
    throw new RangeError(`zValueC must be positive, received ${zValueC}`);
  }
  return Math.pow(10, -deltaC / zValueC);
}

// ============================================================================
// Transient conduction — the one-term slab solution
// ============================================================================

/**
 * Biot number: internal conduction resistance vs surface convection resistance.
 *
 * Bi ≪ 0.1 → the food is thermally "thin"; the surroundings set the pace and a
 * hotter medium helps directly. Bi ≫ 1 → conduction inside the food dominates,
 * and past a point a hotter oven only burns the outside faster.
 *
 * @param hWm2K Surface heat transfer coefficient, W·m⁻²·K⁻¹.
 * @param halfThicknessM Half the slab thickness (the conduction path), metres.
 * @param kWmK Thermal conductivity of the food, W·m⁻¹·K⁻¹.
 */
export function biotNumber(hWm2K: number, halfThicknessM: number, kWmK: number): number {
  if (!(kWmK > 0)) throw new RangeError(`kWmK must be positive, received ${kWmK}`);
  return (hWm2K * halfThicknessM) / kWmK;
}

/**
 * First eigenvalue λ₁ of the plane-wall transient solution, solving
 * `λ·tan λ = Bi` on (0, π/2).
 *
 * Bisection to 1e-12; monotone on the interval so convergence is guaranteed.
 */
export function slabEigenvalue(biot: number): number {
  if (!(biot >= 0)) throw new RangeError(`biot must be non-negative, received ${biot}`);
  if (biot === 0) return 0;
  let lo = 0;
  let hi = Math.PI / 2 - 1e-12;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (mid * Math.tan(mid) < biot) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Leading coefficient A₁ of the plane-wall one-term solution. */
export function slabCoefficient(lambda1: number): number {
  if (lambda1 === 0) return 1;
  return (4 * Math.sin(lambda1)) / (2 * lambda1 + Math.sin(2 * lambda1));
}

// ============================================================================
// Geometry — the one-term solution for cylinders and spheres
// ============================================================================

/**
 * The three shapes the one-term transient solution is defined for.
 *
 * A steak is a slab, a roast or a carrot is a cylinder, a meatball or a
 * potato is a sphere. The distinction is not cosmetic: at the same Biot
 * number a sphere cores in roughly a third the Fourier time of a slab,
 * because it is fed from three directions instead of one.
 */
export type FoodGeometry = "slab" | "cylinder" | "sphere";

/**
 * Number of terms in the Bessel series below.
 *
 * FIXED, not convergence-tested. A loop that exits when a term stops mattering
 * is free to exit after a different number of iterations in a different
 * runtime, and that is a last-bit difference the parity test exists to catch.
 *
 * `[MEASURED 2026-08-17]` At the worst-case argument this file can produce —
 * x = j₀,₁ = 2.4048, the ceiling of the cylinder eigenvalue search — J₀ reaches
 * its final bits at 19 terms and J₁ at 11. 30 therefore carries an 11-term
 * margin over the binding case. Reproduce by sweeping the term count against a
 * 60-term reference; the Rust golden test fails below 19, which is what pins
 * this number as a measurement rather than a guess.
 */
const BESSEL_TERMS = 30;

/**
 * Bessel function of the first kind, order 0, by the ascending power series
 *
 * > J₀(x) = Σ (−1)ᵐ (x/2)²ᵐ / (m!)²
 *
 * BASIS: Abramowitz & Stegun, *Handbook of Mathematical Functions*, 9.1.10.
 *
 * VALIDITY. The series is exact for all x but loses precision to cancellation
 * once x grows past roughly 10. That is not a limit here: the only argument
 * this file ever passes is a cylinder's first eigenvalue, which lies in
 * (0, j₀,₁ ≈ 2.4048]. Do not reach for this as a general-purpose J₀.
 *
 * Implemented with the recurrence rather than factorials so that no
 * intermediate overflows, and with `+ − × ÷` only — no transcendental is
 * involved, which is what makes bit-exact agreement with the Rust half
 * achievable at all. Rust's `std` has no Bessel function, and the `libm`
 * crate's would reintroduce the platform drift already logged against this
 * codebase.
 */
export function besselJ0(x: number): number {
  const half = x / 2;
  const halfSq = half * half;
  let term = 1;
  let sum = 1;
  for (let m = 1; m <= BESSEL_TERMS; m += 1) {
    term = (-term * halfSq) / (m * m);
    sum += term;
  }
  return sum;
}

/**
 * Bessel function of the first kind, order 1, by the ascending power series
 *
 * > J₁(x) = Σ (−1)ᵐ (x/2)²ᵐ⁺¹ / (m!·(m+1)!)
 *
 * BASIS: Abramowitz & Stegun 9.1.10. Same validity envelope and the same
 * reasoning about determinism as {@link besselJ0}.
 */
export function besselJ1(x: number): number {
  const half = x / 2;
  const halfSq = half * half;
  let term = half;
  let sum = half;
  for (let m = 1; m <= BESSEL_TERMS; m += 1) {
    term = (-term * halfSq) / (m * (m + 1));
    sum += term;
  }
  return sum;
}

/** Upper bound of the first eigenvalue for each geometry, as Bi → ∞. */
const EIGENVALUE_CEILING: Record<FoodGeometry, number> = {
  // λ·tan λ → ∞ at π/2.
  slab: Math.PI / 2,
  // The first zero of J₀, j₀,₁. Bounds the cylinder's λ₁ and therefore bounds
  // every argument the Bessel series above is ever asked for.
  cylinder: 2.404825557695773,
  // 1 − λ·cot λ → ∞ at π.
  sphere: Math.PI,
};

/**
 * The transcendental whose root is λ₁, written as `f(λ) − Bi`.
 *
 * Each is monotone increasing on (0, ceiling), which is what lets a plain
 * bisection find the root without a derivative and without the possibility of
 * landing on a higher branch.
 *
 *   slab      λ·tan λ        = Bi
 *   cylinder  λ·J₁(λ)/J₀(λ)  = Bi
 *   sphere    1 − λ·cot λ    = Bi
 *
 * ⚠️ THE SPHERE IS WRITTEN MULTIPLIED THROUGH BY sin λ, DELIBERATELY.
 *
 * `[MEASURED 2026-08-17]` Written the direct way — `1 − λ/tan λ − Bi` — this
 * runtime and Rust disagreed by **32 ULP** on λ₁ at Bi = 0.001, four times the
 * measured budget for the whole rest of the fixture. The cause is conditioning,
 * not a wrong formula: the residual's slope at the root collapses to 3.65e-2 at
 * Bi = 0.001 against 1.57 at Bi = 1, so a last-bit disagreement in `tan` is
 * amplified by roughly forty. Multiplying through by sin λ removes the division
 * and trades `tan` for `sin` and `cos`, which agree between V8 and Rust's libm
 * where `tan` does not: the same 27 vectors then reproduce at **0 ULP** on this
 * host, for all three geometries.
 *
 * The root is unchanged — sin λ > 0 on (0, π), so multiplying by it moves no
 * sign and therefore moves no bisection step. Do not "simplify" this back to
 * the cot form; it is the shape of the expression that is load bearing.
 */
function eigenvalueResidual(geometry: FoodGeometry, lambda: number, biot: number): number {
  switch (geometry) {
    case "slab":
      return lambda * Math.tan(lambda) - biot;
    case "cylinder":
      return (lambda * besselJ1(lambda)) / besselJ0(lambda) - biot;
    case "sphere":
      return (1 - biot) * Math.sin(lambda) - lambda * Math.cos(lambda);
  }
}

/**
 * First eigenvalue λ₁ of the one-term transient solution for a given shape.
 *
 * Bisection, 200 iterations, matching {@link slabEigenvalue} exactly — the
 * iteration count is part of the answer, not an implementation detail, because
 * a different count is a different last bit.
 *
 * BASIS: Incropera & DeWitt, *Fundamentals of Heat and Mass Transfer*,
 * Table 5.1 and §5.5.
 */
export function geometryEigenvalue(geometry: FoodGeometry, biot: number): number {
  if (!(biot >= 0)) throw new RangeError(`biot must be non-negative, received ${biot}`);
  if (biot === 0) return 0;
  let lo = 0;
  let hi = EIGENVALUE_CEILING[geometry] - 1e-12;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (eigenvalueResidual(geometry, mid, biot) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Leading coefficient A₁ of the one-term solution for a given shape.
 *
 * BASIS: Incropera & DeWitt, Table 5.1.
 *
 *   slab      4 sin λ / (2λ + sin 2λ)
 *   cylinder  (2/λ)·J₁(λ) / (J₀²(λ) + J₁²(λ))
 *   sphere    4(sin λ − λ cos λ) / (2λ − sin 2λ)
 */
export function geometryCoefficient(geometry: FoodGeometry, lambda1: number): number {
  if (lambda1 === 0) return 1;
  switch (geometry) {
    case "slab":
      return slabCoefficient(lambda1);
    case "cylinder": {
      const j0 = besselJ0(lambda1);
      const j1 = besselJ1(lambda1);
      return ((2 / lambda1) * j1) / (j0 * j0 + j1 * j1);
    }
    case "sphere":
      return (
        (4 * (Math.sin(lambda1) - lambda1 * Math.cos(lambda1))) /
        (2 * lambda1 - Math.sin(2 * lambda1))
      );
  }
}

/**
 * Characteristic length Lc = V/A, in units of the shape's own half-dimension.
 *
 * This is the volumetric statement of why shape changes cooking time. For a
 * slab of half-thickness L the conduction path is L itself; a cylinder of
 * radius R behaves as R/2 and a sphere as R/3, because each has more surface
 * feeding the same volume. It is also exactly the ratio that makes a diced
 * vegetable cook faster than a whole one at identical thickness.
 */
export function characteristicLengthRatio(geometry: FoodGeometry): number {
  switch (geometry) {
    case "slab":
      return 1;
    case "cylinder":
      return 1 / 2;
    case "sphere":
      return 1 / 3;
  }
}

/**
 * Surface-area-to-volume ratio, m⁻¹, for a piece of the given shape.
 *
 * @param geometry Shape of the piece.
 * @param halfDimensionM Half-thickness for a slab, radius for the others, metres.
 */
export function surfaceAreaToVolume(geometry: FoodGeometry, halfDimensionM: number): number {
  if (!(halfDimensionM > 0)) {
    throw new RangeError(`halfDimensionM must be positive, received ${halfDimensionM}`);
  }
  return 1 / (halfDimensionM * characteristicLengthRatio(geometry));
}

export interface SlabCookInput {
  /** Full thickness of the piece, millimetres. */
  thicknessMm: number;
  /** Medium temperature (oven air, bath water, oil), °C. */
  mediumC: number;
  /** Starting core temperature, °C. */
  initialC: number;
  /** Target core temperature, °C. */
  targetC: number;
  /** Surface heat transfer coefficient, W·m⁻²·K⁻¹. */
  hWm2K: number;
  /** Thermal conductivity of the food, W·m⁻¹·K⁻¹. */
  kWmK?: number;
  /** Thermal diffusivity of the food, m²·s⁻¹. */
  alphaM2s?: number;
  /** Heated from one face only (a pan, a plancha) rather than all round. */
  oneSided?: boolean;
}

export interface SlabCookResult {
  /** Time for the core to reach `targetC`, minutes. */
  minutes: number;
  biot: number;
  /** Fourier number at the answer. The one-term series is valid for Fo > 0.2. */
  fourier: number;
  /** False when Fo ≤ 0.2 — the one-term truncation understates the early transient. */
  oneTermValid: boolean;
  lambda1: number;
  coefficientA1: number;
}

/**
 * Time for the CENTRE of a slab to reach a target temperature.
 *
 * Textbook one-term approximation to the plane-wall transient conduction
 * solution with convective boundaries (Incropera & DeWitt, *Fundamentals of
 * Heat and Mass Transfer*, §5.5):
 *
 *     θ* = A₁ · exp(−λ₁² · Fo),   λ₁·tan λ₁ = Bi,   Fo = α·t / L²
 *
 * VALIDATION `[MEASURED 2026-08-16]`: a 25 mm steak from 5 °C in a 55 °C bath
 * at h = 95 W·m⁻²·K⁻¹ (Baldwin's figure for a well-circulated water bath) to
 * within 0.5 °C of the bath returns ≈ 72 min, against ≈ 60–70 min in Baldwin's
 * published sous-vide tables for a 25 mm slab. Pinned in `cookingThermo.test.ts`.
 *
 * LIMITS. A real steak is not an infinite slab, a roast is closer to a cylinder,
 * and neither is isotropic. This answers "how does time scale with thickness,
 * medium temperature and transfer coefficient" — which is the question the UI
 * asks — not "exactly when is dinner ready". Never present it without its
 * assumptions.
 */
export function slabCoreTime(input: SlabCookInput): SlabCookResult {
  const {
    thicknessMm,
    mediumC,
    initialC,
    targetC,
    hWm2K,
    kWmK = FOOD_THERMAL.leanMeat.kWmK,
    alphaM2s = FOOD_THERMAL.leanMeat.alphaM2s,
    oneSided = false,
  } = input;

  if (!(thicknessMm > 0)) throw new RangeError(`thicknessMm must be positive, received ${thicknessMm}`);

  // Symmetric heating makes the mid-plane adiabatic, so the conduction path is
  // half the thickness. Heated from one face, the path is the full thickness.
  const halfThicknessM = (thicknessMm / 1000) * (oneSided ? 1 : 0.5);

  const thetaTarget = (targetC - mediumC) / (initialC - mediumC);
  if (!(thetaTarget > 0)) {
    throw new RangeError(
      `targetC ${targetC} °C is not between initialC ${initialC} °C and mediumC ${mediumC} °C; ` +
        `the core can never reach it in this medium`,
    );
  }

  const biot = biotNumber(hWm2K, halfThicknessM, kWmK);
  const lambda1 = slabEigenvalue(biot);
  const coefficientA1 = slabCoefficient(lambda1);

  const fourier = -Math.log(thetaTarget / coefficientA1) / (lambda1 * lambda1);
  const seconds = (fourier * halfThicknessM * halfThicknessM) / alphaM2s;

  return {
    minutes: seconds / 60,
    biot,
    fourier,
    oneTermValid: fourier > 0.2,
    lambda1,
    coefficientA1,
  };
}

/**
 * Thermophysical properties of common food classes.
 *
 * BASIS: Singh & Heldman, *Introduction to Food Engineering*, food-property
 * tables; values are the conventional mid-range figures for each class at
 * cooking temperatures. Foods are heterogeneous and these move with
 * composition, so they are stated as representative, not exact.
 */
export const FOOD_THERMAL = {
  /** Lean muscle (beef/poultry breast), ~75 % water. */
  leanMeat: { kWmK: 0.45, alphaM2s: 1.3e-7, label: "Lean muscle" },
  /** Fatty muscle / belly cuts — fat insulates, so both drop. */
  fattyMeat: { kWmK: 0.35, alphaM2s: 1.0e-7, label: "Fatty cut" },
  /** Fish flesh — slightly higher water fraction than land muscle. */
  fish: { kWmK: 0.47, alphaM2s: 1.35e-7, label: "Fish" },
  /** Dense starchy vegetable (potato, root veg). */
  rootVegetable: { kWmK: 0.55, alphaM2s: 1.4e-7, label: "Root vegetable" },
  /** Leafy / high-void vegetable — trapped air drags conductivity down. */
  leafyVegetable: { kWmK: 0.3, alphaM2s: 1.2e-7, label: "Leafy vegetable" },
  /** Wheat dough / bread crumb — the void fraction dominates. */
  dough: { kWmK: 0.25, alphaM2s: 1.1e-7, label: "Dough / batter" },
} as const;

export type FoodClass = keyof typeof FOOD_THERMAL;

// ============================================================================
// Radiation
// ============================================================================

/**
 * Net radiant flux onto a food surface, kW·m⁻².
 *
 * This is the quantity that separates grilling and broiling from every other
 * dry-heat method. A charcoal bed at ~1200 K delivers on the order of 100 kW·m⁻²;
 * a 450 °F oven wall delivers about 3. The 30× gap — not the air temperature —
 * is why one chars in ninety seconds and the other browns in twenty minutes.
 *
 * @param sourceK Radiating source temperature, kelvin.
 * @param surfaceK Food surface temperature, kelvin.
 * @param emissivity Effective emissivity of the exchange, 0–1.
 * @param viewFactor Fraction of the food surface's hemisphere filled by the source.
 */
export function radiantFluxKwM2(
  sourceK: number,
  surfaceK: number,
  emissivity = 0.85,
  viewFactor = 1,
): number {
  const net = STEFAN_BOLTZMANN * (Math.pow(sourceK, 4) - Math.pow(surfaceK, 4));
  return (emissivity * viewFactor * net) / 1000;
}

/**
 * Effective radiative heat transfer coefficient, W·m⁻²·K⁻¹.
 *
 * Linearises radiation about the current temperatures so it can be added to a
 * convective h and fed to the slab solution:
 * `h_rad = ε·σ·(T_s² + T_∞²)·(T_s + T_∞)`.
 */
export function radiativeH(sourceK: number, surfaceK: number, emissivity = 0.85): number {
  return (
    emissivity *
    STEFAN_BOLTZMANN *
    (sourceK * sourceK + surfaceK * surfaceK) *
    (sourceK + surfaceK)
  );
}

// ============================================================================
// Evaporative ceiling
// ============================================================================

/**
 * Validity envelope actually used for the Stull wet-bulb fit, °C.
 *
 * Narrower than the paper's stated −20…50 °C. `[MEASURED 2026-08-16]` sweeping
 * the fit over 5–99 % RH, the returned wet bulb EXCEEDS the dry bulb — which is
 * thermodynamically impossible, since the wet bulb is an evaporative minimum —
 * below about −12 °C:
 *
 *   dry −20 °C  →  wet bulb up to 2.41 K ABOVE dry bulb
 *   dry −15 °C  →  up to 0.24 K above
 *   dry −10 °C  →  −0.26 K, constraint holds
 *
 * At the top end the violation is ≤ 0.05 K at 50 °C, well inside the fit's own
 * ±1 °C accuracy, so 50 °C is kept and the result is clamped instead.
 */
const STULL_MIN_C = -10;
const STULL_MAX_C = 50;

/**
 * Wet-bulb temperature from dry-bulb and relative humidity, °C.
 *
 * BASIS: Stull (2011), "Wet-Bulb Temperature from Relative Humidity and Air
 * Temperature", *J. Appl. Meteorol. Climatol.* 50(11). Empirical fit, stated
 * accuracy ±1 °C over −20…50 °C and 5–99 % RH at sea level.
 *
 * Returns null outside that envelope rather than extrapolating.
 *
 * ⚠️ DO NOT REACH FOR THIS AT OVEN TEMPERATURES. `[MEASURED 2026-08-16]` at a
 * 175 °C dry bulb and 100 % RH the fit returns 176.1 °C — above the dry bulb,
 * which is thermodynamically impossible (the wet bulb is an evaporative
 * minimum and can never exceed it). The fit is not wrong; it is being asked a
 * question 125 °C outside the data it was built on. For the oven case the
 * correct and far simpler statement is {@link evaporativeCeilingC}.
 *
 * The legitimate use here is AMBIENT air: the kitchen's own humidity, which
 * governs air-drying, curing, dehydrating and proofing.
 */
export function wetBulbC(dryBulbC: number, relativeHumidityPct: number): number | null {
  if (dryBulbC < STULL_MIN_C || dryBulbC > STULL_MAX_C) return null;
  const rh = Math.min(99, Math.max(5, relativeHumidityPct));
  const t = dryBulbC;
  const fitted =
    t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(t + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  // Enforce the physical constraint the regression does not know about: the
  // wet bulb is an evaporative minimum and can never exceed the dry bulb.
  return Math.min(fitted, t);
}

/**
 * The temperature a freely-evaporating wet food surface cannot exceed, °C.
 *
 * While liquid water is leaving the surface, every extra joule goes into the
 * latent heat of vaporisation rather than into raising the temperature, so the
 * surface pins near the saturation temperature at the local pressure no matter
 * how hot the oven is set. Browning chemistry — Maillard from ~140 °C,
 * caramelisation higher still — therefore cannot begin anywhere on that
 * surface until it dries out locally.
 *
 * This is the rigorous version of the point the wet-bulb fit was reaching for,
 * and unlike that fit it holds at oven temperatures because it is a phase
 * equilibrium, not a regression.
 *
 * Two consequences worth surfacing to a cook:
 *  - A covered dish and an uncovered dish at the same set temperature are not
 *    the same cook. The lid holds the surface at the ceiling indefinitely.
 *  - At altitude the ceiling itself drops, so crusts form at a lower surface
 *    temperature and the browning window shifts.
 */
export function evaporativeCeilingC(pressureKpa = 101.325): number {
  return boilingPointC(pressureKpa);
}

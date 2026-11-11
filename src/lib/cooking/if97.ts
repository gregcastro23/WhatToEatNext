import {
  IF97_R_KJ_KG_K,
  REGION1_IJN,
  REGION2_IDEAL_JN,
  REGION2_RESIDUAL_IJN,
  REGION4_N,
} from "./if97Coefficients";

/**
 * IAPWS-IF97 saturation line and saturated enthalpies for water.
 *
 * BASIS: IAPWS R7-97(2012). Region 4 (eqs. 30–31) gives the saturation
 * line; regions 1 and 2 (eqs. 7 and 15) give the enthalpy of saturated liquid
 * and saturated vapour on either side of it, so h_fg = h'' − h' is a
 * consequence of the formulation, not a fitted curve.
 *
 * ## Why this exists beside thermo.ts
 *
 * `boilingPointC` (Antoine, Stull 1947) is fitted for 1–100 °C and throws
 * above 101.3 kPa by design: "pressurised systems need a steam-table lookup".
 * This is that lookup. IF97 is the industrial standard for steam tables and
 * covers 611.213 Pa – 22.064 MPa, so a sealed 250 kPa vessel and a 10 kPa
 * vacuum still sit well inside it.
 *
 * The saturation functions THROW outside region 4 (and the saturated-state
 * function where region 3 begins) — the same contract as the other kernels
 * in src/lib/cooking. The region 1 and 2 enthalpy functions do NOT check
 * region membership: this module only evaluates them on the saturation line,
 * and they are exported for the release's verification tests. Called
 * elsewhere they return a number with no meaning outside their region.
 *
 * @file src/lib/cooking/if97.ts
 */

const KELVIN_OFFSET = 273.15;
/** Triple-point pressure, MPa — R7-97 region 4 lower bound. */
const P_MIN_MPA = 611.213e-6;
/** Critical pressure, MPa — R7-97 region 4 upper bound. */
const P_CRIT_MPA = 22.064;
/** Region 4 temperature bounds, K. */
const T_MIN_K = 273.15;
const T_CRIT_K = 647.096;
/** Regions 1 and 2 stop at 623.15 K; above it the saturated states lie in region 3. */
const T_REGION3_K = 623.15;

/** n1…n10 of Table 34, destructured once so the equations read like the release. */
function n4(i: number): number {
  const v = REGION4_N[i - 1];
  if (v === undefined) throw new RangeError(`IF97 region 4 has no coefficient n${i}`);
  return v;
}

/** Saturation pressure at an absolute temperature, MPa (R7-97 eq. 30). */
export function saturationPressureMpa(kelvin: number): number {
  if (!(kelvin >= T_MIN_K && kelvin <= T_CRIT_K)) {
    throw new RangeError(
      `IF97 saturation pressure is defined for ${T_MIN_K}–${T_CRIT_K} K, received ${kelvin}`,
    );
  }
  const theta = kelvin + n4(9) / (kelvin - n4(10));
  const a = theta * theta + n4(1) * theta + n4(2);
  const b = n4(3) * theta * theta + n4(4) * theta + n4(5);
  const c = n4(6) * theta * theta + n4(7) * theta + n4(8);
  return ((2 * c) / (-b + Math.sqrt(b * b - 4 * a * c))) ** 4;
}

/** Saturation temperature at an absolute pressure, K (R7-97 eq. 31). */
export function saturationTemperatureK(pressureMpa: number): number {
  if (!(pressureMpa >= P_MIN_MPA && pressureMpa <= P_CRIT_MPA)) {
    throw new RangeError(
      `IF97 saturation temperature is defined for ${P_MIN_MPA}–${P_CRIT_MPA} MPa, received ${pressureMpa}`,
    );
  }
  const beta = pressureMpa ** 0.25;
  const e = beta * beta + n4(3) * beta + n4(6);
  const f = n4(1) * beta * beta + n4(4) * beta + n4(7);
  const g = n4(2) * beta * beta + n4(5) * beta + n4(8);
  const d = (2 * g) / (-f - Math.sqrt(f * f - 4 * e * g));
  const s = n4(10) + d;
  return (s - Math.sqrt(s * s - 4 * (n4(9) + n4(10) * d))) / 2;
}

/** Saturation pressure, kPa, at a temperature in °C. */
export function saturationPressureKpa(celsius: number): number {
  return saturationPressureMpa(celsius + KELVIN_OFFSET) * 1000;
}

/** Saturation (boiling) temperature, °C, at an absolute pressure in kPa. */
export function saturationTemperatureC(pressureKpa: number): number {
  return saturationTemperatureK(pressureKpa / 1000) - KELVIN_OFFSET;
}

/**
 * Specific enthalpy in region 1 (liquid), kJ·kg⁻¹ (R7-97 eq. 7, Table 3).
 * Valid 273.15–623.15 K at p_s(T) ≤ p ≤ 100 MPa. UNCHECKED — the caller owns
 * region membership (see the module note).
 */
export function region1EnthalpyKjKg(pressureMpa: number, kelvin: number): number {
  const pi = pressureMpa / 16.53;
  const tau = 1386 / kelvin;
  let gammaTau = 0;
  for (const [i, j, n] of REGION1_IJN) {
    gammaTau += n * (7.1 - pi) ** i * j * (tau - 1.222) ** (j - 1);
  }
  return IF97_R_KJ_KG_K * kelvin * tau * gammaTau;
}

/**
 * Specific enthalpy in region 2 (vapour), kJ·kg⁻¹ (R7-97 eqs. 15–17, Table 12).
 * Valid at 0 < p ≤ p_s(T) up to 623.15 K (the release extends region 2 to
 * 1073.15 K above the B23 line). UNCHECKED — the caller owns region membership.
 */
export function region2EnthalpyKjKg(pressureMpa: number, kelvin: number): number {
  const pi = pressureMpa;
  const tau = 540 / kelvin;
  let ideal = 0;
  for (const [j, n] of REGION2_IDEAL_JN) ideal += n * j * tau ** (j - 1);
  let residual = 0;
  for (const [i, j, n] of REGION2_RESIDUAL_IJN) {
    residual += n * pi ** i * j * (tau - 0.5) ** (j - 1);
  }
  return IF97_R_KJ_KG_K * kelvin * tau * (ideal + residual);
}

export interface SaturationState {
  pressureKpa: number;
  /** Saturation temperature, °C. */
  tsatC: number;
  /** Saturated-liquid enthalpy h′, kJ·kg⁻¹. */
  liquidKjKg: number;
  /** Saturated-vapour enthalpy h″, kJ·kg⁻¹. */
  vaporKjKg: number;
  /** Latent heat of vaporisation h_fg = h″ − h′, kJ·kg⁻¹. */
  latentKjKg: number;
}

/**
 * The saturated state at a pressure: T_sat, h′, h″ and h_fg.
 *
 * @throws RangeError outside region 4, or where the saturated states leave
 *         regions 1/2 (T_sat > 623.15 K, about 16.5 MPa — region 3).
 */
export function saturationStateAtPressure(pressureKpa: number): SaturationState {
  const pressureMpa = pressureKpa / 1000;
  const kelvin = saturationTemperatureK(pressureMpa);
  if (kelvin > T_REGION3_K) {
    throw new RangeError(
      `Saturated states at ${pressureKpa} kPa lie in IF97 region 3, which this module does not implement`,
    );
  }
  const liquidKjKg = region1EnthalpyKjKg(pressureMpa, kelvin);
  const vaporKjKg = region2EnthalpyKjKg(pressureMpa, kelvin);
  return {
    pressureKpa,
    tsatC: kelvin - KELVIN_OFFSET,
    liquidKjKg,
    vaporKjKg,
    latentKjKg: vaporKjKg - liquidKjKg,
  };
}

/**
 * The oven side of the boundary: convection, radiation, and the vapour the
 * oven air carries — all through the existing, cited kernels.
 *
 * - Convection: `naturalConvectionH` (Churchill & Chu; McAdams plates) in a
 *   still oven, `forcedConvectionHFlatPlate` (Incropera §7.2) under a fan.
 *   ⚠️ Orientation matters and is easy to get backwards: a COLD surface facing
 *   UP into hot air is the stable case — the cooled air pools on it — which is
 *   the McAdams "hot surface facing down" correlation. A cold plate heated from
 *   BELOW is the unstable case, "hot surface facing up". So a loaf's top gets
 *   `horizontal-down` and the pan's underside gets `horizontal-up`.
 * - Radiation: `radiativeH`, linearised εσ(T₁² + T₂²)(T₁ + T₂), with the walls
 *   at the setpoint (a modelling choice: real elements cycle hotter).
 * - Oven air vapour: a vented oven carries kitchen air heated to the setpoint
 *   (`humidAirVapourDensity`); a steamed oven carries the stated vapour mole
 *   fraction. Both are handled as a partial pressure (see `wetFaceMoisture`).
 * - Evaporation and condensation: `evaporativeFlux` (Chilton–Colburn), which
 *   deliberately does NOT clamp the negative case — steam condensing on a cold
 *   loaf is the mechanism that keeps a steamed crust supple.
 *
 * @file src/lib/baking/sim/boundary.ts
 */
import {
  airProperties,
  evaporativeFlux,
  forcedConvectionHFlatPlate,
  GAS_CONSTANT,
  humidAirVapourDensity,
  MOLAR_MASS_WATER,
  naturalConvectionH,
  saturationPressureKpa,
  type ConvectiveSurface,
} from "@/lib/cooking/boundaryNetwork";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import { radiativeH } from "@/lib/cooking/thermo";
import type { OvenSettings } from "../formulaTypes";
import type { AmbientKitchen } from "./simTypes";

const KELVIN = 273.15;

/** Coefficients for one exposed face. */
export interface FaceCoefficients {
  convectionWm2K: number;
  radiationWm2K: number;
  /** Temperature the face exchanges with: the h-weighted mean of air and walls, °C. */
  envC: number;
}

/**
 * Convective coefficient between the oven air and a face, W·m⁻²·K⁻¹.
 * @param surface Orientation, per the note above.
 * @param lengthM Plate characteristic length (A/P) or cylinder diameter in still air; plate length under a fan.
 */
export function convectionCoefficient(
  oven: OvenSettings,
  surfaceC: number,
  surface: ConvectiveSurface,
  lengthM: number,
): number {
  const film = airProperties((surfaceC + oven.ovenC) / 2);
  if (oven.mode === "convection" && oven.fanMs > 0) {
    return forcedConvectionHFlatPlate(film, oven.fanMs, lengthM).hWm2K;
  }
  return naturalConvectionH(film, surface, Math.abs(oven.ovenC - surfaceC), lengthM).hWm2K;
}

export function faceCoefficients(
  oven: OvenSettings,
  surfaceC: number,
  surface: ConvectiveSurface,
  lengthM: number,
): FaceCoefficients {
  const convectionWm2K = convectionCoefficient(oven, surfaceC, surface, lengthM);
  // The kernel's default emissivity: no measured dough or crust emissivity was
  // found (2026-11-15 literature pass), so none is claimed here.
  const radiationWm2K = radiativeH(oven.ovenC + KELVIN, surfaceC + KELVIN);
  const envC = oven.ovenC; // air and walls are both at the setpoint in this model
  return { convectionWm2K, radiationWm2K, envC };
}

/** Water-vapour partial pressure of the oven air at minute `tMin`, Pa. */
export function ovenVapourPressurePa(
  oven: OvenSettings,
  tMin: number,
  ambient: AmbientKitchen,
  pressureKpa: number,
): number {
  if (oven.steamFraction > 0 && tMin < oven.steamMinutes) return oven.steamFraction * pressureKpa * 1000;
  // A vented oven holds kitchen air heated at constant composition; recover its partial pressure from the
  // kernel's vapour density by the ideal gas law at the oven temperature.
  const density = humidAirVapourDensity(ambient.kitchenC, ambient.kitchenRhPct, oven.ovenC);
  return (density * GAS_CONSTANT * (oven.ovenC + KELVIN)) / MOLAR_MASS_WATER;
}

export interface SurfaceMoistureFlux {
  /** Water leaving the face, kg·m⁻²·s⁻¹ — negative when steam condenses onto it. */
  massFluxKgM2s: number;
  /** Heat carried away by it, W·m⁻² — negative (a gain) on condensation. */
  latentWm2: number;
}

/**
 * Evaporation from (or condensation onto) a WET face, valid while the face is
 * wet (at or below the local boil; the Antoine curve refuses outside 1–100 °C).
 *
 * The mass-transfer coefficient h_m is the kernel's (`evaporativeFlux`,
 * Chilton–Colburn). The DRIVING FORCE is not: the kernel takes the difference
 * of vapour densities, each at its own temperature, which is exact for a
 * surface near air temperature but in a 250 °C oven understates the air's
 * vapour against a 90 °C surface by the ratio of their absolute temperatures
 * (≈ 30 %) — enough to stop steam condensing ten kelvin below its dew point.
 * Here the force is the partial-pressure difference at the FILM temperature,
 *
 *   ṁ″ = h_m · M_w · (p_sat(T_s) − p_∞) / (R · T_film),
 *
 * the mole-fraction form that holds across a large temperature difference, so
 * condensation runs exactly until the surface reaches the dew point.
 */
export function wetFaceMoisture(
  convectionWm2K: number,
  surfaceC: number,
  oven: OvenSettings,
  bulkVapourPa: number,
): SurfaceMoistureFlux {
  const latent = latentHeatVaporisation(surfaceC);
  const { hMassMs } = evaporativeFlux(convectionWm2K, surfaceC, oven.ovenC, 0, latent);
  const filmK = (surfaceC + oven.ovenC) / 2 + KELVIN;
  const massFluxKgM2s = (hMassMs * MOLAR_MASS_WATER * (saturationPressureKpa(surfaceC) * 1000 - bulkVapourPa)) / (GAS_CONSTANT * filmK);
  return { massFluxKgM2s, latentWm2: massFluxKgM2s * latent };
}

export interface WetSurfaceSolution {
  surfaceC: number;
  latentWm2: number;
  massFluxKgM2s: number;
}

const BISECTION_STEPS = 32;

/**
 * A wet face's temperature from its own energy balance,
 *
 *   g_in·(T_node − T_s) + h_out·(T_env − T_s) = latent(T_s),
 *
 * solved by bisection between 1 °C and the local boiling ceiling — the left
 * side falls with T_s and the right climbs exponentially, so the root is
 * unique (the same argument as `evaporativePinnedSurfaceC`). Solving it rather
 * than lagging the latent term is what keeps a steaming or drying surface from
 * oscillating between two wrong temperatures.
 */
export function solveWetSurface(
  gInWm2K: number,
  nodeC: number,
  coefficients: FaceCoefficients,
  oven: OvenSettings,
  bulkVapourPa: number,
  ceilingC: number,
): WetSurfaceSolution {
  const hOut = coefficients.convectionWm2K + coefficients.radiationWm2K;
  const residual = (t: number): number =>
    gInWm2K * (nodeC - t) + hOut * (coefficients.envC - t) - wetFaceMoisture(coefficients.convectionWm2K, t, oven, bulkVapourPa).latentWm2;
  let lo = 1;
  let hi = ceilingC;
  if (residual(hi) >= 0) lo = hi;
  else if (residual(lo) <= 0) hi = lo;
  for (let i = 0; i < BISECTION_STEPS && hi - lo > 1e-6; i += 1) {
    const mid = (lo + hi) / 2;
    if (residual(mid) > 0) lo = mid;
    else hi = mid;
  }
  const surfaceC = (lo + hi) / 2;
  const flux = wetFaceMoisture(coefficients.convectionWm2K, surfaceC, oven, bulkVapourPa);
  return { surfaceC, latentWm2: flux.latentWm2, massFluxKgM2s: flux.massFluxKgM2s };
}

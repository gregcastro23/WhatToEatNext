import { regimesAt, type CookingRegime } from "./cookingRegimes";
import {
  saturationPressureKpa,
  saturationStateAtPressure,
  type SaturationState,
} from "./if97";
import type { VesselState } from "./vesselState";

/**
 * The SI readings of the Hermetic Vessel: what a sealed, open or evacuated
 * pot does to water at a given pressure, temperature and headspace humidity.
 *
 * Every number is COMPUTED from IAPWS-IF97 (`if97.ts`) and the four inputs in
 * `VesselState`. There is deliberately no evaporation rate here: a mass flux
 * needs a mass-transfer coefficient, and none of the repo's correlations is
 * sourced for a vessel headspace. Δp_v, the driving force, is the defensible
 * part, so it is the part reported (RULED 2026-11-11).
 *
 * @file src/lib/cooking/thermoVessel.ts
 */

/**
 * `toFixed` without a negative zero: a Δp_v of −1e-13 kPa (floating-point dust
 * at equilibrium) must read "0.00", not "−0.00", which looks like a sign.
 */
export function formatFixed(value: number, digits: number): string {
  const text = value.toFixed(digits);
  return /^-0(\.0+)?$/.test(text) ? text.slice(1) : text;
}

/** Pressure used as the "open pot at sea level" reference: ISA standard atmosphere, kPa. */
export const SEA_LEVEL_KPA = 101.325;

/**
 * How close to T_sat counts as "at the boil", K. RULED 2026-11-11 (the plan's
 * vaporisation band, |T − T_sat| ≤ 2 °C). It is a display tolerance, not
 * chemistry: a pot 1.5 K under the boil reads as boiling, as a cook would say.
 */
export const SATURATION_BAND_K = 2;

/**
 * |Δp_v| below which the headspace reads as in equilibrium with the surface,
 * kPa. Basis: the panel shows Δp_v to 0.01 kPa, so anything that rounds to
 * zero at that resolution is labelled as zero rather than given a direction.
 */
export const EQUILIBRIUM_KPA = 0.005;

/**
 * - `sub-boiling`: the liquid sits below its boiling point at this pressure.
 * - `at-boil`: within {@link SATURATION_BAND_K} of T_sat; free water pins here.
 * - `above-saturation`: the setpoint is hotter than liquid water can be at
 *   this pressure. A wet surface still pins at T_sat; the setpoint is only
 *   reached once the free water has boiled off.
 *
 * Not "nucleate boiling": that regime depends on wall superheat (Rohsenow),
 * which this vessel model does not resolve.
 */
export type BoilingState = "sub-boiling" | "at-boil" | "above-saturation";

/**
 * Direction of vapour exchange between the food surface and the headspace.
 *
 * - `evaporating` / `condensing`: Δp_v is positive / negative.
 * - `heat-limited`: the wet surface is AT the boil and the headspace is
 *   already pure vapour at the vessel pressure, so Δp_v ≈ 0 — yet the pot
 *   still boils off as fast as heat arrives. That rate is set by the heat
 *   input, which this model does not resolve, so it is named rather than
 *   called "no exchange".
 * - `equilibrium`: Δp_v ≈ 0 with the surface below the boil — the headspace
 *   genuinely balances the surface.
 */
export type VaporTransfer = "evaporating" | "condensing" | "heat-limited" | "equilibrium";

export interface VesselReading {
  /** T_sat, h′, h″ and h_fg at the vessel pressure. */
  saturation: SaturationState;
  boilingState: BoilingState;
  /**
   * True when the setpoint is above T_sat: the setpoint is then reachable only
   * by a surface that has dried, so a separate dry-surface reading applies.
   * The ±2 K "at the boil" display band does not change this.
   */
  aboveCeiling: boolean;
  /** Temperature of a surface that still has free water: min(T, T_sat), °C. */
  wetSurfaceC: number;
  /** p_sat at the wet surface, kPa. */
  surfaceVaporKpa: number;
  /** Partial pressure of vapour in the headspace, min(φ·p_sat(T_h), P), kPa. */
  headspaceVaporKpa: number;
  /** True when φ·p_sat(T_h) exceeded the total pressure and was capped at P. */
  headspaceVaporCapped: boolean;
  /** Δp_v = p_sat(T_surface) − p_v,headspace, kPa. Positive drives evaporation. */
  vaporDeficitKpa: number;
  transfer: VaporTransfer;
  /** h_fg here ÷ h_fg in an open pot at sea level. */
  latentVsSeaLevel: number;
  /** Cited regimes active at the wet-surface temperature, for a wet surface. */
  regimesWhileWet: CookingRegime[];
  /** Cited regimes at the setpoint for a dried surface; empty unless aboveCeiling. */
  regimesOnceDry: CookingRegime[];
}

function boilingStateOf(temperatureC: number, tsatC: number): BoilingState {
  if (Math.abs(temperatureC - tsatC) <= SATURATION_BAND_K) return "at-boil";
  return temperatureC < tsatC ? "sub-boiling" : "above-saturation";
}

function transferOf(deficitKpa: number, surfaceAtBoil: boolean): VaporTransfer {
  if (Math.abs(deficitKpa) < EQUILIBRIUM_KPA) return surfaceAtBoil ? "heat-limited" : "equilibrium";
  return deficitKpa > 0 ? "evaporating" : "condensing";
}

/**
 * Read the vessel. Throws (RangeError, from IF97) only for inputs outside the
 * formulation; every value inside VESSEL_RANGES is inside it.
 */
export function readVessel(state: VesselState): VesselReading {
  const saturation = saturationStateAtPressure(state.pressureKpa);
  const wetSurfaceC = Math.min(state.temperatureC, saturation.tsatC);
  const surfaceVaporKpa = saturationPressureKpa(wetSurfaceC);
  const uncapped = (state.humidityPct / 100) * saturationPressureKpa(state.headspaceC);
  const headspaceVaporKpa = Math.min(uncapped, state.pressureKpa);
  const vaporDeficitKpa = surfaceVaporKpa - headspaceVaporKpa;
  const seaLevel = saturationStateAtPressure(SEA_LEVEL_KPA);
  const aboveCeiling = state.temperatureC > saturation.tsatC;
  return {
    saturation,
    boilingState: boilingStateOf(state.temperatureC, saturation.tsatC),
    aboveCeiling,
    wetSurfaceC,
    surfaceVaporKpa,
    headspaceVaporKpa,
    headspaceVaporCapped: uncapped > state.pressureKpa,
    vaporDeficitKpa,
    transfer: transferOf(vaporDeficitKpa, state.temperatureC >= saturation.tsatC),
    latentVsSeaLevel: saturation.latentKjKg / seaLevel.latentKjKg,
    regimesWhileWet: regimesAt(wetSurfaceC, "wet"),
    regimesOnceDry: aboveCeiling ? regimesAt(state.temperatureC, "dry") : [],
  };
}

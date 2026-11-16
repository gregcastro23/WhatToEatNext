/**
 * Gas cells: what makes a batter rise, and what stops it.
 *
 * A cell holds non-condensable gas (air, CO₂) and is saturated with water
 * vapour from the wet matrix around it. At a fixed total pressure P,
 *
 *   V_gas = n_dry · R · T / (P − p_w(T))
 *
 * so a cell grows three ways as it heats: Charles's law (T), CO₂ added (n_dry
 * rises as leavening reacts and as dissolved CO₂ comes out of solution), and —
 * steepest of all near the boil — water vapour taking a growing share of the
 * cell (p_w → P). The cells can only grow while the matrix around them is still
 * fluid; once starch has gelatinized and protein has set, the crumb is fixed and
 * further gas escapes through the now-open cell walls.
 *
 * CO₂ solubility follows Henry's law, `c = H(T)·p`, with
 * `H(T) = H° · exp(B·(1/T − 1/298.15 K))` — Sander (2015) compilation values.
 * Solubility halves between about 20 and 45 °C, which is part of a yeasted
 * dough's oven spring: the dissolved CO₂ comes out into the cells.
 *
 * @file src/lib/baking/sim/gasCells.ts
 */
import { GAS_CONSTANT, saturationPressureKpa } from "@/lib/cooking/boundaryNetwork";
import { SIM } from "./constants";

const KELVIN = 273.15;
/** The Antoine fit behind `saturationPressureKpa` covers 1–100 °C. */
const ANTOINE_FLOOR_C = 1;
const ANTOINE_CEILING_C = 100;

/**
 * Water-vapour partial pressure inside a saturated cell, Pa. Capped at a
 * fraction of the total pressure: at the boil p_w reaches P and the formula
 * above diverges, which in a real crumb is the moment the cell walls open and
 * the steam leaves. The cap is a numerical guard, never reached by a node
 * that has set.
 */
export function cellVapourPa(celsius: number, pressurePa: number): number {
  const t = Math.min(Math.max(celsius, ANTOINE_FLOOR_C), ANTOINE_CEILING_C);
  return Math.min(saturationPressureKpa(t) * 1000, SIM.vapourCapFraction.value * pressurePa);
}

/** Moles of non-condensable gas in `volumeM3` of saturated cells. */
export function dryGasMol(volumeM3: number, celsius: number, pressurePa: number): number {
  return ((pressurePa - cellVapourPa(celsius, pressurePa)) * volumeM3) / (GAS_CONSTANT * (celsius + KELVIN));
}

/** Volume that `dryMol` of non-condensable gas occupies in saturated cells, m³. */
export function gasVolumeM3(dryMol: number, celsius: number, pressurePa: number): number {
  return (dryMol * GAS_CONSTANT * (celsius + KELVIN)) / (pressurePa - cellVapourPa(celsius, pressurePa));
}

/** Henry's law solubility of CO₂ in water, mol·m⁻³·Pa⁻¹. */
export function henryCo2(celsius: number): number {
  const inverseDelta = 1 / (celsius + KELVIN) - 1 / SIM.henryCo2RefK.value;
  return SIM.henryCo2At298.value * Math.exp(SIM.henryCo2TempDependenceK.value * inverseDelta);
}

/** CO₂ dissolved in `waterKg` of water under CO₂ partial pressure `pCo2Pa`, mol. Water taken at 1000 kg·m⁻³. */
export function dissolvedCo2Mol(waterKg: number, celsius: number, pCo2Pa: number): number {
  return henryCo2(celsius) * pCo2Pa * (waterKg / 1000);
}

/** Linear progress of a transition across `[onsetC, endC]`, 0–1. */
export function ramp(celsius: number, onsetC: number, endC: number): number {
  if (endC <= onsetC) return celsius >= onsetC ? 1 : 0;
  return Math.min(Math.max((celsius - onsetC) / (endC - onsetC), 0), 1);
}

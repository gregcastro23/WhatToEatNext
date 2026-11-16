/**
 * Crust browning as a thermal DOSE.
 *
 * Zanoni, Peri & Bruno (1995) fitted bread-crust colour to first-order
 * kinetics with an Arrhenius activation energy of 64.151 kJ/mol over
 * 140–250 °C. Rather than invent a rate constant, the dose is expressed in
 * the units that activation energy alone defines — equivalent minutes at a
 * reference temperature — exactly as a sterilisation F-value is:
 *
 *   dose = ∫ exp(−Ea/R · (1/T − 1/T_ref)) · reactant · dt
 *
 * It accrues only on a DRIED surface at or above the repo's sourced Maillard
 * onset (120 °C, low moisture — cookingRegimes.ts, after EFSA), matching
 * Purlis & Salvadori's observation that crust colour starts only above 120 °C
 * and below a_w 0.6. A wet crust is pinned at the boil and cannot brown.
 *
 * The reactant factor and the extent scale are DECLARED model choices (see
 * constants.ts): reducing sugars do brown faster, but no source here says by
 * how much, so the weight is labelled rather than presented as kinetics.
 *
 * @file src/lib/baking/sim/browning.ts
 */
import { GAS_CONSTANT } from "@/lib/cooking/boundaryNetwork";
import { COOKING_REGIMES } from "@/lib/cooking/cookingRegimes";
import { SIM } from "./constants";

const KELVIN = 273.15;

function regimeOnset(id: string): number {
  const regime = COOKING_REGIMES.find((r) => r.id === id);
  if (!regime) throw new RangeError(`cookingRegimes has no "${id}" regime`);
  return regime.onsetC;
}

/** Maillard browning at culinary rate begins here on a dried surface, °C (cookingRegimes, EFSA). */
export const BROWNING_ONSET_C = regimeOnset("maillard");

/** Crystalline sucrose caramelises from here, °C (cookingRegimes, Magon et al. 2014). */
export const CARAMEL_ONSET_C = regimeOnset("sucrose-caramelisation");

/** Multiplier for how much faster a reducing-sugar-rich crust browns (DECLARED weight). */
export function reactantFactor(reducingSugarDryFraction: number): number {
  return 1 + SIM.reducingSugarWeight.value * Math.max(reducingSugarDryFraction, 0);
}

/** Equivalent minutes at the reference temperature accrued per minute at `surfaceC`. */
export function browningRate(surfaceC: number, reactant: number): number {
  if (surfaceC < BROWNING_ONSET_C) return 0;
  const inverseDelta = 1 / (surfaceC + KELVIN) - 1 / (SIM.browningRefC.value + KELVIN);
  return reactant * Math.exp((-SIM.browningEaJMol.value / GAS_CONSTANT) * inverseDelta);
}

/**
 * Visual browning extent 0–1 from a dose — a DECLARED display scale, log in the
 * dose because the dose itself is exponential in temperature: 20 °C hotter is
 * about a doubling, and a crust that took twice the dose is not twice as dark.
 */
export function browningExtent(dose: number): number {
  const knee = SIM.browningScaleMin.value;
  return Math.min(Math.log1p(Math.max(dose, 0) / knee) / Math.log1p(SIM.browningFullDose.value / knee), 1);
}

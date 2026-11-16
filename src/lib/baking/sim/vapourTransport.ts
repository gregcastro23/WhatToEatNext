/**
 * Evaporation–condensation: the heat pipe inside a wet crumb.
 *
 * In a crumb whose gas cells are saturated with water vapour, a temperature
 * gradient is also a vapour-density gradient. Water evaporates on the warm
 * side of each cell wall, diffuses across the cell and condenses on the cool
 * side, carrying its latent heat with it. Treated as diffusion along the
 * gradient this is an extra conductivity,
 *
 *   k_vap = (ε/τ) · D_va(T) · P/(P − p_w) · h_fg(T) · dρ_sat/dT
 *
 * the vapour-enhanced conductivity of Philip & de Vries (1957), with the
 * Stefan-flow factor P/(P − p_w) for vapour diffusing through the stagnant
 * air it displaces. It is negligible in a cool dough and grows steeply toward
 * the boil — at 90 °C it already exceeds the crumb's own conduction several
 * times — which is how a loaf's core reaches the plateau in forty minutes
 * rather than the hours pure conduction through an aerated crumb would take.
 * de Vries, Sluimer & Bloksma (1989) identified it as the dominant mechanism
 * in baking bread.
 *
 * Every factor but one comes from an existing kernel: diffusion of vapour in
 * air (`diffusionWaterInAir`), the Antoine saturation curve, and the
 * Fleagle & Andreas latent heat. The tortuosity τ is DECLARED.
 *
 * Its moisture redistribution (water carried inward ahead of the front) is
 * not tracked — only the heat it moves.
 *
 * @file src/lib/baking/sim/vapourTransport.ts
 */
import { diffusionWaterInAir, MOLAR_MASS_WATER, GAS_CONSTANT, saturationPressureKpa } from "@/lib/cooking/boundaryNetwork";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import { SIM } from "./constants";

const KELVIN = 273.15;
const HALF_STEP_K = 0.5;
/** The Antoine fit is valid to 100 °C; the central difference needs half a kelvin either side. */
const ANTOINE_LOW_C = 1 + HALF_STEP_K;
const ANTOINE_HIGH_C = 100 - HALF_STEP_K;

function saturatedVapourDensity(celsius: number): number {
  return (saturationPressureKpa(celsius) * 1000 * MOLAR_MASS_WATER) / (GAS_CONSTANT * (celsius + KELVIN));
}

/** dρ_sat/dT by central difference on the Antoine curve, kg·m⁻³·K⁻¹. */
export function saturatedVapourSlope(celsius: number): number {
  const t = Math.min(Math.max(celsius, ANTOINE_LOW_C), ANTOINE_HIGH_C);
  return (saturatedVapourDensity(t + HALF_STEP_K) - saturatedVapourDensity(t - HALF_STEP_K)) / (2 * HALF_STEP_K);
}

/**
 * Vapour-enhanced conductivity of a wet crumb, W·m⁻¹·K⁻¹. Zero with no gas
 * cells, and not defined for a dried node (no liquid to evaporate) — callers
 * pass only wet nodes below the boil.
 */
export function vapourConductivity(celsius: number, porosity: number, pressurePa: number): number {
  if (!(porosity > 0)) return 0;
  const t = Math.min(Math.max(celsius, ANTOINE_LOW_C), ANTOINE_HIGH_C);
  const vapourPa = Math.min(saturationPressureKpa(t) * 1000, SIM.vapourCapFraction.value * pressurePa);
  const stefan = pressurePa / (pressurePa - vapourPa);
  const diffusivity = (porosity / SIM.crumbTortuosity.value) * diffusionWaterInAir(t) * stefan;
  return diffusivity * latentHeatVaporisation(t) * saturatedVapourSlope(t);
}

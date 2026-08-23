/**
 * Pure simmer reduction calculations matching thermo-core and SpacetimeDB module.
 *
 * Latent heat from Incropera Table A.6 (saturation boiling): 2,257,000 J/kg.
 * Water density at 100°C saturation: 958.35 kg/m³ (0.95835 kg/L).
 */

export const VAPOUR_ESCAPE_FRACTIONS: readonly number[] = [1.0, 0.55, 0.25, 0.08];
export const LATENT_HEAT_SATURATION_100C_J_KG = 2_257_000.0;
export const WATER_RHO_100C_KG_L = 0.95835;

export interface SimmerStepParams {
  initialVolL: number;
  currentVolL: number;
  burnerPowerW: number;
  lidSeal: number;
  targetReductionPct: number;
  dtS: number;
}

export interface SimmerStepOutput {
  currentVolL: number;
  concentrationRatio: number;
  isBoiling: boolean;
  alarmTriggered: boolean;
  netLossKgS: number;
}

export function compute_pot_simmer_step({
  initialVolL,
  currentVolL,
  burnerPowerW,
  lidSeal,
  targetReductionPct,
  dtS,
}: SimmerStepParams): SimmerStepOutput {
  if (currentVolL <= 0) {
    return {
      currentVolL: 0,
      concentrationRatio: Number.POSITIVE_INFINITY,
      isBoiling: false,
      alarmTriggered: true,
      netLossKgS: 0,
    };
  }

  const escapeFrac = VAPOUR_ESCAPE_FRACTIONS[lidSeal] ?? 1.0;
  const netLossKgS = (burnerPowerW / LATENT_HEAT_SATURATION_100C_J_KG) * escapeFrac;
  const volLostL = (netLossKgS * dtS) / WATER_RHO_100C_KG_L;
  const remainingL = Math.max(0, currentVolL - volLostL);
  const isBoiling = remainingL > 0;
  const concentrationRatio = remainingL > 0 ? initialVolL / remainingL : Number.POSITIVE_INFINITY;
  const targetRemainingL = (1 - Math.min(1, Math.max(0, targetReductionPct))) * initialVolL;
  const alarmTriggered = remainingL <= targetRemainingL;

  return {
    currentVolL: remainingL,
    concentrationRatio,
    isBoiling,
    alarmTriggered,
    netLossKgS,
  };
}

/**
 * SI-Unit Real Physics Engine for Sauce Lab (`/kitchen-lab/sauces`).
 *
 * Couples ASHRAE/Choi & Okos thermophysical properties and Fleagle & Andreas
 * latent heat with Krieger–Dougherty emulsion rheology, Stokes creaming,
 * starch/yolk thermal transitions, and open-pan evaporative concentration.
 *
 * @file src/lib/sauces/physics/engine.ts
 */
import { foodProperties } from "@/lib/cooking/choiOkos";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";
import type { SauceBenchPreset, SauceMechanism, ThickenerKind } from "./presets";

export interface SauceLabInputs {
  waterG: number;
  fatG: number;
  starchG: number;
  proteinG: number;
  solutesG: number;
  insolubleG: number;
  baselinePh: number;
  tempC: number;
  dropletRadiusUm: number;
  panDiameterCm: number;
  burnerWatts: number;
  targetReductionPct: number;
  batchScale: number;
  thickener: ThickenerKind;
  mechanism: SauceMechanism;
}

export interface SauceCompositionReadout {
  waterPct: number;
  fatPct: number;
  proteinPct: number;
  carbPct: number;
  ashPct: number;
  solidsPct: number;
}

export interface SauceEmulsionReadout {
  fatVolumeFraction: number;
  maxPackingPhi: number;
  relativeViscosity: number;
  emulsifierPer100gFat: number;
  stokesCreamingMmMin: number;
  stabilityBand: "stable" | "shear-sensitive" | "split-risk" | "non-emulsion";
}

export interface SauceThickenerReadout {
  kind: ThickenerKind;
  onsetC: number | null;
  peakC: number | null;
  ceilingC: number | null;
  gelatinizationPct: number | null;
  starchInWaterPct: number;
}

export interface SauceReductionReadout {
  hfgKjKg: number;
  sensibleEnergyKj: number;
  latentEnergyKj: number;
  totalEnergyKj: number;
  simmerMinutes: number;
  evapFluxGMin: number;
  soluteConcentrationFactor: number;
  boilingElevationC: number;
  effectiveBoilingC: number;
}

export interface SaucePhysicsReport {
  initialMassG: number;
  finalMassG: number;
  evaporatedWaterG: number;
  finalWaterG: number;
  composition: SauceCompositionReadout;
  thermo: {
    densityKgM3: number;
    specificHeatJkgK: number;
    conductivityWmK: number;
    diffusivityM2S: number;
  };
  emulsion: SauceEmulsionReadout;
  thickener: SauceThickenerReadout;
  reduction: SauceReductionReadout;
  warnings: string[];
}

export interface ReductionCurvePoint {
  reductionPct: number;
  minutes: number;
  solidsPct: number;
  relativeViscosity: number;
  concentrationFactor: number;
}

const MAX_PACKING_PHI = 0.74;
const INTRINSIC_VISCOSITY = 2.5;
const GRAVITY_M_S2 = 9.80665;
const PAN_TRANSFER_EFFICIENCY = 0.55;
const SOLUTE_MOLAR_MASS_KG_MOL = 0.12;
const WATER_KB_K_KG_MOL = 0.512;

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function inputsFromPreset(preset: SauceBenchPreset): SauceLabInputs {
  return {
    waterG: preset.waterG,
    fatG: preset.fatG,
    starchG: preset.starchG,
    proteinG: preset.proteinG,
    solutesG: preset.solutesG,
    insolubleG: preset.insolubleG,
    baselinePh: preset.baselinePh,
    tempC: preset.nominalTempC,
    dropletRadiusUm: preset.dropletRadiusUm,
    panDiameterCm: preset.panDiameterCm,
    burnerWatts: preset.burnerWatts,
    targetReductionPct: preset.targetReductionPct,
    batchScale: 1,
    thickener: preset.thickener,
    mechanism: preset.mechanism,
  };
}

function aqueousViscosityPaS(tempC: number): number {
  // Vogel equation for liquid water viscosity: mu = A * 10^(B / (T_K - C))
  const tK = clamp(tempC, 0, 110) + 273.15;
  return 2.414e-5 * Math.pow(10, 247.8 / (tK - 140));
}

function classifyStability(
  phi: number,
  finalWaterG: number,
  emulsifierPer100gFat: number,
  dropletRadiusUm: number,
  tempC: number,
  thickener: ThickenerKind,
): SauceEmulsionReadout["stabilityBand"] {
  if (phi > 0.68 || finalWaterG < 8 || (thickener === "egg-yolk" && tempC >= 75)) return "split-risk";
  if (emulsifierPer100gFat < 3 || dropletRadiusUm > 35 || phi > 0.58) return "shear-sensitive";
  return "stable";
}

function computeEmulsionMetrics(
  fatG: number,
  finalWaterG: number,
  proteinG: number,
  solublesPct: number,
  tempC: number,
  dropletRadiusUm: number,
  thickener: ThickenerKind,
): SauceEmulsionReadout {
  if (fatG <= 0.5) {
    return {
      fatVolumeFraction: 0,
      maxPackingPhi: MAX_PACKING_PHI,
      relativeViscosity: 1,
      emulsifierPer100gFat: 0,
      stokesCreamingMmMin: 0,
      stabilityBand: "non-emulsion",
    };
  }
  const safeTemp = clamp(tempC, 0, 140);
  const rhoWater = foodProperties({ water: 1, protein: 0, fat: 0, carbohydrate: 0, ash: 0 }, safeTemp).densityKgM3;
  const rhoFat = foodProperties({ water: 0, protein: 0, fat: 1, carbohydrate: 0, ash: 0 }, safeTemp).densityKgM3;
  const volWater = Math.max(finalWaterG, 0.1) / rhoWater;
  const volFat = fatG / rhoFat;
  const phi = volFat / (volFat + volWater);
  const effectivePhi = Math.min(phi, 0.71);
  const kdViscosity = Math.pow(1 - effectivePhi / MAX_PACKING_PHI, -(INTRINSIC_VISCOSITY * MAX_PACKING_PHI));
  const rMeters = Math.max(dropletRadiusUm, 1) * 1e-6;
  const contViscosity = aqueousViscosityPaS(safeTemp) * (1 + 0.04 * solublesPct);
  const stokesMPerS = (2 * GRAVITY_M_S2 * Math.abs(rhoWater - rhoFat) * rMeters * rMeters) / (9 * contViscosity);
  const emulsifierPer100gFat = (proteinG / fatG) * 100;

  return {
    fatVolumeFraction: phi,
    maxPackingPhi: MAX_PACKING_PHI,
    relativeViscosity: kdViscosity,
    emulsifierPer100gFat,
    stokesCreamingMmMin: stokesMPerS * 1000 * 60,
    stabilityBand: classifyStability(phi, finalWaterG, emulsifierPer100gFat, dropletRadiusUm, tempC, thickener),
  };
}

function computeThickenerMetrics(
  kind: ThickenerKind,
  tempC: number,
  starchG: number,
  finalWaterG: number,
): SauceThickenerReadout {
  const starchInWaterPct = (starchG / Math.max(finalWaterG + starchG, 1)) * 100;
  if (kind === "wheat-roux") {
    return {
      kind,
      onsetC: 58,
      peakC: 64,
      ceilingC: null,
      gelatinizationPct: clamp(((tempC - 58) / (85 - 58)) * 100, 0, 100),
      starchInWaterPct,
    };
  }
  if (kind === "cornstarch") {
    return {
      kind,
      onsetC: 65,
      peakC: 74,
      ceilingC: 96,
      gelatinizationPct: clamp(((tempC - 65) / (88 - 65)) * 100, 0, 100),
      starchInWaterPct,
    };
  }
  if (kind === "egg-yolk") {
    return {
      kind,
      onsetC: 69,
      peakC: 73,
      ceilingC: 75,
      gelatinizationPct: clamp(((tempC - 63) / (74 - 63)) * 100, 0, 100),
      starchInWaterPct,
    };
  }
  return { kind, onsetC: null, peakC: null, ceilingC: null, gelatinizationPct: null, starchInWaterPct };
}

function collectPhysicsWarnings(
  inputs: SauceLabInputs,
  emulsion: SauceEmulsionReadout,
  thickener: SauceThickenerReadout,
  reduction: SauceReductionReadout,
  finalWaterG: number,
): string[] {
  const warnings: string[] = [];
  if (thickener.kind === "egg-yolk" && inputs.tempC >= 75) {
    warnings.push(`Yolk curdling threshold exceeded (${inputs.tempC.toFixed(0)} °C ≥ 75 °C): LDL aggregates expel bound water.`);
  }
  if (emulsion.stabilityBand === "split-risk" && emulsion.fatVolumeFraction > 0.68) {
    warnings.push(`Dispersed fat φ = ${(emulsion.fatVolumeFraction * 100).toFixed(0)}% nears 74% close-packing limit — whisk in warm water.`);
  }
  if (inputs.fatG > 5 && emulsion.emulsifierPer100gFat < 3) {
    warnings.push(`Low emulsifier ratio (${emulsion.emulsifierPer100gFat.toFixed(1)} g/100g fat): droplets coalesce quickly once resting.`);
  }
  if ((inputs.thickener === "wheat-roux" || inputs.thickener === "cornstarch") && inputs.baselinePh < 4.0) {
    warnings.push(`Acidic base (pH ${inputs.baselinePh.toFixed(1)} < 4.0) hydrolyses starch chains over sustained simmering.`);
  }
  if (reduction.soluteConcentrationFactor >= 1.9 && inputs.solutesG > 4) {
    warnings.push(`Reduction concentrates dissolved salt & sugars ${reduction.soluteConcentrationFactor.toFixed(2)}× — season lightly before reducing.`);
  }
  if (finalWaterG < 10) {
    warnings.push("Continuous water phase dropped below 10 g — high scorch & phase-inversion risk.");
  }
  return warnings;
}

function computeReductionMetrics(p: {
  initialMassG: number;
  initialWaterG: number;
  evaporatedWaterG: number;
  finalWaterG: number;
  solutesG: number;
  specificHeatJkgK: number;
  tempC: number;
  burnerWatts: number;
}): SauceReductionReadout {
  const hfgKjKg = latentHeatVaporisation(clamp(p.tempC, 20, 100)) / 1000;
  const tempLiftK = Math.max(0, clamp(p.tempC, 0, 120) - 20);
  const sensibleEnergyKj = (p.initialMassG / 1000) * (p.specificHeatJkgK / 1000) * tempLiftK;
  const latentEnergyKj = (p.evaporatedWaterG / 1000) * hfgKjKg;
  const totalEnergyKj = sensibleEnergyKj + latentEnergyKj;
  const effectiveWatts = Math.max(50, p.burnerWatts) * PAN_TRANSFER_EFFICIENCY;
  const simmerMinutes = totalEnergyKj / (effectiveWatts * 0.06);
  const evapFluxGMin = (effectiveWatts * 0.06) / Math.max(hfgKjKg / 1000, 1);
  const soluteConcentrationFactor = p.initialWaterG > 0 ? p.initialWaterG / Math.max(p.finalWaterG, 1) : 1;
  const molality = (p.solutesG / 1000) / (SOLUTE_MOLAR_MASS_KG_MOL * Math.max(p.finalWaterG / 1000, 0.01));
  const boilingElevationC = Math.min(18, WATER_KB_K_KG_MOL * molality);
  return {
    hfgKjKg,
    sensibleEnergyKj,
    latentEnergyKj,
    totalEnergyKj,
    simmerMinutes,
    evapFluxGMin,
    soluteConcentrationFactor,
    boilingElevationC,
    effectiveBoilingC: 100 + boilingElevationC,
  };
}

export function computeSaucePhysics(inputs: SauceLabInputs): SaucePhysicsReport {
  const scale = clamp(inputs.batchScale, 0.25, 10);
  const initialWaterG = Math.max(0, inputs.waterG * scale);
  const fatG = Math.max(0, inputs.fatG * scale);
  const starchG = Math.max(0, inputs.starchG * scale);
  const proteinG = Math.max(0, inputs.proteinG * scale);
  const solutesG = Math.max(0, inputs.solutesG * scale);
  const insolubleG = Math.max(0, inputs.insolubleG * scale);

  const evaporatedWaterG = (clamp(inputs.targetReductionPct, 0, 85) / 100) * initialWaterG;
  const finalWaterG = Math.max(0, initialWaterG - evaporatedWaterG);
  const initialMassG = initialWaterG + fatG + starchG + proteinG + solutesG + insolubleG;
  const finalMassG = Math.max(0.1, finalWaterG + fatG + starchG + proteinG + solutesG + insolubleG);

  const carbG = starchG + solutesG * 0.8 + insolubleG * 0.9;
  const ashG = solutesG * 0.2 + insolubleG * 0.1;
  const composition: SauceCompositionReadout = {
    waterPct: (finalWaterG / finalMassG) * 100,
    fatPct: (fatG / finalMassG) * 100,
    proteinPct: (proteinG / finalMassG) * 100,
    carbPct: (carbG / finalMassG) * 100,
    ashPct: (ashG / finalMassG) * 100,
    solidsPct: ((finalMassG - finalWaterG) / finalMassG) * 100,
  };

  const props = foodProperties(
    { water: finalWaterG / finalMassG, protein: proteinG / finalMassG, fat: fatG / finalMassG, carbohydrate: carbG / finalMassG, ash: ashG / finalMassG },
    clamp(inputs.tempC, 0, 140),
  );
  const reduction = computeReductionMetrics({
    initialMassG,
    initialWaterG,
    evaporatedWaterG,
    finalWaterG,
    solutesG,
    specificHeatJkgK: props.specificHeatJkgK,
    tempC: inputs.tempC,
    burnerWatts: inputs.burnerWatts,
  });
  const emulsion = computeEmulsionMetrics(fatG, finalWaterG, proteinG, (solutesG / finalMassG) * 100, inputs.tempC, inputs.dropletRadiusUm, inputs.thickener);
  const thickener = computeThickenerMetrics(inputs.thickener, inputs.tempC, starchG, finalWaterG);
  const warnings = collectPhysicsWarnings(inputs, emulsion, thickener, reduction, finalWaterG);

  return {
    initialMassG, finalMassG, evaporatedWaterG, finalWaterG, composition,
    thermo: { densityKgM3: props.densityKgM3, specificHeatJkgK: props.specificHeatJkgK, conductivityWmK: props.conductivityWmK, diffusivityM2S: props.diffusivityM2S },
    emulsion, thickener, reduction, warnings,
  };
}

export function simulateReductionCurve(inputs: SauceLabInputs, steps = 8): ReductionCurvePoint[] {
  const count = Math.max(2, steps);
  const maxPct = Math.max(10, clamp(inputs.targetReductionPct, 0, 75));
  const points: ReductionCurvePoint[] = [];
  for (let i = 0; i <= count; i += 1) {
    const pct = (maxPct * i) / count;
    const report = computeSaucePhysics({ ...inputs, targetReductionPct: pct });
    points.push({
      reductionPct: pct,
      minutes: report.reduction.simmerMinutes,
      solidsPct: report.composition.solidsPct,
      relativeViscosity: report.emulsion.relativeViscosity,
      concentrationFactor: report.reduction.soluteConcentrationFactor,
    });
  }
  return points;
}

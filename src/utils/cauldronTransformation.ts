/**
 * Pure, catalog-free culinary matrix transformation kinetics and 7 Hermetic
 * Operations (Opus Culinaris) for the Vas Hermeticum cauldron simulator.
 *
 * Models time-integrated collagen hydrolysis (Arrhenius kinetics with
 * pressurized reflux acceleration), Maillard fond build, volatile aromatic
 * retention/loss, reduction concentration, and starch/pectin softening.
 *
 * @file src/utils/cauldronTransformation.ts
 */

import type { VesselReading } from "@/lib/cooking/thermoVessel";
import type { VesselState } from "@/lib/cooking/vesselState";
import type { AlchemicalProperties, ElementalProperties } from "@/types/alchemy";

export type HermeticOperation =
  | "calcination"
  | "dissolution"
  | "digestion"
  | "circulatio"
  | "distillation"
  | "fermentation"
  | "coagulation";

export interface CulinaryMatrix {
  collagenHydrolysisPct: number;
  maillardFondIndex: number;
  volatileAromaticRetentionPct: number;
  reductionConcentrationFactor: number;
  starchPectinSofteningPct: number;
}

export interface HermeticOperationInfo {
  id: HermeticOperation;
  label: string;
  latinName: string;
  principle: string;
  culinaryEffect: string;
  elementalBoost: string;
}

export interface TransformationState {
  operation: HermeticOperationInfo;
  matrix: CulinaryMatrix;
  durationMinutes: number;
  cumulativeMinutes: number;
  transformedElemental: ElementalProperties;
  transformedESMS: AlchemicalProperties;
}

export const INITIAL_CULINARY_MATRIX: Readonly<CulinaryMatrix> = {
  collagenHydrolysisPct: 0, maillardFondIndex: 0,
  volatileAromaticRetentionPct: 100, reductionConcentrationFactor: 1.0,
  starchPectinSofteningPct: 0,
};

function op(id: HermeticOperation, label: string, latin: string, p: string, c: string, el: string): HermeticOperationInfo {
  return { id, label, latinName: latin, principle: p, culinaryEffect: c, elementalBoost: el };
}

export const HERMETIC_OPERATIONS: Readonly<Record<HermeticOperation, HermeticOperationInfo>> = {
  calcination: op("calcination", "Calcination (Calcinatio — Fire / Dry Sear)", "Calcinatio", "Dry thermal dehydration & caramelization", "Surface browning, pyrazine formation, and fond generation", "Fire ↑, Earth ↑, Substance ↑"),
  dissolution: op("dissolution", "Dissolution (Solutio — Water / Deglaze & Infusion)", "Solutio", "Aqueous extraction & fond liberation", "Thermal shock dissolves fond into liquor; initiates extraction", "Water ↑, Essence ↑, Spirit ↑"),
  digestion: op("digestion", "Digestion (Digestio — Gentle Sealed Softening)", "Digestio", "Sub-boiling isothermal collagen unwinding", "Collagen converts to gelatin without turbulent agitation", "Water ↑, Earth ↑, Matter ↑"),
  circulatio: op("circulatio", "Circulation (Circulatio — Pressurized Reflux)", "Circulatio", "Closed-loop reflux condensation (Vas Hermeticum)", "3.5× Arrhenius hydrolysis; locks 100% of volatiles in matrix", "Spirit ↑, Matter ↑, Substance ↑"),
  distillation: op("distillation", "Distillation (Distillatio — Vacuum Extraction)", "Distillatio", "Sub-atmospheric cold vaporization", "Extracts delicate floral/terpene hydrosols without thermal scorch", "Spirit ↑, Air ↑, Essence ↑"),
  fermentation: op("fermentation", "Fermentation (Fermentatio — Enzymatic Cleavage)", "Fermentatio", "Warm enzymatic macromolecule cleavage", "Protease/amylase digestion yielding free amino acids & sugars", "Essence ↑, Water ↑, Spirit ↑"),
  coagulation: op("coagulation", "Coagulation (Coagulatio — Reduction & Glaze)", "Coagulatio", "Open reduction, concentration & emulsification", "Evaporates free water; concentrates solids into viscous glaze", "Earth ↑, Substance ↑, Matter ↑"),
};

export interface OperationContext {
  previousTemperatureC?: number;
  concentrationFactor?: number;
  isSubsequentStage?: boolean;
}

function checkSpecialOperations(
  vessel: VesselState,
  reading: VesselReading,
  ctx?: OperationContext,
): HermeticOperationInfo | null {
  const t = vessel.temperatureC;
  const tsat = reading.saturation.tsatC;
  const seal = vessel.sealMode ?? reading.sealMode;
  if ((seal === "vacuum_pumped" || vessel.pressureKpa < 75) && t >= tsat - 3) {
    return HERMETIC_OPERATIONS.distillation;
  }
  if (t >= 135 && (vessel.humidityPct < 35 || reading.aboveCeiling)) {
    return HERMETIC_OPERATIONS.calcination;
  }
  const prevT = ctx?.previousTemperatureC;
  if (ctx?.isSubsequentStage && prevT !== undefined && prevT >= 130 && t <= 100) {
    return HERMETIC_OPERATIONS.dissolution;
  }
  return null;
}

export function classifyHermeticOperation(
  vessel: VesselState,
  reading: VesselReading,
  ctx?: OperationContext,
): HermeticOperationInfo {
  const special = checkSpecialOperations(vessel, reading, ctx);
  if (special) return special;
  const t = vessel.temperatureC;
  const tsat = reading.saturation.tsatC;
  const seal = vessel.sealMode ?? reading.sealMode;
  const isHermetic = seal === "hermetic_sealed" || seal === "pressure_regulated";
  if (isHermetic && (t >= tsat - 2 || t >= 100)) return HERMETIC_OPERATIONS.circulatio;
  if (isHermetic && t >= 55) return HERMETIC_OPERATIONS.digestion;
  if (t >= 25 && t < 55) return HERMETIC_OPERATIONS.fermentation;
  if (seal === "open" && t >= tsat - 5) return HERMETIC_OPERATIONS.coagulation;
  return t >= 58 ? HERMETIC_OPERATIONS.digestion : HERMETIC_OPERATIONS.fermentation;
}

function computeCollagenStep(
  prevPct: number,
  tempC: number,
  durationMin: number,
  isPressurizedReflux: boolean,
): number {
  if (tempC < 58) return prevPct;
  const tempK = tempC + 273.15;
  const kRef = 0.015;
  const eaOverR = 8000;
  let k = kRef * Math.exp(-eaOverR * (1 / tempK - 1 / 373.15));
  if (isPressurizedReflux && tempC > 105) k *= 3.5;
  const delta = (100 - prevPct) * (1 - Math.exp(-k * durationMin));
  return Math.min(100, Math.max(0, prevPct + delta));
}

function computeVolatilesStep(
  prevPct: number,
  tempC: number,
  durationMin: number,
  seal: string,
  deficitKpa: number,
): number {
  let decayRate = 0.0008;
  if (seal === "vacuum_pumped") decayRate = tempC < 70 ? 0.001 : 0.004;
  else if (seal === "pressure_regulated") decayRate = 0.0015;
  else if (seal === "open" || seal === "") {
    decayRate = tempC >= 80 ? 0.02 + 0.03 * Math.min(1, Math.max(0, deficitKpa / 10)) : 0.005;
  }
  return Math.min(100, Math.max(0, prevPct * Math.exp(-decayRate * durationMin)));
}

export function computeCulinaryMatrixStep(
  prev: CulinaryMatrix,
  vessel: VesselState,
  reading: VesselReading,
  durationMin: number,
): CulinaryMatrix {
  const seal = vessel.sealMode ?? reading.sealMode;
  const isReflux = (seal === "hermetic_sealed" || seal === "pressure_regulated") && reading.refluxRatio >= 0.85;
  const t = reading.wetSurfaceC;

  const collagen = computeCollagenStep(prev.collagenHydrolysisPct, t, durationMin, isReflux);

  let maillard = prev.maillardFondIndex;
  if (vessel.temperatureC >= 130 && (vessel.humidityPct < 35 || reading.aboveCeiling)) {
    const kM = 0.05 * Math.exp((vessel.temperatureC - 130) / 25);
    maillard = Math.min(100, prev.maillardFondIndex + (100 - prev.maillardFondIndex) * (1 - Math.exp(-kM * durationMin)));
  }

  const volatiles = computeVolatilesStep(prev.volatileAromaticRetentionPct, t, durationMin, seal, reading.vaporDeficitKpa);

  let concentration = prev.reductionConcentrationFactor;
  if (seal === "open" && t >= reading.saturation.tsatC - 2) {
    const evapLoss = Math.min(0.85, 0.012 * durationMin);
    concentration = prev.reductionConcentrationFactor * (1 / (1 - evapLoss));
  }

  let starch = prev.starchPectinSofteningPct;
  if (t >= 65) {
    const kS = 0.03 * Math.min(3, Math.exp((t - 65) / 20));
    starch = Math.min(100, prev.starchPectinSofteningPct + (100 - prev.starchPectinSofteningPct) * (1 - Math.exp(-kS * durationMin)));
  }

  return {
    collagenHydrolysisPct: Math.round(collagen * 10) / 10,
    maillardFondIndex: Math.round(maillard * 10) / 10,
    volatileAromaticRetentionPct: Math.round(volatiles * 10) / 10,
    reductionConcentrationFactor: Math.round(concentration * 100) / 100,
    starchPectinSofteningPct: Math.round(starch * 10) / 10,
  };
}

export function applyHermeticOperationAlchemy(
  op: HermeticOperation,
  el: ElementalProperties,
  esms: AlchemicalProperties,
): { elemental: ElementalProperties; esms: AlchemicalProperties } {
  const boostMap: Record<HermeticOperation, { el: Partial<ElementalProperties>; es: Partial<AlchemicalProperties> }> = {
    calcination: { el: { Fire: 1.35, Earth: 1.2 }, es: { Substance: 1.3, Matter: 1.15 } },
    dissolution: { el: { Water: 1.35, Air: 1.1 }, es: { Essence: 1.3, Spirit: 1.15 } },
    digestion: { el: { Water: 1.2, Earth: 1.2 }, es: { Matter: 1.25, Essence: 1.1 } },
    circulatio: { el: { Air: 1.2, Water: 1.15 }, es: { Spirit: 1.3, Matter: 1.25, Substance: 1.2 } },
    distillation: { el: { Air: 1.35, Fire: 1.1 }, es: { Spirit: 1.4, Essence: 1.2 } },
    fermentation: { el: { Water: 1.25, Earth: 1.1 }, es: { Essence: 1.4, Spirit: 1.15 } },
    coagulation: { el: { Earth: 1.4, Fire: 1.15 }, es: { Substance: 1.35, Matter: 1.25 } },
  };

  const b = boostMap[op];
  const rawFire = el.Fire * (b.el.Fire ?? 1.0);
  const rawWater = el.Water * (b.el.Water ?? 1.0);
  const rawEarth = el.Earth * (b.el.Earth ?? 1.0);
  const rawAir = el.Air * (b.el.Air ?? 1.0);
  const sum = rawFire + rawWater + rawEarth + rawAir || 1.0;

  const clampEsms = (val: number, mult: number): number => Math.min(100, Math.max(0, val * mult));

  return {
    elemental: { Fire: rawFire / sum, Water: rawWater / sum, Earth: rawEarth / sum, Air: rawAir / sum },
    esms: {
      Spirit: clampEsms(esms.Spirit, b.es.Spirit ?? 1.0),
      Essence: clampEsms(esms.Essence, b.es.Essence ?? 1.0),
      Matter: clampEsms(esms.Matter, b.es.Matter ?? 1.0),
      Substance: clampEsms(esms.Substance, b.es.Substance ?? 1.0),
    },
  };
}

export function computeStageTransformation(
  vessel: VesselState,
  reading: VesselReading,
  durationMinutes = 15,
  prevMatrix = INITIAL_CULINARY_MATRIX,
  ctx?: OperationContext,
): TransformationState {
  const op = classifyHermeticOperation(vessel, reading, ctx);
  const matrix = computeCulinaryMatrixStep(prevMatrix, vessel, reading, durationMinutes);
  const alch = applyHermeticOperationAlchemy(
    op.id,
    { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    { Spirit: 50, Essence: 50, Matter: 50, Substance: 50 },
  );

  return {
    operation: op,
    matrix,
    durationMinutes,
    cumulativeMinutes: durationMinutes,
    transformedElemental: alch.elemental,
    transformedESMS: alch.esms,
  };
}

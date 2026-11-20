import type {
  AnatomicalCut,
  CookingStrategy,
  GrainSliceEvaluation,
  ThermalCurvePoint,
  ThermalEvaluation,
  Vec3Tuple,
} from "@/lib/butcher/types";
import {
  donenessLabelFor,
  thermalCurveBoundsFor,
  thermalSpecForCut,
  thermalWarningFor,
} from "./thermalProfiles";

export { thermalCurveBoundsFor } from "./thermalProfiles";

/**
 * Pure SI meat biophysics kernel:
 *  - Species-aware DSC thermal transitions (mammalian, poultry, finfish)
 *  - First-order collagen-to-gelatin hydrolysis kinetics
 *  - Non-linear cross-grain Warner-Bratzler shear & effective fiber model
 *
 * All outputs are strictly bounded and finite (never returning Infinity/NaN).
 *
 * @file src/lib/butcher/science/meatPhysics.ts
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sigmoidPct(tempC: number, midpointC: number, slopeC: number): number {
  return 100 / (1 + Math.exp(-(tempC - midpointC) / slopeC));
}

function normalizeVec3(v: Vec3Tuple): Vec3Tuple {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (!Number.isFinite(len) || len <= 1e-8) return [1, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32;
}

export function strategyLabel(strategy: CookingStrategy): string {
  switch (strategy) {
    case "high-heat-sear":
      return "High-Heat Sear";
    case "reverse-sear":
      return "Reverse Sear";
    case "low-and-slow-smoke":
      return "Low & Slow Smoke";
    case "collagen-braise":
      return "Collagen Braise";
    case "sous-vide":
      return "Sous-Vide Precision";
    case "poach-confit":
      return "Poach / Confit";
  }
}

export function recommendThermalStrategy(cut: AnatomicalCut): CookingStrategy {
  return cut.optimalMethods[0] ?? "high-heat-sear";
}

interface ThermalFractions {
  readonly isFish: boolean;
  readonly myosinDenaturedPct: number;
  readonly moistureExpulsionFrac: number;
  readonly actinCoagulatedPct: number;
  readonly gelatinFraction: number;
  readonly gelatinConversionPct: number;
}

function computeThermalFractions(
  cut: AnatomicalCut,
  coreTempC: number,
  holdMinutes: number,
): ThermalFractions {
  const spec = thermalSpecForCut(cut);
  const myosinDenaturedPct = Number(sigmoidPct(coreTempC, spec.myosinMidC, spec.myosinSlopeC).toFixed(1));
  const moistureExpulsionFrac = sigmoidPct(coreTempC, spec.moistureExpulsionMidC, spec.moistureExpulsionSlopeC) / 100;
  const actinCoagulatedPct = Number(sigmoidPct(coreTempC, spec.actinMidC, spec.actinSlopeC).toFixed(1));

  const kGel =
    coreTempC < spec.gelatinOnsetC
      ? 0
      : spec.gelatinRateA * Math.exp(spec.gelatinRateK * (Math.min(coreTempC, spec.gelatinCapC) - spec.gelatinOnsetC));
  const gelatinFraction = kGel > 0 && holdMinutes > 0 ? clamp(1 - Math.exp(-kGel * holdMinutes), 0, 1) : 0;
  const gelatinConversionPct = Number((gelatinFraction * 100).toFixed(1));

  return {
    isFish: cut.speciesId === "finfish",
    myosinDenaturedPct,
    moistureExpulsionFrac,
    actinCoagulatedPct,
    gelatinFraction,
    gelatinConversionPct,
  };
}

function computeThermalScores(
  cut: AnatomicalCut,
  coreTempC: number,
  f: ThermalFractions,
): {
  readonly moistureRetentionPct: number;
  readonly tendernessScore: number;
  readonly juicinessScore: number;
} {
  const actinFrac = f.actinCoagulatedPct / 100;
  const myosinFrac = f.myosinDenaturedPct / 100;
  const shrinkageLoss = f.moistureExpulsionFrac * 26 + actinFrac * 6;
  const fatCushion = Math.min(10, cut.proximate.fatG * 0.35);
  const gelatinWaterBind = f.gelatinFraction * cut.proximate.collagenG * 3.8;
  const moistureRetentionPct = Number(
    clamp(96 - myosinFrac * 4 - shrinkageLoss + fatCushion + gelatinWaterBind, 45, 98).toFixed(1),
  );

  const remainingCollagen = cut.proximate.collagenG * (1 - f.gelatinFraction);
  const fiberHardening = f.moistureExpulsionFrac * 0.78 + actinFrac * 0.22;
  const fiberPenalty = fiberHardening * (cut.proximate.collagenG < 1.3 ? 36 : 18);
  const marblingBonus = Math.min(14, cut.proximate.fatG * 0.55);
  const gelatinBonus = f.gelatinFraction * cut.proximate.collagenG * 9.5;
  const underTempPenalty = coreTempC < 44 && !f.isFish ? (44 - coreTempC) * 1.1 : 0;

  const tendernessScore = Number(
    clamp(90 - remainingCollagen * 16 - fiberPenalty + marblingBonus + gelatinBonus - underTempPenalty, 5, 100).toFixed(1),
  );
  const juicinessScore = Number(
    clamp(moistureRetentionPct * 0.85 + Math.min(18, cut.proximate.fatG * 0.65) + f.gelatinFraction * 10, 10, 100).toFixed(1),
  );
  return { moistureRetentionPct, tendernessScore, juicinessScore };
}

function thermalPhaseLabel(cut: AnatomicalCut, coreTempC: number, f: ThermalFractions): string {
  if (f.isFish) {
    if (f.moistureExpulsionFrac >= 0.5 || coreTempC >= 60) return "Albumin Expulsion & Drying (≥60 °C)";
    if (f.gelatinConversionPct >= 35 || coreTempC >= 45) return "Myocommata Gelatinization (45–55 °C)";
    if (f.myosinDenaturedPct >= 50) return "Fish Myosin Set (38–44 °C)";
    return "Raw / Native Fish Muscle";
  }
  if (f.gelatinConversionPct >= 65) return "Gelatinized Collagen Matrix";
  if (f.actinCoagulatedPct >= 50) return "Actin Denaturation (80–83 °C)";
  if (f.moistureExpulsionFrac >= 0.5) return "Fiber Shrinkage & Moisture Expulsion (66–73 °C)";
  if (coreTempC >= 60) return "Myoglobin Shift & Stage 1 Collagen Shrinkage";
  if (f.myosinDenaturedPct >= 35) return "Myosin Denaturation Window (54–58 °C)";
  return "Pre-Denaturation (Native Muscle)";
}

export function evaluateThermalProfile(
  cut: AnatomicalCut,
  rawCoreTempC: number,
  rawHoldMinutes: number,
): ThermalEvaluation {
  const defaultTemp = cut.speciesId === "finfish" ? 49 : 55;
  const coreTempC = clamp(Number.isFinite(rawCoreTempC) ? rawCoreTempC : defaultTemp, 20, 105);
  const holdMinutes = clamp(Number.isFinite(rawHoldMinutes) ? rawHoldMinutes : 0, 0, 720);
  const fracs = computeThermalFractions(cut, coreTempC, holdMinutes);
  const scores = computeThermalScores(cut, coreTempC, fracs);

  return {
    coreTempC,
    holdMinutes,
    myosinDenaturedPct: fracs.myosinDenaturedPct,
    actinCoagulatedPct: fracs.actinCoagulatedPct,
    gelatinConversionPct: fracs.gelatinConversionPct,
    moistureRetentionPct: scores.moistureRetentionPct,
    tendernessScore: scores.tendernessScore,
    juicinessScore: scores.juicinessScore,
    phaseLabel: thermalPhaseLabel(cut, coreTempC, fracs),
    donenessLabel: donenessLabelFor(cut, coreTempC),
    warning: thermalWarningFor(cut, coreTempC, fracs.gelatinConversionPct),
  };
}

export function generateThermalCurve(
  cut: AnatomicalCut,
  holdMinutes: number,
): readonly ThermalCurvePoint[] {
  const { minC, maxC, stepC } = thermalCurveBoundsFor(cut.speciesId);
  const points: ThermalCurvePoint[] = [];
  for (let tempC = minC; tempC <= maxC + 1e-6; tempC += stepC) {
    const roundedTemp = Number(tempC.toFixed(1));
    const ev = evaluateThermalProfile(cut, roundedTemp, holdMinutes);
    points.push({
      tempC: roundedTemp,
      tendernessScore: ev.tendernessScore,
      moistureRetentionPct: ev.moistureRetentionPct,
      gelatinConversionPct: ev.gelatinConversionPct,
      actinCoagulatedPct: ev.actinCoagulatedPct,
    });
  }
  return points;
}

function buildSliceFeedback(
  sliceAngleDeg: number,
  effectiveFiberLengthMm: number,
  shearForceMultiplier: number,
  baseBiteLengthMm: number,
): { readonly verdict: string; readonly coachingNote: string } {
  if (sliceAngleDeg < 30) {
    return {
      verdict: "Parallel / Stringy Cut",
      coachingNote: `Knife runs nearly parallel to grain (${sliceAngleDeg}°), leaving ${effectiveFiberLengthMm} mm fibers intact (${shearForceMultiplier}× shear). Rotate toward 45°–90°.`,
    };
  }
  if (sliceAngleDeg < 70) {
    return {
      verdict: "Bias Cross-Grain Cut",
      coachingNote: `Bias cut (${sliceAngleDeg}°) captures strong cross-grain shortening (${effectiveFiberLengthMm} mm vs ${baseBiteLengthMm} mm at 90°).`,
    };
  }
  return {
    verdict: "Optimal Cross-Grain Shear",
    coachingNote: `Fibers severed cleanly (${effectiveFiberLengthMm} mm length; ${shearForceMultiplier}× base shear).`,
  };
}

/**
 * Evaluates knife-plane slicing orientation against the cut's 3D muscle fiber
 * grain vector $\vec{g}$ with non-linear WBSF bias response and finite clamping.
 */
export function evaluateGrainSlice(
  cut: AnatomicalCut,
  knifeNormalVector: Vec3Tuple,
  rawPortionMassG: number,
  rawTargetMassG: number,
): GrainSliceEvaluation {
  const nHat = normalizeVec3(knifeNormalVector);
  const gHat = normalizeVec3(cut.grainVector);
  const sinTheta = clamp(Math.abs(nHat[0] * gHat[0] + nHat[1] * gHat[1] + nHat[2] * gHat[2]), 0, 1);
  const sliceAngleDeg = Number(((Math.asin(sinTheta) * 180) / Math.PI).toFixed(1));

  const safeSin = Math.max(sinTheta, 0.12);
  const baseBiteLengthMm = 12;
  const effectiveFiberLengthMm = Number(Math.min(cut.maxFiberLengthMm, baseBiteLengthMm / safeSin).toFixed(1));
  const shearForceMultiplier = Number((1 + (cut.fiberLengthFactor - 1) * (1 - sinTheta) * 1.35).toFixed(2));

  const sinDeficit = 1 - sinTheta;
  const sensitivity = clamp(0.65 + (cut.fiberLengthFactor - 1) * 0.32, 0.65, 1.35);
  const sub30Penalty = sliceAngleDeg < 30 ? ((30 - sliceAngleDeg) / 30) * 18 * sensitivity : 0;
  const grainAngleScore = Number(
    clamp(100 - Math.pow(sinDeficit, 1.65) * 102 * sensitivity - sub30Penalty, 0, 100).toFixed(1),
  );

  const targetMassG = Math.max(10, Number.isFinite(rawTargetMassG) ? rawTargetMassG : cut.typicalPortionG);
  const portionMassG = Math.max(10, Number.isFinite(rawPortionMassG) ? rawPortionMassG : cut.typicalPortionG);
  const massErrorRatio = Math.abs(portionMassG - targetMassG) / targetMassG;
  const portionPrecisionScore = Number(clamp(100 - massErrorRatio * 220, 0, 100).toFixed(1));
  const { verdict, coachingNote } = buildSliceFeedback(
    sliceAngleDeg,
    effectiveFiberLengthMm,
    shearForceMultiplier,
    baseBiteLengthMm,
  );

  return {
    sliceAngleDeg,
    effectiveFiberLengthMm,
    shearForceMultiplier,
    grainAngleScore,
    portionPrecisionScore,
    verdict,
    coachingNote,
  };
}

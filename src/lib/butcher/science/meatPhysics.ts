import type {
  AnatomicalCut,
  CookingStrategy,
  GrainSliceEvaluation,
  ThermalCurvePoint,
  ThermalEvaluation,
  Vec3Tuple,
} from "@/lib/butcher/types";

/**
 * Pure SI meat biophysics kernel:
 *  - Myosin (49–55 °C) and actin (66–73 °C) thermal denaturation windows
 *  - First-order collagen-to-gelatin hydrolysis kinetics (T >= 60 °C over time)
 *  - Cross-grain Warner-Bratzler shear force & effective fiber length model
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

function donenessLabelFor(cut: AnatomicalCut, coreTempC: number): string {
  if (cut.speciesId === "finfish") {
    if (coreTempC < 44) return "Raw / Mi-Cuit";
    if (coreTempC < 52) return "Translucent Medium-Rare";
    if (coreTempC < 58) return "Just-Flaking Medium";
    return "Firm / Well-Cooked";
  }
  if (cut.speciesId === "poultry") {
    if (coreTempC < 60) return "Under-Pasteurized";
    if (coreTempC < 68) return "Juicy White-Meat Ideal";
    if (coreTempC < 78) return "Traditional Roast";
    return "Dark-Meat Collagen Window";
  }
  if (coreTempC < 50) return "Blue / Rare";
  if (coreTempC < 54) return "Rare";
  if (coreTempC < 59) return "Medium-Rare";
  if (coreTempC < 64) return "Medium";
  if (coreTempC < 72) return "Medium-Well / Stall Zone";
  if (coreTempC < 86) return "Well Done (Collagen Transition)";
  return "Pulled / Braise Tender";
}

function thermalWarningFor(
  cut: AnatomicalCut,
  coreTempC: number,
  gelatinPct: number,
): string | null {
  if (cut.speciesId === "poultry" && coreTempC < 62) {
    return "Below poultry pasteurization envelope (hold ≥65 °C or reach 74 °C instantaneous).";
  }
  if (cut.proximate.collagenG >= 1.7 && coreTempC >= 65 && coreTempC < 84 && gelatinPct < 40) {
    return "Collagen stall / contraction zone: actin squeezed moisture before collagen melted to gelatin.";
  }
  if (cut.proximate.collagenG < 1.1 && coreTempC > cut.targetCoreTempC.max + 4) {
    return "Overcooked for a low-collagen cut: actin coagulation has expelled myofibrillar moisture.";
  }
  if (cut.speciesId === "finfish" && coreTempC > 57) {
    return "Albumin expulsion threshold exceeded: salmon myotomes are losing oil and drying.";
  }
  return null;
}

interface ThermalFractions {
  readonly isFish: boolean;
  readonly myosinDenaturedPct: number;
  readonly actinCoagulatedPct: number;
  readonly gelatinFraction: number;
  readonly gelatinConversionPct: number;
}

function computeThermalFractions(
  cut: AnatomicalCut,
  coreTempC: number,
  holdMinutes: number,
): ThermalFractions {
  const isFish = cut.speciesId === "finfish";
  const myosinDenaturedPct = Number(
    sigmoidPct(coreTempC, isFish ? 43.5 : 51.5, isFish ? 1.3 : 1.4).toFixed(1),
  );
  const actinCoagulatedPct = Number(
    sigmoidPct(coreTempC, isFish ? 59.5 : 68.5, isFish ? 1.4 : 1.5).toFixed(1),
  );
  const kGel =
    coreTempC < 60
      ? 0
      : 0.0012 * Math.exp(0.088 * (Math.min(coreTempC, 100) - 60));
  const gelatinFraction = kGel > 0 && holdMinutes > 0 ? 1 - Math.exp(-kGel * holdMinutes) : 0;
  const gelatinConversionPct = Number((clamp(gelatinFraction, 0, 1) * 100).toFixed(1));
  return {
    isFish,
    myosinDenaturedPct,
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
  const fatCushion = Math.min(10, cut.proximate.fatG * 0.35);
  const gelatinWaterBind = f.gelatinFraction * cut.proximate.collagenG * 3.8;
  const moistureRetentionPct = Number(
    clamp(96 - myosinFrac * 5 - actinFrac * 28 + fatCushion + gelatinWaterBind, 45, 98).toFixed(1),
  );
  const remainingCollagen = cut.proximate.collagenG * (1 - f.gelatinFraction);
  const actinPenalty = actinFrac * (cut.proximate.collagenG < 1.3 ? 34 : 18);
  const marblingBonus = Math.min(14, cut.proximate.fatG * 0.55);
  const gelatinBonus = f.gelatinFraction * cut.proximate.collagenG * 9.5;
  const underTempPenalty = coreTempC < 44 && !f.isFish ? (44 - coreTempC) * 1.1 : 0;
  const tendernessScore = Number(
    clamp(90 - remainingCollagen * 16 - actinPenalty + marblingBonus + gelatinBonus - underTempPenalty, 5, 100).toFixed(1),
  );
  const juicinessScore = Number(
    clamp(moistureRetentionPct * 0.85 + Math.min(18, cut.proximate.fatG * 0.65) + f.gelatinFraction * 10, 10, 100).toFixed(1),
  );
  return { moistureRetentionPct, tendernessScore, juicinessScore };
}

function thermalPhaseLabel(f: ThermalFractions): string {
  if (f.gelatinConversionPct >= 65) return "Gelatinized Collagen Matrix";
  if (f.actinCoagulatedPct >= 50) return "Actin Coagulation & Moisture Expulsion";
  if (f.myosinDenaturedPct >= 50) return "Myosin Denaturation Window";
  return "Pre-Denaturation (Native Muscle)";
}

export function evaluateThermalProfile(
  cut: AnatomicalCut,
  rawCoreTempC: number,
  rawHoldMinutes: number,
): ThermalEvaluation {
  const coreTempC = clamp(Number.isFinite(rawCoreTempC) ? rawCoreTempC : 55, 20, 105);
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
    phaseLabel: thermalPhaseLabel(fracs),
    donenessLabel: donenessLabelFor(cut, coreTempC),
    warning: thermalWarningFor(cut, coreTempC, fracs.gelatinConversionPct),
  };
}

export function generateThermalCurve(
  cut: AnatomicalCut,
  holdMinutes: number,
): readonly ThermalCurvePoint[] {
  const points: ThermalCurvePoint[] = [];
  for (let tempC = 45; tempC <= 95; tempC += 2.5) {
    const ev = evaluateThermalProfile(cut, tempC, holdMinutes);
    points.push({
      tempC,
      tendernessScore: ev.tendernessScore,
      moistureRetentionPct: ev.moistureRetentionPct,
      gelatinConversionPct: ev.gelatinConversionPct,
      actinCoagulatedPct: ev.actinCoagulatedPct,
    });
  }
  return points;
}

/**
 * Evaluates knife-plane slicing orientation against the cut's 3D muscle fiber
 * grain vector $\vec{g}$:
 *   $\theta = \arcsin(|\hat{n}_{knife} \cdot \hat{g}|) \in [0^\circ, 90^\circ]$.
 *
 * Clamps $\sin\theta \ge 0.12$ and caps $L_{eff} \le L_{max}$ so parallel
 * cuts ($\theta \to 0^\circ$) remain strictly bounded and finite.
 */
function buildSliceFeedback(
  sliceAngleDeg: number,
  effectiveFiberLengthMm: number,
  shearForceMultiplier: number,
  baseBiteLengthMm: number,
): { readonly verdict: string; readonly coachingNote: string } {
  if (sliceAngleDeg < 35) {
    return {
      verdict: "Parallel / Stringy Cut",
      coachingNote: `Knife runs nearly parallel to grain (${sliceAngleDeg}°), leaving ${effectiveFiberLengthMm} mm fibers intact (${shearForceMultiplier}× shear). Rotate toward 90°.`,
    };
  }
  if (sliceAngleDeg < 70) {
    return {
      verdict: "Oblique Bias Cut",
      coachingNote: `Moderate bias (${sliceAngleDeg}°); rotating closer to 90° perpendicular shortens muscle bundles from ${effectiveFiberLengthMm} mm to ${baseBiteLengthMm} mm.`,
    };
  }
  return {
    verdict: "Optimal Cross-Grain Shear",
    coachingNote: `Fibers severed cleanly (${effectiveFiberLengthMm} mm length; ${shearForceMultiplier}× base shear).`,
  };
}

export function evaluateGrainSlice(
  cut: AnatomicalCut,
  knifeNormalVector: Vec3Tuple,
  rawPortionMassG: number,
  rawTargetMassG: number,
): GrainSliceEvaluation {
  const nHat = normalizeVec3(knifeNormalVector);
  const gHat = normalizeVec3(cut.grainVector);
  const dotAbs = Math.abs(nHat[0] * gHat[0] + nHat[1] * gHat[1] + nHat[2] * gHat[2]);
  const sinTheta = clamp(dotAbs, 0, 1);
  const sliceAngleDeg = Number(((Math.asin(sinTheta) * 180) / Math.PI).toFixed(1));

  // Clamped sine prevents division-by-zero / Infinity when slicing parallel (0°).
  const safeSin = Math.max(sinTheta, 0.12);
  const baseBiteLengthMm = 12;
  const effectiveFiberLengthMm = Number(
    Math.min(cut.maxFiberLengthMm, baseBiteLengthMm / safeSin).toFixed(1),
  );
  const shearForceMultiplier = Number(
    (1 + (cut.fiberLengthFactor - 1) * (1 - sinTheta) * 1.35).toFixed(2),
  );
  const angleDeficit = Math.max(0, 90 - sliceAngleDeg) / 90;
  const sensitivity = clamp(0.65 + (cut.fiberLengthFactor - 1) * 0.4, 0.6, 1.5);
  const grainAngleScore = Number(
    clamp(100 - Math.pow(angleDeficit, 1.25) * 85 * sensitivity, 0, 100).toFixed(1),
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

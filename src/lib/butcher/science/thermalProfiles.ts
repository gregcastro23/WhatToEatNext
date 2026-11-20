import type { AnatomicalCut, SpeciesId } from "@/lib/butcher/types";

/**
 * Species-specific Differential Scanning Calorimetry (DSC) transition tables
 * and thermal curve bounds for mammalian, poultry, and finfish muscle.
 *
 * @file src/lib/butcher/science/thermalProfiles.ts
 */

export interface SpeciesThermalSpec {
  readonly myosinMidC: number;
  readonly myosinSlopeC: number;
  readonly moistureExpulsionMidC: number;
  readonly moistureExpulsionSlopeC: number;
  readonly actinMidC: number;
  readonly actinSlopeC: number;
  readonly gelatinOnsetC: number;
  readonly gelatinRateA: number;
  readonly gelatinRateK: number;
  readonly gelatinCapC: number;
}

export interface ThermalCurveBounds {
  readonly minC: number;
  readonly maxC: number;
  readonly stepC: number;
}

const MAMMALIAN_SPEC: SpeciesThermalSpec = {
  myosinMidC: 56.0,
  myosinSlopeC: 1.3,
  moistureExpulsionMidC: 69.5,
  moistureExpulsionSlopeC: 1.8,
  actinMidC: 81.5,
  actinSlopeC: 1.2,
  gelatinOnsetC: 62,
  gelatinRateA: 0.00095,
  gelatinRateK: 0.098,
  gelatinCapC: 100,
};

const POULTRY_WHITE_SPEC: SpeciesThermalSpec = {
  myosinMidC: 55.5,
  myosinSlopeC: 1.4,
  moistureExpulsionMidC: 72.5,
  moistureExpulsionSlopeC: 1.3,
  actinMidC: 79.5,
  actinSlopeC: 1.3,
  gelatinOnsetC: 60,
  gelatinRateA: 0.0022,
  gelatinRateK: 0.095,
  gelatinCapC: 100,
};

const POULTRY_DARK_SPEC: SpeciesThermalSpec = {
  ...POULTRY_WHITE_SPEC,
  moistureExpulsionMidC: 78.0,
  moistureExpulsionSlopeC: 2.0,
};

const FINFISH_SPEC: SpeciesThermalSpec = {
  myosinMidC: 41.5,
  myosinSlopeC: 1.3,
  moistureExpulsionMidC: 60.0,
  moistureExpulsionSlopeC: 1.5,
  actinMidC: 64.0,
  actinSlopeC: 1.4,
  gelatinOnsetC: 43,
  gelatinRateA: 0.024,
  gelatinRateK: 0.18,
  gelatinCapC: 75,
};

export function thermalSpecForCut(cut: AnatomicalCut): SpeciesThermalSpec {
  if (cut.speciesId === "finfish") return FINFISH_SPEC;
  if (cut.speciesId === "poultry") {
    return cut.proximate.collagenG < 0.8 ? POULTRY_WHITE_SPEC : POULTRY_DARK_SPEC;
  }
  return MAMMALIAN_SPEC;
}

export function thermalCurveBoundsFor(speciesId: SpeciesId): ThermalCurveBounds {
  if (speciesId === "finfish") {
    return { minC: 35, maxC: 75, stepC: 2 };
  }
  return { minC: 45, maxC: 95, stepC: 2.5 };
}

export function dscReferenceSummary(speciesId: SpeciesId): string {
  if (speciesId === "finfish") {
    return "Myosin 41.5 °C · Myocommata 45–55 °C · Expulsion ≥60 °C";
  }
  if (speciesId === "poultry") {
    return "Myosin 55.5 °C · White Expulsion >72 °C · Actin 79.5 °C";
  }
  return "Myosin 56 °C · Shrink 66–73 °C · Actin 81.5 °C";
}

export function donenessLabelFor(cut: AnatomicalCut, coreTempC: number): string {
  if (cut.speciesId === "finfish") {
    if (coreTempC < 44) return "Raw / Mi-Cuit";
    if (coreTempC < 52) return "Translucent Medium-Rare";
    if (coreTempC < 58) return "Just-Flaking Medium";
    return "Firm / Albumin Expulsion Risk";
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
  if (coreTempC < 72) return "Medium-Well / Shrink Zone";
  if (coreTempC < 86) return "Well Done (Collagen Transition)";
  return "Pulled / Braise Tender";
}

export function thermalWarningFor(
  cut: AnatomicalCut,
  coreTempC: number,
  gelatinPct: number,
): string | null {
  if (cut.speciesId === "finfish") {
    return coreTempC >= 60
      ? "Albumin expulsion threshold exceeded (≥60 °C): salmon myotomes are squeezing albumin and drying."
      : null;
  }
  if (cut.speciesId === "poultry") {
    if (coreTempC < 62) {
      return "Below poultry pasteurization envelope (hold ≥65 °C or reach 74 °C instantaneous).";
    }
    if (cut.proximate.collagenG < 0.8 && coreTempC > 72) {
      return "White-meat drying threshold exceeded (>72 °C): low-collagen pectoralis fibers expel moisture rapidly.";
    }
    return null;
  }
  if (cut.proximate.collagenG >= 1.7 && coreTempC >= 65 && coreTempC < 84 && gelatinPct < 40) {
    return "Collagen stall / contraction zone: fiber shrinkage squeezed moisture before collagen melted to gelatin.";
  }
  if (cut.proximate.collagenG < 1.1 && coreTempC > cut.targetCoreTempC.max + 4) {
    return "Overcooked for a low-collagen cut: myofibrillar shrinkage expelled structural moisture.";
  }
  return null;
}

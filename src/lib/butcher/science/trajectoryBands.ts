import type { AnatomicalCut, CutProximate } from "@/lib/butcher/types";
import { clampVal, depthAboveThresholdMm, meatWalkLengthMm, sigmoid } from "./slabDiffusion";
import { thermalSpecForCut } from "./thermalProfiles";
import { grayBandThresholdForCut } from "./trajectoryMethods";
import type { PrepProfile } from "./prepModifiers";
import type { SlabColumn } from "./slabColumn";
import type { TrajectoryFaceBand } from "./trajectoryTypes";

/**
 * Per-face crust / gray-band depths and moisture retention for the layered
 * column. Each face is measured from ITS meat surface (under any fat cap or
 * bone plate) toward the thermal centre, so the two faces partition the meat.
 *
 * @file src/lib/butcher/science/trajectoryBands.ts
 */

export const MAILLARD_TEMP_C = 140;

function faceBand(
  side: "A" | "B",
  column: SlabColumn,
  peaks: readonly number[],
  thresholds: { readonly crustC: number | null; readonly grayC: number },
  probe: number,
): TrajectoryFaceBand {
  const from = side === "A" ? column.meatSurfaceA : column.meatSurfaceB;
  const walkMm = meatWalkLengthMm(column, from, probe);
  const crust = thresholds.crustC === null
    ? 0
    : Math.min(walkMm, depthAboveThresholdMm(column, peaks, thresholds.crustC, from, probe));
  const over = depthAboveThresholdMm(column, peaks, thresholds.grayC, from, probe);
  const gray = clampVal(over - crust, 0, Math.max(0, walkMm - crust));
  return {
    side,
    outer: side === "A" ? column.faceAKind : column.faceBKind,
    crustDepthMm: Number(crust.toFixed(2)),
    grayBandMm: Number(gray.toFixed(2)),
  };
}

export interface ColumnBands {
  readonly faces: readonly [TrajectoryFaceBand, TrajectoryFaceBand];
  readonly crustDepthMm: number;
  readonly grayBandMm: number;
  readonly idealCoreMm: number;
}

export function computeColumnBands(
  cut: AnatomicalCut,
  column: SlabColumn,
  peaks: readonly number[],
  opts: { readonly wetMedium: boolean; readonly targetCoreTempC: number; readonly probe: number },
): ColumnBands {
  const thresholds = {
    crustC: opts.wetMedium ? null : MAILLARD_TEMP_C,
    grayC: grayBandThresholdForCut(cut, opts.targetCoreTempC),
  };
  const a = faceBand("A", column, peaks, thresholds, opts.probe);
  const b = faceBand("B", column, peaks, thresholds, opts.probe);
  const half = column.meatThicknessMm / 2;
  const crustDepthMm = Number(((a.crustDepthMm + b.crustDepthMm) / 2).toFixed(2));
  const grayBandMm = Number(((a.grayBandMm + b.grayBandMm) / 2).toFixed(2));
  const idealCoreMm = Number(Math.max(0, half - crustDepthMm - grayBandMm).toFixed(2));
  return { faces: [a, b], crustDepthMm, grayBandMm, idealCoreMm };
}

/**
 * Moisture retention from the meat nodes' peak temperatures (shrinkage and
 * actin expulsion), cushioned by fat and gelatin water binding, then reduced
 * in LOSS by the prep's relative cook-loss reduction. Brine uptake (+water)
 * is reported relative to the UNBRINED raw weight, so the extra water held
 * shows as retention; a loss before cooking (dry-aging) is not charged here.
 */
export function moistureRetentionPct(
  cut: AnatomicalCut,
  proximate: CutProximate,
  column: SlabColumn,
  peaks: readonly number[],
  gelatinConversionPct: number,
  prep: Pick<PrepProfile, "cookLossReductionFrac" | "waterMassChangeG">,
): number {
  const spec = thermalSpecForCut(cut);
  let lossSum = 0;
  let count = 0;
  peaks.forEach((t, i) => {
    if (column.isMeatNode[i] !== true) return;
    lossSum += sigmoid(t, spec.moistureExpulsionMidC, spec.moistureExpulsionSlopeC) * 26 + sigmoid(t, spec.actinMidC, spec.actinSlopeC) * 6;
    count += 1;
  });
  const avgLoss = count > 0 ? lossSum / count : 0;
  const base = 95 - avgLoss + Math.min(10, proximate.fatG * 0.35) + (gelatinConversionPct / 100) * proximate.collagenG * 3.8;
  const buffered = 100 - (100 - base) * (1 - clampVal(prep.cookLossReductionFrac, 0, 0.9));
  const uptake = 1 + Math.max(0, prep.waterMassChangeG) / 100;
  return Number(clampVal(buffered * uptake, 45, 98).toFixed(1));
}

export function buildSurfaceSummary(
  wetMedium: boolean, maillardOnsetMin: number | null, stallDurationMin: number, stallPlateauTempC: number | null,
): string {
  if (wetMedium) return "No crust (wet medium)";
  if (maillardOnsetMin !== null) return `Maillard at ${maillardOnsetMin.toFixed(1)} min`;
  if (stallDurationMin >= 15 && stallPlateauTempC !== null) {
    return `Stall plateau ~${Math.round(stallPlateauTempC)} °C (${Math.round(stallDurationMin)} min)`;
  }
  return "Sub-Maillard dry crust";
}

import type { AnatomicalCut, CookingStrategy } from "@/lib/butcher/types";
import { latentHeatVaporisation } from "@/lib/cooking/latentHeat";

/**
 * Cooking-method boundary specifications, surface evaporative cooling
 * (BBQ stall / flash-dry), and species gray-band thresholds for the
 * 1D coupled meat trajectory solver.
 *
 * @file src/lib/butcher/science/trajectoryMethods.ts
 */

export type TrajectoryMethodId =
  | "searing"
  | "reverse-sear"
  | "smoking"
  | "braising"
  | "sous-vide"
  | "roasting";

export interface TrajectoryMethodOption {
  readonly id: TrajectoryMethodId;
  readonly label: string;
}

export const TRAJECTORY_METHODS: readonly TrajectoryMethodOption[] = [
  { id: "searing", label: "Direct Sear" },
  { id: "reverse-sear", label: "Reverse Sear" },
  { id: "smoking", label: "BBQ Smoke" },
  { id: "braising", label: "Braise" },
  { id: "sous-vide", label: "Sous-Vide" },
  { id: "roasting", label: "Roast" },
];

export interface MethodBoundarySpec {
  readonly mediumC: number;
  readonly hWm2K: number;
  readonly wetMedium: boolean;
  readonly initialSurfaceWaterKgM2: number;
  readonly evapScale: number;
  readonly dtSec: number;
  readonly maxCookMin: number;
  readonly pullOffsetC: number;
  readonly finishSec: number;
  readonly finishMediumC: number;
  readonly finishHWm2K: number;
}

export function defaultTrajectoryMethodForCut(cut: AnatomicalCut): TrajectoryMethodId {
  const strategy: CookingStrategy = cut.optimalMethods[0] ?? "high-heat-sear";
  switch (strategy) {
    case "high-heat-sear":
      return "searing";
    case "reverse-sear":
      return "reverse-sear";
    case "low-and-slow-smoke":
      return "smoking";
    case "collagen-braise":
      return "braising";
    case "sous-vide":
      return "sous-vide";
    case "poach-confit":
      return cut.targetCoreTempC.ideal < 72 ? "sous-vide" : "braising";
  }
}

export function boundarySpecForMethod(
  method: TrajectoryMethodId,
  targetCoreTempC: number,
): MethodBoundarySpec {
  switch (method) {
    case "searing":
      return {
        mediumC: 230, hWm2K: 420, wetMedium: false,
        initialSurfaceWaterKgM2: 0.16, evapScale: 1.0, dtSec: 2, maxCookMin: 60,
        pullOffsetC: 0, finishSec: 0, finishMediumC: 230, finishHWm2K: 420,
      };
    case "reverse-sear":
      return {
        mediumC: 110, hWm2K: 26, wetMedium: false,
        initialSurfaceWaterKgM2: 0.18, evapScale: 0.9, dtSec: 4, maxCookMin: 360,
        pullOffsetC: 6, finishSec: 60, finishMediumC: 235, finishHWm2K: 420,
      };
    case "smoking":
      return {
        mediumC: 120, hWm2K: 24, wetMedium: false,
        initialSurfaceWaterKgM2: 2.0, evapScale: 1.15, dtSec: 4, maxCookMin: 720,
        pullOffsetC: 0, finishSec: 0, finishMediumC: 120, finishHWm2K: 24,
      };
    case "braising":
      return {
        mediumC: Math.min(99, Math.max(94, targetCoreTempC + 4)),
        hWm2K: 950, wetMedium: true,
        initialSurfaceWaterKgM2: 1.0, evapScale: 0, dtSec: 4, maxCookMin: 480,
        pullOffsetC: 0, finishSec: 0, finishMediumC: 96, finishHWm2K: 950,
      };
    case "sous-vide":
      return {
        mediumC: Math.min(98, targetCoreTempC + 0.5),
        hWm2K: 600, wetMedium: true,
        initialSurfaceWaterKgM2: 1.0, evapScale: 0, dtSec: 4, maxCookMin: 360,
        pullOffsetC: 0, finishSec: 0, finishMediumC: targetCoreTempC + 0.5, finishHWm2K: 600,
      };
    case "roasting":
      return {
        mediumC: 190, hWm2K: 32, wetMedium: false,
        initialSurfaceWaterKgM2: 0.3, evapScale: 1.0, dtSec: 2, maxCookMin: 240,
        pullOffsetC: 0, finishSec: 0, finishMediumC: 190, finishHWm2K: 32,
      };
  }
}

export function grayBandThresholdForCut(
  cut: AnatomicalCut,
  targetCoreTempC: number,
): number {
  if (cut.speciesId === "finfish") return 60;
  if (cut.speciesId === "poultry") {
    return cut.proximate.collagenG < 0.8 ? 74 : Math.max(86, targetCoreTempC + 6);
  }
  if (cut.proximate.collagenG >= 1.7 && targetCoreTempC >= 71) {
    return Math.max(85, targetCoreTempC + 6);
  }
  return 71;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Antoine saturated vapor pressure (kPa) for water over 1–100 °C. */
function saturationPressureKPa(tempC: number): number {
  const t = clamp(tempC, 1, 100);
  const log10MmHg = 8.07131 - 1730.63 / (233.426 + t);
  return Math.pow(10, log10MmHg) * 0.133322;
}

export function computeSurfaceEvaporation(params: {
  readonly surfaceTempC: number;
  readonly hWm2K: number;
  readonly surfaceWaterKgM2: number;
  readonly initialWaterKgM2: number;
  readonly evapScale: number;
  readonly dtSec: number;
}): { readonly qEvapWm2: number; readonly waterRemovedKgM2: number } {
  if (
    params.evapScale <= 0 ||
    params.surfaceWaterKgM2 <= 1e-6 ||
    params.surfaceTempC < 60
  ) {
    return { qEvapWm2: 0, waterRemovedKgM2: 0 };
  }
  const pSatKPa = saturationPressureKPa(params.surfaceTempC);
  const pAmbKPa = 4.0;
  const avail = Math.pow(clamp(params.surfaceWaterKgM2 / params.initialWaterKgM2, 0, 1), 0.45);
  const rawRateKgM2S =
    params.evapScale *
    8.5e-5 *
    params.hWm2K *
    Math.max(0, (pSatKPa - pAmbKPa) / 101.325) *
    avail;
  const removed = Math.min(params.surfaceWaterKgM2, rawRateKgM2S * params.dtSec);
  const hfgJkg = latentHeatVaporisation(clamp(params.surfaceTempC, 0, 100));
  return {
    qEvapWm2: (removed / params.dtSec) * hfgJkg,
    waterRemovedKgM2: removed,
  };
}

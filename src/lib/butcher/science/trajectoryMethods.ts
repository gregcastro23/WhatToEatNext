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
  readonly initialSearMaxSec: number;
  readonly initialSearStopSurfaceC: number;
  readonly initialSearMediumC: number;
  readonly initialSearHWm2K: number;
  readonly finishSec: number;
  readonly finishMediumC: number;
  readonly finishHWm2K: number;
  readonly dryBeforeFinish: boolean;
  readonly crustConductivityFactor: number;
  readonly supportsHold: boolean;
}

export const PAN_CONTACT_SURFACE_C = 205;
export const PAN_CONTACT_H_WM2K = 438;
export const PAN_AIR_SIDE_H_WM2K = 12;
export const PAN_AIR_SIDE_C = 25;
export const SEAR_PULL_OFFSET_C = 4;
export const ROAST_PULL_OFFSET_C = 5;

/** Flip-averaged oiled-pan boundary (`185–210 °C` contact cap) for a symmetric 1D slab. */
export function flipAveragedPanBoundary(
  panSurfaceC: number = PAN_CONTACT_SURFACE_C,
): { readonly mediumC: number; readonly hWm2K: number } {
  const panC = clamp(panSurfaceC, 185, 210);
  const hSum = PAN_CONTACT_H_WM2K + PAN_AIR_SIDE_H_WM2K;
  return {
    mediumC: Number(((PAN_CONTACT_H_WM2K * panC + PAN_AIR_SIDE_H_WM2K * PAN_AIR_SIDE_C) / hSum).toFixed(1)),
    hWm2K: Number((hSum / 2).toFixed(1)),
  };
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

const DEFAULT_BOUNDARY_BASE: MethodBoundarySpec = {
  mediumC: 185, hWm2K: 26, wetMedium: false, initialSurfaceWaterKgM2: 0.3,
  evapScale: 1.0, dtSec: 2, maxCookMin: 240, pullOffsetC: 0,
  initialSearMaxSec: 0, initialSearStopSurfaceC: 0, initialSearMediumC: 0, initialSearHWm2K: 0,
  finishSec: 0, finishMediumC: 185, finishHWm2K: 26, dryBeforeFinish: false,
  crustConductivityFactor: 1.0, supportsHold: false,
};

const STATIC_BOUNDARY_OVERRIDES: Partial<Record<TrajectoryMethodId, Partial<MethodBoundarySpec>>> = {
  smoking: {
    mediumC: 120, hWm2K: 24, initialSurfaceWaterKgM2: 2.0, evapScale: 1.15,
    dtSec: 4, maxCookMin: 720, finishMediumC: 120, finishHWm2K: 24, supportsHold: true,
  },
  roasting: {
    mediumC: 185, hWm2K: 26, initialSurfaceWaterKgM2: 0.3, pullOffsetC: ROAST_PULL_OFFSET_C,
    crustConductivityFactor: 0.24,
  },
};

export function boundarySpecForMethod(
  method: TrajectoryMethodId,
  targetCoreTempC: number,
  halfThicknessMm = 17.5,
): MethodBoundarySpec {
  if (method === "searing") {
    const pan = flipAveragedPanBoundary();
    return {
      ...DEFAULT_BOUNDARY_BASE,
      mediumC: Math.max(100, targetCoreTempC + 24), hWm2K: 72,
      initialSurfaceWaterKgM2: 0.12, maxCookMin: 60, pullOffsetC: SEAR_PULL_OFFSET_C,
      initialSearMaxSec: Math.round(clamp(halfThicknessMm * 8, 44, 150)),
      initialSearStopSurfaceC: 158, initialSearMediumC: 202, initialSearHWm2K: pan.hWm2K,
      finishMediumC: pan.mediumC, finishHWm2K: pan.hWm2K, crustConductivityFactor: 0.24,
    };
  }
  if (method === "reverse-sear") {
    return {
      ...DEFAULT_BOUNDARY_BASE,
      mediumC: clamp(targetCoreTempC + 24, 92, 118), hWm2K: 13,
      initialSurfaceWaterKgM2: 0.14, evapScale: 0.9, dtSec: 4, maxCookMin: 360, pullOffsetC: 2,
      finishSec: Math.round(clamp(halfThicknessMm * 0.95, 14, 18)),
      finishMediumC: 210, finishHWm2K: 280, dryBeforeFinish: true, crustConductivityFactor: 0.24,
    };
  }
  if (method === "braising") {
    return {
      ...DEFAULT_BOUNDARY_BASE,
      mediumC: Math.min(99, Math.max(94, targetCoreTempC + 4)), hWm2K: 950, wetMedium: true,
      initialSurfaceWaterKgM2: 1.0, evapScale: 0, dtSec: 4, maxCookMin: 480,
      finishMediumC: 96, finishHWm2K: 950, supportsHold: true,
    };
  }
  if (method === "sous-vide") {
    return {
      ...DEFAULT_BOUNDARY_BASE,
      mediumC: Math.min(98, targetCoreTempC + 0.5), hWm2K: 600, wetMedium: true,
      initialSurfaceWaterKgM2: 1.0, evapScale: 0, dtSec: 4, maxCookMin: 360,
      finishMediumC: targetCoreTempC + 0.5, finishHWm2K: 600, supportsHold: true,
    };
  }
  return { ...DEFAULT_BOUNDARY_BASE, ...STATIC_BOUNDARY_OVERRIDES[method] };
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

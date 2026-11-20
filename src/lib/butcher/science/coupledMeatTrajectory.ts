import type { AnatomicalCut } from "@/lib/butcher/types";
import type { FoodThermophysicalProperties } from "@/lib/cooking/choiOkos";
import {
  clampVal,
  depthExceedingThresholdMm,
  sigmoid,
  stepImplicitSlab,
  thermophysicalForCut,
} from "./slabDiffusion";
import { thermalSpecForCut } from "./thermalProfiles";
import {
  boundarySpecForMethod,
  computeSurfaceEvaporation,
  grayBandThresholdForCut,
  type MethodBoundarySpec,
  type TrajectoryMethodId,
} from "./trajectoryMethods";

export {
  TRAJECTORY_METHODS,
  defaultTrajectoryMethodForCut,
  type TrajectoryMethodId,
} from "./trajectoryMethods";

/**
 * 1D transient heat, surface evaporation, Maillard onset, gray-band depth,
 * and time-integrated collagen hydrolysis trajectory kernel.
 *
 * @file src/lib/butcher/science/coupledMeatTrajectory.ts
 */

const SLAB_NODES = 15;
const MAILLARD_TEMP_C = 140;
const REST_DRY_WATER_KGM2 = 0.7;
const REST_CONV_RAD_H_WM2K = 22;
const REST_EVAP_H_WM2K = 42;
const REST_EVAP_SCALE = 1.5;

export interface CoupledTrajectoryOptions {
  readonly method: TrajectoryMethodId;
  readonly targetCoreTempC?: number;
  readonly thicknessMm?: number;
  readonly initialTempC?: number;
  readonly holdMinutes?: number;
  readonly restMinutes?: number;
  readonly ambientTempC?: number;
}

export interface CoupledTrajectoryResult {
  readonly method: TrajectoryMethodId;
  readonly halfThicknessMm: number;
  readonly cookMinutes: number;
  readonly restMinutes: number;
  readonly targetCoreTempC: number;
  readonly pullCoreTempC: number;
  /** Core temperature at the instant the meat leaves the heat (after any finishing sear). */
  readonly removedCoreTempC: number;
  readonly carryoverPeakC: number;
  readonly carryoverRiseC: number;
  readonly finalSurfaceTempC: number;
  readonly peakSurfaceTempC: number;
  readonly peakNodeTempsC: readonly number[];
  readonly grayBandMm: number;
  readonly grayBandPct: number;
  readonly crustDepthMm: number;
  readonly idealCoreMm: number;
  readonly maillardOnsetMin: number | null;
  readonly stallDurationMin: number;
  readonly stallPlateauTempC: number | null;
  readonly gelatinConversionPct: number;
  readonly restGelatinGainPct: number;
  readonly moistureRetentionPct: number;
  readonly surfaceEventSummary: string;
}

interface SimState {
  readonly temps: number[];
  readonly peakNodeTemps: number[];
  remainingCollagenFrac: number;
  surfaceWaterKgM2: number;
  elapsedSec: number;
  maillardOnsetMin: number | null;
  stallSec: number;
  stallTempWeightedSum: number;
}

interface StepConfig {
  readonly dtSec: number;
  readonly mediumC: number;
  readonly hWm2K: number;
  readonly wetMedium: boolean;
  readonly initialWaterKgM2: number;
  readonly evapScale: number;
  readonly evapHWm2K?: number;
  readonly crustConductivityFactor: number;
  readonly trackEvents: boolean;
}

function updateCoreCollagen(cut: AnatomicalCut, state: SimState, dtSec: number): void {
  const coreTemp = state.temps[state.temps.length - 1] ?? 10;
  const thermalSpec = thermalSpecForCut(cut);
  if (coreTemp < thermalSpec.gelatinOnsetC) return;
  const delta = Math.min(coreTemp, thermalSpec.gelatinCapC) - thermalSpec.gelatinOnsetC;
  const kGel = thermalSpec.gelatinRateA * Math.exp(thermalSpec.gelatinRateK * delta);
  state.remainingCollagenFrac *= Math.exp(-kGel * (dtSec / 60));
}

function recordSurfaceEvents(state: SimState, qEvapWm2: number, cfg: StepConfig): void {
  if (!cfg.trackEvents || cfg.wetMedium) return;
  const surfaceTemp = state.temps[0] ?? 10;
  const moistureFrac = cfg.initialWaterKgM2 > 0 ? state.surfaceWaterKgM2 / cfg.initialWaterKgM2 : 0;
  if (state.maillardOnsetMin === null && surfaceTemp >= MAILLARD_TEMP_C && moistureFrac <= 0.15) {
    state.maillardOnsetMin = Number((state.elapsedSec / 60).toFixed(2));
  }
  if (moistureFrac > 0.05 && qEvapWm2 > 120 && surfaceTemp >= 64 && surfaceTemp <= 78) {
    state.stallSec += cfg.dtSec;
    state.stallTempWeightedSum += surfaceTemp * cfg.dtSec;
  }
}

function advanceTrajectoryStep(
  cut: AnatomicalCut, state: SimState, props: FoodThermophysicalProperties, dx: number, cfg: StepConfig,
): void {
  const evap = cfg.wetMedium
    ? { qEvapWm2: 0, waterRemovedKgM2: 0 }
    : computeSurfaceEvaporation({
        surfaceTempC: state.temps[0] ?? 10, hWm2K: cfg.evapHWm2K ?? cfg.hWm2K,
        surfaceWaterKgM2: state.surfaceWaterKgM2, initialWaterKgM2: cfg.initialWaterKgM2,
        evapScale: cfg.evapScale, dtSec: cfg.dtSec,
      });

  state.surfaceWaterKgM2 = Math.max(0, state.surfaceWaterKgM2 - evap.waterRemovedKgM2);
  stepImplicitSlab({
    temps: state.temps, dx, dt: cfg.dtSec, props,
    hWm2K: cfg.hWm2K, tMediumC: cfg.mediumC, qEvapWm2: evap.qEvapWm2,
    crustConductivityFactor: cfg.crustConductivityFactor,
  });
  state.elapsedSec += cfg.dtSec;

  for (let i = 0; i < state.temps.length; i += 1) {
    const tNode = state.temps[i] ?? 0;
    if (tNode > (state.peakNodeTemps[i] ?? -Infinity)) state.peakNodeTemps[i] = tNode;
  }
  updateCoreCollagen(cut, state, cfg.dtSec);
  recordSurfaceEvents(state, evap.qEvapWm2, cfg);
}

function runCookStages(
  cut: AnatomicalCut, state: SimState, props: FoodThermophysicalProperties, dx: number,
  spec: MethodBoundarySpec, cfg: { readonly pullCoreTempC: number; readonly holdMinutes: number },
): number {
  const initialSearSteps = Math.round(spec.initialSearMaxSec / 2);
  for (let s = 0; s < initialSearSteps && (state.temps[SLAB_NODES - 1] ?? 0) < cfg.pullCoreTempC; s += 1) {
    advanceTrajectoryStep(cut, state, props, dx, {
      dtSec: 2, mediumC: spec.initialSearMediumC, hWm2K: spec.initialSearHWm2K,
      wetMedium: false, initialWaterKgM2: spec.initialSurfaceWaterKgM2, evapScale: spec.evapScale,
      crustConductivityFactor: spec.crustConductivityFactor, trackEvents: true,
    });
    if ((state.temps[0] ?? 0) >= spec.initialSearStopSurfaceC) break;
  }

  const maxCookSteps = Math.round((spec.maxCookMin * 60) / spec.dtSec);
  for (let s = 0; s < maxCookSteps && (state.temps[SLAB_NODES - 1] ?? 0) < cfg.pullCoreTempC; s += 1) {
    advanceTrajectoryStep(cut, state, props, dx, {
      dtSec: spec.dtSec, mediumC: spec.mediumC, hWm2K: spec.hWm2K,
      wetMedium: spec.wetMedium, initialWaterKgM2: spec.initialSurfaceWaterKgM2, evapScale: spec.evapScale,
      crustConductivityFactor: spec.crustConductivityFactor, trackEvents: true,
    });
  }

  if (spec.dryBeforeFinish) state.surfaceWaterKgM2 = 0;
  const finishSteps = Math.round(spec.finishSec / 2);
  for (let s = 0; s < finishSteps; s += 1) {
    advanceTrajectoryStep(cut, state, props, dx, {
      dtSec: 2, mediumC: spec.finishMediumC, hWm2K: spec.finishHWm2K,
      wetMedium: false, initialWaterKgM2: spec.initialSurfaceWaterKgM2, evapScale: 1.0,
      crustConductivityFactor: spec.crustConductivityFactor, trackEvents: true,
    });
  }

  const holdSteps = spec.supportsHold ? Math.round((cfg.holdMinutes * 60) / spec.dtSec) : 0;
  const holdTempC = Math.min(99, Math.max(cfg.pullCoreTempC, spec.wetMedium ? spec.mediumC : cfg.pullCoreTempC + 0.5));
  for (let s = 0; s < holdSteps; s += 1) {
    advanceTrajectoryStep(cut, state, props, dx, {
      dtSec: spec.dtSec, mediumC: holdTempC, hWm2K: spec.hWm2K,
      wetMedium: spec.wetMedium, initialWaterKgM2: spec.initialSurfaceWaterKgM2, evapScale: spec.evapScale,
      crustConductivityFactor: 1.0, trackEvents: false,
    });
  }
  return Number((state.elapsedSec / 60).toFixed(1));
}

function runRestStage(
  cut: AnatomicalCut, state: SimState, props: FoodThermophysicalProperties, dx: number,
  spec: MethodBoundarySpec, cfg: { readonly restMinutes: number; readonly ambientTempC: number },
): { readonly removedCoreTempC: number; readonly carryoverPeakC: number; readonly restGelatinGainPct: number } {
  const gelatinBeforeRest = (1 - state.remainingCollagenFrac) * 100;
  const removedCoreTempC = state.temps[SLAB_NODES - 1] ?? 10;
  let carryoverPeakC = removedCoreTempC;

  if (!spec.wetMedium) state.surfaceWaterKgM2 = REST_DRY_WATER_KGM2;
  const restSteps = Math.round((cfg.restMinutes * 60) / 5);
  for (let s = 0; s < restSteps; s += 1) {
    advanceTrajectoryStep(cut, state, props, dx, {
      dtSec: 5, mediumC: cfg.ambientTempC, hWm2K: spec.wetMedium ? 10 : REST_CONV_RAD_H_WM2K,
      wetMedium: spec.wetMedium, initialWaterKgM2: REST_DRY_WATER_KGM2,
      evapScale: spec.wetMedium ? 0 : REST_EVAP_SCALE, evapHWm2K: REST_EVAP_H_WM2K,
      crustConductivityFactor: 1.0, trackEvents: false,
    });
    const coreNow = state.temps[SLAB_NODES - 1] ?? carryoverPeakC;
    if (coreNow > carryoverPeakC) carryoverPeakC = coreNow;
  }
  const gelatinAfterRest = (1 - state.remainingCollagenFrac) * 100;
  return {
    removedCoreTempC, carryoverPeakC,
    restGelatinGainPct: Number(Math.max(0, gelatinAfterRest - gelatinBeforeRest).toFixed(1)),
  };
}

function buildSurfaceSummary(
  wetMedium: boolean, maillardOnsetMin: number | null, stallDurationMin: number, stallPlateauTempC: number | null,
): string {
  if (wetMedium) return "No crust (wet medium)";
  if (maillardOnsetMin !== null) return `Maillard at ${maillardOnsetMin.toFixed(1)} min`;
  if (stallDurationMin >= 15 && stallPlateauTempC !== null) {
    return `Stall plateau ~${Math.round(stallPlateauTempC)} °C (${Math.round(stallDurationMin)} min)`;
  }
  return "Sub-Maillard dry crust";
}

function finalizeTrajectoryResult(
  cut: AnatomicalCut, method: TrajectoryMethodId, spec: MethodBoundarySpec, state: SimState,
  timing: {
    readonly halfThicknessMm: number; readonly targetCoreTempC: number; readonly pullCoreTempC: number;
    readonly cookMinutes: number; readonly restMinutes: number; readonly removedCoreTempC: number;
    readonly carryoverPeakC: number; readonly restGelatinGainPct: number;
  },
): CoupledTrajectoryResult {
  const gelatinConversionPct = Number(((1 - state.remainingCollagenFrac) * 100).toFixed(1));
  const crustDepthMm = spec.wetMedium ? 0 : Number(depthExceedingThresholdMm(state.peakNodeTemps, MAILLARD_TEMP_C, timing.halfThicknessMm).toFixed(2));
  const overcookDepthMm = depthExceedingThresholdMm(state.peakNodeTemps, grayBandThresholdForCut(cut, timing.targetCoreTempC), timing.halfThicknessMm);
  const grayBandMm = Number(clampVal(overcookDepthMm - crustDepthMm, 0, timing.halfThicknessMm - crustDepthMm).toFixed(2));
  const idealCoreMm = Number(Math.max(0, timing.halfThicknessMm - crustDepthMm - grayBandMm).toFixed(2));
  const tSpec = thermalSpecForCut(cut);
  const avgLoss = state.peakNodeTemps.reduce((acc, t) => acc + sigmoid(t, tSpec.moistureExpulsionMidC, tSpec.moistureExpulsionSlopeC) * 26 + sigmoid(t, tSpec.actinMidC, tSpec.actinSlopeC) * 6, 0) / SLAB_NODES;
  const moistureRetentionPct = Number(clampVal(95 - avgLoss + Math.min(10, cut.proximate.fatG * 0.35) + (gelatinConversionPct / 100) * cut.proximate.collagenG * 3.8, 45, 98).toFixed(1));
  const stallDurationMin = Number((state.stallSec / 60).toFixed(1));
  const stallPlateauTempC = state.stallSec > 0 ? Number((state.stallTempWeightedSum / state.stallSec).toFixed(1)) : null;

  return {
    method, halfThicknessMm: timing.halfThicknessMm, cookMinutes: timing.cookMinutes, restMinutes: timing.restMinutes,
    targetCoreTempC: timing.targetCoreTempC, pullCoreTempC: timing.pullCoreTempC,
    removedCoreTempC: Number(timing.removedCoreTempC.toFixed(1)),
    carryoverPeakC: Number(timing.carryoverPeakC.toFixed(1)),
    carryoverRiseC: Number(Math.max(0, timing.carryoverPeakC - timing.removedCoreTempC).toFixed(1)),
    finalSurfaceTempC: Number((state.temps[0] ?? 10).toFixed(1)),
    peakSurfaceTempC: Number((state.peakNodeTemps[0] ?? 10).toFixed(1)),
    peakNodeTempsC: state.peakNodeTemps.map((t) => Number(t.toFixed(1))),
    grayBandMm, grayBandPct: Number(((grayBandMm / timing.halfThicknessMm) * 100).toFixed(0)),
    crustDepthMm, idealCoreMm, maillardOnsetMin: state.maillardOnsetMin,
    stallDurationMin, stallPlateauTempC, gelatinConversionPct,
    restGelatinGainPct: timing.restGelatinGainPct, moistureRetentionPct,
    surfaceEventSummary: buildSurfaceSummary(spec.wetMedium, state.maillardOnsetMin, stallDurationMin, stallPlateauTempC),
  };
}

export function simulateCoupledCutTrajectory(
  cut: AnatomicalCut, options: CoupledTrajectoryOptions,
): CoupledTrajectoryResult {
  const halfThicknessMm = Number((clampVal(options.thicknessMm ?? cut.typicalThicknessMm, 8, 140) * 0.5).toFixed(2));
  const initialTempC = clampVal(options.initialTempC ?? 10, 0, 45);
  const targetCoreTempC = clampVal(options.targetCoreTempC ?? cut.targetCoreTempC.ideal, 35, 98);
  const restMinutes = clampVal(options.restMinutes ?? 10, 0, 30);
  const spec = boundarySpecForMethod(options.method, targetCoreTempC, halfThicknessMm);
  const pullCoreTempC = Math.max(initialTempC + 2, targetCoreTempC - spec.pullOffsetC);
  const dx = (halfThicknessMm / 1000) / (SLAB_NODES - 1);
  const props = thermophysicalForCut(cut);

  const state: SimState = {
    temps: new Array<number>(SLAB_NODES).fill(initialTempC),
    peakNodeTemps: new Array<number>(SLAB_NODES).fill(initialTempC),
    remainingCollagenFrac: 1, surfaceWaterKgM2: spec.initialSurfaceWaterKgM2,
    elapsedSec: 0, maillardOnsetMin: null, stallSec: 0, stallTempWeightedSum: 0,
  };
  const cookMinutes = runCookStages(cut, state, props, dx, spec, {
    pullCoreTempC, holdMinutes: clampVal(options.holdMinutes ?? 0, 0, 480),
  });
  const rest = runRestStage(cut, state, props, dx, spec, {
    restMinutes, ambientTempC: options.ambientTempC ?? 22,
  });

  return finalizeTrajectoryResult(cut, options.method, spec, state, {
    halfThicknessMm, targetCoreTempC, pullCoreTempC, cookMinutes, restMinutes, ...rest,
  });
}

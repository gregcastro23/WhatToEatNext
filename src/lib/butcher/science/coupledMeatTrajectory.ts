import type { AnatomicalCut } from "@/lib/butcher/types";
import { boneAnatomyForCut, columnBoneSpec, defaultBoneInForCut } from "./boneAnatomy";
import { effectivePrep, shiftWaterMass, surfaceWaterFactorFor, type PrepProfile } from "./prepModifiers";
import { buildSlabColumn, coldestMeatNode, type SlabColumn } from "./slabColumn";
import { clampVal, stepLayeredSlab, thermophysicalForProximate } from "./slabDiffusion";
import { thermalSpecForCut } from "./thermalProfiles";
import { MAILLARD_TEMP_C, buildSurfaceSummary, computeColumnBands, moistureRetentionPct } from "./trajectoryBands";
import { boundarySpecForMethod, computeSurfaceEvaporation, type MethodBoundarySpec } from "./trajectoryMethods";
import type { CoupledTrajectoryOptions, CoupledTrajectoryResult } from "./trajectoryTypes";

export { TRAJECTORY_METHODS, defaultTrajectoryMethodForCut, type TrajectoryMethodId } from "./trajectoryMethods";
export type { CoupledTrajectoryOptions, CoupledTrajectoryResult, TrajectoryFaceBand } from "./trajectoryTypes";

/**
 * 1D transient heat, two-face surface evaporation, Maillard onset, per-face
 * gray-band depth, and time-integrated collagen hydrolysis on a one-sided,
 * full-thickness layered column (fat cap · lean · bone).
 *
 * @file src/lib/butcher/science/coupledMeatTrajectory.ts
 */

/** Nodes per lean half-thickness; sets the column's maximum segment size. */
const SLAB_NODES = 15;
const REST_DRY_WATER_KGM2 = 0.7;
const REST_CONV_RAD_H_WM2K = 22;
const REST_EVAP_H_WM2K = 42;
const REST_EVAP_SCALE = 1.5;

interface SimState {
  readonly temps: number[];
  readonly peakNodeTemps: number[];
  remainingCollagenFrac: number;
  waterA: number;
  waterB: number;
  elapsedSec: number;
  maillardOnsetMin: number | null;
  stallSec: number;
  stallTempWeightedSum: number;
  /** Frozen thermal-centre node once the meat leaves the heat. */
  probe: number | null;
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

interface SimContext {
  readonly cut: AnatomicalCut;
  readonly column: SlabColumn;
  readonly state: SimState;
}

function probeIndex(ctx: SimContext): number {
  return ctx.state.probe ?? coldestMeatNode(ctx.column, ctx.state.temps);
}

function probeTemp(ctx: SimContext): number {
  return ctx.state.temps[probeIndex(ctx)] ?? 10;
}

function updateCoreCollagen(ctx: SimContext, dtSec: number): void {
  const coreTemp = probeTemp(ctx);
  const thermalSpec = thermalSpecForCut(ctx.cut);
  if (coreTemp < thermalSpec.gelatinOnsetC) return;
  const delta = Math.min(coreTemp, thermalSpec.gelatinCapC) - thermalSpec.gelatinOnsetC;
  const kGel = thermalSpec.gelatinRateA * Math.exp(thermalSpec.gelatinRateK * delta);
  ctx.state.remainingCollagenFrac *= Math.exp(-kGel * (dtSec / 60));
}

interface FaceSample {
  readonly tempC: number;
  readonly moistureFrac: number;
  readonly qEvapWm2: number;
}

function recordSurfaceEvents(ctx: SimContext, samples: readonly FaceSample[], cfg: StepConfig): void {
  const { state } = ctx;
  if (!cfg.trackEvents || cfg.wetMedium || samples.length === 0) return;
  if (state.maillardOnsetMin === null && samples.some((s) => s.tempC >= MAILLARD_TEMP_C && s.moistureFrac <= 0.15)) {
    state.maillardOnsetMin = Number((state.elapsedSec / 60).toFixed(2));
  }
  const mean = (pick: (s: FaceSample) => number): number => samples.reduce((acc, s) => acc + pick(s), 0) / samples.length;
  const surfaceTemp = mean((s) => s.tempC);
  if (mean((s) => s.moistureFrac) > 0.05 && mean((s) => s.qEvapWm2) > 120 && surfaceTemp >= 64 && surfaceTemp <= 78) {
    state.stallSec += cfg.dtSec;
    state.stallTempWeightedSum += surfaceTemp * cfg.dtSec;
  }
}

function faceEvaporation(tempC: number, water: number, cfg: StepConfig): { qEvapWm2: number; waterRemovedKgM2: number } {
  if (cfg.wetMedium) return { qEvapWm2: 0, waterRemovedKgM2: 0 };
  return computeSurfaceEvaporation({
    surfaceTempC: tempC, hWm2K: cfg.evapHWm2K ?? cfg.hWm2K, surfaceWaterKgM2: water,
    initialWaterKgM2: cfg.initialWaterKgM2, evapScale: cfg.evapScale, dtSec: cfg.dtSec,
  });
}

function advanceTrajectoryStep(ctx: SimContext, cfg: StepConfig): void {
  const { state, column } = ctx;
  const last = state.temps.length - 1;
  const tA = state.temps[0] ?? 10;
  const tB = state.temps[last] ?? 10;
  const evapA = faceEvaporation(tA, state.waterA, cfg);
  const evapB = faceEvaporation(tB, state.waterB, cfg);
  state.waterA = Math.max(0, state.waterA - evapA.waterRemovedKgM2);
  state.waterB = Math.max(0, state.waterB - evapB.waterRemovedKgM2);
  stepLayeredSlab({
    temps: state.temps, column, dt: cfg.dtSec, crustConductivityFactor: cfg.crustConductivityFactor,
    faceA: { hWm2K: cfg.hWm2K, tMediumC: cfg.mediumC, qEvapWm2: evapA.qEvapWm2 },
    faceB: { hWm2K: cfg.hWm2K, tMediumC: cfg.mediumC, qEvapWm2: evapB.qEvapWm2 },
  });
  state.elapsedSec += cfg.dtSec;
  state.temps.forEach((t, i) => {
    if (t > (state.peakNodeTemps[i] ?? -Infinity)) state.peakNodeTemps[i] = t;
  });
  updateCoreCollagen(ctx, cfg.dtSec);

  const frac = (w: number): number => (cfg.initialWaterKgM2 > 0 ? w / cfg.initialWaterKgM2 : 0);
  const samples: FaceSample[] = [];
  if (column.faceAKind !== "bone") samples.push({ tempC: state.temps[0] ?? 10, moistureFrac: frac(state.waterA), qEvapWm2: evapA.qEvapWm2 });
  if (column.faceBKind !== "bone") samples.push({ tempC: state.temps[last] ?? 10, moistureFrac: frac(state.waterB), qEvapWm2: evapB.qEvapWm2 });
  recordSurfaceEvents(ctx, samples, cfg);
}

function hottestSurface(state: SimState): number {
  return Math.max(state.temps[0] ?? 0, state.temps[state.temps.length - 1] ?? 0);
}

function runCookStages(
  ctx: SimContext, spec: MethodBoundarySpec,
  cfg: { readonly pullCoreTempC: number; readonly holdMinutes: number; readonly initialWaterKgM2: number },
): number {
  const { state } = ctx;
  const base = { initialWaterKgM2: cfg.initialWaterKgM2, crustConductivityFactor: spec.crustConductivityFactor, trackEvents: true };
  const initialSearSteps = Math.round(spec.initialSearMaxSec / 2);
  for (let s = 0; s < initialSearSteps && probeTemp(ctx) < cfg.pullCoreTempC; s += 1) {
    advanceTrajectoryStep(ctx, { ...base, dtSec: 2, mediumC: spec.initialSearMediumC, hWm2K: spec.initialSearHWm2K, wetMedium: false, evapScale: spec.evapScale });
    if (hottestSurface(state) >= spec.initialSearStopSurfaceC) break;
  }
  const maxCookSteps = Math.round((spec.maxCookMin * 60) / spec.dtSec);
  for (let s = 0; s < maxCookSteps && probeTemp(ctx) < cfg.pullCoreTempC; s += 1) {
    advanceTrajectoryStep(ctx, { ...base, dtSec: spec.dtSec, mediumC: spec.mediumC, hWm2K: spec.hWm2K, wetMedium: spec.wetMedium, evapScale: spec.evapScale });
  }
  if (spec.dryBeforeFinish) {
    state.waterA = 0;
    state.waterB = 0;
  }
  for (let s = 0; s < Math.round(spec.finishSec / 2); s += 1) {
    advanceTrajectoryStep(ctx, { ...base, dtSec: 2, mediumC: spec.finishMediumC, hWm2K: spec.finishHWm2K, wetMedium: false, evapScale: 1.0 });
  }
  const holdSteps = spec.supportsHold ? Math.round((cfg.holdMinutes * 60) / spec.dtSec) : 0;
  const holdTempC = Math.min(99, Math.max(cfg.pullCoreTempC, spec.wetMedium ? spec.mediumC : cfg.pullCoreTempC + 0.5));
  for (let s = 0; s < holdSteps; s += 1) {
    advanceTrajectoryStep(ctx, {
      ...base, dtSec: spec.dtSec, mediumC: holdTempC, hWm2K: spec.hWm2K, wetMedium: spec.wetMedium,
      evapScale: spec.evapScale, crustConductivityFactor: 1.0, trackEvents: false,
    });
  }
  return Number((state.elapsedSec / 60).toFixed(1));
}

function runRestStage(
  ctx: SimContext, spec: MethodBoundarySpec, cfg: { readonly restMinutes: number; readonly ambientTempC: number },
): { readonly removedCoreTempC: number; readonly carryoverPeakC: number; readonly restGelatinGainPct: number } {
  const { state } = ctx;
  state.probe = coldestMeatNode(ctx.column, state.temps);
  const gelatinBeforeRest = (1 - state.remainingCollagenFrac) * 100;
  const removedCoreTempC = probeTemp(ctx);
  let carryoverPeakC = removedCoreTempC;
  if (!spec.wetMedium) {
    state.waterA = REST_DRY_WATER_KGM2;
    state.waterB = REST_DRY_WATER_KGM2;
  }
  for (let s = 0; s < Math.round((cfg.restMinutes * 60) / 5); s += 1) {
    advanceTrajectoryStep(ctx, {
      dtSec: 5, mediumC: cfg.ambientTempC, hWm2K: spec.wetMedium ? 10 : REST_CONV_RAD_H_WM2K,
      wetMedium: spec.wetMedium, initialWaterKgM2: REST_DRY_WATER_KGM2,
      evapScale: spec.wetMedium ? 0 : REST_EVAP_SCALE, evapHWm2K: REST_EVAP_H_WM2K,
      crustConductivityFactor: 1.0, trackEvents: false,
    });
    carryoverPeakC = Math.max(carryoverPeakC, probeTemp(ctx));
  }
  const gelatinAfterRest = (1 - state.remainingCollagenFrac) * 100;
  return { removedCoreTempC, carryoverPeakC, restGelatinGainPct: Number(Math.max(0, gelatinAfterRest - gelatinBeforeRest).toFixed(1)) };
}

function prepSummary(prep: PrepProfile, surfaceWaterFactor: number): CoupledTrajectoryResult["prep"] {
  return {
    prep: prep.id, label: prep.label, surfaceWaterFactor: Number(surfaceWaterFactor.toFixed(3)), waterMassChangeG: prep.waterMassChangeG,
    cookLossReductionFrac: prep.cookLossReductionFrac, toughnessReductionFrac: prep.toughnessReductionFrac,
  };
}

interface Setup {
  readonly halfThicknessMm: number;
  readonly targetCoreTempC: number;
  readonly pullCoreTempC: number;
  readonly restMinutes: number;
  readonly spec: MethodBoundarySpec;
  readonly prep: PrepProfile;
  readonly boneIn: boolean;
  readonly column: SlabColumn;
  readonly proximate: AnatomicalCut["proximate"];
  readonly surfaceWaterFactor: number;
  readonly initialTempC: number;
}

function setupTrajectory(cut: AnatomicalCut, options: CoupledTrajectoryOptions): Setup {
  const halfThicknessMm = Number((clampVal(options.thicknessMm ?? cut.typicalThicknessMm, 8, 140) * 0.5).toFixed(2));
  const initialTempC = clampVal(options.initialTempC ?? 10, 0, 45);
  const targetCoreTempC = clampVal(options.targetCoreTempC ?? cut.targetCoreTempC.ideal, 35, 98);
  const spec = boundarySpecForMethod(options.method, targetCoreTempC, halfThicknessMm);
  const prep = effectivePrep(options.prep, cut);
  const boneIn = (options.boneIn ?? defaultBoneInForCut(cut)) && cut.geometry3d.hasBone;
  const proximate = shiftWaterMass(cut.proximate, prep.waterMassChangeG);
  const props = thermophysicalForProximate(proximate);
  const column = buildSlabColumn({
    meatThicknessMm: halfThicknessMm * 2, maxSegmentMm: halfThicknessMm / (SLAB_NODES - 1),
    lean: { kWmK: props.conductivityWmK, rhoCJm3K: props.densityKgM3 * props.specificHeatJkgK },
    fatCapMm: clampVal(options.fatCapMm ?? 0, 0, 15),
    bone: boneIn ? columnBoneSpec(boneAnatomyForCut(cut)) : null,
  });
  return {
    halfThicknessMm, targetCoreTempC, pullCoreTempC: Math.max(initialTempC + 2, targetCoreTempC - spec.pullOffsetC),
    restMinutes: clampVal(options.restMinutes ?? 10, 0, 30), spec, prep, boneIn, column, proximate, initialTempC,
    surfaceWaterFactor: surfaceWaterFactorFor(prep, cut.proximate, proximate),
  };
}

export function simulateCoupledCutTrajectory(cut: AnatomicalCut, options: CoupledTrajectoryOptions): CoupledTrajectoryResult {
  const s = setupTrajectory(cut, options);
  const n = s.column.positionsM.length;
  const initialWaterKgM2 = s.spec.initialSurfaceWaterKgM2 * s.surfaceWaterFactor;
  const state: SimState = {
    temps: new Array<number>(n).fill(s.initialTempC), peakNodeTemps: new Array<number>(n).fill(s.initialTempC),
    remainingCollagenFrac: 1, waterA: initialWaterKgM2, waterB: initialWaterKgM2,
    elapsedSec: 0, maillardOnsetMin: null, stallSec: 0, stallTempWeightedSum: 0, probe: null,
  };
  const ctx: SimContext = { cut, column: s.column, state };
  const cookMinutes = runCookStages(ctx, s.spec, {
    pullCoreTempC: s.pullCoreTempC, holdMinutes: clampVal(options.holdMinutes ?? 0, 0, 480), initialWaterKgM2,
  });
  const rest = runRestStage(ctx, s.spec, { restMinutes: s.restMinutes, ambientTempC: options.ambientTempC ?? 22 });
  return finalizeTrajectory(cut, options, s, state, { cookMinutes, ...rest });
}

function finalizeTrajectory(
  cut: AnatomicalCut, options: CoupledTrajectoryOptions, s: Setup, state: SimState,
  timing: { readonly cookMinutes: number; readonly removedCoreTempC: number; readonly carryoverPeakC: number; readonly restGelatinGainPct: number },
): CoupledTrajectoryResult {
  const probe = state.probe ?? s.column.meatSurfaceA;
  const gelatinConversionPct = Number(((1 - state.remainingCollagenFrac) * 100).toFixed(1));
  const bands = computeColumnBands(cut, s.column, state.peakNodeTemps, { wetMedium: s.spec.wetMedium, targetCoreTempC: s.targetCoreTempC, probe });
  const stallDurationMin = Number((state.stallSec / 60).toFixed(1));
  const stallPlateauTempC = state.stallSec > 0 ? Number((state.stallTempWeightedSum / state.stallSec).toFixed(1)) : null;
  const anatomy = boneAnatomyForCut(cut);
  const surfaceNode = s.column.faceAKind !== "lean" && s.column.faceBKind === "lean" ? state.temps.length - 1 : 0;
  return {
    method: options.method, halfThicknessMm: s.halfThicknessMm, cookMinutes: timing.cookMinutes, restMinutes: s.restMinutes,
    targetCoreTempC: s.targetCoreTempC, pullCoreTempC: s.pullCoreTempC,
    removedCoreTempC: Number(timing.removedCoreTempC.toFixed(1)),
    carryoverPeakC: Number(timing.carryoverPeakC.toFixed(1)),
    carryoverRiseC: Number(Math.max(0, timing.carryoverPeakC - timing.removedCoreTempC).toFixed(1)),
    finalSurfaceTempC: Number((state.temps[surfaceNode] ?? 10).toFixed(1)),
    peakSurfaceTempC: Number(Math.max(state.peakNodeTemps[0] ?? 10, state.peakNodeTemps[state.peakNodeTemps.length - 1] ?? 10).toFixed(1)),
    peakNodeTempsC: state.peakNodeTemps.map((t) => Number(t.toFixed(1))),
    nodePositionsMm: s.column.positionsM.map((x) => Number((x * 1000).toFixed(3))),
    grayBandMm: bands.grayBandMm, grayBandPct: Number(((bands.grayBandMm / s.halfThicknessMm) * 100).toFixed(0)),
    crustDepthMm: bands.crustDepthMm, idealCoreMm: bands.idealCoreMm, faces: bands.faces,
    column: {
      meatThicknessMm: s.column.meatThicknessMm, fatCapMm: s.column.fatCapModelMm, boneMm: s.column.boneModelMm,
      boneIn: s.boneIn, bonePlacement: s.boneIn ? (anatomy?.placement ?? null) : null,
      boneNeeds3d: s.boneIn && anatomy?.placement === "through",
      thermalCentreFromAMm: Number(Math.abs(((s.column.positionsM[probe] ?? 0) - (s.column.positionsM[s.column.meatSurfaceA] ?? 0)) * 1000).toFixed(2)),
    },
    prep: prepSummary(s.prep, s.surfaceWaterFactor),
    maillardOnsetMin: state.maillardOnsetMin, stallDurationMin, stallPlateauTempC, gelatinConversionPct,
    restGelatinGainPct: timing.restGelatinGainPct,
    moistureRetentionPct: moistureRetentionPct(cut, s.proximate, s.column, state.peakNodeTemps, gelatinConversionPct, s.prep),
    surfaceEventSummary: buildSurfaceSummary(s.spec.wetMedium, state.maillardOnsetMin, stallDurationMin, stallPlateauTempC),
  };
}

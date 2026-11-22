import type { AnatomicalCut } from "@/lib/butcher/types";
import { createTsVoxelEngine, type VoxelEngineLike, type VoxelGridSpec, type VoxelRuntime } from "@/lib/cooking/voxelConduction";
import { createVoxelEngine } from "@/lib/wasm/voxelEngineLoader";
import { VOXEL_LEAN, buildBoneVoxelLayout, type BoneVoxelLayout } from "./boneVoxelGeometry";
import { cellIndex, columnGrayBandMm, readoutColumns, sliceOf, type ReadoutColumns } from "./boneVoxelReadout";
import { clampVal } from "./slabDiffusion";
import {
  PAN_AIR_SIDE_C,
  PAN_AIR_SIDE_H_WM2K,
  boundarySpecForMethod,
  grayBandThresholdForCut,
  type MethodBoundarySpec,
  type TrajectoryMethodId,
} from "./trajectoryMethods";
import type { BoneColumnReadout, BoneConduction3dInput, BoneConduction3dResult } from "./boneConduction3dTypes";

export type { BoneColumnReadout, BoneConduction3dInput, BoneConduction3dResult } from "./boneConduction3dTypes";

/**
 * 3D voxel conduction for bone-in steaks and chops whose bone runs through the
 * thickness. Stages mirror the 1D trajectory (initial sear → main cook until
 * the probe reaches the pull temperature → finishing sear → hold → rest).
 *
 * The bone's effect is measured against a COUNTERFACTUAL: the same block with
 * every bone cell made lean, run on the bone-in run's exact step log — same
 * faces, same dt, same step counts — so the only difference is the bone.
 * Conduction only (no evaporation or crust).
 *
 * @file src/lib/butcher/science/boneConduction3d.ts
 */

export type VoxelEngineFactory = (spec: VoxelGridSpec) => VoxelEngineLike;

const DT_SAFETY = 0.9;

type Faces = readonly number[];

/** `[h, medium] × 6` (x−, x+, y−, y+, z−, z+): cooking faces y±; sides either the same medium or pan-side air. */
function faces(medium: number, h: number, lateral: "same" | "pan-air"): Faces {
  const side = lateral === "same" ? [h, medium] : [PAN_AIR_SIDE_H_WM2K, PAN_AIR_SIDE_C];
  return [...side, ...side, h, medium, h, medium, ...side, ...side];
}

export interface StepRecord {
  readonly faces: Faces;
  readonly dt: number;
  readonly n: number;
}

/** Shared explicit step for a face set: stable on BOTH grids, so the counterfactual can replay it unchanged. */
type DtFor = (f: Faces) => number;

function sharedDt(a: VoxelEngineLike, b: VoxelEngineLike): DtFor {
  return (f) => {
    a.setFaces(f);
    b.setFaces(f);
    return DT_SAFETY * Math.min(a.stableDt(), b.stableDt());
  };
}

/** Runs one stage step by step until `done()` or exactly `maxS` (the last step is shortened to land on it). */
function runStage(engine: VoxelEngineLike, dtFor: DtFor, log: StepRecord[], stage: { readonly faces: Faces; readonly maxS: number; readonly done: () => boolean }): void {
  const dt = dtFor(stage.faces);
  engine.setFaces(stage.faces);
  let spent = 0;
  let full = 0;
  while (spent < stage.maxS - 1e-9 && !stage.done()) {
    const step = Math.min(dt, stage.maxS - spent);
    engine.step(step, 1);
    spent += step;
    if (step === dt) {
      full += 1;
    } else {
      if (full > 0) log.push({ faces: stage.faces, dt, n: full });
      log.push({ faces: stage.faces, dt: step, n: 1 });
      full = 0;
    }
  }
  if (full > 0) log.push({ faces: stage.faces, dt, n: full });
}

interface CookPlan {
  readonly method: TrajectoryMethodId;
  readonly probeIdx: number;
  readonly pullC: number;
  readonly holdS: number;
}

function cookStages(engine: VoxelEngineLike, spec: MethodBoundarySpec, plan: CookPlan, dtFor: DtFor): StepRecord[] {
  const log: StepRecord[] = [];
  const reached = (): boolean => engine.tempAt(plan.probeIdx) >= plan.pullC;
  if (spec.initialSearMaxSec > 0) {
    runStage(engine, dtFor, log, {
      faces: faces(spec.initialSearMediumC, spec.initialSearHWm2K, "pan-air"), maxS: spec.initialSearMaxSec,
      done: () => reached() || engine.maxTempWhere(VOXEL_LEAN) >= spec.initialSearStopSurfaceC,
    });
  }
  runStage(engine, dtFor, log, { faces: faces(spec.mediumC, spec.hWm2K, plan.method === "searing" ? "pan-air" : "same"), maxS: spec.maxCookMin * 60, done: reached });
  if (spec.finishSec > 0) runStage(engine, dtFor, log, { faces: faces(spec.finishMediumC, spec.finishHWm2K, "pan-air"), maxS: spec.finishSec, done: () => false });
  if (spec.supportsHold && plan.holdS > 0) {
    const holdC = Math.min(99, Math.max(plan.pullC, spec.wetMedium ? spec.mediumC : plan.pullC + 0.5));
    runStage(engine, dtFor, log, { faces: faces(holdC, spec.hWm2K, "same"), maxS: plan.holdS, done: () => false });
  }
  return log;
}

function replay(engine: VoxelEngineLike, log: readonly StepRecord[]): void {
  for (const rec of log) {
    engine.setFaces(rec.faces);
    engine.step(rec.dt, rec.n);
  }
}

interface RunOutcome {
  readonly removal: Float64Array;
  readonly peaks: Float64Array;
  /** Peak during the rest at each watched cell (starting from its removal value). */
  readonly restPeaks: readonly number[];
}

/** Captures removal temperatures, then rests on the shared rest schedule while tracking the watched cells. */
function restAndCapture(engine: VoxelEngineLike, rest: { readonly faces: Faces; readonly dt: number; readonly steps: number }, watch: readonly number[]): RunOutcome {
  const removal = engine.temps();
  const restPeaks = watch.map((i) => engine.tempAt(i));
  engine.setFaces(rest.faces);
  for (let s = 0; s < rest.steps; s += 1) {
    engine.step(rest.dt, 1);
    watch.forEach((i, n) => {
      restPeaks[n] = Math.max(restPeaks[n] ?? -Infinity, engine.tempAt(i));
    });
  }
  return { removal, peaks: engine.peaks(), restPeaks };
}

export function withoutBone(spec: VoxelGridSpec): VoxelGridSpec {
  return { ...spec, material: Array.from(spec.material, () => VOXEL_LEAN) };
}

const BASIS: readonly string[] = [
  "Conduction only (explicit finite volumes; Rust core with a bit-identical TypeScript twin): no surface evaporation or crust, so surface temperatures run hotter than the 1D column above.",
  "Bone effect = the meat beside the bone vs the SAME cell in a counterfactual block whose bone is lean, replayed on the bone-in run's exact step log.",
  "The thermal-centre column is the probe that ends the cook (middle of the bone's larger meat side); it is a doneness reference, not a bone comparison.",
  "Lean: Choi & Okos (1986) from the cut's USDA proximate. Cortical bone and yellow marrow: IT'IS tissue averages (human tissue). Bone size and position: anatomical model estimates; footprint 1.5 : 1 (assumption).",
  "Pan methods expose the sides and ends to 25 °C air (h 12 W/m²K); oven, smoke and liquid methods heat every face. The initial-sear stop is tested at the hottest lean cell centre.",
];

interface SimSetup {
  readonly layout: BoneVoxelLayout;
  readonly cols: ReadoutColumns;
  readonly spec: MethodBoundarySpec;
  readonly targetC: number;
  readonly initialC: number;
  readonly plan: CookPlan;
  readonly watch: readonly number[];
}

function setup(input: BoneConduction3dInput): SimSetup | null {
  const thicknessMm = clampVal(input.thicknessMm ?? input.cut.typicalThicknessMm, 8, 140);
  const layout = buildBoneVoxelLayout(input.cut, thicknessMm);
  if (!layout) return null;
  const targetC = clampVal(input.targetCoreTempC ?? input.cut.targetCoreTempC.ideal, 35, 98);
  const initialC = clampVal(input.initialTempC ?? 10, 0, 45);
  const spec = boundarySpecForMethod(input.method, targetC, thicknessMm / 2);
  const cols = readoutColumns(layout);
  const core = (i: number): number => cellIndex(layout.spec, i, cols.jMid, cols.kMid);
  const plan: CookPlan = {
    method: input.method, probeIdx: core(cols.probeI), pullC: Math.max(initialC + 2, targetC - spec.pullOffsetC),
    holdS: clampVal(input.holdMinutes ?? 0, 0, 480) * 60,
  };
  return { layout, cols, spec, targetC, initialC, plan, watch: [core(cols.adjacentI), core(cols.probeI)] };
}

/** Core simulation with an injected engine factory, called twice: bone-in first, then the boneless counterfactual. */
export function simulateBoneConduction3dWith(factory: VoxelEngineFactory, runtime: VoxelRuntime, input: BoneConduction3dInput): BoneConduction3dResult | null {
  const s = setup(input);
  if (!s) return null;
  const boneEngine = factory({ ...s.layout.spec, initialC: s.initialC });
  const leanEngine = factory({ ...withoutBone(s.layout.spec), initialC: s.initialC });
  try {
    const dtFor = sharedDt(boneEngine, leanEngine);
    const log = cookStages(boneEngine, s.spec, s.plan, dtFor);
    replay(leanEngine, log);
    const restFaces = faces(input.ambientTempC ?? 22, s.spec.wetMedium ? 10 : 22, "same");
    const restDt = dtFor(restFaces);
    const rest = { faces: restFaces, dt: restDt, steps: Math.ceil((clampVal(input.restMinutes ?? 10, 0, 30) * 60) / restDt - 1e-9) };
    const boneIn = restAndCapture(boneEngine, rest, s.watch);
    const boneless = restAndCapture(leanEngine, rest, s.watch);
    const cookS = log.reduce((acc, r) => acc + r.dt * r.n, 0);
    return assembleResult(s, input.cut, { runtime, cookS, boneIn, boneless });
  } finally {
    boneEngine.free();
    leanEngine.free();
  }
}

function assembleResult(
  s: SimSetup, cut: AnatomicalCut,
  run: { readonly runtime: VoxelRuntime; readonly cookS: number; readonly boneIn: RunOutcome; readonly boneless: RunOutcome },
): BoneConduction3dResult {
  const { layout, cols } = s;
  const grayC = grayBandThresholdForCut(cut, s.targetC);
  const [adjIdx = 0, probeIdx = 0] = s.watch;
  const column = (o: RunOutcome, i: number, cellIdx: number, slot: number, mm: number): BoneColumnReadout => {
    const removed = o.removal[cellIdx] ?? 0;
    const peak = o.restPeaks[slot] ?? removed;
    return {
      distanceFromBoneMm: Number(mm.toFixed(1)), coreAtRemovalC: Number(removed.toFixed(1)),
      carryoverPeakC: Number(peak.toFixed(1)), carryoverRiseC: Number(Math.max(0, peak - removed).toFixed(1)),
      grayBandMm: columnGrayBandMm(layout, o.peaks, i, cols.kMid, grayC),
    };
  };
  const { nx, ny, nz } = layout.spec;
  return {
    runtime: run.runtime,
    grid: { nx, ny, nz, dxMm: layout.dxMm, dyMm: Number(layout.dyMm.toFixed(3)), dzMm: Number(layout.dzMm.toFixed(3)), widthMm: layout.widthMm, lengthMm: Number(layout.lengthMm.toFixed(1)) },
    cookMinutes: Number((run.cookS / 60).toFixed(1)), targetCoreTempC: s.targetC, pullCoreTempC: Number(s.plan.pullC.toFixed(1)),
    boneAdjacent: column(run.boneIn, cols.adjacentI, adjIdx, 0, cols.adjacentMm),
    boneAdjacentBoneless: column(run.boneless, cols.adjacentI, adjIdx, 0, cols.adjacentMm),
    thermalCentre: column(run.boneIn, cols.probeI, probeIdx, 1, cols.probeMm),
    boneEffectAtRemovalC: Number(((run.boneless.removal[adjIdx] ?? 0) - (run.boneIn.removal[adjIdx] ?? 0)).toFixed(2)),
    slice: {
      nx, ny,
      material: Array.from({ length: nx * ny }, (_, c) => Number(layout.spec.material[cellIndex(layout.spec, c % nx, Math.floor(c / nx), cols.kMid)] ?? 0)),
      removalTemps: sliceOf(layout, run.boneIn.removal, cols.kMid),
      peakTemps: sliceOf(layout, run.boneIn.peaks, cols.kMid),
    },
    basis: BASIS,
  };
}

/** Browser entry: Rust/WASM engines when they load, else the TypeScript twin; `runtime` names what ran both grids. */
export async function simulateBoneConduction3d(input: BoneConduction3dInput, options?: { readonly forceTypescript?: boolean }): Promise<BoneConduction3dResult | null> {
  const s = setup(input);
  if (!s) return null;
  if (options?.forceTypescript === true) return simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", input);
  const created = [
    await createVoxelEngine({ ...s.layout.spec, initialC: s.initialC }),
    await createVoxelEngine({ ...withoutBone(s.layout.spec), initialC: s.initialC }),
  ];
  if (created.some((c) => c.runtime !== "rust-wasm")) {
    for (const c of created) c.engine.free();
    return simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", input);
  }
  const queue = created.map((c) => c.engine);
  try {
    return simulateBoneConduction3dWith((spec) => queue.shift() ?? createTsVoxelEngine(spec), "rust-wasm", input);
  } finally {
    for (const e of queue) e.free();
  }
}

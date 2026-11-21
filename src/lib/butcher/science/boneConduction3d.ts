import type { AnatomicalCut } from "@/lib/butcher/types";
import { createTsVoxelEngine, type VoxelEngineLike, type VoxelGridSpec, type VoxelRuntime } from "@/lib/cooking/voxelConduction";
import { createVoxelEngine } from "@/lib/wasm/voxelEngineLoader";
import { VOXEL_LEAN, buildBoneVoxelLayout, type BoneVoxelLayout } from "./boneVoxelGeometry";
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

/**
 * 3D voxel conduction for bone-in steaks and chops whose bone runs through the
 * thickness (porterhouse, T-bone, bone-in ribeye, chops, crosscut shank, 7-bone
 * chuck). Stages mirror the 1D trajectory (initial sear → main cook until the
 * thermal centre reaches the pull temperature → finishing sear → rest), on the
 * Rust/TypeScript voxel engine. CONDUCTION ONLY: no evaporation or crust, so
 * absolute surface temperatures run hot; read the bone-adjacent column against
 * the away-from-bone column of the SAME model.
 *
 * @file src/lib/butcher/science/boneConduction3d.ts
 */

export type { BoneColumnReadout, BoneConduction3dInput, BoneConduction3dResult } from "./boneConduction3dTypes";

export type VoxelEngineFactory = (spec: VoxelGridSpec) => VoxelEngineLike;

const PROBE_INTERVAL_S = 30;
const DT_SAFETY = 0.9;

type Faces = readonly number[];

/** `[h, medium] × 6` (x−, x+, y−, y+, z−, z+): cooking faces y±, lateral faces either the same medium or pan-side air. */
function faces(medium: number, h: number, lateral: "same" | "pan-air"): Faces {
  const side = lateral === "same" ? [h, medium] : [PAN_AIR_SIDE_H_WM2K, PAN_AIR_SIDE_C];
  return [...side, ...side, h, medium, h, medium, ...side, ...side];
}

interface Columns {
  readonly kMid: number;
  readonly adjacentI: number;
  readonly awayI: number;
  readonly adjacentMm: number;
  readonly awayMm: number;
}

/** Bone-adjacent = first lean column beside the bone on its larger side; away = middle of that side. */
function readoutColumns(layout: BoneVoxelLayout): Columns {
  const { nx, nz } = layout.spec;
  const { dxMm } = layout;
  const [b0, b1] = layout.boneXMm;
  const leftMm = b0;
  const rightMm = nx * dxMm - b1;
  const useRight = rightMm >= leftMm;
  const adjacentX = useRight ? b1 + dxMm / 2 : b0 - dxMm / 2;
  const awayX = useRight ? b1 + rightMm / 2 : b0 - leftMm / 2;
  const col = (x: number): number => clampVal(Math.floor(x / dxMm), 0, nx - 1);
  const centre = (i: number): number => (i + 0.5) * dxMm;
  const adjacentI = col(adjacentX);
  const awayI = col(awayX);
  const dist = (i: number): number => Math.abs(centre(i) - (useRight ? b1 : b0));
  return { kMid: Math.floor(nz / 2), adjacentI, awayI, adjacentMm: dist(adjacentI), awayMm: dist(awayI) };
}

function cellIndex(spec: VoxelGridSpec, i: number, j: number, k: number): number {
  return i + spec.nx * (j + spec.ny * k);
}

/** Depth from the y− face (and, mirrored, the y+ face) over which `peaks` stayed ≥ threshold, mean of both, mm. */
function columnGrayBandMm(layout: BoneVoxelLayout, peaks: Float64Array, i: number, k: number, thresholdC: number): number {
  const { ny } = layout.spec;
  const depthFrom = (step: 1 | -1): number => {
    const at = (n: number): number => peaks[cellIndex(layout.spec, i, step === 1 ? n : ny - 1 - n, k)] ?? 0;
    if (at(0) < thresholdC) return 0;
    for (let n = 1; n < ny; n += 1) {
      if (at(n) < thresholdC) {
        const frac = clampVal((at(n - 1) - thresholdC) / Math.max(1e-6, at(n - 1) - at(n)), 0, 1);
        return (n - 0.5 + frac) * layout.dyMm;
      }
    }
    return layout.thicknessMm;
  };
  return Number(((depthFrom(1) + depthFrom(-1)) / 2).toFixed(2));
}

interface Stage {
  readonly faces: Faces;
  readonly seconds: number;
}

/** Runs one stage until `done()` or `maxS`, probing every ~30 s; returns the seconds actually spent. */
function runStage(engine: VoxelEngineLike, f: Faces, maxS: number, done: () => boolean): number {
  engine.setFaces(f);
  const dt = Math.min(PROBE_INTERVAL_S, DT_SAFETY * engine.stableDt());
  const stepsPerProbe = Math.max(1, Math.floor(PROBE_INTERVAL_S / dt));
  let spent = 0;
  while (spent < maxS - 1e-9 && !done()) {
    const n = Math.max(1, Math.min(stepsPerProbe, Math.ceil((maxS - spent) / dt)));
    engine.step(dt, n);
    spent += n * dt;
  }
  return spent;
}

/** Cooks until the probe (thermal centre of the meat) reaches the pull temperature; returns the schedule it ran. */
function cookStages(engine: VoxelEngineLike, spec: MethodBoundarySpec, method: TrajectoryMethodId, probe: { readonly idx: number; readonly pullC: number; readonly holdS: number }): Stage[] {
  const stages: Stage[] = [];
  const run = (f: Faces, maxS: number, done: () => boolean): void => {
    stages.push({ faces: f, seconds: runStage(engine, f, maxS, done) });
  };
  const reached = (): boolean => engine.tempAt(probe.idx) >= probe.pullC;
  if (spec.initialSearMaxSec > 0) {
    run(faces(spec.initialSearMediumC, spec.initialSearHWm2K, "pan-air"), spec.initialSearMaxSec,
      () => reached() || engine.maxTempWhere(VOXEL_LEAN) >= spec.initialSearStopSurfaceC);
  }
  run(faces(spec.mediumC, spec.hWm2K, method === "searing" ? "pan-air" : "same"), spec.maxCookMin * 60, reached);
  if (spec.finishSec > 0) run(faces(spec.finishMediumC, spec.finishHWm2K, "pan-air"), spec.finishSec, () => false);
  if (spec.supportsHold && probe.holdS > 0) {
    const holdC = Math.min(99, Math.max(probe.pullC, spec.wetMedium ? spec.mediumC : probe.pullC + 0.5));
    run(faces(holdC, spec.hWm2K, "same"), probe.holdS, () => false);
  }
  return stages;
}

/** Replays a recorded schedule exactly (the boneless counterfactual cooks for the same times). */
function replayStages(engine: VoxelEngineLike, stages: readonly Stage[]): void {
  for (const stage of stages) runStage(engine, stage.faces, stage.seconds, () => false);
}

/** Rests at ambient and returns the peak temperature reached at each watched cell (starting from its removal value). */
function restAndTrack(engine: VoxelEngineLike, restFaces: Faces, restS: number, watch: readonly number[]): number[] {
  const peak = watch.map((i) => engine.tempAt(i));
  engine.setFaces(restFaces);
  const dt = Math.min(PROBE_INTERVAL_S, DT_SAFETY * engine.stableDt());
  for (let t = 0; t < restS - 1e-9; t += dt) {
    engine.step(dt, 1);
    watch.forEach((i, n) => {
      peak[n] = Math.max(peak[n] ?? -Infinity, engine.tempAt(i));
    });
  }
  return peak;
}

function sliceOf(layout: BoneVoxelLayout, arr: Float64Array, k: number): number[] {
  const { nx, ny } = layout.spec;
  const out: number[] = [];
  for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) out.push(Number((arr[cellIndex(layout.spec, i, j, k)] ?? 0).toFixed(2)));
  return out;
}

const BASIS: readonly string[] = [
  "Conduction only (explicit finite volumes; Rust core with a bit-identical TypeScript twin): no surface evaporation or crust, so read the columns against each other, not as absolute surface temperatures.",
  "Bone effect = the meat beside the bone vs the SAME spot in a counterfactual block whose bone is lean, cooked on the identical schedule.",
  "Lean: Choi & Okos (1986) properties from the cut's USDA proximate. Cortical bone and yellow marrow: IT'IS tissue database averages (human tissue).",
  "Bone size and position: anatomical model estimates. Footprint: typical portion ÷ (1060 kg/m³ × thickness), 1.5 : 1 length : width (assumption).",
  "Cooking faces follow the 1D method stages; pan methods expose the sides and ends to 25 °C air (h 12 W/m²K); oven, smoke and liquid methods heat every face. The cook stops when the probe column's centre reaches the pull temperature.",
];

interface RunOutcome {
  readonly removal: Float64Array;
  readonly peaks: Float64Array;
  readonly restPeaks: readonly number[];
}

/** Cooks (or replays `schedule`), captures removal temperatures, rests, and returns the field history. */
function cookAndRest(
  engine: VoxelEngineLike, spec: MethodBoundarySpec, input: BoneConduction3dInput,
  plan: { readonly method: TrajectoryMethodId; readonly probeIdx: number; readonly pullC: number; readonly watch: readonly number[]; readonly schedule: readonly Stage[] | null },
): RunOutcome & { readonly schedule: readonly Stage[] } {
  const schedule = plan.schedule ?? cookStages(engine, spec, plan.method, {
    idx: plan.probeIdx, pullC: plan.pullC, holdS: clampVal(input.holdMinutes ?? 0, 0, 480) * 60,
  });
  if (plan.schedule) replayStages(engine, plan.schedule);
  const removal = engine.temps();
  const restFaces = faces(input.ambientTempC ?? 22, spec.wetMedium ? 10 : 22, "same");
  const restPeaks = restAndTrack(engine, restFaces, clampVal(input.restMinutes ?? 10, 0, 30) * 60, plan.watch);
  return { removal, peaks: engine.peaks(), restPeaks, schedule };
}

function withoutBone(spec: VoxelGridSpec): VoxelGridSpec {
  return { ...spec, material: Array.from(spec.material, () => VOXEL_LEAN) };
}

/** Core simulation with an injected engine factory (tests use the TypeScript engine directly). */
export function simulateBoneConduction3dWith(factory: VoxelEngineFactory, runtime: VoxelRuntime, input: BoneConduction3dInput): BoneConduction3dResult | null {
  const { cut, method } = input;
  const thicknessMm = clampVal(input.thicknessMm ?? cut.typicalThicknessMm, 8, 140);
  const layout = buildBoneVoxelLayout(cut, thicknessMm);
  if (!layout) return null;
  const targetC = clampVal(input.targetCoreTempC ?? cut.targetCoreTempC.ideal, 35, 98);
  const initialC = clampVal(input.initialTempC ?? 10, 0, 45);
  const spec = boundarySpecForMethod(method, targetC, thicknessMm / 2);
  const cols = readoutColumns(layout);
  const coreIdx = (i: number): number => cellIndex(layout.spec, i, Math.floor(layout.spec.ny / 2), cols.kMid);
  const plan = { method, probeIdx: coreIdx(cols.awayI), pullC: Math.max(initialC + 2, targetC - spec.pullOffsetC), watch: [coreIdx(cols.adjacentI), coreIdx(cols.awayI)] };
  const runOn = (gridSpec: VoxelGridSpec, schedule: readonly Stage[] | null): ReturnType<typeof cookAndRest> => {
    const engine = factory({ ...gridSpec, initialC });
    try {
      return cookAndRest(engine, spec, input, { ...plan, schedule });
    } finally {
      engine.free();
    }
  };
  const boneIn = runOn(layout.spec, null);
  const boneless = runOn(withoutBone(layout.spec), boneIn.schedule);
  return assembleResult(layout, cols, { cut, targetC, pullC: plan.pullC, runtime, watch: plan.watch, boneIn, boneless });
}

function assembleResult(
  layout: BoneVoxelLayout, cols: Columns,
  ctx: { readonly cut: AnatomicalCut; readonly targetC: number; readonly pullC: number; readonly runtime: VoxelRuntime; readonly watch: readonly number[]; readonly boneIn: RunOutcome & { readonly schedule: readonly Stage[] }; readonly boneless: RunOutcome },
): BoneConduction3dResult {
  const grayC = grayBandThresholdForCut(ctx.cut, ctx.targetC);
  const [adjIdx = 0, awayIdx = 0] = ctx.watch;
  const column = (run: RunOutcome, i: number, cellIdx: number, peakSlot: number, mm: number): BoneColumnReadout => {
    const removed = run.removal[cellIdx] ?? 0;
    const peak = run.restPeaks[peakSlot] ?? removed;
    return {
      distanceFromBoneMm: Number(mm.toFixed(1)), coreAtRemovalC: Number(removed.toFixed(1)),
      carryoverPeakC: Number(peak.toFixed(1)), carryoverRiseC: Number(Math.max(0, peak - removed).toFixed(1)),
      grayBandMm: columnGrayBandMm(layout, run.peaks, i, cols.kMid, grayC),
    };
  };
  const boneAdjacent = column(ctx.boneIn, cols.adjacentI, adjIdx, 0, cols.adjacentMm);
  const boneAdjacentBoneless = column(ctx.boneless, cols.adjacentI, adjIdx, 0, cols.adjacentMm);
  const awayFromBone = column(ctx.boneIn, cols.awayI, awayIdx, 1, cols.awayMm);
  const { nx, ny, nz } = layout.spec;
  const cookS = ctx.boneIn.schedule.reduce((acc, st) => acc + st.seconds, 0);
  return {
    runtime: ctx.runtime,
    grid: { nx, ny, nz, dxMm: layout.dxMm, dyMm: Number(layout.dyMm.toFixed(3)), dzMm: Number(layout.dzMm.toFixed(3)), widthMm: layout.widthMm, lengthMm: Number(layout.lengthMm.toFixed(1)) },
    cookMinutes: Number((cookS / 60).toFixed(1)), pullCoreTempC: Number(ctx.pullC.toFixed(1)),
    boneAdjacent, boneAdjacentBoneless, awayFromBone,
    boneEffectAtRemovalC: Number(((ctx.boneless.removal[adjIdx] ?? 0) - (ctx.boneIn.removal[adjIdx] ?? 0)).toFixed(2)),
    lagAtRemovalC: Number(((ctx.boneIn.removal[awayIdx] ?? 0) - (ctx.boneIn.removal[adjIdx] ?? 0)).toFixed(2)),
    slice: {
      nx, ny,
      material: Array.from({ length: nx * ny }, (_, c) => Number(layout.spec.material[cellIndex(layout.spec, c % nx, Math.floor(c / nx), cols.kMid)] ?? 0)),
      removalTemps: sliceOf(layout, ctx.boneIn.removal, cols.kMid),
      peakTemps: sliceOf(layout, ctx.boneIn.peaks, cols.kMid),
    },
    basis: BASIS,
  };
}

/** Browser entry: Rust/WASM engine when it loads, else the TypeScript twin; `runtime` says which ran. */
export async function simulateBoneConduction3d(input: BoneConduction3dInput, options?: { readonly forceTypescript?: boolean }): Promise<BoneConduction3dResult | null> {
  const layout = buildBoneVoxelLayout(input.cut, clampVal(input.thicknessMm ?? input.cut.typicalThicknessMm, 8, 140));
  if (!layout) return null;
  if (options?.forceTypescript === true) return simulateBoneConduction3dWith(createTsVoxelEngine, "typescript", input);
  const initialC = clampVal(input.initialTempC ?? 10, 0, 45);
  const created = [
    await createVoxelEngine({ ...layout.spec, initialC }),
    await createVoxelEngine({ ...withoutBone(layout.spec), initialC }),
  ];
  const runtime: VoxelRuntime = created.every((c) => c.runtime === "rust-wasm") ? "rust-wasm" : "typescript";
  const queue = created.map((c) => c.engine);
  return simulateBoneConduction3dWith((spec) => queue.shift() ?? createTsVoxelEngine(spec), runtime, input);
}

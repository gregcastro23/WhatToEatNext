import type { VoxelGridSpec } from "@/lib/cooking/voxelConduction";
import { VOXEL_LEAN, type BoneVoxelLayout } from "./boneVoxelGeometry";
import { clampVal } from "./slabDiffusion";

/**
 * Readout geometry for the 3D bone model: which voxel columns are "beside the
 * bone" and "the thermal centre", measured on the VOXELISED bone in the
 * mid-length row (not the nominal bone outline), and the per-face gray band
 * of a column.
 *
 * @file src/lib/butcher/science/boneVoxelReadout.ts
 */

export interface ReadoutColumns {
  readonly kMid: number;
  readonly jMid: number;
  /** First lean column beside the voxelised bone, on the bone's larger meat side. */
  readonly adjacentI: number;
  /** Middle of that meat side: the probe a thermometer would find, which ends the cook. */
  readonly probeI: number;
  readonly adjacentMm: number;
  readonly probeMm: number;
}

export function cellIndex(spec: VoxelGridSpec, i: number, j: number, k: number): number {
  return i + spec.nx * (j + spec.ny * k);
}

/** Voxel bone extent [first, last] cell indices in the readout row (bone or marrow). */
function boneCellRange(layout: BoneVoxelLayout, j: number, k: number): readonly [number, number] {
  let first = -1;
  let last = -1;
  for (let i = 0; i < layout.spec.nx; i += 1) {
    if (Number(layout.spec.material[cellIndex(layout.spec, i, j, k)]) !== VOXEL_LEAN) {
      if (first < 0) first = i;
      last = i;
    }
  }
  return [first, last];
}

export function readoutColumns(layout: BoneVoxelLayout): ReadoutColumns {
  const { nx, ny, nz } = layout.spec;
  const kMid = Math.floor(nz / 2);
  const jMid = Math.floor(ny / 2);
  const [first, last] = boneCellRange(layout, jMid, kMid);
  const leftCells = Math.max(0, first);
  const rightCells = nx - 1 - last;
  const useRight = rightCells >= leftCells;
  const adjacentI = clampVal(useRight ? last + 1 : first - 1, 0, nx - 1);
  const probeI = clampVal(useRight ? last + 1 + Math.floor(rightCells / 2) : Math.floor((first - 1) / 2), 0, nx - 1);
  const edgeX = (useRight ? last + 1 : first) * layout.dxMm;
  const distance = (i: number): number => Math.abs((i + 0.5) * layout.dxMm - edgeX);
  return { kMid, jMid, adjacentI, probeI, adjacentMm: distance(adjacentI), probeMm: distance(probeI) };
}

/**
 * Gray-band depth of one column: each cooking face is walked only to the
 * column's mid-thickness and capped at half the thickness (the 1D per-face
 * convention), then the two faces are averaged.
 */
export function columnGrayBandMm(layout: BoneVoxelLayout, peaks: ArrayLike<number>, i: number, k: number, thresholdC: number): number {
  const { ny } = layout.spec;
  const half = layout.thicknessMm / 2;
  const depthFrom = (fromTop: boolean): number => {
    const at = (n: number): number => Number(peaks[cellIndex(layout.spec, i, fromTop ? n : ny - 1 - n, k)] ?? 0);
    if (at(0) < thresholdC) return 0;
    for (let n = 1; n < Math.ceil(ny / 2); n += 1) {
      if (at(n) < thresholdC) {
        const frac = clampVal((at(n - 1) - thresholdC) / Math.max(1e-6, at(n - 1) - at(n)), 0, 1);
        return Math.min(half, (n - 0.5 + frac) * layout.dyMm);
      }
    }
    return half;
  };
  return Number(((depthFrom(true) + depthFrom(false)) / 2).toFixed(2));
}

export function sliceOf(layout: BoneVoxelLayout, arr: ArrayLike<number>, k: number): number[] {
  const { nx, ny } = layout.spec;
  const out: number[] = [];
  for (let j = 0; j < ny; j += 1) {
    for (let i = 0; i < nx; i += 1) out.push(Number(Number(arr[cellIndex(layout.spec, i, j, k)] ?? 0).toFixed(2)));
  }
  return out;
}

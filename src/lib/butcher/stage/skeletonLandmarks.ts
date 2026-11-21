import { getCutsForSpecies, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import type { SpeciesId, Vec3Tuple } from "@/lib/butcher/types";
import { BEEF_SKELETON, PORK_SKELETON } from "./skeletonLandmarkData";
import { FINFISH_SKELETON, LAMB_SKELETON, POULTRY_SKELETON } from "./skeletonLandmarkData2";

/**
 * Three-free skeletal landmark catalogue for the X-ray view, plus a 2D
 * projection onto each species' SVG diagram so the 2D UI can draw the same
 * bones.
 *
 * @file src/lib/butcher/stage/skeletonLandmarks.ts
 */

export interface SkeletonLandmark {
  readonly id: string;
  readonly label: string;
  readonly primalId: string;
  /** Start of the bone axis in the PRIMAL group's local frame. */
  readonly start: Vec3Tuple;
  /** End of the bone axis in the PRIMAL group's local frame. */
  readonly end: Vec3Tuple;
  readonly radius: number;
  readonly explainsCutIds: readonly string[];
  /** One sentence on why the nearby cuts sit where they do. */
  readonly note: string;
}

export const SKELETON_LANDMARKS: Readonly<Record<SpeciesId, readonly SkeletonLandmark[]>> = {
  beef: BEEF_SKELETON,
  pork: PORK_SKELETON,
  lamb: LAMB_SKELETON,
  poultry: POULTRY_SKELETON,
  finfish: FINFISH_SKELETON,
};

export interface ProjectedLandmark {
  readonly id: string;
  readonly label: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** Row-major 2×3 affine map: svg = [a·x + b·y + c, d·x + e·y + f]. */
type Affine2D = readonly [number, number, number, number, number, number];

function det3(m: ReadonlyArray<readonly number[]>): number {
  const [r0 = [], r1 = [], r2 = []] = m;
  const [a = 0, b = 0, c = 0] = r0;
  const [d = 0, e = 0, f = 0] = r1;
  const [g = 0, h = 0, i = 0] = r2;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/** Cramer's-rule solve of the 3×3 normal equations `m · w = rhs`. */
function solve3(m: ReadonlyArray<readonly number[]>, rhs: readonly number[]): readonly number[] | null {
  const det = det3(m);
  if (!(Math.abs(det) > 1e-12)) return null;
  return [0, 1, 2].map((col) =>
    det3(m.map((row, r) => row.map((v, c) => (c === col ? (rhs[r] ?? 0) : v)))) / det,
  );
}

/**
 * Least-squares affine fit from each cut's world rest (x, y) — primal rest +
 * cut rest — to its SVG label anchor. Falls back to a constant map onto the
 * mean label if the anchors are degenerate.
 */
function fitSpeciesAffine(speciesId: SpeciesId): Affine2D {
  const species = getSpeciesSpec(speciesId);
  const restByPrimal = new Map(species.primals.map((p) => [p.id, p.restPosition]));
  const m = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const bx = [0, 0, 0];
  const by = [0, 0, 0];
  let n = 0;
  for (const cut of getCutsForSpecies(speciesId)) {
    const primalRest = restByPrimal.get(cut.primalId) ?? [0, 0, 0];
    const row = [primalRest[0] + cut.geometry3d.restPosition[0], primalRest[1] + cut.geometry3d.restPosition[1], 1];
    row.forEach((ri, i) => {
      row.forEach((rj, j) => {
        const target = m[i];
        if (target) target[j] = (target[j] ?? 0) + ri * rj;
      });
      bx[i] = (bx[i] ?? 0) + ri * cut.svg2d.labelX;
      by[i] = (by[i] ?? 0) + ri * cut.svg2d.labelY;
    });
    n += 1;
  }
  const wx = solve3(m, bx);
  const wy = solve3(m, by);
  if (!wx || !wy) {
    const meanX = n > 0 ? (bx[2] ?? 0) / n : 320;
    const meanY = n > 0 ? (by[2] ?? 0) / n : 160;
    return [0, 0, meanX, 0, 0, meanY];
  }
  return [wx[0] ?? 0, wx[1] ?? 0, wx[2] ?? 0, wy[0] ?? 0, wy[1] ?? 0, wy[2] ?? 0];
}

function applyAffine(map: Affine2D, x: number, y: number): readonly [number, number] {
  const [a, b, c, d, e, f] = map;
  return [Number((a * x + b * y + c).toFixed(2)), Number((d * x + e * y + f).toFixed(2))];
}

/** Projects every landmark of `speciesId` into its SVG diagram's coordinates. */
export function projectLandmarksToSvg(speciesId: SpeciesId): readonly ProjectedLandmark[] {
  const map = fitSpeciesAffine(speciesId);
  const species = getSpeciesSpec(speciesId);
  const restByPrimal = new Map(species.primals.map((p) => [p.id, p.restPosition]));
  return SKELETON_LANDMARKS[speciesId].map((landmark) => {
    const rest = restByPrimal.get(landmark.primalId) ?? [0, 0, 0];
    const [x1, y1] = applyAffine(map, rest[0] + landmark.start[0], rest[1] + landmark.start[1]);
    const [x2, y2] = applyAffine(map, rest[0] + landmark.end[0], rest[1] + landmark.end[1]);
    return { id: landmark.id, label: landmark.label, x1, y1, x2, y2 };
  });
}

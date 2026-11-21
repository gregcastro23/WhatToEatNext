import type { LoftSection, Vec3Tuple } from "@/lib/butcher/types";

/**
 * Three-free analytic description of the lofted cut surface. The mesh builder
 * (`carcassLofting.ts`), the flush grain ticks (`muscleGrain.ts`) and the bone
 * sizing (`carcassNodes.ts`) all read the same profile, so a tick or a bone is
 * placed against the surface the GPU actually draws.
 *
 * @file src/lib/butcher/stage/loftProfile.ts
 */

export const DEFAULT_ORGANIC_RIBBING = 0.035;

/** `[axisPos, u, v]` in the loft's own frame (u = halfWidth dir, v = halfDepth dir). */
export type LoftFramePoint = readonly [number, number, number];

export function subdivideSections(
  sections: readonly LoftSection[],
): readonly LoftSection[] {
  if (sections.length <= 1) return sections;
  const dense: LoftSection[] = [];
  for (let i = 0; i < sections.length; i += 1) {
    const curr = sections[i];
    if (!curr) continue;
    dense.push(curr);
    const next = sections[i + 1];
    if (next) {
      dense.push([
        (curr[0] + next[0]) * 0.5,
        (curr[1] + next[1]) * 0.5,
        (curr[2] + next[2]) * 0.5,
        (curr[3] + next[3]) * 0.5,
        (curr[4] + next[4]) * 0.5,
      ]);
    }
  }
  return dense;
}

/** Organic ribbing multiplier applied to ring `row` at `angle` (radians). */
export function loftContour(angle: number, row: number, ribbing: number): number {
  return (
    1 +
    Math.cos(angle * 3) * ribbing +
    Math.sin(angle * 2 + row * 0.4) * ribbing * 0.5
  );
}

/** Maps a loft-frame point to geometry-local xyz for the given loft axis. */
export function loftFrameToLocal(axis: "x" | "y", point: LoftFramePoint): Vec3Tuple {
  const [axisPos, u, v] = point;
  return axis === "x" ? [axisPos, u, v] : [u, axisPos, v];
}

/** Maps geometry-local xyz back into the loft frame. */
export function localToLoftFrame(axis: "x" | "y", point: Vec3Tuple): LoftFramePoint {
  const [x, y, z] = point;
  return axis === "x" ? [x, y, z] : [y, x, z];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Point on the lofted surface at fractional dense-row coordinate `rowT`
 * (0 … dense.length − 1) and ring `angle`, linearly blended between the two
 * neighbouring rings exactly like the triangle strip between them. `push`
 * scales the point radially about the blended section centre (1 = on surface).
 */
export function sampleLoftSurface(
  dense: readonly LoftSection[],
  rowT: number,
  angle: number,
  opts: { readonly ribbing: number; readonly push: number },
): LoftFramePoint {
  const maxRow = Math.max(0, dense.length - 1);
  const t = Math.min(maxRow, Math.max(0, rowT));
  const r0 = Math.min(Math.floor(t), Math.max(0, maxRow - 1));
  const r1 = Math.min(maxRow, r0 + 1);
  const f = r1 === r0 ? 0 : t - r0;
  const s0 = dense[r0];
  const s1 = dense[r1] ?? s0;
  if (!s0 || !s1) return [0, 0, 0];
  const c0 = loftContour(angle, r0, opts.ribbing);
  const c1 = loftContour(angle, r1, opts.ribbing);
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const offU = lerp(s0[3], s1[3], f);
  const offV = lerp(s0[4], s1[4], f);
  const radialU = lerp(sin * s0[1] * c0, sin * s1[1] * c1, f);
  const radialV = lerp(cos * s0[2] * c0, cos * s1[2] * c1, f);
  return [
    lerp(s0[0], s1[0], f),
    offU + radialU * opts.push,
    offV + radialV * opts.push,
  ];
}

/** Fractional dense-row coordinate whose blended section sits at `axisPos`. */
export function rowForAxisPos(dense: readonly LoftSection[], axisPos: number): number {
  for (let row = 0; row < dense.length - 1; row += 1) {
    const a = dense[row]?.[0] ?? 0;
    const b = dense[row + 1]?.[0] ?? a;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (axisPos >= lo && axisPos <= hi && hi - lo > 1e-12) {
      return row + (axisPos - a) / (b - a);
    }
  }
  const firstPos = dense[0]?.[0] ?? 0;
  return Math.abs(axisPos - firstPos) < 1e-12 ? 0 : Math.max(0, dense.length - 1);
}

export interface CutBoneSpec {
  /** Bone shaft length along the loft axis. */
  readonly length: number;
  /** `createBoneLandmarkGeometry` radius argument (widest end = radius × 1.15). */
  readonly radius: number;
  /** Bone centre in cut-local coordinates. */
  readonly center: Vec3Tuple;
  /** +1 / −1: the loft-axis end that carries the small knuckle. */
  readonly knuckleSign: 1 | -1;
}

const BONE_LENGTH_FRACTION = 0.78;
const BONE_RADIUS_FRACTION = 0.3;
const BONE_MAX_RADIUS = 0.028;
const BONE_WIDE_END_FACTOR = 1.15;
const KNUCKLE_PROTRUSION_FRACTION = 0.02;

function minHalfExtent(section: LoftSection): number {
  return Math.min(section[1], section[2]);
}

/**
 * Sizes a cut's bone from its own sections: along the loft axis, ≤ 78 % of the
 * axis span, widest radius ≤ 0.3 × the narrowest half-extent (and ≤ 0.028),
 * centred laterally on the sections and nudged toward the narrower end so only
 * a ~2 %-of-span knuckle can show past that end cap.
 */
export function computeCutBoneSpec(
  sections: readonly LoftSection[],
  axis: "x" | "y",
): CutBoneSpec | null {
  const [first] = sections;
  const last = sections[sections.length - 1];
  if (!first || !last) return null;
  const lo = Math.min(first[0], last[0]);
  const hi = Math.max(first[0], last[0]);
  const span = hi - lo;
  if (!(span > 1e-6)) return null;
  const narrowest = Math.min(...sections.map(minHalfExtent));
  const widest = Math.min(BONE_MAX_RADIUS, BONE_RADIUS_FRACTION * narrowest);
  const length = BONE_LENGTH_FRACTION * span;
  const firstIsNarrow = minHalfExtent(first) <= minHalfExtent(last);
  const narrowAtLow = firstIsNarrow === first[0] <= last[0];
  const knuckleSign: 1 | -1 = narrowAtLow ? -1 : 1;
  const shift = 0.5 * span - 0.5 * length + KNUCKLE_PROTRUSION_FRACTION * span;
  const axisCenter = (lo + hi) * 0.5 + knuckleSign * shift;
  const dense = subdivideSections(sections);
  const centreRow = rowForAxisPos(dense, axisCenter);
  const [, offU, offV] = sampleLoftSurface(dense, centreRow, 0, { ribbing: 0, push: 0 });
  return {
    length,
    radius: widest / BONE_WIDE_END_FACTOR,
    center: loftFrameToLocal(axis, [axisCenter, offU, offV]),
    knuckleSign,
  };
}

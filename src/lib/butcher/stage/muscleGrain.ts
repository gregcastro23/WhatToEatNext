import * as THREE from "three";
import type { LoftSection, Vec3Tuple } from "@/lib/butcher/types";
import {
  DEFAULT_ORGANIC_RIBBING,
  loftFrameToLocal,
  sampleLoftSurface,
  subdivideSections,
} from "./loftProfile";

/**
 * Surface-flush muscle grain ticks. Each of the 7 ticks sits on the visible
 * (+Z) face of the lofted cut, runs along the grain vector projected onto the
 * local tangent plane, and is pushed out only 2 % to avoid z-fighting.
 *
 * @file src/lib/butcher/stage/muscleGrain.ts
 */

/** `[fraction along the dense rows, ring angle in radians]` (0 rad = +Z face). */
const GRAIN_TICK_LAYOUT: ReadonlyArray<readonly [number, number]> = [
  [0.18, -0.55],
  [0.3, 0.32],
  [0.42, -0.18],
  [0.5, 0.62],
  [0.6, 0.04],
  [0.72, -0.42],
  [0.84, 0.3],
];
/** Tick length as a fraction of the local min(halfWidth, halfDepth). */
const TICK_LENGTH_FRACTION = 0.36;
const SURFACE_PUSH = 1.02;
const DIFF_STEP = 1e-3;

type Vec3 = [number, number, number];

interface SurfaceCtx {
  readonly dense: readonly LoftSection[];
  readonly axis: "x" | "y";
  readonly ribbing: number;
}

function surfaceLocal(ctx: SurfaceCtx, rowT: number, angle: number, push: number): Vec3 {
  const [x, y, z] = loftFrameToLocal(
    ctx.axis,
    sampleLoftSurface(ctx.dense, rowT, angle, { ribbing: ctx.ribbing, push }),
  );
  return [x, y, z];
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function scaled(a: Vec3, k: number): Vec3 {
  return [a[0] * k, a[1] * k, a[2] * k];
}

/** Central-difference tangents ∂Q/∂row and ∂Q/∂angle (one-sided at the ends). */
function surfaceTangents(ctx: SurfaceCtx, rowT: number, angle: number): readonly [Vec3, Vec3] {
  const maxRow = Math.max(0, ctx.dense.length - 1);
  const lo = Math.max(0, rowT - DIFF_STEP);
  const hi = Math.min(maxRow, rowT + DIFF_STEP);
  const rowSpan = hi - lo;
  const tRow =
    rowSpan > 0
      ? scaled(sub(surfaceLocal(ctx, hi, angle, 1), surfaceLocal(ctx, lo, angle, 1)), 1 / rowSpan)
      : ([0, 0, 0] as Vec3);
  const tAngle = scaled(
    sub(surfaceLocal(ctx, rowT, angle + DIFF_STEP, 1), surfaceLocal(ctx, rowT, angle - DIFF_STEP, 1)),
    1 / (2 * DIFF_STEP),
  );
  return [tRow, tAngle];
}

/**
 * Least-squares (Δrow, Δangle) whose surface displacement best matches the
 * grain vector — i.e. the grain projected onto the tangent plane — scaled so
 * the displacement has length `halfLen`. Falls back to the loft axis.
 */
function tangentStep(ctx: SurfaceCtx, rowT: number, angle: number, grain: Vec3, halfLen: number): readonly [number, number] {
  const [tRow, tAngle] = surfaceTangents(ctx, rowT, angle);
  const a11 = dot(tRow, tRow);
  const a12 = dot(tRow, tAngle);
  const a22 = dot(tAngle, tAngle);
  const det = a11 * a22 - a12 * a12;
  let dRow = 1;
  let dAngle = 0;
  if (Math.abs(det) > 1e-14) {
    const b1 = dot(tRow, grain);
    const b2 = dot(tAngle, grain);
    dRow = (b1 * a22 - b2 * a12) / det;
    dAngle = (a11 * b2 - a12 * b1) / det;
  }
  let stepLen = Math.hypot(...add(scaled(tRow, dRow), scaled(tAngle, dAngle)));
  if (!(stepLen > 1e-9)) {
    dRow = 1;
    dAngle = 0;
    stepLen = Math.sqrt(a11);
  }
  if (!(stepLen > 1e-9)) return [0, 0];
  return [(dRow * halfLen) / stepLen, (dAngle * halfLen) / stepLen];
}

function normalizedGrain(grainVector: Vec3Tuple): Vec3 {
  const len = Math.hypot(grainVector[0], grainVector[1], grainVector[2]);
  if (!(len > 1e-8)) return [1, 0, 0];
  return [grainVector[0] / len, grainVector[1] / len, grainVector[2] / len];
}

function localMinHalfExtent(ctx: SurfaceCtx, rowT: number): number {
  const [, uEdge] = sampleLoftSurface(ctx.dense, rowT, Math.PI / 2, { ribbing: 0, push: 1 });
  const [, uCentre, vCentre] = sampleLoftSurface(ctx.dense, rowT, 0, { ribbing: 0, push: 0 });
  const [, , vEdge] = sampleLoftSurface(ctx.dense, rowT, 0, { ribbing: 0, push: 1 });
  return Math.min(Math.abs(uEdge - uCentre), Math.abs(vEdge - vCentre));
}

function buildGrainPositions(ctx: SurfaceCtx, grainVector: Vec3Tuple): number[] {
  const grain = normalizedGrain(grainVector);
  const maxRow = Math.max(0, ctx.dense.length - 1);
  const positions: number[] = [];
  for (const [fraction, angle] of GRAIN_TICK_LAYOUT) {
    const rowT = fraction * maxRow;
    const halfLen = 0.5 * TICK_LENGTH_FRACTION * localMinHalfExtent(ctx, rowT);
    const [dRow, dAngle] = tangentStep(ctx, rowT, angle, grain, halfLen);
    const head = surfaceLocal(ctx, Math.min(maxRow, rowT + dRow), angle + dAngle, SURFACE_PUSH);
    const tail = surfaceLocal(ctx, Math.max(0, rowT - dRow), angle - dAngle, SURFACE_PUSH);
    positions.push(...tail, ...head);
  }
  return positions;
}

/**
 * Generates directional surface-flush muscle fiber lines (`THREE.LineSegments`)
 * aligned with the cut's true 3D sarcomere grain vector $\vec{g}$: 7 ticks /
 * 14 vertices lying on the lofted surface.
 */
export function createMuscleGrainGeometry(
  sections: readonly LoftSection[],
  grainVector: Vec3Tuple,
  axis: "x" | "y" = "x",
  ribbing = DEFAULT_ORGANIC_RIBBING,
): THREE.BufferGeometry {
  if (sections.length === 0) {
    return new THREE.BufferGeometry();
  }
  const ctx: SurfaceCtx = { dense: subdivideSections(sections), axis, ribbing };
  const positions = buildGrainPositions(ctx, grainVector);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  geometry.name = "MuscleGrainLines";
  return geometry;
}

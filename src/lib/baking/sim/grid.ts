/**
 * One-dimensional finite-volume geometry for slabs, cylinders and spheres.
 *
 * Everything is per UNIT: per m² of slab face, per radian per metre of
 * cylinder, per steradian of sphere. The unit cancels from every ratio the
 * simulator reports (volume rise, moisture loss), and it makes the three
 * shapes one code path: with `m` the geometry exponent (0, 1, 2),
 *
 *   face area at r      A(r) = r^m
 *   shell volume        V = (r₂^(m+1) − r₁^(m+1)) / (m + 1)
 *
 * The grid is LAGRANGIAN: each control volume keeps its own mass, and its
 * faces move when its gas cells expand. Recomputing the faces from the
 * volumes is exact — the inverse of the shell-volume formula.
 *
 * @file src/lib/baking/sim/grid.ts
 */
import type { FoodGeometry } from "@/lib/cooking/thermo";
import { at } from "./strict";

export type GeometryExponent = 0 | 1 | 2;

export function geometryExponent(shape: FoodGeometry): GeometryExponent {
  if (shape === "slab") return 0;
  return shape === "cylinder" ? 1 : 2;
}

/** Face area at radius `r`, per unit. */
export function faceArea(m: GeometryExponent, r: number): number {
  return m === 0 ? 1 : Math.pow(r, m);
}

/** Volume between radii `r1 < r2`, per unit. */
export function shellVolume(m: GeometryExponent, r1: number, r2: number): number {
  return (Math.pow(r2, m + 1) - Math.pow(r1, m + 1)) / (m + 1);
}

/** Face positions of `n` equal-width control volumes spanning `[0, extentM]`. */
export function uniformFaces(extentM: number, n: number): number[] {
  if (!(n >= 3) || !Number.isInteger(n)) throw new RangeError(`need at least 3 control volumes, got ${n}`);
  if (!(extentM > 0)) throw new RangeError(`extent must be positive, got ${extentM}`);
  return Array.from({ length: n + 1 }, (_, i) => (extentM * i) / n);
}

/** Control-volume volumes from face positions. */
export function volumesFromFaces(m: GeometryExponent, faces: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < faces.length; i += 1) {
    out.push(shellVolume(m, at(faces, i), at(faces, i + 1)));
  }
  return out;
}

/** Face positions from control-volume volumes, starting at r = 0 — the exact inverse of {@link volumesFromFaces}. */
export function facesFromVolumes(m: GeometryExponent, volumes: readonly number[]): number[] {
  const faces = [0];
  let accumulated = 0;
  for (const volume of volumes) {
    accumulated += (m + 1) * volume;
    faces.push(Math.pow(accumulated, 1 / (m + 1)));
  }
  return faces;
}

/** Width of each control volume. */
export function widths(faces: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < faces.length; i += 1) out.push(at(faces, i + 1) - at(faces, i));
  return out;
}

/** Face-centred position of each control volume, normalised to the outer face. */
export function normalisedCentres(faces: readonly number[]): number[] {
  const outer = at(faces, faces.length - 1);
  const out: number[] = [];
  for (let i = 0; i + 1 < faces.length; i += 1) out.push((at(faces, i) + at(faces, i + 1)) / 2 / outer);
  return out;
}

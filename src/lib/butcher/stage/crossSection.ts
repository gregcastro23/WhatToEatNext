import type { Vec3Tuple } from "@/lib/butcher/types";
import type * as THREE from "three";

/**
 * Plane ∩ triangle-mesh section for the knife's cross-section ring.
 *
 * Every triangle is classified against the plane `n·p = planeConstant`
 * (geometry-local coordinates). Distances within `PLANE_EPSILON` snap to 0, so
 * a vertex lying on the plane is emitted once as an endpoint (never as a 0/0
 * interpolation), a triangle edge lying on the plane is emitted only by the
 * neighbour on the positive side (no duplicate), and coplanar triangles are
 * skipped.
 *
 * @file src/lib/butcher/stage/crossSection.ts
 */

const PLANE_EPSILON = 1e-9;
const MIN_SEGMENT_LENGTH = 1e-12;

type Point = readonly [number, number, number];

interface Plane {
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly c: number;
}

function signedDistance(plane: Plane, p: Point): number {
  const d = plane.nx * p[0] + plane.ny * p[1] + plane.nz * p[2] - plane.c;
  return Math.abs(d) <= PLANE_EPSILON ? 0 : d;
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Section points of one triangle: on-plane vertices plus strict sign-change edge crossings. */
function trianglePlanePoints(tri: readonly Point[], dist: readonly number[]): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 3; i += 1) {
    const j = (i + 1) % 3;
    const pi = tri[i];
    const pj = tri[j];
    const di = dist[i] ?? 0;
    const dj = dist[j] ?? 0;
    if (!pi || !pj) continue;
    if (di === 0) points.push(pi);
    if ((di < 0 && dj > 0) || (di > 0 && dj < 0)) {
      points.push(lerpPoint(pi, pj, di / (di - dj)));
    }
  }
  return points;
}

function emitTriangleSection(tri: readonly Point[], plane: Plane, out: number[]): void {
  const dist = tri.map((p) => signedDistance(plane, p));
  const points = trianglePlanePoints(tri, dist);
  if (points.length !== 2) return;
  const zeros = dist.filter((d) => d === 0).length;
  if (zeros === 2 && !dist.some((d) => d > 0)) return;
  const [a, b] = points;
  if (!a || !b) return;
  if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= MIN_SEGMENT_LENGTH) return;
  out.push(a[0], a[1], a[2], b[0], b[1], b[2]);
}

function readPoint(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  index: number,
): Point {
  return [position.getX(index), position.getY(index), position.getZ(index)];
}

/**
 * Intersects every triangle of `geometry` with the plane `n·p = planeConstant`
 * and returns line-segment endpoints `[x0,y0,z0, x1,y1,z1, …]` in the
 * geometry's local coordinates. Non-indexed geometry is read as sequential
 * triples. A zero/non-finite normal yields an empty array.
 */
export function computePlaneSectionSegments(
  geometry: THREE.BufferGeometry,
  planeNormal: Vec3Tuple,
  planeConstant = 0,
): Float32Array {
  const len = Math.hypot(planeNormal[0], planeNormal[1], planeNormal[2]);
  if (!(len > 1e-12) || !Number.isFinite(planeConstant) || !geometry.hasAttribute("position")) {
    return new Float32Array(0);
  }
  const plane: Plane = {
    nx: planeNormal[0] / len,
    ny: planeNormal[1] / len,
    nz: planeNormal[2] / len,
    c: planeConstant / len,
  };
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const vertexCount = index ? index.count : position.count;
  const vertexAt = (k: number): number => (index ? index.getX(k) : k);
  const out: number[] = [];
  for (let k = 0; k + 2 < vertexCount; k += 3) {
    const tri = [readPoint(position, vertexAt(k)), readPoint(position, vertexAt(k + 1)), readPoint(position, vertexAt(k + 2))];
    emitTriangleSection(tri, plane, out);
  }
  return new Float32Array(out);
}

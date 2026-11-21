import type { Vec3Tuple } from "@/lib/butcher/types";

/**
 * Knife-plane geometry shared by the Butcher's Block scorer, the fabrication
 * scorer and the 3D slicing plane.
 *
 * @file src/lib/butcher/science/knifeGeometry.ts
 */

/**
 * Constructs a unit knife normal vector at the requested slice angle $\theta \in [0^\circ, 90^\circ]$
 * relative to a cut's grain unit vector $\hat{g}$, so $\arcsin(|\hat{n} \cdot \hat{g}|) = \theta$.
 */
export function knifeNormalAtAngle(
  angleDeg: number,
  grainVector: Vec3Tuple,
): Vec3Tuple {
  const len = Math.hypot(grainVector[0], grainVector[1], grainVector[2]);
  const gx = len > 1e-8 ? grainVector[0] / len : 1;
  const gy = len > 1e-8 ? grainVector[1] / len : 0;
  const gz = len > 1e-8 ? grainVector[2] / len : 0;

  // Pick a reference vector not collinear with g to form orthogonal basis u
  const ref: Vec3Tuple = Math.abs(gx) < 0.85 ? [1, 0, 0] : [0, 1, 0];
  // Cross product g x ref -> perp1
  let px = gy * ref[2] - gz * ref[1];
  let py = gz * ref[0] - gx * ref[2];
  let pz = gx * ref[1] - gy * ref[0];
  const pLen = Math.hypot(px, py, pz) || 1;
  px /= pLen;
  py /= pLen;
  pz /= pLen;

  const rad = (Math.min(90, Math.max(0, angleDeg)) * Math.PI) / 180;
  const sinT = Math.sin(rad);
  const cosT = Math.cos(rad);
  return [
    gx * sinT + px * cosT,
    gy * sinT + py * cosT,
    gz * sinT + pz * cosT,
  ];
}

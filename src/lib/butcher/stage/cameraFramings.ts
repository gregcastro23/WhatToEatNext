import type { CameraFramingId, Vec3Tuple } from "@/lib/butcher/types";

/**
 * Coaxial camera choreography & quintic ease-out curves adapted from Pentacles
 * `seeker-vessel-stage.js` (`ARMILLARY_FRAMINGS` & `armillaryEaseOut`).
 *
 * @file src/lib/butcher/stage/cameraFramings.ts
 */

export interface CameraFramingSpec {
  readonly pos: Vec3Tuple;
  readonly lookAt: Vec3Tuple;
  readonly fov: number;
  readonly label: string;
}

export const BUTCHER_CAMERA_FRAMINGS: Readonly<Record<CameraFramingId, CameraFramingSpec>> = {
  "whole-carcass": {
    pos: [0, 0.42, 5.1],
    lookAt: [0, 0.04, 0],
    fov: 34,
    label: "Whole Carcass",
  },
  "exploded-primal": {
    pos: [0.35, 0.62, 5.9],
    lookAt: [0, 0.04, 0],
    fov: 36,
    label: "Exploded Primals",
  },
  "butcher-block-slice": {
    pos: [0.18, 0.52, 3.05],
    lookAt: [0, 0.04, 0],
    fov: 30,
    label: "Butcher Block Carve",
  },
};

export function armillaryEaseOut(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3.4);
}

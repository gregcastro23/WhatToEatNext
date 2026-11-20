import type { CameraFramingId, Vec3Tuple } from "@/lib/butcher/types";

/**
 * Coaxial camera choreography, responsive explode/aspect framing, and quintic
 * ease-out curves adapted from Pentacles `seeker-vessel-stage.js`
 * (`ARMILLARY_FRAMINGS` & `armillaryEaseOut`).
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

/**
 * Pulls camera distance back smoothly when primals explode toward 100% (preventing
 * dorsal cuts from clipping the upper viewport edge) and when canvas aspect narrows
 * below desktop proportions (preventing mobile horizontal carcass clipping).
 */
export function computeResponsiveStageRadius(params: {
  readonly baseRadius: number;
  readonly aspect: number;
  readonly explodeFactor: number;
  readonly framing: CameraFramingId;
}): number {
  const safeBase = Math.max(1, params.baseRadius);
  const safeAspect = Number.isFinite(params.aspect) && params.aspect > 0 ? params.aspect : 1.6;
  const explode = Math.min(1, Math.max(0, Number.isFinite(params.explodeFactor) ? params.explodeFactor : 0));

  if (params.framing === "butcher-block-slice") {
    const narrowScale = safeAspect < 1.4 ? Math.min(1.32, 1.4 / Math.max(0.75, safeAspect)) : 1;
    return safeBase * narrowScale;
  }

  const explodeScale =
    params.framing === "exploded-primal"
      ? 1 + Math.max(0, explode - 0.45) * 0.44
      : 1 + Math.max(0, explode - 0.15) * 0.5;
  const aspectScale = safeAspect < 1.65 ? Math.min(1.68, 1.65 / Math.max(0.75, safeAspect)) : 1;
  return safeBase * explodeScale * aspectScale;
}

/**
 * Three-free slice-angle colour cue shared by the 3D knife plane, its
 * cross-section ring, and the 2D Butcher UI.
 *
 * The angle is the knife-vs-grain angle in degrees (90 = perfectly across the
 * fibres). Within 15° of square is cross-grain; under 30° the knife runs along
 * the fibres and the slice is stringy; anything between is a bias cut.
 *
 * @file src/lib/butcher/stage/sliceAngleCue.ts
 */

export type SliceAngleBand = "cross-grain" | "bias" | "parallel";

export interface SliceAngleCue {
  readonly band: SliceAngleBand;
  readonly colorHex: string;
  readonly label: string;
}

export const SLICE_CUE_COLORS: Readonly<Record<SliceAngleBand, string>> = {
  "cross-grain": "#34d399",
  bias: "#fbbf24",
  parallel: "#ef4444",
};

const SLICE_CUE_LABELS: Readonly<Record<SliceAngleBand, string>> = {
  "cross-grain": "Cross-grain",
  bias: "Bias cut",
  parallel: "Parallel / stringy",
};

const CROSS_GRAIN_TOLERANCE_DEG = 15;
const PARALLEL_BELOW_DEG = 30;

function clampSliceAngle(angleDeg: number): number {
  if (!Number.isFinite(angleDeg)) return 0;
  return Math.min(90, Math.max(0, angleDeg));
}

export function sliceAngleBand(angleDeg: number): SliceAngleBand {
  const angle = clampSliceAngle(angleDeg);
  if (Math.abs(90 - angle) <= CROSS_GRAIN_TOLERANCE_DEG) return "cross-grain";
  if (angle < PARALLEL_BELOW_DEG) return "parallel";
  return "bias";
}

export function sliceAngleCue(angleDeg: number): SliceAngleCue {
  const band = sliceAngleBand(angleDeg);
  return { band, colorHex: SLICE_CUE_COLORS[band], label: SLICE_CUE_LABELS[band] };
}

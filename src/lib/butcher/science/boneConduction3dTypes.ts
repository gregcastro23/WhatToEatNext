import type { AnatomicalCut } from "@/lib/butcher/types";
import type { VoxelRuntime } from "@/lib/cooking/voxelConduction";
import type { TrajectoryMethodId } from "./trajectoryMethods";

/**
 * Input and result contracts for the 3D bone-through conduction model
 * (`boneConduction3d.ts`).
 *
 * @file src/lib/butcher/science/boneConduction3dTypes.ts
 */

export interface BoneConduction3dInput {
  readonly cut: AnatomicalCut;
  readonly method: TrajectoryMethodId;
  readonly targetCoreTempC?: number;
  readonly thicknessMm?: number;
  readonly holdMinutes?: number;
  readonly restMinutes?: number;
  readonly ambientTempC?: number;
  readonly initialTempC?: number;
}

export interface BoneColumnReadout {
  readonly distanceFromBoneMm: number;
  /** Mid-thickness temperature of this column when the meat leaves the heat, °C. */
  readonly coreAtRemovalC: number;
  readonly carryoverPeakC: number;
  readonly carryoverRiseC: number;
  /** Mean depth from the two cooking faces whose peak passed the gray-band threshold, mm. */
  readonly grayBandMm: number;
}

export interface BoneConduction3dResult {
  readonly runtime: VoxelRuntime;
  readonly grid: {
    readonly nx: number; readonly ny: number; readonly nz: number;
    readonly dxMm: number; readonly dyMm: number; readonly dzMm: number;
    readonly widthMm: number; readonly lengthMm: number;
  };
  readonly cookMinutes: number;
  readonly pullCoreTempC: number;
  /** The meat column touching the bone. */
  readonly boneAdjacent: BoneColumnReadout;
  /** The SAME column in a counterfactual block whose bone cells are lean, cooked on the identical schedule. */
  readonly boneAdjacentBoneless: BoneColumnReadout;
  /** The probe column: middle of the meat on the bone's larger side (where a thermometer goes). */
  readonly awayFromBone: BoneColumnReadout;
  /** Boneless minus bone-in temperature next to the bone at removal, °C (positive = the bone kept its neighbour cooler). */
  readonly boneEffectAtRemovalC: number;
  /** Away-from-bone minus bone-adjacent temperature at removal, °C, in the bone-in block. */
  readonly lagAtRemovalC: number;
  /** Mid-length XY cross-section (index i + nx·j), for the heat map. */
  readonly slice: {
    readonly nx: number; readonly ny: number;
    readonly material: readonly number[];
    readonly removalTemps: readonly number[];
    readonly peakTemps: readonly number[];
  };
  readonly basis: readonly string[];
}

import type { BonePlacement } from "./boneAnatomy";
import type { PrepId } from "./prepModifiers";
import type { TissueKind } from "./slabColumn";
import type { TrajectoryMethodId } from "./trajectoryMethods";

/**
 * Option and result contracts for `simulateCoupledCutTrajectory`.
 *
 * @file src/lib/butcher/science/trajectoryTypes.ts
 */

export interface CoupledTrajectoryOptions {
  readonly method: TrajectoryMethodId;
  readonly targetCoreTempC?: number;
  /** Lean meat thickness, mm (fat cap and bone are added on top of it). */
  readonly thicknessMm?: number;
  readonly initialTempC?: number;
  readonly holdMinutes?: number;
  readonly restMinutes?: number;
  readonly ambientTempC?: number;
  /** Defaults to the cut's catalogue `geometry3d.hasBone`. */
  readonly boneIn?: boolean;
  /** Adipose fat cap on face A, mm, clamped to 0–15. Defaults to 0. */
  readonly fatCapMm?: number;
  readonly prep?: PrepId;
}

export interface TrajectoryFaceBand {
  readonly side: "A" | "B";
  /** Outermost tissue on this face: lean muscle, adipose fat cap, or bone plate. */
  readonly outer: TissueKind;
  readonly crustDepthMm: number;
  readonly grayBandMm: number;
}

export interface TrajectoryColumnSummary {
  readonly meatThicknessMm: number;
  readonly fatCapMm: number;
  readonly boneMm: number;
  readonly boneIn: boolean;
  readonly bonePlacement: BonePlacement | null;
  /** True when the cut's bone runs through the thickness (steaks/chops): the 1D column is the meat away from the bone. */
  readonly boneNeeds3d: boolean;
  /** Distance of the thermal centre (coldest meat node at removal) from face A's meat surface, mm. */
  readonly thermalCentreFromAMm: number;
}

export interface TrajectoryPrepSummary {
  readonly prep: PrepId;
  readonly label: string;
  /** Applied multiplier on the initial surface film (computed for dry-aged). */
  readonly surfaceWaterFactor: number;
  readonly waterMassChangeG: number;
  readonly cookLossReductionFrac: number;
  readonly toughnessReductionFrac: number;
}

export interface CoupledTrajectoryResult {
  readonly method: TrajectoryMethodId;
  readonly halfThicknessMm: number;
  readonly cookMinutes: number;
  readonly restMinutes: number;
  readonly targetCoreTempC: number;
  readonly pullCoreTempC: number;
  /** Thermal-centre temperature at the instant the meat leaves the heat (after any finishing sear). */
  readonly removedCoreTempC: number;
  readonly carryoverPeakC: number;
  readonly carryoverRiseC: number;
  readonly finalSurfaceTempC: number;
  readonly peakSurfaceTempC: number;
  /** Peak temperature of every column node, face A → face B. */
  readonly peakNodeTempsC: readonly number[];
  /** Node positions from face A, mm (same length as `peakNodeTempsC`). */
  readonly nodePositionsMm: readonly number[];
  /** Mean of the two faces' bands, so crust + gray + ideal = halfThicknessMm. */
  readonly grayBandMm: number;
  readonly grayBandPct: number;
  readonly crustDepthMm: number;
  readonly idealCoreMm: number;
  readonly faces: readonly [TrajectoryFaceBand, TrajectoryFaceBand];
  readonly column: TrajectoryColumnSummary;
  readonly prep: TrajectoryPrepSummary;
  readonly maillardOnsetMin: number | null;
  readonly stallDurationMin: number;
  readonly stallPlateauTempC: number | null;
  readonly gelatinConversionPct: number;
  readonly restGelatinGainPct: number;
  readonly moistureRetentionPct: number;
  readonly surfaceEventSummary: string;
}

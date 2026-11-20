/**
 * Core domain types for `/kitchen-lab/butcher` — anatomical cuts, USDA FDC
 * meat composition records, 3D carcass stage configuration, and the
 * Butcher's Block game loop.
 *
 * @file src/lib/butcher/types.ts
 */

export type SpeciesId = "beef" | "pork" | "lamb" | "poultry" | "finfish";

export type CookingStrategy =
  | "high-heat-sear"
  | "reverse-sear"
  | "low-and-slow-smoke"
  | "collagen-braise"
  | "sous-vide"
  | "poach-confit";

export type ColorOverlayMode = "anatomical" | "marbling" | "collagen" | "thermal";

export type CameraFramingId =
  | "whole-carcass"
  | "exploded-primal"
  | "butcher-block-slice";

export type ButcherTab = "breakdown" | "game" | "thermal" | "elements" | "sources";

export type ButcherOrderTier = "apprentice" | "journeyman" | "master";

export type MarblingGrade = "lean" | "moderate" | "well-marbled" | "rich";

export type ButcherElement = "Fire" | "Water" | "Earth" | "Air";

export type Vec3Tuple = readonly [number, number, number];

/**
 * Lofted cross-section profile row adapted from Pentacles `tailoredSurface`:
 * `[axisPos, halfWidth, halfDepth, offsetY, offsetZ]`.
 */
export type LoftSection = readonly [number, number, number, number, number];

export interface FdcButcherRecord {
  readonly fdcId: number;
  readonly description: string;
  readonly dataType: "SR Legacy" | "Foundation";
  readonly waterG: number;
  readonly proteinG: number;
  readonly fatG: number;
  readonly ashG: number;
  readonly collagenG: number;
  readonly collagenBasis: "LITERATURE" | "DERIVED";
  readonly collagenSource: string;
}

export interface CutProximate {
  readonly waterG: number;
  readonly proteinG: number;
  readonly fatG: number;
  readonly ashG: number;
  readonly collagenG: number;
}

export interface CutCoreTempWindow {
  readonly min: number;
  readonly ideal: number;
  readonly max: number;
  readonly carryoverC: number;
}

export interface CutGeometry3D {
  readonly colorHex: string;
  readonly restPosition: Vec3Tuple;
  readonly explodeVector: Vec3Tuple;
  readonly loftAxis: "x" | "y";
  readonly sections: readonly LoftSection[];
  readonly hasBone: boolean;
}

export interface CutSvg2D {
  readonly path: string;
  readonly labelX: number;
  readonly labelY: number;
  readonly grainAngleDeg: number;
}

export interface CutAlchmProfile {
  readonly elements: Readonly<Record<ButcherElement, number>>;
  readonly esms: {
    readonly Spirit: number;
    readonly Essence: number;
    readonly Matter: number;
    readonly Substance: number;
  };
  readonly rulingPlanets: readonly string[];
  readonly alchemicalPrep: string;
}

export interface AnatomicalCut {
  readonly id: string;
  readonly name: string;
  readonly speciesId: SpeciesId;
  readonly primalId: string;
  readonly primalName: string;
  readonly fdcId: number;
  readonly proximate: CutProximate;
  readonly marblingGrade: MarblingGrade;
  readonly grainVector: Vec3Tuple;
  readonly fiberLengthFactor: number;
  readonly maxFiberLengthMm: number;
  readonly typicalThicknessMm: number;
  readonly typicalPortionG: number;
  readonly optimalMethods: readonly CookingStrategy[];
  readonly targetCoreTempC: CutCoreTempWindow;
  readonly braiseHoldMinutes: number;
  readonly anatomicalNotes: string;
  readonly recipeSearchQuery: string;
  readonly matchTerms: readonly string[];
  readonly solverMethodId: string;
  readonly solverIngredientId: "chicken" | "pork" | null;
  readonly geometry3d: CutGeometry3D;
  readonly svg2d: CutSvg2D;
  readonly alchm: CutAlchmProfile;
}

export interface PrimalSpec {
  readonly id: string;
  readonly speciesId: SpeciesId;
  readonly name: string;
  readonly restPosition: Vec3Tuple;
  readonly explodeVector: Vec3Tuple;
  readonly colorHex: string;
}

export interface SpeciesSpec {
  readonly id: SpeciesId;
  readonly name: string;
  readonly latinName: string;
  readonly summary: string;
  readonly svgViewBox: string;
  readonly svgOutlinePath: string;
  readonly defaultCutId: string;
  readonly primals: readonly PrimalSpec[];
}

export interface ThermalEvaluation {
  readonly coreTempC: number;
  readonly holdMinutes: number;
  readonly myosinDenaturedPct: number;
  readonly actinCoagulatedPct: number;
  readonly gelatinConversionPct: number;
  readonly moistureRetentionPct: number;
  readonly tendernessScore: number;
  readonly juicinessScore: number;
  readonly phaseLabel: string;
  readonly donenessLabel: string;
  readonly warning: string | null;
}

export interface ThermalCurvePoint {
  readonly tempC: number;
  readonly tendernessScore: number;
  readonly moistureRetentionPct: number;
  readonly gelatinConversionPct: number;
  readonly actinCoagulatedPct: number;
}

export interface GrainSliceEvaluation {
  readonly sliceAngleDeg: number;
  readonly effectiveFiberLengthMm: number;
  readonly shearForceMultiplier: number;
  readonly grainAngleScore: number;
  readonly portionPrecisionScore: number;
  readonly verdict: string;
  readonly coachingNote: string;
}

export interface OrderPhysicsConstraint {
  readonly speciesId?: SpeciesId;
  readonly minCollagenG?: number;
  readonly maxCollagenG?: number;
  readonly minFatG?: number;
  readonly requiredMethod?: CookingStrategy;
}

export interface ButcherOrderTicket {
  readonly id: string;
  readonly tier: ButcherOrderTier;
  readonly title: string;
  readonly prompt: string;
  readonly speciesId: SpeciesId;
  readonly expectedCutId: string;
  readonly targetMassG: number;
  readonly targetAngleDeg: number;
  readonly targetMethod: CookingStrategy;
  readonly targetCoreTempC: number;
  readonly physicsConstraint: OrderPhysicsConstraint | null;
}

export interface ButcherOrderSubmission {
  readonly selectedCutId: string;
  readonly sliceAngleDeg: number;
  readonly portionMassG: number;
  readonly selectedMethod: CookingStrategy;
  readonly selectedCoreTempC: number;
}

export interface ButcherOrderScore {
  readonly cutAccuracyScore: number;
  readonly grainAngleScore: number;
  readonly portionPrecisionScore: number;
  readonly thermalPairingScore: number;
  readonly totalScore: number;
  readonly grade: "S" | "A" | "B" | "C" | "D";
  readonly passed: boolean;
  readonly feedback: readonly string[];
}

export interface ButcherProgressStats {
  readonly completedOrders: number;
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly bestScore: number;
  readonly tierCompleted: Readonly<Record<ButcherOrderTier, number>>;
}

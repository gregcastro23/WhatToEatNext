import type {
  AnatomicalCut,
  CookingStrategy,
  CutAlchmProfile,
  CutCoreTempWindow,
  CutGeometry3D,
  CutSvg2D,
  MarblingGrade,
  SpeciesId,
  Vec3Tuple,
} from "@/lib/butcher/types";
import { FDC_BUTCHER_RECORDS } from "./fdcButcherRecords";

export interface CutDefinitionInput {
  readonly id: string;
  readonly name: string;
  readonly speciesId: SpeciesId;
  readonly primalId: string;
  readonly primalName: string;
  readonly fdcId: number;
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

function normalizeUnitVector(v: Vec3Tuple): Vec3Tuple {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len <= 1e-8) return [1, 0, 0];
  return [
    Number((v[0] / len).toFixed(6)),
    Number((v[1] / len).toFixed(6)),
    Number((v[2] / len).toFixed(6)),
  ];
}

/**
 * Constructs a canonical AnatomicalCut with proximate values pinned directly
 * from FDC_BUTCHER_RECORDS so data and citations cannot diverge.
 */
export function defineButcherCut(input: CutDefinitionInput): AnatomicalCut {
  const fdc = FDC_BUTCHER_RECORDS[input.fdcId];
  if (!fdc) {
    throw new Error(`Missing FDC record ${input.fdcId} for cut ${input.id}`);
  }
  return {
    ...input,
    grainVector: normalizeUnitVector(input.grainVector),
    proximate: {
      waterG: fdc.waterG,
      proteinG: fdc.proteinG,
      fatG: fdc.fatG,
      ashG: fdc.ashG,
      collagenG: fdc.collagenG,
    },
  };
}

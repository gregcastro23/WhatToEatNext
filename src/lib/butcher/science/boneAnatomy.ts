import type { AnatomicalCut } from "@/lib/butcher/types";
import type { ColumnBoneSpec } from "./slabColumn";

/**
 * Where each bone-in cut's bone sits relative to the heat path, and how big it
 * is. Three placements:
 *  - `"face"`    — a rib / vertebral plate shields one face (rib roasts, racks,
 *                  short ribs, spare ribs): modelled in the 1D column, face B.
 *  - `"core"`    — a marrow bone at the centre of the heat path (shanks cooked
 *                  whole, drumsticks, leg and shoulder bones): 1D column centre.
 *  - `"through"` — the bone runs through the full thickness (bone-in steaks,
 *                  chops, crosscut osso buco): impossible in 1D, so these use the
 *                  3D voxel model and the 1D column is the meat away from it.
 *
 * ⚠️ BASIS: bone dimensions are ANATOMICAL MODEL ESTIMATES (typical cross
 * sections of the named bone for a market-weight animal), not measurements.
 * They are labelled as such wherever they surface in the UI.
 *
 * @file src/lib/butcher/science/boneAnatomy.ts
 */

export type BonePlacement = "face" | "core" | "through";

export type ThroughBoneShape =
  /** Vertical plate spanning the full thickness; `positionFrac` 0 = lateral edge, 0.5 = middle. */
  | { readonly kind: "plate"; readonly positionFrac: number }
  /** Cylinder through the thickness at the centre (crosscut shank). */
  | { readonly kind: "cylinder" };

export interface CutBoneAnatomy {
  readonly placement: BonePlacement;
  readonly boneName: string;
  /** Cortical plate thickness, or cortical wall each side of the marrow, mm. */
  readonly corticalMm: number;
  readonly marrowMm: number;
  readonly through: ThroughBoneShape | null;
  readonly basis: "ANATOMICAL MODEL ESTIMATE";
}

const EST = "ANATOMICAL MODEL ESTIMATE" as const;

/**
 * MODEL ASSUMPTION shared by the yield estimator and the 3D voxel model: a
 * steak's footprint is 1.5× as long as it is wide (footprint area = portion ÷
 * (Choi-Okos lean density × thickness)).
 */
export const STEAK_FOOTPRINT_ASPECT = 1.5;

function face(boneName: string, plateMm: number): CutBoneAnatomy {
  return { placement: "face", boneName, corticalMm: plateMm, marrowMm: 0, through: null, basis: EST };
}
function core(boneName: string, outerMm: number, marrowMm: number): CutBoneAnatomy {
  return { placement: "core", boneName, corticalMm: (outerMm - marrowMm) / 2, marrowMm, through: null, basis: EST };
}
function plate(boneName: string, plateMm: number, positionFrac: number): CutBoneAnatomy {
  return { placement: "through", boneName, corticalMm: plateMm, marrowMm: 0, through: { kind: "plate", positionFrac }, basis: EST };
}
function cylinder(boneName: string, outerMm: number, marrowMm: number): CutBoneAnatomy {
  return { placement: "through", boneName, corticalMm: (outerMm - marrowMm) / 2, marrowMm, through: { kind: "cylinder" }, basis: EST };
}

export const CUT_BONE_ANATOMY: Readonly<Record<string, CutBoneAnatomy>> = {
  // Through-thickness (3D voxel model)
  ribeye: plate("rib (costa)", 12, 0),
  porterhouse: plate("lumbar vertebra transverse process (the T)", 9, 0.62),
  "t-bone": plate("lumbar vertebra transverse process (the T)", 9, 0.68),
  "pork-loin-chop": plate("rib and chine", 8, 0),
  "lamb-loin-chop": plate("lumbar vertebra (mini T-bone)", 5, 0.6),
  "osso-buco-shank": cylinder("tibia / radius crosscut", 40, 20),
  "chuck-roast": plate("scapula blade", 6, 0.45),
  // Face plates (1D column, face B)
  "prime-rib": face("ribs 6–12", 12),
  "short-ribs": face("rib (costa)", 15),
  "rack-of-lamb": face("ribs 6–13", 6),
  "lamb-breast": face("ribs and sternum", 6),
  "baby-back-ribs": face("ribs (loin end)", 8),
  "spare-ribs": face("ribs and sternum", 10),
  "carcass-back": face("vertebrae and pelvis frame", 4),
  "collar-kama": face("cleithrum (collar bone)", 3),
  // Core bones (1D column centre)
  "lamb-shank": core("tibia", 22, 10),
  "pork-hock": core("tibia / fibula", 26, 12),
  "chicken-drumstick": core("tibiotarsus", 9, 5),
  "chicken-thigh": core("femur", 8, 4),
  "chicken-wing": core("humerus", 7, 4),
  "leg-of-lamb": core("femur", 24, 12),
  "fresh-ham": core("femur", 32, 16),
  "picnic-roast": core("humerus", 30, 14),
  "boston-butt": core("scapula blade", 6, 0),
  "lamb-shoulder-roast": core("scapula blade", 4, 0),
};

export function boneAnatomyForCut(cut: AnatomicalCut): CutBoneAnatomy | null {
  return cut.geometry3d.hasBone ? (CUT_BONE_ANATOMY[cut.id] ?? null) : null;
}

/** Catalogue default for the bone-in toggle: every `hasBone` cut starts bone-in. */
export function defaultBoneInForCut(cut: AnatomicalCut): boolean {
  return cut.geometry3d.hasBone;
}

/** The 1D column's share of the bone: face/core bones only; through-bones belong to the 3D model. */
export function columnBoneSpec(anatomy: CutBoneAnatomy | null): ColumnBoneSpec | null {
  if (!anatomy || anatomy.placement === "through") return null;
  return { placement: anatomy.placement, corticalMm: anatomy.corticalMm, marrowMm: anatomy.marrowMm };
}

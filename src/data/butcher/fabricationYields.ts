import { STEAK_FOOTPRINT_ASPECT, boneAnatomyForCut } from "@/lib/butcher/science/boneAnatomy";
import { ITIS_TISSUE } from "@/lib/butcher/science/slabColumn";
import { thermophysicalForProximate } from "@/lib/butcher/science/slabDiffusion";
import type { AnatomicalCut, MarblingGrade, OrderYieldTelemetry, SpeciesId, YieldBasis } from "@/lib/butcher/types";
import { getCutById } from "./cutsCatalogue";
import { LITERATURE_YIELDS } from "./literatureYields";

/**
 * Primal-to-retail fabrication yields for the Butcher's Block scorecard.
 *
 * Two bases, never mixed inside one row:
 *  - `LITERATURE` — a published cutting test (see `literatureYields.ts`).
 *  - `MODEL ESTIMATE` — every other cut, generated here from the catalogue:
 *    bone share COMPUTED from the anatomical bone model (`boneAnatomy.ts`) and
 *    IT'IS tissue densities; trim fat by marbling grade and other losses by
 *    species are stated assumptions. The UI badges these as estimates.
 *
 * @file src/data/butcher/fabricationYields.ts
 */

export interface FabricationYieldRow {
  readonly cutId: string;
  readonly fromSubprimal: string;
  readonly usableYieldPct: number;
  readonly trimFatPct: number;
  readonly boneWastePct: number;
  readonly otherLossPct: number;
  readonly basis: YieldBasis;
  readonly source: string;
}

/** ASSUMPTION: external fat trimmed to a ~3 mm retail spec, by marbling grade. */
const TRIM_FAT_PCT_BY_GRADE: Readonly<Record<MarblingGrade, number>> = {
  lean: 3, moderate: 6, "well-marbled": 9, rich: 12,
};

/** ASSUMPTION: silverskin, connective tissue, purge and saw loss by species (finfish adds skin and pin bones). */
const OTHER_LOSS_PCT_BY_SPECIES: Readonly<Record<SpeciesId, number>> = {
  beef: 4, pork: 3, lamb: 4, poultry: 3, finfish: 8,
};

const STEAK_ASPECT = STEAK_FOOTPRINT_ASPECT;

/** Bone share of the as-purchased mass, % — COMPUTED from the anatomical estimate. */
export function estimatedBoneSharePct(cut: AnatomicalCut): number {
  const anatomy = boneAnatomyForCut(cut);
  if (!anatomy) return 0;
  const t = cut.typicalThicknessMm;
  // COMPUTED: the cut's own Choi-Okos lean density (the same value the 3D voxel model uses).
  const leanDensityKgM3 = thermophysicalForProximate(cut.proximate).densityKgM3;
  const meatAreaMm2 = (cut.typicalPortionG / 1000 / leanDensityKgM3) * 1e9 / t;
  let bone: number;
  let meat: number;
  if (anatomy.placement === "face" || (anatomy.placement === "core" && anatomy.marrowMm === 0)) {
    // A plate (rib, or a scapula blade inside a shoulder roast) under the full meat thickness.
    const plateMm = anatomy.placement === "face" ? anatomy.corticalMm : anatomy.corticalMm * 2;
    bone = ITIS_TISSUE.bone.densityKgM3 * plateMm;
    meat = leanDensityKgM3 * t;
  } else if (anatomy.placement === "core") {
    const rBone = anatomy.corticalMm + anatomy.marrowMm / 2;
    const rMarrow = anatomy.marrowMm / 2;
    const rOuter = rBone + t / 2;
    bone = ITIS_TISSUE.bone.densityKgM3 * (rBone ** 2 - rMarrow ** 2) + ITIS_TISSUE.marrow.densityKgM3 * rMarrow ** 2;
    meat = leanDensityKgM3 * (rOuter ** 2 - rBone ** 2);
  } else if (anatomy.through?.kind === "cylinder") {
    const rBone = anatomy.corticalMm + anatomy.marrowMm / 2;
    const rMarrow = anatomy.marrowMm / 2;
    bone = (ITIS_TISSUE.bone.densityKgM3 * (rBone ** 2 - rMarrow ** 2) + ITIS_TISSUE.marrow.densityKgM3 * rMarrow ** 2) * Math.PI * t;
    meat = leanDensityKgM3 * meatAreaMm2 * t;
  } else {
    // Plate through the full thickness t, running the steak's length L = √(A·aspect).
    const lengthMm = Math.sqrt(meatAreaMm2 * STEAK_ASPECT);
    bone = ITIS_TISSUE.bone.densityKgM3 * anatomy.corticalMm * t * lengthMm;
    meat = leanDensityKgM3 * meatAreaMm2 * t;
  }
  return Number(((bone / (bone + meat)) * 100).toFixed(1));
}

export function estimatedYieldForCut(cut: AnatomicalCut): FabricationYieldRow {
  const boneWastePct = estimatedBoneSharePct(cut);
  const trimFatPct = TRIM_FAT_PCT_BY_GRADE[cut.marblingGrade];
  const otherLossPct = OTHER_LOSS_PCT_BY_SPECIES[cut.speciesId];
  return {
    cutId: cut.id,
    fromSubprimal: `${cut.primalName} sub-primal, as purchased`,
    usableYieldPct: Number((100 - boneWastePct - trimFatPct - otherLossPct).toFixed(1)),
    trimFatPct,
    boneWastePct,
    otherLossPct,
    basis: "MODEL ESTIMATE",
    source: "Bone share computed from the anatomical bone model and IT'IS v4.1 densities; trim fat by marbling grade and other losses by species are assumptions.",
  };
}

export function fabricationYieldForCut(cut: AnatomicalCut): FabricationYieldRow {
  return LITERATURE_YIELDS[cut.id] ?? estimatedYieldForCut(cut);
}

/** Scorecard telemetry: how much sub-primal a butcher must buy to net `portionG`. */
export function orderYieldTelemetry(cutId: string, portionG: number): OrderYieldTelemetry | null {
  const cut = getCutById(cutId);
  if (!cut) return null;
  const row = fabricationYieldForCut(cut);
  const usable = Math.max(1, row.usableYieldPct) / 100;
  const asPurchasedG = Math.max(0, portionG) / usable;
  return {
    ...row,
    asPurchasedG: Math.round(asPurchasedG),
    trimFatG: Math.round((asPurchasedG * row.trimFatPct) / 100),
    boneG: Math.round((asPurchasedG * row.boneWastePct) / 100),
  };
}

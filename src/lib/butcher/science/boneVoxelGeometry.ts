import type { AnatomicalCut } from "@/lib/butcher/types";
import type { VoxelGridSpec } from "@/lib/cooking/voxelConduction";
import {
  PORTION_LEAN_DENSITY_KG_M3,
  STEAK_FOOTPRINT_ASPECT,
  boneAnatomyForCut,
  type CutBoneAnatomy,
} from "./boneAnatomy";
import { ITIS_TISSUE } from "./slabColumn";
import { thermophysicalForProximate } from "./slabDiffusion";

/**
 * Voxel geometry for a steak or chop whose bone runs through its thickness:
 * a W × T × L block (x = width, y = thickness, z = length) holding the lean
 * portion plus a cortical plate spanning the full thickness and length, or a
 * marrow-cored cylinder through the thickness (crosscut shank).
 *
 * Materials: 0 = lean (Choi-Okos from the cut's proximate), 1 = cortical
 * bone, 2 = yellow marrow (IT'IS). The lean footprint keeps the cut's
 * typical portion mass; the bone is added beside it, so the block grows.
 *
 * @file src/lib/butcher/science/boneVoxelGeometry.ts
 */

export const VOXEL_LEAN = 0;
export const VOXEL_BONE = 1;
export const VOXEL_MARROW = 2;

/** Grid resolution targets (mm): thickness cells, lateral cells, cell budget. */
const MAX_DY_MM = 2.5;
const MAX_DX_MM = 4;
const MAX_DZ_MM = 6;
const CELL_BUDGET = 24_000;

export interface BoneVoxelLayout {
  readonly spec: VoxelGridSpec;
  readonly anatomy: CutBoneAnatomy;
  readonly widthMm: number;
  readonly thicknessMm: number;
  readonly lengthMm: number;
  readonly dxMm: number;
  readonly dyMm: number;
  readonly dzMm: number;
  /** Lateral x-range of the bone (mm) — the plate, or the cylinder's diameter. */
  readonly boneXMm: readonly [number, number];
}

function itisRhoC(kind: "bone" | "marrow"): number {
  return ITIS_TISSUE[kind].densityKgM3 * ITIS_TISSUE[kind].specificHeatJkgK;
}

/** Lean footprint area, mm², from the cut's typical portion and thickness. */
function leanFootprintMm2(cut: AnatomicalCut, thicknessMm: number): number {
  return ((cut.typicalPortionG / 1000 / PORTION_LEAN_DENSITY_KG_M3) * 1e9) / thicknessMm;
}

interface Lateral {
  readonly widthMm: number;
  readonly lengthMm: number;
  readonly dxMm: number;
  readonly dzMm: number;
  readonly boneXMm: readonly [number, number];
}

function plateLateral(anatomy: CutBoneAnatomy, leanAreaMm2: number, positionFrac: number): Lateral {
  const plateMm = anatomy.corticalMm;
  const leanWidth = Math.sqrt(leanAreaMm2 / STEAK_FOOTPRINT_ASPECT);
  const dxMm = plateMm / Math.max(2, Math.ceil(plateMm / MAX_DX_MM));
  const widthMm = Math.round((leanWidth + plateMm) / dxMm) * dxMm;
  const x0 = Math.round((Math.min(1, Math.max(0, positionFrac)) * (widthMm - plateMm)) / dxMm) * dxMm;
  const lengthMm = leanWidth * STEAK_FOOTPRINT_ASPECT;
  return { widthMm, lengthMm, dxMm, dzMm: lengthMm / Math.max(4, Math.ceil(lengthMm / MAX_DZ_MM)), boneXMm: [x0, x0 + plateMm] };
}

function cylinderLateral(anatomy: CutBoneAnatomy, leanAreaMm2: number): Lateral {
  const odMm = anatomy.corticalMm * 2 + anatomy.marrowMm;
  const totalArea = leanAreaMm2 + Math.PI * (odMm / 2) ** 2;
  const rawWidth = Math.sqrt(totalArea / STEAK_FOOTPRINT_ASPECT);
  const dxMm = Math.min(MAX_DX_MM, odMm / 8);
  const widthMm = Math.round(rawWidth / dxMm) * dxMm;
  const lengthMm = Math.round((rawWidth * STEAK_FOOTPRINT_ASPECT) / dxMm) * dxMm;
  return { widthMm, lengthMm, dxMm, dzMm: dxMm, boneXMm: [widthMm / 2 - odMm / 2, widthMm / 2 + odMm / 2] };
}

function cellMaterial(anatomy: CutBoneAnatomy, lat: Lateral, xMm: number, zMm: number): number {
  if (anatomy.through?.kind === "cylinder") {
    const r = Math.hypot(xMm - lat.widthMm / 2, zMm - lat.lengthMm / 2);
    if (r <= anatomy.marrowMm / 2) return VOXEL_MARROW;
    return r <= anatomy.marrowMm / 2 + anatomy.corticalMm ? VOXEL_BONE : VOXEL_LEAN;
  }
  return xMm >= lat.boneXMm[0] && xMm < lat.boneXMm[1] ? VOXEL_BONE : VOXEL_LEAN;
}

function gridCounts(lat: Lateral, thicknessMm: number): { nx: number; ny: number; nz: number } {
  const nx = Math.max(3, Math.round(lat.widthMm / lat.dxMm));
  const ny = Math.max(8, Math.ceil(thicknessMm / MAX_DY_MM));
  let nz = Math.max(3, Math.round(lat.lengthMm / lat.dzMm));
  while (nx * ny * nz > CELL_BUDGET && nz > 3) nz -= 1;
  return { nx, ny, nz };
}

/** Builds the voxel layout, or null unless the cut's bone runs through its thickness. */
export function buildBoneVoxelLayout(cut: AnatomicalCut, thicknessMm: number): BoneVoxelLayout | null {
  const anatomy = boneAnatomyForCut(cut);
  if (anatomy?.placement !== "through" || !anatomy.through) return null;
  const leanArea = leanFootprintMm2(cut, thicknessMm);
  const lat = anatomy.through.kind === "plate" ? plateLateral(anatomy, leanArea, anatomy.through.positionFrac) : cylinderLateral(anatomy, leanArea);
  const { nx, ny, nz } = gridCounts(lat, thicknessMm);
  const dzMm = lat.lengthMm / nz;
  const material = new Array<number>(nx * ny * nz);
  for (let k = 0; k < nz; k += 1) {
    for (let i = 0; i < nx; i += 1) {
      const m = cellMaterial(anatomy, lat, (i + 0.5) * lat.dxMm, (k + 0.5) * dzMm);
      for (let j = 0; j < ny; j += 1) material[i + nx * (j + ny * k)] = m;
    }
  }
  const lean = thermophysicalForProximate(cut.proximate);
  const dyMm = thicknessMm / ny;
  return {
    spec: {
      nx, ny, nz, dxM: lat.dxMm / 1000, dyM: dyMm / 1000, dzM: dzMm / 1000, material,
      k: [lean.conductivityWmK, ITIS_TISSUE.bone.kWmK, ITIS_TISSUE.marrow.kWmK],
      rhoC: [lean.densityKgM3 * lean.specificHeatJkgK, itisRhoC("bone"), itisRhoC("marrow")],
      initialC: 10,
    },
    anatomy, widthMm: nx * lat.dxMm, thicknessMm, lengthMm: lat.lengthMm, dxMm: lat.dxMm, dyMm, dzMm, boneXMm: lat.boneXMm,
  };
}

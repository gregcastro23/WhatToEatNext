import * as THREE from "three";
import type { AnatomicalCut, SpeciesId, Vec3Tuple } from "@/lib/butcher/types";
import {
  createBoneLandmarkGeometry,
  createLoftedAnatomicalGeometry,
  createMuscleGrainGeometry,
  createSlicingPlaneGeometry,
} from "./carcassLofting";
import { attachFresnelRim } from "./carcassMaterials";
import { leaseButcherGeometry } from "./sharedButcherGeometry";

/**
 * Node construction helpers for the articulated 3D carcass rig (plinth,
 * sub-primal cut mesh + grain lines + bone landmark, and knife slicing plane).
 *
 * @file src/lib/butcher/stage/carcassNodes.ts
 */

export interface ButcherMeshMeta {
  readonly speciesId: SpeciesId;
  readonly primalId: string;
  readonly cutId: string;
  readonly grainVector: Vec3Tuple;
}

export interface CutRigNode {
  readonly cut: AnatomicalCut;
  readonly group: THREE.Group;
  readonly mesh: THREE.Mesh;
  readonly material: THREE.MeshStandardMaterial;
  readonly grainMaterial: THREE.LineBasicMaterial;
}

export const meshMetaMap = new WeakMap<THREE.Object3D, ButcherMeshMeta>();

export function createPlinthMesh(
  leases: Set<string>,
  materials: THREE.Material[],
): THREE.Mesh {
  const blockGeom = leaseButcherGeometry(
    leases,
    "butcher-block-plinth",
    () => new THREE.CylinderGeometry(2.35, 2.45, 0.14, 36),
  );
  const blockMat = new THREE.MeshStandardMaterial({
    color: "#3c2618",
    roughness: 0.72,
    metalness: 0.06,
  });
  materials.push(blockMat);
  const blockMesh = new THREE.Mesh(blockGeom, blockMat);
  blockMesh.name = "ButcherBlockPlinth";
  blockMesh.position.set(0, -1.08, 0);
  return blockMesh;
}

function attachCutBoneLandmark(
  cut: AnatomicalCut,
  cutGroup: THREE.Group,
  meta: ButcherMeshMeta,
  leases: Set<string>,
  materials: THREE.Material[],
): void {
  if (!cut.geometry3d.hasBone) return;
  const boneGeom = leaseButcherGeometry(leases, "bone-landmark-std", () =>
    createBoneLandmarkGeometry(0.18, 0.028),
  );
  const boneMat = new THREE.MeshStandardMaterial({
    color: "#f5eedc",
    roughness: 0.45,
    metalness: 0.05,
  });
  materials.push(boneMat);
  const boneMesh = new THREE.Mesh(boneGeom, boneMat);
  boneMesh.name = `BoneLandmark_${cut.id}`;
  boneMesh.position.set(0, 0.02, -0.05);
  boneMesh.rotation.set(Math.PI * 0.5, 0, 0.2);
  meshMetaMap.set(boneMesh, meta);
  cutGroup.add(boneMesh);
}

export function createCutRigNode(
  cut: AnatomicalCut,
  leases: Set<string>,
  materials: THREE.Material[],
): CutRigNode {
  const cutGroup = new THREE.Group();
  cutGroup.name = `CutGroup_${cut.id}`;
  const [rx, ry, rz] = cut.geometry3d.restPosition;
  cutGroup.position.set(rx, ry, rz);

  const cutGeom = leaseButcherGeometry(leases, `cut_${cut.id}`, () =>
    createLoftedAnatomicalGeometry(cut.geometry3d.sections, {
      axis: cut.geometry3d.loftAxis,
      radialSegments: 24,
    }),
  );
  const material = attachFresnelRim(
    new THREE.MeshStandardMaterial({ color: cut.geometry3d.colorHex, roughness: 0.36, metalness: 0.08 }),
    "#f59e0b",
    2.6,
    0.24,
  );
  materials.push(material);
  const mesh = new THREE.Mesh(cutGeom, material);
  mesh.name = `SubPrimalMesh_${cut.id}`;
  const meta: ButcherMeshMeta = {
    speciesId: cut.speciesId,
    primalId: cut.primalId,
    cutId: cut.id,
    grainVector: cut.grainVector,
  };
  meshMetaMap.set(mesh, meta);
  cutGroup.add(mesh);

  const grainGeom = leaseButcherGeometry(leases, `grain_${cut.id}`, () =>
    createMuscleGrainGeometry(cut.geometry3d.sections, cut.grainVector, cut.geometry3d.loftAxis),
  );
  const grainMat = new THREE.LineBasicMaterial({ color: "#fde68a", transparent: true, opacity: 0.42 });
  materials.push(grainMat);
  const grainLines = new THREE.LineSegments(grainGeom, grainMat);
  grainLines.name = `GrainLines_${cut.id}`;
  cutGroup.add(grainLines);
  attachCutBoneLandmark(cut, cutGroup, meta, leases, materials);

  return { cut, group: cutGroup, mesh, material, grainMaterial: grainMat };
}

export function createSlicingPlaneOverlay(
  leases: Set<string>,
  materials: THREE.Material[],
): {
  readonly slicingPlaneGroup: THREE.Group;
  readonly slicingPlaneMat: THREE.MeshBasicMaterial;
  readonly slicingEdgeMat: THREE.LineBasicMaterial;
} {
  const slicingPlaneGroup = new THREE.Group();
  slicingPlaneGroup.name = "SlicingPlaneGroup";
  slicingPlaneGroup.visible = false;

  const bladeGeom = leaseButcherGeometry(leases, "slicing-blade-plane", () =>
    createSlicingPlaneGeometry(0.68, 0.46),
  );
  const slicingPlaneMat = new THREE.MeshBasicMaterial({
    color: "#38bdf8",
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  materials.push(slicingPlaneMat);
  const bladeMesh = new THREE.Mesh(bladeGeom, slicingPlaneMat);
  bladeMesh.name = "SlicingPlaneMesh";
  slicingPlaneGroup.add(bladeMesh);

  const edgeGeom = leaseButcherGeometry(leases, "slicing-blade-edges", () =>
    new THREE.EdgesGeometry(bladeGeom),
  );
  const slicingEdgeMat = new THREE.LineBasicMaterial({ color: "#7dd3fc" });
  materials.push(slicingEdgeMat);
  const edgeLines = new THREE.LineSegments(edgeGeom, slicingEdgeMat);
  edgeLines.name = "SlicingPlaneEdges";
  slicingPlaneGroup.add(edgeLines);

  return { slicingPlaneGroup, slicingPlaneMat, slicingEdgeMat };
}

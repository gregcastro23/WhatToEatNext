import * as THREE from "three";
import type { SpeciesId } from "@/lib/butcher/types";
import { createBoneLandmarkGeometry } from "./carcassLofting";
import { leaseButcherGeometry } from "./sharedButcherGeometry";
import { SKELETON_LANDMARKS, type SkeletonLandmark } from "./skeletonLandmarks";

/**
 * "X-ray" skeletal landmarks for the 3D carcass rig. Each landmark is a
 * Y-axis bone cylinder oriented start → end inside its PRIMAL group (so it
 * explodes with the primal), hidden by default, never registered for picking,
 * and never shadow-casting.
 *
 * @file src/lib/butcher/stage/carcassSkeleton.ts
 */

export const SKELETON_MESH_PREFIX = "SkeletonLandmark_";
export const DEFAULT_XRAY_MUSCLE_OPACITY = 0.42;

const _yAxis = new THREE.Vector3(0, 1, 0);
const _boneDir = new THREE.Vector3();

export function createSkeletonMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: "#eee4c8",
    roughness: 0.58,
    metalness: 0.02,
    emissive: "#3b3322",
    emissiveIntensity: 0.22,
  });
  material.name = "SkeletonLandmarkMaterial";
  return material;
}

function createLandmarkMesh(
  speciesId: SpeciesId,
  landmark: SkeletonLandmark,
  leases: Set<string>,
  material: THREE.Material,
): THREE.Mesh {
  const [sx, sy, sz] = landmark.start;
  const [ex, ey, ez] = landmark.end;
  _boneDir.set(ex - sx, ey - sy, ez - sz);
  const length = Math.max(1e-3, _boneDir.length());
  const geometry = leaseButcherGeometry(leases, `skeleton_${speciesId}_${landmark.id}`, () =>
    createBoneLandmarkGeometry(length, landmark.radius),
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${SKELETON_MESH_PREFIX}${landmark.id}`;
  mesh.position.set((sx + ex) * 0.5, (sy + ey) * 0.5, (sz + ez) * 0.5);
  if (_boneDir.lengthSq() > 1e-12) {
    mesh.quaternion.setFromUnitVectors(_yAxis, _boneDir.normalize());
  }
  mesh.visible = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}

/** Adds the landmarks of one primal to its group and returns the new meshes. */
export function attachPrimalSkeleton(
  speciesId: SpeciesId,
  primalId: string,
  primalGroup: THREE.Group,
  leases: Set<string>,
  material: THREE.Material,
): THREE.Mesh[] {
  return SKELETON_LANDMARKS[speciesId]
    .filter((landmark) => landmark.primalId === primalId)
    .map((landmark) => {
      const mesh = createLandmarkMesh(speciesId, landmark, leases, material);
      primalGroup.add(mesh);
      return mesh;
    });
}

export function normalizeMuscleOpacity(raw: number | undefined): number {
  if (raw === undefined || !Number.isFinite(raw)) return DEFAULT_XRAY_MUSCLE_OPACITY;
  return Math.min(1, Math.max(0.05, raw));
}

/**
 * Shows/hides the landmark meshes and dims (or restores) the cut muscle
 * materials. `needsUpdate` is raised only when a program-affecting flag
 * flips, so re-applying the same state (e.g. after a colour-mode change)
 * costs no shader rebuild.
 */
export function applySkeletonXray(
  landmarks: readonly THREE.Object3D[],
  muscles: readonly THREE.MeshStandardMaterial[],
  visible: boolean,
  muscleOpacity: number,
): void {
  for (const mesh of landmarks) {
    mesh.visible = visible;
  }
  for (const material of muscles) {
    const flagsChanged = material.transparent !== visible || material.depthWrite === visible;
    material.transparent = visible;
    material.depthWrite = !visible;
    material.opacity = visible ? muscleOpacity : 1;
    if (flagsChanged) material.needsUpdate = true;
  }
}

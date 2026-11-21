import * as THREE from "three";
import { getCutsForSpecies, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { knifeNormalAtAngle } from "@/lib/butcher/science/knifeGeometry";
import type { ColorOverlayMode, SpeciesId, Vec3Tuple } from "@/lib/butcher/types";
import {
  applyButcherShadowPolicy,
  applyCutVisualHighlight,
  colorHexForOverlay,
} from "./carcassMaterials";
import {
  type CutRigNode,
  createCutRigNode,
  createPlinthMesh,
  createSlicingPlaneOverlay,
} from "./carcassNodes";
import {
  applySkeletonXray,
  attachPrimalSkeleton,
  createSkeletonMaterial,
  normalizeMuscleOpacity,
} from "./carcassSkeleton";
import { releaseButcherGeometries } from "./sharedButcherGeometry";
import { sliceAngleCue } from "./sliceAngleCue";
import {
  type SliceSectionRing,
  type SliceSectionState,
  createSliceSectionRing,
  disposeSliceSectionRing,
  hideSliceSectionRing,
  sliceSectionSnapshot,
  updateSliceSectionRing,
} from "./sliceSectionRing";

export {
  applyButcherShadowPolicy,
  attachFresnelRim,
  setButcherRimUniforms,
} from "./carcassMaterials";
export { type PickedButcherCutResult, pickButcherCut } from "./carcassPicking";

/**
 * Articulated 3D Carcass Rig & Picking System adapted from Pentacles `vessel-avatar-3d.ts`.
 *
 * Uses WeakMaps instead of `Object3D.userData` (`any`) and tracks allocated materials
 * directly so `disposeCarcassRig` triggers zero `no-unsafe-*` lint warnings.
 *
 * @file src/lib/butcher/stage/carcassAvatar3d.ts
 */

interface PrimalRigNode {
  readonly group: THREE.Group;
  readonly restPosition: Vec3Tuple;
  readonly explodeVector: Vec3Tuple;
}

interface CarcassRigState {
  readonly leases: Set<string>;
  readonly materials: THREE.Material[];
  readonly primals: readonly PrimalRigNode[];
  readonly cutsById: ReadonlyMap<string, CutRigNode>;
  readonly slicingPlaneGroup: THREE.Group;
  readonly slicingPlaneMat: THREE.MeshBasicMaterial;
  readonly slicingEdgeMat: THREE.LineBasicMaterial;
  readonly sectionRing: SliceSectionRing;
  readonly skeletonMeshes: readonly THREE.Mesh[];
  xrayVisible: boolean;
  xrayOpacity: number;
  disposed: boolean;
}

export interface BoneLandmarkState {
  readonly visible: boolean;
  readonly landmarkCount: number;
  readonly muscleOpacity: number;
}


const rigStateMap = new WeakMap<THREE.Group, CarcassRigState>();

interface PrimalBuild {
  readonly primals: PrimalRigNode[];
  readonly cutsById: Map<string, CutRigNode>;
  readonly skeletonMeshes: THREE.Mesh[];
}

/** Builds every primal group with its cuts and (hidden) skeletal landmarks. */
function buildPrimals(
  speciesId: SpeciesId,
  root: THREE.Group,
  leases: Set<string>,
  materials: THREE.Material[],
): PrimalBuild {
  const species = getSpeciesSpec(speciesId);
  const cuts = getCutsForSpecies(speciesId);
  const primals: PrimalRigNode[] = [];
  const cutsById = new Map<string, CutRigNode>();
  const skeletonMaterial = createSkeletonMaterial();
  materials.push(skeletonMaterial);
  const skeletonMeshes: THREE.Mesh[] = [];

  for (const primal of species.primals) {
    const primalGroup = new THREE.Group();
    primalGroup.name = `PrimalGroup_${primal.id}`;
    primalGroup.position.set(primal.restPosition[0], primal.restPosition[1], primal.restPosition[2]);
    root.add(primalGroup);
    primals.push({ group: primalGroup, restPosition: primal.restPosition, explodeVector: primal.explodeVector });
    skeletonMeshes.push(...attachPrimalSkeleton(speciesId, primal.id, primalGroup, leases, skeletonMaterial));

    for (const cut of cuts.filter((c) => c.primalId === primal.id)) {
      const cutNode = createCutRigNode(cut, leases, materials);
      primalGroup.add(cutNode.group);
      cutsById.set(cut.id, cutNode);
    }
  }
  return { primals, cutsById, skeletonMeshes };
}

export function createCarcassRig(speciesId: SpeciesId): THREE.Group {
  const leases = new Set<string>();
  const materials: THREE.Material[] = [];
  const root = new THREE.Group();
  root.name = `CarcassRoot_${speciesId}`;
  root.add(createPlinthMesh(leases, materials));
  const { primals, cutsById, skeletonMeshes } = buildPrimals(speciesId, root, leases, materials);

  const slicingOverlay = createSlicingPlaneOverlay(leases, materials);
  root.add(slicingOverlay.slicingPlaneGroup);
  const sectionRing = createSliceSectionRing();
  root.add(sectionRing.line);
  applyButcherShadowPolicy(root);

  rigStateMap.set(root, {
    leases,
    materials,
    primals,
    cutsById,
    slicingPlaneGroup: slicingOverlay.slicingPlaneGroup,
    slicingPlaneMat: slicingOverlay.slicingPlaneMat,
    slicingEdgeMat: slicingOverlay.slicingEdgeMat,
    sectionRing,
    skeletonMeshes,
    xrayVisible: false,
    xrayOpacity: 1,
    disposed: false,
  });
  return root;
}

export function setCarcassExplodeFactor(rig: THREE.Group, rawFactor: number): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;
  const factor = Math.min(1, Math.max(0, Number.isFinite(rawFactor) ? rawFactor : 0));

  for (const primal of state.primals) {
    primal.group.position.set(
      primal.restPosition[0] + primal.explodeVector[0] * factor,
      primal.restPosition[1] + primal.explodeVector[1] * factor,
      primal.restPosition[2] + primal.explodeVector[2] * factor,
    );
  }
  for (const node of state.cutsById.values()) {
    const { restPosition, explodeVector } = node.cut.geometry3d;
    node.group.position.set(
      restPosition[0] + explodeVector[0] * factor,
      restPosition[1] + explodeVector[1] * factor,
      restPosition[2] + explodeVector[2] * factor,
    );
  }
}

export function applyCarcassColorMode(
  rig: THREE.Group,
  opts: {
    readonly mode: ColorOverlayMode;
    readonly selectedCutId: string;
    readonly hoveredCutId: string | null;
    readonly targetCutId: string | null;
  },
): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;

  for (const [cutId, node] of state.cutsById.entries()) {
    node.material.color.set(colorHexForOverlay(node.cut, opts.mode));
    const highlight =
      cutId === opts.selectedCutId
        ? "selected"
        : cutId === opts.hoveredCutId
          ? "hovered"
          : cutId === opts.targetCutId
            ? "target"
            : "default";
    applyCutVisualHighlight(node.mesh, node.material, node.grainMaterial, highlight);
  }
  if (state.xrayVisible) applyRigXray(state);
}

function applyRigXray(state: CarcassRigState): void {
  const muscles = [...state.cutsById.values()].map((node) => node.material);
  applySkeletonXray(state.skeletonMeshes, muscles, state.xrayVisible, state.xrayOpacity);
}

/**
 * Toggles the skeletal "X-ray": shows every landmark bone and dims every cut
 * muscle to `muscleOpacity` (transparent, no depth write), or hides them and
 * restores opaque muscles. Survives repeated toggles and colour-mode changes.
 */
export function setBoneLandmarksVisible(rig: THREE.Group, visible: boolean, muscleOpacity?: number): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;
  state.xrayVisible = visible;
  state.xrayOpacity = visible ? normalizeMuscleOpacity(muscleOpacity) : 1;
  applyRigXray(state);
}

export function getBoneLandmarkState(rig: THREE.Group): BoneLandmarkState | null {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return null;
  return {
    visible: state.xrayVisible,
    landmarkCount: state.skeletonMeshes.length,
    muscleOpacity: state.xrayOpacity,
  };
}

export function getSliceSectionState(rig: THREE.Group): SliceSectionState | null {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return null;
  return sliceSectionSnapshot(state.sectionRing);
}

const _cutWorldPos = new THREE.Vector3();

/** World position of a cut's mesh (after explode), for aiming the Butcher Block camera at it. */
export function getCutWorldPosition(rig: THREE.Group, cutId: string): Vec3Tuple | null {
  const state = rigStateMap.get(rig);
  const node = state?.cutsById.get(cutId);
  if (!state || state.disposed || !node) return null;
  rig.updateMatrixWorld(true);
  node.mesh.getWorldPosition(_cutWorldPos);
  return [_cutWorldPos.x, _cutWorldPos.y, _cutWorldPos.z];
}

const _sliceTargetWorld = new THREE.Vector3();
const _slicePlaneNormal = new THREE.Vector3();
const _sliceZAxis = new THREE.Vector3(0, 0, 1);

export function updateSlicingPlane(
  rig: THREE.Group,
  opts: { readonly visible: boolean; readonly cutId: string; readonly angleDeg: number },
): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;
  const cutNode = state.cutsById.get(opts.cutId);
  if (!opts.visible || !cutNode) {
    state.slicingPlaneGroup.visible = false;
    hideSliceSectionRing(state.sectionRing);
    return;
  }

  rig.updateMatrixWorld(true);
  cutNode.mesh.getWorldPosition(_sliceTargetWorld);
  rig.worldToLocal(_sliceTargetWorld);
  const normalTuple = knifeNormalAtAngle(opts.angleDeg, cutNode.cut.grainVector);
  _slicePlaneNormal.set(normalTuple[0], normalTuple[1], normalTuple[2]).normalize();

  state.slicingPlaneGroup.visible = true;
  state.slicingPlaneGroup.position.copy(_sliceTargetWorld);
  state.slicingPlaneGroup.quaternion.setFromUnitVectors(_sliceZAxis, _slicePlaneNormal);

  const { colorHex } = sliceAngleCue(opts.angleDeg);
  state.slicingPlaneMat.color.set(colorHex);
  state.slicingEdgeMat.color.set(colorHex);
  updateSliceSectionRing(state.sectionRing, { rig, mesh: cutNode.mesh, normal: _slicePlaneNormal, colorHex });
}

export function disposeCarcassRig(rig: THREE.Group): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;
  state.disposed = true;
  for (const mat of state.materials) {
    mat.dispose();
  }
  disposeSliceSectionRing(state.sectionRing);
  releaseButcherGeometries(state.leases);
  rigStateMap.delete(rig);
}

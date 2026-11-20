import * as THREE from "three";
import { getCutsForSpecies, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import { knifeNormalAtAngle } from "@/lib/butcher/science/butcherGame";
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
  meshMetaMap,
} from "./carcassNodes";
import { releaseButcherGeometries } from "./sharedButcherGeometry";

export {
  applyButcherShadowPolicy,
  attachFresnelRim,
  setButcherRimUniforms,
} from "./carcassMaterials";

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
  disposed: boolean;
}

export interface PickedButcherCutResult {
  readonly speciesId: SpeciesId;
  readonly primalId: string;
  readonly cutId: string;
  readonly hitPoint: Vec3Tuple;
  readonly grainVector: Vec3Tuple;
}

const rigStateMap = new WeakMap<THREE.Group, CarcassRigState>();

export function createCarcassRig(speciesId: SpeciesId): THREE.Group {
  const species = getSpeciesSpec(speciesId);
  const cuts = getCutsForSpecies(speciesId);
  const leases = new Set<string>();
  const materials: THREE.Material[] = [];
  const root = new THREE.Group();
  root.name = `CarcassRoot_${speciesId}`;
  root.add(createPlinthMesh(leases, materials));

  const primals: PrimalRigNode[] = [];
  const cutsById = new Map<string, CutRigNode>();

  for (const primal of species.primals) {
    const primalGroup = new THREE.Group();
    primalGroup.name = `PrimalGroup_${primal.id}`;
    primalGroup.position.set(primal.restPosition[0], primal.restPosition[1], primal.restPosition[2]);
    root.add(primalGroup);
    primals.push({ group: primalGroup, restPosition: primal.restPosition, explodeVector: primal.explodeVector });

    for (const cut of cuts.filter((c) => c.primalId === primal.id)) {
      const cutNode = createCutRigNode(cut, leases, materials);
      primalGroup.add(cutNode.group);
      cutsById.set(cut.id, cutNode);
    }
  }

  const slicingOverlay = createSlicingPlaneOverlay(leases, materials);
  root.add(slicingOverlay.slicingPlaneGroup);
  applyButcherShadowPolicy(root);

  rigStateMap.set(root, {
    leases,
    materials,
    primals,
    cutsById,
    slicingPlaneGroup: slicingOverlay.slicingPlaneGroup,
    slicingPlaneMat: slicingOverlay.slicingPlaneMat,
    slicingEdgeMat: slicingOverlay.slicingEdgeMat,
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

  const bladeColor = opts.angleDeg >= 75 ? "#34d399" : opts.angleDeg >= 45 ? "#fbbf24" : "#f87171";
  state.slicingPlaneMat.color.set(bladeColor);
  state.slicingEdgeMat.color.set(bladeColor);
}

export function pickButcherCut(
  raycaster: THREE.Raycaster,
  rig: THREE.Object3D,
): PickedButcherCutResult | null {
  const intersects = raycaster.intersectObjects(rig.children, true);
  for (const hit of intersects) {
    if (!(hit.object instanceof THREE.Mesh)) continue;
    const meta = meshMetaMap.get(hit.object);
    if (meta) {
      return {
        speciesId: meta.speciesId,
        primalId: meta.primalId,
        cutId: meta.cutId,
        hitPoint: [
          Number(hit.point.x.toFixed(4)),
          Number(hit.point.y.toFixed(4)),
          Number(hit.point.z.toFixed(4)),
        ],
        grainVector: meta.grainVector,
      };
    }
  }
  return null;
}

export function disposeCarcassRig(rig: THREE.Group): void {
  const state = rigStateMap.get(rig);
  if (!state || state.disposed) return;
  state.disposed = true;
  for (const mat of state.materials) {
    mat.dispose();
  }
  releaseButcherGeometries(state.leases);
  rigStateMap.delete(rig);
}

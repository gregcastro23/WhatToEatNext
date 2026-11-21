import * as THREE from "three";
import type { SpeciesId, Vec3Tuple } from "@/lib/butcher/types";
import { meshMetaMap } from "./carcassNodes";

/**
 * Raycast picking for the carcass rig: returns the first hit registered in
 * `meshMetaMap` (cut meshes and their bone nubs). Skeleton landmarks, the
 * slicing plane and the section ring are never registered, so rays pass them.
 *
 * @file src/lib/butcher/stage/carcassPicking.ts
 */

export interface PickedButcherCutResult {
  readonly speciesId: SpeciesId;
  readonly primalId: string;
  readonly cutId: string;
  readonly hitPoint: Vec3Tuple;
  readonly grainVector: Vec3Tuple;
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

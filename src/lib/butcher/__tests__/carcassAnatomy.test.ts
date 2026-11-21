/**
 * @jest-environment node
 *
 * V2-1 anatomical polish: slice-angle cue bands, the knife cross-section ring,
 * surface-flush grain ticks, section-sized bone nubs, and X-ray skeletal
 * landmarks (3D rig + SVG projection).
 */
import * as THREE from "three";
import { BUTCHER_CUTS, SPECIES_LIST, getCutsForSpecies, getSpeciesSpec } from "@/data/butcher/cutsCatalogue";
import {
  applyCarcassColorMode,
  createCarcassRig,
  disposeCarcassRig,
  getBoneLandmarkState,
  getSliceSectionState,
  setBoneLandmarksVisible,
  setCarcassExplodeFactor,
  updateSlicingPlane,
} from "@/lib/butcher/stage/carcassAvatar3d";
import { createMuscleGrainGeometry } from "@/lib/butcher/stage/carcassLofting";
import { meshMetaMap } from "@/lib/butcher/stage/carcassNodes";
import { computePlaneSectionSegments } from "@/lib/butcher/stage/crossSection";
import { sharedButcherGeometryStats } from "@/lib/butcher/stage/sharedButcherGeometry";
import { SKELETON_LANDMARKS, projectLandmarksToSvg } from "@/lib/butcher/stage/skeletonLandmarks";
import { SLICE_CUE_COLORS, sliceAngleCue } from "@/lib/butcher/stage/sliceAngleCue";
import type { AnatomicalCut, LoftSection } from "@/lib/butcher/types";

function sectionAt(sections: readonly LoftSection[], axisPos: number): readonly number[] | null {
  for (let i = 0; i + 1 < sections.length; i += 1) {
    const a = sections[i];
    const b = sections[i + 1];
    if (!a || !b || axisPos < a[0] - 1e-9 || axisPos > b[0] + 1e-9) continue;
    const f = (axisPos - a[0]) / (b[0] - a[0]);
    return a.map((v, k) => v + ((b[k] ?? v) - v) * f);
  }
  return null;
}

function meshOf(rig: THREE.Object3D, name: string): THREE.Mesh {
  const obj = rig.getObjectByName(name);
  if (!(obj instanceof THREE.Mesh)) throw new Error(`missing mesh ${name}`);
  return obj;
}

function boxInParent(mesh: THREE.Mesh): THREE.Box3 {
  mesh.updateMatrix();
  mesh.geometry.computeBoundingBox();
  return (mesh.geometry.boundingBox ?? new THREE.Box3()).clone().applyMatrix4(mesh.matrix);
}

function hexOf(material: THREE.Material | THREE.Material[]): string {
  return material instanceof THREE.MeshBasicMaterial ? `#${material.color.getHexString()}` : "";
}

describe("sliceAngleCue", () => {
  it.each([
    [90, "cross-grain"], [75, "cross-grain"], [74.9, "bias"], [45, "bias"], [30, "bias"],
    [29.9, "parallel"], [0, "parallel"], [140, "cross-grain"], [-20, "parallel"], [Number.NaN, "parallel"],
  ] as const)("%p° → %s", (angle, band) => {
    const cue = sliceAngleCue(angle);
    expect(cue.band).toBe(band);
    expect(cue.colorHex).toBe(SLICE_CUE_COLORS[band]);
  });

  it("labels each band and keeps the canonical palette", () => {
    expect(SLICE_CUE_COLORS).toEqual({ "cross-grain": "#34d399", bias: "#fbbf24", parallel: "#ef4444" });
    expect(sliceAngleCue(90).label).toBe("Cross-grain");
    expect(sliceAngleCue(50).label).toBe("Bias cut");
    expect(sliceAngleCue(10).label).toBe("Parallel / stringy");
  });
});

describe("computePlaneSectionSegments", () => {
  function totalLength(seg: Float32Array): number {
    let sum = 0;
    for (let i = 0; i + 5 < seg.length; i += 6) {
      sum += Math.hypot((seg[i] ?? 0) - (seg[i + 3] ?? 0), (seg[i + 1] ?? 0) - (seg[i + 4] ?? 0), (seg[i + 2] ?? 0) - (seg[i + 5] ?? 0));
    }
    return sum;
  }

  it("traces a box's square outline once, including planes through vertex rows", () => {
    const box = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
    for (const [normal, c] of [[[1, 0, 0], 0], [[1, 0, 0], 0.25], [[0, 2, 0], 0]] as const) {
      const seg = computePlaneSectionSegments(box, normal, c);
      expect(seg.every((v) => Number.isFinite(v))).toBe(true);
      expect(totalLength(seg)).toBeCloseTo(4, 6);
    }
    expect(computePlaneSectionSegments(box, [0, 0, 0])).toHaveLength(0);
    box.dispose();
  });
});

describe("knife cross-section ring", () => {
  it("outlines every cut at 90/45/10° in the cue colour and hides with the plane", () => {
    for (const species of SPECIES_LIST) {
      const rig = createCarcassRig(species.id);
      for (const cut of getCutsForSpecies(species.id)) {
        const mesh = meshOf(rig, `SubPrimalMesh_${cut.id}`);
        const rel = new THREE.Quaternion();
        mesh.getWorldQuaternion(rel);
        expect(rel.angleTo(new THREE.Quaternion())).toBeLessThan(1e-9);
        for (const angleDeg of [90, 45, 10]) {
          updateSlicingPlane(rig, { visible: true, cutId: cut.id, angleDeg });
          const { colorHex } = sliceAngleCue(angleDeg);
          const ring = getSliceSectionState(rig);
          expect([ring?.visible, ring?.colorHex]).toEqual([true, colorHex]);
          expect(ring?.segmentCount).toBeGreaterThan(0);
          expect(hexOf(meshOf(rig, "SlicingPlaneMesh").material)).toBe(colorHex);
        }
        updateSlicingPlane(rig, { visible: false, cutId: cut.id, angleDeg: 90 });
        expect(getSliceSectionState(rig)?.visible).toBe(false);
      }
      disposeCarcassRig(rig);
    }
  });

  it("places ring points on the knife plane at the cut origin and disposes them with the rig", () => {
    const rig = createCarcassRig("beef");
    updateSlicingPlane(rig, { visible: true, cutId: "ribeye", angleDeg: 45 });
    const ring = rig.getObjectByName("SliceSectionRing");
    const plane = rig.getObjectByName("SlicingPlaneGroup");
    if (!(ring instanceof THREE.LineSegments) || !plane) throw new Error("ring missing");
    expect(ring.position.distanceTo(plane.position)).toBeLessThan(1e-9);
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.quaternion);
    const pos = ring.geometry.getAttribute("position");
    for (let i = 0; i < ring.geometry.drawRange.count; i += 1) {
      expect(Math.abs(normal.dot(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))))).toBeLessThan(1e-5);
    }
    const disposed: string[] = [];
    ring.geometry.addEventListener("dispose", () => disposed.push("geometry"));
    if (ring.material instanceof THREE.Material) ring.material.addEventListener("dispose", () => disposed.push("material"));
    disposeCarcassRig(rig);
    expect(disposed.sort()).toEqual(["geometry", "material"]);
    expect(getSliceSectionState(rig)).toBeNull();
    expect(sharedButcherGeometryStats()).toEqual({ geometries: 0, leases: 0 });
  });
});

describe("surface-flush grain ticks", () => {
  it("keeps all 14 vertices of every cut on the visible face of its lofted surface", () => {
    for (const cut of BUTCHER_CUTS) {
      const { sections, loftAxis } = cut.geometry3d;
      const grain = createMuscleGrainGeometry(sections, cut.grainVector, loftAxis);
      const pos = grain.getAttribute("position");
      expect(pos.count).toBe(14);
      const axisValues = sections.map((s) => s[0]);
      for (let i = 0; i < pos.count; i += 1) {
        const axisPos = loftAxis === "x" ? pos.getX(i) : pos.getY(i);
        const u = loftAxis === "x" ? pos.getY(i) : pos.getX(i);
        expect(axisPos).toBeGreaterThanOrEqual(Math.min(...axisValues) - 1e-9);
        expect(axisPos).toBeLessThanOrEqual(Math.max(...axisValues) + 1e-9);
        const [, w = 1, d = 1, offU = 0, offV = 0] = sectionAt(sections, axisPos) ?? [];
        const radius = Math.hypot((u - offU) / w, (pos.getZ(i) - offV) / d);
        expect(radius).toBeGreaterThanOrEqual(0.95);
        expect(radius).toBeLessThanOrEqual(1.08);
        expect(pos.getZ(i)).toBeGreaterThan(offV);
        if (i % 2 === 1) {
          const tickLen = Math.hypot(pos.getX(i) - pos.getX(i - 1), pos.getY(i) - pos.getY(i - 1), pos.getZ(i) - pos.getZ(i - 1));
          expect(tickLen).toBeLessThanOrEqual(0.42 * Math.min(w, d));
        }
      }
      grain.dispose();
    }
  });
});

describe("section-sized bone nubs", () => {
  it("keeps every bone-in cut's bone inside its muscle (12 % bbox margin) and section-sized", () => {
    const boneCuts = BUTCHER_CUTS.filter((cut: AnatomicalCut) => cut.geometry3d.hasBone);
    expect(boneCuts.length).toBeGreaterThan(10);
    for (const species of SPECIES_LIST) {
      const rig = createCarcassRig(species.id);
      for (const cut of boneCuts.filter((c) => c.speciesId === species.id)) {
        const bone = meshOf(rig, `BoneLandmark_${cut.id}`);
        const muscleBox = boxInParent(meshOf(rig, `SubPrimalMesh_${cut.id}`));
        const margin = muscleBox.getSize(new THREE.Vector3()).multiplyScalar(0.06);
        expect(muscleBox.clone().expandByVector(margin).containsBox(boxInParent(bone))).toBe(true);
        const { sections } = cut.geometry3d;
        const narrowest = Math.min(...sections.map((s) => Math.min(s[1], s[2])));
        const span = Math.abs((sections[sections.length - 1]?.[0] ?? 0) - (sections[0]?.[0] ?? 0));
        if (!(bone.geometry instanceof THREE.CylinderGeometry)) throw new Error("bone geometry");
        const { radiusTop, radiusBottom, height } = bone.geometry.parameters;
        expect(Math.max(radiusTop, radiusBottom)).toBeLessThanOrEqual(Math.min(0.028, 0.3 * narrowest) + 1e-9);
        expect(height).toBeLessThanOrEqual(0.8 * span + 1e-9);
      }
      disposeCarcassRig(rig);
    }
  });
});

describe("skeletal landmarks catalogue", () => {
  it("authors ≥ 4 valid, uniquely named landmarks per species", () => {
    const ids = new Set<string>();
    for (const species of SPECIES_LIST) {
      const landmarks = SKELETON_LANDMARKS[species.id];
      const primalIds = new Set(species.primals.map((p) => p.id));
      const cutIds = new Set(getCutsForSpecies(species.id).map((c) => c.id));
      expect(landmarks.length).toBeGreaterThanOrEqual(4);
      for (const lm of landmarks) {
        expect(ids.has(lm.id)).toBe(false);
        ids.add(lm.id);
        expect(primalIds.has(lm.primalId)).toBe(true);
        expect(lm.explainsCutIds.length).toBeGreaterThan(0);
        for (const cutId of lm.explainsCutIds) expect(cutIds.has(cutId)).toBe(true);
        expect(lm.radius).toBeGreaterThan(0);
        expect(lm.radius).toBeLessThanOrEqual(0.05);
        expect(Math.hypot(lm.end[0] - lm.start[0], lm.end[1] - lm.start[1], lm.end[2] - lm.start[2])).toBeGreaterThan(0.05);
        expect(lm.note).toMatch(/^[A-Z].*\.$/);
        expect(lm.label.length).toBeGreaterThan(2);
      }
    }
  });

  it("projects every landmark to finite SVG points inside the species viewBox", () => {
    for (const species of SPECIES_LIST) {
      const [minX = 0, minY = 0, width = 0, height = 0] = getSpeciesSpec(species.id).svgViewBox.split(" ").map(Number);
      const projected = projectLandmarksToSvg(species.id);
      expect(projected.map((p) => p.id)).toEqual(SKELETON_LANDMARKS[species.id].map((l) => l.id));
      for (const p of projected) {
        for (const x of [p.x1, p.x2]) expect(x).toBeGreaterThanOrEqual(minX + 4);
        for (const x of [p.x1, p.x2]) expect(x).toBeLessThanOrEqual(minX + width - 4);
        for (const y of [p.y1, p.y2]) expect(y).toBeGreaterThanOrEqual(minY + 4);
        for (const y of [p.y1, p.y2]) expect(y).toBeLessThanOrEqual(minY + height - 4);
      }
    }
  });
});

describe("X-ray skeleton in the 3D rig", () => {
  function muscles(rig: THREE.Group, speciesCuts: readonly AnatomicalCut[]): THREE.MeshStandardMaterial[] {
    return speciesCuts.map((cut) => {
      const { material } = meshOf(rig, `SubPrimalMesh_${cut.id}`);
      if (!(material instanceof THREE.MeshStandardMaterial)) throw new Error("muscle material");
      return material;
    });
  }

  it("builds hidden, unpickable, shadowless landmarks in their primal groups", () => {
    for (const species of SPECIES_LIST) {
      const rig = createCarcassRig(species.id);
      const landmarks = SKELETON_LANDMARKS[species.id];
      expect(getBoneLandmarkState(rig)).toEqual({ visible: false, landmarkCount: landmarks.length, muscleOpacity: 1 });
      for (const lm of landmarks) {
        const mesh = meshOf(rig, `SkeletonLandmark_${lm.id}`);
        expect(mesh.parent?.name).toBe(`PrimalGroup_${lm.primalId}`);
        expect(mesh.visible).toBe(false);
        expect(mesh.castShadow).toBe(false);
        expect(meshMetaMap.get(mesh)).toBeUndefined();
      }
      disposeCarcassRig(rig);
      expect(getBoneLandmarkState(rig)).toBeNull();
      expect(sharedButcherGeometryStats().geometries).toBe(0);
    }
  });

  it("dims muscles while visible, survives colour modes and toggles, and restores when hidden", () => {
    const rig = createCarcassRig("poultry");
    const cuts = getCutsForSpecies("poultry");
    const landmarkMeshes = SKELETON_LANDMARKS.poultry.map((lm) => meshOf(rig, `SkeletonLandmark_${lm.id}`));
    const femur = meshOf(rig, "SkeletonLandmark_poultry-femur");
    const restPos = femur.getWorldPosition(new THREE.Vector3());
    setCarcassExplodeFactor(rig, 1);
    rig.updateMatrixWorld(true);
    expect(femur.getWorldPosition(new THREE.Vector3()).distanceTo(restPos)).toBeGreaterThan(0.1);
    for (let round = 0; round < 3; round += 1) {
      setBoneLandmarksVisible(rig, true);
      for (const mode of ["anatomical", "marbling", "collagen", "thermal"] as const) {
        applyCarcassColorMode(rig, { mode, selectedCutId: "chicken-thigh", hoveredCutId: "breast-supreme", targetCutId: null });
      }
      expect(getBoneLandmarkState(rig)).toEqual({ visible: true, landmarkCount: landmarkMeshes.length, muscleOpacity: 0.42 });
      expect(landmarkMeshes.every((m) => m.visible)).toBe(true);
      for (const mat of muscles(rig, cuts)) expect([mat.transparent, mat.opacity, mat.depthWrite]).toEqual([true, 0.42, false]);
      setBoneLandmarksVisible(rig, true, 0.3);
      expect(muscles(rig, cuts).every((mat) => mat.opacity === 0.3)).toBe(true);
      setBoneLandmarksVisible(rig, false);
      expect(landmarkMeshes.some((m) => m.visible)).toBe(false);
      for (const mat of muscles(rig, cuts)) expect([mat.transparent, mat.opacity, mat.depthWrite]).toEqual([false, 1, true]);
    }
    disposeCarcassRig(rig);
    expect(sharedButcherGeometryStats()).toEqual({ geometries: 0, leases: 0 });
  });
});

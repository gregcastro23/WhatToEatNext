import * as THREE from "three";
import type { LoftSection } from "@/lib/butcher/types";
import { DEFAULT_ORGANIC_RIBBING, loftContour, subdivideSections } from "./loftProfile";

export { createMuscleGrainGeometry } from "./muscleGrain";

/**
 * Procedural cross-section lofting adapted from Pentacles `vessel-tailoring.ts`
 * (`tailoredSurface`), extended with organic cut capping, directional muscle
 * fiber grain ticks (see `muscleGrain.ts`), bone-cap landmarks, and knife slicing plane builders.
 *
 * @file src/lib/butcher/stage/carcassLofting.ts
 */

export interface LoftOptions {
  readonly axis?: "x" | "y";
  readonly radialSegments?: number;
  readonly organicRibbing?: number;
  readonly capEnds?: boolean;
}

function pushPointByAxis(
  vertices: number[],
  axis: "x" | "y",
  axisPos: number,
  uCoord: number,
  vCoord: number,
): void {
  if (axis === "x") {
    vertices.push(axisPos, uCoord, vCoord);
  } else {
    vertices.push(uCoord, axisPos, vCoord);
  }
}

interface LoftBuffers {
  readonly vertices: number[];
  readonly uv: number[];
  readonly indices: number[];
}

interface LoftRingConfig {
  readonly axis: "x" | "y";
  readonly segments: number;
  readonly ribbing: number;
  readonly rowDenominator: number;
}

function appendSectionRing(
  buffers: LoftBuffers,
  cfg: LoftRingConfig,
  section: LoftSection,
  row: number,
): void {
  const [axisPos, width, depth, offsetU, offsetV] = section;
  for (let col = 0; col <= cfg.segments; col += 1) {
    const t = col / cfg.segments;
    const angle = t * Math.PI * 2;
    const contour = loftContour(angle, row, cfg.ribbing);
    pushPointByAxis(
      buffers.vertices,
      cfg.axis,
      axisPos,
      Math.sin(angle) * width * contour + offsetU,
      Math.cos(angle) * depth * contour + offsetV,
    );
    buffers.uv.push(t, row / cfg.rowDenominator);

    if (row > 0 && col < cfg.segments) {
      const a = (row - 1) * (cfg.segments + 1) + col;
      const b = row * (cfg.segments + 1) + col;
      if (cfg.axis === "x") {
        buffers.indices.push(a, b, a + 1, a + 1, b, b + 1);
      } else {
        buffers.indices.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
  }
}

function appendLoftEndCaps(
  vertices: number[],
  uv: number[],
  indices: number[],
  axis: "x" | "y",
  dense: readonly LoftSection[],
  segments: number,
): void {
  const [first] = dense;
  const last = dense[dense.length - 1];
  if (!first || !last) return;

  const startCenterIdx = vertices.length / 3;
  pushPointByAxis(vertices, axis, first[0], first[3], first[4]);
  uv.push(0.5, 0);
  for (let col = 0; col < segments; col += 1) {
    if (axis === "x") {
      indices.push(startCenterIdx, col, col + 1);
    } else {
      indices.push(startCenterIdx, col + 1, col);
    }
  }

  const endRowOffset = (dense.length - 1) * (segments + 1);
  const endCenterIdx = vertices.length / 3;
  pushPointByAxis(vertices, axis, last[0], last[3], last[4]);
  uv.push(0.5, 1);
  for (let col = 0; col < segments; col += 1) {
    const v0 = endRowOffset + col;
    if (axis === "x") {
      indices.push(endCenterIdx, v0 + 1, v0);
    } else {
      indices.push(endCenterIdx, v0, v0 + 1);
    }
  }
}

/**
 * Lofts an organic closed anatomical sub-primal mesh from elliptical cross-section
 * rows `[axisPos, halfWidth, halfDepth, offsetY, offsetZ]`.
 */
export function createLoftedAnatomicalGeometry(
  sections: readonly LoftSection[],
  options: LoftOptions = {},
): THREE.BufferGeometry {
  const axis = options.axis ?? "x";
  const segments = Math.max(12, options.radialSegments ?? 28);
  const ribbing = options.organicRibbing ?? DEFAULT_ORGANIC_RIBBING;
  const capEnds = options.capEnds ?? true;

  const dense = subdivideSections(sections);
  const buffers: LoftBuffers = { vertices: [], uv: [], indices: [] };
  const ringCfg: LoftRingConfig = {
    axis,
    segments,
    ribbing,
    rowDenominator: Math.max(1, dense.length - 1),
  };

  dense.forEach((section, row) => {
    appendSectionRing(buffers, ringCfg, section, row);
  });
  if (capEnds && dense.length >= 2) {
    appendLoftEndCaps(buffers.vertices, buffers.uv, buffers.indices, axis, dense, segments);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(buffers.vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(buffers.uv, 2));
  geometry.setIndex(buffers.indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name = "LoftedAnatomicalCut";
  return geometry;
}

/**
 * Procedural bone-landmark geometry (ivory marrow shaft) for bone-in cuts.
 */
export function createBoneLandmarkGeometry(
  length = 0.24,
  radius = 0.036,
): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(radius * 0.9, radius * 1.15, length, 14);
  geom.name = "BoneLandmark";
  return geom;
}

/**
 * Translucent butcher knife slicing plane geometry centered on the origin.
 */
export function createSlicingPlaneGeometry(
  width = 0.62,
  height = 0.44,
): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(width, height, 1, 1);
  geom.name = "ButcherSlicingPlane";
  return geom;
}

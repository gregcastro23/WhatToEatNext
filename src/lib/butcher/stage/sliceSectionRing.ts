import * as THREE from "three";
import { computePlaneSectionSegments } from "./crossSection";

/**
 * Per-rig "SliceSectionRing": the knife plane ∩ selected cut outline, drawn
 * through the mesh (depthTest off, high renderOrder). It owns its geometry —
 * never leased — and grows a DynamicDrawUsage buffer in powers of two.
 *
 * @file src/lib/butcher/stage/sliceSectionRing.ts
 */

export const SLICE_SECTION_RING_NAME = "SliceSectionRing";
const INITIAL_SEGMENT_CAPACITY = 128;
const FLOATS_PER_SEGMENT = 6;

export interface SliceSectionRing {
  readonly line: THREE.LineSegments;
  readonly geometry: THREE.BufferGeometry;
  readonly material: THREE.LineBasicMaterial;
  buffer: Float32Array;
  segmentCount: number;
  colorHex: string;
  /** geometry uuid + mesh-local normal of the last intersection (skip identical rebuilds). */
  sourceKey: string;
}

export interface SliceSectionState {
  readonly visible: boolean;
  readonly segmentCount: number;
  readonly colorHex: string;
}

function allocateRingBuffer(ring: SliceSectionRing, segments: number): void {
  let capacity = Math.max(INITIAL_SEGMENT_CAPACITY, ring.buffer.length / FLOATS_PER_SEGMENT);
  while (capacity < segments) capacity *= 2;
  // Free the GPU copy of the previous attribute before swapping it out.
  ring.geometry.dispose();
  ring.buffer = new Float32Array(capacity * FLOATS_PER_SEGMENT);
  const attribute = new THREE.BufferAttribute(ring.buffer, 3);
  attribute.setUsage(THREE.DynamicDrawUsage);
  ring.geometry.setAttribute("position", attribute);
}

export function createSliceSectionRing(): SliceSectionRing {
  const geometry = new THREE.BufferGeometry();
  geometry.name = "SliceSectionRingGeometry";
  const material = new THREE.LineBasicMaterial({
    color: "#34d399",
    transparent: true,
    opacity: 0.95,
    depthTest: false,
    depthWrite: false,
  });
  const line = new THREE.LineSegments(geometry, material);
  line.name = SLICE_SECTION_RING_NAME;
  line.renderOrder = 999;
  line.visible = false;
  line.frustumCulled = false;
  line.castShadow = false;
  line.receiveShadow = false;
  const ring: SliceSectionRing = {
    line,
    geometry,
    material,
    buffer: new Float32Array(0),
    segmentCount: 0,
    colorHex: "#34d399",
    sourceKey: "",
  };
  allocateRingBuffer(ring, INITIAL_SEGMENT_CAPACITY);
  geometry.setDrawRange(0, 0);
  return ring;
}

const _rigInverse = new THREE.Matrix4();
const _meshInRig = new THREE.Matrix4();
const _meshPos = new THREE.Vector3();
const _meshQuat = new THREE.Quaternion();
const _meshScale = new THREE.Vector3();
const _localNormal = new THREE.Vector3();

/** Re-intersects only when the geometry or the mesh-local normal changed (translation never does). */
function rebuildRingSegments(ring: SliceSectionRing, geometry: THREE.BufferGeometry): void {
  const sourceKey = `${geometry.uuid}:${_localNormal.toArray().map((v) => v.toFixed(6)).join(",")}`;
  if (sourceKey === ring.sourceKey) return;
  const segments = computePlaneSectionSegments(geometry, [_localNormal.x, _localNormal.y, _localNormal.z]);
  const segmentCount = segments.length / FLOATS_PER_SEGMENT;
  if (segments.length > ring.buffer.length) allocateRingBuffer(ring, segmentCount);
  ring.buffer.set(segments);
  ring.geometry.getAttribute("position").needsUpdate = true;
  ring.geometry.setDrawRange(0, segmentCount * 2);
  ring.segmentCount = segmentCount;
  ring.sourceKey = sourceKey;
}

/**
 * Rebuilds the ring for `mesh` against the knife plane through the mesh origin
 * with rig-local unit `normal`. The plane is expressed in mesh-local space via
 * the mesh's rig-relative rotation (identity for today's translation-only
 * carcass hierarchy, where it reduces to n·p = 0), and the ring is placed with
 * the same rig-relative transform so its points coincide with the mesh.
 * Requires up-to-date world matrices on `rig` and `mesh`.
 */
export function updateSliceSectionRing(
  ring: SliceSectionRing,
  opts: {
    readonly rig: THREE.Object3D;
    readonly mesh: THREE.Mesh;
    readonly normal: THREE.Vector3;
    readonly colorHex: string;
  },
): void {
  _rigInverse.copy(opts.rig.matrixWorld).invert();
  _meshInRig.multiplyMatrices(_rigInverse, opts.mesh.matrixWorld);
  _meshInRig.decompose(_meshPos, _meshQuat, _meshScale);
  _localNormal.copy(opts.normal).applyQuaternion(_meshQuat.clone().invert());

  rebuildRingSegments(ring, opts.mesh.geometry);
  ring.line.position.copy(_meshPos);
  ring.line.quaternion.copy(_meshQuat);
  ring.line.scale.copy(_meshScale);
  ring.material.color.set(opts.colorHex);
  ring.colorHex = opts.colorHex;
  ring.line.visible = ring.segmentCount > 0;
}

export function hideSliceSectionRing(ring: SliceSectionRing): void {
  ring.line.visible = false;
}

export function sliceSectionSnapshot(ring: SliceSectionRing): SliceSectionState {
  return { visible: ring.line.visible, segmentCount: ring.segmentCount, colorHex: ring.colorHex };
}

export function disposeSliceSectionRing(ring: SliceSectionRing): void {
  ring.line.removeFromParent();
  ring.geometry.dispose();
  ring.material.dispose();
}

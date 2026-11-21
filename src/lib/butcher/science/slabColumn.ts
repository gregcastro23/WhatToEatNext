/**
 * One-sided, full-thickness 1D column for the coupled meat trajectory: an
 * optional adipose fat cap on face A, the lean muscle, and an optional bone
 * layer on face B (`"face"` — rib plates, racks, short ribs) or at the centre
 * (`"core"` — shanks, drumsticks, leg bones). Through-thickness bones (steaks
 * and chops) cannot be represented in 1D and are left to the 3D voxel model.
 *
 * Materials are assigned per SEGMENT (between two nodes), so every tissue
 * interface sits exactly on a node and the finite-volume capacity/conductance
 * of each node is exact for piecewise-constant properties.
 *
 * @file src/lib/butcher/science/slabColumn.ts
 */

export type TissueKind = "lean" | "fat" | "bone" | "marrow";
export type ColumnBonePlacement = "face" | "core";

export interface TissueProperties {
  readonly kWmK: number;
  readonly densityKgM3: number;
  readonly specificHeatJkgK: number;
  readonly basis: string;
}

/**
 * BASIS: IT'IS Foundation Tissue Properties Database (Hasgall et al.; V4.1
 * doi:10.13099/VIP21000-04-1), live data file
 * `materialparameterdatabasecurrent20250821.xls` read 2026-11-20 — the
 * "Average" columns for rows "Fat", "Bone (Cortical)" and "Bone Marrow
 * (Yellow)", copied at the precision the file stores (not rounded). These are
 * HUMAN tissue values; no butchered-animal equivalent was found. Cross-check:
 * the same file's "Muscle" k = 0.49496875 W/(m·K) agrees with the Choi-Okos
 * lean values this column uses (≈0.47–0.50).
 */
export const ITIS_TISSUE: Readonly<Record<Exclude<TissueKind, "lean">, TissueProperties>> = {
  fat: { kWmK: 0.21145, densityKgM3: 911, specificHeatJkgK: 2348.33333333333, basis: "IT'IS Fat (average of 8 / 23 / 6 studies)" },
  bone: { kWmK: 0.32, densityKgM3: 1908, specificHeatJkgK: 1312.83333333333, basis: "IT'IS Bone (Cortical) (average)" },
  marrow: { kWmK: 0.192135101333333, densityKgM3: 980, specificHeatJkgK: 2065, basis: "IT'IS Bone Marrow (Yellow) (single study)" },
};

export interface ColumnLayer {
  readonly kind: TissueKind;
  readonly thicknessMm: number;
  readonly kWmK: number;
  readonly rhoCJm3K: number;
}

export interface ColumnBoneSpec {
  readonly placement: ColumnBonePlacement;
  /** Cortical plate thickness (face) or cortical wall thickness each side of the marrow (core), mm. */
  readonly corticalMm: number;
  /** Marrow cavity width at the core, mm (0 for a solid plate). */
  readonly marrowMm: number;
}

export interface ColumnSpec {
  readonly meatThicknessMm: number;
  readonly maxSegmentMm: number;
  readonly lean: { readonly kWmK: number; readonly rhoCJm3K: number };
  readonly fatCapMm: number;
  readonly bone: ColumnBoneSpec | null;
}

export interface SlabColumn {
  /** Node positions from the outer surface of face A, metres. */
  readonly positionsM: readonly number[];
  readonly segKind: readonly TissueKind[];
  readonly segK: readonly number[];
  /** Node heat capacity per unit face area, J/(m²·K): Σ of the adjoining half-segments' ρc·s. */
  readonly nodeCap: readonly number[];
  readonly isMeatNode: readonly boolean[];
  /** Node index of the meat surface reached first from face A / from face B. */
  readonly meatSurfaceA: number;
  readonly meatSurfaceB: number;
  readonly faceAKind: TissueKind;
  readonly faceBKind: TissueKind;
  readonly meatThicknessMm: number;
  readonly fatCapModelMm: number;
  readonly boneModelMm: number;
}

function tissueLayer(kind: Exclude<TissueKind, "lean">, thicknessMm: number): ColumnLayer {
  const t = ITIS_TISSUE[kind];
  return { kind, thicknessMm, kWmK: t.kWmK, rhoCJm3K: t.densityKgM3 * t.specificHeatJkgK };
}

function boneLayers(bone: ColumnBoneSpec): readonly ColumnLayer[] {
  if (bone.placement === "face" || bone.marrowMm <= 0) {
    return [tissueLayer("bone", bone.placement === "face" ? bone.corticalMm : bone.corticalMm * 2)];
  }
  return [
    tissueLayer("bone", bone.corticalMm),
    tissueLayer("marrow", bone.marrowMm),
    tissueLayer("bone", bone.corticalMm),
  ];
}

/** Ordered layers from face A (fat cap side) to face B (bone side). */
export function columnLayers(spec: ColumnSpec): readonly ColumnLayer[] {
  const leanOf = (thicknessMm: number): ColumnLayer => ({
    kind: "lean", thicknessMm, kWmK: spec.lean.kWmK, rhoCJm3K: spec.lean.rhoCJm3K,
  });
  const layers: ColumnLayer[] = [];
  if (spec.fatCapMm > 0) layers.push(tissueLayer("fat", spec.fatCapMm));
  if (spec.bone?.placement === "core") {
    layers.push(leanOf(spec.meatThicknessMm / 2), ...boneLayers(spec.bone), leanOf(spec.meatThicknessMm / 2));
  } else {
    layers.push(leanOf(spec.meatThicknessMm));
    if (spec.bone) layers.push(...boneLayers(spec.bone));
  }
  return layers;
}

function segmentCount(thicknessMm: number, maxSegmentMm: number): number {
  return Math.max(2, Math.ceil(thicknessMm / maxSegmentMm - 1e-9));
}

interface SegmentBuffers {
  readonly positionsM: number[];
  readonly segKind: TissueKind[];
  readonly segK: number[];
  readonly segRhoC: number[];
}

function appendLayerSegments(buf: SegmentBuffers, layer: ColumnLayer, maxSegmentMm: number): void {
  const n = segmentCount(layer.thicknessMm, maxSegmentMm);
  const start = buf.positionsM[buf.positionsM.length - 1] ?? 0;
  const thicknessM = layer.thicknessMm / 1000;
  for (let s = 1; s <= n; s += 1) {
    buf.positionsM.push(start + (thicknessM * s) / n);
    buf.segKind.push(layer.kind);
    buf.segK.push(layer.kWmK);
    buf.segRhoC.push(layer.rhoCJm3K);
  }
}

function nodeCapacities(positionsM: readonly number[], segRhoC: readonly number[]): number[] {
  return positionsM.map((x, i) => {
    const left = i > 0 ? (segRhoC[i - 1] ?? 0) * (x - (positionsM[i - 1] ?? x)) * 0.5 : 0;
    const right = i < positionsM.length - 1 ? (segRhoC[i] ?? 0) * ((positionsM[i + 1] ?? x) - x) * 0.5 : 0;
    return left + right;
  });
}

function layerTotalMm(layers: readonly ColumnLayer[], kinds: readonly TissueKind[]): number {
  return layers.filter((l) => kinds.includes(l.kind)).reduce((acc, l) => acc + l.thicknessMm, 0);
}

export function buildSlabColumn(spec: ColumnSpec): SlabColumn {
  const layers = columnLayers(spec);
  const buf: SegmentBuffers = { positionsM: [0], segKind: [], segK: [], segRhoC: [] };
  for (const layer of layers) appendLayerSegments(buf, layer, spec.maxSegmentMm);

  const isMeatNode = buf.positionsM.map(
    (_, i) => buf.segKind[i - 1] === "lean" || buf.segKind[i] === "lean",
  );
  const meatSurfaceA = isMeatNode.indexOf(true);
  const meatSurfaceB = isMeatNode.lastIndexOf(true);
  return {
    positionsM: buf.positionsM,
    segKind: buf.segKind,
    segK: buf.segK,
    nodeCap: nodeCapacities(buf.positionsM, buf.segRhoC),
    isMeatNode,
    meatSurfaceA,
    meatSurfaceB,
    faceAKind: buf.segKind[0] ?? "lean",
    faceBKind: buf.segKind[buf.segKind.length - 1] ?? "lean",
    meatThicknessMm: spec.meatThicknessMm,
    fatCapModelMm: layerTotalMm(layers, ["fat"]),
    boneModelMm: layerTotalMm(layers, ["bone", "marrow"]),
  };
}

/** Lean-only distance (mm) between two nodes: bone and marrow segments in between are not counted. */
export function meatDistanceMm(column: SlabColumn, from: number, to: number): number {
  const [lo, hi] = from <= to ? [from, to] : [to, from];
  let mm = 0;
  for (let i = lo; i < hi; i += 1) {
    if (column.segKind[i] === "lean") mm += ((column.positionsM[i + 1] ?? 0) - (column.positionsM[i] ?? 0)) * 1000;
  }
  return mm;
}

/**
 * Index of the coldest meat node (the thermal centre a probe thermometer
 * finds). Ties within 1e-9 °C — e.g. the two faces of a symmetric core bone —
 * go to the node whose lean distance from face A is nearest half the meat, so
 * the choice never rests on floating-point order.
 */
export function coldestMeatNode(column: SlabColumn, temps: readonly number[]): number {
  const halfMeat = column.meatThicknessMm / 2;
  const offCentre = (i: number): number => Math.abs(meatDistanceMm(column, column.meatSurfaceA, i) - halfMeat);
  let best = column.meatSurfaceA;
  let bestTemp = Infinity;
  for (let i = column.meatSurfaceA; i <= column.meatSurfaceB; i += 1) {
    const t = temps[i] ?? Infinity;
    if (column.isMeatNode[i] !== true) continue;
    if (t < bestTemp - 1e-9 || (Math.abs(t - bestTemp) <= 1e-9 && offCentre(i) < offCentre(best))) {
      bestTemp = t;
      best = i;
    }
  }
  return best;
}

import type { CutProximate } from "@/lib/butcher/types";
import { foodProperties, type FoodThermophysicalProperties } from "@/lib/cooking/choiOkos";
import type { SlabColumn } from "./slabColumn";

/**
 * Choi-Okos thermophysical mixture adapter and the Backward-Euler (Thomas
 * tridiagonal) step for the layered full-thickness 1D column built by
 * `slabColumn.ts`. Both faces carry their own convective boundary and
 * evaporative sink, so a fat cap or bone plate on one face is one-sided.
 *
 * @file src/lib/butcher/science/slabDiffusion.ts
 */

const CRUST_DESICCATION_TEMP_C = 104;
/** Nodes 0..CRUST_NODE_SPAN from an exposed LEAN face can desiccate into crust. */
const CRUST_NODE_SPAN = 2;

export function clampVal(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function sigmoid(tempC: number, midC: number, slopeC: number): number {
  return 1 / (1 + Math.exp(-(tempC - midC) / slopeC));
}

/** Choi & Okos (1986) properties of lean tissue at 45 °C from its proximate composition. */
export function thermophysicalForProximate(proximate: CutProximate): FoodThermophysicalProperties {
  const { waterG, proteinG, fatG, ashG } = proximate;
  const rawSum = waterG + proteinG + fatG + ashG;
  const scale = rawSum > 100 ? 100 / rawSum : 1;
  return foodProperties(
    {
      water: clampVal((waterG * scale) / 100, 0, 1),
      protein: clampVal((proteinG * scale) / 100, 0, 1),
      fat: clampVal((fatG * scale) / 100, 0, 1),
      carbohydrate: 0,
      ash: clampVal((ashG * scale) / 100, 0, 1),
    },
    45,
  );
}

export interface FaceBoundaryState {
  readonly hWm2K: number;
  readonly tMediumC: number;
  readonly qEvapWm2: number;
}

export interface LayeredStepParams {
  readonly temps: number[];
  readonly column: SlabColumn;
  readonly dt: number;
  readonly faceA: FaceBoundaryState;
  readonly faceB: FaceBoundaryState;
  readonly crustConductivityFactor?: number;
}

function harmonic(a: number, b: number): number {
  return (2 * a * b) / Math.max(1e-9, a + b);
}

function crustNodeFactor(params: LayeredStepParams, i: number): number {
  const factor = params.crustConductivityFactor ?? 1;
  if (factor >= 1 || (params.temps[i] ?? 0) <= CRUST_DESICCATION_TEMP_C) return 1;
  const { column } = params;
  const last = column.positionsM.length - 1;
  const nearA = column.faceAKind === "lean" && i <= CRUST_NODE_SPAN;
  const nearB = column.faceBKind === "lean" && i >= last - CRUST_NODE_SPAN;
  return nearA || nearB ? factor : 1;
}

/** Segment conductances G_i = k_i / s_i, W/(m²·K), with crust desiccation by harmonic node averaging. */
function segmentConductances(params: LayeredStepParams): number[] {
  const { column } = params;
  return column.segK.map((k, i) => {
    const s = (column.positionsM[i + 1] ?? 0) - (column.positionsM[i] ?? 0);
    const kEff = column.segKind[i] === "lean"
      ? harmonic(k * crustNodeFactor(params, i), k * crustNodeFactor(params, i + 1))
      : k;
    return kEff / Math.max(1e-12, s);
  });
}

function solveThomasTridiagonal(
  lower: readonly number[],
  diag: number[],
  upper: readonly number[],
  rhs: number[],
  out: number[],
): void {
  const n = out.length;
  for (let i = 1; i < n; i += 1) {
    const w = (lower[i] ?? 0) / Math.max(1e-12, diag[i - 1] ?? 1);
    diag[i] = (diag[i] ?? 1) - w * (upper[i - 1] ?? 0);
    rhs[i] = (rhs[i] ?? 0) - w * (rhs[i - 1] ?? 0);
  }
  out[n - 1] = (rhs[n - 1] ?? 0) / Math.max(1e-12, diag[n - 1] ?? 1);
  for (let i = n - 2; i >= 0; i -= 1) {
    out[i] = ((rhs[i] ?? 0) - (upper[i] ?? 0) * (out[i + 1] ?? 0)) / Math.max(1e-12, diag[i] ?? 1);
  }
}

/**
 * Unconditionally stable Backward-Euler step of the layered column:
 * C_i/dt·(T_i′−T_i) = G_{i−1}(T_{i−1}′−T_i′) + G_i(T_{i+1}′−T_i′) + boundary terms,
 * where the outer nodes exchange h·(T_medium − T) − q_evap with their own face.
 */
export function stepLayeredSlab(params: LayeredStepParams): void {
  const { temps, column, dt, faceA, faceB } = params;
  const n = temps.length;
  const g = segmentConductances(params);
  const lower = new Array<number>(n).fill(0);
  const diag = new Array<number>(n).fill(0);
  const upper = new Array<number>(n).fill(0);
  const rhs = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i += 1) {
    const capDt = (column.nodeCap[i] ?? 0) / dt;
    const gl = i > 0 ? (g[i - 1] ?? 0) : 0;
    const gr = i < n - 1 ? (g[i] ?? 0) : 0;
    lower[i] = -gl;
    upper[i] = -gr;
    diag[i] = capDt + gl + gr;
    rhs[i] = capDt * (temps[i] ?? 10);
  }
  diag[0] = (diag[0] ?? 0) + faceA.hWm2K;
  rhs[0] = (rhs[0] ?? 0) + faceA.hWm2K * faceA.tMediumC - faceA.qEvapWm2;
  diag[n - 1] = (diag[n - 1] ?? 0) + faceB.hWm2K;
  rhs[n - 1] = (rhs[n - 1] ?? 0) + faceB.hWm2K * faceB.tMediumC - faceB.qEvapWm2;
  solveThomasTridiagonal(lower, diag, upper, rhs, temps);
}

/**
 * Depth (mm) from the node `from` walking toward `to` over which the peak
 * temperature stayed at or above `thresholdC`, linearly interpolated between
 * the bracketing nodes. Stops at the first non-meat node.
 */
export function depthAboveThresholdMm(
  column: SlabColumn,
  peakTemps: readonly number[],
  thresholdC: number,
  from: number,
  to: number,
): number {
  const dir = to >= from ? 1 : -1;
  const x0 = column.positionsM[from] ?? 0;
  if ((peakTemps[from] ?? 0) < thresholdC) return 0;
  let i = from;
  while (i !== to && column.isMeatNode[i + dir] === true) {
    const prev = peakTemps[i] ?? 0;
    const next = peakTemps[i + dir] ?? 0;
    const xPrev = column.positionsM[i] ?? x0;
    const xNext = column.positionsM[i + dir] ?? xPrev;
    if (next < thresholdC) {
      const frac = clampVal((prev - thresholdC) / Math.max(1e-6, prev - next), 0, 1);
      return Math.abs(xPrev + (xNext - xPrev) * frac - x0) * 1000;
    }
    i += dir;
  }
  return Math.abs((column.positionsM[i] ?? x0) - x0) * 1000;
}

/** Length (mm) of the contiguous meat walk from `from` toward `to`. */
export function meatWalkLengthMm(column: SlabColumn, from: number, to: number): number {
  const dir = to >= from ? 1 : -1;
  let i = from;
  while (i !== to && column.isMeatNode[i + dir] === true) i += dir;
  return Math.abs((column.positionsM[i] ?? 0) - (column.positionsM[from] ?? 0)) * 1000;
}

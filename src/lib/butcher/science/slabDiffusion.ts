import type { AnatomicalCut } from "@/lib/butcher/types";
import { foodProperties, type FoodThermophysicalProperties } from "@/lib/cooking/choiOkos";

/**
 * Choi-Okos thermophysical mixture adapter and Backward-Euler Thomas
 * tridiagonal 1D symmetric slab step for `coupledMeatTrajectory.ts`.
 *
 * @file src/lib/butcher/science/slabDiffusion.ts
 */

const CRUST_DESICCATION_TEMP_C = 104;
const CRUST_NODE_SPAN = 2;

export function clampVal(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function sigmoid(tempC: number, midC: number, slopeC: number): number {
  return 1 / (1 + Math.exp(-(tempC - midC) / slopeC));
}

export function thermophysicalForCut(cut: AnatomicalCut): FoodThermophysicalProperties {
  const { waterG, proteinG, fatG, ashG } = cut.proximate;
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

export interface SlabStepParams {
  readonly temps: number[];
  readonly dx: number;
  readonly dt: number;
  readonly props: FoodThermophysicalProperties;
  readonly hWm2K: number;
  readonly tMediumC: number;
  readonly qEvapWm2: number;
  readonly crustConductivityFactor?: number;
}

function buildSlabSystem(
  params: SlabStepParams,
  kNode: readonly number[],
): { readonly lower: number[]; readonly diag: number[]; readonly upper: number[]; readonly rhs: number[] } {
  const { temps, dx, dt, props, hWm2K, tMediumC, qEvapWm2 } = params;
  const n = temps.length;
  const cap = props.densityKgM3 * props.specificHeatJkgK;
  const kBase = props.conductivityWmK;
  const kFace = (a: number, b: number): number => (2 * a * b) / Math.max(1e-9, a + b);

  const lower = new Array<number>(n).fill(0);
  const diag = new Array<number>(n).fill(0);
  const upper = new Array<number>(n).fill(0);
  const rhs = new Array<number>(n).fill(0);

  const k01 = kFace(kNode[0] ?? kBase, kNode[1] ?? kBase);
  const c0 = cap * (dx * 0.5);
  diag[0] = c0 / dt + k01 / dx + hWm2K;
  upper[0] = -k01 / dx;
  rhs[0] = (c0 / dt) * (temps[0] ?? 10) + hWm2K * tMediumC - qEvapWm2;

  for (let i = 1; i < n - 1; i += 1) {
    const ki = kNode[i] ?? kBase;
    const km = kFace(kNode[i - 1] ?? kBase, ki);
    const kp = kFace(ki, kNode[i + 1] ?? kBase);
    const ci = cap * dx;
    lower[i] = -km / dx;
    diag[i] = ci / dt + (km + kp) / dx;
    upper[i] = -kp / dx;
    rhs[i] = (ci / dt) * (temps[i] ?? 10);
  }
  const kLast = kFace(kNode[n - 2] ?? kBase, kNode[n - 1] ?? kBase);
  const cn = cap * (dx * 0.5);
  lower[n - 1] = -(2 * kLast) / dx;
  diag[n - 1] = cn / dt + (2 * kLast) / dx;
  rhs[n - 1] = (cn / dt) * (temps[n - 1] ?? 10);
  return { lower, diag, upper, rhs };
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
 * Unconditionally stable Backward-Euler 1D symmetric slab solver via Thomas
 * tridiagonal elimination. When `crustConductivityFactor < 1`, dehydrated outer
 * crust nodes (>104 °C) drop in conductivity via harmonic interface averaging.
 */
export function stepImplicitSlab(params: SlabStepParams): void {
  const factor = params.crustConductivityFactor ?? 1;
  const kBase = params.props.conductivityWmK;
  const kNode = params.temps.map((t, i) =>
    factor < 1 && i <= CRUST_NODE_SPAN && t > CRUST_DESICCATION_TEMP_C ? kBase * factor : kBase,
  );
  const sys = buildSlabSystem(params, kNode);
  solveThomasTridiagonal(sys.lower, sys.diag, sys.upper, sys.rhs, params.temps);
}

export function depthExceedingThresholdMm(
  peakNodeTemps: readonly number[],
  thresholdC: number,
  halfThicknessMm: number,
): number {
  const n = peakNodeTemps.length;
  if (n < 2) return 0;
  const dxMm = halfThicknessMm / (n - 1);
  if ((peakNodeTemps[0] ?? 0) < thresholdC) return 0;
  for (let i = 1; i < n; i += 1) {
    const prev = peakNodeTemps[i - 1] ?? 0;
    const curr = peakNodeTemps[i] ?? 0;
    if (curr < thresholdC) {
      const denom = Math.max(1e-6, prev - curr);
      const frac = clampVal((prev - thresholdC) / denom, 0, 1);
      return ((i - 1) + frac) * dxMm;
    }
  }
  return halfThicknessMm;
}

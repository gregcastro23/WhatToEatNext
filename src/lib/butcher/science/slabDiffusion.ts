import type { AnatomicalCut } from "@/lib/butcher/types";
import { foodProperties, type FoodThermophysicalProperties } from "@/lib/cooking/choiOkos";

/**
 * Choi-Okos thermophysical mixture adapter and Backward-Euler Thomas
 * tridiagonal 1D symmetric slab step for `coupledMeatTrajectory.ts`.
 *
 * @file src/lib/butcher/science/slabDiffusion.ts
 */

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

/** Unconditionally stable Backward-Euler 1D symmetric slab solver via Thomas tridiagonal elimination. */
export function stepImplicitSlab(
  temps: number[],
  dx: number,
  dt: number,
  props: FoodThermophysicalProperties,
  hWm2K: number,
  tMediumC: number,
  qEvapWm2: number,
): void {
  const n = temps.length;
  const cap0 = props.densityKgM3 * props.specificHeatJkgK * (dx * 0.5);
  const kOverDx = props.conductivityWmK / dx;
  const r = (props.diffusivityM2S * dt) / (dx * dx);

  const diag = new Array<number>(n).fill(0);
  const upper = new Array<number>(n).fill(0);
  const lower = new Array<number>(n).fill(0);
  const rhs = new Array<number>(n).fill(0);

  diag[0] = cap0 / dt + kOverDx + hWm2K;
  upper[0] = -kOverDx;
  rhs[0] = (cap0 / dt) * (temps[0] ?? 10) + hWm2K * tMediumC - qEvapWm2;

  for (let i = 1; i < n - 1; i += 1) {
    lower[i] = -r;
    diag[i] = 1 + 2 * r;
    upper[i] = -r;
    rhs[i] = temps[i] ?? 10;
  }
  lower[n - 1] = -2 * r;
  diag[n - 1] = 1 + 2 * r;
  rhs[n - 1] = temps[n - 1] ?? 10;

  for (let i = 1; i < n; i += 1) {
    const w = (lower[i] ?? 0) / Math.max(1e-12, diag[i - 1] ?? 1);
    diag[i] = (diag[i] ?? 1) - w * (upper[i - 1] ?? 0);
    rhs[i] = (rhs[i] ?? 0) - w * (rhs[i - 1] ?? 0);
  }

  temps[n - 1] = (rhs[n - 1] ?? 0) / Math.max(1e-12, diag[n - 1] ?? 1);
  for (let i = n - 2; i >= 0; i -= 1) {
    temps[i] = ((rhs[i] ?? 0) - (upper[i] ?? 0) * (temps[i + 1] ?? 0)) / Math.max(1e-12, diag[i] ?? 1);
  }
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

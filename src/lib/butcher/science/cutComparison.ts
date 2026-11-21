import type { AnatomicalCut } from "@/lib/butcher/types";
import { defaultTrajectoryMethodForCut, simulateCoupledCutTrajectory, TRAJECTORY_METHODS } from "./coupledMeatTrajectory";
import { strategyLabel } from "./meatPhysics";

/**
 * Side-by-side comparison rows for the Cut Comparison drawer: marbling,
 * collagen, best method and the 1D trajectory's gray-band depth at each cut's
 * own ideal core temperature, default method and typical thickness.
 *
 * @file src/lib/butcher/science/cutComparison.ts
 */

export const MAX_PINNED_CUTS = 2;

export interface CutComparisonRow {
  readonly id: "marbling" | "collagen" | "method" | "gray-band" | "core-temp" | "thickness";
  readonly label: string;
  readonly a: string;
  readonly b: string;
  /** Which side is numerically higher, for numeric rows (null when equal or non-numeric). */
  readonly higher: "a" | "b" | null;
}

function higherOf(a: number, b: number): "a" | "b" | null {
  if (Math.abs(a - b) < 1e-9) return null;
  return a > b ? "a" : "b";
}

function grayBandFor(cut: AnatomicalCut): { readonly mm: number; readonly methodLabel: string } {
  const method = defaultTrajectoryMethodForCut(cut);
  const res = simulateCoupledCutTrajectory(cut, { method, targetCoreTempC: cut.targetCoreTempC.ideal });
  return { mm: res.grayBandMm, methodLabel: TRAJECTORY_METHODS.find((m) => m.id === method)?.label ?? method };
}

export function buildCutComparison(a: AnatomicalCut, b: AnatomicalCut): readonly CutComparisonRow[] {
  const grayA = grayBandFor(a);
  const grayB = grayBandFor(b);
  const methodOf = (c: AnatomicalCut): string => strategyLabel(c.optimalMethods[0] ?? "high-heat-sear");
  return [
    {
      id: "marbling", label: "Marbling (fat g/100 g)",
      a: `${a.proximate.fatG.toFixed(1)} · ${a.marblingGrade}`, b: `${b.proximate.fatG.toFixed(1)} · ${b.marblingGrade}`,
      higher: higherOf(a.proximate.fatG, b.proximate.fatG),
    },
    {
      id: "collagen", label: "Collagen (g/100 g)",
      a: a.proximate.collagenG.toFixed(2), b: b.proximate.collagenG.toFixed(2),
      higher: higherOf(a.proximate.collagenG, b.proximate.collagenG),
    },
    { id: "method", label: "Optimal method", a: methodOf(a), b: methodOf(b), higher: null },
    {
      id: "gray-band", label: "Gray band (mm, default method)",
      a: `${grayA.mm.toFixed(1)} · ${grayA.methodLabel}`, b: `${grayB.mm.toFixed(1)} · ${grayB.methodLabel}`,
      higher: higherOf(grayA.mm, grayB.mm),
    },
    {
      id: "core-temp", label: "Ideal core (°C)",
      a: String(a.targetCoreTempC.ideal), b: String(b.targetCoreTempC.ideal),
      higher: higherOf(a.targetCoreTempC.ideal, b.targetCoreTempC.ideal),
    },
    {
      id: "thickness", label: "Typical thickness (mm)",
      a: String(a.typicalThicknessMm), b: String(b.typicalThicknessMm),
      higher: higherOf(a.typicalThicknessMm, b.typicalThicknessMm),
    },
  ];
}

/** Pin list update: toggling a pinned cut unpins it; pinning a third drops the oldest. */
export function togglePinnedCut(pins: readonly string[], cutId: string): readonly string[] {
  if (pins.includes(cutId)) return pins.filter((id) => id !== cutId);
  return [...pins, cutId].slice(-MAX_PINNED_CUTS);
}

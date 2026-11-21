import type { AnatomicalCut } from "@/lib/butcher/types";
import { defaultTrajectoryMethodForCut, simulateCoupledCutTrajectory, TRAJECTORY_METHODS } from "./coupledMeatTrajectory";
import { FAT_CLASS_LABEL } from "./fatClass";
import { strategyLabel } from "./meatPhysics";

/**
 * Side-by-side comparison rows for the Cut Comparison drawer: fat class,
 * collagen, best method and the 1D trajectory's gray-band depth at each cut's
 * own ideal core temperature, default method and typical thickness.
 *
 * @file src/lib/butcher/science/cutComparison.ts
 */

export { MAX_PINNED_CUTS, togglePinnedCut } from "./comparePins";

export interface CutComparisonRow {
  readonly id: "fat" | "collagen" | "method" | "gray-band" | "core-temp" | "thickness";
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
      id: "fat", label: "Fat (g/100 g, USDA)",
      a: `${a.proximate.fatG.toFixed(1)} · ${FAT_CLASS_LABEL[a.fatClass]}`, b: `${b.proximate.fatG.toFixed(1)} · ${FAT_CLASS_LABEL[b.fatClass]}`,
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

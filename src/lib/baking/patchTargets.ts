/**
 * What the patch solver restores, how tightly, and how it explains itself.
 *
 * The explanations are DETERMINISTIC: each names the target the adjustment
 * moves most and the before/after numbers, so the reasoning can be checked
 * against the delta table beside it. (No language model is involved.)
 *
 * @file src/lib/baking/patchTargets.ts
 */
import { chemicalCo2Grams, deltaTargets, hydrationWaterGrams, type DeltaTargets } from "./substitution";
import type { Formula } from "./formulaTypes";
import type { IngredientLookup } from "./telemetry";

export type PatchTargetId = "hydration-water" | "network" | "sweetness" | "excess-base" | "chemical-co2";

export interface PatchTarget {
  id: PatchTargetId;
  label: string;
  unit: string;
  weight: number;
  read: (d: DeltaTargets) => number;
  /** Tolerance scale for the misfit: how big a miss counts as one unit. */
  scale: (reference: number) => number;
}

export const PATCH_TARGETS: readonly PatchTarget[] = [
  { id: "hydration-water", label: "hydrating water", unit: "g", weight: 1, read: (d) => hydrationWaterGrams(d.telemetry), scale: (r) => Math.max(Math.abs(r) * 0.02, 1) },
  { id: "network", label: "gas-holding network", unit: "g gluten-eq", weight: 1, read: (d) => d.networkGrams, scale: (r) => Math.max(Math.abs(r) * 0.05, 0.5) },
  { id: "sweetness", label: "sweetness", unit: "g sucrose-eq", weight: 0.5, read: (d) => (d.telemetry.podPer100g * d.telemetry.totalGrams) / 100, scale: (r) => Math.max(Math.abs(r) * 0.05, 1) },
  { id: "excess-base", label: "unneutralised soda", unit: "mmol", weight: 1, read: (d) => d.telemetry.acidBase.excessBaseMmol, scale: () => 2 },
  { id: "chemical-co2", label: "chemical CO₂", unit: "g", weight: 1, read: (d) => chemicalCo2Grams(d.telemetry), scale: (r) => Math.max(Math.abs(r) * 0.05, 0.1) },
];

export function targetValues(formula: Formula, lookup: IngredientLookup): number[] {
  const d = deltaTargets(formula, lookup);
  return PATCH_TARGETS.map((t) => t.read(d));
}

const DRIVERS: Readonly<Record<string, readonly PatchTargetId[]>> = {
  water: ["hydration-water"],
  "xanthan-gum": ["network"],
  "psyllium-husk": ["network", "hydration-water"],
  "baking-soda": ["excess-base", "chemical-co2"],
  "cream-of-tartar": ["excess-base", "chemical-co2"],
  "granulated-sugar": ["sweetness"],
};

function fmt(value: number, unit: string): string {
  return `${value.toFixed(Math.abs(value) < 10 ? 1 : 0)} ${unit}`;
}

/** One sentence per adjustment: what it does, toward which original value. */
export function explainAdjustment(ingredientId: string, deltaGrams: number, reference: readonly number[], patched: readonly number[]): string {
  const verb = deltaGrams > 0 ? "Add" : "Remove";
  const amount = `${Math.abs(deltaGrams).toFixed(1)} g`;
  const parts = (DRIVERS[ingredientId] ?? []).map((id) => {
    const k = PATCH_TARGETS.findIndex((t) => t.id === id);
    const target = PATCH_TARGETS[k];
    if (target === undefined) return "";
    return `${target.label} ${fmt(patched[k] ?? 0, target.unit)} (original ${fmt(reference[k] ?? 0, target.unit)})`;
  });
  const goal = parts.filter((p) => p !== "").join("; ");
  return `${verb} ${amount} — brings ${goal === "" ? "the formula" : goal} back toward the original.`;
}

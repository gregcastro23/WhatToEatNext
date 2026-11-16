/**
 * Swapping one ingredient for another, and measuring what the swap broke.
 *
 * A swap is never "1 cup for 1 cup". The lab offers two bases:
 * - `mass`    — same grams in, so every downstream difference is visible;
 * - `matched` — grams chosen to keep the ORIGINAL ingredient's primary job:
 *   fat for a fat, sweetness (POD) for a sweetener, water for a liquid, CO₂
 *   potential for a chemical leavener; mass for everything else.
 * Either way the functional delta (ΔĪ) is computed from two full telemetry
 * runs, so it can never disagree with the numbers shown for each formula.
 *
 * @file src/lib/baking/substitution.ts
 */
import { bakingIngredient, ingredientsInCategory } from "@/data/baking";
import { networkGrams } from "./network";
import { formulaTelemetry, resolveLines, type IngredientLookup } from "./telemetry";
import type { Formula, FormulaTelemetry } from "./formulaTypes";
import type { BakingIngredient } from "./types";

export type SwapBasis = "mass" | "matched";

export interface SwapResult {
  formula: Formula;
  /** Grams of the substitute placed on the line. */
  grams: number;
  /** What the grams were matched on. */
  matchedOn: string;
}

function matchedGrams(original: BakingIngredient, substitute: BakingIngredient, grams: number): { grams: number; on: string } {
  const ratio = (a: number, b: number, on: string): { grams: number; on: string } => (b > 0 && a > 0 ? { grams: (grams * a) / b, on } : { grams, on: "mass" });
  switch (original.category) {
    case "fat_lipid":
      return ratio(original.fatPct, substitute.fatPct, "fat");
    case "sugar_sweetener":
      return ratio(original.pod, substitute.pod, "sweetness (POD)");
    case "liquid_dairy":
      return ratio(original.waterPct, substitute.waterPct, "water");
    case "leavener":
      return ratio(original.leaveningGasYield, substitute.leaveningGasYield, "CO₂ potential");
    default:
      return { grams, on: "mass" };
  }
}

export function swapLine(formula: Formula, lineIndex: number, substituteId: string, basis: SwapBasis, lookup: IngredientLookup = bakingIngredient): SwapResult {
  const line = formula.lines[lineIndex];
  if (line === undefined) throw new RangeError(`no formula line ${lineIndex}`);
  const original = lookup(line.ingredientId);
  const substitute = lookup(substituteId);
  const match = basis === "mass" ? { grams: line.grams, on: "mass" } : matchedGrams(original, substitute, line.grams);
  const lines = formula.lines.map((l, i) => (i === lineIndex ? { ingredientId: substituteId, grams: match.grams } : l));
  return { formula: { ...formula, lines }, grams: match.grams, matchedOn: match.on };
}

/** Same-category ingredients that can stand in, cocoa kept apart from the gums. */
export function substituteCandidates(ingredientId: string): BakingIngredient[] {
  const original = bakingIngredient(ingredientId);
  const flavour = original.roles.includes("flavor");
  return ingredientsInCategory(original.category).filter(
    (i) => i.id !== ingredientId && (original.category !== "hydrocolloid_fiber" || i.roles.includes("flavor") === flavour),
  );
}

export type DeltaId = "hydration-water" | "true-hydration" | "network" | "structure-ratio" | "solid-fat" | "sweetness" | "softness" | "reducing" | "excess-base" | "chemical-co2" | "water-activity";

export interface DeltaEntry {
  id: DeltaId;
  label: string;
  unit: string;
  before: number | null;
  after: number | null;
  delta: number | null;
  /** (after − before) ÷ |before|; null when before is zero or unknown. */
  relative: number | null;
}

export interface DeltaTargets {
  telemetry: FormulaTelemetry;
  /** Gluten-equivalent gas-holding network, g. */
  networkGrams: number;
  solidFatGrams: number;
}

export function deltaTargets(formula: Formula, lookup: IngredientLookup = bakingIngredient): DeltaTargets {
  const lines = resolveLines(formula, lookup);
  const solidFatGrams = lines.reduce((s, { ingredient: i, grams }) => s + (grams * i.fatPct * (i.solidFatIndex ?? 0)) / 100, 0);
  return { telemetry: formulaTelemetry(formula, lookup), networkGrams: networkGrams(lines), solidFatGrams };
}

export function chemicalCo2Grams(t: FormulaTelemetry): number {
  const l = t.leavening;
  return l.neutralisationCo2Grams + l.thermalCo2Grams + l.powderMixingCo2Grams + l.powderHeatCo2Grams;
}

export function hydrationWaterGrams(t: FormulaTelemetry): number {
  return t.trueHydrationPct === null ? t.freeWaterGrams : (t.trueHydrationPct * t.flourGrams) / 100;
}

function entry(id: DeltaId, label: string, unit: string, before: number | null, after: number | null): DeltaEntry {
  const delta = before === null || after === null ? null : after - before;
  const relative = delta === null || before === null || before === 0 ? null : delta / Math.abs(before);
  return { id, label, unit, before, after, delta, relative };
}

function aw(t: FormulaTelemetry): number | null {
  return t.waterActivity.available ? t.waterActivity.value.aw : null;
}

/** ΔĪ: every functional quantity, before and after. */
export function functionalDelta(before: DeltaTargets, after: DeltaTargets): DeltaEntry[] {
  const a = before.telemetry;
  const b = after.telemetry;
  return [
    entry("hydration-water", "Hydrating water", "g", hydrationWaterGrams(a), hydrationWaterGrams(b)),
    entry("true-hydration", "True hydration", "%", a.trueHydrationPct, b.trueHydrationPct),
    entry("network", "Gas-holding network", "g gluten-eq", before.networkGrams, after.networkGrams),
    entry("structure-ratio", "Structure : tenderiser", "ratio", a.structure.ratio, b.structure.ratio),
    entry("solid-fat", "Creamable solid fat", "g", before.solidFatGrams, after.solidFatGrams),
    entry("sweetness", "Sweetness (POD)", "g sucrose-eq", (a.podPer100g * a.totalGrams) / 100, (b.podPer100g * b.totalGrams) / 100),
    entry("softness", "Softness (PAC)", "g sucrose-eq", (a.pacPer100g * a.totalGrams) / 100, (b.pacPer100g * b.totalGrams) / 100),
    entry("reducing", "Reducing-sugar share", "fraction", a.reducingSugarFraction, b.reducingSugarFraction),
    entry("excess-base", "Unneutralised soda", "mmol", a.acidBase.excessBaseMmol, b.acidBase.excessBaseMmol),
    entry("chemical-co2", "Chemical CO₂", "g", chemicalCo2Grams(a), chemicalCo2Grams(b)),
    entry("water-activity", "Water activity", "a_w", aw(a), aw(b)),
  ];
}

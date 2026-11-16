/**
 * The counter-balance patch: after a swap, which small additions or
 * removals bring the formula's function back to where it was?
 *
 * A bounded least-squares problem, solved deterministically:
 *
 *   minimise  Σₖ (wₖ · (Tₖ(x) − Tₖ⁰) / sₖ)²  +  ridge
 *   over      grams xⱼ of each allowed patch ingredient, lo ≤ x ≤ hi
 *
 * where Tₖ⁰ are the ORIGINAL formula's targets (hydrating water, gas-holding
 * network, sweetness, unneutralised soda, chemical CO₂), Tₖ(x) the swapped
 * formula's with the patch applied, and sₖ a tolerance scale. Tₖ is linear in
 * x except the acid–base pieces (a min/max), so the solve is Gauss–Newton:
 * a finite-difference Jacobian from full telemetry runs, a projected
 * coordinate-descent step, repeat. The bounds are practical doses
 * (xanthan ≤ 2 % of flour, psyllium ≤ 8 %, soda ≤ 2 %), and nothing can be
 * removed that the formula does not contain.
 *
 * @file src/lib/baking/patchSolver.ts
 */
import { bakingIngredient } from "@/data/baking";
import { explainAdjustment, PATCH_TARGETS, targetValues, type PatchTargetId } from "./patchTargets";
import { deltaTargets, functionalDelta, type DeltaEntry } from "./substitution";
import type { Formula } from "./formulaTypes";
import type { IngredientLookup } from "./telemetry";
import type { BakingCategory } from "./types";

/** Dose caps, as a percentage of flour weight (or of total weight where no flour applies). */
export const PATCH_CAPS: Readonly<Record<string, { pctOfFlour: number } | { pctOfTotal: number }>> = {
  water: { pctOfTotal: 50 },
  "xanthan-gum": { pctOfFlour: 2 },
  "psyllium-husk": { pctOfFlour: 8 },
  "baking-soda": { pctOfFlour: 2 },
  "cream-of-tartar": { pctOfFlour: 2 },
  "granulated-sugar": { pctOfTotal: 30 },
};

/** The patch ingredients offered by default, by the category of the swapped line. */
export const DEFAULT_PATCH_SETS: Readonly<Record<BakingCategory, readonly string[]>> = {
  flour_grain: ["water", "xanthan-gum", "psyllium-husk"],
  fat_lipid: ["water"],
  sugar_sweetener: ["water", "baking-soda"],
  liquid_dairy: ["water", "baking-soda"],
  egg_binder: ["water", "xanthan-gum"],
  leavener: ["baking-soda", "cream-of-tartar"],
  hydrocolloid_fiber: ["water", "baking-soda"],
  inclusion_flavor: ["water"],
};

export interface PatchAdjustment {
  ingredientId: string;
  name: string;
  deltaGrams: number;
  explanation: string;
}

export interface PatchResult {
  adjustments: readonly PatchAdjustment[];
  patched: Formula;
  /** Original → swapped. */
  swapDelta: readonly DeltaEntry[];
  /** Original → swapped + patch. */
  patchedDelta: readonly DeltaEntry[];
  /** Weighted misfit before and after the patch (0 = fully restored). */
  misfitBefore: number;
  misfitAfter: number;
  /** Targets the allowed ingredients could not bring back within tolerance — said, not hidden. */
  unresolved: readonly UnresolvedTarget[];
}

export interface UnresolvedTarget {
  id: PatchTargetId;
  label: string;
  unit: string;
  original: number;
  patched: number;
}

function unresolvedTargets(patched: readonly number[], reference: readonly number[]): UnresolvedTarget[] {
  const out: UnresolvedTarget[] = [];
  PATCH_TARGETS.forEach((target, k) => {
    const original = reference[k] ?? 0;
    const value = patched[k] ?? 0;
    if (Math.abs(value - original) > target.scale(original)) out.push({ id: target.id, label: target.label, unit: target.unit, original, patched: value });
  });
  return out;
}

export function applyPatch(formula: Formula, ids: readonly string[], grams: readonly number[]): Formula {
  const lines = formula.lines.map((l) => ({ ...l }));
  ids.forEach((id, j) => {
    const add = grams[j] ?? 0;
    if (add === 0) return;
    const existing = lines.find((l) => l.ingredientId === id);
    if (existing !== undefined) existing.grams = Math.max(existing.grams + add, 0);
    else if (add > 0) lines.push({ ingredientId: id, grams: add });
  });
  return { ...formula, lines };
}

interface Bounds {
  lo: number[];
  hi: number[];
}

function bounds(formula: Formula, ids: readonly string[], lookup: IngredientLookup): Bounds {
  const t = deltaTargets(formula, lookup).telemetry;
  const lo: number[] = [];
  const hi: number[] = [];
  for (const id of ids) {
    const present = formula.lines.filter((l) => l.ingredientId === id).reduce((s, l) => s + l.grams, 0);
    const cap = PATCH_CAPS[id];
    const limit = cap === undefined ? 0 : "pctOfFlour" in cap ? (cap.pctOfFlour * t.flourGrams) / 100 : (cap.pctOfTotal * t.totalGrams) / 100;
    lo.push(-present);
    hi.push(Math.max(limit - present, 0));
  }
  return { lo, hi };
}

function misfit(values: readonly number[], reference: readonly number[]): number {
  return PATCH_TARGETS.reduce((s, target, k) => {
    const r = (target.weight * ((values[k] ?? 0) - (reference[k] ?? 0))) / target.scale(reference[k] ?? 0);
    return s + r * r;
  }, 0);
}

/** One projected coordinate-descent solve of the linearised problem; returns the step. */
function linearStep(residual: readonly number[], jacobian: readonly number[][], reference: readonly number[], x: readonly number[], b: Bounds): number[] {
  const n = x.length;
  const step = new Array<number>(n).fill(0);
  const scaled = (k: number, value: number): number => (PATCH_TARGETS[k]?.weight ?? 0) * value / (PATCH_TARGETS[k]?.scale(reference[k] ?? 0) ?? 1);
  for (let sweep = 0; sweep < 200; sweep += 1) {
    for (let j = 0; j < n; j += 1) {
      let a = 1e-6;
      let c = 0;
      residual.forEach((r, k) => {
        const g = scaled(k, jacobian[k]?.[j] ?? 0);
        const others = (jacobian[k] ?? []).reduce((s, v, i) => (i === j ? s : s + v * (step[i] ?? 0)), 0);
        a += g * g;
        c += g * scaled(k, r + others);
      });
      const unclamped = -c / a;
      const lo = (b.lo[j] ?? 0) - (x[j] ?? 0);
      const hi = (b.hi[j] ?? 0) - (x[j] ?? 0);
      step[j] = Math.min(Math.max(unclamped, lo), hi);
    }
  }
  return step;
}

function solve(swapped: Formula, ids: readonly string[], reference: readonly number[], lookup: IngredientLookup): number[] {
  const b = bounds(swapped, ids, lookup);
  let x = new Array<number>(ids.length).fill(0);
  for (let iteration = 0; iteration < 6; iteration += 1) {
    const values = targetValues(applyPatch(swapped, ids, x), lookup);
    const residual = values.map((v, k) => v - (reference[k] ?? 0));
    const jacobian = PATCH_TARGETS.map(() => new Array<number>(ids.length).fill(0));
    ids.forEach((_, j) => {
      const probe = x.map((v, i) => (i === j ? v + 1 : v));
      const shifted = targetValues(applyPatch(swapped, ids, probe), lookup);
      shifted.forEach((v, k) => {
        const row = jacobian[k];
        if (row !== undefined) row[j] = v - (values[k] ?? 0);
      });
    });
    const step = linearStep(residual, jacobian, reference, x, b);
    x = x.map((v, j) => v + (step[j] ?? 0));
    if (step.every((s) => Math.abs(s) < 0.01)) break;
  }
  return x.map((v) => Math.round(v * 10) / 10);
}

export function solvePatch(original: Formula, swapped: Formula, allowed: readonly string[], lookup: IngredientLookup = bakingIngredient): PatchResult {
  const reference = targetValues(original, lookup);
  const grams = solve(swapped, allowed, reference, lookup);
  const patched = applyPatch(swapped, allowed, grams);
  const patchedValues = targetValues(patched, lookup);
  const adjustments: PatchAdjustment[] = [];
  allowed.forEach((id, j) => {
    const delta = grams[j] ?? 0;
    if (Math.abs(delta) < 0.05) return;
    adjustments.push({ ingredientId: id, name: lookup(id).name, deltaGrams: delta, explanation: explainAdjustment(id, delta, reference, patchedValues) });
  });
  const before = deltaTargets(original, lookup);
  return {
    adjustments,
    patched,
    swapDelta: functionalDelta(before, deltaTargets(swapped, lookup)),
    patchedDelta: functionalDelta(before, deltaTargets(patched, lookup)),
    misfitBefore: misfit(targetValues(swapped, lookup), reference),
    misfitAfter: misfit(patchedValues, reference),
    unresolved: unresolvedTargets(patchedValues, reference),
  };
}

export type { PatchTargetId };

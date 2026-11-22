/**
 * Grams → the US household measure a cook would reach for ("≈ 2 ¼ cups",
 * "≈ 1 ½ tsp", "≈ 1 qt", "≈ 2 large eggs"), for at-a-glance reading beside
 * the formula's grams.
 *
 * Basis: never a water-density guess. Each figure divides the line's grams by
 * USDA's own weight for that measure of that ingredient (`portionWeight`,
 * FoodData Central portions: MEASURED, DERIVED by the exact US customary
 * ratio, or DECLARED with its reason). Where USDA weighed no household measure
 * the result says so instead of inventing one.
 *
 * Rounding is display-only and goes to real kitchen tools: teaspoons to
 * ⅛ ¼ ½ ¾, tablespoons to ½, cups to ¼ ⅓ ½ ⅔ ¾, pints and quarts to ¼, eggs to ½.
 * The grams stay the quantity of record.
 *
 * @file src/lib/baking/householdMeasure.ts
 */
import { bakingIngredient } from "@/data/baking";
import { portionWeight, type PortionWeight } from "./recipes/portions";
import type { Basis } from "./types";

export type HouseholdUnit = "tsp" | "Tbsp" | "cup" | "pt" | "qt" | "egg";

export type HouseholdMeasure =
  | {
      ok: true;
      /** Display text without the "≈", e.g. "2 ¼ cups". */
      text: string;
      unit: HouseholdUnit;
      /** The unrounded amount in `unit`. */
      exact: number;
      basis: Basis;
      /** Plain words, e.g. "FDC 168896: 1 cup = 137 g". */
      how: string;
    }
  | { ok: false; reason: string };

const SPOON_TSP = [0, 1 / 8, 1 / 4, 1 / 2, 3 / 4] as const;
const SPOON_TBSP = [0, 1 / 2] as const;
const CUP_PARTS = [0, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4] as const;
const QUARTERS = [0, 1 / 4, 1 / 2, 3 / 4] as const;
const HALVES = [0, 1 / 2] as const;

const GLYPH: ReadonlyArray<readonly [number, string]> = [
  [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [1 / 2, "½"], [2 / 3, "⅔"], [3 / 4, "¾"],
];

/** Round to a whole number plus the nearest allowed fraction (1 carries over). */
export function roundToParts(x: number, parts: readonly number[]): number {
  const whole = Math.floor(x);
  const frac = x - whole;
  let best = 0;
  for (const p of [...parts, 1]) {
    if (Math.abs(frac - p) < Math.abs(frac - best)) best = p;
  }
  return whole + best;
}

/** 2.333… → "2 ⅓", 0.5 → "½", 3 → "3". */
export function fractionText(x: number): string {
  const whole = Math.floor(x + 1e-9);
  const frac = x - whole;
  const glyph = GLYPH.find(([v]) => Math.abs(v - frac) < 1e-6)?.[1] ?? "";
  if (whole === 0) return glyph === "" ? "0" : glyph;
  return glyph === "" ? String(whole) : `${whole} ${glyph}`;
}

const EGG_NOUN: Readonly<Record<string, readonly [string, string]>> = {
  "whole-egg": ["large egg", "large eggs"],
  "egg-white": ["large egg white", "large egg whites"],
  "egg-yolk": ["large egg yolk", "large egg yolks"],
};

function weigh(id: string, measure: string): PortionWeight | null {
  const r = portionWeight(id, measure, "");
  return r.ok ? r.value : null;
}

function result(amount: number, exact: number, unit: HouseholdUnit, label: string, w: PortionWeight): HouseholdMeasure {
  return { ok: true, text: `${fractionText(amount)} ${label}`, unit, exact, basis: w.basis, how: w.how };
}

function eggMeasure(id: string, grams: number, nouns: readonly [string, string]): HouseholdMeasure | null {
  const w = weigh(id, "large");
  if (w === null) return null;
  const exact = grams / w.gramsPerOne;
  const amount = Math.max(roundToParts(exact, HALVES), 1 / 2);
  return result(amount, exact, "egg", amount > 1 ? nouns[1] : nouns[0], w);
}

/** Cups, or pints / quarts for a pourable liquid once it reaches 2 / 4 cups. */
function cupScaleMeasure(id: string, grams: number, cup: PortionWeight): HouseholdMeasure {
  const cups = grams / cup.gramsPerOne;
  const pourable = bakingIngredient(id).category === "liquid_dairy";
  if (pourable && roundToParts(cups, CUP_PARTS) >= 4) {
    const qt = cups / 4;
    return result(roundToParts(qt, QUARTERS), qt, "qt", "qt", cup);
  }
  if (pourable && roundToParts(cups, CUP_PARTS) >= 2) {
    const pt = cups / 2;
    return result(roundToParts(pt, QUARTERS), pt, "pt", "pt", cup);
  }
  const amount = roundToParts(cups, CUP_PARTS);
  return result(amount, cups, "cup", amount > 1 ? "cups" : "cup", cup);
}

/**
 * The household measure for `grams` of a Baking Lab ingredient: teaspoons
 * below a tablespoon, tablespoons below ¼ cup, then cups (pints and quarts
 * for pourable liquids). Eggs read as large eggs.
 */
export function householdMeasure(ingredientId: string, grams: number): HouseholdMeasure {
  if (!(grams > 0)) return { ok: false, reason: "no quantity" };
  const nouns = EGG_NOUN[ingredientId];
  const egg = nouns === undefined ? null : eggMeasure(ingredientId, grams, nouns);
  if (egg !== null) return egg;

  const cupResult = portionWeight(ingredientId, "cup", "");
  if (!cupResult.ok) return { ok: false, reason: cupResult.reason };
  const tsp = weigh(ingredientId, "tsp");
  if (tsp !== null) {
    const exact = grams / tsp.gramsPerOne;
    const amount = roundToParts(exact, SPOON_TSP);
    if (amount === 0) return { ok: true, text: "pinch (< ⅛ tsp)", unit: "tsp", exact, basis: tsp.basis, how: tsp.how };
    if (amount < 3) return result(amount, exact, "tsp", "tsp", tsp);
  }
  const tbsp = weigh(ingredientId, "tbsp");
  if (tbsp !== null) {
    const exact = grams / tbsp.gramsPerOne;
    const amount = roundToParts(exact, SPOON_TBSP);
    if (amount < 4) return result(amount, exact, "Tbsp", "Tbsp", tbsp);
  }
  return cupScaleMeasure(ingredientId, grams, cupResult.value);
}

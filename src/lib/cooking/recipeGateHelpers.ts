/**
 * Verification Gate Helpers — unit parsing, catalog resolution, and thermal extraction
 *
 * @file src/lib/cooking/recipeGateHelpers.ts
 */

import type { CosmicRecipe } from "@/data/featuredRecipe";
import { countToMass } from "@/lib/cooking/countToMass";
import { MEASURE_ML, volumeToMass } from "@/lib/cooking/volumetrics";
import {
  resolveCatalogIngredient,
  type CatalogIngredient,
} from "@/lib/ingredients/ingredientCatalog";

export const UNIT_CANONICAL_MAP: Record<string, string> = {
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbs: "tbsp",
  tb: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  cups: "cup",
  c: "cup",
  grams: "g",
  gram: "g",
  kilograms: "kg",
  kilogram: "kg",
  ounces: "oz",
  ounce: "oz",
  pounds: "lb",
  pound: "lb",
  lbs: "lb",
  milliliters: "ml",
  milliliter: "ml",
  liters: "l",
  liter: "l",
  cloves: "clove",
  stalks: "stalk",
  slices: "slice",
  pinches: "pinch",
  pieces: "piece",
};

export function parseFractionalQuantity(qtyStr: string): number {
  const trimmed = qtyStr.trim();
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1] ?? "0", 10);
    const num = parseInt(mixedMatch[2] ?? "0", 10);
    const den = parseInt(mixedMatch[3] ?? "1", 10);
    return den > 0 ? whole + num / den : whole;
  }
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1] ?? "0", 10);
    const den = parseInt(fracMatch[2] ?? "1", 10);
    return den > 0 ? num / den : 0;
  }
  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeUnit(rawUnit: string): string {
  const trimmed = rawUnit.trim();
  if (trimmed === "T" || trimmed === "T.") return "tbsp";
  if (trimmed === "t" || trimmed === "t.") return "tsp";
  const lower = trimmed.toLowerCase();
  return UNIT_CANONICAL_MAP[lower] ?? lower;
}

export const GLUTEN_CONTAINING_TERMS: RegExp[] = [
  /\bwheat\b/i,
  /\bflour\b/i,
  /\bseitan\b/i,
  /\bsemolina\b/i,
  /\bspelt\b/i,
  /\brye\b/i,
  /\bbarley\b/i,
  /\bbread\b/i,
  /\bbreadcrumbs\b/i,
  /\bcroutons?\b/i,
  /\bpanko\b/i,
  /\bpasta\b/i,
  /\bspaghetti\b/i,
  /\blinguine\b/i,
  /\bfettuccine\b/i,
  /\btagliatelle\b/i,
  /\brigatoni\b/i,
  /\bfusilli\b/i,
  /\blasagn[ae]\b/i,
  /\bpenne\b/i,
  /\bmacaroni\b/i,
  /\borzo\b/i,
  /\bgnocchi\b/i,
  /\bnoodles?\b/i,
  /\budon\b/i,
  /\bramen\b/i,
  /\bsoy\s+sauce\b/i,
  /\bteriyaki\b/i,
  /\bcouscous\b/i,
  /\bbulgur\b/i,
  /\bfarro\b/i,
  /\bbeer\b/i,
  /\bmalt\b/i,
  /\bmalt\s+vinegar\b/i,
];

export function isKnownGlutenSource(ingredientName: string): boolean {
  const name = ingredientName.toLowerCase();
  if (name.includes("flour") || name.includes("noodle") || name.includes("pasta") || name.includes("bread")) {
    if (/\bgluten[- ]free\b/i.test(name)) return false;
    if (/\brice\s+noodles?\b/i.test(name)) return false;
  }
  return GLUTEN_CONTAINING_TERMS.some((rx) => rx.test(name));
}

export interface ResolvedIngredientResult {
  ingredient: CosmicRecipe["ingredients"][number];
  entry: CatalogIngredient | null;
  gramWeight: number;
}

function tryResolveFromCatalog(rawName: string): CatalogIngredient | null {
  const first = resolveCatalogIngredient(rawName);
  if (first) return first.entry;

  const simplified = rawName
    .toLowerCase()
    .replace(/\b(fresh|dried|chopped|minced|diced|sliced|crushed|ground|toasted|cooked|large|medium|small)\b/g, "")
    .trim();
  const second = resolveCatalogIngredient(simplified);
  if (second) return second.entry;

  const partSimplified = simplified
    .replace(/\b(breast|thigh|thighs|wing|wings|drumstick|drumsticks|fillet|filet|cutlet|steak|chops?|roast|tenderloin)\b/g, "")
    .trim();
  if (!partSimplified) return null;
  const third = resolveCatalogIngredient(partSimplified);
  return third ? third.entry : null;
}

export function computeGramWeight(name: string, qty: number, unit: string): number {
  if (unit === "g") return qty;
  if (unit === "kg") return qty * 1000;
  if (unit === "oz") return qty * 28.35;
  if (unit === "lb") return qty * 453.59;
  if (unit === "cup" || unit === "tbsp" || unit === "tsp") {
    const vol = volumeToMass(name, qty, unit);
    return vol?.grams ?? qty * MEASURE_ML[unit];
  }
  const count = countToMass(name, qty, unit);
  return count?.grams ?? qty * 50;
}

export function resolveSingleIngredient(
  ing: CosmicRecipe["ingredients"][number],
): { entry: CatalogIngredient | null; gramWeight: number } {
  const entry = tryResolveFromCatalog(ing.name);
  const qty = parseFractionalQuantity(ing.quantity);
  const gramWeight = computeGramWeight(ing.name, qty, ing.unit);
  return { entry, gramWeight };
}

export interface ParsedStepTemperature {
  temperatureF: number;
  isInternalDoneness: boolean;
}

export function parseStepTemperatures(instruction: string): ParsedStepTemperature[] {
  const results: ParsedStepTemperature[] = [];
  const tempRegex = /(\d{2,4})\s*(?:°\s*([CcFf])|degrees?\s*([CcFf])|([CcFf])\b|°(?!\s*[Cc]))/g;
  let match: RegExpExecArray | null;

  while ((match = tempRegex.exec(instruction)) !== null) {
    const rawVal = parseInt(match[1] ?? "0", 10);
    const unitChar = (match[2] ?? match[3] ?? match[4] ?? "F").toUpperCase();
    const tempF = unitChar === "C" ? Math.round((rawVal * 9) / 5 + 32) : rawVal;

    const startPos = Math.max(0, match.index - 40);
    const endPos = Math.min(instruction.length, match.index + match[0].length + 40);
    const localSnippet = instruction.slice(startPos, endPos).toLowerCase();

    const isInternalDoneness =
      localSnippet.includes("internal") ||
      localSnippet.includes("thermometer") ||
      localSnippet.includes("center reaches") ||
      localSnippet.includes("probe reads") ||
      localSnippet.includes("thickest part");

    results.push({ temperatureF: tempF, isInternalDoneness });
  }

  return results;
}

export function parseStepTemperature(instruction: string): number | undefined {
  const all = parseStepTemperatures(instruction);
  return all[0]?.temperatureF;
}

export function findStepProteinTarget(
  instructionLower: string,
  ingredients: CosmicRecipe["ingredients"],
): string | undefined {
  const hit = ingredients.find((i) => {
    const n = i.name.toLowerCase();
    const tokens = n.split(/[\s-]+/).filter((t) => t.length > 2);
    const mentioned = instructionLower.includes(n) || tokens.some((t) => instructionLower.includes(t));
    return (
      mentioned &&
      (n.includes("chicken") ||
        n.includes("turkey") ||
        n.includes("poultry") ||
        n.includes("beef") ||
        n.includes("pork") ||
        n.includes("lamb") ||
        n.includes("salmon") ||
        n.includes("fish"))
    );
  });
  return hit?.name;
}

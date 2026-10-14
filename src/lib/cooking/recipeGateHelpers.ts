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
  isCoolingOrChilling: boolean;
  isOven: boolean;
  isLiquid: boolean;
  isPressure: boolean;
}

function extractClauseSnippet(instruction: string, matchIndex: number, matchLength: number): string {
  const before = instruction.slice(0, matchIndex);
  const boundaryBeforeRegex = /[.;!\n]|,\s*(?:then|and\s+then|before|after|while)\b/gi;
  let lastBoundaryIndex = 0;
  let bMatch: RegExpExecArray | null;
  while ((bMatch = boundaryBeforeRegex.exec(before)) !== null) {
    lastBoundaryIndex = bMatch.index + bMatch[0].length;
  }
  const clauseStart = Math.max(lastBoundaryIndex, matchIndex - 60);

  const after = instruction.slice(matchIndex + matchLength);
  const boundaryAfterMatch = /[.;!\n]|,\s*(?:then|and\s+then|before|after|while)\b/i.exec(after);
  const clauseEnd = boundaryAfterMatch
    ? matchIndex + matchLength + boundaryAfterMatch.index
    : Math.min(instruction.length, matchIndex + matchLength + 60);

  return instruction.slice(clauseStart, clauseEnd).toLowerCase();
}

export function parseStepTemperatures(instruction: string): ParsedStepTemperature[] {
  const results: ParsedStepTemperature[] = [];
  const tempRegex = /(\d{2,4})\s*(?:°\s*([CcFf])|degrees?\s*([CcFf])|([CcFf])\b|°(?!\s*[Cc]))/g;
  let match: RegExpExecArray | null;

  while ((match = tempRegex.exec(instruction)) !== null) {
    const rawVal = parseInt(match[1] ?? "0", 10);
    const unitChar = (match[2] ?? match[3] ?? match[4] ?? "F").toUpperCase();
    const tempF = unitChar === "C" ? Math.round((rawVal * 9) / 5 + 32) : rawVal;

    const localSnippet = extractClauseSnippet(instruction, match.index, match[0].length);

    const isInternalDoneness =
      /\b(internal|thermometer|center\s+reaches|probe\s+reads|thickest\s+part|doneness)\b/i.test(localSnippet);

    const hasCoolingKeywords =
      /\b(chill|chilled|chilling|cooling|cool\s+down|cool\s+to|refrigerat\w*|ice\s+bath|freeze|freezer)\b/i.test(
        localSnippet,
      );

    const isCoolingOrChilling = hasCoolingKeywords && !isInternalDoneness;

    const isOven = /\b(oven|bake|baking|baked|roast|roasting|roasted|preheat|broil|broiling)\b/i.test(localSnippet);

    const isLiquid = /\b(boil|boiling|simmer|simmering|poach|poaching|steam|steaming|water|broth|stock|soup|liquid)\b/i.test(
      localSnippet,
    );

    const isPressure = /\b(pressure|instant\s+pot|pressure\s+cook|autoclave|psi)\b/i.test(localSnippet);

    results.push({
      temperatureF: tempF,
      isInternalDoneness,
      isCoolingOrChilling,
      isOven,
      isLiquid,
      isPressure,
    });
  }

  return results;
}

export function parseStepTemperature(instruction: string): number | undefined {
  const all = parseStepTemperatures(instruction);
  return all[0]?.temperatureF;
}

const PROTEIN_KEYWORDS: readonly string[] = [
  "chicken",
  "turkey",
  "poultry",
  "duck",
  "fowl",
  "quail",
  "hen",
  "ground",
  "burger",
  "patty",
  "sausage",
  "beef",
  "pork",
  "lamb",
  "veal",
  "steak",
  "roast",
  "chop",
  "tenderloin",
  "sirloin",
  "brisket",
  "ribs",
  "mutton",
  "fish",
  "salmon",
  "tuna",
  "cod",
  "shrimp",
  "seafood",
  "halibut",
  "trout",
  "tilapia",
  "sea bass",
  "snapper",
  "prawn",
  "crab",
  "lobster",
  "scallop",
];

export interface FindProteinTargetOptions {
  fallbackToRecipeProteins?: boolean;
}

export function findStepProteinTargets(
  instructionLower: string,
  ingredients: CosmicRecipe["ingredients"],
  options?: FindProteinTargetOptions,
): string[] {
  const matches = ingredients.filter((ing) => {
    const n = ing.name.toLowerCase();
    const tokens = n.split(/[\s-]+/).filter((t) => t.length > 2);
    const mentionedInStep =
      instructionLower.includes(n) || tokens.some((t) => instructionLower.includes(t));
    const isProtein = PROTEIN_KEYWORDS.some((kw) => n.includes(kw));
    return mentionedInStep && isProtein;
  });

  if (matches.length > 0) {
    return matches.map((m) => m.name);
  }

  const directlyMentioned = PROTEIN_KEYWORDS.filter((kw) => {
    const rx = new RegExp(`\\b${kw}\\b`, "i");
    return rx.test(instructionLower);
  });
  if (directlyMentioned.length > 0) {
    return directlyMentioned;
  }

  if (options?.fallbackToRecipeProteins) {
    const recipeProteins = ingredients.filter((ing) => {
      const n = ing.name.toLowerCase();
      return PROTEIN_KEYWORDS.some((kw) => n.includes(kw));
    });
    return recipeProteins.map((m) => m.name);
  }

  return [];
}

export function findStepProteinTarget(
  instructionLower: string,
  ingredients: CosmicRecipe["ingredients"],
): string | undefined {
  const all = findStepProteinTargets(instructionLower, ingredients);
  return all[0];
}

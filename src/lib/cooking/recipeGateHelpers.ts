/**
 * Verification Gate Helpers — unit parsing, catalog resolution, and thermal extraction
 *
 * @file src/lib/cooking/recipeGateHelpers.ts
 */

import { countToMass } from "@/lib/cooking/countToMass";
import { MEASURE_ML, volumeToMass } from "@/lib/cooking/volumetrics";
import type { CatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { tryResolveFromCatalog } from "./recipeGateResolver";
import type { RecipeContentIngredient } from "./recipeGateTypes";

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
  /\bkamut\b/i,
  /\bbread\b/i,
  /\bbreadcrumbs?\b/i,
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
  /\bpitas?\b/i,
  /\bnaan\b/i,
  /\bbagels?\b/i,
  /\bsoy\s+sauce\b/i,
  /\bteriyaki\b/i,
  /\bcouscous\b/i,
  /\bbulgur\b/i,
  /\bfarro\b/i,
  /\bbeer\b/i,
  /\bmalt\b/i,
  /\bmalt\s+vinegar\b/i,
];

export const GLUTEN_EXEMPT_TERMS: RegExp[] = [
  /\bgluten[- ]free\s+(soy\s+sauce|flour|breadcrumbs?|bread|pasta|noodles?|spaghetti|linguine|fettuccine|tagliatelle|rigatoni|fusilli|lasagn[ae]|penne|macaroni|orzo|gnocchi|udon|ramen|pita|naan|bagels?)\b/gi,
  /\b(rice|almond|buckwheat|coconut|tapioca|chickpea|gram|besan|corn|potato|sorghum|teff|cassava|arrowroot)\s+flour\b/gi,
  /\b(rice|glass|cellophane|sweet\s+potato|kelp|shirataki)\s+noodles?\b/gi,
];

export function isKnownGlutenSource(ingredientName: string): boolean {
  let remaining = ingredientName.toLowerCase().trim();
  for (const exempt of GLUTEN_EXEMPT_TERMS) {
    remaining = remaining.replace(exempt, " ");
  }
  return GLUTEN_CONTAINING_TERMS.some((rx) => rx.test(remaining));
}

export interface ResolvedIngredientResult {
  ingredient: RecipeContentIngredient;
  entry: CatalogIngredient | null;
  gramWeight: number;
}

export * from "./recipeGateResolver";

export function computeGramWeight(
  name: string,
  qty: number,
  unit: string,
): number {
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

export function resolveSingleIngredient(ing: RecipeContentIngredient): {
  entry: CatalogIngredient | null;
  gramWeight: number;
} {
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
  clause: string;
  precedingClause: string;
}

function temperatureClause(
  instruction: string,
  matchIndex: number,
): { text: string; offset: number; preceding: string } {
  const boundaries =
    /[;!\n]|(?<!\d)\.(?!\d)|,\s*(?:then|and\s+then|before|after|while)\b|\b(?:and\s+then|then|and)\s+(?=(?:preheat|bake|roast|broil|boil|simmer|steam|poach|chill|cool|refrigerate|cook)\b)/gi;
  let start = 0;
  let precedingStart = 0;
  let end = instruction.length;
  for (const boundary of instruction.matchAll(boundaries)) {
    const index = boundary.index ?? 0;
    if (index < matchIndex) {
      precedingStart = start;
      start = index + boundary[0].length;
    } else {
      end = index;
      break;
    }
  }
  return {
    text: instruction.slice(start, end).toLowerCase(),
    offset: matchIndex - start,
    preceding: instruction.slice(precedingStart, start).toLowerCase(),
  };
}

function lastKeywordIndex(text: string, pattern: RegExp): number {
  let result = -1;
  for (const match of text.matchAll(pattern)) result = match.index ?? -1;
  return result;
}

function temperaturePurpose(
  before: string,
  after: string,
): {
  isInternalDoneness: boolean;
  isCoolingOrChilling: boolean;
  isOven: boolean;
  isLiquid: boolean;
} {
  const internal = lastKeywordIndex(
    before,
    /\b(internal|thermometer|center\s+reaches|probe\s+reads|thickest\s+part|doneness)\b/gi,
  );
  const oven = lastKeywordIndex(
    before,
    /\b(oven|bake|baking|baked|roast|roasting|roasted|preheat|broil|broiling)\b/gi,
  );
  const liquid = lastKeywordIndex(
    before,
    /\b(boil|boiling|simmer|simmering|poach|poaching|steam|steaming|water|broth|stock|soup|liquid)\b/gi,
  );
  const cooling = lastKeywordIndex(
    before,
    /\b(chill|chilled|chilling|cooling|cool\s+down|cool\s+to|refrigerat\w*|ice\s+bath|freeze|freezer)\b/gi,
  );
  const cooking = lastKeywordIndex(
    before,
    /\b(cook|cooking|roast|roasting|bake|baking|broil|boiling|boil|simmer|simmering|poach|steam|sear|fry)\b/gi,
  );
  const isCoolingOrChilling = cooling >= 0 && cooling > cooking;
  const isInternalDoneness =
    !isCoolingOrChilling &&
    ((internal >= 0 && internal > oven && internal > liquid) ||
      /^\s*internal\b/i.test(after));
  const isOven =
    !isCoolingOrChilling &&
    !isInternalDoneness &&
    (/^\s*oven\b/i.test(after) || (oven >= 0 && oven > liquid));
  return {
    isCoolingOrChilling,
    isInternalDoneness,
    isOven,
    isLiquid:
      !isCoolingOrChilling && !isInternalDoneness && !isOven && liquid >= 0,
  };
}

export function parseStepTemperatures(
  instruction: string,
): ParsedStepTemperature[] {
  const results: ParsedStepTemperature[] = [];
  const tempRegex =
    /(\d{2,4})\s*(?:°\s*([CcFf])|degrees?\s*([CcFf])|([CcFf])\b|°(?!\s*[Cc]))/g;
  let match: RegExpExecArray | null;

  while ((match = tempRegex.exec(instruction)) !== null) {
    const rawVal = parseInt(match[1] ?? "0", 10);
    const unitChar = (match[2] ?? match[3] ?? match[4] ?? "F").toUpperCase();
    const tempF = unitChar === "C" ? Math.round((rawVal * 9) / 5 + 32) : rawVal;

    const clause = temperatureClause(instruction, match.index);
    const before = clause.text.slice(0, clause.offset);
    const after = clause.text.slice(clause.offset + match[0].length);
    const purpose = temperaturePurpose(before, after);
    const isPressure = /\b(pressure|instant\s+pot|autoclave|psi)\b/i.test(
      clause.text,
    );

    results.push({
      temperatureF: tempF,
      ...purpose,
      isPressure,
      clause: clause.text,
      precedingClause: clause.preceding,
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
  "burger",
  "patty",
  "sausage",
  "beef",
  "pork",
  "lamb",
  "veal",
  "steak",
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
  ingredients: RecipeContentIngredient[],
  options?: FindProteinTargetOptions,
): string[] {
  const mentions = (text: string, word: string): boolean =>
    new RegExp(`\\b${word}\\b`, "i").test(text);
  const matches = ingredients.filter((ing) => {
    const name = ing.name.toLowerCase();
    return PROTEIN_KEYWORDS.some(
      (word) => mentions(name, word) && mentions(instructionLower, word),
    );
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
      return PROTEIN_KEYWORDS.some((word) => mentions(n, word));
    });
    return recipeProteins.map((m) => m.name);
  }

  return [];
}

export function findStepProteinTarget(
  instructionLower: string,
  ingredients: RecipeContentIngredient[],
): string | undefined {
  const all = findStepProteinTargets(instructionLower, ingredients);
  return all[0];
}

/** Clause-scoped temperature purpose and protein attribution. */

import type { RecipeContentIngredient } from "./recipeGateTypes";

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
    const { index } = boundary;
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
  for (const match of text.matchAll(pattern)) result = match.index;
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

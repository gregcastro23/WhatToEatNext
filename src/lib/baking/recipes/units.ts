/**
 * What a recipe's unit string means, before any ingredient is known.
 *
 * Weight units are exact by definition. Volume units are exact as volumes —
 * their grams depend on the ingredient, so they are resolved later against
 * that ingredient's own measured FDC portion. Count units name a size or a
 * package. A "pinch" names no quantity at all.
 *
 * @file src/lib/baking/recipes/units.ts
 */

/** The US customary cup, mL: 8 fl oz × 29.5735295625 mL (1 gal = 231 in³ exactly). */
export const CUP_ML = 236.5882365;

export type VolumeMeasure = "cup" | "tbsp" | "tsp" | "floz" | "ml";

export type UnitReading =
  | { kind: "weight"; gramsPerUnit: number; label: string }
  | { kind: "volume"; measure: VolumeMeasure; mlPerUnit: number; label: string }
  | { kind: "count"; size: string }
  | { kind: "trace"; label: string }
  | { kind: "unknown"; unit: string };

/** Avoirdupois: 1 lb = 453.59237 g exactly, 1 oz = 1/16 lb (NIST Handbook 44, Appendix C). */
const POUND_G = 453.59237;
const OUNCE_G = POUND_G / 16;

const WEIGHTS: ReadonlyArray<[RegExp, number, string]> = [
  [/^(g|gr|grams?)$/, 1, "g"],
  [/^(kg|kilograms?)$/, 1000, "kg"],
  [/^(oz|ounces?)$/, OUNCE_G, "oz"],
  [/^(lb|lbs|pounds?)$/, POUND_G, "lb"],
];

const VOLUMES: ReadonlyArray<[RegExp, VolumeMeasure, number, string]> = [
  [/^(cups?|c)$/, "cup", CUP_ML, "cup"],
  [/^(tbsp|tbs|tbl|tablespoons?|T)$/, "tbsp", CUP_ML / 16, "tbsp"],
  [/^(tsp|teaspoons?|t)$/, "tsp", CUP_ML / 48, "tsp"],
  [/^(fl\.? ?oz|fluid ounces?)$/, "floz", CUP_ML / 8, "fl oz"],
  [/^(pints?|pt)$/, "cup", CUP_ML * 2, "pint"],
  [/^(quarts?|qt)$/, "cup", CUP_ML * 4, "quart"],
  [/^(gallons?|gal)$/, "cup", CUP_ML * 16, "gallon"],
  [/^(ml|milliliters?|millilitres?)$/, "ml", 1, "mL"],
  [/^(l|liters?|litres?)$/, "ml", 1000, "L"],
];

const COUNTS: ReadonlyArray<[RegExp, string]> = [
  [/^(extra[- ]large|x-?large|xl)$/, "extra large"],
  [/^(large|lg)$/, "large"],
  [/^(medium|med)$/, "medium"],
  [/^(small|sm)$/, "small"],
  [/^jumbo$/, "jumbo"],
  [/^sticks?$/, "stick"],
  [/^(packets?|packages?|envelopes?|sachets?)$/, "packet"],
  [/^(whole|pieces?|each|units?|eggs?|)$/, "unsized"],
];

const TRACES = /^(pinch(es)?|dash(es)?|to taste|sprinkle|smidgen)$/;

/** The meaning of a unit string; anything unrecognised is said to be unknown, never guessed. */
export function readUnit(raw: string): UnitReading {
  const unit = raw.trim();
  const lower = unit.toLowerCase();
  for (const [pattern, gramsPerUnit, label] of WEIGHTS) if (pattern.test(lower)) return { kind: "weight", gramsPerUnit, label };
  // "T" and "t" are the one place where case carries meaning (tablespoon vs teaspoon).
  for (const [pattern, measure, mlPerUnit, label] of VOLUMES) if (pattern.test(unit) || pattern.test(lower)) return { kind: "volume", measure, mlPerUnit, label };
  for (const [pattern, size] of COUNTS) if (pattern.test(lower)) return { kind: "count", size };
  if (TRACES.test(lower)) return { kind: "trace", label: lower };
  return { kind: "unknown", unit };
}

/**
 * A package weight the recipe itself states, e.g. a unit of "can (14oz)":
 * grams per counted item, or null.
 */
export function statedPackageGrams(text: string): number | null {
  const match = /(\d+(?:\.\d+)?)\s*-?\s*(oz|ounces?|g|grams?)\b/i.exec(text);
  if (match === null) return null;
  const amount = Number(match[1]);
  const unit = (match[2] ?? "").toLowerCase();
  return unit.startsWith("o") ? amount * OUNCE_G : amount;
}

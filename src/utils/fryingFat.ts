/**
 * The fat a fried food absorbs, so a recipe counts the oil that is eaten, not
 * the oil in the pan.
 *
 * `[MEASURED 2026-09-26]` Summing every line in full scored Nigerian chin-chin's
 * 4 cups of frying oil (872 g, 7,474 kcal) as eaten: it published 1,382 kcal a
 * serving against an authored 350.
 *
 * ── Basis ───────────────────────────────────────────────────────────────────
 *
 * Bognár, A. (2002). Tables on weight yield of food and retention factors of
 * food constituents for the calculation of nutrient composition of cooked foods
 * (dishes). Berichte der Bundesforschungsanstalt für Ernährung, BFE-R--02-03,
 * Karlsruhe — the tables EuroFIR's recipe-calculation procedure uses. It says
 * fat used as a cooking medium enters a recipe only as the fat the food takes
 * up, and it measures that uptake in grams per 100 g of food as prepared for
 * frying (its formula 8), by food category and method (Part 2, Tables 2–38).
 *
 * The highest uptake it reports for any food is:
 * - deep fry  7.00 g per 100 g — Table 38, cereal-flour dishes;
 * - fry in pan 10.00 g per 100 g — Table 32, potato products.
 * Every other category absorbs less: breaded meat 5–6, breaded chicken 4–5,
 * breaded fish 6, unbreaded meat, fish and vegetables 0–1.2. So these maxima
 * cap what a fried recipe can have eaten, and a fried total built on them is,
 * if anything, high. Choosing a category per recipe would be closer, and is a
 * separate ruling.
 *
 * @file src/utils/fryingFat.ts
 */

export type FryingMethod = "deep" | "pan";

/** Grams of fat absorbed per 100 g of food fried, at most (Bognár 2002; see above). */
export const MAX_FAT_UPTAKE_G_PER_100G: Readonly<Record<FryingMethod, number>> = { deep: 7, pan: 10 };

const FAT = String.raw`(?:oil|lard|ghee|shortening|fat)`;

/**
 * Instructions that heat a bath of fat: deep-frying, or fat heated to a frying
 * temperature ("Heat the oil to 350°F"). The verb is required, so "drizzle
 * with oil and bake at 190°C" is not frying.
 */
const HEATED = String.raw`\bheat\w*\b[^.;]{0,40}\b${FAT}\b[^.;]{0,60}`;
const DEEP_FRY: readonly RegExp[] = [
  /deep[- ]?fr(?:y|ied|ies|ying)/i,
  new RegExp(String.raw`${HEATED}\b(?:2[5-9]\d|3\d\d)\s*°?\s*F\b`, "i"),
  new RegExp(String.raw`${HEATED}\b1[5-9]\d\s*°\s*C\b`, "i"),
];

/** A layer of fat the food is fried in and then drained from. */
const SHALLOW_FRY: readonly RegExp[] = [
  /shallow[- ]?fr(?:y|ied|ying)/i,
  new RegExp(String.raw`\b(?:inch|centimet(?:er|re)|cm)\b[^.;]{0,20}\bof (?:hot |neutral |vegetable |the )?${FAT}`, "i"),
  /\bfry\w*\b[^.;]{0,60}\bin batches\b/i,
];
const DRAINED = /\bdrain/i;

/** A fat line that names itself as the frying medium ("oil for frying", "frying oil"). */
const FRYING_LINE =
  /\bfor (?:deep[- ]?|pan[- ]?|shallow[- ]?)?fr(?:y|ying)\b|\bfrying\b|\bdeep[- ]?fr(?:y|ying)\b|\bto (?:pan[- ]?)?fry\b/i;

export interface FryingLine {
  /** The line's own words: its name and notes. */
  text: string;
  /** Whether the catalog files the ingredient as a fat (`category: "oil"`). */
  fat: boolean;
  /** Its listed mass in grams, or null when it has none. */
  grams: number | null;
}

export interface FryingMedium {
  /** Index of the frying-fat line. */
  index: number;
  method: FryingMethod;
}

function methodFromInstructions(instructions: readonly string[]): FryingMethod | null {
  const text = instructions.join(" ");
  if (DEEP_FRY.some((pattern) => pattern.test(text))) return "deep";
  if (SHALLOW_FRY.some((pattern) => pattern.test(text)) && DRAINED.test(text)) return "pan";
  return null;
}

/**
 * The line a recipe fries in, or null when it fries in none. A fat line that
 * names itself as frying fat is the medium; otherwise, when the instructions
 * fry in a bath, the largest fat line is.
 */
export function findFryingMedium(lines: readonly FryingLine[], instructions: readonly string[]): FryingMedium | null {
  const fromInstructions = methodFromInstructions(instructions);
  const named = lines.findIndex((line) => line.fat && FRYING_LINE.test(line.text));
  if (named >= 0) return { index: named, method: fromInstructions ?? "pan" };
  if (fromInstructions === null) return null;
  let largest = -1;
  lines.forEach((line, i) => {
    const current = lines[largest]?.grams ?? -1;
    if (line.fat && (line.grams ?? 0) > current) largest = i;
  });
  return largest >= 0 ? { index: largest, method: fromInstructions } : null;
}

/**
 * Grams of the frying fat that end up in the food: what `friedGrams` of food
 * absorbs at most, and never more than was listed. A listed mass of null (the
 * recipe never said how much) is no limit — uptake does not depend on the
 * size of the bath, only that there is one.
 */
export function absorbedFatGrams(listedGrams: number | null, friedGrams: number, method: FryingMethod): number {
  const uptake = (Math.max(0, friedGrams) * MAX_FAT_UPTAKE_G_PER_100G[method]) / 100;
  return listedGrams === null ? uptake : Math.min(listedGrams, uptake);
}

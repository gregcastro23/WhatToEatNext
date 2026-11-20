/**
 * Sauce Scaling Utility
 * Functions for scaling sauce recipe ingredients and parsing yield strings
 *
 * @file src/utils/sauceScaling.ts
 */

/**
 * Parse a yield string to extract the number of servings or cups
 * Examples: "Serves 4" -> 4, "Makes about 3 cups" -> 3, "Makes about 1 cup of curry paste" -> 1
 */
/**
 * Capture group `i`, or "" when absent. parseInt/parseFloat of "" and of
 * undefined both yield NaN, so this preserves the original arithmetic exactly.
 */
function group(match: RegExpMatchArray | null, i: number): string {
  return match?.[i] ?? "";
}

export function parseYieldToServings(yieldStr: string): number {
  const trimmed = yieldStr.trim();
  if (!trimmed) return 1;

  // Match "Serves N" pattern
  const servesMatch = trimmed.match(/serves?\s+(\d+(?:\.\d+)?)/i);
  if (servesMatch) return parseFloat(group(servesMatch, 1));

  // Match "Makes about 1/2 cup" or "Makes about 3 cups" before bare numbers
  const makesMatch = trimmed.match(
    /makes?\s+(?:about\s+)?(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/i,
  );
  if (makesMatch) {
    const parsed = parseFraction(group(makesMatch, 1));
    if (parsed !== null) return parsed;
  }

  // Match bare fraction patterns like "1/2 cup" or "2 1/2 cups"
  const fractionMatch = trimmed.match(/(\d+\s+\d+\/\d+|\d+\/\d+)/);
  if (fractionMatch) {
    const parsed = parseFraction(group(fractionMatch, 1));
    if (parsed !== null) return parsed;
  }

  // Match leading count like "2 cups"
  const leadingMatch = trimmed.match(/^(\d+(?:\.\d+)?)\b/);
  if (leadingMatch) return parseFloat(group(leadingMatch, 1));

  return 1;
}

/**
 * Parse a fraction string to a number
 * Examples: "1/4" -> 0.25, "1/2" -> 0.5, "3" -> 3, "2 1/2" -> 2.5
 */
function parseFraction(str: string): number | null {
  str = str.trim();

  // Mixed number: "2 1/2"
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return (
      parseInt(group(mixedMatch, 1), 10) +
      parseInt(group(mixedMatch, 2), 10) / parseInt(group(mixedMatch, 3), 10)
    );
  }

  // Simple fraction: "1/4"
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(group(fractionMatch, 1), 10) / parseInt(group(fractionMatch, 2), 10);
  }

  // Decimal or whole number
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Format a number as a readable quantity (uses fractions where sensible)
 */
function formatQuantity(value: number): string {
  if (value === 0) return "0";

  // Common fraction representations
  const fractions: Array<[number, string]> = [
    [0.125, "1/8"],
    [0.25, "1/4"],
    [0.333, "1/3"],
    [0.375, "3/8"],
    [0.5, "1/2"],
    [0.667, "2/3"],
    [0.75, "3/4"],
  ];

  const whole = Math.floor(value);
  const remainder = value - whole;

  if (remainder < 0.05) {
    return whole.toString();
  }

  // Find closest fraction
  let closestFraction: [number, string] | undefined;
  let minDiff = 0.05;
  for (const entry of fractions) {
    const diff = Math.abs(remainder - entry[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closestFraction = entry;
    }
  }

  if (closestFraction) {
    return whole > 0 ? `${whole} ${closestFraction[1]}` : closestFraction[1];
  }

  // Fall back to decimal
  return value < 10 ? value.toFixed(1).replace(/\.0$/, "") : Math.round(value).toString();
}

/**
 * Scale a single ingredient string by a given factor
 * Example: scaleIngredientString("2 lbs (900g) whole peeled tomatoes", 2) -> "4 lbs (1800g) whole peeled tomatoes"
 */
export function scaleIngredientString(ingredient: string, factor: number): string {
  if (factor === 1) return ingredient;

  // Match leading quantity patterns:
  // "2 lbs", "1/4 cup", "2 1/2 tbsp", "4-6 cloves", "1 pinch"
  // Also handles parenthetical metric: "(900g)", "(60ml)"
  let scaled = ingredient;

  // Scale the leading quantity
  scaled = scaled.replace(
    /^(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)/,
    (match) => {
      const num = parseFraction(match);
      if (num === null) return match;
      return formatQuantity(num * factor);
    },
  );

  // Scale range patterns like "4-6"
  scaled = scaled.replace(
    /^(\d+)-(\d+)/,
    (_match: string, low: string, high: string): string => {
      const lowNum = parseInt(low, 10) * factor;
      const highNum = parseInt(high, 10) * factor;
      return `${formatQuantity(lowNum)}-${formatQuantity(highNum)}`;
    },
  );

  // Scale parenthetical metric quantities: "(900g)", "(60ml)", "(115g)"
  scaled = scaled.replace(
    /\((\d+(?:\.\d+)?)(g|ml|kg|l)\)/gi,
    (_match: string, num: string, unit: string): string => {
      const scaledNum = parseFloat(num) * factor;
      return `(${formatQuantity(scaledNum)}${unit})`;
    },
  );

  return scaled;
}

/**
 * Scale all ingredients in a sauce recipe by a given factor
 */
export function scaleSauceIngredients(
  ingredients: string[],
  scaleFactor: number,
): string[] {
  if (scaleFactor === 1) return [...ingredients];
  return ingredients.map((ing) => scaleIngredientString(ing, scaleFactor));
}

const UNIT_INFLECTIONS = new Map<string, { singular: string; plural: string }>([
  ["cup", { singular: "cup", plural: "cups" }],
  ["cups", { singular: "cup", plural: "cups" }],
  ["serving", { singular: "serving", plural: "servings" }],
  ["servings", { singular: "serving", plural: "servings" }],
  ["quart", { singular: "quart", plural: "quarts" }],
  ["quarts", { singular: "quart", plural: "quarts" }],
  ["pint", { singular: "pint", plural: "pints" }],
  ["pints", { singular: "pint", plural: "pints" }],
  ["liter", { singular: "liter", plural: "liters" }],
  ["liters", { singular: "liter", plural: "liters" }],
  ["tbsp", { singular: "tbsp", plural: "tbsp" }],
  ["ml", { singular: "ml", plural: "ml" }],
]);

function formatYieldUnit(unitToken: string | undefined, qty: number): string {
  if (!unitToken) return "";
  const entry = UNIT_INFLECTIONS.get(unitToken.toLowerCase());
  if (!entry) return unitToken;
  return qty > 1 ? entry.plural : entry.singular;
}

/**
 * Format a yield string scaled by `factor` while preserving its original unit
 * and agreeing singular/plural forms (e.g. "2 cups" * 0.5 -> "1 cup").
 */
export function formatScaledYield(yieldStr: string | undefined, factor: number): string {
  const trimmed = yieldStr?.trim() ?? "";
  if (!trimmed) {
    const qty = 4 * factor;
    return `Serves ${formatQuantity(qty)}`;
  }
  if (factor === 1) return trimmed;

  return trimmed.replace(
    /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?:-(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?))?(?:([ \t]*)(cups?|servings?|quarts?|pints?|liters?|tbsp|ml)\b)?/gi,
    (match, rawLow: string, rawHigh?: string, ws?: string, rawUnit?: string) => {
      const lowVal = parseFraction(rawLow);
      if (lowVal === null) return match;
      const scaledLow = lowVal * factor;
      const highVal = rawHigh ? parseFraction(rawHigh) : null;
      const scaledHigh = highVal !== null ? highVal * factor : null;
      const qtyPart =
        scaledHigh !== null
          ? `${formatQuantity(scaledLow)}-${formatQuantity(scaledHigh)}`
          : formatQuantity(scaledLow);
      const unitOut = formatYieldUnit(rawUnit, scaledHigh ?? scaledLow);
      return unitOut ? `${qtyPart}${ws ?? " "}${unitOut}` : qtyPart;
    },
  );
}

/**
 * Calculate the scale factor needed to go from original yield to desired servings
 */
export function calculateScaleFactor(
  originalYield: string,
  desiredServings: number,
): number {
  const baseServings = parseYieldToServings(originalYield);
  if (baseServings <= 0) return 1;
  return desiredServings / baseServings;
}

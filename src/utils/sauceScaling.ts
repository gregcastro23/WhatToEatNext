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
export function parseYieldToServings(yieldStr: string): number {
  if (!yieldStr) return 1;

  // Match "Serves N" pattern
  const servesMatch = yieldStr.match(/serves?\s+(\d+)/i);
  if (servesMatch) return parseInt(servesMatch[1], 10);

  // Match "Makes about N cups/cup" or "Makes about N-N servings"
  const makesMatch = yieldStr.match(/makes?\s+(?:about\s+)?(\d+(?:\.\d+)?)/i);
  if (makesMatch) return parseFloat(makesMatch[1]);

  // Match fraction patterns like "1/2 cup"
  const fractionMatch = yieldStr.match(/(\d+)\/(\d+)/);
  if (fractionMatch) return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);

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
    return parseInt(mixedMatch[1], 10) + parseInt(mixedMatch[2], 10) / parseInt(mixedMatch[3], 10);
  }

  // Simple fraction: "1/4"
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
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
  const closestFraction = fractions.find(([frac]) => Math.abs(remainder - frac) < 0.05);

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
    (_match, low, high) => {
      const lowNum = parseInt(low, 10) * factor;
      const highNum = parseInt(high, 10) * factor;
      return `${formatQuantity(lowNum)}-${formatQuantity(highNum)}`;
    },
  );

  // Scale parenthetical metric quantities: "(900g)", "(60ml)", "(115g)"
  scaled = scaled.replace(
    /\((\d+(?:\.\d+)?)(g|ml|kg|l)\)/gi,
    (_match, num, unit) => {
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

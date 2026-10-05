/**
 * How many servings an HSCA recipe states in its yield, and no more than it states.
 *
 * The first dish builder took the first integer of every yield as the serving count, so "3 cups"
 * was 3 servings, "9-inch tart" 9, "Two 8-inch cakes" 8 and "1 quart" 1. A yield is a serving
 * count only when it says servings or portions ("6-8 servings", "2 cups (8 servings)", "Six
 * 1/2-cup servings") or "Serves N". A range takes its lower bound, as an ingredient range does.
 * Anything else (a volume, a pan, a count of loaves or scones) states no servings: undefined.
 */

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11,
  twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20,
};

const COUNT = String.raw`(?<![\d/.])(\d+|${Object.keys(NUMBER_WORDS).join("|")})(?![\d/])`;
const RANGE = String.raw`${COUNT}(?:\s*(?:-|–|—|to)\s*(?:\d+|${Object.keys(NUMBER_WORDS).join("|")}))?`;
/** The size of one serving, which must carry its own quantity: "1/2-cup", "half-cup", "2 tablespoon". */
const SIZE = String.raw`(?:(?:\d+(?:\s\d+/\d+|/\d+)?|half|one|a)[- ](?:cup|ounce|tablespoon|teaspoon|tbsp|tsp|oz|pint|quart)s?|bite[- ]?size|side[- ]dish|individual)`;
const SERVINGS = new RegExp(String.raw`${RANGE}\s*\(?\s*(?:${SIZE}\s*)?\)?\s*(?:servings?|portions?)\b`, "i");
const SERVES = new RegExp(String.raw`\bserves\s+${RANGE}`, "i");

function countOf(token: string): number | undefined {
  const lower = token.toLowerCase();
  const value = NUMBER_WORDS[lower] ?? Number.parseInt(token, 10);
  return Number.isFinite(value) && value >= 1 ? value : undefined;
}

export function servingsFromYield(yieldText: string | undefined | null): number | undefined {
  if (!yieldText) return undefined;
  const match = yieldText.match(SERVINGS) ?? yieldText.match(SERVES);
  const first = match?.[1];
  return first === undefined ? undefined : countOf(first);
}

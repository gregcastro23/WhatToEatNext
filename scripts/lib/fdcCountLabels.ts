/**
 * Reading USDA FoodData Central portion labels as the count units a recipe
 * writes ("2 large eggs", "3 stalks celery", "1 whole lime").
 *
 * FDC labels a portion in free text — `stalk, medium (7-1/2" - 8" long)`,
 * `Potato small (1-3/4" to 2-1/2" dia)`, `9 sprigs`. This reads one label as a
 * count unit, or refuses. It never picks a size: `stalk, medium` is recorded
 * as a stalk QUALIFIED "medium", never as a plain stalk, so a reader that wants
 * a plain stalk finds none rather than a size somebody chose.
 *
 * Used by `scripts/generate-count-portions.ts`.
 *
 * @file scripts/lib/fdcCountLabels.ts
 */

/** The sizes USDA weighs a whole item at. */
export const SIZE_UNITS: readonly string[] = ["extra small", "small", "medium", "large", "extra large", "jumbo"];

/** Parts USDA counts, keyed by every spelling, valued by the singular. */
const PARTS: ReadonlyMap<string, string> = new Map([
  ["stalk", "stalk"], ["stalks", "stalk"],
  ["sprig", "sprig"], ["sprigs", "sprig"],
  ["leaf", "leaf"], ["leaves", "leaf"],
  ["clove", "clove"], ["cloves", "clove"],
  ["slice", "slice"], ["slices", "slice"],
  ["bunch", "bunch"], ["bunches", "bunch"],
  ["can", "can"], ["cans", "can"],
  ["stick", "stick"], ["sticks", "stick"],
  ["ear", "ear"], ["ears", "ear"],
  ["dash", "dash"], ["dashes", "dash"],
  ["head", "head"], ["heads", "head"],
]);

/** Every count unit a label can be read as. */
export const COUNT_UNITS: readonly string[] = [...SIZE_UNITS, "whole", ...new Set(PARTS.values())];

/**
 * Labels that name ONE WHOLE item without saying "whole" or "fruit". Each is
 * its record's only whole-item portion, so naming it picks no size.
 *
 * Eggplant's other whole-item label is `eggplant, peeled (yield from 1-1/4 lb)`,
 * which is what is left of the same eggplant after peeling, not a second item.
 */
const WHOLE_ITEM_LABELS: ReadonlyMap<string, string> = new Map([
  ["Avocado", "avocado, NS as to Florida or California"],
  ["Mango", "fruit without refuse"],
  ["eggplant", "eggplant, unpeeled (approx 1-1/4 lb)"],
  ["jalapenos", "pepper"],
]);

export interface ParsedCount {
  count: string;
  /** The words USDA qualified the unit with ("medium" in `stalk, medium`). */
  qualifier?: string;
}

/** Lower-cased words of a label, minus parentheticals and "yields". */
function labelWords(label: string): string[] {
  const bare = label.toLowerCase().replace(/\([^)]*\)/g, " ").replace(/\byields\b/g, " ");
  const words: string[] = [];
  for (const word of bare.split(/[\s,]+/).filter(Boolean)) {
    const last = words.length - 1;
    if (words[last] === "extra" && (word === "small" || word === "large")) words[last] = `extra ${word}`;
    else words.push(word);
  }
  return words;
}

/**
 * Read one FDC label as a count unit of `ingredient`, or `null`.
 *
 * The item's own name, "whole" and "fruit" name the item rather than qualify
 * it, so `Potato small` is a small and `beet (2" dia)` is one whole beet — but
 * `Italian tomato` and `cherry` are other items, and are refused.
 */
export function parseCountLabel(label: string, ingredient: string): ParsedCount | null {
  if (WHOLE_ITEM_LABELS.get(ingredient) === label) return { count: "whole" };
  const name = ingredient.toLowerCase();
  const itemWords = new Set(["whole", "fruit", name, name.replace(/e?s$/, "")]);
  const words = labelWords(label);
  const rest = words.filter((w) => !itemWords.has(w));
  const [head, ...tail] = rest;
  if (head === undefined) return words.length > 0 ? { count: "whole" } : null;
  const part = PARTS.get(head);
  if (part !== undefined) return tail.length > 0 ? { count: part, qualifier: tail.join(" ") } : { count: part };
  return tail.length === 0 && SIZE_UNITS.includes(head) ? { count: head } : null;
}

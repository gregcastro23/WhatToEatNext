/**
 * Which guided food the words name. An exact name or alias wins; otherwise
 * every guide whose names contain all the words ("chicken" → breast, thighs
 * and whole) is offered, so the reader chooses.
 */
import type { FoodGuide } from "@/lib/cooking/foodGuides/schema";
import { normalizeText, type NormalizedText } from "@/lib/search/text";

function namesOf(guide: FoodGuide): NormalizedText[] {
  return [guide.name, ...guide.aliases].map(normalizeText);
}

function isExact(name: NormalizedText, wanted: NormalizedText): boolean {
  return name.stemmed === wanted.stemmed || name.compact === wanted.compact;
}

function containsAll(name: NormalizedText, wanted: NormalizedText): boolean {
  const words = new Set(name.stemmed.split(" "));
  return wanted.stemmed.split(" ").every((word) => words.has(word));
}

/** The last word names the thing: "steak" is a beef steak, "ribs" is not a rib-eye steak. */
function sameHead(name: NormalizedText, wanted: NormalizedText): boolean {
  return name.stemmed.split(" ").at(-1) === wanted.stemmed.split(" ").at(-1);
}

/**
 * Guides for a food phrase: the exact name or alias, else every guide whose
 * names contain the words, so the reader chooses. A lone partial match is an
 * answer only when it names the same thing ("pork loin" is no pork chop).
 */
export function matchGuides(food: string, guides: readonly FoodGuide[]): FoodGuide[] {
  const wanted = normalizeText(food);
  if (wanted.folded === "") return [];
  const exact = guides.filter((guide) => namesOf(guide).some((name) => isExact(name, wanted)));
  if (exact.length > 0) return exact;
  const containing = guides.filter((guide) => namesOf(guide).some((name) => containsAll(name, wanted)));
  if (containing.length !== 1) return containing;
  return containing.filter((guide) => namesOf(guide).some((name) => containsAll(name, wanted) && sameHead(name, wanted)));
}

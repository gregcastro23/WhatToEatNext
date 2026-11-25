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

/** Guides for a food phrase: exactly one on an exact name, else every container. */
export function matchGuides(food: string, guides: readonly FoodGuide[]): FoodGuide[] {
  const wanted = normalizeText(food);
  if (wanted.folded === "") return [];
  const exact = guides.filter((guide) => namesOf(guide).some((name) => isExact(name, wanted)));
  if (exact.length > 0) return exact;
  return guides.filter((guide) => namesOf(guide).some((name) => containsAll(name, wanted)));
}

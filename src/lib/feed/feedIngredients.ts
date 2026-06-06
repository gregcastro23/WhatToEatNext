/**
 * Shared ingredient selection for feed culinary copy (resonance + recipes).
 *
 * The raw element index is dominated by spices/salts/flours for some elements,
 * which produced odd dish names ("Charred Chili Powder", "Slow-Roasted Cassava
 * Flour"). These helpers prefer real "main" ingredients (proteins, produce,
 * grains) for the dish subject and reserve herbs/spices as accents.
 *
 * Selection only — no alchemical/elemental computation here.
 */

import type { FeedElement } from "@/lib/feed/historicalAgentFeed";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";

const MAIN_CATEGORIES = new Set([
  "protein", "proteins", "meat", "meats", "poultry", "seafood", "fish",
  "vegetable", "vegetables", "fruit", "fruits", "grain", "grains",
  "legume", "legumes", "dairy",
]);

// Herbs + spices only — the "seasoning" bucket holds salts/sweeteners we don't
// want as a dish accent ("… with Sea Salt").
const ACCENT_CATEGORIES = new Set([
  "spice", "spices", "culinary_herb", "herb", "herbs",
]);

// Never the subject of a dish name.
const EXCLUDE_AS_MAIN = new Set([
  "misc", "oil", "oils", "vinegar", "vinegars", "salt", "mineral salt", "sweetener",
]);

const POOL_SIZE = 80;

function titleCase(name: string): string {
  return name.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cat(value: { category?: string }): string {
  return (value.category ?? "").toLowerCase();
}

/**
 * A "main" ingredient for the element (protein/produce/grain preferred), chosen
 * deterministically by `seed`. `extraCategories` widens the allow-list (e.g.
 * "beverage" for Venus elixirs). Falls back to any non-excluded, then anything.
 */
export function pickMainIngredient(
  element: FeedElement,
  seed: number,
  extraCategories: string[] = [],
): string | undefined {
  const tops = findTopIngredientsForElement(element, POOL_SIZE);
  if (tops.length === 0) return undefined;

  const allow = new Set([...MAIN_CATEGORIES, ...extraCategories.map((c) => c.toLowerCase())]);
  const mains = tops.filter((i) => allow.has(cat(i)));
  const nonExcluded = tops.filter((i) => !EXCLUDE_AS_MAIN.has(cat(i)));
  const pool = mains.length > 0 ? mains : nonExcluded.length > 0 ? nonExcluded : tops;

  const pick = pool[Math.abs(seed) % pool.length];
  return pick ? titleCase(pick.name) : undefined;
}

/** A herb/spice accent for the element, or undefined when none rank for it. */
export function pickAccent(element: FeedElement, seed: number): string | undefined {
  const tops = findTopIngredientsForElement(element, POOL_SIZE);
  const accents = tops.filter((i) => ACCENT_CATEGORIES.has(cat(i)));
  if (accents.length === 0) return undefined;
  const pick = accents[Math.abs(seed) % accents.length];
  return pick ? titleCase(pick.name) : undefined;
}

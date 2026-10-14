/**
 * Allergen mapping and disallowed ingredient validation routines.
 *
 * @file src/lib/cooking/recipeGateAllergens.ts
 */

import type { ResolvedIngredientResult } from "@/lib/cooking/recipeGateHelpers";
import type { GateFinding } from "@/lib/cooking/recipeGateTypes";
import type { AllergenKey } from "@/lib/quiz/catalogContract";
import { allergensNamedBy } from "@/lib/quiz/dishSafety";

export const ALLERGEN_KEY_ALIASES: Record<string, AllergenKey> = {
  egg: "eggs",
  eggs: "eggs",
  "egg allergy": "eggs",
  fish: "fish",
  seafood: "fish",
  shellfish: "shellfish",
  crustacean: "shellfish",
  crustaceans: "shellfish",
  "shellfish allergy": "shellfish",
  dairy: "dairy",
  milk: "dairy",
  cheese: "dairy",
  "dairy-free": "dairy",
  "dairy free": "dairy",
  "dairy allergy": "dairy",
  gluten: "gluten",
  wheat: "gluten",
  "gluten-free": "gluten",
  "gluten free": "gluten",
  peanut: "peanuts",
  peanuts: "peanuts",
  "peanut allergy": "peanuts",
  nut: "tree-nuts",
  nuts: "tree-nuts",
  "tree-nut": "tree-nuts",
  "tree-nuts": "tree-nuts",
  "tree nut": "tree-nuts",
  "tree nuts": "tree-nuts",
  treenut: "tree-nuts",
  treenuts: "tree-nuts",
  "nut allergy": "tree-nuts",
  "nut-free": "tree-nuts",
  "nut free": "tree-nuts",
  avoidtreenuts: "tree-nuts",
  "avoid-tree-nuts": "tree-nuts",
  "avoid tree nuts": "tree-nuts",
  soy: "soy",
  soya: "soy",
  soybeans: "soy",
  sesame: "sesame",
};

export function normalizeDisallowedKey(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const cleaned = lower.replace(/^avoid[-_\s]?/i, "");
  return ALLERGEN_KEY_ALIASES[cleaned] ?? ALLERGEN_KEY_ALIASES[lower] ?? lower;
}

export function matchesAllergenKey(
  detectedAllergens: Set<string>,
  rawDisallowed: string,
  category?: string,
  subcategory?: string,
): boolean {
  const mappedKey = normalizeDisallowedKey(rawDisallowed);
  return (
    detectedAllergens.has(mappedKey) ||
    (mappedKey === "dairy" && category === "dairy") ||
    (mappedKey === "fish" && subcategory === "seafood") ||
    (mappedKey === "eggs" && subcategory === "egg")
  );
}

export function isIngredientExemptFromDisallowed(lowerName: string, rawDisallowed: string): boolean {
  if (rawDisallowed === "egg" || rawDisallowed === "eggs") {
    if (/\beggplants?\b/i.test(lowerName) || /\begg\s?plant\b/i.test(lowerName)) return true;
  }
  if (rawDisallowed === "ham") {
    if (/\bgraham\b/i.test(lowerName)) return true;
  }
  if (rawDisallowed === "butter") {
    if (
      /\bbutter(nut|cup|head)\b/i.test(lowerName) ||
      /\bbutter\s+(bean|lettuce)s?\b/i.test(lowerName) ||
      /\b(peanut|almond|cashew|apple|cocoa|shea|sunflower|seed)\s+butter\b/i.test(lowerName)
    ) {
      return true;
    }
  }
  return false;
}

export function matchesDisallowedIngredient(lowerName: string, rawDisallowed: string): boolean {
  if (isIngredientExemptFromDisallowed(lowerName, rawDisallowed)) {
    return false;
  }
  const escaped = rawDisallowed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}s?\\b`, "i");
  return regex.test(lowerName);
}

export function checkDisallowed(
  name: string,
  index: number,
  disallowedList: string[],
  entry: ResolvedIngredientResult["entry"],
  blockingFindings: GateFinding[],
): void {
  const lowerName = name.toLowerCase().trim();
  const detectedAllergens = new Set<string>(allergensNamedBy([name]));
  const category = (entry?.source?.category ?? entry?.unified?.category)?.toLowerCase();
  const subcategory = (
    (entry?.source && "subcategory" in entry.source && typeof entry.source.subcategory === "string"
      ? entry.source.subcategory
      : undefined) ?? entry?.unified?.subcategory
  )?.toLowerCase();

  for (const disallowed of disallowedList) {
    const rawDisallowed = disallowed.trim().toLowerCase();
    if (!rawDisallowed) continue;

    if (matchesDisallowedIngredient(lowerName, rawDisallowed)) {
      blockingFindings.push({
        code: "DISALLOWED_INGREDIENT_FOUND",
        message: `Recipe contains disallowed ingredient "${name}" matching restriction "${disallowed}".`,
        path: `ingredients.${index}.name`,
        severity: "blocking",
      });
      continue;
    }

    if (matchesAllergenKey(detectedAllergens, rawDisallowed, category, subcategory)) {
      blockingFindings.push({
        code: "DISALLOWED_ALLERGEN_FOUND",
        message: `Recipe contains ingredient "${name}" classified under disallowed allergen category "${disallowed}".`,
        path: `ingredients.${index}.name`,
        severity: "blocking",
      });
    }
  }
}

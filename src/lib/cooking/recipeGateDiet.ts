/**
 * Dietary and allergen validation routines for the Cosmic Recipe Verification Gate.
 *
 * @file src/lib/cooking/recipeGateDiet.ts
 */

import { isKnownGlutenSource, type ResolvedIngredientResult } from "@/lib/cooking/recipeGateHelpers";
import type { GateFinding } from "@/lib/cooking/recipeGateTypes";
import type { AllergenKey } from "@/lib/quiz/catalogContract";
import { allergensNamedBy } from "@/lib/quiz/dishSafety";
import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";

export const ALLERGEN_KEY_ALIASES: Record<string, AllergenKey> = {
  egg: "eggs",
  eggs: "eggs",
  fish: "fish",
  seafood: "fish",
  shellfish: "shellfish",
  crustacean: "shellfish",
  dairy: "dairy",
  milk: "dairy",
  cheese: "dairy",
  gluten: "gluten",
  wheat: "gluten",
  peanut: "peanuts",
  peanuts: "peanuts",
  nut: "tree-nuts",
  nuts: "tree-nuts",
  "tree-nut": "tree-nuts",
  "tree-nuts": "tree-nuts",
  treenut: "tree-nuts",
  treenuts: "tree-nuts",
  soy: "soy",
  sesame: "sesame",
};

function matchesAllergenKey(
  detectedAllergens: Set<string>,
  rawDisallowed: string,
  category?: string,
  subcategory?: string,
): boolean {
  const mappedKey = ALLERGEN_KEY_ALIASES[rawDisallowed] ?? rawDisallowed;
  return (
    detectedAllergens.has(mappedKey) ||
    (mappedKey === "dairy" && category === "dairy") ||
    (mappedKey === "fish" && subcategory === "seafood") ||
    (mappedKey === "eggs" && subcategory === "egg")
  );
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

    if (lowerName.includes(rawDisallowed)) {
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

export function parseDietRequests(requestedDiet: string): Set<string> {
  const set = new Set<string>();
  if (!requestedDiet) return set;

  const tokens = requestedDiet
    .toLowerCase()
    .split(/[,;&/]|\band\b/)
    .map((s) => s.trim().replace(/_/g, "-"))
    .filter(Boolean);
  for (const token of tokens) {
    set.add(token);
    if (token === "glutenfree" || token === "gf") set.add("gluten-free");
    if (token === "dairyfree" || token === "df") set.add("dairy-free");
    if (token === "veg") set.add("vegetarian");
  }
  return set;
}

function checkSingleIngredientDiet(
  ingredientName: string,
  entry: ResolvedIngredientResult["entry"],
  options: { checkVegan: boolean; checkVegetarian: boolean; checkGlutenFree: boolean },
  nonCompliantDietItems: string[],
  identifiedGlutenSources: string[],
  blockingFindings: GateFinding[],
): void {
  const category = entry?.source?.category ?? entry?.unified?.category;
  const subcategory =
    (entry?.source && "subcategory" in entry.source && typeof entry.source.subcategory === "string"
      ? entry.source.subcategory
      : undefined) ?? entry?.unified?.subcategory;
  const qualities = entry?.source?.qualities ?? entry?.unified?.qualities;

  const classification = classifyIngredientDiet({
    name: ingredientName,
    ...(category ? { category } : {}),
    ...(subcategory ? { subcategory } : {}),
    ...(qualities ? { qualities } : {}),
  });

  if (options.checkVegan && classification.isVegan === "non-compliant") {
    nonCompliantDietItems.push(`${ingredientName} (${classification.basis})`);
    blockingFindings.push({
      code: "DIET_VIOLATION_VEGAN",
      message: `Recipe labeled or requested as vegan contains non-vegan ingredient "${ingredientName}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  } else if (options.checkVegetarian && classification.isVegetarian === "non-compliant") {
    nonCompliantDietItems.push(`${ingredientName} (${classification.basis})`);
    blockingFindings.push({
      code: "DIET_VIOLATION_VEGETARIAN",
      message: `Recipe labeled or requested as vegetarian contains meat/flesh ingredient "${ingredientName}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  }

  if (options.checkGlutenFree && isKnownGlutenSource(ingredientName)) {
    identifiedGlutenSources.push(ingredientName);
    blockingFindings.push({
      code: "ALLERGEN_VIOLATION_GLUTEN",
      message: `Recipe labeled or requested as gluten-free contains gluten source "${ingredientName}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

export function validateDietaryCompliance(
  resolvedCatalogEntries: ResolvedIngredientResult[],
  currentDietTags: string[],
  requestedDiet: string,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): { nonCompliantDietItems: string[]; identifiedGlutenSources: string[]; uncertifiedDietClaims: boolean } {
  const nonCompliantDietItems: string[] = [];
  const identifiedGlutenSources: string[] = [];
  let uncertifiedDietClaims = false;

  const requestedSet = parseDietRequests(requestedDiet);
  const checkVegan = currentDietTags.includes("vegan") || requestedSet.has("vegan");
  const checkVegetarian =
    checkVegan || currentDietTags.includes("vegetarian") || requestedSet.has("vegetarian");
  const checkGlutenFree =
    currentDietTags.includes("gluten-free") || requestedSet.has("gluten-free");

  const dietOptions = { checkVegan, checkVegetarian, checkGlutenFree };
  for (const { ingredient, entry } of resolvedCatalogEntries) {
    checkSingleIngredientDiet(
      ingredient.name,
      entry,
      dietOptions,
      nonCompliantDietItems,
      identifiedGlutenSources,
      blockingFindings,
    );
  }

  if (checkGlutenFree) {
    uncertifiedDietClaims = true;
    advisoryFindings.push({
      code: "UNCERTIFIED_GLUTEN_FREE",
      message:
        "Gluten-free claims require certified manufacturer allergen attestations; gluten-free status cannot be verified.",
      path: "tags.diet",
      severity: "advisory",
    });
  }

  return { nonCompliantDietItems, identifiedGlutenSources, uncertifiedDietClaims };
}

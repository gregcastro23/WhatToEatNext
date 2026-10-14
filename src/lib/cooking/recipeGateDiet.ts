/**
 * Dietary validation routines for the Cosmic Recipe Verification Gate.
 *
 * @file src/lib/cooking/recipeGateDiet.ts
 */

import { isKnownGlutenSource, type ResolvedIngredientResult } from "@/lib/cooking/recipeGateHelpers";
import type { GateFinding } from "@/lib/cooking/recipeGateTypes";
import { allergensNamedBy } from "@/lib/quiz/dishSafety";
import { classifyIngredientDiet, type DietaryClassification } from "@/utils/ingredientDietaryClassification";

export * from "./recipeGateAllergens";

export const EVALUATED_DIET_KEYS = new Set([
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "pescatarian",
]);

export function normalizeDietToken(token: string): string {
  const t = token.toLowerCase().trim().replace(/_/g, "-");
  if (t === "glutenfree" || t === "gf" || t === "gluten free" || t === "gluten-free") return "gluten-free";
  if (t === "dairyfree" || t === "df" || t === "dairy free" || t === "dairy-free" || t === "non-dairy") return "dairy-free";
  if (t === "nutfree" || t === "nut free" || t === "nut-free") return "nut-free";
  if (t === "veg" || t === "vegetarian") return "vegetarian";
  if (t === "plant-based" || t === "plant based" || t === "vegan") return "vegan";
  if (t === "pescetarian" || t === "pescatarian") return "pescatarian";
  return t;
}

export function parseDietRequests(requestedDiet: string): Set<string> {
  const set = new Set<string>();
  if (!requestedDiet) return set;

  const tokens = requestedDiet
    .toLowerCase()
    .split(/[,;&/]|\band\b/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const token of tokens) {
    set.add(normalizeDietToken(token));
  }
  return set;
}

function checkDairyCompliance(
  name: string,
  category: string | undefined,
  subcategory: string | undefined,
  classification: DietaryClassification,
  nonCompliant: string[],
  blocking: GateFinding[],
): void {
  const isDairy =
    category === "dairy" ||
    subcategory === "cheese" ||
    subcategory === "milk" ||
    subcategory === "yogurt" ||
    allergensNamedBy([name]).includes("dairy") ||
    (classification.isVegan === "non-compliant" &&
      /dairy|cheese|milk|butter|cream|whey|casein|gruy[eè]re|pecorino|parmesan|yogurt/i.test(classification.basis));
  if (isDairy) {
    nonCompliant.push(`${name} (dairy)`);
    blocking.push({
      code: "DIET_VIOLATION_DAIRY_FREE",
      message: `Recipe labeled or requested as dairy-free contains dairy ingredient "${name}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

function checkPescatarianCompliance(
  name: string,
  subcategory: string | undefined,
  classification: DietaryClassification,
  nonCompliant: string[],
  blocking: GateFinding[],
): void {
  if (classification.isVegetarian !== "non-compliant") return;
  const isSeafood =
    allergensNamedBy([name]).includes("fish") ||
    allergensNamedBy([name]).includes("shellfish") ||
    subcategory === "seafood" ||
    /fish|seafood|salmon|tuna|cod|shrimp|crab|lobster|clams|scallops/i.test(classification.basis);
  if (!isSeafood) {
    nonCompliant.push(`${name} (${classification.basis})`);
    blocking.push({
      code: "DIET_VIOLATION_PESCATARIAN",
      message: `Recipe labeled or requested as pescatarian contains non-seafood meat/poultry ingredient "${name}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

interface ActiveDietChecks {
  checkVegan: boolean;
  checkVegetarian: boolean;
  checkGlutenFree: boolean;
  checkDairyFree: boolean;
  checkNutFree: boolean;
  checkPescatarian: boolean;
}

function checkSingleIngredientDiet(
  name: string,
  entry: ResolvedIngredientResult["entry"],
  checks: ActiveDietChecks,
  nonCompliant: string[],
  glutenSources: string[],
  blocking: GateFinding[],
): void {
  const category = (entry?.source?.category ?? entry?.unified?.category)?.toLowerCase();
  const subcategory = (
    (entry?.source && "subcategory" in entry.source && typeof entry.source.subcategory === "string"
      ? entry.source.subcategory
      : undefined) ?? entry?.unified?.subcategory
  )?.toLowerCase();
  const qualities = entry?.source?.qualities ?? entry?.unified?.qualities;

  const classification = classifyIngredientDiet({
    name,
    ...(category ? { category } : {}),
    ...(subcategory ? { subcategory } : {}),
    ...(qualities ? { qualities } : {}),
  });

  if (checks.checkVegan && classification.isVegan === "non-compliant") {
    nonCompliant.push(`${name} (${classification.basis})`);
    blocking.push({
      code: "DIET_VIOLATION_VEGAN",
      message: `Recipe labeled or requested as vegan contains non-vegan ingredient "${name}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  } else if (checks.checkVegetarian && classification.isVegetarian === "non-compliant") {
    nonCompliant.push(`${name} (${classification.basis})`);
    blocking.push({
      code: "DIET_VIOLATION_VEGETARIAN",
      message: `Recipe labeled or requested as vegetarian contains meat/flesh ingredient "${name}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  }

  if (checks.checkGlutenFree && isKnownGlutenSource(name)) {
    glutenSources.push(name);
    blocking.push({
      code: "ALLERGEN_VIOLATION_GLUTEN",
      message: `Recipe labeled or requested as gluten-free contains gluten source "${name}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }

  if (checks.checkDairyFree) {
    checkDairyCompliance(name, category, subcategory, classification, nonCompliant, blocking);
  }

  if (checks.checkNutFree && (allergensNamedBy([name]).includes("tree-nuts") || allergensNamedBy([name]).includes("peanuts"))) {
    nonCompliant.push(`${name} (nuts)`);
    blocking.push({
      code: "ALLERGEN_VIOLATION_NUTS",
      message: `Recipe labeled or requested as nut-free contains nut ingredient "${name}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }

  if (checks.checkPescatarian) {
    checkPescatarianCompliance(name, subcategory, classification, nonCompliant, blocking);
  }
}

export interface DietaryComplianceOutcome {
  nonCompliantDietItems: string[];
  identifiedGlutenSources: string[];
  uncertifiedDietClaims: boolean;
  requestedRestrictions: string[];
  evaluatedRestrictions: string[];
  unevaluatedRestrictions: string[];
}

function classifyDietaryCoverage(
  requestedDiet: string,
  currentDietTags: string[],
  advisoryFindings: GateFinding[],
): { requestedRestrictions: string[]; evaluatedRestrictions: string[]; unevaluatedRestrictions: string[] } {
  const requestedRestrictions: string[] = [];
  const evaluatedRestrictions: string[] = [];
  const unevaluatedRestrictions: string[] = [];

  const rawTokens = requestedDiet
    ? requestedDiet.toLowerCase().split(/[,;&/]|\band\b/).map((s) => s.trim()).filter(Boolean)
    : [];

  for (const rawToken of rawTokens) {
    const normalized = normalizeDietToken(rawToken);
    if (!requestedRestrictions.includes(normalized)) requestedRestrictions.push(normalized);
    if (EVALUATED_DIET_KEYS.has(normalized)) {
      if (!evaluatedRestrictions.includes(normalized)) evaluatedRestrictions.push(normalized);
    } else {
      if (!unevaluatedRestrictions.includes(normalized)) unevaluatedRestrictions.push(normalized);
    }
  }

  for (const tag of currentDietTags) {
    const normalized = normalizeDietToken(tag);
    if (EVALUATED_DIET_KEYS.has(normalized) && !evaluatedRestrictions.includes(normalized)) {
      evaluatedRestrictions.push(normalized);
    }
  }

  for (const unevaluated of unevaluatedRestrictions) {
    advisoryFindings.push({
      code: "UNEVALUATED_DIETARY_RESTRICTION",
      message: `Dietary restriction "${unevaluated}" cannot be deterministically evaluated by the culinary gate.`,
      path: "tags.diet",
      severity: "advisory",
    });
  }

  return { requestedRestrictions, evaluatedRestrictions, unevaluatedRestrictions };
}

export function validateDietaryCompliance(
  resolvedCatalogEntries: ResolvedIngredientResult[],
  currentDietTags: string[],
  requestedDiet: string,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): DietaryComplianceOutcome {
  const nonCompliantDietItems: string[] = [];
  const identifiedGlutenSources: string[] = [];
  const coverage = classifyDietaryCoverage(requestedDiet, currentDietTags, advisoryFindings);

  const requestedSet = parseDietRequests(requestedDiet);
  const checkVegan = currentDietTags.includes("vegan") || requestedSet.has("vegan");
  const checkVegetarian =
    checkVegan || currentDietTags.includes("vegetarian") || requestedSet.has("vegetarian");
  const checkGlutenFree =
    currentDietTags.includes("gluten-free") || requestedSet.has("gluten-free");
  const checkDairyFree =
    currentDietTags.includes("dairy-free") || requestedSet.has("dairy-free");
  const checkNutFree =
    currentDietTags.includes("nut-free") || requestedSet.has("nut-free");
  const checkPescatarian =
    currentDietTags.includes("pescatarian") || requestedSet.has("pescatarian");

  const checks: ActiveDietChecks = {
    checkVegan,
    checkVegetarian,
    checkGlutenFree,
    checkDairyFree,
    checkNutFree,
    checkPescatarian,
  };

  for (const { ingredient, entry } of resolvedCatalogEntries) {
    checkSingleIngredientDiet(
      ingredient.name,
      entry,
      checks,
      nonCompliantDietItems,
      identifiedGlutenSources,
      blockingFindings,
    );
  }

  let uncertifiedDietClaims = false;
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

  return {
    nonCompliantDietItems,
    identifiedGlutenSources,
    uncertifiedDietClaims,
    ...coverage,
  };
}

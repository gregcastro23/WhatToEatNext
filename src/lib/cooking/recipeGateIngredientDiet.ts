/** Per-ingredient checks for the dietary restrictions the gate evaluates. */

import { allergensNamedBy } from "@/lib/quiz/dishSafety";
import {
  classifyIngredientDiet,
  type DietaryClassification,
} from "@/utils/ingredientDietaryClassification";
import {
  isKnownGlutenSource,
  type ActiveDietChecks,
} from "./recipeGateDietCoverage";
import type { ResolvedIngredientResult } from "./recipeGateHelpers";
import type { GateFinding } from "./recipeGateTypes";

function checkDairyCompliance(
  name: string,
  category: string | undefined,
  subcategory: string | undefined,
  classification: DietaryClassification,
  nonCompliant: string[],
  blocking: GateFinding[],
): void {
  const plantCompound = classification.isVegan === "compliant";
  const isDairy =
    (!plantCompound &&
      (category === "dairy" ||
        subcategory === "cheese" ||
        subcategory === "milk" ||
        subcategory === "yogurt")) ||
    allergensNamedBy([name]).includes("dairy") ||
    (classification.isVegan === "non-compliant" &&
      /dairy|cheese|milk|butter|cream|whey|casein|gruy[eè]re|pecorino|parmesan|yogurt/i.test(
        classification.basis,
      ));
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
    /fish|seafood|salmon|tuna|cod|shrimp|crab|lobster|clams|scallops/i.test(
      classification.basis,
    );
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

function sourceSubcategory(
  entry: ResolvedIngredientResult["entry"],
): string | undefined {
  const source = entry?.source;
  return source &&
    "subcategory" in source &&
    typeof source.subcategory === "string"
    ? source.subcategory
    : undefined;
}

function ingredientDietContext(
  name: string,
  entry: ResolvedIngredientResult["entry"],
): {
  category: string | undefined;
  subcategory: string | undefined;
  classification: DietaryClassification;
} {
  const category = (
    entry?.source?.category ?? entry?.unified?.category
  )?.toLowerCase();
  const subcategory = (
    sourceSubcategory(entry) ?? entry?.unified?.subcategory
  )?.toLowerCase();
  const qualities = entry?.source?.qualities ?? entry?.unified?.qualities;

  const classification = classifyIngredientDiet({
    name,
    ...(category ? { category } : {}),
    ...(subcategory ? { subcategory } : {}),
    ...(qualities ? { qualities } : {}),
  });

  return { category, subcategory, classification };
}

function checkPlantDietCompliance(
  name: string,
  classification: DietaryClassification,
  checks: ActiveDietChecks,
  nonCompliant: string[],
  blocking: GateFinding[],
): void {
  if (checks.checkVegan && classification.isVegan === "non-compliant") {
    nonCompliant.push(`${name} (${classification.basis})`);
    blocking.push({
      code: "DIET_VIOLATION_VEGAN",
      message: `Recipe labeled or requested as vegan contains non-vegan ingredient "${name}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  } else if (
    checks.checkVegetarian &&
    classification.isVegetarian === "non-compliant"
  ) {
    nonCompliant.push(`${name} (${classification.basis})`);
    blocking.push({
      code: "DIET_VIOLATION_VEGETARIAN",
      message: `Recipe labeled or requested as vegetarian contains meat/flesh ingredient "${name}" (${classification.basis}).`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

function checkGlutenCompliance(
  name: string,
  glutenSources: string[],
  blocking: GateFinding[],
): void {
  if (isKnownGlutenSource(name)) {
    glutenSources.push(name);
    blocking.push({
      code: "ALLERGEN_VIOLATION_GLUTEN",
      message: `Recipe labeled or requested as gluten-free contains gluten source "${name}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

function checkNutCompliance(
  name: string,
  nonCompliant: string[],
  blocking: GateFinding[],
): void {
  if (
    allergensNamedBy([name]).includes("tree-nuts") ||
    allergensNamedBy([name]).includes("peanuts")
  ) {
    nonCompliant.push(`${name} (nuts)`);
    blocking.push({
      code: "ALLERGEN_VIOLATION_NUTS",
      message: `Recipe labeled or requested as nut-free contains nut ingredient "${name}".`,
      path: "tags.diet",
      severity: "blocking",
    });
  }
}

export function checkSingleIngredientDiet(
  name: string,
  entry: ResolvedIngredientResult["entry"],
  checks: ActiveDietChecks,
  nonCompliant: string[],
  glutenSources: string[],
  blocking: GateFinding[],
): void {
  const { category, subcategory, classification } = ingredientDietContext(
    name,
    entry,
  );
  checkPlantDietCompliance(
    name,
    classification,
    checks,
    nonCompliant,
    blocking,
  );
  if (checks.checkGlutenFree)
    checkGlutenCompliance(name, glutenSources, blocking);
  if (checks.checkDairyFree) {
    checkDairyCompliance(
      name,
      category,
      subcategory,
      classification,
      nonCompliant,
      blocking,
    );
  }

  if (checks.checkNutFree) checkNutCompliance(name, nonCompliant, blocking);

  if (checks.checkPescatarian) {
    checkPescatarianCompliance(
      name,
      subcategory,
      classification,
      nonCompliant,
      blocking,
    );
  }
}

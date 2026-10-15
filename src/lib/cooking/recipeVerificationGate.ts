/**
 * Deterministic Recipe Verification Gate
 *
 * Implements WTEN's culinary authority gate for AI-generated recipes:
 * 1. Resolves every ingredient against the ~1,100+ ingredient catalog.
 * 2. Parses quantities to mass/volume via countToMass and volumetrics.
 * 3. Evaluates dietary compliance via authoritative `classifyIngredientDiet`.
 * 4. Checks step methods, times, and temperatures against method physics and food safety.
 * 5. Partitions findings into BLOCKING (fails recipe, triggers retry) and ADVISORY (delivered as annotations).
 * 6. Findings are reported without corrupting delivered recipes with fabricated nutrition or false allergen tags.
 *
 * @file src/lib/cooking/recipeVerificationGate.ts
 */

import type { CosmicRecipe } from "@/data/featuredRecipe";
import { validateDietaryCompliance } from "./recipeGateDiet";
import {
  validateIngredients,
  type IngredientValidationState,
} from "./recipeGateIngredients";
import { validateSingleStep } from "./recipeGateSteps";
import type {
  GateFinding,
  GateAudit,
  RecipeContent,
  RecipeContentVerificationOutcome,
  RecipeVerificationOutcome,
  VerifyCosmicRecipeOptions,
} from "./recipeGateTypes";

export * from "./recipeGateTypes";
export * from "./recipeGateDiet";
export * from "./recipeGateHelpers";
export * from "./recipeGateSteps";
export type { CosmicRecipe } from "@/data/featuredRecipe";

function validateNutritionalContent(
  calories: number,
  advisoryFindings: GateFinding[],
): void {
  if (calories <= 0) {
    advisoryFindings.push({
      code: "MISSING_NUTRITION",
      message: "Recipe lacks valid positive calorie information.",
      path: "nutrition.calories",
      severity: "advisory",
    });
  }
}

function buildAudit(
  state: IngredientValidationState,
  dietOutcome: {
    nonCompliantDietItems: string[];
    identifiedGlutenSources: string[];
    requestedRestrictions: string[];
    evaluatedRestrictions: string[];
    unevaluatedRestrictions: string[];
  },
): GateAudit {
  return {
    resolvedIngredientsCount: state.resolvedCatalogEntries.filter(
      (r) => r.entry !== null,
    ).length,
    unresolvedIngredients: state.unresolvedIngredients,
    totalEstimatedGrams: Math.round(state.totalEstimatedGrams),
    nonCompliantDietItems: dietOutcome.nonCompliantDietItems,
    identifiedGlutenSources: dietOutcome.identifiedGlutenSources,
    requestedRestrictions: dietOutcome.requestedRestrictions,
    evaluatedRestrictions: dietOutcome.evaluatedRestrictions,
    unevaluatedRestrictions: dietOutcome.unevaluatedRestrictions,
  };
}

function validateContentSteps(
  content: RecipeContent,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): void {
  content.steps.forEach((step, idx) => {
    validateSingleStep(
      step,
      idx,
      content.ingredients,
      blockingFindings,
      advisoryFindings,
    );
  });
}

function evaluateContent(
  content: RecipeContent,
  options?: VerifyCosmicRecipeOptions,
): Omit<RecipeVerificationOutcome, "recipe"> {
  const blockingFindings: GateFinding[] = [];
  const advisoryFindings: GateFinding[] = [];

  const state = validateIngredients(
    content.ingredients,
    options,
    blockingFindings,
    advisoryFindings,
  );

  const currentDietTags = (content.dietTags ?? []).map((d) => d.toLowerCase());
  const requestedDiet = options?.requestedDiet?.toLowerCase() ?? "";
  const dietOutcome = validateDietaryCompliance(
    state.resolvedCatalogEntries,
    currentDietTags,
    requestedDiet,
    blockingFindings,
    advisoryFindings,
  );

  validateContentSteps(content, blockingFindings, advisoryFindings);

  if (content.calories !== undefined) {
    validateNutritionalContent(content.calories, advisoryFindings);
  }

  const verified =
    blockingFindings.length === 0 &&
    !dietOutcome.uncertifiedDietClaims &&
    state.unresolvedIngredients.length === 0 &&
    dietOutcome.unevaluatedRestrictions.length === 0 &&
    !advisoryFindings.some(
      (finding) => finding.code === "UNEVALUATED_THERMAL_PROCESS",
    );

  return {
    valid: blockingFindings.length === 0,
    verified,
    repaired: state.repaired,
    blockingFindings,
    advisoryFindings,
    audit: buildAudit(state, dietOutcome),
  };
}

function contentNotChecked(content: RecipeContent): string[] {
  const notChecked: string[] = [];
  if (content.calories === undefined) notChecked.push("nutrition");
  content.steps.forEach((step, index) => {
    if (step.cooking_method === undefined)
      notChecked.push(`steps.${index}.cooking_method`);
    if (step.time_minutes === undefined)
      notChecked.push(`steps.${index}.time_minutes`);
  });
  return notChecked;
}

/** Verify only authored content; missing measurements remain explicit, never zero-filled. */
export function verifyRecipeContent(
  input: RecipeContent,
  options?: VerifyCosmicRecipeOptions,
): RecipeContentVerificationOutcome {
  const content = structuredClone(input);
  const result = evaluateContent(content, options);
  const notChecked = contentNotChecked(content);
  for (const [field, count] of [
    ["ingredients", content.ingredients.length],
    ["steps", content.steps.length],
  ]) {
    if (count !== 0) continue;
    result.blockingFindings.push({
      code: "MISSING_RECIPE_CONTENT",
      message: `Recipe has no ${field} to evaluate.`,
      path: String(field),
      severity: "blocking",
    });
  }
  return {
    ...result,
    valid: result.blockingFindings.length === 0,
    verified:
      result.verified &&
      result.blockingFindings.length === 0 &&
      notChecked.length === 0,
    content,
    notChecked,
  };
}

export function verifyAndRepairCosmicRecipe(
  inputRecipe: CosmicRecipe,
  options?: VerifyCosmicRecipeOptions,
): RecipeVerificationOutcome {
  const recipe = structuredClone(inputRecipe);
  const result = evaluateContent(
    {
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      dietTags: recipe.tags.diet,
      calories: recipe.nutrition.calories,
    },
    options,
  );
  return { ...result, recipe };
}

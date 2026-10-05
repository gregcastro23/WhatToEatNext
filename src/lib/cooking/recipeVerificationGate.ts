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
import { checkDisallowed, validateDietaryCompliance } from "./recipeGateDiet";
import {
  normalizeUnit,
  parseFractionalQuantity,
  resolveSingleIngredient,
  type ResolvedIngredientResult,
} from "./recipeGateHelpers";
import { validateSingleStep } from "./recipeGateSteps";
import type {
  GateFinding,
  GateAudit,
  RecipeVerificationOutcome,
  VerifyCosmicRecipeOptions,
} from "./recipeGateTypes";

export * from "./recipeGateTypes";
export * from "./recipeGateDiet";
export * from "./recipeGateHelpers";
export * from "./recipeGateSteps";
export type { CosmicRecipe } from "@/data/featuredRecipe";

interface IngredientValidationState {
  repaired: boolean;
  totalEstimatedGrams: number;
  unresolvedIngredients: string[];
  resolvedCatalogEntries: ResolvedIngredientResult[];
}

function recordIngredientResolution(
  ing: CosmicRecipe["ingredients"][number],
  index: number,
  entry: ResolvedIngredientResult["entry"],
  state: IngredientValidationState,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): void {
  if (entry) return;

  state.unresolvedIngredients.push(ing.name);
  if (!ing.optional && index === 0) {
    blockingFindings.push({
      code: "UNRESOLVED_PRIMARY_INGREDIENT",
      message: `Primary ingredient "${ing.name}" could not be verified in the kitchen catalog.`,
      path: `ingredients.${index}.name`,
      severity: "blocking",
    });
  } else {
    advisoryFindings.push({
      code: "UNRESOLVED_CATALOG_INGREDIENT",
      message: `Ingredient "${ing.name}" is not mapped in the local verified database.`,
      path: `ingredients.${index}.name`,
      severity: "advisory",
    });
  }
}

function validateSingleIngredient(
  ing: CosmicRecipe["ingredients"][number],
  index: number,
  options: VerifyCosmicRecipeOptions | undefined,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
  state: IngredientValidationState,
): void {
  const stdUnit = normalizeUnit(ing.unit);
  if (stdUnit !== ing.unit) {
    ing.unit = stdUnit;
    state.repaired = true;
  }

  const qty = parseFractionalQuantity(ing.quantity);
  if (qty <= 0) {
    blockingFindings.push({
      code: "IMPOSSIBLE_QUANTITY",
      message: `Ingredient "${ing.name}" has invalid or non-positive quantity: "${ing.quantity}".`,
      path: `ingredients.${index}.quantity`,
      severity: "blocking",
    });
  }

  const { entry, gramWeight } = resolveSingleIngredient(ing);
  state.resolvedCatalogEntries.push({ ingredient: ing, entry, gramWeight });
  state.totalEstimatedGrams += gramWeight;

  recordIngredientResolution(ing, index, entry, state, blockingFindings, advisoryFindings);

  if (gramWeight > 15000) {
    blockingFindings.push({
      code: "EXCESSIVE_QUANTITY",
      message: `Quantity for "${ing.name}" (~${Math.round(gramWeight)}g) exceeds household batch limit (15 kg).`,
      path: `ingredients.${index}.quantity`,
      severity: "blocking",
    });
  }

  if (options?.disallowedIngredients && options.disallowedIngredients.length > 0) {
    checkDisallowed(ing.name, index, options.disallowedIngredients, entry, blockingFindings);
  }
}

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
  nonCompliantDietItems: string[],
  identifiedGlutenSources: string[],
): GateAudit {
  return {
    resolvedIngredientsCount: state.resolvedCatalogEntries.filter((r) => r.entry !== null).length,
    unresolvedIngredients: state.unresolvedIngredients,
    totalEstimatedGrams: Math.round(state.totalEstimatedGrams),
    nonCompliantDietItems,
    identifiedGlutenSources,
  };
}

export function verifyAndRepairCosmicRecipe(
  inputRecipe: CosmicRecipe,
  options?: VerifyCosmicRecipeOptions,
): RecipeVerificationOutcome {
  const blockingFindings: GateFinding[] = [];
  const advisoryFindings: GateFinding[] = [];
  const recipe: CosmicRecipe = structuredClone(inputRecipe);

  const state: IngredientValidationState = {
    repaired: false,
    totalEstimatedGrams: 0,
    unresolvedIngredients: [],
    resolvedCatalogEntries: [],
  };

  recipe.ingredients.forEach((ing, index) => {
    validateSingleIngredient(ing, index, options, blockingFindings, advisoryFindings, state);
  });

  const currentDietTags = recipe.tags.diet.map((d) => d.toLowerCase());
  const requestedDiet = options?.requestedDiet?.toLowerCase() ?? "";
  const { nonCompliantDietItems, identifiedGlutenSources, uncertifiedDietClaims } =
    validateDietaryCompliance(
      state.resolvedCatalogEntries,
      currentDietTags,
      requestedDiet,
      blockingFindings,
      advisoryFindings,
    );

  recipe.steps.forEach((step, idx) => {
    validateSingleStep(step, idx, recipe.ingredients, blockingFindings, advisoryFindings);
  });

  validateNutritionalContent(recipe.nutrition.calories, advisoryFindings);

  const verified =
    blockingFindings.length === 0 &&
    !uncertifiedDietClaims &&
    state.unresolvedIngredients.length === 0;

  return {
    valid: blockingFindings.length === 0,
    verified,
    repaired: state.repaired,
    blockingFindings,
    advisoryFindings,
    recipe,
    audit: buildAudit(state, nonCompliantDietItems, identifiedGlutenSources),
  };
}

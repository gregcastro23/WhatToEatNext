/** Catalog, quantity, and exclusion checks shared by authored and cosmic recipes. */

import { checkDisallowed } from "./recipeGateAllergens";
import {
  normalizeUnit,
  parseFractionalQuantity,
  resolveSingleIngredient,
  type ResolvedIngredientResult,
} from "./recipeGateHelpers";
import type {
  GateFinding,
  RecipeContentIngredient,
  VerifyCosmicRecipeOptions,
} from "./recipeGateTypes";

function normalizeAndCheckQuantity(
  ing: RecipeContentIngredient,
  index: number,
  blockingFindings: GateFinding[],
): boolean {
  const originalUnit = ing.unit;
  const stdUnit = normalizeUnit(ing.unit);
  if (stdUnit !== ing.unit) {
    ing.unit = stdUnit;
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

  return stdUnit !== originalUnit;
}

export interface IngredientValidationState {
  repaired: boolean;
  totalEstimatedGrams: number;
  unresolvedIngredients: string[];
  resolvedCatalogEntries: ResolvedIngredientResult[];
}

function recordIngredientResolution(
  ing: RecipeContentIngredient,
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
  ing: RecipeContentIngredient,
  index: number,
  options: VerifyCosmicRecipeOptions | undefined,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
  state: IngredientValidationState,
): void {
  state.repaired =
    normalizeAndCheckQuantity(ing, index, blockingFindings) || state.repaired;

  const { entry, gramWeight } = resolveSingleIngredient(ing);
  state.resolvedCatalogEntries.push({ ingredient: ing, entry, gramWeight });
  state.totalEstimatedGrams += gramWeight;

  recordIngredientResolution(
    ing,
    index,
    entry,
    state,
    blockingFindings,
    advisoryFindings,
  );

  if (gramWeight > 15000) {
    blockingFindings.push({
      code: "EXCESSIVE_QUANTITY",
      message: `Quantity for "${ing.name}" (~${Math.round(gramWeight)}g) exceeds household batch limit (15 kg).`,
      path: `ingredients.${index}.quantity`,
      severity: "blocking",
    });
  }

  if (
    options?.disallowedIngredients &&
    options.disallowedIngredients.length > 0
  ) {
    checkDisallowed(
      ing.name,
      index,
      options.disallowedIngredients,
      entry,
      blockingFindings,
    );
  }
}

export function validateIngredients(
  ingredients: RecipeContentIngredient[],
  options: VerifyCosmicRecipeOptions | undefined,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): IngredientValidationState {
  const state: IngredientValidationState = {
    repaired: false,
    totalEstimatedGrams: 0,
    unresolvedIngredients: [],
    resolvedCatalogEntries: [],
  };
  ingredients.forEach((ingredient, index) => {
    validateSingleIngredient(
      ingredient,
      index,
      options,
      blockingFindings,
      advisoryFindings,
      state,
    );
  });
  return state;
}

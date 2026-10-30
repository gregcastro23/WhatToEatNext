/**
 * Type declarations and data models for the Cosmic Recipe Verification Gate.
 *
 * @file src/lib/cooking/recipeGateTypes.ts
 */

import type { CosmicRecipe } from "@/data/featuredRecipe";

export interface GateFinding {
  code: string;
  message: string;
  path?: string;
  severity: "blocking" | "advisory";
}

export interface GateAudit {
  resolvedIngredientsCount: number;
  unresolvedIngredients: string[];
  totalEstimatedGrams: number;
  nonCompliantDietItems: string[];
  identifiedGlutenSources: string[];
  requestedRestrictions: string[];
  evaluatedRestrictions: string[];
  unevaluatedRestrictions: string[];
}

export interface RecipeVerificationOutcome {
  valid: boolean;
  verified: boolean;
  repaired: boolean;
  blockingFindings: GateFinding[];
  advisoryFindings: GateFinding[];
  recipe: CosmicRecipe;
  audit: GateAudit;
}

/** Content available from saved recipes, without manufactured cosmic metadata. */
export interface RecipeContentIngredient {
  name: string;
  quantity: string;
  unit: string;
  optional?: boolean;
}

export interface RecipeContentStep {
  instruction: string;
  step_number?: number;
  cooking_method?: string;
  time_minutes?: number;
}

export interface RecipeContent {
  ingredients: RecipeContentIngredient[];
  steps: RecipeContentStep[];
  dietTags?: string[];
  calories?: number;
}

export interface RecipeContentVerificationOutcome extends Omit<
  RecipeVerificationOutcome,
  "recipe"
> {
  content: RecipeContent;
  notChecked: string[];
}

export interface VerifyCosmicRecipeOptions {
  requestedDiet?: string | undefined;
  disallowedIngredients?: string[] | undefined;
}

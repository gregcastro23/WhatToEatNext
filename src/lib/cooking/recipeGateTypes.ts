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

export interface VerifyCosmicRecipeOptions {
  requestedDiet?: string | undefined;
  disallowedIngredients?: string[] | undefined;
}

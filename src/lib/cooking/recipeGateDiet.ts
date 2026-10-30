/** Dietary screening orchestration; coverage and ingredient checks stay independent. */

import {
  activeDietChecks,
  classifyDietaryCoverage,
  recordUncertifiedDietClaims,
} from "./recipeGateDietCoverage";
import { checkSingleIngredientDiet } from "./recipeGateIngredientDiet";
import type { ResolvedIngredientResult } from "./recipeGateHelpers";
import type { GateFinding } from "./recipeGateTypes";

export * from "./recipeGateAllergens";
export {
  EVALUATED_DIET_KEYS,
  normalizeDietToken,
  parseDietRequests,
} from "./recipeGateDietCoverage";

export interface DietaryComplianceOutcome {
  nonCompliantDietItems: string[];
  identifiedGlutenSources: string[];
  uncertifiedDietClaims: boolean;
  requestedRestrictions: string[];
  evaluatedRestrictions: string[];
  unevaluatedRestrictions: string[];
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
  const coverage = classifyDietaryCoverage(
    requestedDiet,
    currentDietTags,
    advisoryFindings,
  );
  const checks = activeDietChecks(requestedDiet, currentDietTags);
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
  const uncertifiedDietClaims = recordUncertifiedDietClaims(
    checks,
    advisoryFindings,
  );
  return {
    nonCompliantDietItems,
    identifiedGlutenSources,
    uncertifiedDietClaims,
    ...coverage,
  };
}

import { createHash } from "node:crypto";
import { AdaptationRecipeSchema, AdaptationRequestSchema, SavedAdaptationSchema, type SavedAdaptation } from "@/lib/recipes/savedAdaptationSchemas";
import type { Recipe } from "@/types/recipe";

export const ACTOR_ID = "11111111-1111-4111-8111-111111111111";
export const SOURCE_ID = "22222222-2222-4222-8222-222222222222";
export const VERSION_ID = "33333333-3333-4333-8333-333333333333";
export const REQUEST = AdaptationRequestSchema.parse({ agentSlug: "leonardo-da-vinci", mode: "vegetarian", clientRequestId: "44444444-4444-4444-8444-444444444444" });
export const PLACEMENTS = [
  { planet: "Sun", sign: "aries", position: 10 },
  { planet: "Moon", sign: "taurus", position: 40 },
  { planet: "Mercury", sign: "gemini", position: 70 },
  { planet: "Venus", sign: "cancer", position: 100 },
  { planet: "Mars", sign: "leo", position: 130 },
];
export const PREFERENCES = { dietaryPhilosophy: "Prefer plant foods.", avoidedFoods: [] };
export const PROPOSAL = {
  selectedSwapIndices: [0], instructions: ["Sauté firm tofu in olive oil until its internal temperature reaches 165°F."],
  usedPlacementIndices: [0], usedPreferenceKeys: ["dietaryPhilosophy"],
  explanation: "This uses the saved Sun placement and the saved preference for plant foods.",
};
export function sourceRecipe(): Recipe {
  return {
    id: SOURCE_ID, name: "Chicken skillet", cuisine: "Mediterranean", numberOfServings: 2,
    ingredients: [{ name: "chicken", amount: 250, unit: "g", asin: "old-chicken-asin" }, { name: "olive oil", amount: 1, unit: "tbsp" }],
    instructions: ["Sauté chicken in olive oil until its internal temperature reaches 165°F."],
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    adaptedFrom: { title: "Fixture bibliography", author: "Fixture author", publisher: "Fixture publisher", url: "https://example.test/source", accessed: "2026-10-15" },
  };
}
function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
export function savedFixture(id = VERSION_ID): SavedAdaptation {
  const recipe = AdaptationRecipeSchema.parse({ name: "Chicken skillet — Leonardo's vegetarian version", numberOfServings: 2,
    ingredients: [{ name: "firm tofu", amount: 250, unit: "g" }, { name: "olive oil", amount: 1, unit: "tbsp" }],
    instructions: PROPOSAL.instructions,
    adaptedFrom: sourceRecipe().adaptedFrom,
  });
  return SavedAdaptationSchema.parse({
    kind: "saved-adaptation", schemaVersion: 1, id,
    requestFingerprint: digest({ recipeId: SOURCE_ID, agentSlug: REQUEST.agentSlug, mode: REQUEST.mode }),
    recipe,
    receipt: {
      mode: "vegetarian", actor: { id: ACTOR_ID, slug: REQUEST.agentSlug, name: "Leonardo" },
      original: { id: SOURCE_ID, name: "Chicken skillet", contentHash: "a".repeat(64) },
      basis: { chart: { source: "user_profiles.natal_positions", digest: digest(PLACEMENTS), placements: PLACEMENTS }, preferences: { source: "user_profiles.dietary_preferences", digest: digest(PREFERENCES), values: PREFERENCES }, usedPlacementIndices: [0], usedPreferenceKeys: ["dietaryPhilosophy"] },
      changes: { ingredients: [{ index: 0, from: { name: "chicken", amount: 250, unit: "g" }, to: { name: "firm tofu", amount: 250, unit: "g" } }], instructions: [{ index: 0, from: "Sauté chicken in olive oil.", to: PROPOSAL.instructions[0] }] },
      contentHash: digest(recipe), explanation: PROPOSAL.explanation,
      verification: { valid: true, verified: false, requestedRestrictions: ["vegetarian"], evaluatedRestrictions: ["vegetarian"], unevaluatedRestrictions: [], unresolvedIngredients: [], notChecked: ["nutrition", "steps.0.cooking_method", "steps.0.time_minutes"], advisoryFindings: [] },
      readingsUnavailable: ["nutrition", "elemental", "esms", "planetary"],
    },
  });
}

import {
  basket,
  boolean,
  integer,
  nullable,
  number,
  object,
  result,
  shape,
  string,
} from "./outputSchemaHelpers";
import type { JsonSchema } from "./inputSchemaHelpers";

const userAllowance = shape(
  {
    authenticated: boolean,
    userId: nullable(string),
    tier: string,
    rateLimitTier: nullable(string),
    rateLimitRpm: number,
    balances: nullable(basket),
    toolCosts: object,
    remediation: string,
  },
  ["authenticated", "tier", "rateLimitRpm", "toolCosts"],
);

const substituteIngredient = shape(
  {
    originalIngredient: string,
    dishContext: nullable(string),
    dietaryRestriction: nullable(string),
    substitutes: {
      type: "array",
      items: shape(
        {
          name: string,
          ratio: string,
          flavorImpact: string,
          textureImpact: string,
          elementalShift: object,
          bestFor: { type: "array", items: string },
          notes: nullable(string),
        },
        ["name", "ratio", "flavorImpact", "textureImpact", "elementalShift"],
      ),
    },
  },
  ["originalIngredient", "substitutes"],
);

const consolidatedGroceryList = shape(
  {
    recipeCount: integer,
    servingsMultiplier: number,
    totalItems: integer,
    itemsByAisle: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: shape(
          {
            name: string,
            amount: number,
            unit: string,
            formatted: string,
            searchQuery: nullable(string),
            sources: { type: "array", items: string },
          },
          ["name", "amount", "unit", "formatted"],
        ),
      },
    },
    pantryCovered: { type: "array", items: string },
  },
  ["recipeCount", "servingsMultiplier", "totalItems", "itemsByAisle", "pantryCovered"],
);

const whatToCookNow = shape(
  {
    totalCandidates: integer,
    dominantElement: string,
    appliedProfileFilters: shape(
      {
        profileLoaded: boolean,
        ignored: boolean,
        excludedAllergens: { type: "array", items: string },
        dietaryFrameworks: { type: "array", items: string },
        dislikedIngredients: { type: "array", items: string },
      },
      ["profileLoaded", "ignored", "excludedAllergens", "dietaryFrameworks", "dislikedIngredients"],
    ),
    recommendations: {
      type: "array",
      items: shape(
        {
          id: string,
          name: string,
          cuisine: nullable(string),
          prepTimeMinutes: nullable(integer),
          cookTimeMinutes: nullable(integer),
          totalTimeMinutes: nullable(integer),
          servings: nullable(integer),
          matchScore: number,
          matchedIngredients: { type: "array", items: string },
          missingIngredients: { type: "array", items: string },
          flavorStar: object,
          finishingTouch: string,
          sensoryCheckpoints: { type: "array", items: string },
          zeroWasteTip: nullable(string),
          resourceUri: string,
        },
        [
          "id",
          "name",
          "matchScore",
          "matchedIngredients",
          "missingIngredients",
          "finishingTouch",
          "sensoryCheckpoints",
          "resourceUri",
        ],
      ),
    },
  },
  ["totalCandidates", "dominantElement", "appliedProfileFilters", "recommendations"],
);

const updateCulinaryProfile = shape(
  {
    success: boolean,
    activeAllergens: { type: "array", items: string },
    dietaryFrameworks: { type: "array", items: string },
    dislikedIngredients: { type: "array", items: string },
    kitchenEquipment: { type: "array", items: string },
    spiceTolerance: nullable(string),
    householdSize: nullable(integer),
    appliedGateCount: integer,
  },
  ["success", "activeAllergens", "dietaryFrameworks", "dislikedIngredients", "kitchenEquipment"],
);

export const CULINARY_OUTPUT_SCHEMAS = {
  get_user_allowance: result(userAllowance, false),
  substitute_ingredient: result(substituteIngredient, false),
  build_consolidated_grocery_list: result(consolidatedGroceryList, false),
  what_to_cook_now: result(whatToCookNow, true),
  update_culinary_profile: result(updateCulinaryProfile, false),
} satisfies Record<string, JsonSchema>;

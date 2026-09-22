import { z } from "zod";
import type { LunarPhase } from "@/types/alchemy";
import type { RecipeIngredient } from "@/types/recipe";
import { AlchemicalElementalPropertiesSchema } from "./alchemicalBackendSchemas";

/**
 * Alchemized Recipe Schema (extracted preview)
 */
export const AlchemizedRecipeSchema = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    yield: z.string().optional(),
    categories: z.array(z.string()).default([]),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    elementalProperties: AlchemicalElementalPropertiesSchema,
    elementalMatchRate: z.number().default(0),
    spirit: z.number().default(0),
    essence: z.number().default(0),
    matter: z.number().default(0),
    substance: z.number().default(0),
    aSharp: z.number().default(0),
    alchemicalMatchRate: z.number().default(0),
    source: z.string().default("custom"),
  })
  .passthrough();

export type AlchemizedRecipe = z.infer<typeof AlchemizedRecipeSchema>;

export const RecipeExtractSuccessSchema = z
  .object({
    success: z.literal(true),
    recipes: z.array(AlchemizedRecipeSchema),
    balances: z.unknown().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

export const RecipeExtractFailureSchema = z
  .object({
    success: z.literal(false),
    error: z.string().optional(),
    message: z.string().optional(),
    recipes: z.array(AlchemizedRecipeSchema).optional(),
  })
  .passthrough();

export const RecipeExtractRawErrorSchema = z
  .object({
    error: z.string(),
    success: z.literal(false).optional(),
    message: z.string().optional(),
    recipes: z.array(AlchemizedRecipeSchema).optional(),
  })
  .passthrough();

export const RecipeExtractApiResponseSchema = z.union([
  RecipeExtractSuccessSchema,
  RecipeExtractFailureSchema,
  RecipeExtractRawErrorSchema,
]);

export type RecipeExtractApiResponse = z.infer<typeof RecipeExtractApiResponseSchema>;

/**
 * Saved Recipe Schema (custom recipe list DTO)
 */
export const SavedRecipeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    cuisine: z.string().optional(),
    source: z.string().optional(),
    sourceRecipeId: z.string().optional(),
    createdAt: z.number(),
    updatedAt: z.number().optional(),
  })
  .passthrough();

export type SavedRecipe = z.infer<typeof SavedRecipeSchema>;

export const CustomRecipesListSuccessSchema = z
  .object({
    authenticated: z.literal(true),
    recipes: z.array(SavedRecipeSchema),
  })
  .passthrough();

export const CustomRecipesListUnauthSchema = z
  .object({
    authenticated: z.literal(false),
    recipes: z.array(SavedRecipeSchema).default([]),
  })
  .passthrough();

export const CustomRecipesListErrorSchema = z
  .object({
    error: z.string(),
    authenticated: z.literal(false).optional(),
    recipes: z.array(SavedRecipeSchema).optional(),
  })
  .passthrough();

export const CustomRecipesListResponseSchema = z.union([
  CustomRecipesListSuccessSchema,
  CustomRecipesListUnauthSchema,
  CustomRecipesListErrorSchema,
]);

export type CustomRecipesListResponse = z.infer<typeof CustomRecipesListResponseSchema>;

/**
 * Custom Recipe Save Wire Response Schema
 */
export const QuestMilestoneAwardSchema = z
  .object({
    questSlug: z.string(),
    tokensAwarded: z.number(),
    tokenType: z.string(),
  })
  .passthrough();

export type QuestMilestoneAward = z.infer<typeof QuestMilestoneAwardSchema>;

export const CustomRecipeSaveSuccessSchema = z
  .object({
    authenticated: z.literal(true),
    recipe: SavedRecipeSchema,
    wasExisting: z.boolean().default(false),
    completedQuests: z.array(QuestMilestoneAwardSchema).default([]),
  })
  .passthrough();

export const CustomRecipeSaveErrorSchema = z
  .object({
    error: z.string(),
    authenticated: z.boolean().optional(),
    success: z.literal(false).optional(),
    completedQuests: z.array(QuestMilestoneAwardSchema).optional(),
  })
  .passthrough();

export const CustomRecipeSaveWireResponseSchema = z.union([
  CustomRecipeSaveSuccessSchema,
  CustomRecipeSaveErrorSchema,
]);

export type CustomRecipeSaveWireResponse = z.infer<typeof CustomRecipeSaveWireResponseSchema>;

/**
 * Coin Amounts Schema for Recipe NFT
 */
export const CoinAmountsSchema = z.object({
  spirit: z.number(),
  essence: z.number(),
  matter: z.number(),
  substance: z.number(),
});

export type CoinAmounts = z.infer<typeof CoinAmountsSchema>;

export const MintQuoteResponseSchema = z
  .object({
    enabled: z.boolean(),
    fingerprint: z
      .object({
        aSharp: z.number(),
        totals: CoinAmountsSchema,
      })
      .passthrough(),
    quote: z
      .object({
        liveCost: CoinAmountsSchema,
        swap: z.object({ rulingHourPlanet: z.string() }).passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

export type MintQuoteResponse = z.infer<typeof MintQuoteResponseSchema>;

export const MintWireSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    mintId: z.string().optional(),
    status: z.enum(["pending_chain", "minting", "minted", "failed"]).optional(),
    pending: z.boolean().optional(),
    reason: z.string().optional(),
    cost: CoinAmountsSchema.optional(),
    weightedToCoin: z.string().nullable().optional(),
    contentHash: z.string().optional(),
    metadataUri: z.string().optional(),
    imageUrl: z.string().optional(),
    txHash: z.string().nullable().optional(),
    error: z.string().optional(),
  })
  .passthrough();

export const MintWireErrorResponseSchema = z
  .object({
    success: z.literal(false).optional(),
    error: z.string(),
    detail: z.string().optional(),
    status: z.enum(["pending_chain", "minting", "minted", "failed"]).optional(),
    pending: z.boolean().optional(),
    cost: CoinAmountsSchema.optional(),
    weightedToCoin: z.string().nullable().optional(),
    contentHash: z.string().optional(),
    mintId: z.string().optional(),
    refunded: z.boolean().optional(),
  })
  .passthrough();

export const MintWireResponseSchema = z.union([
  MintWireSuccessResponseSchema,
  MintWireErrorResponseSchema,
]);

export type MintWireResponse = z.infer<typeof MintWireResponseSchema>;

export const ElementalPropertiesSchema = z.object({
  Fire: z.number(),
  Water: z.number(),
  Earth: z.number(),
  Air: z.number(),
});

const SEASONS = ["spring", "summer", "autumn", "fall", "winter", "all"] as const;
const SeasonEnum = z.enum(SEASONS);

const LUNAR_PHASE_MAP: Record<string, LunarPhase> = {
  "new moon": "new moon", "waxing crescent": "waxing crescent", "first quarter": "first quarter", "waxing gibbous": "waxing gibbous",
  "full moon": "full moon", "waning gibbous": "waning gibbous", "last quarter": "last quarter", "waning crescent": "waxing crescent",
  "new_moon": "new moon", "waxing_crescent": "waxing crescent", "first_quarter": "first quarter", "waxing_gibbous": "waxing gibbous",
  "full_moon": "full moon", "waning_gibbous": "waning gibbous", "last_quarter": "last quarter", "waning_crescent": "waxing crescent",
};

const LunarPhaseEnum: z.ZodType<LunarPhase> = z.string().transform((v, ctx): LunarPhase => {
  const mapped = LUNAR_PHASE_MAP[v];
  if (!mapped) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid lunar phase: ${v}` });
    return z.NEVER;
  }
  return mapped;
});

export const RecipeIngredientSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    category: z.string().optional(),
    optional: z.boolean().optional(),
    preparation: z.string().optional(),
    notes: z.string().optional(),
    function: z.string().optional(),
    asin: z.string().optional(),
    cookingPoint: z.string().optional(),
    substitutes: z.array(z.string()).optional(),
    elementalProperties: ElementalPropertiesSchema.optional(),
    seasonality: z.union([SeasonEnum, z.array(SeasonEnum)]).optional(),
    zodiacInfluences: z.array(z.any()).optional(),
    planetaryInfluences: z.array(z.string()).optional(),
    lunarPhaseInfluences: z.array(LunarPhaseEnum).optional(),
  })
  .passthrough();

export type RecipeIngredientWire = z.infer<typeof RecipeIngredientSchema>;

export function toDomainRecipeIngredient(wire: RecipeIngredientWire): RecipeIngredient {
  const result: RecipeIngredient = {
    name: wire.name,
    amount: wire.amount,
    unit: wire.unit,
  };
  if (wire.id !== undefined) result.id = wire.id;
  if (wire.category !== undefined) result.category = wire.category;
  if (wire.optional !== undefined) result.optional = wire.optional;
  if (wire.preparation !== undefined) result.preparation = wire.preparation;
  if (wire.notes !== undefined) result.notes = wire.notes;
  if (wire.function !== undefined) result.function = wire.function;
  if (wire.asin !== undefined) result.asin = wire.asin;
  if (wire.cookingPoint !== undefined) result.cookingPoint = wire.cookingPoint;
  if (wire.substitutes !== undefined) result.substitutes = wire.substitutes;
  if (wire.elementalProperties !== undefined) result.elementalProperties = wire.elementalProperties;
  if (wire.seasonality !== undefined) result.seasonality = wire.seasonality;
  if (wire.zodiacInfluences !== undefined) result.zodiacInfluences = wire.zodiacInfluences;
  if (wire.planetaryInfluences !== undefined) result.planetaryInfluences = wire.planetaryInfluences;
  if (wire.lunarPhaseInfluences !== undefined) result.lunarPhaseInfluences = wire.lunarPhaseInfluences;
  return result;
}


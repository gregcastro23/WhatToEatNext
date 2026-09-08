/**
 * API Response Zod Schemas
 *
 * Runtime validation schemas for internal Next.js API routes.
 * Use these at API boundaries to catch shape mismatches between
 * services at the earliest possible point rather than deep inside
 * React components.
 *
 * Usage:
 *   const result = RecipeApiResponseSchema.safeParse(await res.json());
 *   if (!result.success) throw new Error("Malformed recipe response");
 *   const { recipe } = result.data; // fully typed, no cast needed
 */

import { z } from "zod";
import type { NatalChart } from "@/types/natalChart";
import type {
  AstrologicalState,
  DayRecommendationOptions,
} from "@/utils/menuPlanner/recommendationBridge";

// ─── Elemental properties ────────────────────────────────────────────────────

export const ElementalPropertiesSchema = z.object({
  Fire: z.number().min(0).max(1),
  Water: z.number().min(0).max(1),
  Earth: z.number().min(0).max(1),
  Air: z.number().min(0).max(1),
});

// ─── Recipe ingredient ───────────────────────────────────────────────────────

export const RecipeIngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  category: z.string().optional(),
  optional: z.boolean().optional(),
  preparation: z.string().optional(),
  notes: z.string().optional(),
  function: z.string().optional(),
  substitutes: z.array(z.string()).optional(),
  elementalProperties: ElementalPropertiesSchema.optional(),
}).passthrough(); // allow extra fields from alchemical data

// ─── Core Recipe schema ───────────────────────────────────────────────────────
// Validates the fields that route handlers and client components rely on.
// Uses .passthrough() so that additional alchemical/astrological fields
// from the database don't cause false-positive parse failures.

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(z.string()),
  elementalProperties: ElementalPropertiesSchema,
  // Cooking methods exist under two possible keys in the wild
  cookingMethod: z.union([z.string(), z.array(z.string())]).optional(),
  cookingMethods: z.array(z.string()).optional(),
  mealType: z.union([z.string(), z.array(z.string())]).optional(),
  season: z.union([z.string(), z.array(z.string())]).optional(),
  timeToMake: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servingSize: z.number().optional(),
  numberOfServings: z.number().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
}).passthrough();

export type ParsedRecipe = z.infer<typeof RecipeSchema>;

// ─── Recipe API response (/api/recipes/[recipeId]) ───────────────────────────

export const RecipeDetailResponseSchema = z.object({
  success: z.literal(true),
  recipe: RecipeSchema,
  recommendedSauces: z.array(z.unknown()).optional(),
  recommendedRecipes: z.array(RecipeSchema).optional(),
});

export type RecipeDetailResponse = z.infer<typeof RecipeDetailResponseSchema>;

// ─── Generic API error ────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─── Food Diary ───────────────────────────────────────────────────────────────

export const ServingSizeSchema = z.object({
  amount: z.number(),
  unit: z.string(),
  grams: z.number(),
  description: z.string().optional(),
});

export const CreateFoodDiaryEntrySchema = z.object({
  userId: z.string().optional(),
  foodName: z.string().min(1),
  foodSource: z.enum(["recipe", "custom", "barcode", "search", "quick", "favorite"]),
  sourceId: z.string().optional(),
  brandName: z.string().optional(),
  date: z.coerce.date(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  time: z.string(),
  serving: ServingSizeSchema,
  quantity: z.number().positive(),
  nutrition: z.record(z.string(), z.unknown()).optional(),
  elementalProperties: ElementalPropertiesSchema.optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().optional(),
  store: z.string().optional(),
  quality: z.string().optional(),
});

export type ParsedCreateFoodDiaryEntry = z.infer<typeof CreateFoodDiaryEntrySchema>;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const BirthDataSchema = z.object({
  dateTime: z.string(), // ISO 8601 format
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional()
});

export const OnboardingRequestSchema = z.object({
  name: z.string().optional(),
  birthData: BirthDataSchema
});

export type ParsedOnboardingRequest = z.infer<typeof OnboardingRequestSchema>;

export const SkipOnboardingRequestSchema = z.object({
  skipNatal: z.literal(true),
});

export type ParsedSkipOnboardingRequest = z.infer<typeof SkipOnboardingRequestSchema>;

// ─── Commensal Request ────────────────────────────────────────────────────────

export const CommensalRelationshipSchema = z.enum([
  "self",
  "family",
  "friend",
  "partner",
  "colleague",
  "other",
]);

export const AddCommensalRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  relationship: CommensalRelationshipSchema.optional(),
  birthData: BirthDataSchema,
});

export type ParsedAddCommensalRequest = z.infer<typeof AddCommensalRequestSchema>;

export const UpdateCommensalRequestSchema = z.object({
  name: z.string().min(1).optional(),
  relationship: CommensalRelationshipSchema.optional(),
}).refine((data) => data.name !== undefined || data.relationship !== undefined, {
  message: "At least one of name or relationship must be provided",
});

export type ParsedUpdateCommensalRequest = z.infer<typeof UpdateCommensalRequestSchema>;

export const CommensalRequestSchema = z.object({
  targetUserId: z.string().optional(),
  email: z.string().email().optional()
}).refine(data => data.targetUserId ?? data.email, {
  message: "Either targetUserId or email must be provided",
  path: ["targetUserId"]
});

// ─── Economy: Sync Credit, Debit & Swap ──────────────────────────────────────

export const TokenAmountValueSchema = z.union([z.number(), z.string()]);

export const SyncTokenAmountsSchema = z.object({
  spirit: TokenAmountValueSchema.optional(),
  essence: TokenAmountValueSchema.optional(),
  matter: TokenAmountValueSchema.optional(),
  substance: TokenAmountValueSchema.optional(),
});

export const TransactionSourceTypeSchema = z.enum([
  "daily_yield",
  "agents_yield",
  "agents_operation",
  "quest_reward",
  "purchase",
  "premium_purchase",
  "transmutation",
  "streak_bonus",
  "alchemical_log",
  "signup_grant",
  "admin",
  "mcp_top_up",
  "transit_attunement",
  "group_chat_quest",
  "recipe_ingestion",
  "restaurant_order",
  "restaurant_refund",
  "cosmic_recipe_refund",
  "mint_refund",
  "onchain_claim",
  "onchain_claim_refund",
  "practice_reward",
]);

export const SyncCreditRequestSchema = z.object({
  userEmail: z.string().min(1, "userEmail is required"),
  amounts: SyncTokenAmountsSchema,
  source: TransactionSourceTypeSchema.optional(),
  idempotencyKey: z.string().min(1, "idempotencyKey is required"),
  metadata: z
    .object({
      planet: z.string().optional(),
      sign: z.string().optional(),
      degree: z.number().optional(),
      totalTokens: z.number().optional(),
      degreeAgentId: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export type ParsedSyncCreditRequest = z.infer<typeof SyncCreditRequestSchema>;

export const SyncDebitRequestSchema = z.object({
  userEmail: z.string().min(1, "userEmail is required"),
  amounts: SyncTokenAmountsSchema,
  operationType: z.string().optional(),
  source: z.string().optional(),
  idempotencyKey: z.string().min(1, "idempotencyKey is required"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ParsedSyncDebitRequest = z.infer<typeof SyncDebitRequestSchema>;

export const TokenTypeSchema = z.enum([
  "Spirit",
  "Essence",
  "Matter",
  "Substance",
]);

export const EconomySwapRequestSchema = z.object({
  fromToken: TokenTypeSchema,
  toToken: TokenTypeSchema,
  amount: z.number().positive("amount must be a positive number").finite(),
}).refine((data) => data.fromToken !== data.toToken, {
  message: "Cannot swap a token for itself",
  path: ["toToken"],
});

export type ParsedEconomySwapRequest = z.infer<typeof EconomySwapRequestSchema>;

// ─── Recipe Mint Envelope ───────────────────────────────────────────────────

export const RecipeMintRequestEnvelopeSchema = z.object({
  recipe: z.record(z.string(), z.unknown()),
});

export type ParsedRecipeMintRequestEnvelope = z.infer<
  typeof RecipeMintRequestEnvelopeSchema
>;

// ─── Checkout & Stripe ───────────────────────────────────────────────────────

export const CheckoutPreflightRequestSchema = z.object({
  source: z.string().optional(),
  items: z.array(z.unknown()),
  cartType: z.enum(["fresh", "standard"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ParsedCheckoutPreflightRequest = z.infer<
  typeof CheckoutPreflightRequestSchema
>;

export const StripeCheckoutTokensRequestSchema = z.object({
  sku: z.string().min(1, "Missing or invalid token package SKU"),
});

export type ParsedStripeCheckoutTokensRequest = z.infer<
  typeof StripeCheckoutTokensRequestSchema
>;

// ─── User Profile Update ──────────────────────────────────────────────────────

export const UserProfileUpdateSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  birthData: BirthDataSchema.optional(),
  natalChart: z.record(z.string(), z.unknown()).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

// ─── Batch 1B: Social, Tables, Feed & Groups ───────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const FollowTargetRequestSchema = z.object({
  targetUserId: z.string().regex(UUID_REGEX, "targetUserId must be a valid UUID").optional(),
});
export type ParsedFollowTargetRequest = z.infer<typeof FollowTargetRequestSchema>;

export const FeedReactionKindSchema = z.enum(["spark", "fire", "water", "earth", "air"]);

export const FeedReactionRequestSchema = z.object({
  eventId: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "eventId is required",
  ),
  kind: z
    .preprocess(
      (val) =>
        typeof val === "string" && ["spark", "fire", "water", "earth", "air"].includes(val)
          ? val
          : "spark",
      FeedReactionKindSchema,
    )
    .default("spark"),
});
export type ParsedFeedReactionRequest = z.infer<typeof FeedReactionRequestSchema>;

export const FeedCommentRequestSchema = z.object({
  eventId: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "eventId is required",
  ),
  body: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length >= 1 && s.length <= 1000, {
      message: "A comment must be 1–1000 characters.",
    }),
});
export type ParsedFeedCommentRequest = z.infer<typeof FeedCommentRequestSchema>;

export const FeedCommentReportRequestSchema = z.object({
  reason: z.enum(["spam", "harassment", "inappropriate", "other"], {
    message: "A valid reason is required",
  }),
  detail: z.string().trim().max(1000).optional().nullable(),
});
export type ParsedFeedCommentReportRequest = z.infer<
  typeof FeedCommentReportRequestSchema
>;

export const FeedShareTypeSchema = z.enum(["menu", "recipe", "preferences", "cooked"]);

export const FeedShareRequestSchema = z.object({
  shareType: FeedShareTypeSchema,
  shareName: z.boolean().optional(),
  shareIdentity: z.boolean().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type ParsedFeedShareRequest = z.infer<typeof FeedShareRequestSchema>;

export const CommensalAcceptRequestSchema = z.object({
  commensalshipId: z.string().min(1, "commensalshipId is required"),
});
export type ParsedCommensalAcceptRequest = z.infer<
  typeof CommensalAcceptRequestSchema
>;

export const CommensalRejectRequestSchema = z.object({
  commensalshipId: z.string().min(1, "commensalshipId is required"),
});
export type ParsedCommensalRejectRequest = z.infer<
  typeof CommensalRejectRequestSchema
>;

export const CommensalBlockRequestSchema = z
  .object({
    commensalshipId: z.string().min(1).optional(),
    targetUserId: z.string().min(1).optional(),
    action: z
      .enum(["block", "unblock"], {
        message: "action must be 'block' or 'unblock'",
      })
      .default("block"),
  })
  .refine((data) => Boolean(data.commensalshipId || data.targetUserId), {
    message: "commensalshipId or targetUserId is required",
  });
export type ParsedCommensalBlockRequest = z.infer<
  typeof CommensalBlockRequestSchema
>;

export const CreateDiningGroupRequestSchema = z.object({
  name: z.string().trim().min(1, "name and memberIds array are required"),
  memberIds: z.array(z.string(), {
    message: "name and memberIds array are required",
  }),
});
export type ParsedCreateDiningGroupRequest = z.infer<
  typeof CreateDiningGroupRequestSchema
>;

export const UpdateDiningGroupRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    memberIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.name !== undefined || data.memberIds !== undefined, {
    message: "At least one of name or memberIds must be provided",
  });
export type ParsedUpdateDiningGroupRequest = z.infer<
  typeof UpdateDiningGroupRequestSchema
>;

export const GroupRecommendationsRequestSchema = z.object({
  commensalIds: z.array(z.string()).optional().default([]),
  linkedUserIds: z.array(z.string()).optional().default([]),
  strategy: z.string().optional().default("average"),
});
export type ParsedGroupRecommendationsRequest = z.infer<
  typeof GroupRecommendationsRequestSchema
>;

export const SaveGuestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  relationship: z.string().optional(),
  birthData: BirthDataSchema,
  natalChart: z.custom<NatalChart>(
    (n) =>
      Boolean(
        n &&
          typeof n === "object" &&
          "dominantElement" in n &&
          "elementalBalance" in n,
      ),
    "natalChart incomplete",
  ),
});
export type ParsedSaveGuest = z.infer<typeof SaveGuestSchema>;

export const CommensalSaveGroupRequestSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(1, "groupName is required")
    .max(100, "groupName must be at most 100 characters"),
  guests: z
    .array(SaveGuestSchema, {
      message: "guests array must not be empty",
    })
    .min(1, "guests array must not be empty")
    .max(12, "Cannot save a group with more than twelve guests"),
});
export type ParsedCommensalSaveGroupRequest = z.infer<
  typeof CommensalSaveGroupRequestSchema
>;

export const PushPreferenceRequestSchema = z.object({
  enabled: z.boolean().optional(),
});
export type ParsedPushPreferenceRequest = z.infer<
  typeof PushPreferenceRequestSchema
>;

export const PushSubscribeRequestSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url().refine((u) => u.startsWith("https://"), {
      message: "A valid subscription is required",
    }),
    keys: z.object({
      p256dh: z.string().min(1, "A valid subscription is required"),
      auth: z.string().min(1, "A valid subscription is required"),
    }),
  }),
});
export type ParsedPushSubscribeRequest = z.infer<
  typeof PushSubscribeRequestSchema
>;

export const PushUnsubscribeRequestSchema = z.object({
  endpoint: z.string().min(1, "endpoint is required"),
});
export type ParsedPushUnsubscribeRequest = z.infer<
  typeof PushUnsubscribeRequestSchema
>;

export const PremiumTableRequestSchema = z.object({
  hostData: z.custom<NatalChart>(
    (val) => Boolean(val && typeof val === "object" && "birthData" in val),
    "Missing birth data for Host",
  ),
  friendData: z.custom<NatalChart>(
    (val) => Boolean(val && typeof val === "object" && "birthData" in val),
    "Missing birth data for Friend",
  ),
});
export type ParsedPremiumTableRequest = z.infer<
  typeof PremiumTableRequestSchema
>;

export const GroupBackendProxyRequestSchema = z
  .object({
    members: z.array(z.unknown()).min(2, "Group must have at least 2 members"),
  })
  .passthrough();
export type ParsedGroupBackendProxyRequest = z.infer<
  typeof GroupBackendProxyRequestSchema
>;

export const NatalPlanetInputSchema = z.object({
  sign: z.string(),
  degree: z.number(),
  retrograde: z.boolean().optional(),
  house: z.number().optional(),
});
export type ParsedNatalPlanetInput = z.infer<typeof NatalPlanetInputSchema>;

export const SynastryRequestSchema = z.object({
  viewer: z.object({
    id: z.string().optional(),
    natalChart: z.object({
      planets: z.record(z.string(), NatalPlanetInputSchema),
      ascendant: z.union([z.number(), NatalPlanetInputSchema]).optional(),
      midheaven: z.union([z.number(), NatalPlanetInputSchema]).optional(),
    }),
  }),
});
export type ParsedSynastryRequest = z.infer<typeof SynastryRequestSchema>;


// ─── Alchm Quantities API (/api/alchm-quantities) ───────────────────────────

const EsmsQuantitiesSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

const EsmsKineticsSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

const StatSummarySchema = z.object({
  mean: z.number(),
  variance: z.number(),
  stdDev: z.number()
});

const HistoricalContextSchema = z.object({
  timeframeDays: z.number(),
  dataPoints: z.number(),
  metrics: z.object({
    Spirit: StatSummarySchema,
    Essence: StatSummarySchema,
    Matter: StatSummarySchema,
    Substance: StatSummarySchema,
    heat: StatSummarySchema,
    entropy: StatSummarySchema,
    reactivity: StatSummarySchema,
    kalchm: StatSummarySchema,
    monica: StatSummarySchema,
    charge: StatSummarySchema,
    power: StatSummarySchema,
    currentFlow: StatSummarySchema,
  })
});

export const AlchmQuantitiesApiResponseSchema = z.object({
  success: z.literal(true),
  timestamp: z.string(),
  quantities: EsmsQuantitiesSchema.extend({
    ANumber: z.number(),
    DayEssence: z.number(),
    NightEssence: z.number(),
  }),
  dominantElement: z.string(),
  isDiurnal: z.boolean(),
  heat: z.number(),
  entropy: z.number(),
  reactivity: z.number(),
  energy: z.number(),
  kalchm: z.number(),
  monica: z.number(),
  // Present only when the result is not fully live (silent astronomy fallbacks
  // or a degenerate monica). Absent on healthy payloads — purely additive.
  degraded: z.object({
    reasons: z.array(z.string()),
  }).optional(),
  kinetics: z.object({
    velocity: EsmsKineticsSchema,
    acceleration: EsmsKineticsSchema,
    momentum: EsmsKineticsSchema,
    reactivity: z.number(),
    entropy: z.number(),
    power: z.number(),
  }),
  circuit: z.object({
    charge: z.number(),
    potentialDifference: z.number(),
    currentFlow: z.number(),
    power: z.number(),
    inertia: z.number(),
    forceMagnitude: z.number(),
    forceClassification: z.enum(["accelerating", "decelerating", "balanced"]),
    thermalDirection: z.enum(["heating", "cooling", "stable"]),
    primaryElement: z.string(),
    elementalBalance: ElementalPropertiesSchema,
    esmsBalance: EsmsQuantitiesSchema,
  }),
  alchemical: EsmsQuantitiesSchema,
  planetaryMomentum: z.record(z.string(), z.number()),
  historicalContext: HistoricalContextSchema.optional(),
  vectorCircuit: z.object({
    esmsField: z.record(z.string(), z.object({ x: z.number(), y: z.number(), z: z.number() })),
    esmsForce: z.record(z.string(), z.object({ x: z.number(), y: z.number(), z: z.number() })),
    esmsMagnitude: EsmsQuantitiesSchema,
    omega: z.number(),
    capacitance: z.number(),
    inductance: z.number(),
    resistance: z.number(),
    inductiveReactance: z.number(),
    capacitiveReactance: z.number(),
    reactance: z.number(),
    impedance: z.number(),
    phaseAngle: z.number(),
    powerFactor: z.number(),
    acCurrent: z.number(),
    realPower: z.number(),
    reactivePower: z.number(),
    apparentPower: z.number(),
    dominantState: z.enum(["capacitive", "inductive", "resistive"]),
    applyingStrength: z.number(),
    separatingStrength: z.number(),
    aspectCount: z.number(),
  }).optional(),
  crossVerification: z.object({
    success: z.boolean(),
    backendUrl: z.string(),
    localQuantities: EsmsQuantitiesSchema,
    backendQuantities: EsmsQuantitiesSchema,
    discrepancy: EsmsQuantitiesSchema,
    status: z.enum(["verified", "rectified", "discrepant", "failed"]),
    error: z.string().optional(),
  }).optional(),
});

export type AlchmQuantitiesApiResponse = z.infer<
  typeof AlchmQuantitiesApiResponseSchema
>;

// ─── Batch 1C: Recipe, Menu Planning & AI Generation Endpoints ──────────────

export const IgniteRequestSchema = z.object({
  dob: z.string().min(1, "Date of Birth is required"),
  city: z.string().min(1, "City is required"),
});
export type ParsedIgniteRequest = z.infer<typeof IgniteRequestSchema>;

export const NanobananaGenerateRequestSchema = z.object({
  title: z.string().trim().min(1, "Missing recipe title."),
  description: z.string().trim().optional(),
});
export type ParsedNanobananaGenerateRequest = z.infer<
  typeof NanobananaGenerateRequestSchema
>;

export const RecipesQueryBodySchema = z.object({
  element: z.string().optional(),
  cuisine: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ParsedRecipesQueryBody = z.infer<typeof RecipesQueryBodySchema>;

export const RecipeRefineRequestSchema = z.object({
  cuisine: z.string().trim().optional(),
});
export type ParsedRecipeRefineRequest = z.infer<typeof RecipeRefineRequestSchema>;

export const RecipeExtractJsonBodySchema = z.object({
  text: z.string().optional(),
});
export type ParsedRecipeExtractJsonBody = z.infer<typeof RecipeExtractJsonBodySchema>;

export const GenerateRecommendationsRequestSchema = z.object({
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  astroState: z.custom<AstrologicalState>(
    (val): boolean => Boolean(val && typeof val === "object" && !Array.isArray(val)),
    "astroState must be an object",
  ),
  options: z
    .custom<DayRecommendationOptions>(
      (val): boolean => Boolean(val && typeof val === "object" && !Array.isArray(val)),
      "options must be an object",
    )
    .optional(),
  retryToken: z.string().optional(),
});
export type ParsedGenerateRecommendationsRequest = z.infer<
  typeof GenerateRecommendationsRequestSchema
>;

export const RitualCookingInstructionRequestSchema = z.object({
  recipe_id: z.string().optional(),
});
export type ParsedRitualCookingInstructionRequest = z.infer<
  typeof RitualCookingInstructionRequestSchema
>;

export const UserRecipeInteractionSchema = z.object({
  madeIt: z.boolean().optional().default(false),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  review: z.string().max(500).optional().default(""),
});
export type ParsedUserRecipeInteraction = z.infer<typeof UserRecipeInteractionSchema>;

export const BulkImportMealPlanEntrySchema = z.object({
  recipeId: z.string().min(1),
  recipeName: z.string().nullable().optional(),
  date: z.string().min(1),
  mealType: z.string().nullable().optional(),
  servings: z.number().int().optional().default(1),
});

export const UserMealPlanPostSchema = z.object({
  bulkImport: z.array(BulkImportMealPlanEntrySchema).optional(),
  recipeId: z.string().optional(),
  recipeName: z.string().nullable().optional(),
  date: z.string().optional(),
  mealType: z.string().nullable().optional(),
  servings: z.number().int().optional(),
});
export type ParsedUserMealPlanPost = z.infer<typeof UserMealPlanPostSchema>;

export const FoodDiaryRatingSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  rating: z.number().min(0).max(5).refine((r) => (r * 2) % 1 === 0, {
    message: "rating must be in 0.5 increments",
  }),
  moodTags: z.array(z.string()).optional(),
  wouldEatAgain: z.boolean().optional(),
});
export type ParsedFoodDiaryRating = z.infer<typeof FoodDiaryRatingSchema>;

export const UpdateFoodLabEntryBodySchema = z.object({
  dishName: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  recipeName: z.string().optional(),
  cuisineType: z.string().optional(),
  cookingMethod: z.string().optional(),
  cookedAt: z.string().datetime().optional(),
  photos: z
    .array(
      z.object({
        dataUrl: z.string(),
        caption: z.string().optional(),
        uploadedAt: z.string().datetime(),
      }),
    )
    .optional(),
  elementalTags: z.record(z.string(), z.number().finite()).optional(),
  alchemicalTags: z.record(z.string(), z.number().finite()).optional(),
  planetaryContext: z.record(z.string(), z.unknown()).optional(),
  rating: z.number().finite().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});
export type ParsedUpdateFoodLabEntryBody = z.infer<typeof UpdateFoodLabEntryBodySchema>;

export const RestaurantsDiscoverRequestSchema = z.object({
  cuisine: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  radius: z.union([z.number(), z.string()]).optional(),
  limit: z.union([z.number(), z.string()]).optional(),
});
export type ParsedRestaurantsDiscoverRequest = z.infer<
  typeof RestaurantsDiscoverRequestSchema
>;

export const RestaurantsSearchRequestSchema = z.object({
  cuisineType: z.string().optional(),
  latitude: z.union([z.number(), z.string()]).optional(),
  longitude: z.union([z.number(), z.string()]).optional(),
  radius: z.union([z.number(), z.string()]).optional(),
  limit: z.union([z.number(), z.string()]).optional(),
});
export type ParsedRestaurantsSearchRequest = z.infer<
  typeof RestaurantsSearchRequestSchema
>;

export const RestaurantOnboardRequestSchema = z.object({
  restaurantId: z.string().optional(),
  name: z.string().trim().min(1, "Restaurant name is required"),
  email: z.string().email().optional(),
  businessType: z.string().optional(),
  externalProvider: z.string().optional(),
  externalId: z.string().optional(),
  menuUrl: z.string().url().optional(),
});
export type ParsedRestaurantOnboardRequest = z.infer<
  typeof RestaurantOnboardRequestSchema
>;

export const InstacartPriceEstimateItemSchema = z.union([
  z.string().min(1, "Item string cannot be empty"),
  z.object({
    name: z.string().min(1, "Item name is required"),
    display_text: z.string().optional(),
    product_ids: z.array(z.number()).optional(),
    upcs: z.array(z.string()).optional(),
    line_item_measurements: z
      .array(
        z.object({
          quantity: z.number(),
          unit: z.string(),
        }),
      )
      .optional(),
  }),
]);

export const InstacartPriceEstimateRequestSchema = z.object({
  line_items: z.array(InstacartPriceEstimateItemSchema).min(1, "Missing line_items"),
});
export type ParsedInstacartPriceEstimateRequest = z.infer<
  typeof InstacartPriceEstimateRequestSchema
>;

export const InstacartShoppingListBodySchema = z
  .object({
    title: z.string().optional(),
    line_items: z
      .array(
        z.object({
          name: z.string().min(1, "Item name is required"),
          quantity: z.number().optional(),
          unit: z.string().optional(),
          display_text: z.string().optional(),
          line_item_measurements: z
            .array(
              z.object({
                quantity: z.number(),
                unit: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    ingredients: z.array(z.string()).optional(),
  })
  .refine(
    (data): boolean =>
      (data.line_items !== undefined && data.line_items.length > 0) ||
      (data.ingredients !== undefined && data.ingredients.length > 0),
    { message: "No items provided" },
  );
export type ParsedInstacartShoppingListBody = z.infer<
  typeof InstacartShoppingListBodySchema
>;

export const RestaurantOrderBodySchema = z
  .object({
    cuisineType: z.unknown(),
    provider: z.unknown(),
    restaurant: z
      .object({
        id: z.unknown(),
        name: z.unknown(),
        url: z.unknown(),
        stripeConnectedAccountId: z.unknown(),
      })
      .optional(),
    order: z
      .object({
        amountCents: z.unknown(),
        currency: z.unknown(),
        description: z.unknown(),
        items: z.unknown(),
        splitMode: z.unknown(),
        orderType: z.unknown(),
        customer: z.unknown(),
        deliveryAddress: z.unknown(),
        specialInstructions: z.unknown(),
        preparationTime: z.unknown(),
        paymentMethod: z.unknown(),
      })
      .optional(),
  })
  .passthrough();
export type ParsedRestaurantOrderBody = z.infer<typeof RestaurantOrderBodySchema>;

// ─── Helper: extract cooking methods normalised to string[] ──────────────────
// Replaces the `as unknown as Record<string, unknown>` dance in route handlers.

export function extractCookingMethods(recipe: ParsedRecipe): string[] {
  const raw = recipe.cookingMethods ?? recipe.cookingMethod;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((m) =>
      typeof m === "string"
        ? m
        : typeof m === "object" && m !== null && "name" in m
          ? String((m as { name: unknown }).name)
          : "",
    )
    .filter(Boolean);
}

import { z } from "zod";

export const tokenBalancesSchema = z.object({
  spirit: z.number().finite(),
  essence: z.number().finite(),
  matter: z.number().finite(),
  substance: z.number().finite(),
  lastDailyClaimAt: z.string().nullable(),
  lastDailyClaimAgentsAt: z.string().nullable(),
  updatedAt: z.string(),
});

export const userStreakSchema = z.object({
  currentStreak: z.number().finite(),
  longestStreak: z.number().finite(),
  lastActivityDate: z.string().nullable(),
  streakFrozenUntil: z.string().nullable(),
  updatedAt: z.string(),
});

export const tokenDistributionSchema = z.object({
  spirit: z.number().finite(),
  essence: z.number().finite(),
  matter: z.number().finite(),
  substance: z.number().finite(),
});

export const dailyYieldSchema = z.object({
  baseTokens: z.number().finite(),
  streakMultiplier: z.number().finite(),
  holdingsMultiplier: z.number().finite(),
  totalTokens: z.number().finite(),
  distribution: tokenDistributionSchema,
  transitBonus: tokenDistributionSchema,
  newBalances: tokenBalancesSchema,
  streakCount: z.number().finite(),
  milestoneBonus: z
    .object({
      days: z.number().finite(),
      totalTokens: z.number().finite(),
    })
    .optional(),
});

export const economyBalanceResponseSchema = z.object({
  success: z.literal(true),
  balances: tokenBalancesSchema,
  streak: userStreakSchema,
  canClaimDaily: z.boolean(),
});

export const claimDailyResponseSchema = z.object({
  success: z.literal(true),
  yield: dailyYieldSchema,
  message: z.string(),
});

export const economyErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string().optional(),
});

const shopItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  isOneTime: z.boolean(),
  baseCost: tokenDistributionSchema,
  liveCost: tokenDistributionSchema,
  canAfford: z.boolean(),
});

export const shopResponseSchema = z.object({
  success: z.literal(true),
  balances: tokenDistributionSchema,
  pricing: z.object({
    multiplier: z.number().finite(),
    aNumber: z.number().finite(),
    dominantElement: z.string(),
    timestamp: z.string(),
  }),
  items: z.array(shopItemSchema),
});

export const purchaseResponseSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true) }),
  economyErrorResponseSchema,
]);

export type ShopResponse = z.infer<typeof shopResponseSchema>;

import { z } from "zod";

export const CommunityTipSchema = z
  .object({
    author: z.string(),
    rating: z.number(),
    tip: z.string(),
    postedAt: z.string(),
  })
  .passthrough();

export type CommunityTip = z.infer<typeof CommunityTipSchema>;

export const ShareResponseSchema = z
  .object({
    success: z.boolean().optional(),
  })
  .passthrough();

export type ShareResponse = z.infer<typeof ShareResponseSchema>;

export const RecipeSocialResponseSchema = z
  .object({
    authenticated: z.boolean().optional(),
    madeIt: z.boolean().optional(),
    rating: z.number().optional(),
    review: z.string().optional(),
    madeCount: z.number().optional(),
  })
  .passthrough();

export type RecipeSocialResponse = z.infer<typeof RecipeSocialResponseSchema>;

export const CommunityTipsResponseSchema = z
  .object({
    tips: z.array(CommunityTipSchema).optional(),
  })
  .passthrough();

export type CommunityTipsResponse = z.infer<typeof CommunityTipsResponseSchema>;

export const PracticeRewardSchema = z
  .object({
    tokenType: z.string(),
    amount: z.number(),
    hint: z.string(),
  })
  .passthrough();

export const PersistResponseSchema = z
  .object({
    madeCount: z.number().optional(),
    reward: PracticeRewardSchema.nullable().optional(),
  })
  .passthrough();

export type PersistResponse = z.infer<typeof PersistResponseSchema>;

export const CompletedQuestSchema = z
  .object({
    tokenRewardAmount: z.number(),
    tokenRewardType: z.string(),
  })
  .passthrough();

export const FeedShareResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    completedQuests: z.array(CompletedQuestSchema).optional(),
  })
  .passthrough();

export type FeedShareResponse = z.infer<typeof FeedShareResponseSchema>;

export const NanobananaGenerateResponseSchema = z
  .object({
    url: z.string().optional(),
  })
  .passthrough();

export type NanobananaGenerateResponse = z.infer<
  typeof NanobananaGenerateResponseSchema
>;

export const RecipeErrorResponseSchema = z
  .object({
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type RecipeErrorResponse = z.infer<typeof RecipeErrorResponseSchema>;

/**
 * Wire schemas for the /grimoire page. They replace two `as` casts and describe
 * what `GET /api/economy/grimoire` and `POST /api/quests/claim` really send.
 *
 * Failure contract: the page renders every field of `GrimoireData` unguarded, so
 * a body that does not match THROWS (ZodError). `refresh()` already wraps the read
 * in a try/catch that leaves `data` unset ("the grimoire stays shut"), and the
 * claim handler wraps its read in a silent catch followed by a refresh — so a
 * mismatch lands on the same path a non-OK response always took.
 *
 * Extra keys the server sends (`sky.aNumber`, `sky.transitWeights`, …) are
 * ignored; only what the page reads is validated.
 *
 * @file src/app/(alchm)/grimoire/parsers.ts
 */

import { z } from "zod";

const CoinVectorSchema = z.object({
  spirit: z.number(),
  essence: z.number(),
  matter: z.number(),
  substance: z.number(),
});

const MilestoneSchema = z.object({
  days: z.number(),
  totalTokens: z.number(),
});

const PracticeSchema = z.object({
  type: z.string(),
  tokenType: z.string(),
  description: z.string(),
  baseAmount: z.number(),
  dedupe: z.enum(["daily", "ever"]),
  dailyCap: z.number(),
  todayAmount: z.number(),
  todayModifier: z.number(),
});

const FeatSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  tokenRewardType: z.string(),
  tokenRewardAmount: z.number(),
  progress: z.number(),
  threshold: z.number(),
  completedAt: z.string().nullable(),
  claimedAt: z.string().nullable(),
});

const GrimoireDataSchema = z.object({
  success: z.boolean(),
  sky: z.object({
    dominantElement: z.string(),
    skyMultiplier: z.number(),
    rulingDayPlanet: z.string(),
    rulingHourPlanet: z.string(),
    personalized: z.boolean(),
  }),
  resonance: CoinVectorSchema,
  allowance: z.object({
    total: z.number(),
    spent: z.number(),
    remaining: z.number(),
  }),
  practices: z.array(PracticeSchema),
  discoveredSurfaces: z.array(z.string()),
  streak: z.object({
    current: z.number(),
    longest: z.number(),
    nextMilestone: MilestoneSchema.nullable(),
    milestones: z.array(MilestoneSchema),
  }),
  feats: z.array(FeatSchema),
});

export type CoinVector = z.infer<typeof CoinVectorSchema>;
export type GrimoireData = z.infer<typeof GrimoireDataSchema>;

/** `parse` for `readJson` on `/api/economy/grimoire`. Throws on a mismatch. */
export function parseGrimoireData(value: unknown): GrimoireData {
  return GrimoireDataSchema.parse(value);
}

/**
 * Only `success` and `tokensAwarded` are read. `tokensAwarded` may be absent or
 * null (a falsy value was always a no-op), but a wrong type throws into the
 * claim handler's silent catch, which is also a no-op followed by a refresh.
 */
const ClaimResponseSchema = z.object({
  success: z.boolean().optional(),
  tokensAwarded: z.number().nullish(),
});

export type ClaimResponse = z.infer<typeof ClaimResponseSchema>;

/** `parse` for `readJson` on `/api/quests/claim`. Throws on a mismatch. */
export function parseClaimResponse(value: unknown): ClaimResponse {
  return ClaimResponseSchema.parse(value);
}

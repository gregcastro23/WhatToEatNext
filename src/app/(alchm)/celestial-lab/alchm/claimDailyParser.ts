/**
 * Wire parser for `POST /api/economy/claim-daily` as the Celestial Lab
 * "Claim Daily Yield" button reads it.
 *
 * Producer: src/app/api/economy/claim-daily/route.ts. Success is `200
 * ClaimDailyResponse` (src/types/economy.ts:429-433: `{ success, yield:
 * DailyYieldResult, message }`) built at route.ts:117-121, where
 * `DailyYieldResult` is src/types/economy.ts:257-269. Every refusal is
 * `{ success: false, message }`: 401 (route.ts:33-36), 400 no natal chart
 * (45-50), 400 incomplete chart (59-64), 500 claim failed (88-94), 409 already
 * claimed (98-104), 503 degraded ephemeris (132-138) and 500 generic (140-143).
 * The 429 from `rateLimit` (src/lib/rateLimit.ts:159-174) is also JSON:
 * `{ error, message, retryAfter }`, with no `success` key.
 *
 * The page reads `success`, `message`, `yield.distribution` (four numbers) and
 * `yield.streakCount`, and forwards `yield.distribution` to the economy event.
 * Nothing listens to the event's optional `yield` field (the four listeners
 * take no event argument), so only what the page reads is validated and kept.
 *
 * NEVER THROWS. A 200 body means the server has already minted the tokens, so
 * drift must not turn a completed claim into a "Failed to claim" toast through
 * an exception. `success` is true only for the boolean `true`; `message` is kept
 * only as a string; `yield` is kept only for a success body whose
 * `distribution` holds four finite numbers and whose `streakCount` is finite.
 * A success body with an unusable `yield` parses without one, which the page
 * shows through its existing error branch.
 *
 * @file src/app/(alchm)/celestial-lab/alchm/claimDailyParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";
import type { TokenDistribution } from "@/types/economy";

/** The part of `DailyYieldResult` the page renders and forwards. */
export interface ClaimedYield {
  distribution: TokenDistribution;
  streakCount: number;
}

export interface ClaimDailyOutcome {
  success: boolean;
  message?: string;
  yield?: ClaimedYield;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function parseDistribution(value: unknown): TokenDistribution | undefined {
  if (!isJsonRecord(value)) return undefined;
  const spirit = finiteNumber(value.spirit);
  const essence = finiteNumber(value.essence);
  const matter = finiteNumber(value.matter);
  const substance = finiteNumber(value.substance);
  if (
    spirit === undefined ||
    essence === undefined ||
    matter === undefined ||
    substance === undefined
  ) {
    return undefined;
  }
  return { spirit, essence, matter, substance };
}

function parseClaimedYield(value: unknown): ClaimedYield | undefined {
  if (!isJsonRecord(value)) return undefined;
  const distribution = parseDistribution(value.distribution);
  const streakCount = finiteNumber(value.streakCount);
  if (distribution === undefined || streakCount === undefined) return undefined;
  return { distribution, streakCount };
}

/** `parse` for `readJson`. A non-object body parses to `{ success: false }`. */
export function parseClaimDailyResponse(value: unknown): ClaimDailyOutcome {
  if (!isJsonRecord(value)) return { success: false };
  const { success, message } = value;
  const claimed = success === true ? parseClaimedYield(value.yield) : undefined;
  return {
    success: success === true,
    ...(typeof message === "string" ? { message } : {}),
    ...(claimed !== undefined ? { yield: claimed } : {}),
  };
}

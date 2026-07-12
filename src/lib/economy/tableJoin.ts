/**
 * Ambient, server-anchored recognition for joining a table
 * (docs/plans/pr6-discovery-mobile-plan.md §6).
 *
 * Reuses the EXISTING `recommendation_acted` practice — its catalog
 * description already names "a cuisine, recipe, or table" — so no new practice
 * type and no copy changes. Recognized server-side on the first `joined`
 * transition (RSVP-joined and invite-redeem), daily-deduped + capped by the
 * practice catalog, `targetId = table:<id>`. No visible amounts; delight only.
 *
 * Fire-and-forget: never blocks or fails the join it was triggered from.
 *
 * @file src/lib/economy/tableJoin.ts
 */

import { _logger } from "@/lib/logger";

export function recognizeTableJoin(userId: string, tableId: string): void {
  void import("@/services/practiceRewardService")
    .then(({ practiceRewardService }) =>
      practiceRewardService.recognize(userId, "recommendation_acted", `table:${tableId}`),
    )
    .catch((err) => _logger.warn("recognizeTableJoin failed (non-blocking):", err));
}

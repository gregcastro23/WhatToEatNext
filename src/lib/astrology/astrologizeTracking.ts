/**
 * Best-effort `planetary_query` interaction tracking for `/api/astrologize`.
 *
 * The caller resolves the user id while the request is still in flight (see
 * `resolveTrackingUserId`); the `user_interactions` INSERT then runs inside the
 * Next.js `after()` lifecycle instead of as a detached promise that Vercel
 * freezes mid-query once the response is returned (observed 16s read timeouts).
 *
 * @file src/lib/astrology/astrologizeTracking.ts
 */

import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import type { AstrologizeResponse } from "@/lib/validation/astrologySchemas";

/** Schedule the interaction write after the response; no-op for anonymous users. */
export function scheduleAstrologyTracking(
  userId: string | null,
  data: AstrologizeResponse,
): void {
  if (!userId) return;
  runAfterResponse("astrologize.trackInteraction", async () => {
    const { recordInteraction } = await import("@/services/userInteractionsService");
    // Sun/ascendant presence is a coarse proxy for planetary interest.
    const planet = data._celestialBodies && "sun" in data._celestialBodies ? "Sun" : "Planets";
    await recordInteraction({
      userId,
      type: "planetary_query",
      payload: { planet, engagement: 1.0, source: data.source, precision: data.precision },
    });
  });
}

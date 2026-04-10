/**
 * Quest Event Reporter
 *
 * Small utility to emit quest events as best-effort side effects.
 * Keeps core routes/services decoupled from QuestService internals.
 */

import { _logger } from "@/lib/logger";

export async function reportQuestEventBestEffort(
  userId: string,
  event: string,
): Promise<void> {
  try {
    const { questService } = await import("@/services/QuestService");
    await questService.reportEvent(userId, event);
  } catch (error) {
    _logger.warn("[QuestEventReporter] Failed to report event", {
      userId,
      event,
      error,
    });
  }
}


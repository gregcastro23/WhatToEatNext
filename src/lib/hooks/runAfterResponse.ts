/**
 * Run work after the HTTP response is sent (Next.js `after()`), so a webhook
 * is acknowledged in milliseconds while slower follow-up work still happens
 * inside the same invocation. Outside a request scope (tests, scripts)
 * `after()` throws; the task then runs immediately, unawaited.
 *
 * @file src/lib/hooks/runAfterResponse.ts
 */

import { after } from "next/server";
import { _logger } from "@/lib/logger";

export function runAfterResponse(label: string, task: () => Promise<unknown>): void {
  const guarded = async (): Promise<void> => {
    try {
      await task();
    } catch (err) {
      _logger.error(`[hooks] after-response task ${label} failed:`, err);
    }
  };
  try {
    after(guarded);
  } catch {
    guarded().catch(() => undefined);
  }
}

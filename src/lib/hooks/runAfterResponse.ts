/**
 * Run work after the HTTP response is sent (Next.js `after()`), so API routes,
 * webhooks, and DB telemetry do not hold up responses or freeze mid-query once
 * Vercel suspends the invocation. Outside a request scope (unit tests, standalone
 * scripts, Hono/MCP) `after()` throws; the task then runs directly with error
 * containment so unhandled rejections never escape.
 *
 * @file src/lib/hooks/runAfterResponse.ts
 */

import { after } from "next/server";
import { _logger } from "@/lib/logger";

export function runAfterResponse(
  label: string,
  task: () => Promise<unknown> | void,
): void {
  const guarded = async (): Promise<void> => {
    try {
      await task();
    } catch (err) {
      _logger.error(`[afterResponse] task ${label} failed:`, err);
    }
  };
  try {
    after(guarded);
  } catch {
    guarded().catch(() => undefined);
  }
}

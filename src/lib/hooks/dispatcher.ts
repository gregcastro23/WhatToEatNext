/**
 * Record-then-dispatch for verified inbound events.
 *
 *   verify (in the route) → claim in webhook_events → run the handler for the
 *   event's type → mark processed / ignored / failed
 *
 * A duplicate of a finished event is acknowledged without running anything; a
 * duplicate of one still in flight gets 409 so the provider tries again later.
 * An event type with no handler is recorded as `ignored` — not an error, so
 * the provider does not retry something we deliberately do not act on. A
 * handler that throws marks the row `failed` and the route answers 500, so
 * the provider's own retry (Stripe: up to 3 days; Vercel: up to 24h)
 * redelivers it and the claim lets that retry through.
 *
 * @file src/lib/hooks/dispatcher.ts
 */

import { claimWebhookEvent, completeWebhookEvent, failWebhookEvent } from "@/lib/hooks/inbox";
import type { DispatchOutcome, HookEvent, HookHandler } from "@/lib/hooks/types";
import { _logger } from "@/lib/logger";

/** Index handlers by the one event type each owns; a duplicate registration is a bug. */
export function handlerRegistry<TData>(handlers: ReadonlyArray<HookHandler<TData>>): ReadonlyMap<string, HookHandler<TData>> {
  const map = new Map<string, HookHandler<TData>>();
  for (const handler of handlers) {
    if (map.has(handler.type)) throw new Error(`[hooks] two handlers registered for ${handler.type}`);
    map.set(handler.type, handler);
  }
  return map;
}

export async function dispatchHookEvent<TData>(
  event: HookEvent<TData>,
  registry: ReadonlyMap<string, HookHandler<TData>>,
): Promise<DispatchOutcome> {
  const claim = await claimWebhookEvent(event);
  if (claim.kind === "duplicate") {
    return {
      status: isInFlight(claim.status) ? "in_flight" : "duplicate",
      result: { previousStatus: claim.status },
      error: null,
    };
  }
  const handler = registry.get(event.type);
  if (!handler) {
    await completeWebhookEvent(claim, "ignored");
    return { status: "ignored", result: {}, error: null };
  }
  try {
    const result = await handler.handle(event);
    await completeWebhookEvent(claim, "processed", result);
    return { status: "processed", result, error: null };
  } catch (err) {
    _logger.error(`[hooks] ${event.source} ${event.type} ${event.id} failed:`, err);
    await failWebhookEvent(claim, err);
    return { status: "failed", result: {}, error: err instanceof Error ? err.message : String(err) };
  }
}

/** A duplicate whose first delivery is still running (not yet finished either way). */
export function isInFlight(previousStatus: string): boolean {
  return previousStatus === "processing";
}

/**
 * HTTP status for a dispatch outcome. Failures and in-flight duplicates are
 * non-2xx so the provider retries; everything else is acknowledged.
 *
 * In-flight duplicates return HTTP 409 with `{status: "in_flight"}` and Retry-After: 1
 * via `inFlightConflict(...)`. ASOL's delivery classifier
 * (alchm-agents-solana/lib/wten/delivery.ts:isInFlightBody) requires this marker to retry.
 */
export function httpStatusFor(outcome: DispatchOutcome): number {
  if (outcome.status === "failed") return 500;
  return outcome.status === "in_flight" ? 409 : 200;
}

/**
 * Shared types for inbound webhooks (src/lib/hooks).
 *
 * @file src/lib/hooks/types.ts
 */

/** Lower-case provider slug, stored in webhook_events.source. */
export type HookSource = "stripe" | "vercel";

/** A verified, normalised inbound event, ready to record and dispatch. */
export interface HookEvent<TData = unknown> {
  source: HookSource;
  /** The provider's own event id — the idempotency key. */
  id: string;
  type: string;
  /** What the event is about (deployment id, checkout session id), if anything. */
  subjectId: string | null;
  occurredAt: Date | null;
  /** Curated, PII-free summary persisted as webhook_events.payload. */
  summary: Record<string, unknown>;
  /** The typed provider payload handed to the handler (not persisted). */
  data: TData;
}

/**
 * The outcome of trying to take ownership of an event.
 *   claimed    → this delivery should process it (first delivery, a retry of
 *                a failure, or a re-claim of a stale lock)
 *   duplicate  → already processed, ignored, or in flight elsewhere: do nothing
 *   unrecorded → the record could not be written; process anyway (every
 *                handler is idempotent) — bookkeeping never blocks delivery
 */
export type InboxClaim =
  | { kind: "claimed"; rowId: number; attempt: number; startedAt: number }
  | { kind: "duplicate"; status: string }
  | { kind: "unrecorded"; error: string; startedAt: number };

/**
 * duplicate → already finished (processed / ignored): acknowledge, do nothing.
 * in_flight → another delivery holds a live lock. Answered non-2xx so the
 *             provider retries later: acknowledging it would tell the provider
 *             "delivered" while the in-flight attempt might still fail.
 */
export type DispatchStatus = "processed" | "ignored" | "duplicate" | "in_flight" | "failed";

export interface DispatchOutcome {
  status: DispatchStatus;
  /** Handler-returned facts recorded in webhook_events.result. */
  result: Record<string, unknown>;
  error: string | null;
}

export interface HookHandler<TData> {
  /** Event type this handler owns, e.g. "deployment.error". */
  type: string;
  handle: (event: HookEvent<TData>) => Promise<Record<string, unknown>>;
}

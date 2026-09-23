/**
 * The webhook event record (webhook_events, migration 87) — claim, complete,
 * fail. UNIQUE(source, event_id) is the idempotency guard: a redelivery of an
 * event that was already processed is recognised and not run again, while a
 * redelivery of one that FAILED is re-claimed and retried. That second half is
 * what lets Stripe keep its own retry semantics: our 500 makes Stripe retry,
 * and the retry is allowed through.
 *
 * Bookkeeping never blocks delivery: if the record cannot be written the
 * caller gets `unrecorded` and processes anyway (every handler is idempotent).
 *
 * SQL is exported so it can be exercised against a real PostgreSQL.
 *
 * @file src/lib/hooks/inbox.ts
 */

import { executeQuery } from "@/lib/database/connection";
import type { DispatchStatus, HookEvent, InboxClaim } from "@/lib/hooks/types";
import { _logger } from "@/lib/logger";

/** A 'processing' lock older than this is presumed dead and may be re-claimed. */
export const STALE_LOCK_SECONDS = 300;
const MAX_SUMMARY_BYTES = 8_192;
const MAX_ERROR_CHARS = 1_000;

export const CLAIM_INSERT_SQL = `INSERT INTO webhook_events (source, event_id, event_type, subject_id, occurred_at, payload)
VALUES ($1, $2, $3, $4, $5, $6::jsonb)
ON CONFLICT (source, event_id) DO NOTHING
RETURNING id, attempts`;

export const CLAIM_RETRY_SQL = `UPDATE webhook_events
   SET status = 'processing', attempts = attempts + 1, locked_at = NOW(), last_received_at = NOW()
 WHERE source = $1 AND event_id = $2
   AND (status = 'failed'
        OR (status = 'processing' AND locked_at < NOW() - make_interval(secs => $3::int)))
RETURNING id, attempts`;

export const MARK_DUPLICATE_SQL = `UPDATE webhook_events
   SET duplicates = duplicates + 1, last_received_at = NOW()
 WHERE source = $1 AND event_id = $2
RETURNING status`;

export const COMPLETE_SQL = `UPDATE webhook_events
   SET status = $2, processed_at = NOW(), locked_at = NULL, latency_ms = $3, result = $4::jsonb
 WHERE id = $1`;

export const FAIL_SQL = `UPDATE webhook_events
   SET status = 'failed', locked_at = NULL, latency_ms = $2, last_error = $3
 WHERE id = $1`;

interface ClaimRow {
  id: string | number;
  attempts: number;
}

/** The summary as stored: capped so one oversized event cannot bloat the table. */
export function boundedSummary(summary: Record<string, unknown>): string {
  const json = JSON.stringify(summary);
  return json.length <= MAX_SUMMARY_BYTES ? json : JSON.stringify({ truncated: true, bytes: json.length });
}

function errorText(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, MAX_ERROR_CHARS);
}

async function tryInsert(event: HookEvent): Promise<ClaimRow | undefined> {
  const res = await executeQuery<ClaimRow & Record<string, unknown>>(CLAIM_INSERT_SQL, [
    event.source,
    event.id,
    event.type,
    event.subjectId,
    event.occurredAt && !Number.isNaN(event.occurredAt.getTime()) ? event.occurredAt.toISOString() : null,
    boundedSummary(event.summary),
  ]);
  return res.rows[0];
}

async function tryReclaim(event: HookEvent): Promise<ClaimRow | undefined> {
  const res = await executeQuery<ClaimRow & Record<string, unknown>>(CLAIM_RETRY_SQL, [
    event.source,
    event.id,
    STALE_LOCK_SECONDS,
  ]);
  return res.rows[0];
}

/** Take ownership of an event, or learn that it is a duplicate. Never throws. */
export async function claimWebhookEvent(event: HookEvent): Promise<InboxClaim> {
  const startedAt = Date.now();
  try {
    const row = (await tryInsert(event)) ?? (await tryReclaim(event));
    if (row) return { kind: "claimed", rowId: Number(row.id), attempt: row.attempts, startedAt };
    const dup = await executeQuery<{ status: string }>(MARK_DUPLICATE_SQL, [event.source, event.id]);
    const [existing] = dup.rows;
    // No row after a conflict means the record vanished between statements.
    // Never treat an unverifiable duplicate as done: process it, unrecorded.
    if (!existing) return { kind: "unrecorded", error: "event row missing after conflict", startedAt };
    return { kind: "duplicate", status: existing.status };
  } catch (err) {
    _logger.error(`[hooks] could not record ${event.source}:${event.id} (${event.type}) — processing unrecorded:`, err);
    return { kind: "unrecorded", error: errorText(err), startedAt };
  }
}

/** Mark a claimed event finished. Never throws. */
export async function completeWebhookEvent(
  claim: InboxClaim,
  status: Extract<DispatchStatus, "processed" | "ignored">,
  result: Record<string, unknown> = {},
): Promise<void> {
  if (claim.kind !== "claimed") return;
  try {
    await executeQuery(COMPLETE_SQL, [claim.rowId, status, Date.now() - claim.startedAt, boundedSummary(result)]);
  } catch (err) {
    _logger.error(`[hooks] could not mark event row ${claim.rowId} ${status}:`, err);
  }
}

/** Mark a claimed event failed so a redelivery may retry it. Never throws. */
export async function failWebhookEvent(claim: InboxClaim, error: unknown): Promise<void> {
  if (claim.kind !== "claimed") return;
  try {
    await executeQuery(FAIL_SQL, [claim.rowId, Date.now() - claim.startedAt, errorText(error)]);
  } catch (err) {
    _logger.error(`[hooks] could not mark event row ${claim.rowId} failed:`, err);
  }
}

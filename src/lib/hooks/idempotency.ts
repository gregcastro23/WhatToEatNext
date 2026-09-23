/**
 * Inbound webhook / API idempotency handling backed by `webhook_events`.
 *
 * @file src/lib/hooks/idempotency.ts
 */

import { createHash } from "node:crypto";
import { executeQuery } from "@/lib/database/connection";
import { isInFlight } from "@/lib/hooks/dispatcher";
import {
  claimWebhookEvent,
  completeWebhookEvent,
  failWebhookEvent,
} from "@/lib/hooks/inbox";
import type { HookEvent, HookSource, InboxClaim } from "@/lib/hooks/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface InboundDeliveryContext {
  webhookId: string | null;
  idempotencyKey: string | null;
  effectiveKey: string | null;
  keyMismatch: boolean;
  signatureSummary: string;
}

/** Extract an idempotency key from request headers or the parsed JSON body. */
export function extractIdempotencyKey(
  req: Request | { headers: Headers | { get(name: string): string | null } },
  rawBody?: unknown,
): string | null {
  const headerKey =
    req.headers.get("Idempotency-Key") ?? req.headers.get("idempotency-key");
  if (headerKey && headerKey.trim().length > 0) {
    return headerKey.trim();
  }
  if (isRecord(rawBody)) {
    const candidate = rawBody.idempotencyKey;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

/** Resolve delivery identifiers and signature summary for inbound delivery tracking. */
export function resolveInboundDeliveryContext(
  headers: Headers | { get(name: string): string | null },
  rawBody: unknown,
  verification: { valid: boolean; reason?: string },
): InboundDeliveryContext {
  const rawWebhookId = headers.get("webhook-id")?.trim();
  const webhookId = rawWebhookId && rawWebhookId.length > 0 ? rawWebhookId : null;
  const idempotencyKey = extractIdempotencyKey({ headers }, rawBody);
  const keyMismatch = Boolean(webhookId && idempotencyKey && webhookId !== idempotencyKey);
  const effectiveKey = webhookId ?? idempotencyKey;
  const signatureSummary = verification.valid ? "valid" : (verification.reason ?? "unknown");

  return {
    webhookId,
    idempotencyKey,
    effectiveKey,
    keyMismatch,
    signatureSummary,
  };
}

/** Construct standard webhook summary payload with signature and keyMismatch metadata. */
export function buildDeliverySummary(
  baseSummary: Record<string, unknown>,
  delivery: InboundDeliveryContext,
): Record<string, unknown> {
  return {
    ...baseSummary,
    signature: delivery.signatureSummary,
    ...(delivery.keyMismatch
      ? {
          keyMismatch: true,
          webhookId: delivery.webhookId,
          idempotencyKey: delivery.idempotencyKey,
        }
      : {}),
  };
}

/** Ensure an event id fits within webhook_events.event_id VARCHAR(255). */
export function normalizeEventId(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 255) return trimmed;
  const hash = createHash("sha256").update(trimmed).digest("hex");
  return `sha256:${hash}`;
}

/** Retrieve the previously persisted result from webhook_events for a finished duplicate. */
export async function fetchStoredResult(
  source: HookSource,
  eventId: string,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await executeQuery<{ result: unknown }>(
      `SELECT result FROM webhook_events WHERE source = $1 AND event_id = $2 LIMIT 1`,
      [source, eventId],
    );
    const [row] = res.rows;
    if (row && isRecord(row.result)) {
      return row.result;
    }
    return null;
  } catch {
    return null;
  }
}

export interface ClaimOutcome {
  claimed: boolean;
  claim: InboxClaim | null;
  normalizedId: string | null;
  isDuplicate: boolean;
  isInFlight: boolean;
  previousResult: Record<string, unknown> | null;
}

/**
 * Attempt to claim an inbound event by its idempotency key.
 * If no key is provided, returns claimed: true with claim: null (non-idempotent pass-through).
 */
async function handleDuplicateClaim(
  claim: Extract<InboxClaim, { kind: "duplicate" }>,
  source: HookSource,
  normalizedId: string,
): Promise<ClaimOutcome> {
  const inFlight = isInFlight(claim.status);
  const previousResult = inFlight
    ? null
    : await fetchStoredResult(source, normalizedId);
  return {
    claimed: false,
    claim,
    normalizedId,
    isDuplicate: true,
    isInFlight: inFlight,
    previousResult,
  };
}

export async function claimInboundEvent(params: {
  source: HookSource;
  key: string | null;
  eventType: string;
  subjectId?: string | null;
  summary?: Record<string, unknown>;
  data?: unknown;
}): Promise<ClaimOutcome> {
  const { source, key, eventType, subjectId, summary, data } = params;
  if (!key) {
    return {
      claimed: true,
      claim: null,
      normalizedId: null,
      isDuplicate: false,
      isInFlight: false,
      previousResult: null,
    };
  }

  const normalizedId = normalizeEventId(key);
  const event: HookEvent = {
    source,
    id: normalizedId,
    type: eventType,
    subjectId: subjectId ?? null,
    occurredAt: new Date(),
    summary: summary ?? {},
    data,
  };

  const claim = await claimWebhookEvent(event);
  if (claim.kind === "duplicate") {
    return handleDuplicateClaim(claim, source, normalizedId);
  }

  return {
    claimed: true,
    claim,
    normalizedId,
    isDuplicate: false,
    isInFlight: false,
    previousResult: null,
  };
}

export { completeWebhookEvent, failWebhookEvent };

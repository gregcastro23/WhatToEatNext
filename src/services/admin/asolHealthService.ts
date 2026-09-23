/**
 * ASOL Delivery Health Service
 *
 * Gathers delivery telemetry from `webhook_events` and `feedEmitTracker`
 * for Planetary Agents (alchm-agents-solana) inbound routes:
 *   - asol-sync-event
 *   - asol-feed
 *   - asol-agent-recipes
 *
 * @file src/services/admin/asolHealthService.ts
 */

import {
  getWebhookSignatureMode,
  getWebhookSignatureModeInfo,
  type WebhookSignatureModeInfo,
} from "@/lib/hooks/standardWebhooks";
import { feedEmitTracker, type FeedEmitStatus } from "@/services/feedEmitTracker";
import {
  ASOL_SOURCES,
  fetchAsolHealthRows,
  type EventRow,
  type SignatureTagRow,
  type SourceRow,
} from "./asolHealthQueries";

export interface SignatureBreakdown {
  valid: number;
  unsigned: number;
  failed: number;
  reasons: Record<string, number>;
}

export interface AsolSourceStats {
  source: string;
  received: number;
  processed: number;
  inFlight: number;
  liveInFlight: number;
  staleLocks: number;
  failed: number;
  duplicates: number;
  p95LatencyMs: number | null;
  signatureBreakdown: SignatureBreakdown;
}

export interface AsolDeliveryEvent {
  id: string;
  source: string;
  eventId: string;
  eventType: string;
  subjectId: string | null;
  status: string;
  attempts: number;
  duplicates: number;
  latencyMs: number | null;
  lastError: string | null;
  receivedAt: string;
}

export interface AsolHealthOverview {
  generatedAt: string;
  totalReceived: number;
  totalProcessed: number;
  totalInFlight: number;
  totalLiveInFlight: number;
  totalStaleLocks: number;
  totalFailed: number;
  totalDuplicates: number;
  overallP95LatencyMs: number | null;
  sources: AsolSourceStats[];
  recentEvents: AsolDeliveryEvent[];
  feedStatus: {
    lastEmit: FeedEmitStatus | null;
    signatureMode: string;
    signatureModeInfo: WebhookSignatureModeInfo;
    internalSecretConfigured: boolean;
    syncSecretConfigured: boolean;
    hookSecretConfigured: boolean;
  };
}

function toNumber(val: unknown, fallback = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function sanitizeError(err: string | null): string | null {
  if (!err) return null;
  const sliced = err.slice(0, 1000);
  let result = "";
  for (let i = 0; i < sliced.length; i++) {
    const code = sliced.charCodeAt(i);
    if (code >= 32 || code === 9 || code === 10 || code === 13) {
      result += sliced[i];
    }
  }
  return result;
}

function buildSignatureBreakdown(source: string, signatureRows: SignatureTagRow[]): SignatureBreakdown {
  let valid = 0;
  let unsigned = 0;
  let failed = 0;
  const reasons: Record<string, number> = {};

  for (const row of signatureRows) {
    if (row.source !== source) continue;
    const tag = row.signature_tag ?? "unsigned";
    const count = toNumber(row.count);

    if (tag === "valid") {
      valid += count;
    } else if (tag === "unsigned") {
      unsigned += count;
    } else {
      failed += count;
      reasons[tag] = (reasons[tag] ?? 0) + count;
    }
  }

  return { valid, unsigned, failed, reasons };
}

function buildSourceStats(
  sourceRows: SourceRow[],
  signatureRows: SignatureTagRow[],
): AsolSourceStats[] {
  const sourceMap = new Map<string, SourceRow>();
  for (const row of sourceRows) {
    sourceMap.set(row.source, row);
  }

  return ASOL_SOURCES.map((s) => {
    const r = sourceMap.get(s);
    return {
      source: s,
      received: toNumber(r?.received),
      processed: toNumber(r?.processed),
      inFlight: toNumber(r?.in_flight),
      liveInFlight: toNumber(r?.live_in_flight),
      staleLocks: toNumber(r?.stale_locks),
      failed: toNumber(r?.failed),
      duplicates: toNumber(r?.duplicates),
      p95LatencyMs: toNullableNumber(r?.p95_latency_ms),
      signatureBreakdown: buildSignatureBreakdown(s, signatureRows),
    };
  });
}

function buildRecentEvents(eventRows: EventRow[]): AsolDeliveryEvent[] {
  return eventRows.map((e) => ({
    id: String(e.id),
    source: e.source,
    eventId: e.event_id,
    eventType: e.event_type,
    subjectId: e.subject_id ?? null,
    status: e.status,
    attempts: e.attempts,
    duplicates: e.duplicates,
    latencyMs: e.latency_ms !== null ? Math.round(Number(e.latency_ms)) : null,
    lastError: sanitizeError(e.last_error),
    receivedAt: new Date(e.received_at).toISOString(),
  }));
}

export async function getAsolHealthOverview(options?: {
  status?: "failed" | "all";
}): Promise<AsolHealthOverview> {
  const { overall, sourceRows, signatureRows, eventRows } =
    await fetchAsolHealthRows(options?.status);

  return {
    generatedAt: new Date().toISOString(),
    totalReceived: toNumber(overall?.total_received),
    totalProcessed: toNumber(overall?.total_processed),
    totalInFlight: toNumber(overall?.total_in_flight),
    totalLiveInFlight: toNumber(overall?.total_live_in_flight),
    totalStaleLocks: toNumber(overall?.total_stale_locks),
    totalFailed: toNumber(overall?.total_failed),
    totalDuplicates: toNumber(overall?.total_duplicates),
    overallP95LatencyMs: toNullableNumber(overall?.overall_p95_latency_ms),
    sources: buildSourceStats(sourceRows, signatureRows),
    recentEvents: buildRecentEvents(eventRows),
    feedStatus: {
      lastEmit: feedEmitTracker.getLastEmit(),
      signatureMode: getWebhookSignatureMode(),
      signatureModeInfo: getWebhookSignatureModeInfo(),
      internalSecretConfigured: Boolean(process.env.INTERNAL_API_SECRET),
      syncSecretConfigured: Boolean(process.env.ALCHM_KITCHEN_SYNC_SECRET),
      hookSecretConfigured: Boolean(process.env.HOOK_SECRET_ASOL),
    },
  };
}

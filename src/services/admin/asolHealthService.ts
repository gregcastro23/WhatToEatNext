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

import { executeQuery } from "@/lib/database/connection";
import { getWebhookSignatureMode } from "@/lib/hooks/standardWebhooks";
import { feedEmitTracker, type FeedEmitStatus } from "@/services/feedEmitTracker";

export interface AsolSourceStats {
  source: string;
  received: number;
  processed: number;
  inFlight: number;
  failed: number;
  duplicates: number;
  p95LatencyMs: number | null;
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
  totalFailed: number;
  totalDuplicates: number;
  overallP95LatencyMs: number | null;
  sources: AsolSourceStats[];
  recentEvents: AsolDeliveryEvent[];
  feedStatus: {
    lastEmit: FeedEmitStatus | null;
    signatureMode: string;
    internalSecretConfigured: boolean;
    syncSecretConfigured: boolean;
  };
}

const ASOL_SOURCES = ["asol-sync-event", "asol-feed", "asol-agent-recipes"] as const;

interface OverallRow {
  total_received: number | string | null;
  total_processed: number | string | null;
  total_in_flight: number | string | null;
  total_failed: number | string | null;
  total_duplicates: number | string | null;
  overall_p95_latency_ms: number | string | null;
}

interface SourceRow {
  source: string;
  received: number | string | null;
  processed: number | string | null;
  in_flight: number | string | null;
  failed: number | string | null;
  duplicates: number | string | null;
  p95_latency_ms: number | string | null;
}

interface EventRow {
  id: string | number;
  source: string;
  event_id: string;
  event_type: string;
  subject_id: string | null;
  status: string;
  attempts: number;
  duplicates: number;
  latency_ms: number | null;
  last_error: string | null;
  received_at: string | Date;
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

function buildSourceStats(sourceRows: SourceRow[]): AsolSourceStats[] {
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
      failed: toNumber(r?.failed),
      duplicates: toNumber(r?.duplicates),
      p95LatencyMs: toNullableNumber(r?.p95_latency_ms),
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
    lastError: e.last_error ?? null,
    receivedAt: new Date(e.received_at).toISOString(),
  }));
}

const OVERALL_HEALTH_QUERY = `SELECT
  COUNT(*)::int AS total_received,
  COUNT(*) FILTER (WHERE status = 'processed')::int AS total_processed,
  COUNT(*) FILTER (WHERE status = 'processing')::int AS total_in_flight,
  COUNT(*) FILTER (WHERE status = 'failed')::int AS total_failed,
  COALESCE(SUM(duplicates), 0)::int AS total_duplicates,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS overall_p95_latency_ms
FROM webhook_events
WHERE source = ANY($1::text[])`;

const SOURCE_HEALTH_QUERY = `SELECT
  source,
  COUNT(*)::int AS received,
  COUNT(*) FILTER (WHERE status = 'processed')::int AS processed,
  COUNT(*) FILTER (WHERE status = 'processing')::int AS in_flight,
  COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
  COALESCE(SUM(duplicates), 0)::int AS duplicates,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency_ms
FROM webhook_events
WHERE source = ANY($1::text[])
GROUP BY source`;

const RECENT_EVENTS_QUERY = `SELECT
  id,
  source,
  event_id,
  event_type,
  subject_id,
  status,
  attempts,
  duplicates,
  latency_ms,
  last_error,
  received_at
FROM webhook_events
WHERE source = ANY($1::text[])
ORDER BY received_at DESC
LIMIT 25`;

async function fetchAsolHealthRows(): Promise<{
  overall: OverallRow | null;
  sourceRows: SourceRow[];
  eventRows: EventRow[];
}> {
  const sourcesParam = [[...ASOL_SOURCES]];
  const [overallRes, sourceRes, recentRes] = await Promise.all([
    executeQuery<OverallRow>(OVERALL_HEALTH_QUERY, sourcesParam),
    executeQuery<SourceRow>(SOURCE_HEALTH_QUERY, sourcesParam),
    executeQuery<EventRow>(RECENT_EVENTS_QUERY, sourcesParam),
  ]);

  return {
    overall: overallRes.rows[0] ?? null,
    sourceRows: sourceRes.rows,
    eventRows: recentRes.rows,
  };
}

export async function getAsolHealthOverview(): Promise<AsolHealthOverview> {
  const { overall, sourceRows, eventRows } = await fetchAsolHealthRows();

  return {
    generatedAt: new Date().toISOString(),
    totalReceived: toNumber(overall?.total_received),
    totalProcessed: toNumber(overall?.total_processed),
    totalInFlight: toNumber(overall?.total_in_flight),
    totalFailed: toNumber(overall?.total_failed),
    totalDuplicates: toNumber(overall?.total_duplicates),
    overallP95LatencyMs: toNullableNumber(overall?.overall_p95_latency_ms),
    sources: buildSourceStats(sourceRows),
    recentEvents: buildRecentEvents(eventRows),
    feedStatus: {
      lastEmit: feedEmitTracker.getLastEmit(),
      signatureMode: getWebhookSignatureMode(),
      internalSecretConfigured: Boolean(process.env.INTERNAL_API_SECRET),
      syncSecretConfigured: Boolean(process.env.ALCHM_KITCHEN_SYNC_SECRET),
    },
  };
}

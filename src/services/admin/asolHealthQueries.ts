/**
 * SQL queries and database execution for ASOL delivery telemetry.
 *
 * @file src/services/admin/asolHealthQueries.ts
 */

import { executeQuery } from "@/lib/database/connection";

export const ASOL_SOURCES = [
  "asol-sync-event",
  "asol-feed",
  "asol-agent-recipes",
] as const;

export interface OverallRow {
  total_received: number | string | null;
  total_processed: number | string | null;
  total_in_flight: number | string | null;
  total_live_in_flight: number | string | null;
  total_stale_locks: number | string | null;
  total_failed: number | string | null;
  total_duplicates: number | string | null;
  overall_p95_latency_ms: number | string | null;
}

export interface SourceRow {
  source: string;
  received: number | string | null;
  processed: number | string | null;
  in_flight: number | string | null;
  live_in_flight: number | string | null;
  stale_locks: number | string | null;
  failed: number | string | null;
  duplicates: number | string | null;
  p95_latency_ms: number | string | null;
}

export interface SignatureTagRow {
  source: string;
  signature_tag: string | null;
  count: number | string;
}

export interface EventRow {
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

export const OVERALL_HEALTH_24H_QUERY = `SELECT
  COUNT(*)::int AS total_received,
  COUNT(*) FILTER (WHERE status = 'processed')::int AS total_processed,
  COUNT(*) FILTER (WHERE status = 'processing')::int AS total_in_flight,
  COUNT(*) FILTER (WHERE status = 'processing' AND (locked_at IS NULL OR locked_at >= NOW() - INTERVAL '300 seconds'))::int AS total_live_in_flight,
  COUNT(*) FILTER (WHERE status = 'processing' AND locked_at < NOW() - INTERVAL '300 seconds')::int AS total_stale_locks,
  COUNT(*) FILTER (WHERE status = 'failed')::int AS total_failed,
  COALESCE(SUM(duplicates), 0)::int AS total_duplicates,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS overall_p95_latency_ms
FROM webhook_events
WHERE source = ANY($1::text[])
  AND received_at > NOW() - INTERVAL '24 hours'`;

export const SOURCE_HEALTH_24H_QUERY = `SELECT
  source,
  COUNT(*)::int AS received,
  COUNT(*) FILTER (WHERE status = 'processed')::int AS processed,
  COUNT(*) FILTER (WHERE status = 'processing')::int AS in_flight,
  COUNT(*) FILTER (WHERE status = 'processing' AND (locked_at IS NULL OR locked_at >= NOW() - INTERVAL '300 seconds'))::int AS live_in_flight,
  COUNT(*) FILTER (WHERE status = 'processing' AND locked_at < NOW() - INTERVAL '300 seconds')::int AS stale_locks,
  COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
  COALESCE(SUM(duplicates), 0)::int AS duplicates,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency_ms
FROM webhook_events
WHERE source = ANY($1::text[])
  AND received_at > NOW() - INTERVAL '24 hours'
GROUP BY source`;

export const SIGNATURE_BREAKDOWN_QUERY = `SELECT
  source,
  COALESCE(payload->>'signature', 'untracked') AS signature_tag,
  COUNT(*)::int AS count
FROM webhook_events
WHERE source = ANY($1::text[])
  AND received_at > NOW() - INTERVAL '24 hours'
GROUP BY source, signature_tag`;

export const RECENT_EVENTS_QUERY = `SELECT
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
  AND ($2::text IS NULL OR status = $2)
ORDER BY received_at DESC
LIMIT 25`;

export async function fetchAsolHealthRows(filterStatus?: "failed" | "all"): Promise<{
  overall: OverallRow | null;
  sourceRows: SourceRow[];
  signatureRows: SignatureTagRow[];
  eventRows: EventRow[];
}> {
  const sourcesParam = [[...ASOL_SOURCES]];
  const statusParam = filterStatus === "failed" ? "failed" : null;

  const [overallRes, sourceRes, sigRes, recentRes] = await Promise.all([
    executeQuery<OverallRow>(OVERALL_HEALTH_24H_QUERY, sourcesParam),
    executeQuery<SourceRow>(SOURCE_HEALTH_24H_QUERY, sourcesParam),
    executeQuery<SignatureTagRow>(SIGNATURE_BREAKDOWN_QUERY, sourcesParam),
    executeQuery<EventRow>(RECENT_EVENTS_QUERY, [sourcesParam[0], statusParam]),
  ]);

  return {
    overall: overallRes.rows[0] ?? null,
    sourceRows: sourceRes.rows,
    signatureRows: sigRes.rows,
    eventRows: recentRes.rows,
  };
}

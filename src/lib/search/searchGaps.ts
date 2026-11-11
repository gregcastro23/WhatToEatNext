/**
 * Omnibar Phase 7 — Zero-Result Search Gap Capture & Admin Analytics.
 *
 * Logs anonymous, PII-scrubbed, normalized zero-result queries (one row per
 * distinct normalized query with a counter) so content authors can see what
 * recipes, ingredients, or techniques users search for that return 0 hits.
 */
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  clearResolvedGapMappingsInMemory,
  getCachedResolvedGapMappings,
  setResolvedGapMappingInMemory,
} from "./gapResolutionMap";

export { getCachedResolvedGapMappings, setResolvedGapMappingInMemory };

export const SEARCH_GAP_MIN_NORMALIZED_LENGTH = 3;
export const SEARCH_GAP_MAX_NORMALIZED_LENGTH = 64;
export const SEARCH_GAP_MAX_SAMPLE_LENGTH = 120;
export const SEARCH_GAP_DEBOUNCE_MS = 10_000;
export const SEARCH_GAP_MAX_TABLE_ROWS = 5_000;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/g;
const LONG_NUMERIC_RE = /\b\d{4,}\b/g;
const COMBINING_MARKS_RE = /[\u0300-\u036f]/g;
const CONTROL_CHARS_RE = /\p{Cc}+/gu;

const recentQueryTimestamps = new Map<string, number>();
let resolvedGapCacheLoadedAtMs = 0;
export const RESOLVED_GAP_CACHE_TTL_MS = 60_000;

export const SearchGapRowSchema = z.object({
  id: z.string(),
  normalizedQuery: z.string(),
  sampleRawQuery: z.string(),
  hitCount: z.number().int().nonnegative(),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
  topFilters: z.array(z.string()),
  resolvedAt: z.string().nullable(),
  resolvedEntitySlug: z.string().nullable(),
});

export type SearchGapRow = z.infer<typeof SearchGapRowSchema>;

export const SearchGapSummarySchema = z.object({
  success: z.literal(true),
  generatedAt: z.string(),
  totals: z.object({
    unresolvedQueries: z.number().int().nonnegative(),
    unresolvedHits: z.number().int().nonnegative(),
    resolvedQueries: z.number().int().nonnegative(),
  }),
  gaps: z.array(SearchGapRowSchema),
});

export type SearchGapSummary = z.infer<typeof SearchGapSummarySchema>;

/** Strip emails, phone numbers, and 4+ digit numeric tokens for privacy. */
export function scrubSearchQueryPii(raw: string): string {
  return raw.replace(CONTROL_CHARS_RE, " ").replace(EMAIL_RE, " ").replace(PHONE_RE, " ").replace(LONG_NUMERIC_RE, " ").replace(/\s+/g, " ").trim();
}

export interface NormalizedGapQuery {
  normalizedQuery: string;
  sampleRawQuery: string;
}

/**
 * Normalize a raw search string for zero-result gap capture.
 * Returns null when the scrubbed query is shorter than 3 chars or has no letters.
 */
export function normalizeZeroResultQuery(raw: string): NormalizedGapQuery | null {
  if (typeof raw !== "string" || raw.trim().length < SEARCH_GAP_MIN_NORMALIZED_LENGTH) return null;
  const scrubbed = scrubSearchQueryPii(raw);
  if (scrubbed.length < SEARCH_GAP_MIN_NORMALIZED_LENGTH) return null;
  const normalizedQuery = scrubbed.normalize("NFD").replace(COMBINING_MARKS_RE, "").toLowerCase().replace(/\s+/g, " ").trim().slice(0, SEARCH_GAP_MAX_NORMALIZED_LENGTH).trim();
  if (normalizedQuery.length < SEARCH_GAP_MIN_NORMALIZED_LENGTH || !/[a-z]/i.test(normalizedQuery)) return null;
  return { normalizedQuery, sampleRawQuery: scrubbed.slice(0, SEARCH_GAP_MAX_SAMPLE_LENGTH) };
}

export interface ZeroResultCheckInput {
  hero: unknown;
  recipesContainingTotal: number;
  coverage: { total: number } | null;
  total: Record<string, number>;
}

/** True when a search result has zero matches across every entity kind, hero, and coverage. */
export function isZeroResultSearch(result: ZeroResultCheckInput): boolean {
  if (result.hero !== null && result.hero !== undefined) return false;
  if (result.recipesContainingTotal > 0 || (result.coverage?.total ?? 0) > 0) return false;
  return Object.values(result.total).reduce((acc, count) => acc + count, 0) === 0;
}

function shouldDebounceQuery(normalizedQuery: string, nowMs: number): boolean {
  const previous = recentQueryTimestamps.get(normalizedQuery);
  if (previous !== undefined && nowMs - previous < SEARCH_GAP_DEBOUNCE_MS) return true;
  if (recentQueryTimestamps.size >= 500) {
    const oldestKey = recentQueryTimestamps.keys().next().value;
    if (oldestKey !== undefined) recentQueryTimestamps.delete(oldestKey);
  }
  recentQueryTimestamps.set(normalizedQuery, nowMs);
  return false;
}

export function resetSearchGapDebounceForTests(): void {
  recentQueryTimestamps.clear();
  clearResolvedGapMappingsInMemory();
  resolvedGapCacheLoadedAtMs = 0;
}

/** Load resolved `normalized_query -> resolved_entity_slug` mappings from PostgreSQL with 60s TTL cache. */
export async function loadResolvedSearchGapMappings(options?: { forceRefresh?: boolean; nowMs?: number }): Promise<ReadonlyMap<string, string>> {
  const nowMs = options?.nowMs ?? Date.now();
  if (!options?.forceRefresh && resolvedGapCacheLoadedAtMs > 0 && nowMs - resolvedGapCacheLoadedAtMs < RESOLVED_GAP_CACHE_TTL_MS) {
    return getCachedResolvedGapMappings();
  }
  try {
    const res = await executeQuery<{ normalized_query: string; resolved_entity_slug: string }>(
      `SELECT normalized_query, resolved_entity_slug FROM search_zero_result_gaps
       WHERE resolved_at IS NOT NULL AND resolved_entity_slug IS NOT NULL ORDER BY last_seen_at DESC LIMIT 500`,
    );
    clearResolvedGapMappingsInMemory();
    for (const r of res.rows) {
      if (r.normalized_query && r.resolved_entity_slug) {
        setResolvedGapMappingInMemory(r.normalized_query, r.resolved_entity_slug);
      }
    }
    resolvedGapCacheLoadedAtMs = nowMs;
  } catch (err) {
    _logger.warn("[search-gaps] failed to refresh resolved gap mappings:", err);
  }
  return getCachedResolvedGapMappings();
}

export interface RecordGapOptions {
  forceImmediate?: boolean;
  nowMs?: number;
}

/** Upsert a zero-result query into `search_zero_result_gaps`. */
export async function recordZeroResultSearchGap(
  rawQuery: string,
  filters: readonly string[] = [],
  options: RecordGapOptions = {},
): Promise<boolean> {
  const normalized = normalizeZeroResultQuery(rawQuery);
  if (!normalized) return false;
  const nowMs = options.nowMs ?? Date.now();
  if (!options.forceImmediate && shouldDebounceQuery(normalized.normalizedQuery, nowMs)) {
    return false;
  }
  const cleanFilters = Array.from(
    new Set(filters.map((f) => f.trim().slice(0, 48)).filter((f) => f.length > 0)),
  ).slice(0, 8);
  await executeQuery(
    `INSERT INTO search_zero_result_gaps (
       normalized_query, sample_raw_query, hit_count, first_seen_at, last_seen_at, top_filters
     )
     VALUES ($1, $2, 1, NOW(), NOW(), $3::jsonb)
     ON CONFLICT (normalized_query) DO UPDATE SET
       hit_count = search_zero_result_gaps.hit_count + 1,
       last_seen_at = NOW(),
       sample_raw_query = EXCLUDED.sample_raw_query,
       top_filters = CASE
         WHEN jsonb_array_length($3::jsonb) > 0 THEN $3::jsonb
         ELSE search_zero_result_gaps.top_filters
       END`,
    [normalized.normalizedQuery, normalized.sampleRawQuery, JSON.stringify(cleanFilters)],
  );
  return true;
}

/** Non-blocking fire-and-forget helper wired into GET /api/search and /search. */
export function scheduleZeroResultSearchGap(
  rawQuery: string,
  chips: ReadonlyArray<{ kind: string; label: string; applied?: boolean }> = [],
): void {
  const filters = chips
    .filter((chip) => chip.applied !== false)
    .map((chip) => `${chip.kind}:${chip.label}`);
  recordZeroResultSearchGap(rawQuery, filters).catch((err: unknown) => {
    _logger.warn("[search-gaps] non-blocking zero-result capture failed:", err);
  });
}

interface DbGapRow {
  id: string;
  normalized_query: string;
  sample_raw_query: string;
  hit_count: number | string;
  first_seen_at: Date | string;
  last_seen_at: Date | string;
  top_filters: unknown;
  resolved_at: Date | string | null;
  resolved_entity_slug: string | null;
}

function toIsoString(val: Date | string): string {
  return val instanceof Date ? val.toISOString() : new Date(val).toISOString();
}

function mapDbGapRow(row: DbGapRow): SearchGapRow {
  const parsedFilters = z.array(z.string()).safeParse(row.top_filters);
  if (row.resolved_at && row.resolved_entity_slug) {
    setResolvedGapMappingInMemory(row.normalized_query, row.resolved_entity_slug);
  }
  return {
    id: row.id,
    normalizedQuery: row.normalized_query,
    sampleRawQuery: row.sample_raw_query,
    hitCount: Number(row.hit_count),
    firstSeenAt: toIsoString(row.first_seen_at),
    lastSeenAt: toIsoString(row.last_seen_at),
    topFilters: parsedFilters.success ? parsedFilters.data : [],
    resolvedAt: row.resolved_at ? toIsoString(row.resolved_at) : null,
    resolvedEntitySlug: row.resolved_entity_slug ?? null,
  };
}

/** List top unfulfilled search queries for the Admin console. */
export async function listZeroResultSearchGaps(
  options: { limit?: number; includeResolved?: boolean } = {},
): Promise<SearchGapSummary> {
  const safeLimit = Math.max(1, Math.min(options.limit ?? 30, 100));
  const includeResolved = options.includeResolved ?? false;
  const [rowsResult, totalsResult] = await Promise.all([
    executeQuery<DbGapRow>(
      `SELECT id, normalized_query, sample_raw_query, hit_count, first_seen_at,
              last_seen_at, top_filters, resolved_at, resolved_entity_slug
       FROM search_zero_result_gaps
       WHERE ($1::boolean = true OR resolved_at IS NULL)
       ORDER BY (resolved_at IS NOT NULL) ASC, hit_count DESC, last_seen_at DESC
       LIMIT $2`,
      [includeResolved, safeLimit],
    ),
    executeQuery<{ unresolved_queries: string; unresolved_hits: string; resolved_queries: string }>(
      `SELECT COUNT(*) FILTER (WHERE resolved_at IS NULL)::text AS unresolved_queries,
              COALESCE(SUM(hit_count) FILTER (WHERE resolved_at IS NULL), 0)::text AS unresolved_hits,
              COUNT(*) FILTER (WHERE resolved_at IS NOT NULL)::text AS resolved_queries
       FROM search_zero_result_gaps`,
    ),
  ]);
  const [totRow] = totalsResult.rows;
  return {
    success: true,
    generatedAt: new Date().toISOString(),
    totals: {
      unresolvedQueries: Number(totRow?.unresolved_queries ?? 0),
      unresolvedHits: Number(totRow?.unresolved_hits ?? 0),
      resolvedQueries: Number(totRow?.resolved_queries ?? 0),
    },
    gaps: rowsResult.rows.map(mapDbGapRow),
  };
}

/** Mark a zero-result gap as resolved by a catalog slug (or reopen when slug is null). */
export async function resolveZeroResultSearchGap(
  normalizedQuery: string,
  resolvedEntitySlug: string | null,
): Promise<boolean> {
  const cleanKey = normalizedQuery.trim().toLowerCase();
  if (!cleanKey) return false;
  const trimmedSlug = resolvedEntitySlug?.trim();
  const cleanSlug = trimmedSlug && trimmedSlug.length > 0 ? trimmedSlug : null;
  const result = await executeQuery<{ id: string }>(
    `UPDATE search_zero_result_gaps
     SET resolved_at = CASE WHEN $2::text IS NULL THEN NULL ELSE NOW() END,
         resolved_entity_slug = $2
     WHERE normalized_query = $1
     RETURNING id`,
    [cleanKey, cleanSlug],
  );
  if (result.rows.length > 0) {
    setResolvedGapMappingInMemory(cleanKey, cleanSlug);
    return true;
  }
  return false;
}

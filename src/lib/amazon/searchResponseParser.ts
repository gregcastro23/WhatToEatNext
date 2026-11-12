/**
 * Wire parser for `POST /api/amazon/search` (the batch resolve) as its two
 * client callers read it: `GroceryCartContext` (ingredient + asin) and
 * `GroceryListModal` (also searchUrl / source / reason / configured).
 *
 * Producer: `src/app/api/amazon/search/route.ts`.
 *   - `buildBatchResponse` (route.ts:417-435) answers `{ results, configured:
 *     { paapi, creators } }`, and `configured` is always set (route.ts:422-425).
 *   - Every row sets `ingredient`, `asin` (a `string | null`, never omitted),
 *     `searchUrl` and `source` (route.ts:164-190, 223-236, 317-331, 343-414).
 *     `reason` is the only optional field: an `undefined` that JSON drops
 *     (route.ts:184-189, 359, 396).
 *   - The `{ error }` refusals (route.ts:445, 466, 471, 486) and the
 *     all-rate-limited 503 (route.ts:428-433) are non-2xx. Both callers return
 *     or throw on `!res.ok` / 429 / 503 before they parse, so they never reach
 *     this parser.
 *
 * Failure contract (inside each caller's existing try/catch):
 *   - a body that is not a JSON object, a missing or non-array `results`, or
 *     missing / mistyped `configured` flags THROWS, so the caller takes its
 *     existing failure path instead of reading drift as "nothing resolved";
 *   - a row that does not match the producer's row shape is dropped, but if rows
 *     arrived and NONE matched, that throws as well;
 *   - `source` stays a plain string: callers only forward it, and the route's
 *     `AmazonSearchSource` union is not re-listed here (a copy would go stale).
 *
 * Client-safe: imports only `@/lib/api/json`.
 *
 * @file src/lib/amazon/searchResponseParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

export interface AmazonSearchRow {
  ingredient: string;
  /** `null` when the catalog had no confident match; the key is never omitted. */
  asin: string | null;
  searchUrl: string;
  source: string;
  reason?: string;
}

export interface AmazonConfiguredFlags {
  paapi: boolean;
  creators: boolean;
}

export interface AmazonSearchResponse {
  results: AmazonSearchRow[];
  configured: AmazonConfiguredFlags;
}

/** A row in the producer's shape, or `undefined` when any field has the wrong type. */
function parseRow(value: unknown): AmazonSearchRow | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { ingredient, asin, searchUrl, source, reason } = value;
  if (typeof ingredient !== "string") return undefined;
  if (asin !== null && typeof asin !== "string") return undefined;
  if (typeof searchUrl !== "string" || typeof source !== "string") return undefined;
  if (reason !== undefined && typeof reason !== "string") return undefined;
  return {
    ingredient,
    asin,
    searchUrl,
    source,
    ...(reason !== undefined ? { reason } : {}),
  };
}

function parseConfigured(value: unknown): AmazonConfiguredFlags {
  if (isJsonRecord(value)) {
    const { paapi, creators } = value;
    if (typeof paapi === "boolean" && typeof creators === "boolean") {
      return { paapi, creators };
    }
  }
  throw new TypeError("Amazon search response had no valid configured flags");
}

function parseRows(raw: unknown): AmazonSearchRow[] {
  if (!Array.isArray(raw)) {
    throw new TypeError("Amazon search response had no results array");
  }
  const list: readonly unknown[] = raw;
  const rows: AmazonSearchRow[] = [];
  for (const item of list) {
    const row = parseRow(item);
    if (row) rows.push(row);
  }
  if (list.length > 0 && rows.length === 0) {
    throw new TypeError("No Amazon search result matched the expected shape");
  }
  return rows;
}

/**
 * `parse` for `readJson` where only the rows matter (the cart's ASIN resolve).
 * It does not read `configured`, so drift in a flag the cart never uses cannot
 * break the cart's lookup.
 */
export function parseAmazonSearchResults(value: unknown): AmazonSearchRow[] {
  if (!isJsonRecord(value)) {
    throw new TypeError("Amazon search response was not a JSON object");
  }
  return parseRows(value.results);
}

/** `parse` for `readJson`. Rows plus the `configured` flags the modal shows. */
export function parseAmazonSearchResponse(value: unknown): AmazonSearchResponse {
  if (!isJsonRecord(value)) {
    throw new TypeError("Amazon search response was not a JSON object");
  }
  return {
    results: parseRows(value.results),
    configured: parseConfigured(value.configured),
  };
}

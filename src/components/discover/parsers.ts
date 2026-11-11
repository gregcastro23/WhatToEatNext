/**
 * Wire parsers for the Discover surface. The hooks used to cast
 * `(await res.json()) as DiscoverTablesApiResponse`; these check the same shape
 * against what /api/discover/tables and /api/discover/people really send
 * (see `discoveryService.ts`), without importing that server module.
 *
 * Failure contract (mirrors the old cast + the hooks' own try/catch):
 *   - a body that is not a JSON object, or a `tables` / `people` value that is
 *     present but not an array, THROWS — the hook's existing `catch` turns that
 *     into its "Failed to load …" error state;
 *   - a single card that does not match the wire shape is dropped, so one bad
 *     row can no longer crash the list during render;
 *   - envelope fields (`success`, `message`, `nextCursor`) of the wrong type are
 *     treated as absent, exactly as if the server had omitted them.
 *
 * @file src/components/discover/parsers.ts
 */

import { isJsonRecord, parseJsonRecord } from "@/lib/api/json";
import type { DiscoverPersonCard, DiscoverTableCard } from "./types";

export interface DiscoverTablesApiResponse {
  success?: boolean;
  message?: string;
  tables?: DiscoverTableCard[];
  nextCursor?: string | null;
}

export interface DiscoverPeopleApiResponse {
  success?: boolean;
  message?: string;
  people?: DiscoverPersonCard[];
  nextCursor?: string | null;
}

interface Envelope {
  success?: boolean;
  message?: string;
  nextCursor?: string | null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isVenue(value: unknown): value is DiscoverTableCard["venue"] {
  if (!isJsonRecord(value)) return false;
  return typeof value.type === "string" && isOptionalString(value.name);
}

function isHost(value: unknown): value is DiscoverTableCard["host"] {
  if (!isJsonRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNullableString(value.avatarUrl) &&
    isNullableString(value.dominantElement)
  );
}

function hasTableIdentity(card: Record<string, unknown>): boolean {
  return (
    typeof card.id === "string" &&
    typeof card.title === "string" &&
    typeof card.scheduledAt === "string" &&
    typeof card.status === "string" &&
    isVenue(card.venue) &&
    isHost(card.host) &&
    (card.distanceKm === undefined || isFiniteNumber(card.distanceKm)) &&
    isOptionalString(card.photoUrl)
  );
}

function hasTableCounts(card: Record<string, unknown>): boolean {
  return (
    isFiniteNumber(card.joinedCount) &&
    isNullableNumber(card.seatCap) &&
    isNullableNumber(card.seatsLeft) &&
    isNullableNumber(card.compatibility) &&
    isNullableString(card.dominantElement)
  );
}

function isDiscoverTableCard(value: unknown): value is DiscoverTableCard {
  return isJsonRecord(value) && hasTableIdentity(value) && hasTableCounts(value);
}

function isFollowState(value: unknown): value is DiscoverPersonCard["followState"] {
  return value === null || value === "following" || value === "not_following";
}

function isDiscoverPersonCard(value: unknown): value is DiscoverPersonCard {
  if (!isJsonRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isNullableString(value.avatarUrl) &&
    isNullableString(value.bio) &&
    isNullableString(value.dominantElement) &&
    typeof value.isAgent === "boolean" &&
    isNullableNumber(value.compatibility) &&
    isFiniteNumber(value.mutualCommensals) &&
    typeof value.isCommensal === "boolean" &&
    isFollowState(value.followState)
  );
}

function parseEnvelope(body: Record<string, unknown>): Envelope {
  const { success, message, nextCursor } = body;
  return {
    ...(typeof success === "boolean" ? { success } : {}),
    ...(typeof message === "string" ? { message } : {}),
    ...(isNullableString(nextCursor) ? { nextCursor } : {}),
  };
}

/** `undefined` when absent (the hooks read it with `?? []`); throws on a non-array. */
function parseCards<T>(raw: unknown, guard: (value: unknown) => value is T): T[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) throw new TypeError("Expected an array of discover cards");
  const list: readonly unknown[] = raw;
  return list.filter(guard);
}

export function parseDiscoverTablesResponse(value: unknown): DiscoverTablesApiResponse {
  const body = parseJsonRecord(value);
  const tables = parseCards(body.tables, isDiscoverTableCard);
  return { ...parseEnvelope(body), ...(tables ? { tables } : {}) };
}

export function parseDiscoverPeopleResponse(value: unknown): DiscoverPeopleApiResponse {
  const body = parseJsonRecord(value);
  const people = parseCards(body.people, isDiscoverPersonCard);
  return { ...parseEnvelope(body), ...(people ? { people } : {}) };
}

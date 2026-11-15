/**
 * Field readers shared by the agent wire parsers (agentProfileParser.ts and
 * agentFeedParser.ts). Client-safe: the only import is `isJsonRecord`.
 *
 * One policy for all of them, the one agentVesselParser.ts sets: these blocks are
 * ANCILLARY, so a bad field never throws and never fails the page. An absent
 * optional field (`undefined`) is a normal answer and reports nothing; a PRESENT
 * field of the wrong type is dropped and REPORTED as `path: reason`. `null` counts
 * as present: none of the declared types allows it.
 */

import { isJsonRecord } from "@/lib/api/json";

/** Where a reader is working: the dotted path used in reports, and the shared report list. */
export interface Scope {
  path: string;
  issues: string[];
}

/** Parses one object-valued entry. `null` means "not valid"; the caller reports it. */
export type RecordParser<T> = (record: Record<string, unknown>, at: Scope) => T | null;

export function scopeAt(scope: Scope, key: string): Scope {
  return { path: `${scope.path}.${key}`, issues: scope.issues };
}

export function report(scope: Scope, reason: string): void {
  scope.issues.push(`${scope.path}: ${reason}`);
}

/** `Number.isFinite` matters: the JSON text `1e999` parses to Infinity. */
export function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function listOf(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null;
}

/** The optional string fields named by `keys`. A wrong type is reported and left out. */
export function pickText<K extends string>(
  record: Record<string, unknown>,
  keys: readonly K[],
  scope: Scope,
): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === "string") out[key] = raw;
    else if (raw !== undefined) report(scopeAt(scope, key), "not a string");
  }
  return out;
}

/** The optional number fields named by `keys`. A non-number or non-finite value is reported and left out. */
export function pickNumbers<K extends string>(
  record: Record<string, unknown>,
  keys: readonly K[],
  scope: Scope,
): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  for (const key of keys) {
    const raw = record[key];
    const n = finite(raw);
    if (n !== null) out[key] = n;
    else if (raw !== undefined) report(scopeAt(scope, key), "not a finite number");
  }
  return out;
}

/** An optional string array. A non-array is reported; non-string entries are dropped with ONE report. */
export function stringList(value: unknown, scope: Scope): string[] | null {
  if (value === undefined) return null;
  const entries = listOf(value);
  if (entries === null) {
    report(scope, "not an array");
    return null;
  }
  const kept = entries.filter((entry): entry is string => typeof entry === "string");
  if (kept.length < entries.length) report(scope, `${entries.length - kept.length} non-string entries dropped`);
  return kept;
}

/** The optional string-array fields named by `keys`. */
export function pickLists<K extends string>(
  record: Record<string, unknown>,
  keys: readonly K[],
  scope: Scope,
): Partial<Record<K, string[]>> {
  const out: Partial<Record<K, string[]>> = {};
  for (const key of keys) {
    const list = stringList(record[key], scopeAt(scope, key));
    if (list !== null) out[key] = list;
  }
  return out;
}

/** An optional object-valued field: absent is fine, a non-object is reported, an object goes to `parse`. */
export function section<T>(
  record: Record<string, unknown>,
  key: string,
  scope: Scope,
  parse: RecordParser<T>,
): T | null {
  const raw = record[key];
  if (raw === undefined) return null;
  const at = scopeAt(scope, key);
  if (!isJsonRecord(raw)) {
    report(at, "not an object");
    return null;
  }
  return parse(raw, at);
}

/**
 * An optional array of objects. A row that is not an object, or that `parseRow`
 * rejects, is dropped and reported ONCE by index; whatever `parseRow` noticed
 * about a dropped row is discarded with it, and kept for a row that survives.
 */
export function rowsOf<T>(value: unknown, scope: Scope, parseRow: RecordParser<T>): T[] | null {
  if (value === undefined) return null;
  const entries = listOf(value);
  if (entries === null) {
    report(scope, "not an array");
    return null;
  }
  const kept: T[] = [];
  for (const [index, entry] of entries.entries()) {
    const held: string[] = [];
    const at: Scope = { path: `${scope.path}[${index}]`, issues: held };
    const row = isJsonRecord(entry) ? parseRow(entry, at) : null;
    if (row === null) {
      report({ path: at.path, issues: scope.issues }, "not a valid row");
    } else {
      kept.push(row);
      scope.issues.push(...held);
    }
  }
  return kept;
}

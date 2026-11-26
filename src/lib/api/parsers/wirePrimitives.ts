/**
 * Pure runtime narrowing primitives for client wire parsers.
 * Zero external dependencies, zero type assertions.
 *
 * @file src/lib/api/parsers/wirePrimitives.ts
 */

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function readNumberRecord(value: unknown): Record<string, number> | undefined {
  if (!isPlainObject(value)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = v;
    }
  }
  return out;
}

export function readStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isPlainObject(value)) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "string") {
      out[k] = v;
    }
  }
  return out;
}

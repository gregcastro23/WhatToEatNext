/**
 * Validators shared by `generatedRecipeParser.ts`. Each THROWS a TypeError that
 * names the field, so the page's existing catch logs which part of the stored
 * recipe could not be read.
 */

import { isJsonRecord } from "@/lib/api/json";

/** Element name -> share. `null` is what JSON.stringify makes of a NaN; the page reads it with `?? 0`. */
export type ElementValues = Record<string, number | null>;

export function invalid(detail: string): TypeError {
  return new TypeError(`Invalid custom recipe response: ${detail}`);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!isJsonRecord(value)) throw invalid(`${field} must be an object`);
  return value;
}

export function requireText(value: unknown, field: string): string {
  if (typeof value !== "string") throw invalid(`${field} must be a string`);
  return value;
}

export function requireId(value: unknown, field: string): string | number {
  if (typeof value === "string" || isFiniteNumber(value)) return value;
  throw invalid(`${field} must be a string or a number`);
}

export function stringList(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) throw invalid(`${field} must be an array`);
  const items: readonly unknown[] = value;
  const out: string[] = [];
  for (const item of items) {
    if (typeof item !== "string") throw invalid(`${field} must hold only strings`);
    out.push(item);
  }
  return out;
}

export function optionalText(value: unknown, field: string): string | null | undefined {
  if (value === undefined || value === null) return value;
  return requireText(value, field);
}

export function optionalNumber(value: unknown, field: string): number | null | undefined {
  if (value === undefined || value === null) return value;
  if (!isFiniteNumber(value)) throw invalid(`${field} must be a finite number`);
  return value;
}

export function optionalCount(value: unknown, field: string): number | string | null | undefined {
  if (value === undefined || value === null) return value;
  if (typeof value === "string" || isFiniteNumber(value)) return value;
  throw invalid(`${field} must be a number or a string`);
}

export function elementValues(value: unknown, field: string): ElementValues {
  const entries: Array<[string, number | null]> = [];
  for (const [key, entry] of Object.entries(requireRecord(value, field))) {
    if (entry === null) {
      entries.push([key, null]);
      continue;
    }
    if (!isFiniteNumber(entry)) throw invalid(`${field}.${key} must be a finite number or null`);
    entries.push([key, entry]);
  }
  // fromEntries defines OWN properties, so even a literal "__proto__" key survives
  // (assigning out["__proto__"] would set the prototype and lose it from the saved recipe).
  return Object.fromEntries(entries);
}

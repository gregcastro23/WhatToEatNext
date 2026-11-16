/**
 * Small constructors for a value and its basis, so the ingredient files read
 * as a list of claims: `measured(6.6, "FDA_PH")`, `declared(0.25, "why")`.
 *
 * @file src/data/baking/basis.ts
 */
import type { CitationId } from "@/lib/baking/citations";
import type { Basis, BasisKind } from "@/lib/baking/types";

export interface Valued<T> {
  value: T;
  basis: Basis;
}

export function basisOf(kind: BasisKind, source: CitationId, note?: string): Basis {
  return note === undefined ? { kind, source } : { kind, source, note };
}

export function measured<T>(value: T, source: CitationId, note?: string): Valued<T> {
  return { value, basis: basisOf("MEASURED", source, note) };
}

export function derived<T>(value: T, source: CitationId, note: string): Valued<T> {
  return { value, basis: basisOf("DERIVED", source, note) };
}

export function computed<T>(value: T, source: CitationId, note: string): Valued<T> {
  return { value, basis: basisOf("COMPUTED", source, note) };
}

/** A labelled modelling choice — not a measurement. */
export function declared<T>(value: T, note: string, source: CitationId = "MODEL"): Valued<T> {
  return { value, basis: basisOf("DECLARED", source, note) };
}

/** No value is claimed. */
export function absent(note: string): Valued<null> {
  return { value: null, basis: basisOf("ABSENT", "MODEL", note) };
}

/** Zero BECAUSE there is nothing there to measure — a derived zero, not a missing value. */
export function none(note: string): Valued<number> {
  return { value: 0, basis: basisOf("DERIVED", "MODEL", note) };
}

/** pH midpoint of a published range. */
export function phRange(low: number, high: number, source: CitationId): Valued<number> {
  return derived((low + high) / 2, source, `midpoint of the listed ${low}–${high}`);
}

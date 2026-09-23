/**
 * Text primitives for the search core: one normalized form per string, a
 * light suffix stemmer, and a bounded edit distance.
 */
import { normalizeForMatch } from "@/utils/searchNormalize";

export interface NormalizedText {
  /** Diacritics folded, lowercase, single-spaced: "creme fraiche". */
  folded: string;
  /** `folded` without spaces: "cremefraiche" (so "oatmilk" meets "oat milk"). */
  compact: string;
  tokens: readonly string[];
  /** Tokens run through {@link stemToken}, space-joined. */
  stemmed: string;
}

/** Longest first, so "ation" wins over "s" and "ies" over "es". */
const SUFFIXES: readonly string[] = ["ation", "ing", "ies", "es", "ed", "s"];
const MIN_STEM = 3;

/**
 * Strip one inflectional suffix, then a trailing "e", so the forms a cook
 * types meet the forms the catalog stores: braise/braising → "brais",
 * tomatoes/tomatos/tomatoe → "tomato", cherries → "cherry". Applied to both
 * sides of a comparison, it only has to be consistent, not linguistic.
 */
export function stemToken(token: string): string {
  if (token.length <= MIN_STEM) return token;
  let stem = token;
  const suffix = SUFFIXES.find((s) => stem.endsWith(s) && stem.length - s.length >= MIN_STEM);
  if (suffix) stem = suffix === "ies" ? `${stem.slice(0, -3)}y` : stem.slice(0, -suffix.length);
  if (stem.endsWith("e") && stem.length > MIN_STEM) stem = stem.slice(0, -1);
  return stem;
}

export function normalizeText(input: string): NormalizedText {
  const folded = normalizeForMatch(input);
  const tokens = folded ? folded.split(" ") : [];
  return {
    folded,
    compact: tokens.join(""),
    tokens,
    stemmed: tokens.map(stemToken).join(" "),
  };
}

function cell(row: readonly number[], index: number): number {
  return row[index] ?? Number.POSITIVE_INFINITY;
}

/**
 * Optimal-string-alignment Damerau-Levenshtein distance (insert, delete,
 * substitute, adjacent transpose), capped: returns `max + 1` as soon as the
 * distance provably exceeds `max`.
 */
export function boundedEditDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const substitution = cell(prev, j - 1) + (a[i - 1] === b[j - 1] ? 0 : 1);
      let value = Math.min(cell(prev, j) + 1, cell(row, j - 1) + 1, substitution);
      const transposed = i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1];
      if (transposed) value = Math.min(value, cell(before, j - 2) + 1);
      row.push(value);
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
    before = prev;
    prev = row;
  }
  return Math.min(cell(prev, b.length), max + 1);
}

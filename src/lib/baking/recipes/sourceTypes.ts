/**
 * Contracts for turning a site recipe into a Baking Lab good: the recipe as
 * the catalogue stores it, and the mapping report the converter returns.
 *
 * @file src/lib/baking/recipes/sourceTypes.ts
 */
import type { BakingPreset } from "../formulaTypes";
import type { Basis } from "../types";

/** One ingredient line exactly as the served recipe states it. */
export interface SourceLine {
  name: string;
  amount: number;
  unit: string;
  notes: string | null;
  optional: boolean;
}

export type GoodCategory =
  | "bread"
  | "enriched-bread"
  | "flatbread"
  | "quick-bread"
  | "muffin"
  | "biscuit-scone"
  | "cookie"
  | "bar"
  | "cake"
  | "cracker"
  | "pastry"
  | "pie-tart";

/** A served recipe that is a baked good, as the generated catalogue stores it. */
export interface RecipeSource {
  /** The static recipe id: /recipes/<id> resolves to it. */
  id: string;
  name: string;
  cuisine: string;
  category: GoodCategory;
  /** The recipe's stated yield (servings or pieces), or null. */
  servings: number | null;
  /** The recipe's own cook-time field, minutes, or null when it states none. */
  cookMinutes: number | null;
  lines: readonly SourceLine[];
  /** The instruction steps, verbatim: oven, time and pan are read from them. */
  steps: readonly string[];
}

export interface MatchedLine {
  source: SourceLine;
  vectorId: string;
  grams: number;
  basis: Basis;
  how: string;
}

export interface UnmatchedLine {
  source: SourceLine;
  reason: string;
  /** True when this line would have formed the structure. */
  structural: boolean;
  /** What it weighs as far as anything measured says; null = unknown. */
  grams: number | null;
  /** True when `grams` is an upper bound, not a measurement. */
  bound: boolean;
}

export interface SetAsideLine {
  source: SourceLine;
  reason: string;
}

/** A value the converter had to supply because the recipe did not: always with its basis. */
export interface Assumption {
  field: string;
  value: string;
  basis: Basis;
}

/** A value read from the recipe's own words. */
export interface StatedValue {
  field: string;
  value: string;
  quote: string;
}

export type Verdict = { simulable: true } | { simulable: false; reasons: readonly string[] };

export interface MappingReport {
  matched: readonly MatchedLine[];
  unmatched: readonly UnmatchedLine[];
  setAside: readonly SetAsideLine[];
  assumptions: readonly Assumption[];
  stated: readonly StatedValue[];
  /** Unread mass ÷ (read + unread mass); null when some unread line has unknown mass. */
  unreadMassShare: number | null;
  verdict: Verdict;
  /** The recipe's own bake time range, minutes — what the simulated done time is checked against. */
  statedBakeMinutes: readonly [number, number] | null;
}

export interface ConvertedGood {
  /** The lab inputs — null when the verdict refuses the good. */
  preset: BakingPreset | null;
  report: MappingReport;
}

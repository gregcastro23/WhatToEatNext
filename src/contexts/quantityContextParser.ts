/**
 * Wire parser for one statistics quantity (`QuantityContext`): a distribution
 * summary, the current observation, a sparkline and a histogram.
 *
 * Producer contract (every path read):
 * - GET /api/alchm-quantities/statistics?all=true serialises
 *   `getAllPeriodStatistics` (`src/app/api/alchm-quantities/statistics/route.ts:59-67`).
 * - Each quantity is `build()` (`src/utils/alchemicalSampleLookup.ts:215-222`):
 *   `contextualize()` (`src/utils/statisticsCalculations.ts:153-174`, which
 *   spreads `summarize()` at `:80-125`), `downsample()` for `spark`
 *   (`alchemicalSampleLookup.ts:191-213`, at most 96 points, fewer for short
 *   windows) and `histogram()` (`statisticsCalculations.ts:188-223`).
 * - 15 numeric fields, `spark: number[]`, `hist: { edges, centers, counts, binWidth }`.
 *
 * Measured wire (real producer, 12 reference dates, JSON round tripped, 539787
 * numeric leaves): every number is finite and no field is null. On 7 of those
 * dates (2880 quantities) 1098 (38%) carry a DEGENERATE histogram, a constant
 * series giving one bin and `binWidth: 0`, not the 24 bins the type comment
 * implies. Those are valid, so nothing here may require a bin count or a
 * positive `binWidth`.
 *
 * `JSON.stringify` writes NaN and Infinity as `null`, and JSON text such as
 * `1e999` parses to Infinity, so a number that is not finite is rejected.
 *
 * This module is client safe: the server module is reached by `import type` only.
 */

import { isJsonRecord } from "@/lib/api/json";
import type { QuantityContext } from "@/utils/alchemicalSampleLookup";

type QuantityHistogram = QuantityContext["hist"];

/**
 * Reads fields into an object literal and remembers whether any was rejected.
 * The literal is what the compiler checks against the server type (a missing or
 * extra key fails `tsc`), so there is no key list to drift; a rejected read
 * returns a placeholder and the caller must discard the object via `failed()`.
 */
export interface FieldReader {
  num: (value: unknown) => number;
  nums: (value: unknown) => number[];
  str: (value: unknown) => string;
  flag: (value: unknown) => boolean;
  failed: () => boolean;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function createFieldReader(): FieldReader {
  let rejected = false;

  function num(value: unknown): number {
    if (isFiniteNumber(value)) return value;
    rejected = true;
    return 0;
  }

  function nums(value: unknown): number[] {
    if (!Array.isArray(value)) {
      rejected = true;
      return [];
    }
    const out: number[] = [];
    for (const entry of value) {
      if (!isFiniteNumber(entry)) {
        rejected = true;
        return [];
      }
      out.push(entry);
    }
    return out;
  }

  function str(value: unknown): string {
    if (typeof value === "string") return value;
    rejected = true;
    return "";
  }

  function flag(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    rejected = true;
    return false;
  }

  function failed(): boolean {
    return rejected;
  }

  return { num, nums, str, flag, failed };
}

function parseHistogram(value: unknown): QuantityHistogram | null {
  if (!isJsonRecord(value)) return null;
  const read = createFieldReader();
  const parsed: QuantityHistogram = {
    edges: read.nums(value.edges),
    centers: read.nums(value.centers),
    counts: read.nums(value.counts),
    binWidth: read.num(value.binWidth),
  };
  return read.failed() ? null : parsed;
}

/** One quantity, or null when it is not a record with every field well typed. */
export function parseQuantityContext(value: unknown): QuantityContext | null {
  if (!isJsonRecord(value)) return null;
  const hist = parseHistogram(value.hist);
  if (hist === null) return null;
  const read = createFieldReader();
  const parsed: QuantityContext = {
    count: read.num(value.count),
    mean: read.num(value.mean),
    stdDev: read.num(value.stdDev),
    variance: read.num(value.variance),
    min: read.num(value.min),
    max: read.num(value.max),
    median: read.num(value.median),
    p10: read.num(value.p10),
    p25: read.num(value.p25),
    p75: read.num(value.p75),
    p90: read.num(value.p90),
    skewness: read.num(value.skewness),
    current: read.num(value.current),
    zScore: read.num(value.zScore),
    percentileRank: read.num(value.percentileRank),
    spark: read.nums(value.spark),
    hist,
  };
  return read.failed() ? null : parsed;
}

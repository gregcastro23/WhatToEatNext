/**
 * Wire parser for `GET /api/alchm-quantities/statistics?all=true`, read by
 * `AlchemicalStatisticsContext` and handed on to the statistics panels.
 *
 * Producer contract (every return path):
 * - 200 `{ success: true, reference, file, periods }`
 *   (`src/app/api/alchm-quantities/statistics/route.ts:59-67`). `file` is
 *   `getSampleFileMeta()` (`src/utils/alchemicalSampleLookup.ts:393-402`, six
 *   keys, the context declares three). `periods` is
 *   `getAllPeriodStatistics()` (`:380-391`): ALWAYS the six keys day, week,
 *   month, quarter, year, all, each a `PeriodStatistics` (`:226-257`) or `null`
 *   when the window holds fewer than 2 samples (`:278`).
 * - 500 `{ success: false, error, details }` (`route.ts:101-111`) and the
 *   rate-limit 429 `{ error, message, retryAfter }` (`src/lib/rateLimit.ts:159-166`)
 *   are non-ok, so the host throws on `!res.ok` before this parser runs. A 200
 *   carrying `success: false` is still refused here, with the old message.
 *
 * Measured wire (one-off census, script not committed: the real producer
 * in-process, JSON round tripped, 159 reference dates = 151 spread evenly over
 * the sample file plus 8 outside it or between samples, 954 period slots):
 * - 34 slots are null (day 8, week 7, month 7, quarter 5, year 4, all 3), 920 are
 *   `PeriodStatistics`. Nothing else is null: 11,565,326 numeric leaves, all
 *   finite. The producer's memory holds no NaN, Infinity, undefined or -0, so the
 *   round trip loses nothing (159 of 159 dates). At the time of writing
 *   (2026-11-14) the sample file (it ends 2026-10-10) leaves day, week and month
 *   null; that changes whenever the file is regenerated.
 * - 33,745 of 88,320 quantities (38.2%) carry a DEGENERATE histogram: a constant
 *   series gives one bin and `binWidth: 0`, not the 24 bins the type comment
 *   implies (perPlanet rows 33,473, top-level elemental Water and Fire 272).
 *   They are valid, so nothing here may require a bin count or a positive width.
 * - Every non-null period has 10 planet rows.
 * The tests pin what they can reproduce: nulls only in empty slots (10 dates), a
 * lossless round trip (those 10 plus 41 more), one-bin histograms and the 10 planet
 * rows (one date).
 *
 * Who reads what: `useAlchemicalStatistics` and `useQuantityContext` hand every
 * descendant the whole `PeriodStatistics` and `QuantityContext` types. The two
 * in-repo readers use sampleCount, intervalHours, aNumber, esms, thermo,
 * elemental, perPlanet and, per quantity, count, mean, stdDev, min, max, current,
 * p10, p90, spark and hist; `git grep` finds no read there of period, startMs,
 * endMs, the period-level current, derived, meta, variance, median, p25, p75,
 * skewness, zScore or percentileRank. They are validated anyway: a descendant may
 * read any member of the exported types, the producer always sends them (920 of
 * 920 periods), and narrowing the exported types would reach into both panels'
 * prop types.
 *
 * Decisions, per field:
 * - `success` must be exactly true, otherwise the whole response throws.
 * - A period slot that is `null` is a legitimate empty window. A slot that is
 *   missing, mistyped, or fails any field of `PeriodStatistics` is DROPPED to
 *   null, which the UI shows exactly like an empty window (there is no issues
 *   channel and nothing is logged). Only TOTAL drift is loud: if some slot failed
 *   and none parsed, the whole response THROWS.
 * - `file` only feeds a date label and the context already allows `null`, so a
 *   malformed `file` becomes `null` and the periods are unaffected.
 * - `reference` is read by nobody and is not validated.
 *
 * Key sets: none is kept here. Every record below is an ANNOTATED literal, so
 * the compiler compares it with the server type in both directions: a key added
 * to or removed from `PeriodStatistics` (including `current` and `meta`),
 * `StatPeriod` or the three file keys fails `tsc`. The groups live in
 * `quantityGroupsParser.ts`. Client safe: the server module is reached by
 * `import type` only.
 */

import { isJsonRecord } from "@/lib/api/json";
import type {
  getSampleFileMeta,
  PeriodStatistics,
  StatPeriod,
} from "@/utils/alchemicalSampleLookup";
import { createFieldReader, parseQuantityContext } from "./quantityContextParser";
import {
  parseElementGroup,
  parseEsmsGroup,
  parsePerPlanet,
  parseThermoGroup,
} from "./quantityGroupsParser";

export type PeriodStatisticsMap = Record<StatPeriod, PeriodStatistics | null>;

/** The three file keys the context declares. `Pick` fails tsc if the server renames or drops one. */
export type StatisticsFileMeta = Pick<
  ReturnType<typeof getSampleFileMeta>,
  "generatedAt" | "intervalHours" | "count"
>;

export interface StatisticsPayload {
  periods: PeriodStatisticsMap;
  file: StatisticsFileMeta | null;
}

interface PeriodSlot {
  stats: PeriodStatistics | null;
  failed: boolean;
}

function parseDerived(value: unknown): PeriodStatistics["derived"] | null {
  if (!isJsonRecord(value)) return null;
  const aNumber = parseQuantityContext(value.aNumber);
  return aNumber === null ? null : { aNumber };
}

function parseCurrent(value: unknown): PeriodStatistics["current"] | null {
  if (!isJsonRecord(value)) return null;
  const read = createFieldReader();
  const parsed: PeriodStatistics["current"] = {
    ts: read.num(value.ts),
    isDiurnal: read.flag(value.isDiurnal),
  };
  return read.failed() ? null : parsed;
}

function parseMeta(value: unknown): PeriodStatistics["meta"] | null {
  if (!isJsonRecord(value)) return null;
  const read = createFieldReader();
  const parsed: PeriodStatistics["meta"] = {
    fileGeneratedAt: read.str(value.fileGeneratedAt),
    fileVersion: read.num(value.fileVersion),
    fileCount: read.num(value.fileCount),
  };
  return read.failed() ? null : parsed;
}

/** One period, or null unless it is the record for `expected` with every field well typed. */
export function parsePeriodStatistics(
  value: unknown,
  expected: StatPeriod,
): PeriodStatistics | null {
  if (!isJsonRecord(value) || value.period !== expected) return null;
  const esms = parseEsmsGroup(value.esms);
  const thermo = parseThermoGroup(value.thermo);
  const elemental = parseElementGroup(value.elemental);
  const aNumber = parseQuantityContext(value.aNumber);
  const derived = parseDerived(value.derived);
  const perPlanet = parsePerPlanet(value.perPlanet);
  const current = parseCurrent(value.current);
  const meta = parseMeta(value.meta);
  if (
    esms === null ||
    thermo === null ||
    elemental === null ||
    aNumber === null ||
    derived === null ||
    perPlanet === null ||
    current === null ||
    meta === null
  ) {
    return null;
  }
  const read = createFieldReader();
  const parsed: PeriodStatistics = {
    period: expected,
    startMs: read.num(value.startMs),
    endMs: read.num(value.endMs),
    sampleCount: read.num(value.sampleCount),
    intervalHours: read.num(value.intervalHours),
    current,
    esms,
    thermo,
    elemental,
    aNumber,
    derived,
    perPlanet,
    meta,
  };
  return read.failed() ? null : parsed;
}

function parseSlot(wire: unknown, expected: StatPeriod): PeriodSlot {
  if (wire === null) return { stats: null, failed: false };
  const stats = parsePeriodStatistics(wire, expected);
  return { stats, failed: stats === null };
}

function parsePeriods(value: unknown): PeriodStatisticsMap {
  if (!isJsonRecord(value)) {
    throw new Error("Invalid statistics response: expected a periods record");
  }
  const slots = {
    day: parseSlot(value.day, "day"),
    week: parseSlot(value.week, "week"),
    month: parseSlot(value.month, "month"),
    quarter: parseSlot(value.quarter, "quarter"),
    year: parseSlot(value.year, "year"),
    all: parseSlot(value.all, "all"),
  };
  const list: PeriodSlot[] = Object.values(slots);
  const failedCount = list.filter((slot) => slot.failed).length;
  if (failedCount > 0 && list.every((slot) => slot.stats === null)) {
    throw new Error(
      `Invalid statistics response: none of ${failedCount} period entries matched`,
    );
  }
  return {
    day: slots.day.stats,
    week: slots.week.stats,
    month: slots.month.stats,
    quarter: slots.quarter.stats,
    year: slots.year.stats,
    all: slots.all.stats,
  };
}

function parseFileMeta(value: unknown): StatisticsFileMeta | null {
  if (!isJsonRecord(value)) return null;
  const read = createFieldReader();
  const parsed: StatisticsFileMeta = {
    generatedAt: read.str(value.generatedAt),
    intervalHours: read.num(value.intervalHours),
    count: read.num(value.count),
  };
  return read.failed() ? null : parsed;
}

export function parseAllPeriodsResponse(value: unknown): StatisticsPayload {
  if (!isJsonRecord(value)) {
    throw new Error("Invalid statistics response: expected a JSON object");
  }
  const { success, file, periods } = value;
  if (success === false) throw new Error("API reported failure");
  if (success !== true) {
    throw new Error("Invalid statistics response: success is not true");
  }
  return { periods: parsePeriods(periods), file: parseFileMeta(file) };
}

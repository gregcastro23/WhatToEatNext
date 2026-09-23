/**
 * Cron-expression arithmetic for the schedules this app actually declares.
 *
 * Vercel runs crons in UTC with standard five-field syntax. Only the minute
 * and hour fields vary in vercel.json and the Railway registry; any expression
 * that constrains day-of-month, month, or weekday is reported as unparseable
 * (null) rather than approximated, so callers fall back to their own
 * conservative default instead of trusting a guess.
 *
 * Supported field syntax: `*`, `n`, `a-b`, `*` + `/n`, `a-b/n`, and
 * comma-separated lists of those.
 *
 * @file src/lib/cron/cronSchedule.ts
 */

export interface ParsedSchedule {
  /** Minutes of the hour the job fires on, ascending. */
  minutes: number[];
  /** UTC hours of the day the job fires on, ascending. */
  hours: number[];
}

const MINUTES_PER_DAY = 1440;

function parsePart(part: string, min: number, max: number): number[] | null {
  const [range = "", stepText] = part.split("/");
  const step = stepText === undefined ? 1 : Number(stepText);
  if (range === "" || !Number.isInteger(step) || step < 1) return null;
  let lo = min;
  let hi = max;
  if (range !== "*") {
    const [a, b] = range.split("-");
    if (a === "" || b === "") return null;
    lo = Number(a);
    hi = b === undefined ? (stepText === undefined ? lo : max) : Number(b);
  }
  if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < min || hi > max || lo > hi) return null;
  const out: number[] = [];
  for (let v = lo; v <= hi; v += step) out.push(v);
  return out;
}

function parseField(field: string, min: number, max: number): number[] | null {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const parsed = parsePart(part, min, max);
    if (!parsed) return null;
    for (const v of parsed) values.add(v);
  }
  return [...values].sort((x, y) => x - y);
}

/** Parse a five-field UTC cron expression; null for anything day-constrained or malformed. */
export function parseSchedule(expr: string): ParsedSchedule | null {
  const fields = expr.trim().split(/\s+/);
  if (fields.length !== 5) return null;
  const [minuteField = "", hourField = "", dom, month, dow] = fields;
  if (dom !== "*" || month !== "*" || dow !== "*") return null;
  const minutes = parseField(minuteField, 0, 59);
  const hours = parseField(hourField, 0, 23);
  return minutes && hours ? { minutes, hours } : null;
}

/** Every UTC minute-of-day the job fires on, ascending. */
export function fireMinutesOfDay(parsed: ParsedSchedule): number[] {
  return parsed.hours.flatMap((h) => parsed.minutes.map((m) => h * 60 + m));
}

/**
 * The longest gap between consecutive fires, wrapping midnight — the honest
 * "expected interval" for staleness, since a job firing at :02 and :17 is
 * only as punctual as its widest gap. Unparseable expressions read as daily:
 * overestimating can only delay a "late" verdict, never invent one.
 */
export function expectedIntervalMinutes(expr: string): number {
  const parsed = parseSchedule(expr);
  if (!parsed) return MINUTES_PER_DAY;
  const fires = fireMinutesOfDay(parsed);
  const [first] = fires;
  if (first === undefined || fires.length === 1) return MINUTES_PER_DAY;
  let widest = first + MINUTES_PER_DAY - (fires[fires.length - 1] ?? first);
  for (let i = 1; i < fires.length; i += 1) {
    widest = Math.max(widest, (fires[i] ?? 0) - (fires[i - 1] ?? 0));
  }
  return widest;
}

/** How many times the job was due in [fromMs, toMs); null when the schedule is unparseable. */
export function countFiresBetween(expr: string, fromMs: number, toMs: number): number | null {
  const parsed = parseSchedule(expr);
  if (!parsed || toMs <= fromMs) return parsed ? 0 : null;
  const fires = fireMinutesOfDay(parsed);
  const dayMs = MINUTES_PER_DAY * 60_000;
  let count = 0;
  for (let day = Math.floor(fromMs / dayMs) * dayMs; day < toMs; day += dayMs) {
    count += fires.filter((m) => {
      const at = day + m * 60_000;
      return at >= fromMs && at < toMs;
    }).length;
  }
  return count;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Short human reading of a schedule, e.g. "every 15 min (:02 :17 :32 :47)". */
export function describeSchedule(expr: string): string {
  const parsed = parseSchedule(expr);
  if (!parsed) return expr;
  const at = parsed.minutes.map((m) => `:${pad2(m)}`).join(" ");
  if (parsed.hours.length === 24) {
    if (parsed.minutes.length === 1) return `hourly at ${at}`;
    return `every ${expectedIntervalMinutes(expr)} min (${at})`;
  }
  const [hour] = parsed.hours;
  const [minute] = parsed.minutes;
  if (parsed.hours.length === 1 && parsed.minutes.length === 1 && hour !== undefined && minute !== undefined) {
    return `daily ${pad2(hour)}:${pad2(minute)} UTC`;
  }
  return expr;
}

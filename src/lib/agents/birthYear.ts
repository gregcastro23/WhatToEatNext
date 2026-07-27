/**
 * The accepted birth-year range for agent creation, and a birth instant that
 * survives it.
 *
 * Lives here rather than in `api/agents/unified/route.ts` because a Next.js route
 * module may only export route handlers and route config: exporting a constant
 * from it fails typegen with
 * `TS2344 … Property 'MIN_BIRTH_YEAR' is incompatible with index signature`.
 */

/**
 * The floor is 1, not 1900. `/api/internal/agent-sync` has always accepted any
 * birthDate — its own fixture is Hildegard of Bingen, 1098-09-17 — and the
 * chart-bearing agent population is largely historical figures, so the public
 * create path could not author what the sync path routinely does.
 *
 * It is not 0 or negative: a BCE birth needs a proleptic-calendar convention this
 * codebase has never fixed, and inventing one silently is worse than refusing.
 */
export const MIN_BIRTH_YEAR = 1;
export const MAX_BIRTH_YEAR = 2100;

/**
 * The birth instant in UTC, for any year in range.
 *
 * ⚠️ NOT `Date.UTC(year, …)`, which maps years 0-99 to 1900-1999. That is
 * specified ECMAScript behaviour, so nothing throws — it silently shifts a birth
 * by 1900 years. `[MEASURED 2026-07-27]`
 *
 *     new Date(Date.UTC(50, 0, 1))  ->  1950-01-01T00:00:00.000Z
 *     setUTCFullYear(50)            ->  0050-01-01T00:00:00.000Z
 *
 * With the old 1900 floor the trap was unreachable; widening the range is exactly
 * what exposes it.
 */
export function birthMomentUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const moment = new Date(0);
  moment.setUTCFullYear(year, month - 1, day);
  moment.setUTCHours(hour, minute, 0, 0);
  return moment;
}

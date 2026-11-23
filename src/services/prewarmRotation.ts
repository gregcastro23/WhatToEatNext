/**
 * Candidate rotation for the agent-recipe prewarm cron. Split out of
 * `agentRecipePrewarm.ts` (re-exported there, so its public path is unchanged),
 * which sat at 298 of the repo's 300-line file limit.
 *
 * @file src/services/prewarmRotation.ts
 */

/** Deterministically rotate candidate rows by the current UTC hour bucket. */
export function rotateCandidatesByHour<T>(
  rows: readonly T[],
  nowMs: number = Date.now(),
): T[] {
  if (rows.length <= 1) return [...rows];
  const hourBucket = Math.floor(nowMs / 3_600_000);
  const offset = ((hourBucket % rows.length) + rows.length) % rows.length;
  if (offset === 0) return [...rows];
  return [...rows.slice(offset), ...rows.slice(0, offset)];
}

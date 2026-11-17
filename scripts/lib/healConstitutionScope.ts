/**
 * Pure helpers for `scripts/healConstitutionGeometry.ts`.
 *
 * Split out so the CLI parsing, control-gate scoping and `natal_positions`
 * derivation are unit-testable without a database or the astrologize backend.
 */

import { natalPositionsFromStoredChart } from "@/utils/fullChartMonica";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FLAG = "--control-user";

/**
 * Read `--control-user <uuid>` (or `--control-user=<uuid>`) from argv.
 *
 * Returns null when the flag is absent. Throws when it is present but has no
 * value or a non-UUID value: a typo here must not silently fall back to
 * gating on every row, which is the exact mixed-era failure the flag avoids.
 */
export function parseControlUser(argv: readonly string[]): string | null {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    let value: string | undefined;
    if (arg === FLAG) value = argv[i + 1];
    else if (arg?.startsWith(`${FLAG}=`)) value = arg.slice(FLAG.length + 1);
    else continue;

    const trimmed = value?.trim() ?? "";
    if (!UUID_RE.test(trimmed)) {
      throw new Error(`${FLAG} requires a user UUID, got ${JSON.stringify(value ?? null)}`);
    }
    return trimmed.toLowerCase();
  }
  return null;
}

/**
 * Narrow the control gate to one known-good user.
 *
 * When `alchemical_constitutions` mixes pre-#985 and post-#985 charts, gating
 * on every healthy row fails on the old-era rows for reasons unrelated to the
 * harness. Scoping to a row whose stored chart is known to be current keeps
 * the gate meaningful. Returns an empty list when the user is not among the
 * healthy rows, so `runControl` refuses (it cannot verify against nothing).
 */
export function scopeControlRows<T extends { user_id: string }>(
  healthy: readonly T[],
  controlUser: string | null,
): T[] {
  if (controlUser === null) return [...healthy];
  return healthy.filter((row) => row.user_id.toLowerCase() === controlUser);
}

/**
 * The `user_profiles.natal_positions` JSONB payload for a rebuilt chart, or
 * null when the chart cannot yield a usable set.
 *
 * Mirrors `userDatabase.updateUserProfile` (`jsonbOrNull(natalPositionsFromStoredChart(...))`):
 * callers write it with `COALESCE($n::jsonb, natal_positions)` so a null never
 * erases a previously valid set.
 */
export function natalPositionsJson(chart: unknown): string | null {
  const rows = natalPositionsFromStoredChart(chart);
  return rows && rows.length > 0 ? JSON.stringify(rows) : null;
}

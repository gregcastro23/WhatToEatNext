/**
 * One-off backfill: recompute stored natal-chart `alchemicalProperties` via the
 * enhanced planetary-alchemy mapping (the same fn /api/user/charts and the
 * #529-fixed onboarding use). The enhanced mapping injects the Ascendant, so
 * day-born (diurnal) charts no longer collapse Matter/Substance to 0.
 *
 * Context: before #529, onboarding persisted alchemicalProperties via
 * `calculateAlchemicalFromPlanets` (no Ascendant grounding). #529 switched the
 * onboarding write to `calculateEnhancedAlchemicalFromPlanets`, but that only
 * fixes NEWLY-onboarded users — existing stored charts keep their 0.0 values.
 * This script recomputes them in place.
 *
 * Recompute is from each chart's OWN stored data (no astrologize re-fetch):
 *   alchemicalProperties = calculateEnhancedAlchemicalFromPlanets(
 *     natalChart.planetaryPositions,
 *     isSectDiurnal(new Date(natalChart.birthData.dateTime)),
 *   )
 * which exactly reproduces what corrected onboarding would have stored (the
 * onboarding `positions` map — Ascendant included — is what gets persisted as
 * `planetaryPositions`).
 *
 * Covers the two stores that actually hold a natal chart in prod, updating ONLY
 * where the recomputed alchemicalProperties differ (idempotent):
 *   1. users.profile (JSONB)      -> profile.natalChart, profile.savedCharts[].natalChart
 *   2. user_profiles.natal_chart  (jsonb column)
 *
 * (The legacy `saved_charts` table in prod has a different schema — no
 * natal_chart column — and is empty, so there's nothing to backfill there.)
 *
 * Usage (prod DB is only reachable via tramway.proxy.rlwy.net):
 *   DATABASE_URL=postgres://... bun scripts/backfillNatalChartAlchemy.ts          # DRY RUN (read-only)
 *   DATABASE_URL=postgres://... bun scripts/backfillNatalChartAlchemy.ts --apply  # write changes
 */
import pkg from "pg";
import {
  calculateEnhancedAlchemicalFromPlanets,
  isSectDiurnal,
} from "../src/utils/planetaryAlchemyMapping";

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required — set it before running this backfill.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");

type Esms = {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
};

interface Recompute {
  hasPositions: boolean;
  hasDate: boolean;
  before: Esms | null;
  after: Esms | null;
  changed: boolean;
  symptomatic: boolean; // before.Matter == 0 && before.Substance == 0 (day-chart collapse)
}

const round6 = (n: unknown): number => Math.round((Number(n) || 0) * 1e6) / 1e6;

function esmsKey(e: Esms | null | undefined): string {
  if (!e || typeof e !== "object") return "∅";
  return [round6(e.Spirit), round6(e.Essence), round6(e.Matter), round6(e.Substance)].join(",");
}

function getDateTime(natalChart: any, fallbackBirthData?: any): string | null {
  const a = natalChart?.birthData?.dateTime;
  if (typeof a === "string" && a) return a;
  const b = fallbackBirthData?.dateTime;
  if (typeof b === "string" && b) return b;
  return null;
}

/** Recompute alchemicalProperties for one natalChart object. Returns null if not a chart. */
function recompute(natalChart: any, fallbackBirthData?: any): Recompute | null {
  if (!natalChart || typeof natalChart !== "object") return null;
  const positions = natalChart.planetaryPositions;
  const hasPositions =
    !!positions && typeof positions === "object" && Object.keys(positions).length > 0;
  const dateTime = getDateTime(natalChart, fallbackBirthData);
  const hasDate = !!dateTime;
  const before: Esms | null =
    natalChart.alchemicalProperties && typeof natalChart.alchemicalProperties === "object"
      ? (natalChart.alchemicalProperties as Esms)
      : null;

  if (!hasPositions || !hasDate) {
    return { hasPositions, hasDate, before, after: null, changed: false, symptomatic: false };
  }

  const diurnal = isSectDiurnal(new Date(dateTime as string));
  const after = calculateEnhancedAlchemicalFromPlanets(
    positions as Record<string, string>,
    diurnal,
  ) as Esms;

  const changed = esmsKey(before) !== esmsKey(after);
  const symptomatic = !!before && round6(before.Matter) === 0 && round6(before.Substance) === 0;
  return { hasPositions, hasDate, before, after, changed, symptomatic };
}

interface Tally {
  rows: number;
  charts: number; // chart objects examined
  noPositions: number;
  noDate: number;
  symptomatic: number;
  changed: number;
  updates: number; // jsonb_set writes that would run / ran
}

function newTally(): Tally {
  return { rows: 0, charts: 0, noPositions: 0, noDate: 0, symptomatic: 0, changed: 0, updates: 0 };
}

const samples: string[] = [];
function recordSample(label: string, r: Recompute): void {
  if (samples.length >= 8 || !r.symptomatic || !r.changed) return;
  samples.push(
    `  ${label}\n    before: ${esmsKey(r.before)}\n    after:  ${esmsKey(r.after)}`,
  );
}

async function main(): Promise<void> {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL!.includes(".railway.internal") ? false : { rejectUnauthorized: false },
    max: 4,
  });

  console.log(`\n=== Natal-chart alchemicalProperties backfill — ${APPLY ? "APPLY (writes)" : "DRY RUN (read-only)"} ===\n`);

  // ---- Store 2: user_profiles.natal_chart ----
  const up = newTally();
  {
    const { rows } = await pool.query<{ user_id: string; natal_chart: any; birth_data: any }>(
      `SELECT user_id, natal_chart, birth_data
         FROM user_profiles
        WHERE jsonb_typeof(natal_chart) = 'object'
          AND natal_chart ? 'planetaryPositions'`,
    );
    up.rows = rows.length;
    for (const row of rows) {
      const r = recompute(row.natal_chart, row.birth_data);
      if (!r) continue;
      up.charts++;
      if (!r.hasPositions) up.noPositions++;
      if (r.hasPositions && !r.hasDate) up.noDate++;
      if (r.symptomatic) up.symptomatic++;
      if (r.changed && r.after) {
        up.changed++;
        recordSample(`user_profiles user_id=${row.user_id}`, r);
        if (APPLY) {
          await pool.query(
            `UPDATE user_profiles
                SET natal_chart = jsonb_set(natal_chart, '{alchemicalProperties}', $2::jsonb),
                    updated_at = CURRENT_TIMESTAMP
              WHERE user_id = $1`,
            [row.user_id, JSON.stringify(r.after)],
          );
        }
        up.updates++;
      }
    }
  }

  // ---- Store 1: users.profile JSONB (natalChart + savedCharts[]) ----
  const us = newTally();
  {
    const { rows } = await pool.query<{ id: string; email: string; profile: any }>(
      `SELECT id, email, profile
         FROM users
        WHERE jsonb_typeof(profile) = 'object'
          AND (
            (profile -> 'natalChart' ? 'planetaryPositions')
            OR jsonb_typeof(profile -> 'savedCharts') = 'array'
          )`,
    );
    us.rows = rows.length;
    for (const row of rows) {
      const profile = row.profile || {};
      const fallbackBirth = profile.birthData;

      // profile.natalChart
      const rChart = recompute(profile.natalChart, fallbackBirth);
      if (rChart) {
        us.charts++;
        if (!rChart.hasPositions) us.noPositions++;
        if (rChart.hasPositions && !rChart.hasDate) us.noDate++;
        if (rChart.symptomatic) us.symptomatic++;
        if (rChart.changed && rChart.after) {
          us.changed++;
          recordSample(`users.profile.natalChart id=${row.id} email=${row.email}`, rChart);
          if (APPLY) {
            await pool.query(
              `UPDATE users
                  SET profile = jsonb_set(profile, '{natalChart,alchemicalProperties}', $2::jsonb),
                      updated_at = CURRENT_TIMESTAMP
                WHERE id = $1::uuid`,
              [row.id, JSON.stringify(rChart.after)],
            );
          }
          us.updates++;
        }
      }

      // profile.savedCharts[] (legacy in-profile saved charts)
      const saved = Array.isArray(profile.savedCharts) ? profile.savedCharts : [];
      for (let i = 0; i < saved.length; i++) {
        const entry = saved[i];
        const rSaved = recompute(entry?.natalChart, entry?.birthData);
        if (!rSaved) continue;
        us.charts++;
        if (!rSaved.hasPositions) us.noPositions++;
        if (rSaved.hasPositions && !rSaved.hasDate) us.noDate++;
        if (rSaved.symptomatic) us.symptomatic++;
        if (rSaved.changed && rSaved.after) {
          us.changed++;
          recordSample(`users.profile.savedCharts[${i}] id=${row.id}`, rSaved);
          if (APPLY) {
            await pool.query(
              `UPDATE users
                  SET profile = jsonb_set(profile, $2::text[], $3::jsonb),
                      updated_at = CURRENT_TIMESTAMP
                WHERE id = $1::uuid`,
              [
                row.id,
                ["savedCharts", String(i), "natalChart", "alchemicalProperties"],
                JSON.stringify(rSaved.after),
              ],
            );
          }
          us.updates++;
        }
      }
    }
  }

  const report = (name: string, t: Tally) => {
    console.log(
      `${name}:\n` +
        `  rows scanned ............ ${t.rows}\n` +
        `  charts examined ......... ${t.charts}\n` +
        `  missing planetaryPositions ${t.noPositions}\n` +
        `  missing birth dateTime .. ${t.noDate} (skipped — can't determine sect)\n` +
        `  symptomatic (Matter=0 & Substance=0) ${t.symptomatic}\n` +
        `  would change ............ ${t.changed}\n` +
        `  ${APPLY ? "writes applied" : "writes that WOULD run"} ......... ${t.updates}\n`,
    );
  };

  console.log("---- RESULTS ----\n");
  report("Store 1  users.profile (natalChart + savedCharts[])", us);
  report("Store 2  user_profiles.natal_chart", up);

  const totalChanged = us.changed + up.changed;
  const totalSymptomatic = us.symptomatic + up.symptomatic;
  console.log(
    `TOTAL: ${totalChanged} chart(s) would change; ${totalSymptomatic} are symptomatic ` +
      `(Matter=0 & Substance=0).\n`,
  );

  if (samples.length) {
    console.log("Spot-check (symptomatic before -> recomputed after, S,E,M,Su):");
    console.log(samples.join("\n"));
    console.log("");
  }

  if (!APPLY) {
    console.log("DRY RUN complete — no writes. Re-run with --apply to persist.\n");
  } else {
    console.log(`APPLY complete — ${totalChanged} chart(s) updated.\n`);
  }

  await pool.end();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});

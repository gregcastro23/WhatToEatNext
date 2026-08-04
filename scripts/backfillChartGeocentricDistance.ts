#!/usr/bin/env bun
/**
 * One-off backfill: add true geocentric distances to stored natal charts.
 *
 * ── SCOPE IS 4 CHARTS, NOT ~73 (measured against prod 2026-08-04) ───────────
 *
 * `user_profiles` holds 5498 rows. 75 have a non-empty `natal_chart`, and 0 of
 * them carry a distance on any planet. But those 75 are TWO different shapes:
 *
 *   71 rows  {aspects, planets}  planets is an OBJECT   <- NOT backfillable
 *    4 rows  full NatalChart     planets is an ARRAY    <- the real target
 *
 * The 71 are placeholder profiles, not user geometry, and backfilling them
 * would fabricate precision rather than recover it:
 *   - every one belongs to an AGENT (`users.is_agent`); zero humans;
 *   - they share ONE birth instant — 1900-01-01T12:00:00.000Z (50 rows) or
 *     null (21) — at the hardcoded 40.7498/-73.7976 "Fallback NY" coordinate,
 *     so all 71 would receive byte-identical distances;
 *   - their planet entries are `{sign, house, degree, retrograde}` with NO
 *     longitude anywhere (0 of 71 mention one), so a precise AU distance would
 *     be the only exact field on an otherwise sign-only chart. `chartDataUtils`
 *     would then feed that precision into `getGravitationalInertia` while
 *     dignity still resolves at sign-mean. Incoherent, and worse than the
 *     honest absence it replaces.
 *
 * This script therefore refuses the object-shaped rows by construction and
 * reports them, rather than silently counting them as "done".
 *
 * ── THIS IS A LIVE PHYSICS CHANGE, NOT METADATA ─────────────────────────────
 *
 * The field is written as `distance` (NOT `distanceAu`): `chartDataUtils`
 * forwards `planets[].distance` into the positions record that reaches
 * `getGravitationalInertia`, and drops any other spelling. Inertia is
 * M̂·(r̄/r)², so a chart with no distance uses r = r̄ and gets exactly 1; with a
 * real distance it gets the true ratio.
 *
 * MEASURED consequence, taken from the applied run (2026-08-04) by scoring the
 * pre-apply snapshot and the committed chart through the SAME read path:
 *
 *   user        ESMS before      after          max Δshare  archetype
 *   2ee5eb05    36/40/17/7   ->  33/44/16/7     4.85pp      unchanged
 *   32ad3b88    37/33/20/10  ->  33/39/19/9     5.25pp      Root Alchemist -> Lunar Adept
 *   5f40a6e5    23/22/38/17  ->  23/19/38/20    3.25pp      unchanged
 *   ce117d50    37/33/20/10  ->  33/39/19/9     5.25pp      Root Alchemist -> Lunar Adept
 *
 * Neither flipped account has an `alchemical_constitutions` row, so no STORED
 * archetype or balance moved; the shift is only in what the read path derives.
 *
 * ⚠ The pre-apply estimate for this same change predicted "no archetype
 * changes" and was WRONG for 2 of 4. It was produced with
 * `getAccuratePlanetaryPositions` — freshly recomputed astronomy-engine
 * geometry — rather than the STORED astrologize longitudes the read path
 * actually consumes. Different position source, different baseline, different
 * side of the archetype boundary. Predict a data change through the path
 * production reads, never through one that merely resembles it.
 *
 * The ESMS_BASELINE constants are NOT affected: they are generated from a
 * synthetic uniform sample that supplies no distances, so the baseline sits at
 * r = r̄ before and after. Verified — `scripts/generate-esms-baseline.ts`
 * reproduces the committed block byte-for-byte.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   bun run scripts/backfillChartGeocentricDistance.ts            # dry run
 *   bun run scripts/backfillChartGeocentricDistance.ts --apply    # one txn
 *
 * Raw `pg`, no ORM. Distances are TZ-independent: they are computed from the
 * absolute birth instant, so unlike the astrologize payload this needs no UTC
 * guard.
 */

import fs from "node:fs";
import path from "node:path";
import * as Astronomy from "astronomy-engine";
import pg from "pg";

import { PLANET_MEAN_GEOCENTRIC_AU } from "@/utils/planetaryAlchemyMapping";

const APPLY = process.argv.slice(2).includes("--apply");

// ─────────────────────────────── plumbing ───────────────────────────────

function loadEnvFile(file: string): Record<string, string> {
  const abs = path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(abs, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

function resolveConnectionString(): string {
  const env = { ...loadEnvFile(".env.development.local"), ...loadEnvFile(".env.local") };
  const url =
    process.env.DATABASE_PUBLIC_URL || env.DATABASE_PUBLIC_URL || env.DATABASE_URL;
  if (!url) {
    console.error(
      "FATAL: no DATABASE_PUBLIC_URL / DATABASE_URL available.\n" +
        "Run from the repo root so .env.development.local resolves.",
    );
    process.exit(1);
  }
  return url;
}

const ASTRONOMY_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/**
 * True geocentric range in AU, or null for a body with no distance concept
 * (Ascendant, lunar nodes). Null means "leave the field off" — never invent a
 * placeholder, because a fabricated distance is indistinguishable downstream
 * from a measured one and defeats the r̄ fallback that exists for absence.
 */
function geocentricDistanceAu(planet: string, instant: Date): number | null {
  const body = ASTRONOMY_BODIES[planet];
  if (!body) return null;
  const v = Astronomy.GeoVector(body, new Astronomy.AstroTime(instant), true);
  return Math.hypot(v.x, v.y, v.z);
}

interface Row {
  user_id: string;
  email: string | null;
  natal_chart: any;
  planets_type: string | null;
  birth_dt: string | null;
  jsonb_chart_has_planets: boolean;
}

// ──────────────────────────────── main ────────────────────────────────

async function main(): Promise<void> {
  const pool = new pg.Pool({
    connectionString: resolveConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  const client = await pool.connect();

  try {
    const { rows } = await client.query<Row>(`
      SELECT
        up.user_id::text                                   AS user_id,
        u.email                                            AS email,
        up.natal_chart                                     AS natal_chart,
        jsonb_typeof(up.natal_chart->'planets')            AS planets_type,
        COALESCE(up.birth_data->>'dateTime',
                 u.profile->'birthData'->>'dateTime')      AS birth_dt,
        (jsonb_typeof(u.profile->'natalChart'->'planets') = 'array')
                                                           AS jsonb_chart_has_planets
      FROM user_profiles up
      LEFT JOIN users u ON u.id = up.user_id
      WHERE up.natal_chart IS NOT NULL
        AND up.natal_chart::text NOT IN ('{}','null')
      ORDER BY up.user_id
    `);

    const arrayShaped = rows.filter((r) => r.planets_type === "array");
    const objectShaped = rows.filter((r) => r.planets_type === "object");
    const otherShaped = rows.filter(
      (r) => r.planets_type !== "array" && r.planets_type !== "object",
    );

    console.log(`\nStored charts scanned: ${rows.length}`);
    console.log(`  planets[] array  (backfillable) : ${arrayShaped.length}`);
    console.log(`  planets{} object (placeholder)  : ${objectShaped.length}  — SKIPPED, see header`);
    if (otherShaped.length > 0) {
      console.log(`  other/absent shape             : ${otherShaped.length}  — SKIPPED`);
    }

    console.log(`\n━━━ ${APPLY ? "APPLY" : "DRY RUN"} ━━━`);

    const planned: Array<{ row: Row; chart: any; added: number; instant: string }> = [];

    for (const row of arrayShaped) {
      if (!row.birth_dt || Number.isNaN(Date.parse(row.birth_dt))) {
        console.log(`  ${row.user_id}  SKIP — no usable birth instant; distance is a function of it`);
        continue;
      }
      const instant = new Date(row.birth_dt);
      const chart = structuredClone(row.natal_chart);
      const planets: any[] = chart.planets ?? [];

      let added = 0;
      let alreadyHad = 0;
      const detail: string[] = [];
      for (const planet of planets) {
        if (typeof planet?.distance === "number" && planet.distance > 0) {
          alreadyHad++;
          continue;
        }
        const d = geocentricDistanceAu(planet?.name, instant);
        if (d === null) continue; // Ascendant & friends: no distance concept
        planet.distance = d;
        added++;
        const rBar = PLANET_MEAN_GEOCENTRIC_AU[planet.name];
        if (rBar !== undefined) {
          detail.push(`${planet.name} r=${d.toFixed(4)} (r̄/r)²=${((rBar / d) ** 2).toFixed(3)}`);
        }
      }

      if (added === 0) {
        console.log(`  ${row.user_id}  nothing to add (${alreadyHad} already had a distance)`);
        continue;
      }

      chart.geometryBasis = {
        distance: "DERIVED — astronomy-engine GeoVector |(x,y,z)| at the birth instant",
        distanceUnits: "AU",
        instant: instant.toISOString(),
        backfilledAt: new Date().toISOString(),
      };

      console.log(`\n  ${row.user_id}  (${row.email ?? "no email"})`);
      console.log(`    instant  : ${instant.toISOString()}`);
      console.log(`    planets  : ${planets.length}, +${added} distances (${planets.length - added} have no distance concept)`);
      console.log(`    sample   : ${detail.slice(0, 3).join("  ")}`);
      console.log(`    mirror   : users.profile.natalChart ${row.jsonb_chart_has_planets ? "also updated" : "has no planets[] — column only"}`);

      planned.push({ row, chart, added, instant: instant.toISOString() });
    }

    if (planned.length === 0) {
      console.log("\n  Nothing to write.");
      return;
    }

    if (!APPLY) {
      console.log(`\n  (dry run — ${planned.length} chart(s) would be updated, no write)`);
      return;
    }

    // ONE transaction for the whole set: these charts are a physics cohort, and
    // a partial apply would leave some users on distance-aware inertia and
    // others on the r̄ fallback with nothing recording which is which.
    await client.query("BEGIN");
    try {
      for (const { row, chart } of planned) {
        const res = await client.query(
          `UPDATE user_profiles
             SET natal_chart = $2::jsonb, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1::uuid`,
          [row.user_id, JSON.stringify(chart)],
        );
        if (res.rowCount !== 1) {
          throw new Error(`expected 1 user_profiles row for ${row.user_id}, got ${res.rowCount}`);
        }

        // Mirror into the users.profile JSONB. Updating only one of the two
        // surfaces is exactly how the constitution rows diverged — see
        // scripts/healConstitutionGeometry.ts. Guarded so we only touch rows
        // that actually carry a planets[] there.
        if (row.jsonb_chart_has_planets) {
          await client.query(
            `UPDATE users
               SET profile = jsonb_set(profile, '{natalChart}', $2::jsonb, true),
                   updated_at = CURRENT_TIMESTAMP
             WHERE id = $1::uuid`,
            [row.user_id, JSON.stringify(chart)],
          );
        }
      }
      await client.query("COMMIT");
      console.log(`\n  ✔ committed ${planned.length} chart(s) in one transaction`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("\n  ROLLED BACK:", (err as Error).message);
      process.exitCode = 1;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

await main();

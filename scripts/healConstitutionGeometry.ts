#!/usr/bin/env bun
/**
 * One-off recovery: heal `alchemical_constitutions` rows whose natal geometry
 * was never persisted to the canonical `user_profiles` columns.
 *
 * ── WHAT IS ACTUALLY BROKEN (measured 2026-08-03 against prod) ──────────────
 *
 * `alchemical_constitutions` has NO `natal_chart` column — it stores four
 * scalar balances plus an archetype. The geometry lives in `user_profiles`
 * (`birth_data`, `natal_chart`), dual-written by `userDatabase.updateUserProfile`.
 *
 * Of the 4 constitution rows, 2 are broken — but NOT by "missing distances":
 *
 *   user_id     esms          user_profiles          users.profile->birthData
 *   ─────────────────────────────────────────────────────────────────────────
 *   2ee5eb05…   30/46/14/9    chart, 11 planets      present        HEALTHY
 *   5f40a6e5…   16/16/47/21   chart, 11 planets      present        HEALTHY
 *   3de96e89…   25/25/25/25   birth_data={}, no chart  PRESENT      BROKEN
 *   5e813bbf…   25/25/25/25   birth_data={}, no chart  PRESENT      BROKEN
 *
 * The two broken rows carry a flat 25/25/25/25 ESMS under the "Solar Forager"
 * archetype — the degenerate signature of a constitution computed with no
 * chart. Their birth data survives ONLY in the `users.profile` JSONB, because
 * the write landed there but never reached the normalized columns. That JSONB
 * is the recovery source, and it is why these rows are healable at all.
 *
 * Geocentric distance is a SEPARATE, population-wide gap, not row staleness:
 * 0 of 75 stored charts carry a distance on any planet, because
 * `calculateNatalChart` emits `{name, sign, position}` and the astrologize
 * response type has no distance field. Backfilling 2 rows cannot close it.
 * `--with-distance` enriches the rebuilt charts from astronomy-engine (see the
 * flag's docs below); it is opt-in precisely because it is a physics change.
 *
 * ── WHY TZ=UTC IS ENFORCED ──────────────────────────────────────────────────
 *
 * `fetchPlanetaryPositions` builds the astrologize payload with LOCAL-time
 * getters (`getFullYear`/`getHours`/…) on a UTC instant, and ignores
 * `birthData.timezone` entirely. The stored charts were computed on UTC
 * infrastructure. Measured: re-igniting 2ee5eb05 reproduces the stored Sun
 * bit-exact (91.63304700590142 vs 91.6330470059014) under TZ=UTC, and drifts
 * to 91.474 under TZ=America/New_York — 0.16° of pure harness artifact. A
 * backfill run under the operator's local clock silently writes a different
 * chart, so this script refuses to run outside UTC.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   # 1. Control gate only — proves the pipeline reproduces known-good rows.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/healConstitutionGeometry.ts --control
 *
 *   # 2. Dry run (default) — control gate, then the full diff, no writes.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/healConstitutionGeometry.ts
 *
 *   # 3. Apply — same as above, then one transaction per healed user.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/healConstitutionGeometry.ts --apply
 *
 * Raw `pg` only, no ORM. Reads DATABASE_PUBLIC_URL (prod) from the environment
 * or `.env.development.local`.
 */

import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import * as Astronomy from "astronomy-engine";

import { calculateNatalChart } from "@/services/natalChartService";
import { toEsmsShares, selectArchetype } from "@/utils/alchemicalConstitution";
import { isSectDiurnalForBirth } from "@/utils/planetaryAlchemyMapping";

// ───────────────────────────────── flags ─────────────────────────────────

const ARGV = new Set(process.argv.slice(2));
const CONTROL_ONLY = ARGV.has("--control");
const APPLY = ARGV.has("--apply");
/**
 * Enrich each rebuilt planet with its true geocentric distance in AU.
 *
 * The field MUST be named `distance` (not `distanceAu`): `chartDataUtils`
 * forwards `planets[].distance` into the positions record that reaches
 * `getGravitationalInertia`, and drops any other spelling. That makes this a
 * live physics change — inertia goes from M̂·(r̄/r)²=M̂ (the missing-distance
 * fallback) to the real ratio — so it is opt-in and reported separately.
 *
 * Basis: DERIVED — astronomy-engine GeoVector at the birth instant, |(x,y,z)|.
 * All four birth dates are 1984–2021, well clear of the pre-1600 regime where
 * astronomy-engine diverges from JPL by up to 0.53°.
 */
const WITH_DISTANCE = ARGV.has("--with-distance");
/**
 * Also recompute the rows that already have a chart, bringing all four onto the
 * current engine. Off by default: those rows are not broken, they are merely
 * old, and silently rewriting healthy production data is a bigger decision than
 * healing rows that carry no chart at all. The control gate reports when this
 * would matter.
 */
const RECOMPUTE_ALL = ARGV.has("--recompute-all");

// ─────────────────────────────── guardrails ───────────────────────────────

function assertUtc(): void {
  const tz = process.env.TZ;
  const offset = new Date().getTimezoneOffset();
  if (offset !== 0) {
    console.error(
      `FATAL: this script must run under UTC (TZ=${tz ?? "<unset>"}, offset ${offset}min).\n` +
        "The astrologize payload is built from local-time getters, so a non-UTC\n" +
        "clock silently produces a different chart than the one prod stored.\n" +
        "Re-run with: TZ=UTC bun run scripts/healConstitutionGeometry.ts …",
    );
    process.exit(1);
  }
}

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
    console.error("FATAL: no DATABASE_PUBLIC_URL / DATABASE_URL available.");
    process.exit(1);
  }
  return url;
}

// ──────────────────────────────── types ────────────────────────────────

interface BirthData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface CandidateRow {
  user_id: string;
  email: string | null;
  base_archetype: string | null;
  stored_esms: [number, number, number, number];
  profile_planet_count: number;
  profile_birth_data: BirthData | Record<string, never> | null;
  jsonb_birth_data: BirthData | null;
  users_profile: Record<string, unknown> | null;
  stored_chart: any | null;
}

function isUsableBirthData(b: unknown): b is BirthData {
  if (!b || typeof b !== "object") return false;
  const d = b as Partial<BirthData>;
  return (
    typeof d.dateTime === "string" &&
    !Number.isNaN(Date.parse(d.dateTime)) &&
    typeof d.latitude === "number" &&
    Number.isFinite(d.latitude) &&
    typeof d.longitude === "number" &&
    Number.isFinite(d.longitude)
  );
}

// ───────────────────────────── the pipeline ─────────────────────────────

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

/** True geocentric range in AU at `instant`, or null for bodies with no such concept. */
function geocentricDistanceAu(planet: string, instant: Date): number | null {
  const body = ASTRONOMY_BODIES[planet];
  if (!body) return null; // Ascendant, nodes, …
  const v = Astronomy.GeoVector(body, new Astronomy.AstroTime(instant), true);
  return Math.hypot(v.x, v.y, v.z);
}

/**
 * Re-ignite: rebuild the chart from the external astrologize source and derive
 * the constitution with the canonical engine. This is the same sequence
 * `/api/agent-forge/ignite` runs, minus auth, geocoding and recipe generation.
 */
async function reignite(birthData: BirthData) {
  const chart: any = await calculateNatalChart(birthData);

  if (WITH_DISTANCE) {
    const instant = new Date(birthData.dateTime);
    for (const planet of chart.planets ?? []) {
      const d = geocentricDistanceAu(planet.name, instant);
      if (d !== null) planet.distance = d;
    }
    chart.geometryBasis = {
      distance: "DERIVED — astronomy-engine GeoVector |(x,y,z)| at birth instant",
      distanceUnits: "AU",
      enrichedAt: new Date().toISOString(),
    };
  }

  const shares = toEsmsShares(chart.alchemicalProperties);
  const diurnal = isSectDiurnalForBirth(new Date(birthData.dateTime));
  const { baseArchetype } = selectArchetype(shares, diurnal);

  return {
    chart,
    esms: [
      Math.round(shares.spirit),
      Math.round(shares.essence),
      Math.round(shares.matter),
      Math.round(shares.substance),
    ] as [number, number, number, number],
    baseArchetype,
  };
}

// ────────────────────────────── control gate ──────────────────────────────

/**
 * STORED vs CONTROL on the rows that are already healthy.
 *
 * The point is not to check that the healthy rows are fine — it is to prove
 * that THIS script, on THIS machine, against THIS upstream, reproduces charts
 * prod already wrote. If the control drifts, every "healed" value the script
 * would write on the broken rows is the harness talking, not the fix.
 *
 * The control is split in two, because the two halves fail for different
 * reasons and only one of them is the harness's fault:
 *
 *   GEOMETRY (blocking) — sign + longitude per planet. This is the astrologize
 *     round-trip and the TZ handling. It MUST be bit-exact; a drift here means
 *     the re-ignition is producing a different sky than prod recorded.
 *
 *   ESMS (informational) — the quantities derived FROM that geometry. This is
 *     NOT expected to match: 14 engine commits landed between the oldest
 *     constitution row (2026-05-28) and today, including the degree-level
 *     dignity manifest (#721), the retirement of the sign-level dignity scale
 *     (#722), the inertial-mass unification (#710) and the aspect-bearing
 *     engine (#695). Measured drift on identical geometry: 30/46/14/9 →
 *     36/39/18/7 and 16/16/47/21 → 22/22/40/17. That delta belongs to the
 *     engine, not to this script, so it is reported rather than gated on —
 *     blocking on it would only ever mean "the physics improved".
 */
async function runControl(healthy: CandidateRow[]): Promise<boolean> {
  console.log("\n━━━ CONTROL GATE ━━━");
  if (healthy.length === 0) {
    console.log("  No healthy rows to control against — cannot verify. Refusing.");
    return false;
  }

  let geometryClean = true;
  const esmsDrifted: string[] = [];
  for (const row of healthy) {
    const birth = isUsableBirthData(row.profile_birth_data)
      ? row.profile_birth_data
      : row.jsonb_birth_data;
    if (!isUsableBirthData(birth)) {
      console.log(`  ${row.user_id}  SKIP — no usable birth data`);
      geometryClean = false;
      continue;
    }

    const { chart: control, esms } = await reignite(birth);
    const storedPlanets: any[] = row.stored_chart?.planets ?? [];
    const controlPlanets: any[] = control.planets ?? [];

    const diffs: string[] = [];
    for (const sp of storedPlanets) {
      const cp = controlPlanets.find((p) => p.name === sp.name);
      if (!cp) {
        diffs.push(`${sp.name}: absent from control`);
        continue;
      }
      if (cp.sign !== sp.sign) diffs.push(`${sp.name}: sign ${sp.sign} → ${cp.sign}`);
      const dl = Math.abs(Number(cp.position) - Number(sp.position));
      if (!(dl < 1e-9)) {
        diffs.push(`${sp.name}: longitude Δ${dl.toExponential(3)}°`);
      }
    }

    const esmsStored = row.stored_esms.join("/");
    const esmsControl = esms.join("/");

    if (diffs.length === 0) {
      console.log(
        `  ${row.user_id}  ✔ GEOMETRY bit-exact (${storedPlanets.length} planets: sign + longitude)`,
      );
    } else {
      geometryClean = false;
      console.log(`  ${row.user_id}  ✘ GEOMETRY DRIFT`);
      for (const d of diffs.slice(0, 12)) console.log(`      ${d}`);
      if (diffs.length > 12) console.log(`      … and ${diffs.length - 12} more`);
    }

    if (esmsStored === esmsControl) {
      console.log(`      ESMS unchanged under the current engine: ${esmsStored}`);
    } else {
      console.log(
        `      ESMS engine drift (expected): stored ${esmsStored} → current ${esmsControl}`,
      );
      esmsDrifted.push(row.user_id);
    }
  }

  console.log(
    geometryClean
      ? "  GATE PASSED — re-ignition reproduces prod's own geometry bit-exact."
      : "  GATE FAILED — do NOT apply; the re-ignited sky differs from what prod recorded.",
  );
  if (esmsDrifted.length > 0) {
    console.log(
      `\n  NOTE: ${esmsDrifted.length} healthy row(s) hold ESMS from a superseded engine.\n` +
        "  Healing the broken rows writes CURRENT-engine values, so the table will\n" +
        "  mix engine generations until those rows are recomputed too. Pass\n" +
        "  --recompute-all to bring every row onto the current engine in the same run.",
    );
  }
  return geometryClean;
}

// ─────────────────────────────── the write ───────────────────────────────

/**
 * Mirrors `userDatabase.updateUserProfile`'s dual-write exactly: the
 * `users.profile` JSONB AND the normalized `user_profiles` columns, plus the
 * constitution row — all inside ONE transaction. Writing only one of the two
 * profile surfaces is the original defect; reproducing it here would re-break
 * the rows in the other direction.
 */
async function healRow(
  client: pg.PoolClient,
  row: CandidateRow,
  birth: BirthData,
  rebuilt: Awaited<ReturnType<typeof reignite>>,
): Promise<void> {
  const mergedProfile = {
    ...(row.users_profile ?? {}),
    userId: row.user_id,
    birthData: birth,
    natalChart: rebuilt.chart,
    onboardingComplete: true,
  };
  const name = (mergedProfile as any).name ?? "";

  await client.query("BEGIN");
  try {
    await client.query(
      `UPDATE users SET profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
      [row.user_id, JSON.stringify(mergedProfile)],
    );

    await client.query(
      `INSERT INTO user_profiles (user_id, name, birth_data, natal_chart, onboarding_completed)
       VALUES ($1::uuid, $2, $3::jsonb, $4::jsonb, true)
       ON CONFLICT (user_id) DO UPDATE SET
         name = COALESCE(NULLIF(EXCLUDED.name, ''), user_profiles.name),
         birth_data = EXCLUDED.birth_data,
         natal_chart = EXCLUDED.natal_chart,
         onboarding_completed = true,
         onboarding_completed_at = COALESCE(user_profiles.onboarding_completed_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP`,
      [row.user_id, name, JSON.stringify(birth), JSON.stringify(rebuilt.chart)],
    );

    const res = await client.query(
      `UPDATE alchemical_constitutions SET
         spirit_balance = $2, essence_balance = $3,
         matter_balance = $4, substance_balance = $5,
         base_archetype = $6, last_transit_sync = NOW(), updated_at = NOW()
       WHERE user_id = $1::uuid`,
      [row.user_id, ...rebuilt.esms, rebuilt.baseArchetype],
    );
    if (res.rowCount !== 1) {
      throw new Error(`expected to update exactly 1 constitution row, got ${res.rowCount}`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

// ──────────────────────────────── main ────────────────────────────────

async function main(): Promise<void> {
  assertUtc();

  if (!process.env.ALCHM_MCP_BACKEND_URL?.trim()) {
    console.error(
      "FATAL: set ALCHM_MCP_BACKEND_URL=https://alchm.kitchen so the re-ignition\n" +
        "reaches the real astrologize backend rather than a non-existent localhost.",
    );
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: resolveConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  const client = await pool.connect();

  try {
    // 1. IDENTIFY — every constitution row, with both profile surfaces.
    const { rows } = await client.query<CandidateRow>(`
      SELECT
        ac.user_id::text                       AS user_id,
        u.email                                AS email,
        ac.base_archetype,
        ARRAY[ac.spirit_balance, ac.essence_balance,
              ac.matter_balance, ac.substance_balance] AS stored_esms,
        jsonb_array_length(COALESCE(up.natal_chart->'planets', '[]'::jsonb)) AS profile_planet_count,
        up.birth_data                          AS profile_birth_data,
        u.profile -> 'birthData'               AS jsonb_birth_data,
        u.profile                              AS users_profile,
        up.natal_chart                         AS stored_chart
      FROM alchemical_constitutions ac
      LEFT JOIN users u          ON u.id = ac.user_id
      LEFT JOIN user_profiles up ON up.user_id = ac.user_id
      ORDER BY ac.created_at
    `);

    const healthy = rows.filter((r) => Number(r.profile_planet_count) > 0);
    const broken = rows.filter((r) => Number(r.profile_planet_count) === 0);

    console.log(`\nScanned ${rows.length} constitution rows.`);
    console.log(`  healthy (chart present): ${healthy.length}`);
    console.log(`  broken  (no chart)     : ${broken.length}`);
    console.log(`  distance enrichment    : ${WITH_DISTANCE ? "ON (--with-distance)" : "off"}`);

    // 2. CONTROL — must reproduce prod's own output before touching anything.
    const gatePassed = await runControl(healthy);
    if (CONTROL_ONLY) {
      process.exitCode = gatePassed ? 0 : 1;
      return;
    }
    if (!gatePassed && APPLY) {
      console.error("\nRefusing --apply: control gate failed.");
      process.exitCode = 1;
      return;
    }

    // 3. RE-IGNITE + 4. UPDATE
    console.log(`\n━━━ ${APPLY ? "APPLY" : "DRY RUN"} ━━━`);
    const targets = RECOMPUTE_ALL ? [...broken, ...healthy] : broken;
    if (targets.length === 0) {
      console.log("  Nothing to heal.");
      return;
    }
    if (RECOMPUTE_ALL) {
      console.log(`  --recompute-all: ${broken.length} broken + ${healthy.length} healthy rows`);
    }

    for (const row of targets) {
      const birth = isUsableBirthData(row.profile_birth_data)
        ? row.profile_birth_data
        : row.jsonb_birth_data;

      if (!isUsableBirthData(birth)) {
        console.log(
          `  ${row.user_id}  UNHEALABLE — no usable birth data in either surface. ` +
            "Requires the user to re-onboard; a chart cannot be invented for them.",
        );
        continue;
      }

      const source = isUsableBirthData(row.profile_birth_data)
        ? "user_profiles.birth_data"
        : "users.profile->birthData (RECOVERED)";

      let rebuilt: Awaited<ReturnType<typeof reignite>>;
      try {
        rebuilt = await reignite(birth);
      } catch (err) {
        console.log(`  ${row.user_id}  FAILED to re-ignite: ${(err as Error).message}`);
        continue;
      }

      const withDist = (rebuilt.chart.planets ?? []).filter(
        (p: any) => typeof p.distance === "number",
      ).length;

      console.log(`\n  ${row.user_id}  (${row.email ?? "no email"})`);
      console.log(`    birth source : ${source}`);
      console.log(`    birth instant: ${birth.dateTime}  @ ${birth.latitude}, ${birth.longitude}`);
      console.log(`    ESMS         : ${row.stored_esms.join("/")} → ${rebuilt.esms.join("/")}`);
      console.log(`    archetype    : ${row.base_archetype} → ${rebuilt.baseArchetype}`);
      console.log(
        `    chart        : ${rebuilt.chart.planets?.length ?? 0} planets` +
          (WITH_DISTANCE ? `, ${withDist} with geocentric distance` : ""),
      );

      if (!APPLY) {
        console.log("    (dry run — no write)");
        continue;
      }

      await healRow(client, row, birth, rebuilt);
      console.log("    ✔ committed (users.profile + user_profiles + constitution)");
    }
  } finally {
    client.release();
    await pool.end();
  }
}

await main();

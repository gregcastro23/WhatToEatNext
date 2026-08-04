#!/usr/bin/env bun
/**
 * Temporal migration: derive each user's TRUE UTC birth instant from the
 * wall-clock time we have been storing as though it were UTC, and persist both.
 *
 * ── WHAT IS WRONG ───────────────────────────────────────────────────────────
 *
 * `birthData.dateTime` is `new Date(<datetime-local>).toISOString()`, so a
 * Brooklyn birth at 14:24 is stored `1991-06-23T14:24:00.000Z`. That is a wall
 * clock wearing a `Z`. The true instant is 18:24Z, and every stored natal chart
 * was computed for the sky at 14:24Z — four hours early.
 *
 * ── SCOPE, MEASURED 2026-08-04 AGAINST PRODUCTION ───────────────────────────
 *
 * The canonical surface is `users.profile->'birthData'` (60 rows), NOT
 * `user_profiles.birth_data` (4 rows). Both are written by
 * `userDatabase.updateUserProfile`; only the JSONB is populated at scale, so a
 * migration scoped to the normalized column would touch 4 of 60. This script
 * reads the JSONB and writes BOTH, because writing one is the original defect.
 *
 *   60 rows with birthData
 *   ├── 52 agent placeholders @ 1900-01-01T12:00:00.000Z ... SKIPPED (sentinel,
 *   │      not a birth; re-dating it to 17:00Z would be churn on a fiction)
 *   └──  8 human
 *        ├── 2 @ 40.7498,-73.7976 bit-exact ............... REFUSED (that is the
 *        │      retired `ignite` route's "Fallback NY" literal; these users'
 *        │      birthplace was never geocoded, so no instant can be derived)
 *        └── 6 migratable
 *
 * ── THE SECT TRAP ───────────────────────────────────────────────────────────
 *
 * `isSectDiurnal` is a 06:00-18:00 window: a LOCAL-clock predicate. Feeding it
 * the true instant flips day<->night on 6 of the 8 rows (14:24 local reads
 * diurnal; 18:24Z reads nocturnal because `18 < 18` is false), which per
 * `isSectDiurnalForBirth`'s docs swings the profile from ~32/49/9/9 to
 * ~14/16/47/22 and rewrites the archetype. That flip is manufactured by the
 * migration, not discovered by it. Sect therefore keeps reading the WALL CLOCK
 * in both the control and the new value; only the ephemeris moves. `--show-trap`
 * prints what the naive reading would have done, to keep the hazard visible.
 *
 * ── WHY THREE COLUMNS AND NOT TWO ───────────────────────────────────────────
 *
 * STORED is what the constitution row holds. It was computed by an engine 14
 * commits older, so STORED != CONTROL is expected and is NOT this migration's
 * doing. CONTROL re-runs today's engine on today's (wall-clock-as-UTC) instant;
 * NEW re-runs today's engine on the TRUE instant. Only CONTROL -> NEW is
 * attributable to the temporal migration, and that is the delta reported as the
 * archetype flip count. Reading STORED -> NEW instead would credit this change
 * with a year of unrelated engine drift.
 *
 * ── USAGE ───────────────────────────────────────────────────────────────────
 *
 *   # Dry run (default) — full diff + archetype flip sizing, no writes.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/backfillBirthInstant.ts
 *
 *   # Same, plus what the naive (sect-from-instant) reading would have done.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/backfillBirthInstant.ts --show-trap
 *
 *   # Zone normalization only — no chart calls, no backend needed.
 *   bun run scripts/backfillBirthInstant.ts --zones-only
 *
 *   # Apply — one transaction per user, both profile surfaces + the columns.
 *   TZ=UTC ALCHM_MCP_BACKEND_URL=https://alchm.kitchen \
 *     bun run scripts/backfillBirthInstant.ts --apply
 *
 * Raw `pg`, no ORM. Reads DATABASE_PUBLIC_URL from the environment or
 * `.env.development.local`.
 */

import fs from "node:fs";
import path from "node:path";
import pg from "pg";

import { calculateNatalChart } from "@/services/natalChartService";
import { toEsmsShares, selectArchetype } from "@/utils/alchemicalConstitution";
import { isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import {
  resolveBirthZone,
  wallClockToInstant,
  isFabricatedFallbackPin,
  type ResolvedZone,
  type WallClockResolution,
} from "@/utils/astrology/birthTimezone";

// ───────────────────────────────── flags ─────────────────────────────────

const ARGV = new Set(process.argv.slice(2));
const APPLY = ARGV.has("--apply");
const ZONES_ONLY = ARGV.has("--zones-only");
const SHOW_TRAP = ARGV.has("--show-trap");
/**
 * Also process the 52 agent placeholders. Off by default and expected to stay
 * off: `1900-01-01T12:00:00.000Z` is a sentinel, so "correcting" it to 17:00Z
 * produces a more precise fiction, not a more accurate birth.
 */
const INCLUDE_AGENTS = ARGV.has("--include-agents");

/** The sentinel every agent placeholder carries. */
const AGENT_SENTINEL_DATETIME = "1900-01-01T12:00:00.000Z";

// ─────────────────────────────── guardrails ───────────────────────────────

function assertUtc(): void {
  if (new Date().getTimezoneOffset() !== 0) {
    console.error(
      `FATAL: run under UTC (TZ=${process.env.TZ ?? "<unset>"}, offset ` +
        `${new Date().getTimezoneOffset()}min).\n` +
        "`isSectDiurnalForBirth` still reads LOCAL getters, so sect — and with it\n" +
        "the archetype — depends on the operator's clock. The control column would\n" +
        "measure this laptop rather than production.\n" +
        "Re-run with: TZ=UTC bun run scripts/backfillBirthInstant.ts …",
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
  const url = process.env.DATABASE_PUBLIC_URL || env.DATABASE_PUBLIC_URL || env.DATABASE_URL;
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
  [k: string]: unknown;
}

interface Row {
  user_id: string;
  email: string | null;
  is_agent: boolean;
  jsonb_birth: BirthData | null;
  users_profile: Record<string, unknown> | null;
  up_birth: BirthData | Record<string, never> | null;
  base_archetype: string | null;
  has_constitution: boolean;
  stored_esms: [number, number, number, number] | null;
}

type Disposition =
  | "MIGRATABLE"
  | "SKIP_AGENT_SENTINEL"
  | "REFUSE_FABRICATED_PIN"
  | "REFUSE_NO_ZONE"
  | "REFUSE_UNUSABLE_BIRTHDATA";

interface Plan {
  row: Row;
  disposition: Disposition;
  reason?: string;
  birth?: BirthData;
  zone?: ResolvedZone;
  wallClock?: Date;
  trueInstant?: Date;
  offsetMinutes?: number;
  resolution?: WallClockResolution;
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

// ───────────────────────────── planning ─────────────────────────────

function planRow(row: Row): Plan {
  const birth = row.jsonb_birth;

  if (!isUsableBirthData(birth)) {
    return {
      row,
      disposition: "REFUSE_UNUSABLE_BIRTHDATA",
      reason: "birthData lacks a parseable dateTime or finite coordinates",
    };
  }

  if (!INCLUDE_AGENTS && (row.is_agent || birth.dateTime === AGENT_SENTINEL_DATETIME)) {
    return {
      row,
      disposition: "SKIP_AGENT_SENTINEL",
      reason: `placeholder birth ${birth.dateTime}`,
      birth,
    };
  }

  if (isFabricatedFallbackPin(birth.latitude, birth.longitude)) {
    return {
      row,
      disposition: "REFUSE_FABRICATED_PIN",
      reason:
        "coordinates are the retired `ignite` route's Fallback NY literal — the " +
        "birthplace was never geocoded, so no instant can be derived from it",
      birth,
    };
  }

  const zone = resolveBirthZone(birth);
  if (!zone.zone) {
    return {
      row,
      disposition: "REFUSE_NO_ZONE",
      reason: `no IANA zone resolvable (stored: ${birth.timezone ?? "<none>"})`,
      birth,
      zone,
    };
  }

  const wallClock = new Date(birth.dateTime);
  const { instant, offsetMinutes, resolution } = wallClockToInstant(wallClock, zone.zone);

  return {
    row,
    disposition: "MIGRATABLE",
    birth,
    zone,
    wallClock,
    trueInstant: instant,
    offsetMinutes,
    resolution,
  };
}

// ─────────────────────── archetype impact sizing ───────────────────────

/**
 * Derive the constitution the way `/api/agent-forge/ignite` does.
 *
 * ⚠️ The ephemeris instant is supplied via `utcInstant`, NEVER by overriding
 * `dateTime`. This function did the latter at first and it was wrong in a way
 * that is worth spelling out, because it is the same trap this whole migration
 * exists to avoid, sprung one level down:
 *
 *   `calculateNatalChart` derives sect INTERNALLY from `birthData.dateTime`
 *   (natalChartService.ts:407) and folds it into `alchemicalProperties`.
 *   Overwriting `dateTime` with 18:24Z therefore flipped the chart's own sect to
 *   nocturnal, while `selectArchetype` below was still being handed `diurnal`
 *   from the wall clock — an internally inconsistent constitution, half day and
 *   half night. MEASURED: it moved 2ee5eb05 from 37/33/19/10 to 20/19/42/18.
 *
 * Setting `utcInstant` keeps the two halves aligned: the ephemeris moves, sect
 * stays on `dateTime`, and both agree.
 *
 * @param useTrueInstant query the sky at `birth.utcInstant`/`trueInstant`
 *                       (NEW) rather than at the wall clock (CONTROL)
 */
async function deriveConstitution(
  birth: BirthData,
  trueInstant: Date | null,
): Promise<{ esms: [number, number, number, number]; archetype: string; diurnal: boolean }> {
  const chart = await calculateNatalChart({
    ...birth,
    // NEW: the true instant. CONTROL: undefined, so calculateNatalChart falls
    // back to `dateTime` and reproduces exactly what prod computed before.
    utcInstant: trueInstant ? trueInstant.toISOString() : undefined,
  });
  const shares = toEsmsShares(chart.alchemicalProperties);
  // Sect from the WALL CLOCK, matching what calculateNatalChart used internally.
  const diurnal = isSectDiurnal(new Date(birth.dateTime));
  const { baseArchetype } = selectArchetype(shares, diurnal);
  return {
    esms: [
      Math.round(shares.spirit),
      Math.round(shares.essence),
      Math.round(shares.matter),
      Math.round(shares.substance),
    ],
    archetype: baseArchetype,
    diurnal,
  };
}

// ─────────────────────────────── the write ───────────────────────────────

/**
 * Mirrors `userDatabase.updateUserProfile`'s dual-write, plus the new columns,
 * in ONE transaction. `dateTime` is left ALONE: it remains the wall clock, which
 * is what every existing reader already assumes. The true instant is ADDED as
 * `utcInstant`. Renaming `dateTime` would be a silent semantic swap under every
 * consumer that reads it.
 */
async function writeRow(client: pg.PoolClient, plan: Plan): Promise<void> {
  const { row, birth, zone, wallClock, trueInstant } = plan;
  if (!birth || !zone?.zone || !wallClock || !trueInstant) {
    throw new Error("writeRow called on an unresolved plan");
  }

  const nextBirth: BirthData = {
    ...birth,
    // unchanged — still the wall clock, still labelled Z, still what sect reads
    dateTime: birth.dateTime,
    // added
    utcInstant: trueInstant.toISOString(),
    timezone: zone.zone,
    timezoneBasis: zone.basis,
    ...(zone.storedTimezone && zone.storedTimezone !== zone.zone
      ? { timezoneStoredBefore: zone.storedTimezone }
      : {}),
  };

  const mergedProfile = {
    ...(row.users_profile ?? {}),
    birthData: nextBirth,
  };

  await client.query("BEGIN");
  try {
    await client.query(
      `UPDATE users SET profile = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
      [row.user_id, JSON.stringify(mergedProfile)],
    );

    await client.query(
      `INSERT INTO user_profiles (
         user_id, birth_data,
         birth_local_wall_time, birth_true_utc_instant,
         birth_timezone, birth_timezone_basis, birth_instant_migrated_at)
       VALUES ($1::uuid, $2::jsonb, $3::timestamp, $4::timestamptz, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         birth_data                = EXCLUDED.birth_data,
         birth_local_wall_time     = EXCLUDED.birth_local_wall_time,
         birth_true_utc_instant    = EXCLUDED.birth_true_utc_instant,
         birth_timezone            = EXCLUDED.birth_timezone,
         birth_timezone_basis      = EXCLUDED.birth_timezone_basis,
         birth_instant_migrated_at = NOW(),
         updated_at                = CURRENT_TIMESTAMP`,
      [
        row.user_id,
        JSON.stringify(nextBirth),
        // wall clock as a naive timestamp: strip the bogus Z, keep the reading
        wallClock.toISOString().slice(0, 19),
        trueInstant.toISOString(),
        zone.zone,
        zone.basis,
      ],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

// ──────────────────────────────── main ────────────────────────────────

async function main(): Promise<void> {
  if (!ZONES_ONLY) {
    assertUtc();
    if (!process.env.ALCHM_MCP_BACKEND_URL?.trim()) {
      console.error(
        "FATAL: set ALCHM_MCP_BACKEND_URL=https://alchm.kitchen so the archetype\n" +
          "sizing reaches the real astrologize backend. Use --zones-only to run the\n" +
          "zone normalization without any chart calls.",
      );
      process.exit(1);
    }
  }

  const pool = new pg.Pool({
    connectionString: resolveConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  const client = await pool.connect();

  try {
    // PREFLIGHT: migration 76 must be applied before --apply can write.
    //
    // Learned the hard way — the first `--apply` ran the whole scope + archetype
    // sizing, then died on row 1 with `42703: column "birth_local_wall_time"
    // does not exist`. The per-row transaction rolled that back cleanly, so
    // nothing was corrupted, but a run that does all its thinking and then
    // discovers the schema is missing is a run that should have refused at the
    // top. Checked for every mode, not just --apply, so a dry run also tells you
    // the target is not ready.
    const REQUIRED_COLUMNS = [
      "birth_local_wall_time",
      "birth_true_utc_instant",
      "birth_timezone",
      "birth_timezone_basis",
      "birth_instant_migrated_at",
    ];
    const { rows: present } = await client.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = ANY($1::text[])`,
      [REQUIRED_COLUMNS],
    );
    const missing = REQUIRED_COLUMNS.filter(
      (c) => !present.some((r) => r.column_name === c),
    );
    if (missing.length > 0) {
      console.error(
        `\nFATAL: migration 76 is not applied to this database.\n` +
          `  missing column(s): ${missing.join(", ")}\n\n` +
          "Apply it first:\n" +
          "  bun run scripts/run-sql-migration.ts database/init/76-birth-instant-dual-storage.sql\n",
      );
      process.exit(1);
    }

    const { rows } = await client.query<Row>(`
      SELECT
        u.id::text                        AS user_id,
        u.email,
        u.is_agent,
        u.profile -> 'birthData'          AS jsonb_birth,
        u.profile                         AS users_profile,
        up.birth_data                     AS up_birth,
        ac.base_archetype,
        (ac.user_id IS NOT NULL)          AS has_constitution,
        CASE WHEN ac.user_id IS NOT NULL
             THEN ARRAY[ac.spirit_balance, ac.essence_balance,
                        ac.matter_balance, ac.substance_balance]
        END                               AS stored_esms
      FROM users u
      LEFT JOIN user_profiles up            ON up.user_id = u.id
      LEFT JOIN alchemical_constitutions ac ON ac.user_id = u.id
      WHERE u.profile -> 'birthData' ? 'dateTime'
      ORDER BY u.is_agent, u.profile->'birthData'->>'dateTime'
    `);

    const plans = rows.map(planRow);
    const byDisposition = new Map<Disposition, Plan[]>();
    for (const p of plans) {
      const list = byDisposition.get(p.disposition) ?? [];
      list.push(p);
      byDisposition.set(p.disposition, list);
    }

    console.log(`\n━━━ SCOPE (${rows.length} rows with birthData) ━━━`);
    for (const d of [
      "MIGRATABLE",
      "SKIP_AGENT_SENTINEL",
      "REFUSE_FABRICATED_PIN",
      "REFUSE_NO_ZONE",
      "REFUSE_UNUSABLE_BIRTHDATA",
    ] as Disposition[]) {
      const n = byDisposition.get(d)?.length ?? 0;
      if (n > 0) console.log(`  ${d.padEnd(26)} ${n}`);
    }

    // ── zone normalization report ──────────────────────────────────────
    console.log(`\n━━━ ZONE NORMALIZATION ━━━`);
    const migratable = byDisposition.get("MIGRATABLE") ?? [];
    for (const p of migratable) {
      const z = p.zone!;
      const flags: string[] = [];
      if (z.storedIsRawOffset) flags.push("raw-offset → IANA");
      if (z.storedDisagrees) flags.push("STORED ZONE DISAGREES WITH PIN");
      if (p.resolution !== "UNIQUE") flags.push(`DST ${p.resolution}`);
      console.log(
        `  ${p.row.user_id.slice(0, 8)}  ${(p.row.email ?? "—").padEnd(32)}` +
          `${(z.storedTimezone ?? "<none>").padEnd(18)} → ${z.zone}` +
          `  (${(p.offsetMinutes! / 60).toFixed(2).padStart(6)}h)` +
          (flags.length ? `  ⚠ ${flags.join("; ")}` : ""),
      );
      console.log(
        `            wall ${p.wallClock!.toISOString()}  →  instant ${p.trueInstant!.toISOString()}` +
          `  (shift ${((p.trueInstant!.getTime() - p.wallClock!.getTime()) / 3600000).toFixed(2)}h)`,
      );
    }

    for (const d of [
      "REFUSE_FABRICATED_PIN",
      "REFUSE_NO_ZONE",
      "REFUSE_UNUSABLE_BIRTHDATA",
    ] as Disposition[]) {
      for (const p of byDisposition.get(d) ?? []) {
        console.log(`  ${p.row.user_id.slice(0, 8)}  ${p.row.email ?? "—"}  ${d}\n            ${p.reason}`);
      }
    }
    const skipped = byDisposition.get("SKIP_AGENT_SENTINEL") ?? [];
    if (skipped.length) {
      console.log(
        `  …and ${skipped.length} agent placeholder(s) at ${AGENT_SENTINEL_DATETIME} left untouched ` +
          "(--include-agents to override).",
      );
    }

    if (ZONES_ONLY) {
      console.log("\n--zones-only: stopping before any chart call.\n");
      return;
    }

    // ── archetype impact sizing ────────────────────────────────────────
    console.log(`\n━━━ ARCHETYPE IMPACT (STORED / CONTROL / NEW) ━━━`);
    console.log(
      "  STORED  = the constitution row as it stands (older engine)\n" +
        "  CONTROL = today's engine on today's instant  → isolates engine drift\n" +
        "  NEW     = today's engine on the TRUE instant → the migration's own effect\n" +
        "  Only CONTROL → NEW is attributable to this migration.\n",
    );

    let flips = 0;
    let flipsWithConstitution = 0;
    let controlMatchesStored = 0;
    let storedComparable = 0;
    let naiveFlips = 0;
    /**
     * STORED -> NEW. Distinct from CONTROL -> NEW and answering a different
     * question: this is what a user would SEE change on their profile, because
     * STORED is the label the table serves today. It can be smaller than the
     * attributable flip count — engine drift and the temporal shift can move the
     * archetype away and back, landing on the original label by two wrongs.
     */
    let userVisibleFlips = 0;

    for (const p of migratable) {
      const { birth, wallClock, trueInstant, row } = p;
      let control: Awaited<ReturnType<typeof deriveConstitution>>;
      let next: Awaited<ReturnType<typeof deriveConstitution>>;
      try {
        // sect reads the WALL CLOCK in both — only the ephemeris instant moves.
        control = await deriveConstitution(birth!, null);
        next = await deriveConstitution(birth!, trueInstant!);
      } catch (err) {
        console.log(`  ${row.user_id.slice(0, 8)}  FAILED to derive: ${(err as Error).message}`);
        continue;
      }

      const flipped = control.archetype !== next.archetype;
      if (flipped) {
        flips += 1;
        if (row.has_constitution) flipsWithConstitution += 1;
      }
      if (row.has_constitution && row.base_archetype) {
        storedComparable += 1;
        if (row.base_archetype === control.archetype) controlMatchesStored += 1;
        if (row.base_archetype !== next.archetype) userVisibleFlips += 1;
      }

      console.log(
        `  ${row.user_id.slice(0, 8)}  ${(row.email ?? "—").padEnd(32)}` +
          `${row.has_constitution ? "" : "(no constitution row) "}`,
      );
      console.log(
        `      STORED  ${(row.base_archetype ?? "—").padEnd(18)} ${row.stored_esms?.join("/") ?? "—"}`,
      );
      console.log(`      CONTROL ${control.archetype.padEnd(18)} ${control.esms.join("/")}`);
      console.log(
        `      NEW     ${next.archetype.padEnd(18)} ${next.esms.join("/")}` +
          (flipped ? "   ← ARCHETYPE FLIPS" : ""),
      );

      if (SHOW_TRAP) {
        const naiveDiurnal = isSectDiurnal(trueInstant!);
        if (naiveDiurnal !== control.diurnal) {
          naiveFlips += 1;
          console.log(
            `      ⚠ TRAP: sourcing sect from the true instant would flip ` +
              `${control.diurnal ? "diurnal→nocturnal" : "nocturnal→diurnal"} here. Not done.`,
          );
        }
      }
    }

    console.log(`\n━━━ SUMMARY ━━━`);
    console.log(`  migratable rows                     : ${migratable.length}`);
    console.log(`  archetypes that flip (CONTROL → NEW): ${flips}`);
    console.log(`  …of which have a constitution row   : ${flipsWithConstitution}`);
    console.log(
      `  control gate (CONTROL == STORED)    : ${controlMatchesStored}/${storedComparable}` +
        (storedComparable === 0
          ? "  — no comparable rows"
          : controlMatchesStored === storedComparable
            ? "  ✔ engine reproduces stored archetypes; the flip count above is this migration's alone"
            : "  ⚠ engine drift present; STORED → NEW would ALSO include changes this migration did not cause"),
    );
    console.log(
      `  archetypes a USER would see change     : ${userVisibleFlips}/${storedComparable}` +
        "  (STORED → NEW, i.e. the label served today vs the one that would be written)",
    );
    if (SHOW_TRAP) {
      console.log(`  sect flips avoided by reading the wall clock: ${naiveFlips}`);
    }

    console.log(
      "\n  ⚠ THIS SCRIPT DOES NOT WRITE THE CHART OR THE CONSTITUTION.\n" +
        "    --apply persists birth_data + the three new columns only. The stored\n" +
        "    natal_chart and alchemical_constitutions rows still hold geometry\n" +
        "    computed from the OLD instant, so applying this alone leaves the two\n" +
        "    inconsistent. Run `healConstitutionGeometry.ts --recompute-all` after\n" +
        "    it to bring the charts and constitutions onto the migrated instant.",
    );

    // ── write ──────────────────────────────────────────────────────────
    console.log(`\n━━━ ${APPLY ? "APPLY" : "DRY RUN"} ━━━`);
    if (!APPLY) {
      console.log(`  ${migratable.length} row(s) would be written. No changes made.`);
      console.log("  Re-run with --apply to commit.\n");
      return;
    }

    for (const p of migratable) {
      await writeRow(client, p);
      console.log(
        `  ✔ ${p.row.user_id.slice(0, 8)} committed (users.profile + user_profiles + columns)`,
      );
    }
    console.log(`\n  ${migratable.length} row(s) migrated.\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

await main();

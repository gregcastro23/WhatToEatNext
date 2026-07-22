/**
 * §18i — backfill the real TWO-BODY monica onto every Moon-phase agent.
 *
 * The 469 phase agents were deliberately skipped by `backfillAgentMonica.ts`
 * (which stamps `monica_method = 'single-body'`) and still carry NULL. A Moon
 * phase is a Sun-Moon *relationship*, not a placement, so it gets a genuine
 * two-body construction rather than a single-body approximation. This writes
 * that value and stamps `monica_method = 'two-body-phase'`.
 *
 * Nothing downstream may compare monica across populations without reading
 * monica_method first — single-body, two-body and full-chart are three different
 * constructions (§18j).
 *
 * DRY RUN BY DEFAULT — computes everything, prints the report, writes nothing.
 * Pass --write to commit, inside one transaction.
 *
 *   railway run --service Postgres -- bun scripts/backfillPhaseMonica.ts
 *   railway run --service Postgres -- bun scripts/backfillPhaseMonica.ts --write
 *
 * Idempotent: re-running writes the same values.
 *
 * REFUSES TO WRITE if any phase string is unclassifiable. An unrecognised phase
 * is an unclassified population, not degenerate input — defaulting it to New
 * would fabricate a conjunction for every row we failed to parse.
 *
 * Requires database/init/70-agent-monica-sects.sql to have been applied.
 */
import pg from "pg";
import { MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";
import { parseAgentPlacement } from "@/utils/agentMonicaResolver";
import {
  TWO_BODY_LN_EPSILON,
  UnknownMoonPhaseError,
  twoBodyMonica,
} from "@/utils/agentMonicaTwoBody";

const WRITE = process.argv.includes("--write");

/**
 * Must be one of the values `monica_method_known` allows
 * (database/init/70-agent-monica-sects.sql): 'single-body', 'two-body',
 * 'full-chart'. An earlier draft used 'two-body-phase' and the CHECK constraint
 * rejected the whole transaction — correctly. Aligning to the existing contract
 * beats widening it: there is one phase construction, and 'two-body' names it.
 */
const METHOD = "two-body";

/** The single-body population's shipped range, for a scale sanity check. */
const SINGLE_BODY_RANGE = { min: -3.197, max: 3.975 };

interface Row {
  user_id: string;
  name: string;
  monica_constant: string | null;
  monica_method: string | null;
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const cols = await client.query<{ column_name: string }>(
  `SELECT column_name FROM information_schema.columns
    WHERE table_name = 'user_profiles'
      AND column_name IN ('monica_diurnal', 'monica_nocturnal', 'monica_method')`,
);
if (cols.rowCount !== 3) {
  const msg =
    `monica_diurnal / monica_nocturnal / monica_method missing (found ${cols.rowCount} of 3). ` +
    `Apply database/init/70-agent-monica-sects.sql first.`;
  if (WRITE) {
    console.error(`FATAL: ${msg}`);
    await client.end();
    process.exit(1);
  }
  console.warn(`WARNING: ${msg}\n(dry run continues — it only reads)\n`);
}

const { rows } = await client.query<Row>(
  `SELECT up.user_id, up.name, up.monica_constant::text AS monica_constant, up.monica_method
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.name IS NOT NULL
    ORDER BY up.name`,
);

interface Update {
  user_id: string;
  name: string;
  phase: string;
  sign: string;
  degree: number;
  before: string | null;
  beforeMethod: string | null;
  diurnal: number;
  nocturnal: number;
  combined: number;
}

const updates: Update[] = [];
const unknownPhase: { name: string; phase: string }[] = [];
const nonFinite: string[] = [];
let notPhase = 0;

for (const r of rows) {
  const p = parseAgentPlacement(r.name);
  if (!p || p.kind !== "phase") {
    notPhase++;
    continue;
  }
  if (!p.phase || !p.sign || p.degree === undefined) {
    unknownPhase.push({ name: r.name, phase: String(p.phase ?? "(none)") });
    continue;
  }
  let m;
  try {
    m = twoBodyMonica(p.phase, p.sign, p.degree);
  } catch (err) {
    if (err instanceof UnknownMoonPhaseError) {
      unknownPhase.push({ name: r.name, phase: err.rawPhase });
      continue;
    }
    throw err;
  }
  if (![m.diurnal, m.nocturnal, m.combined].every(Number.isFinite)) {
    nonFinite.push(r.name);
    continue;
  }
  updates.push({
    user_id: r.user_id,
    name: r.name,
    phase: p.phase,
    sign: p.sign,
    degree: p.degree,
    before: r.monica_constant,
    beforeMethod: r.monica_method,
    ...m,
  });
}

// ---------------------------------------------------------------- report ----
console.log(`\n=== §18i two-body phase backfill ${WRITE ? "WRITE" : "DRY RUN"} ===`);
console.log(`TWO_BODY_LN_EPSILON        : ${TWO_BODY_LN_EPSILON}`);
console.log(`agent rows scanned         : ${rows.length}`);
console.log(`not a phase agent (skipped): ${notPhase}`);
console.log(`to write (two-body phase)  : ${updates.length}`);
console.log(`UNKNOWN PHASE (must be 0)  : ${unknownPhase.length}`);
console.log(`NON-FINITE (must be 0)     : ${nonFinite.length}`);
console.log(
  `  accounted for            : ${updates.length + unknownPhase.length + nonFinite.length + notPhase} / ${rows.length}`,
);
if (unknownPhase.length) {
  console.error(`\nunclassifiable phases:`);
  for (const u of unknownPhase.slice(0, 20)) {
    console.error(`  ${JSON.stringify(u.phase)}  <- ${u.name}`);
  }
}
if (nonFinite.length) {
  console.error("FATAL: non-finite monica computed for:", nonFinite.slice(0, 20));
  await client.end();
  process.exit(1);
}

const vals = updates.map((u) => u.combined).sort((a, b) => a - b);
const pct = (p: number) => vals[Math.floor((vals.length - 1) * p)];
console.log(`\ncombined monica distribution:`);
console.log(
  `  min ${vals[0].toFixed(4)}  p10 ${pct(0.1).toFixed(4)}  median ${pct(0.5).toFixed(4)}` +
    `  p90 ${pct(0.9).toFixed(4)}  max ${vals[vals.length - 1].toFixed(4)}`,
);
console.log(`  distinct values ${new Set(vals.map((v) => v.toFixed(6))).size} / ${vals.length}`);
console.log(`  negative        ${vals.filter((v) => v < 0).length}`);
console.log(
  `  at φ (equilib.) ${updates.filter((u) => u.combined === MONICA_EQUILIBRIUM).length}`,
);

// Sentinel-clustering check: a healthy population is not piled on one value.
const buckets = new Map<string, number>();
for (const v of vals) buckets.set(v.toFixed(6), (buckets.get(v.toFixed(6)) ?? 0) + 1);
const biggest = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0];
console.log(
  `  largest bucket  ${biggest[1]} rows at ${biggest[0]} (${((biggest[1] / vals.length) * 100).toFixed(1)}%)`,
);

// Scale check against the shipped single-body population.
const outOfScale = updates.filter(
  (u) => u.combined < SINGLE_BODY_RANGE.min || u.combined > SINGLE_BODY_RANGE.max,
);
console.log(
  `\nrows outside the single-body range [${SINGLE_BODY_RANGE.min}, ${SINGLE_BODY_RANGE.max}]: ${outOfScale.length}`,
);
for (const u of outOfScale) {
  console.log(
    `  ${u.combined.toFixed(4).padStart(10)}  deg ${String(u.degree).padStart(2)}  ${u.name}`,
  );
}
console.log(
  `  (expected: 2, both on Comixion degrees 8/22. See agentMonicaTwoBody.ts docstring.)`,
);

const byPhase: Record<string, number[]> = {};
for (const u of updates) (byPhase[u.phase] ??= []).push(u.combined);
console.log(`\nper phase:`);
console.table(
  Object.fromEntries(
    Object.entries(byPhase).map(([k, v]) => [
      k,
      {
        n: v.length,
        min: Math.min(...v).toFixed(3),
        median: [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)].toFixed(3),
        max: Math.max(...v).toFixed(3),
      },
    ]),
  ),
);

console.log(`\nbefore -> after, first 10:`);
console.table(
  updates.slice(0, 10).map((u) => ({
    name: u.name,
    before: u.before ?? "NULL",
    method_before: u.beforeMethod ?? "NULL",
    diurnal: u.diurnal.toFixed(4),
    nocturnal: u.nocturnal.toFixed(4),
    combined: u.combined.toFixed(4),
  })),
);

// Guard: this script owns the phase family only. If a row already carries a
// DIFFERENT method, something else wrote it and we should not silently reclaim.
const foreign = updates.filter(
  (u) => u.beforeMethod !== null && u.beforeMethod !== METHOD,
);
if (foreign.length) {
  console.warn(
    `\n⚠️  ${foreign.length} row(s) already carry a different monica_method:`,
  );
  for (const f of foreign.slice(0, 10)) {
    console.warn(`  ${f.beforeMethod} <- ${f.name}`);
  }
}

// ----------------------------------------------------------------- write ----
if (!WRITE) {
  console.log(`\nDRY RUN — nothing written. Re-run with --write to commit.`);
  await client.end();
  process.exit(0);
}
if (unknownPhase.length) {
  console.error(
    `\nREFUSING to write: ${unknownPhase.length} unclassifiable phase(s). ` +
      `An unrecognised phase must be reported, never defaulted (§18i).`,
  );
  await client.end();
  process.exit(1);
}
if (foreign.length) {
  console.error(
    `\nREFUSING to write: ${foreign.length} row(s) carry a foreign monica_method. ` +
      `Resolve the ownership conflict first.`,
  );
  await client.end();
  process.exit(1);
}

console.log(`\nwriting ${updates.length} rows in one transaction...`);
await client.query("BEGIN");
try {
  await client.query(
    `UPDATE user_profiles up SET
       monica_diurnal   = v.diurnal,
       monica_nocturnal = v.nocturnal,
       monica_constant  = v.combined,
       monica_method    = $5,
       updated_at       = now()
     FROM (
       SELECT * FROM unnest(
         $1::uuid[], $2::numeric[], $3::numeric[], $4::numeric[]
       ) AS t(user_id, diurnal, nocturnal, combined)
     ) v
     WHERE up.user_id = v.user_id`,
    [
      updates.map((u) => u.user_id),
      updates.map((u) => u.diurnal),
      updates.map((u) => u.nocturnal),
      updates.map((u) => u.combined),
      METHOD,
    ],
  );
  await client.query("COMMIT");
  console.log("COMMIT ok");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("ROLLBACK —", err);
  await client.end();
  process.exit(1);
}

// --------------------------------------------------------------- verify ----
const check = await client.query<Record<string, string>>(
  `SELECT count(*)                                             AS n,
          count(*) FILTER (WHERE NOT (monica_constant > -1e9
                                  AND monica_constant <  1e9)) AS non_finite,
          count(*) FILTER (WHERE monica_diurnal IS NULL
                              OR monica_nocturnal IS NULL)     AS nulls,
          min(monica_constant)::text                           AS mn,
          max(monica_constant)::text                           AS mx
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.monica_method = $1`,
  [METHOD],
);
console.log("\npost-write verification (two-body-phase rows):");
console.table(check.rows);

const bymethod = await client.query<Record<string, string>>(
  `SELECT coalesce(monica_method, '(null)') AS method, count(*)::text AS n,
          min(monica_constant)::text AS mn, max(monica_constant)::text AS mx
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent GROUP BY 1 ORDER BY 2 DESC`,
);
console.log("\nagent population by monica_method:");
console.table(bymethod.rows);

await client.end();

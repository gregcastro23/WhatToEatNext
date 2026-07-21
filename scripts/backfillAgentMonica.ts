/**
 * §18h — backfill the real single-body monica onto every planetary agent.
 *
 * The 3672 persisted "monica" values are not thermodynamic monicas. 3600 of them
 * are round (0,1) sentinels (0.50 x1330, 0.55 x556, ...) that the sync-debit
 * COALESCE let in from upstream; the rest hold a longitude average. This writes
 * the real §18c value, computed from each agent's own name, to
 * monica_diurnal / monica_nocturnal / monica_constant / monica_method.
 * monica_method is stamped 'single-body' — single-body, two-body (phase) and
 * full-chart (person) agents build monica from different constructions, so
 * nothing downstream can compare values across populations without knowing
 * which one produced a given row (§18j).
 *
 * DRY RUN BY DEFAULT — computes everything, prints the report, writes nothing.
 * Pass --write to commit, inside one transaction.
 *
 *   railway run --service Postgres -- bun scripts/backfillAgentMonica.ts
 *   railway run --service Postgres -- bun scripts/backfillAgentMonica.ts --write
 *
 * Idempotent: re-running writes the same values. Rows whose name is not a
 * single-body placement (people, phase agents, junk) are SKIPPED and left NULL —
 * never guessed at, never zeroed. Phase agents are a deliberate omission: a Moon
 * phase is a Sun-Moon relationship and gets a genuine two-body monica in the
 * §18 follow-up, not a single-body approximation.
 *
 * Requires database/init/70-agent-monica-sects.sql to have been applied.
 */
import pg from "pg";
import { agentMonica } from "@/utils/agentMonica";
import { parseAgentPlacement } from "@/utils/agentMonicaResolver";

const WRITE = process.argv.includes("--write");

interface Row {
  user_id: string;
  name: string;
  monica_constant: string | null;
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

// Fail loudly if the migration has not been applied, rather than writing nothing
// and reporting success.
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
  `SELECT up.user_id, up.name, up.monica_constant::text AS monica_constant
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.name IS NOT NULL
    ORDER BY up.name`,
);

interface Update {
  user_id: string;
  name: string;
  before: string | null;
  diurnal: number;
  nocturnal: number;
  combined: number;
}

const updates: Update[] = [];
const skipped: Record<string, string[]> = { phase: [], unparseable: [] };
const nonFinite: string[] = [];

for (const r of rows) {
  const p = parseAgentPlacement(r.name);
  if (!p) {
    skipped.unparseable.push(r.name);
    continue;
  }
  if (p.kind !== "single") {
    skipped.phase.push(r.name);
    continue;
  }
  const m = agentMonica(p.planet, p.sign, p.degree);
  if (![m.diurnal, m.nocturnal, m.combined].every(Number.isFinite)) {
    nonFinite.push(r.name);
    continue;
  }
  updates.push({
    user_id: r.user_id,
    name: r.name,
    before: r.monica_constant,
    ...m,
  });
}

// ---------------------------------------------------------------- report ----
console.log(`\n=== §18 backfill ${WRITE ? "WRITE" : "DRY RUN"} ===`);
console.log(`agent rows scanned          : ${rows.length}`);
console.log(`to write (single-body)      : ${updates.length}`);
console.log(`skipped — phase (two-body)  : ${skipped.phase.length}`);
console.log(`skipped — not a placement   : ${skipped.unparseable.length}`);
console.log(`NON-FINITE (must be 0)      : ${nonFinite.length}`);
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
console.log(`  distinct values ${new Set(vals.map((v) => v.toFixed(6))).size}`);
console.log(
  `  negative ${vals.filter((v) => v < 0).length} (${((vals.filter((v) => v < 0).length / vals.length) * 100).toFixed(1)}%)`,
);

const byPlanet: Record<string, number[]> = {};
for (const u of updates) {
  const planet = parseAgentPlacement(u.name)!.planet;
  (byPlanet[planet] ??= []).push(u.combined);
}
console.log(`\nper planet:`);
console.table(
  Object.fromEntries(
    Object.entries(byPlanet).map(([k, v]) => [
      k,
      {
        n: v.length,
        min: Math.min(...v).toFixed(3),
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
    diurnal: u.diurnal.toFixed(4),
    nocturnal: u.nocturnal.toFixed(4),
    combined: u.combined.toFixed(4),
  })),
);

if (skipped.unparseable.length) {
  console.log(`\nnot a placement — left untouched (first 30):`);
  console.log("  " + skipped.unparseable.slice(0, 30).join("\n  "));
}

// ----------------------------------------------------------------- write ----
if (!WRITE) {
  console.log(`\nDRY RUN — nothing written. Re-run with --write to commit.`);
  await client.end();
  process.exit(0);
}

console.log(`\nwriting ${updates.length} rows in one transaction...`);
await client.query("BEGIN");
try {
  // One statement, unnested arrays — 4276 rows in a single round trip.
  await client.query(
    `UPDATE user_profiles up SET
       monica_diurnal   = v.diurnal,
       monica_nocturnal = v.nocturnal,
       monica_constant  = v.combined,
       monica_method    = 'single-body',
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
const check = await client.query<{
  n: string; non_finite: string; nulls: string; wrong_method: string; mn: string; mx: string;
}>(
  `SELECT count(*)                                                        AS n,
          count(*) FILTER (WHERE NOT (monica_constant > -1e9
                                  AND monica_constant <  1e9))            AS non_finite,
          count(*) FILTER (WHERE monica_diurnal IS NULL
                              OR monica_nocturnal IS NULL)                AS nulls,
          count(*) FILTER (WHERE monica_method IS DISTINCT FROM 'single-body') AS wrong_method,
          min(monica_constant)::text                                      AS mn,
          max(monica_constant)::text                                      AS mx
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.monica_diurnal IS NOT NULL`,
);
console.log("\npost-write verification:");
console.table(check.rows);

await client.end();

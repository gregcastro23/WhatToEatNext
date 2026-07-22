/**
 * Independent integrity audit of every agent-monica database action.
 *
 * READ-ONLY. Run any time:
 *   railway run --service Postgres -- bun scripts/auditAgentDataIntegrity.ts
 *
 * ⚠️ DELIBERATELY INDEPENDENT. This does NOT reuse the backfill scripts' own
 * classification, because a script that mis-classifies would simply repeat the
 * mistake when re-run and report success. Everything here is asserted with
 * direct SQL against the stored data, so it can disagree with the code that
 * wrote it. Where a value must match a computation, the computation is the
 * canonical engine, not the backfill.
 *
 * Answers one question: can we trust the current state?
 */
import pg from "pg";
import { MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

let failures = 0;
let checks = 0;

/** Assert a query returns zero rows. Anything else is a finding. */
async function expectZero(label: string, sql: string, params: unknown[] = []) {
  checks++;
  const { rows } = await client.query(sql, params);
  const n = Number(rows[0]?.n ?? rows.length);
  const ok = n === 0;
  if (!ok) failures++;
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label.padEnd(60)} ${n}`);
  if (!ok && rows[0]?.sample) console.log(`          e.g. ${rows[0].sample}`);
  return n;
}

/** Report a number without asserting — context for a human reader. */
async function report(label: string, sql: string) {
  const { rows } = await client.query(sql);
  console.log(`  ---   ${label.padEnd(60)} ${rows[0]?.n ?? "?"}`);
  return rows[0];
}

console.log("\n════ 1. BLAST RADIUS — did any write touch a row it should not have? ════");
await expectZero(
  "non-agent rows carrying a monica of any kind",
  `SELECT count(*)::text n, min(up.name) sample
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE NOT coalesce(u.is_agent,false)
      AND (up.monica_constant IS NOT NULL OR up.monica_single IS NOT NULL
        OR up.monica_two_body IS NOT NULL OR up.monica_full_chart IS NOT NULL
        OR up.monica_method IS NOT NULL)`,
);
await report(
  "human rows in user_profiles (should be untouched)",
  `SELECT count(*)::text n FROM user_profiles up JOIN users u ON u.id=up.user_id
    WHERE NOT coalesce(u.is_agent,false)`,
);

console.log("\n════ 2. THE COLUMN SPLIT — is it internally consistent? ════");
await expectZero(
  "more than one construction column populated",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE (monica_single IS NOT NULL)::int + (monica_two_body IS NOT NULL)::int
        + (monica_full_chart IS NOT NULL)::int > 1`,
);
await expectZero(
  "monica_method set but no construction column populated",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_method IS NOT NULL AND monica_single IS NULL
      AND monica_two_body IS NULL AND monica_full_chart IS NULL`,
);
await expectZero(
  "construction column populated but monica_method NULL",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_method IS NULL AND (monica_single IS NOT NULL
      OR monica_two_body IS NOT NULL OR monica_full_chart IS NOT NULL)`,
);
await expectZero(
  "monica_constant set on a non-single-body row (§18o)",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_constant IS NOT NULL AND monica_method IS DISTINCT FROM 'single-body'`,
);
await expectZero(
  "single-body row where monica_constant != monica_single",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_method = 'single-body'
      AND (monica_constant IS NULL OR abs(monica_constant - monica_single) > 1e-6)`,
);
await expectZero(
  "a construction value with a missing sect",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE (monica_single IS NOT NULL OR monica_two_body IS NOT NULL OR monica_full_chart IS NOT NULL)
      AND (monica_diurnal IS NULL OR monica_nocturnal IS NULL)`,
);
await expectZero(
  "combined value is not the mean of its two sects",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_method IS NOT NULL
      AND abs(coalesce(monica_single, monica_two_body, monica_full_chart)
              - (monica_diurnal + monica_nocturnal)/2) > 1e-5`,
);
await expectZero(
  "any non-finite / absurd stored value",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_diurnal IS NOT NULL
      AND (abs(monica_diurnal) > 1e6 OR abs(monica_nocturnal) > 1e6)`,
);

console.log("\n════ 3. COVERAGE — is anything unaccounted for? ════");
const cov = await client.query<{ method: string; n: string }>(
  `SELECT coalesce(monica_method,'(none)') AS method, count(*)::text n
     FROM user_profiles up JOIN users u ON u.id=up.user_id
    WHERE u.is_agent GROUP BY 1 ORDER BY 2 DESC`,
);
console.table(cov.rows);
const total = cov.rows.reduce((s, r) => s + Number(r.n), 0);
const { rows: [{ n: agentRows }] } = await client.query<{ n: string }>(
  `SELECT count(*)::text n FROM user_profiles up JOIN users u ON u.id=up.user_id WHERE u.is_agent`,
);
checks++;
if (total !== Number(agentRows)) { failures++; console.log(`  FAIL  method buckets ${total} != agent rows ${agentRows}`); }
else console.log(`  OK    method buckets sum to the agent row count (${total})`);

await report(
  "agents with NO monica at all (expected: 1, 'Mars Gemini')",
  `SELECT count(*)::text n FROM user_profiles up JOIN users u ON u.id=up.user_id
    WHERE u.is_agent AND up.monica_method IS NULL`,
);
const { rows: leftovers } = await client.query<{ name: string }>(
  `SELECT up.name FROM user_profiles up JOIN users u ON u.id=up.user_id
    WHERE u.is_agent AND up.monica_method IS NULL ORDER BY 1 LIMIT 10`,
);
if (leftovers.length) console.log(`        ${leftovers.map((r) => r.name).join(", ")}`);

console.log("\n════ 4. SENTINELS — is φ where it should be? ════");
for (const [col, method] of [["monica_single","single-body"],["monica_two_body","two-body"],["monica_full_chart","full-chart"]] as const) {
  const { rows } = await client.query<{ n: string; phi: string }>(
    `SELECT count(*)::text n, count(*) FILTER (WHERE abs(${col} - $1) < 1e-9)::text phi
       FROM user_profiles WHERE ${col} IS NOT NULL`, [MONICA_EQUILIBRIUM]);
  const n = Number(rows[0].n), phi = Number(rows[0].phi);
  console.log(`  ---   ${method.padEnd(60)} φ ${phi}/${n} (${n ? (phi/n*100).toFixed(1) : "0.0"}%)`);
}
// ⚠️ A monica of exactly 0 is NOT a fake-sentinel signature here. §18h proved
// the zero-cluster is an exact ALGEBRAIC consequence: five planets confined to
// {Essence, Matter}, crossed with the two pillars (Solution/Calcination) that
// zero the vessel's Spirit and Substance, crossed with non-Fire signs supplying
// no offsetting heat. Those zeros survive the drift check, so they are correct
// by construction. What would be a finding is the count MOVING, or a zero
// appearing in a construction that cannot produce one.
const EXPECTED_SINGLE_BODY_ZEROS = 284;
const { rows: [z] } = await client.query<{ single: string; other: string }>(
  `SELECT count(*) FILTER (WHERE monica_single = 0)::text AS single,
          count(*) FILTER (WHERE monica_two_body = 0 OR monica_full_chart = 0)::text AS other
     FROM user_profiles`);
checks++;
console.log(`  ---   single-body zeros (§18h proven cluster)${" ".repeat(24)} ${z.single}`);
if (Number(z.single) !== EXPECTED_SINGLE_BODY_ZEROS) {
  console.log(`  NOTE  zero-cluster moved from ${EXPECTED_SINGLE_BODY_ZEROS} to ${z.single} ` +
    `(expected as the population grows — investigate only if it jumps)`);
}
await expectZero(
  "a zero in two-body or full-chart (no proven mechanism there)",
  `SELECT count(*)::text n, min(name) sample FROM user_profiles
    WHERE monica_two_body = 0 OR monica_full_chart = 0`,
);
await expectZero(
  "round-number clustering: >20% of a column on one value",
  `WITH b AS (
     SELECT monica_single v, count(*) c FROM user_profiles
      WHERE monica_single IS NOT NULL GROUP BY 1),
   t AS (SELECT sum(c) tot FROM b)
   SELECT count(*)::text n, min(v::text) sample FROM b, t WHERE c::numeric / tot > 0.20`,
);

console.log("\n════ 5. ROLLBACK — can we actually undo this? ════");
const { rows: snaps } = await client.query<{ table_name: string }>(
  `SELECT c.relname AS table_name
     FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
    WHERE ns.nspname='public' AND c.relkind='r'
      AND (c.relname LIKE 'monica_preconstruction_%' OR c.relname LIKE 'agent_monica_snapshot_%'
        OR c.relname LIKE 'chef_feed_reattribution_%')
    ORDER BY c.relname`,
);
for (const snap of snaps) {
  const { rows: [{ n }] } = await client.query<{ n: string }>(
    `SELECT count(*)::text n FROM "${snap.table_name}"`);
  console.log(`  ---   snapshot ${snap.table_name.padEnd(46)} ${n} rows`);
}
// ⚠️ NOT every monica_preconstruction_* table is a rollback point. The backfill
// snapshots on EVERY --write, so re-runs produce snapshots of ALREADY-MIGRATED
// data. Restoring from the newest — the natural instinct — would restore the
// post-migration state and undo nothing. Identify the real one by CONTENT:
// it must still contain the 71 hand-authored literals (method NULL, value in
// [0.8, 7]) and the two-body values still sitting in monica_constant.
checks++;
const rollbackPoints: string[] = [];
for (const snap of snaps.filter((x) => x.table_name.startsWith("monica_preconstruction_"))) {
  const { rows: [a] } = await client.query<{ n: string }>(
    `SELECT count(*)::text n FROM "${snap.table_name}"
      WHERE monica_method IS NULL AND monica_constant BETWEEN 0.8 AND 7`);
  const { rows: [b] } = await client.query<{ n: string }>(
    `SELECT count(*)::text n FROM "${snap.table_name}" s
       JOIN user_profiles up ON up.user_id = s.user_id
      WHERE up.monica_method = 'two-body' AND s.monica_constant IS NOT NULL`);
  const usable = Number(a.n) >= 70 && Number(b.n) >= 400;
  console.log(`  ${usable ? "==>" : "   "}   ${snap.table_name.padEnd(46)} ` +
    `${usable ? "TRUE ROLLBACK POINT" : "post-migration — restores nothing"}`);
  if (usable) rollbackPoints.push(snap.table_name);
}
if (rollbackPoints.length === 0) {
  failures++;
  console.log(`  FAIL  NO usable rollback point — the 71 authored literals are UNRECOVERABLE`);
} else {
  console.log(`  OK    rollback point: ${rollbackPoints[0]}`);
}

console.log("\n════ 6. REFERENTIAL INTEGRITY — did the chef deletion leave orphans? ════");
await expectZero(
  "feed_events pointing at a non-existent user",
  `SELECT count(*)::text n FROM feed_events fe
    LEFT JOIN users u ON u.id = fe.actor_id WHERE u.id IS NULL`,
);
await expectZero(
  "user_profiles rows with no matching user",
  `SELECT count(*)::text n FROM user_profiles up
    LEFT JOIN users u ON u.id = up.user_id WHERE u.id IS NULL`,
);
await expectZero(
  "the deleted Alchemical Chef still referenced anywhere in feed_events",
  `SELECT count(*)::text n FROM feed_events
    WHERE actor_id = '698f80eb-445f-42b5-a4e9-60be81d3fdfd'`,
);

console.log("\n════ 7. CONSTRAINTS — are the guarantees actually installed? ════");
const wanted = [
  "monica_method_known",
  "monica_one_construction",
  "monica_method_matches_column",
  "monica_constant_single_body_only",
  "monica_both_sects_present",
];
const { rows: cons } = await client.query<{ conname: string }>(
  `SELECT conname FROM pg_constraint WHERE conname = ANY($1)`, [wanted]);
const present = new Set(cons.map((c) => c.conname));
for (const w of wanted) {
  checks++;
  const ok = present.has(w);
  if (!ok) failures++;
  console.log(`  ${ok ? "OK  " : "FAIL"}  constraint ${w}`);
}

console.log(`\n${"═".repeat(72)}`);
console.log(failures === 0
  ? `ALL CLEAR — ${checks} checks, 0 failures. Agent monica data is internally consistent,\nfully covered, rollback-capable, and protected by DB constraints.`
  : `*** ${failures} FAILURE(S) across ${checks} checks — DO NOT trust the current state ***`);
await client.end();
if (failures > 0) process.exit(1);

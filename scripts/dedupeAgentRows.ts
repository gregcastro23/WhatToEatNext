/**
 * §18g — remove the redundant duplicate agent rows and the junk rows.
 *
 * The spec calls for RENAMING `Moon Agent N` to `Moon <Sign> <Deg>`. Measured
 * against production on 2026-07-21, that is the wrong operation: all 360 rename
 * targets ALREADY EXIST. `Moon Agent N` (N = absolute ecliptic degree, 0-based)
 * and `Moon <Sign> <Deg>` are two agents for the same 360 placements, so a
 * rename would collide on every single row. It is a de-duplication, not a
 * rename.
 *
 * Both families are inert — 360 rows each, 0 logins, 0 token_balance rows, and
 * no bio / natal_chart / monica_constant / dominant_element on either side — so
 * the `Moon Agent N` copy carries nothing the canonical row does not.
 *
 * Also removes the junk rows (`Alchemical Chef`, `Pa Prod Smoke ...`, `Test ...`).
 *
 * DRY RUN BY DEFAULT. Pass --write to delete, inside one transaction.
 *
 *   railway run --service Postgres -- bun scripts/dedupeAgentRows.ts
 *   railway run --service Postgres -- bun scripts/dedupeAgentRows.ts --write
 *
 * Safety: before deleting anything it sweeps EVERY table with a foreign key to
 * users(id) — 61 of them — and counts referencing rows. Any candidate that is
 * referenced anywhere outside user_profiles / token_balances is REPORTED AND
 * SKIPPED, never force-deleted. A row that turns out to be doing something stays.
 */
import pg from "pg";
import { parseAgentPlacement } from "@/utils/agentMonicaResolver";

const WRITE = process.argv.includes("--write");

/** Referencing rows in these tables do not block a delete — they are the agent's
 *  own scaffolding, removed with it. Everything else means the row is in use. */
const OWN_SCAFFOLDING = new Set(["user_profiles", "token_balances"]);

const JUNK = /^(Alchemical Chef$|Pa Prod Smoke |Test )/;

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows: agents } = await client.query<{ user_id: string; name: string }>(
  `SELECT up.user_id, up.name FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.name IS NOT NULL`,
);
const existingNames = new Set(agents.map((a) => a.name));

// ------------------------------------------------------- pick candidates ----
interface Candidate { user_id: string; name: string; why: string }
const candidates: Candidate[] = [];

for (const a of agents) {
  if (JUNK.test(a.name)) {
    candidates.push({ user_id: a.user_id, name: a.name, why: "junk/test row" });
    continue;
  }
  // A `<Planet> Agent <N>` row is redundant only if its canonical twin exists.
  if (/^[A-Za-z]+ Agent \d+$/.test(a.name)) {
    const p = parseAgentPlacement(a.name);
    if (p?.canonicalName && existingNames.has(p.canonicalName)) {
      candidates.push({
        user_id: a.user_id,
        name: a.name,
        why: `duplicate of "${p.canonicalName}"`,
      });
    }
  }
}

console.log(`\n=== §18g dedupe ${WRITE ? "WRITE" : "DRY RUN"} ===`);
console.log(`agent rows scanned : ${agents.length}`);
console.log(`delete candidates  : ${candidates.length}`);
const byWhy: Record<string, number> = {};
for (const c of candidates) {
  const k = c.why.startsWith("duplicate") ? "duplicate of canonical twin" : c.why;
  byWhy[k] = (byWhy[k] ?? 0) + 1;
}
console.table(byWhy);
console.log(`\njunk rows:`);
candidates.filter((c) => c.why === "junk/test row").forEach((c) => console.log(`  ${c.name}`));
console.log(`\nduplicates, first 5:`);
candidates.filter((c) => c.why !== "junk/test row").slice(0, 5)
  .forEach((c) => console.log(`  ${c.name}  ->  ${c.why}`));

if (!candidates.length) {
  console.log("\nnothing to do.");
  await client.end();
  process.exit(0);
}

// ------------------------------------------------------------- FK sweep -----
const { rows: fks } = await client.query<{ table_name: string; column_name: string }>(
  `SELECT DISTINCT tc.table_name, kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu
       ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users'
    ORDER BY 1, 2`,
);
console.log(`\nsweeping ${fks.length} foreign keys into users(id)...`);

const ids = candidates.map((c) => c.user_id);
const blocked = new Map<string, string[]>(); // user_id -> ["table.column", ...]
const hits: { table: string; column: string; n: number; blocking: boolean }[] = [];

for (const fk of fks) {
  const { rows } = await client.query<{ id: string }>(
    `SELECT DISTINCT "${fk.column_name}"::text AS id
       FROM "${fk.table_name}" WHERE "${fk.column_name}" = ANY($1::uuid[])`,
    [ids],
  );
  if (!rows.length) continue;
  const blocking = !OWN_SCAFFOLDING.has(fk.table_name);
  hits.push({ table: fk.table_name, column: fk.column_name, n: rows.length, blocking });
  if (blocking) {
    for (const r of rows) {
      const list = blocked.get(r.id) ?? [];
      list.push(`${fk.table_name}.${fk.column_name}`);
      blocked.set(r.id, list);
    }
  }
}
console.log(`\nreferences found:`);
console.table(hits.map((h) => ({
  table: h.table, column: h.column, candidates_referenced: h.n,
  verdict: h.blocking ? "BLOCKS DELETE" : "own scaffolding",
})));

const safe = candidates.filter((c) => !blocked.has(c.user_id));
const skipped = candidates.filter((c) => blocked.has(c.user_id));
console.log(`\nsafe to delete : ${safe.length}`);
console.log(`SKIPPED (in use): ${skipped.length}`);
skipped.slice(0, 20).forEach((c) =>
  console.log(`  ${c.name} — referenced by ${blocked.get(c.user_id)!.join(", ")}`),
);

if (!WRITE) {
  console.log(`\nDRY RUN — nothing deleted. Re-run with --write to commit.`);
  await client.end();
  process.exit(0);
}
if (!safe.length) {
  console.log("\nnothing safe to delete.");
  await client.end();
  process.exit(0);
}

// -------------------------------------------------------------- delete ------
const safeIds = safe.map((c) => c.user_id);
console.log(`\ndeleting ${safeIds.length} rows in one transaction...`);
await client.query("BEGIN");
try {
  await client.query(`DELETE FROM token_balances WHERE user_id = ANY($1::uuid[])`, [safeIds]);
  await client.query(`DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])`, [safeIds]);
  const del = await client.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [safeIds]);
  await client.query("COMMIT");
  console.log(`COMMIT ok — ${del.rowCount} users rows deleted`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("ROLLBACK —", err);
  await client.end();
  process.exit(1);
}

const after = await client.query<{ n: string }>(
  `SELECT count(*)::text AS n FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent`,
);
console.log(`agents remaining: ${after.rows[0].n}`);
await client.end();

/**
 * §18 drift check — has anything overwritten a backfilled agent monica?
 *
 * Recomputes every single-body agent's monica from its own name and compares
 * against what is stored. Read-only, safe to run any time.
 *
 *   railway run --service Postgres -- bun scripts/checkAgentMonicaDrift.ts
 *
 * Exits non-zero if drift is found, so it can gate a deploy or run in CI.
 *
 * Why this exists: the backfill wrote corrected values to production from a
 * feature branch, while production still ran the old fake-writing code — a
 * window in which any PA/AlchmAgentsETH sync could silently undo it. The remedy
 * for detected drift is to re-run `backfillAgentMonica.ts --write`, which is
 * idempotent. (The pre-backfill snapshot table holds the OLD FAKE values and is
 * forensic only — it is not a recovery path.)
 */
import pg from "pg";
import { agentMonica } from "@/utils/agentMonica";
import { parseAgentPlacement } from "@/utils/agentMonicaResolver";

const TOLERANCE = 1e-5;

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query<{
  name: string;
  monica_constant: string | null;
  monica_diurnal: string | null;
  monica_nocturnal: string | null;
  monica_method: string | null;
  updated_at: string;
}>(
  `SELECT up.name, up.monica_constant::text, up.monica_diurnal::text,
          up.monica_nocturnal::text, up.monica_method, up.updated_at::text
     FROM user_profiles up JOIN users u ON u.id = up.user_id
    WHERE u.is_agent AND up.name IS NOT NULL`,
);
await client.end();

let single = 0;
let drifted = 0;
let missing = 0;
let wrongMethod = 0;
const examples: string[] = [];

for (const r of rows) {
  const p = parseAgentPlacement(r.name);
  if (!p || p.kind !== "single") continue;
  single++;

  const fresh = agentMonica(p.planet, p.sign, p.degree);
  const num = (v: string | null) => (v === null ? null : Number(v));
  const [c, d, n] = [num(r.monica_constant), num(r.monica_diurnal), num(r.monica_nocturnal)];

  if (c === null || d === null || n === null) {
    missing++;
    if (examples.length < 15) examples.push(`MISSING ${r.name} (updated_at ${r.updated_at})`);
    continue;
  }
  if (
    Math.abs(c - fresh.combined) > TOLERANCE ||
    Math.abs(d - fresh.diurnal) > TOLERANCE ||
    Math.abs(n - fresh.nocturnal) > TOLERANCE
  ) {
    drifted++;
    if (examples.length < 15) {
      examples.push(
        `DRIFT ${r.name}: stored=${c} expected=${fresh.combined.toFixed(6)} (updated_at ${r.updated_at})`,
      );
    }
  }
  if (r.monica_method !== "single-body") {
    wrongMethod++;
    if (examples.length < 15) examples.push(`METHOD ${r.name}: ${r.monica_method ?? "NULL"}`);
  }
}

console.log(`single-body agents checked : ${single}`);
console.log(`drifted from real value    : ${drifted}`);
console.log(`missing a monica column    : ${missing}`);
console.log(`wrong/absent monica_method : ${wrongMethod}`);
if (examples.length) console.log("\n" + examples.join("\n"));

const bad = drifted + missing + wrongMethod;
if (bad === 0) {
  console.log("\nOK — every single-body agent matches a fresh computation.");
} else {
  console.error(
    `\n*** ${bad} row(s) need attention. Remedy: re-run ` +
      `\`backfillAgentMonica.ts --write\` (idempotent). ***`,
  );
  process.exit(1);
}

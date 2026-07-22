/**
 * §18 drift check — has anything overwritten a backfilled agent monica?
 *
 * Recomputes every agent's monica from its own name and compares against what is
 * stored. Covers BOTH backfilled populations:
 *   - single-body placements (§18c) → monica_method 'single-body'
 *   - two-body Moon phases   (§18i) → monica_method 'two-body'
 * Read-only, safe to run any time.
 *
 *   railway run --service Postgres -- bun scripts/checkAgentMonicaDrift.ts
 *
 * Exits non-zero if drift is found, so it can gate a deploy or run in CI.
 *
 * Why this exists: the backfill wrote corrected values to production from a
 * feature branch, while production still ran the old fake-writing code — a
 * window in which any PA/AlchmAgentsETH sync could silently undo it. The remedy
 * for detected drift is to re-run the matching backfill (`backfillAgentMonica.ts`
 * or `backfillPhaseMonica.ts`) with --write; both are idempotent. (The
 * pre-backfill snapshot table holds the OLD FAKE values and is forensic only —
 * it is not a recovery path.)
 *
 * Running this immediately after a backfill is also the IDEMPOTENCY PROOF: a
 * fresh recomputation matching every stored row to 1e-5 is exactly the property
 * a second --write run would rely on.
 */
import pg from "pg";
import { agentMonica } from "@/utils/agentMonica";
import { parseAgentPlacement } from "@/utils/agentMonicaResolver";
import { twoBodyMonica } from "@/utils/agentMonicaTwoBody";

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

interface Tally {
  checked: number;
  drifted: number;
  missing: number;
  wrongMethod: number;
}
const tally: Record<"single" | "phase", Tally> = {
  single: { checked: 0, drifted: 0, missing: 0, wrongMethod: 0 },
  phase: { checked: 0, drifted: 0, missing: 0, wrongMethod: 0 },
};
const examples: string[] = [];
let unparseable = 0;

const num = (v: string | null) => (v === null ? null : Number(v));

for (const r of rows) {
  const p = parseAgentPlacement(r.name);
  if (!p) {
    unparseable++;
    continue;
  }

  // Pick the construction this row's NAME calls for, and the method it must
  // carry. Comparing a phase agent against the single-body calc (or vice versa)
  // would report drift on a correctly-written row.
  let fresh: { diurnal: number; nocturnal: number; combined: number };
  let expectMethod: string;
  let bucket: "single" | "phase";
  if (p.kind === "single") {
    fresh = agentMonica(p.planet, p.sign, p.degree);
    expectMethod = "single-body";
    bucket = "single";
  } else if (p.kind === "phase" && p.phase && p.sign && p.degree !== undefined) {
    fresh = twoBodyMonica(p.phase, p.sign, p.degree);
    expectMethod = "two-body";
    bucket = "phase";
  } else {
    unparseable++;
    continue;
  }

  const t = tally[bucket];
  t.checked++;

  const [c, d, n] = [
    num(r.monica_constant),
    num(r.monica_diurnal),
    num(r.monica_nocturnal),
  ];

  if (c === null || d === null || n === null) {
    t.missing++;
    if (examples.length < 15) examples.push(`MISSING ${r.name} (updated_at ${r.updated_at})`);
    continue;
  }
  if (
    Math.abs(c - fresh.combined) > TOLERANCE ||
    Math.abs(d - fresh.diurnal) > TOLERANCE ||
    Math.abs(n - fresh.nocturnal) > TOLERANCE
  ) {
    t.drifted++;
    if (examples.length < 15) {
      examples.push(
        `DRIFT ${r.name}: stored=${c} expected=${fresh.combined.toFixed(6)} (updated_at ${r.updated_at})`,
      );
    }
  }
  if (r.monica_method !== expectMethod) {
    t.wrongMethod++;
    if (examples.length < 15) {
      examples.push(
        `METHOD ${r.name}: ${r.monica_method ?? "NULL"} (expected ${expectMethod})`,
      );
    }
  }
}

const line = (label: string, t: Tally) =>
  `${label.padEnd(26)} checked ${String(t.checked).padStart(5)}  ` +
  `drifted ${t.drifted}  missing ${t.missing}  wrong-method ${t.wrongMethod}`;
console.log(line("single-body (§18c)", tally.single));
console.log(line("two-body phase (§18i)", tally.phase));
console.log(`not a placement (skipped)  ${unparseable}`);
if (examples.length) console.log("\n" + examples.join("\n"));

const sum = (t: Tally) => t.drifted + t.missing + t.wrongMethod;
const bad = sum(tally.single) + sum(tally.phase);
if (bad === 0) {
  console.log(
    `\nOK — all ${tally.single.checked + tally.phase.checked} backfilled agents ` +
      `match a fresh computation (tolerance ${TOLERANCE}).`,
  );
} else {
  console.error(
    `\n*** ${bad} row(s) need attention. Remedy: re-run the matching backfill ` +
      `(\`backfillAgentMonica.ts\` / \`backfillPhaseMonica.ts\`) with --write; ` +
      `both are idempotent. ***`,
  );
  process.exit(1);
}

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
import { MONICA_EQUILIBRIUM } from "@/data/unified/alchemicalCalculations";
import { fullChartMonica } from "@/utils/fullChartMonica";

/** Max share of a population allowed to sit at φ before it is reported. φ means
 *  the engine DECLINED to compute; a rising share is a health signal (§18p). */
const PHI_THRESHOLD = 0.10;

const TOLERANCE = 1e-5;

const client = new pg.Client({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query<{
  name: string;
  monica_constant: string | null;
  monica_single: string | null;
  monica_two_body: string | null;
  monica_full_chart: string | null;
  monica_diurnal: string | null;
  monica_nocturnal: string | null;
  monica_method: string | null;
  natal_positions: unknown;
  updated_at: string;
}>(
  `SELECT up.name, up.monica_constant::text, up.monica_single::text,
          up.monica_two_body::text, up.monica_full_chart::text,
          up.monica_diurnal::text, up.monica_nocturnal::text,
          up.monica_method, up.natal_positions, up.updated_at::text
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
const tally: Record<"single" | "phase" | "fullChart", Tally> = {
  single: { checked: 0, drifted: 0, missing: 0, wrongMethod: 0 },
  phase: { checked: 0, drifted: 0, missing: 0, wrongMethod: 0 },
  fullChart: { checked: 0, drifted: 0, missing: 0, wrongMethod: 0 },
};
/** Stored values per population, for the φ-share assertion. */
const values: Record<string, number[]> = { single: [], phase: [], fullChart: [] };
let notAPlacementNoChart = 0;
const examples: string[] = [];
let unparseable = 0;

const num = (v: string | null) => (v === null ? null : Number(v));

for (const r of rows) {
  const p = parseAgentPlacement(r.name);
  if (!p) {
    // Not a placement — but it may be a chart-bearing agent, which IS a
    // population we now write and therefore must verify.
    const fc = fullChartMonica(r.natal_positions);
    if (!fc) {
      notAPlacementNoChart++;
      continue;
    }
    const t = tally.fullChart;
    t.checked++;
    const stored = num(r.monica_full_chart);
    const d = num(r.monica_diurnal);
    const n = num(r.monica_nocturnal);
    if (stored === null || d === null || n === null) {
      t.missing++;
      if (examples.length < 15) examples.push(`MISSING ${r.name} (full-chart)`);
      continue;
    }
    values.fullChart.push(stored);
    if (
      Math.abs(stored - fc.combined) > TOLERANCE ||
      Math.abs(d - fc.diurnal) > TOLERANCE ||
      Math.abs(n - fc.nocturnal) > TOLERANCE
    ) {
      t.drifted++;
      if (examples.length < 15) {
        examples.push(`DRIFT ${r.name}: stored=${stored} expected=${fc.combined.toFixed(6)}`);
      }
    }
    if (r.monica_method !== "full-chart") {
      t.wrongMethod++;
      if (examples.length < 15) {
        examples.push(`METHOD ${r.name}: ${r.monica_method ?? "NULL"} (expected full-chart)`);
      }
    }
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

  // §18o: each construction lives in its OWN column. Reading monica_constant
  // for a two-body row would report drift on a correctly-written row, because
  // that column is single-body-only now.
  const stored =
    bucket === "single" ? num(r.monica_single) : num(r.monica_two_body);
  const [c, d, n] = [stored, num(r.monica_diurnal), num(r.monica_nocturnal)];
  if (c !== null) values[bucket].push(c);

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
console.log(line("full-chart (§18n)", tally.fullChart));
console.log(`unusable / no chart        ${unparseable + notAPlacementNoChart}`);
if (examples.length) console.log("\n" + examples.join("\n"));

// ── the ruled invariants, beyond drift ────────────────────────────────────
const problems: string[] = [];

// 1. Populations sum EXACTLY to the agent row count. A count that stops summing
//    means a new name family appeared or the resolver stopped recognising one —
//    the failure that once silently dropped 3240 rows.
const totalClassified =
  tally.single.checked + tally.phase.checked + tally.fullChart.checked +
  unparseable + notAPlacementNoChart;
console.log(`\npopulations sum: ${tally.single.checked} + ${tally.phase.checked} + ` +
  `${tally.fullChart.checked} + ${unparseable + notAPlacementNoChart} = ${totalClassified} / ${rows.length}`);
if (totalClassified !== rows.length) {
  problems.push(`populations do not sum: ${totalClassified} classified vs ${rows.length} rows`);
}

// 2. φ share per population. φ is the engine declining to compute; a rising
//    share is a health signal that is otherwise invisible.
console.log(`φ share per population (threshold ${(PHI_THRESHOLD * 100).toFixed(0)}%):`);
for (const [k, xs] of Object.entries(values)) {
  if (!xs.length) continue;
  const phi = xs.filter((v) => Math.abs(v - MONICA_EQUILIBRIUM) < 1e-9).length;
  const share = phi / xs.length;
  console.log(`  ${k.padEnd(12)} ${phi} / ${xs.length} = ${(share * 100).toFixed(1)}%` +
    (share > PHI_THRESHOLD ? "   *** ABOVE THRESHOLD ***" : ""));
  if (share > PHI_THRESHOLD) {
    problems.push(`${k}: φ share ${(share * 100).toFixed(1)}% exceeds ${(PHI_THRESHOLD * 100).toFixed(0)}%`);
  }
}

const sum = (t: Tally) => t.drifted + t.missing + t.wrongMethod;
const bad = sum(tally.single) + sum(tally.phase) + sum(tally.fullChart) + problems.length;
if (problems.length) console.error("\ninvariant failures:\n  " + problems.join("\n  "));
if (bad === 0) {
  console.log(
    `\nOK — all ${tally.single.checked + tally.phase.checked + tally.fullChart.checked} backfilled agents ` +
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

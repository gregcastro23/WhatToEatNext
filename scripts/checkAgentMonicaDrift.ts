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

/**
 * Agents allowed to exist with NO `user_profiles` row at all.
 *
 * `[MEASURED 2026-07-29]` exactly 56, and the cohort is FROZEN: 52 are the legacy
 * `@agents.alchm.kitchen` seed, each with a properly-provisioned twin at
 * `@agentic.alchm.kitchen` (52/52 email-stem collisions; control: 0 collisions
 * among profiled agents), 0 transactions, 0 feed events. Of the 550 agents
 * created 2026-07-20..29, ZERO lack a profile; the newest profile-less agent is
 * 2026-07-19.
 *
 * So this is a "must not grow" assertion, not a tolerance. It is deliberately
 * set to the exact current count: `sync-credit`'s users insert
 * (`src/app/api/economy/sync-credit/route.ts`) still has no matching
 * `user_profiles` insert for non-daily-yield sources, so the population CAN
 * grow — and if it does, every DB gate in this workflow is blind to the new rows
 * because they all share the same self-referential join.
 */
const NO_PROFILE_BUDGET = 56;

/**
 * Agents allowed to have an unparseable name AND no usable chart.
 *
 * `[MEASURED 2026-07-29]` ZERO, since §18k k29 made sign-level names resolvable.
 * A genuine person agent carries a chart and is counted as full-chart instead,
 * so nothing legitimately lands here any more.
 *
 * This is the invariant that actually detects a resolver regression — see the
 * note at check 1b. Budget 0 is deliberate: one row here needs a human, and
 * looking at one is cheap. Two rows sat in this bucket unobserved for two months
 * because it fed neither the exit code nor the "all N agents match" denominator.
 */
const NOT_A_PLACEMENT_BUDGET = 0;

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

// The DENOMINATOR, read independently of the rows above.
//
// ⚠️ This exists because the invariant below used to compare `rows` against
// itself. Every path through the tally loop increments exactly one counter, so
// `totalClassified === rows.length` held IDENTICALLY — it could not fail for any
// input. It was advertised as the defence against "the failure that once
// silently dropped 3240 rows", and a test that moved 3240 rows into an
// unrecognised name family still printed its sum and exited 0.
//
// The join above cannot see an agent with no `user_profiles` row at all, and
// there are 56 of those. A self-referential denominator is blind to exactly the
// population it is supposed to be counting.
const { rows: [census] } = await client.query<{
  agents: string;
  no_profile_row: string;
  profile_no_name: string;
}>(
  `SELECT
     (SELECT count(*) FROM users WHERE is_agent)::text AS agents,
     (SELECT count(*) FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.is_agent AND up.user_id IS NULL)::text AS no_profile_row,
     (SELECT count(*) FROM users u
        JOIN user_profiles up ON up.user_id = u.id
       WHERE u.is_agent AND up.name IS NULL)::text AS profile_no_name`,
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

// 1. Populations sum EXACTLY to the AGENT POPULATION — not to the rows this
//    script happened to fetch.
//
//    ⚠️ TWO corrections to what this check used to claim, both measured:
//
//    (a) It compared the tally against `rows.length`, which is a TAUTOLOGY.
//        Every path through the loop increments exactly one counter, so the
//        equality held for any input whatsoever. The denominator now comes from
//        `census`, read by its own query against `users`.
//
//    (b) Its stated purpose — catching "the failure that once silently dropped
//        3240 rows" — is NOT something any sum can do, and the fixed version
//        cannot do it either. A name family that stops resolving falls through
//        `parseAgentPlacement` -> null and `fullChartMonica` -> null into
//        `notAPlacementNoChart`, which is INSIDE the sum. The total does not
//        move. What catches that failure is invariant 1b below: a budget on the
//        bucket itself. Recorded so the comment stops promising coverage the
//        arithmetic cannot provide.
//
//    ⚠️ And be honest about what the fixed sum is worth. The three census terms
//    partition the agent population exactly, so `accountedFor === agents` is
//    STILL close to an identity — it can only differ if the population changes
//    between the two queries. That is worth reporting (it means these numbers
//    are a smear across a moving table, not a snapshot) but it is NOT a defect
//    detector. Do not let a future reader mistake it for one again.
//
//    The assertions that can actually fail on bad data are the two BUDGETS: the
//    no-profile-row count below, and check 1b. Both were verified by injection —
//    a simulated resolver regression moved 464 rows and the sum stayed balanced
//    at 5284/5284 while 1b fired.
//
//    The sum's real contribution is that it PRINTS the no-profile population,
//    which no gate in this workflow could previously see at all.
const totalClassified =
  tally.single.checked + tally.phase.checked + tally.fullChart.checked +
  unparseable + notAPlacementNoChart;
const agents = Number(census.agents);
const noProfileRow = Number(census.no_profile_row);
const profileNoName = Number(census.profile_no_name);
const accountedFor = totalClassified + noProfileRow + profileNoName;

console.log(
  `\npopulations sum: ${tally.single.checked} + ${tally.phase.checked} + ` +
    `${tally.fullChart.checked} + ${unparseable + notAPlacementNoChart} = ${totalClassified} profiled` +
    `\n                 + ${noProfileRow} with no profile row + ${profileNoName} with a NULL name` +
    `\n                 = ${accountedFor} / ${agents} agents`,
);

// The trivial half, kept only because a mismatch here means the tally loop
// itself is broken (a row falling through every branch).
if (totalClassified !== rows.length) {
  problems.push(`tally does not cover its own rows: ${totalClassified} vs ${rows.length}`);
}
// The half that can actually fail.
if (accountedFor !== agents) {
  problems.push(
    `populations do not sum to the agent census: ${accountedFor} accounted for vs ${agents} agents ` +
      `(${agents - accountedFor} unaccounted)`,
  );
}
// A no-profile agent is invisible to every other gate in this workflow, because
// they all share this script's self-referential join. Report it as a standing
// number so it cannot grow unobserved; 56 is the known legacy cohort.
if (noProfileRow > NO_PROFILE_BUDGET) {
  problems.push(
    `${noProfileRow} agents have no user_profiles row, above the budget of ${NO_PROFILE_BUDGET}. ` +
      `Something is creating agents without a profile — see sync-credit's users insert.`,
  );
}

// 1b. THE ONE THAT CATCHES A RESOLVER REGRESSION.
//
// `notAPlacementNoChart` is the bucket a row falls into when its name does not
// parse AND it has no usable chart. Post-§18k k29 the correct value is EXACTLY
// ZERO: sign-level names resolve at the sign midpoint, and a genuine person
// agent carries a chart and lands in `fullChart` instead.
//
// This is the assertion the sum was wrongly credited with. If a name family
// stops resolving, every one of its rows lands here and this fires immediately —
// whereas the sum stays balanced because this bucket is one of its terms.
//
// It is also the fix for a two-month blind spot: `Mars Gemini` and `Moon Cancer`
// sat in this bucket since 2026-05-24 and 2026-07-22, were subtracted from the
// "all N agents match" denominator, and never contributed to the exit code. The
// audit script's hardcoded `expected: 1` had been stale since the second one
// arrived and nothing noticed.
//
// Budget 0 deliberately, not a tolerance. A single new row here is either a
// resolver regression or a name family nobody has ruled on — both need a human,
// and both are cheap to look at while there is one of them rather than 3240.
if (notAPlacementNoChart > NOT_A_PLACEMENT_BUDGET) {
  problems.push(
    `${notAPlacementNoChart} agents have a name that does not parse AND no usable chart ` +
      `(budget ${NOT_A_PLACEMENT_BUDGET}). Either the resolver stopped recognising a name ` +
      `family, or a new one arrived that needs a ruling. The names are printed above.`,
  );
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

// ── Two different things were being reported as one ─────────────────────────
//
// `drifted` and `wrongMethod` are DEFECTS: a stored value disagrees with a fresh
// computation, or sits in the wrong column. Neither can happen through ordinary
// operation, and either means something overwrote a value it should not have.
// Any occurrence fails, always.
//
// `missing` is a QUEUE DEPTH. Agents arrive without a monica and a backfill
// assigns one; a non-zero count is the system working, not breaking.
// `[MEASURED 2026-07-28]` roughly 50 new agents per day (7-day range 43-57), and
// six had already appeared within fifteen minutes of a backfill finishing. A gate
// that fails on any missing row is therefore red almost all the time.
//
// That conflation had a real cost: this check failed on master continuously from
// 2026-07-26, and because a failed step used to cancel the rest of the job, it
// silently skipped four gates behind it — including the economy SQL and
// ledger/balance gates, which had never run at all. A routine condition was
// switching off the checks that guard money.
//
// So `missing` fails only above a threshold that ordinary growth cannot reach.
const MISSING_QUEUE_THRESHOLD = 150;
//
// Derivation, not a round number picked for comfort: ~50 arrivals/day, and the
// scheduled backfill (06:45 UTC, ahead of the 07:15 integrity cron) clears the
// queue daily. Steady-state depth at the worst moment of a day is therefore ~50,
// and 150 is three days of accumulation — high enough that organic growth never
// trips it, low enough to catch the failure that matters: the backfill silently
// not running, or a writer producing unclassified rows en masse. A count between
// the two is reported loudly and passes.

const defects = (t: Tally) => t.drifted + t.wrongMethod;
const totalDefects =
  defects(tally.single) + defects(tally.phase) + defects(tally.fullChart) + problems.length;
const totalMissing = tally.single.missing + tally.phase.missing + tally.fullChart.missing;
const queueOverflowed = totalMissing > MISSING_QUEUE_THRESHOLD;
const bad = totalDefects + (queueOverflowed ? totalMissing : 0);

if (problems.length) console.error("\ninvariant failures:\n  " + problems.join("\n  "));

if (totalMissing > 0 && !queueOverflowed) {
  // Visible but not fatal. Printed even on an otherwise-clean run so the queue
  // never grows unnoticed — silence here is how a stalled backfill would hide.
  console.log(
    `\nqueue: ${totalMissing} agent(s) awaiting classification ` +
      `(threshold ${MISSING_QUEUE_THRESHOLD}; ~50 arrive per day and the 06:45 UTC ` +
      `backfill clears them). Not a defect.`,
  );
}
if (queueOverflowed) {
  console.error(
    `\n*** ${totalMissing} agents await classification, above the ${MISSING_QUEUE_THRESHOLD} threshold.\n` +
      `    That is more than ordinary growth produces, so the scheduled backfill\n` +
      `    (.github/workflows/monica-backfill.yml, 06:45 UTC) is likely not running,\n` +
      `    or a writer has begun inserting agents without a monica. Check the\n` +
      `    workflow's recent runs BEFORE re-running the backfill by hand — a\n` +
      `    backfill that succeeds hides the reason the queue grew. ***`,
  );
}

if (bad === 0) {
  console.log(
    `\nOK — all ${tally.single.checked + tally.phase.checked + tally.fullChart.checked} backfilled agents ` +
      `match a fresh computation (tolerance ${TOLERANCE}).`,
  );
} else {
  // The remedy MUST name the post-§18o script. It previously pointed at
  // `backfillAgentMonica.ts` / `backfillPhaseMonica.ts`, and following that
  // advice now fails: both write `monica_constant = combined` alongside
  // `monica_method = 'two-body'|'full-chart'`, which the
  // `monica_constant_single_body_only` CHECK rejects. A gate that reports a
  // problem and then names the wrong fix is worse than one that stays quiet.
  if (totalDefects > 0) {
    console.error(
      `\n*** ${totalDefects} DEFECT(s): a stored value disagrees with a fresh\n` +
        `    computation, or sits in the wrong column. Neither happens through\n` +
        `    ordinary operation — something overwrote a value it should not have.\n` +
        `    Remedy:\n` +
        `      railway run --service Postgres -- bun scripts/backfillMonicaPerConstruction.ts --write\n` +
        `    It is idempotent, classifies by NAME, and handles all three constructions.\n` +
        `    Do NOT use backfillAgentMonica.ts / backfillPhaseMonica.ts — they are\n` +
        `    pre-§18o and write monica_constant for two-body/full-chart rows, which\n` +
        `    the monica_constant_single_body_only constraint now rejects. ***`,
    );
  }
  process.exit(1);
}

/**
 * CI detector: does any NEW group of agents share one natal chart?
 *
 * ── Why this is a growth detector and not a unique index ─────────────────────
 *
 * Two people can legitimately share a birth moment, so identical
 * `natal_positions` is not by itself an error and a UNIQUE constraint would be
 * wrong. What IS an error is a chart being REUSED as a fallback — which is what
 * produced the two groups this repo already carries:
 *
 *   8 agents (Alexander, Archimedes, Aristotle, Herodotus, Homer, Caesar,
 *     Cicero, Plato) share ONE chart, monica_full_chart 0.003160
 *   2 agents (Jung, Kahlo) share a chart in which ALL TEN bodies sit at
 *     Aries 0°, degree 0 — degenerate, not merely duplicated
 *
 * So the gate asserts the known baseline and fails when the count GROWS.
 *
 * ── Why it matters beyond tidiness ──────────────────────────────────────────
 *
 * A |max|-derived constant is hostage to its least-trustworthy row. The
 * Jung/Kahlo chart holds the full-chart population maximum (0.033702); including
 * it would set the Sacred-7 full-chart scale to 0.0168, against 0.0047205 from
 * the 61 rows with distinct charts — a 3.6× error of exactly the kind that has
 * shipped before. A cloned chart is therefore a live hazard to a constant, not
 * just duplicated data.
 *
 * ── Controls ────────────────────────────────────────────────────────────────
 *
 * A zero result here is a claim requiring a control test, because a broken query
 * and a clean database are indistinguishable from the outside. This script
 * therefore asserts that it can (a) reach a populated agent table at all,
 * (b) see chart-bearing agents, and (c) still detect the two clone groups it
 * already knows about. If any control fails it exits non-zero and says the scan
 * was unsound — it never reports "clean".
 *
 * Read-only. Never writes.
 *
 *   railway run --service Postgres -- bun scripts/checkNoNewClonedCharts.ts
 */
import pg from "pg";

/** The clone groups that exist as of 2026-07-26 and are tracked, not new. */
const KNOWN_GROUPS: Array<{ size: number; note: string }> = [
  { size: 8, note: "the 8 ancients sharing one fallback chart" },
  { size: 2, note: "Jung + Kahlo, all ten bodies at Aries 0° (degenerate)" },
];
const KNOWN_CLONED_ROWS = KNOWN_GROUPS.reduce((n, g) => n + g.size, 0); // 10

interface CloneRow {
  chart_hash: string;
  n_agents: string;
  agents: string;
  monica_full_chart: string | null;
  distinct_positions: string;
}

const fail = (msg: string): never => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
if (!url) fail("no DATABASE_PUBLIC_URL / DATABASE_URL in the environment");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  // ── Control 1: the agent population is reachable and non-empty ────────────
  const pop = await client.query<{ agents: string; with_chart: string }>(`
    SELECT COUNT(*) AS agents,
           COUNT(*) FILTER (
             WHERE jsonb_typeof(up.natal_positions) = 'array'
               AND jsonb_array_length(up.natal_positions) > 0
           ) AS with_chart
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
     WHERE u.is_agent = true
  `);
  const agents = Number(pop.rows[0]?.agents ?? 0);
  const withChart = Number(pop.rows[0]?.with_chart ?? 0);

  if (agents === 0) {
    fail(
      "CONTROL FAILED: zero agent rows. The scan cannot distinguish a clean " +
        "database from a broken query, so this is not an all-clear.",
    );
  }
  if (withChart === 0) {
    fail(
      `CONTROL FAILED: ${agents} agents but ZERO with a chart. Either the ` +
        "natal_positions shape changed or the predicate is wrong — a clone " +
        "scan over an empty set trivially finds nothing.",
    );
  }
  console.log(`✓ control: ${agents} agents, ${withChart} carrying a chart`);

  // ── The scan ──────────────────────────────────────────────────────────────
  const dupes = await client.query<CloneRow>(`
    SELECT md5(up.natal_positions::text)      AS chart_hash,
           COUNT(*)                           AS n_agents,
           MIN(up.monica_full_chart::text)    AS monica_full_chart,
           string_agg(u.name, ' | ' ORDER BY u.name) AS agents,
           MIN((
             SELECT COUNT(DISTINCT (p->>'sign') || '@' || (p->>'degree'))
               FROM jsonb_array_elements(up.natal_positions) p
           ))::text                           AS distinct_positions
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
     WHERE u.is_agent = true
       AND jsonb_typeof(up.natal_positions) = 'array'
       AND jsonb_array_length(up.natal_positions) > 0
     GROUP BY md5(up.natal_positions::text)
    HAVING COUNT(*) > 1
     ORDER BY COUNT(*) DESC
  `);

  const clonedRows = dupes.rows.reduce((n, r) => n + Number(r.n_agents), 0);

  // ── Control 2: the detector still finds what it is known to find ──────────
  // If the known groups vanish, either they were legitimately fixed (in which
  // case update KNOWN_GROUPS in the same commit) or the query silently broke.
  // Both need a human, so neither may pass quietly.
  if (clonedRows < KNOWN_CLONED_ROWS) {
    console.log(
      `\n⚠ Found ${clonedRows} cloned rows, FEWER than the ${KNOWN_CLONED_ROWS} ` +
        "recorded baseline.",
    );
    console.log(
      "  If clone groups were resolved, update KNOWN_GROUPS in this file in the " +
        "same commit — and RE-MEASURE the Sacred-7 full-chart scale, because new " +
        "distinct charts change the |max| population it is derived from.",
    );
    fail(
      "baseline moved down without the constant being updated — treat as unsound, not clean",
    );
  }

  for (const r of dupes.rows) {
    const degenerate = Number(r.distinct_positions) === 1;
    console.log(
      `\n  ${r.n_agents} agents share chart ${r.chart_hash.slice(0, 12)}…` +
        `  monica_full_chart=${r.monica_full_chart ?? "NULL"}` +
        (degenerate ? "  ⚠ DEGENERATE (every body at one position)" : ""),
    );
    console.log(`     ${r.agents}`);
  }

  if (clonedRows > KNOWN_CLONED_ROWS) {
    console.log(
      `\n✗ ${clonedRows - KNOWN_CLONED_ROWS} NEW cloned chart row(s) since the ` +
        `baseline of ${KNOWN_CLONED_ROWS}.`,
    );
    console.log(
      "  A chart reused as a fallback is not a coincidence of birth moments. It " +
        "also poisons any |max|-derived constant: the existing Jung/Kahlo clone " +
        "holds the full-chart maximum, and including it would set the Sacred-7 " +
        "scale 3.6× wrong.",
    );
    process.exit(1);
  }

  console.log(
    `\n✓ ${clonedRows} cloned row(s) in ${dupes.rows.length} group(s) — matches ` +
      "the recorded baseline exactly, no new clones",
  );
} finally {
  await client.end();
}

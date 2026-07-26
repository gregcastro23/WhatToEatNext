/**
 * CI detector: does any stored natal body carry the fabricated `longitude` key?
 *
 * ── The defect this locks out ────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-26]` before the fix, `longitude` was present on **710 of 710**
 * stored bodies across all 71 chart-bearing agents, and `0` was its **only
 * distinct value**. It never held a measurement. Its origin is upstream, in the
 * agent-authoring repo:
 *
 *     longitude: data?.longitude ?? data?.degrees ?? 0
 *
 * evaluated over objects carrying `{ sign, degree, retrograde, house }` — neither
 * `longitude` nor `degrees` exists on them, so the chain reaches the literal `0`
 * every single time.
 *
 * ── Why a fabricated zero is worse than an absent key ───────────────────────
 *
 * `0` is not nullish, so a `p.position ?? p.longitude ?? …` chain STOPS at it and
 * never reaches `degree`. An audit written that way "found" 71 identical all-zero
 * charts — false. The real data was in `sign` + `degree` throughout. An absent
 * key would have routed correctly on the first attempt.
 *
 * ── Why a detector and not just a migration ─────────────────────────────────
 *
 * The producer is in another repo, reached through `/api/internal/agent-sync` and
 * `/api/economy/sync-debit`. Those endpoints now strip the key on ingest
 * (`normaliseNatalPositions`), but the upstream provisioning scripts are run by
 * hand and the stripping is the only thing standing between them and a
 * re-fabrication. This gate is what notices if that stripping is ever removed,
 * bypassed, or routed around by a new write path.
 *
 * ── Controls ────────────────────────────────────────────────────────────────
 *
 * A zero result is a claim requiring a control test: a broken query and a clean
 * database look identical from the outside. This script asserts it can reach a
 * populated agent table, that chart-bearing agents exist, and that its key-level
 * scan actually descends into bodies (by counting the `sign` keys it MUST find).
 * If any control fails it exits non-zero as UNSOUND — never as "clean".
 *
 * Read-only. Never writes.
 *
 *   railway run --service Postgres -- bun scripts/checkNoFabricatedNatalFields.ts
 */
import pg from "pg";

/**
 * Keys that must never appear on a stored natal body.
 *
 * `longitude` is redundant as well as fabricated: sign + degree already
 * determine it, and the canonical parser (`parseNatalPositions`) has always
 * derived it as `signIndex * 30 + degree`.
 */
const FORBIDDEN_BODY_KEYS = ["longitude"] as const;

/** Keys that every stored body is expected to carry — used as the scan control. */
const REQUIRED_BODY_KEYS = ["planet", "sign", "degree"] as const;

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
  // ── Control 1: the population is reachable and carries charts ─────────────
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
      "CONTROL FAILED: zero agent rows. A key scan over an empty set trivially " +
        "finds nothing, so this is not an all-clear.",
    );
  }
  if (withChart === 0) {
    fail(
      `CONTROL FAILED: ${agents} agents but ZERO carrying a chart. Either the ` +
        "natal_positions shape changed or the predicate is wrong.",
    );
  }

  // ── The scan: every key on every stored body, counted ─────────────────────
  const keys = await client.query<{ k: string; n: string; rows: string }>(`
    SELECT k,
           COUNT(*)                  AS n,
           COUNT(DISTINCT up.user_id) AS rows
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      CROSS JOIN LATERAL jsonb_array_elements(up.natal_positions) body
      CROSS JOIN LATERAL jsonb_object_keys(body) k
     WHERE u.is_agent = true
       AND jsonb_typeof(up.natal_positions) = 'array'
       AND jsonb_array_length(up.natal_positions) > 0
     GROUP BY k
     ORDER BY COUNT(*) DESC
  `);

  const seen = new Map(keys.rows.map((r) => [r.k, r]));

  // ── Control 2: the scan actually descended into bodies ────────────────────
  // Without this, a query that returns no rows for ANY reason reads as "no
  // forbidden keys" — the precise failure mode this programme keeps hitting.
  const missingRequired = REQUIRED_BODY_KEYS.filter((k) => !seen.has(k));
  if (missingRequired.length > 0) {
    fail(
      `CONTROL FAILED: the key scan did not find ${missingRequired.join(", ")} on ` +
        "any body. Every stored body carries those, so the scan is unsound — " +
        "it cannot be trusted to have found a forbidden key either.",
    );
  }
  const bodies = Number(seen.get("planet")!.n);
  console.log(
    `✓ control: ${agents} agents, ${withChart} carrying a chart, ` +
      `${bodies} bodies scanned, ${keys.rows.length} distinct keys`,
  );

  // ── The assertion ─────────────────────────────────────────────────────────
  const violations = FORBIDDEN_BODY_KEYS.map((k) => seen.get(k)).filter(
    (r): r is { k: string; n: string; rows: string } => r !== undefined,
  );

  if (violations.length > 0) {
    for (const v of violations) {
      console.error(
        `\n✗ forbidden key \`${v.k}\` on ${v.n} bodies across ${v.rows} chart(s)`,
      );
      const vals = await client.query<{ val: string; n: string }>(
        `
        SELECT COALESCE(body->>$1, 'JSON null') AS val, COUNT(*) AS n
          FROM user_profiles up
          JOIN users u ON u.id = up.user_id
          CROSS JOIN LATERAL jsonb_array_elements(up.natal_positions) body
         WHERE u.is_agent = true
           AND jsonb_typeof(up.natal_positions) = 'array'
           AND body ? $1
         GROUP BY 1 ORDER BY 2 DESC LIMIT 5
      `,
        [v.k],
      );
      console.error(
        `    values: ${vals.rows.map((x) => `${x.val} (${x.n})`).join(", ")}`,
      );
    }
    console.error(
      "\n  A fabricated literal is standing in for an absent measurement on the " +
        "agent-monica path.\n  Strip it at ingest (normaliseNatalPositions) and " +
        "clean the stored rows.\n  Note `0` is NOT nullish: a `?? longitude ??` " +
        "chain stops at it and never reaches `degree`.",
    );
    process.exit(1);
  }

  console.log(
    `✓ no forbidden keys (${FORBIDDEN_BODY_KEYS.join(", ")}) on any of the ` +
      `${bodies} stored bodies`,
  );
  console.log(`  keys present: ${keys.rows.map((r) => r.k).join(", ")}`);
} finally {
  await client.end();
}

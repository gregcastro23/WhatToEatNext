/**
 * One-time repair: credit the balances that the ensure-then-mutate CTE dropped.
 *
 *   railway run --service Postgres -- bun scripts/repairSpiritLedgerDrift.ts           # dry run
 *   railway run --service Postgres -- bun scripts/repairSpiritLedgerDrift.ts --write   # apply
 *
 * ── What was lost ───────────────────────────────────────────────────────────
 *
 * `creditTokensSql` opened with `WITH ensure_balance AS (INSERT INTO
 * token_balances … ON CONFLICT DO NOTHING)` and then `UPDATE token_balances …
 * WHERE user_id = $1`. Every sub-statement of a data-modifying CTE runs against
 * ONE snapshot taken before the statement, so that UPDATE could not see the row
 * `ensure_balance` had just inserted: the ledger row committed and the balance
 * never moved. PR #653 replaced it with an upsert (deployed 2026-07-26T22:03Z),
 * so no new drift can accrue. This repairs the balances left behind.
 *
 * ── The measurement this repair is derived from ─────────────────────────────
 *
 * `[MEASURED 2026-07-27]` 67 users, **521.7141** Spirit. For **67 of 67** the
 * shortfall equals exactly that user's FIRST Spirit credit — `initial_grant` 49
 * users / 490.00, `agents_yield` 17 / 21.7141, `transit_attunement` 1 / 10.00.
 * Controls: 15 Spirit-crediting users reconcile EXACTLY, and Essence, Matter and
 * Substance drift by 0 across all 82, because `creditMultipleTokens` writes the
 * four axes as separate statements in one transaction — only the first axis ever
 * met the missing-row state, and Spirit is always first.
 *
 * ── Why balance-only, and why no new ledger rows ────────────────────────────
 *
 * The ledger already records these credits correctly; it is the balance that is
 * wrong. Adding a `correction` row would make the ledger double-count the credit
 * and break the `sum(amount) === balance` correspondence this repair exists to
 * restore. Deleting the originals would rewrite an immutable ledger — rejected in
 * #652 for a related case, on the grounds that userTimelineService ("earned") and
 * dashboardPanelsService ("minted") read those rows.
 *
 * ── Safety ─────────────────────────────────────────────────────────────────
 *
 * Idempotent by construction: it credits exactly the residual `ledger - balance`,
 * so a second run finds no drift and writes nothing. It also REFUSES to run if
 * anything about the population has changed since the measurement above, rather
 * than repairing a different defect than the one authorised — and it refuses
 * outright on any NEGATIVE drift, which would mean taking tokens away and is a
 * different finding needing its own decision.
 */
import pg from "pg";

const WRITE = process.argv.includes("--write");

/** From the 2026-07-27 measurement. A material change means STOP, not proceed. */
const EXPECTED_USERS = 67;
const EXPECTED_TOTAL = 521.7141;
const TOTAL_TOLERANCE = 0.01;

const DRIFT_SQL = `
  WITH ledger AS (
    SELECT user_id, sum(amount) AS total
      FROM token_transactions WHERE token_type = 'Spirit' GROUP BY 1
  )
  SELECT b.user_id,
         l.total   AS ledger,
         b.spirit  AS balance,
         (l.total - b.spirit) AS delta
    FROM token_balances b
    JOIN ledger l ON l.user_id = b.user_id
   WHERE round(l.total::numeric, 6) <> round(b.spirit::numeric, 6)
   ORDER BY (l.total - b.spirit) DESC`;

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: no DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

let exitCode = 0;
try {
  await client.query("BEGIN");

  const before = await client.query(DRIFT_SQL);
  const rows = before.rows as Array<{ user_id: string; ledger: string; balance: string; delta: string }>;
  const total = rows.reduce((sum, r) => sum + Number(r.delta), 0);
  const negatives = rows.filter((r) => Number(r.delta) < 0);

  console.log(`\nDrifted users: ${rows.length}   net Spirit owed: ${total.toFixed(4)}`);
  console.table(
    rows.slice(0, 10).map((r) => ({
      user: r.user_id.slice(0, 8),
      ledger: Number(r.ledger).toFixed(4),
      balance: Number(r.balance).toFixed(4),
      owed: Number(r.delta).toFixed(4),
    })),
  );
  if (rows.length > 10) console.log(`  … ${rows.length - 10} more`);

  // ── Refusals ────────────────────────────────────────────────────────────
  if (negatives.length > 0) {
    console.error(
      `\nREFUSING: ${negatives.length} user(s) have a NEGATIVE drift (balance exceeds ledger). ` +
        "Repairing those would REMOVE tokens; that is a different finding and needs its own decision.",
    );
    throw new Error("negative drift present");
  }
  if (rows.length === 0) {
    console.log("\nNothing to repair — ledger and balances already agree. (Idempotent re-run.)");
    await client.query("ROLLBACK");
    await client.end();
    process.exit(0);
  }
  if (rows.length !== EXPECTED_USERS || Math.abs(total - EXPECTED_TOTAL) > TOTAL_TOLERANCE) {
    console.error(
      `\nREFUSING: population changed since the authorised measurement ` +
        `(expected ${EXPECTED_USERS} users / ${EXPECTED_TOTAL}, found ${rows.length} / ${total.toFixed(4)}). ` +
        "Re-measure and re-authorise rather than repairing a different defect.",
    );
    throw new Error("population mismatch");
  }

  if (!WRITE) {
    console.log("\nDRY RUN — no changes. Re-run with --write to apply.");
    await client.query("ROLLBACK");
    await client.end();
    process.exit(0);
  }

  // ── Apply ───────────────────────────────────────────────────────────────
  const applied = await client.query(`
    WITH ledger AS (
      SELECT user_id, sum(amount) AS total
        FROM token_transactions WHERE token_type = 'Spirit' GROUP BY 1
    ),
    drift AS (
      SELECT b.user_id, (l.total - b.spirit) AS delta
        FROM token_balances b
        JOIN ledger l ON l.user_id = b.user_id
       WHERE round(l.total::numeric, 6) <> round(b.spirit::numeric, 6)
         AND (l.total - b.spirit) > 0
    )
    UPDATE token_balances b
       SET spirit = b.spirit + d.delta,
           updated_at = now()
      FROM drift d
     WHERE b.user_id = d.user_id
    RETURNING b.user_id`);

  console.log(`\nUpdated ${applied.rowCount} balance rows.`);
  if (applied.rowCount !== EXPECTED_USERS) {
    console.error(`REFUSING to commit: updated ${applied.rowCount} rows, expected ${EXPECTED_USERS}.`);
    throw new Error("unexpected row count");
  }

  // Verify INSIDE the transaction: commit only if the invariant now holds.
  const after = await client.query(DRIFT_SQL);
  if (after.rows.length !== 0) {
    console.error(`REFUSING to commit: ${after.rows.length} user(s) still drift after the update.`);
    throw new Error("drift survived the repair");
  }
  console.log("Verified in-transaction: 0 users drift on Spirit.");

  await client.query("COMMIT");
  console.log(`\nCOMMITTED — ${EXPECTED_USERS} balances credited, ${total.toFixed(4)} Spirit total.\n`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("\nROLLED BACK — nothing was written.");
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  await client.end();
}

process.exit(exitCode);

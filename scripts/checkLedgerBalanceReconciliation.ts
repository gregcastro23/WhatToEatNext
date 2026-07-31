/**
 * Does every stored balance still equal the sum of its own ledger?
 *
 *   railway run --service Postgres -- bun scripts/checkLedgerBalanceReconciliation.ts
 *
 * Read-only against real data. The one transaction it opens is a CONTROL and is
 * always rolled back. Exits non-zero on any drift, and non-zero as UNSOUND if a
 * control fails — never green by finding nothing.
 *
 * ── The defect this locks out ────────────────────────────────────────────────
 *
 * `creditTokensSql` opened with `WITH ensure_balance AS (INSERT INTO
 * token_balances … ON CONFLICT DO NOTHING)` and then `UPDATE token_balances …
 * WHERE user_id = $1`. Every sub-statement of a data-modifying CTE runs against
 * ONE snapshot taken before the statement, so the UPDATE could not see the row
 * the CTE had just inserted: the ledger row committed and the balance never moved.
 *
 * `[MEASURED 2026-07-27]` it had silently cost **521.7141 Spirit across 67 users**,
 * each shortfall exactly that user's FIRST Spirit credit. PR #653 replaced the CTE
 * with an upsert; `scripts/repairSpiritLedgerDrift.ts` repaired the balances.
 *
 * ── Why none of the existing witnesses could see it ─────────────────────────
 *
 * The ledger was perfectly correct and the balances were internally valid — no
 * constraint was violated, no value drifted from an engine, no row was cloned, no
 * field was fabricated. The defect lived only in the RELATIONSHIP between two
 * tables that nothing compared. It also failed silently at the call site, because
 * `creditMultipleTokens` only records a result when `rows.length > 0`, which is
 * indistinguishable from an idempotency replay.
 *
 * ── Why a per-axis check, and why per-user ──────────────────────────────────
 *
 * Only Spirit ever drifted, because the four axes are written as separate
 * statements inside one transaction: the first statement's invisible insert IS
 * visible to the second, so only the first axis met the missing-row state. A
 * whole-table SUM would also have hidden it — offsetting per-user differences can
 * net to zero — so the comparison is per user, per axis.
 */
import pg from "pg";

const AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;

/** Per-user, per-axis comparison. `having` lets the control inject a fake drift. */
const driftSql = (extraJoin = "", extraWhere = "TRUE") => `
  WITH ledger AS (
    SELECT user_id, token_type, sum(amount) AS total
      FROM token_transactions GROUP BY 1, 2
  ),
  paired AS (
    SELECT l.user_id, l.token_type, l.total AS ledger,
           CASE lower(l.token_type)
             WHEN 'spirit'    THEN b.spirit
             WHEN 'essence'   THEN b.essence
             WHEN 'matter'    THEN b.matter
             WHEN 'substance' THEN b.substance
           END AS balance
      FROM token_balances b
      JOIN ledger l ON l.user_id = b.user_id
      ${extraJoin}
     WHERE ${extraWhere}
  )
  SELECT user_id, token_type, ledger, balance, (ledger - balance) AS delta
    FROM paired
   WHERE balance IS NOT NULL
     AND round(ledger::numeric, 6) <> round(balance::numeric, 6)`;

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: no DATABASE_PUBLIC_URL / DATABASE_URL — this gate needs a real database.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

const problems: string[] = [];
let unsound = false;

try {
  // ── CONTROL 1: can this gate reach populated tables at all? ──────────────
  // A broken query and a clean database look identical from the outside.
  const counts = await client.query(`
    SELECT (SELECT count(*) FROM token_balances)     AS balances,
           (SELECT count(*) FROM token_transactions) AS ledger_rows,
           (SELECT count(DISTINCT user_id) FROM token_transactions) AS ledger_users`);
  const { balances, ledger_rows, ledger_users } = counts.rows[0];
  if (Number(balances) === 0 || Number(ledger_rows) === 0) {
    console.error(`✗ CONTROL FAILED: token_balances=${balances}, token_transactions=${ledger_rows}. Nothing to reconcile — the gate cannot pass on an empty read.`);
    unsound = true;
  } else {
    console.log(`✓ control: ${balances} balance rows, ${ledger_rows} ledger rows across ${ledger_users} users`);
  }

  // ── CONTROL 2: does the detector actually detect? ────────────────────────
  // Inject a drift, confirm it is caught, roll it back. Without this, a query
  // that silently matches nothing reports "reconciled" forever.
  await client.query("BEGIN");
  const victim = await client.query(
    `SELECT user_id FROM token_balances b
      WHERE EXISTS (SELECT 1 FROM token_transactions t WHERE t.user_id = b.user_id AND t.token_type = 'Spirit')
      LIMIT 1`,
  );
  if (victim.rows.length === 0) {
    console.error("✗ CONTROL FAILED: no user has any Spirit ledger row, so the detector cannot be exercised.");
    unsound = true;
  } else {
    const victimId = victim.rows[0].user_id;
    await client.query(`UPDATE token_balances SET spirit = spirit + 1.25 WHERE user_id = $1`, [victimId]);
    const caught = await client.query(driftSql());
    const sawIt = caught.rows.some(
      (r: { user_id: string; token_type: string }) => r.user_id === victimId && r.token_type === "Spirit",
    );
    if (sawIt) {
      console.log("✓ control: an injected 1.25 drift IS detected (rolled back)");
    } else {
      console.error("✗ CONTROL FAILED: injected a 1.25 Spirit drift and the detector did not report it. Every result below is meaningless.");
      unsound = true;
    }
  }
  await client.query("ROLLBACK");

  // ── The check itself ────────────────────────────────────────────────────
  const drift = await client.query(driftSql());
  const rows = drift.rows as Array<{ user_id: string; token_type: string; ledger: string; balance: string; delta: string }>;

  for (const axis of AXES) {
    const forAxis = rows.filter((r) => r.token_type === axis);
    if (forAxis.length === 0) {
      console.log(`✓ ${axis}: every balance equals its ledger`);
      continue;
    }
    const net = forAxis.reduce((s, r) => s + Number(r.delta), 0);
    console.error(`✗ ${axis}: ${forAxis.length} user(s) drift, net ${net.toFixed(4)}`);
    for (const r of forAxis.slice(0, 5)) {
      console.error(`    ${r.user_id.slice(0, 8)}  ledger ${Number(r.ledger).toFixed(4)}  balance ${Number(r.balance).toFixed(4)}  delta ${Number(r.delta).toFixed(4)}`);
    }
    if (forAxis.length > 5) console.error(`    … ${forAxis.length - 5} more`);
    problems.push(`${axis}: ${forAxis.length} users, net ${net.toFixed(4)}`);
  }

  // A ledger row whose user has NO balance row is the same defect one step
  // earlier — the credit never created the row it was supposed to create.
  const orphans = await client.query(`
    SELECT count(DISTINCT t.user_id) AS users, round(sum(t.amount)::numeric, 4) AS total
      FROM token_transactions t
      LEFT JOIN token_balances b ON b.user_id = t.user_id
     WHERE b.user_id IS NULL`);
  const orphanUsers = Number(orphans.rows[0].users);
  if (orphanUsers > 0) {
    console.error(`✗ ${orphanUsers} user(s) have ledger rows but NO token_balances row (${orphans.rows[0].total} tokens)`);
    problems.push(`${orphanUsers} users with a ledger but no balance row`);
  } else {
    console.log("✓ every user with a ledger row has a balance row");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("✗ gate errored:", error instanceof Error ? error.message : error);
  unsound = true;
} finally {
  await client.end();
}

if (unsound) {
  console.error("\nUNSOUND — a control failed, so this run proves nothing. Fix the gate before trusting it.\n");
  process.exit(1);
}
if (problems.length > 0) {
  console.error(`\nFAILED (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}\n`);
  console.error("Repair with scripts/repairSpiritLedgerDrift.ts (dry run first) after confirming the CAUSE — a\nnew drift means a write path is bypassing the upsert, and repairing data without\nfixing that path just refills the same hole.\n");
  process.exit(1);
}
console.log("\nPASS — every balance reconciles with its own ledger, on all four axes.\n");

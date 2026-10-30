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
import { readAgentLedgerDrift } from "./lib/agentLedgerRepair";

const AXES = ["Spirit", "Essence", "Matter", "Substance"] as const;

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
    const caught = await readAgentLedgerDrift(client);
    const sawIt = caught.some(
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
  const rows = await readAgentLedgerDrift(client);

  for (const axis of AXES) {
    const forAxis = rows.filter((row) => !row.orphan && row.token_type === axis);
    if (forAxis.length === 0) {
      console.log(`✓ ${axis}: every balance equals its ledger`);
      continue;
    }
    console.error(`✗ ${axis}: ${forAxis.length} user(s) drift`);
    for (const row of forAxis.slice(0, 5)) {
      console.error(`    ${row.user_id.slice(0, 8)}  ledger ${row.ledger}  balance ${row.balance}  delta ${row.delta}`);
    }
    if (forAxis.length > 5) console.error(`    … ${forAxis.length - 5} more`);
    problems.push(`${axis}: ${forAxis.length} users`);
  }

  const orphanUsers = new Set(rows.filter((row) => row.orphan).map((row) => row.user_id));
  if (orphanUsers.size > 0) {
    console.error(`✗ ${orphanUsers.size} user(s) have ledger rows but NO token_balances row`);
    problems.push(`${orphanUsers.size} users with a ledger but no balance row`);
  } else {
    console.log("✓ every user with a ledger row has a balance row");
  }
  const unknownAxes = rows.filter((row) => !row.valid_axis);
  if (unknownAxes.length > 0) {
    console.error(`✗ ${unknownAxes.length} ledger pair(s) use unknown token axes`);
    problems.push(`${unknownAxes.length} unknown token axes`);
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
  console.error("Repair with scripts/repairSpiritLedgerDrift.ts or scripts/repairAgentLedgerDrift.ts (dry run first)\nafter confirming the CAUSE — a new drift means a write path is bypassing the upsert,\nand repairing data without fixing that path just refills the same hole.\n");
  process.exit(1);
}
console.log("\nPASS — every balance reconciles with its own ledger, on all four axes.\n");

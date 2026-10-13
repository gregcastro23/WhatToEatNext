/**
 * scripts/repairAgentLedgerDrift.ts
 *
 * One-time repair: credit the missing agent initialization transactions into
 * token_transactions so that every historical agent's stored balance equals
 * the sum of their own ledger.
 *
 *   railway run --service Postgres -- bun scripts/repairAgentLedgerDrift.ts           # dry run
 *   railway run --service Postgres -- bun scripts/repairAgentLedgerDrift.ts --write   # apply
 *
 * ── The defect this repairs ──────────────────────────────────────────────────
 *
 * scripts/sync-agentic-users.ts populated token_balances directly from the
 * Planetary Agents ESMS payload (alchemicalState.esms) using an ON CONFLICT DO
 * UPDATE on token_balances, without inserting the corresponding initial credit
 * into token_transactions.
 *
 * When agents subsequently executed actions (agent_feed_post), sync-debit debited
 * token_balances and recorded the debits in token_transactions. Because the initial
 * credit was never written to token_transactions, the ledger sum went negative (or
 * lagged the balance by the unrecorded initial grant).
 *
 * ── Safety ───────────────────────────────────────────────────────────────────
 *
 * - Read-only dry run by default.
 * - Refuses if any non-agent row is drifted.
 * - Refuses on any negative owed amount (where balance < ledger).
 * - Verified in-transaction: asserts 0 drifted rows remain before COMMIT.
 * - Idempotent via idempotency_key: 'reconcile_agent_esms_seed:<userId>:<tokenType>'.
 */
import pg from "pg";

const WRITE = process.argv.includes("--write");

const DRIFT_SQL = `
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
  )
  SELECT p.user_id, u.name, u.is_agent, p.token_type, p.ledger, p.balance,
         round((p.balance::numeric - p.ledger::numeric), 4) AS owed
    FROM paired p
    JOIN users u ON u.id = p.user_id
   WHERE p.balance IS NOT NULL
     AND round(p.ledger::numeric, 6) <> round(p.balance::numeric, 6)
   ORDER BY (p.balance::numeric - p.ledger::numeric) DESC`;

const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: no DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  await client.query("BEGIN");

  const before = await client.query(DRIFT_SQL);
  const rows = before.rows as Array<{
    user_id: string;
    name: string;
    is_agent: boolean;
    token_type: string;
    ledger: string;
    balance: string;
    owed: string;
  }>;

  if (rows.length === 0) {
    console.log("✓ Nothing to repair — ledger and balances already agree. (Idempotent re-run.)");
    await client.query("ROLLBACK");
    await client.end();
    process.exit(0);
  }

  const nonAgents = rows.filter((r) => !r.is_agent);
  if (nonAgents.length > 0) {
    console.error(`REFUSING: ${nonAgents.length} drifted row(s) belong to non-agents!`, nonAgents);
    throw new Error("non-agent drift detected");
  }

  const negativeOwed = rows.filter((r) => Number(r.owed) <= 0);
  if (negativeOwed.length > 0) {
    console.error(
      `REFUSING: ${negativeOwed.length} row(s) have non-positive owed amounts (balance <= ledger).`,
      negativeOwed,
    );
    throw new Error("negative owed amount");
  }

  const totalOwed = rows.reduce((sum, r) => sum + Number(r.owed), 0);
  const uniqueUsers = new Set(rows.map((r) => r.user_id));
  console.log(`\nFound ${rows.length} drifted axis pairs across ${uniqueUsers.size} agents.`);
  console.log(`Total missing credits to restore: ${totalOwed.toFixed(4)} tokens.\n`);

  console.table(
    rows.slice(0, 15).map((r) => ({
      agent: r.name,
      token: r.token_type,
      ledger: Number(r.ledger).toFixed(4),
      balance: Number(r.balance).toFixed(4),
      owed: Number(r.owed).toFixed(4),
    })),
  );
  if (rows.length > 15) {
    console.log(`  … and ${rows.length - 15} more pairs.`);
  }

  if (!WRITE) {
    console.log("\n[DRY RUN] No changes committed. Re-run with --write to apply.");
    await client.query("ROLLBACK");
    await client.end();
    process.exit(0);
  }

  // ── Apply the repair ───────────────────────────────────────────────────────
  console.log("\nApplying repair transactions to token_transactions...");
  let inserted = 0;
  for (const r of rows) {
    const key = `reconcile_agent_esms_seed:${r.user_id}:${r.token_type}`;
    const insertRes = await client.query(
      `INSERT INTO token_transactions (
         transaction_group_id,
         user_id,
         token_type,
         amount,
         source_type,
         source_id,
         description,
         idempotency_key,
         created_at
       ) VALUES (
         uuid_generate_v4(),
         $1,
         $2,
         $3::decimal,
         'initial_grant',
         'asol_esms_sync',
         'Historical agent ESMS balance seed reconciliation',
         $4,
         now()
       )
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING id`,
      [r.user_id, r.token_type, r.owed, key],
    );
    if (insertRes.rowCount && insertRes.rowCount > 0) {
      inserted++;
    }
  }

  console.log(`Inserted ${inserted} reconciliation transactions.`);

  // ── Verify in-transaction ──────────────────────────────────────────────────
  const verify = await client.query(DRIFT_SQL);
  if (verify.rows.length !== 0) {
    console.error(`REFUSING TO COMMIT: ${verify.rows.length} drifted pairs remain!`, verify.rows);
    throw new Error("in-transaction reconciliation verification failed");
  }

  console.log("✓ In-transaction check: 0 drifted pairs remain! Every balance equals its ledger.");
  await client.query("COMMIT");
  console.log("✓ Successfully COMMITTED repair to database.");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("Repair failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}

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
 * - Refuses orphan ledger rows and locks both tables while writing.
 * - Verified in-transaction: asserts 0 drifted rows remain before COMMIT.
 * - Idempotent via idempotency_key: 'reconcile_agent_esms_seed:<userId>:<tokenType>'.
 * - Records missing initialization credits only. ADR-010's written-off agent
 *   operations stay written off; this does not estimate or reconstruct debits.
 */
import pg from "pg";
import { repairAgentLedger } from "./lib/agentLedgerRepair";

const WRITE = process.argv.includes("--write");
const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: no DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  if (WRITE) console.log("\nApplying repair transactions to token_transactions...");
  const result = await repairAgentLedger(client, { write: WRITE });
  if (result.rows.length === 0) {
    console.log("✓ Nothing to repair — ledger and balances already agree. (Idempotent re-run.)");
  } else {
    const uniqueUsers = new Set(result.rows.map((row) => row.user_id));
    console.log(`\nFound ${result.rows.length} drifted axis pairs across ${uniqueUsers.size} agents.`);
    console.log(`Total missing credits to restore: ${result.totalOwed} tokens.\n`);
    console.table(result.rows.slice(0, 15).map((row) => ({
      agent: row.name, token: row.token_type, ledger: row.ledger,
      balance: row.balance, owed: row.owed,
    })));
    if (result.rows.length > 15) console.log(`  … and ${result.rows.length - 15} more pairs.`);
    if (result.committed) {
      console.log(`Inserted ${result.inserted} reconciliation transactions.`);
      console.log("✓ In-transaction check: 0 drifted pairs remain! Every balance equals its ledger.");
      console.log("✓ Successfully COMMITTED repair to database.");
    }
  }
  if (!WRITE) console.log("\n[DRY RUN] No changes committed. Re-run with --write to apply.");
} catch (error) {
  console.error("Repair failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}

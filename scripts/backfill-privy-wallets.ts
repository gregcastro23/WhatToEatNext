/**
 * Backfill `users.wallet_address` from Privy for users who have linked a
 * `privy_did` but whose embedded-wallet address was never resolved/stored.
 *
 * This is the ONLY real "sync Postgres ↔ Privy" operation: for already-linked
 * users, pull the server-authoritative embedded wallet from Privy and store it
 * locally so alchm.kitchen and PA (agents.alchm.kitchen) resolve the same
 * wallet (the wallet_address column was added in migration 53). You CANNOT
 * create Privy identities for users server-side — linking is user-initiated.
 *
 * SAFE BY DEFAULT: dry-run (reports what it WOULD do). Pass --apply to write.
 * Each UPDATE is idempotent and guarded `WHERE wallet_address IS NULL`.
 *
 * Requires: DATABASE_URL, NEXT_PUBLIC_PRIVY_APP_ID, PRIVY_APP_SECRET.
 *
 * Usage:
 *   bun scripts/backfill-privy-wallets.ts            # dry-run
 *   bun scripts/backfill-privy-wallets.ts --apply    # write
 *
 * @file scripts/backfill-privy-wallets.ts
 */
import { PrivyClient } from "@privy-io/server-auth";
import { Client } from "pg";

const APPLY = process.argv.includes("--apply");

function sslFor(url: string) {
  if (url.includes("proxy.rlwy.net")) return { rejectUnauthorized: false } as const;
  if (url.includes("railway.internal")) return false;
  return undefined;
}

/** Resolve the embedded EVM wallet for a DID (mirrors src/lib/privy/server.ts). */
async function resolveWallet(privy: PrivyClient, did: string): Promise<string | null> {
  try {
    const user = await privy.getUser(did);
    const accounts = ((user as { linkedAccounts?: unknown[] }).linkedAccounts || []) as Array<
      Record<string, unknown>
    >;
    const embedded = accounts.find(
      (a) => a?.type === "wallet" && a?.walletClientType === "privy" && a?.chainType === "ethereum",
    );
    const any = accounts.find((a) => a?.type === "wallet");
    return ((embedded?.address ?? any?.address) as string | undefined) ?? null;
  } catch (e) {
    console.warn(`  ! getUser failed for DID: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (!appId || !appSecret) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET must be set to resolve wallets");
  }

  const privy = new PrivyClient(appId, appSecret);
  const client = new Client({ connectionString: url, ssl: sslFor(url), connectionTimeoutMillis: 15_000 });
  await client.connect();

  const { rows } = await client.query<{ id: string; privy_did: string }>(`
    SELECT id, privy_did FROM users
    WHERE privy_did IS NOT NULL AND wallet_address IS NULL`);

  console.log(`Mode: ${APPLY ? "APPLY (will write)" : "DRY-RUN (no writes)"}`);
  console.log(`Candidates (linked Privy, missing wallet): ${rows.length}\n`);

  if (rows.length === 0) {
    console.log("✅ Nothing to backfill. Postgres ↔ Privy wallet linkage is consistent.");
    await client.end();
    return;
  }

  let resolved = 0;
  let written = 0;
  for (const row of rows) {
    const wallet = await resolveWallet(privy, row.privy_did);
    if (!wallet) {
      console.log(`  user ${row.id}: no embedded wallet on Privy (skip)`);
      continue;
    }
    resolved++;
    if (APPLY) {
      const res = await client.query(
        `UPDATE users SET wallet_address = $1 WHERE id = $2 AND wallet_address IS NULL`,
        [wallet, row.id],
      );
      written += res.rowCount ?? 0;
      console.log(`  user ${row.id}: wallet …${wallet.slice(-6)} → WRITTEN`);
    } else {
      console.log(`  user ${row.id}: wallet …${wallet.slice(-6)} → would write`);
    }
  }

  console.log(
    `\nResolved ${resolved}/${rows.length} wallets.` +
      (APPLY ? ` Wrote ${written} rows.` : ` Re-run with --apply to write.`),
  );
  await client.end();
}

main().catch((e) => {
  console.error("BACKFILL FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});

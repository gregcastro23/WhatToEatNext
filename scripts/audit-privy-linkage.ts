/**
 * Read-only audit of Postgres ↔ Privy user linkage.
 *
 * Privy is an OPT-IN, per-user cross-site identity layered on top of NextAuth
 * (see src/lib/privy/server.ts). A user links by logging into Privy in the
 * browser and POSTing their Privy token to /api/account/privy, which stores
 * `privy_did` + the server-resolved `wallet_address` on their `users` row.
 *
 * There is NO bulk "push users into Privy" — DIDs only exist for users who have
 * actively authenticated with Privy. The only reconcilable state is: users who
 * HAVE a privy_did but are missing wallet_address (backfill those via
 * scripts/backfill-privy-wallets.ts).
 *
 * This script only ever SELECTs (session is forced read-only). It prints
 * aggregate counts only — never emails, DIDs, or wallet addresses.
 *
 * Usage:
 *   DATABASE_URL=postgres://… bun scripts/audit-privy-linkage.ts
 *   (on Railway, DATABASE_URL is already set)
 *
 * @file scripts/audit-privy-linkage.ts
 */
import { Client } from "pg";

function sslFor(url: string) {
  if (url.includes("proxy.rlwy.net")) return { rejectUnauthorized: false } as const;
  if (url.includes("railway.internal")) return false; // internal network, no TLS
  return undefined;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Provide the prod connection string.");
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: sslFor(url),
    connectionTimeoutMillis: 15_000,
    statement_timeout: 15_000,
  });
  await client.connect();
  // HARD GUARD — any accidental write throws.
  await client.query("SET default_transaction_read_only = on");

  const { rows: [totals] } = await client.query(`
    SELECT
      COUNT(*)::int                                              AS total_users,
      COUNT(*) FILTER (WHERE is_agent IS TRUE)::int              AS agents,
      COUNT(*) FILTER (WHERE is_agent IS NOT TRUE)::int          AS humans
    FROM users`);

  const { rows: [privy] } = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE privy_did IS NOT NULL)::int                                 AS linked_privy,
      COUNT(*) FILTER (WHERE wallet_address IS NOT NULL)::int                            AS has_wallet,
      COUNT(*) FILTER (WHERE privy_did IS NOT NULL AND wallet_address IS NULL)::int      AS backfill_candidates,
      COUNT(*) FILTER (WHERE privy_did IS NULL AND wallet_address IS NOT NULL)::int      AS wallet_without_did
    FROM users`);

  const { rows: [dupes] } = await client.query(`
    SELECT COUNT(*)::int AS duplicate_did_groups FROM (
      SELECT privy_did FROM users WHERE privy_did IS NOT NULL
      GROUP BY privy_did HAVING COUNT(*) > 1
    ) d`);

  let probes: unknown[] = [];
  try {
    const r = await client.query(`
      SELECT DISTINCT ON (probe_name)
        probe_name, status, http_status,
        to_char(started_at, 'YYYY-MM-DD HH24:MI TZ') AS started_at,
        ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 60)::int AS age_min
      FROM synthetic_probe_results
      ORDER BY probe_name, started_at DESC`);
    probes = r.rows;
  } catch {
    probes = [{ note: "synthetic_probe_results unavailable" }];
  }

  await client.end();

  console.log("=== USER TOTALS ===");
  console.table([totals]);
  console.log("\n=== PRIVY LINKAGE ===");
  console.table([privy]);
  console.log(`duplicate_did_groups: ${dupes.duplicate_did_groups} (must be 0 — privy_did is UNIQUE)`);
  console.log("\n=== LATEST SYNTHETIC PROBES ===");
  console.table(probes);

  if (privy.backfill_candidates > 0) {
    console.log(
      `\n⚠️  ${privy.backfill_candidates} user(s) linked Privy but have no wallet_address.\n` +
        `    Run: bun scripts/backfill-privy-wallets.ts            (dry-run)\n` +
        `         bun scripts/backfill-privy-wallets.ts --apply    (write)`,
    );
  } else {
    console.log("\n✅ No wallet backfill needed — Postgres ↔ Privy wallet linkage is consistent.");
  }
}

main().catch((e) => {
  console.error("AUDIT FAILED:", e instanceof Error ? e.message : e);
  process.exit(1);
});

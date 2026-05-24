/**
 * One-off SQL migration runner
 *
 * Usage:
 *   railway run --service Postgres bun scripts/run-sql-migration.ts <path-to-sql>
 *
 * The script reads a `.sql` file and executes it inside a transaction
 * against `DATABASE_PUBLIC_URL` (preferred for local execution) or
 * `DATABASE_URL` (fallback). It rolls back on any error so a partial
 * apply never lands.
 *
 * Designed for idempotent migration files (`CREATE TABLE IF NOT EXISTS`
 * / `CREATE INDEX IF NOT EXISTS`); safe to re-run.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    console.error("usage: bun scripts/run-sql-migration.ts <path-to-sql>");
    process.exit(2);
  }

  const absPath = resolve(file);
  const sql = readFileSync(absPath, "utf8");
  if (!sql.trim()) {
    console.error(`migration file ${absPath} is empty`);
    process.exit(2);
  }

  // `railway run --service Postgres` injects the Postgres service's vars.
  // DATABASE_PUBLIC_URL works from a local shell; DATABASE_URL points to
  // the internal hostname (postgres.railway.internal) and only resolves
  // from inside Railway's network.
  const connectionString =
    process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_PUBLIC_URL / DATABASE_URL not set — did you forget `railway run --service Postgres`?",
    );
    process.exit(2);
  }

  console.log(`▶ applying ${absPath}`);
  // Mask the password in the announcement so it doesn't leak into stdout.
  console.log(`  → ${connectionString.replace(/:[^:@/]+@/, ":****@")}`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("BEGIN");
    const startedAt = Date.now();
    await client.query(sql);
    await client.query("COMMIT");
    const ms = Date.now() - startedAt;
    console.log(`✓ applied in ${ms}ms`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("✗ migration failed — rolled back");
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("✗ runner crashed:", err);
  process.exit(1);
});

/**
 * One-off check that a specific table + its indexes exist. Safe read-only
 * verification step paired with run-sql-migration.ts.
 *
 * Usage:
 *   railway run --service Postgres bun scripts/verify-table.ts <table_name>
 */

import { Client } from "pg";

async function main(): Promise<void> {
  const tableName = process.argv[2];
  if (!tableName) {
    console.error("usage: bun scripts/verify-table.ts <table_name>");
    process.exit(2);
  }

  const connectionString =
    process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_PUBLIC_URL / DATABASE_URL not set");
    process.exit(2);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const tableRes = await client.query<{
      schema: string;
      name: string;
      column_count: number;
    }>(
      `SELECT
         table_schema AS schema,
         table_name AS name,
         (
           SELECT COUNT(*)::int FROM information_schema.columns c
           WHERE c.table_schema = t.table_schema
             AND c.table_name = t.table_name
         ) AS column_count
       FROM information_schema.tables t
       WHERE table_name = $1`,
      [tableName],
    );
    if (tableRes.rows.length === 0) {
      console.error(`✗ table ${tableName} not found`);
      process.exit(1);
    }
    for (const row of tableRes.rows) {
      console.log(
        `✓ ${row.schema}.${row.name} exists · ${row.column_count} columns`,
      );
    }

    const idxRes = await client.query<{ name: string }>(
      `SELECT indexname AS name
       FROM pg_indexes
       WHERE tablename = $1
       ORDER BY indexname`,
      [tableName],
    );
    console.log(`  indexes (${idxRes.rows.length}):`);
    for (const idx of idxRes.rows) {
      console.log(`    - ${idx.name}`);
    }

    const countRes = await client.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM ${tableName}`,
    );
    console.log(`  rows: ${countRes.rows[0]?.count ?? 0}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

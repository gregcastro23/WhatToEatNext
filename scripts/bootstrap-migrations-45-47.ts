#!/usr/bin/env bun
/**
 * One-shot: diagnose the schema-drift on migrations 45/46/47 and (if
 * the drifted tables actually exist) bootstrap the `_migrations`
 * tracking table so the Python migration runner stops looping on
 * "relation already exists".
 *
 * Usage:
 *   DATABASE_URL=<tcp-proxy-url> bun scripts/bootstrap-migrations-45-47.ts        # report-only
 *   DATABASE_URL=<tcp-proxy-url> bun scripts/bootstrap-migrations-45-47.ts --apply  # bootstrap
 *
 * Migration 45 is the only one with bare CREATE TABLE (46 + 47 use IF
 * NOT EXISTS already). If 45's tables exist and 45 isn't tracked, we
 * mark 45 applied. 46 + 47 are bootstrapped only when their tables
 * also exist; otherwise they're allowed to run normally.
 */

import { Pool } from "pg";

const APPLY = process.argv.includes("--apply");

const MIGRATIONS_TO_INSPECT = [
  {
    filename: "45-agent-forge-schema.sql",
    sentinelTables: ["alchemical_constitutions", "celestial_pantries"],
  },
  {
    filename: "46-mcp-invocations.sql",
    sentinelTables: ["mcp_invocations"],
  },
  {
    filename: "47-synastry-cache.sql",
    sentinelTables: ["agent_natal_positions"],
  },
];

async function main(): Promise<number> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    process.stderr.write("error: DATABASE_URL required\n");
    return 1;
  }

  const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS _migrations (
         filename TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
       )`,
    );

    const tracked = await pool.query<{ filename: string }>(
      `SELECT filename FROM _migrations WHERE filename = ANY($1::text[])`,
      [MIGRATIONS_TO_INSPECT.map((m) => m.filename)],
    );
    const trackedSet = new Set(tracked.rows.map((r) => r.filename));

    process.stdout.write("== migration drift report ==\n");
    const toBootstrap: string[] = [];
    for (const m of MIGRATIONS_TO_INSPECT) {
      const existence = await pool.query<{ relname: string }>(
        `SELECT c.relname
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relkind = 'r'
            AND n.nspname = 'public'
            AND c.relname = ANY($1::text[])`,
        [m.sentinelTables],
      );
      const tablesPresent = existence.rows.map((r) => r.relname);
      const allPresent =
        tablesPresent.length === m.sentinelTables.length;
      const isTracked = trackedSet.has(m.filename);
      process.stdout.write(
        `  ${m.filename}\n` +
          `    sentinel tables expected: ${m.sentinelTables.join(", ")}\n` +
          `    sentinel tables present : ${tablesPresent.join(", ") || "(none)"}\n` +
          `    tracked in _migrations  : ${isTracked}\n`,
      );
      if (allPresent && !isTracked) {
        toBootstrap.push(m.filename);
      }
    }

    if (toBootstrap.length === 0) {
      process.stdout.write("\nno drift to fix — exiting cleanly\n");
      return 0;
    }

    process.stdout.write(`\nwould bootstrap: ${toBootstrap.join(", ")}\n`);
    if (!APPLY) {
      process.stdout.write("(dry-run — pass --apply to commit)\n");
      return 0;
    }

    for (const f of toBootstrap) {
      await pool.query(
        `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
        [f],
      );
      process.stdout.write(`  bootstrapped ${f}\n`);
    }
    process.stdout.write("done\n");
    return 0;
  } finally {
    await pool.end();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`error: ${String(err)}\n`);
    process.exit(1);
  });

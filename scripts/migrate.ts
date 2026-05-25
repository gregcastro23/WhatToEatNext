/**
 * Deployment-time migration runner.
 *
 * Reads database/init/*.sql in numeric order, applies any that haven't been
 * recorded in the _migrations tracking table, marks them on success. The
 * tracking table is bootstrapped on first run with whatever filenames are
 * passed via --bootstrap=<comma,separated,list> so existing prod state isn't
 * re-applied.
 *
 * Single statement per file is wrapped in a transaction. If any file errors
 * the runner aborts and leaves prior commits intact — the next run picks up
 * where the failure happened.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... bun scripts/migrate.ts
 *   DATABASE_URL=... bun scripts/migrate.ts --dry-run
 *   DATABASE_URL=... bun scripts/migrate.ts --bootstrap=01-schema.sql,02-...
 *
 * This is the canonical runner. The Railway backend Dockerfile installs Bun
 * and invokes this at container start, before uvicorn, so every prod deploy
 * catches up on any unapplied database/init/*.sql files.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import pkg from "pg";

const { Client } = pkg;

const ROOT = resolve(import.meta.dir, "..");
const INIT_DIR = join(ROOT, "database", "init");

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const bootstrapArg = process.argv
  .find((a) => a.startsWith("--bootstrap="))
  ?.split("=", 2)[1];
const bootstrap = bootstrapArg ? bootstrapArg.split(",").map((s) => s.trim()).filter(Boolean) : null;

function listMigrationFiles(): string[] {
  return readdirSync(INIT_DIR)
    .filter((f) => f.endsWith(".sql") && !f.includes(" 2."))
    .sort();
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("[migrate] DATABASE_URL is not set");
    process.exit(1);
  }
  if (!existsSync(INIT_DIR)) {
    console.error(`[migrate] migration dir not found: ${INIT_DIR}`);
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    if (bootstrap && bootstrap.length > 0) {
      console.log(`[migrate] bootstrap: marking ${bootstrap.length} file(s) as applied`);
      for (const f of bootstrap) {
        await client.query(
          `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
          [f],
        );
      }
    }

    const applied = new Set(
      (await client.query<{ filename: string }>(`SELECT filename FROM _migrations`)).rows.map(
        (r) => r.filename,
      ),
    );

    const files = listMigrationFiles();
    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log(`[migrate] up to date (${files.length} files, ${applied.size} applied)`);
      return;
    }
    console.log(`[migrate] ${pending.length} pending: ${pending.join(", ")}`);

    for (const f of pending) {
      const sql = readFileSync(join(INIT_DIR, f), "utf8");
      if (dryRun) {
        console.log(`[migrate] DRY-RUN would apply ${f} (${sql.length} bytes)`);
        continue;
      }
      console.log(`[migrate] applying ${f}...`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
          [f],
        );
        await client.query("COMMIT");
        console.log(`[migrate]   ok ${f}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[migrate]   FAILED ${f}:`, err instanceof Error ? err.message : err);
        process.exit(1);
      }
    }
    console.log(`[migrate] done. applied ${pending.length} new migration(s).`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

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

// ── No-transaction migrations ─────────────────────────────────────────────
// Most migrations run inside a transaction (the file + its _migrations row commit
// atomically). Some statements are illegal inside a transaction block — notably
// CREATE/DROP INDEX CONCURRENTLY. A migration opts out by declaring
// `-- migrate:no-transaction`, or is auto-detected when it contains CONCURRENTLY,
// and then runs statement-by-statement in autocommit. Such migrations MUST be
// idempotent (IF NOT EXISTS) — a mid-file failure is not rolled back.
const NO_TXN_DIRECTIVE = "migrate:no-transaction";

function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "");
}

function needsNoTransaction(sql: string): boolean {
  if (sql.toLowerCase().includes(NO_TXN_DIRECTIVE)) return true;
  // Detect CONCURRENTLY only in executable SQL, not comments.
  return /\bconcurrently\b/i.test(stripSqlComments(sql));
}

// Split SQL on top-level `;`, respecting '...' strings, $tag$...$tag$
// dollar-quotes, and line/block comments.
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let buf = "";
  let i = 0;
  const n = sql.length;
  let inSquote = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag: string | null = null;
  while (i < n) {
    const ch = sql[i];
    const pair = sql.slice(i, i + 2);
    if (inLineComment) {
      buf += ch;
      if (ch === "\n") inLineComment = false;
      i += 1;
    } else if (inBlockComment) {
      buf += ch;
      if (pair === "*/") {
        buf += "/";
        inBlockComment = false;
        i += 2;
      } else {
        i += 1;
      }
    } else if (dollarTag !== null) {
      if (sql.startsWith(dollarTag, i)) {
        buf += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
      } else {
        buf += ch;
        i += 1;
      }
    } else if (inSquote) {
      buf += ch;
      if (ch === "'") {
        if (sql[i + 1] === "'") {
          buf += "'";
          i += 2;
          continue;
        }
        inSquote = false;
      }
      i += 1;
    } else if (pair === "--") {
      inLineComment = true;
      buf += pair;
      i += 2;
    } else if (pair === "/*") {
      inBlockComment = true;
      buf += pair;
      i += 2;
    } else if (ch === "'") {
      inSquote = true;
      buf += ch;
      i += 1;
    } else if (ch === "$") {
      const m = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
      if (m) {
        dollarTag = m[0];
        buf += dollarTag;
        i += dollarTag.length;
      } else {
        buf += ch;
        i += 1;
      }
    } else if (ch === ";") {
      const stmt = buf.trim();
      if (stmt) statements.push(stmt);
      buf = "";
      i += 1;
    } else {
      buf += ch;
      i += 1;
    }
  }
  const tail = buf.trim();
  if (tail) statements.push(tail);
  return statements;
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
      const noTxn = needsNoTransaction(sql);
      if (dryRun) {
        console.log(`[migrate] DRY-RUN would apply ${f} (${sql.length} bytes, ${noTxn ? "no-txn" : "txn"})`);
        continue;
      }
      console.log(`[migrate] applying ${f}${noTxn ? " [no-txn]" : ""}...`);
      try {
        if (noTxn) {
          // Outside a transaction: pg auto-commits each query when no BEGIN is
          // open, so run statements one at a time (CREATE INDEX CONCURRENTLY etc.).
          // Idempotent only — a mid-file failure is not rolled back.
          for (const stmt of splitSqlStatements(sql)) {
            if (!stripSqlComments(stmt).trim()) continue;
            await client.query(stmt);
          }
          await client.query(
            `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
            [f],
          );
        } else {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query(
            `INSERT INTO _migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
            [f],
          );
          await client.query("COMMIT");
        }
        console.log(`[migrate]   ok ${f}`);
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        console.error(`[migrate]   FAILED ${f}:`, err instanceof Error ? err.message : err);
        process.exit(1);
      }
    }
    console.log(`[migrate] done. applied ${pending.length} new migration(s).`);
  } finally {
    await client.end();
  }
}

// Only run when invoked directly (the prod Dockerfile does `bun scripts/migrate.ts`);
// guarded so the no-transaction helpers can be imported in tests without connecting.
if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { splitSqlStatements, needsNoTransaction, stripSqlComments };

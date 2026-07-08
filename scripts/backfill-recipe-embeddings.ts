/**
 * scripts/backfill-recipe-embeddings.ts
 *
 * Backfill recipes.description_embedding for every public recipe with a
 * description but no embedding yet. Embeds via OpenAI text-embedding-3-small
 * (src/lib/embeddings/openaiEmbeddings.ts) and writes the vector back.
 *
 * Idempotent — skips rows that already have description_embedding. Safe to re-run.
 *
 * Required env vars:
 *   DATABASE_URL    — Postgres connection string
 *   OPENAI_API_KEY  — OpenAI API key
 *
 * Optional flags:
 *   --dry-run       Print what would be embedded, don't call OpenAI or write to the DB
 *   --limit <n>     Cap the number of recipes processed (default: all)
 *   --delay <ms>    Inter-batch delay (default: 1500)
 *   --batch <n>     Recipes embedded per OpenAI request (default: 20)
 *
 * Examples:
 *   bun --env-file=.env.production.local run scripts/backfill-recipe-embeddings.ts --dry-run --limit 5
 *   bun --env-file=.env.production.local run scripts/backfill-recipe-embeddings.ts
 */

import pkg from "pg";
import { embedTexts, toPgVectorLiteral } from "../src/lib/embeddings/openaiEmbeddings";

const { Pool } = pkg;

// ── env ────────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing required env var: DATABASE_URL");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
if (!isDryRun && !process.env.OPENAI_API_KEY) {
  console.error("Missing required env var: OPENAI_API_KEY");
  process.exit(1);
}

// ── args ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const value = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
};
const limit = Number(value("--limit") ?? "0") || 0;
const delayMs = Number(value("--delay") ?? "1500");
const batchSize = Number(value("--batch") ?? "20") || 20;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface RecipeRow {
  id: string;
  name: string;
  description: string;
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function main() {
  console.log(
    `[backfill-recipe-embeddings] starting${isDryRun ? " (dry run)" : ""}${limit ? `, limit=${limit}` : ""}`,
  );

  const sql = `
    SELECT id, name, description
    FROM recipes
    WHERE is_public = true
      AND description IS NOT NULL
      AND length(description) > 0
      AND description_embedding IS NULL
    ORDER BY created_at
    ${limit ? "LIMIT $1" : ""}
  `;
  const { rows } = await pool.query<RecipeRow>(sql, limit ? [limit] : []);
  console.log(`Found ${rows.length} recipes needing embeddings.\n`);

  if (rows.length === 0) {
    await pool.end();
    return;
  }

  let done = 0;
  for (const batch of chunk(rows, batchSize)) {
    if (isDryRun) {
      for (const r of batch) {
        console.log(`DRY  [${done + 1}/${rows.length}] ${r.name}  (${r.description.length} chars)`);
        done += 1;
      }
      continue;
    }

    try {
      const vectors = await embedTexts(batch.map((r) => r.description));
      for (let i = 0; i < batch.length; i++) {
        const r = batch[i];
        await pool.query(
          `UPDATE recipes SET description_embedding = $1::vector WHERE id = $2`,
          [toPgVectorLiteral(vectors[i]), r.id],
        );
        done += 1;
        console.log(`OK   [${done}/${rows.length}] ${r.name}`);
      }
    } catch (err) {
      console.error(
        `FAILED batch starting at [${done + 1}/${rows.length}]:`,
        err instanceof Error ? err.message : err,
      );
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  console.log(`\n[backfill-recipe-embeddings] done. ${done}/${rows.length} processed.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});

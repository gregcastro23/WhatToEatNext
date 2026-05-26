/**
 * Apply migration 46: mcp_invocations table + extended prune function.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node apply_migration_46.cjs
 *
 * The whole migration runs inside one transaction so a partial apply
 * (table created but function drop/recreate failed) can't leave the
 * schema in a broken state.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

async function main() {
  console.log("Connecting to PostgreSQL…");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected.");

    const sqlPath = path.join(__dirname, "database", "init", "46-mcp-invocations.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log(`Loaded ${sqlPath} (${sql.length} bytes).`);

    console.log("BEGIN");
    await client.query("BEGIN");
    await client.query(sql);
    console.log("COMMIT");
    await client.query("COMMIT");
    console.log("Migration applied.");

    console.log("\nVerification:");
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'mcp_invocations'
    `);
    console.log(`  mcp_invocations table present: ${tableCheck.rows.length === 1}`);

    const indexCheck = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'mcp_invocations'
      ORDER BY indexname
    `);
    console.log(`  Indexes:`);
    indexCheck.rows.forEach((r) => console.log(`    - ${r.indexname}`));

    const functionCheck = await client.query(`
      SELECT pg_get_function_result(p.oid) AS result_signature
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = 'prune_observability_logs'
    `);
    console.log(`  prune_observability_logs returns:`);
    functionCheck.rows.forEach((r) =>
      console.log(`    ${r.result_signature}`),
    );

    const colCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'mcp_invocations'
      ORDER BY ordinal_position
    `);
    console.log(`  mcp_invocations columns:`);
    colCheck.rows.forEach((r) =>
      console.log(
        `    ${r.column_name.padEnd(20)} ${r.data_type.padEnd(28)} nullable=${r.is_nullable}`,
      ),
    );
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await client.query("ROLLBACK");
      console.error("Rolled back.");
    } catch {}
    process.exit(1);
  } finally {
    await client.end();
    console.log("\nConnection closed.");
  }
}

main();

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const databaseUrl = "postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function applyMigration() {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const filePath = path.join(__dirname, "database/init/17-token-economy-schema.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  console.log("Applying Migration 17: Token Economy Schema...");
  
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("✅ Migration applied successfully!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Migration failed:", err);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Could not connect to database:", err);
  } finally {
    await pool.end();
  }
}

applyMigration();

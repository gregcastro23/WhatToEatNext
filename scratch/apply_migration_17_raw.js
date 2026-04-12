import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = "postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!databaseUrl) {
  console.error("❌ DATABASE_URL not found in environment variables.");
  process.exit(1);
}

async function applyMigration() {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const filePath = path.join(__dirname, "../database/init/17-token-economy-schema.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  console.log("Applying Migration 17: Token Economy Schema...");
  console.log(`Connecting to: ${databaseUrl.split('@')[1]}`);
  
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

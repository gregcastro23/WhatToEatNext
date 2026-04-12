import { getDatabasePool } from "../../src/lib/database/connection.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyMigration() {
  const pool = getDatabasePool();
  const filePath = path.join(__dirname, "../../database/init/17-token-economy-schema.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  console.log("Applying Migration 17: Token Economy Schema...");
  
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Split by semicolon? Not always safe but for this file it might work
      // and pg.query works better with multiple commands if you just send the whole string
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

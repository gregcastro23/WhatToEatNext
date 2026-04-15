import { executeQuery } from "./src/lib/database/connection";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await executeQuery("SELECT COUNT(*) FROM recipes");
    console.log("Success! Recipe count:", result.rows[0].count);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();

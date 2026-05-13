const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Railway production URL from the user's .env or context
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/railway";

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'database', 'init', '23-agentic-users-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing 23-agentic-users-schema.sql...');
    await client.query(sql);
    console.log('Migration applied successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

main();

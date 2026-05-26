const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required to run this migration.');
  process.exit(1);
}

async function main() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Successfully connected to database.');

    const sqlPath = path.join(__dirname, 'database', 'init', '45-agent-forge-schema.sql');
    console.log(`Reading migration script from: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing Agent Forge SQL migration (45-agent-forge-schema.sql)...');
    await client.query(sql);
    console.log('Agent Forge schema applied and indices created successfully.');

    console.log('Verifying tables inside database information_schema...');
    const verification = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('alchemical_constitutions', 'celestial_pantries', 'cart_handoff_intents')
      ORDER BY table_name;
    `);
    
    console.log('Verification Success! Live tables verified:');
    verification.rows.forEach(row => {
      console.log(` - ${row.table_name}`);
    });

    if (verification.rows.length !== 3) {
      console.warn(`WARNING: Expected 3 tables, but found ${verification.rows.length}. Please check the output.`);
    }
  } catch (error) {
    console.error('Migration failed during execution:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main();

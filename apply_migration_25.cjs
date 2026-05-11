const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'database', 'init', '25-amazon-cart-quests.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing 25-amazon-cart-quests.sql...');
    await client.query(sql);
    console.log('Migration applied successfully.');

    const { rows } = await client.query(
      `SELECT slug, title, quest_type, token_reward_amount
       FROM quest_definitions
       WHERE trigger_event = 'amazon_cart_send'
       ORDER BY sort_order`
    );
    console.log('Verification — amazon_cart_send quests:', rows);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

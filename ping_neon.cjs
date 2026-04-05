const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to Neon Database!");
    const res = await client.query('SELECT NOW()');
    console.log("DB Time:", res.rows[0].now);
  } catch (err) {
    console.error("Connection error", err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

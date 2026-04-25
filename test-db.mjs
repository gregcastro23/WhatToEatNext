import pg from 'pg';
const { Client } = pg;
async function run() {
  const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
  console.log("Tables:", res.rows.map(r => r.table_name));
  await client.end();
}
run();

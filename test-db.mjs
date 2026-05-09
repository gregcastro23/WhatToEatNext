import pg from 'pg';
const { Client } = pg;
async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
  console.log("Tables:", res.rows.map(r => r.table_name));
  await client.end();
}
run();

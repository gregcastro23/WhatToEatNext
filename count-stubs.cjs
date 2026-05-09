const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT count(*) as total,
           SUM(CASE WHEN read_model::text LIKE '%Foundation of%' THEN 1 ELSE 0 END) as stubbed
    FROM recipes;
  `);
  console.log(res.rows[0]);
  await client.end();
}
run();

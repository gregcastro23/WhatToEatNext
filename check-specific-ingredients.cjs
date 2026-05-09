const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, read_model->'ingredients' as ingredients
    FROM recipes
    WHERE name IN ('Authentic Soba Salad with Sesame-Ginger Dressing', 'Cacio e Pepe', 'Authentic Nigiri Sushi (Tuna & Salmon)')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();

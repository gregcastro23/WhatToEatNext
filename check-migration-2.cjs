const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'recipe_ingredients';
  `);
  console.log("recipe_ingredients columns:", res.rows.map(r => r.column_name));
  
  const rels = await client.query(`
    SELECT *
    FROM recipe_ingredients
    WHERE recipe_id = (SELECT id FROM recipes WHERE name = 'Cacio e Pepe' LIMIT 1);
  `);
  console.log("Cacio e Pepe Relations:", rels.rows);
  await client.end();
}
run();

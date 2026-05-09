const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, read_model->'ingredients' as ingredients_read_model,
    (SELECT count(*) FROM recipe_ingredients WHERE recipe_id = recipes.id) as real_ingredient_count
    FROM recipes
    LIMIT 10;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();

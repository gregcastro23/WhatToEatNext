const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, 
      jsonb_array_length(read_model->'ingredients') as read_model_len,
      (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = recipes.id) as rel_len
    FROM recipes
    WHERE name = 'Cacio e Pepe';
  `);
  console.log("Cacio e Pepe DB:", res.rows[0]);
  
  const rels = await client.query(`
    SELECT ri.amount, ri.unit, i.name as ingredient_name
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = (SELECT id FROM recipes WHERE name = 'Cacio e Pepe' LIMIT 1);
  `);
  console.log("Cacio e Pepe Relations:", rels.rows);
  await client.end();
}
run();

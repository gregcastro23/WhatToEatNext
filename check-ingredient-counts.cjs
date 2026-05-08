const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, 
           jsonb_array_length(read_model->'ingredients') as read_model_ingredient_count,
           (SELECT count(*) FROM recipe_ingredients WHERE recipe_id = recipes.id) as real_ingredient_count
    FROM recipes
    ORDER BY read_model_ingredient_count ASC
    LIMIT 20;
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  
  const stats = await client.query(`
    SELECT 
      MIN(jsonb_array_length(read_model->'ingredients')) as min_ingredients,
      MAX(jsonb_array_length(read_model->'ingredients')) as max_ingredients,
      AVG(jsonb_array_length(read_model->'ingredients')) as avg_ingredients,
      COUNT(CASE WHEN jsonb_array_length(read_model->'ingredients') < 4 THEN 1 END) as recipes_with_few_ingredients
    FROM recipes;
  `);
  console.log("Stats:", stats.rows[0]);
  
  await client.end();
}
run();

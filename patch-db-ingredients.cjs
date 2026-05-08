const fs = require('fs');
const pg = require('pg');
const { Client } = pg;

async function run() {
  console.log("Reading source recipes.json...");
  const recipesData = JSON.parse(fs.readFileSync('./backend/alchm_kitchen/data/json/recipes.json', 'utf8'));
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  console.log("Connected to database...");

  let updated = 0;
  let errors = 0;
  
  // Handle if JSON is an array or object dictionary
  const recipesList = Array.isArray(recipesData) ? recipesData : Object.values(recipesData);
  
  for (const recipeJson of recipesList) {
    const ingredients = recipeJson.ingredients || [];
    const mappedIngredients = ingredients.map(ing => ({
      name: ing.name,
      amount: ing.amount !== undefined ? ing.amount : ing.quantity,
      unit: ing.unit,
      notes: ing.notes || ing.preparation,
      optional: ing.optional || false
    }));

    try {
      const res = await client.query(`
        UPDATE recipes
        SET read_model = jsonb_set(
          read_model,
          '{ingredients}',
          $1::jsonb
        )
        WHERE name = $2
        RETURNING id;
      `, [JSON.stringify(mappedIngredients), recipeJson.name]);
      
      if (res.rowCount > 0) {
        updated++;
      }
    } catch (e) {
      console.error('Error updating', recipeJson.name, e.message);
      errors++;
    }
  }
  
  console.log({ updated, errors, totalSource: recipesList.length });
  await client.end();
}
run();

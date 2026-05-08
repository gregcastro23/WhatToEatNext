const pg = require('pg');
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway' });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, read_model->'ingredients' as ingredients
    FROM recipes;
  `);
  
  let badCount = 0;
  let zeroAmounts = 0;
  let nullAmounts = 0;
  let missingAmounts = 0;
  
  for (const row of res.rows) {
    const ingredients = row.ingredients || [];
    let hasBad = false;
    for (const ing of ingredients) {
      if (ing.amount === 0 || ing.quantity === 0) zeroAmounts++;
      else if (ing.amount === null && ing.quantity === null) nullAmounts++;
      else if (ing.amount === undefined && ing.quantity === undefined) missingAmounts++;
      
      if (!ing.amount && !ing.quantity) hasBad = true;
    }
    if (hasBad) {
       badCount++;
       // console.log(row.name, ingredients.slice(0, 1));
    }
  }
  
  console.log({ total: res.rows.length, recipesWithMissingAmounts: badCount, zeroAmounts, nullAmounts, missingAmounts });
  await client.end();
}
run();

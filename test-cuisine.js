const { LocalRecipeService } = require('./src/services/LocalRecipeService');

async function run() {
  const recipes = await LocalRecipeService.getRecipesByCuisine("Thai");
  console.log("Found recipes:", recipes.length);
}
run();

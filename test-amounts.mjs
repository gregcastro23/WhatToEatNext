import { LocalRecipeService } from './src/services/LocalRecipeService.js';

async function run() {
  const recipes = await LocalRecipeService.getAllRecipes();
  console.log("Total recipes:", recipes.length);
  
  const badAmount = recipes.filter(r => r.ingredients.some(i => i.amount === 0 || i.amount == null));
  console.log("Recipes with 0/null amount:", badAmount.length);
  
  if (badAmount.length > 0) {
     console.log("Example:", badAmount[0].name);
     console.log("Ingredients:", badAmount[0].ingredients.slice(0, 3));
  }
}
run();
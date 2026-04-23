import { LocalRecipeService } from "./src/services/LocalRecipeService";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function main() {
  const recipes = await LocalRecipeService.getAllRecipes();
  console.log("Total recipes:", recipes.length);
  if (recipes.length > 0) {
    console.log("Sample recipe cuisine:", recipes[0].cuisine);
    const cuisines = new Set(recipes.map(r => r.cuisine?.toLowerCase()));
    console.log("Available cuisines:", Array.from(cuisines));
  }
  const thaiRecipes = await LocalRecipeService.getRecipesByCuisine("Thai");
  console.log("Thai recipes:", thaiRecipes.length);

  // Exiting properly to release DB connections if any
  process.exit(0);
}

main().catch(console.error);

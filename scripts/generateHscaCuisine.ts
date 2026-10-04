// scripts/generateHscaCuisine.ts
// Rewrites EVERY dish in src/data/cuisines/hsca.ts, recomputing its elements,
// ESMS and thermodynamics with today's engine. The committed file has drifted
// from that, so when only some recipes changed use syncHscaCuisine.ts instead.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildHscaDish, type RawRecipe } from "./lib/hscaDish";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("📖 Reading recipes_database.json...");
  const rawData = fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8");
  const recipes: RawRecipe[] = JSON.parse(rawData);
  console.log(`Loaded ${recipes.length} raw HSCA recipes!`);

  // Organise by mealType and season
  const dishes: any = {
    breakfast: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    lunch: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    dinner: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    dessert: { all: [], spring: [], summer: [], autumn: [], winter: [] },
  };

  let matchedIngredientsCount = 0;
  let totalIngredientsCount = 0;

  for (const r of recipes) {
    const built = buildHscaDish(r);
    totalIngredientsCount += built.totalIngredients;
    matchedIngredientsCount += built.matchedIngredients;
    const { dish, mealType, seasons } = built;

    // Append to every matched season (excluding 'all' to prevent duplicates)
    seasons.forEach((s: string) => {
      const seasonKey = s.toLowerCase();
      if (seasonKey !== "all" && dishes[mealType][seasonKey]) {
        dishes[mealType][seasonKey].push(dish);
      }
    });

    // Also always append to the 'all' category for the dynamic load
    dishes[mealType].all.push(dish);
  }

  const matchRate = (matchedIngredientsCount / totalIngredientsCount) * 100;
  console.log(`🎯 Ingredient Match Rate: ${matchRate.toFixed(2)}% (${matchedIngredientsCount}/${totalIngredientsCount})`);

  // Write Cuisine output to src/data/cuisines/hsca.ts
  const outputFilePath = path.join(process.cwd(), "src/data/cuisines/hsca.ts");

  const fileContent = `// src/data/cuisines/hsca.ts
import type { Cuisine } from "@/types/cuisine";
import derivedProfiles from "./derivedProfiles.json";

export const cuisine: Cuisine = {
  id: "hsca",
  name: "HSCA",
  description: "Holistic Health and Macrobiotic clean cuisine focusing on energetic harmony, thermodynamic equilibrium, and restorative elemental balance.",
  motherSauces: {},
  traditionalSauces: {},
  sauceRecommender: {
    forProtein: {},
    forVegetable: {},
    forCookingMethod: {},
    byAstrological: {},
    byRegion: {},
    byDietary: {},
  },
  cookingTechniques: [],
  regionalCuisines: {},
  dishes: ${JSON.stringify(dishes, null, 2)},
  elementalProperties: derivedProfiles.cuisines.HSCA.elementalProperties,
  astrologicalInfluences: ["Moon", "Saturn", "Venus"],
};

export default cuisine;
`;

  fs.writeFileSync(outputFilePath, fileContent, "utf8");
  console.log(`✅ Completed! Ingested ${recipes.length} recipes and saved to: ${outputFilePath}`);
}

run().catch(console.error);


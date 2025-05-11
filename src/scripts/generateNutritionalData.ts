/**
 * Script to fetch nutritional data from USDA FoodData Central API
 * and generate a static data file to be used in the application.
 *
 * Run with: ts-node generateNutritionalData.ts
 */

// USDA FoodData Central API credentials
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Basic ingredients to fetch (expand as needed)
const COMMON_INGREDIENTS = [
  // Vegetables
  'spinach, raw',
  'kale, raw',
  'broccoli, raw',
  'carrot, raw',
  'bell pepper, red, raw',
  'tomato, raw',
  'cucumber, raw',
  'onion, raw',
  'garlic, raw',
  'potato, raw',

  // Fruits
  'apple, raw',
  'banana, raw',
  'orange, raw',
  'strawberry, raw',
  'blueberry, raw',
  'avocado, raw',
  'lemon, raw',
  'lime, raw',
  'grapefruit, raw',
  'pineapple, raw',

  // Proteins
  'chicken breast, raw',
  'beef, ground, raw',
  'salmon, raw',
  'tuna, raw',
  'pork, raw',
  'lamb, raw',
  'egg, raw',
  'tofu, raw',
  'tempeh, raw',
  'seitan, raw',

  // Dairy & Alternatives
  'milk, whole',
  'yogurt, plain',
  'cheese, cheddar',
  'butter, unsalted',
  'cream, heavy',
  'almond milk, unsweetened',
  'coconut milk',
  'oat milk',
  'soy milk, unsweetened',

  // Grains
  'rice, white, raw',
  'rice, brown, raw',
  'quinoa, raw',
  'oats, raw',
  'barley, raw',
  'wheat flour',
  'cornmeal',
  'bread, whole wheat',
  'pasta, raw',

  // Nuts & Seeds
  'almonds, raw',
  'walnuts, raw',
  'cashews, raw',
  'peanuts, raw',
  'sunflower seeds, raw',
  'flaxseed, raw',
  'chia seeds, raw',
  'pumpkin seeds, raw',

  // Legumes
  'lentils, raw',
  'chickpeas, raw',
  'black beans, raw',
  'kidney beans, raw',
  'pinto beans, raw',

  // Herbs & Spices
  'basil, fresh',
  'oregano, dried',
  'rosemary, dried',
  'thyme, dried',
  'cilantro, fresh',
  'cumin, ground',
  'cinnamon, ground',
  'turmeric, ground',
  'black pepper, ground',
  'salt',

  // Oils & Fats
  'olive oil',
  'coconut oil',
  'avocado oil',
  'sesame oil',
  'flaxseed oil',

  // Other
  'honey',
  'maple syrup',
  'sugar',
  'vinegar, apple cider',
  'soy sauce',
  'mustard',
  'ketchup',
  'mayonnaise',
  'hot sauce',
  'tomato sauce',
];

// Nutrient IDs to request (all vitamins, minerals, macronutrients)
const NUTRIENT_IDS = [
  // Macronutrients
  1003, 1004, 1005, 1008, 1051, 1079,
  // Vitamins
  1106, 1107, 1108, 1109, 1114, 1120, 1162, 1165, 1166, 1167, 1175, 1176, 1177,
  1178, 1180, 1183, 1184, 1185, 1187,
  // Minerals
  1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1101,
  1102, 1103,
].join(',');

// Convert imports to requires
const fs = require('fs');
const path = require('path');

// Convert TypeScript interfaces
interface Nutrient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: unknown[];
}

interface NutritionalProfile {
  name: string;
  fdcId: number;
  source: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  phytonutrients: Record<string, number>;
}

/**
 * Transform USDA API data to our NutritionalProfile format
 */
function transformUSDADataToNutritionalProfile(
  food: USDAFood
): NutritionalProfile {
  if (!food || !food.foodNutrients) {
    throw new Error(
      `Invalid food data for ${food?.description || 'unknown food'}`
    );
  }

  // Initialize nutrition values
  const nutrients: Record<string, number> = {};

  // Process all nutrient formats
  food.foodNutrients.forEach((nutrient: unknown) => {
    // Extract ID and value (handling different API response formats)
    const id =
      nutrient.nutrientId || nutrient.nutrient?.id || nutrient.number || '';
    const value = nutrient.amount || nutrient.value || 0;
    const legacyId = nutrient.nutrient?.number || '';

    // Store nutrient value by both modern and legacy IDs
    if (id) nutrients[id.toString()] = value;
    if (legacyId) nutrients[legacyId] = value;
  });

  // Map nutrient IDs to our structure
  const macros = {
    calories: nutrients['1008'] || nutrients['208'] || 0, // Energy (kcal)
    protein: nutrients['1003'] || nutrients['203'] || 0, // Protein (g)
    carbs: nutrients['1005'] || nutrients['205'] || 0, // Carbohydrate (g)
    fat: nutrients['1004'] || nutrients['204'] || 0, // Total lipid/fat (g)
    fiber: nutrients['1079'] || nutrients['291'] || 0, // Fiber, total dietary (g)
  };

  // Calculate vitamin percentages based on daily values
  const vitamins: Record<string, number> = {};

  // Vitamin A - comes in different units (IU or RAE)
  const vitA_RAE = nutrients['1106'] || nutrients['320'] || 0;
  const vitA_IU = nutrients['1104'] || nutrients['318'] || 0;
  vitamins.A = vitA_RAE ? vitA_RAE / 900 : vitA_IU / 5000;

  // Vitamin C
  vitamins.C = (nutrients['1162'] || nutrients['401'] || 0) / 90;

  // Vitamin D
  const vitD_mcg = nutrients['1114'] || nutrients['328'] || 0;
  const vitD_IU = nutrients['1115'] || nutrients['324'] || 0;
  vitamins.D = vitD_mcg ? vitD_mcg / 20 : vitD_IU / 800;

  // Vitamin E
  vitamins.E = (nutrients['1109'] || nutrients['323'] || 0) / 15;

  // Vitamin K
  vitamins.K = (nutrients['1185'] || nutrients['430'] || 0) / 120;

  // B Vitamins
  vitamins.B1 = (nutrients['1165'] || nutrients['404'] || 0) / 1.2; // Thiamin
  vitamins.B2 = (nutrients['1166'] || nutrients['405'] || 0) / 1.3; // Riboflavin
  vitamins.B3 = (nutrients['1167'] || nutrients['406'] || 0) / 16; // Niacin
  vitamins.B6 = (nutrients['1175'] || nutrients['415'] || 0) / 1.7;
  vitamins.B12 = (nutrients['1178'] || nutrients['418'] || 0) / 2.4;
  vitamins.folate = (nutrients['1177'] || nutrients['417'] || 0) / 400;

  // Calculate mineral percentages based on daily values
  const minerals: Record<string, number> = {};

  minerals.calcium = (nutrients['1087'] || nutrients['301'] || 0) / 1000;
  minerals.iron = (nutrients['1089'] || nutrients['303'] || 0) / 18;
  minerals.magnesium = (nutrients['1090'] || nutrients['304'] || 0) / 400;
  minerals.phosphorus = (nutrients['1091'] || nutrients['305'] || 0) / 1000;
  minerals.potassium = (nutrients['1092'] || nutrients['306'] || 0) / 3500;
  minerals.sodium = (nutrients['1093'] || nutrients['307'] || 0) / 2300;
  minerals.zinc = (nutrients['1095'] || nutrients['309'] || 0) / 11;
  minerals.copper = (nutrients['1098'] || nutrients['312'] || 0) / 0.9;
  minerals.manganese = (nutrients['1101'] || nutrients['315'] || 0) / 2.3;
  minerals.selenium = (nutrients['1103'] || nutrients['317'] || 0) / 55;

  // Handle SR Legacy format with name-based lookup if needed
  if (food.dataType === 'SR Legacy') {
    food.foodNutrients.forEach((nutrient: unknown) => {
      const name = (
        nutrient.nutrient?.name ||
        nutrient.name ||
        nutrient.nutrientName ||
        ''
      ).toLowerCase();
      const value = nutrient.amount || nutrient.value || 0;

      if (name.includes('vitamin a, ')) vitamins.A = value / 900;
      else if (name.includes('vitamin c')) vitamins.C = value / 90;
      else if (name.includes('vitamin d')) vitamins.D = value / 20;
      else if (name.includes('vitamin e')) vitamins.E = value / 15;
      else if (name.includes('vitamin k')) vitamins.K = value / 120;
      else if (name.includes('thiamin')) vitamins.B1 = value / 1.2;
      else if (name.includes('riboflavin')) vitamins.B2 = value / 1.3;
      else if (name.includes('niacin')) vitamins.B3 = value / 16;
      else if (name.includes('vitamin b-6')) vitamins.B6 = value / 1.7;
      else if (name.includes('vitamin b-12')) vitamins.B12 = value / 2.4;
      else if (name.includes('folate')) vitamins.folate = value / 400;
      else if (name.includes('calcium')) minerals.calcium = value / 1000;
      else if (name.includes('iron')) minerals.iron = value / 18;
      else if (name.includes('magnesium')) minerals.magnesium = value / 400;
      else if (name.includes('phosphorus')) minerals.phosphorus = value / 1000;
      else if (name.includes('potassium')) minerals.potassium = value / 3500;
      else if (name.includes('sodium')) minerals.sodium = value / 2300;
      else if (name.includes('zinc')) minerals.zinc = value / 11;
      else if (name.includes('copper')) minerals.copper = value / 0.9;
      else if (name.includes('manganese')) minerals.manganese = value / 2.3;
      else if (name.includes('selenium')) minerals.selenium = value / 55;
    });
  }

  // Create final nutritional profile
  return {
    name: food.description,
    fdcId: food.fdcId,
    source: food.dataType || 'USDA',
    calories: macros.calories,
    macros: {
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber,
    },
    vitamins,
    minerals,
    phytonutrients: {},
  };
}

async function findBestFoodMatch(query: string): Promise<USDAFood | null> {
  try {
    // Search for foods with query
    const searchResponse = await fetch(
      `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(
        query
      )}&pageSize=10&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&sortBy=dataType.keyword&sortOrder=asc&api_key=${USDA_API_KEY}`,
      { cache: 'no-store' }
    );

    if (!searchResponse.ok) {
      throw new Error(
        `USDA API search error: ${searchResponse.status} ${searchResponse.statusText}`
      );
    }

    const searchData = await searchResponse.json();

    if (!searchData.foods || !searchData.foods.length) {
      // console.log(`No results found for: ${query}`);
      return null;
    }

    // Prioritize SR Legacy and Foundation foods
    const bestMatch = null;

    // First try SR Legacy
    bestMatch = searchData.foods.find(
      (f: unknown) => f.dataType === 'SR Legacy'
    );
    // If not found, try Foundation
    if (!bestMatch) {
      bestMatch = searchData.foods.find(
        (f: unknown) => f.dataType === 'Foundation'
      );
    }
    // If still not found, use the first result
    if (!bestMatch) {
      bestMatch = searchData.foods[0];
    }

    const fdcId = bestMatch.fdcId;
    // console.log(`Found food: ${bestMatch.description} (${fdcId}) [${bestMatch.dataType}]`);

    // Get detailed data using the best endpoint for complete vitamin data
    try {
      // Try the foods/list endpoint with specific format
      const listResponse = await fetch(
        `${USDA_API_BASE}/foods/list?fdcIds=${fdcId}&format=full&nutrients=${NUTRIENT_IDS}&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );

      if (listResponse.ok) {
        const listData = await listResponse.json();
        if (listData && listData.length > 0) {
          const vitamins = countVitamins(listData[0].foodNutrients || []);
          // console.log(`  - foods/list endpoint found ${vitamins} vitamins`);

          if (vitamins > 0) {
            return listData[0];
          }
        }
      }
    } catch (error) {
      // console.warn(`Error with foods/list endpoint for ${query}:`, error);
    }

    // Try food endpoint with full format
    try {
      const fullResponse = await fetch(
        `${USDA_API_BASE}/food/${fdcId}?format=full&nutrients=${NUTRIENT_IDS}&api_key=${USDA_API_KEY}`,
        { cache: 'no-store' }
      );

      if (fullResponse.ok) {
        const fullData = await fullResponse.json();
        if (fullData && fullData.foodNutrients) {
          const vitamins = countVitamins(fullData.foodNutrients);
          // console.log(`  - food/fdcId with format=full found ${vitamins} vitamins`);

          if (vitamins > 0) {
            return fullData;
          }
        }
      }
    } catch (error) {
      // console.warn(`Error with food endpoint for ${query}:`, error);
    }

    // Return the basic food data as fallback
    return bestMatch;
  } catch (error) {
    // console.error(`Error finding food match for ${query}:`, error);
    return null;
  }
}

// Count vitamins in a nutrients array
function countVitamins(nutrients: unknown[]): number {
  return nutrients.filter((n: unknown) => {
    const name = (
      n.nutrient?.name ||
      n.nutrientName ||
      n.name ||
      ''
    ).toLowerCase();
    return name.includes('vitamin');
  }).length;
}

// Parse command line arguments
const parseArgs = () => {
  const args: Record<string, string> = {};

  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value;
    }
  });

  return args;
};

// Get arguments
const args = parseArgs();
const ingredientsDir = args.ingredients || './src/data/ingredients';

// console.log(`Using ingredients directory: ${ingredientsDir}`);

/**
 * The main function to fetch all data and generate the file
 * @param ingredientsDir Directory containing ingredient data files
 */
async function generateNutritionalDataFile(ingredientsDir: string) {
  // console.log('Starting nutritional data generation...');

  // Discover ingredients from the directory structure
  const ingredientNames = await discoverIngredients(ingredientsDir);
  // console.log(`Discovered ${ingredientNames.length} ingredients from directory structure`);

  // If no ingredients found, fall back to the common ingredients list
  const ingredientsToFetch =
    ingredientNames.length > 0 ? ingredientNames : COMMON_INGREDIENTS;

  const results: Record<string, NutritionalProfile> = {};
  const success = 0;
  const failed = 0;

  // Create a simplified key from food name
  const createFoodKey = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/,.*$/, '') // Remove everything after first comma
      .trim()
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  };

  // Process each ingredient sequentially to avoid rate limiting
  for (const ingredient of ingredientsToFetch) {
    try {
      // console.log(`Fetching nutritional data for: ${ingredient}`);

      // Add a delay to avoid API rate limits (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const food = await findBestFoodMatch(ingredient);

      if (food) {
        const profile = transformUSDADataToNutritionalProfile(food);
        const key = createFoodKey(ingredient);
        results[key] = profile;
        success++;
        // console.log(`  ✅ Added: ${key} (${profile.name})`);
      } else {
        // console.log(`  ❌ No data found for: ${ingredient}`);
        failed++;
      }
    } catch (error) {
      // console.error(`Error processing ${ingredient}:`, error);
      failed++;
    }
  }

  // Generate the file
  const outputPath = path.resolve(__dirname, '../data/usdaNutritionalData.ts');
  const fileContent = `/**
 * USDA Nutritional Data
 * Auto-generated from USDA FoodData Central API
 * Generated on: ${new Date().toISOString()}
 */

import { NutritionalProfile } from '@/types/alchemy';

export const usdaNutritionalData: Record<string, NutritionalProfile> = ${JSON.stringify(
    results,
    null,
    2
  )};

export default usdaNutritionalData;
`;

  fs.writeFileSync(outputPath, fileContent);

  // console.log('\nData generation complete!');
  // console.log(`✅ Successfully processed: ${success} foods`);
  // console.log(`❌ Failed to process: ${failed} foods`);
  // console.log(`📝 Output file: ${outputPath}`);
}

/**
 * Discover ingredient names from the directory structure
 * @param ingredientsDir The directory containing ingredient data
 * @returns Array of ingredient names
 */
async function discoverIngredients(ingredientsDir: string): Promise<string[]> {
  try {
    const ingredientNames: string[] = [];

    // Get all subdirectories (categories)
    const categories = fs
      .readdirSync(ingredientsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Process each category
    for (const category of categories) {
      const categoryPath = path.join(ingredientsDir, category);

      // Read the files in the category directory
      const files = fs
        .readdirSync(categoryPath)
        .filter(
          (file) =>
            file.endsWith('.ts') &&
            !file.endsWith('.d.ts') &&
            file !== 'index.ts' &&
            file !== 'types.ts'
        );

      // For each file, extract the ingredient names
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Simple extraction - look for objects with name properties
        const nameMatches = content.match(
          /['"]name['"]\s*:\s*['"]([^'"]+)['"]/g
        );
        if (nameMatches) {
          nameMatches.forEach((match) => {
            const nameValue = match.match(
              /['"]name['"]\s*:\s*['"]([^'"]+)['"]/
            );
            if (nameValue && nameValue[1]) {
              ingredientNames.push(nameValue[1]);
            }
          });
        }

        // Also extract object keys as potential ingredient names
        const exportMatches = content.match(/export const \w+ = {([^}]+)}/g);
        if (exportMatches) {
          exportMatches.forEach((match) => {
            const keys = match.match(/['"]([^'"]+)['"]/g);
            if (keys) {
              keys.forEach((key) => {
                const cleanKey = key.replace(/['"]/g, '');
                if (
                  cleanKey &&
                  !cleanKey.includes('name') &&
                  !cleanKey.includes('category')
                ) {
                  ingredientNames.push(cleanKey);
                }
              });
            }
          });
        }
      }
    }

    // Remove duplicates and return
    return [...new Set(ingredientNames)];
  } catch (error) {
    // console.error('Error discovering ingredients:', error);
    return [];
  }
}

// Run the generator
generateNutritionalDataFile(ingredientsDir).catch((err) => {
  // console.error('Error generating nutritional data:', err);
  process.exit(1);
});

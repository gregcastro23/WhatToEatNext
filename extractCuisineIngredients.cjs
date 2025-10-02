#!/usr/bin/env node

/**
 * Extract and Enhance Cuisine Ingredients
 *
 * This script:
 * 1. Extracts all unique ingredient names from cuisine files
 * 2. Creates enhanced IngredientMapping objects with:
 *    - elementalProperties (normalized to sum = 1.0)
 *    - qualities array
 *    - category classification
 *    - astrologicalProfile with ruling planets and zodiac signs
 * 3. Organizes them by category
 * 4. Generates ready-to-add ingredient files
 *
 * Usage: node extractCuisineIngredients.cjs
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CUISINES_DIR = path.join(__dirname, 'src', 'data', 'cuisines');
const INGREDIENTS_DIR = path.join(__dirname, 'src', 'data', 'ingredients');
const OUTPUT_DIR = path.join(__dirname, 'extracted_ingredients');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Track all unique ingredients found
const allIngredients = new Map(); // name -> { categories: Set, cuisines: Set, appearances: number }
const ingredientDetails = new Map(); // name -> detailed info

/**
 * Extract ingredients from a single cuisine file
 */
function extractIngredientsFromFile(filePath, cuisineName) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all ingredients arrays in recipes
  const ingredientMatches = content.matchAll(/ingredients:\s*\[([\s\S]*?)\]/g);

  for (const match of ingredientMatches) {
    const ingredientsBlock = match[1];

    // Extract individual ingredient objects
    const ingredientObjects = ingredientsBlock.match(/\{[^}]*\}/g);
    if (!ingredientObjects) continue;

    for (const objStr of ingredientObjects) {
      try {
        // Simple property extraction (not full JSON parsing)
        const nameMatch = objStr.match(/name:\s*['"](.*?)['"]/);
        const categoryMatch = objStr.match(/category:\s*['"](.*?)['"]/);

        if (nameMatch) {
          const name = nameMatch[1].trim();
          const category = categoryMatch ? categoryMatch[1].trim() : 'unknown';

          // Track this ingredient
          if (!allIngredients.has(name)) {
            allIngredients.set(name, {
              categories: new Set(),
              cuisines: new Set(),
              appearances: 0
            });
          }

          const info = allIngredients.get(name);
          info.categories.add(category);
          info.cuisines.add(cuisineName);
          info.appearances++;

          // Store detailed info
          if (!ingredientDetails.has(name)) {
            ingredientDetails.set(name, {
              name,
              category,
              cuisines: [cuisineName],
              appearances: 1
            });
          } else {
            const details = ingredientDetails.get(name);
            if (!details.cuisines.includes(cuisineName)) {
              details.cuisines.push(cuisineName);
            }
            details.appearances++;
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not parse ingredient in ${filePath}: ${error.message}`);
      }
    }
  }
}

/**
 * Determine elemental properties based on ingredient category and name
 */
function generateElementalProperties(ingredient) {
  const { name, category } = ingredient;
  const lowerName = name.toLowerCase();

  // Default balanced distribution
  let fire = 0.25, water = 0.25, earth = 0.25, air = 0.25;

  // Category-based adjustments
  switch (category) {
    case 'spice':
    case 'herb':
      // Spices are often heating/fire-dominant
      fire = 0.5;
      air = 0.3;
      earth = 0.15;
      water = 0.05;
      break;

    case 'vegetable':
      // Vegetables are water/earth balanced
      water = 0.35;
      earth = 0.35;
      air = 0.2;
      fire = 0.1;
      break;

    case 'fruit':
      // Fruits are water/air dominant
      water = 0.4;
      air = 0.3;
      fire = 0.15;
      earth = 0.15;
      break;

    case 'protein':
    case 'meat':
    case 'fish':
    case 'seafood':
      // Proteins are earth/fire dominant
      earth = 0.4;
      fire = 0.3;
      water = 0.2;
      air = 0.1;
      break;

    case 'dairy':
      // Dairy is water/earth dominant
      water = 0.4;
      earth = 0.3;
      air = 0.2;
      fire = 0.1;
      break;

    case 'grain':
      // Grains are earth dominant
      earth = 0.5;
      water = 0.2;
      air = 0.2;
      fire = 0.1;
      break;

    case 'oil':
      // Oils are fire/water balanced
      fire = 0.35;
      water = 0.35;
      earth = 0.2;
      air = 0.1;
      break;

    case 'beverage':
      // Beverages are water dominant
      water = 0.6;
      air = 0.2;
      fire = 0.1;
      earth = 0.1;
      break;

    default:
      // Keep default balanced distribution
      break;
  }

  // Name-based refinements
  if (lowerName.includes('chili') || lowerName.includes('pepper') || lowerName.includes('hot')) {
    fire = Math.min(0.8, fire + 0.2);
    water = Math.max(0.05, water - 0.1);
    air = Math.max(0.05, air - 0.05);
    earth = Math.max(0.05, earth - 0.05);
  }

  if (lowerName.includes('fresh') || lowerName.includes('green')) {
    water = Math.min(0.7, water + 0.1);
    air = Math.min(0.6, air + 0.1);
    fire = Math.max(0.05, fire - 0.05);
    earth = Math.max(0.05, earth - 0.05);
  }

  if (lowerName.includes('dried') || lowerName.includes('powder')) {
    earth = Math.min(0.7, earth + 0.1);
    air = Math.min(0.6, air + 0.05);
    water = Math.max(0.05, water - 0.1);
  }

  // Normalize to sum = 1.0
  const sum = fire + water + earth + air;
  if (Math.abs(sum - 1.0) > 0.001) {
    const factor = 1.0 / sum;
    fire *= factor;
    water *= factor;
    earth *= factor;
    air *= factor;
  }

  return {
    Fire: Number(fire.toFixed(2)),
    Water: Number(water.toFixed(2)),
    Earth: Number(earth.toFixed(2)),
    Air: Number(air.toFixed(2))
  };
}

/**
 * Generate qualities array based on ingredient properties
 */
function generateQualities(ingredient) {
  const { name, category } = ingredient;
  const lowerName = name.toLowerCase();
  const qualities = [];

  // Category-based qualities
  switch (category) {
    case 'spice':
      qualities.push('aromatic', 'flavorful', 'preservative');
      if (lowerName.includes('hot') || lowerName.includes('chili')) {
        qualities.push('spicy', 'warming');
      }
      break;

    case 'herb':
      qualities.push('aromatic', 'fresh', 'culinary');
      if (lowerName.includes('dried')) {
        qualities.push('concentrated');
      } else {
        qualities.push('vibrant');
      }
      break;

    case 'vegetable':
      qualities.push('nutritious', 'versatile');
      if (lowerName.includes('leafy')) {
        qualities.push('mineral-rich', 'fresh');
      } else if (lowerName.includes('root')) {
        qualities.push('earthy', 'sustaining');
      }
      break;

    case 'fruit':
      qualities.push('sweet', 'juicy', 'nutritious');
      if (lowerName.includes('citrus')) {
        qualities.push('tangy', 'refreshing');
      }
      break;

    case 'protein':
    case 'meat':
      qualities.push('protein-rich', 'sustaining');
      break;

    case 'fish':
    case 'seafood':
      qualities.push('protein-rich', 'omega-3', 'delicate');
      break;

    case 'dairy':
      qualities.push('calcium-rich', 'creamy');
      break;

    case 'grain':
      qualities.push('carbohydrate-rich', 'sustaining');
      if (lowerName.includes('whole')) {
        qualities.push('fiber-rich');
      }
      break;

    case 'oil':
      qualities.push('fatty', 'flavor-enhancer');
      break;

    default:
      qualities.push('versatile', 'culinary');
  }

  return qualities;
}

/**
 * Generate astrological profile based on ingredient properties
 */
function generateAstrologicalProfile(ingredient) {
  const { name, category } = ingredient;
  const lowerName = name.toLowerCase();

  // Default profile
  let rulingPlanets = ['Mercury'];
  let favorableZodiac = ['Virgo', 'Gemini'];
  let seasonalAffinity = ['all'];

  // Category-based astrology
  switch (category) {
    case 'spice':
      rulingPlanets = ['Mars', 'Sun'];
      favorableZodiac = ['Aries', 'Leo', 'Scorpio'];
      seasonalAffinity = ['winter'];
      break;

    case 'herb':
      rulingPlanets = ['Mercury', 'Venus'];
      favorableZodiac = ['Virgo', 'Libra', 'Gemini'];
      seasonalAffinity = ['spring', 'summer'];
      break;

    case 'vegetable':
      rulingPlanets = ['Moon', 'Saturn'];
      favorableZodiac = ['Cancer', 'Taurus', 'Capricorn'];
      seasonalAffinity = ['summer', 'fall'];
      break;

    case 'fruit':
      rulingPlanets = ['Venus', 'Sun'];
      favorableZodiac = ['Taurus', 'Leo', 'Libra'];
      seasonalAffinity = ['summer'];
      break;

    case 'protein':
    case 'meat':
      rulingPlanets = ['Mars', 'Saturn'];
      favorableZodiac = ['Aries', 'Scorpio', 'Capricorn'];
      seasonalAffinity = ['fall', 'winter'];
      break;

    case 'fish':
    case 'seafood':
      rulingPlanets = ['Moon', 'Neptune'];
      favorableZodiac = ['Cancer', 'Pisces', 'Scorpio'];
      seasonalAffinity = ['all'];
      break;

    case 'dairy':
      rulingPlanets = ['Moon', 'Venus'];
      favorableZodiac = ['Cancer', 'Taurus', 'Pisces'];
      seasonalAffinity = ['all'];
      break;

    case 'grain':
      rulingPlanets = ['Saturn', 'Mercury'];
      favorableZodiac = ['Capricorn', 'Virgo', 'Taurus'];
      seasonalAffinity = ['fall'];
      break;

    case 'oil':
      rulingPlanets = ['Venus', 'Sun'];
      favorableZodiac = ['Libra', 'Leo', 'Taurus'];
      seasonalAffinity = ['all'];
      break;
  }

  // Name-based refinements
  if (lowerName.includes('hot') || lowerName.includes('spicy')) {
    if (!rulingPlanets.includes('Mars')) rulingPlanets.push('Mars');
    if (!favorableZodiac.includes('Aries')) favorableZodiac.push('Aries');
  }

  if (lowerName.includes('sweet') || lowerName.includes('fruit')) {
    if (!rulingPlanets.includes('Venus')) rulingPlanets.push('Venus');
    if (!favorableZodiac.includes('Taurus')) favorableZodiac.push('Taurus');
  }

  return {
    rulingPlanets,
    favorableZodiac,
    seasonalAffinity
  };
}

/**
 * Generate complete IngredientMapping object
 */
function generateIngredientMapping(ingredient) {
  const elementalProperties = generateElementalProperties(ingredient);
  const qualities = generateQualities(ingredient);
  const astrologicalProfile = generateAstrologicalProfile(ingredient);

  return {
    name: ingredient.name,
    elementalProperties,
    qualities,
    category: ingredient.category,
    astrologicalProfile
  };
}

/**
 * Organize ingredients by category
 */
function organizeByCategory(ingredients) {
  const byCategory = {};

  for (const [name, info] of ingredients) {
    const category = info.category || 'misc';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push({
      name,
      category,
      cuisines: Array.from(info.cuisines),
      appearances: info.appearances
    });
  }

  return byCategory;
}

/**
 * Generate ingredient file for a category
 */
function generateCategoryFile(category, ingredients) {
  const fileName = `${category}.ts`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  let content = `import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// ${category.charAt(0).toUpperCase() + category.slice(1)} ingredients extracted from cuisine files
const raw${category.charAt(0).toUpperCase() + category.slice(1)}: Record<string, Partial<IngredientMapping>> = {
`;

  for (const ingredient of ingredients) {
    const mapping = generateIngredientMapping(ingredient);
    content += `  ${ingredient.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}: {
    name: '${ingredient.name}',
    elementalProperties: { Fire: ${mapping.elementalProperties.Fire}, Water: ${mapping.elementalProperties.Water}, Earth: ${mapping.elementalProperties.Earth}, Air: ${mapping.elementalProperties.Air} },
    qualities: [${mapping.qualities.map(q => `'${q}'`).join(', ')}],
    category: '${category}',
    astrologicalProfile: {
      rulingPlanets: [${mapping.astrologicalProfile.rulingPlanets.map(p => `'${p}'`).join(', ')}],
      favorableZodiac: [${mapping.astrologicalProfile.favorableZodiac.map(z => `'${z}'`).join(', ')}],
      seasonalAffinity: [${mapping.astrologicalProfile.seasonalAffinity.map(s => `'${s}'`).join(', ')}]
    }
  },
`;
  }

  content += `};

// Export processed ingredients
export const ${category}Ingredients = fixIngredientMappings(raw${category.charAt(0).toUpperCase() + category.slice(1)});
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Generated ${fileName} with ${ingredients.length} ingredients`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Extracting ingredients from cuisine files...\n');

  // Get all cuisine files
  const cuisineFiles = fs.readdirSync(CUISINES_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'template.ts')
    .map(file => path.join(CUISINES_DIR, file));

  // Extract ingredients from each cuisine file
  for (const filePath of cuisineFiles) {
    const cuisineName = path.basename(filePath, '.ts');
    console.log(`Processing ${cuisineName}...`);
    extractIngredientsFromFile(filePath, cuisineName);
  }

  console.log(`\n📊 Found ${allIngredients.size} unique ingredients across all cuisine files\n`);

  // Organize by category
  const byCategory = organizeByCategory(allIngredients);

  // Generate category files
  console.log('📝 Generating enhanced ingredient files...\n');

  let totalGenerated = 0;
  for (const [category, ingredients] of Object.entries(byCategory)) {
    generateCategoryFile(category, ingredients);
    totalGenerated += ingredients.length;
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total unique ingredients extracted: ${allIngredients.size}`);
  console.log(`Ingredients enhanced and categorized: ${totalGenerated}`);
  console.log(`Category files generated: ${Object.keys(byCategory).length}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(80));

  // Category breakdown
  console.log('\n📂 INGREDIENTS BY CATEGORY:');
  for (const [category, ingredients] of Object.entries(byCategory)) {
    console.log(`  ${category}: ${ingredients.length} ingredients`);
  }

  console.log('\n✅ Ready to integrate into main ingredient database!');
  console.log('   Review and add the generated files to src/data/ingredients/');
}

// Run extraction
main();

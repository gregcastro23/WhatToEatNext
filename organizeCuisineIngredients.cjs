#!/usr/bin/env node

/**
 * Organize Cuisine Ingredients by Category
 *
 * This script:
 * 1. Reads the extracted misc.ts file with 353 ingredients
 * 2. Intelligently re-categorizes ingredients based on name patterns
 * 3. Creates proper category files (vegetables.ts, spices.ts, etc.)
 * 4. Adds them to the main ingredient database
 *
 * Usage: node organizeCuisineIngredients.cjs
 */

const fs = require('fs');
const path = require('path');

// Directories
const EXTRACTED_DIR = path.join(__dirname, 'extracted_ingredients');
const INGREDIENTS_DIR = path.join(__dirname, 'src', 'data', 'ingredients');

// Category definitions with keywords
const CATEGORIES = {
  vegetables: {
    keywords: ['tomato', 'onion', 'garlic', 'potato', 'carrot', 'celery', 'lettuce', 'spinach', 'broccoli', 'cucumber', 'pepper', 'eggplant', 'zucchini', 'squash', 'cabbage', 'cauliflower', 'asparagus', 'green bean', 'pea', 'corn', 'mushroom', 'radish', 'beet', 'turnip', 'parsnip', 'rutabaga', 'kohlrabi', 'fennel', 'leek', 'shallot', 'chard', 'kale', 'bok choy', 'arugula', 'endive', 'escarole', 'frisee', 'mache', 'sorrel', 'watercress', 'dandelion', 'purslane', 'amaranth', 'quinoa', 'chia'],
    elemental: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ['nutritious', 'versatile', 'fresh'],
    astrology: { rulingPlanets: ['Moon', 'Saturn'], favorableZodiac: ['Cancer', 'Taurus', 'Capricorn'], seasonalAffinity: ['summer', 'fall'] }
  },

  spices: {
    keywords: ['cumin', 'coriander', 'turmeric', 'ginger', 'cinnamon', 'cardamom', 'clove', 'nutmeg', 'allspice', 'star anise', 'fennel seed', 'fenugreek', 'mustard seed', 'saffron', 'paprika', 'chili', 'cayenne', 'curry powder', 'garam masala', 'tandoori', 'ras el hanout', 'za\'atar', 'sumac', 'baharat', 'berbere', 'harissa', 'masala', 'tikka', 'curry', 'masala', 'paste'],
    elemental: { Fire: 0.45, Water: 0.05, Earth: 0.15, Air: 0.35 },
    qualities: ['aromatic', 'flavorful', 'preservative', 'warming'],
    astrology: { rulingPlanets: ['Mars', 'Sun'], favorableZodiac: ['Aries', 'Leo', 'Scorpio'], seasonalAffinity: ['winter'] }
  },

  herbs: {
    keywords: ['basil', 'oregano', 'thyme', 'rosemary', 'sage', 'parsley', 'cilantro', 'mint', 'dill', 'tarragon', 'chives', 'bay leaf', 'bay leaves', 'lavender', 'marjoram', 'savory', 'summer savory', 'lemon balm', 'catnip', 'chamomile', 'elderberry', 'hibiscus', 'rose hip', 'peppermint', 'spearmint'],
    elemental: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ['aromatic', 'fresh', 'culinary', 'medicinal'],
    astrology: { rulingPlanets: ['Mercury', 'Venus'], favorableZodiac: ['Gemini', 'Virgo', 'Libra'], seasonalAffinity: ['spring', 'summer'] }
  },

  fruits: {
    keywords: ['apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cherry', 'peach', 'pear', 'plum', 'apricot', 'nectarine', 'mango', 'pineapple', 'kiwi', 'pomegranate', 'fig', 'date', 'raisin', 'prune', 'coconut', 'avocado', 'olive', 'tomato', 'eggplant', 'bell pepper', 'chili pepper'],
    elemental: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ['sweet', 'juicy', 'nutritious', 'versatile'],
    astrology: { rulingPlanets: ['Venus', 'Sun'], favorableZodiac: ['Taurus', 'Leo', 'Libra'], seasonalAffinity: ['summer'] }
  },

  proteins: {
    keywords: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'egg', 'tofu', 'tempeh', 'seitan', 'lentil', 'chickpea', 'bean', 'pea', 'quinoa', 'amaranth', 'buckwheat', 'chia seed', 'flaxseed', 'hemp seed'],
    elemental: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
    qualities: ['protein-rich', 'sustaining', 'nutritious'],
    astrology: { rulingPlanets: ['Mars', 'Saturn'], favorableZodiac: ['Aries', 'Taurus', 'Capricorn'], seasonalAffinity: ['fall', 'winter'] }
  },

  dairy: {
    keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'goat cheese', 'sheep cheese'],
    elemental: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
    qualities: ['calcium-rich', 'creamy', 'versatile'],
    astrology: { rulingPlanets: ['Moon', 'Venus'], favorableZodiac: ['Cancer', 'Taurus', 'Pisces'], seasonalAffinity: ['all'] }
  },

  grains: {
    keywords: ['rice', 'wheat', 'flour', 'bread', 'pasta', 'noodle', 'barley', 'oat', 'corn', 'cornmeal', 'polenta', 'bulgur', 'farro', 'spelt', 'kamut', 'rye', 'millet', 'sorghum', 'teff'],
    elemental: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    qualities: ['carbohydrate-rich', 'sustaining', 'versatile'],
    astrology: { rulingPlanets: ['Saturn', 'Mercury'], favorableZodiac: ['Capricorn', 'Virgo', 'Taurus'], seasonalAffinity: ['fall'] }
  },

  oils: {
    keywords: ['oil', 'olive oil', 'vegetable oil', 'canola oil', 'sunflower oil', 'sesame oil', 'peanut oil', 'coconut oil', 'palm oil', 'avocado oil', 'ghee', 'butter'],
    elemental: { Fire: 0.35, Water: 0.35, Earth: 0.2, Air: 0.1 },
    qualities: ['fatty', 'flavor-enhancer', 'versatile'],
    astrology: { rulingPlanets: ['Sun', 'Venus'], favorableZodiac: ['Leo', 'Libra', 'Taurus'], seasonalAffinity: ['all'] }
  },

  beverages: {
    keywords: ['water', 'wine', 'beer', 'tea', 'coffee', 'juice', 'broth', 'stock', 'milk', 'soda', 'cider', 'vinegar'],
    elemental: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    qualities: ['hydrating', 'flavorful', 'versatile'],
    astrology: { rulingPlanets: ['Moon', 'Mercury'], favorableZodiac: ['Cancer', 'Gemini', 'Pisces'], seasonalAffinity: ['all'] }
  }
};

/**
 * Categorize ingredient based on name
 */
function categorizeIngredient(name) {
  const lowerName = name.toLowerCase();

  for (const [category, config] of Object.entries(CATEGORIES)) {
    for (const keyword of config.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return { category, config };
      }
    }
  }

  return { category: 'misc', config: null };
}

/**
 * Parse the misc.ts file and extract ingredients
 */
function parseIngredients() {
  const filePath = path.join(EXTRACTED_DIR, 'misc.ts');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract ingredient objects
  const ingredientPattern = /(\w+):\s*\{([\s\S]*?)\n\s{2}\},?/g;
  const ingredients = [];

  let match;
  while ((match = ingredientPattern.exec(content)) !== null) {
    const name = match[1];
    const objContent = match[2];

    // Extract properties
    const nameMatch = objContent.match(/name:\s*['"](.*?)['"]/);
    const elementalMatch = objContent.match(/elementalProperties:\s*\{([^}]+)\}/);
    const qualitiesMatch = objContent.match(/qualities:\s*\[([^\]]+)\]/);
    const categoryMatch = objContent.match(/category:\s*['"](.*?)['"]/);

    if (nameMatch) {
      const ingredient = {
        key: name,
        name: nameMatch[1],
        category: categoryMatch ? categoryMatch[1] : 'misc',
        elementalProperties: elementalMatch ? parseElementalProperties(elementalMatch[1]) : null,
        qualities: qualitiesMatch ? parseQualities(qualitiesMatch[1]) : [],
        astrologicalProfile: null // Will be regenerated
      };

      ingredients.push(ingredient);
    }
  }

  return ingredients;
}

/**
 * Parse elemental properties string
 */
function parseElementalProperties(str) {
  const match = str.match(/Fire:\s*([\d.]+),\s*Water:\s*([\d.]+),\s*Earth:\s*([\d.]+),\s*Air:\s*([\d.]+)/);
  if (!match) return null;

  return {
    Fire: parseFloat(match[1]),
    Water: parseFloat(match[2]),
    Earth: parseFloat(match[3]),
    Air: parseFloat(match[4])
  };
}

/**
 * Parse qualities array string
 */
function parseQualities(str) {
  return str.split(',').map(s => s.trim().replace(/['"]/g, '')).filter(s => s);
}

/**
 * Generate updated ingredient with proper categorization
 */
function generateUpdatedIngredient(ingredient) {
  const { category, config } = categorizeIngredient(ingredient.name);

  const updated = {
    name: ingredient.name,
    elementalProperties: config ? config.elemental : ingredient.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    qualities: config ? config.qualities : ingredient.qualities,
    category: category,
    astrologicalProfile: config ? config.astrology : ingredient.astrologicalProfile || {
      rulingPlanets: ['Mercury'],
      favorableZodiac: ['Virgo', 'Gemini'],
      seasonalAffinity: ['all']
    }
  };

  return updated;
}

/**
 * Generate category file
 */
function generateCategoryFile(categoryName, ingredients) {
  if (ingredients.length === 0) return;

  const fileName = `${categoryName}.ts`;
  const filePath = path.join(INGREDIENTS_DIR, categoryName, fileName);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let content = `import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

// ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} ingredients extracted from cuisine files
const raw${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}: Record<string, Partial<IngredientMapping>> = {
`;

  for (const ingredient of ingredients) {
    const key = ingredient.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    content += `  ${key}: {
    name: '${ingredient.name}',
    elementalProperties: { Fire: ${ingredient.elementalProperties.Fire}, Water: ${ingredient.elementalProperties.Water}, Earth: ${ingredient.elementalProperties.Earth}, Air: ${ingredient.elementalProperties.Air} },
    qualities: [${ingredient.qualities.map(q => `'${q}'`).join(', ')}],
    category: '${ingredient.category}',
    astrologicalProfile: {
      rulingPlanets: [${ingredient.astrologicalProfile.rulingPlanets.map(p => `'${p}'`).join(', ')}],
      favorableZodiac: [${ingredient.astrologicalProfile.favorableZodiac.map(z => `'${z}'`).join(', ')}],
      seasonalAffinity: [${ingredient.astrologicalProfile.seasonalAffinity.map(s => `'${s}'`).join(', ')}]
    }
  },
`;
  }

  content += `};

// Export processed ingredients
export const ${categoryName}Ingredients = fixIngredientMappings(raw${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)});
`;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Generated ${fileName} with ${ingredients.length} ingredients`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Re-categorizing extracted ingredients...\n');

  // Parse ingredients from misc.ts
  const ingredients = parseIngredients();
  console.log(`Found ${ingredients.length} ingredients to categorize\n`);

  // Group by category
  const byCategory = {};
  for (const ingredient of ingredients) {
    const updated = generateUpdatedIngredient(ingredient);
    const category = updated.category;

    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(updated);
  }

  // Generate category files
  console.log('📝 Generating categorized ingredient files...\n');

  let totalAdded = 0;
  for (const [category, categoryIngredients] of Object.entries(byCategory)) {
    generateCategoryFile(category, categoryIngredients);
    totalAdded += categoryIngredients.length;
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('RE-CATEGORIZATION COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total ingredients processed: ${ingredients.length}`);
  console.log(`Ingredients re-categorized: ${totalAdded}`);
  console.log(`Categories created: ${Object.keys(byCategory).length}`);
  console.log('='.repeat(80));

  // Category breakdown
  console.log('\n📂 INGREDIENTS BY CATEGORY:');
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1].length - a[1].length);
  for (const [category, ingredients] of sortedCategories) {
    console.log(`  ${category}: ${ingredients.length} ingredients`);
  }

  console.log('\n✅ Ready to integrate into main ingredient database!');
  console.log('   Run validation to verify the expanded database.');
}

// Run re-categorization
main();

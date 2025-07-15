/**
 * Master script to run all the individual category update scripts
 * This allows updating all ingredient categories one after another
 * 
 * Run with: yarn ts-node src/scripts/updateAllIngredients.ts
 * 
 * You can also specify which categories to update, e.g.:
 * yarn ts-node src/scripts/updateAllIngredients.ts herbs spices
 */

// Import all the individual category update functions
import { updateHerbs } from './updateHerbs.js';
import { updateVegetables } from './updateVegetables.js';
import { updateFruits } from './updateFruits.js';
import { updateGrains } from './updateGrains.js';
import { updateProteins } from './updateProteins.js';
import { updateSpices } from './updateSpices.js';
import { updateOils } from './updateOils.js';
import { updateVinegars } from './updateVinegars.js';

// Map of all available category update functions
const categoryUpdaters = {
  herbs: updateHerbs,
  vegetables: updateVegetables,
  fruits: updateFruits,
  grains: updateGrains,
  proteins: updateProteins,
  spices: updateSpices,
  oils: updateOils,
  vinegars: updateVinegars
};

// All categories in the order they should be processed
const ALL_CATEGORIES = [
  'herbs',
  'spices',
  'vegetables',
  'fruits',
  'grains',
  'proteins',
  'oils',
  'vinegars'
];

/**
 * Run the specified category updaters sequentially
 * @param {string[]} categories - List of categories to update
 * @returns {Promise<void>}
 */
async function updateCategories(categories) {
  // console.log(`Starting update for categories: ${categories.join(', ')}`);
  
  for (const category of categories) {
    const updater = categoryUpdaters[category];
    if (!updater) {
      // console.warn(`No updater found for category: ${category}`);
      continue;
    }
    
    // console.log(`\n========== UPDATING ${category.toUpperCase()} ==========\n`);
    try {
      await updater();
    } catch (error) {
      // console.error(`Error updating ${category}:`, error);
    }
  }
  
  // console.log('\nAll specified categories have been processed.');
}

// Main function
async function main() {
  // Get categories from command line arguments, or use all categories if none specified
  const args = process.argv.slice(2);
  
  // If specific categories are requested, validate them and only process those
  let categoriesToProcess = ALL_CATEGORIES;
  
  if (args.length > 0) {
    const validCategories = args.filter(cat => 
      ALL_CATEGORIES.includes(cat.toLowerCase())
    );
    
    if (validCategories.length === 0) {
      // console.error(`No valid categories specified. Available categories: ${ALL_CATEGORIES.join(', ')}`);
      process.exit(1);
    }
    
    categoriesToProcess = validCategories;
  }
  
  await updateCategories(categoriesToProcess);
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    // console.error('Error in main process:', error);
    process.exit(1);
  });
}

// Export for use in other scripts if needed
export { updateCategories }; 
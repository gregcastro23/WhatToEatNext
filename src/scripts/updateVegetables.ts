/**
 * Script to update vegetable ingredients with nutritional information
 * Uses web-based data to update vegetable profiles
 * USDA API credentials kept for future reference but no longer actively used
 * 
 * Run with: yarn ts-node src/scripts/updateVegetables.ts
 */

const fs = require('fs');
const path = require('path');

// USDA FoodData Central API credentials (kept for reference, not actively used)
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Cache directory for storing data
const CACHE_DIR = path.resolve(process.cwd(), 'src/scripts/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Progress tracking file
const PROGRESS_FILE = path.resolve(CACHE_DIR, 'vegetables_progress.json');

// Specific category for this script
const CATEGORY = 'vegetables';
const VEGETABLES_DIR = path.resolve(process.cwd(), `src/data/ingredients/${CATEGORY}`);

// Common vegetables to add if not already present
const COMMON_VEGETABLES = [
  'artichoke', 'arugula', 'asparagus', 'beet', 'bok choy', 'brussels sprouts', 'cabbage', 
  'cauliflower', 'celery', 'collard greens', 'daikon', 'eggplant', 'fennel', 'jicama'
];

// Define interfaces for type safety (these are just for TypeScript and don't affect runtime)
/**
 * @typedef {Object} NutritionalProfile
 * @property {number} calories
 * @property {number} [protein_g]
 * @property {number} [carbs_g]
 * @property {number} [fat_g]
 * @property {number} [fiber_g]
 * @property {number} [sugar_g]
 * @property {string[]} vitamins
 * @property {string[]} minerals
 * @property {string[]} [antioxidants]
 * @property {string[]} [phytonutrients]
 * @property {number} [glycemic_index]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} IngredientData
 * @property {string} [name]
 * @property {string} [category]
 * @property {string} [subCategory]
 * @property {Object} [nutritionalProfile]
 * @property {Object} [elementalProperties]
 */

/**
 * @typedef {Object} ProgressData
 * @property {Object.<string, boolean>} processedFiles
 * @property {Object.<string, any>} processedIngredients
 * @property {number} lastUpdateTime
 */

// Default elemental properties for vegetables
const DEFAULT_ELEMENTAL_PROPERTIES = { Earth: 0.4, Water: 0.4, Air: 0.1, Fire: 0.1 };

// Load progress if it exists
/** @type {ProgressData} */
let progress = { 
  processedFiles: {},
  processedIngredients: {},
  lastUpdateTime: 0
};

if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`Loaded progress: ${Object.keys(progress.processedFiles).length} files, ${Object.keys(progress.processedIngredients).length} ingredients processed`);
  } catch (error) {
    console.error('Error loading progress file:', error);
  }
}

// Save progress
function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
  console.log('Progress saved');
}

// Round numbers to 2 decimal places for consistency
function round(value) {
  return Math.round(value * 100) / 100;
}

// Web-sourced nutritional data for common vegetables
const vegetableNutritionData = {
  'butternut squash': {
    calories: 45,
    protein_g: 1,
    carbs_g: 12,
    fat_g: 0.1,
    fiber_g: 2.8,
    sugar_g: 2.2,
    vitamins: ['a', 'c', 'e', 'b6'],
    minerals: ['magnesium', 'potassium', 'manganese'],
    antioxidants: ['beta-carotene'],
    glycemic_index: 51,
    notes: 'High in beta-carotene and vitamin A'
  },
  'zucchini': {
    calories: 17,
    protein_g: 1.2,
    carbs_g: 3.1,
    fat_g: 0.3,
    fiber_g: 1,
    sugar_g: 2.5,
    vitamins: ['a', 'c', 'k', 'b6'],
    minerals: ['potassium', 'manganese', 'magnesium'],
    glycemic_index: 15,
    notes: 'Low calorie and nutrient-dense'
  },
  'pumpkin': {
    calories: 26,
    protein_g: 1,
    carbs_g: 6.5,
    fat_g: 0.1,
    fiber_g: 0.5,
    vitamins: ['a', 'c', 'e', 'k'],
    minerals: ['potassium', 'copper', 'manganese'],
    antioxidants: ['beta-carotene', 'lutein', 'zeaxanthin'],
    glycemic_index: 75,
    notes: 'Excellent source of vitamin A and beta-carotene'
  },
  'acorn squash': {
    calories: 56,
    protein_g: 1.1,
    carbs_g: 15,
    fat_g: 0.1,
    fiber_g: 2.1,
    sugar_g: 0,
    vitamins: ['c', 'b6', 'a', 'thiamin'],
    minerals: ['magnesium', 'potassium', 'manganese'],
    glycemic_index: 40,
    notes: 'Good source of vitamin C and potassium'
  },
  'spaghetti squash': {
    calories: 31,
    protein_g: 0.6,
    carbs_g: 7,
    fat_g: 0.6,
    fiber_g: 1.5,
    sugar_g: 2.8,
    vitamins: ['c', 'b6', 'niacin'],
    minerals: ['potassium', 'manganese'],
    glycemic_index: 28,
    notes: 'Low-carb alternative to pasta'
  },
  'kabocha squash': {
    calories: 40,
    protein_g: 1.2,
    carbs_g: 9,
    fat_g: 0.1,
    fiber_g: 2.7,
    vitamins: ['a', 'c', 'e'],
    minerals: ['potassium', 'iron', 'calcium'],
    antioxidants: ['beta-carotene'],
    glycemic_index: 50,
    notes: 'Sweet flavor and dry texture'
  },
  'delicata squash': {
    calories: 40,
    protein_g: 0.8,
    carbs_g: 9,
    fat_g: 0.1,
    fiber_g: 1.5,
    vitamins: ['a', 'c'],
    minerals: ['potassium', 'magnesium'],
    glycemic_index: 45,
    notes: 'Edible skin, sweet potato-like flavor'
  },
  'hubbard squash': {
    calories: 40,
    protein_g: 2,
    carbs_g: 10,
    fat_g: 0.5,
    fiber_g: 2,
    vitamins: ['a', 'c', 'b6'],
    minerals: ['potassium', 'magnesium', 'phosphorus'],
    glycemic_index: 45,
    notes: 'Sweet flavor with slight nutty taste'
  },
  'broccoli': {
    calories: 34,
    protein_g: 2.8,
    carbs_g: 6.6,
    fat_g: 0.4,
    fiber_g: 2.6,
    sugar_g: 1.7,
    vitamins: ['c', 'k', 'a', 'b9', 'b6'],
    minerals: ['potassium', 'phosphorus', 'magnesium'],
    antioxidants: ['sulforaphane', 'kaempferol', 'quercetin'],
    glycemic_index: 15,
    notes: 'Rich in sulforaphane, a powerful antioxidant'
  },
  'cauliflower': {
    calories: 25,
    protein_g: 1.9,
    carbs_g: 5,
    fat_g: 0.3,
    fiber_g: 2,
    sugar_g: 1.9,
    vitamins: ['c', 'k', 'b6', 'b9'],
    minerals: ['potassium', 'phosphorus', 'magnesium'],
    antioxidants: ['isothiocyanates', 'glucosinolates'],
    glycemic_index: 15,
    notes: 'Versatile low-carb substitute for rice or potatoes'
  },
  'spinach': {
    calories: 23,
    protein_g: 2.9,
    carbs_g: 3.6,
    fat_g: 0.4,
    fiber_g: 2.2,
    sugar_g: 0.4,
    vitamins: ['k', 'a', 'c', 'b9', 'b2'],
    minerals: ['iron', 'calcium', 'potassium', 'magnesium'],
    antioxidants: ['lutein', 'zeaxanthin', 'quercetin'],
    glycemic_index: 15,
    notes: 'High in iron and calcium, excellent for eye health'
  },
  'kale': {
    calories: 49,
    protein_g: 4.3,
    carbs_g: 8.8,
    fat_g: 0.9,
    fiber_g: 3.6,
    sugar_g: 2.3,
    vitamins: ['k', 'c', 'a', 'b6', 'b9'],
    minerals: ['manganese', 'calcium', 'potassium', 'magnesium'],
    antioxidants: ['quercetin', 'kaempferol', 'lutein'],
    glycemic_index: 15,
    notes: 'One of the most nutrient-dense foods available'
  },
  'sweet potato': {
    calories: 86,
    protein_g: 1.6,
    carbs_g: 20.1,
    fat_g: 0.1,
    fiber_g: 3,
    sugar_g: 4.2,
    vitamins: ['a', 'c', 'b6', 'b5'],
    minerals: ['potassium', 'manganese', 'copper'],
    antioxidants: ['beta-carotene', 'anthocyanins'],
    glycemic_index: 54,
    notes: 'Excellent source of beta-carotene and vitamin A'
  },
  'bell pepper': {
    calories: 31,
    protein_g: 1,
    carbs_g: 6,
    fat_g: 0.3,
    fiber_g: 2.1,
    sugar_g: 4.2,
    vitamins: ['c', 'b6', 'a', 'e', 'k'],
    minerals: ['potassium', 'manganese', 'magnesium'],
    antioxidants: ['capsanthin', 'quercetin', 'luteolin'],
    glycemic_index: 15,
    notes: 'Red bell peppers contain more vitamin C than oranges'
  },
  'carrot': {
    calories: 41,
    protein_g: 0.9,
    carbs_g: 9.6,
    fat_g: 0.2,
    fiber_g: 2.8,
    sugar_g: 4.7,
    vitamins: ['a', 'k', 'c', 'b6'],
    minerals: ['potassium', 'manganese', 'phosphorus'],
    antioxidants: ['beta-carotene', 'lutein', 'alpha-carotene'],
    glycemic_index: 35,
    notes: 'Excellent for eye health due to high beta-carotene content'
  },
  'asparagus': {
    calories: 20,
    protein_g: 2.2,
    carbs_g: 3.9,
    fat_g: 0.1,
    fiber_g: 2.1,
    sugar_g: 1.9,
    vitamins: ['k', 'b9', 'c', 'a', 'b1'],
    minerals: ['copper', 'iron', 'potassium', 'phosphorus'],
    antioxidants: ['glutathione', 'rutin', 'quercetin'],
    glycemic_index: 15,
    notes: 'Natural diuretic and prebiotic properties'
  },
  'brussels sprouts': {
    calories: 43,
    protein_g: 3.4,
    carbs_g: 8.9,
    fat_g: 0.3,
    fiber_g: 3.8,
    sugar_g: 2.2,
    vitamins: ['k', 'c', 'a', 'b6', 'b9'],
    minerals: ['manganese', 'potassium', 'iron', 'phosphorus'],
    antioxidants: ['kaempferol', 'sulforaphane'],
    glycemic_index: 15,
    notes: 'High in sulforaphane, which may help protect against cancer'
  },
  'cabbage': {
    calories: 25,
    protein_g: 1.3,
    carbs_g: 5.8,
    fat_g: 0.1,
    fiber_g: 2.5,
    sugar_g: 3.2,
    vitamins: ['c', 'k', 'b6', 'b9'],
    minerals: ['manganese', 'potassium', 'calcium', 'magnesium'],
    antioxidants: ['sulforaphane', 'anthocyanins'],
    glycemic_index: 15,
    notes: 'Contains powerful compounds that may help reduce inflammation'
  },
  'cucumber': {
    calories: 15,
    protein_g: 0.7,
    carbs_g: 3.6,
    fat_g: 0.1,
    fiber_g: 0.5,
    sugar_g: 1.7,
    vitamins: ['k', 'c', 'b5'],
    minerals: ['potassium', 'magnesium', 'manganese'],
    antioxidants: ['lignans', 'cucurbitacins', 'flavonoids'],
    glycemic_index: 15,
    notes: 'High water content makes it excellent for hydration'
  },
  'eggplant': {
    calories: 25,
    protein_g: 1,
    carbs_g: 6,
    fat_g: 0.2,
    fiber_g: 3,
    sugar_g: 3.2,
    vitamins: ['b1', 'b6', 'k', 'c'],
    minerals: ['manganese', 'potassium', 'copper', 'magnesium'],
    antioxidants: ['nasunin', 'chlorogenic acid'],
    glycemic_index: 15,
    notes: 'Contains nasunin, an antioxidant that protects brain cell membranes'
  },
  'beet': {
    calories: 43,
    protein_g: 1.6,
    carbs_g: 9.6,
    fat_g: 0.2,
    fiber_g: 2.8,
    sugar_g: 6.8,
    vitamins: ['c', 'b9', 'b6', 'k'],
    minerals: ['manganese', 'potassium', 'iron', 'magnesium'],
    antioxidants: ['betalains', 'nitrates'],
    glycemic_index: 65,
    notes: 'May help lower blood pressure and improve athletic performance'
  }
};

/**
 * Get all TypeScript files in a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of file paths
 */
function getTypeScriptFiles(dir) {
  const files = [];
  
  // Get all file entries in the directory
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  // Process each entry
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively get files from subdirectory
      files.push(...getTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts') {
      // Add TypeScript files that aren't index files
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Process an individual ingredient file
 * @param {string} filePath - Path to the ingredient file
 * @returns {Promise<void>}
 */
async function processIngredientFile(filePath) {
  // Skip if already processed
  if (progress.processedFiles[filePath]) {
    console.log(`Skipping already processed file: ${filePath}`);
    return;
  }

  console.log(`Processing file: ${filePath}`);
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the ingredient mappings
    const match = fileContent.match(/const\s+raw[^=]+=\s+({[\s\S]+?});/);
    if (!match) {
      console.warn(`Could not extract ingredient mappings from ${filePath}`);
      return;
    }
    
    // Parse the extracted content (not using eval directly for safety)
    const moduleText = `module.exports = ${match[1]}`;
    const tempFilePath = path.resolve(CACHE_DIR, `temp_${Date.now()}.js`);
    fs.writeFileSync(tempFilePath, moduleText);
    
    try {
      // Load the module
      const ingredients = require(tempFilePath);
      
      // Process each ingredient in the file
      let hasChanges = false;
      for (const [key, ingredientData] of Object.entries(ingredients)) {
        // TypeScript safety: explicitly type the ingredient
        const ingredient: { 
          nutritionalProfile?: Record<string, any>;
          category?: string;
          [key: string]: any;
        } = ingredientData;
        
        // Skip if already processed
        if (progress.processedIngredients[key]) {
          console.log(`  Skipping already processed ingredient: ${key}`);
          continue;
        }
        
        // Check if the ingredient is in our web data
        if (vegetableNutritionData[key]) {
          console.log(`  Updating ${key} with web data`);
          
          // Update nutritional profile with our web data
          if (!ingredient.nutritionalProfile) {
            ingredient.nutritionalProfile = {};
          }
          
          // Merge the nutritional data
          Object.assign(ingredient.nutritionalProfile, vegetableNutritionData[key]);
          
          // Ensure the category is correct
          if (ingredient.category !== 'vegetable') {
            console.log(`  ⚠️ Fixed incorrect category for ${key}: was '${ingredient.category}', changing to 'vegetable'`);
            ingredient.category = 'vegetable';
          }
          
          hasChanges = true;
        }
        
        // Mark as processed
        progress.processedIngredients[key] = true;
      }
      
      // Update the file if there were changes
      if (hasChanges) {
        // Generate the new content
        const newContent = fileContent.replace(
          /const\s+raw[^=]+=\s+({[\s\S]+?});/,
          `const raw${path.basename(filePath, '.ts').replace(/^[a-z]/, c => c.toUpperCase())} = ${JSON.stringify(ingredients, null, 2)};`
        );
        
        // Write the updated file
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`  ✅ Updated file: ${filePath}`);
      }
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
    
    // Mark file as processed
    progress.processedFiles[filePath] = true;
    saveProgress();
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Main function to update vegetable ingredients
 */
async function updateVegetables() {
  console.log('Starting vegetable update process');
  
  // Reset progress to process all files with new vegetable data
  progress = { 
    processedFiles: {},
    processedIngredients: {},
    lastUpdateTime: 0
  };
  console.log('Reset progress to process all files with new vegetable data');
  
  try {
    // Check if the vegetables directory exists
    if (!fs.existsSync(VEGETABLES_DIR)) {
      console.error(`Vegetables directory not found: ${VEGETABLES_DIR}`);
      return;
    }
    
    // Get all TypeScript files in the vegetables directory
    const vegetableFiles = getTypeScriptFiles(VEGETABLES_DIR);
    
    console.log(`Found ${vegetableFiles.length} vegetable files to process`);
    
    if (vegetableFiles.length === 0) {
      console.error(`No vegetable files found in: ${VEGETABLES_DIR}`);
      return;
    }
    
    // Process each file
    for (const filePath of vegetableFiles) {
      await processIngredientFile(filePath);
    }
    
    console.log('Vegetable update process completed');
  } catch (error) {
    console.error('Error finding vegetable files:', error);
    throw error;
  }
}

// Run the update process
updateVegetables().catch(error => {
  console.error('Error during vegetable update:', error);
  process.exit(1);
}); 
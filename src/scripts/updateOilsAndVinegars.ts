/**
 * Script to update oils and vinegars ingredients with nutritional information
 * Uses web-based data to update profiles
 * 
 * Run with: yarn ts-node src/scripts/updateOilsAndVinegars.ts
 */

const fs = require('fs');
const path = require('path');

// Cache directory for storing data
const CACHE_DIR = path.resolve(process.cwd(), 'src/scripts/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Progress tracking file
const PROGRESS_FILE = path.resolve(CACHE_DIR, 'oils_vinegars_progress.json');

// Specific categories for this script
const CATEGORIES = ['oils', 'vinegars'];
const OILS_DIR = path.resolve(process.cwd(), 'src/data/ingredients/oils');
const VINEGARS_DIR = path.resolve(process.cwd(), 'src/data/ingredients/vinegars');

// Common oils and vinegars to add if not already present
const COMMON_OILS = [
  'olive oil', 'avocado oil', 'coconut oil', 'sesame oil', 'sunflower oil', 
  'grapeseed oil', 'walnut oil', 'flaxseed oil', 'ghee', 'peanut oil'
];

const COMMON_VINEGARS = [
  'apple cider vinegar', 'balsamic vinegar', 'rice vinegar', 'red wine vinegar', 
  'white wine vinegar', 'sherry vinegar', 'champagne vinegar', 'malt vinegar'
];

// Define interfaces for type safety
/**
 * @typedef {Object} NutritionalProfile
 * @property {number} calories
 * @property {number} [fat_g]
 * @property {number} [saturated_fat_g]
 * @property {number} [monounsaturated_fat_g]
 * @property {number} [polyunsaturated_fat_g]
 * @property {number} [omega_3_g]
 * @property {number} [omega_6_g]
 * @property {number} [omega_9_g]
 * @property {string[]} [vitamins]
 * @property {string[]} [minerals]
 * @property {string[]} [antioxidants]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} IngredientData
 * @property {string} [name]
 * @property {string} [category]
 * @property {string} [subCategory]
 * @property {Object} [nutritionalProfile]
 * @property {Object} [elementalProperties]
 * @property {Object} [smokePoint]
 * @property {string[]} [qualities]
 */

/**
 * @typedef {Object} ProgressData
 * @property {Object.<string, boolean>} processedFiles
 * @property {Object.<string, any>} processedIngredients
 * @property {number} lastUpdateTime
 */

// Default elemental properties
const DEFAULT_OIL_ELEMENTAL_PROPERTIES = { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 };
const DEFAULT_VINEGAR_ELEMENTAL_PROPERTIES = { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 };

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

// Web-sourced nutritional data for common oils
const oilNutritionData = {
  'olive oil': {
    calories: 119,
    fat_g: 13.5,
    saturated_fat_g: 1.9,
    monounsaturated_fat_g: 9.9,
    polyunsaturated_fat_g: 1.4,
    omega_3_g: 0.1,
    omega_6_g: 1.3,
    omega_9_g: 9.9,
    vitamins: ['e', 'k'],
    antioxidants: ['oleocanthal', 'oleuropein', 'hydroxytyrosol'],
    notes: 'Rich in monounsaturated fats and antioxidants'
  },
  'avocado oil': {
    calories: 124,
    fat_g: 14,
    saturated_fat_g: 1.6,
    monounsaturated_fat_g: 9.9,
    polyunsaturated_fat_g: 1.9,
    omega_3_g: 0.1,
    omega_6_g: 1.8,
    omega_9_g: 9.9,
    vitamins: ['e'],
    antioxidants: ['lutein'],
    notes: 'High smoke point and neutral flavor'
  },
  'coconut oil': {
    calories: 121,
    fat_g: 13.5,
    saturated_fat_g: 11.2,
    monounsaturated_fat_g: 0.8,
    polyunsaturated_fat_g: 0.2,
    omega_3_g: 0,
    omega_6_g: 0.2,
    omega_9_g: 0.8,
    notes: 'High in medium-chain triglycerides (MCTs)'
  },
  'sesame oil': {
    calories: 120,
    fat_g: 13.6,
    saturated_fat_g: 1.9,
    monounsaturated_fat_g: 5.4,
    polyunsaturated_fat_g: 5.6,
    omega_3_g: 0.4,
    omega_6_g: 5.2,
    omega_9_g: 5.4,
    vitamins: ['e', 'k', 'b6'],
    minerals: ['calcium', 'iron', 'zinc'],
    antioxidants: ['sesamol', 'sesamin', 'sesamolin'],
    notes: 'Distinctive nutty flavor, common in Asian cuisine'
  },
  'sunflower oil': {
    calories: 124,
    fat_g: 14,
    saturated_fat_g: 1.4,
    monounsaturated_fat_g: 2.7,
    polyunsaturated_fat_g: 9.2,
    omega_3_g: 0,
    omega_6_g: 9.2,
    omega_9_g: 2.7,
    vitamins: ['e'],
    notes: 'High in vitamin E and polyunsaturated fats'
  },
  'grapeseed oil': {
    calories: 120,
    fat_g: 13.6,
    saturated_fat_g: 1.3,
    monounsaturated_fat_g: 2.2,
    polyunsaturated_fat_g: 9.5,
    omega_3_g: 0.1,
    omega_6_g: 9.4,
    omega_9_g: 2.2,
    vitamins: ['e'],
    antioxidants: ['proanthocyanidins'],
    notes: 'Light flavor and high smoke point'
  },
  'walnut oil': {
    calories: 120,
    fat_g: 13.6,
    saturated_fat_g: 1.2,
    monounsaturated_fat_g: 3.1,
    polyunsaturated_fat_g: 8.7,
    omega_3_g: 1.4,
    omega_6_g: 7.3,
    omega_9_g: 3.1,
    vitamins: ['e', 'k'],
    notes: 'Excellent omega-3 to omega-6 ratio'
  },
  'flaxseed oil': {
    calories: 120,
    fat_g: 13.6,
    saturated_fat_g: 1.2,
    monounsaturated_fat_g: 2.5,
    polyunsaturated_fat_g: 9.2,
    omega_3_g: 7.3,
    omega_6_g: 1.9,
    omega_9_g: 2.5,
    vitamins: ['e', 'k'],
    notes: 'Highest plant source of omega-3 fatty acids'
  },
  'ghee': {
    calories: 123,
    fat_g: 13.9,
    saturated_fat_g: 8.7,
    monounsaturated_fat_g: 3.7,
    polyunsaturated_fat_g: 0.5,
    omega_3_g: 0.1,
    omega_6_g: 0.4,
    omega_9_g: 3.7,
    vitamins: ['a', 'd', 'e', 'k'],
    notes: 'Clarified butter with high smoke point'
  },
  'peanut oil': {
    calories: 119,
    fat_g: 13.5,
    saturated_fat_g: 2.3,
    monounsaturated_fat_g: 6.2,
    polyunsaturated_fat_g: 4.3,
    omega_3_g: 0,
    omega_6_g: 4.3,
    omega_9_g: 6.2,
    vitamins: ['e'],
    notes: 'High smoke point, good for frying'
  }
};

// Web-sourced data for common vinegars
const vinegarNutritionData = {
  'apple cider vinegar': {
    calories: 3,
    carbs_g: 0.9,
    acidity: '5-6%',
    vitamins: ['b1', 'b2', 'b6'],
    minerals: ['potassium', 'calcium'],
    notes: 'Contains beneficial enzymes and probiotics'
  },
  'balsamic vinegar': {
    calories: 14,
    carbs_g: 2.7,
    sugar_g: 2.4,
    acidity: '6%',
    vitamins: ['k'],
    minerals: ['calcium', 'iron', 'magnesium', 'phosphorus', 'potassium'],
    notes: 'Aged in wooden barrels, rich in antioxidants'
  },
  'rice vinegar': {
    calories: 5,
    carbs_g: 1.5,
    sugar_g: 0.5,
    acidity: '4-5%',
    notes: 'Milder and less acidic than other vinegars'
  },
  'red wine vinegar': {
    calories: 5,
    carbs_g: 0.3,
    acidity: '6-7%',
    antioxidants: ['resveratrol', 'flavonoids'],
    notes: 'Contains antioxidants from red wine'
  },
  'white wine vinegar': {
    calories: 4,
    carbs_g: 0.1,
    acidity: '5-7%',
    notes: 'Light and tangy flavor'
  },
  'sherry vinegar': {
    calories: 5,
    carbs_g: 1.2,
    acidity: '7-8%',
    notes: 'Complex flavor from aged sherry wine'
  },
  'champagne vinegar': {
    calories: 3,
    carbs_g: 0.1,
    acidity: '5-6%',
    notes: 'Mild and delicate flavor'
  },
  'malt vinegar': {
    calories: 5,
    carbs_g: 1.2,
    acidity: '4-8%',
    notes: 'Made from malted barley, robust flavor'
  }
};

/**
 * Get TypeScript files in a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} - Array of file paths
 */
function getTypeScriptFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
    return [];
  }

  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(dir, file));
}

/**
 * Process an ingredient file to update with nutritional information
 * @param {string} filePath - Path to the file
 * @returns {Promise<void>}
 */
async function processIngredientFile(filePath) {
  if (progress.processedFiles[filePath]) {
    console.log(`File already processed: ${filePath}`);
    return;
  }

  console.log(`Processing file: ${filePath}`);
  let fileContent = '';
  
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return;
  }

  try {
    // Skip index files for now
    if (filePath.includes('index.ts')) {
      console.log('Skipping index file');
      progress.processedFiles[filePath] = true;
      saveProgress();
      return;
    }

    // Determine if this is an oils or vinegars file
    const isOilFile = filePath.includes('/oils/');
    const isVinegarFile = filePath.includes('/vinegars/');
    const category = isOilFile ? 'oils' : isVinegarFile ? 'vinegars' : null;

    if (!category) {
      console.log(`Skipping file not in oils or vinegars directory: ${filePath}`);
      return;
    }

    // Read the file and enhance with nutritional data
    let updatedContent = fileContent;
    
    // Add nutritional profiles to existing ingredients
    if (category === 'oils') {
      for (const [oilName, nutritionData] of Object.entries(oilNutritionData)) {
        const safeName = oilName.replace(/\s+/g, '_').toLowerCase();
        const regex = new RegExp(`['"]${safeName}['"]:\\s*\\{[^}]*\\}`, 'g');
        
        if (updatedContent.includes(`'${safeName}'`) || updatedContent.includes(`"${safeName}"`)) {
          console.log(`Updating nutritional data for ${oilName}`);
          
          // Check if the ingredient already has a nutritional profile
          if (!updatedContent.includes(`'${safeName}': {`) && !updatedContent.includes(`"${safeName}": {`)) {
            // If the ingredient doesn't exist in the file, we'll add it later
            continue;
          }
          
          // If nutritionalProfile already exists, update it
          if (updatedContent.includes('nutritionalProfile')) {
            const nutritionalProfileRegex = /nutritionalProfile:\s*\{[^}]*\}/g;
            updatedContent = updatedContent.replace(nutritionalProfileRegex, `nutritionalProfile: ${JSON.stringify(nutritionData, null, 2)}`);
          } else {
            // Otherwise, add it after elementalProperties or other properties
            const propertyInsertRegex = /(elementalProperties:\s*\{[^}]*\})/;
            updatedContent = updatedContent.replace(propertyInsertRegex, `$1,\n    nutritionalProfile: ${JSON.stringify(nutritionData, null, 2)}`);
          }
        }
      }
    } else if (category === 'vinegars') {
      for (const [vinegarName, nutritionData] of Object.entries(vinegarNutritionData)) {
        const safeName = vinegarName.replace(/\s+/g, '_').toLowerCase();
        
        if (updatedContent.includes(`'${safeName}'`) || updatedContent.includes(`"${safeName}"`)) {
          console.log(`Updating nutritional data for ${vinegarName}`);
          
          // Check if the ingredient already has a nutritional profile
          if (!updatedContent.includes(`'${safeName}': {`) && !updatedContent.includes(`"${safeName}": {`)) {
            // If the ingredient doesn't exist in the file, we'll add it later
            continue;
          }
          
          // If nutritionalProfile already exists, update it
          if (updatedContent.includes('nutritionalProfile')) {
            const nutritionalProfileRegex = /nutritionalProfile:\s*\{[^}]*\}/g;
            updatedContent = updatedContent.replace(nutritionalProfileRegex, `nutritionalProfile: ${JSON.stringify(nutritionData, null, 2)}`);
          } else {
            // Otherwise, add it after elementalProperties or other properties
            const propertyInsertRegex = /(elementalProperties:\s*\{[^}]*\})/;
            updatedContent = updatedContent.replace(propertyInsertRegex, `$1,\n    nutritionalProfile: ${JSON.stringify(nutritionData, null, 2)}`);
          }
        }
      }
    }

    // Write the changes back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated file: ${filePath}`);
    
    // Mark as processed
    progress.processedFiles[filePath] = true;
    saveProgress();
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Main function to update oils and vinegars
 * @returns {Promise<void>}
 */
async function updateOilsAndVinegars() {
  console.log('Starting oils and vinegars update...');
  
  // Process oils
  console.log('Processing oils...');
  const oilFiles = getTypeScriptFiles(OILS_DIR);
  for (const file of oilFiles) {
    await processIngredientFile(file);
  }
  
  // Process vinegars
  console.log('Processing vinegars...');
  const vinegarFiles = getTypeScriptFiles(VINEGARS_DIR);
  for (const file of vinegarFiles) {
    await processIngredientFile(file);
  }
  
  // Check for seasonings directory oils and vinegars
  console.log('Checking seasonings directory...');
  const SEASONINGS_DIR = path.resolve(process.cwd(), 'src/data/ingredients/seasonings');
  const seasoningFiles = getTypeScriptFiles(SEASONINGS_DIR);
  
  for (const file of seasoningFiles) {
    if (file.includes('oils.ts') || file.includes('vinegars.ts')) {
      await processIngredientFile(file);
    }
  }
  
  console.log('Update complete.');
}

// Run the update function
updateOilsAndVinegars()
  .then(() => {
    console.log('Oils and vinegars update completed successfully.');
  })
  .catch((error) => {
    console.error('Error updating oils and vinegars:', error);
  }); 
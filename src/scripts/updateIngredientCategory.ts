/**
 * Script to update one ingredient category at a time with nutritional information
 * Uses USDA FoodData Central API to fetch and add nutritional data to existing ingredients
 * 
 * Run with: yarn ts-node src/scripts/updateIngredientCategory.ts [category]
 * Example: yarn ts-node src/scripts/updateIngredientCategory.ts herbs
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const fetch = require('node-fetch');

// USDA FoodData Central API credentials
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Cache directory for storing API responses
const CACHE_DIR = path.resolve(process.cwd(), 'src/scripts/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Progress tracking file
const PROGRESS_FILE = path.resolve(CACHE_DIR, 'category_progress.json');

// Nutrient IDs to request (all vitamins, minerals, macronutrients)
const NUTRIENT_IDS = [
  // Macronutrients
  1003, 1004, 1005, 1008, 1051, 1079, 
  // Vitamins
  1106, 1107, 1108, 1109, 1114, 1120, 1162, 1165, 1166, 1167, 1175, 1176, 1177, 1178, 1180, 1183, 1184, 1185, 1187,
  // Minerals
  1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1101, 1102, 1103
].join(',');

// All available ingredient categories
const ALL_CATEGORIES = [
  'vegetables',
  'fruits',
  'proteins',
  'grains',
  'herbs',
  'spices',
  'oils',
  'vinegars',
  'seasonings'
];

// Common ingredients to add by category if not already present
const COMMON_INGREDIENTS_BY_CATEGORY = {
  vegetables: [
    'artichoke', 'arugula', 'asparagus', 'beet', 'bok choy', 'brussels sprouts', 'cabbage', 
    'cauliflower', 'celery', 'collard greens', 'daikon', 'eggplant', 'fennel', 'jicama'
  ],
  fruits: [
    'apricot', 'blackberry', 'cantaloupe', 'cherry', 'clementine', 'coconut', 'date', 'fig', 
    'gooseberry', 'grapefruit', 'guava', 'honeydew', 'kiwi', 'kumquat'
  ],
  herbs: [
    'anise', 'basil', 'bay leaf', 'chervil', 'chives', 'cilantro', 'dill', 'fennel', 'lavender',
    'lemon balm', 'lemongrass', 'lovage'
  ],
  spices: [
    'allspice', 'anise', 'cardamom', 'cayenne', 'cinnamon', 'clove', 'coriander', 'cumin',
    'fennel seed', 'fenugreek', 'garam masala', 'ginger'
  ],
  proteins: [
    'beef', 'bison', 'chicken', 'duck', 'eggs', 'goat', 'lamb', 'pork', 'quail', 'rabbit',
    'salmon', 'sardines'
  ],
  grains: [
    'amaranth', 'barley', 'buckwheat', 'bulgur', 'cornmeal', 'farro', 'freekeh', 'millet'
  ],
  oils: [
    'avocado oil', 'coconut oil', 'olive oil', 'sesame oil', 'sunflower oil'
  ],
  vinegars: [
    'apple cider vinegar', 'balsamic vinegar', 'rice vinegar', 'white wine vinegar'
  ],
  seasonings: [
    'black pepper', 'fish sauce', 'garlic powder', 'miso paste', 'nutritional yeast', 
    'onion powder', 'sea salt', 'soy sauce'
  ]
};

// Define interfaces for type safety (these are just for TypeScript and don't affect runtime)
/**
 * @typedef {Object} Nutrient
 * @property {number} id
 * @property {string} name
 * @property {number} amount
 * @property {string} unit
 */

/**
 * @typedef {Object} USDAFood
 * @property {number} fdcId
 * @property {string} description
 * @property {string} dataType
 * @property {Array} foodNutrients
 */

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
 * @typedef {Object} ProgressData
 * @property {Object.<string, boolean>} processedFiles
 * @property {Object.<string, any>} processedIngredients
 * @property {number} requestsMade
 * @property {number} lastRequestTime
 */

// Default elemental properties for new ingredients
const DEFAULT_ELEMENTAL_PROPERTIES = {
  vegetables: { Earth: 0.4, Water: 0.4, Air: 0.1, Fire: 0.1 },
  fruits: { Water: 0.5, Earth: 0.2, Fire: 0.2, Air: 0.1 },
  herbs: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
  spices: { Fire: 0.5, Air: 0.3, Earth: 0.1, Water: 0.1 },
  proteins: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
  grains: { Earth: 0.6, Air: 0.2, Fire: 0.1, Water: 0.1 },
  oils: { Fire: 0.5, Earth: 0.3, Air: 0.1, Water: 0.1 },
  vinegars: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
  seasonings: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }
};

// Load progress if it exists
/** @type {ProgressData} */
let progress = { 
  processedFiles: {},
  processedIngredients: {},
  requestsMade: 0,
  lastRequestTime: 0
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

// Implement API request with exponential backoff and caching
/**
 * @param {string} url 
 * @param {string} cacheKey 
 * @returns {Promise<any>}
 */
async function makeApiRequest(url, cacheKey) {
  const cacheFile = path.resolve(CACHE_DIR, `${cacheKey}.json`);
  
  // Check if we have a cached response
  if (fs.existsSync(cacheFile)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      console.log(`Using cached data for: ${cacheKey}`);
      return cachedData;
    } catch (error) {
      console.warn(`Cache read error for ${cacheKey}:`, error);
    }
  }
  
  // Rate limiting - ensure at least 3 seconds between requests
  const now = Date.now();
  const timeSinceLastRequest = now - progress.lastRequestTime;
  if (timeSinceLastRequest < 3000) {
    const delay = 3000 - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms before next request`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  // Exponential backoff parameters
  let retries = 0;
  const maxRetries = 5;
  let waitTime = 5000; // Start with 5 seconds
  
  while (retries < maxRetries) {
    try {
      progress.lastRequestTime = Date.now();
      progress.requestsMade++;
      
      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      
      // Save progress after each API request
      saveProgress();
      
      if (response.status === 429) {
        console.log(`Rate limit exceeded (429). Waiting ${waitTime / 1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        waitTime *= 2; // Double the wait time for exponential backoff
        retries++;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache the successful response
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf8');
      
      return data;
    } catch (error) {
      console.error(`API request error (attempt ${retries + 1}/${maxRetries}):`, error);
      if (retries >= maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
      waitTime *= 2; // Double the wait time for exponential backoff
      retries++;
    }
  }
  
  throw new Error(`Failed API request after ${maxRetries} retries`);
}

/**
 * Transform USDA API data to our NutritionalProfile format
 * @param {USDAFood} food - The USDA food data
 * @returns {NutritionalProfile} The transformed nutritional profile
 */
function transformUSDADataToNutritionalProfile(food) {
  if (!food || !food.foodNutrients) {
    throw new Error(`Invalid food data for ${food?.description || 'unknown food'}`);
  }
  
  // Initialize nutrients map
  /** @type {Object.<string, {amount: number, unit: string, name: string}>} */
  const nutrients = {};
  
  // Process all nutrient formats
  food.foodNutrients.forEach((nutrient) => {
    // Extract ID and value (handling different API response formats)
    const id = nutrient.nutrientId || (nutrient.nutrient && nutrient.nutrient.id) || nutrient.number || '';
    const value = nutrient.amount || nutrient.value || 0;
    const name = nutrient.nutrientName || (nutrient.nutrient && nutrient.nutrient.name) || '';
    const unit = nutrient.unitName || nutrient.unit || (nutrient.nutrient && nutrient.nutrient.unitName) || '';
    const legacyId = (nutrient.nutrient && nutrient.nutrient.number) || '';
    
    // Store nutrient value by both modern and legacy IDs
    if (id) nutrients[id.toString()] = { amount: value, unit, name };
    if (legacyId) nutrients[legacyId] = { amount: value, unit, name };
  });
  
  // Extract macronutrients
  const calories = (nutrients['1008'] && nutrients['1008'].amount) || (nutrients['208'] && nutrients['208'].amount) || 0; // Energy (kcal)
  const protein = (nutrients['1003'] && nutrients['1003'].amount) || (nutrients['203'] && nutrients['203'].amount) || 0;  // Protein (g)
  const carbs = (nutrients['1005'] && nutrients['1005'].amount) || (nutrients['205'] && nutrients['205'].amount) || 0;    // Carbohydrate (g)
  const fat = (nutrients['1004'] && nutrients['1004'].amount) || (nutrients['204'] && nutrients['204'].amount) || 0;      // Total lipid/fat (g)
  const fiber = (nutrients['1079'] && nutrients['1079'].amount) || (nutrients['291'] && nutrients['291'].amount) || 0;    // Fiber, total dietary (g)
  const sugar = (nutrients['1063'] && nutrients['1063'].amount) || (nutrients['269'] && nutrients['269'].amount) || 0;    // Sugars, total (g)
  
  // Extract vitamins and minerals
  /** @type {string[]} */
  const vitamins = [];
  /** @type {string[]} */
  const minerals = [];
  /** @type {string[]} */
  const antioxidants = [];
  
  // Check for vitamins - fix the comparison logic
  if ((nutrients['1106'] && nutrients['1106'].amount > 0) || (nutrients['320'] && nutrients['320'].amount > 0)) vitamins.push('a');
  if ((nutrients['1162'] && nutrients['1162'].amount > 0) || (nutrients['401'] && nutrients['401'].amount > 0)) {
    vitamins.push('c');
    antioxidants.push('vitamin c');
  }
  if ((nutrients['1114'] && nutrients['1114'].amount > 0) || (nutrients['328'] && nutrients['328'].amount > 0)) vitamins.push('d');
  if ((nutrients['1109'] && nutrients['1109'].amount > 0) || (nutrients['323'] && nutrients['323'].amount > 0)) {
    vitamins.push('e');
    antioxidants.push('vitamin e');
  }
  if ((nutrients['1185'] && nutrients['1185'].amount > 0) || (nutrients['430'] && nutrients['430'].amount > 0)) vitamins.push('k');
  if ((nutrients['1165'] && nutrients['1165'].amount > 0) || (nutrients['404'] && nutrients['404'].amount > 0)) vitamins.push('b1');
  if ((nutrients['1166'] && nutrients['1166'].amount > 0) || (nutrients['405'] && nutrients['405'].amount > 0)) vitamins.push('b2');
  if ((nutrients['1167'] && nutrients['1167'].amount > 0) || (nutrients['406'] && nutrients['406'].amount > 0)) vitamins.push('b3');
  if ((nutrients['1175'] && nutrients['1175'].amount > 0) || (nutrients['415'] && nutrients['415'].amount > 0)) vitamins.push('b6');
  if ((nutrients['1178'] && nutrients['1178'].amount > 0) || (nutrients['418'] && nutrients['418'].amount > 0)) vitamins.push('b12');
  if ((nutrients['1177'] && nutrients['1177'].amount > 0) || (nutrients['417'] && nutrients['417'].amount > 0)) vitamins.push('folate');

  // Check for minerals - fix the comparison logic
  if ((nutrients['1087'] && nutrients['1087'].amount > 0) || (nutrients['301'] && nutrients['301'].amount > 0)) minerals.push('calcium');
  if ((nutrients['1089'] && nutrients['1089'].amount > 0) || (nutrients['303'] && nutrients['303'].amount > 0)) minerals.push('iron');
  if ((nutrients['1090'] && nutrients['1090'].amount > 0) || (nutrients['304'] && nutrients['304'].amount > 0)) minerals.push('magnesium');
  if ((nutrients['1091'] && nutrients['1091'].amount > 0) || (nutrients['305'] && nutrients['305'].amount > 0)) minerals.push('phosphorus');
  if ((nutrients['1092'] && nutrients['1092'].amount > 0) || (nutrients['306'] && nutrients['306'].amount > 0)) minerals.push('potassium');
  if ((nutrients['1093'] && nutrients['1093'].amount > 0) || (nutrients['307'] && nutrients['307'].amount > 0)) minerals.push('sodium');
  if ((nutrients['1095'] && nutrients['1095'].amount > 0) || (nutrients['309'] && nutrients['309'].amount > 0)) minerals.push('zinc');
  if ((nutrients['1098'] && nutrients['1098'].amount > 0) || (nutrients['312'] && nutrients['312'].amount > 0)) minerals.push('copper');
  if ((nutrients['1101'] && nutrients['1101'].amount > 0) || (nutrients['315'] && nutrients['315'].amount > 0)) minerals.push('manganese');
  if ((nutrients['1103'] && nutrients['1103'].amount > 0) || (nutrients['317'] && nutrients['317'].amount > 0)) minerals.push('selenium');
  
  return {
    calories: Math.round(calories), 
    protein_g: round(protein),
    carbs_g: round(carbs),
    fat_g: round(fat),
    fiber_g: round(fiber),
    sugar_g: round(sugar),
    vitamins: vitamins,
    minerals: minerals,
    antioxidants: antioxidants.length > 0 ? antioxidants : undefined
  };
}

// Helper function to round to 1 decimal place
/**
 * @param {number} value 
 * @returns {number}
 */
function round(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Find the best matching food for an ingredient name
 * @param {string} ingredientName - The name of the ingredient to search for
 * @returns {Promise<USDAFood|null>} The matching USDA food data or null if not found
 */
async function findIngredientMatch(ingredientName) {
  // Check if we've already processed this ingredient
  const cacheKey = ingredientName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (progress.processedIngredients[cacheKey]) {
    console.log(`Using cached result for ingredient: ${ingredientName}`);
    return progress.processedIngredients[cacheKey];
  }
  
  try {
    // Format the search query - remove special characters and adjust format
    let query = ingredientName.toLowerCase()
      .replace(/[^\w\s,]/g, '') // remove special chars except commas
      .replace(/\s+/g, ' ')     // normalize spaces
      .trim();
    
    // Add "raw" for fresh ingredients if it doesn't already contain cooking method
    const cookingMethods = ['cooked', 'roasted', 'fried', 'boiled', 'steamed', 'baked'];
    if (!cookingMethods.some(method => query.includes(method))) {
      // Check if it's a fresh food type that should be raw
      const freshFoods = ['vegetable', 'fruit', 'herb', 'meat', 'fish', 'seed', 'nut'];
      if (freshFoods.some(type => query.includes(type)) && !query.includes('oil') && !query.includes('processed')) {
        query += ', raw';
      }
    }
    
    console.log(`Searching for: "${query}"`);
    
    // Search for foods with query
    const searchUrl = `${USDA_API_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&dataType=SR%20Legacy,Foundation,Survey%20(FNDDS)&sortBy=dataType.keyword&sortOrder=asc&api_key=${USDA_API_KEY}`;
    const searchData = await makeApiRequest(searchUrl, `search_${cacheKey}`);
    
    if (!searchData.foods || !searchData.foods.length) {
      console.log(`No results found for: ${query}`);
      progress.processedIngredients[cacheKey] = null;
      saveProgress();
      return null;
    }
    
    // Prioritize SR Legacy and Foundation foods
    let bestMatch = null;
    
    // First try SR Legacy
    bestMatch = searchData.foods.find(f => f.dataType === 'SR Legacy');
    // If not found, try Foundation
    if (!bestMatch) {
      bestMatch = searchData.foods.find(f => f.dataType === 'Foundation');
    }
    // If still not found, use first result
    if (!bestMatch) {
      bestMatch = searchData.foods[0];
    }
    
    console.log(`Found match: ${bestMatch.description} (${bestMatch.fdcId}) [${bestMatch.dataType}]`);
    
    // Fetch detailed nutrient data for the best match
    const fdcId = bestMatch.fdcId;
    const nutrientUrl = `${USDA_API_BASE}/food/${fdcId}?format=full&nutrients=${NUTRIENT_IDS}&api_key=${USDA_API_KEY}`;
    const nutrientData = await makeApiRequest(nutrientUrl, `nutrient_${fdcId}`);
    
    // Save the processed ingredient to progress
    progress.processedIngredients[cacheKey] = nutrientData;
    saveProgress();
    
    return nutrientData;
    
  } catch (error) {
    console.error(`Error finding ingredient match for ${ingredientName}:`, error);
    return null;
  }
}

/**
 * Process a single ingredient file
 * @param {string} filePath - Path to the ingredient file
 * @param {string} category - Category of the ingredients in the file
 * @returns {Promise<boolean>} Whether the file was updated
 */
async function processIngredientFile(filePath, category) {
  // Check if we already processed this file
  const fileKey = filePath.replace(/[^a-z0-9]/gi, '_');
  if (progress.processedFiles[fileKey]) {
    console.log(`Skipping already processed file: ${filePath}`);
    return false;
  }
  
  try {
    console.log(`Processing file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse file content
    // We need to handle TS/JS files that export objects
    let modifiedContent = fileContent;
    let madeChanges = false;
    
    // Match all ingredient objects
    const ingredientRegex = /'([^']+)':\s*{([^}]+)}/g;
    const ingredientMatches = [...fileContent.matchAll(ingredientRegex)];
    
    // Create a set of existing ingredient names (in lowercase for case-insensitive comparison)
    const existingIngredients = new Set(
      ingredientMatches.map(match => match[1].toLowerCase())
    );
    
    // First update existing ingredients
    for (const match of ingredientMatches) {
      const ingredientName = match[1];
      const ingredientObj = match[0];
      
      // Skip if it already has nutritional data
      if (ingredientObj.includes('nutritionalProfile') && 
          !ingredientObj.includes('nutritionalProfile: {}')) {
        console.log(`  Skipping ${ingredientName}: already has nutritional data`);
        continue;
      }
      
      console.log(`  Fetching nutritional data for: ${ingredientName}`);
      const usdaData = await findIngredientMatch(ingredientName);
      
      if (!usdaData) {
        console.log(`  No USDA data found for: ${ingredientName}`);
        continue;
      }
      
      try {
        const nutritionalProfile = transformUSDADataToNutritionalProfile(usdaData);
        console.log(`  Generated nutritional profile for: ${ingredientName}`);
        
        // Create the nutritional profile string
        let nutritionStr = `nutritionalProfile: {
      calories: ${nutritionalProfile.calories},
      protein_g: ${nutritionalProfile.protein_g},
      carbs_g: ${nutritionalProfile.carbs_g},
      fat_g: ${nutritionalProfile.fat_g},
      fiber_g: ${nutritionalProfile.fiber_g},
      vitamins: [${nutritionalProfile.vitamins.map(v => `'${v}'`).join(', ')}],
      minerals: [${nutritionalProfile.minerals.map(m => `'${m}'`).join(', ')}]`;
        
        if (nutritionalProfile.antioxidants && nutritionalProfile.antioxidants.length > 0) {
          nutritionStr += `,
      antioxidants: [${nutritionalProfile.antioxidants.map(a => `'${a}'`).join(', ')}]`;
        }
        
        nutritionStr += `
    }`;
        
        // If the ingredient already has an empty or partial nutritional profile, replace it
        if (ingredientObj.includes('nutritionalProfile')) {
          const existingNutritionRegex = /nutritionalProfile:\s*{[^}]*}/;
          const updatedIngredient = ingredientObj.replace(existingNutritionRegex, nutritionStr);
          modifiedContent = modifiedContent.replace(ingredientObj, updatedIngredient);
        } 
        // Otherwise insert it before the closing brace of the ingredient object
        else {
          const position = modifiedContent.indexOf(ingredientObj) + ingredientObj.length - 1;
          const updatedIngredient = ingredientObj.slice(0, -1) + ',\n    ' + nutritionStr + '\n  }';
          modifiedContent = modifiedContent.replace(ingredientObj, updatedIngredient);
        }
        
        madeChanges = true;
        console.log(`  Updated ${ingredientName} with nutritional data`);
      } catch (error) {
        console.error(`  Error transforming data for ${ingredientName}:`, error);
      }
    }
    
    // Add a maximum of 5 new ingredients per file to avoid overwhelming the system
    if (COMMON_INGREDIENTS_BY_CATEGORY[category]) {
      // Find the position to add new ingredients (before the closing exports bracket)
      const lastCloseBracePos = modifiedContent.lastIndexOf('};');
      if (lastCloseBracePos === -1) {
        console.log(`  Could not find position to add new ingredients in ${filePath}`);
      } else {
        // Add each new ingredient that doesn't already exist (up to 5)
        let newIngredientsAdded = 0;
        for (const newIngredient of COMMON_INGREDIENTS_BY_CATEGORY[category]) {
          if (newIngredientsAdded >= 5) {
            console.log('  Reached maximum new ingredients limit (5) for this file');
            break;
          }
          
          // Skip if the ingredient already exists
          if (existingIngredients.has(newIngredient.toLowerCase())) {
            console.log(`  Skipping ${newIngredient}: already exists in file`);
            continue;
          }
          
          // Get the kebab-case version of the ingredient name for the key
          const ingredientKey = newIngredient.toLowerCase().replace(/\s+/g, '_');
          
          console.log(`  Adding new ingredient: ${newIngredient}`);
          
          // Fetch nutritional data
          const usdaData = await findIngredientMatch(newIngredient);
          
          // Skip if no nutritional data is found
          if (!usdaData) {
            console.log(`  No USDA data found for: ${newIngredient}, skipping`);
            continue;
          }
          
          try {
            const nutritionalProfile = transformUSDADataToNutritionalProfile(usdaData);
            console.log(`  Generated nutritional profile for new ingredient: ${newIngredient}`);
            
            // Create the new ingredient object
            const elementalProperties = DEFAULT_ELEMENTAL_PROPERTIES[category];
            
            // Create the nutritional profile string
            let nutritionStr = `nutritionalProfile: {
      calories: ${nutritionalProfile.calories},
      protein_g: ${nutritionalProfile.protein_g},
      carbs_g: ${nutritionalProfile.carbs_g},
      fat_g: ${nutritionalProfile.fat_g},
      fiber_g: ${nutritionalProfile.fiber_g},
      vitamins: [${nutritionalProfile.vitamins.map(v => `'${v}'`).join(', ')}],
      minerals: [${nutritionalProfile.minerals.map(m => `'${m}'`).join(', ')}]`;
            
            if (nutritionalProfile.antioxidants && nutritionalProfile.antioxidants.length > 0) {
              nutritionStr += `,
      antioxidants: [${nutritionalProfile.antioxidants.map(a => `'${a}'`).join(', ')}]`;
            }
            
            nutritionStr += `
    }`;
            
            // Create a basic new ingredient entry
            const capitalizedName = newIngredient.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            const newIngredientStr = `
  '${ingredientKey}': {
    name: '${capitalizedName}',
    elementalProperties: { 
      ${Object.entries(elementalProperties)
        .map(([element, value]) => `${element}: ${value}`)
        .join(', ')}
    },
    category: '${getCategoryName(category)}',
    qualities: ['nourishing'],
    ${nutritionStr}
  },`;
            
            // Insert the new ingredient
            modifiedContent = modifiedContent.slice(0, lastCloseBracePos) + 
              newIngredientStr + 
              modifiedContent.slice(lastCloseBracePos);
            
            madeChanges = true;
            newIngredientsAdded++;
            console.log(`  Added new ingredient: ${newIngredient}`);
          } catch (error) {
            console.error(`  Error transforming data for new ingredient ${newIngredient}:`, error);
          }
        }
      }
    }
    
    // Write changes back to file if any were made
    if (madeChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`Updated file: ${filePath}`);
      progress.processedFiles[fileKey] = true;
      saveProgress();
      return true;
    } else {
      console.log(`No changes needed for: ${filePath}`);
      progress.processedFiles[fileKey] = true;
      saveProgress();
      return false;
    }
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Helper function to get the proper category name from the directory name
/**
 * @param {string} category
 * @returns {string}
 */
function getCategoryName(category) {
  const categoryMap = {
    'vegetables': 'vegetable',
    'fruits': 'fruit',
    'herbs': 'culinary_herb',
    'spices': 'spice',
    'proteins': 'protein',
    'grains': 'grain',
    'oils': 'oil',
    'vinegars': 'vinegar',
    'seasonings': 'seasoning'
  };
  
  return categoryMap[category] || category;
}

/**
 * Main function to process all ingredient files
 * @returns {Promise<void>}
 */
async function updateIngredientCategory() {
  // Check for category argument
  const targetCategory = process.argv[2];
  if (!targetCategory || !ALL_CATEGORIES.includes(targetCategory)) {
    console.log('Please specify a valid category to process:');
    console.log(`Available categories: ${ALL_CATEGORIES.join(', ')}`);
    console.log('Example: yarn ts-node src/scripts/updateIngredientCategory.ts herbs');
    return;
  }
  
  console.log(`Processing category: ${targetCategory}`);
  
  // Get all ingredient files
  const ingredientsDir = path.resolve(process.cwd(), 'src/data/ingredients');
  const categoryPath = path.join(ingredientsDir, targetCategory);
  
  if (!fs.existsSync(categoryPath)) {
    console.warn(`Category directory not found: ${categoryPath}`);
    return;
  }
  
  const files = glob.sync(`${categoryPath}/**/*.ts`);
  console.log(`\nFound ${files.length} files in ${targetCategory}...`);
  
  // Filter out index files
  const filesToProcess = files.filter(file => !file.endsWith('index.ts'));
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  if (filesToProcess.length === 0) {
    console.log(`  No valid files found in ${targetCategory}, creating a new file...`);
    
    // Create a new file if the category exists but has no ingredient files
    const newFilePath = path.join(categoryPath, `${targetCategory}.ts`);
    
    // Check if we should skip this file
    const fileKey = newFilePath.replace(/[^a-z0-9]/gi, '_');
    if (progress.processedFiles[fileKey]) {
      console.log(`  Skipping already processed file: ${newFilePath}`);
    } else {
      // Create a basic file structure
      const fileContent = `import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const raw${capitalizeFirstLetter(targetCategory)}: Record<string, Partial<IngredientMapping>> = {
  // Placeholder for new ingredients
};

export const ${targetCategory} = fixIngredientMappings(raw${capitalizeFirstLetter(targetCategory)}) as Record<string, IngredientMapping>;
`;
      
      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      console.log(`  Created new file: ${newFilePath}`);
      
      totalFiles++;
      const updated = await processIngredientFile(newFilePath, targetCategory);
      if (updated) updatedFiles++;
    }
  } else {
    // Process existing files
    for (const file of filesToProcess) {
      // Skip already processed files
      const fileKey = file.replace(/[^a-z0-9]/gi, '_');
      if (progress.processedFiles[fileKey]) {
        console.log(`Skipping already processed file: ${file}`);
        continue;
      }
      
      totalFiles++;
      const updated = await processIngredientFile(file, targetCategory);
      if (updated) updatedFiles++;
    }
  }
  
  console.log(`\nCompleted enhancing ingredients for category: ${targetCategory}`);
  console.log(`Processed ${totalFiles} files, updated ${updatedFiles} files with nutritional data.`);
  console.log(`Total API requests made in all runs: ${progress.requestsMade}`);
}

// Helper function to capitalize the first letter of a string
/**
 * @param {string} string
 * @returns {string}
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Run the script
updateIngredientCategory().catch(error => {
  console.error('Error running script:', error);
  saveProgress();
  process.exit(1);
}); 
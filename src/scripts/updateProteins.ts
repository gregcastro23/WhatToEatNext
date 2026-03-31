/**
 * Script to update protein ingredients with nutritional information
 * Uses USDA FoodData Central API to fetch and add nutritional data to existing ingredients
 * 
 * Run with: yarn ts-node src/scripts/updateProteins.ts
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const nodeFetch = require('node-fetch');

// USDA FoodData Central API credentials
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'mymNfzEYKEYQoDNDf7hR9O0OdrF3spSeIQBcdMBl';

// Cache directory for storing API responses
const CACHE_DIR = path.resolve(process.cwd(), 'src/scripts/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Progress tracking file
const PROGRESS_FILE = path.resolve(CACHE_DIR, 'proteins_progress.json');

// Nutrient IDs to request (all vitamins, minerals, macronutrients)
const NUTRIENT_IDS = [
  // Macronutrients
  1003, 1004, 1005, 1008, 1051, 1079, 
  // Vitamins
  1106, 1107, 1108, 1109, 1114, 1120, 1162, 1165, 1166, 1167, 1175, 1176, 1177, 1178, 1180, 1183, 1184, 1185, 1187,
  // Minerals
  1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1101, 1102, 1103
].join(',');

// Specific category for this script
const CATEGORY = 'proteins';

// Common ingredients to add if not already present
const COMMON_INGREDIENTS = [
  'beef', 'chicken', 'turkey', 'pork', 'lamb', 'salmon', 'tuna', 'tofu',
  'tempeh', 'seitan', 'beans', 'lentils'
];

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
 * @property {number} [serving_size_oz]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ProgressData
 * @property {Object.<string, boolean>} processedFiles
 * @property {Object.<string, any>} processedIngredients
 * @property {number} requestsMade
 * @property {number} lastRequestTime
 */

// Default elemental properties for proteins
const DEFAULT_ELEMENTAL_PROPERTIES = { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 };

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
      
      console.log(`Making API request to: ${url}`);
      const response = await nodeFetch(url, { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        } 
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
        console.error(`API error: ${response.status} ${response.statusText}`);
        console.error(`Request URL: ${url}`);
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
  // Ensure foodNutrients exists
  if (!food || !food.foodNutrients) {
    throw new Error('Invalid food data structure');
  }
  
  // Create initial nutritional profile with defaults
  /** @type {NutritionalProfile} */
  const profile = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    vitamins: [],
    minerals: [],
    antioxidants: [],
    serving_size_oz: 3 // Default serving size for proteins
  };
  
  // Mapping of nutrient IDs to our property names
  const nutrientMapping = {
    1003: 'protein_g',        // Protein
    1004: 'fat_g',            // Total lipid (fat)
    1005: 'carbs_g',          // Carbohydrate, by difference
    1008: 'calories',         // Energy (kcal)
    1051: 'water_g',          // Water
    1079: 'fiber_g',          // Fiber, total dietary
    1063: 'sugar_g'           // Sugars, total including NLEA
  };
  
  // Vitamins and minerals to track
  const vitaminIds = new Set([1106, 1107, 1108, 1109, 1114, 1120, 1162, 1165, 1166, 1167, 1175, 1176, 1177, 1178, 1180, 1183, 1184, 1185, 1187]);
  const mineralIds = new Set([1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1101, 1102, 1103]);
  
  // Map of nutrient IDs to more readable names
  const nutrientNames = {
    // Vitamins
    1106: 'Vitamin A',
    1107: 'Vitamin B1 (Thiamin)',
    1108: 'Vitamin B2 (Riboflavin)',
    1109: 'Vitamin B3 (Niacin)',
    1114: 'Vitamin B6',
    1120: 'Vitamin B9 (Folate)',
    1162: 'Vitamin B12',
    1165: 'Vitamin C',
    1166: 'Vitamin D',
    1167: 'Vitamin E',
    1175: 'Vitamin K',
    1176: 'Biotin',
    1177: 'Choline',
    1178: 'Inositol',
    1180: 'Pantothenic Acid',
    // Minerals
    1087: 'Calcium',
    1088: 'Chloride',
    1089: 'Chromium',
    1090: 'Copper',
    1091: 'Fluoride',
    1092: 'Iodine',
    1093: 'Iron',
    1094: 'Magnesium',
    1095: 'Manganese',
    1096: 'Molybdenum',
    1097: 'Phosphorus',
    1098: 'Potassium',
    1101: 'Selenium',
    1102: 'Sodium',
    1103: 'Zinc'
  };
  
  // Process each nutrient
  for (const nutrient of food.foodNutrients) {
    // Ensure nutrient has the expected structure
    if (!nutrient || !nutrient.nutrientId || nutrient.amount === undefined) {
      continue;
    }
    
    const { nutrientId, amount } = nutrient;
    
    // Handle macronutrients
    if (nutrientMapping[nutrientId]) {
      profile[nutrientMapping[nutrientId]] = round(amount);
    }
    
    // Handle vitamins and minerals
    if (vitaminIds.has(nutrientId) && amount > 0) {
      if (nutrientNames[nutrientId]) {
        profile.vitamins.push(nutrientNames[nutrientId]);
      }
    } else if (mineralIds.has(nutrientId) && amount > 0) {
      if (nutrientNames[nutrientId]) {
        profile.minerals.push(nutrientNames[nutrientId]);
      }
    }
  }
  
  // Sort and deduplicate vitamins and minerals
  profile.vitamins = [...new Set(profile.vitamins)].sort();
  profile.minerals = [...new Set(profile.minerals)].sort();
  
  // Calculate antioxidants based on certain vitamins and minerals
  const antioxidantNutrients = ['Vitamin A', 'Vitamin C', 'Vitamin E', 'Selenium', 'Zinc'];
  profile.antioxidants = profile.vitamins
    .concat(profile.minerals)
    .filter(nutrient => antioxidantNutrients.includes(nutrient));
  
  return profile;
}

/**
 * Round a number to 1 decimal place
 * @param {number} value 
 * @returns {number}
 */
function round(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Find an ingredient match in the USDA database
 * @param {string} ingredientName 
 * @returns {Promise<USDAFood|null>}
 */
async function findIngredientMatch(ingredientName) {
  // Clean up the ingredient name for searching
  const cleanName = ingredientName
    .toLowerCase()
    .replace(/\(.+?\)/g, '') // Remove text in parentheses
    .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
    .trim();
  
  // Skip if we've already processed this ingredient
  const ingredientKey = cleanName.replace(/[^a-z0-9]/gi, '_');
  if (progress.processedIngredients[ingredientKey]) {
    console.log(`Using cached ingredient data for: ${cleanName}`);
    return progress.processedIngredients[ingredientKey];
  }
  
  // First, try to search for the exact ingredient
  console.log(`Searching USDA database for: ${cleanName}`);
  
  try {
    // Use the POST method for search as required by the API
    const searchParams = new URLSearchParams({
      api_key: USDA_API_KEY
    });
    
    // Create a proper search URL with parameters
    const searchUrl = `${USDA_API_BASE}/foods/search?${searchParams.toString()}`;
    
    // Search data to send in the POST request body
    const searchData = {
      query: cleanName,
      dataType: ["SR Legacy", "Survey (FNDDS)"],
      pageSize: 10
    };
    
    // Make the search request as a POST with JSON body
    const searchResponse = await nodeFetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData)
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Search API error: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchResults = await searchResponse.json();
    
    if (!searchResults.foods || searchResults.foods.length === 0) {
      console.log(`No matches found for: ${cleanName}`);
      progress.processedIngredients[ingredientKey] = null;
      saveProgress();
      return null;
    }
    
    // Find the best match (prefer SR Legacy items)
    let bestMatch = null;
    let bestScore = -1;
    
    for (const food of searchResults.foods) {
      // Skip branded foods
      if (food.dataType === 'Branded') continue;
      
      // Calculate a match score
      let score = 0;
      
      // Exact match gets highest score
      if (food.description.toLowerCase() === cleanName) {
        score += 100;
      }
      
      // Prefer raw or fresh ingredients
      if (food.description.toLowerCase().includes('raw') || 
          food.description.toLowerCase().includes('fresh')) {
        score += 20;
      }
      
      // Prefer SR Legacy data
      if (food.dataType === 'SR Legacy') {
        score += 10;
      }
      
      // Penalize ingredients with too many additional words
      const wordDiff = food.description.split(' ').length - cleanName.split(' ').length;
      score -= wordDiff * 5;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = food;
      }
    }
    
    if (bestMatch && bestMatch.fdcId) {
      // Get detailed nutrient information for the best match
      const detailUrl = `${USDA_API_BASE}/food/${bestMatch.fdcId}?api_key=${USDA_API_KEY}&nutrients=${NUTRIENT_IDS}`;
      const detailData = await makeApiRequest(detailUrl, `detail_${ingredientKey}`);
      
      // Cache the ingredient data
      progress.processedIngredients[ingredientKey] = detailData;
      saveProgress();
      
      return detailData;
    }
  } catch (error) {
    console.error(`Error fetching data for ${cleanName}:`, error);
  }
  
  // No good match found
  progress.processedIngredients[ingredientKey] = null;
  saveProgress();
  return null;
}

/**
 * Process a single ingredient file
 * @param {string} filePath - Path to the ingredient file
 * @returns {Promise<boolean>} Whether the file was updated
 */
async function processIngredientFile(filePath) {
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
      serving_size_oz: ${nutritionalProfile.serving_size_oz},
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
    if (COMMON_INGREDIENTS.length > 0) {
      // Find the position to add new ingredients (before the closing exports bracket)
      const lastCloseBracePos = modifiedContent.lastIndexOf('};');
      if (lastCloseBracePos === -1) {
        console.log(`  Could not find position to add new ingredients in ${filePath}`);
      } else {
        // Add each new ingredient that doesn't already exist (up to 5)
        let newIngredientsAdded = 0;
        for (const newIngredient of COMMON_INGREDIENTS) {
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
            
            // Create the nutritional profile string
            let nutritionStr = `nutritionalProfile: {
      calories: ${nutritionalProfile.calories},
      protein_g: ${nutritionalProfile.protein_g},
      carbs_g: ${nutritionalProfile.carbs_g},
      fat_g: ${nutritionalProfile.fat_g},
      fiber_g: ${nutritionalProfile.fiber_g},
      serving_size_oz: ${nutritionalProfile.serving_size_oz},
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
      ${Object.entries(DEFAULT_ELEMENTAL_PROPERTIES)
        .map(([element, value]) => `${element}: ${value}`)
        .join(', ')}
    },
    category: 'protein',
    qualities: ['hearty', 'filling'],
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
            console.error(`  Error adding new ingredient ${newIngredient}:`, error);
          }
        }
      }
    }
    
    // Save the modified file if changes were made
    if (madeChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`Updated file: ${filePath}`);
      
      // Mark the file as processed
      progress.processedFiles[fileKey] = true;
      saveProgress();
      
      return true;
    } else {
      console.log(`No changes made to: ${filePath}`);
      // Mark the file as processed even if no changes were made
      progress.processedFiles[fileKey] = true;
      saveProgress();
      return false;
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to process all protein ingredient files
 * @returns {Promise<void>}
 */
async function updateProteins() {
  console.log(`Processing proteins category`);
  
  // Get all protein ingredient files
  const ingredientsDir = path.resolve(process.cwd(), 'src/data/ingredients');
  const categoryPath = path.join(ingredientsDir, CATEGORY);
  
  if (!fs.existsSync(categoryPath)) {
    console.warn(`Category directory not found: ${categoryPath}`);
    return;
  }
  
  const files = glob.sync(`${categoryPath}/**/*.ts`);
  console.log(`\nFound ${files.length} files in ${CATEGORY}...`);
  
  // Filter out index files
  const filesToProcess = files.filter(file => !file.endsWith('index.ts'));
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  if (filesToProcess.length === 0) {
    console.log(`  No valid files found in ${CATEGORY}, creating a new file...`);
    
    // Create a new file if the category exists but has no ingredient files
    const newFilePath = path.join(categoryPath, `${CATEGORY}.ts`);
    
    // Check if we should skip this file
    const fileKey = newFilePath.replace(/[^a-z0-9]/gi, '_');
    if (progress.processedFiles[fileKey]) {
      console.log(`  Skipping already processed file: ${newFilePath}`);
    } else {
      // Create a basic file structure
      const fileContent = `import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawProteins: Record<string, Partial<IngredientMapping>> = {
  // Placeholder for new ingredients
};

export const proteins = fixIngredientMappings(rawProteins) as Record<string, IngredientMapping>;
`;
      
      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      console.log(`  Created new file: ${newFilePath}`);
      
      totalFiles++;
      const updated = await processIngredientFile(newFilePath);
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
      const updated = await processIngredientFile(file);
      if (updated) updatedFiles++;
    }
  }
  
  console.log(`\nCompleted enhancing proteins.`);
  console.log(`Processed ${totalFiles} files, updated ${updatedFiles} files with nutritional data.`);
  console.log(`Total API requests made in all runs: ${progress.requestsMade}`);
}

// Call the main function only when this script is run directly
if (require.main === module) {
  updateProteins().catch(error => {
    console.error('Error in main process:', error);
    process.exit(1);
  });
}

// Export for use in other scripts if needed
module.exports = { updateProteins }; 
#!/usr/bin/env node

/**
 * Phase 3: Data Structure Harmonization Script
 * 
 * Applies proven dataStandardization.js patterns to cuisine files
 * Ensures consistent elemental properties, ingredient structures, and data formats
 * 
 * Usage: node scripts/phase3-data-harmonization.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CUISINES_DIR = path.join(ROOT_DIR, 'src/data/cuisines');

// Command line arguments
const isDryRun = process.argv.includes('--dry-run');

console.log(`🎯 Phase 3: Data Structure Harmonization ${isDryRun ? '(DRY RUN)' : ''}`);
console.log('Applying proven dataStandardization.js patterns...\n');

// Standardization functions based on proven patterns
function standardizeElementalProperties(properties) {
  if (!properties || typeof properties !== 'object') {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  const normalized = {};
  
  // Ensure all elements are present and are numbers
  elements.forEach(element => {
    normalized[element] = typeof properties[element] === 'number' ? properties[element] : 0;
  });
  
  // Calculate sum
  const sum = elements.reduce((total, element) => total + normalized[element], 0);
  
  // If sum is 0 or very close to 0, return balanced values
  if (sum < 0.001) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  // Normalize to sum to 1
  elements.forEach(element => {
    normalized[element] = normalized[element] / sum;
  });
  
  return normalized;
}

function standardizeIngredient(ingredient) {
  if (!ingredient || typeof ingredient !== 'object') {
    return ingredient;
  }
  
  return {
    ...ingredient,
    // Ensure name is a string
    name: typeof ingredient.name === 'string' ? ingredient.name : '',
    // Ensure amount is a string
    amount: typeof ingredient.amount === 'string' ? ingredient.amount : String(ingredient.amount || '1'),
    // Ensure unit is a string
    unit: typeof ingredient.unit === 'string' ? ingredient.unit : '',
    // Ensure category is a string
    category: typeof ingredient.category === 'string' ? ingredient.category : 'other',
    // Preserve all other properties
  };
}

function standardizeDish(dish) {
  if (!dish || typeof dish !== 'object') {
    return dish;
  }
  
  return {
    ...dish,
    // Standardize basic properties
    name: typeof dish.name === 'string' ? dish.name : '',
    description: typeof dish.description === 'string' ? dish.description : '',
    cuisine: typeof dish.cuisine === 'string' ? dish.cuisine : '',
    
    // Standardize arrays
    cookingMethods: Array.isArray(dish.cookingMethods) ? dish.cookingMethods : [],
    allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
    dietaryInfo: Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo : [],
    mealType: Array.isArray(dish.mealType) ? dish.mealType : [],
    season: Array.isArray(dish.season) ? dish.season : ['all'],
    tags: Array.isArray(dish.tags) ? dish.tags : [],
    
    // Standardize ingredients array
    ingredients: Array.isArray(dish.ingredients) 
      ? dish.ingredients.map(standardizeIngredient)
      : [],
    
    // Standardize elemental properties
    elementalProperties: standardizeElementalProperties(dish.elementalProperties),
    
    // Ensure substitutions is an object
    substitutions: dish.substitutions && typeof dish.substitutions === 'object' 
      ? dish.substitutions 
      : {},
    
    // Ensure numbers are numbers
    servingSize: typeof dish.servingSize === 'number' ? dish.servingSize : 4,
    numberOfServings: typeof dish.numberOfServings === 'number' ? dish.numberOfServings : dish.servingSize || 4,
    
    // Preserve all other properties
  };
}

function standardizeSauce(sauce) {
  if (!sauce || typeof sauce !== 'object') {
    return sauce;
  }
  
  return {
    ...sauce,
    // Standardize basic properties
    name: typeof sauce.name === 'string' ? sauce.name : '',
    description: typeof sauce.description === 'string' ? sauce.description : '',
    base: typeof sauce.base === 'string' ? sauce.base : '',
    
    // Standardize arrays
    keyIngredients: Array.isArray(sauce.keyIngredients) ? sauce.keyIngredients : [],
    culinaryUses: Array.isArray(sauce.culinaryUses) ? sauce.culinaryUses : [],
    derivatives: Array.isArray(sauce.derivatives) ? sauce.derivatives : [],
    astrologicalInfluences: Array.isArray(sauce.astrologicalInfluences) ? sauce.astrologicalInfluences : [],
    
    // Standardize elemental properties
    elementalProperties: standardizeElementalProperties(sauce.elementalProperties),
    
    // Preserve all other properties
  };
}

function standardizeCuisineData(content) {
  let modified = false;
  let processedContent = content;
  
  try {
    // Create a safe evaluation context
    const originalConsole = console;
    const mockModule = { exports: {} };
    const mockRequire = () => ({});
    
    // Temporarily capture exports
    let exportedData = null;
    
    // Create a safe evaluation environment
    const evalCode = processedContent.replace(
      /export\s+(const|let|var)\s+(\w+)\s*=/g, 
      (match, keyword, varName) => {
        return `${keyword} ${varName} =`;
      }
    );
    
    // For now, let's focus on standardizing obvious patterns in the text
    
    // Standardize elementalProperties format consistency
    processedContent = processedContent.replace(
      /elementalProperties:\s*\{([^}]+)\}/g,
      (match, properties) => {
        try {
          // Parse the properties
          const propsObject = {};
          properties.split(',').forEach(prop => {
            const [key, value] = prop.split(':').map(s => s.trim());
            if (key && value) {
              const cleanKey = key.replace(/['"]/g, '');
              const numValue = parseFloat(value) || 0;
              propsObject[cleanKey] = numValue;
            }
          });
          
          // Standardize
          const standardized = standardizeElementalProperties(propsObject);
          
          // Format back
          const formatted = Object.entries(standardized)
            .map(([key, value]) => `${key}: ${value.toFixed(2)}`)
            .join(', ');
          
          modified = true;
          return `elementalProperties: { ${formatted} }`;
        } catch (e) {
          return match; // Return original if parsing fails
        }
      }
    );
    
    // Ensure consistent array formatting for cookingMethods
    processedContent = processedContent.replace(
      /cookingMethods:\s*\[([^\]]*)\]/g,
      (match, methods) => {
        try {
          const methodsArray = methods
            .split(',')
            .map(m => m.trim().replace(/['"]/g, ''))
            .filter(m => m.length > 0)
            .map(m => `"${m}"`);
          
          if (methodsArray.length !== methods.split(',').length) {
            modified = true;
          }
          
          return `cookingMethods: [${methodsArray.join(', ')}]`;
        } catch (e) {
          return match;
        }
      }
    );
    
    // Ensure consistent ingredient structure
    processedContent = processedContent.replace(
      /\{\s*name:\s*"([^"]+)",\s*amount:\s*"([^"]+)",\s*unit:\s*"([^"]+)",\s*category:\s*"([^"]+)"([^}]*)\}/g,
      (match, name, amount, unit, category, rest) => {
        // Ensure all required fields are strings
        const cleanName = String(name || '');
        const cleanAmount = String(amount || '1');
        const cleanUnit = String(unit || '');
        const cleanCategory = String(category || 'other');
        
        return `{ name: "${cleanName}", amount: "${cleanAmount}", unit: "${cleanUnit}", category: "${cleanCategory}"${rest} }`;
      }
    );
    
  } catch (error) {
    console.log(`⚠️  Warning: Could not parse file content safely: ${error.message}`);
  }
  
  return { content: processedContent, modified };
}

async function processCuisineFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = standardizeCuisineData(content);
    
    if (modified) {
      console.log(`✅ Standardized: ${path.basename(filePath)}`);
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
      
      return true;
    } else {
      console.log(`✓  Already consistent: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  let totalProcessed = 0;
  let totalModified = 0;
  
  console.log('📁 Scanning cuisine files...');
  
  const files = fs.readdirSync(CUISINES_DIR)
    .filter(file => file.endsWith('.ts') && !file.includes('.bak') && file !== 'index.ts' && file !== 'template.ts')
    .map(file => path.join(CUISINES_DIR, file));
  
  console.log(`Found ${files.length} cuisine files to process\n`);
  
  for (const file of files) {
    totalProcessed++;
    const wasModified = await processCuisineFile(file);
    if (wasModified) totalModified++;
  }
  
  console.log('\n📊 Results:');
  console.log(`Total files processed: ${totalProcessed}`);
  console.log(`Files modified: ${totalModified}`);
  console.log(`Files already consistent: ${totalProcessed - totalModified}`);
  
  if (isDryRun) {
    console.log('\n🏃‍♂️ DRY RUN COMPLETED - No files were actually modified');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n✨ Data harmonization completed!');
    console.log('Run `yarn build` to verify all changes work correctly');
  }
}

main().catch(console.error); 
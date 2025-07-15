/**
 * fix-recipe-recommendation.js
 * 
 * Script to add missing properties to the RecipeRecommendation interface
 * including the 'season' property referenced in NutritionalRecommender.tsx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the IngredientService.ts file
const INGREDIENT_SERVICE_PATH = 'src/services/IngredientService.ts';

// Properties to add to the RecipeRecommendation interface
const PROPERTIES_TO_ADD = [
  'season?: string | string[];',
  'elementalProperties?: any;', // Used in NutritionalRecommender.tsx
  'cuisine?: string;',
  'name?: string;' // Used in RecipeGrid.tsx
];

async function updateRecipeRecommendationInterface(dryRun) {
  try {
    let content = await readFile(INGREDIENT_SERVICE_PATH, 'utf8');
    
    // Find the RecipeRecommendation interface
    const recipeRecommendationRegex = /export\s+interface\s+RecipeRecommendation\s*{[^}]*}/s;
    
    if (!recipeRecommendationRegex.test(content)) {
      console.error('Could not find RecipeRecommendation interface in IngredientService.ts');
      return false;
    }
    
    // Extract the current interface
    const match = content.match(recipeRecommendationRegex);
    if (!match) {
      return false;
    }
    
    const currentInterface = match[0];
    
    // Create the new interface with added properties
    let newInterface = currentInterface;
    
    // Insert new properties before the closing brace
    const closingBraceIndex = newInterface.lastIndexOf('}');
    if (closingBraceIndex !== -1) {
      const propertiesText = PROPERTIES_TO_ADD.join('\n  ');
      newInterface = newInterface.slice(0, closingBraceIndex) + 
        '\n  ' + propertiesText + 
        (propertiesText ? '\n' : '') + newInterface.slice(closingBraceIndex);
    }
    
    // Replace the old interface with the new one
    const updatedContent = content.replace(recipeRecommendationRegex, newInterface);
    
    if (updatedContent !== content) {
      if (!dryRun) {
        await writeFile(INGREDIENT_SERVICE_PATH, updatedContent, 'utf8');
      }
      console.log(`${dryRun ? '[DRY RUN] Would update' : 'Updated'} RecipeRecommendation interface in ${INGREDIENT_SERVICE_PATH}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error updating RecipeRecommendation interface:`, error);
    return false;
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  if (dryRun) {
    console.log('Running in DRY RUN mode. No files will be modified.');
  }
  
  const modified = await updateRecipeRecommendationInterface(dryRun);
  
  if (modified) {
    console.log(`${dryRun ? '[DRY RUN] Would have successfully updated' : 'Successfully updated'} RecipeRecommendation interface`);
  } else {
    console.log('No changes were needed or could not update RecipeRecommendation interface');
  }
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 
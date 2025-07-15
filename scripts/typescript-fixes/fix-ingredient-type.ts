/**
 * fix-ingredient-type.ts
 * 
 * Script to update the Ingredient interface in src/types/alchemy.ts to include
 * all properties that are being accessed throughout the codebase.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Path to the alchemy.ts file
const ALCHEMY_TS_PATH = path.resolve(ROOT_DIR, 'src/types/alchemy.ts');

// Properties to add to the Ingredient interface
const INGREDIENT_PROPERTIES_TO_ADD = [
  // Properties referenced in error messages
  'season?: Season[];',
  'score?: number;',
  'qualities?: string[];',
  'intensity?: number;',
  'complexity?: number;',
  'kalchm?: number;',
  'monica?: number;',
  'culturalOrigins?: string[] | unknown;',
  
  // Additional common properties observed
  'elementalAffinity?: ElementalAffinity;',
  'flavorProfile?: Record<string, number>;',
  'astrologicalProfile?: AstrologicalProfile;',
  'subCategory?: string;',
  'preparation?: Record<string, unknown>;',
  'tags?: string[];',
  'pAiringRecommendations?: string[];',
  'preparationMethods?: string[];',
  'description?: string;'
];

async function updateIngredientInterface(dryRun: boolean): Promise<boolean> {
  try {
    let content = await fs.readFile(ALCHEMY_TS_PATH, 'utf8');
    
    // Find the Ingredient interface
    const ingredientInterfaceRegex = /export\s+interface\s+Ingredient\s*{[^}]*}/s;
    
    if (!ingredientInterfaceRegex.test(content)) {
      console.error('Could not find Ingredient interface in alchemy.ts');
      return false;
    }
    
    // Extract the current interface
    const match = content.match(ingredientInterfaceRegex);
    if (!match) {
      return false;
    }
    
    const currentInterface = match[0];
    
    // Create the new interface with added properties
    let newInterface = currentInterface;
    
    // Insert new properties before the closing brace
    const closingBraceIndex = newInterface.lastIndexOf('}');
    if (closingBraceIndex !== -1) {
      const propertiesText = INGREDIENT_PROPERTIES_TO_ADD.join('\n  ');
      newInterface = newInterface.slice(0, closingBraceIndex) + 
        '\n  ' + propertiesText + 
        (propertiesText ? '\n' : '') + newInterface.slice(closingBraceIndex);
    }
    
    // Replace the old interface with the new one
    const updatedContent = content.replace(ingredientInterfaceRegex, newInterface);
    
    if (updatedContent !== content) {
      if (!dryRun) {
        await fs.writeFile(ALCHEMY_TS_PATH, updatedContent, 'utf8');
      }
      console.log(`${dryRun ? '[DRY RUN] Would update' : 'Updated'} Ingredient interface in ${ALCHEMY_TS_PATH}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error updating Ingredient interface:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  
  if (dryRun) {
    console.log('Running in DRY RUN mode. No files will be modified.');
  }
  
  const modified = await updateIngredientInterface(dryRun);
  
  if (modified) {
    console.log(`${dryRun ? '[DRY RUN] Would have successfully updated' : 'Successfully updated'} Ingredient interface`);
  } else {
    console.log('No changes were needed or could not update Ingredient interface');
  }
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 
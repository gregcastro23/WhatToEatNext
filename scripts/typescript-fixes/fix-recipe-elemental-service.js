import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// File to modify
const serviceFilePath = resolve(rootDir, 'src/services/RecipeElementalService.ts');

// Main function
function fixRecipeElementalService(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing RecipeElementalService constructor visibility...`);

  try {
    // Read file
    const fileContent = readFileSync(serviceFilePath, 'utf8');
    
    // Check if the file needs to be fixed
    if (!fileContent.includes('private constructor')) {
      console.log('No private constructor found, no changes needed.');
      return;
    }
    
    // Replace private constructor with protected constructor
    const updatedContent = fileContent.replace(
      'private constructor()', 
      'protected constructor()'
    );
    
    // Make sure we actually changed something
    if (updatedContent === fileContent) {
      console.log('No changes were needed or made.');
      return;
    }
    
    // Output the diff
    console.log('\nChanges to be made:');
    console.log('- private constructor() → protected constructor()');
    
    // Write the changes if not in dry run mode
    if (!dryRun) {
      writeFileSync(serviceFilePath, updatedContent, 'utf8');
      console.log('✅ Successfully updated RecipeElementalService constructor to protected.');
    } else {
      console.log('[DRY RUN] No changes written to disk.');
    }
  } catch (error) {
    console.error(`❌ Error fixing RecipeElementalService:`, error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixRecipeElementalService(dryRun); 
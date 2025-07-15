import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/services/SpoonacularService.ts');
const dryRun = process.argv.includes('--dry-run');

function fixSpoonacularService() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing SpoonacularService export conflicts...`);

  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // The issue is that there are duplicate interface declarations - one in the file
  // and others imported from types/spoonacular.ts

  // Check if we have duplicate interface declarations
  const hasLocalSpoonacularSearchParams = content.includes('export interface SpoonacularSearchParams');
  const hasLocalSpoonacularApiRecipe = content.includes('export interface SpoonacularApiRecipe');
  const hasImportedInterfaces = content.includes('import { ') && content.includes('SpoonacularSearchParams');

  if (hasLocalSpoonacularSearchParams && hasImportedInterfaces) {
    console.log('Found duplicate SpoonacularSearchParams interface declaration');
    
    // Remove the local interface declarations and keep the imports
    content = content.replace(/export interface SpoonacularSearchParams \{[\s\S]*?\}/g, '');
    content = content.replace(/export interface SpoonacularApiRecipe extends SpoonacularRecipe \{[\s\S]*?\}/g, '');
    
    // Fix any imported types that are no longer needed
    const importLines = content.match(/import \{[^}]*\} from '\.\.\/types\/spoonacular';/);
    if (importLines) {
      console.log('Found spoonacular type imports');
    }
    
    // Write changes to file if not a dry run
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed SpoonacularService export conflicts');
    } else {
      console.log('[DRY RUN] Would fix SpoonacularService export conflicts');
    }
  } else {
    console.log('No duplicate interface declarations found in SpoonacularService');
  }
}

// Run the fix function
try {
  fixSpoonacularService();
} catch (error) {
  console.error('Error fixing SpoonacularService:', error);
  process.exit(1);
} 
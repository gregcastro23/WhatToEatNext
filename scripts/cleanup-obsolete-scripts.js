import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run');

// Scripts identified as obsolete from the analysis
const OBSOLETE_SCRIPTS = [
  'scripts/ingredient-scripts/updateAllIngredients.ts',
  'scripts/ingredient-scripts/updateFruits.ts',
  'scripts/ingredient-scripts/updateGrains.ts',
  'scripts/ingredient-scripts/updateHerbs.ts',
  'scripts/ingredient-scripts/updateIngredientCategory.ts',
  'scripts/ingredient-scripts/updateOils.ts',
  'scripts/ingredient-scripts/updateOilsAndVinegars.ts',
  'scripts/ingredient-scripts/updateProteins.ts',
  'scripts/ingredient-scripts/updateSpices.ts',
  'scripts/ingredient-scripts/updateVegetables.ts',
  'scripts/ingredient-scripts/updateVinegars.ts',
  'scripts/typescript-fixes/fix-nutritional-types.ts',
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function main() {
  console.log('🗑️  Cleaning up obsolete TypeScript scripts...');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);
  
  let totalSize = 0;
  let deletedCount = 0;
  
  for (const scriptPath of OBSOLETE_SCRIPTS) {
    const fullPath = path.resolve(ROOT_DIR, scriptPath);
    
    if (await fileExists(fullPath)) {
      const size = await getFileSize(fullPath);
      totalSize += size;
      
      if (!isDryRun) {
        await fs.unlink(fullPath);
      }
      
      console.log(`❌ ${isDryRun ? 'Would delete' : 'Deleted'}: ${scriptPath} (${(size / 1024).toFixed(1)}KB)`);
      deletedCount++;
    } else {
      console.log(`⚠️  Not found: ${scriptPath}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  Files ${isDryRun ? 'to delete' : 'deleted'}: ${deletedCount}`);
  console.log(`  Total size ${isDryRun ? 'to save' : 'saved'}: ${(totalSize / 1024).toFixed(1)}KB`);
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to actually delete the files');
  } else {
    console.log('\n✅ Cleanup completed successfully!');
  }
}

main(); 
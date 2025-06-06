import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run');

// Scripts that are severely broken and should be removed
const BROKEN_SCRIPTS = [
  // Scripts with severe syntax corruption that can't be easily fixed
  'scripts/ingredient-scripts/fixIngredientMappings.ts',
  'scripts/typescript-fixes/fixTypeInconsistencies.ts', 
  'scripts/typescript-fixes/updateCookingMethodTypes.ts',
  'scripts/typescript-fixes/fix-unused-vars.ts',
  'scripts/syntax-fixes/fixZodiacSignLiterals.ts',
  'scripts/uncategorized/updateLunarPhaseModifiers.ts',
];

// Scripts to keep (these are the ones I fixed and are functional)
const FUNCTIONAL_SCRIPTS = [
  'scripts/typescript-fixes/fix-ingredient-type.ts',
  'scripts/typescript-fixes/fix-planetary-types.ts',
  'scripts/typescript-fixes/fix-promise-awaits.ts', 
  'scripts/typescript-fixes/fix-season-types.ts',
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

async function analyzeScript(scriptPath) {
  const fullPath = path.resolve(ROOT_DIR, scriptPath);
  
  if (!(await fileExists(fullPath))) {
    return { exists: false, size: 0, reason: 'File not found' };
  }
  
  try {
    const content = await fs.readFile(fullPath, 'utf8');
    const size = content.length;
    
    // Check for corruption patterns
    const corruptionIndicators = [
      /process\.Array\.isArray/g, // Wrong syntax
      /\|\|\s+\[\]\)\.(\w+)/g, // Malformed || [] expressions
      /Array\.isArray\(\([^)]+\)\s+\?\s+\([^)]+\s+:\s+\([^)]+\)\s+\{/g, // Malformed conditionals
      /\w+\s+\|\|\s+\[\]\)\.(\w+)/g, // More malformed expressions
      /\[\]\s*\|\|\s*\[\]\s*\|\|\s*\[\]/g, // Triple redundant expressions
      /Unterminated template literal/g, // Template literal issues
    ];
    
    let corruptionCount = 0;
    corruptionIndicators.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) corruptionCount += matches.length;
    });
    
    return {
      exists: true,
      size,
      corruptionCount,
      reason: corruptionCount > 5 ? 'Severely corrupted syntax' : 
              corruptionCount > 0 ? 'Some corruption detected' : 'Appears clean'
    };
  } catch (error) {
    return { exists: true, size: 0, reason: `Error reading file: ${error.message}` };
  }
}

async function main() {
  console.log('🗑️  Removing broken TypeScript scripts...');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);
  
  let totalSize = 0;
  let removedCount = 0;
  
  console.log('📋 Analyzing scripts to remove:\n');
  
  for (const scriptPath of BROKEN_SCRIPTS) {
    const fullPath = path.resolve(ROOT_DIR, scriptPath);
    const analysis = await analyzeScript(scriptPath);
    
    if (analysis.exists) {
      totalSize += analysis.size;
      
      console.log(`❌ ${scriptPath}`);
      console.log(`   Size: ${(analysis.size / 1024).toFixed(1)}KB`);
      console.log(`   Reason: ${analysis.reason}`);
      if (analysis.corruptionCount) {
        console.log(`   Corruption patterns found: ${analysis.corruptionCount}`);
      }
      
      if (!isDryRun) {
        await fs.unlink(fullPath);
        console.log(`   ✅ Deleted`);
      } else {
        console.log(`   📝 Would delete (dry-run)`);
      }
      
      removedCount++;
      console.log('');
    } else {
      console.log(`⚠️  Not found: ${scriptPath}\n`);
    }
  }
  
  console.log('✅ Scripts to keep (functional):\n');
  
  for (const scriptPath of FUNCTIONAL_SCRIPTS) {
    const analysis = await analyzeScript(scriptPath);
    
    if (analysis.exists) {
      console.log(`✅ ${scriptPath}`);
      console.log(`   Size: ${(analysis.size / 1024).toFixed(1)}KB`);
      console.log(`   Status: ${analysis.reason}`);
      console.log('');
    }
  }
  
  console.log(`📊 Summary:`);
  console.log(`  Scripts ${isDryRun ? 'to remove' : 'removed'}: ${removedCount}`);
  console.log(`  Total size ${isDryRun ? 'to save' : 'saved'}: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`  Functional scripts remaining: ${FUNCTIONAL_SCRIPTS.length}`);
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to actually delete the broken scripts');
  } else {
    console.log('\n🎉 Cleanup completed! Only functional scripts remain.');
  }
}

main().catch(error => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
}); 
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Check if dry-run mode
const isDryRun = process.argv.includes('--dry-run');

// Scripts that are definitely obsolete and should be deleted
const OBSOLETE_SCRIPTS = [
  'src/scripts/fetchVegetablesFromSpoonacular.ts', // API fetching script, likely one-time use
  'src/scripts/fetchVegetablesFromSpoonacular.js', // Duplicate of above
  'src/scripts/downloadEphemeris.ts', // Ephemeris download, likely one-time use
  'src/scripts/testGasGiantInfluences.ts', // Test script
  'src/scripts/gasGiantsTest.js', // Test script
  'src/scripts/scriptCleanup.js', // Old cleanup script
  'src/scripts/run-lint-fix.sh', // Shell script that should be moved to root
  'src/scripts/cache/', // Cache directory
];

// Scripts to move and categorize
const SCRIPT_CATEGORIZATION = {
  'ingredient-scripts': [
    'src/scripts/updateAllIngredients.ts',
    'src/scripts/updateFruits.ts',
    'src/scripts/updateGrains.ts', 
    'src/scripts/updateHerbs.ts',
    'src/scripts/updateIngredientCategory.ts',
    'src/scripts/updateOils.ts',
    'src/scripts/updateOilsAndVinegars.ts',
    'src/scripts/updateProteins.ts',
    'src/scripts/updateSpices.ts',
    'src/scripts/updateVegetables.ts',
    'src/scripts/updateVinegars.ts',
    'src/scripts/fixIngredientMappings.ts',
    'src/scripts/updateIngredientFiles.js',
    'src/scripts/fix-ingredient-scripts.js',
    'src/scripts/add-serving-sizes.js',
  ],
  'typescript-fixes': [
    'src/scripts/fixTypeInconsistencies.ts',
    'src/scripts/updateCookingMethodTypes.ts',
    'src/scripts/typescript-fixes/fix-nutritional-types.ts',
    'src/scripts/fix-unused-vars.ts',
    'src/scripts/fix-unused-vars.js',
    'src/scripts/fix-linting-issues.js',
    'src/scripts/fix-const-assign.js',
  ],
  'syntax-fixes': [
    'src/scripts/fixZodiacSignLiterals.ts',
  ],
  'elemental-fixes': [
    'src/scripts/fixElementalProperties.js',
  ],
  'cleanup-scripts': [
    'src/scripts/update-constants-imports.js',
    'src/scripts/update-service-imports.js',
  ],
  'uncategorized': [
    'src/scripts/updateLunarPhaseModifiers.ts',
  ]
};

// Common syntax error patterns to fix
const SYNTAX_FIXES = [
  // Fix Object.(method to Object.method
  { pattern: /Object\.\((\w+)/g, replacement: 'Object.$1' },
  // Fix Promise.(method to Promise.method  
  { pattern: /Promise\.\((\w+)/g, replacement: 'Promise.$1' },
  // Fix categories.(property to categories.property
  { pattern: /categories\.\((\w+)/g, replacement: 'categories.$1' },
  // Fix other similar patterns
  { pattern: /(\w+)\.\((\w+)/g, replacement: '$1.$2' },
  // Fix malformed conditional expressions with extra parentheses
  { pattern: /Array\.isArray\(\(([^)]+)\) \? \(([^)]+) : \(([^)]+)\) \{/g, replacement: 'Array.isArray($1) ? ($2) : ($3)) {' },
  // Fix specific backup files check pattern
  { pattern: /Array\.isArray\(\(BACKUP_FILES\) \? \(BACKUP_FILES\.includes\(filename\) : \(BACKUP_FILES === filename\)\) \{/g, replacement: 'Array.isArray(BACKUP_FILES) ? BACKUP_FILES.includes(filename) : (BACKUP_FILES === filename)) {' },
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function createDirectoryIfNotExists(dirPath) {
  if (!isDryRun) {
    await fs.mkdir(dirPath, { recursive: true });
  }
  console.log(`📁 Created directory: ${dirPath}`);
}

async function deleteObsoleteScripts() {
  console.log('\n🗑️  Deleting obsolete scripts...');
  
  for (const scriptPath of OBSOLETE_SCRIPTS) {
    const fullPath = path.resolve(ROOT_DIR, scriptPath);
    
    if (await fileExists(fullPath)) {
      if (await isDirectory(fullPath)) {
        if (!isDryRun) {
          await fs.rm(fullPath, { recursive: true, force: true });
        }
        console.log(`❌ Deleted directory: ${scriptPath}`);
      } else {
        if (!isDryRun) {
          await fs.unlink(fullPath);
        }
        console.log(`❌ Deleted file: ${scriptPath}`);
      }
    }
  }
}

async function fixSyntaxErrors(content, filePath) {
  let fixedContent = content;
  let hasChanges = false;
  
  for (const fix of SYNTAX_FIXES) {
    const originalContent = fixedContent;
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    if (originalContent !== fixedContent) {
      hasChanges = true;
      console.log(`  🔧 Applied syntax fix to ${path.basename(filePath)}`);
    }
  }
  
  return { content: fixedContent, hasChanges };
}

async function moveAndFixScript(sourcePath, targetCategory) {
  const fullSourcePath = path.resolve(ROOT_DIR, sourcePath);
  
  if (!(await fileExists(fullSourcePath))) {
    console.log(`⚠️  Script not found: ${sourcePath}`);
    return;
  }
  
  const fileName = path.basename(sourcePath);
  const targetDir = path.resolve(ROOT_DIR, 'scripts', targetCategory);
  const targetPath = path.resolve(targetDir, fileName);
  
  // Create target directory
  await createDirectoryIfNotExists(targetDir);
  
  // Read and fix content
  const content = await fs.readFile(fullSourcePath, 'utf8');
  const { content: fixedContent, hasChanges } = await fixSyntaxErrors(content, sourcePath);
  
  if (!isDryRun) {
    // Write fixed content to target
    await fs.writeFile(targetPath, fixedContent, 'utf8');
    
    // Delete original
    await fs.unlink(fullSourcePath);
  }
  
  console.log(`📦 Moved ${sourcePath} → scripts/${targetCategory}/${fileName}${hasChanges ? ' (with fixes)' : ''}`);
}

async function checkForRemainingScripts() {
  console.log('\n🔍 Checking for remaining scripts in src/scripts...');
  
  const srcScriptsPath = path.resolve(ROOT_DIR, 'src/scripts');
  
  if (await fileExists(srcScriptsPath)) {
    try {
      const items = await fs.readdir(srcScriptsPath);
      const remainingItems = [];
      
      for (const item of items) {
        // Skip README.md as it's documentation
        if (item === 'README.md') continue;
        
        const itemPath = path.resolve(srcScriptsPath, item);
        if (await fileExists(itemPath)) {
          remainingItems.push(item);
        }
      }
      
      if (remainingItems.length > 0) {
        console.log('⚠️  Remaining items in src/scripts:');
        remainingItems.forEach(item => console.log(`   - ${item}`));
      } else {
        console.log('✅ Only README.md remains in src/scripts');
        // Move README.md to main scripts directory
        if (!isDryRun) {
          const readmePath = path.resolve(srcScriptsPath, 'README.md');
          const targetReadmePath = path.resolve(ROOT_DIR, 'scripts', 'TYPE_UTILITIES.md');
          await fs.copyFile(readmePath, targetReadmePath);
          await fs.unlink(readmePath);
          await fs.rmdir(srcScriptsPath);
          console.log('📦 Moved README.md to scripts/TYPE_UTILITIES.md');
          console.log('🗑️  Removed empty src/scripts directory');
        } else {
          console.log('📦 Would move README.md to scripts/TYPE_UTILITIES.md');
          console.log('🗑️  Would remove empty src/scripts directory');
        }
      }
    } catch (error) {
      console.log('ℹ️  src/scripts directory is empty or doesn\'t exist');
    }
  }
}

async function validateTypescriptFiles() {
  console.log('\n🔍 Validating moved TypeScript files...');
  
  // Check each category for TS files
  for (const [category, scripts] of Object.entries(SCRIPT_CATEGORIZATION)) {
    const categoryPath = path.resolve(ROOT_DIR, 'scripts', category);
    
    if (await fileExists(categoryPath)) {
      const files = await fs.readdir(categoryPath);
      const tsFiles = files.filter(f => f.endsWith('.ts'));
      
      for (const tsFile of tsFiles) {
        const filePath = path.resolve(categoryPath, tsFile);
        console.log(`📝 TypeScript file: scripts/${category}/${tsFile}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting script organization and cleanup...');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  
  try {
    // 1. Delete obsolete scripts
    await deleteObsoleteScripts();
    
    // 2. Move and categorize scripts
    console.log('\n📦 Moving and categorizing scripts...');
    for (const [category, scripts] of Object.entries(SCRIPT_CATEGORIZATION)) {
      console.log(`\n📂 Category: ${category}`);
      for (const script of scripts) {
        await moveAndFixScript(script, category);
      }
    }
    
    // 3. Check for remaining scripts
    await checkForRemainingScripts();
    
    // 4. Validate TypeScript files
    await validateTypescriptFiles();
    
    console.log('\n✅ Script organization completed!');
    
    if (isDryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else {
      console.log('\n🎉 All scripts have been organized and fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error during script organization:', error);
    process.exit(1);
  }
}

main(); 
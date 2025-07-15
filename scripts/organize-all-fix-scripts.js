#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const ROOT_DIR = process.cwd();
const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
const DRY_RUN = process.argv.includes('--dry-run');

// Script categories and their target directories
const SCRIPT_CATEGORIES = {
  'typescript-fixes': {
    patterns: [
      /^fix-typescript/,
      /^fix-type-/,
      /^fix-.*-types?\.js$/,
      /^fix-duplicate-identifiers/,
      /^fix-import-export/,
      /^fix-interface/,
      /^fix-property-access/,
      /^fix-name-resolution/,
      /^fix-enum/,
      /^fix-async/,
      /^fix-promise/,
      /^fix-jest-dom/,
      /^fix-missing-exports/,
      /^fix-missing-imports/,
      /^fix-module-resolution/,
      /^fix-celestial-position/,
      /^fix-astrologize-api/,
      /^fix-spoonacular/,
      /^fix-recipe-/,
      /^fix-method-recommendation/,
      /^fix-thermodynamic/,
      /^fix-unified/
    ],
    description: 'TypeScript type fixes, import/export issues, and API fixes'
  },
  'syntax-fixes': {
    patterns: [
      /^fix-syntax/,
      /^fix-.*-syntax/,
      /^fix-jsx/,
      /^fix-malformed/,
      /^fix-missing-closing/,
      /^fix-object-method/,
      /^fix-blocking-syntax/,
      /^fix-build-blocking/,
      /^fix-critical-syntax/,
      /^fix-complex-syntax/,
      /^fix-corruption/,
      /^fix-.*-corruption/,
      /^fix-const-assignments/,
      /^fix-array-operations/,
      /^fix-direct-syntax/,
      /^fix-precise-syntax/,
      /^fix-final-syntax/,
      /^fix-remaining-syntax/
    ],
    description: 'Syntax errors, JSX issues, and structural code fixes'
  },
  'ingredient-scripts': {
    patterns: [
      /^fix-ingredient/,
      /^fix-.*-ingredient/,
      /^fix-herbs/,
      /^fix-spices/,
      /^fix-grains/,
      /^fix-pseudo-grains/,
      /^fix-all-ingredient/,
      /^fix-food-recommender/
    ],
    description: 'Ingredient data fixes and food recommendation scripts'
  },
  'elemental-fixes': {
    patterns: [
      /^fix-elemental/,
      /^fix-.*-elemental/,
      /^fix-planetary/,
      /^fix-alchemical/,
      /^fix-division-by-zero/,
      /^fix-cooking-method/,
      /^fix-cuisine-flavor/,
      /^fix-.*-flavor/
    ],
    description: 'Elemental logic, alchemical calculations, and planetary fixes'
  },
  'cuisine-fixes': {
    patterns: [
      /^fix-cuisine/,
      /^fix-.*-cuisine/,
      /^fix-cooking-method/,
      /^fix-local-recipe/
    ],
    description: 'Cuisine data and cooking method fixes'
  },
  'cleanup-scripts': {
    patterns: [
      /^fix-critical-cleanup/,
      /^fix-final-cleanup/,
      /^fix-high-error/,
      /^fix-high-impact/,
      /^fix-remaining-/,
      /^fix-final-/,
      /^fix-absolute-final/,
      /^fix-victory/,
      /^fix-unused/,
      /^fix-linting/,
      /^fix-context-final/,
      /^fix-more-/,
      /^fix-specific-files/
    ],
    description: 'Cleanup scripts and final comprehensive fixes'
  }
};

// Scripts to delete (outdated, duplicates, or superseded)
const SCRIPTS_TO_DELETE = [
  // Victory phase scripts (too many, keep only the final ones)
  'fix-final-victory-phase1.js',
  'fix-final-victory-phase2.js',
  'fix-final-victory-phase3.js',
  'fix-final-victory-phase4.js',
  'fix-final-victory-phase5.js',
  'fix-final-victory-phase6.js',
  'fix-final-victory-phase7.js',
  'fix-final-victory-phase8.js',
  'fix-final-victory-phase9.js',
  'fix-final-victory-phase10.js',
  // Keep only the simple and tier versions
  
  // Multiple phase scripts (consolidate)
  'fix-critical-cleanup-phase1.js',
  'fix-final-cleanup-phase4.js',
  'fix-high-error-files-phase2.js',
  'fix-module-resolution-phase4.js',
  'fix-property-access-errors-phase2.js',
  'fix-property-access-phase2.js',
  'fix-property-access-phase13.js',
  'fix-remaining-errors-phase4.js',
  'fix-test-files-phase3.js',
  'fix-type-compatibility-phase3.js',
  'fix-type-compatibility-phase14.js',
  'fix-name-resolution-phase15.js',
  
  // Duplicate/similar scripts
  'fix-critical-errors.js',
  'fix-final-critical-errors.js',
  'fix-remaining-critical-errors.js',
  'fix-build-errors.js',
  'fix-final-build-issues.js',
  'fix-remaining-build-issues.js',
  'fix-final-issues.js',
  'fix-more-imports.js',
  'fix-more-syntax-errors.js',
  'fix-more-typescript-errors.js',
  
  // Enhanced/improved versions exist
  'fix-phase12-syntax-errors.js', // keep enhanced version
  'fix-duplicate-identifiers.js', // keep systematic version
  'fix-typescript-warnings.js', // keep enhanced version
  
  // Very specific one-off fixes
  'fix-use-current-chart.js',
  'fix-simple-export-comments.js'
];

// Utility functions
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (!DRY_RUN) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    console.log(`📁 Created directory: ${path.relative(ROOT_DIR, dirPath)}`);
  }
}

function analyzeScript(scriptName) {
  const scriptPath = path.join(ROOT_DIR, scriptName);
  
  if (!fs.existsSync(scriptPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(scriptPath, 'utf8');
    const stats = fs.statSync(scriptPath);
    
    // Extract basic info
    const lines = content.split('\n').length;
    const size = stats.size;
    const lastModified = stats.mtime;
    
    // Look for dry run support
    const hasDryRun = content.includes('--dry-run') || content.includes('DRY_RUN');
    
    // Look for ES modules vs CommonJS
    const isESModule = content.includes('import ') && content.includes('from ') || 
                      content.includes('export ');
    
    return {
      name: scriptName,
      path: scriptPath,
      size,
      lines,
      lastModified,
      hasDryRun,
      isESModule,
      content: content.substring(0, 500) // First 500 chars for analysis
    };
  } catch (error) {
    console.warn(`⚠️  Could not analyze ${scriptName}: ${error.message}`);
    return null;
  }
}

function categorizeScript(scriptName) {
  for (const [category, config] of Object.entries(SCRIPT_CATEGORIES)) {
    for (const pattern of config.patterns) {
      if (pattern.test(scriptName)) {
        return category;
      }
    }
  }
  return 'uncategorized';
}

function moveScript(scriptName, targetCategory) {
  const sourcePath = path.join(ROOT_DIR, scriptName);
  const targetDir = path.join(SCRIPTS_DIR, targetCategory);
  const targetPath = path.join(targetDir, scriptName);
  
  ensureDirectoryExists(targetDir);
  
  if (fs.existsSync(targetPath)) {
    console.log(`⚠️  ${scriptName} already exists in ${targetCategory}, skipping`);
    return false;
  }
  
  if (!DRY_RUN) {
    fs.renameSync(sourcePath, targetPath);
  }
  
  console.log(`📦 Moved ${scriptName} → scripts/${targetCategory}/`);
  return true;
}

function deleteScript(scriptName) {
  const scriptPath = path.join(ROOT_DIR, scriptName);
  
  if (fs.existsSync(scriptPath)) {
    if (!DRY_RUN) {
      fs.unlinkSync(scriptPath);
    }
    console.log(`🗑️  Deleted outdated script: ${scriptName}`);
    return true;
  }
  return false;
}

function createInventoryReport() {
  const inventoryPath = path.join(SCRIPTS_DIR, 'INVENTORY.md');
  
  let report = `# Fix Scripts Inventory

Generated on: ${new Date().toISOString()}

## Categories

`;

  for (const [category, config] of Object.entries(SCRIPT_CATEGORIES)) {
    const categoryDir = path.join(SCRIPTS_DIR, category);
    let scripts = [];
    
    if (fs.existsSync(categoryDir)) {
      scripts = fs.readdirSync(categoryDir)
        .filter(file => file.endsWith('.js'))
        .map(file => analyzeScript(file))
        .filter(Boolean);
    }
    
    report += `### ${category}
${config.description}

Scripts: ${scripts.length}
`;

    if (scripts.length > 0) {
      report += `
| Script | Size | Lines | Last Modified | Dry Run |
|--------|------|-------|---------------|---------|
`;
      
      scripts.forEach(script => {
        const sizeKb = (script.size / 1024).toFixed(1);
        const lastMod = script.lastModified.toISOString().split('T')[0];
        const dryRun = script.hasDryRun ? '✅' : '❌';
        
        report += `| ${script.name} | ${sizeKb}KB | ${script.lines} | ${lastMod} | ${dryRun} |\n`;
      });
    }
    
    report += '\n';
  }
  
  report += `
## Usage Guidelines

### Running Fix Scripts

Always run scripts with dry-run first:
\`\`\`bash
node scripts/category/script-name.js --dry-run
\`\`\`

Then run without dry-run to apply changes:
\`\`\`bash
node scripts/category/script-name.js
\`\`\`

### Script Categories

- **typescript-fixes**: Type errors, import/export issues, API fixes
- **syntax-fixes**: Syntax errors, JSX issues, structural fixes  
- **ingredient-scripts**: Ingredient data and food recommendation fixes
- **elemental-fixes**: Elemental logic and alchemical calculation fixes
- **cuisine-fixes**: Cuisine data and cooking method fixes
- **cleanup-scripts**: General cleanup and comprehensive fixes

### Best Practices

1. Always use dry-run mode first
2. Check build status before and after running scripts
3. Use specific scripts rather than broad "fix-all" scripts
4. Commit changes after each successful script run
5. Use ES modules for new scripts

`;

  if (!DRY_RUN) {
    fs.writeFileSync(inventoryPath, report, 'utf8');
  }
  
  console.log(`📋 Created inventory report: scripts/INVENTORY.md`);
}

// Main execution
async function main() {
  console.log('🔧 Organizing Fix Scripts');
  console.log('========================');
  
  if (DRY_RUN) {
    console.log('🏃 DRY RUN MODE - No files will be moved or deleted\n');
  }
  
  // Get all fix scripts in root directory
  const allFiles = fs.readdirSync(ROOT_DIR);
  const fixScripts = allFiles.filter(file => 
    file.startsWith('fix-') && file.endsWith('.js')
  );
  
  console.log(`Found ${fixScripts.length} fix scripts to organize\n`);
  
  // Step 1: Delete outdated scripts
  console.log('Step 1: Deleting outdated scripts');
  console.log('----------------------------------');
  let deletedCount = 0;
  
  for (const scriptToDelete of SCRIPTS_TO_DELETE) {
    if (deleteScript(scriptToDelete)) {
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} outdated scripts\n`);
  
  // Step 2: Categorize and move remaining scripts
  console.log('Step 2: Categorizing and moving scripts');
  console.log('---------------------------------------');
  
  const remainingScripts = fixScripts.filter(script => 
    !SCRIPTS_TO_DELETE.includes(script)
  );
  
  const categorized = {};
  
  for (const script of remainingScripts) {
    const category = categorizeScript(script);
    
    if (!categorized[category]) {
      categorized[category] = [];
    }
    
    categorized[category].push(script);
  }
  
  // Show categorization results
  console.log('\nCategorization Results:');
  for (const [category, scripts] of Object.entries(categorized)) {
    console.log(`  ${category}: ${scripts.length} scripts`);
  }
  console.log('');
  
  // Move scripts to their categories
  let movedCount = 0;
  for (const [category, scripts] of Object.entries(categorized)) {
    for (const script of scripts) {
      if (moveScript(script, category)) {
        movedCount++;
      }
    }
  }
  
  console.log(`\nMoved ${movedCount} scripts to organized directories\n`);
  
  // Step 3: Create inventory report
  console.log('Step 3: Creating inventory report');
  console.log('---------------------------------');
  createInventoryReport();
  
  console.log('\n✅ Script organization complete!');
  console.log('\nNext steps:');
  console.log('1. Review the inventory report: scripts/INVENTORY.md');
  console.log('2. Test key scripts to ensure they still work');
  console.log('3. Update any scripts that reference moved files');
  console.log('4. Consider creating unified runner scripts for common workflows');
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log(`
Usage: node organize-all-fix-scripts.js [options]

Options:
  --dry-run    Show what would be done without making changes
  --help       Show this help message

This script will:
1. Delete outdated and duplicate fix scripts
2. Move remaining scripts to organized subdirectories
3. Create an inventory report

Categories:
${Object.entries(SCRIPT_CATEGORIES).map(([cat, config]) => 
  `  ${cat}: ${config.description}`
).join('\n')}
`);
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error organizing scripts:', error.message);
  process.exit(1);
}); 
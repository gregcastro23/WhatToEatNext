#!/usr/bin/env node

/**
 * Script to organize and consolidate fix scripts
 * Removes duplicates, empty files, and organizes useful scripts into categories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.dirname(__dirname);

// Categories for organizing scripts
const SCRIPT_CATEGORIES = {
  'typescript-fixes': [
    'fix-typescript-safely.js',
    'fix-typescript-errors.js', 
    'fix-typescript-advanced.js',
    'fix-typescript-no-backup.js',
    'fix-typescript-parse-errors.js'
  ],
  'syntax-fixes': [
    'fix-syntax-errors.js',
    'fix-jsx-syntax.js',
    'fix-jsx-files.js',
    'fix-object-literals.js',
    'fix-function-calls.js',
    'fix-if-conditions.js',
    'fix-arrow-functions.js'
  ],
  'cuisine-fixes': [
    'fix-cuisine-comprehensive.js',
    'fix-cuisine-syntax-surgical.js',
    'fix-cuisine-typescript-errors.js'
  ],
  'cleanup-scripts': [
    'cleanup-all-backups.sh',
    'cleanup-backup-dirs.sh', 
    'cleanup-duplicates.sh',
    'cleanup-empty-files.sh'
  ],
  'ingredient-scripts': [
    'fix-ingredient-recommender.js',
    'fix-ingredient-duplication.js'
  ],
  'elemental-fixes': [
    'fix-elemental-logic.js',
    'fix-alchemical-engine.js'
  ]
};

// Scripts to keep as-is (useful utilities)
const KEEP_SCRIPTS = [
  'build-script.js',
  'compare-fixers.js'
];

// Scripts to delete (empty, broken, or redundant)
const DELETE_SCRIPTS = [
  'fix-functions.cjs', // Empty file
  'fix-alchemical-functions.js', // Nearly empty
  'fix-alchemical-object-literals.js', // Empty 
  'fix-declarations.js', // Empty
  'fix-final-syntax.js', // Empty
  'fix-object-literals.js', // Empty
  'fix-safe-get-element.js', // Empty
  'fix-template-literals.js', // Empty
  // Duplicates with .cjs/.mjs versions
  'fix-typescript-safely.cjs',
  'fix-typescript-safely.mjs',
  'fix-alchemical-syntax.cjs',
  'fix-conditionals.cjs',
  'fix-declarations.cjs',
  'fix-final-issues.cjs',
  'fix-last-issues.cjs',
  'fix-method-structure.cjs',
  'fix-object-literals.cjs',
  'fix-property-assignments.cjs',
  'fix-remaining-issues.cjs',
  'fix-remaining-syntax.cjs',
  'fix-safe-get-element.cjs',
  'fix-template-literals.cjs',
  'fix-triple-commas.cjs',
  // Specific one-off fixes that are no longer needed
  'fix-cuisine-italian.js',
  'fix-cuisine-korean.js', 
  'fix-cuisine-mexican.js',
  'fix-seafood-file.js',
  'fix-herbs-imports.js',
  'fix-pseudo-grains-imports.js',
  'fix-spices-imports.js',
  'fix-all-ingredient-imports.js',
  // Redundant variations
  'fix-alchemical-typescript-improved.js',
  'fix-alchemical-final-touches.cjs',
  'fix-alchemical-precise.cjs',
  'fix-alchemical-restore.cjs',
  'fix-cuisine-typescript-errors-v2.js',
  'fix-remaining-syntax-errors.js'
];

function logAction(action, file, dryRun = true) {
  const prefix = dryRun ? '[DRY RUN]' : '[EXECUTING]';
  console.log(`${prefix} ${action}: ${file}`);
}

function moveScript(scriptName, category, dryRun = true) {
  const sourcePath = path.join(ROOT_DIR, scriptName);
  const targetDir = path.join(ROOT_DIR, 'scripts', category);
  const targetPath = path.join(targetDir, scriptName);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`Warning: Script not found: ${scriptName}`);
    return false;
  }
  
  logAction(`MOVE ${scriptName} -> scripts/${category}/`, scriptName, dryRun);
  
  if (!dryRun) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.renameSync(sourcePath, targetPath);
  }
  
  return true;
}

function deleteScript(scriptName, dryRun = true) {
  const scriptPath = path.join(ROOT_DIR, scriptName);
  
  if (!fs.existsSync(scriptPath)) {
    console.log(`Warning: Script not found for deletion: ${scriptName}`);
    return false;
  }
  
  logAction('DELETE', scriptName, dryRun);
  
  if (!dryRun) {
    fs.unlinkSync(scriptPath);
  }
  
  return true;
}

function createMasterScript(dryRun = true) {
  const masterScriptPath = path.join(ROOT_DIR, 'scripts', 'fix-project.mjs');
  const content = `#!/usr/bin/env node

/**
 * Master script to run various project fixes
 * Usage: node scripts/fix-project.mjs [--dry-run] [--category=typescript|syntax|cuisine|all]
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = {
  typescript: ['typescript-fixes/fix-typescript-safely.js'],
  syntax: ['syntax-fixes/fix-syntax-errors.js', 'syntax-fixes/fix-jsx-syntax.js'],
  cuisine: ['cuisine-fixes/fix-cuisine-comprehensive.js'],
  elemental: ['elemental-fixes/fix-elemental-logic.js'],
  all: 'all'
};

function runScript(scriptPath, dryRun = false) {
  const fullPath = path.join(__dirname, scriptPath);
  const dryRunFlag = dryRun ? '--dry-run' : '';
  const command = \`node \${fullPath} \${dryRunFlag}\`;
  
  console.log(\`Running: \${command}\`);
  
  if (!dryRun) {
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(\`Error running \${scriptPath}:\`, error.message);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const category = categoryArg ? categoryArg.split('=')[1] : 'all';
  
  console.log(\`Fix Project Script - Category: \${category}, Dry Run: \${isDryRun}\`);
  
  if (category === 'all') {
    Object.values(categories).flat().filter(script => script !== 'all').forEach(script => {
      runScript(script, isDryRun);
    });
  } else if (categories[category]) {
    categories[category].forEach(script => {
      runScript(script, isDryRun);
    });
  } else {
    console.error(\`Unknown category: \${category}\`);
    console.log('Available categories:', Object.keys(categories).join(', '));
    process.exit(1);
  }
}

main();
`;

  logAction('CREATE', 'scripts/fix-project.mjs', dryRun);
  
  if (!dryRun) {
    fs.writeFileSync(masterScriptPath, content);
    fs.chmodSync(masterScriptPath, 0o755);
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  
  console.log('=== Script Organization Tool ===');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log('Add --execute flag to actually perform changes');
  console.log('');
  
  let moveCount = 0;
  let deleteCount = 0;
  
  // Move useful scripts to organized folders
  for (const [category, scripts] of Object.entries(SCRIPT_CATEGORIES)) {
    console.log(`\n--- Category: ${category} ---`);
    scripts.forEach(script => {
      if (moveScript(script, category, isDryRun)) {
        moveCount++;
      }
    });
  }
  
  // Keep useful utility scripts in root
  console.log('\n--- Keeping in root ---');
  KEEP_SCRIPTS.forEach(script => {
    logAction('KEEP', script, isDryRun);
  });
  
  // Delete redundant/empty scripts
  console.log('\n--- Deleting redundant scripts ---');
  DELETE_SCRIPTS.forEach(script => {
    if (deleteScript(script, isDryRun)) {
      deleteCount++;
    }
  });
  
  // Create master script
  console.log('\n--- Creating master script ---');
  createMasterScript(isDryRun);
  
  console.log(`\n=== Summary ===`);
  console.log(`Scripts to move: ${moveCount}`);
  console.log(`Scripts to delete: ${deleteCount}`);
  console.log(`Scripts to keep in root: ${KEEP_SCRIPTS.length}`);
  
  if (isDryRun) {
    console.log('\nThis was a dry run. Add --execute to perform changes.');
  }
}

main(); 
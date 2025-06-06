#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../..');

console.log('🔧 Fixing Syntax Errors from Casing Script');
console.log('📋 Repairing malformed element strings and syntax issues');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Directories to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'backup',
  'backups',
  '.astro',
  '.swc',
  'patches',
  'tmp'
];

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return EXCLUDE_DIRS.some(excluded => 
    dirName === excluded || dirPath.includes(`/${excluded}/`) || dirPath.includes(`\\${excluded}\\`)
  );
}

/**
 * Get all files to process
 */
function getAllFiles(dir, files = []) {
  if (shouldExcludeDir(dir)) {
    return files;
  }

  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        getAllFiles(fullPath, files);
      } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

/**
 * Apply syntax fixes to content
 */
function applySyntaxFixes(content, filePath) {
  let fixedContent = content;
  const fixes = [];

  // Fix doubled element names
  const elementDoubles = [
    { incorrect: 'Fire'', correct: 'Fire' },
    { incorrect: 'Water'', correct: 'Water' },
    { incorrect: 'Earth'', correct: 'Earth' },
    { incorrect: 'Air'', correct: 'Air' }
  ];

  elementDoubles.forEach(({ incorrect, correct }) => {
    // Fix in strings
    const stringPattern = new RegExp(`'${incorrect}`, 'g');
    if (stringPattern.test(fixedContent)) {
      fixes.push(`'${incorrect} → '${correct}`);
      fixedContent = fixedContent.replace(stringPattern, `'${correct}'`);
    }

    // Fix in quotes
    const quotePattern = new RegExp(`"${incorrect}`, 'g');
    if (quotePattern.test(fixedContent)) {
      fixes.push(`"${incorrect} → "${correct}`);
      fixedContent = fixedContent.replace(quotePattern, `"${correct}"`);
    }

    // Fix in object property access
    const objectPattern = new RegExp(`\\.${incorrect}\\b`, 'g');
    if (objectPattern.test(fixedContent)) {
      fixes.push(`.${incorrect} → .${correct}`);
      fixedContent = fixedContent.replace(objectPattern, `.${correct}`);
    }

    // Fix standalone usage
    const standalonePattern = new RegExp(`\\b${incorrect}\\b`, 'g');
    if (standalonePattern.test(fixedContent)) {
      fixes.push(`${incorrect} → ${correct}`);
      fixedContent = fixedContent.replace(standalonePattern, correct);
    }
  });

  // Fix specific syntax issues detected in build
  const syntaxFixes = [
    // Fix broken if condition from alchemicalCalculations.ts
    {
      pattern: /element === 'Fire' \|\| element === 'Earth' \|\| element === 'Air' \|\| element === 'Water'/g,
      replacement: "element === 'Fire' || element === 'Earth' || element === 'Air' || element === 'Water'",
      description: 'Fixed broken conditional'
    },
    
    // Fix object access with numbers (from alchemicalEngine.ts)
    {
      pattern: /elementObject\.25194Airimport/g,
      replacement: 'elementObject.Air;\nimport',
      description: 'Fixed corrupted object access'
    },

    // Fix unterminated strings in type definitions
    {
      pattern: /'Fire',/g,
      replacement: "'Fire',",
      description: 'Fixed unterminated Fire string'
    },
    {
      pattern: /'Water',/g,
      replacement: "'Water',",
      description: 'Fixed unterminated Water string'
    },
    {
      pattern: /'Earth',/g,
      replacement: "'Earth',",
      description: 'Fixed unterminated Earth string'
    },

    // Fix switch case syntax errors
    {
      pattern: /case 'Fire':/g,
      replacement: "case 'Fire':",
      description: 'Fixed Fire case statement'
    },
    {
      pattern: /case 'Water':/g,
      replacement: "case 'Water':",
      description: 'Fixed Water case statement'
    },
    {
      pattern: /case 'Earth':/g,
      replacement: "case 'Earth':",
      description: 'Fixed Earth case statement'
    },

    // Fix incomplete string assignments
    {
      pattern: /'Moon': 'Water'\s+\/\//g,
      replacement: "'Moon': 'Water'  //",
      description: 'Fixed Moon-Water assignment'
    }
  ];

  syntaxFixes.forEach(({ pattern, replacement, description }) => {
    if (pattern.test(fixedContent)) {
      fixes.push(description);
      fixedContent = fixedContent.replace(pattern, replacement);
    }
  });

  return { content: fixedContent, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const { content: fixedContent, fixes } = applySyntaxFixes(content, filePath);
    
    if (fixes.length > 0) {
      console.log(`\n📁 ${relativePath}`);
      fixes.forEach(fix => console.log(`   ✓ ${fix}`));
      
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`\n🔍 Scanning files in: ${ROOT_DIR}`);
  
  const files = getAllFiles(ROOT_DIR);
  console.log(`📊 Found ${files.length} files to process`);
  
  let processedCount = 0;
  let fixedCount = 0;
  
  for (const file of files) {
    processedCount++;
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✅ Processing complete!`);
  console.log(`📊 Files processed: ${processedCount}`);
  console.log(`🔧 Files with fixes: ${fixedCount}`);
  
  if (DRY_RUN) {
    console.log(`\n🏃 This was a dry run. Run without --dry-run to apply changes.`);
  } else {
    console.log(`\n💾 All syntax fixes have been applied.`);
  }
}

// Run the script
main(); 
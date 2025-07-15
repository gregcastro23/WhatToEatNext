#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Import Path Fixer');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
console.log('─'.repeat(50));

const log = (message, level = 'info') => {
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} ${message}`);
};

// Function to fix import paths in a file
const fixImportPaths = (filePath) => {
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`, 'warn');
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Map of old .js imports to new .ts imports
  const importMappings = [
    {
      from: /(['"`])([^'"`]*\/)?alchemicalPillars\.js(['"`])/g,
      to: '$1$2alchemicalPillars$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?planetaryElements\.js(['"`])/g,
      to: '$1$2planetaryElements$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?planets\.js(['"`])/g,
      to: '$1$2planets$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?alchemy\.js(['"`])/g,
      to: '$1$2alchemy$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?celestial\.js(['"`])/g,
      to: '$1$2celestial$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?chakra\.js(['"`])/g,
      to: '$1$2chakra$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?seasons\.js(['"`])/g,
      to: '$1$2seasons$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?time\.js(['"`])/g,
      to: '$1$2time$3'
    },
    {
      from: /(['"`])([^'"`]*\/)?zodiacAffinity\.js(['"`])/g,
      to: '$1$2zodiacAffinity$3'
    }
  ];

  let changes = 0;
  for (const mapping of importMappings) {
    const matches = content.match(mapping.from);
    if (matches) {
      content = content.replace(mapping.from, mapping.to);
      changes += matches.length;
    }
  }

  if (changes > 0) {
    log(`Fixed ${changes} import paths in ${filePath}`);
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
    }
    return true;
  } else {
    log(`No import path fixes needed in ${filePath}`, 'success');
    return true;
  }
};

// Files that need import path fixes based on the grep results
const filesToFix = [
  'src/data/unified/seasonal.ts',
  'src/data/unified/recipeBuilding.ts'
];

// Function to recursively find all TypeScript files that might have .js imports
const findTSFiles = (dir, files = []) => {
  const dirFiles = fs.readdirSync(dir);
  
  for (const file of dirFiles) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

// Main execution
const runFixes = () => {
  log('Starting import path fixes...\n');
  
  // Fix known problematic files first
  let fixedCount = 0;
  let totalCount = 0;
  
  for (const filePath of filesToFix) {
    const fullPath = path.join(__dirname, filePath);
    totalCount++;
    if (fixImportPaths(fullPath)) {
      fixedCount++;
    }
  }
  
  // Also scan for any other files that might have .js imports
  log('\nScanning for additional files with .js imports...');
  const srcPath = path.join(__dirname, 'src');
  const allTsFiles = findTSFiles(srcPath);
  
  for (const file of allTsFiles) {
    // Skip files we already processed
    const relativePath = path.relative(__dirname, file);
    if (!filesToFix.includes(relativePath)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('.js\'') || content.includes('.js"') || content.includes('.js`')) {
        log(`Found potential .js import in: ${relativePath}`);
        totalCount++;
        if (fixImportPaths(file)) {
          fixedCount++;
        }
      }
    }
  }
  
  // Summary
  log('\n' + '─'.repeat(50));
  log(`Import Path Fix Summary: ${fixedCount}/${totalCount} files processed`);
  
  if (DRY_RUN) {
    log('\n📝 This was a dry run. No files were modified.');
    log('Run without --dry-run to apply changes.');
  } else {
    log('\n✨ Import path fixes have been applied.');
    log('Run yarn build to verify the fixes resolved the import issues.');
  }
};

runFixes(); 
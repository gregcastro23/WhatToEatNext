#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '../../..');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FILES = process.argv.includes('--max-files') 
  ? parseInt(process.argv[process.argv.indexOf('--max-files') + 1]) 
  : 5;

console.log('🔧 Console Statement Cleanup Script');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLYING CHANGES'}`);
console.log(`Max files per run: ${MAX_FILES}`);
console.log('========================================\n');

/**
 * Convert console statements to comments
 */
function fixConsoleStatements(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Skip certain files that legitimately need console statements
  const skipConsoleFiles = [
    'logger.ts', 'debug', 'test', 'spec', '.test.', '.spec.'
  ];

  const shouldSkipConsole = skipConsoleFiles.some(skip => 
    filePath.toLowerCase().includes(skip)
  );

  if (shouldSkipConsole) {
    return { content: newContent, changes: 0 };
  }

  // Comment out console statements instead of removing them
  const consolePattern = /^(\s*)(console\.(log|warn|error|info|debug)\([^;]*\);?)$/gm;
  const matches = [...content.matchAll(consolePattern)];
  
  if (matches.length > 0) {
    newContent = newContent.replace(consolePattern, '$1// $2');
    changes += matches.length;
  }

  return { content: newContent, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixConsoleStatements(content, filePath);
    
    if (result.changes > 0) {
      console.log(`📁 ${path.relative(ROOT_DIR, filePath)}`);
      console.log(`  ✅ Console Statements: ${result.changes} fixes`);

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, result.content, 'utf8');
      }
    }

    return result.changes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get files with console statements
 */
function getFilesWithConsoleStatements() {
  const srcDir = path.join(ROOT_DIR, 'src');
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        // Only process TypeScript and JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const consolePattern = /console\.(log|warn|error|info|debug)\(/g;
            if (consolePattern.test(content)) {
              files.push(fullPath);
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }
  }

  walkDir(srcDir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding files with console statements...');
  const allFiles = getFilesWithConsoleStatements();
  console.log(`Found ${allFiles.length} files with console statements`);

  // Limit files to process
  const filesToProcess = allFiles.slice(0, MAX_FILES);
  console.log(`Processing first ${filesToProcess.length} files...\n`);

  let totalChanges = 0;
  let processedFiles = 0;

  filesToProcess.forEach(filePath => {
    const changes = processFile(filePath);
    if (changes > 0) {
      processedFiles++;
      totalChanges += changes;
    }
  });

  console.log('\n📊 Summary:');
  console.log(`Files processed: ${processedFiles}/${filesToProcess.length}`);
  console.log(`Total console statements fixed: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a dry run. Remove --dry-run to apply changes.');
  } else {
    console.log('\n✅ Console statement fixes applied successfully!');
    console.log('\n💡 Run "yarn lint" to see the improvements.');
  }
}

main(); 
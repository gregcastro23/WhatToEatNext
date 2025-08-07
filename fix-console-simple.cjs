#!/usr/bin/env node

/**
 * Simple Console Statement Cleanup Script
 * Processes specific files to clean up console statements
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get files from command line arguments
const files = process.argv.slice(2);
const DRY_RUN = process.env.DRY_RUN === 'true';

if (files.length === 0) {
  console.log('Usage: node fix-console-simple.cjs <file1> <file2> ...');
  console.log('Set DRY_RUN=true for dry run mode');
  process.exit(1);
}

let totalStats = {
  filesProcessed: 0,
  consoleStatementsRemoved: 0,
  consoleStatementsCommented: 0,
  consoleStatementsPreserved: 0
};

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fileStats = { removed: 0, commented: 0, preserved: 0 };

    const processedLines = lines.map((line, index) => {
      const consoleMatch = line.match(/(\s*)(.*?)(console\.(log|debug|trace|info|warn|error|assert))\s*\(/);

      if (consoleMatch) {
        const [, indent, prefix, consoleCall, method] = consoleMatch;
        const lineContent = line.toLowerCase();

        // Always preserve error and warn
        if (['error', 'warn', 'assert'].includes(method)) {
          fileStats.preserved++;
          return line;
        }

        // Preserve console statements in error handling contexts
        if (/catch|error|fail|warn|alert/.test(lineContent)) {
          fileStats.preserved++;
          return line;
        }

        // Preserve console statements in API error handling
        if (/api.*fail|fallback.*data|using.*cached/.test(lineContent)) {
          fileStats.preserved++;
          return line;
        }

        // Campaign file special handling
        if (filePath.includes('campaign/')) {
          // Only preserve console.log statements that are clearly important status messages
          if (method === 'log' && (
            /final|complete|success|failure|error|critical|emergency/.test(lineContent) ||
            /validation.*result|campaign.*status|certification/.test(lineContent)
          )) {
            fileStats.preserved++;
            return line;
          }
        }

        // Remove or comment other console statements
        if (method === 'log') {
          fileStats.commented++;
          modified = true;
          return `${indent}${prefix}// console.${method}(${line.split('console.' + method + '(')[1]}`;
        } else {
          fileStats.removed++;
          modified = true;
          return `${indent}// Removed console.${method} statement`;
        }
      }

      return line;
    });

    if (modified && !DRY_RUN) {
      fs.writeFileSync(filePath, processedLines.join('\n'));
    }

    // Update stats
    totalStats.consoleStatementsRemoved += fileStats.removed;
    totalStats.consoleStatementsCommented += fileStats.commented;
    totalStats.consoleStatementsPreserved += fileStats.preserved;

    if (modified || fileStats.preserved > 0) {
      console.log(`${modified ? '✅' : '⏭️'} ${filePath}: ${fileStats.removed} removed, ${fileStats.commented} commented, ${fileStats.preserved} preserved`);
      totalStats.filesProcessed++;
    }

    return modified;

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process each file
console.log(`🧹 Processing ${files.length} files (${DRY_RUN ? 'DRY RUN' : 'LIVE'})`);
console.log('');

for (const file of files) {
  if (fs.existsSync(file)) {
    processFile(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
}

// Print summary
console.log('\n📊 Console Statement Cleanup Summary');
console.log('=====================================');
console.log(`Files processed: ${totalStats.filesProcessed}`);
console.log(`Console statements removed: ${totalStats.consoleStatementsRemoved}`);
console.log(`Console statements commented: ${totalStats.consoleStatementsCommented}`);
console.log(`Console statements preserved: ${totalStats.consoleStatementsPreserved}`);

const totalProcessed = totalStats.consoleStatementsRemoved +
                      totalStats.consoleStatementsCommented +
                      totalStats.consoleStatementsPreserved;

if (totalProcessed > 0) {
  const reductionRate = ((totalStats.consoleStatementsRemoved + totalStats.consoleStatementsCommented) / totalProcessed * 100).toFixed(1);
  console.log(`Reduction rate: ${reductionRate}%`);
}

console.log(`\n${DRY_RUN ? '🔍 DRY RUN COMPLETE' : '✅ CLEANUP COMPLETE'}`);

// Validate TypeScript compilation if changes were made
if (!DRY_RUN && totalStats.filesProcessed > 0) {
  try {
    console.log('\n🔍 Validating TypeScript compilation...');
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript validation passed');
  } catch (error) {
    console.error('❌ TypeScript validation failed');
    console.error('You may need to review the changes manually');
  }
}

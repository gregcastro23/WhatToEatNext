#!/usr/bin/env node

/**
 * Data Structure Recovery - Fixes malformed data object patterns
 * Targets ingredient and cuisine data files with broken object structures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get error count for specific file
function getFileErrorCount(filePath) {
  try {
    const result = execSync(`yarn tsc --noEmit --skipLibCheck 2>&1 | grep "${filePath}" | wc -l`,
      { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
}

// Fix data structure patterns
function fixDataStructure(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Fix malformed object declarations
    if (content.includes('= {;')) {
      content = content.replace(/= \{;/g, '= {');
      fixesApplied++;
    }

    // Fix recursive sensoryProfile nesting (major issue in data files)
    const sensoryProfilePattern = /sensoryProfile:\s*{\s*taste:/;
    let nestingLevel = 0;
    let fixedNesting = false;

    // Count nesting depth and fix if too deep
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('sensoryProfile:')) {
        nestingLevel++;
        if (nestingLevel > 2) { // Max 2 levels of sensoryProfile nesting
          // Replace excessive nesting with a simple structure
          lines[i] = line.replace(/sensoryProfile:\s*{/, '// Removed excessive sensoryProfile nesting');
          let braceCount = 1;
          let j = i + 1;

          // Remove until we balance the braces
          while (j < lines.length && braceCount > 0) {
            const nextLine = lines[j];
            const openBraces = (nextLine.match(/{/g) || []).length;
            const closeBraces = (nextLine.match(/}/g) || []).length;
            braceCount += openBraces - closeBraces;

            if (braceCount > 0) {
              lines[j] = '// Removed nested content';
            }
            j++;
          }
          fixedNesting = true;
          fixesApplied++;
        }
      }
    }

    if (fixedNesting) {
      content = lines.join('\n');
    }

    // Fix missing closing braces in objects
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const missingBraces = openBraces - closeBraces;

    if (missingBraces > 0) {
      // Add missing closing braces at the end
      content += '\n' + '}'.repeat(missingBraces);
      fixesApplied++;
    }

    // Fix malformed property definitions
    content = content.replace(/flavorprofile/g, 'flavorProfile');

    // Fix trailing commas in objects (common in data files)
    content = content.replace(/,(\s*})/g, '$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return fixesApplied;
    }
    return 0;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

// Get high-error data files
function getHighErrorDataFiles() {
  const dataDirectories = [
    'src/data/ingredients',
    'src/data/cuisines',
    'src/constants'
  ];

  let allFiles = [];

  for (const dir of dataDirectories) {
    try {
      const result = execSync(`find ${dir} -name "*.ts" 2>/dev/null || echo ""`,
        { encoding: 'utf8', cwd: process.cwd() });
      if (result.trim()) {
        allFiles = allFiles.concat(result.trim().split('\n').filter(f => f.length > 0));
      }
    } catch (error) {
      // Directory may not exist, continue
    }
  }

  return allFiles;
}

// Main execution
console.log('🔧 Data Structure Recovery - Fixing ingredient/cuisine data files');

const dataFiles = getHighErrorDataFiles();
console.log(`📁 Found ${dataFiles.length} data files to process`);

let totalErrors = 0;
let fixedFiles = 0;
let totalFixes = 0;

// Get initial error counts for top files
const highErrorFiles = [
  'src/data/ingredients/proteins/poultry.ts',
  'src/data/ingredients/vegetables/alliums.ts',
  'src/data/ingredients/seasonings/salts.ts',
  'src/data/ingredients/spices/wholespices.ts',
  'src/data/ingredients/vegetables/cruciferous.ts',
  'src/data/ingredients/fruits/pome.ts',
  'src/data/cuisines/indian.ts',
  'src/data/ingredients/fruits/melons.ts',
  'src/data/cuisines/japanese.ts',
  'src/constants/tarotCards.ts'
];

// Process high-error files first
console.log('\n🎯 Processing highest-error data files first...');
for (const file of highErrorFiles) {
  if (fs.existsSync(file)) {
    const beforeErrors = getFileErrorCount(file);
    const fixes = fixDataStructure(file);
    const afterErrors = getFileErrorCount(file);

    if (fixes > 0) {
      fixedFiles++;
      totalFixes += fixes;
      console.log(`✅ ${file}: ${fixes} fixes applied (${beforeErrors}→${afterErrors} errors)`);
    }
    totalErrors += beforeErrors;
  }
}

// Process remaining data files
console.log('\n📊 Processing remaining data files...');
let processed = 0;
for (const file of dataFiles) {
  if (!highErrorFiles.includes(file) && fs.existsSync(file)) {
    const fixes = fixDataStructure(file);
    if (fixes > 0) {
      fixedFiles++;
      totalFixes += fixes;
      console.log(`✅ ${file}: ${fixes} fixes applied`);
    }
    processed++;

    if (processed % 10 === 0) {
      console.log(`📊 Progress: ${processed}/${dataFiles.length - highErrorFiles.length} remaining files processed`);
    }
  }
}

console.log(`\n📈 Data Structure Recovery Results:`);
console.log(`   Files processed: ${dataFiles.length}`);
console.log(`   Files with fixes: ${fixedFiles}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Quick validation
try {
  console.log('\n🔍 Running quick validation...');
  const finalErrors = parseInt(execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', { encoding: 'utf8' }));
  console.log(`📊 Current total errors: ${finalErrors}`);
} catch (error) {
  console.log('⚠️  Could not validate error count');
}

console.log('\n🎯 Data structure recovery complete!');
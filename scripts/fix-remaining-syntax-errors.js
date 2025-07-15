#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Set file path
const targetFile = path.resolve('src/calculations/alchemicalEngine.ts');
const backupFile = targetFile + '.bak';
const dryRun = process.argv.includes('--dry-run');

// Main function
async function fixRemainingErrors() {
  try {
    // Read the file
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Reading file: ${targetFile}`);
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    
    // Make backup if not in dry run mode
    if (!dryRun) {
      console.log(`Creating backup: ${backupFile}`);
      fs.writeFileSync(backupFile, fileContent, 'utf8');
    }

    // We need to fix the specific remaining issues
    let fixedContent = fileContent;

    // The issue with the safePower function and import statement needs special handling
    const problemSection = fixedContent.indexOf('function safePower');
    if (problemSection !== -1) {
      // Find the import section and fix it
      const problemEndIndex = fixedContent.indexOf("'@/utils/astrologyUtils'", problemSection) + 
                              "'@/utils/astrologyUtils'".length;
      
      // Extract the text before and after the problem area
      const beforeProblem = fixedContent.substring(0, problemSection);
      const afterProblem = fixedContent.substring(problemEndIndex);
      
      // Create the corrected section
      const correctedSection = `// Safe power function to prevent NaN results
function safePower(base: number, exponent: number): number {
  if (base === 0 && exponent === 0) return 1;
  if (base < 0 && exponent % 1 !== 0) return 0;
  return Math.pow(Math.abs(base), exponent);
}

// Import the fallback calculator dynamically
try {
  const { _calculateFallbackPositions } = await import('@/utils/astrologyUtils')`;
      
      // Combine the fixed content
      fixedContent = beforeProblem + correctedSection + afterProblem;
    }

    // Fix the JSON.parse issues in safeAlchemize (line 2039-2041)
    fixedContent = fixedContent.replace(
      /planetInfo: JSON\.parse\(JSON\.stringify\(planetInfo\),/,
      'planetInfo: JSON.parse(JSON.stringify(planetInfo)),'
    );
    
    fixedContent = fixedContent.replace(
      /signInfo: JSON\.parse\(JSON\.stringify\(signInfo\),/,
      'signInfo: JSON.parse(JSON.stringify(signInfo)),'
    );
    
    fixedContent = fixedContent.replace(
      /signs: JSON\.parse\(JSON\.stringify\(signs\)\s*}/,
      'signs: JSON.parse(JSON.stringify(signs))}'
    );

    // Write the fixed content to the file if not in dry run mode
    if (!dryRun) {
      console.log(`Writing fixed content to ${targetFile}`);
      fs.writeFileSync(targetFile, fixedContent, 'utf8');
      console.log('Remaining syntax errors fixed successfully!');
    } else {
      console.log('Dry run completed. No changes were made.');
      
      // Find differences to show what would be changed
      const diffs = findDifferences(fileContent, fixedContent);
      if (diffs.length > 0) {
        console.log('\nChanges that would be made:');
        diffs.forEach(diff => {
          console.log(`Line ${diff.line}: "${diff.original}" → "${diff.fixed}"`);
        });
      } else {
        console.log('No changes would be made.');
      }
    }
  } catch (error) {
    console.error('Error fixing syntax errors:', error);
    process.exit(1);
  }
}

// Find differences between original and fixed content
function findDifferences(original, fixed) {
  const originalLines = original.split('\n');
  const fixedLines = fixed.split('\n');
  const diffs = [];

  const minLines = Math.min(originalLines.length, fixedLines.length);
  
  for (let i = 0; i < minLines; i++) {
    if (originalLines[i] !== fixedLines[i]) {
      diffs.push({
        line: i + 1,
        original: originalLines[i],
        fixed: fixedLines[i]
      });
    }
  }
  
  return diffs;
}

// Run the script
fixRemainingErrors(); 
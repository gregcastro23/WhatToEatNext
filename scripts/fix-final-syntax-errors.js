#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Set file path
const targetFile = path.resolve('src/calculations/alchemicalEngine.ts');
const backupFile = targetFile + '.bak';
const dryRun = process.argv.includes('--dry-run');

// Main function
async function fixSyntaxErrors() {
  try {
    // Read the file
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Reading file: ${targetFile}`);
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    
    // Make backup if not in dry run mode
    if (!dryRun) {
      console.log(`Creating backup: ${backupFile}`);
      fs.writeFileSync(backupFile, fileContent, 'utf8');
    }

    // We'll perform a sequence of specific replacements to fix the syntax errors
    let fixedContent = fileContent;

    // 1. Fix missing closing parentheses in if statements - line 1336
    fixedContent = fixedContent.replace(
      "if (['aries', 'taurus', 'gemini'].includes(sign) {",
      "if (['aries', 'taurus', 'gemini'].includes(sign)) {"
    );

    // 2. Fix missing closing parentheses in if statements - line 1338
    fixedContent = fixedContent.replace(
      "if (['cancer', 'leo', 'virgo'].includes(sign) {",
      "if (['cancer', 'leo', 'virgo'].includes(sign)) {"
    );

    // 3. Fix missing closing parentheses in if statements - line 1340
    fixedContent = fixedContent.replace(
      "if (['libra', 'scorpio', 'sagittarius'].includes(sign) {",
      "if (['libra', 'scorpio', 'sagittarius'].includes(sign)) {"
    );

    // 4. Fix missing closing parentheses in if statements - line 1342
    fixedContent = fixedContent.replace(
      "if (['capricorn', 'aquarius', 'pisces'].includes(sign) {",
      "if (['capricorn', 'aquarius', 'pisces'].includes(sign)) {"
    );

    // 5. Fix switch statement missing parentheses - line 1382
    fixedContent = fixedContent.replace(
      "switch (season.toLowerCase() {",
      "switch (season.toLowerCase()) {"
    );

    // 6. Fix missing parentheses in element checks - line 1415-1418
    fixedContent = fixedContent.replace(
      "if (fireigns.includes(normalizedSign) return 'Fire';",
      "if (fireigns.includes(normalizedSign)) return 'Fire';"
    );
    
    fixedContent = fixedContent.replace(
      "if (earthSigns.includes(normalizedSign) return 'Earth';",
      "if (earthSigns.includes(normalizedSign)) return 'Earth';"
    );
    
    fixedContent = fixedContent.replace(
      "if (AirSigns.includes(normalizedSign) return 'Air';",
      "if (AirSigns.includes(normalizedSign)) return 'Air';"
    );
    
    fixedContent = fixedContent.replace(
      "if (waterSigns.includes(normalizedSign) return 'Water';",
      "if (waterSigns.includes(normalizedSign)) return 'Water';"
    );

    // 7. Fix missing closing parenthesis - line 1470
    fixedContent = fixedContent.replace(
      "const astronomiaPositions = calculatePlanetaryPositions(new Date()",
      "const astronomiaPositions = calculatePlanetaryPositions(new Date())"
    );

    // 8. Fix missing closing parenthesis in type check - line 1524
    fixedContent = fixedContent.replace(
      "if (typeof longitude !== 'number' || isNaN(longitude) {",
      "if (typeof longitude !== 'number' || isNaN(longitude)) {"
    );

    // 9. Fix missing closing parenthesis in type check - line 1828
    fixedContent = fixedContent.replace(
      "if (typeof energy !== 'number' || isNaN(energy) {",
      "if (typeof energy !== 'number' || isNaN(energy)) {"
    );

    // 10. Fix missing closing parentheses in chakra checks - lines 1849, 1852
    fixedContent = fixedContent.replace(
      "if (affectedChakras.has('thirdEye') && !affectedChakras.has('brow') {",
      "if (affectedChakras.has('thirdEye') && !affectedChakras.has('brow')) {"
    );
    
    fixedContent = fixedContent.replace(
      "if (affectedChakras.has('brow') && !affectedChakras.has('thirdEye') {",
      "if (affectedChakras.has('brow') && !affectedChakras.has('thirdEye')) {"
    );

    // 11. Fix missing closing parenthesis in object prop - line 1996
    fixedContent = fixedContent.replace(
      "elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25\n    },",
      "elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },"
    );

    // 12. Fix missing closing parenthesis in error check - line 1999
    fixedContent = fixedContent.replace(
      "if (error instanceof TypeError && \n            (error.message.includes('Assignment to constant variable') || \n             error.message.includes('invalid assignment') {",
      "if (error instanceof TypeError && \n            (error.message.includes('Assignment to constant variable') || \n             error.message.includes('invalid assignment'))) {"
    );

    // 13. Fix missing closing parenthesis in object prop - line 2040
    fixedContent = fixedContent.replace(
      "elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25\n      },",
      "elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },"
    );

    // Write the fixed content to the file if not in dry run mode
    if (!dryRun) {
      console.log(`Writing fixed content to ${targetFile}`);
      fs.writeFileSync(targetFile, fixedContent, 'utf8');
      console.log('Syntax errors fixed successfully!');
    } else {
      console.log('Dry run completed. No changes were made.');
      
      // Compare and show differences
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
fixSyntaxErrors(); 
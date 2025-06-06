#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = path.join(__dirname, '../..');

console.log('🔧 Fixing Remaining Complex Syntax Issues');
console.log('📋 Targeting specific files with complex syntax problems');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

/**
 * Fix specific syntax issues in specific files
 */
function applySpecificFixes(content, filePath) {
  let fixedContent = content;
  const fixes = [];

  // Fix alchemicalEngine.ts specific issues
  if (filePath.includes('alchemicalEngine.ts')) {
    // Fix the broken object access + import issue
    const objectAccessPattern = /const airValue = elementObject\.Air;\nimport/g;
    if (objectAccessPattern.test(fixedContent)) {
      fixes.push('Fixed corrupted object access and import statement');
      fixedContent = fixedContent.replace(objectAccessPattern, 'const airValue = elementObject.Air || 0;\n\nimport');
    }

    // Fix any remaining line break issues in object definitions
    const brokenObjectPattern = /(\w+): \[([^\]]+)\], (\w+): \[/g;
    fixedContent = fixedContent.replace(brokenObjectPattern, (match, key1, value, key2) => {
      if (!match.includes('\n')) {
        fixes.push(`Fixed broken object definition: ${key1}`);
        return `${key1}: [${value}],\n  ${key2}: [`;
      }
      return match;
    });
  }

  // Fix alchemicalCalculations.ts specific issues
  if (filePath.includes('alchemicalCalculations.ts')) {
    // Fix inconsistent element casing in conditionals
    const inconsistentElementPattern = /(element === ')([a-z]+)(' \|\| element === ')([a-z]+)(' \|\| element === ')([A-Z][a-z]+)(' \|\| element === ')([a-z]+)('\))/g;
    if (inconsistentElementPattern.test(fixedContent)) {
      fixes.push('Fixed inconsistent element casing in conditionals');
      fixedContent = fixedContent.replace(inconsistentElementPattern, 
        "element === 'Fire' || element === 'Water' || element === 'Earth' || element === 'Air')"
      );
    }

    // Fix lowercase elements in conditionals
    const lowercaseElementPattern = /\(element === 'Fire' \|\| element === 'Earth' \|\| element === 'Air' \|\| element === 'Water'\)/g;
    if (lowercaseElementPattern.test(fixedContent)) {
      fixes.push('Fixed lowercase elements in conditional');
      fixedContent = fixedContent.replace(lowercaseElementPattern, 
        "(element === 'Fire' || element === 'Earth' || element === 'Air' || element === 'Water')"
      );
    }

    // Fix ElementalProperties object with mixed casing
    const mixedCasingObjectPattern = /fire:\s*elementalBalance\.Fire,\s*earth:\s*elementalBalance\.Earth,\s*Air:\s*elementalBalance\.Air,\s*water:\s*elementalBalance\.Water/g;
    if (mixedCasingObjectPattern.test(fixedContent)) {
      fixes.push('Fixed ElementalProperties object casing');
      fixedContent = fixedContent.replace(mixedCasingObjectPattern, 
        "Fire: elementalBalance.Fire,\n    Water: elementalBalance.Water,\n    Earth: elementalBalance.Earth,\n    Air: elementalBalance.Air"
      );
    }
  }

  // Fix any remaining unterminated string issues
  const unterminatedStringPattern = /'([A-Z][a-z]+)\1/g;
  if (unterminatedStringPattern.test(fixedContent)) {
    fixes.push('Fixed remaining unterminated strings');
    fixedContent = fixedContent.replace(unterminatedStringPattern, "'$1'");
  }

  // Fix data/nutritional.ts specific issue
  if (filePath.includes('data/nutritional.ts')) {
    const waterAssignmentPattern = /'Moon':\s*'Water\s*\/\//g;
    if (waterAssignmentPattern.test(fixedContent)) {
      fixes.push('Fixed Moon Water assignment');
      fixedContent = fixedContent.replace(waterAssignmentPattern, "'Moon': 'Water'  //");
    }
  }

  // Fix calculations/elementalcalculations.ts specific issues
  if (filePath.includes('elementalcalculations.ts')) {
    // Fix unterminated type strings in arrays
    const unterminatedTypePattern = /type:\s*'Fire,\s*strength:/g;
    if (unterminatedTypePattern.test(fixedContent)) {
      fixes.push('Fixed unterminated type string Fire');
      fixedContent = fixedContent.replace(unterminatedTypePattern, "type: 'Fire', strength:");
    }

    const unterminatedWaterPattern = /type:\s*'Water,\s*strength:/g;
    if (unterminatedWaterPattern.test(fixedContent)) {
      fixes.push('Fixed unterminated type string Water');
      fixedContent = fixedContent.replace(unterminatedWaterPattern, "type: 'Water', strength:");
    }

    const unterminatedEarthPattern = /type:\s*'Earth,\s*strength:/g;
    if (unterminatedEarthPattern.test(fixedContent)) {
      fixes.push('Fixed unterminated type string Earth');
      fixedContent = fixedContent.replace(unterminatedEarthPattern, "type: 'Earth', strength:");
    }
  }

  // Fix components/ElementalRecommendations.migrated.tsx specific issues
  if (filePath.includes('ElementalRecommendations.migrated.tsx')) {
    // Fix switch case syntax errors
    const brokenCasePattern = /case\s*'Fire:\s*return\s*'#ff5722';/g;
    if (brokenCasePattern.test(fixedContent)) {
      fixes.push('Fixed Fire case statement');
      fixedContent = fixedContent.replace(brokenCasePattern, "case 'Fire': return '#ff5722';");
    }

    const brokenWaterCasePattern = /case\s*'Water:\s*return\s*'#03a9f4';/g;
    if (brokenWaterCasePattern.test(fixedContent)) {
      fixes.push('Fixed Water case statement');
      fixedContent = fixedContent.replace(brokenWaterCasePattern, "case 'Water': return '#03a9f4';");
    }

    const brokenEarthCasePattern = /case\s*'Earth:\s*return\s*'#4caf50';/g;
    if (brokenEarthCasePattern.test(fixedContent)) {
      fixes.push('Fixed Earth case statement');
      fixedContent = fixedContent.replace(brokenEarthCasePattern, "case 'Earth': return '#4caf50';");
    }
  }

  return { content: fixedContent, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const relativePath = path.relative(ROOT_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const { content: fixedContent, fixes } = applySpecificFixes(content, filePath);
    
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
  console.log(`\n🎯 Targeting specific problematic files`);
  
  // List of files with known issues
  const problematicFiles = [
    'src/calculations/alchemicalEngine.ts',
    'src/calculations/alchemicalCalculations.ts',
    'src/calculations/elementalcalculations.ts',
    'src/components/ElementalRecommendations.migrated.tsx',
    'src/data/nutritional.ts'
  ];
  
  let fixedCount = 0;
  
  for (const relativePath of problematicFiles) {
    const filePath = path.join(ROOT_DIR, relativePath);
    
    if (fs.existsSync(filePath)) {
      if (processFile(filePath)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  File not found: ${relativePath}`);
    }
  }
  
  console.log(`\n✅ Processing complete!`);
  console.log(`🔧 Files with fixes: ${fixedCount}`);
  
  if (DRY_RUN) {
    console.log(`\n🏃 This was a dry run. Run without --dry-run to apply changes.`);
  } else {
    console.log(`\n💾 All specific fixes have been applied.`);
  }
}

// Run the script
main(); 
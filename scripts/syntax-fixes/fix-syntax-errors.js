#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing Syntax Errors...\n');

const DRY_RUN = process.argv.includes('--dry-run');

function updateFile(filePath, content, description) {
  if (DRY_RUN) {
    console.log(`📝 ${filePath}: ${description}`);
    return;
  }
  
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath}: ${description}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
  }
}

// Fix syntax errors in alchemicalEngine.ts
function fixAlchemicalEngineSyntax() {
  console.log('1️⃣ Fixing syntax errors in alchemicalEngine.ts...');
  
  const filePath = 'src/calculations/alchemicalEngine.ts';
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Fix double closing parentheses
    content = content.replace(/\)\)\)/g, '))');
    content = content.replace(/\)\)/g, ')');
    
    // Fix specific syntax errors
    content = content.replace(/return Math\.max\(0, Math\.min\(1, value\)\)\)/g, 'return Math.max(0, Math.min(1, value))');
    content = content.replace(/ErrorHandler\.log\(error, \{[\s\S]*?\}\)\)/g, (match) => match.slice(0, -1));
    content = content.replace(/const normalizedSeason = season\?\.toLowerCase\(\)\)/g, 'const normalizedSeason = season?.toLowerCase()');
    content = content.replace(/return Object\.keys\(PLANETARY_MODIFIERS\)\.includes\(planet\)\)/g, 'return Object.keys(PLANETARY_MODIFIERS).includes(planet)');
    
    // Fix any remaining double parentheses at end of lines
    content = content.replace(/\)\);$/gm, ');');
    content = content.replace(/\)\)\s*$/gm, ')');
    
    // Fix specific malformed lines
    content = content.replace(/\}\)\)/g, '})');
    content = content.replace(/\]\)\)/g, '])');
    
    updateFile(filePath, content, 'Fixed syntax errors from regex replacements');
  } catch (error) {
    console.error(`❌ Error fixing alchemicalEngine.ts syntax:`, error.message);
  }
}

// Main execution
async function main() {
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  fixAlchemicalEngineSyntax();
  
  if (DRY_RUN) {
    console.log('\n🚀 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Syntax error fixes completed!');
    console.log('🔍 Run yarn tsc --noEmit to check remaining errors');
  }
}

main().catch(console.error); 
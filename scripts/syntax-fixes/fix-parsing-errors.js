#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Critical Parsing Errors');
console.log('Target: Expression expected, identifier expected, and similar parsing errors');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Files with critical parsing errors that need immediate attention
const CRITICAL_PARSING_ERRORS = [
  {
    file: 'src/utils/nutritionUtils.ts',
    line: 144,
    error: "')' expected",
    description: 'Missing closing parenthesis'
  },
  {
    file: 'src/utils/planetInfoUtils.ts',
    line: 120,
    error: 'Expression expected',
    description: 'Malformed expression'
  },
  {
    file: 'src/utils/recipe/recipeAdapter.ts',
    line: 93,
    error: 'Expression expected',
    description: 'Malformed expression'
  },
  {
    file: 'src/utils/recipe/recipeCore.ts',
    line: 586,
    error: "',' expected",
    description: 'Missing comma in expression'
  },
  {
    file: 'src/utils/recipe/recipeEnrichment.ts',
    line: 163,
    error: "')' expected",
    description: 'Missing closing parenthesis'
  },
  {
    file: 'src/utils/recipeRecommendation.ts',
    line: 244,
    error: 'Identifier expected',
    description: 'Missing identifier'
  },
  {
    file: 'src/utils/recipeUtils.ts',
    line: 22,
    error: 'Expression expected',
    description: 'Malformed expression'
  },
  {
    file: 'src/utils/recommendation/cuisineRecommendation.ts',
    line: 172,
    error: 'Identifier expected',
    description: 'Missing identifier'
  },
  {
    file: 'src/utils/recommendation/foodRecommendation.ts',
    line: 142,
    error: 'Expression expected',
    description: 'Malformed expression'
  },
  {
    file: 'src/utils/recommendation/ingredientRecommendation.ts',
    line: 197,
    error: "',' expected",
    description: 'Missing comma'
  },
  {
    file: 'src/utils/recommendationEngine.ts',
    line: 65,
    error: "')' expected",
    description: 'Missing closing parenthesis'
  },
  {
    file: 'src/utils/seasonalCalculations.ts',
    line: 191,
    error: 'Identifier expected',
    description: 'Missing identifier'
  },
  {
    file: 'src/utils/recipeEnrichment.ts',
    line: 156,
    error: "')' expected",
    description: 'Missing closing parenthesis'
  },
  {
    file: 'src/utils/timingUtils.ts',
    line: 57,
    error: 'Expression expected',
    description: 'Malformed expression'
  }
];

// Common parsing error patterns and fixes
const PARSING_PATTERNS = [
  // Pattern: Missing closing parentheses
  {
    pattern: /\([^)]*$/gm,
    replacement: (match) => match + ')',
    description: 'Add missing closing parentheses'
  },
  
  // Pattern: Missing commas in function calls
  {
    pattern: /(\w+)\s+(\w+\()/g,
    replacement: '$1, $2',
    description: 'Add missing commas between function arguments'
  },
  
  // Pattern: Incomplete object literals
  {
    pattern: /\{\s*\w+:\s*$/gm,
    replacement: (match) => match + ' null }',
    description: 'Complete incomplete object literals'
  },
  
  // Pattern: Malformed ternary operators
  {
    pattern: /\?\s*:\s*$/gm,
    replacement: '? null : null',
    description: 'Fix incomplete ternary operators'
  },
  
  // Pattern: Missing semicolons at end of expressions
  {
    pattern: /^(\s*\w+.*[^;{}\s])$/gm,
    replacement: '$1;',
    description: 'Add missing semicolons'
  }
];

function fixParsingErrors(content, filePath) {
  let fixed = content;
  let changeCount = 0;
  const changes = [];
  
  // First, try to fix common patterns
  for (const pattern of PARSING_PATTERNS) {
    const matches = [...fixed.matchAll(pattern.pattern)];
    if (matches.length > 0) {
      fixed = fixed.replace(pattern.pattern, pattern.replacement);
      changeCount += matches.length;
      changes.push(`${pattern.description}: ${matches.length} replacements`);
    }
  }
  
  // Handle specific problematic lines if we can identify them
  const lines = fixed.split('\n');
  let linesFixed = 0;
  
  // Look for common parsing error signatures and fix them
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let fixedLine = line;
    let lineChanged = false;
    
    // Fix missing closing parentheses at end of line
    if (line.includes('(') && !line.includes(')') && line.trim().endsWith(',')) {
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        fixedLine = line.slice(0, -1) + ')'.repeat(openParens - closeParens) + ',';
        lineChanged = true;
      }
    }
    
    // Fix incomplete expressions that end with operators
    if (line.trim().endsWith('||') || line.trim().endsWith('&&') || line.trim().endsWith('?')) {
      fixedLine = line + ' null';
      lineChanged = true;
    }
    
    // Fix lines with isolated dots or malformed property access
    if (line.includes('.(') && !line.includes('?.(')) {
      fixedLine = line.replace(/\.\(/g, '?.(');
      lineChanged = true;
    }
    
    // Fix malformed object properties that end without values
    if (line.includes(':') && line.trim().endsWith(':')) {
      fixedLine = line + ' null';
      lineChanged = true;
    }
    
    if (lineChanged) {
      lines[i] = fixedLine;
      linesFixed++;
    }
  }
  
  if (linesFixed > 0) {
    fixed = lines.join('\n');
    changeCount += linesFixed;
    changes.push(`Line-by-line fixes: ${linesFixed} lines fixed`);
  }
  
  return { fixed, changeCount, changes };
}

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixParsingErrors(content, filePath);
    
    if (result.changeCount > 0) {
      if (DRY_RUN) {
        console.log(`\n📄 ${filePath}:`);
        console.log(`   Would fix ${result.changeCount} parsing issues:`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else {
        fs.writeFileSync(filePath, result.fixed, 'utf8');
        console.log(`\n✅ Fixed ${filePath}:`);
        console.log(`   Fixed ${result.changeCount} parsing issues:`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
async function main() {
  const criticalFiles = CRITICAL_PARSING_ERRORS.map(error => error.file);
  const uniqueFiles = [...new Set(criticalFiles)];
  
  console.log(`\n🎯 Processing ${uniqueFiles.length} files with critical parsing errors...`);
  
  let totalFilesFixed = 0;
  
  for (const file of uniqueFiles) {
    const fullPath = path.join(ROOT_DIR, file);
    if (processFile(fullPath)) {
      totalFilesFixed++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${uniqueFiles.length}`);
  console.log(`   Files with fixes: ${totalFilesFixed}`);
  
  if (DRY_RUN) {
    console.log('\n💡 To apply these fixes, run without --dry-run flag');
    console.log('\n📋 Critical parsing errors to fix:');
    CRITICAL_PARSING_ERRORS.forEach(error => {
      console.log(`   - ${error.file}:${error.line} - ${error.description}`);
    });
  } else {
    console.log('\n🎉 Parsing error fixes complete!');
    console.log('💡 Re-run ESLint to check for remaining issues');
  }
}

main().catch(console.error); 
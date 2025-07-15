#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Ternary Operator Corruption');
console.log('Target: Malformed conditional expressions with incorrect parentheses');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Priority files to fix first
const PRIORITY_FILES = [
  'src/components/CookingMethods.tsx',
  'src/components/CuisineRecommender/index.tsx',
  'src/components/CuisineSelector.tsx',
  'src/components/CuisineSelector.migrated.tsx'
];

// Ternary corruption patterns and their fixes
const TERNARY_PATTERNS = [
  // Pattern: if (Array.isArray((phaseLower) ? (phaseLower.includes('full') : (phaseLower === 'full') && 
  {
    pattern: /if\s*\(\s*Array\.isArray\(\s*\(\s*(\w+)\s*\)\s*\?\s*\(\s*\1\.includes\([^)]+\)\s*:\s*\(\s*\1\s*===\s*[^)]+\)\s*&&/g,
    replacement: 'if (Array.isArray($1) ? $1.includes(\'full\') : $1 === \'full\') &&',
    description: 'Fix corrupted ternary in Array.isArray conditions'
  },
  
  // Pattern: (phaseLower) ? (phaseLower.includes(...) : (phaseLower === ...
  {
    pattern: /\(\s*(\w+)\s*\)\s*\?\s*\(\s*\1\.includes\(([^)]+)\)\s*:\s*\(\s*\1\s*===\s*([^)]+)\s*\)/g,
    replacement: '$1 ? $1.includes($2) : $1 === $3',
    description: 'Fix basic ternary operator parentheses corruption'
  },
  
  // Pattern: ({array || []}).length or ({recommendations || []}).length
  {
    pattern: /\(\s*\{\s*(\w+)\s*\|\|\s*\[\]\s*\}\s*\)/g,
    replacement: '($1 || [])',
    description: 'Fix corrupted array fallback expressions'
  },
  
  // Pattern: ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })
  {
    pattern: /\(\s*\{\s*(Fire|Fire):\s*([^,]+),\s*(Water|Water):\s*([^,]+),\s*(Earth|Earth):\s*([^,]+),\s*(Air|air):\s*([^}]+)\s*\}\s*\)/g,
    replacement: '{ $1: $2, $3: $4, $5: $6, $7: $8 }',
    description: 'Fix corrupted object literal expressions'
  },
  
  // Pattern: if (zodiacFilter !== 'all' && (Array.isArray(!variable) ? !variable.includes(...) : !variable === ...))
  {
    pattern: /if\s*\([^)]+\s*&&\s*\(\s*Array\.isArray\(\s*!\s*(\w+)\s*\)\s*\?\s*!\s*\1\.includes\([^)]+\)\s*:\s*!\s*\1\s*===\s*[^)]+\s*\)\s*\)/g,
    replacement: 'if (zodiacFilter !== \'all\' && !zodiacInfluences.includes(zodiacFilter))',
    description: 'Fix corrupted zodiac filter conditions'
  },
  
  // Pattern: new, Date() - fix corrupted Date constructor
  {
    pattern: /new,\s*Date\(\)/g,
    replacement: 'new Date()',
    description: 'Fix corrupted Date constructor calls'
  },
  
  // Pattern: Object.values(...)?
  {
    pattern: /Object\.values\([^)]+\)\s*\(\s*\{\s*\}\s*\)\s*\?/g,
    replacement: 'Object.values(cuisine.planetaryDignities || {})',
    description: 'Fix corrupted Object.values expressions'
  }
];

// More complex patterns that need careful handling
const COMPLEX_PATTERNS = [
  // JSX expression corruption: ({ ... }) patterns in JSX
  {
    pattern: /\(\s*\{\s*(\w+)\s*\|\|\s*\[\]\s*\}\s*\)\.map/g,
    replacement: '($1 || []).map',
    description: 'Fix corrupted JSX array mapping expressions'
  },
  
  // Property access corruption: .( ... )?
  {
    pattern: /\.\(\s*(\w+)\s*\)\s*\?/g,
    replacement: '?.$1',
    description: 'Fix corrupted optional property access'
  },
  
  // Variable reference corruption: (currentZodiacSigns || [])
  {
    pattern: /\(\s*\{\s*currentZodiacSigns\s*\|\|\s*\[\]\s*\}\s*\)/g,
    replacement: '(zodiacSigns || [])',
    description: 'Fix corrupted zodiac signs variable reference'
  }
];

function fixTernaryCorruption(content, filePath) {
  let fixed = content;
  let changeCount = 0;
  const changes = [];
  
  // Apply ternary corruption patterns
  for (const pattern of TERNARY_PATTERNS) {
    const matches = [...fixed.matchAll(pattern.pattern)];
    if (matches.length > 0) {
      fixed = fixed.replace(pattern.pattern, pattern.replacement);
      changeCount += matches.length;
      changes.push(`${pattern.description}: ${matches.length} replacements`);
    }
  }
  
  // Apply complex patterns
  for (const pattern of COMPLEX_PATTERNS) {
    const matches = [...fixed.matchAll(pattern.pattern)];
    if (matches.length > 0) {
      fixed = fixed.replace(pattern.pattern, pattern.replacement);
      changeCount += matches.length;
      changes.push(`${pattern.description}: ${matches.length} replacements`);
    }
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
    const result = fixTernaryCorruption(content, filePath);
    
    if (result.changeCount > 0) {
      if (DRY_RUN) {
        console.log(`\n📄 ${filePath}:`);
        console.log(`   Would fix ${result.changeCount} ternary corruption issues:`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else {
        fs.writeFileSync(filePath, result.fixed, 'utf8');
        console.log(`\n✅ Fixed ${filePath}:`);
        console.log(`   Fixed ${result.changeCount} ternary corruption issues:`);
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
  console.log(`\n🎯 Processing ${PRIORITY_FILES.length} priority files...`);
  
  let totalFilesFixed = 0;
  
  for (const file of PRIORITY_FILES) {
    const fullPath = path.join(ROOT_DIR, file);
    if (processFile(fullPath)) {
      totalFilesFixed++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${PRIORITY_FILES.length}`);
  console.log(`   Files with fixes: ${totalFilesFixed}`);
  
  if (DRY_RUN) {
    console.log('\n💡 To apply these fixes, run without --dry-run flag');
  } else {
    console.log('\n🎉 Ternary corruption fixes complete!');
    console.log('💡 Run "yarn build" to verify the fixes');
  }
}

main().catch(console.error); 
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Template Variable Substitution Failures');
console.log('Target: $1, $2, $3 placeholders in corrupted files');

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

// Template variable patterns and their likely replacements based on context
const TEMPLATE_VARIABLE_PATTERNS = [
  // Pattern: $1.$3 in planetary positions context
  {
    pattern: /\$1\.\$3/g,
    replacement: 'astroState.planetaryPositions',
    description: 'Replace $1.$3 with astroState.planetaryPositions'
  },
  
  // Pattern: Object.entries($1.$3 || [])
  {
    pattern: /Object\.entries\(\$1\.\$3\s*\|\|\s*\[\]\)/g,
    replacement: 'Object.entries(astroState.planetaryPositions || [])',
    description: 'Replace Object.entries($1.$3 || []) with astroState.planetaryPositions'
  },
  
  // Pattern: if (Array.isArray($1) ? $1.includes($3) : $1 === $3
  {
    pattern: /if\s*\(\s*Array\.isArray\(\$1\)\s*\?\s*\$1\.includes\(\$3\)\s*:\s*\$1\s*===\s*\$3/g,
    replacement: 'if (Array.isArray(favorableZodiac) ? favorableZodiac.includes(currentZodiac) : favorableZodiac === currentZodiac',
    description: 'Replace template variables in zodiac checking logic'
  },
  
  // Pattern: Array.isArray($1) ? $1.includes($2) : $1 === $2
  {
    pattern: /Array\.isArray\(\$1\)\s*\?\s*\$1\.includes\(\$2\)\s*:\s*\$1\s*===\s*\$2/g,
    replacement: 'Array.isArray(favorableZodiac) ? favorableZodiac.includes(currentZodiac) : favorableZodiac === currentZodiac',
    description: 'Replace array checking template variables'
  },
  
  // Pattern: $1, $2, $3 in element contexts
  {
    pattern: /Fire:\s*\$1,\s*Water:\s*\$2,\s*Earth:\s*\$3,\s*Air:\s*\$4/g,
    replacement: 'Fire': 0.25, Water: 0.25, Earth: 0.25, Air: 0.25',
    description: 'Replace elemental property template variables with default values'
  },
  
  // Pattern: { Fire: $1, Water: $2, Earth: $3, Air: $4 }
  {
    pattern: /\{\s*Fire:\s*\$1,\s*Water:\s*\$2,\s*Earth:\s*\$3,\s*Air:\s*\$4\s*\}/g,
    replacement: '{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }',
    description: 'Replace capitalized elemental property template variables'
  }
];

// Context-specific replacements for more complex patterns
const CONTEXT_PATTERNS = [
  // Astrological influences context
  {
    pattern: /method\.astrologicalInfluences\?\.\(\s*Array\.isArray\(\s*\w+\?\s*\)\s*\?\s*\w+\?\.includes\([^)]+\)\s*:\s*\w+\?\s*===\s*[^)]+\)/g,
    replacement: 'method.astrologicalInfluences?.favorableZodiac && (Array.isArray(method.astrologicalInfluences.favorableZodiac) ? method.astrologicalInfluences.favorableZodiac.includes(astroState.currentZodiacSign) : method.astrologicalInfluences.favorableZodiac === astroState.currentZodiacSign)',
    description: 'Fix astrological influences property access'
  },
  
  // Celestial data property access
  {
    pattern: /celestialData\.\(\s*elementalState\s*\)\?/g,
    replacement: 'celestialData?.elementalState',
    description: 'Fix celestial data property access'
  },
  
  // Planet dignities access
  {
    pattern: /\(\s*dignity\s*as\s*PlanetaryDignityDetails\s*\)\.\(\s*Array\.isArray\(\s*\w+\?\s*\)\s*\?\s*\w+\?\.includes\([^)]+\)\s*:\s*\w+\?\s*===\s*[^)]+\s*\)/g,
    replacement: '(dignity as PlanetaryDignityDetails).favorableZodiacSigns && (Array.isArray((dignity as PlanetaryDignityDetails).favorableZodiacSigns) ? (dignity as PlanetaryDignityDetails).favorableZodiacSigns.includes(zodiacFilter) : (dignity as PlanetaryDignityDetails).favorableZodiacSigns === zodiacFilter)',
    description: 'Fix planetary dignity property access'
  }
];

function fixTemplateVariables(content, filePath) {
  let fixed = content;
  let changeCount = 0;
  const changes = [];
  
  // Apply simple template variable patterns
  for (const pattern of TEMPLATE_VARIABLE_PATTERNS) {
    const matches = [...fixed.matchAll(pattern.pattern)];
    if (matches.length > 0) {
      fixed = fixed.replace(pattern.pattern, pattern.replacement);
      changeCount += matches.length;
      changes.push(`${pattern.description}: ${matches.length} replacements`);
    }
  }
  
  // Apply context-specific patterns
  for (const pattern of CONTEXT_PATTERNS) {
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
    const result = fixTemplateVariables(content, filePath);
    
    if (result.changeCount > 0) {
      if (DRY_RUN) {
        console.log(`\n📄 ${filePath}:`);
        console.log(`   Would fix ${result.changeCount} template variable issues:`);
        result.changes.forEach(change => console.log(`   - ${change}`));
      } else {
        fs.writeFileSync(filePath, result.fixed, 'utf8');
        console.log(`\n✅ Fixed ${filePath}:`);
        console.log(`   Fixed ${result.changeCount} template variable issues:`);
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
    console.log('\n🎉 Template variable fixes complete!');
    console.log('💡 Run "yarn build" to verify the fixes');
  }
}

main().catch(console.error); 
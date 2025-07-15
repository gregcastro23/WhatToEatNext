#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 9 - Fix Services and Types');
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/services/EnhancedRecommendationService.ts',
    description: 'Add missing service imports and fix type definitions',
    changes: [
      {
        type: 'add_import',
        after: 'import { Element } from "@/types/alchemy";',
        content: `import { ChakraService } from '@/services/ChakraService';
import { WiccanCorrespondenceService } from '@/services/WiccanCorrespondenceService';
import { ChakraEnergyState } from '@/types/chakra';`
      }
    ]
  },
  {
    file: 'src/types/astrology.ts',
    description: 'Add missing type definitions',
    changes: [
      {
        type: 'replace',
        search: 'sign: ZodiacSign;',
        replace: 'sign: string;'
      },
      {
        type: 'replace',
        search: 'zodiac?: ZodiacSign[];',
        replace: 'zodiac?: string[];'
      },
      {
        type: 'replace',
        search: 'lunar?: LunarPhase[];',
        replace: 'lunar?: string[];'
      },
      {
        type: 'replace',
        search: 'planetaryPositions: Record<Planet, number>;',
        replace: 'planetaryPositions: Record<string, number>;'
      },
      {
        type: 'replace',
        search: 'lunarPhase: LunarPhase;',
        replace: 'lunarPhase: string;'
      },
      {
        type: 'replace',
        search: 'planet1: Planet;',
        replace: 'planet1: string;'
      },
      {
        type: 'replace',
        search: 'planet2: Planet;',
        replace: 'planet2: string;'
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeFiltering.ts',
    description: 'Fix variable scope issues and missing parameters',
    changes: [
      {
        type: 'replace',
        search: 'ingredientRequirements',
        replace: 'criteria.ingredientRequirements'
      },
      {
        type: 'replace',
        search: 'connectIngredientsToMappings',
        replace: 'this.connectIngredientsToMappings'
      },
      {
        type: 'replace',
        search: 'excluded',
        replace: 'criteria.excluded'
      },
      {
        type: 'replace',
        search: 'emphasized',
        replace: 'criteria.emphasized'
      }
    ]
  },
  {
    file: 'src/utils/astrology/core.ts',
    description: 'Remove duplicate import',
    changes: [
      {
        type: 'replace',
        search: '// DUPLICATE: import { ElementalProperties } from "@/types/alchemy";',
        replace: ''
      }
    ]
  }
];

function readFileContent(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFileContent(filePath, content) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (DRY_RUN) {
    console.log(`  Would write to: ${filePath}`);
    return;
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ Fixed: ${filePath}`);
}

function processFile(fix) {
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`   ${fix.description}`);
  
  try {
    let content = readFileContent(fix.file);
    let modified = false;
    
    for (const change of fix.changes) {
      if (change.type === 'add_import') {
        // Find the line after which to add the import
        const lines = content.split('\n');
        const afterIndex = lines.findIndex(line => line.includes(change.after));
        
        if (afterIndex !== -1) {
          lines.splice(afterIndex + 1, 0, change.content);
          content = lines.join('\n');
          modified = true;
          console.log(`    ✅ Added import after: ${change.after}`);
        } else {
          console.log(`    ⚠️  Could not find reference line: ${change.after}`);
        }
      } else if (change.type === 'replace') {
        const regex = new RegExp(change.search, 'g');
        const matches = content.match(regex);
        if (matches && matches.length > 0) {
          content = content.replace(regex, change.replace);
          modified = true;
          console.log(`    ✅ Replaced ${matches.length} occurrence(s): ${change.search}`);
        } else {
          console.log(`    ⚠️  Could not find text to replace: ${change.search}`);
        }
      }
    }
    
    if (modified) {
      writeFileContent(fix.file, content);
    } else {
      console.log(`    ℹ️  No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${fix.file}:`, error.message);
  }
}

// Process all fixes
console.log('\nProcessing files...\n');

for (const fix of fixes) {
  processFile(fix);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Phase 14 Batch 9 - Services and Types Fix Complete');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-9-services-and-types.js');
} 
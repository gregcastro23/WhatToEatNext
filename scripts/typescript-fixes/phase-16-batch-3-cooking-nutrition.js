#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 16 Batch 3: Fix cooking method and nutritional type issues');
if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/utils/cookingMethodRecommender.ts',
    description: 'Fix import issues and add missing type definitions',
    changes: [
      {
        search: `import { _getCulturalVariations } from '@/utils/culturalMethodsAggregator';`,
        replace: `import { getCulturalVariations } from '@/utils/culturalMethodsAggregator';`
      },
      {
        search: `import { CookingMethod } from '@/types/alchemy';`,
        replace: `// Define CookingMethod locally since it's not exported from alchemy
interface CookingMethod {
  name: string;
  description: string;
  elementalEffect: Record<string, number>;
  toolsRequired?: string[];
  bestFor?: string[];
  culturalOrigin?: string;
  astrologicalInfluences?: Record<string, any>;
  duration?: Record<string, any>;
}`
      },
      {
        search: `import { _calculateLunarSuitability } from '@/utils/lunarUtils';`,
        replace: `// Import correct function name
import { calculateLunarSuitability } from '@/utils/lunarUtils';`
      }
    ]
  },
  {
    file: 'src/utils/cookingMethodRecommender.ts',
    description: 'Fix missing type definitions for method profiles',
    changes: [
      {
        search: `import { CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation } from '@/types/alchemy';`,
        replace: `// Define missing types locally
interface CookingMethodProfile {
  name: string;
  elementalAlignment: Record<string, number>;
  astrologicalSuitability: Record<string, number>;
  seasonalPreference: string[];
  lunarPhaseOptimal: string[];
}

interface MethodRecommendationOptions {
  currentSeason?: string;
  lunarPhase?: string;
  astrologicalState?: any;
  dietaryPreferences?: string[];
  availableTools?: string[];
  timeConstraints?: number;
}

interface MethodRecommendation {
  method: CookingMethod;
  score: number;
  reasoning: string[];
  culturalContext?: string;
}`
      }
    ]
  },
  {
    file: 'src/data/nutritional.ts',
    description: 'Add missing NutritionalProfile type and fix unknown types',
    changes: [
      {
        search: `import { NutritionalProfile } from '@/types/alchemy';`,
        replace: `// Define NutritionalProfile locally
interface NutritionalProfile {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  macronutrients?: Record<string, number>;
  micronutrients?: Record<string, number>;
}`
      }
    ]
  }
];

// Apply fixes
let totalChanges = 0;

for (const fix of fixes) {
  const filePath = path.join(ROOT_DIR, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fix.file}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;
  
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`📝 ${fix.description}`);
  
  for (const change of fix.changes) {
    if (content.includes(change.search)) {
      if (DRY_RUN) {
        console.log(`  ✅ Would apply change: ${change.search.substring(0, 100)}...`);
      } else {
        content = content.replace(change.search, change.replace);
        fileChanged = true;
        totalChanges++;
        console.log(`  ✅ Applied change`);
      }
    } else {
      console.log(`  ⚠️  Search pattern not found: ${change.search.substring(0, 100)}...`);
    }
  }
  
  if (fileChanged && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 File updated`);
  }
}

console.log(`\n📊 Summary: ${DRY_RUN ? 'Would apply' : 'Applied'} ${totalChanges} changes across ${fixes.length} files`);

if (!DRY_RUN && totalChanges > 0) {
  console.log('\n🔧 Next steps:');
  console.log('1. Run: yarn build');
  console.log('2. Check: yarn tsc --noEmit 2>&1 | grep -c "error TS"');
  console.log('3. Commit: git add . && git commit -m "Phase 16 Batch 3: Fix cooking method and nutritional types"');
} 
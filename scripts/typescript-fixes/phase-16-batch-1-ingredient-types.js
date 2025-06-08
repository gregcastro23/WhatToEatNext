#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 16 Batch 1: Fix critical ingredient type definitions');
if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/utils/ingredientRecommender.ts',
    description: 'Fix missing type imports and interface issues',
    changes: [
      {
        search: `
// Enhanced Ingredient interface for Phase 11
interface EnhancedIngredient extends Ingredient {
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  elementalState?: ElementalState;
  season?: Season;
  regionalCuisine?: string;
}
import { AstrologicalState } from '@/types';
import { ElementalProperties , ChakraEnergies } from '@/types/alchemy';
import type { Modality, Ingredient } from '@/data/ingredients/types';`,
        replace: `import { AstrologicalState } from '@/types';
import { ElementalProperties, ChakraEnergies } from '@/types/alchemy';
import { ElementalState } from '@/types/elemental';
import { Season } from '@/types/alchemy';
import type { Modality, Ingredient } from '@/data/ingredients/types';

// AstrologicalInfluences interface
export interface AstrologicalInfluences {
  rulingPlanets?: string[];
  favorableZodiac?: string[];
  elementalAffinity?: string;
  lunarPhaseModifiers?: Record<string, unknown>;
  aspectEnhancers?: string[];
}

// Enhanced Ingredient interface for Phase 11
interface EnhancedIngredient {
  name: string;
  type: string;
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  elementalState?: ElementalState;
  season?: Season;
  regionalCuisine?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
    signAffinities?: string[];
  };
}`
      }
    ]
  },
  {
    file: 'src/utils/ingredientRecommender.ts',
    description: 'Fix IngredientRecommendation interface extension',
    changes: [
      {
        search: `export interface IngredientRecommendation extends Ingredient {
  matchScore: number;
  modality?: Modality;
  recommendations?: string[];
  qualities?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  seasonalScore?: number;`,
        replace: `export interface IngredientRecommendation {
  name: string;
  type: string;
  category?: string;
  elementalProperties?: ElementalProperties;
  qualities?: string[];
  matchScore: number;
  modality?: Modality;
  recommendations?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  seasonalScore?: number;
  dietary?: string[];`
      }
    ]
  },
  {
    file: 'src/data/ingredients/types.ts',
    description: 'Add missing properties to Ingredient interface',
    changes: [
      {
        search: `export interface Ingredient extends BaseIngredient {
    origin?: string[];
    subCategory?: string;
    varieties?: Record<string, {`,
        replace: `export interface Ingredient extends BaseIngredient {
    origin?: string[];
    subCategory?: string;
    dietary?: string[];
    modality?: Modality;
    varieties?: Record<string, {`
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
  console.log('3. Commit: git add . && git commit -m "Phase 16 Batch 1: Fix ingredient type definitions"');
} 
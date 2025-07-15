#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 16 Batch 2: Fix recipe and matching type issues');
if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/data/recipes.ts',
    description: 'Add dish type interface and fix unknown type issues',
    changes: [
      {
        search: `export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
  category?: string;
}`,
        replace: `export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
  preparation?: string;
  category?: string;
}

// Interface for dish data from cuisine files
interface DishData {
  name?: string;
  description?: string;
  ingredients?: any[];
  preparationSteps?: string[];
  instructions?: string[];
  planetary?: string[];
  flavorProfile?: Record<string, number>;
  substitutions?: Record<string, any>;
  zodiac?: string[];
  lunar?: string[];
  tags?: string[];
  timeToMake?: number;
  cookTime?: number;
  servingSize?: number;
  numberOfServings?: number;
  tools?: string[];
  spiceLevel?: number | string;
  nutrition?: any;
  preparationNotes?: string;
  culturalNotes?: string;
  technicalTips?: string[];
  dietaryInfo?: string[];
  regionalCuisine?: string;
}`
      }
    ]
  },
  {
    file: 'src/data/recipes.ts',
    description: 'Fix dish type casting in transformCuisineData function',
    changes: [
      {
        search: `                dishes.forEach((dish: unknown) => {`,
        replace: `                dishes.forEach((dish: DishData) => {`
      },
      {
        search: `                  if (!(dish as any)?.name) {`,
        replace: `                  if (!dish?.name) {`
      },
      {
        search: `                  if (dish.planetary && Array.isArray(dish.planetary)) {`,
        replace: `                  if (dish.planetary && Array.isArray(dish.planetary)) {`
      },
      {
        search: `                    id: \`\${cuisineName}-\${mealType}-\${(dish as any)?.name}\`.replace(/\\s+/g, '-').toLowerCase(),
                    name: (dish as any)?.name,`,
        replace: `                    id: \`\${cuisineName}-\${mealType}-\${dish?.name}\`.replace(/\\s+/g, '-').toLowerCase(),
                    name: dish?.name || '',`
      }
    ]
  },
  {
    file: 'src/utils/recipeMatching.ts',
    description: 'Fix import issues and type definitions',
    changes: [
      {
        search: `import { IngredientMapping } from '@/types/alchemy';`,
        replace: `// Removed problematic import - define locally if needed`
      },
      {
        search: `import { ingredients } from '@/data/ingredients';`,
        replace: `import { ingredientsMap } from '@/data/ingredients';`
      },
      {
        search: `import { getRecipes } from '@/services/LocalRecipeService';`,
        replace: `// Import from correct location
import { getRecipes } from '@/data/recipes';`
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
  console.log('3. Commit: git add . && git commit -m "Phase 16 Batch 2: Fix recipe type issues"');
} 
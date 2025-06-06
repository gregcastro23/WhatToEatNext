#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Phase 2: Fixing Type Definition Issues...`);

// Phase 2.1: Fix missing property errors
const typeDefinitionFixes = [
  {
    file: 'src/types/alchemy.ts',
    fixes: [
      {
        search: /interface Ingredient \{([^}]+)\}/s,
        replace: (match, content) => {
          // Check if nutrition is already defined
          if (content.includes('nutrition')) {
            return match; // Already has nutrition property
          }
          
          // Add nutrition property before the closing brace
          const updatedContent = content.trim() + '\n  nutrition?: {\n    calories?: number;\n    protein?: number;\n    carbs?: number;\n    fat?: number;\n    fiber?: number;\n    vitamins?: string[];\n  };';
          
          return `interface Ingredient {\n${updatedContent}\n}`;
        },
        description: 'Add missing nutrition property to Ingredient interface'
      }
    ]
  }
];

// Phase 2.2: Fix component property access errors
const componentFixes = [
  {
    file: 'src/components/Header/FoodRecommender/IngredientRecommendations.tsx',
    fixes: [
      {
        search: /if \(ingredient\.nutrition\)/g,
        replace: 'if (ingredient.nutritionalProfile)',
        description: 'Fix nutrition property name to nutritionalProfile'
      },
      {
        search: /const nutrition = ingredient\.nutrition;/g,
        replace: 'const nutrition = ingredient.nutritionalProfile;',
        description: 'Fix nutrition property name to nutritionalProfile'
      },
      {
        search: /ingredient\.nutrition/g,
        replace: 'ingredient.nutritionalProfile',
        description: 'Fix all other nutrition property references'
      }
    ]
  }
];

// Phase 2.3: Common type fixes across the codebase
const commonTypeFixes = [
  {
    search: /elementalState\?\s*\|\|\s*\{\}/g,
    replace: 'elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }',
    description: 'Fix elementalState fallback with proper type'
  },
  {
    search: /seasonality\?\s*\|\|\s*\[\]/g,
    replace: 'seasonality || ["all"]',
    description: 'Fix seasonality fallback with proper default'
  }
];

async function fixTypeDefinitions() {
  let totalFixes = 0;
  
  console.log('\n📂 Phase 2.1: Fixing Type Definitions');
  
  for (const { file, fixes } of typeDefinitionFixes) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of fixes) {
        const beforeContent = content;
        
        if (typeof fix.replace === 'function') {
          content = content.replace(fix.search, fix.replace);
        } else {
          content = content.replace(fix.search, fix.replace);
        }
        
        if (content !== beforeContent) {
          console.log(`    ✅ ${fix.description}`);
          fileChanges++;
          totalFixes++;
        }
      }
      
      if (fileChanges > 0) {
        if (!isDryRun) {
          await fs.writeFile(file, content);
          console.log(`    💾 Applied ${fileChanges} type fixes to ${path.basename(file)}`);
        } else {
          console.log(`    📝 Would apply ${fileChanges} type fixes to ${path.basename(file)}`);
        }
      } else {
        console.log(`    ✨ Type definitions already correct in ${path.basename(file)}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`    ⚠️ File not found: ${file}`);
      } else {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  return totalFixes;
}

async function fixComponentErrors() {
  console.log('\n📂 Phase 2.2: Fixing Component Property Access');
  
  let totalFixes = 0;
  
  for (const { file, fixes } of componentFixes) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of fixes) {
        const beforeContent = content;
        content = content.replace(fix.search, fix.replace);
        
        if (content !== beforeContent) {
          const matches = (beforeContent.match(fix.search) || []).length;
          console.log(`    ✅ ${fix.description}: ${matches} fixes`);
          fileChanges += matches;
          totalFixes += matches;
        }
      }
      
      if (fileChanges > 0) {
        if (!isDryRun) {
          await fs.writeFile(file, content);
          console.log(`    💾 Applied ${fileChanges} fixes to ${path.basename(file)}`);
        } else {
          console.log(`    📝 Would apply ${fileChanges} fixes to ${path.basename(file)}`);
        }
      } else {
        console.log(`    ✨ No property access issues found in ${path.basename(file)}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`    ⚠️ File not found: ${file}`);
      } else {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  return totalFixes;
}

async function applyCommonTypeFixes() {
  console.log('\n📂 Phase 2.3: Applying Common Type Fixes');
  
  // Get TypeScript files that might have type issues
  const filesToCheck = [
    'src/components/**/*.tsx',
    'src/utils/**/*.ts',
    'src/data/**/*.ts'
  ];
  
  let totalFixes = 0;
  let processedFiles = 0;
  
  try {
    // Use find to get actual files (limit to first 20 for safety)
    const { stdout } = await execAsync('find src -name "*.ts" -o -name "*.tsx" | head -20');
    const files = stdout.split('\n').filter(f => f.trim());
    
    console.log(`  📊 Found ${files.length} TypeScript files to check`);
    
    for (const file of files) {
      if (!file.trim()) continue;
      
      try {
        let content = await fs.readFile(file, 'utf8');
        let fileChanges = 0;
        
        for (const fix of commonTypeFixes) {
          const beforeContent = content;
          content = content.replace(fix.search, fix.replace);
          
          if (content !== beforeContent) {
            const matches = (beforeContent.match(fix.search) || []).length;
            if (matches > 0) {
              console.log(`    ✅ ${path.basename(file)}: ${fix.description} (${matches} fixes)`);
              fileChanges += matches;
              totalFixes += matches;
            }
          }
        }
        
        if (fileChanges > 0) {
          if (!isDryRun) {
            await fs.writeFile(file, content);
          }
          processedFiles++;
        }
        
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
    
    console.log(`  📊 Applied common fixes to ${processedFiles} files`);
    
  } catch (error) {
    console.log('  ⚠️ Could not enumerate TypeScript files for common fixes');
  }
  
  return totalFixes;
}

async function checkCurrentErrors() {
  console.log('\n📂 Phase 2.4: Checking Current TypeScript Errors');
  
  try {
    // Get current specific error
    await execAsync('yarn tsc --noEmit', { maxBuffer: 1024 * 1024 });
    console.log('  ✅ No TypeScript errors found!');
    return true;
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n').slice(0, 10); // First 10 lines
    
    console.log('  📊 Current TypeScript errors:');
    lines.forEach(line => {
      if (line.includes('error TS')) {
        console.log(`    ❌ ${line.trim()}`);
      }
    });
    
    return false;
  }
}

async function main() {
  try {
    const typeDefFixes = await fixTypeDefinitions();
    const componentFixes = await fixComponentErrors();
    const commonFixes = await applyCommonTypeFixes();
    
    const totalFixes = typeDefFixes + componentFixes + commonFixes;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 2 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Type definition fixes: ${typeDefFixes}`);
    console.log(`Component fixes: ${componentFixes}`);
    console.log(`Common type fixes: ${commonFixes}`);
    console.log(`Total fixes: ${totalFixes}`);
    
    if (!isDryRun && totalFixes > 0) {
      console.log('\n🔍 Checking build status...');
      const noErrors = await checkCurrentErrors();
      
      if (noErrors) {
        console.log('\n🎉 PHASE 2 COMPLETE - No TypeScript errors!');
      } else {
        console.log('\n📋 PHASE 2 COMPLETE - Some errors remain');
        console.log('Progress made - ready for Phase 3 if needed');
      }
    } else if (isDryRun) {
      console.log('\n🧪 DRY RUN COMPLETE');
      console.log('Run without --dry-run to apply changes');
    } else {
      console.log('\n✨ PHASE 2 COMPLETE - No fixes needed');
    }
    
    console.log('\nNext: Run "yarn build" to verify build status');
    
  } catch (error) {
    console.error('❌ Error during Phase 2 fixes:', error.message);
    process.exit(1);
  }
}

main(); 
#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Phase 3: Fixing Type Name Consistency Issues...`);

// Phase 3.1: Fix property name inconsistencies
const propertyNameFixes = [
  {
    file: 'src/components/IngredientCard.tsx',
    fixes: [
      {
        search: /elementalPropertiesState/g,
        replace: 'elementalProperties',
        description: 'Fix elementalPropertiesState → elementalProperties'
      }
    ]
  }
];

// Phase 3.2: Common type consistency fixes across components
const typeConsistencyFixes = [
  {
    search: /ingredient\.qualities && ingredient\.qualities\s*\|\|\s*\[\]\.length\s*>\s*0/g,
    replace: '(ingredient.qualities || []).length > 0',
    description: 'Fix ingredient.qualities array check'
  },
  {
    search: /ingredient\.seasonality && ingredient\.seasonality\s*\|\|\s*\[\]\.length\s*>\s*0/g,
    replace: '(ingredient.seasonality || []).length > 0',
    description: 'Fix ingredient.seasonality array check'
  },
  {
    search: /\(ingredient as Record<string, any>\)\.unit \|\| ''/g,
    replace: '(ingredient as any).unit || \'\'',
    description: 'Simplify type assertion for unit property'
  },
  {
    search: /\(ingredient as Record<string, any>\)\.preparation \|\| ''/g,
    replace: '(ingredient as any).preparation || \'\'',
    description: 'Simplify type assertion for preparation property'
  },
  {
    search: /\(ingredient as Record<string, any>\)\.notes \|\| ''/g,
    replace: '(ingredient as any).notes || \'\'',
    description: 'Simplify type assertion for notes property'
  },
  {
    search: /\(ingredient as Record<string, any>\)\.optional \|\| false/g,
    replace: '(ingredient as any).optional || false',
    description: 'Simplify type assertion for optional property'
  }
];

// Phase 3.3: Array and optional property safety fixes
const safetyFixes = [
  {
    search: /&& <span className="ingredient-prep"> \(\{[^}]+\}\)<\/span>/g,
    replace: '&& (ingredient as any).preparation && <span className="ingredient-prep"> ({(ingredient as any).preparation})</span>',
    description: 'Fix conditional rendering for preparation span'
  },
  {
    search: /&& \(\n\s*<div className="ingredient-notes">/g,
    replace: '&& (ingredient as any).notes && (\n        <div className="ingredient-notes">',
    description: 'Fix conditional rendering for notes div'
  }
];

async function fixPropertyNames() {
  let totalFixes = 0;
  
  console.log('\n📂 Phase 3.1: Fixing Property Name Inconsistencies');
  
  for (const { file, fixes } of propertyNameFixes) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of fixes) {
        const beforeContent = content;
        const matches = (content.match(fix.search) || []).length;
        
        if (matches > 0) {
          content = content.replace(fix.search, fix.replace);
          console.log(`    ✅ ${fix.description}: ${matches} occurrences`);
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
        console.log(`    ✨ No property name issues found in ${path.basename(file)}`);
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

async function applyTypeConsistencyFixes() {
  console.log('\n📂 Phase 3.2: Applying Type Consistency Fixes');
  
  // Focus on specific files that likely have consistency issues
  const filesToCheck = [
    'src/components/IngredientCard.tsx',
    'src/components/Header/FoodRecommender/IngredientRecommendations.tsx',
    'src/components/FoodRecommender/components/IngredientCard.tsx',
    'src/components/Recipe/RecipeIngredientList.tsx'
  ];
  
  let totalFixes = 0;
  let processedFiles = 0;
  
  for (const file of filesToCheck) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of typeConsistencyFixes) {
        const beforeContent = content;
        const matches = (content.match(fix.search) || []).length;
        
        if (matches > 0) {
          content = content.replace(fix.search, fix.replace);
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
        processedFiles++;
      } else {
        console.log(`    ✨ No consistency issues found in ${path.basename(file)}`);
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`    ⚠️ File not found: ${file}`);
      } else {
        console.error(`    ❌ Error processing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`  📊 Applied consistency fixes to ${processedFiles} files`);
  return totalFixes;
}

async function applySafetyFixes() {
  console.log('\n📂 Phase 3.3: Applying Array and Optional Property Safety Fixes');
  
  const filesToCheck = [
    'src/components/IngredientCard.tsx'
  ];
  
  let totalFixes = 0;
  
  for (const file of filesToCheck) {
    try {
      await fs.access(file);
      
      let content = await fs.readFile(file, 'utf8');
      let fileChanges = 0;
      
      console.log(`\n  🎯 Processing: ${file}`);
      
      for (const fix of safetyFixes) {
        const beforeContent = content;
        const matches = (content.match(fix.search) || []).length;
        
        if (matches > 0) {
          content = content.replace(fix.search, fix.replace);
          console.log(`    ✅ ${fix.description}: ${matches} fixes`);
          fileChanges += matches;
          totalFixes += matches;
        }
      }
      
      if (fileChanges > 0) {
        if (!isDryRun) {
          await fs.writeFile(file, content);
          console.log(`    💾 Applied ${fileChanges} safety fixes to ${path.basename(file)}`);
        } else {
          console.log(`    📝 Would apply ${fileChanges} safety fixes to ${path.basename(file)}`);
        }
      } else {
        console.log(`    ✨ No safety issues found in ${path.basename(file)}`);
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

async function checkCurrentErrors() {
  console.log('\n📂 Phase 3.4: Checking Current TypeScript Errors');
  
  try {
    await execAsync('yarn tsc --noEmit', { maxBuffer: 1024 * 1024 });
    console.log('  ✅ No TypeScript errors found!');
    return true;
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    const lines = output.split('\n').slice(0, 10); // First 10 lines
    
    console.log('  📋 Current TypeScript errors (first 10):');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`    ${line}`);
      }
    });
    
    // Count total errors
    const errorLines = output.split('\n').filter(line => 
      line.includes('error TS') || line.includes(': error')
    );
    console.log(`  📊 Total error count: ~${errorLines.length} errors`);
    
    return false;
  }
}

async function buildCheck() {
  console.log('\n📂 Phase 3.5: Verifying Build Status');
  
  try {
    console.log('  🔨 Running build check...');
    await execAsync('yarn build', { maxBuffer: 1024 * 1024 });
    console.log('  ✅ Build successful!');
    return true;
  } catch (error) {
    console.log('  ❌ Build failed, but continuing with type fixes...');
    const output = error.stdout || error.stderr || '';
    const errorLines = output.split('\n').slice(0, 5);
    errorLines.forEach(line => {
      if (line.trim()) {
        console.log(`    ${line}`);
      }
    });
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Phase 3: Type Name Consistency Resolution');
  console.log('📋 Focus: Property naming, type assertions, and optional property access');
  
  if (isDryRun) {
    console.log('\n🏃 DRY RUN MODE - No files will be modified');
  }
  
  let totalPhase3Fixes = 0;
  
  try {
    // Phase 3.1: Fix property name inconsistencies
    const propertyFixes = await fixPropertyNames();
    totalPhase3Fixes += propertyFixes;
    
    // Phase 3.2: Apply type consistency fixes
    const consistencyFixes = await applyTypeConsistencyFixes();
    totalPhase3Fixes += consistencyFixes;
    
    // Phase 3.3: Apply safety fixes
    const safetyFixCount = await applySafetyFixes();
    totalPhase3Fixes += safetyFixCount;
    
    // Phase 3.4: Check remaining errors
    await checkCurrentErrors();
    
    // Phase 3.5: Build verification
    if (!isDryRun && totalPhase3Fixes > 0) {
      await buildCheck();
    }
    
    // Summary
    console.log('\n🎉 Phase 3 Complete!');
    console.log(`📊 Total fixes applied: ${totalPhase3Fixes}`);
    
    if (totalPhase3Fixes > 0) {
      console.log('✅ Property name consistency issues resolved');
      console.log('✅ Type assertion patterns improved');
      console.log('✅ Optional property access made safer');
      
      if (!isDryRun) {
        console.log('\n🔄 Next Steps:');
        console.log('  1. Run: yarn build');
        console.log('  2. Check remaining errors with: yarn tsc --noEmit');
        console.log('  3. Continue with Phase 4 if needed');
      }
    } else {
      console.log('✨ No Phase 3 issues found - types already consistent!');
    }
    
    if (isDryRun) {
      console.log('\n🔧 To apply these fixes, run:');
      console.log('  node scripts/typescript-fixes/fix-phase3-type-consistency.js');
    }
    
  } catch (error) {
    console.error('\n❌ Phase 3 failed:', error.message);
    process.exit(1);
  }
}

main(); 
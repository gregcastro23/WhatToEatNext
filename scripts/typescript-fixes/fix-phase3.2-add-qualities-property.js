#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 ${isDryRun ? '[DRY RUN] ' : ''}Phase 3.2: Adding Missing Qualities Property...`);

// Phase 3.2: Add missing qualities property to alchemy Ingredient interface
const interfaceFixes = [
  {
    file: 'src/types/alchemy.ts',
    fixes: [
      {
        search: /(export interface Ingredient \{[^}]*?subCategory\?: string;)/s,
        replace: '$1\n  qualities?: string[];',
        description: 'Add qualities property to alchemy Ingredient interface'
      }
    ]
  }
];

async function addQualitiesProperty() {
  let totalFixes = 0;
  
  console.log('\n📂 Phase 3.2: Adding Missing Qualities Property');
  
  for (const { file, fixes } of interfaceFixes) {
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
        } else {
          console.log(`    ⚪ ${fix.description}: already present or pattern not found`);
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
        console.log(`    ✨ No changes needed in ${path.basename(file)}`);
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

async function checkCurrentError() {
  console.log('\n📂 Phase 3.2.1: Checking Current Build Error');
  
  try {
    await execAsync('yarn build', { maxBuffer: 1024 * 1024 });
    console.log('  ✅ Build successful!');
    return true;
  } catch (error) {
    const output = error.stdout || error.stderr || '';
    
    // Look for the specific error we're trying to fix
    if (output.includes("Property 'qualities' does not exist")) {
      console.log('  🎯 Target error still present: qualities property missing');
      return false;
    } else {
      // Different error - show first few lines  
      const lines = output.split('\n').slice(0, 5);
      console.log('  📋 Current error:');
      lines.forEach(line => {
        if (line.trim()) {
          console.log(`    ${line}`);
        }
      });
      return false;
    }
  }
}

async function main() {
  console.log('🚀 Starting Phase 3.2: Adding Missing Qualities Property');
  console.log('📋 Target: Add qualities property to alchemy Ingredient interface');
  
  if (isDryRun) {
    console.log('\n🏃 DRY RUN MODE - No files will be modified');
  }
  
  try {
    // Check current error first
    const currentlyWorking = await checkCurrentError();
    
    if (currentlyWorking) {
      console.log('\n🎉 Build already working! No fixes needed.');
      return;
    }
    
    // Apply fixes
    const totalFixes = await addQualitiesProperty();
    
    // Check if fixes worked
    if (!isDryRun && totalFixes > 0) {
      console.log('\n📂 Phase 3.2.2: Verifying Fixes');
      const fixWorked = await checkCurrentError();
      
      if (fixWorked) {
        console.log('\n🎉 Phase 3.2 Success! Build now working.');
      } else {
        console.log('\n⚠️ Build still has errors - may need additional fixes.');
      }
    }
    
    // Summary
    console.log('\n🎉 Phase 3.2 Complete!');
    console.log(`📊 Total fixes applied: ${totalFixes}`);
    
    if (totalFixes > 0) {
      console.log('✅ Added qualities property to alchemy Ingredient interface');
      
      if (!isDryRun) {
        console.log('\n🔄 Next Steps:');
        console.log('  1. Run: yarn build');
        console.log('  2. Check for next error');
        console.log('  3. Continue with additional fixes if needed');
      }
    } else {
      console.log('✨ Interface already has required properties!');
    }
    
    if (isDryRun) {
      console.log('\n🔧 To apply these fixes, run:');
      console.log('  node scripts/typescript-fixes/fix-phase3.2-add-qualities-property.js');
    }
    
  } catch (error) {
    console.error('\n❌ Phase 3.2 failed:', error.message);
    process.exit(1);
  }
}

main(); 
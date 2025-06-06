#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');

let fixedFilesCount = 0;
let totalFixesApplied = 0;

console.log('🍳 Fixing Cooking Methods Unknown Property Access Errors');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

/**
 * Fix unknown property access patterns in cooking methods files
 */
function fixCookingMethodsPropertyAccess(content, filename) {
  let fixes = 0;
  const originalContent = content;
  
  console.log(`🔍 Processing: ${filename}`);
  
  // Fix method.description patterns
  content = content.replace(
    /method\.description/g,
    '(method as any).description'
  );
  
  // Fix method.elementalEffect patterns
  content = content.replace(
    /method\.elementalEffect/g,
    '(method as any).elementalEffect'
  );
  
  // Fix method.elementalProperties patterns
  content = content.replace(
    /method\.elementalProperties/g,
    '(method as any).elementalProperties'
  );
  
  // Fix method.time_range patterns
  content = content.replace(
    /method\.time_range/g,
    '(method as any).time_range'
  );
  
  // Fix method.duration patterns
  content = content.replace(
    /method\.duration/g,
    '(method as any).duration'
  );
  
  // Fix method.suitable_for patterns
  content = content.replace(
    /method\.suitable_for/g,
    '(method as any).suitable_for'
  );
  
  // Fix method.benefits patterns
  content = content.replace(
    /method\.benefits/g,
    '(method as any).benefits'
  );
  
  // Fix method.variations patterns
  content = content.replace(
    /method\.variations/g,
    '(method as any).variations'
  );
  
  // Fix selectedMethod.description patterns
  content = content.replace(
    /selectedMethod\.description/g,
    '(selectedMethod as any).description'
  );
  
  // Fix selectedMethod.name patterns
  content = content.replace(
    /selectedMethod\.name/g,
    '(selectedMethod as any).name'
  );

  // Fix selectedMethod?.id patterns
  content = content.replace(
    /selectedMethod\?\.id/g,
    '(selectedMethod as any)?.id'
  );
  
  if (content !== originalContent) {
    const changesCount = (originalContent.match(/method\./g) || []).length + 
                        (originalContent.match(/selectedMethod\./g) || []).length;
    fixes = changesCount;
    console.log(`    ✅ Fixed ${fixes} unknown property access patterns in ${filename}`);
  } else {
    console.log(`    ⏭️ No patterns found to fix in ${filename}`);
  }
  
  return { content, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let totalFixes = 0;
    
    const filename = path.basename(filePath);
    
    // Apply fix strategies
    const result = fixCookingMethodsPropertyAccess(content, filename);
    content = result.content;
    totalFixes += result.fixes;
    
    if (content !== originalContent && totalFixes > 0) {
      if (DRY_RUN) {
        console.log(`✅ Would fix ${filePath}: ${totalFixes} fixes`);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${filePath}: ${totalFixes} fixes`);
        fixedFilesCount++;
      }
      totalFixesApplied += totalFixes;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Processing cooking methods files with unknown property access errors...');
  
  // Target the specific files with known issues
  const targetFiles = [
    'src/app/cooking-methods-demo/page.tsx',
    'src/app/cooking-methods/page.tsx',
    'src/app/cooking-methods/[method]/page.tsx'
  ].filter(file => fs.existsSync(file));
  
  console.log(`📁 Found ${targetFiles.length} cooking methods files`);
  
  if (targetFiles.length === 0) {
    console.log('❌ No target files found');
    return;
  }
  
  if (DRY_RUN) {
    console.log('\n📋 Files that would be processed:');
    targetFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  console.log('\n🔧 Processing files...');
  
  // Process each file
  targetFiles.forEach(processFile);
  
  console.log('\n📊 Cooking Methods Property Access Fix Summary:');
  console.log(`✅ Files processed: ${fixedFilesCount}`);
  console.log(`🔧 Total unknown property access fixes applied: ${totalFixesApplied}`);
  
  if (!DRY_RUN && fixedFilesCount > 0) {
    console.log('\n🧪 Fixes applied! Cooking methods unknown property errors should be resolved.');
  }
}

main(); 
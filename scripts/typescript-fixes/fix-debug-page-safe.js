#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Safety check for dry run
const DRY_RUN = process.argv.includes('--dry-run');

// Target file
const targetFile = 'src/app/debug/page.tsx';

// Define the specific fixes we need to make
const fixes = [
  {
    description: 'Replace unknown ingredient type with proper interface',
    search: `interface TestResult {
  ingredient: unknown;
  holisticRecommendations: Array<{ method: string, compatibility: number, reason: string }>;
  standardRecommendations: Array<{ method: string, compatibility: number }>;
}`,
    replace: `interface TestIngredient {
  name: string;
  element: string;
  elementalCharacter: string;
}

interface TestResult {
  ingredient: TestIngredient;
  holisticRecommendations: Array<{ method: string, compatibility: number, reason: string }>;
  standardRecommendations: Array<{ method: string, compatibility: number }>;
}`
  }
];

function applyFixes() {
  console.log(`🔧 Fixing TS2339 errors in ${targetFile}`);
  
  try {
    // Read the file
    const content = readFileSync(targetFile, 'utf8');
    let updatedContent = content;
    
    // Apply each fix
    for (const fix of fixes) {
      if (updatedContent.includes(fix.search)) {
        updatedContent = updatedContent.replace(fix.search, fix.replace);
        console.log(`✅ Applied: ${fix.description}`);
      } else {
        console.log(`⚠️  Could not find pattern for: ${fix.description}`);
      }
    }
    
    if (DRY_RUN) {
      console.log('\n📋 DRY RUN - Would make these changes:');
      console.log('='.repeat(50));
      console.log(updatedContent);
      console.log('='.repeat(50));
      return;
    }
    
    // Write the updated content
    writeFileSync(targetFile, updatedContent, 'utf8');
    console.log(`✅ Successfully updated ${targetFile}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Safety checks
if (!DRY_RUN) {
  console.log('⚠️  This script will modify TypeScript files.');
  console.log(`📁 Target: ${targetFile}`);
  console.log('🛡️  Running safety checks...');
  
  // Check if target file exists
  try {
    readFileSync(targetFile, 'utf8');
    console.log('✅ Target file exists');
  } catch (error) {
    console.error(`❌ Target file not found: ${targetFile}`);
    process.exit(1);
  }
}

console.log('\n🚀 Starting safe TS2339 fix...');
applyFixes();
console.log('\n✨ Done!'); 
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Check for dry run mode
const isDryRun = process.argv.includes('--dry-run');

console.log(`🔧 Fixing AlchemicalRecommendations.tsx syntax errors${isDryRun ? ' (DRY RUN)' : ''}...`);

const filePath = 'src/components/AlchemicalRecommendations.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');
let changes = 0;

// Fix 1: topMethods map syntax error
const methodsPattern = /\{recommendations\?\.\s*topMethods\s*\|\|\s*\[\]\.map\(/g;
const methodsReplacement = '{(recommendations?.topMethods || []).map(';
if (methodsPattern.test(content)) {
  content = content.replace(methodsPattern, methodsReplacement);
  changes++;
  console.log('✅ Fixed topMethods map syntax');
}

// Fix 2: topCuisines map syntax error
const cuisinesPattern = /\{recommendations\?\.\s*topCuisines\s*\|\|\s*\[\]\.map\(/g;
const cuisinesReplacement = '{(recommendations?.topCuisines || []).map(';
if (cuisinesPattern.test(content)) {
  content = content.replace(cuisinesPattern, cuisinesReplacement);
  changes++;
  console.log('✅ Fixed topCuisines map syntax');
}

if (changes > 0) {
  if (!isDryRun) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Applied ${changes} fixes to ${filePath}`);
  } else {
    console.log(`🔍 Would apply ${changes} fixes to ${filePath}`);
  }
} else {
  console.log('ℹ️ No changes needed');
}

console.log(`${isDryRun ? 'DRY RUN' : 'FIX'} completed.`); 
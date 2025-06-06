#!/usr/bin/env node

/**
 * Fix Test Import Extensions Script
 * Changes all .js import extensions to .ts in the test file for tsx compatibility
 */

import { readFileSync, writeFileSync } from 'fs';

const testFile = 'test-unified-systems-integration.mjs';

console.log('🔧 Fixing test file import extensions (.js → .ts)');

try {
  const content = readFileSync(testFile, 'utf8');
  
  // Replace .js extensions in import statements with .ts
  const newContent = content.replace(
    /from\s+['"]([^'"]+)\.js['"]/g,
    "from '$1.ts'"
  );
  
  if (content !== newContent) {
    const replacements = (content.match(/from\s+['"]([^'"]+)\.js['"]/g) || []).length;
    
    console.log(`✅ ${testFile}: ${replacements} import(s) fixed`);
    
    writeFileSync(testFile, newContent, 'utf8');
    console.log('✅ Test file import extensions fixed successfully!');
  } else {
    console.log('ℹ️ No .js imports found in test file');
  }
} catch (error) {
  console.error(`❌ Error processing ${testFile}:`, error.message);
} 
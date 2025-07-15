#!/usr/bin/env node

/**
 * Final syntax fix for remaining errors
 */

import { readFileSync, writeFileSync } from 'fs';

// Fix the specific syntax issues
function fixFiles() {
  // Fix fixIngredientMappings.ts - the issue is line 112 let assignment in for loop
  let content = readFileSync('src/scripts/fixIngredientMappings.ts', 'utf8');
  
  // Fix the totalFiles and fixedFiles const assignments
  content = content.replace(/const totalFiles = 0;/, 'let totalFiles = 0;');
  content = content.replace(/const fixedFiles = 0;/, 'let fixedFiles = 0;');
  
  writeFileSync('src/scripts/fixIngredientMappings.ts', content, 'utf8');
  console.log('Fixed fixIngredientMappings.ts');
}

fixFiles(); 
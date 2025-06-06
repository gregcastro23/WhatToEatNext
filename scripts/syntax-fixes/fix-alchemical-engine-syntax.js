#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const filePath = 'src/calculations/alchemicalEngine.ts';

console.log('🔧 Fixing syntax errors in alchemicalEngine.ts...');

try {
  let content = readFileSync(filePath, 'utf-8');
  
  // Track changes
  let changeCount = 0;
  
  // Fix patterns like "{ ," which should be "{"
  const patterns = [
    // Object literal with leading comma
    { pattern: /{\s*,\s*([a-zA-Z_])/g, replacement: '{\n  $1', description: 'object literal with leading comma' },
    
    // Specific patterns found in the file
    { pattern: /Alchemy: {\s*,\s*Spirit:/g, replacement: 'Alchemy: {\n  Spirit:', description: 'Alchemy object syntax' },
    { pattern: /Element: 'Fire' \},/g, replacement: "Element: 'Fire' },", description: 'element property syntax' },
    { pattern: /Element: 'Water' \},/g, replacement: "Element: 'Water' },", description: 'element property syntax' },
    { pattern: /Element: 'Earth' \},/g, replacement: "Element: 'Earth' },", description: 'element property syntax' },
    { pattern: /Element: 'Air' \},/g, replacement: "Element: 'Air' },", description: 'element property syntax' },
    
    // Fix incomplete object literals in return statements
    { pattern: /return {\s*Fire: 0\.25,\s*Water: 0\.25,\s*Earth: 0\.25,\s*Air: 0\.25\s*\}\s*'Total Effect Value':/g, 
      replacement: "return {\n  Fire: 0.25,\n  Water: 0.25,\n  Earth: 0.25,\n  Air: 0.25,\n  'Total Effect Value':", 
      description: 'incomplete return object' },
      
    // Fix missing commas in objects
    { pattern: /Air: 0\.25\s*\}\s*'Total Effect Value'/g, replacement: "Air: 0.25,\n  'Total Effect Value'", description: 'missing comma before Total Effect Value' },
    
    // Fix broken elementalBalance reference
    { pattern: /Object\.entries\(elementalBalance\)/g, replacement: 'Object.entries(elementCounts)', description: 'undefined elementalBalance reference' }
  ];
  
  // Apply all patterns
  patterns.forEach(({ pattern, replacement, description }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      changeCount++;
      console.log(`✓ Fixed: ${description}`);
    }
  });
  
  // Manual fixes for specific lines that are harder to pattern match
  const lines = content.split('\n');
  let linesFixed = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Fix lines like "aries: {, Element: 'Fire' },"
    if (line.includes(': {,') && line.includes('Element:')) {
      lines[i] = line.replace(': {,', ': {');
      linesFixed++;
    }
    
    // Fix lines like "Alchemy: {, Spirit:"
    if (line.includes('Alchemy: {,')) {
      lines[i] = line.replace('Alchemy: {,', 'Alchemy: {');
      linesFixed++;
    }
    
    // Fix incomplete object returns
    if (line.trim() === 'return {' && i + 1 < lines.length && lines[i + 1].includes('Fire: 0.25')) {
      // Look for the pattern and fix it
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('}')) {
        j++;
      }
      if (j < lines.length && lines[j].includes('}') && j + 1 < lines.length && lines[j + 1].includes("'Total Effect Value'")) {
        lines[j] = lines[j].replace('}', ',');
        linesFixed++;
      }
    }
  }
  
  if (linesFixed > 0) {
    content = lines.join('\n');
    changeCount += linesFixed;
    console.log(`✓ Fixed ${linesFixed} lines with manual corrections`);
  }
  
  // Final cleanup - remove any remaining syntax errors
  content = content
    // Fix any remaining {, patterns
    .replace(/{\s*,/g, '{')
    // Fix any multiple consecutive commas
    .replace(/,\s*,/g, ',')
    // Fix trailing commas before closing braces
    .replace(/,\s*}/g, '}');
  
  if (changeCount > 0) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed ${changeCount} syntax errors in ${filePath}`);
  } else {
    console.log('✅ No syntax errors found to fix');
  }
  
} catch (error) {
  console.error('❌ Error fixing syntax errors:', error);
  process.exit(1);
} 
#!/usr/bin/env node
/**
 * Property Colon Fixer - Fixes missing colons in object property assignments
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getParsingErrorFiles() {
  try {
    const output = execSync(
      'yarn lint 2>&1 | grep -B 1 "Property assignment expected" | grep "^/" | sed "s/:$//" | sort -u',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    let fixes = [];

    // Fix 1: Missing colon before array literal in object
    // Pattern: property_name ['value1', 'value2']
    // Fix: property_name: ['value1', 'value2']
    const arrayPattern = /(\s+)(\w+)\s+(\[)/g;
    content = content.replace(arrayPattern, (match, indent, propName, bracket) => {
      // Only fix if this looks like an object property (has proper indentation)
      if (indent.length >= 2) {
        fixes.push(`${propName} array property`);
        return `${indent}${propName}: ${bracket}`;
      }
      return match;
    });

    // Fix 2: Missing colon before object literal in object
    // Pattern: property_name {
    // Fix: property_name: {
    const objectPattern = /(\s+)(\w+)\s+({)/g;
    content = content.replace(objectPattern, (match, indent, propName, brace) => {
      // Only fix if this looks like an object property
      if (indent.length >= 2 && !propName.match(/^(if|for|while|function|class|export|import|const|let|var)$/)) {
        fixes.push(`${propName} object property`);
        return `${indent}${propName}: ${brace}`;
      }
      return match;
    });

    // Fix 3: Missing colon before string literal
    // Pattern: property_name 'value'
    // Fix: property_name: 'value'
    const stringPattern = /(\s+)(\w+)\s+(['"'"`])/g;
    content = content.replace(stringPattern, (match, indent, propName, quote) => {
      if (indent.length >= 2) {
        fixes.push(`${propName} string property`);
        return `${indent}${propName}: ${quote}`;
      }
      return match;
    });

    // Fix 4: Missing colon before number literal
    // Pattern: property_name 123
    // Fix: property_name: 123
    const numberPattern = /(\s+)(\w+)\s+(\d+\.?\d*)/g;
    content = content.replace(numberPattern, (match, indent, propName, number) => {
      if (indent.length >= 2) {
        fixes.push(`${propName} number property`);
        return `${indent}${propName}: ${number}`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true, fixes };
    }
    return { fixed: false, fixes: [] };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

function main() {
  console.log('🔧 Property Colon Fixer\n');

  const files = getParsingErrorFiles();
  console.log(`Found ${files.length} files with property assignment errors\n`);

  if (files.length === 0) {
    console.log('✅ No property assignment errors!\n');
    return;
  }

  let fixedCount = 0;

  files.forEach(file => {
    const relativePath = file.replace(process.cwd() + '/', '');
    process.stdout.write(`Fixing ${relativePath}... `);

    const result = fixFile(file);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.fixed) {
      fixedCount++;
      console.log(`✅ (${result.fixes.length} fixes)`);
    } else {
      console.log('⚠️');
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount}/${files.length} files\n`);
}

main();

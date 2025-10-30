#!/usr/bin/env node
/**
 * Fix Object Semicolons - Fix ({; pattern from property-colon-fixer
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getAllTsFiles() {
  try {
    const output = execSync(
      'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"',
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

    // Fix ({; -> ({
    if (content.includes('({;')) {
      content = content.replace(/\(\{;/g, '({');
    }

    // Fix {; at start of object
    content = content.replace(/\{\s*;/g, '{');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true };
    }
    return { fixed: false };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

function main() {
  console.log('🔧 Fix Object Semicolons\n');

  const files = getAllTsFiles();
  let fixedCount = 0;

  files.forEach(file => {
    const result = fixFile(file);
    if (result.fixed) {
      fixedCount++;
      const relativePath = file.replace(process.cwd() + '/', '');
      console.log(`✅ ${relativePath}`);
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount} files\n`);
}

main();

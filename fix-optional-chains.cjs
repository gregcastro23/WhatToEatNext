#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with optional chain issues
function getFilesWithOptionalChainIssues() {
  try {
    const output = execSync('yarn lint --format=compact 2>&1 | grep "prefer-optional-chain"', { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim());
    const files = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    });
    
    return Array.from(files);
  } catch (error) {
    console.log('No optional chain issues found or error occurred');
    return [];
  }
}

// Fix optional chain usage in a file
function fixOptionalChainsInFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: obj && obj.prop -> obj?.prop
    const andPropertyPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    content = content.replace(andPropertyPattern, (match, objName, propName) => {
      modified = true;
      return `${objName}?.${propName}`;
    });
    
    // Pattern 2: obj && obj.prop && obj.prop.method() -> obj?.prop?.method()
    const chainedAndPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.\2\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    content = content.replace(chainedAndPattern, (match, objName, propName, methodName) => {
      modified = true;
      return `${objName}?.${propName}?.${methodName}`;
    });
    
    // Pattern 3: obj && obj.method() -> obj?.method()
    const andMethodPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*\([^)]*\))/g;
    content = content.replace(andMethodPattern, (match, objName, methodCall) => {
      modified = true;
      return `${objName}?.${methodCall}`;
    });
    
    // Pattern 4: obj && obj[key] -> obj?.[key]
    const andBracketPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\[([^\]]+)\]/g;
    content = content.replace(andBracketPattern, (match, objName, key) => {
      modified = true;
      return `${objName}?.[${key}]`;
    });
    
    // Pattern 5: obj && obj.prop && obj.prop.subprop -> obj?.prop?.subprop
    const deepAndPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.\2\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    content = content.replace(deepAndPattern, (match, objName, propName, subPropName) => {
      modified = true;
      return `${objName}?.${propName}?.${subPropName}`;
    });
    
    // Pattern 6: More complex nested patterns
    // obj && obj.a && obj.a.b && obj.a.b.c -> obj?.a?.b?.c
    const veryDeepAndPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.\2\.([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.\2\.\3\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
    content = content.replace(veryDeepAndPattern, (match, objName, prop1, prop2, prop3) => {
      modified = true;
      return `${objName}?.${prop1}?.${prop2}?.${prop3}`;
    });
    
    // Pattern 7: Handle array access with optional chaining
    // arr && arr.length -> arr?.length
    const arrayLengthPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.length/g;
    content = content.replace(arrayLengthPattern, (match, arrayName) => {
      modified = true;
      return `${arrayName}?.length`;
    });
    
    // Pattern 8: Handle function calls with optional chaining
    // func && func.call() -> func?.call()
    const functionCallPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*\1\.([a-zA-Z_][a-zA-Z0-9_]*)\(/g;
    content = content.replace(functionCallPattern, (match, funcName, methodName) => {
      modified = true;
      return `${funcName}?.${methodName}(`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Fixed optional chains in ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`  - No automatic fixes applied to ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding files with optional chain issues...');
  const files = getFilesWithOptionalChainIssues();
  
  if (files.length === 0) {
    console.log('✅ No optional chain issues found!');
    return;
  }
  
  console.log(`📝 Found ${files.length} files with optional chain issues`);
  
  let fixedCount = 0;
  files.forEach(file => {
    if (fixOptionalChainsInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Files processed: ${files.length}`);
  console.log(`  - Files modified: ${fixedCount}`);
  
  // Run linter again to check remaining issues
  console.log('\n🔍 Checking remaining optional chain issues...');
  try {
    const remainingOutput = execSync('yarn lint 2>&1 | grep -c "prefer-optional-chain"', { encoding: 'utf8' });
    const remainingCount = parseInt(remainingOutput.trim()) || 0;
    console.log(`📈 Remaining optional chain issues: ${remainingCount}`);
  } catch (error) {
    console.log('✅ No remaining optional chain issues found!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixOptionalChainsInFile, getFilesWithOptionalChainIssues };
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Final comprehensive fix for remaining TS1005 errors
 */

function fixAllRemainingPatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Fix JSX attributes with semicolons: prop={value}; -> prop={value}
  const jsxSemicolonPattern = /(\w+)=\{([^}]+)\};(\s*\w+)/g;
  content = content.replace(jsxSemicolonPattern, (match, prop, value, nextProp) => {
    fixCount++;
    console.log(`  ✓ Fixed JSX semicolon: ${prop}`);
    return `${prop}={${value}}\n    ${nextProp}`;
  });

  // Fix template literal replace method: .replace(/\s+/g '-') -> .replace(/\s+/g, '-')
  const replaceMethodPattern = /\.replace\s*\(\s*([^,)]+)\s+([^)]+)\s*\)/g;
  content = content.replace(replaceMethodPattern, (match, regex, replacement) => {
    if (!match.includes(',')) {
      fixCount++;
      console.log(`  ✓ Fixed replace method`);
      return `.replace(${regex}, ${replacement})`;
    }
    return match;
  });

  // Fix function call with missing comma: func(param1 param2) -> func(param1, param2)
  const functionCallPattern = /(\w+)\s*\(\s*([^,()]+)\s+([^,()]+)\s*\)/g;
  content = content.replace(functionCallPattern, (match, funcName, param1, param2) => {
    // Only fix if it looks like missing comma between parameters
    if (!param1.includes('(') && !param2.includes('(') && param1.length < 50 && param2.length < 50) {
      fixCount++;
      console.log(`  ✓ Fixed function call: ${funcName}`);
      return `${funcName}(${param1}, ${param2})`;
    }
    return match;
  });

  // Fix array/object literal with missing comma: [item1 item2] -> [item1, item2]
  const arrayLiteralPattern = /\[\s*([^,\[\]]+)\s+([^,\[\]]+)\s*\]/g;
  content = content.replace(arrayLiteralPattern, (match, item1, item2) => {
    if (item1.length < 30 && item2.length < 30) {
      fixCount++;
      console.log(`  ✓ Fixed array literal`);
      return `[${item1}, ${item2}]`;
    }
    return match;
  });

  // Fix object literal with missing comma: { key1: value1 key2: value2 } -> { key1: value1, key2: value2 }
  const objectLiteralPattern = /\{\s*([^,{}]+:\s*[^,{}]+)\s+([^,{}]+:\s*[^,{}]+)\s*\}/g;
  content = content.replace(objectLiteralPattern, (match, pair1, pair2) => {
    if (pair1.length < 50 && pair2.length < 50) {
      fixCount++;
      console.log(`  ✓ Fixed object literal`);
      return `{ ${pair1}, ${pair2} }`;
    }
    return match;
  });

  // Fix missing semicolon at end of statements
  const missingSemicolonPattern = /^(\s*(?:const|let|var|return|throw|break|continue)\s+[^;]+)$/gm;
  content = content.replace(missingSemicolonPattern, (match, statement) => {
    if (!statement.includes('{') && !statement.includes('(')) {
      fixCount++;
      console.log(`  ✓ Added missing semicolon`);
      return `${statement};`;
    }
    return match;
  });

  // Fix missing closing parenthesis in function calls
  const missingParenPattern = /(\w+)\s*\(\s*([^)]+)$/gm;
  content = content.replace(missingParenPattern, (match, funcName, params) => {
    if (params.length < 100 && !params.includes('\n')) {
      fixCount++;
      console.log(`  ✓ Added missing closing paren: ${funcName}`);
      return `${funcName}(${params})`;
    }
    return match;
  });

  // Fix missing opening brace for try blocks
  const tryBlockPattern = /try\s*:/g;
  content = content.replace(tryBlockPattern, (match) => {
    fixCount++;
    console.log(`  ✓ Fixed try block syntax`);
    return 'try {';
  });

  // Fix generic type syntax with missing comma: <Type1 Type2> -> <Type1, Type2>
  const genericTypePattern = /<\s*(\w+)\s+(\w+)\s*>/g;
  content = content.replace(genericTypePattern, (match, type1, type2) => {
    fixCount++;
    console.log(`  ✓ Fixed generic type syntax`);
    return `<${type1}, ${type2}>`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fixCount} patterns in: ${filePath}`);
    return true;
  }

  return false;
}

async function getTS1005ErrorFiles() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const errorLines = output.trim().split('\n').filter(line => line.trim());
    const files = new Set();

    errorLines.forEach(line => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        files.add(match[1]);
      }
    });

    return Array.from(files);
  } catch (error) {
    if (error.status === 1) {
      return [];
    }
    throw error;
  }
}

async function validateBuild() {
  try {
    console.log('\n🔍 Validating TypeScript compilation...');
    execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('❌ TypeScript compilation failed');
    return false;
  }
}

async function main() {
  console.log('🚀 Final TS1005 Error Cleanup');
  console.log('=============================');

  const initialErrorFiles = await getTS1005ErrorFiles();
  console.log(`📊 Found ${initialErrorFiles.length} files with TS1005 errors`);

  if (initialErrorFiles.length === 0) {
    console.log('🎉 No TS1005 errors found!');
    return;
  }

  let fixedCount = 0;
  const batchSize = 20;

  // Process files in batches
  for (let i = 0; i < initialErrorFiles.length; i += batchSize) {
    const batch = initialErrorFiles.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} files):`);

    batch.forEach((filePath, index) => {
      console.log(`\n[${i + index + 1}/${initialErrorFiles.length}] Processing: ${filePath}`);
      if (fixAllRemainingPatterns(filePath)) {
        fixedCount++;
      }
    });

    // Validate build after each batch
    const buildSuccess = await validateBuild();
    if (!buildSuccess) {
      console.log('⚠️  Build validation failed, stopping to prevent further issues');
      break;
    }

    console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed successfully`);
  }

  // Final summary
  const finalErrorFiles = await getTS1005ErrorFiles();
  const reduction = initialErrorFiles.length - finalErrorFiles.length;
  const reductionPercent = initialErrorFiles.length > 0 ?
    ((reduction / initialErrorFiles.length) * 100).toFixed(1) : 0;

  console.log('\n📈 FINAL SUMMARY');
  console.log('================');
  console.log(`Files processed: ${Math.min(initialErrorFiles.length, batchSize * 3)}`);
  console.log(`Files modified: ${fixedCount}`);

  console.log(`\n📊 Error Reduction:`);
  console.log(`Initial TS1005 errors: ${initialErrorFiles.length} files`);
  console.log(`Final TS1005 errors: ${finalErrorFiles.length} files`);
  console.log(`Reduction: ${reduction} files (${reductionPercent}%)`);

  if (finalErrorFiles.length > 0) {
    console.log('\n🔍 Remaining error files (first 10):');
    finalErrorFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
  }

  console.log('\n✅ Final TS1005 cleanup completed!');
}

main().catch(console.error);

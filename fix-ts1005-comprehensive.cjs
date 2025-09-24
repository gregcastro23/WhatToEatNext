#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Starting TS1005 Comprehensive Fixes...\n');

function getTS1005ErrorCount() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

function fixComprehensivePatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Pattern 1: Fix malformed catch blocks
  // } catch (error): any {  ->  } catch (error) {
  content = content.replace(
    /(\}\s*catch\s*\([^)]+\)):\s*any\s*\{/g,
    (match, p1) => {
      fixCount++;
      return `${p1} {`;
    }
  );

  // Pattern 2: Fix malformed test function signatures
  // test('name': any, async () => {  ->  test('name', async () => {
  content = content.replace(
    /((?:test|it|describe)\s*\([^)]+)':\s*any\s*,/g,
    (match, p1) => {
      fixCount++;
      return `${p1}',`;
    }
  );

  // Pattern 3: Fix malformed function parameters with type annotations
  // function(param: type param2: type)  ->  function(param: type, param2: type)
  content = content.replace(
    /\(([^,()]+:\s*\w+)\s+([^,()]+:\s*\w+)\)/g,
    (match, p1, p2) => {
      if (!p1.includes(',') && !p2.includes(',')) {
        fixCount++;
        return `(${p1}, ${p2})`;
      }
      return match;
    }
  );

  // Pattern 4: Fix destructuring arrays without commas
  // [planet position]: any  ->  [planet, position]: any
  content = content.replace(
    /\[(\w+)\s+(\w+)\]:\s*any/g,
    (match, p1, p2) => {
      fixCount++;
      return `[${p1}, ${p2}]: any`;
    }
  );

  // Pattern 5: Fix missing opening braces after arrow functions
  // test('name', async () =>  ->  test('name', async () => {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for test functions missing opening brace
    if (line.match(/^\s*(?:test|it|describe)\s*\([^)]+\)\s*,?\s*(?:async\s+)?\(\s*\)\s*=>\s*$/) &&
        i + 1 < lines.length &&
        !lines[i + 1].trim().startsWith('{')) {
      lines[i] = line + ' {';
      fixCount++;
    }
  }
  content = lines.join('\n');

  // Pattern 6: Fix missing commas in object literals (simple cases)
  // { prop: value prop2: value2 }  ->  { prop: value, prop2: value2 }
  content = content.replace(
    /(\w+:\s*(?:true|false|\d+|'[^']*'|"[^"]*"))\s+(\w+:)/g,
    (match, p1, p2) => {
      fixCount++;
      return `${p1}, ${p2}`;
    }
  );

  // Pattern 7: Fix missing semicolons after simple statements
  // const x = value  ->  const x = value;
  content = content.replace(
    /^(\s*(?:const|let|var)\s+\w+\s*=\s*[^;{}\n()]+)$/gm,
    (match, p1) => {
      if (!p1.endsWith(';') && !p1.endsWith(',') && !p1.includes('(')) {
        fixCount++;
        return `${p1};`;
      }
      return match;
    }
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return fixCount;
  }

  return 0;
}

async function main() {
  const initialErrors = getTS1005ErrorCount();
  console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

  if (initialErrors === 0) {
    console.log('🎉 No TS1005 errors found!');
    return;
  }

  // Get files with TS1005 errors
  let filesWithErrors = [];
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort -u', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    filesWithErrors = output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('No TS1005 errors found');
    return;
  }

  console.log(`🔍 Found ${filesWithErrors.length} files with TS1005 errors\n`);

  let totalFixes = 0;
  let processedFiles = 0;

  // Process files in small batches with validation
  const batchSize = 3;
  for (let i = 0; i < Math.min(filesWithErrors.length, 15); i += batchSize) {
    const batch = filesWithErrors.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(Math.min(filesWithErrors.length, 15)/batchSize)} (${batch.length} files)`);

    let batchFixes = 0;
    const processedInBatch = [];

    for (const file of batch) {
      const fixes = fixComprehensivePatterns(file);
      if (fixes > 0) {
        batchFixes += fixes;
        processedFiles++;
        processedInBatch.push(file);
        console.log(`   ✅ ${file}: ${fixes} fixes`);
      }
    }

    if (batchFixes > 0) {
      totalFixes += batchFixes;

      // Validate after each batch
      const currentErrors = getTS1005ErrorCount();
      console.log(`   📊 TS1005 errors: ${initialErrors} → ${currentErrors}`);

      if (currentErrors > initialErrors) {
        console.log('   ⚠️  Error count increased, reverting batch...');
        for (const file of processedInBatch) {
          execSync(`git checkout HEAD -- "${file}"`);
        }
        break;
      }
    }
  }

  const finalErrors = getTS1005ErrorCount();
  const errorsFixed = initialErrors - finalErrors;
  const reductionPercent = initialErrors > 0 ? ((errorsFixed / initialErrors) * 100).toFixed(1) : 0;

  console.log('\n📈 Final Results:');
  console.log(`   Initial TS1005 errors: ${initialErrors}`);
  console.log(`   Final TS1005 errors: ${finalErrors}`);
  console.log(`   TS1005 errors fixed: ${errorsFixed}`);
  console.log(`   TS1005 reduction: ${reductionPercent}%`);
  console.log(`   Files processed: ${processedFiles}`);
  console.log(`   Total fixes applied: ${totalFixes}`);
}

main().catch(console.error);

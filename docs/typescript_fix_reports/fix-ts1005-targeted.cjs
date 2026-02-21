#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Starting TS1005 Targeted Fixes...\n');

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

function fixTargetedPatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixCount = 0;

  // Pattern 1: Missing opening brace after test/describe/it functions
  // test('name', async () =>  ->  test('name', async () => {
  content = content.replace(
    /^(\s*(?:test|it|describe)\s*\([^)]+\)\s*,?\s*(?:async\s+)?\(\s*\)\s*=>\s*)$/gm,
    (match, p1) => {
      fixCount++;
      return `${p1}{`;
    }
  );

  // Pattern 2: Missing comma in simple destructuring arrays
  // [planet position]: any  ->  [planet, position]: any
  content = content.replace(
    /\[(\w+)\s+(\w+)\]:\s*any/g,
    (match, p1, p2) => {
      fixCount++;
      return `[${p1}, ${p2}]: any`;
    }
  );

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
  const batchSize = 5;
  for (let i = 0; i < filesWithErrors.length; i += batchSize) {
    const batch = filesWithErrors.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(filesWithErrors.length/batchSize)} (${batch.length} files)`);

    let batchFixes = 0;
    for (const file of batch) {
      const fixes = fixTargetedPatterns(file);
      if (fixes > 0) {
        batchFixes += fixes;
        processedFiles++;
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
        for (const file of batch) {
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

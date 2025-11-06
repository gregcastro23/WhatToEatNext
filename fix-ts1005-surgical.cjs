#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

console.log("🔧 Starting TS1005 Surgical Fixes...\n");

// Get initial error count
function getTS1005ErrorCount() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

// Apply very specific, safe fixes to a file
function applySurgicalFixes(filePath) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  let fixCount = 0;

  // Only fix very specific, safe patterns

  // Pattern 1: Missing comma in destructuring with type annotations
  // [_planet: any, position]: any) => {  ->  [_planet: any, position: any]) => {
  content = content.replace(
    /\[([^,\]]+),\s*([^:\]]+)\]:\s*any\)/g,
    (match, p1, p2) => {
      if (!p2.includes(":")) {
        fixCount++;
        return `[${p1}, ${p2}: any])`;
      }
      return match;
    },
  );

  // Pattern 2: Missing closing parenthesis in simple function calls
  // expect(something,  ->  expect(something);
  content = content.replace(/^(\s*expect\([^)]+),\s*$/gm, (match, p1) => {
    fixCount++;
    return `${p1});`;
  });

  // Pattern 3: Missing semicolon after simple variable declarations
  // const x = value  ->  const x = value;
  content = content.replace(
    /^(\s*(?:const|let|var)\s+\w+\s*=\s*[^;{}\n]+)$/gm,
    (match, p1) => {
      if (!p1.endsWith(";") && !p1.endsWith(",") && !p1.includes("(")) {
        fixCount++;
        return `${p1};`;
      }
      return match;
    },
  );

  // Pattern 4: Missing comma in simple object properties
  // { prop: value prop2: value2 }  ->  { prop: value, prop2: value2 }
  content = content.replace(
    /(\w+:\s*(?:true|false|\d+|'[^']*'|"[^"]*"))\s+(\w+:)/g,
    (match, p1, p2) => {
      fixCount++;
      return `${p1}, ${p2}`;
    },
  );

  // Pattern 5: Missing opening brace after function declaration
  // test('name', () =>  ->  test('name', () => {
  content = content.replace(
    /^(\s*(?:test|it|describe)\s*\([^)]+\)\s*=>\s*)$/gm,
    (match, p1) => {
      fixCount++;
      return `${p1}{`;
    },
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    return fixCount;
  }

  return 0;
}

// Main execution
async function main() {
  const initialErrors = getTS1005ErrorCount();
  console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

  if (initialErrors === 0) {
    console.log("🎉 No TS1005 errors found!");
    return;
  }

  // Get files with TS1005 errors
  let filesWithErrors = [];
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort -u',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    filesWithErrors = output.trim().split("\n").filter(Boolean);
  } catch (error) {
    console.log("No TS1005 errors found");
    return;
  }

  console.log(`🔍 Found ${filesWithErrors.length} files with TS1005 errors\n`);

  let totalFixes = 0;
  let processedFiles = 0;

  // Process files one by one with validation
  for (let i = 0; i < Math.min(filesWithErrors.length, 10); i++) {
    const file = filesWithErrors[i];
    console.log(`📦 Processing file ${i + 1}/10: ${file}`);

    const fixes = applySurgicalFixes(file);
    if (fixes > 0) {
      totalFixes += fixes;
      processedFiles++;
      console.log(`   ✅ Applied ${fixes} fixes`);

      // Validate after each file
      const currentErrors = getTS1005ErrorCount();
      if (currentErrors > initialErrors) {
        console.log("   ⚠️  Error count increased, reverting...");
        // Revert the file
        execSync(`git checkout HEAD -- "${file}"`);
        break;
      } else {
        console.log(`   📊 TS1005 errors: ${initialErrors} → ${currentErrors}`);
      }
    } else {
      console.log(`   ⏭️  No applicable fixes found`);
    }
  }

  const finalErrors = getTS1005ErrorCount();
  const errorsFixed = initialErrors - finalErrors;
  const reductionPercent =
    initialErrors > 0 ? ((errorsFixed / initialErrors) * 100).toFixed(1) : 0;

  console.log("\n📈 Final Results:");
  console.log(`   Initial TS1005 errors: ${initialErrors}`);
  console.log(`   Final TS1005 errors: ${finalErrors}`);
  console.log(`   TS1005 errors fixed: ${errorsFixed}`);
  console.log(`   TS1005 reduction: ${reductionPercent}%`);
  console.log(`   Files processed: ${processedFiles}`);
  console.log(`   Total fixes applied: ${totalFixes}`);
}

main().catch(console.error);

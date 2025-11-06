#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

console.log("🔧 Starting TS1005 Remaining Pattern Fixes...\n");

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

// Get specific TS1005 errors with line numbers
function getTS1005Errors() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    return output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
  } catch (error) {
    return [];
  }
}

// Parse error to get file, line, and expected token
function parseError(errorLine) {
  const match = errorLine.match(
    /^(.+?)\((\d+),(\d+)\): error TS1005: '(.+?)' expected\.$/,
  );
  if (match) {
    return {
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      expected: match[4],
    };
  }
  return null;
}

// Fix specific patterns in a file
function fixFilePatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  let fixCount = 0;

  // Pattern 1: Missing comma in function parameters
  // Example: function(param1: type param2: type) -> function(param1: type, param2: type)
  const commaPattern1 = /(\w+:\s*\w+)\s+(\w+:\s*\w+)/g;
  content = content.replace(commaPattern1, (match, p1, p2) => {
    fixCount++;
    return `${p1}, ${p2}`;
  });

  // Pattern 2: Missing comma in object literals
  // Example: { prop1: value prop2: value } -> { prop1: value, prop2: value }
  const commaPattern2 = /(\w+:\s*[^,}\n]+)\s+(\w+:\s*)/g;
  content = content.replace(commaPattern2, (match, p1, p2) => {
    if (!p1.endsWith(",") && !p1.endsWith(";")) {
      fixCount++;
      return `${p1}, ${p2}`;
    }
    return match;
  });

  // Pattern 3: Missing closing parenthesis in function calls
  // Look for lines that end with a comma but should end with )
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: expect(...).toBe(...,  -> expect(...).toBe(...);
    if (line.match(/\.toBe\([^)]*,\s*$/)) {
      lines[i] = line.replace(/,\s*$/, ");");
      fixCount++;
    }

    // Pattern: expect(...).toEqual(...,  -> expect(...).toEqual(...);
    if (line.match(/\.toEqual\([^)]*,\s*$/)) {
      lines[i] = line.replace(/,\s*$/, ");");
      fixCount++;
    }

    // Pattern: Missing closing brace in object literals
    if (line.match(/^\s*\w+:\s*[^{},]+\s*$/) && i < lines.length - 1) {
      const nextLine = lines[i + 1];
      if (nextLine.match(/^\s*\w+:/)) {
        lines[i] = line + ",";
        fixCount++;
      }
    }
  }
  content = lines.join("\n");

  // Pattern 4: Missing semicolon after statements
  // Example: const x = value -> const x = value;
  const semicolonPattern = /^(\s*const\s+\w+\s*=\s*[^;]+)$/gm;
  content = content.replace(semicolonPattern, (match, p1) => {
    if (!p1.endsWith(";") && !p1.endsWith(",") && !p1.endsWith("{")) {
      fixCount++;
      return `${p1};`;
    }
    return match;
  });

  // Pattern 5: Missing opening brace in function/object definitions
  // Example: function test() -> function test() {
  const bracePattern =
    /^(\s*(?:function\s+\w+\s*\([^)]*\)|test\s*\([^)]*\))\s*)$/gm;
  content = content.replace(bracePattern, (match, p1) => {
    fixCount++;
    return `${p1} {`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`   ✅ ${filePath}: ${fixCount} fixes applied`);
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

  // Get all files with TS1005 errors
  const errors = getTS1005Errors();
  const filesWithErrors = [
    ...new Set(
      errors
        .map((error) => {
          const parsed = parseError(error);
          return parsed ? parsed.file : null;
        })
        .filter(Boolean),
    ),
  ];

  console.log(`🔍 Found ${filesWithErrors.length} files with TS1005 errors\n`);

  let totalFixes = 0;
  let processedFiles = 0;

  // Process files in batches of 10
  const batchSize = 10;
  for (let i = 0; i < filesWithErrors.length; i += batchSize) {
    const batch = filesWithErrors.slice(i, i + batchSize);
    console.log(
      `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filesWithErrors.length / batchSize)} (${batch.length} files)`,
    );

    for (const file of batch) {
      const fixes = fixFilePatterns(file);
      if (fixes > 0) {
        totalFixes += fixes;
        processedFiles++;
      }
    }

    // Validate progress every batch
    const currentErrors = getTS1005ErrorCount();
    console.log(`   📊 TS1005 errors: ${initialErrors} → ${currentErrors}`);

    if (currentErrors > initialErrors) {
      console.log("   ⚠️  Error count increased, stopping...");
      break;
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

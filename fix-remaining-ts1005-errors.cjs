#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Fix remaining specific TS1005 error patterns
 */

function fixSpecificPatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  let fixCount = 0;

  // Fix JSX attribute syntax: prop={value}; -> prop={value}
  const jsxAttributePattern = /(\w+)=\{([^}]+)\};/g;
  content = content.replace(jsxAttributePattern, (match, prop, value) => {
    fixCount++;
    console.log(`  ✓ Fixed JSX attribute: ${prop}`);
    return `${prop}={${value}}`;
  });

  // Fix malformed function parameters: function(: any { param }) -> function({ param })
  const malformedParamPattern =
    /function\s+(\w+)\s*\(\s*:\s*any\s+(\{[^}]+\})/g;
  content = content.replace(
    malformedParamPattern,
    (match, funcName, params) => {
      fixCount++;
      console.log(`  ✓ Fixed function parameters: ${funcName}`);
      return `function ${funcName}(${params}`;
    },
  );

  // Fix arrow function parameters: (: any { param }) -> ({ param })
  const arrowParamPattern = /\(\s*:\s*any\s+(\{[^}]+\})\s*\)/g;
  content = content.replace(arrowParamPattern, (match, params) => {
    fixCount++;
    console.log(`  ✓ Fixed arrow function parameters`);
    return `(${params})`;
  });

  // Fix array destructuring with type annotations: ([_planet: any, position]: any) -> ([_planet, position]: any)
  const arrayDestructuringPattern =
    /\(\s*\[\s*([^:]+):\s*any\s*,\s*([^:]+)\s*\]\s*:\s*any\s*\)/g;
  content = content.replace(
    arrayDestructuringPattern,
    (match, first, second) => {
      fixCount++;
      console.log(`  ✓ Fixed array destructuring`);
      return `([${first.trim()}, ${second.trim()}]: any)`;
    },
  );

  // Fix object destructuring in forEach: .forEach(([_planet: any, position]: any) -> .forEach(([_planet, position]: any)
  const forEachDestructuringPattern =
    /\.forEach\s*\(\s*\(\s*\[\s*([^:]+):\s*any\s*,\s*([^:]+)\s*\]\s*:\s*any\s*\)/g;
  content = content.replace(
    forEachDestructuringPattern,
    (match, first, second) => {
      fixCount++;
      console.log(`  ✓ Fixed forEach destructuring`);
      return `.forEach(([${first.trim()}, ${second.trim()}]: any)`;
    },
  );

  // Fix template literal issues in replace: .replace(/\s+/g '-') -> .replace(/\s+/g, '-')
  const replacePattern = /\.replace\s*\(\s*([^,]+)\s+([^)]+)\s*\)/g;
  content = content.replace(replacePattern, (match, regex, replacement) => {
    if (!match.includes(",")) {
      fixCount++;
      console.log(`  ✓ Fixed replace method syntax`);
      return `.replace(${regex}, ${replacement})`;
    }
    return match;
  });

  // Fix malformed object entries: Object.entries(positions || []) -> Object.entries(positions || {})
  const objectEntriesPattern =
    /Object\.entries\s*\(\s*([^)]+)\s*\|\|\s*\[\s*\]\s*\)/g;
  content = content.replace(objectEntriesPattern, (match, obj) => {
    fixCount++;
    console.log(`  ✓ Fixed Object.entries with array fallback`);
    return `Object.entries(${obj.trim()} || {})`;
  });

  // Fix React component prop destructuring: ({ prop1, prop2, }: Props) -> ({ prop1, prop2 }: Props)
  const propDestructuringPattern =
    /\(\s*\{\s*([^}]+),\s*\}\s*:\s*([^)]+)\s*\)/g;
  content = content.replace(propDestructuringPattern, (match, props, type) => {
    fixCount++;
    console.log(`  ✓ Fixed prop destructuring trailing comma`);
    return `({ ${props.trim()} }: ${type.trim()})`;
  });

  // Fix data-testid template literals: `recipe-${recipe.toLowerCase().replace(/\s+/g '-')}`
  const dataTestIdPattern = /`([^`]*\.replace\([^,]+)\s+([^)]+)`/g;
  content = content.replace(dataTestIdPattern, (match, before, after) => {
    if (!before.includes(",")) {
      fixCount++;
      console.log(`  ✓ Fixed template literal replace syntax`);
      return `\`${before}, ${after}\``;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Fixed ${fixCount} specific patterns in: ${filePath}`);
    return true;
  }

  return false;
}

async function getTS1005ErrorFiles() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const errorLines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const files = new Set();

    errorLines.forEach((line) => {
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
    console.log("\n🔍 Validating TypeScript compilation...");
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    console.log("✅ TypeScript compilation successful");
    return true;
  } catch (error) {
    console.log("❌ TypeScript compilation failed");
    return false;
  }
}

async function main() {
  console.log("🚀 Fixing Remaining TS1005 Specific Patterns");
  console.log("============================================");

  const errorFiles = await getTS1005ErrorFiles();
  console.log(`📊 Found ${errorFiles.length} files with TS1005 errors`);

  if (errorFiles.length === 0) {
    console.log("🎉 No TS1005 errors found!");
    return;
  }

  let fixedCount = 0;

  // Process files with highest error counts first
  const priorityFiles = [
    "src/__tests__/astrologize-integration.test.ts",
    "src/__tests__/e2e/MainPageWorkflows.test.tsx",
  ].filter((file) => errorFiles.includes(file));

  console.log(`\n🎯 Processing ${priorityFiles.length} priority files:`);

  priorityFiles.forEach((filePath, index) => {
    console.log(
      `\n[${index + 1}/${priorityFiles.length}] Processing: ${filePath}`,
    );
    if (fixSpecificPatterns(filePath)) {
      fixedCount++;
    }
  });

  // Process remaining files
  const remainingFiles = errorFiles.filter(
    (file) => !priorityFiles.includes(file),
  );
  console.log(`\n📝 Processing ${remainingFiles.length} remaining files:`);

  remainingFiles.slice(0, 10).forEach((filePath, index) => {
    console.log(
      `\n[${index + 1}/${Math.min(10, remainingFiles.length)}] Processing: ${filePath}`,
    );
    if (fixSpecificPatterns(filePath)) {
      fixedCount++;
    }
  });

  // Validate build
  const buildSuccess = await validateBuild();

  // Final summary
  console.log("\n📈 SUMMARY");
  console.log("==========");
  console.log(
    `Files processed: ${priorityFiles.length + Math.min(10, remainingFiles.length)}`,
  );
  console.log(`Files modified: ${fixedCount}`);
  console.log(`Build successful: ${buildSuccess ? "Yes" : "No"}`);

  // Check final error count
  const finalErrorFiles = await getTS1005ErrorFiles();
  const reduction = errorFiles.length - finalErrorFiles.length;
  const reductionPercent =
    errorFiles.length > 0
      ? ((reduction / errorFiles.length) * 100).toFixed(1)
      : 0;

  console.log(`\n📊 Error Reduction:`);
  console.log(`Initial TS1005 errors: ${errorFiles.length} files`);
  console.log(`Final TS1005 errors: ${finalErrorFiles.length} files`);
  console.log(`Reduction: ${reduction} files (${reductionPercent}%)`);

  if (finalErrorFiles.length > 0) {
    console.log("\n🔍 Remaining error files (first 5):");
    finalErrorFiles.slice(0, 5).forEach((file) => console.log(`  - ${file}`));
  }

  console.log("\n✅ Specific pattern fixes completed!");
}

main().catch(console.error);

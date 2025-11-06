#!/usr/bin/env node

/**
 * Comprehensive Object Syntax Fix
 * Fixes all object literal and interface syntax errors
 */

const fs = require("fs");
const { execSync } = require("child_process");

function fixObjectSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`Fixing object syntax in: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 1. Fix object literal with opening brace followed by semicolon
  if (content.includes("= {;")) {
    content = content.replace(/=\s*{\s*;/g, "= {");
    modified = true;
    console.log(`  ✅ Fixed object literal opening brace syntax`);
  }

  // 2. Fix property declarations with semicolons instead of commas
  const propertyPattern = /(\s+)(\w+):\s*([^,;\n}]+);(\s*\n\s*)(\w+):/g;
  if (propertyPattern.test(content)) {
    content = content.replace(propertyPattern, "$1$2: $3,$4$5:");
    modified = true;
    console.log(`  ✅ Fixed property semicolon syntax`);
  }

  // 3. Fix object properties with trailing commas followed by semicolons
  const trailingCommaPattern =
    /(\w+:\s*[^,;\n}]+),(\s*\n\s*\w+:\s*[^,;\n}]+);/g;
  if (trailingCommaPattern.test(content)) {
    content = content.replace(trailingCommaPattern, "$1,$2,");
    modified = true;
    console.log(`  ✅ Fixed trailing comma-semicolon syntax`);
  }

  // 4. Fix object properties ending with semicolon in middle of object
  const midObjectSemicolon = /(\w+:\s*[^,;\n}]+);(\s*\n\s*\w+:)/g;
  if (midObjectSemicolon.test(content)) {
    content = content.replace(midObjectSemicolon, "$1,$2");
    modified = true;
    console.log(`  ✅ Fixed mid-object semicolon syntax`);
  }

  // 5. Fix object with comma followed by opening brace
  const commaOpenBrace = /(\w+:\s*[^,;\n}]+),(\s*\n\s*\w+:\s*{\s*),/g;
  if (commaOpenBrace.test(content)) {
    content = content.replace(commaOpenBrace, "$1,$2");
    modified = true;
    console.log(`  ✅ Fixed comma-open-brace syntax`);
  }

  // 6. Fix nested object syntax issues
  const nestedObjectPattern = /(\w+:\s*{\s*),/g;
  if (nestedObjectPattern.test(content)) {
    content = content.replace(nestedObjectPattern, "$1");
    modified = true;
    console.log(`  ✅ Fixed nested object syntax`);
  }

  // 7. Fix interface property syntax (semicolon-comma)
  const interfacePattern = /(\w+:\s*[^;,\n}]+);,/g;
  if (interfacePattern.test(content)) {
    content = content.replace(interfacePattern, "$1;");
    modified = true;
    console.log(`  ✅ Fixed interface semicolon-comma syntax`);
  }

  // 8. Fix last property in object with semicolon
  const lastPropertyPattern = /(\w+:\s*[^,;\n}]+);(\s*\n\s*})/g;
  if (lastPropertyPattern.test(content)) {
    content = content.replace(lastPropertyPattern, "$1$2");
    modified = true;
    console.log(`  ✅ Fixed last property semicolon syntax`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Successfully fixed ${filePath}`);
    return true;
  }

  return false;
}

function getAllTSFiles() {
  const files = [];

  function walkDir(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = `${dir}/${item}`;
        const stat = fs.statSync(fullPath);

        if (
          stat.isDirectory() &&
          !item.startsWith(".") &&
          item !== "node_modules"
        ) {
          walkDir(fullPath);
        } else if (
          stat.isFile() &&
          (item.endsWith(".ts") || item.endsWith(".tsx"))
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  walkDir("src");
  return files;
}

function getFilesFromBuildErrors() {
  try {
    execSync("yarn build", { stdio: "pipe", timeout: 30000 });
    return [];
  } catch (error) {
    const errorOutput =
      error.stdout?.toString() || error.stderr?.toString() || "";
    const fileMatches = errorOutput.match(/\.\/src\/[^\s]+\.tsx?/g);
    if (fileMatches) {
      return [...new Set(fileMatches.map((f) => f.replace("./", "")))];
    }
    return [];
  }
}

console.log("Starting Comprehensive Object Syntax Fix");

// First, fix files that have build errors
const errorFiles = getFilesFromBuildErrors();
console.log(`Found ${errorFiles.length} files with build errors`);

let totalFixed = 0;

// Fix error files first
for (const filePath of errorFiles) {
  if (fixObjectSyntax(filePath)) {
    totalFixed++;
  }
}

// Test build after fixing error files
console.log("\nTesting build after fixing error files...");
try {
  execSync("yarn build", { stdio: "pipe", timeout: 60000 });
  console.log("✅ Build successful after fixing error files!");
  console.log(`Total files fixed: ${totalFixed}`);
  process.exit(0);
} catch (error) {
  console.log(
    "❌ Build still has issues, continuing with comprehensive fix...",
  );
}

// If build still fails, fix all TypeScript files
const allFiles = getAllTSFiles();
console.log(`\nFixing all ${allFiles.length} TypeScript files...`);

for (const filePath of allFiles) {
  if (fixObjectSyntax(filePath)) {
    totalFixed++;
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);

// Final build test
console.log("\nFinal build test...");
try {
  execSync("yarn build", { stdio: "pipe", timeout: 90000 });
  console.log("🎉 Build successful!");
  console.log("✅ All object syntax errors fixed");
} catch (error) {
  console.log("❌ Some build issues remain");
  const errorOutput =
    error.stdout?.toString() || error.stderr?.toString() || "";
  console.log("Remaining errors:");
  console.log(errorOutput.split("\n").slice(0, 30).join("\n"));
}

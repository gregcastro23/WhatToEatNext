#!/usr/bin/env node

/**
 * Manual Interface Fix - Critical Syntax Errors
 */

const fs = require("fs");

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  console.log(`Fixing: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Fix interface property syntax - remove trailing commas after semicolons
  const fixes = [
    { pattern: /(\w+:\s*[^;,\n}]+);,/g, replacement: "$1;" },
    { pattern: /(\w+:\s*[^,\n}]+),(\s*\n\s*})/g, replacement: "$1$2" },
    { pattern: /(\w+:\s*[^,\n}]+),(\s*\n\s*\w+:)/g, replacement: "$1;$2" },
  ];

  for (const { pattern, replacement } of fixes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  console.log(`ℹ️ No changes needed for ${filePath}`);
  return false;
}

// Fix the specific files with interface errors
const filesToFix = [
  "src/context/AstrologicalContext.tsx",
  "src/contexts/AlchemicalContext/context.tsx",
];

let totalFixed = 0;

for (const filePath of filesToFix) {
  if (fixFile(filePath)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} files`);

// Test build
const { execSync } = require("child_process");
try {
  console.log("Testing build...");
  execSync("yarn build", { stdio: "pipe", timeout: 60000 });
  console.log("✅ Build successful!");
} catch (error) {
  console.log("❌ Build still has issues");
  console.log("First few lines of error:");
  const errorOutput =
    error.stdout?.toString() || error.stderr?.toString() || "";
  console.log(errorOutput.split("\n").slice(0, 20).join("\n"));
}

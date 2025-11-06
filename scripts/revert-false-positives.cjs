#!/usr/bin/env node
/**
 * Revert False Positives - Fix incorrect changes from property-colon-fixer
 */

const fs = require("fs");
const { execSync } = require("child_process");

function getAllTsFiles() {
  try {
    const output = execSync(
      'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"',
      { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
    );
    return output.trim().split("\n").filter(Boolean);
  } catch (error) {
    return [];
  }
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;
    let fixes = [];

    // Fix 1: const: [...] -> const [...]
    if (content.includes("const:")) {
      content = content.replace(/const:\s*\[/g, "const [");
      fixes.push("const:");
    }

    // Fix 2: let: [...] -> let [...]
    if (content.includes("let:")) {
      content = content.replace(/let:\s*\[/g, "let [");
      fixes.push("let:");
    }

    // Fix 3: try: { -> try {
    if (content.includes("try:")) {
      content = content.replace(/try:\s*{/g, "try {");
      fixes.push("try:");
    }

    // Fix 4: catch: ( -> catch (
    if (content.includes("catch:")) {
      content = content.replace(/catch:\s*\(/g, "catch (");
      fixes.push("catch:");
    }

    // Fix 5: case: 'value' -> case 'value'
    content = content.replace(/case:\s+(['"'])/g, "case $1");

    // Fix 6: default: : -> default:
    content = content.replace(/default:\s*:/g, "default:");

    // Fix 7: if: ( -> if (
    if (content.includes("if:")) {
      content = content.replace(/if:\s*\(/g, "if (");
      fixes.push("if:");
    }

    // Fix 8: for: ( -> for (
    if (content.includes("for:")) {
      content = content.replace(/for:\s*\(/g, "for (");
      fixes.push("for:");
    }

    // Fix 9: while: ( -> while (
    if (content.includes("while:")) {
      content = content.replace(/while:\s*\(/g, "while (");
      fixes.push("while:");
    }

    // Fix 10: function: name -> function name
    content = content.replace(/function:\s+(\w+)/g, "function $1");

    // Fix 11: return: value -> return value
    content = content.replace(/return:\s+([^:\n]+);/g, "return $1;");

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf-8");
      return { fixed: true, fixes };
    }
    return { fixed: false, fixes: [] };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

function main() {
  console.log("🔄 Revert False Positives\n");

  const files = getAllTsFiles();
  console.log(`Checking ${files.length} files\n`);

  let fixedCount = 0;
  let totalFixes = 0;

  files.forEach((file) => {
    const result = fixFile(file);

    if (result.fixed) {
      fixedCount++;
      totalFixes += result.fixes.length;
      const relativePath = file.replace(process.cwd() + "/", "");
      console.log(`✅ ${relativePath} (${result.fixes.join(", ")})`);
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount} files (${totalFixes} changes)\n`);
}

main();

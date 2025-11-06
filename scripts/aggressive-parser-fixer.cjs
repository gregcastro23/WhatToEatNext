#!/usr/bin/env node
/**
 * Aggressive Parser Fixer - Targets remaining stubborn parsing errors
 */

const fs = require("fs");
const { execSync } = require("child_process");

function getParsingErrorFiles() {
  try {
    const output = execSync(
      'yarn lint 2>&1 | grep -B 1 "Parsing error" | grep "^/" | sed "s/:$//" | sort -u',
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

    // Fix 1: Missing closing parens in if/for statements with opening brace
    const ifForPattern = /(if|for)\s*\(([^)]+)\s*{/g;
    if (content.match(ifForPattern)) {
      content = content.replace(ifForPattern, "$1 ($2) {");
      fixes.push("if/for missing closing paren");
    }

    // Fix 2: logger.method() calls split across lines incorrectly
    content = content.replace(
      /logger\.(info|warn|error|debug)\(\)\s*\n\s*([^,)]+),/g,
      "logger.$1($2,",
    );
    content = content.replace(
      /logger\.(info|warn|error|debug)\(\)\s*\n\s*([^,)]+)\)/g,
      "logger.$1($2)",
    );

    // Fix 3: NextResponse.json() split incorrectly
    content = content.replace(
      /NextResponse\.json\(\)\s*\n\s*{/g,
      "NextResponse.json({",
    );
    content = content.replace(
      /NextResponse\.json\(\)\s*\n\s*([^{])/g,
      "NextResponse.json($1",
    );

    // Fix 4: Function calls split with opening paren on new line
    content = content.replace(/(\w+)\(\)\s*\n\s*\(/g, "$1(");

    // Fix 5: Object destructuring with commas instead of semicolons after properties
    content = content.replace(/:\s*([^,\n}]+),(\s*\n\s*[})])/g, ": $1;$2");

    // Fix 6: Missing closing parens in array methods
    content = content.replace(
      /\.(map|filter|reduce|forEach|every|some)\(([^)]+)\s*{/g,
      ".$1($2) {",
    );

    // Fix 7: Extra semicolons before opening braces
    content = content.replace(/\);?\s*{/g, ") {");

    // Fix 8: Comma where semicolon should be in type definitions
    content = content.replace(
      /(interface|type)\s+(\w+)\s*{([^}]+)}/gs,
      (match, keyword, name, body) => {
        const fixedBody = body.replace(/:\s*([^,;\n]+),(\s*\n)/g, ": $1;$2");
        return `${keyword} ${name} {${fixedBody}}`;
      },
    );

    // Fix 9: Missing closing parens before opening brace in arrow functions
    content = content.replace(/=>\s*\(([^)]+)\s*{/g, "=> ($1) => {");

    // Fix 10: Stray semicolons in arrow function bodies
    content = content.replace(/=>\s*{;/g, "=> {");

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
  console.log("🔧 Aggressive Parser Fixer\n");

  const files = getParsingErrorFiles();
  console.log(`Found ${files.length} files with parsing errors\n`);

  if (files.length === 0) {
    console.log("✅ No parsing errors!\n");
    return;
  }

  let fixedCount = 0;

  files.forEach((file) => {
    const relativePath = file.replace(process.cwd() + "/", "");
    process.stdout.write(`Fixing ${relativePath}... `);

    const result = fixFile(file);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.fixed) {
      fixedCount++;
      console.log(`✅`);
    } else {
      console.log("⚠️");
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount}/${files.length} files\n`);
}

main();

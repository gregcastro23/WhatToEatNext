#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Fixing comma-related parsing errors...");

// Get specific files and line numbers with comma errors
let commaErrors = [];
try {
  const lintOutput = execSync("yarn lint 2>&1", {
    encoding: "utf8",
    stdio: "pipe",
  });
} catch (error) {
  const output = error.stdout.toString();
  const lines = output.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("error  Parsing error: ',' expected")) {
      // Get the file path from the previous line
      const prevLine = lines[i - 1];
      const match = prevLine.match(/^(.+)$/);
      if (match) {
        const filePath = match[1].trim();
        const lineMatch = line.match(/:(\d+):(\d+)/);
        if (lineMatch) {
          commaErrors.push({
            file: filePath,
            line: parseInt(lineMatch[1]),
            column: parseInt(lineMatch[2]),
          });
        }
      }
    }
  }
}

console.log(`Found ${commaErrors.length} comma-related parsing errors`);

// Common patterns that cause comma errors
const fixPatterns = [
  // Invalid parameter type annotations
  {
    pattern: /\(\[([^:]+):\s*any,\s*([^:]+)\]:\s*any\)/g,
    replacement: "([$1, $2]: [string, any])",
  },
  // Invalid array access
  {
    pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\.\[(\d+)\]/g,
    replacement: ".$1[$2]",
  },
  // Malformed object literals in JSON.stringify
  {
    pattern: /JSON\.stringify\(\{\}/g,
    replacement: "JSON.stringify({",
  },
  // Invalid template literal expressions
  {
    pattern: /\$\{([^}]*)\s*\.map\([^}]*\)\s*\.join\([^}]*\)\}/g,
    replacement: (match, variable) => {
      return `\${${variable}.map(item => \`-not -path "*/$\{item\}/*"\`).join(' ')}`;
    },
  },
];

let fixedFiles = 0;

// Group errors by file
const errorsByFile = {};
commaErrors.forEach((error) => {
  if (!errorsByFile[error.file]) {
    errorsByFile[error.file] = [];
  }
  errorsByFile[error.file].push(error);
});

for (const [filePath, errors] of Object.entries(errorsByFile)) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Apply fix patterns
    for (const pattern of fixPatterns) {
      content = content.replace(pattern.pattern, pattern.replacement);
    }

    // Manual fixes for specific line patterns
    const lines = content.split("\n");
    let modified = false;

    for (const error of errors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];

        // Fix common comma issues
        if (line.includes("forEach(([") && line.includes(": any")) {
          lines[lineIndex] = line.replace(
            /\(\[([^:]+):\s*any,\s*([^:]+)\]:\s*any\)/g,
            "([$1, $2]: [string, any])",
          );
          modified = true;
        }

        // Fix array access issues
        if (line.includes(".[")) {
          lines[lineIndex] = line.replace(
            /\.([a-zA-Z_][a-zA-Z0-9_]*)\.\[/g,
            ".$1[",
          );
          modified = true;
        }
      }
    }

    if (modified) {
      content = lines.join("\n");
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
      fixedFiles++;
    }
  }
}

console.log(`\n🎯 Fixed ${fixedFiles} files with comma errors`);

// Check remaining errors
try {
  const remainingErrors = execSync(
    'yarn lint 2>&1 | grep -c "Parsing error" || echo "0"',
    { encoding: "utf8" },
  ).trim();
  console.log(`📊 Remaining parsing errors: ${remainingErrors}`);
} catch (error) {
  console.log("📊 Could not count remaining errors");
}

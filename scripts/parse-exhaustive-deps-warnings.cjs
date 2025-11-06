#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Parse lint-results.txt to extract exhaustive-deps warnings
function parseExhaustiveDepsFromText() {
  const lintResultsPath = path.join(process.cwd(), "lint-results.txt");

  if (!fs.existsSync(lintResultsPath)) {
    console.error("lint-results.txt not found");
    return [];
  }

  const content = fs.readFileSync(lintResultsPath, "utf8");
  const lines = content.split("\n");

  const warnings = [];
  let currentFile = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for file path
    if (
      line.startsWith("/Users/") &&
      (line.endsWith(".tsx") || line.endsWith(".ts"))
    ) {
      currentFile = line.trim();
      continue;
    }

    // Check for exhaustive-deps warning
    if (line.includes("react-hooks/exhaustive-deps") && currentFile) {
      // Extract line and column numbers
      const match = line.match(
        /^\s*(\d+):(\d+)\s+warning\s+(.+?)\s+react-hooks\/exhaustive-deps/,
      );
      if (match) {
        warnings.push({
          file: currentFile,
          line: parseInt(match[1]),
          column: parseInt(match[2]),
          message: match[3].trim(),
        });
      }
    }
  }

  return warnings;
}

// Group warnings by type
function categorizeWarnings(warnings) {
  const categories = {
    missing: [],
    unnecessary: [],
    complex: [],
    other: [],
  };

  warnings.forEach((warning) => {
    if (warning.message.includes("missing dependency")) {
      categories.missing.push(warning);
    } else if (warning.message.includes("unnecessary dependency")) {
      categories.unnecessary.push(warning);
    } else if (warning.message.includes("complex expression")) {
      categories.complex.push(warning);
    } else {
      categories.other.push(warning);
    }
  });

  return categories;
}

// Main function
function main() {
  const warnings = parseExhaustiveDepsFromText();
  console.log(`Total exhaustive-deps warnings: ${warnings.length}`);

  const categories = categorizeWarnings(warnings);

  console.log("\nWarnings by category:");
  console.log(`- Missing dependencies: ${categories.missing.length}`);
  console.log(`- Unnecessary dependencies: ${categories.unnecessary.length}`);
  console.log(`- Complex expressions: ${categories.complex.length}`);
  console.log(`- Other: ${categories.other.length}`);

  // Group by file
  const byFile = {};
  warnings.forEach((warning) => {
    if (!byFile[warning.file]) {
      byFile[warning.file] = [];
    }
    byFile[warning.file].push(warning);
  });

  console.log("\nTop 10 files with most warnings:");
  const sortedFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);

  sortedFiles.forEach(([file, fileWarnings]) => {
    console.log(`  ${path.basename(file)}: ${fileWarnings.length} warnings`);
  });

  // Save to JSON for the enhanced fixer
  const output = {
    warnings,
    categories,
    byFile,
    summary: {
      total: warnings.length,
      files: Object.keys(byFile).length,
      missing: categories.missing.length,
      unnecessary: categories.unnecessary.length,
      complex: categories.complex.length,
    },
  };

  fs.writeFileSync(
    "exhaustive-deps-warnings.json",
    JSON.stringify(output, null, 2),
  );
  console.log("\nSaved detailed analysis to exhaustive-deps-warnings.json");
}

if (require.main === module) {
  main();
}

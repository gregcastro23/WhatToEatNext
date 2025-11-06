#!/usr/bin/env node

/**
 * Targeted Type Fixer
 *
 * Focuses on specific files with explicit any types for manual review
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🎯 Targeted Type Warning Analysis and Fixes\n");

// Get specific files with explicit any warnings
function getFilesWithExplicitAny() {
  try {
    const output = execSync(
      `
      yarn lint:quick --format=json 2>/dev/null |
      jq -r '.[] | select(.messages[] | .ruleId == "@typescript-eslint/no-explicit-any") | .filePath'
    `,
      { encoding: "utf8" },
    );

    return [
      ...new Set(
        output
          .trim()
          .split("\n")
          .filter((line) => line.trim()),
      ),
    ];
  } catch (error) {
    console.log("⚠️  Could not get JSON output, using alternative method...");

    // Alternative method using grep
    try {
      const output = execSync(
        `
        yarn lint:quick 2>&1 |
        grep -B1 "@typescript-eslint/no-explicit-any" |
        grep "^/" |
        sort | uniq
      `,
        { encoding: "utf8" },
      );

      return output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    } catch (altError) {
      console.log("Could not get files with explicit any");
      return [];
    }
  }
}

// Analyze a specific file for type issues
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(process.cwd(), filePath);

  // Count different types of any usage
  const analysis = {
    file: relativePath,
    totalLines: content.split("\n").length,
    anyTypes: {
      explicit: (content.match(/:\s*any\b/g) || []).length,
      arrays: (content.match(/any\[\]/g) || []).length,
      records: (content.match(/Record<[^>]*any[^>]*>/g) || []).length,
      promises: (content.match(/Promise<any>/g) || []).length,
      functions: (content.match(/\([^)]*any[^)]*\)/g) || []).length,
    },
    isDomainSpecific: isDomainSpecificFile(relativePath, content),
    complexity: getFileComplexity(content),
    safeFixes: getSafeFixes(content),
  };

  analysis.totalAnyUsage = Object.values(analysis.anyTypes).reduce(
    (sum, count) => sum + count,
    0,
  );

  return analysis;
}

function isDomainSpecificFile(filePath, content) {
  const domainPatterns = [
    "calculations/",
    "alchemicalEngine",
    "astrology",
    "planetary",
    "services/campaign/",
    "Intelligence",
    "astrological",
  ];

  const contentPatterns = [
    "planetInfo",
    "signInfo",
    "planetaryPositions",
    "astrologicalState",
    "campaignMetrics",
    "intelligenceSystem",
    "transitDates",
  ];

  const hasFilePattern = domainPatterns.some((pattern) =>
    filePath.toLowerCase().includes(pattern.toLowerCase()),
  );

  const hasContentPattern = contentPatterns.some((pattern) =>
    content.toLowerCase().includes(pattern.toLowerCase()),
  );

  return hasFilePattern || hasContentPattern;
}

function getFileComplexity(content) {
  const lines = content.split("\n");
  const complexityIndicators = {
    interfaces: (content.match(/interface\s+\w+/g) || []).length,
    types: (content.match(/type\s+\w+/g) || []).length,
    functions: (content.match(/function\s+\w+/g) || []).length,
    classes: (content.match(/class\s+\w+/g) || []).length,
    imports: (content.match(/^import\s+/gm) || []).length,
  };

  const totalComplexity = Object.values(complexityIndicators).reduce(
    (sum, count) => sum + count,
    0,
  );

  if (totalComplexity > 20) return "HIGH";
  if (totalComplexity > 10) return "MEDIUM";
  return "LOW";
}

function getSafeFixes(content) {
  const fixes = [];

  // Safe replacements that can be automated
  const safePatterns = {
    "any[]": "unknown[]",
    "Array<any>": "Array<unknown>",
    "Record<string, any>": "Record<string, unknown>",
    ": any =": ": unknown =",
    ": any;": ": unknown;",
    ": any,": ": unknown,",
    ": any)": ": unknown)",
  };

  for (const [pattern, replacement] of Object.entries(safePatterns)) {
    const matches = content.match(
      new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    );
    if (matches) {
      fixes.push({
        pattern,
        replacement,
        count: matches.length,
        safe: true,
      });
    }
  }

  return fixes;
}

// Apply safe fixes to a file
function applySafeFixes(filePath, fixes) {
  if (!fixes || fixes.length === 0) return false;

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const fix of fixes) {
    if (fix.safe && fix.count <= 5) {
      // Only apply if few occurrences
      const regex = new RegExp(
        fix.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      );
      const newContent = content.replace(regex, fix.replacement);

      if (newContent !== content) {
        content = newContent;
        modified = true;
        console.log(
          `    ✅ Applied: ${fix.pattern} → ${fix.replacement} (${fix.count} times)`,
        );
      }
    }
  }

  if (modified) {
    // Create backup
    fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath, "utf8"));
    fs.writeFileSync(filePath, content);
  }

  return modified;
}

// Main analysis
async function main() {
  const files = getFilesWithExplicitAny();
  console.log(`📁 Found ${files.length} files with explicit any types\n`);

  if (files.length === 0) {
    console.log("No files found with explicit any types");
    return;
  }

  const analyses = [];
  let processedCount = 0;
  let fixedCount = 0;

  console.log("🔍 Analyzing files...\n");

  for (const filePath of files.slice(0, 20)) {
    // Limit to first 20 files
    const analysis = analyzeFile(filePath);
    if (analysis) {
      analyses.push(analysis);
      processedCount++;

      console.log(`📝 ${analysis.file}`);
      console.log(
        `   Any types: ${analysis.totalAnyUsage} (explicit: ${analysis.anyTypes.explicit})`,
      );
      console.log(
        `   Domain-specific: ${analysis.isDomainSpecific ? "YES" : "NO"}`,
      );
      console.log(`   Complexity: ${analysis.complexity}`);
      console.log(`   Safe fixes available: ${analysis.safeFixes.length}`);

      // Apply safe fixes if not domain-specific and low complexity
      if (
        !analysis.isDomainSpecific &&
        analysis.complexity !== "HIGH" &&
        analysis.safeFixes.length > 0
      ) {
        const applied = applySafeFixes(filePath, analysis.safeFixes);
        if (applied) {
          fixedCount++;
          console.log(`   🔧 Applied safe fixes`);
        }
      } else if (analysis.isDomainSpecific) {
        console.log(`   🛡️  Preserved (domain-specific)`);
      } else if (analysis.complexity === "HIGH") {
        console.log(`   ⚠️  Requires manual review (high complexity)`);
      }

      console.log();
    }
  }

  // Generate summary
  console.log("📊 ANALYSIS SUMMARY");
  console.log("=".repeat(50));
  console.log(`Files analyzed: ${processedCount}`);
  console.log(`Files with safe fixes applied: ${fixedCount}`);
  console.log();

  // Categorize by priority
  const highPriority = analyses.filter(
    (a) => !a.isDomainSpecific && a.totalAnyUsage > 10,
  );
  const mediumPriority = analyses.filter(
    (a) => !a.isDomainSpecific && a.totalAnyUsage > 5 && a.totalAnyUsage <= 10,
  );
  const lowPriority = analyses.filter(
    (a) => !a.isDomainSpecific && a.totalAnyUsage <= 5,
  );
  const domainSpecific = analyses.filter((a) => a.isDomainSpecific);

  console.log("🎯 PRIORITIZATION:");
  console.log(
    `High Priority (>10 any types, non-domain): ${highPriority.length} files`,
  );
  console.log(
    `Medium Priority (5-10 any types, non-domain): ${mediumPriority.length} files`,
  );
  console.log(
    `Low Priority (≤5 any types, non-domain): ${lowPriority.length} files`,
  );
  console.log(
    `Domain-Specific (requires expert review): ${domainSpecific.length} files`,
  );
  console.log();

  // Show top files needing attention
  console.log("🔥 TOP FILES NEEDING MANUAL REVIEW:");
  const topFiles = analyses
    .filter((a) => !a.isDomainSpecific)
    .sort((a, b) => b.totalAnyUsage - a.totalAnyUsage)
    .slice(0, 5);

  for (const file of topFiles) {
    console.log(
      `   ${file.file}: ${file.totalAnyUsage} any types (${file.complexity} complexity)`,
    );
  }
  console.log();

  console.log("🛡️  DOMAIN-SPECIFIC FILES (preserve any types):");
  for (const file of domainSpecific.slice(0, 5)) {
    console.log(
      `   ${file.file}: ${file.totalAnyUsage} any types (domain logic)`,
    );
  }
  console.log();

  // Check progress
  try {
    const newCount = execSync(
      `
      yarn lint:quick 2>&1 |
      grep "@typescript-eslint/no-explicit-any" |
      wc -l
    `,
      { encoding: "utf8" },
    ).trim();

    console.log("📈 PROGRESS UPDATE:");
    console.log(`   Remaining explicit any warnings: ${newCount}`);
    console.log(`   Files processed in this run: ${processedCount}`);
    console.log(`   Files with fixes applied: ${fixedCount}`);
  } catch (error) {
    console.log("Could not check progress");
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      filesAnalyzed: processedCount,
      filesFixed: fixedCount,
      highPriority: highPriority.length,
      mediumPriority: mediumPriority.length,
      lowPriority: lowPriority.length,
      domainSpecific: domainSpecific.length,
    },
    analyses,
    recommendations: [
      "Focus on high-priority non-domain files first",
      "Review domain-specific files with astrological expert",
      "Apply automated fixes to low-complexity files",
      "Preserve any types in calculations and campaign systems",
    ],
  };

  fs.writeFileSync(
    "targeted-type-analysis-report.json",
    JSON.stringify(reportData, null, 2),
  );
  console.log(
    "\n📄 Detailed report saved to: targeted-type-analysis-report.json",
  );

  // Cleanup backups if build is successful
  try {
    execSync("yarn build 2>/dev/null", { stdio: "pipe" });
    console.log("✅ Build successful, cleaning up backups");
    execSync('find . -name "*.backup" -delete 2>/dev/null');
  } catch (error) {
    console.log("⚠️  Build failed, keeping backups for rollback");
  }
}

main().catch(console.error);

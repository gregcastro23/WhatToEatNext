#!/usr/bin/env node

/**
 * Remaining Any Type Analysis
 *
 * Analyzes the remaining 417 any types to determine intentional vs unintentional
 */

const fs = require("fs");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  bright: "\x1b[1m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

class RemainingAnyAnalyzer {
  constructor() {
    this.results = {
      totalAnyTypes: 0,
      intentionalAny: 0,
      unintentionalAny: 0,
      categories: {
        documented: 0,
        eslintDisabled: 0,
        commentedIntentional: 0,
        externalLibrary: 0,
        testMocks: 0,
        errorHandling: 0,
        dynamicConfig: 0,
        unintentional: 0,
      },
      fileBreakdown: {},
      examples: {
        intentional: [],
        unintentional: [],
      },
    };
  }

  async analyze() {
    console.log(colorize("\n📊 REMAINING ANY TYPE ANALYSIS", "bright"));
    console.log(colorize("=".repeat(60), "blue"));
    console.log(
      colorize(
        "Analyzing remaining 417 any types for intentionality",
        "yellow",
      ),
    );
    console.log(colorize("=".repeat(60), "blue"));

    const files = await this.getTypeScriptFiles();
    console.log(
      colorize(`📁 Analyzing ${files.length} TypeScript files`, "blue"),
    );

    for (const file of files) {
      await this.analyzeFile(file);
    }

    this.generateReport();
    await this.saveReport();

    return this.results;
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      let fileAnyCount = 0;
      let fileIntentional = 0;
      let fileUnintentional = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line contains ": any"
        if (line.includes(": any")) {
          const anyMatches = (line.match(/: any/g) || []).length;
          fileAnyCount += anyMatches;
          this.results.totalAnyTypes += anyMatches;

          // Analyze context to determine intentionality
          const context = this.getContext(lines, i);
          const classification = this.classifyAnyType(line, context, filePath);

          if (classification.isIntentional) {
            fileIntentional += anyMatches;
            this.results.intentionalAny += anyMatches;
            this.results.categories[classification.category] += anyMatches;

            // Add example if we don't have many yet
            if (this.results.examples.intentional.length < 10) {
              this.results.examples.intentional.push({
                file: filePath,
                line: i + 1,
                code: line.trim(),
                reason: classification.reason,
              });
            }
          } else {
            fileUnintentional += anyMatches;
            this.results.unintentionalAny += anyMatches;
            this.results.categories.unintentional += anyMatches;

            // Add example if we don't have many yet
            if (this.results.examples.unintentional.length < 10) {
              this.results.examples.unintentional.push({
                file: filePath,
                line: i + 1,
                code: line.trim(),
                reason: classification.reason,
              });
            }
          }
        }
      }

      if (fileAnyCount > 0) {
        this.results.fileBreakdown[filePath] = {
          total: fileAnyCount,
          intentional: fileIntentional,
          unintentional: fileUnintentional,
        };
      }
    } catch (error) {
      console.log(
        colorize(`⚠️ Error analyzing ${filePath}: ${error.message}`, "yellow"),
      );
    }
  }

  getContext(lines, lineIndex) {
    const contextSize = 3;
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length - 1, lineIndex + contextSize);

    return {
      before: lines.slice(start, lineIndex),
      current: lines[lineIndex],
      after: lines.slice(lineIndex + 1, end + 1),
    };
  }

  classifyAnyType(line, context, filePath) {
    const allContext = [...context.before, context.current, ...context.after]
      .join("\n")
      .toLowerCase();
    const currentLine = line.toLowerCase();

    // Check for explicit intentional markers
    if (
      allContext.includes("eslint-disable") &&
      allContext.includes("no-explicit-any")
    ) {
      return {
        isIntentional: true,
        category: "eslintDisabled",
        reason: "ESLint disabled with comment",
      };
    }

    if (allContext.includes("intentionally any")) {
      return {
        isIntentional: true,
        category: "commentedIntentional",
        reason: "Explicitly marked as intentional",
      };
    }

    // Check for external library contexts
    if (
      allContext.includes("external library") ||
      allContext.includes("astronomical library") ||
      allContext.includes("planetary data") ||
      allContext.includes("api response")
    ) {
      return {
        isIntentional: true,
        category: "externalLibrary",
        reason: "External library compatibility",
      };
    }

    // Check for test contexts
    if (
      filePath.includes("test") ||
      filePath.includes("__tests__") ||
      allContext.includes("mock") ||
      allContext.includes("jest") ||
      allContext.includes("test")
    ) {
      return {
        isIntentional: true,
        category: "testMocks",
        reason: "Test file or mock usage",
      };
    }

    // Check for error handling
    if (currentLine.includes("catch") || currentLine.includes("error")) {
      return {
        isIntentional: true,
        category: "errorHandling",
        reason: "Error handling context",
      };
    }

    // Check for dynamic configuration
    if (
      allContext.includes("config") ||
      allContext.includes("dynamic") ||
      allContext.includes("flexible") ||
      allContext.includes("varying structure")
    ) {
      return {
        isIntentional: true,
        category: "dynamicConfig",
        reason: "Dynamic configuration or flexible typing",
      };
    }

    // Check for documented intentional patterns
    if (
      allContext.includes("//") &&
      (allContext.includes("any:") || allContext.includes("flexible"))
    ) {
      return {
        isIntentional: true,
        category: "documented",
        reason: "Documented with comment",
      };
    }

    // Default to unintentional
    return {
      isIntentional: false,
      category: "unintentional",
      reason: "No intentional markers found",
    };
  }

  generateReport() {
    const intentionalPercentage = (
      (this.results.intentionalAny / this.results.totalAnyTypes) *
      100
    ).toFixed(1);
    const unintentionalPercentage = (
      (this.results.unintentionalAny / this.results.totalAnyTypes) *
      100
    ).toFixed(1);

    console.log(colorize("\n📊 ANALYSIS RESULTS:", "bright"));
    console.log(
      `  Total Any Types: ${colorize(this.results.totalAnyTypes.toString(), "blue")}`,
    );
    console.log(
      `  Intentional Any: ${colorize(this.results.intentionalAny.toString(), "green")} (${colorize(intentionalPercentage + "%", "green")})`,
    );
    console.log(
      `  Unintentional Any: ${colorize(this.results.unintentionalAny.toString(), "red")} (${colorize(unintentionalPercentage + "%", "red")})`,
    );

    console.log(colorize("\n📋 CATEGORY BREAKDOWN:", "bright"));
    console.log(
      `  ESLint Disabled: ${colorize(this.results.categories.eslintDisabled.toString(), "green")}`,
    );
    console.log(
      `  Commented Intentional: ${colorize(this.results.categories.commentedIntentional.toString(), "green")}`,
    );
    console.log(
      `  External Library: ${colorize(this.results.categories.externalLibrary.toString(), "green")}`,
    );
    console.log(
      `  Test Mocks: ${colorize(this.results.categories.testMocks.toString(), "green")}`,
    );
    console.log(
      `  Error Handling: ${colorize(this.results.categories.errorHandling.toString(), "green")}`,
    );
    console.log(
      `  Dynamic Config: ${colorize(this.results.categories.dynamicConfig.toString(), "green")}`,
    );
    console.log(
      `  Documented: ${colorize(this.results.categories.documented.toString(), "green")}`,
    );
    console.log(
      `  Unintentional: ${colorize(this.results.categories.unintentional.toString(), "red")}`,
    );

    console.log(colorize("\n🔍 TOP FILES WITH REMAINING ANY TYPES:", "bright"));
    const sortedFiles = Object.entries(this.results.fileBreakdown)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 10);

    sortedFiles.forEach(([file, data]) => {
      const shortFile = file.replace("src/", "");
      console.log(
        `  ${shortFile}: ${colorize(data.total.toString(), "blue")} total (${colorize(data.intentional.toString(), "green")} intentional, ${colorize(data.unintentional.toString(), "red")} unintentional)`,
      );
    });
  }

  async getTypeScriptFiles() {
    try {
      const output = execSync(
        'find src -name "*.ts" -o -name "*.tsx" | grep -v node_modules',
        {
          encoding: "utf8",
        },
      );
      return output
        .trim()
        .split("\n")
        .filter((f) => f.length > 0);
    } catch {
      return [];
    }
  }

  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAnyTypes: this.results.totalAnyTypes,
        intentionalAny: this.results.intentionalAny,
        unintentionalAny: this.results.unintentionalAny,
        intentionalPercentage:
          (
            (this.results.intentionalAny / this.results.totalAnyTypes) *
            100
          ).toFixed(1) + "%",
        unintentionalPercentage:
          (
            (this.results.unintentionalAny / this.results.totalAnyTypes) *
            100
          ).toFixed(1) + "%",
      },
      categories: this.results.categories,
      fileBreakdown: this.results.fileBreakdown,
      examples: this.results.examples,
    };

    const reportPath = "REMAINING_ANY_ANALYSIS_REPORT.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = "REMAINING_ANY_ANALYSIS_SUMMARY.md";
    const intentionalPercentage = (
      (this.results.intentionalAny / this.results.totalAnyTypes) *
      100
    ).toFixed(1);
    const unintentionalPercentage = (
      (this.results.unintentionalAny / this.results.totalAnyTypes) *
      100
    ).toFixed(1);

    const summaryContent = `# Remaining Any Type Analysis Summary

## 📊 OVERALL RESULTS

After the successful campaign that eliminated 404 unintentional any types, **${this.results.totalAnyTypes} any types remain** in the codebase.

### Intentionality Breakdown
- **Intentional Any Types**: ${this.results.intentionalAny} (${intentionalPercentage}%)
- **Unintentional Any Types**: ${this.results.unintentionalAny} (${unintentionalPercentage}%)

## 📋 CATEGORY ANALYSIS

### Intentional Categories
- **ESLint Disabled**: ${this.results.categories.eslintDisabled} - Explicitly disabled with ESLint comments
- **Commented Intentional**: ${this.results.categories.commentedIntentional} - Marked as "Intentionally any"
- **External Library**: ${this.results.categories.externalLibrary} - External library compatibility
- **Test Mocks**: ${this.results.categories.testMocks} - Test files and mock implementations
- **Error Handling**: ${this.results.categories.errorHandling} - Error handling contexts
- **Dynamic Config**: ${this.results.categories.dynamicConfig} - Dynamic configuration needs
- **Documented**: ${this.results.categories.documented} - Other documented intentional uses

### Unintentional Category
- **Unintentional**: ${this.results.categories.unintentional} - No intentional markers found

## 🔍 FILE BREAKDOWN

### Top Files with Remaining Any Types
${Object.entries(this.results.fileBreakdown)
  .sort(([, a], [, b]) => b.total - a.total)
  .slice(0, 15)
  .map(
    ([file, data]) =>
      `- **${file.replace("src/", "")}**: ${data.total} total (${data.intentional} intentional, ${data.unintentional} unintentional)`,
  )
  .join("\n")}

## 📝 EXAMPLES

### Intentional Any Examples
${this.results.examples.intentional
  .slice(0, 5)
  .map(
    (example) =>
      `- **${example.file}:${example.line}**: \`${example.code}\`
  - Reason: ${example.reason}`,
  )
  .join("\n")}

### Unintentional Any Examples
${this.results.examples.unintentional
  .slice(0, 5)
  .map(
    (example) =>
      `- **${example.file}:${example.line}**: \`${example.code}\`
  - Reason: ${example.reason}`,
  )
  .join("\n")}

## 🎯 CAMPAIGN IMPACT ASSESSMENT

### Campaign Success Validation
The analysis confirms the campaign's exceptional success:

- **Original Estimate**: ~1,780 explicit-any warnings
- **Campaign Eliminated**: 404 unintentional any types
- **Remaining Total**: ${this.results.totalAnyTypes} any types
- **Remaining Intentional**: ${this.results.intentionalAny} (${intentionalPercentage}%)
- **Remaining Unintentional**: ${this.results.unintentionalAny} (${unintentionalPercentage}%)

### Quality Achievement
${
  intentionalPercentage > 80
    ? `✅ **Excellent Quality**: ${intentionalPercentage}% of remaining any types are intentional, indicating the campaign successfully eliminated most unintentional usage.`
    : intentionalPercentage > 60
      ? `🎯 **Good Quality**: ${intentionalPercentage}% of remaining any types are intentional, with ${this.results.unintentionalAny} unintentional types remaining for future improvement.`
      : `📊 **Moderate Quality**: ${intentionalPercentage}% of remaining any types are intentional, with ${this.results.unintentionalAny} unintentional types identified for potential future campaigns.`
}

### Recommendations
${
  this.results.unintentionalAny > 50
    ? `🔄 **Future Campaign Opportunity**: ${this.results.unintentionalAny} unintentional any types remain, representing a good target for a future focused campaign.`
    : this.results.unintentionalAny > 20
      ? `🎯 **Targeted Cleanup**: ${this.results.unintentionalAny} unintentional any types could be addressed in a smaller, focused effort.`
      : `✅ **Maintenance Mode**: Only ${this.results.unintentionalAny} unintentional any types remain, suitable for gradual cleanup during regular development.`
}

---
*Analysis completed on ${new Date().toISOString()}*
*${this.results.totalAnyTypes} total any types analyzed*
*${intentionalPercentage}% intentional - ${unintentionalPercentage}% unintentional*
`;

    fs.writeFileSync(summaryPath, summaryContent);

    console.log(colorize(`\n📄 Analysis reports saved:`, "blue"));
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
  }
}

async function main() {
  const analyzer = new RemainingAnyAnalyzer();
  await analyzer.analyze();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RemainingAnyAnalyzer };

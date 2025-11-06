#!/usr/bin/env node

/**
 * Performance Warning Optimizer
 *
 * Identifies and fixes performance-related warnings in the codebase
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("⚡ Performance Warning Analysis and Optimization\n");

// Performance-related ESLint rules to analyze
const PERFORMANCE_RULES = {
  "react-hooks/exhaustive-deps": {
    description: "Missing dependencies in React hooks",
    severity: "HIGH",
    category: "React Performance",
  },
  "no-constant-condition": {
    description: "Constant conditions that may indicate dead code",
    severity: "MEDIUM",
    category: "Code Efficiency",
  },
  "no-unreachable": {
    description: "Unreachable code after return/throw",
    severity: "MEDIUM",
    category: "Dead Code",
  },
  "no-useless-catch": {
    description: "Catch clauses that only rethrow",
    severity: "LOW",
    category: "Code Efficiency",
  },
  "no-fallthrough": {
    description: "Switch case fallthrough",
    severity: "MEDIUM",
    category: "Logic Efficiency",
  },
  "no-useless-escape": {
    description: "Unnecessary escape characters",
    severity: "LOW",
    category: "Code Efficiency",
  },
};

class PerformanceOptimizer {
  constructor() {
    this.findings = [];
    this.fixedIssues = [];
    this.preservedPatterns = [];
  }

  async analyzePerformanceWarnings() {
    console.log("🔍 Analyzing performance-related warnings...\n");

    // Get performance warnings by rule
    const warningsByRule = await this.getWarningsByRule();

    console.log("📊 Performance Warning Distribution:");
    console.log("=".repeat(50));

    let totalWarnings = 0;
    for (const [rule, count] of Object.entries(warningsByRule)) {
      if (PERFORMANCE_RULES[rule]) {
        const info = PERFORMANCE_RULES[rule];
        console.log(`${rule}: ${count} warnings (${info.severity})`);
        console.log(`   Category: ${info.category}`);
        console.log(`   Description: ${info.description}`);
        console.log();
        totalWarnings += count;
      }
    }

    console.log(`Total performance warnings: ${totalWarnings}\n`);

    // Analyze specific files with performance issues
    await this.analyzeSpecificFiles();

    // Generate optimization recommendations
    this.generateOptimizationReport();
  }

  async getWarningsByRule() {
    try {
      const output = execSync(
        `
        yarn lint:quick 2>&1 |
        grep -E "(react-hooks/exhaustive-deps|no-constant-condition|no-unreachable|no-useless|no-fallthrough)" |
        sed 's/.*warning  //' |
        sed 's/.*error  //' |
        awk '{print $NF}' |
        sort | uniq -c
      `,
        { encoding: "utf8" },
      );

      const warnings = {};
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
        if (match) {
          warnings[match[2].trim()] = parseInt(match[1]);
        }
      }

      return warnings;
    } catch (error) {
      console.log("Could not get warning distribution");
      return {};
    }
  }

  async analyzeSpecificFiles() {
    console.log("🎯 Analyzing High-Impact Performance Files:\n");

    // Get files with React hooks issues
    const hooksFiles = await this.getFilesWithHooksIssues();

    if (hooksFiles.length > 0) {
      console.log("⚛️  React Hooks Performance Issues:");
      for (const file of hooksFiles.slice(0, 5)) {
        console.log(`   📝 ${file.file}: ${file.count} hooks warnings`);
        await this.analyzeHooksFile(file.file);
      }
      console.log();
    }

    // Get files with constant conditions
    const constantFiles = await this.getFilesWithConstantConditions();

    if (constantFiles.length > 0) {
      console.log("🔄 Constant Condition Issues:");
      for (const file of constantFiles.slice(0, 3)) {
        console.log(`   📝 ${file.file}: ${file.count} constant conditions`);
        await this.analyzeConstantConditions(file.file);
      }
      console.log();
    }
  }

  async getFilesWithHooksIssues() {
    try {
      const output = execSync(
        `
        yarn lint:quick 2>&1 |
        grep "react-hooks/exhaustive-deps" |
        cut -d: -f1 |
        sort | uniq -c |
        sort -nr
      `,
        { encoding: "utf8" },
      );

      const files = [];
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
        if (match) {
          files.push({
            count: parseInt(match[1]),
            file: path.relative(process.cwd(), match[2].trim()),
          });
        }
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  async getFilesWithConstantConditions() {
    try {
      const output = execSync(
        `
        yarn lint:quick 2>&1 |
        grep "no-constant-condition" |
        cut -d: -f1 |
        sort | uniq -c |
        sort -nr
      `,
        { encoding: "utf8" },
      );

      const files = [];
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
        if (match) {
          files.push({
            count: parseInt(match[1]),
            file: path.relative(process.cwd(), match[2].trim()),
          });
        }
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  async analyzeHooksFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Analyze hooks patterns
    const hooksPatterns = {
      useEffect: (content.match(/useEffect\s*\(/g) || []).length,
      useCallback: (content.match(/useCallback\s*\(/g) || []).length,
      useMemo: (content.match(/useMemo\s*\(/g) || []).length,
      useState: (content.match(/useState\s*\(/g) || []).length,
    };

    const totalHooks = Object.values(hooksPatterns).reduce(
      (sum, count) => sum + count,
      0,
    );

    console.log(
      `      Hooks usage: ${totalHooks} total (useEffect: ${hooksPatterns.useEffect}, useCallback: ${hooksPatterns.useCallback}, useMemo: ${hooksPatterns.useMemo})`,
    );

    // Check for common performance patterns
    const performancePatterns = {
      missingDeps: content.includes("missing dependency"),
      objectInDeps: content.includes("object makes the dependencies"),
      functionInDeps: content.includes("function makes the dependencies"),
      complexDeps: (content.match(/\[.*,.*,.*\]/g) || []).length,
    };

    if (performancePatterns.missingDeps) {
      console.log(`      ⚠️  Missing dependencies detected`);
    }
    if (performancePatterns.objectInDeps) {
      console.log(`      ⚠️  Object dependencies causing re-renders`);
    }
    if (performancePatterns.complexDeps) {
      console.log(
        `      ⚠️  Complex dependency arrays: ${performancePatterns.complexDeps}`,
      );
    }
  }

  async analyzeConstantConditions(filePath) {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");

    // Look for constant condition patterns
    const constantPatterns = {
      trueConditions: (content.match(/if\s*\(\s*true\s*\)/g) || []).length,
      falseConditions: (content.match(/if\s*\(\s*false\s*\)/g) || []).length,
      whileTrue: (content.match(/while\s*\(\s*true\s*\)/g) || []).length,
      ternaryConstants: (content.match(/\?\s*true\s*:\s*false/g) || []).length,
    };

    const totalConstants = Object.values(constantPatterns).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalConstants > 0) {
      console.log(`      Constant patterns: ${totalConstants} total`);
      if (constantPatterns.whileTrue > 0) {
        console.log(
          `      ⚠️  while(true) loops: ${constantPatterns.whileTrue} (may be intentional)`,
        );
      }
      if (constantPatterns.trueConditions > 0) {
        console.log(
          `      ⚠️  if(true) conditions: ${constantPatterns.trueConditions}`,
        );
      }
    }
  }

  generateOptimizationReport() {
    console.log("⚡ PERFORMANCE OPTIMIZATION RECOMMENDATIONS");
    console.log("=".repeat(50));

    console.log("🎯 HIGH PRIORITY OPTIMIZATIONS:");
    console.log();

    console.log("1. **React Hooks Dependencies**");
    console.log(
      "   - Add missing dependencies to useEffect, useCallback, useMemo",
    );
    console.log("   - Use useCallback for function dependencies");
    console.log("   - Use useMemo for object dependencies");
    console.log("   - Consider splitting complex effects into smaller ones");
    console.log();

    console.log("2. **Constant Conditions**");
    console.log("   - Review if(true) and if(false) conditions");
    console.log("   - Remove unreachable code after constant conditions");
    console.log("   - Consider using feature flags for conditional code");
    console.log();

    console.log("3. **Code Efficiency**");
    console.log("   - Remove useless catch blocks that only rethrow");
    console.log("   - Add break statements to prevent switch fallthrough");
    console.log("   - Remove unnecessary escape characters in strings");
    console.log();

    console.log("🔧 AUTOMATED FIXES AVAILABLE:");
    console.log("   - ESLint auto-fix can handle some useless-escape issues");
    console.log("   - Constant conditions may need manual review");
    console.log("   - React hooks dependencies require careful analysis");
    console.log();

    console.log("🛡️  DOMAIN-SPECIFIC CONSIDERATIONS:");
    console.log(
      "   - Astrological calculations may have intentional constant conditions",
    );
    console.log("   - Campaign system hooks may have complex dependencies");
    console.log("   - Test files may have intentional while(true) loops");
    console.log();

    console.log("📈 PERFORMANCE IMPACT:");
    console.log(
      "   - Fixing hooks dependencies: HIGH impact (prevents unnecessary re-renders)",
    );
    console.log("   - Removing dead code: MEDIUM impact (reduces bundle size)");
    console.log("   - Code cleanup: LOW impact (improves maintainability)");
    console.log();

    // Check current performance metrics
    this.checkPerformanceMetrics();

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalWarnings: this.findings.length,
        fixedIssues: this.fixedIssues.length,
        preservedPatterns: this.preservedPatterns.length,
      },
      recommendations: [
        "Focus on React hooks dependencies first (highest performance impact)",
        "Review constant conditions for dead code elimination",
        "Apply ESLint auto-fixes for simple efficiency issues",
        "Preserve intentional patterns in domain-specific code",
      ],
      findings: this.findings,
      fixedIssues: this.fixedIssues,
    };

    fs.writeFileSync(
      "performance-optimization-report.json",
      JSON.stringify(reportData, null, 2),
    );
    console.log(
      "📄 Detailed report saved to: performance-optimization-report.json",
    );
  }

  checkPerformanceMetrics() {
    try {
      console.log("📊 CURRENT PERFORMANCE METRICS:");

      // Check build time
      const startTime = Date.now();
      execSync("yarn build 2>/dev/null", { stdio: "pipe" });
      const buildTime = (Date.now() - startTime) / 1000;

      console.log(`   Build time: ${buildTime.toFixed(1)}s`);

      // Check bundle size if available
      try {
        const stats = fs.statSync(".next/static");
        console.log(`   Build output exists: ✅`);
      } catch (error) {
        console.log(`   Build output: Not available`);
      }

      // Check warning counts
      const hooksWarnings = execSync(
        `
        yarn lint:quick 2>&1 |
        grep "react-hooks/exhaustive-deps" |
        wc -l
      `,
        { encoding: "utf8" },
      ).trim();

      const constantWarnings = execSync(
        `
        yarn lint:quick 2>&1 |
        grep "no-constant-condition" |
        wc -l
      `,
        { encoding: "utf8" },
      ).trim();

      console.log(`   React hooks warnings: ${hooksWarnings}`);
      console.log(`   Constant condition warnings: ${constantWarnings}`);
    } catch (error) {
      console.log("   Could not check performance metrics");
    }
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer.analyzePerformanceWarnings().catch(console.error);
}

module.exports = PerformanceOptimizer;

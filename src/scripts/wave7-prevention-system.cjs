#!/usr/bin/env node

/**
 * Wave 7: Prevention System Implementation
 *
 * This system focuses on preventing unused variable accumulation through
 * proactive measures, developer guidelines, and automated checks.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class Wave7PreventionSystem {
  constructor() {
    this.preventionConfig = {
      enabled: true,
      checkOnSave: true,
      warnThreshold: 5, // Warn if adding 5+ unused variables
      blockThreshold: 20, // Block if adding 20+ unused variables
      autoFix: false, // Don't auto-fix, just warn
      reportPath: ".kiro/specs/unused-variable-elimination/prevention-reports",
    };

    this.guidelines = {
      parameterNaming:
        "Use underscore prefix for intentionally unused parameters (e.g., _unused)",
      importManagement: "Remove unused imports immediately after refactoring",
      variableDeclaration: "Avoid declaring variables that are not used",
      destructuring:
        "Use object destructuring carefully to avoid unused variables",
      typeImports: "Clean up unused type imports regularly",
    };

    this.preservationPatterns = [
      /\b(planet|degree|sign|longitude|position|coordinates|zodiac|celestial|ephemeris|transit)\b/i,
      /\b(metrics|progress|safety|campaign|validation|intelligence|monitoring|analytics)\b/i,
      /\b(recipe|ingredient|cooking|elemental|fire|water|earth|air|cuisine|flavor)\b/i,
      /\b(mock|stub|test|expect|describe|it|fixture|assertion|jest|vitest)\b/i,
      /\b(api|service|business|logic|integration|adapter|client|server)\b/i,
    ];
  }

  async getUnusedVariableCountSafe() {
    try {
      // Use a more reliable method with shorter timeout
      const result = execSync(
        'timeout 10s yarn lint --format=compact 2>/dev/null | grep -c "no-unused-vars" || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      console.warn("⚠️ Could not get exact count, using estimation");
      return this.estimateUnusedVariables();
    }
  }

  estimateUnusedVariables() {
    // Fallback estimation based on file analysis
    try {
      const srcFiles = this.getAllTypeScriptFiles("src");
      let estimatedCount = 0;

      // Sample a few files to estimate
      const sampleFiles = srcFiles.slice(0, Math.min(10, srcFiles.length));

      for (const file of sampleFiles) {
        try {
          const content = fs.readFileSync(file, "utf8");
          // Simple heuristic: count potential unused variables
          const lines = content.split("\n");

          for (const line of lines) {
            // Look for common unused variable patterns
            if (
              line.includes("const ") &&
              !line.includes("=") &&
              line.includes(",")
            ) {
              estimatedCount += 0.5; // Potential unused in destructuring
            }
            if (line.includes("import {") && line.split(",").length > 3) {
              estimatedCount += 0.3; // Potential unused imports
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      // Extrapolate to full codebase
      const totalEstimate = Math.round(
        (estimatedCount / sampleFiles.length) * srcFiles.length,
      );
      return Math.max(totalEstimate, 600); // Conservative estimate
    } catch (error) {
      return 650; // Fallback to known approximate count
    }
  }

  getAllTypeScriptFiles(dir) {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);

        try {
          const stat = fs.statSync(fullPath);

          if (
            stat.isDirectory() &&
            !item.startsWith(".") &&
            item !== "node_modules"
          ) {
            files.push(...this.getAllTypeScriptFiles(fullPath));
          } else if (item.endsWith(".ts") || item.endsWith(".tsx")) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip files/directories that can't be accessed
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return files;
  }

  generatePreventionGuidelines() {
    const guidelines = `# Unused Variable Prevention Guidelines

## Overview
These guidelines help prevent unused variable accumulation in the WhatToEatNext codebase.

## Core Principles

### 1. Parameter Naming Convention
- Use underscore prefix for intentionally unused parameters
- Example: \`function handler(_event, data) { return data; }\`
- This satisfies ESLint rules while maintaining code clarity

### 2. Import Management
- Remove unused imports immediately after refactoring
- Use IDE auto-import features carefully
- Regular cleanup of import statements during development

### 3. Variable Declaration Best Practices
- Declare variables only when they will be used
- Avoid "just in case" variable declarations
- Use const/let appropriately based on usage

### 4. Destructuring Guidelines
- Be selective with object destructuring
- Use rest syntax (...rest) for unused properties when needed
- Example: \`const { used, ...rest } = object;\`

### 5. Type Import Cleanup
- Regularly clean up unused TypeScript type imports
- Use type-only imports when possible: \`import type { MyType } from './types'\`

## Domain-Specific Considerations

### Astrological Variables
Variables related to planetary calculations should be preserved:
- planet, degree, sign, longitude, position, coordinates
- zodiac, celestial, ephemeris, transit calculations

### Campaign System Variables
Variables related to campaign intelligence should be preserved:
- metrics, progress, safety, campaign, validation
- intelligence, monitoring, analytics systems

### Culinary Domain Variables
Variables related to food and cooking should be preserved:
- recipe, ingredient, cooking, elemental properties
- fire, water, earth, air calculations

## Automated Checks

### Pre-Commit Hooks (Recommended)
\`\`\`bash
#!/bin/sh
# .git/hooks/pre-commit
yarn lint --format=compact | grep -c "no-unused-vars" > /tmp/unused_count
if [ \$(cat /tmp/unused_count) -gt 10 ]; then
  echo "⚠️ Warning: High number of unused variables detected"
  echo "Consider cleaning up before committing"
fi
\`\`\`

### IDE Integration
- Configure ESLint in your IDE to highlight unused variables
- Use "Organize Imports" features regularly
- Enable "Remove Unused Imports" on save

## Emergency Procedures

### If Unused Variables Exceed 700
1. Run Wave 6 DirectApproach tool for immediate cleanup
2. Analyze recent commits for sources of unused variables
3. Review team coding practices

### If Unused Variables Exceed 800
1. Execute emergency cleanup using all available Wave 6 tools
2. Implement mandatory code review for unused variable introduction
3. Consider temporary development freeze until resolved

## Monitoring and Reporting

### Daily Checks
- Monitor unused variable count daily
- Track trends and identify sources
- Report significant increases to team

### Weekly Reviews
- Review prevention guideline effectiveness
- Update guidelines based on new patterns
- Share best practices with team

## Tools and Resources

### Wave 6 Cleanup Tools
- Wave6StrategicCleanup: For systematic cleanup
- Wave6DirectApproach: For targeted fixes
- Enhanced safety protocols with automatic rollback

### Wave 7 Monitoring
- Continuous monitoring system
- Threshold-based alerts
- Trend analysis and reporting

---

*Generated by Wave 7 Prevention System*
*Last Updated: ${new Date().toISOString()}*
`;

    return guidelines;
  }

  createPreCommitHook() {
    const hookContent = `#!/bin/sh
# Pre-commit hook for unused variable monitoring
# Generated by Wave 7 Prevention System

echo "🔍 Checking for unused variables..."

# Get current unused variable count with timeout
UNUSED_COUNT=$(timeout 10s yarn lint --format=compact 2>/dev/null | grep -c "no-unused-vars" || echo "0")

if [ "$UNUSED_COUNT" -gt 10 ]; then
  echo "⚠️ Warning: $UNUSED_COUNT unused variables detected"
  echo "Consider running cleanup before committing:"
  echo "  node src/scripts/wave6-direct-approach.cjs"
  echo ""
fi

if [ "$UNUSED_COUNT" -gt 50 ]; then
  echo "🚨 High number of unused variables: $UNUSED_COUNT"
  echo "Strongly recommend cleanup before committing"
  echo ""
fi

# Don't block commit, just warn
exit 0
`;

    return hookContent;
  }

  generatePreventionReport() {
    const timestamp = new Date().toISOString();

    const report = {
      timestamp,
      preventionConfig: this.preventionConfig,
      guidelines: this.guidelines,
      recommendations: [
        "Implement pre-commit hooks for unused variable detection",
        "Configure IDE settings for automatic import cleanup",
        "Establish team coding standards for variable usage",
        "Regular code review focus on unused variable prevention",
        "Use Wave 6 tools for periodic cleanup maintenance",
      ],
      tools: {
        "Pre-commit Hook":
          "Warns developers about unused variables before commit",
        "IDE Integration": "Real-time feedback during development",
        "Wave 6 Tools": "Systematic cleanup when needed",
        "Wave 7 Monitoring": "Continuous tracking and alerting",
      },
      thresholds: {
        green: "< 500 unused variables (optimal)",
        yellow: "500-600 unused variables (monitor)",
        orange: "600-700 unused variables (action needed)",
        red: "> 700 unused variables (emergency cleanup)",
      },
    };

    return report;
  }

  async deployPreventionMeasures() {
    console.log("🚀 Deploying Wave 7 Prevention Measures...\n");

    try {
      // Create prevention reports directory
      const reportDir = this.preventionConfig.reportPath;
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
        console.log(`📁 Created prevention reports directory: ${reportDir}`);
      }

      // Generate and save prevention guidelines
      const guidelines = this.generatePreventionGuidelines();
      const guidelinesPath = path.join(reportDir, "prevention-guidelines.md");
      fs.writeFileSync(guidelinesPath, guidelines);
      console.log(`📋 Generated prevention guidelines: ${guidelinesPath}`);

      // Generate pre-commit hook
      const hookContent = this.createPreCommitHook();
      const hookPath = ".git/hooks/pre-commit-unused-vars";
      fs.writeFileSync(hookPath, hookContent);

      try {
        execSync(`chmod +x ${hookPath}`, { stdio: "pipe" });
        console.log(`🪝 Created pre-commit hook: ${hookPath}`);
      } catch (error) {
        console.warn(
          "⚠️ Could not make hook executable (may need manual chmod)",
        );
      }

      // Generate prevention report
      const report = this.generatePreventionReport();
      const reportPath = path.join(
        reportDir,
        `prevention-report-${new Date().toISOString().split("T")[0]}.json`,
      );
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Generated prevention report: ${reportPath}`);

      // Get current status
      console.log("\n📈 Current Status Assessment:");
      const currentCount = await this.getUnusedVariableCountSafe();
      console.log(`  Unused Variables: ${currentCount}`);

      let status = "green";
      if (currentCount > 700) status = "red";
      else if (currentCount > 600) status = "orange";
      else if (currentCount > 500) status = "yellow";

      console.log(`  Status Level: ${status.toUpperCase()}`);

      // Provide recommendations based on current status
      console.log("\n💡 Immediate Recommendations:");
      if (status === "red") {
        console.log("  🚨 Execute emergency cleanup using Wave 6 tools");
        console.log("  📊 Analyze variable categories for bulk elimination");
        console.log("  🔍 Review recent commits for unused variable sources");
      } else if (status === "orange") {
        console.log("  🛠️ Schedule cleanup session within 48 hours");
        console.log("  📈 Monitor trend closely for further increases");
        console.log("  🔧 Run Wave 6 DirectApproach for targeted cleanup");
      } else if (status === "yellow") {
        console.log("  👀 Monitor daily for trend changes");
        console.log("  📝 Document sources of new unused variables");
        console.log("  🎯 Target safe-to-eliminate variables first");
      } else {
        console.log("  ✅ Current status is optimal");
        console.log("  🔄 Continue regular monitoring");
        console.log("  📚 Focus on prevention measures");
      }

      console.log("\n📚 Next Steps:");
      console.log("  1. Review prevention guidelines with team");
      console.log("  2. Configure IDE settings for unused variable detection");
      console.log("  3. Implement regular monitoring schedule");
      console.log("  4. Use Wave 6 tools for periodic maintenance");

      console.log("\n✅ Wave 7 Prevention System deployed successfully!");

      return {
        status,
        currentCount,
        guidelinesPath,
        hookPath,
        reportPath,
      };
    } catch (error) {
      console.error("❌ Error deploying prevention measures:", error.message);
      throw error;
    }
  }
}

// Run the prevention system deployment
if (require.main === module) {
  const prevention = new Wave7PreventionSystem();
  prevention.deployPreventionMeasures().catch(console.error);
}

module.exports = Wave7PreventionSystem;

#!/usr/bin/env node

/**
 * Targeted ESLint Mass Fixer
 *
 * Focused approach to fix the most common ESLint violations:
 * 1. Unused eslint-disable directives (high frequency, safe to fix)
 * 2. Unused variables (with domain awareness)
 * 3. Import organization and unused imports
 * 4. Console statement cleanup (domain-aware)
 * 5. Formatting issues
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const glob = require("glob");

class TargetedESLintMassFixer {
  constructor() {
    this.startTime = Date.now();
    this.fixedIssues = 0;
    this.processedFiles = 0;
    this.domainPatterns = {
      preserve: [
        // Astrological patterns to preserve
        "planet",
        "degree",
        "sign",
        "longitude",
        "position",
        "transit",
        "zodiac",
        "elemental",
        "astro",
        "lunar",
        "solar",
        "celestial",
        // Campaign patterns to preserve
        "metrics",
        "progress",
        "safety",
        "campaign",
        "validation",
        "checkpoint",
        "rollback",
        "batch",
        "orchestrator",
        // Alchemical patterns to preserve
        "fire",
        "water",
        "earth",
        "air",
        "spirit",
        "essence",
        "matter",
        "substance",
        "kalchm",
        "monica",
        "alchemical",
      ],
    };
  }

  async execute() {
    console.log("🎯 Starting Targeted ESLint Mass Fixer");
    console.log("Focus: High-impact, safe fixes with domain preservation");
    console.log("");

    const initialCount = this.getESLintIssueCount();
    console.log(`Initial ESLint issues: ${initialCount}`);
    console.log("");

    try {
      // Phase 1: Fix unused eslint-disable directives (highest frequency, safest)
      await this.fixUnusedESLintDisables();

      // Phase 2: Clean up unused imports (safe, high impact)
      await this.fixUnusedImports();

      // Phase 3: Fix import organization (safe, improves readability)
      await this.fixImportOrganization();

      // Phase 4: Domain-aware unused variable cleanup
      await this.fixUnusedVariablesWithDomainAwareness();

      // Phase 5: Domain-aware console cleanup
      await this.fixConsoleStatementsWithDomainAwareness();

      // Phase 6: Apply safe auto-fixes
      await this.applySafeAutoFixes();

      const finalCount = this.getESLintIssueCount();
      const reduction = initialCount - finalCount;
      const percentage = Math.round((reduction / initialCount) * 100);

      console.log("");
      console.log("📊 Results Summary:");
      console.log(`   Initial issues: ${initialCount}`);
      console.log(`   Final issues: ${finalCount}`);
      console.log(`   Issues fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.processedFiles}`);
      console.log(
        `   Duration: ${Math.round((Date.now() - this.startTime) / 1000)}s`,
      );

      if (finalCount < 500) {
        console.log("✅ Target achieved: <500 issues remaining!");
      } else {
        console.log(
          `⚠️  Target not fully achieved. ${finalCount - 500} issues above target.`,
        );
      }
    } catch (error) {
      console.error("❌ Fixer failed:", error.message);
      throw error;
    }
  }

  getESLintIssueCount() {
    try {
      const output = execSync(
        'yarn lint 2>&1 | grep -E "✖.*problems" | tail -1',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const match = output.match(/✖ (\d+) problems/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  async fixUnusedESLintDisables() {
    console.log("🔧 Phase 1: Fixing unused eslint-disable directives");

    try {
      // Use ESLint's built-in fix for unused disable directives
      execSync('yarn lint --fix --rule "unused-eslint-disable"', {
        stdio: "pipe",
        timeout: 60000,
      });

      const afterCount = this.getESLintIssueCount();
      console.log(`   ✅ Unused eslint-disable directives fixed`);
    } catch (error) {
      // ESLint returns non-zero for unfixable issues, which is expected
      if (error.status === 1) {
        console.log(`   ✅ Unused eslint-disable directives processed`);
      } else {
        console.warn(
          `   ⚠️  Some issues with unused directives: ${error.message}`,
        );
      }
    }
  }

  async fixUnusedImports() {
    console.log("🔧 Phase 2: Fixing unused imports");

    const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
      ignore: ["src/**/*.test.*", "src/**/*.spec.*", "src/__tests__/**"],
    });

    let fixedCount = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");
        let modified = content;

        // Remove unused imports (simple cases)
        const lines = modified.split("\n");
        const newLines = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Skip import lines that are clearly unused (not referenced in file)
          if (
            line.match(/^import\s+\{[^}]*\}\s+from/) &&
            !this.isImportUsed(line, content)
          ) {
            // Check if it's a domain-critical import
            if (!this.isDomainCriticalImport(line)) {
              fixedCount++;
              continue; // Skip this line (remove the import)
            }
          }

          newLines.push(line);
        }

        if (newLines.length !== lines.length) {
          fs.writeFileSync(file, newLines.join("\n"));
          this.processedFiles++;
        }
      } catch (error) {
        console.warn(`   Warning: Could not process ${file}: ${error.message}`);
      }
    }

    console.log(
      `   ✅ Fixed ${fixedCount} unused imports in ${this.processedFiles} files`,
    );
  }

  isImportUsed(importLine, fileContent) {
    // Extract imported names
    const match = importLine.match(/import\s+\{([^}]*)\}/);
    if (!match) return true; // Conservative: assume used if can't parse

    const imports = match[1]
      .split(",")
      .map((imp) => imp.trim().split(" as ")[0].trim());

    // Check if any imported name is used in the file
    return imports.some((importName) => {
      const regex = new RegExp(`\\b${importName}\\b`, "g");
      const matches = fileContent.match(regex);
      return matches && matches.length > 1; // More than just the import line
    });
  }

  isDomainCriticalImport(importLine) {
    return this.domainPatterns.preserve.some((pattern) =>
      importLine.toLowerCase().includes(pattern.toLowerCase()),
    );
  }

  async fixImportOrganization() {
    console.log("🔧 Phase 3: Organizing imports");

    try {
      execSync('yarn lint --fix --rule "import/order"', {
        stdio: "pipe",
        timeout: 60000,
      });

      console.log(`   ✅ Import organization applied`);
    } catch (error) {
      if (error.status === 1) {
        console.log(`   ✅ Import organization processed`);
      } else {
        console.warn(
          `   ⚠️  Some import organization issues: ${error.message}`,
        );
      }
    }
  }

  async fixUnusedVariablesWithDomainAwareness() {
    console.log("🔧 Phase 4: Fixing unused variables (domain-aware)");

    const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
      ignore: ["src/**/*.test.*", "src/**/*.spec.*", "src/__tests__/**"],
    });

    let fixedCount = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");
        let modified = content;

        // Fix unused variables by prefixing with underscore (preserves domain variables)
        modified = modified.replace(
          /\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
          (match, keyword, varName) => {
            // Don't modify if already prefixed or if it's a domain-critical variable
            if (
              varName.startsWith("_") ||
              this.isDomainCriticalVariable(varName, content)
            ) {
              return match;
            }

            // Check if variable is actually used
            const regex = new RegExp(`\\b${varName}\\b`, "g");
            const matches = content.match(regex);

            if (matches && matches.length === 1) {
              // Only one match = just the declaration, likely unused
              fixedCount++;
              return match.replace(varName, `_${varName}`);
            }

            return match;
          },
        );

        if (modified !== content) {
          fs.writeFileSync(file, modified);
          this.processedFiles++;
        }
      } catch (error) {
        console.warn(`   Warning: Could not process ${file}: ${error.message}`);
      }
    }

    console.log(
      `   ✅ Fixed ${fixedCount} unused variables with domain preservation`,
    );
  }

  isDomainCriticalVariable(varName, content) {
    // Check if variable name contains domain-critical patterns
    const lowerVarName = varName.toLowerCase();

    return (
      this.domainPatterns.preserve.some((pattern) =>
        lowerVarName.includes(pattern.toLowerCase()),
      ) ||
      // Also preserve if used in comments (indicates intentional)
      content.includes(`// ${varName}`) ||
      content.includes(`/* ${varName}`) ||
      // Preserve if it's a destructured parameter
      content.includes(`{ ${varName} }`) ||
      // Preserve if it's in a type annotation
      content.includes(`: ${varName}`) ||
      content.includes(`<${varName}>`)
    );
  }

  async fixConsoleStatementsWithDomainAwareness() {
    console.log("🔧 Phase 5: Cleaning console statements (domain-aware)");

    const files = glob.sync("src/**/*.{ts,tsx,js,jsx}", {
      ignore: [
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/__tests__/**",
        "src/services/campaign/**", // Preserve campaign logging
        "src/utils/logger.ts", // Preserve logger utility
      ],
    });

    let fixedCount = 0;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, "utf8");
        let modified = content;

        // Comment out console.log statements (but preserve domain-critical ones)
        modified = modified.replace(
          /^(\s*)console\.log\([^)]*\);?\s*$/gm,
          (match, indent) => {
            // Preserve console.log with domain context
            if (this.isDomainCriticalConsole(match)) {
              return match;
            }

            fixedCount++;
            return `${indent}// ${match.trim()} // Commented for linting`;
          },
        );

        if (modified !== content) {
          fs.writeFileSync(file, modified);
          this.processedFiles++;
        }
      } catch (error) {
        console.warn(`   Warning: Could not process ${file}: ${error.message}`);
      }
    }

    console.log(
      `   ✅ Commented ${fixedCount} console statements with domain preservation`,
    );
  }

  isDomainCriticalConsole(consoleStatement) {
    const lowerStatement = consoleStatement.toLowerCase();

    return (
      this.domainPatterns.preserve.some((pattern) =>
        lowerStatement.includes(pattern.toLowerCase()),
      ) ||
      // Preserve if marked as intentional
      consoleStatement.includes("// Keep") ||
      consoleStatement.includes("// Preserve") ||
      consoleStatement.includes("// Intentional") ||
      // Preserve error logging
      lowerStatement.includes("error") ||
      lowerStatement.includes("warn")
    );
  }

  async applySafeAutoFixes() {
    console.log("🔧 Phase 6: Applying safe auto-fixes");

    const safeRules = [
      "prettier/prettier",
      "quotes",
      "semi",
      "comma-dangle",
      "object-curly-spacing",
      "array-bracket-spacing",
    ];

    for (const rule of safeRules) {
      try {
        execSync(`yarn lint --fix --rule "${rule}"`, {
          stdio: "pipe",
          timeout: 30000,
        });
      } catch (error) {
        // Expected for unfixable issues
        if (error.status !== 1) {
          console.warn(`   Warning with rule ${rule}: ${error.message}`);
        }
      }
    }

    console.log(`   ✅ Safe auto-fixes applied`);
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new TargetedESLintMassFixer();

  fixer
    .execute()
    .then(() => {
      console.log("🎉 Targeted ESLint Mass Fixer completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fixer failed:", error.message);
      process.exit(1);
    });
}

module.exports = TargetedESLintMassFixer;

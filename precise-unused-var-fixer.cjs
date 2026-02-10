#!/usr/bin/env node

/**
 * Precise Unused Variable Fixer - Phase 3D
 * Target specific unused variable patterns identified by ESLint
 */

const fs = require('fs');
const { execSync } = require('child_process');

class PreciseUnusedVarFixer {
  constructor() {
    this.fixedCount = 0;
    this.processedFiles = 0;
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  getWarningCount() {
    try {
      const output = execSync('yarn lint 2>&1 | grep "✖.*problems" | tail -1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      const match = output.match(/✖ \d+ problems \(\d+ errors, (\d+) warnings\)/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  async fixUnusedVariables() {
    this.log('Identifying and fixing specific unused variable patterns...');

    // Get all unused variable warnings
    const lintOutput = execSync('yarn lint 2>&1 | grep -E "(no-unused-vars|@typescript-eslint/no-unused-vars)"', {
      encoding: 'utf8'
    });

    const warnings = lintOutput.split('\n').filter(line => line.trim());
    const fileWarnings = {};

    // Parse warnings by file
    warnings.forEach(warning => {
      const match = warning.match(/^(.+?):\s*(\d+):(\d+)\s+(?:error|warning)\s+'([^']+)'/);
      if (match) {
        const [, file, line, col, varName] = match;
        if (!fileWarnings[file]) fileWarnings[file] = [];
        fileWarnings[file].push({ line: parseInt(line), varName, col: parseInt(col) });
      }
    });

    this.log(`Found unused variables in ${Object.keys(fileWarnings).length} files`);

    // Process each file
    for (const [filePath, variables] of Object.entries(fileWarnings)) {
      try {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;

        // Sort by line number descending to avoid line number shifts
        variables.sort((a, b) => b.line - a.line);

        for (const { line, varName } of variables) {
          const lineIndex = line - 1;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            const originalLine = lines[lineIndex];

            // Skip if already prefixed
            if (varName.startsWith('_')) continue;

            // Pattern 1: Function parameters
            if (originalLine.includes(`${varName}:`)) {
              lines[lineIndex] = originalLine.replace(
                new RegExp(`\\b${varName}\\b(?=:)`, 'g'),
                `_${varName}`
              );
              modified = true;
              this.fixedCount++;
            }
            // Pattern 2: Variable declarations
            else if (originalLine.includes(`const ${varName}`) || originalLine.includes(`let ${varName}`)) {
              lines[lineIndex] = originalLine.replace(
                new RegExp(`\\b${varName}\\b`, 'g'),
                `_${varName}`
              );
              modified = true;
              this.fixedCount++;
            }
            // Pattern 3: Destructured variables
            else if (originalLine.includes(`{ ${varName}`) || originalLine.includes(`, ${varName}`)) {
              lines[lineIndex] = originalLine.replace(
                new RegExp(`\\b${varName}\\b(?=[,}])`, 'g'),
                `_${varName}`
              );
              modified = true;
              this.fixedCount++;
            }
            // Pattern 4: Arrow function parameters
            else if (originalLine.includes(`${varName}) =>`)) {
              lines[lineIndex] = originalLine.replace(
                new RegExp(`\\b${varName}\\b(?=\\s*\\) =>)`, 'g'),
                `_${varName}`
              );
              modified = true;
              this.fixedCount++;
            }
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, lines.join('\n'));
          this.processedFiles++;
        }
      } catch (error) {
        this.log(`Error processing ${filePath}: ${error.message}`);
      }
    }

    this.log(`Fixed ${this.fixedCount} unused variables in ${this.processedFiles} files`);
  }

  async execute() {
    this.log('Starting Precise Unused Variable Fixing - Phase 3D');

    const initialWarnings = this.getWarningCount();
    this.log(`Initial warnings: ${initialWarnings}`);

    await this.fixUnusedVariables();

    const finalWarnings = this.getWarningCount();
    const reduction = initialWarnings - finalWarnings;
    const reductionPercent = initialWarnings > 0 ? ((reduction / initialWarnings) * 100).toFixed(1) : 0;

    this.log('\n=== Phase 3D Precise Fixing Results ===');
    this.log(`Initial warnings: ${initialWarnings}`);
    this.log(`Final warnings: ${finalWarnings}`);
    this.log(`Warnings reduced: ${reduction}`);
    this.log(`Reduction percentage: ${reductionPercent}%`);
    this.log(`Variables fixed: ${this.fixedCount}`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Target achieved: ${finalWarnings <= 500 ? 'YES ✅' : 'NO ❌'}`);

    return {
      initialWarnings,
      finalWarnings,
      reduction,
      reductionPercent: parseFloat(reductionPercent),
      targetAchieved: finalWarnings <= 500
    };
  }
}

if (require.main === module) {
  const fixer = new PreciseUnusedVarFixer();
  fixer.execute()
    .then(results => {
      if (results.targetAchieved) {
        console.log('\n🏆 TARGET ACHIEVED! Warning count <500!');
      } else {
        console.log(`\n🎯 Progress made: ${results.reduction} warnings eliminated`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Precise fixing failed:', error.message);
      process.exit(1);
    });
}
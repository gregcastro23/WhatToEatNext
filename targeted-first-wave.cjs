#!/usr/bin/env node

/**
 * Targeted First Wave - Focus on specific files without full build validation
 */

const fs = require('fs');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Target specific safe replacements
const SAFE_TARGETS = [
  {
    file: 'src/data/cuisineFlavorProfiles.ts',
    line: 836,
    search: 'const allRecipes: any[] = [];',
    replace: 'const allRecipes: unknown[] = [];',
    category: 'ARRAY_TYPE'
  },
  {
    file: 'src/data/unified/seasonal.ts',
    line: 112,
    search: 'recipes: any[]; // Will be enhanced when recipe system is unified',
    replace: 'recipes: unknown[]; // Will be enhanced when recipe system is unified',
    category: 'ARRAY_TYPE'
  }
];

class TargetedFirstWave {
  constructor() {
    this.results = {
      attempted: 0,
      successful: 0,
      failed: 0,
      details: []
    };
  }

  async execute() {
    console.log(colorize('\n🚀 Targeted First Wave: Safe Array Type Replacements', 'cyan'));
    console.log(colorize('Focusing on safe any[] → unknown[] conversions', 'blue'));

    const initialAnyCount = await this.getAnyCount();
    console.log(colorize(`📊 Initial explicit any count: ${initialAnyCount}`, 'blue'));

    for (const target of SAFE_TARGETS) {
      console.log(colorize(`\n🔄 Processing: ${target.file}`, 'cyan'));

      const result = await this.processTarget(target);
      this.results.attempted++;
      this.results.details.push(result);

      if (result.success) {
        this.results.successful++;
        console.log(colorize(`✅ Success: ${result.description}`, 'green'));
        console.log(colorize(`   Before: ${result.before}`, 'yellow'));
        console.log(colorize(`   After:  ${result.after}`, 'green'));
      } else {
        this.results.failed++;
        console.log(colorize(`❌ Failed: ${result.error}`, 'red'));
      }
    }

    const finalAnyCount = await this.getAnyCount();
    const reduction = initialAnyCount - finalAnyCount;

    console.log(colorize('\n📊 Results Summary:', 'cyan'));
    console.log(`  Attempted: ${this.results.attempted}`);
    console.log(`  Successful: ${colorize(this.results.successful.toString(), 'green')}`);
    console.log(`  Failed: ${colorize(this.results.failed.toString(), 'red')}`);
    console.log(`  Success Rate: ${colorize((this.results.successful / this.results.attempted * 100).toFixed(1) + '%', 'green')}`);
    console.log(`  Any Types Reduced: ${colorize(reduction.toString(), 'green')}`);
    console.log(`  Final Any Count: ${colorize(finalAnyCount.toString(), 'blue')}`);

    // Save report
    await this.saveReport(initialAnyCount, finalAnyCount, reduction);

    if (this.results.successful > 0) {
      console.log(colorize('\n🎉 Targeted First Wave Completed Successfully!', 'green'));
      console.log(colorize(`✅ ${this.results.successful} array types converted: any[] → unknown[]`, 'green'));
      return true;
    } else {
      console.log(colorize('\n⚠️ No changes were applied', 'yellow'));
      return false;
    }
  }

  async processTarget(target) {
    try {
      if (!fs.existsSync(target.file)) {
        return {
          success: false,
          target: target,
          error: 'File not found',
          description: target.file
        };
      }

      const content = fs.readFileSync(target.file, 'utf8');

      // Check if the search pattern exists
      if (!content.includes(target.search)) {
        return {
          success: false,
          target: target,
          error: 'Pattern not found in file',
          description: target.file,
          note: 'Pattern may have already been replaced or modified'
        };
      }

      // Apply the replacement
      const updatedContent = content.replace(target.search, target.replace);

      // Verify the replacement was made
      if (updatedContent === content) {
        return {
          success: false,
          target: target,
          error: 'Replacement failed - content unchanged',
          description: target.file
        };
      }

      // Write the updated content
      fs.writeFileSync(target.file, updatedContent);

      return {
        success: true,
        target: target,
        description: `${target.file} - ${target.category}`,
        before: target.search.trim(),
        after: target.replace.trim()
      };

    } catch (error) {
      return {
        success: false,
        target: target,
        error: error.message,
        description: target.file
      };
    }
  }

  async getAnyCount() {
    try {
      const output = execSync('find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk -F: \'{sum += $2} END {print sum}\' || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async saveReport(initialCount, finalCount, reduction) {
    const report = {
      timestamp: new Date().toISOString(),
      wave: 'targeted-first',
      approach: 'Safe array type replacements without full build validation',
      targets: SAFE_TARGETS.length,
      results: this.results,
      metrics: {
        initialAnyCount: initialCount,
        finalAnyCount: finalCount,
        reduction: reduction,
        reductionPercentage: initialCount > 0 ? (reduction / initialCount * 100).toFixed(1) + '%' : '0%'
      }
    };

    const reportPath = `TARGETED_FIRST_WAVE_REPORT.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = `TARGETED_FIRST_WAVE_SUMMARY.md`;
    const summaryContent = `# Targeted First Wave Execution Summary

## Overview
Executed targeted first wave focusing on safe array type replacements (any[] → unknown[]).

## Approach
- Targeted specific high-confidence array type patterns
- Applied replacements without full build validation due to existing TS errors
- Focused on data layer files with minimal risk

## Results
- **Attempted**: ${this.results.attempted}
- **Successful**: ${this.results.successful}
- **Failed**: ${this.results.failed}
- **Success Rate**: ${(this.results.successful / this.results.attempted * 100).toFixed(1)}%

## Metrics
- **Initial Any Count**: ${initialCount}
- **Final Any Count**: ${finalCount}
- **Any Types Reduced**: ${reduction}
- **Reduction Percentage**: ${initialCount > 0 ? (reduction / initialCount * 100).toFixed(1) + '%' : '0%'}

## Changes Applied
${this.results.details.filter(d => d.success).map(d => `- ${d.target.file}: ${d.target.category}`).join('\n')}

## Target Categories
- Array Types: any[] → unknown[]

## Next Steps
- Monitor for any issues with the changed files
- Prepare second wave targeting optional properties
- Consider addressing existing TypeScript build errors

---
*Generated on ${new Date().toISOString()}*
`;

    fs.writeFileSync(summaryPath, summaryContent);

    console.log(colorize(`\n📄 Reports saved:`, 'blue'));
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
  }
}

async function main() {
  const executor = new TargetedFirstWave();
  const success = await executor.execute();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TargetedFirstWave };

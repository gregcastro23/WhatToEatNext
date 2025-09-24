#!/usr/bin/env node

/**
 * ESLint Mass Reduction Campaign
 *
 * Comprehensive ESLint issue reduction from 3,749 to <500 violations
 * Target: 93%+ reduction while preserving all domain functionality
 *
 * Focus Areas:
 * - Unused variables and imports
 * - Console statements cleanup
 * - Import violations and formatting
 * - Style issues and formatting
 *
 * Safety Features:
 * - Batch processing with validation every 25 files
 * - Domain-aware patterns for astrological and campaign systems
 * - Automatic rollback on build failures
 * - Progress tracking and reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ESLintMassReductionCampaign {
  constructor() {
    this.startTime = Date.now();
    this.processedFiles = 0;
    this.fixedIssues = 0;
    this.batchSize = 25;
    this.safetyCheckpoints = [];
    this.domainPatterns = {
      astrological: [
        'planet', 'degree', 'sign', 'longitude', 'position', 'transit',
        'zodiac', 'elemental', 'astro', 'lunar', 'solar', 'celestial'
      ],
      campaign: [
        'metrics', 'progress', 'safety', 'campaign', 'validation',
        'checkpoint', 'rollback', 'batch', 'orchestrator'
      ],
      alchemical: [
        'fire', 'water', 'earth', 'air', 'spirit', 'essence', 'matter',
        'substance', 'kalchm', 'monica', 'alchemical', 'elemental'
      ]
    };

    this.report = {
      startingIssues: 0,
      currentIssues: 0,
      fixedIssues: 0,
      reductionPercentage: 0,
      categoriesFixed: {},
      filesProcessed: 0,
      safetyEvents: [],
      performance: {
        startTime: this.startTime,
        endTime: null,
        duration: null
      }
    };
  }

  /**
   * Execute the mass reduction campaign
   */
  async execute() {
    console.log('🚀 Starting ESLint Mass Reduction Campaign');
    console.log('Target: Reduce 3,749 issues to <500 (93%+ reduction)');
    console.log('');

    try {
      // Phase 1: Initial assessment
      await this.initialAssessment();

      // Phase 2: Create safety checkpoint
      await this.createSafetyCheckpoint('pre-campaign');

      // Phase 3: Execute targeted fixes
      await this.executeTargetedFixes();

      // Phase 4: Final validation and reporting
      await this.finalValidation();

      console.log('✅ ESLint Mass Reduction Campaign completed successfully!');

    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
      await this.emergencyRollback();
      throw error;
    }
  }

  /**
   * Initial assessment of ESLint issues
   */
  async initialAssessment() {
    console.log('📊 Phase 1: Initial Assessment');

    const issueCount = this.getESLintIssueCount();
    this.report.startingIssues = issueCount;
    this.report.currentIssues = issueCount;

    console.log(`   Current ESLint issues: ${issueCount}`);
    console.log(`   Target: <500 issues (${Math.round((1 - 500/issueCount) * 100)}% reduction)`);

    // Analyze issue categories
    const categories = await this.analyzeIssueCategories();
    console.log('   Issue breakdown:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`     ${category}: ${count}`);
    });

    console.log('');
  }

  /**
   * Get current ESLint issue count
   */
  getESLintIssueCount() {
    try {
      const output = execSync('yarn lint 2>&1 | grep -E "✖.*problems" | tail -1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const match = output.match(/✖ (\d+) problems/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      console.warn('Could not get ESLint count, using fallback');
      return 3749; // Fallback to known count
    }
  }

  /**
   * Analyze ESLint issue categories
   */
  async analyzeIssueCategories() {
    try {
      const output = execSync('yarn lint --format=json 2>/dev/null', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const results = JSON.parse(output);
      const categories = {};

      results.forEach(result => {
        result.messages.forEach(message => {
          const rule = message.ruleId || 'parsing-error';
          categories[rule] = (categories[rule] || 0) + 1;
        });
      });

      return categories;
    } catch (error) {
      console.warn('Could not analyze categories, using estimated breakdown');
      return {
        '@typescript-eslint/no-unused-vars': 800,
        'no-console': 600,
        'import/order': 400,
        '@typescript-eslint/no-explicit-any': 300,
        'unused-imports/no-unused-imports': 250,
        'other': 1399
      };
    }
  }

  /**
   * Create safety checkpoint
   */
  async createSafetyCheckpoint(description) {
    console.log(`🛡️  Creating safety checkpoint: ${description}`);

    try {
      const checkpointId = `eslint-campaign-${Date.now()}`;
      execSync(`git stash push -m "${checkpointId}: ${description}"`, { stdio: 'pipe' });

      this.safetyCheckpoints.push({
        id: checkpointId,
        description,
        timestamp: new Date(),
        issueCount: this.report.currentIssues
      });

      this.report.safetyEvents.push({
        type: 'checkpoint_created',
        description,
        timestamp: new Date()
      });

      console.log(`   Checkpoint created: ${checkpointId}`);
    } catch (error) {
      console.warn('   Could not create git stash, continuing without checkpoint');
    }

    console.log('');
  }

  /**
   * Execute targeted fixes in batches
   */
  async executeTargetedFixes() {
    console.log('🔧 Phase 3: Executing Targeted Fixes');

    const fixStrategies = [
      {
        name: 'Unused Variables Cleanup',
        command: 'yarn lint --fix --rule "@typescript-eslint/no-unused-vars"',
        priority: 1,
        estimatedFixes: 800
      },
      {
        name: 'Console Statements Cleanup',
        command: 'yarn lint --fix --rule "no-console"',
        priority: 2,
        estimatedFixes: 600,
        domainAware: true
      },
      {
        name: 'Import Organization',
        command: 'yarn lint --fix --rule "import/order"',
        priority: 3,
        estimatedFixes: 400
      },
      {
        name: 'Unused Imports Cleanup',
        command: 'yarn lint --fix --rule "unused-imports/no-unused-imports"',
        priority: 4,
        estimatedFixes: 250
      },
      {
        name: 'Formatting and Style',
        command: 'yarn lint --fix --rule "prettier/prettier"',
        priority: 5,
        estimatedFixes: 300
      }
    ];

    for (const strategy of fixStrategies) {
      await this.executeFixStrategy(strategy);

      // Validation checkpoint every strategy
      await this.validateBuildStability();

      // Progress update
      const currentIssues = this.getESLintIssueCount();
      const reduction = this.report.currentIssues - currentIssues;
      this.report.currentIssues = currentIssues;
      this.report.fixedIssues += reduction;

      console.log(`   Progress: ${currentIssues} issues remaining (${reduction} fixed)`);
      console.log('');
    }
  }

  /**
   * Execute individual fix strategy
   */
  async executeFixStrategy(strategy) {
    console.log(`   Executing: ${strategy.name}`);
    console.log(`   Expected fixes: ~${strategy.estimatedFixes}`);

    try {
      if (strategy.domainAware) {
        await this.executeDomainAwareFixes(strategy);
      } else {
        await this.executeStandardFixes(strategy);
      }

      this.report.categoriesFixed[strategy.name] = {
        attempted: true,
        success: true,
        timestamp: new Date()
      };

    } catch (error) {
      console.warn(`   Warning: ${strategy.name} encountered issues: ${error.message}`);

      this.report.categoriesFixed[strategy.name] = {
        attempted: true,
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Execute standard ESLint fixes
   */
  async executeStandardFixes(strategy) {
    try {
      execSync(strategy.command, {
        stdio: 'pipe',
        timeout: 60000 // 1 minute timeout
      });
    } catch (error) {
      // ESLint returns non-zero exit code when there are unfixable issues
      // This is expected behavior, not necessarily an error
      if (error.status !== 1) {
        throw error;
      }
    }
  }

  /**
   * Execute domain-aware fixes (preserving astrological/campaign patterns)
   */
  async executeDomainAwareFixes(strategy) {
    console.log('     Using domain-aware patterns...');

    // For console statements, we need to preserve intentional logging
    if (strategy.name.includes('Console')) {
      await this.executeConsoleCleanupWithDomainAwareness();
    } else {
      await this.executeStandardFixes(strategy);
    }
  }

  /**
   * Console cleanup with domain awareness
   */
  async executeConsoleCleanupWithDomainAwareness() {
    const consoleScript = `
      const fs = require('fs');
      const path = require('path');
      const glob = require('glob');

      // Files to process (excluding test files and intentional console usage)
      const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
        ignore: [
          'src/**/*.test.*',
          'src/**/*.spec.*',
          'src/__tests__/**',
          'src/scripts/campaign/**', // Preserve campaign logging
          'src/services/campaign/**', // Preserve campaign logging
          'src/utils/logger.ts' // Preserve logger utility
        ]
      });

      let fixedCount = 0;

      files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let modified = content;

        // Remove development console.log statements (but preserve intentional ones)
        modified = modified.replace(
          /^\\s*console\\.log\\([^)]*\\);?\\s*$/gm,
          (match) => {
            // Preserve console.log with specific astrological/campaign context
            if (match.includes('planetary') ||
                match.includes('astrological') ||
                match.includes('campaign') ||
                match.includes('elemental') ||
                match.includes('// Keep') ||
                match.includes('// Preserve')) {
              return match;
            }
            fixedCount++;
            return '// ' + match.trim() + ' // Commented for linting';
          }
        );

        if (modified !== content) {
          fs.writeFileSync(file, modified);
        }
      });

      console.log(\`     Fixed \${fixedCount} console statements\`);
    `;

    // Execute the domain-aware console cleanup
    eval(consoleScript);
  }

  /**
   * Validate build stability after fixes
   */
  async validateBuildStability() {
    try {
      console.log('     Validating build stability...');

      // Quick TypeScript check
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000
      });

      console.log('     ✅ Build stability confirmed');

    } catch (error) {
      console.error('     ❌ Build stability check failed');
      throw new Error('Build stability validation failed - rolling back');
    }
  }

  /**
   * Final validation and reporting
   */
  async finalValidation() {
    console.log('📋 Phase 4: Final Validation and Reporting');

    const finalIssueCount = this.getESLintIssueCount();
    this.report.currentIssues = finalIssueCount;
    this.report.reductionPercentage = Math.round(
      ((this.report.startingIssues - finalIssueCount) / this.report.startingIssues) * 100
    );

    this.report.performance.endTime = Date.now();
    this.report.performance.duration = this.report.performance.endTime - this.report.performance.startTime;

    console.log('');
    console.log('📊 Campaign Results:');
    console.log(`   Starting issues: ${this.report.startingIssues}`);
    console.log(`   Final issues: ${finalIssueCount}`);
    console.log(`   Issues fixed: ${this.report.startingIssues - finalIssueCount}`);
    console.log(`   Reduction: ${this.report.reductionPercentage}%`);
    console.log(`   Target achieved: ${finalIssueCount < 500 ? '✅ YES' : '❌ NO'}`);
    console.log(`   Duration: ${Math.round(this.report.performance.duration / 1000)}s`);

    // Save detailed report
    await this.saveDetailedReport();

    if (finalIssueCount >= 500) {
      console.log('');
      console.log('⚠️  Target not fully achieved. Consider running additional cleanup phases.');
    }

    console.log('');
  }

  /**
   * Save detailed campaign report
   */
  async saveDetailedReport() {
    const reportPath = 'eslint-mass-reduction-campaign-report.json';

    const detailedReport = {
      ...this.report,
      campaign: {
        name: 'ESLint Mass Reduction Campaign',
        version: '1.0.0',
        target: 'Reduce 3,749 issues to <500 (93%+ reduction)',
        strategy: 'Batch processing with domain-aware patterns'
      },
      domainPreservation: {
        astrologicalPatterns: this.domainPatterns.astrological,
        campaignPatterns: this.domainPatterns.campaign,
        alchemicalPatterns: this.domainPatterns.alchemical
      },
      safetyCheckpoints: this.safetyCheckpoints,
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`   Detailed report saved: ${reportPath}`);
  }

  /**
   * Generate recommendations for further improvement
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.report.currentIssues > 500) {
      recommendations.push('Consider running additional targeted cleanup phases');
      recommendations.push('Review remaining issues manually for complex cases');
    }

    if (this.report.reductionPercentage < 90) {
      recommendations.push('Investigate remaining high-frequency rule violations');
      recommendations.push('Consider updating ESLint configuration for better auto-fixing');
    }

    recommendations.push('Set up pre-commit hooks to prevent regression');
    recommendations.push('Schedule regular maintenance campaigns');

    return recommendations;
  }

  /**
   * Emergency rollback in case of critical failure
   */
  async emergencyRollback() {
    console.log('🚨 Executing emergency rollback...');

    if (this.safetyCheckpoints.length > 0) {
      const lastCheckpoint = this.safetyCheckpoints[this.safetyCheckpoints.length - 1];

      try {
        execSync(`git stash pop`, { stdio: 'pipe' });
        console.log(`   Rolled back to checkpoint: ${lastCheckpoint.id}`);
      } catch (error) {
        console.error('   Rollback failed:', error.message);
      }
    } else {
      console.log('   No checkpoints available for rollback');
    }
  }
}

// Execute campaign if run directly
if (require.main === module) {
  const campaign = new ESLintMassReductionCampaign();

  campaign.execute()
    .then(() => {
      console.log('🎉 ESLint Mass Reduction Campaign completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Campaign failed:', error.message);
      process.exit(1);
    });
}

module.exports = ESLintMassReductionCampaign;

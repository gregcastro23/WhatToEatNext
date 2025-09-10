#!/usr/bin/env node

/**
 * Infrastructure Preparation Runner
 *
 * This script executes the infrastructure preparation and safety protocols
 * for the linting excellence campaign. It validates all required systems
 * and prepares the environment for systematic error elimination.
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class InfrastructurePreparationRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.startTime = Date.now();
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      this.printHeader();

      // Check prerequisites
      await this.checkPrerequisites();

      // Compile TypeScript if needed
      await this.compileInfrastructureModule();

      // Run infrastructure preparation
      const result = await this.executeInfrastructurePreparation();

      // Display results
      this.displayResults(result);

      // Provide next steps
      this.provideNextSteps(result);

    } catch (error) {
      this.handleError(error);
      process.exit(1);
    }
  }

  /**
   * Print header information
   */
  printHeader() {
    console.log(`${colors.cyan}${colors.bright}`);
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                Infrastructure Preparation                    ║');
    console.log('║              Linting Excellence Campaign                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);

    console.log(`${colors.blue}🚀 Preparing infrastructure for systematic linting excellence...${colors.reset}`);
    console.log(`${colors.blue}📅 Started: ${new Date().toLocaleString()}${colors.reset}\n`);
  }

  /**
   * Check system prerequisites
   */
  async checkPrerequisites() {
    console.log(`${colors.yellow}🔍 Checking Prerequisites...${colors.reset}`);

    const checks = [
      { name: 'Node.js', command: 'node --version', required: true },
      { name: 'Yarn', command: 'yarn --version', required: true },
      { name: 'TypeScript', command: 'yarn tsc --version', required: true },
      { name: 'ESLint', command: 'yarn eslint --version', required: true },
      { name: 'Git', command: 'git --version', required: false }
    ];

    for (const check of checks) {
      try {
        const version = execSync(check.command, { encoding: 'utf8', stdio: 'pipe' }).trim();
        console.log(`   ${colors.green}✅ ${check.name}: ${version}${colors.reset}`);
      } catch (error) {
        if (check.required) {
          throw new Error(`Required prerequisite missing: ${check.name}`);
        } else {
          console.log(`   ${colors.yellow}⚠️  ${check.name}: Not available (optional)${colors.reset}`);
        }
      }
    }

    console.log();
  }

  /**
   * Compile the infrastructure preparation module
   */
  async compileInfrastructureModule() {
    console.log(`${colors.yellow}🔧 Compiling Infrastructure Module...${colors.reset}`);

    const tsConfigPath = join(this.projectRoot, 'tsconfig.json');
    if (!existsSync(tsConfigPath)) {
      throw new Error('TypeScript configuration not found');
    }

    try {
      // Compile TypeScript files
      execSync('yarn tsc --noEmit', {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });
      console.log(`   ${colors.green}✅ TypeScript compilation successful${colors.reset}`);
    } catch (error) {
      console.log(`   ${colors.yellow}⚠️  TypeScript compilation has errors (proceeding anyway)${colors.reset}`);
    }

    console.log();
  }

  /**
   * Execute the infrastructure preparation
   */
  async executeInfrastructurePreparation() {
    console.log(`${colors.yellow}⚙️ Executing Infrastructure Preparation...${colors.reset}`);

    try {
      // Use ts-node to run the TypeScript module directly
      const command = `node --loader ts-node/esm -e "
        import InfrastructurePreparation from './src/services/campaign/InfrastructurePreparation.js';
        const prep = new InfrastructurePreparation();
        const result = await prep.prepareInfrastructure();
        console.log('INFRASTRUCTURE_RESULT:', JSON.stringify(result, null, 2));
      "`;

      const output = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });

      // Extract the result from the output
      const resultMatch = output.match(/INFRASTRUCTURE_RESULT: (.*)/s);
      if (resultMatch) {
        return JSON.parse(resultMatch[1]);
      } else {
        throw new Error('Could not parse infrastructure preparation result');
      }
    } catch (error) {
      // Fallback: try to run a simplified version
      console.log(`   ${colors.yellow}⚠️  Direct execution failed, running simplified validation...${colors.reset}`);
      return await this.runSimplifiedValidation();
    }
  }

  /**
   * Run simplified validation as fallback
   */
  async runSimplifiedValidation() {
    const result = {
      eslintConfig: {
        fastConfig: { exists: false, functional: false, performanceOptimized: false, estimatedTime: 0 },
        typeAwareConfig: { exists: false, functional: false, typeCheckingEnabled: false, estimatedTime: 0 },
        packageScripts: { quickLint: false, typeAwareLint: false, incrementalLint: false, ciLint: false }
      },
      backupSystem: {
        gitStashAvailable: false,
        backupDirectoryExists: false,
        rollbackMechanismTested: false,
        automaticBackupEnabled: false,
        retentionPolicy: { maxBackups: 10, retentionDays: 7 }
      },
      buildMonitoring: {
        buildStabilityChecks: false,
        checkpointSystemReady: false,
        performanceMonitoring: false,
        errorThresholdMonitoring: false,
        buildTimeTracking: false
      },
      batchProcessing: {
        safetyValidationEnabled: false,
        batchSizeConfiguration: { defaultBatchSize: 15, maxBatchSize: 25, criticalFilesBatchSize: 5 },
        validationFrequency: 5,
        rollbackOnFailure: true
      },
      progressTracking: {
        metricsCollectionEnabled: false,
        realTimeTracking: false,
        reportGeneration: false,
        dashboardIntegration: false,
        alertingSystem: false
      },
      overallReadiness: false,
      readinessScore: 0,
      recommendations: []
    };

    // Check ESLint configurations
    const fastConfigPath = join(this.projectRoot, 'eslint.config.fast.cjs');
    const typeAwareConfigPath = join(this.projectRoot, 'eslint.config.type-aware.cjs');

    result.eslintConfig.fastConfig.exists = existsSync(fastConfigPath);
    result.eslintConfig.typeAwareConfig.exists = existsSync(typeAwareConfigPath);

    // Test ESLint configurations
    if (result.eslintConfig.fastConfig.exists) {
      try {
        const startTime = Date.now();
        execSync('yarn lint:quick --max-warnings=10000 src/components/Header/Header.tsx', {
          cwd: this.projectRoot,
          stdio: 'pipe',
          timeout: 30000
        });
        result.eslintConfig.fastConfig.estimatedTime = Date.now() - startTime;
        result.eslintConfig.fastConfig.functional = true;
        result.eslintConfig.fastConfig.performanceOptimized = result.eslintConfig.fastConfig.estimatedTime < 5000;
      } catch (error) {
        console.log(`   ${colors.yellow}⚠️  Fast ESLint config test failed${colors.reset}`);
      }
    }

    if (result.eslintConfig.typeAwareConfig.exists) {
      try {
        const startTime = Date.now();
        execSync('yarn lint:type-aware --max-warnings=10000 src/components/Header/Header.tsx', {
          cwd: this.projectRoot,
          stdio: 'pipe',
          timeout: 60000
        });
        result.eslintConfig.typeAwareConfig.estimatedTime = Date.now() - startTime;
        result.eslintConfig.typeAwareConfig.functional = true;
        result.eslintConfig.typeAwareConfig.typeCheckingEnabled = true;
      } catch (error) {
        console.log(`   ${colors.yellow}⚠️  Type-aware ESLint config test failed${colors.reset}`);
      }
    }

    // Check package.json scripts
    const packageJsonPath = join(this.projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      result.eslintConfig.packageScripts.quickLint = !!scripts['lint:quick'];
      result.eslintConfig.packageScripts.typeAwareLint = !!scripts['lint:type-aware'];
      result.eslintConfig.packageScripts.incrementalLint = !!scripts['lint:incremental'];
      result.eslintConfig.packageScripts.ciLint = !!scripts['lint:ci'];
    }

    // Check git availability
    try {
      execSync('git status', { cwd: this.projectRoot, stdio: 'pipe' });
      result.backupSystem.gitStashAvailable = true;
    } catch (error) {
      // Git not available
    }

    // Test build stability
    try {
      const startTime = Date.now();
      execSync('yarn build', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        timeout: 120000
      });
      result.buildMonitoring.buildStabilityChecks = true;
      result.buildMonitoring.buildTimeTracking = true;
    } catch (error) {
      console.log(`   ${colors.yellow}⚠️  Build stability check failed${colors.reset}`);
    }

    // Calculate readiness score
    result.readinessScore = this.calculateSimplifiedReadinessScore(result);
    result.overallReadiness = result.readinessScore >= 85;

    // Generate recommendations
    result.recommendations = this.generateSimplifiedRecommendations(result);

    return result;
  }

  /**
   * Calculate simplified readiness score
   */
  calculateSimplifiedReadinessScore(result) {
    let score = 0;
    let maxScore = 100;

    // ESLint Configuration (40 points)
    if (result.eslintConfig.fastConfig.exists) score += 10;
    if (result.eslintConfig.fastConfig.functional) score += 10;
    if (result.eslintConfig.typeAwareConfig.exists) score += 10;
    if (result.eslintConfig.typeAwareConfig.functional) score += 10;

    // Package Scripts (20 points)
    if (result.eslintConfig.packageScripts.quickLint) score += 5;
    if (result.eslintConfig.packageScripts.typeAwareLint) score += 5;
    if (result.eslintConfig.packageScripts.incrementalLint) score += 5;
    if (result.eslintConfig.packageScripts.ciLint) score += 5;

    // Backup System (20 points)
    if (result.backupSystem.gitStashAvailable) score += 20;

    // Build Monitoring (20 points)
    if (result.buildMonitoring.buildStabilityChecks) score += 20;

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Generate simplified recommendations
   */
  generateSimplifiedRecommendations(result) {
    const recommendations = [];

    if (!result.eslintConfig.fastConfig.functional) {
      recommendations.push('Fix fast ESLint configuration - required for development workflow');
    }
    if (!result.eslintConfig.typeAwareConfig.functional) {
      recommendations.push('Fix type-aware ESLint configuration - required for comprehensive validation');
    }
    if (!result.backupSystem.gitStashAvailable) {
      recommendations.push('Ensure git is properly configured for stash operations');
    }
    if (!result.buildMonitoring.buildStabilityChecks) {
      recommendations.push('Fix build stability issues before proceeding with campaigns');
    }

    return recommendations;
  }

  /**
   * Display results
   */
  displayResults(result) {
    const duration = Date.now() - this.startTime;

    console.log(`\n${colors.cyan}${colors.bright}📊 Infrastructure Preparation Results${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);

    // Overall status
    const statusColor = result.overallReadiness ? colors.green : colors.yellow;
    const statusIcon = result.overallReadiness ? '✅' : '⚠️';

    console.log(`${statusColor}${statusIcon} Overall Readiness: ${result.overallReadiness ? 'READY' : 'NEEDS ATTENTION'}${colors.reset}`);
    console.log(`${colors.blue}📈 Readiness Score: ${result.readinessScore}%${colors.reset}`);
    console.log(`${colors.blue}⏱️  Duration: ${Math.round(duration / 1000)}s${colors.reset}\n`);

    // Component status
    console.log(`${colors.yellow}🔧 Component Status:${colors.reset}`);

    const components = [
      {
        name: 'Fast ESLint Config',
        status: result.eslintConfig.fastConfig.functional,
        details: result.eslintConfig.fastConfig.functional
          ? `${result.eslintConfig.fastConfig.estimatedTime}ms`
          : 'Not functional'
      },
      {
        name: 'Type-Aware ESLint Config',
        status: result.eslintConfig.typeAwareConfig.functional,
        details: result.eslintConfig.typeAwareConfig.functional
          ? `${result.eslintConfig.typeAwareConfig.estimatedTime}ms`
          : 'Not functional'
      },
      {
        name: 'Git Backup System',
        status: result.backupSystem.gitStashAvailable,
        details: result.backupSystem.gitStashAvailable ? 'Available' : 'Not available'
      },
      {
        name: 'Build Stability',
        status: result.buildMonitoring.buildStabilityChecks,
        details: result.buildMonitoring.buildStabilityChecks ? 'Stable' : 'Unstable'
      }
    ];

    components.forEach(component => {
      const icon = component.status ? '✅' : '❌';
      const color = component.status ? colors.green : colors.red;
      console.log(`   ${color}${icon} ${component.name}: ${component.details}${colors.reset}`);
    });

    // Recommendations
    if (result.recommendations.length > 0) {
      console.log(`\n${colors.yellow}📋 Recommendations:${colors.reset}`);
      result.recommendations.forEach((rec, i) => {
        console.log(`   ${colors.yellow}${i + 1}. ${rec}${colors.reset}`);
      });
    }
  }

  /**
   * Provide next steps
   */
  provideNextSteps(result) {
    console.log(`\n${colors.cyan}${colors.bright}🎯 Next Steps${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(20)}${colors.reset}\n`);

    if (result.overallReadiness) {
      console.log(`${colors.green}✅ Infrastructure is ready for linting excellence campaigns!${colors.reset}`);
      console.log(`${colors.blue}📝 You can now proceed with Phase 2 tasks:${colors.reset}`);
      console.log(`   ${colors.blue}• Task 2.1: TS1005 Syntax Error Resolution${colors.reset}`);
      console.log(`   ${colors.blue}• Task 2.2: TS1128 Declaration Error Resolution${colors.reset}`);
      console.log(`   ${colors.blue}• Task 2.3: TS2304/TS2339 Property and Name Resolution${colors.reset}`);
      console.log(`\n${colors.green}🚀 Run: yarn lint:campaign:start${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Infrastructure needs attention before proceeding.${colors.reset}`);
      console.log(`${colors.blue}📝 Please address the recommendations above.${colors.reset}`);
      console.log(`\n${colors.yellow}🔄 Re-run this script after making fixes:${colors.reset}`);
      console.log(`${colors.yellow}   node scripts/infrastructure-preparation-runner.cjs${colors.reset}`);
    }

    console.log(`\n${colors.blue}📊 View detailed reports in:${colors.reset}`);
    console.log(`   ${colors.blue}• .kiro/metrics/infrastructure-report.json${colors.reset}`);
    console.log(`   ${colors.blue}• .kiro/metrics/infrastructure-report.html${colors.reset}`);
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.log(`\n${colors.red}${colors.bright}❌ Infrastructure Preparation Failed${colors.reset}`);
    console.log(`${colors.red}${'='.repeat(40)}${colors.reset}\n`);

    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);

    if (error.stack) {
      console.log(`\n${colors.yellow}Stack trace:${colors.reset}`);
      console.log(`${colors.yellow}${error.stack}${colors.reset}`);
    }

    console.log(`\n${colors.blue}💡 Troubleshooting:${colors.reset}`);
    console.log(`   ${colors.blue}• Ensure all prerequisites are installed${colors.reset}`);
    console.log(`   ${colors.blue}• Check that you're in the project root directory${colors.reset}`);
    console.log(`   ${colors.blue}• Verify TypeScript and ESLint configurations exist${colors.reset}`);
    console.log(`   ${colors.blue}• Try running 'yarn install' to update dependencies${colors.reset}`);
  }
}

// Execute if run directly
if (require.main === module) {
  const runner = new InfrastructurePreparationRunner();
  runner.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = InfrastructurePreparationRunner;

#!/usr/bin/env node

/**
 * Prevention Measures Setup Script
 *
 * This script sets up all the prevention measures for linting excellence:
 * - Pre-commit hooks
 * - CI/CD quality gates
 * - Error count monitoring
 * - Regression alert system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PreventionMeasuresSetup {
  constructor() {
    this.setupComplete = false;
  }

  log(message, ...args) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, ...args);
  }

  error(message, ...args) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, ...args);
  }

  success(message, ...args) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ ${message}`, ...args);
  }

  warning(message, ...args) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ⚠️  ${message}`, ...args);
  }

  checkPrerequisites() {
    this.log('Checking prerequisites...');

    // Check Node.js version
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      this.log(`Node.js version: ${nodeVersion}`);
    } catch (error) {
      this.error('Node.js not found');
      return false;
    }

    // Check Yarn
    try {
      const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
      this.log(`Yarn version: ${yarnVersion}`);
    } catch (error) {
      this.error('Yarn not found');
      return false;
    }

    // Check Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
      this.log(`Git version: ${gitVersion}`);
    } catch (error) {
      this.error('Git not found');
      return false;
    }

    // Check if we're in a Git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      this.log('Git repository detected');
    } catch (error) {
      this.error('Not in a Git repository');
      return false;
    }

    // Check package.json
    if (!fs.existsSync('package.json')) {
      this.error('package.json not found');
      return false;
    }

    this.success('All prerequisites met');
    return true;
  }

  setupDirectories() {
    this.log('Setting up directories...');

    const directories = [
      'logs',
      'scripts/monitoring',
      '.github/workflows'
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      } else {
        this.log(`Directory exists: ${dir}`);
      }
    }

    this.success('Directories setup complete');
  }

  validateHuskySetup() {
    this.log('Validating Husky setup...');

    // Check if Husky is installed
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      if (!packageJson.devDependencies?.husky) {
        this.warning('Husky not found in devDependencies');
        return false;
      }

      // Check if .husky directory exists
      if (!fs.existsSync('.husky')) {
        this.warning('.husky directory not found');
        return false;
      }

      // Check if hooks exist
      const requiredHooks = ['pre-commit', 'pre-push'];
      for (const hook of requiredHooks) {
        const hookPath = `.husky/${hook}`;
        if (!fs.existsSync(hookPath)) {
          this.warning(`Hook not found: ${hookPath}`);
          return false;
        }
      }

      this.success('Husky setup validated');
      return true;
    } catch (error) {
      this.error('Error validating Husky setup:', error.message);
      return false;
    }
  }

  validateCISetup() {
    this.log('Validating CI/CD setup...');

    const requiredWorkflows = [
      '.github/workflows/ci.yml',
      '.github/workflows/quality-gates.yml',
      '.github/workflows/regression-monitoring.yml'
    ];

    let allValid = true;

    for (const workflow of requiredWorkflows) {
      if (!fs.existsSync(workflow)) {
        this.warning(`Workflow not found: ${workflow}`);
        allValid = false;
      } else {
        this.log(`Workflow exists: ${workflow}`);
      }
    }

    if (allValid) {
      this.success('CI/CD setup validated');
    } else {
      this.warning('Some CI/CD workflows are missing');
    }

    return allValid;
  }

  validateMonitoringScripts() {
    this.log('Validating monitoring scripts...');

    const requiredScripts = [
      'src/scripts/error-count-monitor.cjs',
      'src/scripts/regression-alert-system.cjs'
    ];

    let allValid = true;

    for (const script of requiredScripts) {
      if (!fs.existsSync(script)) {
        this.warning(`Script not found: ${script}`);
        allValid = false;
      } else {
        this.log(`Script exists: ${script}`);
      }
    }

    if (allValid) {
      this.success('Monitoring scripts validated');
    } else {
      this.warning('Some monitoring scripts are missing');
    }

    return allValid;
  }

  validatePackageJsonScripts() {
    this.log('Validating package.json scripts...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};

      const requiredScripts = [
        'monitor:errors',
        'monitor:continuous',
        'monitor:report',
        'monitor:status',
        'regression:check',
        'regression:baseline',
        'regression:report',
        'regression:status',
        'regression:clear'
      ];

      let allValid = true;

      for (const script of requiredScripts) {
        if (!scripts[script]) {
          this.warning(`Package.json script not found: ${script}`);
          allValid = false;
        } else {
          this.log(`Package.json script exists: ${script}`);
        }
      }

      if (allValid) {
        this.success('Package.json scripts validated');
      } else {
        this.warning('Some package.json scripts are missing');
      }

      return allValid;
    } catch (error) {
      this.error('Error validating package.json scripts:', error.message);
      return false;
    }
  }

  testMonitoringSystem() {
    this.log('Testing monitoring system...');

    try {
      // Test error count monitor
      this.log('Testing error count monitor...');
      execSync('yarn monitor:errors', { stdio: 'pipe' });
      this.success('Error count monitor test passed');

      // Test regression alert system
      this.log('Testing regression alert system...');
      execSync('yarn regression:check', { stdio: 'pipe' });
      this.success('Regression alert system test passed');

      return true;
    } catch (error) {
      this.error('Monitoring system test failed:', error.message);
      return false;
    }
  }

  establishBaseline() {
    this.log('Establishing quality baseline...');

    try {
      execSync('yarn regression:baseline', { stdio: 'inherit' });
      this.success('Quality baseline established');
      return true;
    } catch (error) {
      this.error('Failed to establish baseline:', error.message);
      return false;
    }
  }

  generateSetupReport() {
    this.log('Generating setup report...');

    const report = {
      timestamp: new Date().toISOString(),
      setupComplete: this.setupComplete,
      components: {
        prerequisites: this.checkPrerequisites(),
        directories: true, // Always true if we get this far
        huskySetup: this.validateHuskySetup(),
        ciSetup: this.validateCISetup(),
        monitoringScripts: this.validateMonitoringScripts(),
        packageJsonScripts: this.validatePackageJsonScripts(),
        monitoringTest: false, // Will be updated
        baselineEstablished: false // Will be updated
      }
    };

    // Test monitoring system
    report.components.monitoringTest = this.testMonitoringSystem();

    // Establish baseline
    report.components.baselineEstablished = this.establishBaseline();

    // Determine overall success
    this.setupComplete = Object.values(report.components).every(Boolean);
    report.setupComplete = this.setupComplete;

    // Save report
    const reportPath = 'logs/prevention-measures-setup-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log('\n📊 Prevention Measures Setup Report');
    console.log('====================================\n');

    console.log('Component Status:');
    Object.entries(report.components).forEach(([component, status]) => {
      const icon = status ? '✅' : '❌';
      const name = component.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`  ${icon} ${name}`);
    });

    console.log(`\nOverall Status: ${this.setupComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
    console.log(`Report saved to: ${reportPath}\n`);

    if (this.setupComplete) {
      console.log('🎉 Prevention measures setup completed successfully!');
      console.log('\nNext steps:');
      console.log('- Monitor quality: yarn monitor:report');
      console.log('- Check regressions: yarn regression:report');
      console.log('- View CI/CD workflows in GitHub Actions');
      console.log('- Commit changes to activate pre-commit hooks');
    } else {
      console.log('⚠️  Setup incomplete. Please address the failed components above.');
    }

    return report;
  }

  async run() {
    console.log('🚀 Setting up Prevention Measures for Linting Excellence');
    console.log('======================================================\n');

    try {
      // Setup directories first
      this.setupDirectories();

      // Generate comprehensive report
      const report = this.generateSetupReport();

      return report.setupComplete;
    } catch (error) {
      this.error('Setup failed:', error.message);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const setup = new PreventionMeasuresSetup();
  const success = await setup.run();

  if (success) {
    console.log('\n✅ Prevention measures setup completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Prevention measures setup failed. Check the report for details.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Setup error:', error.message);
    process.exit(1);
  });
}

module.exports = { PreventionMeasuresSetup };

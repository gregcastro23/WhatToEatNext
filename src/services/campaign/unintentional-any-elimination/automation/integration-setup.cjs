#!/usr/bin/env node

/**
 * Integration Setup Script
 *
 * Sets up automation script integration with existing campaign infrastructure
 * Configures package.json scripts, git hooks, and CI/CD integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  packageJsonPath: './package.json',
  huskyDir: './.husky',
  githubWorkflowsDir: './.github/workflows',
  configDir: './config',
  scriptsFile: './src/services/campaign/unintentional-any-elimination/automation/package-scripts.json'
};

// Logging utility
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Load package.json
function loadPackageJson() {
  try {
    const data = fs.readFileSync(CONFIG.packageJsonPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log('error', 'Failed to load package.json', { error: error.message });
    throw error;
  }
}

// Save package.json
function savePackageJson(packageData) {
  try {
    fs.writeFileSync(CONFIG.packageJsonPath, JSON.stringify(packageData, null, 2));
    log('info', 'Updated package.json');
  } catch (error) {
    log('error', 'Failed to save package.json', { error: error.message });
    throw error;
  }
}

// Load automation scripts
function loadAutomationScripts() {
  try {
    const data = fs.readFileSync(CONFIG.scriptsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log('error', 'Failed to load automation scripts', { error: error.message });
    throw error;
  }
}

// Integrate package.json scripts
function integratePackageScripts() {
  log('info', 'Integrating package.json scripts');

  const packageData = loadPackageJson();
  const automationData = loadAutomationScripts();

  // Ensure scripts section exists
  if (!packageData.scripts) {
    packageData.scripts = {};
  }

  // Add automation scripts
  Object.entries(automationData.scripts).forEach(([key, value]) => {
    if (packageData.scripts[key]) {
      log('warn', `Script ${key} already exists, backing up as ${key}-backup`);
      packageData.scripts[`${key}-backup`] = packageData.scripts[key];
    }
    packageData.scripts[key] = value;
  });

  // Add workflow scripts
  const workflowScripts = {
    'any:pre-commit': 'yarn any:validate && yarn lint && yarn test',
    'any:daily': 'yarn any:analyze && yarn any:monitor --interval=3600 &',
    'any:weekly': 'yarn any:fix && yarn any:report',
    'any:ci-check': 'yarn tsc --noEmit --skipLibCheck && yarn lint --max-warnings=100'
  };

  Object.entries(workflowScripts).forEach(([key, value]) => {
    packageData.scripts[key] = value;
  });

  savePackageJson(packageData);

  log('info', 'Package.json scripts integrated successfully', {
    addedScripts: Object.keys(automationData.scripts).length + Object.keys(workflowScripts).length
  });
}

// Setup git hooks
function setupGitHooks() {
  log('info', 'Setting up git hooks');

  // Ensure husky directory exists
  if (!fs.existsSync(CONFIG.huskyDir)) {
    fs.mkdirSync(CONFIG.huskyDir, { recursive: true });
  }

  // Pre-commit hook
  const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Unintentional Any Elimination pre-commit checks
echo "Running unintentional any elimination pre-commit checks..."

# Validate system state
yarn any:validate --build --safety

# Check if explicit-any count is within acceptable limits
ANY_COUNT=$(yarn lint --format=unix 2>/dev/null | grep -c "@typescript-eslint/no-explicit-any" || echo "0")
THRESHOLD=\${ANY_THRESHOLD:-200}

if [ "$ANY_COUNT" -gt "$THRESHOLD" ]; then
  echo "⚠️  Warning: Explicit-any count ($ANY_COUNT) exceeds threshold ($THRESHOLD)"
  echo "Consider running 'yarn any:fix-conservative' before committing"

  # Auto-fix if enabled
  if [ "$AUTO_FIX_ANY" = "true" ]; then
    echo "Auto-fixing enabled, running conservative fixes..."
    yarn any:fix-conservative --max-files=5
  fi
fi

# Run standard pre-commit checks
yarn lint
yarn test
`;

  const preCommitPath = path.join(CONFIG.huskyDir, 'pre-commit');
  fs.writeFileSync(preCommitPath, preCommitHook);

  // Make executable
  try {
    execSync(`chmod +x ${preCommitPath}`);
  } catch (error) {
    log('warn', 'Failed to make pre-commit hook executable', { error: error.message });
  }

  // Pre-push hook
  const prePushHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Unintentional Any Elimination pre-push checks
echo "Running unintentional any elimination pre-push checks..."

# Ensure build passes
yarn build

# Check for critical any type issues
CRITICAL_COUNT=$(yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | grep -E "(error|catch|mock)" | wc -l || echo "0")

if [ "$CRITICAL_COUNT" -gt "10" ]; then
  echo "❌ Critical explicit-any issues detected ($CRITICAL_COUNT)"
  echo "Please review and fix critical any types before pushing"
  exit 1
fi

echo "✅ Pre-push checks passed"
`;

  const prePushPath = path.join(CONFIG.huskyDir, 'pre-push');
  fs.writeFileSync(prePushPath, prePushHook);

  try {
    execSync(`chmod +x ${prePushPath}`);
  } catch (error) {
    log('warn', 'Failed to make pre-push hook executable', { error: error.message });
  }

  log('info', 'Git hooks setup completed');
}

// Setup GitHub Actions workflow
function setupGitHubWorkflow() {
  log('info', 'Setting up GitHub Actions workflow');

  if (!fs.existsSync(CONFIG.githubWorkflowsDir)) {
    fs.mkdirSync(CONFIG.githubWorkflowsDir, { recursive: true });
  }

  const workflow = `name: Unintentional Any Elimination

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    # Run daily at 9 AM UTC
    - cron: '0 9 * * *'

jobs:
  analyze:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'

    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Run analysis
      run: yarn any:analyze
      env:
        MAX_FILES: 50
        DRY_RUN: true

    - name: Generate report
      run: yarn any:report --format=json --output=any-analysis-report.json

    - name: Upload analysis report
      uses: actions/upload-artifact@v3
      with:
        name: any-analysis-report
        path: any-analysis-report.json

  quality-check:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'

    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Validate system
      run: yarn any:validate --build --safety

    - name: Check explicit-any count
      run: |
        ANY_COUNT=$(yarn lint --format=unix 2>/dev/null | grep -c "@typescript-eslint/no-explicit-any" || echo "0")
        echo "Current explicit-any count: $ANY_COUNT"

        if [ "$ANY_COUNT" -gt "500" ]; then
          echo "::warning::High explicit-any count detected ($ANY_COUNT)"
        fi

        echo "any-count=$ANY_COUNT" >> $GITHUB_OUTPUT
      id: any-check

    - name: Run TypeScript check
      run: yarn tsc --noEmit --skipLibCheck

    - name: Run linting
      run: yarn lint --max-warnings=1000

  auto-fix:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'

    steps:
    - uses: actions/checkout@v3
      with:
        token: \${{ secrets.GITHUB_TOKEN }}

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'

    - name: Install dependencies
      run: yarn install --frozen-lockfile

    - name: Run conservative fixes
      run: yarn any:fix-conservative --max-files=10
      env:
        SAFETY_LEVEL: MAXIMUM
        DRY_RUN: false

    - name: Check for changes
      id: changes
      run: |
        if [ -n "$(git status --porcelain)" ]; then
          echo "changes=true" >> $GITHUB_OUTPUT
        else
          echo "changes=false" >> $GITHUB_OUTPUT
        fi

    - name: Create Pull Request
      if: steps.changes.outputs.changes == 'true'
      uses: peter-evans/create-pull-request@v5
      with:
        token: \${{ secrets.GITHUB_TOKEN }}
        commit-message: 'fix: automated unintentional any type elimination'
        title: 'Automated: Unintentional Any Type Elimination'
        body: |
          This PR contains automated fixes for unintentional any types.

          - Applied conservative fixes with maximum safety protocols
          - All changes have been validated against TypeScript compilation
          - Build status verified before applying changes

          Please review the changes before merging.
        branch: automated/any-elimination
        delete-branch: true
`;

  const workflowPath = path.join(CONFIG.githubWorkflowsDir, 'unintentional-any-elimination.yml');
  fs.writeFileSync(workflowPath, workflow);

  log('info', 'GitHub Actions workflow created');
}

// Setup configuration files
function setupConfiguration() {
  log('info', 'Setting up configuration files');

  if (!fs.existsSync(CONFIG.configDir)) {
    fs.mkdirSync(CONFIG.configDir, { recursive: true });
  }

  // Campaign schedule configuration
  const campaignSchedule = {
    campaigns: [
      {
        id: 'daily-analysis',
        name: 'Daily Analysis Campaign',
        schedule: '0 9 * * *',
        command: 'node unintentional-any-eliminator.cjs --max-files=10 --safety=MAXIMUM --dry-run',
        enabled: true,
        safetyLevel: 'MAXIMUM',
        maxDuration: 1800000,
        retryCount: 2
      },
      {
        id: 'weekly-cleanup',
        name: 'Weekly Cleanup Campaign',
        schedule: '0 2 * * 0',
        command: 'node unintentional-any-eliminator.cjs --max-files=50 --safety=HIGH --target=10',
        enabled: false,
        safetyLevel: 'HIGH',
        maxDuration: 3600000,
        retryCount: 1
      }
    ],
    globalSettings: {
      maxConcurrentCampaigns: 1,
      alertThreshold: 100,
      safetyCheckInterval: 300
    }
  };

  const scheduleConfigPath = path.join(CONFIG.configDir, 'campaign-schedule.json');
  fs.writeFileSync(scheduleConfigPath, JSON.stringify(campaignSchedule, null, 2));

  // Environment configuration
  const envConfig = `# Unintentional Any Elimination Configuration

# Processing limits
MAX_FILES=25
BATCH_SIZE=15
VALIDATION_FREQ=5

# Safety settings
SAFETY_LEVEL=MAXIMUM
CONFIDENCE_THRESHOLD=0.8
TARGET_REDUCTION=15.0

# Execution modes
DRY_RUN=false
CONTINUE_ON_ERROR=false
ENABLE_CAMPAIGN=true

# Monitoring and alerting
ALERT_THRESHOLD=100
MONITORING_INTERVAL=30
LOG_LEVEL=info

# Directories
OUTPUT_DIR=./reports
BACKUP_DIR=./backups
DEBUG_OUTPUT_DIR=./debug-output

# Git hooks
AUTO_FIX_ANY=false
ANY_THRESHOLD=200

# CI/CD integration
CI_MAX_FILES=10
CI_SAFETY_LEVEL=MAXIMUM
CI_TARGET_REDUCTION=5.0
`;

  const envConfigPath = path.join(CONFIG.configDir, 'any-elimination.env');
  fs.writeFileSync(envConfigPath, envConfig);

  log('info', 'Configuration files created');
}

// Validate integration
function validateIntegration() {
  log('info', 'Validating integration');

  const validationResults = {
    packageJson: false,
    gitHooks: false,
    githubWorkflow: false,
    configuration: false,
    cliTools: false,
    automationScripts: false
  };

  // Check package.json
  try {
    const packageData = loadPackageJson();
    validationResults.packageJson = packageData.scripts && packageData.scripts['any:analyze'];
  } catch (error) {
    log('error', 'Package.json validation failed', { error: error.message });
  }

  // Check git hooks
  validationResults.gitHooks = fs.existsSync(path.join(CONFIG.huskyDir, 'pre-commit'));

  // Check GitHub workflow
  validationResults.githubWorkflow = fs.existsSync(path.join(CONFIG.githubWorkflowsDir, 'unintentional-any-elimination.yml'));

  // Check configuration
  validationResults.configuration = fs.existsSync(path.join(CONFIG.configDir, 'campaign-schedule.json'));

  // Check CLI tools
  validationResults.cliTools = fs.existsSync('./src/services/campaign/unintentional-any-elimination/cli/index.js');

  // Check automation scripts
  validationResults.automationScripts = fs.existsSync('./unintentional-any-eliminator.cjs');

  const allValid = Object.values(validationResults).every(result => result);

  log('info', 'Integration validation completed', {
    results: validationResults,
    allValid
  });

  return { validationResults, allValid };
}

// Main setup function
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'install':
      log('info', 'Installing unintentional any elimination automation');

      try {
        integratePackageScripts();
        setupGitHooks();
        setupGitHubWorkflow();
        setupConfiguration();

        const { validationResults, allValid } = validateIntegration();

        if (allValid) {
          log('info', 'Installation completed successfully');
          console.log('\n✅ Unintentional Any Elimination automation installed successfully!');
          console.log('\nNext steps:');
          console.log('1. Run "yarn any:analyze" to perform initial analysis');
          console.log('2. Run "yarn any:help" to see all available commands');
          console.log('3. Configure settings in ./config/any-elimination.env');
          console.log('4. Start monitoring with "yarn any:monitor"');
        } else {
          log('error', 'Installation completed with issues', { validationResults });
          console.log('\n⚠️  Installation completed with some issues. Check the logs above.');
        }

      } catch (error) {
        log('error', 'Installation failed', { error: error.message });
        console.error('Installation failed:', error.message);
        process.exit(1);
      }
      break;

    case 'validate':
      const { validationResults, allValid } = validateIntegration();

      console.log('\n=== INTEGRATION VALIDATION ===');
      Object.entries(validationResults).forEach(([component, valid]) => {
        const status = valid ? '✅' : '❌';
        console.log(`${status} ${component}`);
      });

      if (allValid) {
        console.log('\n✅ All components validated successfully');
      } else {
        console.log('\n❌ Some components failed validation');
        process.exit(1);
      }
      break;

    case 'uninstall':
      log('info', 'Uninstalling unintentional any elimination automation');

      // Remove scripts from package.json
      try {
        const packageData = loadPackageJson();
        const automationData = loadAutomationScripts();

        Object.keys(automationData.scripts).forEach(key => {
          delete packageData.scripts[key];
        });

        // Remove workflow scripts
        ['any:pre-commit', 'any:daily', 'any:weekly', 'any:ci-check'].forEach(key => {
          delete packageData.scripts[key];
        });

        savePackageJson(packageData);
        log('info', 'Removed scripts from package.json');

      } catch (error) {
        log('error', 'Failed to remove scripts from package.json', { error: error.message });
      }

      // Remove git hooks
      try {
        const preCommitPath = path.join(CONFIG.huskyDir, 'pre-commit');
        const prePushPath = path.join(CONFIG.huskyDir, 'pre-push');

        if (fs.existsSync(preCommitPath)) fs.unlinkSync(preCommitPath);
        if (fs.existsSync(prePushPath)) fs.unlinkSync(prePushPath);

        log('info', 'Removed git hooks');
      } catch (error) {
        log('error', 'Failed to remove git hooks', { error: error.message });
      }

      console.log('\n✅ Uninstallation completed');
      break;

    default:
      console.log(`
Integration Setup Script for Unintentional Any Elimination

USAGE:
  node integration-setup.cjs <command>

COMMANDS:
  install     Install and configure automation integration
  validate    Validate current integration status
  uninstall   Remove automation integration

EXAMPLES:
  # Install complete automation integration
  node integration-setup.cjs install

  # Check if integration is working
  node integration-setup.cjs validate

  # Remove integration
  node integration-setup.cjs uninstall

WHAT GETS INSTALLED:
  - Package.json scripts for all CLI tools
  - Git hooks for pre-commit and pre-push validation
  - GitHub Actions workflow for automated analysis
  - Configuration files for campaigns and settings
  - Integration with existing campaign infrastructure
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  integratePackageScripts,
  setupGitHooks,
  setupGitHubWorkflow,
  setupConfiguration,
  validateIntegration
};

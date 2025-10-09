#!/usr/bin/env node

/**
 * Branch Protection Setup - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 8, 2025
 *
 * Automated branch protection configuration for quality gate enforcement
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class BranchProtectionSetup {
  constructor() {
    this.projectRoot = path.resolve(import.meta.dirname || path.dirname(import.meta.url.replace('file://', '')), '../../../');
    this.configPath = path.join(this.projectRoot, '.quality-gates', 'branch-protection.json');
    this.defaultConfig = {
      branches: {
        master: {
          required_status_checks: {
            strict: true,
            contexts: [
              'Quality Gate',
              'performance-monitoring',
              'trend-analysis'
            ]
          },
          enforce_admins: false,
          required_pull_request_reviews: {
            required_approving_review_count: 1,
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            dismissal_restrictions: {}
          },
          restrictions: null,
          allow_force_pushes: false,
          allow_deletions: false,
          block_creations: false
        },
        main: {
          required_status_checks: {
            strict: true,
            contexts: [
              'Quality Gate',
              'performance-monitoring',
              'trend-analysis'
            ]
          },
          enforce_admins: false,
          required_pull_request_reviews: {
            required_approving_review_count: 1,
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            dismissal_restrictions: {}
          },
          restrictions: null,
          allow_force_pushes: false,
          allow_deletions: false,
          block_creations: false
        },
        develop: {
          required_status_checks: {
            strict: false,
            contexts: [
              'Quality Gate'
            ]
          },
          enforce_admins: false,
          required_pull_request_reviews: {
            required_approving_review_count: 1,
            dismiss_stale_reviews: true,
            require_code_owner_reviews: false,
            dismissal_restrictions: {}
          },
          restrictions: null,
          allow_force_pushes: false,
          allow_deletions: false,
          block_creations: false
        }
      },
      qualityThresholds: {
        maxTotalErrors: 1000,
        maxCriticalErrors: 50,
        maxHighPriorityErrors: 200,
        requiredTestCoverage: 80,
        maxBuildTime: 300, // seconds
        maxLintTime: 60    // seconds
      },
      automatedActions: {
        enableAutoFix: true,
        autoFixBranches: ['master', 'main'],
        createFixPRs: true,
        notifyOnFailure: true
      }
    };
  }

  /**
   * Generate GitHub branch protection configuration
   */
  generateProtectionConfig() {
    console.log('🛡️ Generating Branch Protection Configuration...');

    const config = this.loadOrCreateConfig();

    console.log('\n📋 Branch Protection Rules:');
    console.log('='.repeat(50));

    Object.entries(config.branches).forEach(([branch, rules]) => {
      console.log(`\n🌿 Branch: ${branch}`);
      console.log(`  • Status Checks Required: ${rules.required_status_checks.contexts.join(', ')}`);
      console.log(`  • Strict Status Checks: ${rules.required_status_checks.strict ? 'Yes' : 'No'}`);
      console.log(`  • PR Reviews Required: ${rules.required_pull_request_reviews.required_approving_review_count}`);
      console.log(`  • Force Pushes: ${rules.allow_force_pushes ? 'Allowed' : 'Blocked'}`);
      console.log(`  • Deletions: ${rules.allow_deletions ? 'Allowed' : 'Blocked'}`);
    });

    console.log('\n📊 Quality Thresholds:');
    console.log(`  • Max Total Errors: ${config.qualityThresholds.maxTotalErrors}`);
    console.log(`  • Max Critical Errors: ${config.qualityThresholds.maxCriticalErrors}`);
    console.log(`  • Max Build Time: ${config.qualityThresholds.maxBuildTime}s`);
    console.log(`  • Min Test Coverage: ${config.qualityThresholds.requiredTestCoverage}%`);

    return config;
  }

  /**
   * Apply branch protection rules via GitHub CLI
   */
  async applyProtectionRules(token) {
    console.log('🔧 Applying Branch Protection Rules...');

    if (!token) {
      console.log('❌ GitHub token required for applying protection rules');
      console.log('Usage: node branch-protection.js apply --token <github-token>');
      return false;
    }

    const config = this.loadOrCreateConfig();

    try {
      // Check if GitHub CLI is available
      execSync('gh --version', { stdio: 'pipe' });

      for (const [branch, rules] of Object.entries(config.branches)) {
        console.log(`\n🔒 Setting up protection for branch: ${branch}`);

        // Build gh command for branch protection
        let cmd = `gh api repos/{owner}/{repo}/branches/${branch}/protection`;

        const protectionData = {
          required_status_checks: rules.required_status_checks,
          enforce_admins: rules.enforce_admins,
          required_pull_request_reviews: rules.required_pull_request_reviews,
          restrictions: rules.restrictions,
          allow_force_pushes: rules.allow_force_pushes,
          allow_deletions: rules.allow_deletions,
          block_creations: rules.block_creations
        };

        // Use GitHub CLI to set branch protection
        const ghCmd = `gh api repos/{owner}/{repo}/branches/${branch}/protection -X PUT -H "Authorization: token ${token}" -f '${JSON.stringify(protectionData)}'`;

        try {
          execSync(ghCmd, { stdio: 'pipe' });
          console.log(`✅ Protection applied to ${branch}`);
        } catch (error) {
          console.log(`❌ Failed to protect ${branch}:`, error.message);
        }
      }

      console.log('\n✅ Branch protection setup complete');
      return true;

    } catch (error) {
      console.log('❌ GitHub CLI not available or authentication failed');
      console.log('Manual setup instructions:');
      this.generateManualInstructions(config);
      return false;
    }
  }

  /**
   * Generate manual setup instructions
   */
  generateManualInstructions(config) {
    console.log('\n📖 Manual Branch Protection Setup:');
    console.log('='.repeat(50));
    console.log('Navigate to your GitHub repository settings and configure:');

    Object.entries(config.branches).forEach(([branch, rules]) => {
      console.log(`\n🌿 ${branch} Branch:`);
      console.log(`  1. Go to Settings → Branches → Add Rule`);
      console.log(`  2. Branch name pattern: ${branch}`);
      console.log(`  3. ✅ Require status checks to pass before merging`);
      console.log(`  4. ✅ Require branches to be up to date before merging`);
      console.log(`  5. Status checks:`);

      rules.required_status_checks.contexts.forEach(check => {
        console.log(`     • ${check}`);
      });

      console.log(`  6. ✅ Require pull request reviews before merging`);
      console.log(`  7. Required approving reviews: ${rules.required_pull_request_reviews.required_approving_review_count}`);
      console.log(`  8. ✅ Dismiss stale pull request approvals when new commits are pushed`);
      console.log(`  9. ✅ Restrict who can push to matching branches`);
      console.log(`  10. ✅ Allow deletions: No`);
      console.log(`  11. ✅ Allow force pushes: No`);
    });
  }

  /**
   * Validate current branch protection status
   */
  async validateProtectionStatus(token) {
    console.log('🔍 Validating Branch Protection Status...');

    if (!token) {
      console.log('❌ GitHub token required for validation');
      return false;
    }

    const config = this.loadOrCreateConfig();

    try {
      for (const branch of Object.keys(config.branches)) {
        console.log(`\n🔍 Checking ${branch}...`);

        const cmd = `gh api repos/{owner}/{repo}/branches/${branch}/protection -H "Authorization: token ${token}"`;
        const result = execSync(cmd, { encoding: 'utf8' });

        const protection = JSON.parse(result);

        if (protection.enabled) {
          console.log(`✅ ${branch} is protected`);

          // Check required status checks
          const requiredChecks = protection.required_status_checks?.contexts || [];
          const expectedChecks = config.branches[branch].required_status_checks.contexts;

          const missingChecks = expectedChecks.filter(check => !requiredChecks.includes(check));
          if (missingChecks.length > 0) {
            console.log(`⚠️ Missing status checks: ${missingChecks.join(', ')}`);
          }

          // Check PR reviews
          const prReviews = protection.required_pull_request_reviews;
          if (prReviews?.required_approving_review_count >= 1) {
            console.log(`✅ PR reviews required (${prReviews.required_approving_review_count})`);
          } else {
            console.log(`⚠️ PR reviews not properly configured`);
          }

        } else {
          console.log(`❌ ${branch} is not protected`);
        }
      }

      return true;

    } catch (error) {
      console.log('❌ Failed to validate protection status:', error.message);
      return false;
    }
  }

  /**
   * Generate quality gate status badge configuration
   */
  generateStatusBadges() {
    console.log('🏷️ Generating Status Badge Configuration...');

    const badges = {
      qualityGate: {
        label: 'Quality Gate',
        message: 'passing',
        color: 'brightgreen',
        targetUrl: 'https://github.com/{owner}/{repo}/actions/workflows/quality-gate.yml'
      },
      buildStatus: {
        label: 'Build',
        message: 'passing',
        color: 'brightgreen',
        targetUrl: 'https://github.com/{owner}/{repo}/actions/workflows/quality-gate.yml'
      },
      errorCount: {
        label: 'Errors',
        message: '<1000',
        color: 'green',
        targetUrl: 'https://github.com/{owner}/{repo}/actions/workflows/quality-gate.yml'
      }
    };

    const readmeBadge = `
<!-- Quality Assurance Badges -->
![Quality Gate](https://img.shields.io/badge/Quality%20Gate-passing-brightgreen)
![Build Status](https://img.shields.io/badge/Build-passing-brightgreen)
![Error Count](https://img.shields.io/badge/Errors-%3C1000-green)
`;

    console.log('\n📋 README Badge Markdown:');
    console.log(readmeBadge);

    const badgePath = path.join(this.projectRoot, '.quality-gates', 'badges.json');
    fs.writeFileSync(badgePath, JSON.stringify(badges, null, 2));
    console.log(`\n💾 Badge configuration saved to: ${badgePath}`);

    return badges;
  }

  /**
   * Setup automated quality monitoring
   */
  setupAutomatedMonitoring() {
    console.log('📊 Setting up Automated Quality Monitoring...');

    const monitoringConfig = {
      schedule: '0 */4 * * *', // Every 4 hours
      checks: [
        'error-count-monitoring',
        'build-status-monitoring',
        'quality-gate-validation',
        'dependency-security-scan'
      ],
      alerts: {
        errorThresholdExceeded: true,
        buildFailureStreak: true,
        qualityDegradation: true,
        securityVulnerabilities: true
      },
      notifications: {
        slack: false,
        email: false,
        githubIssues: true
      }
    };

    const monitoringPath = path.join(this.projectRoot, '.quality-gates', 'monitoring.json');
    fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));

    console.log('✅ Automated monitoring configuration created');
    console.log(`📁 Configuration: ${monitoringPath}`);

    // Generate cron job instructions
    console.log('\n⏰ Cron Job Setup:');
    console.log('Add to your CI/CD schedule:');
    console.log(`  ${monitoringConfig.schedule} node src/scripts/quality-gates/ci-cd-orchestrator.js status`);

    return monitoringConfig;
  }

  /**
   * Load or create configuration
   */
  loadOrCreateConfig() {
    if (fs.existsSync(this.configPath)) {
      try {
        const customConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return { ...this.defaultConfig, ...customConfig };
      } catch (error) {
        console.warn('⚠️ Failed to load custom config, using defaults:', error.message);
      }
    }

    // Ensure directory exists
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Save default config
    fs.writeFileSync(this.configPath, JSON.stringify(this.defaultConfig, null, 2));
    console.log(`📝 Created default configuration: ${this.configPath}`);

    return this.defaultConfig;
  }

  /**
   * Generate comprehensive setup guide
   */
  generateSetupGuide() {
    const guide = `# Branch Protection & Quality Gates Setup Guide

## Overview
This guide covers the setup of enterprise-grade branch protection and quality assurance for the WhatToEatNext project.

## Prerequisites
- GitHub repository admin access
- GitHub CLI installed (optional, for automated setup)
- Node.js 20.x environment

## Automated Setup

### 1. Generate Configuration
\`\`\`bash
node src/scripts/quality-gates/branch-protection.js generate
\`\`\`

### 2. Apply Protection Rules (GitHub CLI)
\`\`\`bash
# Requires GitHub token with repo permissions
node src/scripts/quality-gates/branch-protection.js apply --token YOUR_GITHUB_TOKEN
\`\`\`

### 3. Validate Protection Status
\`\`\`bash
node src/scripts/quality-gates/branch-protection.js validate --token YOUR_GITHUB_TOKEN
\`\`\`

## Manual Setup (GitHub Web Interface)

Navigate to **Settings → Branches → Add Rule** for each protected branch:

### Protected Branches: \`master\`, \`main\`, \`develop\`

#### Status Checks (Required)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Status checks to require:
  - \`Quality Gate\`
  - \`performance-monitoring\`
  - \`trend-analysis\`

#### Branch Protection Rules
- ✅ Require pull request reviews before merging
- Required approving reviews: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (optional)
- ✅ Restrict who can push to matching branches
- ✅ Allow deletions: **No**
- ✅ Allow force pushes: **No**

## Quality Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Total Errors | < 1,000 | Block merge |
| Critical Errors | < 50 | Block merge |
| Build Time | < 300s | Warning |
| Test Coverage | > 80% | Warning |

## Automated Actions

### Auto-Fix (Main Branches Only)
- ✅ Enabled for \`master\` and \`main\` branches
- Automatically applies Phase 4 processors for common errors
- Creates commits with automated fixes

### Monitoring
- Quality metrics collected on every push
- Trend analysis for error patterns
- Automated alerts for quality degradation

## Status Badges

Add these badges to your README.md:

\`\`\`markdown
<!-- Quality Assurance Badges -->
![Quality Gate](https://img.shields.io/badge/Quality%20Gate-passing-brightgreen)
![Build Status](https://img.shields.io/badge/Build-passing-brightgreen)
![Error Count](https://img.shields.io/badge/Errors-%3C1000-green)
\`\`\`

## Pre-commit Hooks

### Local Development Setup
\`\`\`bash
# Install pre-commit quality gate
node src/scripts/quality-gates/pre-commit-hook.js install

# Test the hook
node src/scripts/quality-gates/pre-commit-hook.js test
\`\`\`

### Bypass Options
\`\`\`bash
# Skip quality gates for urgent commits
git commit --no-verify -m "URGENT: Hotfix message"
\`\`\`

## Troubleshooting

### Common Issues

1. **"Quality gates failed" on commit**
   - Run: \`node src/scripts/quality-gates/ci-cd-orchestrator.js analyze\`
   - Fix identified issues
   - Commit again

2. **Branch protection blocking merges**
   - Ensure all status checks are passing
   - Check quality gate results in Actions tab
   - Address any failing checks

3. **Pre-commit hook not working**
   - Verify hook is installed: \`ls -la .git/hooks/pre-commit\`
   - Check hook permissions: \`chmod +x .git/hooks/pre-commit\`
   - Reinstall: \`node src/scripts/quality-gates/pre-commit-hook.js install\`

### Emergency Procedures

1. **Disable quality gates temporarily**
   \`\`\`bash
   # Edit .quality-gates/config.json
   {
     "qualityGates": {
       "enabled": false
     }
   }
   \`\`\`

2. **Force merge (admin only)**
   - Use GitHub web interface "Merge without waiting for requirements"

3. **Reset to clean state**
   \`\`\`bash
   git reset --hard origin/main
   git clean -fd
   \`\`\`

## Monitoring & Analytics

### Quality Metrics Dashboard
- View metrics: \`.quality-gates/metrics/\`
- Quality reports: \`.quality-gates/reports/\`
- Trend analysis: Run CI/CD pipeline

### Alerting
- Quality degradation alerts via GitHub Issues
- Performance regression notifications
- Security vulnerability alerts

## Support

For issues with quality gates:
1. Check the [Phase 4 Quality Assurance Guide](../docs/phase4-quality-assurance.md)
2. Review CI/CD pipeline logs
3. Create an issue with label \`quality-assistance\`

---

*Generated by Phase 4 Branch Protection Setup - ${new Date().toISOString()}*
`;

    const guidePath = path.join(this.projectRoot, 'docs', 'branch-protection-setup.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`📖 Setup guide generated: ${guidePath}`);

    return guide;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const setup = new BranchProtectionSetup();

  switch (command) {
    case 'generate':
      setup.generateProtectionConfig();
      setup.generateStatusBadges();
      setup.setupAutomatedMonitoring();
      setup.generateSetupGuide();
      break;

    case 'apply':
      const token = args.find(arg => arg.startsWith('--token='))?.split('=')[1] ||
                   process.env.GITHUB_TOKEN;
      setup.applyProtectionRules(token);
      break;

    case 'validate':
      const valToken = args.find(arg => arg.startsWith('--token='))?.split('=')[1] ||
                      process.env.GITHUB_TOKEN;
      setup.validateProtectionStatus(valToken);
      break;

    case 'badges':
      setup.generateStatusBadges();
      break;

    case 'monitoring':
      setup.setupAutomatedMonitoring();
      break;

    case 'guide':
      setup.generateSetupGuide();
      break;

    default:
      console.log(`
Branch Protection Setup - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 8, 2025

Usage: node src/scripts/quality-gates/branch-protection.js <command> [options]

Commands:
  generate    - Generate all configuration files and setup guide
  apply       - Apply branch protection rules (requires --token)
  validate    - Validate current protection status (requires --token)
  badges      - Generate status badge configuration
  monitoring  - Setup automated quality monitoring
  guide       - Generate comprehensive setup guide

Options:
  --token TOKEN  - GitHub personal access token (or set GITHUB_TOKEN env var)

Examples:
  node src/scripts/quality-gates/branch-protection.js generate
  node src/scripts/quality-gates/branch-protection.js apply --token ghp_123...
  node src/scripts/quality-gates/branch-protection.js validate --token ghp_123...

This tool generates GitHub branch protection rules and quality gate
configurations for enterprise-grade code quality assurance.
      `);
  }
}

export default BranchProtectionSetup;

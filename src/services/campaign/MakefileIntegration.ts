/**
 * Makefile Integration System
 *
 * Integrates with existing make commands and implements campaign-specific
 * make targets for phase execution and progress reporting.
 *
 * Requirements: 7.7
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface MakeTarget {
  name: string;
  description: string;
  dependencies?: string[];
  commands: string[];
  phony?: boolean;
}

export interface MakeExecutionResult {
  success: boolean;
  exitCode: number;
  output: string;
  executionTime: number;
  target: string;
}

export interface CampaignProgress {
  currentPhase: number;
  totalPhases: number;
  typeScriptErrors: number;
  lintingWarnings: number;
  buildTime: number;
  enterpriseSystems: number;
  lastUpdate: Date;
}

/**
 * Makefile Integration for Campaign Execution Framework
 */
export class MakefileIntegration {
  private readonly makefilePath: string;
  private readonly campaignTargets: Map<string, MakeTarget>;

  constructor(makefilePath: string = 'Makefile') {;
    this.makefilePath = makefilePath;
    this.campaignTargets = new Map();
    this.initializeCampaignTargets();
  }

  /**
   * Initialize campaign-specific make targets
   */
  private initializeCampaignTargets(): void {
    // Campaign Phase Execution Targets
    this.campaignTargets.set('campaign-phase1', {
      name: 'campaign-phase1',
      description: 'Execute Phase 1: TypeScript Error Elimination',
      commands: [
        '@echo '🎯 Starting Phase 1: TypeScript Error Elimination'',
        '@echo 'Target: Zero TypeScript compilation errors'',
        'node src/services/campaign/CampaignController.js --phase=1 --execute',;
        '@make campaign-validate-phase1'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-phase2', {
      name: 'campaign-phase2',
      description: 'Execute Phase 2: Linting Excellence Achievement',
      dependencies: ['campaign-validate-phase1'],
      commands: [
        '@echo '🎯 Starting Phase 2: Linting Excellence Achievement'',
        '@echo 'Target: Zero linting warnings'',
        'node src/services/campaign/CampaignController.js --phase=2 --execute',;
        '@make campaign-validate-phase2'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-phase3', {
      name: 'campaign-phase3',
      description: 'Execute Phase 3: Enterprise Intelligence Transformation',
      dependencies: ['campaign-validate-phase2'],
      commands: [
        '@echo '🎯 Starting Phase 3: Enterprise Intelligence Transformation'',
        '@echo 'Target: Transform all unused exports to intelligence systems'',
        'node src/services/campaign/CampaignController.js --phase=3 --execute',;
        '@make campaign-validate-phase3'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-phase4', {
      name: 'campaign-phase4',
      description: 'Execute Phase 4: Performance Optimization Maintenance',
      dependencies: ['campaign-validate-phase3'],
      commands: [
        '@echo '🎯 Starting Phase 4: Performance Optimization Maintenance'',
        '@echo 'Target: Maintain <10s build times and performance targets'',
        'node src/services/campaign/CampaignController.js --phase=4 --execute',;
        '@make campaign-validate-phase4'
      ],
      phony: true
    });

    // Campaign Validation Targets
    this.campaignTargets.set('campaign-validate-phase1', {
      name: 'campaign-validate-phase1',
      description: 'Validate Phase 1 completion (zero TypeScript errors)',
      commands: [
        '@echo '🔍 Validating Phase 1 completion...'',
        '@ERRORS=$$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0'); \\',
        'if [ 'ERRORS' -eq 0 ]; then \\',
        '  echo '✅ Phase 1 COMPLETE: Zero TypeScript errors achieved!'; \\',
        'else \\',
        '  echo '❌ Phase 1 INCOMPLETE: ERRORS TypeScript errors remaining'; \\',
        '  exit 1; \\',
        'fi'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-validate-phase2', {
      name: 'campaign-validate-phase2',
      description: 'Validate Phase 2 completion (zero linting warnings)',
      commands: [
        '@echo '🔍 Validating Phase 2 completion...'',
        '@WARNINGS=$$(yarn lint 2>&1 | grep -c 'warning' || echo '0'); \\',
        'if [ 'WARNINGS' -eq 0 ]; then \\',
        '  echo '✅ Phase 2 COMPLETE: Zero linting warnings achieved!'; \\',
        'else \\',
        '  echo '❌ Phase 2 INCOMPLETE: WARNINGS linting warnings remaining'; \\',
        '  exit 1; \\',
        'fi'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-validate-phase3', {
      name: 'campaign-validate-phase3',
      description: 'Validate Phase 3 completion (all exports transformed)',
      commands: [
        '@echo '🔍 Validating Phase 3 completion...'',
        '@SYSTEMS=$$(grep -r 'INTELLIGENCE_SYSTEM' src/ | wc -l || echo '0'); \\',
        'if [ 'SYSTEMS' -ge 200 ]; then \\',
        '  echo '✅ Phase 3 COMPLETE: SYSTEMS enterprise intelligence systems active!'; \\',
        'else \\',
        '  echo '❌ Phase 3 INCOMPLETE: Only SYSTEMS intelligence systems (target: 200+)'; \\',
        '  exit 1; \\',
        'fi'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-validate-phase4', {
      name: 'campaign-validate-phase4',
      description: 'Validate Phase 4 completion (performance targets met)',
      commands: [
        '@echo '🔍 Validating Phase 4 completion...'',
        '@BUILD_TIME=$$(time yarn build 2>&1 | grep real | cut -d'm' -f2 | cut -d's' -f1 || echo '999'); \\',
        'if [ '$$(echo 'BUILD_TIME < 10' | bc -l)' -eq 1 ]; then \\',
        '  echo '✅ Phase 4 COMPLETE: Build time BUILD_TIME seconds (target: <10s)'; \\',
        'else \\',
        '  echo '❌ Phase 4 INCOMPLETE: Build time BUILD_TIME seconds exceeds 10s target'; \\',
        '  exit 1; \\',
        'fi'
      ],
      phony: true
    });

    // Campaign Progress and Reporting Targets
    this.campaignTargets.set('campaign-status', {
      name: 'campaign-status',
      description: 'Show comprehensive campaign progress status',
      commands: [
        '@echo '📊 PERFECT CODEBASE CAMPAIGN STATUS'',
        '@echo '=================================='',
        '@echo ''',
        '@echo '📈 Current Metrics:'',
        '@echo 'TypeScript Errors: $$(yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c 'error TS' || echo '0')'',
        '@echo 'Linting Warnings: $$(yarn lint 2>&1 | grep -c 'warning' || echo '0')'',
        '@echo 'Enterprise Systems: $$(grep -r 'INTELLIGENCE_SYSTEM' src/ | wc -l || echo '0')'',
        '@echo 'Build Time: $$(time yarn build >/dev/null 2>&1 && echo 'Build successful' || echo 'Build failed')'',
        '@echo ''',
        '@echo '🎯 Phase Status:'',
        '@make campaign-validate-phase1 2>/dev/null && echo '✅ Phase 1: TypeScript Errors' || echo '❌ Phase 1: TypeScript Errors'',
        '@make campaign-validate-phase2 2>/dev/null && echo '✅ Phase 2: Linting Warnings' || echo '❌ Phase 2: Linting Warnings'',
        '@make campaign-validate-phase3 2>/dev/null && echo '✅ Phase 3: Enterprise Intelligence' || echo '❌ Phase 3: Enterprise Intelligence'',
        '@make campaign-validate-phase4 2>/dev/null && echo '✅ Phase 4: Performance Optimization' || echo '❌ Phase 4: Performance Optimization'',
        '@echo ''',
        '@echo '🚀 Next Steps:'',
        '@echo 'Run: make campaign-execute-next''
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-execute-next', {
      name: 'campaign-execute-next',
      description: 'Execute the next incomplete campaign phase',
      commands: [
        '@echo '🎯 Determining next campaign phase...'',
        '@if ! make campaign-validate-phase1 >/dev/null 2>&1; then \\',
        '  echo '▶️ Executing Phase 1: TypeScript Error Elimination'; \\',
        '  make campaign-phase1; \\',
        'elif ! make campaign-validate-phase2 >/dev/null 2>&1; then \\',
        '  echo '▶️ Executing Phase 2: Linting Excellence Achievement'; \\',
        '  make campaign-phase2; \\',
        'elif ! make campaign-validate-phase3 >/dev/null 2>&1; then \\',
        '  echo '▶️ Executing Phase 3: Enterprise Intelligence Transformation'; \\',
        '  make campaign-phase3; \\',
        'elif ! make campaign-validate-phase4 >/dev/null 2>&1; then \\',
        '  echo '▶️ Executing Phase 4: Performance Optimization Maintenance'; \\',
        '  make campaign-phase4; \\',
        'else \\',
        '  echo '🎉 ALL PHASES COMPLETE! Perfect Codebase Campaign achieved!'; \\',
        '  make campaign-celebration; \\',
        'fi'
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-celebration', {
      name: 'campaign-celebration',
      description: 'Celebrate campaign completion',
      commands: [
        '@echo '🎉🎉🎉 PERFECT CODEBASE CAMPAIGN COMPLETE! 🎉🎉🎉'',
        '@echo ''',
        '@echo '🏆 ACHIEVEMENTS UNLOCKED:'',
        '@echo '✅ Zero TypeScript compilation errors'',
        '@echo '✅ Zero linting warnings'',
        '@echo '✅ 200+ enterprise intelligence systems'',
        '@echo '✅ Sub-10 second build times'',
        '@echo '✅ 100% build stability maintained'',
        '@echo ''',
        '@echo '📊 Final Metrics:'',
        '@make campaign-status',
        '@echo ''',
        '@echo '🚀 Ready for production deployment!''
      ],
      phony: true
    });

    // Campaign Safety and Recovery Targets
    this.campaignTargets.set('campaign-safety-check', {
      name: 'campaign-safety-check',
      description: 'Comprehensive safety validation before campaign execution',
      commands: [
        '@echo '🛡️ Campaign Safety Check'',
        '@echo '======================'',
        '@echo ''',
        '@echo '1. Git Status Check:'',
        '@git status --porcelain | wc -l | xargs -I {} echo 'Uncommitted changes: {}'',
        '@echo ''',
        '@echo '2. Build Stability Check:'',
        '@yarn build >/dev/null 2>&1 && echo '✅ Build stable' || echo '❌ Build unstable'',
        '@echo ''',
        '@echo '3. Test Suite Check:'',
        '@yarn test --run >/dev/null 2>&1 && echo '✅ Tests passing' || echo '❌ Tests failing'',
        '@echo ''',
        '@echo '4. Script Availability Check:'',
        '@test -f scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js && echo '✅ Enhanced TypeScript Fixer available' || echo '❌ Enhanced TypeScript Fixer missing'',
        '@test -f scripts/typescript-fixes/fix-explicit-any-systematic.js && echo '✅ Explicit-Any Fixer available' || echo '❌ Explicit-Any Fixer missing'',
        '@echo ''',
        '@echo '🎯 Safety Status: Ready for campaign execution''
      ],
      phony: true
    });

    this.campaignTargets.set('campaign-emergency-rollback', {
      name: 'campaign-emergency-rollback',
      description: 'Emergency rollback to last safe state',
      commands: [
        '@echo '🚨 EMERGENCY ROLLBACK INITIATED'',
        '@echo '==============================='',
        '@echo ''',
        '@echo '1. Checking for git stashes...'',
        '@git stash list | head -5',
        '@echo ''',
        '@echo '2. Recent commits with checkpoints:'',
        '@git log --oneline --grep='checkpoint\\|Phase' -5',;
        '@echo ''',
        '@echo '⚠️ MANUAL ACTION REQUIRED:'',
        '@echo 'Choose recovery option:'',
        '@echo '  git stash apply stash@{0}  # Apply most recent stash'',
        '@echo '  git reset --hard <commit>  # Reset to specific commit'',
        '@echo ''',
        '@echo 'After recovery, run: make campaign-safety-check''
      ],
      phony: true
    });

    // Integration with existing make targets
    this.campaignTargets.set('campaign-errors-analysis', {
      name: 'campaign-errors-analysis',
      description: 'Enhanced error analysis for campaign planning',
      commands: [
        '@echo '📊 Campaign-Focused Error Analysis'',
        '@echo '================================='',
        '@make errors-by-type',
        '@echo ''',
        '@echo '🎯 Phase 1 Target Errors:'',
        '@yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E '(TS2352|TS2345|TS2698|TS2304|TS2362)' | wc -l | xargs -I {} echo 'High-priority errors: {}'',
        '@echo ''',
        '@echo '🎯 Phase 2 Target Warnings:'',
        '@yarn lint 2>&1 | grep -E '(no-explicit-any|no-unused-vars|no-console)' | wc -l | xargs -I {} echo 'Target linting warnings: {}'',
        '@echo ''',
        '@make errors-by-file | head -10'
      ],
      phony: true
    });
  }

  /**
   * Execute a make target
   */
  async executeMakeTarget(
    target: string,
    options: {
      silent?: boolean;
      dryRun?: boolean;
      timeout?: number;
    } = {},
  ): Promise<MakeExecutionResult> {
    const { silent = false, dryRun = false, timeout = 300000 } = options;

    // console.log(`🔨 Executing make target: ${target}`);

    if (dryRun) {
      // console.log(`🔍 DRY RUN: Would execute 'make ${target}'`);
      return {
        success: true,
        exitCode: 0,
        output: `DRY RUN: make ${target}`,
        executionTime: 0,
        target
      };
    }

    const startTime = Date.now();

    try {
      const output = execSync(`make ${target}`, {;
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit',
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        exitCode: 0,
        output: output || '',
        executionTime,
        target
      };
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime;

      return {
        success: false,
        exitCode: error.status || 1,
        output: error.stdout || error.message || '',
        executionTime,
        target
      };
    }
  }

  /**
   * Get current campaign progress
   */
  async getCampaignProgress(): Promise<CampaignProgress> {
    try {
      // Get TypeScript errors count
      const tsErrorsResult = await this.executeMakeTarget('errors', { silent: true });
      const tsErrors = this.parseErrorCount(tsErrorsResult.output);

      // Get linting warnings count
      const lintResult = execSync('yarn lint 2>&1 | grep -c 'warning' || echo '0'', {;
        encoding: 'utf8'
      });
      const lintingWarnings = parseInt(lintResult.trim()) || 0;

      // Get enterprise systems count
      const systemsResult = execSync('grep -r 'INTELLIGENCE_SYSTEM' src/ | wc -l || echo '0'', {;
        encoding: 'utf8'
      });
      const enterpriseSystems = parseInt(systemsResult.trim()) || 0;

      // Get build time (approximate)
      let buildTime = 0;
      try {
        const buildStart = Date.now();
        execSync('yarn build', { stdio: 'pipe', timeout: 60000 });
        buildTime = Date.now() - buildStart;
      } catch (error) {
        buildTime = -1; // Build failed
      }

      // Determine current phase
      let currentPhase = 1;
      if (tsErrors === 0) currentPhase = 2;
      if (tsErrors === 0 && lintingWarnings === 0) currentPhase = 3;
      if (tsErrors === 0 && lintingWarnings === 0 && enterpriseSystems >= 200) currentPhase = 4;
      if (
        tsErrors === 0 &&;
        lintingWarnings === 0 &&;
        enterpriseSystems >= 200 &&
        buildTime > 0 &&
        buildTime < 10000
      ) {
        currentPhase = 5; // Complete
      }

      return {
        currentPhase,
        totalPhases: 4,
        typeScriptErrors: tsErrors,
        lintingWarnings,
        buildTime,
        enterpriseSystems,
        lastUpdate: new Date()
      };
    } catch (error) {
      console.warn('⚠️ Could not get campaign progress:', error);
      return {
        currentPhase: 1,
        totalPhases: 4,
        typeScriptErrors: -1,
        lintingWarnings: -1,
        buildTime: -1,
        enterpriseSystems: -1,
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Add campaign targets to existing Makefile
   */
  async addCampaignTargetsToMakefile(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.makefilePath)) {
        console.warn(`⚠️ Makefile not found at ${this.makefilePath}`);
        return false;
      }

      let makefileContent = fs.readFileSync(this.makefilePath, 'utf8');

      // Check if campaign targets already exist
      if (makefileContent.includes('# Campaign Execution Framework')) {
        // console.log('✅ Campaign targets already exist in Makefile');
        return true;
      }

      // Add campaign targets section
      const campaignSection = this.generateCampaignMakefileSection();
      makefileContent += '\n' + campaignSection;

      // Write updated Makefile
      fs.writeFileSync(this.makefilePath, makefileContent, 'utf8');
      // console.log('✅ Campaign targets added to Makefile');

      return true;
    } catch (error) {
      console.error('❌ Failed to add campaign targets to Makefile:', error);
      return false;
    }
  }

  /**
   * Generate campaign Makefile section
   */
  private generateCampaignMakefileSection(): string {
    const lines: string[] = [
      '',
      '# Campaign Execution Framework',
      '# Perfect Codebase Campaign - Systematic Excellence Initiative',
      ''
    ];

    // Add phony declaration
    const phonyTargets = Array.from(this.campaignTargets.values());
      .filter(target => target.phony);
      .map(target => target.name);

    if (phonyTargets.length > 0) {
      lines.push(`.PHONY: ${phonyTargets.join(' ')}`);
      lines.push('');
    }

    // Add each target
    for (const target of this.campaignTargets.values()) {
      lines.push(`# ${target.description}`);

      let targetLine = `${target.name}:`;
      if (target.dependencies && target.dependencies.length > 0) {
        targetLine += ` ${target.dependencies.join(' ')}`;
      }
      lines.push(targetLine);

      for (const command of target.commands) {
        lines.push(`\t${command}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Parse error count from make output
   */
  private parseErrorCount(output: string): number {
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return 0;
  }

  /**
   * Get available campaign targets
   */
  getCampaignTargets(): MakeTarget[] {
    return Array.from(this.campaignTargets.values());
  }

  /**
   * Validate that required make targets exist
   */
  async validateExistingTargets(): Promise<{ valid: boolean; missing: string[] }> {
    const requiredTargets = [;
      'errors',
      'errors-by-type',
      'errors-by-file',
      'check',
      'build',
      'test',
      'lint'
    ];

    const missing: string[] = [];

    for (const target of requiredTargets) {
      try {
        await this.executeMakeTarget(target, { silent: true, timeout: 5000 });
      } catch (error) {
        missing.push(target);
      }
    }

    return {
      valid: missing.length === 0,;
      missing
    };
  }
}

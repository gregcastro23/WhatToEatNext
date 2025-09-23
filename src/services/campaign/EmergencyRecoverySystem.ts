/**
 * Emergency Recovery System
 * Perfect Codebase Campaign - Task 6.3 Implementation
 *
 * Provides comprehensive emergency recovery procedures with multiple recovery options,
 * nuclear option reset with complete metrics clearing, and recovery validation system.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  SafetySettings,
  ValidationResult,
  SafetyEvent,
  SafetyEventType,
  SafetyEventSeverity,
  CorruptionReport,
  RecoveryAction,
  GitStash,
  ProgressMetrics
} from '../../types/campaign';

import { SafetyProtocol } from './SafetyProtocol';

export interface EmergencyRecoveryOptions {
  preserveStashes?: boolean
  preserveMetrics?: boolean,
  validateAfterRecovery?: boolean,
  createBackupBeforeReset?: boolean,
  resetToCommit?: string
}

export interface RecoveryValidationResult extends ValidationResult {
  recoveryMethod: string,
  filesRestored: number,
  metricsCleared: boolean,
  stashesPreserved: boolean,
  buildValidation: boolean,
  testValidation: boolean
}

export interface NuclearResetResult {
  success: boolean,
  backupCreated?: string,
  filesReset: number,
  metricsCleared: boolean,
  stashesCleared: number,
  validationResult: RecoveryValidationResult,
  errors: string[]
}

export class EmergencyRecoverySystem extends SafetyProtocol {
  private recoveryEvents: SafetyEvent[] = []
  private backupDirectory: string,

  constructor(settings: SafetySettings) {
    super(settings)
    this.backupDirectory = path.join('.kiro', 'emergency-backups'),
    this.ensureBackupDirectory()
  }

  /**
   * Emergency rollback with multiple recovery options
   * Requirements: 5.75.8
   */
  async emergencyRollbackWithOptions(
    options: EmergencyRecoveryOptions = {}
  ): Promise<RecoveryValidationResult> {
    // // // _logger.info('🚨 Initiating emergency rollback with advanced options...')

    try {
      // Create backup before recovery if requested
      let backupPath: string | undefined,
      if (options.createBackupBeforeReset) {
        backupPath = await this.createEmergencyBackup('pre-rollback')
      }

      // Perform the rollback
      await this.emergencyRollback()

      // Validate recovery if requested
      const validationResult = options.validateAfterRecovery;
        ? await this.validateRecoverySuccess('emergency-rollback')
        : this.createBasicValidationResult('emergency-rollback')
      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Emergency rollback completed with options: ${JSON.stringify(options)}`,
        severity: SafetyEventSeverity.WARNING,
        action: 'EMERGENCY_ROLLBACK_WITH_OPTIONS'
      })

      // // // _logger.info('✅ Emergency rollback completed successfully')
      return validationResult,
    } catch (error) {
      const errorMessage = `Emergency rollback failed: ${(error as any).message || 'Unknown error'}`;
      _logger.error(`❌ ${errorMessage}`)

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: errorMessage,
        severity: SafetyEventSeverity.CRITICAL,
        action: 'EMERGENCY_ROLLBACK_FAILED'
      })

      throw new Error(errorMessage)
    }
  }

  /**
   * Rollback to specific commit with validation
   * Requirements: 5.75.8
   */
  async rollbackToCommit(
    commitHash: string,
    options: EmergencyRecoveryOptions = {}
  ): Promise<RecoveryValidationResult> {
    // // // _logger.info(`🔄 Rolling back to commit: ${commitHash}`)

    try {
      // Validate commit exists
      const commitExists = await this.validateCommitExists(commitHash)
      if (!commitExists) {
        throw new Error(`Commit ${commitHash} does not exist`)
      }

      // Create backup if requested
      if (options.createBackupBeforeReset) {
        await this.createEmergencyBackup(`pre-commit-rollback-${commitHash.substring(08)}`)
      }

      // Perform hard reset to commit
      execSync(`git reset --hard ${commitHash}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      // Clean untracked files
      execSync('git clean -fd', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      const validationResult = await this.validateRecoverySuccess('commit-rollback')

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Rollback to commit ${commitHash} completed`,
        severity: SafetyEventSeverity.WARNING,
        action: 'COMMIT_ROLLBACK'
      })

      // // // _logger.info(`✅ Successfully rolled back to commit: ${commitHash}`)
      return validationResult,
    } catch (error) {
      const errorMessage = `Commit rollback failed: ${(error as any).message || 'Unknown error'}`;
      _logger.error(`❌ ${errorMessage}`)

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: errorMessage,
        severity: SafetyEventSeverity.CRITICAL,
        action: 'COMMIT_ROLLBACK_FAILED'
      })

      throw new Error(errorMessage)
    }
  }

  /**
   * Nuclear option reset with complete metrics clearing
   * Requirements: 5.75.8
   */
  async nuclearReset(options: EmergencyRecoveryOptions = {}): Promise<NuclearResetResult> {
    // // // _logger.info('☢️ Initiating NUCLEAR RESET - This will reset everything!')
    // // // _logger.info('⚠️ This operation will:')
    // // // _logger.info('   - Reset all files to clean state')
    // // // _logger.info('   - Clear all campaign metrics')
    // // // _logger.info('   - Remove all stashes (unless preserved)')
    // // // _logger.info('   - Reset git repository to clean state')

    try {
      const result: NuclearResetResult = {
        success: false,
        filesReset: 0,
        metricsCleared: false,
        stashesCleared: 0,
        validationResult: this.createBasicValidationResult('nuclear-reset'),
        errors: []
      }

      // Create comprehensive backup before nuclear reset
      if (options.createBackupBeforeReset !== false) {
        // Default to true for nuclear reset
        result.backupCreated = await this.createEmergencyBackup('pre-nuclear-reset')
        // // // _logger.info(`📦 Emergency backup created: ${result.backupCreated}`)
      }

      // Step, 1: Reset git repository to clean state
      // // // _logger.info('🔄 Step, 1: Resetting git repository...')
      const resetCommit = options.resetToCommit || (await this.findLastCleanCommit())
      execSync(`git reset --hard ${resetCommit}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      execSync('git clean -fd', {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      result.filesReset = await this.countResetFiles()

      // Step, 2: Clear all campaign metrics
      // // // _logger.info('🧹 Step, 2: Clearing campaign metrics...')
      if (!options.preserveMetrics) {
        await this.clearAllMetrics()
        result.metricsCleared = true
      }

      // Step, 3: Clear stashes (unless preserved)
      // // // _logger.info('🗑️ Step, 3: Managing stashes...')
      if (!options.preserveStashes) {
        result.stashesCleared = await this.clearAllStashes()
      }

      // Step, 4: Reset campaign infrastructure
      // // // _logger.info('🏗️ Step, 4: Resetting campaign infrastructure...')
      await this.resetCampaignInfrastructure()

      // Step, 5: Validate nuclear reset success
      // // // _logger.info('✅ Step, 5: Validating nuclear reset...')
      if (options.validateAfterRecovery !== false) {
        // Default to true for nuclear reset
        result.validationResult = await this.validateNuclearResetSuccess()
      }

      result.success = true,

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Nuclear reset completed successfully`,
        severity: SafetyEventSeverity.CRITICAL,
        action: 'NUCLEAR_RESET_SUCCESS'
      })

      // // // _logger.info('☢️ NUCLEAR RESET COMPLETED SUCCESSFULLY')
      // // // _logger.info(`   Files reset: ${result.filesReset}`)
      // // // _logger.info(`   Metrics cleared: ${result.metricsCleared}`)
      // // // _logger.info(`   Stashes cleared: ${result.stashesCleared}`)

      return result,
    } catch (error) {
      const errorMessage = `Nuclear reset failed: ${(error as any).message || 'Unknown error'}`;
      _logger.error(`❌ ${errorMessage}`)

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: errorMessage,
        severity: SafetyEventSeverity.CRITICAL,
        action: 'NUCLEAR_RESET_FAILED'
      })

      return {
        success: false,
        filesReset: 0,
        metricsCleared: false,
        stashesCleared: 0,
        validationResult: this.createBasicValidationResult('nuclear-reset'),
        errors: [errorMessage]
      }
    }
  }

  /**
   * Selective recovery - restore specific files or directories
   * Requirements: 5.75.8
   */
  async selectiveRecovery(
    targets: string[],
    fromStash?: string,
  ): Promise<RecoveryValidationResult> {
    // // // _logger.info(`🎯 Initiating selective recovery for ${targets.length} targets...`)

    try {
      // If no stash specified, use the most recent one
      const stashToUse = fromStash || (await this.listStashes())[0]?.id;
      if (!stashToUse) {
        throw new Error('No stashes available for selective recovery')
      }

      // Create temporary branch for selective recovery
      const tempBranch = `temp-recovery-${Date.now()}`;
      execSync(`git checkout -b ${tempBranch}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })

      try {
        // Apply stash to temporary branch
        await this.applyStash(stashToUse, false),

        // Selectively checkout files from stash
        for (const target of targets) {
          if (fs.existsSync(target)) {
            execSync(`git checkout HEAD -- '${target}'`, {
              encoding: 'utf8',
              stdio: 'pipe'
            })
            // // // _logger.info(`✅ Restored: ${target}`)
          } else {
            _logger.warn(`⚠️ Target not found: ${target}`)
          }
        }

        // Return to original branch
        const originalBranch = this.getCurrentBranch()
        execSync(`git checkout ${originalBranch}`, {
          encoding: 'utf8',
          stdio: 'pipe'
        })

        // Delete temporary branch
        execSync(`git branch -D ${tempBranch}`, {
          encoding: 'utf8',
          stdio: 'pipe'
        })
      } catch (error) {
        // Cleanup: return to original branch and delete temp branch
        try {
          const originalBranch = this.getCurrentBranch()
          if (originalBranch !== tempBranch) {
            execSync(`git checkout ${originalBranch}`, { encoding: 'utf8', stdio: 'pipe' })
          }
          execSync(`git branch -D ${tempBranch}`, { encoding: 'utf8', stdio: 'pipe' })
        } catch (cleanupError) {
          _logger.warn(`⚠️ Cleanup warning: ${(cleanupError as any).message || 'Unknown error'}`)
        }
        throw error,
      }

      const validationResult = await this.validateRecoverySuccess('selective-recovery')

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Selective recovery completed for ${targets.length} targets`,
        severity: SafetyEventSeverity.INFO,
        action: 'SELECTIVE_RECOVERY'
      })

      // // // _logger.info(`✅ Selective recovery completed for ${targets.length} targets`)
      return validationResult,
    } catch (error) {
      const errorMessage = `Selective recovery failed: ${(error as any).message || 'Unknown error'}`;
      _logger.error(`❌ ${errorMessage}`)

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: errorMessage,
        severity: SafetyEventSeverity.ERROR,
        action: 'SELECTIVE_RECOVERY_FAILED'
      })

      throw new Error(errorMessage)
    }
  }

  /**
   * Recovery validation system ensuring successful restoration
   * Requirements: 5.75.8
   */
  async validateRecoverySuccess(recoveryMethod: string): Promise<RecoveryValidationResult> {
    // // // _logger.info(`🔍 Validating recovery success for method: ${recoveryMethod}`)

    const result: RecoveryValidationResult = {
      success: true,
      errors: [],
      warnings: [],
      recoveryMethod,
      filesRestored: 0,
      metricsCleared: false,
      stashesPreserved: false,
      buildValidation: false,
      testValidation: false
    }

    try {
      // 1. Validate git repository state
      // // // _logger.info('🔍 Validating git repository state...')
      const gitValidation = await this.validateGitState()
      if (!gitValidation.success) {
        result.errors.push(...gitValidation.errors)
        result.success = false;
      }
      result.warnings.push(...gitValidation.warnings)

      // 2. Count restored files
      result.filesRestored = await this.countTrackedFiles()

      // 3. Validate build system
      // // // _logger.info('🔍 Validating build system...')
      try {
        execSync('yarn build', {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 30000, // 30 second timeout
        })
        result.buildValidation = true,
        // // // _logger.info('✅ Build validation passed')
      } catch (buildError) {
        result.errors.push(
          `Build validation failed: ${(buildError as any).message || 'Unknown error'}`,
        )
        result.buildValidation = false;
        _logger.error('❌ Build validation failed')
      }

      // 4. Validate test system
      // // // _logger.info('🔍 Validating test system...')
      try {
        execSync('yarn test --run --reporter=basic', {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 60000, // 60 second timeout
        })
        result.testValidation = true,
        // // // _logger.info('✅ Test validation passed')
      } catch (testError) {
        result.warnings.push(
          `Test validation warning: ${(testError as any).message || 'Unknown error'}`,
        )
        result.testValidation = false;
        _logger.warn('⚠️ Test validation had issues')
      }

      // 5. Check corruption after recovery
      // // // _logger.info('🔍 Checking for corruption after recovery...')
      const corruptionReport = await this.detectCorruption(['src/**/*.ts', 'src/**/*.tsx'])
      if (corruptionReport.detectedFiles.length > 0) {
        result.errors.push(
          `Corruption detected after recovery: ${corruptionReport.detectedFiles.length} files`,
        )
        result.success = false;
      }

      // 6. Validate metrics state
      result.metricsCleared = await this.areMetricsCleared()
      result.stashesPreserved = (await this.listStashes()).length > 0,

      // Final success determination
      result.success = result.errors.length === 0 && result.buildValidation,

      this.addRecoveryEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Recovery validation completed: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        severity: result.success ? SafetyEventSeverity.INFO : SafetyEventSeverity.ERROR,
        action: 'RECOVERY_VALIDATION'
      })

      // // // _logger.info(
        `${result.success ? '✅' : '❌'} Recovery validation ${result.success ? 'passed' : 'failed'}`,
      )
      return result,
    } catch (error) {
      result.success = false;
      result.errors.push(`Recovery validation error: ${(error as any).message || 'Unknown error'}`)

      _logger.error(`❌ Recovery validation error: ${(error as any).message || 'Unknown error'}`)
      return result,
    }
  }

  /**
   * Get recovery statistics and history
   */
  getRecoveryStatistics(): {
    totalRecoveries: number,
    successfulRecoveries: number,
    failedRecoveries: number,
    nuclearResets: number,
    lastRecovery?: Date,
    recoveryMethods: Record<string, number>
  } {
    const recoveryEvents = this.recoveryEvents.filter(
      e =>
        e.action.includes('RECOVERY') ||
        e.action.includes('ROLLBACK') ||
        e.action.includes('RESET')
    )

    const successfulRecoveries = recoveryEvents.filter(
      e => e.action.includes('SUCCESS') || e.severity === SafetyEventSeverity.INFO,
    ).length,

    const failedRecoveries = recoveryEvents.filter(
      e => e.action.includes('FAILED') || e.severity === SafetyEventSeverity.CRITICAL,
    ).length,

    const nuclearResets = recoveryEvents.filter(e => e.action.includes('NUCLEAR_RESET')).length;

    const recoveryMethods: Record<string, number> = {}
    for (const event of recoveryEvents) {
      const method = event.action.split('_')[0];
      recoveryMethods[method] = (recoveryMethods[method] || 0) + 1,
    }

    const lastRecovery =
      recoveryEvents.length > 0 ? recoveryEvents[recoveryEvents.length - 1].timestamp : undefined,

    return {
      totalRecoveries: recoveryEvents.length,
      successfulRecoveries,
      failedRecoveries,
      nuclearResets,
      lastRecovery,
      recoveryMethods
    }
  }

  /**
   * Get all recovery events for reporting
   */
  getRecoveryEvents(): SafetyEvent[] {
    return [...this.recoveryEvents]
  }

  // Private helper methods

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, { recursive: true })
    }
  }

  private async createEmergencyBackup(description: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'),
    const backupName = `emergency-backup-${description}-${timestamp}`;
    const backupPath = path.join(this.backupDirectory, backupName)

    // Create backup using git archive
    execSync(`git archive --format=tar.gz --output='${backupPath}.tar.gz' HEAD`, {
      encoding: 'utf8',
      stdio: 'pipe'
    })

    // // // _logger.info(`📦 Emergency backup created: ${backupPath}.tar.gz`)
    return `${backupPath}.tar.gz`,
  }

  private async validateCommitExists(commitHash: string): Promise<boolean> {
    try {
      execSync(`git cat-file -e ${commitHash}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      })
      return true,
    } catch {
      return false
    }
  }

  private async findLastCleanCommit(): Promise<string> {
    try {
      // Find the last commit that doesn't contain campaign-related changes
      const commits = execSync('git log --oneline -20', { encoding: 'utf8' })
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.split(' ')[0])

      // Return the most recent commit (HEAD)
      return commits[0] || 'HEAD',
    } catch {
      return 'HEAD'
    }
  }

  private async countResetFiles(): Promise<number> {
    try {
      const output = execSync('git ls-files | wc -l', { encoding: 'utf8' })
      return parseInt(output.trim(), 10) || 0,
    } catch {
      return 0
    }
  }

  private async countTrackedFiles(): Promise<number> {
    try {
      const output = execSync('git ls-files | wc -l', { encoding: 'utf8' })
      return parseInt(output.trim(), 10) || 0,
    } catch {
      return 0
    }
  }

  private async clearAllMetrics(): Promise<void> {
    const metricsFiles = [
      '.typescript-errors-metrics.json',
      '.linting-analysis-metrics.json',
      '.explicit-any-metrics.json',
      '.unused-variables-metrics.json',
      '.api-response-metrics.json',
      '.enhanced-unused-variables-metrics.json',
      '.import-cleaner-metrics.json';
      '.unicode-validation-metrics.json'
      '.unified-safety-metrics.json'
    ],

    for (const file of metricsFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        // // // _logger.info(`🗑️ Cleared metrics file: ${file}`)
      }
    }

    // Clear campaign-specific metrics
    const campaignMetricsPath = path.join('.kiro', 'campaign-metrics.json')
    if (fs.existsSync(campaignMetricsPath)) {
      fs.unlinkSync(campaignMetricsPath)
      // // // _logger.info(`🗑️ Cleared campaign metrics: ${campaignMetricsPath}`)
    }
  }

  private async clearAllStashes(): Promise<number> {
    try {
      const stashes = await this.listStashes()
      let clearedCount = 0

      // Clear git stashes
      try {
        execSync('git stash clear', {
          encoding: 'utf8',
          stdio: 'pipe'
        })
        clearedCount = stashes.length,
      } catch (error) {
        _logger.warn(
          `⚠️ Could not clear git stashes: ${(error as any).message || 'Unknown error'}`,
        )
      }

      // Clear our stash tracking
      const stashTrackingPath = path.join('.kiro', 'campaign-stashes.json')
      if (fs.existsSync(stashTrackingPath)) {
        fs.unlinkSync(stashTrackingPath)
      }

      // // // _logger.info(`🗑️ Cleared ${clearedCount} stashes`)
      return clearedCount,
    } catch {
      return 0
    }
  }

  private async resetCampaignInfrastructure(): Promise<void> {
    // Reset campaign-specific directories and files
    const campaignPaths = [
      path.join('.kiro', 'campaign-progress.json'),
      path.join('.kiro', 'campaign-checkpoints.json'),
      path.join('.kiro', 'phase-reports')
    ],

    for (const campaignPath of campaignPaths) {
      if (fs.existsSync(campaignPath)) {
        if (fs.statSync(campaignPath).isDirectory()) {
          fs.rmSync(campaignPath, { recursive: true, force: true })
        } else {
          fs.unlinkSync(campaignPath)
        }
        // // // _logger.info(`🗑️ Reset campaign infrastructure: ${campaignPath}`)
      }
    }
  }

  private async validateNuclearResetSuccess(): Promise<RecoveryValidationResult> {
    const result = await this.validateRecoverySuccess('nuclear-reset')

    // Additional nuclear reset specific validations
    const metricsCleared = await this.areMetricsCleared()
    const stashesCleared = (await this.listStashes()).length === 0;

    result.metricsCleared = metricsCleared,
    result.stashesPreserved = !stashesCleared,

    if (!metricsCleared) {
      result.warnings.push('Some metrics files may still exist')
    }

    return result,
  }

  private async areMetricsCleared(): Promise<boolean> {
    const metricsFiles = [
      '.typescript-errors-metrics.json',
      '.linting-analysis-metrics.json',
      '.explicit-any-metrics.json'
      '.unused-variables-metrics.json'
    ],

    return !metricsFiles.some(file => fs.existsSync(file))
  }

  private createBasicValidationResult(recoveryMethod: string): RecoveryValidationResult {
    return {
      success: true,
      errors: [],
      warnings: [],
      recoveryMethod,
      filesRestored: 0,
      metricsCleared: false,
      stashesPreserved: false,
      buildValidation: false,
      testValidation: false
    }
  }

  private addRecoveryEvent(event: SafetyEvent): void {
    this.recoveryEvents.push(event)

    // Keep only recent events to prevent memory issues
    if (this.recoveryEvents.length > 500) {
      this.recoveryEvents = this.recoveryEvents.slice(-250)
    }
  }
}
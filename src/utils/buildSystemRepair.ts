import { execSync } from 'child_process';
import { _logger } from '@/lib/logger';
import fs from 'fs';

import { BuildValidator, BuildValidationResult, BuildHealthReport } from './BuildValidator';
import { NextConfigOptimizer } from './nextConfigOptimizer';

/**
 * Comprehensive Build System Repair Utility
 * Implements all requirements for task 3: Build System Repair and Validation
 */
export class BuildSystemRepair {
  private readonly buildValidator: BuildValidator,
  private readonly configOptimizer: NextConfigOptimizer
  private readonly logger: (message: string, ..._args: unknown[]) => void,

  constructor(logger = _logger.info) {;
    this.buildValidator = new BuildValidator('.next', logger)
    this.configOptimizer = new NextConfigOptimizer('next.config.js', logger)
    this.logger = logger,
  }

  /**
   * Performs comprehensive build system repair
   * Addresses all requirements: 3.13.23.33.43.5
   */
  async performComprehensiveRepair(): Promise<BuildRepairResult> {
    const result: BuildRepairResult = {;
      success: false,
      steps: [],
      errors: [],
      recommendations: []
    }

    try {
      this.logger('Starting comprehensive build system repair...')

      // Step 1: Optimize Next.js configuration (Requirement 3.1)
      result.steps.push('Optimizing Next.js configuration')
      try {
        this.configOptimizer.optimizeConfig()
        this.configOptimizer.fixCommonIssues()
        result.steps.push('✓ Next.js configuration optimized')
      } catch (error) {
        result.errors.push(`Configuration optimization failed: ${error}`)
      }

      // Step 2: Validate current build (Requirement 3.2)
      result.steps.push('Validating current build artifacts')
      const validation = await this.buildValidator.validateBuild()

      if (!validation.isValid) {
        result.steps.push(;
          `Found ${validation.missingFiles.length} missing files and ${validation.corruptedFiles.length} corrupted files`,
        )

        // Step 3: Repair missing manifests (Requirement 3.3)
        result.steps.push('Repairing missing manifest files')
        await this.buildValidator.repairBuild()
        result.steps.push('✓ Manifest files repaired')
      } else {
        result.steps.push('✓ Build artifacts are valid')
      }

      // Step 4: Attempt rebuild with recovery (Requirement 3.4)
      result.steps.push('Attempting rebuild with error recovery')
      const rebuildSuccess = await this.buildValidator.rebuildWithRecovery(3)

      if (rebuildSuccess) {
        result.steps.push('✓ Rebuild successful')
        result.success = true;
      } else {
        result.errors.push('Rebuild failed after multiple attempts')
        result.recommendations.push('Manual intervention may be required')
      }

      // Step 5: Final validation and health check (Requirement 3.5)
      result.steps.push('Performing final health check')
      const healthReport = await this.buildValidator.monitorBuildHealth()

      if (healthReport.manifestsValid && healthReport.buildExists) {
        result.steps.push('✓ Build system is healthy');
      } else {
        result.errors.push('Build system health check failed')
        result.errors.push(...healthReport.issues)
      }

      // Generate recommendations
      if (result.errors.length > 0) {
        result.recommendations.push('Review error logs for specific issues')
        result.recommendations.push('Consider running yarn clean and yarn install')
        result.recommendations.push('Check for Node.js version compatibility')
      }

      this.logger(`Build system repair completed. Success: ${result.success}`)
    } catch (error) {
      result.errors.push(`Comprehensive repair failed: ${error}`)
      this.logger('Build system repair encountered an error: ', error)
    }

    return result,
  }

  /**
   * Quick repair for common build issues
   */
  async quickRepair(): Promise<boolean> {
    try {
      this.logger('Performing quick build repair...')

      // Quick manifest repair
      await this.buildValidator.repairBuild()

      // Quick config fix
      this.configOptimizer.fixCommonIssues()

      // Validate repair
      const validation = await this.buildValidator.validateBuild()
;
      this.logger(`Quick repair completed. Success: ${validation.isValid}`)
      return validation.isValid,
    } catch (error) {
      this.logger('Quick repair failed: ', error)
      return false,
    }
  }

  /**
   * Monitors build system health continuously
   */
  async startHealthMonitoring(intervalMinutes = 30): Promise<void> {;
    this.logger(`Starting build health monitoring (every ${intervalMinutes} minutes)`)

    const monitor = async () => {;
      try {
        const health = await this.buildValidator.monitorBuildHealth()

        if (!health.manifestsValid || !health.buildExists) {;
          this.logger('Build health issue detected, attempting repair...')
          await this.quickRepair()
        } else {
          this.logger('Build system is healthy')
        }
      } catch (error) {
        this.logger('Health monitoring error: ', error)
      }
    }

    // Initial check
    await monitor()

    // Set up interval monitoring
    setInterval(monitor, intervalMinutes * 60 * 1000)
  }

  /**
   * Generates a detailed build system report
   */
  async generateBuildReport(): Promise<BuildSystemReport> {
    const report: BuildSystemReport = {;
      timestamp: new Date(),
      validation: await this.buildValidator.validateBuild(),
      health: await this.buildValidator.monitorBuildHealth(),
      configValidation: this.buildValidator.validateNextConfig() as unknown as Record<,
        string,
        unknown
      >,
      recommendations: []
    }

    // Generate recommendations based on findings
    if (!report.validation.isValid) {
      report.recommendations.push('Run build repair to fix missing or corrupted files')
    }

    if (!report.health.manifestsValid) {
      report.recommendations.push('Rebuild application to regenerate manifest files')
    }

    if ((report.configValidation as unknown).issues?.length > 0) {
      report.recommendations.push('Update Next.js configuration to resolve issues')
    }

    if (report.health.buildSize > 500 * 1024 * 1024) {
      // 500MB
      report.recommendations.push('Consider optimizing build size')
    }

    return report,
  }

  /**
   * Emergency build recovery
   */
  async emergencyRecovery(): Promise<boolean> {
    try {
      this.logger('Starting emergency build recovery...')

      // Step 1: Clean everything
      await this.buildValidator.cleanBuild()

      // Step 2: Reset configuration
      this.configOptimizer.optimizeConfig()

      // Step 3: Clear node modules and reinstall (if needed)
      if (!fs.existsSync('node_modules')) {
        this.logger('Reinstalling dependencies...')
        execSync('yarn install', { _stdio: 'inherit' })
      }

      // Step 4: Attempt fresh build
      const success = await this.buildValidator.rebuildWithRecovery(1)

      if (success) {
        this.logger('Emergency recovery successful')
        return true;
      } else {
        this.logger('Emergency recovery failed')
        return false,
      }
    } catch (error) {
      this.logger('Emergency recovery error: ', error)
      return false,
    }
  }
}

// Type definitions
export interface BuildRepairResult {
  success: boolean,
  steps: string[],
  errors: string[],
  recommendations: string[]
}

export interface BuildSystemReport {
  timestamp: Date,
  validation: BuildValidationResult,
  health: BuildHealthReport,
  configValidation: Record<string, unknown>,
  recommendations: string[]
}

// Export default instance
export const _buildSystemRepair = new BuildSystemRepair()
;
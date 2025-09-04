/**
 * Safety Protocol System
 * Perfect Codebase Campaign - Comprehensive Safety Implementation
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  CorruptionPattern,
  CorruptionReport,
  CorruptionSeverity,
  GitStash,
  RecoveryAction,
  SafetyEvent,
  SafetyEventSeverity,
  SafetyEventType,
  SafetySettings,
  ValidationResult,
} from '../../types/campaign';

export class SafetyProtocol {
  private settings: SafetySettings;
  private stashes: Map<string, GitStash> = new Map();
  private safetyEvents: SafetyEvent[] = [];
  private stashCounter: number = 0;

  constructor(settings: SafetySettings) {
    this.settings = settings;
    this.initializeStashTracking();
  }

  /**
   * Create a git stash with descriptive naming conventions
   */
  async createStash(description: string, phase?: string): Promise<string> {
    try {
      this.stashCounter++;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const phasePrefix = phase ? `${phase}-` : '';
      const stashName = `campaign-${phasePrefix}${this.stashCounter}-${timestamp}`;
      const fullDescription = `${stashName}: ${description}`;

      // Validate git state before creating stash
      const gitValidation = await this.validateGitState();
      if (!gitValidation.success) {
        throw new Error(`Git validation failed: ${gitValidation.errors.join(', ')}`);
      }

      // Create the git stash with all files including untracked
      execSync(`git stash push -u -m "${fullDescription}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Get the actual stash reference
      const stashList = execSync('git stash list --oneline', { encoding: 'utf8' });
      const stashRef = stashList.split('\n')[0]?.split(':')[0] || 'stash@{0}';

      // Store stash information
      const stash: GitStash = {
        id: stashName,
        description: fullDescription,
        timestamp: new Date(),
        branch: this.getCurrentBranch(),
        ref: stashRef,
      };

      this.stashes.set(stashName, stash);
      this.saveStashTracking();

      this.addSafetyEvent({
        type: SafetyEventType.CHECKPOINT_CREATED,
        timestamp: new Date(),
        description: `Git stash created: ${stashName} (${stashRef})`,
        severity: SafetyEventSeverity.INFO,
        action: 'STASH_CREATE',
      });

      console.log(`📦 Created git stash: ${stashName}`);
      console.log(`   Reference: ${stashRef}`);
      console.log(`   Rollback with: git stash apply ${stashRef}`);

      return stashName;
    } catch (error) {
      this.addSafetyEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Failed to create git stash: ${(error as any).message || 'Unknown error'}`,
        severity: SafetyEventSeverity.ERROR,
        action: 'STASH_FAILED',
      });

      throw new Error(`Failed to create git stash: ${(error as any).message || 'Unknown error'}`);
    }
  }

  /**
   * Create a named checkpoint stash for specific operations
   */
  async createCheckpointStash(operation: string, phase: string): Promise<string> {
    const description = `Checkpoint before ${operation} in ${phase}`;
    return this.createStash(description, phase);
  }

  /**
   * Apply a specific git stash with automatic rollback scenarios
   */
  async applyStash(stashId: string, validateAfter: boolean = true): Promise<void> {
    try {
      const stash = this.stashes.get(stashId);
      if (!stash) {
        throw new Error(`Stash not found: ${stashId}`);
      }

      // Use the stored reference if available, otherwise try to find by message
      let stashRef = stash.ref;
      if (!stashRef) {
        stashRef = await this.findStashByMessage(stash.description);
      }

      // Apply the stash
      execSync(`git stash apply ${stashRef}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Validate after application if requested
      if (validateAfter) {
        const validation = await this.validateGitState();
        if (!validation.success) {
          console.warn(
            `⚠️ Git state validation warnings after stash apply: ${validation.warnings.join(', ')}`,
          );
        }
      }

      this.addSafetyEvent({
        type: SafetyEventType.ROLLBACK_TRIGGERED,
        timestamp: new Date(),
        description: `Git stash applied: ${stashId} (${stashRef})`,
        severity: SafetyEventSeverity.WARNING,
        action: 'STASH_APPLY',
      });

      console.log(`🔄 Applied git stash: ${stashId}`);
      console.log(`   Reference: ${stashRef}`);
    } catch (error) {
      this.addSafetyEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Failed to apply git stash ${stashId}: ${(error as any).message || 'Unknown error'}`,
        severity: SafetyEventSeverity.ERROR,
        action: 'STASH_APPLY_FAILED',
      });

      throw new Error(
        `Failed to apply git stash ${stashId}: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Automatically apply the most recent stash for rollback scenarios
   */
  async autoApplyLatestStash(): Promise<string> {
    const stashes = Array.from(this.stashes.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    if (stashes.length === 0) {
      throw new Error('No stashes available for automatic rollback');
    }

    const latestStash = stashes[0];
    await this.applyStash(latestStash.id);
    return latestStash.id;
  }

  /**
   * Apply stash by phase for targeted rollbacks
   */
  async applyStashByPhase(phase: string): Promise<string> {
    const phaseStashes = Array.from(this.stashes.values())
      .filter(stash => stash.id.includes(`-${phase}-`))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (phaseStashes.length === 0) {
      throw new Error(`No stashes found for phase: ${phase}`);
    }

    const latestPhaseStash = phaseStashes[0];
    await this.applyStash(latestPhaseStash.id);
    return latestPhaseStash.id;
  }

  /**
   * List all campaign stashes
   */
  async listStashes(): Promise<GitStash[]> {
    return Array.from(this.stashes.values());
  }

  /**
   * Detect file corruption using comprehensive syntax validation patterns
   */
  async detectCorruption(files: string[]): Promise<CorruptionReport> {
    const detectedFiles: string[] = [];
    const corruptionPatterns: CorruptionPattern[] = [];
    let maxSeverity = CorruptionSeverity.LOW;

    console.log(`🔍 Analyzing ${files.length} files for corruption patterns...`);

    for (const filePath of files) {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileCorruption = this.analyzeFileCorruption(filePath, content);

        if (fileCorruption.patterns.length > 0) {
          detectedFiles.push(filePath);
          corruptionPatterns.push(...fileCorruption.patterns);

          console.log(
            `🚨 Corruption detected in ${filePath}: ${fileCorruption.patterns.length} patterns`,
          );

          // Update max severity
          if (fileCorruption.severity === CorruptionSeverity.CRITICAL) {
            maxSeverity = CorruptionSeverity.CRITICAL;
          } else if (
            fileCorruption.severity === CorruptionSeverity.HIGH &&
            maxSeverity !== CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = CorruptionSeverity.HIGH;
          } else if (
            fileCorruption.severity === CorruptionSeverity.MEDIUM &&
            maxSeverity === CorruptionSeverity.LOW
          ) {
            maxSeverity = CorruptionSeverity.MEDIUM;
          }
        }
      } catch (error) {
        // File read error might indicate corruption
        detectedFiles.push(filePath);
        corruptionPatterns.push({
          pattern: 'FILE_READ_ERROR',
          description: `Cannot read file: ${(error as any).message || 'Unknown error'}`,
          files: [filePath],
        });
        maxSeverity = CorruptionSeverity.HIGH;
        console.error(
          `❌ File read error in ${filePath}: ${(error as any).message || 'Unknown error'}`,
        );
      }
    }

    const recommendedAction = this.determineRecoveryAction(maxSeverity, detectedFiles.length);

    const report: CorruptionReport = {
      detectedFiles,
      corruptionPatterns,
      severity: maxSeverity,
      recommendedAction,
    };

    if (detectedFiles.length > 0) {
      this.addSafetyEvent({
        type: SafetyEventType.CORRUPTION_DETECTED,
        timestamp: new Date(),
        description: `Corruption detected in ${detectedFiles.length} files (${maxSeverity} severity)`,
        severity: this.mapCorruptionToEventSeverity(maxSeverity),
        action: 'CORRUPTION_DETECTED',
      });

      console.log(
        `📊 Corruption analysis complete: ${detectedFiles.length} files affected, severity: ${maxSeverity}`,
      );
    } else {
      console.log(`✅ No corruption detected in ${files.length} files`);
    }

    return report;
  }

  /**
   * Detect import/export corruption based on existing script knowledge
   */
  async detectImportExportCorruption(files: string[]): Promise<CorruptionReport> {
    const detectedFiles: string[] = [];
    const corruptionPatterns: CorruptionPattern[] = [];
    let maxSeverity = CorruptionSeverity.LOW;

    console.log(`🔍 Analyzing import/export corruption in ${files.length} files...`);

    for (const filePath of files) {
      if (!fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const importExportCorruption = this.analyzeImportExportCorruption(filePath, content);

        if (importExportCorruption.patterns.length > 0) {
          detectedFiles.push(filePath);
          corruptionPatterns.push(...importExportCorruption.patterns);

          if (importExportCorruption.severity === CorruptionSeverity.CRITICAL) {
            maxSeverity = CorruptionSeverity.CRITICAL;
          } else if (
            importExportCorruption.severity === CorruptionSeverity.HIGH &&
            maxSeverity !== CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = CorruptionSeverity.HIGH;
          } else if (
            importExportCorruption.severity === CorruptionSeverity.MEDIUM &&
            maxSeverity === CorruptionSeverity.LOW
          ) {
            maxSeverity = CorruptionSeverity.MEDIUM;
          }
        }
      } catch (error) {
        console.error(
          `❌ Error analyzing import/export corruption in ${filePath}: ${(error as any).message || 'Unknown error'}`,
        );
      }
    }

    const recommendedAction = this.determineRecoveryAction(maxSeverity, detectedFiles.length);

    return {
      detectedFiles,
      corruptionPatterns,
      severity: maxSeverity,
      recommendedAction,
    };
  }

  /**
   * Real-time monitoring during script execution
   */
  async startRealTimeMonitoring(files: string[], intervalMs: number = 5000): Promise<void> {
    console.log(`🔄 Starting real-time corruption monitoring for ${files.length} files...`);

    const monitoringInterval = setInterval(() => {
      void (async () => {
        try {
          const report = await this.detectCorruption(files);

          if (report.detectedFiles.length > 0) {
            console.warn(
              `⚠️ Real-time monitoring detected corruption in ${report.detectedFiles.length} files`,
            );

            this.addSafetyEvent({
              type: SafetyEventType.CORRUPTION_DETECTED,
              timestamp: new Date(),
              description: `Real-time monitoring detected corruption: ${report.severity}`,
              severity: this.mapCorruptionToEventSeverity(report.severity),
              action: 'REALTIME_CORRUPTION_DETECTED',
            });

            // If critical corruption is detected, trigger emergency rollback
            if (
              report.severity === CorruptionSeverity.CRITICAL &&
              this.settings.automaticRollbackEnabled
            ) {
              console.error(`🚨 Critical corruption detected! Triggering emergency rollback...`);
              clearInterval(monitoringInterval);
              await this.emergencyRollback();
              return;
            }
          }
        } catch (error) {
          console.error(
            `❌ Error during real-time monitoring: ${(error as any).message || 'Unknown error'}`,
          );
        }
      })();
    }, intervalMs);

    // Store the interval ID for cleanup
    (this as unknown).monitoringInterval = monitoringInterval;
  }

  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring(): void {
    if ((this as unknown).monitoringInterval) {
      clearInterval((this as unknown).monitoringInterval);
      (this as unknown).monitoringInterval = null;
      console.log(`⏹️ Real-time corruption monitoring stopped`);
    }
  }

  /**
   * Validate syntax using TypeScript compiler
   */
  async validateSyntaxWithTypeScript(files: string[]): Promise<CorruptionReport> {
    const detectedFiles: string[] = [];
    const corruptionPatterns: CorruptionPattern[] = [];
    let maxSeverity = CorruptionSeverity.LOW;

    console.log(`🔍 Validating syntax with TypeScript compiler for ${files.length} files...`);

    try {
      // Run TypeScript compiler to check for syntax errors
      const tsFiles = files.filter(f => f.match(/\.(ts|tsx)$/));
      if (tsFiles.length === 0) {
        return {
          detectedFiles,
          corruptionPatterns,
          severity: maxSeverity,
          recommendedAction: RecoveryAction.CONTINUE,
        };
      }

      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Parse TypeScript compiler output for syntax errors
      const lines = tscOutput.split('\n');
      for (const line of lines) {
        if (
          line.includes('error TS') &&
          (line.includes('Unexpected token') || line.includes('Expression expected'))
        ) {
          const fileMatch = line.match(/^([^(]+)\(/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            if (files.includes(filePath) && !detectedFiles.includes(filePath)) {
              detectedFiles.push(filePath);
              corruptionPatterns.push({
                pattern: 'TYPESCRIPT_SYNTAX_ERROR',
                description: line.trim(),
                files: [filePath],
              });
              maxSeverity = CorruptionSeverity.HIGH;
            }
          }
        }
      }
    } catch (error) {
      // TypeScript compiler errors might indicate syntax corruption
      const errorOutput = (error as unknown).stdout || (error as unknown).message;
      if (errorOutput.includes('Unexpected token') || errorOutput.includes('Expression expected')) {
        maxSeverity = CorruptionSeverity.HIGH;
        corruptionPatterns.push({
          pattern: 'TYPESCRIPT_COMPILATION_ERROR',
          description: `TypeScript compilation failed: ${errorOutput}`,
          files: files.filter(f => f.match(/\.(ts|tsx)$/)),
        });
      }
    }

    const recommendedAction = this.determineRecoveryAction(maxSeverity, detectedFiles.length);

    return {
      detectedFiles,
      corruptionPatterns,
      severity: maxSeverity,
      recommendedAction,
    };
  }

  /**
   * Emergency rollback to clean state
   */
  async emergencyRollback(): Promise<void> {
    try {
      // Get the most recent stash
      const stashes = Array.from(this.stashes.values()).sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );

      if (stashes.length === 0) {
        throw new Error('No stashes available for emergency rollback');
      }

      const latestStash = stashes[0];
      await this.applyStash(latestStash.id);

      this.addSafetyEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Emergency rollback completed using stash: ${latestStash.id}`,
        severity: SafetyEventSeverity.WARNING,
        action: 'EMERGENCY_ROLLBACK',
      });

      console.log(`🚨 Emergency rollback completed using stash: ${latestStash.id}`);
    } catch (error) {
      this.addSafetyEvent({
        type: SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Emergency rollback failed: ${(error as any).message || 'Unknown error'}`,
        severity: SafetyEventSeverity.CRITICAL,
        action: 'EMERGENCY_ROLLBACK_FAILED',
      });

      throw new Error(`Emergency rollback failed: ${(error as any).message || 'Unknown error'}`);
    }
  }

  /**
   * Validate git repository state
   */
  async validateGitState(): Promise<ValidationResult> {
    try {
      // Check if git repo exists
      if (!fs.existsSync('.git')) {
        return {
          success: false,
          errors: ['Not a git repository'],
          warnings: [],
        };
      }

      // Check for uncommitted changes
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const hasUncommittedChanges = status.trim().length > 0;

      const warnings: string[] = [];
      if (hasUncommittedChanges && !this.settings.automaticRollbackEnabled) {
        warnings.push('Uncommitted changes detected - consider creating a stash');
      }

      return {
        success: true,
        errors: [],
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Git validation failed: ${(error as any).message || 'Unknown error'}`],
        warnings: [],
      };
    }
  }

  /**
   * Clean up old stashes based on configurable retention policy
   */
  async cleanupOldStashes(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.stashRetentionDays);

    const stashesToRemove: string[] = [];
    let cleanedCount = 0;

    for (const [stashId, stash] of this.stashes.entries()) {
      if (stash.timestamp < cutoffDate) {
        stashesToRemove.push(stashId);
      }
    }

    for (const stashId of stashesToRemove) {
      try {
        const stash = this.stashes.get(stashId);
        if (stash?.ref) {
          // Try to drop the actual git stash if we have the reference
          try {
            execSync(`git stash drop ${stash.ref}`, {
              encoding: 'utf8',
              stdio: 'pipe',
            });
          } catch (gitError) {
            // Stash might already be gone, just log warning
            console.warn(
              `⚠️ Could not drop git stash ${stash.ref}: ${(gitError as any).message || 'Unknown error'}`,
            );
          }
        }

        // Remove from our tracking
        this.stashes.delete(stashId);
        cleanedCount++;

        console.log(`🧹 Cleaned up old stash: ${stashId}`);
      } catch (error) {
        console.warn(
          `⚠️ Failed to cleanup stash ${stashId}: ${(error as any).message || 'Unknown error'}`,
        );
      }
    }

    if (cleanedCount > 0) {
      this.saveStashTracking();
      this.addSafetyEvent({
        type: SafetyEventType.CHECKPOINT_CREATED,
        timestamp: new Date(),
        description: `Cleaned up ${cleanedCount} old stashes`,
        severity: SafetyEventSeverity.INFO,
        action: 'STASH_CLEANUP',
      });
    }
  }

  /**
   * Get stashes by phase for targeted operations
   */
  async getStashesByPhase(phase: string): Promise<GitStash[]> {
    return Array.from(this.stashes.values())
      .filter(stash => stash.id.includes(`-${phase}-`))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get stash statistics for reporting
   */
  getStashStatistics(): {
    total: number;
    byPhase: Record<string, number>;
    oldestStash?: Date;
    newestStash?: Date;
  } {
    const stashes = Array.from(this.stashes.values());
    const byPhase: Record<string, number> = {};

    // Count stashes by phase
    for (const stash of stashes) {
      const phaseMatch = stash.id.match(/campaign-([^-]+)-/);
      if (phaseMatch) {
        const phase = phaseMatch[1];
        byPhase[phase] = (byPhase[phase] || 0) + 1;
      }
    }

    const timestamps = stashes.map(s => s.timestamp);
    const oldestStash =
      timestamps.length > 0 ? new Date(Math.min(...timestamps.map(t => t.getTime()))) : undefined;
    const newestStash =
      timestamps.length > 0 ? new Date(Math.max(...timestamps.map(t => t.getTime()))) : undefined;

    return {
      total: stashes.length,
      byPhase,
      oldestStash,
      newestStash,
    };
  }

  /**
   * Get safety events for reporting
   */
  getSafetyEvents(): SafetyEvent[] {
    return [...this.safetyEvents];
  }

  // Private helper methods

  private analyzeFileCorruption(
    filePath: string,
    content: string,
  ): {
    patterns: CorruptionPattern[];
    severity: CorruptionSeverity;
  } {
    const patterns: CorruptionPattern[] = [];
    let severity = CorruptionSeverity.LOW;

    // Check for import corruption patterns (based on existing scripts)
    const importCorruptionPatterns = [
      {
        regex: /import @\/types\s+from '[^']*'\s*;/g,
        description: 'Corrupted type import statement',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import @\/services\s+from '[^']*'\s*;/g,
        description: 'Corrupted service import statement',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /<<<<<<|>>>>>>|======/g,
        description: 'Git merge conflict markers',
        severity: CorruptionSeverity.CRITICAL,
      },
      {
        regex: /\bposit:\s*anyi:\s*anyo:\s*anyn:\s*anys:/g,
        description: 'Corrupted parameter names',
        severity: CorruptionSeverity.MEDIUM,
      },
      {
        regex: /\bcate:\s*anyg:\s*anyo:\s*anyr:\s*anyy:/g,
        description: 'Corrupted parameter names',
        severity: CorruptionSeverity.MEDIUM,
      },
    ];

    for (const corruptionPattern of importCorruptionPatterns) {
      const matches = content.match(corruptionPattern.regex);
      if (matches) {
        patterns.push({
          pattern: corruptionPattern.regex.source,
          description: corruptionPattern.description,
          files: [filePath],
        });

        // Update severity to the highest found
        if (corruptionPattern.severity === CorruptionSeverity.CRITICAL) {
          severity = CorruptionSeverity.CRITICAL;
        } else if (
          corruptionPattern.severity === CorruptionSeverity.HIGH &&
          severity !== CorruptionSeverity.CRITICAL
        ) {
          severity = CorruptionSeverity.HIGH;
        } else if (
          corruptionPattern.severity === CorruptionSeverity.MEDIUM &&
          severity === CorruptionSeverity.LOW
        ) {
          severity = CorruptionSeverity.MEDIUM;
        }
      }
    }

    // Check for syntax corruption
    if (this.hasSyntaxCorruption(content)) {
      patterns.push({
        pattern: 'SYNTAX_CORRUPTION',
        description: 'Syntax corruption detected',
        files: [filePath],
      });
      severity = CorruptionSeverity.HIGH;
    }

    return { patterns, severity };
  }

  private hasSyntaxCorruption(content: string): boolean {
    // Check for unbalanced brackets (more lenient threshold)
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;

    if (Math.abs(openBrackets - closeBrackets) > 1 || Math.abs(openParens - closeParens) > 1) {
      return true;
    }

    // Check for incomplete statements
    const incompletePatterns = [
      /export\s*$/m,
      /import\s*$/m,
      /function\s*$/m,
      /const\s*$/m,
      /let\s*$/m,
      /var\s*$/m,
    ];

    return incompletePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Analyze import/export corruption patterns based on existing script knowledge
   */
  private analyzeImportExportCorruption(
    filePath: string,
    content: string,
  ): {
    patterns: CorruptionPattern[];
    severity: CorruptionSeverity;
  } {
    const patterns: CorruptionPattern[] = [];
    let severity = CorruptionSeverity.LOW;

    // Import/Export corruption patterns based on existing script knowledge
    const importExportCorruptionPatterns = [
      {
        regex: /import\s+\{\s*\}\s+from\s+['"][^'"]*['"];?/g,
        description: 'Empty import statement',
        severity: CorruptionSeverity.MEDIUM,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]undefined['"];?/g,
        description: 'Import from undefined module',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]['"]\s*;?/g,
        description: 'Import from empty string',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /export\s+\{\s*\}\s*;?/g,
        description: 'Empty export statement',
        severity: CorruptionSeverity.MEDIUM,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"][^'"]*['"]\s+from\s+['"][^'"]*['"];?/g,
        description: 'Duplicate from clause in import',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\{\s*[^}]*,\s*,\s*[^}]*\}\s*from/g,
        description: 'Double comma in import destructuring',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\{\s*[^}]*\s+as\s+as\s+[^}]*\}\s*from/g,
        description: 'Duplicate "as" keyword in import',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /export\s*\{\s*[^}]*,\s*,\s*[^}]*\}/g,
        description: 'Double comma in export destructuring',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]@\/[^'"]*\s+@\/[^'"]*['"];?/g,
        description: 'Corrupted path alias in import',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"][^'"]*\.\.[^'"]*\.\.[^'"]*['"];?/g,
        description: 'Corrupted relative path with multiple ..',
        severity: CorruptionSeverity.MEDIUM,
      },
      {
        regex: /import\s*\{\s*[^}]*\s*\}\s*\{\s*[^}]*\s*\}\s*from/g,
        description: 'Duplicate destructuring braces in import',
        severity: CorruptionSeverity.CRITICAL,
      },
      {
        regex: /export\s+default\s+default\s+/g,
        description: 'Duplicate default keyword in export',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+type\s+type\s+/g,
        description: 'Duplicate type keyword in import',
        severity: CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\*\s+as\s+\*\s+as\s+/g,
        description: 'Corrupted namespace import syntax',
        severity: CorruptionSeverity.CRITICAL,
      },
    ];

    for (const corruptionPattern of importExportCorruptionPatterns) {
      const matches = content.match(corruptionPattern.regex);
      if (matches) {
        patterns.push({
          pattern: corruptionPattern.regex.source,
          description: `${corruptionPattern.description} (${matches.length} occurrences)`,
          files: [filePath],
        });

        // Update severity to the highest found
        if (corruptionPattern.severity === CorruptionSeverity.CRITICAL) {
          severity = CorruptionSeverity.CRITICAL;
        } else if (
          corruptionPattern.severity === CorruptionSeverity.HIGH &&
          severity !== CorruptionSeverity.CRITICAL
        ) {
          severity = CorruptionSeverity.HIGH;
        } else if (
          corruptionPattern.severity === CorruptionSeverity.MEDIUM &&
          severity === CorruptionSeverity.LOW
        ) {
          severity = CorruptionSeverity.MEDIUM;
        }
      }
    }

    // Check for malformed import/export statements
    const malformedPatterns = [
      /import\s+[^{]*\s+from(?!\s+['"])/g, // import without proper from clause
      /export\s+[^{]*\s+from(?!\s+['"])/g, // export without proper from clause
      /import\s*\{[^}]*\s+from\s+[^'"]/g, // import with missing quotes
      /export\s*\{[^}]*\s+from\s+[^'"]/g, // export with missing quotes
    ];

    for (const pattern of malformedPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        patterns.push({
          pattern: pattern.source,
          description: 'Malformed import/export statement syntax',
          files: [filePath],
        });
        severity = CorruptionSeverity.HIGH;
      }
    }

    return { patterns, severity };
  }

  private determineRecoveryAction(severity: CorruptionSeverity, fileCount: number): RecoveryAction {
    if (severity === CorruptionSeverity.CRITICAL) {
      return RecoveryAction.EMERGENCY_RESTORE;
    }

    if (severity === CorruptionSeverity.HIGH || fileCount > 10) {
      return RecoveryAction.ROLLBACK;
    }

    if (severity === CorruptionSeverity.MEDIUM || fileCount > 5) {
      return RecoveryAction.RETRY;
    }

    return RecoveryAction.CONTINUE;
  }

  private mapCorruptionToEventSeverity(corruption: CorruptionSeverity): SafetyEventSeverity {
    switch (corruption) {
      case CorruptionSeverity.CRITICAL:
        return SafetyEventSeverity.CRITICAL;
      case CorruptionSeverity.HIGH:
        return SafetyEventSeverity.ERROR;
      case CorruptionSeverity.MEDIUM:
        return SafetyEventSeverity.WARNING;
      case CorruptionSeverity.LOW:
      default:
        return SafetyEventSeverity.INFO;
    }
  }

  protected getCurrentBranch(): string {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  }

  private addSafetyEvent(event: SafetyEvent): void {
    this.safetyEvents.push(event);

    // Keep only recent events to prevent memory issues
    if (this.safetyEvents.length > 1000) {
      this.safetyEvents = this.safetyEvents.slice(-500);
    }
  }

  /**
   * Initialize stash tracking from persistent storage
   */
  private initializeStashTracking(): void {
    try {
      const stashTrackingPath = path.join('.kiro', 'campaign-stashes.json');
      if (fs.existsSync(stashTrackingPath)) {
        const data = fs.readFileSync(stashTrackingPath, 'utf8');
        const parsed = JSON.parse(data);

        // Restore stashes with proper Date objects
        for (const [id, stashData] of Object.entries(parsed.stashes || {})) {
          const stash = stashData as {
            id: string;
            description: string;
            timestamp: string;
            branch: string;
            ref?: string;
          };
          this.stashes.set(id, {
            ...stash,
            timestamp: new Date(stash.timestamp),
          });
        }

        this.stashCounter = parsed.counter || 0;
      }
    } catch (error) {
      console.warn(
        `⚠️ Could not load stash tracking: ${(error as any).message || 'Unknown error'}`,
      );
      this.stashCounter = 0;
    }
  }

  /**
   * Save stash tracking to persistent storage
   */
  private saveStashTracking(): void {
    try {
      const stashTrackingPath = path.join('.kiro', 'campaign-stashes.json');

      // Ensure .kiro directory exists
      const kiroDir = path.dirname(stashTrackingPath);
      if (!fs.existsSync(kiroDir)) {
        fs.mkdirSync(kiroDir, { recursive: true });
      }

      const data = {
        counter: this.stashCounter,
        stashes: Object.fromEntries(this.stashes.entries()),
        lastUpdated: new Date().toISOString(),
      };

      fs.writeFileSync(stashTrackingPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn(
        `⚠️ Could not save stash tracking: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Find stash by message when reference is not available
   */
  private async findStashByMessage(message: string): Promise<string> {
    try {
      const stashList = execSync('git stash list', { encoding: 'utf8' });
      const lines = stashList.split('\n');

      for (const line of lines) {
        if (line.includes(message)) {
          const match = line.match(/^(stash@\{\d+\})/);
          if (match) {
            return match[1];
          }
        }
      }

      throw new Error(`Stash not found with message: ${message}`);
    } catch (error) {
      throw new Error(
        `Failed to find stash by message: ${(error as any).message || 'Unknown error'}`,
      );
    }
  }
}

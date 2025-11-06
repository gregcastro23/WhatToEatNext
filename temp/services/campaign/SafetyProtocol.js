"use strict";
/**
 * Safety Protocol System
 * Perfect Codebase Campaign - Comprehensive Safety Implementation
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyProtocol = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const campaign_1 = require("../../types/campaign");
class SafetyProtocol {
  constructor(settings) {
    this.stashes = new Map();
    this.safetyEvents = [];
    this.stashCounter = 0;
    this.settings = settings;
    this.initializeStashTracking();
  }
  /**
   * Create a git stash with descriptive naming conventions
   */
  async createStash(description, phase) {
    try {
      this.stashCounter++;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const phasePrefix = phase ? `${phase}-` : "";
      const stashName = `campaign-${phasePrefix}${this.stashCounter}-${timestamp}`;
      const fullDescription = `${stashName}: ${description}`;
      // Validate git state before creating stash
      const gitValidation = await this.validateGitState();
      if (!gitValidation.success) {
        throw new Error(
          `Git validation failed: ${gitValidation.errors.join(", ")}`,
        );
      }
      // Create the git stash with all files including untracked
      (0, child_process_1.execSync)(
        `git stash push -u -m "${fullDescription}"`,
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      // Get the actual stash reference
      const stashList = (0, child_process_1.execSync)(
        "git stash list --oneline",
        { encoding: "utf8" },
      );
      const stashRef = stashList.split("\n")[0]?.split(":")[0] || "stash@{0}";
      // Store stash information
      const stash = {
        id: stashName,
        description: fullDescription,
        timestamp: new Date(),
        branch: this.getCurrentBranch(),
        ref: stashRef,
      };
      this.stashes.set(stashName, stash);
      this.saveStashTracking();
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.CHECKPOINT_CREATED,
        timestamp: new Date(),
        description: `Git stash created: ${stashName} (${stashRef})`,
        severity: campaign_1.SafetyEventSeverity.INFO,
        action: "STASH_CREATE",
      });
      console.log(`📦 Created git stash: ${stashName}`);
      console.log(`   Reference: ${stashRef}`);
      console.log(`   Rollback with: git stash apply ${stashRef}`);
      return stashName;
    } catch (error) {
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Failed to create git stash: ${error.message || "Unknown error"}`,
        severity: campaign_1.SafetyEventSeverity.ERROR,
        action: "STASH_FAILED",
      });
      throw new Error(
        `Failed to create git stash: ${error.message || "Unknown error"}`,
      );
    }
  }
  /**
   * Create a named checkpoint stash for specific operations
   */
  async createCheckpointStash(operation, phase) {
    const description = `Checkpoint before ${operation} in ${phase}`;
    return this.createStash(description, phase);
  }
  /**
   * Apply a specific git stash with automatic rollback scenarios
   */
  async applyStash(stashId, validateAfter = true) {
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
      (0, child_process_1.execSync)(`git stash apply ${stashRef}`, {
        encoding: "utf8",
        stdio: "pipe",
      });
      // Validate after application if requested
      if (validateAfter) {
        const validation = await this.validateGitState();
        if (!validation.success) {
          console.warn(
            `⚠️ Git state validation warnings after stash apply: ${validation.warnings.join(", ")}`,
          );
        }
      }
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.ROLLBACK_TRIGGERED,
        timestamp: new Date(),
        description: `Git stash applied: ${stashId} (${stashRef})`,
        severity: campaign_1.SafetyEventSeverity.WARNING,
        action: "STASH_APPLY",
      });
      console.log(`🔄 Applied git stash: ${stashId}`);
      console.log(`   Reference: ${stashRef}`);
    } catch (error) {
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Failed to apply git stash ${stashId}: ${error.message || "Unknown error"}`,
        severity: campaign_1.SafetyEventSeverity.ERROR,
        action: "STASH_APPLY_FAILED",
      });
      throw new Error(
        `Failed to apply git stash ${stashId}: ${error.message || "Unknown error"}`,
      );
    }
  }
  /**
   * Automatically apply the most recent stash for rollback scenarios
   */
  async autoApplyLatestStash() {
    const stashes = Array.from(this.stashes.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
    if (stashes.length === 0) {
      throw new Error("No stashes available for automatic rollback");
    }
    const latestStash = stashes[0];
    await this.applyStash(latestStash.id);
    return latestStash.id;
  }
  /**
   * Apply stash by phase for targeted rollbacks
   */
  async applyStashByPhase(phase) {
    const phaseStashes = Array.from(this.stashes.values())
      .filter((stash) => stash.id.includes(`-${phase}-`))
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
  async listStashes() {
    return Array.from(this.stashes.values());
  }
  /**
   * Detect file corruption using comprehensive syntax validation patterns
   */
  async detectCorruption(files) {
    const detectedFiles = [];
    const corruptionPatterns = [];
    let maxSeverity = campaign_1.CorruptionSeverity.LOW;
    console.log(
      `🔍 Analyzing ${files.length} files for corruption patterns...`,
    );
    for (const filePath of files) {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        continue;
      }
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const fileCorruption = this.analyzeFileCorruption(filePath, content);
        if (fileCorruption.patterns.length > 0) {
          detectedFiles.push(filePath);
          corruptionPatterns.push(...fileCorruption.patterns);
          console.log(
            `🚨 Corruption detected in ${filePath}: ${fileCorruption.patterns.length} patterns`,
          );
          // Update max severity
          if (
            fileCorruption.severity === campaign_1.CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.CRITICAL;
          } else if (
            fileCorruption.severity === campaign_1.CorruptionSeverity.HIGH &&
            maxSeverity !== campaign_1.CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.HIGH;
          } else if (
            fileCorruption.severity === campaign_1.CorruptionSeverity.MEDIUM &&
            maxSeverity === campaign_1.CorruptionSeverity.LOW
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.MEDIUM;
          }
        }
      } catch (error) {
        // File read error might indicate corruption
        detectedFiles.push(filePath);
        corruptionPatterns.push({
          pattern: "FILE_READ_ERROR",
          description: `Cannot read file: ${error.message || "Unknown error"}`,
          files: [filePath],
        });
        maxSeverity = campaign_1.CorruptionSeverity.HIGH;
        console.error(
          `❌ File read error in ${filePath}: ${error.message || "Unknown error"}`,
        );
      }
    }
    const recommendedAction = this.determineRecoveryAction(
      maxSeverity,
      detectedFiles.length,
    );
    const report = {
      detectedFiles,
      corruptionPatterns,
      severity: maxSeverity,
      recommendedAction,
    };
    if (detectedFiles.length > 0) {
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.CORRUPTION_DETECTED,
        timestamp: new Date(),
        description: `Corruption detected in ${detectedFiles.length} files (${maxSeverity} severity)`,
        severity: this.mapCorruptionToEventSeverity(maxSeverity),
        action: "CORRUPTION_DETECTED",
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
  async detectImportExportCorruption(files) {
    const detectedFiles = [];
    const corruptionPatterns = [];
    let maxSeverity = campaign_1.CorruptionSeverity.LOW;
    console.log(
      `🔍 Analyzing import/export corruption in ${files.length} files...`,
    );
    for (const filePath of files) {
      if (!fs.existsSync(filePath) || !filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        continue;
      }
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const importExportCorruption = this.analyzeImportExportCorruption(
          filePath,
          content,
        );
        if (importExportCorruption.patterns.length > 0) {
          detectedFiles.push(filePath);
          corruptionPatterns.push(...importExportCorruption.patterns);
          if (
            importExportCorruption.severity ===
            campaign_1.CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.CRITICAL;
          } else if (
            importExportCorruption.severity ===
              campaign_1.CorruptionSeverity.HIGH &&
            maxSeverity !== campaign_1.CorruptionSeverity.CRITICAL
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.HIGH;
          } else if (
            importExportCorruption.severity ===
              campaign_1.CorruptionSeverity.MEDIUM &&
            maxSeverity === campaign_1.CorruptionSeverity.LOW
          ) {
            maxSeverity = campaign_1.CorruptionSeverity.MEDIUM;
          }
        }
      } catch (error) {
        console.error(
          `❌ Error analyzing import/export corruption in ${filePath}: ${error.message || "Unknown error"}`,
        );
      }
    }
    const recommendedAction = this.determineRecoveryAction(
      maxSeverity,
      detectedFiles.length,
    );
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
  async startRealTimeMonitoring(files, intervalMs = 5000) {
    console.log(
      `🔄 Starting real-time corruption monitoring for ${files.length} files...`,
    );
    const monitoringInterval = setInterval(() => {
      void (async () => {
        try {
          const report = await this.detectCorruption(files);
          if (report.detectedFiles.length > 0) {
            console.warn(
              `⚠️ Real-time monitoring detected corruption in ${report.detectedFiles.length} files`,
            );
            this.addSafetyEvent({
              type: campaign_1.SafetyEventType.CORRUPTION_DETECTED,
              timestamp: new Date(),
              description: `Real-time monitoring detected corruption: ${report.severity}`,
              severity: this.mapCorruptionToEventSeverity(report.severity),
              action: "REALTIME_CORRUPTION_DETECTED",
            });
            // If critical corruption is detected, trigger emergency rollback
            if (
              report.severity === campaign_1.CorruptionSeverity.CRITICAL &&
              this.settings.automaticRollbackEnabled
            ) {
              console.error(
                `🚨 Critical corruption detected! Triggering emergency rollback...`,
              );
              clearInterval(monitoringInterval);
              await this.emergencyRollback();
              return;
            }
          }
        } catch (error) {
          console.error(
            `❌ Error during real-time monitoring: ${error.message || "Unknown error"}`,
          );
        }
      })();
    }, intervalMs);
    // Store the interval ID for cleanup
    this.monitoringInterval = monitoringInterval;
  }
  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log(`⏹️ Real-time corruption monitoring stopped`);
    }
  }
  /**
   * Validate syntax using TypeScript compiler
   */
  async validateSyntaxWithTypeScript(files) {
    const detectedFiles = [];
    const corruptionPatterns = [];
    let maxSeverity = campaign_1.CorruptionSeverity.LOW;
    console.log(
      `🔍 Validating syntax with TypeScript compiler for ${files.length} files...`,
    );
    try {
      // Run TypeScript compiler to check for syntax errors
      const tsFiles = files.filter((f) => f.match(/\.(ts|tsx)$/));
      if (tsFiles.length === 0) {
        return {
          detectedFiles,
          corruptionPatterns,
          severity: maxSeverity,
          recommendedAction: campaign_1.RecoveryAction.CONTINUE,
        };
      }
      const tscOutput = (0, child_process_1.execSync)(
        "yarn tsc --noEmit --skipLibCheck 2>&1",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      // Parse TypeScript compiler output for syntax errors
      const lines = tscOutput.split("\n");
      for (const line of lines) {
        if (
          line.includes("error TS") &&
          (line.includes("Unexpected token") ||
            line.includes("Expression expected"))
        ) {
          const fileMatch = line.match(/^([^(]+)\(/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            if (files.includes(filePath) && !detectedFiles.includes(filePath)) {
              detectedFiles.push(filePath);
              corruptionPatterns.push({
                pattern: "TYPESCRIPT_SYNTAX_ERROR",
                description: line.trim(),
                files: [filePath],
              });
              maxSeverity = campaign_1.CorruptionSeverity.HIGH;
            }
          }
        }
      }
    } catch (error) {
      // TypeScript compiler errors might indicate syntax corruption
      const errorOutput = error.stdout || error.message;
      if (
        errorOutput.includes("Unexpected token") ||
        errorOutput.includes("Expression expected")
      ) {
        maxSeverity = campaign_1.CorruptionSeverity.HIGH;
        corruptionPatterns.push({
          pattern: "TYPESCRIPT_COMPILATION_ERROR",
          description: `TypeScript compilation failed: ${errorOutput}`,
          files: files.filter((f) => f.match(/\.(ts|tsx)$/)),
        });
      }
    }
    const recommendedAction = this.determineRecoveryAction(
      maxSeverity,
      detectedFiles.length,
    );
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
  async emergencyRollback() {
    try {
      // Get the most recent stash
      const stashes = Array.from(this.stashes.values()).sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      if (stashes.length === 0) {
        throw new Error("No stashes available for emergency rollback");
      }
      const latestStash = stashes[0];
      await this.applyStash(latestStash.id);
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Emergency rollback completed using stash: ${latestStash.id}`,
        severity: campaign_1.SafetyEventSeverity.WARNING,
        action: "EMERGENCY_ROLLBACK",
      });
      console.log(
        `🚨 Emergency rollback completed using stash: ${latestStash.id}`,
      );
    } catch (error) {
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.EMERGENCY_RECOVERY,
        timestamp: new Date(),
        description: `Emergency rollback failed: ${error.message || "Unknown error"}`,
        severity: campaign_1.SafetyEventSeverity.CRITICAL,
        action: "EMERGENCY_ROLLBACK_FAILED",
      });
      throw new Error(
        `Emergency rollback failed: ${error.message || "Unknown error"}`,
      );
    }
  }
  /**
   * Validate git repository state
   */
  async validateGitState() {
    try {
      // Check if git repo exists
      if (!fs.existsSync(".git")) {
        return {
          success: false,
          errors: ["Not a git repository"],
          warnings: [],
        };
      }
      // Check for uncommitted changes
      const status = (0, child_process_1.execSync)("git status --porcelain", {
        encoding: "utf8",
      });
      const hasUncommittedChanges = status.trim().length > 0;
      const warnings = [];
      if (hasUncommittedChanges && !this.settings.automaticRollbackEnabled) {
        warnings.push(
          "Uncommitted changes detected - consider creating a stash",
        );
      }
      return {
        success: true,
        errors: [],
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Git validation failed: ${error.message || "Unknown error"}`],
        warnings: [],
      };
    }
  }
  /**
   * Clean up old stashes based on configurable retention policy
   */
  async cleanupOldStashes() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.stashRetentionDays);
    const stashesToRemove = [];
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
            (0, child_process_1.execSync)(`git stash drop ${stash.ref}`, {
              encoding: "utf8",
              stdio: "pipe",
            });
          } catch (gitError) {
            // Stash might already be gone, just log warning
            console.warn(
              `⚠️ Could not drop git stash ${stash.ref}: ${gitError.message || "Unknown error"}`,
            );
          }
        }
        // Remove from our tracking
        this.stashes.delete(stashId);
        cleanedCount++;
        console.log(`🧹 Cleaned up old stash: ${stashId}`);
      } catch (error) {
        console.warn(
          `⚠️ Failed to cleanup stash ${stashId}: ${error.message || "Unknown error"}`,
        );
      }
    }
    if (cleanedCount > 0) {
      this.saveStashTracking();
      this.addSafetyEvent({
        type: campaign_1.SafetyEventType.CHECKPOINT_CREATED,
        timestamp: new Date(),
        description: `Cleaned up ${cleanedCount} old stashes`,
        severity: campaign_1.SafetyEventSeverity.INFO,
        action: "STASH_CLEANUP",
      });
    }
  }
  /**
   * Get stashes by phase for targeted operations
   */
  async getStashesByPhase(phase) {
    return Array.from(this.stashes.values())
      .filter((stash) => stash.id.includes(`-${phase}-`))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  /**
   * Get stash statistics for reporting
   */
  getStashStatistics() {
    const stashes = Array.from(this.stashes.values());
    const byPhase = {};
    // Count stashes by phase
    for (const stash of stashes) {
      const phaseMatch = stash.id.match(/campaign-([^-]+)-/);
      if (phaseMatch) {
        const phase = phaseMatch[1];
        byPhase[phase] = (byPhase[phase] || 0) + 1;
      }
    }
    const timestamps = stashes.map((s) => s.timestamp);
    const oldestStash =
      timestamps.length > 0
        ? new Date(Math.min(...timestamps.map((t) => t.getTime())))
        : undefined;
    const newestStash =
      timestamps.length > 0
        ? new Date(Math.max(...timestamps.map((t) => t.getTime())))
        : undefined;
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
  getSafetyEvents() {
    return [...this.safetyEvents];
  }
  // Private helper methods
  analyzeFileCorruption(filePath, content) {
    const patterns = [];
    let severity = campaign_1.CorruptionSeverity.LOW;
    // Check for import corruption patterns (based on existing scripts)
    const importCorruptionPatterns = [
      {
        regex: /import @\/types\s+from '[^']*'\s*;/g,
        description: "Corrupted type import statement",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import @\/services\s+from '[^']*'\s*;/g,
        description: "Corrupted service import statement",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /<<<<<<|>>>>>>|======/g,
        description: "Git merge conflict markers",
        severity: campaign_1.CorruptionSeverity.CRITICAL,
      },
      {
        regex: /\bposit:\s*anyi:\s*anyo:\s*anyn:\s*anys:/g,
        description: "Corrupted parameter names",
        severity: campaign_1.CorruptionSeverity.MEDIUM,
      },
      {
        regex: /\bcate:\s*anyg:\s*anyo:\s*anyr:\s*anyy:/g,
        description: "Corrupted parameter names",
        severity: campaign_1.CorruptionSeverity.MEDIUM,
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
        if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.CRITICAL
        ) {
          severity = campaign_1.CorruptionSeverity.CRITICAL;
        } else if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.HIGH &&
          severity !== campaign_1.CorruptionSeverity.CRITICAL
        ) {
          severity = campaign_1.CorruptionSeverity.HIGH;
        } else if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.MEDIUM &&
          severity === campaign_1.CorruptionSeverity.LOW
        ) {
          severity = campaign_1.CorruptionSeverity.MEDIUM;
        }
      }
    }
    // Check for syntax corruption
    if (this.hasSyntaxCorruption(content)) {
      patterns.push({
        pattern: "SYNTAX_CORRUPTION",
        description: "Syntax corruption detected",
        files: [filePath],
      });
      severity = campaign_1.CorruptionSeverity.HIGH;
    }
    return { patterns, severity };
  }
  hasSyntaxCorruption(content) {
    // Check for unbalanced brackets (more lenient threshold)
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (
      Math.abs(openBrackets - closeBrackets) > 1 ||
      Math.abs(openParens - closeParens) > 1
    ) {
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
    return incompletePatterns.some((pattern) => pattern.test(content));
  }
  /**
   * Analyze import/export corruption patterns based on existing script knowledge
   */
  analyzeImportExportCorruption(filePath, content) {
    const patterns = [];
    let severity = campaign_1.CorruptionSeverity.LOW;
    // Import/Export corruption patterns based on existing script knowledge
    const importExportCorruptionPatterns = [
      {
        regex: /import\s+\{\s*\}\s+from\s+['"][^'"]*['"];?/g,
        description: "Empty import statement",
        severity: campaign_1.CorruptionSeverity.MEDIUM,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]undefined['"];?/g,
        description: "Import from undefined module",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]['"]\s*;?/g,
        description: "Import from empty string",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /export\s+\{\s*\}\s*;?/g,
        description: "Empty export statement",
        severity: campaign_1.CorruptionSeverity.MEDIUM,
      },
      {
        regex:
          /import\s+[^{]*\s+from\s+['"][^'"]*['"]\s+from\s+['"][^'"]*['"];?/g,
        description: "Duplicate from clause in import",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\{\s*[^}]*,\s*,\s*[^}]*\}\s*from/g,
        description: "Double comma in import destructuring",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\{\s*[^}]*\s+as\s+as\s+[^}]*\}\s*from/g,
        description: 'Duplicate "as" keyword in import',
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /export\s*\{\s*[^}]*,\s*,\s*[^}]*\}/g,
        description: "Double comma in export destructuring",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"]@\/[^'"]*\s+@\/[^'"]*['"];?/g,
        description: "Corrupted path alias in import",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+[^{]*\s+from\s+['"][^'"]*\.\.[^'"]*\.\.[^'"]*['"];?/g,
        description: "Corrupted relative path with multiple ..",
        severity: campaign_1.CorruptionSeverity.MEDIUM,
      },
      {
        regex: /import\s*\{\s*[^}]*\s*\}\s*\{\s*[^}]*\s*\}\s*from/g,
        description: "Duplicate destructuring braces in import",
        severity: campaign_1.CorruptionSeverity.CRITICAL,
      },
      {
        regex: /export\s+default\s+default\s+/g,
        description: "Duplicate default keyword in export",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s+type\s+type\s+/g,
        description: "Duplicate type keyword in import",
        severity: campaign_1.CorruptionSeverity.HIGH,
      },
      {
        regex: /import\s*\*\s+as\s+\*\s+as\s+/g,
        description: "Corrupted namespace import syntax",
        severity: campaign_1.CorruptionSeverity.CRITICAL,
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
        if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.CRITICAL
        ) {
          severity = campaign_1.CorruptionSeverity.CRITICAL;
        } else if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.HIGH &&
          severity !== campaign_1.CorruptionSeverity.CRITICAL
        ) {
          severity = campaign_1.CorruptionSeverity.HIGH;
        } else if (
          corruptionPattern.severity === campaign_1.CorruptionSeverity.MEDIUM &&
          severity === campaign_1.CorruptionSeverity.LOW
        ) {
          severity = campaign_1.CorruptionSeverity.MEDIUM;
        }
      }
    }
    // Check for malformed import/export statements
    const malformedPatterns = [
      /import\s+[^{]*\s+from(?!\s+['"])/g,
      /export\s+[^{]*\s+from(?!\s+['"])/g,
      /import\s*\{[^}]*\s+from\s+[^'"]/g,
      /export\s*\{[^}]*\s+from\s+[^'"]/g, // export with missing quotes
    ];
    for (const pattern of malformedPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        patterns.push({
          pattern: pattern.source,
          description: "Malformed import/export statement syntax",
          files: [filePath],
        });
        severity = campaign_1.CorruptionSeverity.HIGH;
      }
    }
    return { patterns, severity };
  }
  determineRecoveryAction(severity, fileCount) {
    if (severity === campaign_1.CorruptionSeverity.CRITICAL) {
      return campaign_1.RecoveryAction.EMERGENCY_RESTORE;
    }
    if (severity === campaign_1.CorruptionSeverity.HIGH || fileCount > 10) {
      return campaign_1.RecoveryAction.ROLLBACK;
    }
    if (severity === campaign_1.CorruptionSeverity.MEDIUM || fileCount > 5) {
      return campaign_1.RecoveryAction.RETRY;
    }
    return campaign_1.RecoveryAction.CONTINUE;
  }
  mapCorruptionToEventSeverity(corruption) {
    switch (corruption) {
      case campaign_1.CorruptionSeverity.CRITICAL:
        return campaign_1.SafetyEventSeverity.CRITICAL;
      case campaign_1.CorruptionSeverity.HIGH:
        return campaign_1.SafetyEventSeverity.ERROR;
      case campaign_1.CorruptionSeverity.MEDIUM:
        return campaign_1.SafetyEventSeverity.WARNING;
      case campaign_1.CorruptionSeverity.LOW:
      default:
        return campaign_1.SafetyEventSeverity.INFO;
    }
  }
  getCurrentBranch() {
    try {
      return (0, child_process_1.execSync)("git branch --show-current", {
        encoding: "utf8",
      }).trim();
    } catch {
      return "unknown";
    }
  }
  addSafetyEvent(event) {
    this.safetyEvents.push(event);
    // Keep only recent events to prevent memory issues
    if (this.safetyEvents.length > 1000) {
      this.safetyEvents = this.safetyEvents.slice(-500);
    }
  }
  /**
   * Initialize stash tracking from persistent storage
   */
  initializeStashTracking() {
    try {
      const stashTrackingPath = path.join(".kiro", "campaign-stashes.json");
      if (fs.existsSync(stashTrackingPath)) {
        const data = fs.readFileSync(stashTrackingPath, "utf8");
        const parsed = JSON.parse(data);
        // Restore stashes with proper Date objects
        for (const [id, stashData] of Object.entries(parsed.stashes || {})) {
          const stash = stashData;
          this.stashes.set(id, {
            ...stash,
            timestamp: new Date(stash.timestamp),
          });
        }
        this.stashCounter = parsed.counter || 0;
      }
    } catch (error) {
      console.warn(
        `⚠️ Could not load stash tracking: ${error.message || "Unknown error"}`,
      );
      this.stashCounter = 0;
    }
  }
  /**
   * Save stash tracking to persistent storage
   */
  saveStashTracking() {
    try {
      const stashTrackingPath = path.join(".kiro", "campaign-stashes.json");
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
        `⚠️ Could not save stash tracking: ${error.message || "Unknown error"}`,
      );
    }
  }
  /**
   * Find stash by message when reference is not available
   */
  async findStashByMessage(message) {
    try {
      const stashList = (0, child_process_1.execSync)("git stash list", {
        encoding: "utf8",
      });
      const lines = stashList.split("\n");
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
        `Failed to find stash by message: ${error.message || "Unknown error"}`,
      );
    }
  }
}
exports.SafetyProtocol = SafetyProtocol;

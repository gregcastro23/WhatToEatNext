"use strict";
/**
 * Campaign System Integration Layer
 * Extends existing CampaignController to support unintentional any elimination
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnintentionalAnyIntegrationHelper =
  exports.createUnintentionalAnyCampaignController =
  exports.UnintentionalAnyCampaignController =
    void 0;
const campaign_1 = require("../../../types/campaign");
const CampaignController_1 = require("../CampaignController");
const UnintentionalAnyEliminationCampaign_1 = require("./UnintentionalAnyEliminationCampaign");
/**
 * Extended Campaign Controller with Unintentional Any Elimination support
 */
class UnintentionalAnyCampaignController
  extends CampaignController_1.CampaignController
{
  constructor(config, unintentionalAnyConfig) {
    super(config);
    // Default configuration for unintentional any elimination
    this.unintentionalAnyConfig = {
      maxFilesPerBatch: 15,
      targetReductionPercentage: 15,
      confidenceThreshold: 0.8,
      enableDomainAnalysis: true,
      enableDocumentation: true,
      safetyLevel: "CONSERVATIVE",
      validationFrequency: 5,
      ...unintentionalAnyConfig,
    };
    this.unintentionalAnyCampaign =
      new UnintentionalAnyEliminationCampaign_1.UnintentionalAnyEliminationCampaign(
        this.unintentionalAnyConfig,
      );
  }
  /**
   * Execute unintentional any elimination phase with full campaign integration
   */
  async executeUnintentionalAnyPhase(phase) {
    console.log(
      `🎯 Executing Unintentional Any Elimination Phase: ${phase.name}`,
    );
    const startTime = Date.now();
    // Create safety checkpoint before phase execution
    const checkpointId = await this.createSafetyCheckpoint(
      `Pre-phase checkpoint: ${phase.name}`,
    );
    try {
      // Get initial metrics for comparison
      const initialMetrics = await this.getCurrentMetrics();
      const initialUnintentionalAnyMetrics =
        await this.getUnintentionalAnyMetrics();
      // Execute the phase using the unintentional any campaign
      const campaignResult =
        await this.unintentionalAnyCampaign.executePhase(phase);
      // Get final metrics and calculate improvement
      const finalMetrics = await this.getCurrentMetrics();
      const finalUnintentionalAnyMetrics =
        await this.getUnintentionalAnyMetrics();
      const metricsImprovement = this.calculateUnintentionalAnyImprovement(
        initialUnintentionalAnyMetrics,
        finalUnintentionalAnyMetrics,
      );
      // Validate phase completion
      const validation = await this.validateUnintentionalAnyPhaseCompletion(
        phase,
        finalUnintentionalAnyMetrics,
      );
      if (
        !validation.success &&
        this.config.safetySettings.automaticRollbackEnabled
      ) {
        console.warn(
          `⚠️ Phase validation failed, rolling back to checkpoint: ${checkpointId}`,
        );
        await this.rollbackToCheckpoint(checkpointId);
        throw new Error(
          `Phase validation failed: ${validation.errors.join(", ")}`,
        );
      }
      const executionTime = Date.now() - startTime;
      const result = {
        phaseId: phase.id,
        success: campaignResult.success,
        metricsImprovement: {
          typeScriptErrorsReduced:
            metricsImprovement.explicitAnyWarningsReduced,
          lintingWarningsReduced: metricsImprovement.explicitAnyWarningsReduced,
          buildTimeImproved: 0,
          enterpriseSystemsAdded: 0,
        },
        filesProcessed: campaignResult.filesProcessed,
        errorsFixed: campaignResult.errorsFixed,
        warningsFixed: campaignResult.warningsFixed,
        executionTime,
        safetyEvents: campaignResult.safetyEvents,
      };
      console.log(
        `✅ Unintentional Any Elimination Phase completed successfully`,
      );
      console.log(`   Files processed: ${result.filesProcessed}`);
      console.log(`   Warnings fixed: ${result.warningsFixed}`);
      console.log(
        `   Execution time: ${(result.executionTime / 1000).toFixed(2)}s`,
      );
      return result;
    } catch (error) {
      console.error(`❌ Unintentional Any Elimination Phase failed:`, error);
      const executionTime = Date.now() - startTime;
      return {
        phaseId: phase.id,
        success: false,
        metricsImprovement: {
          typeScriptErrorsReduced: 0,
          lintingWarningsReduced: 0,
          buildTimeImproved: 0,
          enterpriseSystemsAdded: 0,
        },
        filesProcessed: 0,
        errorsFixed: 0,
        warningsFixed: 0,
        executionTime,
        safetyEvents: [
          {
            type: campaign_1.SafetyEventType.EMERGENCY_RECOVERY,
            timestamp: new Date(),
            description: `Unintentional Any Elimination Phase failed: ${error instanceof Error ? error.message : String(error)}`,
            severity: campaign_1.SafetyEventSeverity.ERROR,
            action: "PHASE_FAILURE",
          },
        ],
      };
    }
  }
  /**
   * Create campaign configuration that includes unintentional any elimination phases
   */
  static createUnintentionalAnyEliminationConfig(
    baseConfig,
    unintentionalAnyConfig,
  ) {
    const unintentionalAnyCampaign =
      new UnintentionalAnyEliminationCampaign_1.UnintentionalAnyEliminationCampaign(
        unintentionalAnyConfig,
      );
    const unintentionalAnyPhases =
      unintentionalAnyCampaign.createCampaignPhases();
    const defaultConfig = {
      phases: [
        // Include existing phases if provided
        ...(baseConfig?.phases || []),
        // Add unintentional any elimination phases
        ...unintentionalAnyPhases,
      ],
      safetySettings: {
        maxFilesPerBatch: unintentionalAnyConfig?.maxFilesPerBatch || 15,
        buildValidationFrequency:
          unintentionalAnyConfig?.validationFrequency || 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7,
        ...baseConfig?.safetySettings,
      },
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200,
        ...baseConfig?.progressTargets,
      },
      toolConfiguration: {
        enhancedErrorFixer:
          "scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js",
        explicitAnyFixer:
          "src/services/campaign/unintentional-any-elimination/ProgressiveImprovementEngine.ts",
        unusedVariablesFixer:
          "scripts/typescript-fixes/fix-unused-variables-enhanced.js",
        consoleStatementFixer:
          "scripts/lint-fixes/fix-console-statements-only.js",
        ...baseConfig?.toolConfiguration,
      },
    };
    return defaultConfig;
  }
  /**
   * Get unintentional any specific metrics
   */
  async getUnintentionalAnyMetrics() {
    try {
      // Get current explicit-any warning count
      const lintingOutput = await this.getLintingOutput();
      const explicitAnyWarnings = this.countExplicitAnyWarnings(lintingOutput);
      // Get documentation coverage
      const documentationReport =
        await this.unintentionalAnyCampaign.getDocumentationReport();
      return {
        totalAnyTypes: explicitAnyWarnings,
        intentionalAnyTypes: documentationReport.totalIntentionalAnyTypes,
        unintentionalAnyTypes:
          explicitAnyWarnings - documentationReport.totalIntentionalAnyTypes,
        documentedAnyTypes: Math.round(
          (documentationReport.totalIntentionalAnyTypes *
            documentationReport.documentationCoverage) /
            100,
        ),
        documentationCoverage: documentationReport.documentationCoverage,
        reductionFromBaseline: 0,
        targetReduction: this.unintentionalAnyConfig.targetReductionPercentage,
      };
    } catch (error) {
      console.warn(
        `Warning: Could not get unintentional any metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        totalAnyTypes: 0,
        intentionalAnyTypes: 0,
        unintentionalAnyTypes: 0,
        documentedAnyTypes: 0,
        documentationCoverage: 0,
        reductionFromBaseline: 0,
        targetReduction: this.unintentionalAnyConfig.targetReductionPercentage,
      };
    }
  }
  /**
   * Get enhanced progress metrics that include unintentional any metrics
   */
  async getUnintentionalAnyProgressMetrics() {
    const baseMetrics = await this.getCurrentMetrics();
    const unintentionalAnyMetrics = await this.getUnintentionalAnyMetrics();
    return {
      ...baseMetrics,
      unintentionalAnyMetrics,
    };
  }
  /**
   * Validate unintentional any phase completion
   */
  async validateUnintentionalAnyPhaseCompletion(phase, metrics) {
    const errors = [];
    const warnings = [];
    try {
      // Validate based on phase type
      switch (phase.id) {
        case "unintentional-any-analysis":
          // Analysis phase should complete without increasing any types
          if (metrics.totalAnyTypes < 0) {
            errors.push("Analysis phase failed to count any types");
          }
          break;
        case "unintentional-any-replacement":
          // Replacement phase should reduce unintentional any types
          if (
            metrics.reductionFromBaseline <
            this.unintentionalAnyConfig.targetReductionPercentage * 0.5
          ) {
            warnings.push(
              `Reduction ${metrics.reductionFromBaseline}% is below target ${this.unintentionalAnyConfig.targetReductionPercentage}%`,
            );
          }
          break;
        case "intentional-any-documentation":
          // Documentation phase should improve documentation coverage
          if (metrics.documentationCoverage < 80) {
            warnings.push(
              `Documentation coverage ${metrics.documentationCoverage}% is below 80%`,
            );
          }
          break;
      }
      // Validate build still works
      const buildValidation = await this.validateBuild();
      if (!buildValidation.success) {
        errors.push(
          "Build validation failed after unintentional any elimination",
        );
        errors.push(...buildValidation.errors);
      }
      return {
        success: errors.length === 0,
        errors,
        warnings,
        metrics: await this.getCurrentMetrics(),
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Validation error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings: [],
      };
    }
  }
  /**
   * Calculate metrics improvement for unintentional any elimination
   */
  calculateUnintentionalAnyImprovement(initial, final) {
    return {
      explicitAnyWarningsReduced:
        initial.unintentionalAnyTypes - final.unintentionalAnyTypes,
      documentationImproved:
        final.documentationCoverage - initial.documentationCoverage,
    };
  }
  /**
   * Get linting output for analysis
   */
  async getLintingOutput() {
    try {
      const { execSync } = require("child_process");
      return execSync("yarn lint 2>&1", { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
      // ESLint returns non-zero exit code when warnings/errors are found
      return error.stdout || error.message || "";
    }
  }
  /**
   * Count explicit-any warnings in linting output
   */
  countExplicitAnyWarnings(lintingOutput) {
    const explicitAnyMatches = lintingOutput.match(
      /@typescript-eslint\/no-explicit-any/g,
    );
    return explicitAnyMatches ? explicitAnyMatches.length : 0;
  }
  /**
   * Validate build after changes
   */
  async validateBuild() {
    try {
      const { execSync } = require("child_process");
      execSync("yarn build", { encoding: "utf8", stdio: "pipe" });
      return { success: true, errors: [] };
    } catch (error) {
      return {
        success: false,
        errors: [error.message || "Build failed"],
      };
    }
  }
  /**
   * Get the unintentional any campaign instance
   */
  getUnintentionalAnyCampaign() {
    return this.unintentionalAnyCampaign;
  }
  /**
   * Update unintentional any configuration
   */
  updateUnintentionalAnyConfig(newConfig) {
    this.unintentionalAnyConfig = {
      ...this.unintentionalAnyConfig,
      ...newConfig,
    };
    this.unintentionalAnyCampaign.updateConfig(newConfig);
  }
  /**
   * Get current unintentional any configuration
   */
  getUnintentionalAnyConfig() {
    return { ...this.unintentionalAnyConfig };
  }
}
exports.UnintentionalAnyCampaignController = UnintentionalAnyCampaignController;
/**
 * Factory function to create a campaign controller with unintentional any elimination support
 */
function createUnintentionalAnyCampaignController(
  baseConfig,
  unintentionalAnyConfig,
) {
  const config =
    UnintentionalAnyCampaignController.createUnintentionalAnyEliminationConfig(
      baseConfig,
      unintentionalAnyConfig,
    );
  return new UnintentionalAnyCampaignController(config, unintentionalAnyConfig);
}
exports.createUnintentionalAnyCampaignController =
  createUnintentionalAnyCampaignController;
/**
 * Integration helper to add unintentional any elimination to existing campaigns
 */
class UnintentionalAnyIntegrationHelper {
  /**
   * Add unintentional any elimination phases to existing campaign configuration
   */
  static addUnintentionalAnyPhases(existingConfig, unintentionalAnyConfig) {
    const unintentionalAnyCampaign =
      new UnintentionalAnyEliminationCampaign_1.UnintentionalAnyEliminationCampaign(
        unintentionalAnyConfig,
      );
    const unintentionalAnyPhases =
      unintentionalAnyCampaign.createCampaignPhases();
    return {
      ...existingConfig,
      phases: [...existingConfig.phases, ...unintentionalAnyPhases],
    };
  }
  /**
   * Create compatibility layer with existing automation scripts
   */
  static createAutomationScriptCompatibility() {
    return {
      explicitAnyFixer:
        "src/services/campaign/unintentional-any-elimination/ProgressiveImprovementEngine.ts",
      unintentionalAnyAnalyzer:
        "src/services/campaign/unintentional-any-elimination/AnyTypeClassifier.ts",
      documentationGenerator:
        "src/services/campaign/unintentional-any-elimination/AutoDocumentationGenerator.ts",
    };
  }
  /**
   * Resolve conflicts with other campaign priorities
   */
  static resolveCampaignPriorityConflicts(campaigns, priorityOrder) {
    // Sort campaigns by priority order
    const sortedCampaigns = campaigns.sort((a, b) => {
      const aIndex = priorityOrder.findIndex((p) =>
        a.phases.some((phase) => phase.id.includes(p)),
      );
      const bIndex = priorityOrder.findIndex((p) =>
        b.phases.some((phase) => phase.id.includes(p)),
      );
      return aIndex - bIndex;
    });
    // Merge campaigns with priority-based phase ordering
    const mergedPhases = [];
    const mergedSafetySettings = {
      maxFilesPerBatch: Math.min(
        ...campaigns.map((c) => c.safetySettings.maxFilesPerBatch),
      ),
      buildValidationFrequency: Math.min(
        ...campaigns.map((c) => c.safetySettings.buildValidationFrequency),
      ),
      testValidationFrequency: Math.min(
        ...campaigns.map((c) => c.safetySettings.testValidationFrequency),
      ),
      corruptionDetectionEnabled: campaigns.every(
        (c) => c.safetySettings.corruptionDetectionEnabled,
      ),
      automaticRollbackEnabled: campaigns.every(
        (c) => c.safetySettings.automaticRollbackEnabled,
      ),
      stashRetentionDays: Math.max(
        ...campaigns.map((c) => c.safetySettings.stashRetentionDays),
      ),
    };
    // Add phases in priority order
    for (const priority of priorityOrder) {
      for (const campaign of sortedCampaigns) {
        const priorityPhases = campaign.phases.filter((phase) =>
          phase.id.includes(priority),
        );
        mergedPhases.push(...priorityPhases);
      }
    }
    return {
      phases: mergedPhases,
      safetySettings: mergedSafetySettings,
      progressTargets: sortedCampaigns[0].progressTargets,
      toolConfiguration: {
        ...sortedCampaigns[0].toolConfiguration,
        ...UnintentionalAnyIntegrationHelper.createAutomationScriptCompatibility(),
      },
    };
  }
}
exports.UnintentionalAnyIntegrationHelper = UnintentionalAnyIntegrationHelper;

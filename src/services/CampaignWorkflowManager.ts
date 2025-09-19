/**
 * Campaign Workflow Manager
 *
 * Provides guided workflows for campaign creation, configuration templates,
 * validation, testing capabilities, and versioning for campaign management
 * within the Kiro environment.
 */

import { log } from '@/services/LoggingService';

import {
  CampaignConfig,
  CampaignPhase,
  ProgressMetrics,
  ValidationResult,
  DryRunResult,
  SafetySettings,
  ToolConfiguration
} from '../types/campaign';

import { CampaignController } from './campaign/CampaignController';
import { ProgressTracker } from './campaign/ProgressTracker';
import { TypeScriptErrorAnalyzer } from './campaign/TypeScriptErrorAnalyzer';

// Re-export required types for external components
export type { ValidationResult, DryRunResult } from '../types/campaign';

// ========== WORKFLOW TYPES ==========;

export interface CampaignTemplate {
  id: string,
  name: string,
  description: string,
  category: 'typescript' | 'linting' | 'performance' | 'comprehensive',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  estimatedDuration: number, // minutes
  phases: CampaignPhaseTemplate[],
  safetySettings: SafetySettings,
  prerequisites: string[],
  expectedOutcomes: string[],
}

export interface CampaignPhaseTemplate {
  id: string,
  name: string,
  description: string,
  tools: ToolTemplate[],
  successCriteria: {
    typeScriptErrors?: number;
    lintingWarnings?: number;
    buildTime?: number;
    customValidation?: string; // Function name or description
  };
  estimatedDuration: number; // minutes
  riskLevel: 'low' | 'medium' | 'high'
}

export interface ToolTemplate {
  name: string,
  scriptPath: string,
  description: string,
  parameters: Record<string, ParameterTemplate>;
  batchSize: number,
  safetyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMUM',
}

export interface ParameterTemplate {
  type: 'string' | 'number' | 'boolean',
  description: string,
  defaultValue: unknown,
  required: boolean,
  validation?: string; // Validation rule description
}

export interface CampaignWorkflow {
  id: string,
  name: string,
  description: string,
  steps: WorkflowStep[],
  currentStep: number,
  status: 'draft' | 'configured' | 'validated' | 'ready' | 'executing' | 'completed' | 'failed',
  config: Partial<CampaignConfig>,
  validationResults: ValidationResult[],
  dryRunResults: DryRunResult[],
  createdAt: Date,
  updatedAt: Date
}

export interface WorkflowStep {
  id: string,
  name: string,
  description: string,
  type:
    | 'template_selection'
    | 'configuration'
    | 'validation'
    | 'dry_run'
    | 'approval'
    | 'execution';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  data?: Record<string, unknown>;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  field: string,
  rule: string,
  message: string,
  severity: 'error' | 'warning' | 'info',
}

export interface CampaignVersion {
  id: string,
  campaignId: string,
  version: string,
  config: CampaignConfig,
  createdAt: Date,
  createdBy: string,
  description: string,
  status: 'draft' | 'active' | 'archived',
  parentVersion?: string;
}

export interface RollbackPlan {
  campaignId: string,
  targetVersion: string,
  rollbackSteps: RollbackStep[],
  estimatedDuration: number,
  riskAssessment: string,
  approvalRequired: boolean,
}

export interface RollbackStep {
  id: string,
  description: string,
  action: 'restore_files' | 'revert_config' | 'rebuild' | 'validate',
  parameters: Record<string, unknown>;
  estimatedDuration: number
}

// ========== CAMPAIGN WORKFLOW MANAGER ==========;

export class CampaignWorkflowManager {
  private workflows: Map<string, CampaignWorkflow> = new Map();
  private templates: Map<string, CampaignTemplate> = new Map();
  private versions: Map<string, CampaignVersion[]> = new Map();
  private campaignController: CampaignController;
  private progressTracker: ProgressTracker;
  private errorAnalyzer: TypeScriptErrorAnalyzer;

  constructor() {
    this.campaignController = new CampaignController(this.getDefaultConfig());
    this.progressTracker = new ProgressTracker();
    this.errorAnalyzer = new TypeScriptErrorAnalyzer();
    this.initializeTemplates();
  }

  // ========== WORKFLOW CREATION ==========;

  /**
   * Create a new campaign workflow from template
   */
  async createWorkflowFromTemplate(templateId: string, workflowName: string): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const workflowId = `workflow_${Date.now()}`;
    const workflow: CampaignWorkflow = {
      id: workflowId,
      name: workflowName,
      description: `Campaign workflow based on ${template.name}`,
      steps: this.createWorkflowSteps(template),
      currentStep: 0,
      status: 'draft',
      config: this.templateToConfig(template),
      validationResults: [],
      dryRunResults: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  /**
   * Create a custom workflow from scratch
   */
  async createCustomWorkflow(workflowName: string, description: string): Promise<string> {
    const workflowId = `workflow_${Date.now()}`;
    const workflow: CampaignWorkflow = {
      id: workflowId,
      name: workflowName,
      description,
      steps: this.createDefaultWorkflowSteps(),
      currentStep: 0,
      status: 'draft',
      config: {},
      validationResults: [],
      dryRunResults: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflows.set(workflowId, workflow);
    return workflowId;
  }

  // ========== WORKFLOW MANAGEMENT ==========;

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): CampaignWorkflow | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): CampaignWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Update workflow configuration
   */
  async updateWorkflowConfig(
    workflowId: string,
    configUpdates: Partial<CampaignConfig>,
  ): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.config = { ...workflow.config, ...configUpdates };
    workflow.updatedAt = new Date();

    // Validate the updated configuration
    const validation = await this.validateWorkflowConfig(workflowId);
    workflow.validationResults = [validation];

    return true;
  }

  /**
   * Advance workflow to next step
   */
  async advanceWorkflowStep(workflowId: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const currentStep = workflow.steps[workflow.currentStep];
    if (!currentStep || currentStep.status !== 'completed') {
      return false;
    }

    if (workflow.currentStep < workflow.steps.length - 1) {
      workflow.currentStep++;
      workflow.steps[workflow.currentStep].status = 'in_progress';
      workflow.updatedAt = new Date();
      return true;
    }

    return false;
  }

  /**
   * Complete current workflow step
   */
  async completeWorkflowStep(
    workflowId: string,
    stepData?: Record<string, unknown>,
  ): Promise<boolean> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    const currentStep = workflow.steps[workflow.currentStep];
    if (!currentStep) return false;

    currentStep.status = 'completed';
    if (stepData) {
      currentStep.data = stepData;
    }

    workflow.updatedAt = new Date();

    // Auto-advance to next step if possible
    if (workflow.currentStep < workflow.steps.length - 1) {
      workflow.currentStep++;
      workflow.steps[workflow.currentStep].status = 'in_progress';
    } else {
      workflow.status = 'ready';
    }

    return true;
  }

  // ========== VALIDATION AND TESTING ==========;

  /**
   * Validate workflow configuration
   */
  async validateWorkflowConfig(workflowId: string): Promise<ValidationResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return {
        success: false,
        errors: ['Workflow not found'],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic configuration
    if (!workflow.config.phases || workflow.config.phases.length === 0) {
      errors.push('At least one campaign phase is required');
    }

    // Validate phases
    if (workflow.config.phases) {
      for (const phase of workflow.config.phases) {
        if (!phase.tools || phase.tools.length === 0) {
          errors.push(`Phase ${phase.name} has no tools configured`);
        }

        if (!phase.successCriteria) {
          warnings.push(`Phase ${phase.name} has no success criteria defined`);
        }
      }
    }

    // Validate safety settings
    if (workflow.config.safetySettings) {
      const safety = workflow.config.safetySettings;
      if (safety.maxFilesPerBatch > 50) {
        warnings.push('Large batch size may impact system stability');
      }
      if (!safety.automaticRollbackEnabled) {
        warnings.push('Automatic rollback is disabled - manual intervention may be required');
      }
    }

    return {
      success: errors.length === 0,;
      errors,
      warnings
    };
  }

  /**
   * Perform dry run of campaign workflow
   */
  async performDryRun(workflowId: string): Promise<DryRunResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.config.phases) {
      return {
        wouldProcess: [],
        estimatedChanges: 0,
        potentialIssues: ['Invalid workflow configuration'],
        safetyScore: 0
      };
    }

    const wouldProcess: string[] = [];
    let estimatedChanges = 0;
    const potentialIssues: string[] = [];
    let safetyScore = 1.0;

    // Analyze each phase
    for (const phase of workflow.config.phases) {
      for (const tool of phase.tools) {
        // Simulate tool execution analysis
        const analysis = await this.analyzeToolImpact(tool as unknown as any);
        wouldProcess.push(...analysis.files);
        estimatedChanges += analysis.changes;
        potentialIssues.push(...analysis.issues);
        safetyScore = Math.min(safetyScore, analysis.safetyScore);
      }
    }

    const dryRunResult: DryRunResult = {
      wouldProcess,
      estimatedChanges,
      potentialIssues,
      safetyScore
    };

    // Store dry run results
    workflow.dryRunResults.push(dryRunResult);
    workflow.updatedAt = new Date();

    return dryRunResult;
  }

  // ========== VERSIONING AND ROLLBACK ==========;

  /**
   * Create a new version of campaign configuration
   */
  async createCampaignVersion(
    campaignId: string,
    config: CampaignConfig,
    description: string,
    createdBy: string = 'system'
  ): Promise<string> {
    const versions = this.versions.get(campaignId) || [];
    const versionNumber = `v${versions.length + 1}.0`;

    const version: CampaignVersion = {
      id: `${campaignId}_${versionNumber}`,
      campaignId,
      version: versionNumber,
      config,
      createdAt: new Date(),
      createdBy,
      description,
      status: 'draft',
      parentVersion: versions.length > 0 ? versions[versions.length - 1].version : undefined
    };

    versions.push(version);
    this.versions.set(campaignId, versions);

    return version.id;
  }

  /**
   * Get campaign versions
   */
  getCampaignVersions(campaignId: string): CampaignVersion[] {
    return this.versions.get(campaignId) || [];
  }

  /**
   * Create rollback plan
   */
  async createRollbackPlan(campaignId: string, targetVersion: string): Promise<RollbackPlan> {
    const versions = this.versions.get(campaignId) || [];
    const targetVersionObj = versions.find(v => v.version === targetVersion);

    if (!targetVersionObj) {
      throw new Error(`Version ${targetVersion} not found for campaign ${campaignId}`);
    }

    const rollbackSteps: RollbackStep[] = [
      {
        id: 'backup_current',
        description: 'Create backup of current state',
        action: 'restore_files',
        parameters: { createBackup: true },
        estimatedDuration: 2
      },
      {
        id: 'revert_config',
        description: `Revert configuration to ${targetVersion}`,
        action: 'revert_config',
        parameters: { targetVersion },
        estimatedDuration: 1
      },
      {
        id: 'rebuild_project',
        description: 'Rebuild project with reverted configuration',
        action: 'rebuild',
        parameters: {},
        estimatedDuration: 5
      },
      {
        id: 'validate_rollback',
        description: 'Validate rollback success',
        action: 'validate',
        parameters: { runTests: true },
        estimatedDuration: 3
      }
    ];

    const totalDuration = rollbackSteps.reduce((sum, step) => sum + step.estimatedDuration, 0);

    return {
      campaignId,
      targetVersion,
      rollbackSteps,
      estimatedDuration: totalDuration,
      riskAssessment: 'Low risk - configuration rollback with validation',
      approvalRequired: true
    };
  }

  /**
   * Execute rollback plan
   */
  async executeRollback(rollbackPlan: RollbackPlan): Promise<boolean> {
    try {
      for (const step of rollbackPlan.rollbackSteps) {
        log.info(`Executing rollback step: ${step.description}`);

        switch (step.action) {
          case 'restore_files':
            await this.restoreFiles(step.parameters);
            break;
          case 'revert_config':
            await this.revertConfiguration(rollbackPlan.campaignId, step.parameters.targetVersion);
            break;
          case 'rebuild':
            await this.rebuildProject();
            break;
          case 'validate':
            await this.validateRollback(step.parameters);
            break;
        }
      }

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  // ========== TEMPLATE MANAGEMENT ==========;

  /**
   * Get all available templates
   */
  getTemplates(): CampaignTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): CampaignTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: CampaignTemplate['category']): CampaignTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  // ========== PRIVATE HELPER METHODS ==========;

  private initializeTemplates(): void {
    // TypeScript Error Elimination Template
    this.templates.set('typescript-cleanup', {
      id: 'typescript-cleanup',
      name: 'TypeScript Error Cleanup',
      description: 'Systematic elimination of TypeScript compilation errors',
      category: 'typescript',
      difficulty: 'intermediate',
      estimatedDuration: 30,
      phases: [
        {
          id: 'ts-error-phase',
          name: 'TypeScript Error Elimination',
          description: 'Fix high-priority TypeScript errors',
          tools: [
            {
              name: 'Enhanced Error Fixer',
              scriptPath: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
              description: 'Advanced TypeScript error fixing with safety protocols',
              parameters: {
                maxFiles: {
                  type: 'number',
                  description: 'Maximum files to process',
                  defaultValue: 15,
                  required: true
                },
                autoFix: {
                  type: 'boolean',
                  description: 'Enable automatic fixes',
                  defaultValue: true,
                  required: false
                },
                validateSafety: {
                  type: 'boolean',
                  description: 'Enable safety validation',
                  defaultValue: true,
                  required: false
                }
              },
              batchSize: 15,
              safetyLevel: 'MAXIMUM'
            }
          ],
          successCriteria: {
            typeScriptErrors: 0
          },
          estimatedDuration: 30,
          riskLevel: 'medium'
        }
      ],
      safetySettings: {
        maxFilesPerBatch: 15,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      prerequisites: ['TypeScript project', 'Git repository'],
      expectedOutcomes: [
        'Zero TypeScript compilation errors',
        'Improved code quality',
        'Better IDE support'
      ]
    });

    // Linting Excellence Template
    this.templates.set('linting-excellence', {
      id: 'linting-excellence',
      name: 'Linting Excellence',
      description: 'Comprehensive linting warning elimination',
      category: 'linting',
      difficulty: 'beginner',
      estimatedDuration: 20,
      phases: [
        {
          id: 'lint-cleanup-phase',
          name: 'Linting Warning Cleanup',
          description: 'Systematic elimination of linting warnings',
          tools: [
            {
              name: 'Explicit Any Eliminator',
              scriptPath: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
              description: 'Remove explicit any types systematically',
              parameters: {
                maxFiles: {
                  type: 'number',
                  description: 'Maximum files to process',
                  defaultValue: 25,
                  required: true
                },
                continueFrom: {
                  type: 'string',
                  description: 'Continue from percentage',
                  defaultValue: '0%',
                  required: false
                }
              },
              batchSize: 25,
              safetyLevel: 'HIGH'
            }
          ],
          successCriteria: {
            lintingWarnings: 0
          },
          estimatedDuration: 20,
          riskLevel: 'low'
        }
      ],
      safetySettings: {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 10,
        testValidationFrequency: 15,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      prerequisites: ['ESLint configuration', 'TypeScript project'],
      expectedOutcomes: [
        'Zero linting warnings',
        'Consistent code style',
        'Better maintainability'
      ]
    });

    // Comprehensive Quality Template
    this.templates.set('comprehensive-quality', {
      id: 'comprehensive-quality',
      name: 'Comprehensive Quality Campaign',
      description: 'Complete code quality improvement across all areas',
      category: 'comprehensive',
      difficulty: 'advanced',
      estimatedDuration: 90,
      phases: [
        {
          id: 'ts-errors',
          name: 'TypeScript Error Elimination',
          description: 'Fix all TypeScript compilation errors',
          tools: [
            {
              name: 'Enhanced Error Fixer',
              scriptPath: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
              description: 'Advanced TypeScript error fixing',
              parameters: {
                maxFiles: {
                  type: 'number',
                  description: 'Maximum files to process',
                  defaultValue: 15,
                  required: true
                }
              },
              batchSize: 15,
              safetyLevel: 'MAXIMUM'
            }
          ],
          successCriteria: { typeScriptErrors: 0 },
          estimatedDuration: 30,
          riskLevel: 'medium'
        },
        {
          id: 'linting-cleanup',
          name: 'Linting Excellence',
          description: 'Eliminate all linting warnings',
          tools: [
            {
              name: 'Explicit Any Eliminator',
              scriptPath: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
              description: 'Remove explicit any types',
              parameters: {
                maxFiles: {
                  type: 'number',
                  description: 'Maximum files to process',
                  defaultValue: 25,
                  required: true
                }
              },
              batchSize: 25,
              safetyLevel: 'HIGH'
            }
          ],
          successCriteria: { lintingWarnings: 0 },
          estimatedDuration: 20,
          riskLevel: 'low'
        },
        {
          id: 'performance-optimization',
          name: 'Performance Optimization',
          description: 'Optimize build and runtime performance',
          tools: [
            {
              name: 'Build Optimizer',
              scriptPath: 'scripts/performance/optimize-build.js',
              description: 'Optimize build configuration and performance',
              parameters: {
                analyzeBundle: {
                  type: 'boolean',
                  description: 'Analyze bundle size',
                  defaultValue: true,
                  required: false
                }
              },
              batchSize: 10,
              safetyLevel: 'MEDIUM'
            }
          ],
          successCriteria: { buildTime: 10 },
          estimatedDuration: 40,
          riskLevel: 'medium'
        }
      ],
      safetySettings: {
        maxFilesPerBatch: 15,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 14
      },
      prerequisites: ['TypeScript project', 'ESLint configuration', 'Build system'],
      expectedOutcomes: [
        'Zero TypeScript errors',
        'Zero linting warnings',
        'Optimized build performance',
        'Enterprise-ready codebase'
      ]
    });
  }

  private createWorkflowSteps(template: CampaignTemplate): WorkflowStep[] {
    return [
      {
        id: 'template_selection',
        name: 'Template Selection',
        description: `Selected template: ${template.name}`,
        type: 'template_selection',
        status: 'completed',
        data: { templateId: template.id }
      },
      {
        id: 'configuration',
        name: 'Configuration',
        description: 'Configure campaign parameters and settings',
        type: 'configuration',
        status: 'pending',
        validationRules: [
          {
            field: 'phases',
            rule: 'required',
            message: 'At least one phase is required',
            severity: 'error'
          }
        ]
      },
      {
        id: 'validation',
        name: 'Validation',
        description: 'Validate campaign configuration',
        type: 'validation',
        status: 'pending'
      },
      {
        id: 'dry_run',
        name: 'Dry Run',
        description: 'Test campaign execution without making changes',
        type: 'dry_run',
        status: 'pending'
      },
      {
        id: 'approval',
        name: 'Approval',
        description: 'Review and approve campaign for execution',
        type: 'approval',
        status: 'pending'
      },
      {
        id: 'execution',
        name: 'Execution',
        description: 'Execute the campaign',
        type: 'execution',
        status: 'pending'
      }
    ];
  }

  private createDefaultWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'configuration',
        name: 'Configuration',
        description: 'Configure campaign from scratch',
        type: 'configuration',
        status: 'in_progress'
      },
      {
        id: 'validation',
        name: 'Validation',
        description: 'Validate campaign configuration',
        type: 'validation',
        status: 'pending'
      },
      {
        id: 'dry_run',
        name: 'Dry Run',
        description: 'Test campaign execution',
        type: 'dry_run',
        status: 'pending'
      },
      {
        id: 'approval',
        name: 'Approval',
        description: 'Review and approve campaign',
        type: 'approval',
        status: 'pending'
      },
      {
        id: 'execution',
        name: 'Execution',
        description: 'Execute the campaign',
        type: 'execution',
        status: 'pending'
      }
    ];
  }

  private templateToConfig(template: CampaignTemplate): Partial<CampaignConfig> {
    const phases: CampaignPhase[] = template.phases.map(
      phaseTemplate =>
        ({
          id: phaseTemplate.id,
          name: phaseTemplate.name,
          description: phaseTemplate.description,
          tools: phaseTemplate.tools.map(toolTemplate => ({
            scriptPath: toolTemplate.scriptPath,
            parameters: Object.fromEntries(
              Object.entries(toolTemplate.parameters).map(([key, param]) => [
                key,
                param.defaultValue
              ]),
            ),
            batchSize: toolTemplate.batchSize,
            safetyLevel: toolTemplate.safetyLevel as string
          })),
          successCriteria: phaseTemplate.successCriteria,
          safetyCheckpoints: []
        }) as CampaignPhase,
    );

    return {
      phases,
      safetySettings: template.safetySettings,
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js'
      }
    };
  }

  private async analyzeToolImpact(tool: Record<string, unknown>): Promise<{
    files: string[],
    changes: number,
    issues: string[],
    safetyScore: number,
  }> {
    // Mock analysis - in real implementation, this would analyze the actual tool impact
    return {
      files: [`src/file1.ts`, `src/file2.ts`],
      changes: 10,
      issues: [],
      safetyScore: 0.9
    };
  }

  private async restoreFiles(parameters: Record<string, unknown>): Promise<void> {
    // Mock implementation
    log.info('Restoring files with parameters:', parameters);
  }

  private async revertConfiguration(campaignId: string, targetVersion: string): Promise<void> {
    // Mock implementation
    log.info(`Reverting campaign ${campaignId} to version ${targetVersion}`);
  }

  private async rebuildProject(): Promise<void> {
    // Mock implementation
    log.info('Rebuilding project...');
  }

  private async validateRollback(parameters: Record<string, unknown>): Promise<void> {
    // Mock implementation
    log.info('Validating rollback with parameters:', parameters);
  }

  private getDefaultConfig(): CampaignConfig {
    return {
      phases: [],
      safetySettings: {
        maxFilesPerBatch: 25,
        buildValidationFrequency: 5,
        testValidationFrequency: 10,
        corruptionDetectionEnabled: true,
        automaticRollbackEnabled: true,
        stashRetentionDays: 7
      },
      progressTargets: {
        typeScriptErrors: 0,
        lintingWarnings: 0,
        buildTime: 10,
        enterpriseSystems: 200
      },
      toolConfiguration: {
        enhancedErrorFixer: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
        explicitAnyFixer: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
        unusedVariablesFixer: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
        consoleStatementFixer: 'scripts/lint-fixes/fix-console-statements-only.js'
      }
    };
  }
}

// Export singleton instance
export const _campaignWorkflowManager = new CampaignWorkflowManager();

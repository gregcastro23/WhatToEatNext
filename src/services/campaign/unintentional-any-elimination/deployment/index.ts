/**
 * Deployment Automation System for Unintentional Any Elimination
 *
 * This module provides comprehensive deployment automation including:
 * - Phased rollout management
 * - Monitoring and alerting setup
 * - Integration testing in deployment pipeline
 * - Rollback procedures for deployment issues
 */

import { spawn } from 'child_process';
import { existsSync, writeFileSync } from 'fs';

import { ConfigurationManager, UnintentionalAnyConfig, environmentConfigManager } from '../config';

export interface DeploymentPhase {
  id: string,
  name: string,
  description: string,
  prerequisites: string[],
  tasks: DeploymentTask[],
  rollbackTasks: DeploymentTask[],
  validationChecks: ValidationCheck[],
  successCriteria: SuccessCriteria
}

export interface DeploymentTask {
  id: string,
  name: string,
  command: string,
  args: string[],
  timeout: number,
  retries: number,
  critical: boolean,
  environment?: Record<string, string>
}

export interface ValidationCheck {
  id: string,
  name: string,
  type: 'build' | 'test' | 'lint' | 'custom',
  command: string,
  args: string[],
  timeout: number,
  expectedExitCode: number,
  outputValidation?: (output: string) => boolean
}

export interface SuccessCriteria {
  buildSuccess: boolean,
  testsPass: boolean,
  lintingPass: boolean,
  configurationValid: boolean,
  customChecks: Array<{
    name: string,
    validator: () => Promise<boolean>,
  }>;
}

export interface DeploymentResult {
  success: boolean,
  phase: string,
  startTime: Date,
  endTime: Date,
  duration: number,
  tasksExecuted: number,
  tasksSucceeded: number,
  tasksFailed: number,
  validationResults: ValidationResult[],
  errors: string[],
  warnings: string[],
  rollbackPerformed: boolean
}

export interface ValidationResult {
  checkId: string,
  checkName: string,
  success: boolean,
  output: string,
  duration: number,
  error?: string
}

/**
 * Deployment Manager class
 */
export class DeploymentManager {
  private config: UnintentionalAnyConfig;
  private deploymentLog: string[],
  private currentPhase?: string,

  constructor(config?: UnintentionalAnyConfig) {
    this.config = config || environmentConfigManager.getConfig();
    this.deploymentLog = [];
  }

  /**
   * Execute complete deployment with all phases
   */
  async executeDeployment(phases: DeploymentPhase[]): Promise<DeploymentResult[]> {
    const results: DeploymentResult[] = [];

    this.log('Starting deployment automation');
    this.log(`Deploying ${phases.length} phases`);

    for (const phase of phases) {
      try {
        this.currentPhase = phase.id;
        const result = await this.executePhase(phase);
        results.push(result);

        if (!result.success) {
          this.log(`Phase ${phase.id} failed, stopping deployment`);
          break;
        }

        this.log(`Phase ${phase.id} completed successfully`);
      } catch (error) {
        this.log(`Phase ${phase.id} threw error: ${error}`);
        results.push({
          success: false,
          phase: phase.id,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          tasksExecuted: 0,
          tasksSucceeded: 0,
          tasksFailed: 1,
          validationResults: [],
          errors: [String(error)],
          warnings: [],
          rollbackPerformed: false
        });
        break;
      }
    }

    this.log('Deployment automation completed');
    return results;
  }

  /**
   * Execute single deployment phase
   */
  async executePhase(phase: DeploymentPhase): Promise<DeploymentResult> {
    const startTime = new Date();
    const result: DeploymentResult = {
      success: false,
      phase: phase.id,
      startTime,
      endTime: new Date(),
      duration: 0,
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      validationResults: [],
      errors: [],
      warnings: [],
      rollbackPerformed: false
    };

    this.log(`Executing phase: ${phase.name}`);

    try {
      // Check prerequisites
      await this.checkPrerequisites(phase.prerequisites);

      // Execute tasks
      for (const task of phase.tasks) {
        result.tasksExecuted++;

        try {
          await this.executeTask(task);
          result.tasksSucceeded++;
          this.log(`Task completed: ${task.name}`);
        } catch (error) {
          result.tasksFailed++;
          result.errors.push(`Task ${task.name} failed: ${error}`);

          if (task.critical) {
            throw new Error(`Critical task failed: ${task.name}`);
          } else {
            result.warnings.push(`Non-critical task failed: ${task.name}`);
          }
        }
      }

      // Run validation checks
      result.validationResults = await this.runValidationChecks(phase.validationChecks);

      // Check success criteria
      const criteriaResult = await this.checkSuccessCriteria(;
        phase.successCriteria;
        result.validationResults
      );
      result.success = criteriaResult.success;

      if (!criteriaResult.success) {
        result.errors.push(...criteriaResult.errors);
      }
    } catch (error) {
      result.success = false;
      result.errors.push(String(error));

      // Attempt rollback
      if (phase.rollbackTasks.length > 0) {
        this.log(`Attempting rollback for phase: ${phase.name}`);
        try {
          await this.executeRollback(phase.rollbackTasks);
          result.rollbackPerformed = true;
          this.log('Rollback completed successfully');
        } catch (rollbackError) {
          result.errors.push(`Rollback failed: ${rollbackError}`);
          this.log(`Rollback failed: ${rollbackError}`);
        }
      }
    }

    const endTime = new Date();
    result.endTime = endTime;
    result.duration = endTime.getTime() - startTime.getTime();

    return result;
  }

  /**
   * Execute deployment task
   */
  private async executeTask(task: DeploymentTask): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(task.command, task.args, {
        env: { ...process.env, ...task.environment },
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', data => {
        output += data.toString();
      });

      process.stderr?.on('data', data => {
        errorOutput += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error(`Task ${task.name} timed out after ${task.timeout}ms`));
      }, task.timeout);

      process.on('close', code => {
        clearTimeout(timeout);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Task ${task.name} exited with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Run validation checks
   */
  private async runValidationChecks(checks: ValidationCheck[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const check of checks) {
      const startTime = Date.now();
      const result: ValidationResult = {
        checkId: check.id,
        checkName: check.name,
        success: false,
        output: '',
        duration: 0
      };

      try {
        const output = await this.executeValidationCheck(check);
        result.output = output;
        result.success = check.outputValidation ? check.outputValidation(output) : true;
      } catch (error) {
        result.error = String(error);
        result.success = false;
      }

      result.duration = Date.now() - startTime;
      results.push(result);
    }

    return results;
  }

  /**
   * Execute validation check
   */
  private async executeValidationCheck(check: ValidationCheck): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(check.command, check.args, {
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      process.stdout?.on('data', data => {
        output += data.toString();
      });

      process.stderr?.on('data', data => {
        errorOutput += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error(`Validation check ${check.name} timed out`));
      }, check.timeout);

      process.on('close', code => {
        clearTimeout(timeout);

        if (code === check.expectedExitCode) {
          resolve(output);
        } else {
          reject(
            new Error(`Validation check ${check.name} failed with code ${code}: ${errorOutput}`);
          );
        }
      });

      process.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Check success criteria
   */
  private async checkSuccessCriteria(
    criteria: SuccessCriteria,
    validationResults: ValidationResult[],
  ): Promise<{ success: boolean, errors: string[] }> {
    const errors: string[] = [];

    // Check build success
    if (criteria.buildSuccess) {
      const buildCheck = validationResults.find(r => r.checkId.includes('build'));
      if (!buildCheck?.success) {
        errors.push('Build validation failed');
      }
    }

    // Check tests pass
    if (criteria.testsPass) {
      const testCheck = validationResults.find(r => r.checkId.includes('test'));
      if (!testCheck?.success) {
        errors.push('Test validation failed');
      }
    }

    // Check linting pass
    if (criteria.lintingPass) {
      const lintCheck = validationResults.find(r => r.checkId.includes('lint'));
      if (!lintCheck?.success) {
        errors.push('Linting validation failed');
      }
    }

    // Check configuration valid
    if (criteria.configurationValid) {
      const configManager = new ConfigurationManager();
      const validation = configManager.validateConfig();
      if (!validation.isValid) {
        errors.push(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Run custom checks
    for (const customCheck of criteria.customChecks) {
      try {
        const result = await customCheck.validator();
        if (!result) {
          errors.push(`Custom check failed: ${customCheck.name}`);
        }
      } catch (error) {
        errors.push(`Custom check error: ${customCheck.name} - ${error}`);
      }
    }

    return {
      success: errors.length === 0,,;
      errors
    };
  }

  /**
   * Execute rollback tasks
   */
  private async executeRollback(rollbackTasks: DeploymentTask[]): Promise<void> {
    for (const task of rollbackTasks) {
      await this.executeTask(task);
    }
  }

  /**
   * Check prerequisites
   */
  private async checkPrerequisites(prerequisites: string[]): Promise<void> {
    for (const prerequisite of prerequisites) {
      if (!existsSync(prerequisite)) {
        throw new Error(`Prerequisite not found: ${prerequisite}`);
      }
    }
  }

  /**
   * Log deployment message
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.deploymentLog.push(logMessage);
    // // console.log(logMessage);
  }

  /**
   * Get deployment log
   */
  getDeploymentLog(): string[] {
    return [...this.deploymentLog]
  }

  /**
   * Save deployment log to file
   */
  saveDeploymentLog(filePath: string): void {
    const logContent = this.deploymentLog.join('\n');
    writeFileSync(filePath, logContent);
  }
}

/**
 * Create standard deployment phases
 */
export function createStandardDeploymentPhases(): DeploymentPhase[] {
  return [
    {
      id: 'pre-deployment',
      name: 'Pre-deployment Validation',
      description: 'Validate system state before deployment',
      prerequisites: ['package.json', 'tsconfig.json'],
      tasks: [
        {
          id: 'install-dependencies',
          name: 'Install Dependencies',
          command: 'npm',
          args: ['install'],
          timeout: 300000,
          retries: 2,
          critical: true
        },
        {
          id: 'build-project',
          name: 'Build Project',
          command: 'npm',
          args: ['run', 'build'],
          timeout: 180000,
          retries: 1,
          critical: true
        }
      ],
      rollbackTasks: [],
      validationChecks: [
        {
          id: 'build-validation',
          name: 'Build Validation',
          type: 'build',
          command: 'npm',
          args: ['run', 'build'],
          timeout: 180000,
          expectedExitCode: 0
        },
        {
          id: 'typescript-validation',
          name: 'TypeScript Validation',
          type: 'build',
          command: 'npx',
          args: ['tsc', '--noEmit'],
          timeout: 120000,
          expectedExitCode: 0
        }
      ],
      successCriteria: {
        buildSuccess: true,
        testsPass: false,
        lintingPass: false,
        configurationValid: true,
        customChecks: []
      }
    },
    {
      id: 'configuration-deployment',
      name: 'Configuration Deployment',
      description: 'Deploy and validate configuration',
      prerequisites: [],
      tasks: [
        {
          id: 'validate-config',
          name: 'Validate Configuration',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/config/cli.ts';
            'validate'
          ],
          timeout: 30000,
          retries: 1,
          critical: true
        },
        {
          id: 'setup-config-directories',
          name: 'Setup Configuration Directories',
          command: 'mkdir',
          args: ['-p', '.kiro/campaign-configs'],
          timeout: 10000,
          retries: 1,
          critical: true
        }
      ],
      rollbackTasks: [
        {
          id: 'reset-config',
          name: 'Reset Configuration',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/config/cli.ts';
            'reset',
            '--confirm'
          ],
          timeout: 30000,
          retries: 1,
          critical: false
        }
      ],
      validationChecks: [
        {
          id: 'config-validation',
          name: 'Configuration Validation',
          type: 'custom',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/config/cli.ts';
            'validate'
          ],
          timeout: 30000,
          expectedExitCode: 0
        }
      ],
      successCriteria: {
        buildSuccess: false,
        testsPass: false,
        lintingPass: false,
        configurationValid: true,
        customChecks: [
          {
            name: 'Configuration File Exists',
            validator: async () =>
              existsSync('.kiro/campaign-configs/unintentional-any-elimination.json')
          }
        ]
      }
    },
    {
      id: 'system-integration',
      name: 'System Integration',
      description: 'Integrate with existing campaign system',
      prerequisites: [],
      tasks: [
        {
          id: 'run-integration-tests',
          name: 'Run Integration Tests',
          command: 'npm',
          args: ['test', '--', '--testPathPattern=integration'],,;
          timeout: 300000,
          retries: 1,
          critical: true
        },
        {
          id: 'verify-campaign-integration',
          name: 'Verify Campaign Integration',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/verify-integration.ts'
          ],
          timeout: 60000,
          retries: 1,
          critical: true
        }
      ],
      rollbackTasks: [],
      validationChecks: [
        {
          id: 'integration-test-validation',
          name: 'Integration Test Validation',
          type: 'test',
          command: 'npm',
          args: ['test', '--', '--testPathPattern=integration', '--passWithNoTests'],,;
          timeout: 300000,
          expectedExitCode: 0
        }
      ],
      successCriteria: {
        buildSuccess: false,
        testsPass: true,
        lintingPass: false,
        configurationValid: true,
        customChecks: []
      }
    },
    {
      id: 'monitoring-setup',
      name: 'Monitoring and Alerting Setup',
      description: 'Setup monitoring and alerting systems',
      prerequisites: [],
      tasks: [
        {
          id: 'setup-monitoring',
          name: 'Setup Monitoring',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/deployment/setup-monitoring.ts'
          ],
          timeout: 60000,
          retries: 1,
          critical: false
        }
      ],
      rollbackTasks: [],
      validationChecks: [
        {
          id: 'monitoring-validation',
          name: 'Monitoring Validation',
          type: 'custom',
          command: 'npx',
          args: [
            'tsx',
            'src/services/campaign/unintentional-any-elimination/deployment/validate-monitoring.ts'
          ],
          timeout: 30000,
          expectedExitCode: 0
        }
      ],
      successCriteria: {
        buildSuccess: false,
        testsPass: false,
        lintingPass: false,
        configurationValid: true,
        customChecks: []
      }
    },
    {
      id: 'final-validation',
      name: 'Final Validation',
      description: 'Final system validation and readiness check',
      prerequisites: [],
      tasks: [
        {
          id: 'run-full-test-suite',
          name: 'Run Full Test Suite',
          command: 'npm',
          args: ['test'],
          timeout: 600000,
          retries: 1,
          critical: true
        },
        {
          id: 'run-linting',
          name: 'Run Linting',
          command: 'npm',
          args: ['run', 'lint'],
          timeout: 120000,
          retries: 1,
          critical: false
        }
      ],
      rollbackTasks: [],
      validationChecks: [
        {
          id: 'final-build-validation',
          name: 'Final Build Validation',
          type: 'build',
          command: 'npm',
          args: ['run', 'build'],
          timeout: 180000,
          expectedExitCode: 0
        },
        {
          id: 'final-test-validation',
          name: 'Final Test Validation',
          type: 'test',
          command: 'npm',
          args: ['test', '--passWithNoTests'],
          timeout: 600000,
          expectedExitCode: 0
        }
      ],
      successCriteria: {
        buildSuccess: true,
        testsPass: true,
        lintingPass: true,
        configurationValid: true,
        customChecks: [
          {
            name: 'System Ready Check',
            validator: async () => {
              // Check if all components are properly integrated
              try {
                const configManager = new ConfigurationManager();
                const config = configManager.getConfig();
                const validation = configManager.validateConfig();
                return validation.isValid;
              } catch {
                return false
              }
            }
          }
        ]
      }
    }
  ];
}

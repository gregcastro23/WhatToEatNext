/**
 * Tests for Deployment Manager
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DeploymentManager, DeploymentPhase, createStandardDeploymentPhases } from '../index';

describe('DeploymentManager', () => {
  let tempDir: string,
  let deploymentManager: DeploymentManager,

  beforeEach(() => {
    // Create temporary directory for test deployments
    tempDir = join(tmpdir(), `deployment-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });

    // Change to temp directory for tests
    process.chdir(tempDir);

    deploymentManager = new DeploymentManager();
  });

  afterEach(() => {
    // Clean up temporary directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Phase Execution', () => {
    test('executes simple phase successfully', async () => {
      const phase: DeploymentPhase = { id: 'test-phase',,
        name: 'Test Phase',
        description: 'Simple test phase',
        prerequisites: [],
        tasks: [
          {
            id: 'echo-task',
            name: 'Echo Task',
            command: 'echo',
            args: ['Hello World'],
            timeout: 5000,
            retries: 1,
            critical: false
          }
        ],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(true);
      expect(result.phase).toBe('test-phase');
      expect(result.tasksExecuted).toBe(1);
      expect(result.tasksSucceeded).toBe(1);
      expect(result.tasksFailed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    test('handles task failure correctly', async () => {
      const phase: DeploymentPhase = { id: 'failing-phase',,
        name: 'Failing Phase',
        description: 'Phase with failing task',
        prerequisites: [],
        tasks: [
          {
            id: 'failing-task',
            name: 'Failing Task',
            command: 'false', // Command that always fails
            args: [],
            timeout: 5000,
            retries: 1,
            critical: true
          }
        ],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(false);
      expect(result.tasksExecuted).toBe(1);
      expect(result.tasksSucceeded).toBe(0);
      expect(result.tasksFailed).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('executes rollback on critical task failure', async () => {
      // Create a test file that rollback can remove
      const testFile: any = join(tempDir, 'test-file.txt');
      writeFileSync(testFile, 'test content');

      const phase: DeploymentPhase = { id: 'rollback-phase',,
        name: 'Rollback Phase',
        description: 'Phase that triggers rollback',
        prerequisites: [],
        tasks: [
          {
            id: 'failing-task',
            name: 'Failing Task',
            command: 'false',
            args: [],
            timeout: 5000,
            retries: 1,
            critical: true
          }
        ],
        rollbackTasks: [
          {
            id: 'cleanup-task',
            name: 'Cleanup Task',
            command: 'rm',
            args: [testFile],
            timeout: 5000,
            retries: 1,
            critical: false
          }
        ],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(existsSync(testFile)).toBe(false); // File should be removed by rollback
    });

    test('handles non-critical task failures gracefully', async () => {
      const phase: DeploymentPhase = { id: 'mixed-phase',,
        name: 'Mixed Phase',
        description: 'Phase with critical and non-critical tasks',
        prerequisites: [],
        tasks: [
          {
            id: 'success-task',
            name: 'Success Task',
            command: 'echo',
            args: ['success'],
            timeout: 5000,
            retries: 1,
            critical: false
          },
          {
            id: 'failing-task',
            name: 'Failing Task',
            command: 'false',
            args: [],
            timeout: 5000,
            retries: 1,
            critical: false // Non-critical
          },
          {
            id: 'another-success-task',
            name: 'Another Success Task',
            command: 'echo',
            args: ['another success'],
            timeout: 5000,
            retries: 1,
            critical: false
          }
        ],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(true); // Should succeed despite non-critical failure
      expect(result.tasksExecuted).toBe(3);
      expect(result.tasksSucceeded).toBe(2);
      expect(result.tasksFailed).toBe(1);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Validation Checks', () => {
    test('runs validation checks successfully', async () => {
      const phase: DeploymentPhase = { id: 'validation-phase',,
        name: 'Validation Phase',
        description: 'Phase with validation checks',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [
          {
            id: 'echo-validation',
            name: 'Echo Validation',
            type: 'custom',
            command: 'echo',
            args: ['validation success'],
            timeout: 5000,
            expectedExitCode: 0
          }
        ],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(true);
      expect(result.validationResults).toHaveLength(1);
      expect(result.validationResults[0].success).toBe(true);
      expect(result.validationResults[0].checkName).toBe('Echo Validation');
    });

    test('handles validation check failures', async () => {
      const phase: DeploymentPhase = { id: 'failing-validation-phase',,
        name: 'Failing Validation Phase',
        description: 'Phase with failing validation',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [
          {
            id: 'failing-validation',
            name: 'Failing Validation',
            type: 'custom',
            command: 'false',
            args: [],
            timeout: 5000,
            expectedExitCode: 0 // Expects success but command fails
          }
        ],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.validationResults).toHaveLength(1);
      expect(result.validationResults[0].success).toBe(false);
      expect(result.validationResults[0].error).toBeDefined();
    });

    test('validates output with custom validator', async () => {
      const phase: DeploymentPhase = { id: 'output-validation-phase',,
        name: 'Output Validation Phase',
        description: 'Phase with output validation',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [
          {
            id: 'output-validation',
            name: 'Output Validation',
            type: 'custom',
            command: 'echo',
            args: ['expected output'],
            timeout: 5000,
            expectedExitCode: 0,
            outputValidation: (outpu, t: string) => output.includes('expected')
          }
        ],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(true);
      expect(result.validationResults[0].success).toBe(true);
      expect(result.validationResults[0].output).toContain('expected');
    });
  });

  describe('Success Criteria', () => {
    test('evaluates custom success criteria', async () => {
      let customCheckCalled: any = false;

      const phase: DeploymentPhase = { id: 'custom-criteria-phase',,
        name: 'Custom Criteria Phase',
        description: 'Phase with custom success criteria',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: [
            {
              name: 'Custom Check',
              validator: async () => {
                customCheckCalled = true;
                return true,
              }
            }
          ]
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(true);
      expect(customCheckCalled).toBe(true);
    });

    test('fails when custom criteria not met', async () => {
      const phase: DeploymentPhase = { id: 'failing-criteria-phase',,
        name: 'Failing Criteria Phase',
        description: 'Phase with failing custom criteria',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: [
            {
              name: 'Failing Check',
              validator: async () => false
            }
          ]
        }
      };

      const result: any = await deploymentManager.executePhase(phase);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Custom check failed: Failing Check');
    });
  });

  describe('Full Deployment', () => {
    test('executes multiple phases in sequence', async () => {
      const phases: DeploymentPhase[] = [
        {
          id: 'phase1',
          name: 'Phase 1',
          description: 'First phase',
          prerequisites: [],
          tasks: [
            {
              id: 'task1',
              name: 'Task 1',
              command: 'echo',
              args: ['phase 1'],
              timeout: 5000,
              retries: 1,
              critical: false
            }
          ],
          rollbackTasks: [],
          validationChecks: [],
          successCriteria: { buildSuccess: false,
            testsPass: false,
            lintingPass: false,
            configurationValid: false,
            customChecks: []
          }
        },
        {
          id: 'phase2',
          name: 'Phase 2',
          description: 'Second phase',
          prerequisites: [],
          tasks: [
            {
              id: 'task2',
              name: 'Task 2',
              command: 'echo',
              args: ['phase 2'],
              timeout: 5000,
              retries: 1,
              critical: false
            }
          ],
          rollbackTasks: [],
          validationChecks: [],
          successCriteria: { buildSuccess: false,
            testsPass: false,
            lintingPass: false,
            configurationValid: false,
            customChecks: []
          }
        }
      ];

      const results: any = await deploymentManager.executeDeployment(phases);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].phase).toBe('phase1');
      expect(results[1].success).toBe(true);
      expect(results[1].phase).toBe('phase2');
    });

    test('stops deployment on phase failure', async () => {
      const phases: DeploymentPhase[] = [
        {
          id: 'success-phase',
          name: 'Success Phase',
          description: 'Successful phase',
          prerequisites: [],
          tasks: [
            {
              id: 'success-task',
              name: 'Success Task',
              command: 'echo',
              args: ['success'],
              timeout: 5000,
              retries: 1,
              critical: false
            }
          ],
          rollbackTasks: [],
          validationChecks: [],
          successCriteria: { buildSuccess: false,
            testsPass: false,
            lintingPass: false,
            configurationValid: false,
            customChecks: []
          }
        },
        {
          id: 'failing-phase',
          name: 'Failing Phase',
          description: 'Failing phase',
          prerequisites: [],
          tasks: [
            {
              id: 'failing-task',
              name: 'Failing Task',
              command: 'false',
              args: [],
              timeout: 5000,
              retries: 1,
              critical: true
            }
          ],
          rollbackTasks: [],
          validationChecks: [],
          successCriteria: { buildSuccess: false,
            testsPass: false,
            lintingPass: false,
            configurationValid: false,
            customChecks: []
          }
        },
        {
          id: 'never-reached-phase',
          name: 'Never Reached Phase',
          description: 'This phase should never be reached',
          prerequisites: [],
          tasks: [],
          rollbackTasks: [],
          validationChecks: [],
          successCriteria: { buildSuccess: false,
            testsPass: false,
            lintingPass: false,
            configurationValid: false,
            customChecks: []
          }
        }
      ];

      const results: any = await deploymentManager.executeDeployment(phases);

      expect(results).toHaveLength(2); // Should stop after failing phase
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Standard Deployment Phases', () => {
    test('creates standard deployment phases', () => {
      const phases: any = createStandardDeploymentPhases();

      expect(phases.length).toBeGreaterThan(0);
      expect(phases[0].id).toBe('pre-deployment');

      // Check that all phases have required properties
      phases.forEach(phase => {
        expect(phase.id).toBeDefined();
        expect(phase.name).toBeDefined();
        expect(phase.description).toBeDefined();
        expect(Array.isArray(phase.tasks)).toBe(true);
        expect(Array.isArray(phase.validationChecks)).toBe(true);
        expect(phase.successCriteria).toBeDefined();
      });
    });

    test('standard phases have proper task configuration', () => {
      const phases: any = createStandardDeploymentPhases();

      phases.forEach(phase => {
        phase.tasks.forEach(task => {
          expect(task.id).toBeDefined();
          expect(task.name).toBeDefined();
          expect(task.command).toBeDefined();
          expect(Array.isArray(task.args)).toBe(true);
          expect(typeof task.timeout).toBe('number');
          expect(typeof task.retries).toBe('number');
          expect(typeof task.critical).toBe('boolean');
        });
      });
    });
  });

  describe('Deployment Logging', () => {
    test('maintains deployment log', async () => {
      const phase: DeploymentPhase = { id: 'logging-phase',,
        name: 'Logging Phase',
        description: 'Phase for testing logging',
        prerequisites: [],
        tasks: [
          {
            id: 'log-task',
            name: 'Log Task',
            command: 'echo',
            args: ['logging test'],
            timeout: 5000,
            retries: 1,
            critical: false
          }
        ],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      await deploymentManager.executePhase(phase);
      const log: any = deploymentManager.getDeploymentLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log.some(entry => entry.includes('Executing phase: Logging Phase'))).toBe(true);
      expect(log.some(entry => entry.includes('Task completed: Log Task'))).toBe(true);
    });

    test('saves deployment log to file', async () => {
      const phase: DeploymentPhase = { id: 'save-log-phase',,
        name: 'Save Log Phase',
        description: 'Phase for testing log saving',
        prerequisites: [],
        tasks: [],
        rollbackTasks: [],
        validationChecks: [],
        successCriteria: { buildSuccess: false,
          testsPass: false,
          lintingPass: false,
          configurationValid: false,
          customChecks: []
        }
      };

      await deploymentManager.executePhase(phase);

      const logPath: any = join(tempDir, 'test-deployment.log');
      deploymentManager.saveDeploymentLog(logPath);

      expect(existsSync(logPath)).toBe(true);
    });
  });
});

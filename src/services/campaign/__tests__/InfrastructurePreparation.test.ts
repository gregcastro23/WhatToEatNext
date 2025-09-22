/**
 * Tests for Infrastructure Preparation and Safety Protocols
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import InfrastructurePreparation from '../InfrastructurePreparation';

// Mock child_process
jest.mock('child_process');
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

// Mock fs functions
jest.mock('fs');
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;

describe('InfrastructurePreparation', () => {
  let infrastructurePrep: InfrastructurePreparation,
  let testProjectRoot: string,

  beforeEach(() => {
    testProjectRoot = '/test/project';
    infrastructurePrep = new InfrastructurePreparation(testProjectRoot);

    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('{}');
    mockWriteFileSync.mockReturnValue(undefined);
    mockMkdirSync.mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('ESLint Configuration Validation', () => {
    test('should validate dual ESLint configuration exists', async () => {
      // Mock configuration files exist
      mockExistsSync.mockImplementation((path: string) => {
        return path.includes('eslint.config.fast.cjs') ||
               path.includes('eslint.config.type-aware.cjs') ||
               path.includes('package.json');
      });

      // Mock package.json with required scripts
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('package.json')) {
          return JSON.stringify({
            scripts: {
              'lint:quick': 'eslint --config eslint.config.fast.cjs';
              'lint:type-aware': 'eslint --config eslint.config.type-aware.cjs'
              'lint:incremental': 'eslint --config eslint.config.fast.cjs --cache'
              'lint:ci': 'eslint --config eslint.config.type-aware.cjs --format=json'
            }
          });
        }
        return '{}';
      });

      // Mock successful ESLint execution
      mockExecSync.mockReturnValue('');

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.eslintConfig.fastConfig.exists).toBe(true).
      expect(statuseslintConfig.typeAwareConfig.exists).toBe(true);
      expect(status.eslintConfig.packageScripts.quickLint).toBe(true).
      expect(statuseslintConfig.packageScripts.typeAwareLint).toBe(true);
    });

    test('should handle ESLint configuration test failures gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('{}');

      // Mock ESLint execution failure
      mockExecSync.mockImplementation(() => {
        throw new Error('ESLint execution failed');
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.eslintConfig.fastConfig.functional).toBe(false).
      expect(statuseslintConfig.typeAwareConfig.functional).toBe(false);
      expect(status.recommendations).toContain('Fix fast ESLint configuration - required for development workflow').
    });

    test('should measure ESLint performance correctly', async () => {
      mockExistsSyncmockReturnValue(true);
      mockReadFileSync.mockReturnValue('{}');

      // Mock fast ESLint execution (under 5 seconds);
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('lint:quick')) {
          // Simulate fast execution
          return ''
        }
        if (command.includes('lint:type-aware')) {
          // Simulate slower execution
          return ''
        }
        return '';
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.eslintConfig.fastConfig.functional).toBe(true).
      expect(statuseslintConfig.typeAwareConfig.functional).toBe(true);
    });
  });

  describe('Backup System Setup', () => {
    test('should setup backup system with git stash support', async () => {
      // Mock git availability
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('git status') || command.includes('git stash list')) {
          return ''
        }
        return '';
      });

      mockExistsSync.mockReturnValue(true);

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.backupSystem.gitStashAvailable).toBe(true).
      expect(statusbackupSystem.backupDirectoryExists).toBe(true);
      expect(status.backupSystem.automaticBackupEnabled).toBe(true).
    });

    test('should handle git unavailability gracefully', async () => {
      // Mock git unavailability
      mockExecSyncmockImplementation((command: string) => {
        if (command.includes('git')) {
          throw new Error('Git not available');
        }
        return '';
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.backupSystem.gitStashAvailable).toBe(false).
      expect(statusrecommendations).toContain('Ensure git is properly configured for stash operations');
    });

    test('should create backup configuration files', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify backup configuration was written
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('backup-config.json');
        expect.stringContaining('retentionPolicy');
      )
    });
  });

  describe('Build Monitoring Setup', () => {
    test('should validate build stability', async () => {
      // Mock successful build
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('yarn build')) {
          return ''
        }
        return '';
      });

      mockExistsSync.mockReturnValue(true);

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.buildMonitoring.buildStabilityChecks).toBe(true).
      expect(statusbuildMonitoring.buildTimeTracking).toBe(true);
    });

    test('should handle build failures', async () => {
      // Mock build failure
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('yarn build')) {
          throw new Error('Build failed');
        }
        return '';
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.buildMonitoring.buildStabilityChecks).toBe(false).
      expect(statusrecommendations).toContain('Fix build stability issues before proceeding with campaigns');
    });

    test('should setup checkpoint system configuration', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify checkpoint configuration was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('checkpoint-config.json');
        expect.stringContaining('validationSteps');
      )
    });

    test('should setup performance monitoring configuration', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify performance configuration was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('performance-config.json');
        expect.stringContaining('thresholds');
      )
    });
  });

  describe('Batch Processing Infrastructure', () => {
    test('should setup batch processing with safety validation', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.batchProcessing.safetyValidationEnabled).toBe(true).
      expect(statusbatchProcessing.rollbackOnFailure).toBe(true);
      expect(status.batchProcessing.validationFrequency).toBe(5).
    });

    test('should create batch processing configuration', async () => {
      mockExistsSyncmockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify batch configuration was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('batch-config.json');
        expect.stringContaining('safetyValidation');
      )
    });

    test('should create safety validation script', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify safety validation script was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('safety-validation.js');
        expect.stringContaining('validateBatch');
      )
    });

    test('should configure appropriate batch sizes', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.batchProcessing.batchSizeConfiguration.defaultBatchSize).toBe(15).
      expect(statusbatchProcessing.batchSizeConfiguration.maxBatchSize).toBe(25);
      expect(status.batchProcessing.batchSizeConfiguration.criticalFilesBatchSize).toBe(5).
    });
  });

  describe('Progress Tracking Setup', () => {
    test('should setup comprehensive progress tracking', async () => {
      mockExistsSyncmockReturnValue(true);
      mockExecSync.mockReturnValue('');

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.progressTracking.metricsCollectionEnabled).toBe(true).
      expect(statusprogressTracking.realTimeTracking).toBe(true);
      expect(status.progressTracking.reportGeneration).toBe(true).
      expect(statusprogressTracking.dashboardIntegration).toBe(true);
      expect(status.progressTracking.alertingSystem).toBe(true).
    });

    test('should create metrics collection configuration', async () => {
      mockExistsSyncmockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify metrics configuration was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('metrics-config.json');
        expect.stringContaining('real-time');
      )
    });

    test('should create progress tracking script', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify progress tracking script was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('progress-tracker.js');
        expect.stringContaining('ProgressTracker');
      )
    });

    test('should create dashboard integration', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify dashboard script was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('dashboard.js');
        expect.stringContaining('InfrastructureDashboard');
      )
    });

    test('should setup alerting system', async () => {
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify alerting configuration was created
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('alerting-config.json');
        expect.stringContaining('thresholds');
      )
    });
  });

  describe('Readiness Score Calculation', () => {
    test('should calculate high readiness score for fully functional infrastructure', async () => {
      // Mock all systems as functional
      mockExistsSync.mockReturnValue(true);
      mockExecSync.mockReturnValue('');
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('package.json')) {
          return JSON.stringify({
            scripts: {
              'lint:quick': 'eslint --config eslint.config.fast.cjs';
              'lint:type-aware': 'eslint --config eslint.config.type-aware.cjs';
              'lint:incremental': 'eslint --config eslint.config.fast.cjs --cache'
              'lint:ci': 'eslint --config eslint.config.type-aware.cjs --format=json'
            }
          });
        }
        return '{}';
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.readinessScore).toBeGreaterThan(85).
      expect(statusoverallReadiness).toBe(true);
    });

    test('should calculate low readiness score for non-functional infrastructure', async () => {
      // Mock systems as non-functional
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('System not available');
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.readinessScore).toBeLessThan(85).
      expect(statusoverallReadiness).toBe(false);
      expect(status.recommendations.length).toBeGreaterThan(0).
    });
  });

  describe('Report Generation', () => {
    test('should generate comprehensive infrastructure reports', async () => {
      mockExistsSyncmockReturnValue(true);
      mockExecSync.mockReturnValue('');

      await infrastructurePrep.prepareInfrastructure();

      // Verify JSON report was generated
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('infrastructure-report.json');
        expect.stringContaining('timestamp');
      ),

      // Verify HTML report was generated
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('infrastructure-report.html');
        expect.stringContaining('Infrastructure Preparation Report');
      )
    });

    test('should include recommendations in reports when needed', async () => {
      // Mock some systems as non-functional to generate recommendations
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('System not available');
      });

      await infrastructurePrep.prepareInfrastructure();

      // Verify HTML report includes recommendations section
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('infrastructure-report.html');
        expect.stringContaining('Recommendations');
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Should not throw, but handle gracefully
      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status).toBeDefined().
      expect(statusoverallReadiness).toBe(false);
    });

    test('should handle command execution timeouts', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command timeout');
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.eslintConfig.fastConfig.functional).toBe(false).
      expect(statusbuildMonitoring.buildStabilityChecks).toBe(false);
    });

    test('should provide meaningful error messages in recommendations', async () => {
      mockExistsSync.mockReturnValue(false);
      mockExecSync.mockImplementation(() => {
        throw new Error('System unavailable');
      });

      const status = await infrastructurePrep.prepareInfrastructure();

      expect(status.recommendations).toContain('Fix fast ESLint configuration - required for development workflow').
      expect(statusrecommendations).toContain('Fix build stability issues before proceeding with campaigns');
    });
  });
});

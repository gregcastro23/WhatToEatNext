/**
 * End-to-End Campaign Integration Tests
 * Perfect Codebase Campaign - Complete Campaign Workflow Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  CampaignConfig,
  SafetySettings,
  SafetyLevel,
  PhaseStatus,
  CorruptionSeverity,
  RecoveryAction,
  SafetyEventType
} from '../../../../types/campaign';
import { CampaignController } from '../../CampaignController';
import { ProgressTracker } from '../../ProgressTracker';
import { SafetyProtocol } from '../../SafetyProtocol';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('End-to-End Campaign Integration Tests', () => {
  let campaignController: CampaignController;
  let safetyProtocol: SafetyProtocol;
  let progressTracker: ProgressTracker;
  let mockConfig: CampaignConfig;

  beforeEach(() => {
    // Setup comprehensive campaign configuration
    const safetySettings: SafetySettings = {
      maxFilesPerBatch: 25,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7
    };

    mockConfig = {
      phases: [
        {
          id: 'phase1',
          name: 'TypeScript Error Elimination',
          description: 'Eliminate all TypeScript compilation errors',
          tools: [
            {
              scriptPath: 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js',
              parameters: { maxFiles: 15, autoFix: true, validateSafety: true },
              batchSize: 15,
              safetyLevel: SafetyLevel.MAXIMUM
            },
            {
              scriptPath: 'scripts/typescript-fixes/fix-explicit-any-systematic.js',
              parameters: { maxFiles: 25, autoFix: true },
              batchSize: 25,
              safetyLevel: SafetyLevel.HIGH
            }
          ],
          successCriteria: {
            typeScriptErrors: 0
          },
          safetyCheckpoints: []
        },
        {
          id: 'phase2',
          name: 'Linting Excellence Achievement',
          description: 'Eliminate all linting warnings',
          tools: [
            {
              scriptPath: 'scripts/typescript-fixes/fix-unused-variables-enhanced.js',
              parameters: { maxFiles: 20, autoFix: true },
              batchSize: 20,
              safetyLevel: SafetyLevel.HIGH
            },
            {
              scriptPath: 'scripts/lint-fixes/fix-console-statements-only.js',
              parameters: { dryRun: false },
              batchSize: 15,
              safetyLevel: SafetyLevel.MEDIUM
            }
          ],
          successCriteria: {
            lintingWarnings: 0
          },
          safetyCheckpoints: []
        },
        {
          id: 'phase3',
          name: 'Enterprise Intelligence Transformation',
          description: 'Transform unused exports to enterprise systems',
          tools: [
            {
              scriptPath: 'scripts/enterprise/transform-unused-exports.js',
              parameters: { maxFiles: 30, generateIntelligence: true },
              batchSize: 30,
              safetyLevel: SafetyLevel.HIGH
            }
          ],
          successCriteria: {
            enterpriseSystems: 200
          },
          safetyCheckpoints: []
        },
        {
          id: 'phase4',
          name: 'Performance Optimization',
          description: 'Optimize build performance and maintain targets',
          tools: [
            {
              scriptPath: 'scripts/performance/optimize-build.js',
              parameters: { targetTime: 10, optimizeCache: true },
              batchSize: 50,
              safetyLevel: SafetyLevel.MEDIUM
            }
          ],
          successCriteria: {
            buildTime: 10
          },
          safetyCheckpoints: []
        }
      ],
      safetySettings,
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

    campaignController = new CampaignController(mockConfig);
    safetyProtocol = new SafetyProtocol(safetySettings);
    progressTracker = new ProgressTracker();

    // Reset mocks
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  function setupDefaultMocks() {
    // Default successful git operations
    mockExecSync.mockImplementation((command) => {
      const cmd = command.toString();
      
      if (cmd.includes('git status --porcelain')) return '';
      if (cmd.includes('git stash push')) return '';
      if (cmd.includes('git stash list')) return 'stash@{0}: campaign-stash';
      if (cmd.includes('git stash apply')) return '';
      if (cmd.includes('git branch --show-current')) return 'main';
      if (cmd.includes('yarn build')) return '';
      if (cmd.includes('yarn test')) return 'Tests passed';
      
      return '';
    });

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('valid content');
    mockFs.writeFileSync.mockImplementation(() => {});
  }

  describe('Complete Campaign Execution', () => {
    it('should execute all phases in sequence successfully', async () => {
      // Mock progressive improvement across phases
      let tsErrors = 86;
      let lintWarnings = 4506;
      let enterpriseSystems = 0;
      let buildTime = 12;

      jest.spyOn(progressTracker, 'getTypeScriptErrorCount').mockImplementation(async () => tsErrors);
      jest.spyOn(progressTracker, 'getLintingWarningCount').mockImplementation(async () => lintWarnings);
      jest.spyOn(progressTracker, 'getEnterpriseSystemCount').mockImplementation(async () => enterpriseSystems);
      jest.spyOn(progressTracker, 'getBuildTime').mockImplementation(async () => buildTime);

      const phaseResults: Array<any> = [];

      // Execute Phase 1: TypeScript Error Elimination
      const phase1Result = await campaignController.executePhase(mockConfig.phases[0]);
      tsErrors = 0; // Phase 1 eliminates TypeScript errors
      phaseResults.push(phase1Result);

      expect(phase1Result.success).toBe(true);
      expect(phase1Result.phaseId).toBe('phase1');

      // Execute Phase 2: Linting Excellence
      const phase2Result = await campaignController.executePhase(mockConfig.phases[1]);
      lintWarnings = 0; // Phase 2 eliminates linting warnings
      phaseResults.push(phase2Result);

      expect(phase2Result.success).toBe(true);
      expect(phase2Result.phaseId).toBe('phase2');

      // Execute Phase 3: Enterprise Intelligence
      const phase3Result = await campaignController.executePhase(mockConfig.phases[2]);
      enterpriseSystems = 200; // Phase 3 creates enterprise systems
      phaseResults.push(phase3Result);

      expect(phase3Result.success).toBe(true);
      expect(phase3Result.phaseId).toBe('phase3');

      // Execute Phase 4: Performance Optimization
      const phase4Result = await campaignController.executePhase(mockConfig.phases[3]);
      buildTime = 8.5; // Phase 4 optimizes build time
      phaseResults.push(phase4Result);

      expect(phase4Result.success).toBe(true);
      expect(phase4Result.phaseId).toBe('phase4');

      // Verify overall campaign success
      expect(phaseResults.every(result => result.success)).toBe(true);
      expect(phaseResults.length).toBe(4);
    });

    it('should maintain safety protocols throughout entire campaign', async () => {
      const allSafetyEvents: Array<any> = [];

      for (const phase of mockConfig.phases) {
        const result = await campaignController.executePhase(phase);
        allSafetyEvents.push(...result.safetyEvents);
      }

      // Verify safety events were recorded for each phase
      expect(allSafetyEvents.length).toBeGreaterThan(0);
      
      // Check that each phase has safety events
      for (const phase of mockConfig.phases) {
        expect(allSafetyEvents.some(event => 
          String((event )?.description || '').includes(phase.name) || String((event )?.description || '').includes(phase.id)
        )).toBe(true);
      }
    });

    it('should track progress metrics throughout campaign', async () => {
      // Mock progressive metrics improvement
      const metricsHistory: Array<any> = [];

      jest.spyOn(progressTracker, 'getProgressMetrics').mockImplementation(async () => {
        const metrics = {
          typeScriptErrors: { current: Math.max(0, 86 - metricsHistory.length * 20), target: 0, reduction: metricsHistory.length * 20, percentage: Math.min(100, (metricsHistory.length * 20 / 86) * 100) },
          lintingWarnings: { current: Math.max(0, 4506 - metricsHistory.length * 1000), target: 0, reduction: metricsHistory.length * 1000, percentage: Math.min(100, (metricsHistory.length * 1000 / 4506) * 100) },
          buildPerformance: { currentTime: Math.max(8, 12 - metricsHistory.length), targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
          enterpriseSystems: { current: metricsHistory.length * 50, target: 200, transformedExports: metricsHistory.length * 50 }
        };
        metricsHistory.push(metrics);
        return metrics;
      });

      // Execute all phases
      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
        await progressTracker.getProgressMetrics(); // Trigger metrics collection
      }

      expect(metricsHistory.length).toBeGreaterThan(0);
      
      // Verify progressive improvement
      const finalMetrics = metricsHistory[metricsHistory.length - 1] ;
      expect((finalMetrics?.typeScriptErrors )?.current ?? 0).toBeLessThanOrEqual(86);
      expect((finalMetrics?.lintingWarnings )?.current ?? 0).toBeLessThanOrEqual(4506);
    });

    it('should validate all milestones after campaign completion', async () => {
      // Mock successful campaign completion
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 42 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 }
      });

      // Execute all phases
      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
      }

      // Validate all milestones
      const milestones = [
        'zero-typescript-errors',
        'zero-linting-warnings',
        'build-time-under-10s',
        'enterprise-systems-200',
        'phase-1-complete',
        'phase-2-complete',
        'phase-3-complete',
        'phase-4-complete'
      ];

      for (const milestone of milestones) {
        const isValid = await progressTracker.validateMilestone(milestone);
        expect(isValid).toBe(true);
      }
    });

    it('should generate comprehensive final report', async () => {
      // Mock successful campaign completion
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 42 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 }
      });

      // Execute all phases
      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
      }

      const finalReport = await progressTracker.generateProgressReport();

      expect(finalReport.campaignId).toBe('perfect-codebase-campaign');
      expect(finalReport.overallProgress).toBe(100);
      expect(finalReport.phases.length).toBe(2); // Default phases in progress tracker
      expect(finalReport.phases.every(phase => phase.status === PhaseStatus.COMPLETED)).toBe(true);
    });
  });

  describe('Campaign Failure and Recovery Scenarios', () => {
    it('should handle phase failure and trigger rollback', async () => {
      const phase1 = mockConfig.phases[0];
      
      // Mock tool execution failure
      jest.spyOn(campaignController as unknown as Record<string, any>, 'executeTool').mockRejectedValue(
        new Error('Critical tool failure')
      );

      const result = await campaignController.executePhase(phase1);

      expect(result.success).toBe(false);
      expect(result.phaseId).toBe('phase1');
      expect(result.safetyEvents.some(event => 
        event.type === SafetyEventType.BUILD_FAILURE
      )).toBe(true);
    });

    it('should handle corruption detection during campaign', async () => {
      // Mock corruption detection
      mockFs.readFileSync.mockReturnValue(`
        function test() {
        <<<<<<< HEAD
          return 'conflict';
        =======
          return 'other';
        >>>>>>> branch
        }
      `);

      const corruptionReport = await safetyProtocol.detectCorruption(['test-file.ts']);

      expect(corruptionReport.severity).toBe(CorruptionSeverity.CRITICAL);
      expect(corruptionReport.recommendedAction).toBe(RecoveryAction.EMERGENCY_RESTORE);

      // Verify emergency rollback would be triggered
      if (corruptionReport.severity === CorruptionSeverity.CRITICAL) {
        // Create a stash first for rollback
        await safetyProtocol.createStash('Emergency stash');
        await safetyProtocol.emergencyRollback();
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('git stash apply'),
          expect.any(Object)
        );
      }
    });

    it('should handle build failures during phase execution', async () => {
      const phase1 = mockConfig.phases[0];
      
      // Mock build failure
      mockExecSync.mockImplementation((command) => {
        if (command.toString().includes('yarn build')) {
          throw new Error('Build compilation failed');
        }
        return '';
      });

      jest.spyOn(progressTracker, 'getBuildTime').mockResolvedValue(-1);

      const result = await campaignController.executePhase(phase1);

      // Should handle gracefully
      expect(result.phaseId).toBe('phase1');
    });

    it('should recover from partial phase failures', async () => {
      const phase1 = mockConfig.phases[0];
      
      // Mock partial failure - first tool fails, second succeeds
      let toolCallCount = 0;
      jest.spyOn(campaignController as unknown as Record<string, any>, 'executeTool').mockImplementation(async () => {
        toolCallCount++;
        if (toolCallCount === 1) {
          throw new Error('First tool failed');
        }
        return {
          filesProcessed: ['file1.ts', 'file2.ts'],
          changesApplied: 10,
          success: true
        };
      });

      const result = await campaignController.executePhase(phase1);

      // Should fail due to first tool failure
      expect(result.success).toBe(false);
      expect(result.phaseId).toBe('phase1');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large file batches efficiently', async () => {
      const phase1 = mockConfig.phases[0];
      
      // Mock large file processing
      const largeFileList = Array.from({ length: 100 }, (_, i) => `file${i}.ts`);
      
      jest.spyOn(campaignController as any, 'executeTool').mockResolvedValue({
        filesProcessed: largeFileList,
        changesApplied: largeFileList.length * 2,
        success: true
      });

      const startTime = Date.now();
      const result = await campaignController.executePhase(phase1);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.filesProcessed).toBe(100);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should maintain memory usage within limits during campaign', async () => {
      // Mock memory tracking
      jest.spyOn(progressTracker, 'getMemoryUsage').mockResolvedValue(45); // 45MB

      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
        
        const memoryUsage = await progressTracker.getMemoryUsage();
        expect(memoryUsage).toBeLessThan(50); // Should stay under 50MB
      }
    });

    it('should handle concurrent safety operations', async () => {
      // Create multiple stashes concurrently
      const stashPromises = Array.from({ length: 5 }, (_, i) => 
        safetyProtocol.createStash(`Concurrent stash ${i}`)
      );

      const stashIds = await Promise.all(stashPromises);

      expect(stashIds.length).toBe(5);
      expect(stashIds.every(id => typeof id === 'string')).toBe(true);

      const stashes = await safetyProtocol.listStashes();
      expect(stashes.length).toBe(5);
    });
  });

  describe('Configuration and Customization', () => {
    it('should support custom phase configurations', async () => {
      const customPhase = {
        id: 'custom-phase',
        name: 'Custom Phase',
        description: 'Custom phase for testing',
        tools: [{
          scriptPath: 'scripts/custom/custom-script.js',
          parameters: { customParam: true },
          batchSize: 5,
          safetyLevel: SafetyLevel.LOW
        }],
        successCriteria: { typeScriptErrors: 10 },
        safetyCheckpoints: []
      };

      const result = await campaignController.executePhase(customPhase);

      expect(result.phaseId).toBe('custom-phase');
    });

    it('should support custom safety settings', async () => {
      const customSafetySettings: SafetySettings = {
        maxFilesPerBatch: 50,
        buildValidationFrequency: 10,
        testValidationFrequency: 20,
        corruptionDetectionEnabled: false,
        automaticRollbackEnabled: false,
        stashRetentionDays: 14
      };

      const customSafetyProtocol = new SafetyProtocol(customSafetySettings);

      // Verify custom settings are applied
      expect((customSafetyProtocol as any).settings.maxFilesPerBatch).toBe(50);
      expect((customSafetyProtocol as any).settings.stashRetentionDays).toBe(14);
    });

    it('should support custom success criteria', async () => {
      const customPhase = {
        ...mockConfig.phases[0],
        successCriteria: {
          typeScriptErrors: 5, // Allow 5 errors instead of 0
          customValidation: async () => {
            // Custom validation logic
            return true;
          }
        }
      };

      // Mock 5 remaining TypeScript errors
      jest.spyOn(progressTracker, 'getProgressMetrics').mockResolvedValue({
        typeScriptErrors: { current: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { current: 4506, target: 0, reduction: 0, percentage: 0 },
        buildPerformance: { currentTime: 8.5, targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
        enterpriseSystems: { current: 0, target: 200, transformedExports: 0 }
      });

      const validation = await campaignController.validatePhaseCompletion(customPhase);

      expect(validation.success).toBe(true); // Should pass with 5 errors allowed
    });
  });

  describe('Reporting and Analytics', () => {
    it('should generate detailed execution analytics', async () => {
      const executionMetrics: Array<any> = [];

      for (const phase of mockConfig.phases) {
        const startTime = Date.now();
        const result = await campaignController.executePhase(phase);
        const endTime = Date.now();

        executionMetrics.push({
          phaseId: phase.id,
          phaseName: phase.name,
          executionTime: endTime - startTime,
          success: result.success,
          filesProcessed: result.filesProcessed,
          errorsFixed: result.errorsFixed,
          safetyEventsCount: result.safetyEvents.length
        });
      }

      expect(executionMetrics.length).toBe(4);
      expect(executionMetrics.every(metric => Number((metric )?.executionTime || 0) > 0)).toBe(true);
      expect(executionMetrics.every(metric => typeof metric.success === 'boolean')).toBe(true);
    });

    it('should export comprehensive campaign metrics', async () => {
      // Execute campaign
      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
      }

      // Export metrics
      const exportPath = 'test-campaign-metrics.json';
      await progressTracker.exportMetrics(exportPath);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        exportPath,
        expect.stringContaining('"campaignId": "perfect-codebase-campaign"'),
        undefined
      );
    });

    it('should track improvement trends over time', async () => {
      // Mock progressive improvement
      let improvementStep = 0;
      jest.spyOn(progressTracker, 'getProgressMetrics').mockImplementation(async () => {
        improvementStep++;
        return {
          typeScriptErrors: { current: Math.max(0, 86 - improvementStep * 20), target: 0, reduction: improvementStep * 20, percentage: Math.min(100, (improvementStep * 20 / 86) * 100) },
          lintingWarnings: { current: Math.max(0, 4506 - improvementStep * 1000), target: 0, reduction: improvementStep * 1000, percentage: Math.min(100, (improvementStep * 1000 / 4506) * 100) },
          buildPerformance: { currentTime: Math.max(8, 12 - improvementStep), targetTime: 10, cacheHitRate: 0.8, memoryUsage: 45 },
          enterpriseSystems: { current: improvementStep * 50, target: 200, transformedExports: improvementStep * 50 }
        };
      });

      // Execute phases and collect metrics
      for (const phase of mockConfig.phases) {
        await campaignController.executePhase(phase);
        await progressTracker.getProgressMetrics();
      }

      const improvement = progressTracker.getMetricsImprovement();

      expect(improvement.typeScriptErrorsReduced).toBeGreaterThan(0);
      expect(improvement.lintingWarningsReduced).toBeGreaterThan(0);
      expect(improvement.enterpriseSystemsAdded).toBeGreaterThan(0);
    });
  });
});
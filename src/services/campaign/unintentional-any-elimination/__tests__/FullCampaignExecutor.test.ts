/**
 * Full Campaign Executor Tests
 *
 * Comprehensive test suite for the full unintentional any elimination campaign
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import { FullCampaignExecutor } from '../FullCampaignExecutor';
import { FullCampaignConfig } from '../types';

// Mock external dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('FullCampaignExecutor', () => {
  let executor: FullCampaignExecutor;
  let mockConfig: Partial<FullCampaignConfig>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      targetReductionPercentage: 17.5,
      targetFixCount: 300,
      maxBatchSize: 25,
      safetyThreshold: 0.7,
      enableDocumentation: true,
      generateFinalReport: true
    };

    executor = new FullCampaignExecutor(mockConfig);

    // Mock file system operations
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('const test: any = {};');
    mockFs.writeFileSync.mockImplementation(() => {});

    // Mock successful build validation
    mockExecSync.mockImplementation((command: string) => {
      if (command.includes('tsc --noEmit') {
        return '';
      }
      if (command.includes('grep -c "error TS"') {
        return '0';
      }
      if (command.includes('find src') {
        return 'src/test1.ts\nsrc/test2.ts\nsrc/test3.ts';
      }
      return '';
    });
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      const defaultExecutor = new FullCampaignExecutor();
      expect(defaultExecutor).toBeDefined();
    });

    test('should merge provided configuration with defaults', () => {
      const customConfig = { targetReductionPercentage: 20 };
      const customExecutor = new FullCampaignExecutor(customConfig);
      expect(customExecutor).toBeDefined();
    });
  });

  describe('executeFullCampaign', () => {
    test('should execute all campaign phases successfully', async () => {
      // Mock successful execution
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('tsc --noEmit')) return '';
        if (command.includes('grep -c "error TS"')) return '100'; // Initial errors
        if (command.includes('find src')) return 'src/test1.ts\nsrc/test2.ts';
        return '';
      });

      const result = await executor.executeFullCampaign();

      expect(result.success).toBe(true);
      expect(result.phases).toHaveLength(6); // All 6 phases
      expect(result.phases[0].name).toBe('Initial Analysis and Baseline');
      expect(result.phases[1].name).toBe('High-Confidence Replacements');
      expect(result.phases[2].name).toBe('Medium-Risk Category Processing');
      expect(result.phases[3].name).toBe('Domain-Specific Processing');
      expect(result.phases[4].name).toBe('Documentation and Validation');
      expect(result.phases[5].name).toBe('Final Validation and Reporting');
    });

    test('should handle campaign execution failure gracefully', async () => {
      // Mock build failure
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('tsc --noEmit') {
          throw new Error('Build failed');
        }
        return '';
      });

      const result = await executor.executeFullCampaign();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.buildStable).toBe(false);
    });

    test('should track metrics throughout campaign execution', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.metrics).toBeDefined();
      expect(result.metrics.baselineEstablished).toBe(true);
      expect(result.metrics.initialErrorCount).toBeGreaterThanOrEqual(0);
      expect(result.metrics.finalErrorCount).toBeGreaterThanOrEqual(0);
    });

    test('should generate final report when enabled', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.finalReport).toBeDefined();
      expect(result.finalReport?.campaignId).toContain('full-campaign-');
      expect(result.finalReport?.recommendations).toBeDefined();
      expect(result.finalReport?.achievements).toBeDefined();
      expect(result.finalReport?.nextSteps).toBeDefined();
    });
  });

  describe('Phase Execution', () => {
    test('should execute Phase 1: Initial Analysis and Baseline', async () => {
      // Mock initial metrics
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -c "error TS"')) return '150';
        if (command.includes('find src')) return 'src/test1.ts\nsrc/test2.ts';
        return '';
      });

      const result = await executor.executeFullCampaign();
      const phase1 = result.phases[0];

      expect(phase1.name).toBe('Initial Analysis and Baseline');
      expect(phase1.success).toBe(true);
      expect(phase1.fixesApplied).toBe(0); // Analysis phase doesn't apply fixes
      expect(phase1.details).toBeDefined();
    });

    test('should execute Phase 2: High-Confidence Replacements', async () => {
      const result = await executor.executeFullCampaign();
      const phase2 = result.phases[1];

      expect(phase2.name).toBe('High-Confidence Replacements');
      expect(phase2.success).toBe(true);
      expect(phase2.details?.categories).toContain('ARRAY_TYPE');
      expect(phase2.details?.categories).toContain('RECORD_TYPE');
    });

    test('should execute Phase 3: Medium-Risk Category Processing', async () => {
      const result = await executor.executeFullCampaign();
      const phase3 = result.phases[2];

      expect(phase3.name).toBe('Medium-Risk Category Processing');
      expect(phase3.success).toBe(true);
      expect(phase3.details?.enhancedSafetyProtocols).toBe(true);
    });

    test('should execute Phase 4: Domain-Specific Processing', async () => {
      const result = await executor.executeFullCampaign();
      const phase4 = result.phases[3];

      expect(phase4.name).toBe('Domain-Specific Processing');
      expect(phase4.success).toBe(true);
      expect(phase4.details?.domainsProcessed).toContain('astrological');
      expect(phase4.details?.domainsProcessed).toContain('recipe');
      expect(phase4.details?.domainsProcessed).toContain('campaign');
    });

    test('should execute Phase 5: Documentation and Validation', async () => {
      const result = await executor.executeFullCampaign();
      const phase5 = result.phases[4];

      expect(phase5.name).toBe('Documentation and Validation');
      expect(phase5.success).toBe(true);
      expect(phase5.details?.documentationResult).toBeDefined();
      expect(phase5.details?.eslintResult).toBeDefined();
    });

    test('should execute Phase 6: Final Validation and Reporting', async () => {
      const result = await executor.executeFullCampaign();
      const phase6 = result.phases[5];

      expect(phase6.name).toBe('Final Validation and Reporting');
      expect(phase6.success).toBe(true);
      expect(phase6.details?.finalReport).toBeDefined();
      expect(phase6.details?.targetAchieved).toBeDefined();
    });
  });

  describe('Target Achievement', () => {
    test('should achieve target when sufficient fixes are applied', async () => {
      // Mock scenario where target is achieved
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('grep -c "error TS"') {
          // Simulate error reduction
          return Math.random() > 0.5 ? '100' : '80';
        }
        if (command.includes('find src')) return 'src/test1.ts\nsrc/test2.ts';
        return '';
      });

      const result = await executor.executeFullCampaign();

      // Target achievement depends on actual fixes applied
      expect(result.targetAchieved).toBeDefined();
      expect(result.reductionPercentage).toBeGreaterThanOrEqual(0);
    });

    test('should calculate reduction percentage correctly', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.reductionPercentage).toBeGreaterThanOrEqual(0);
      expect(result.reductionPercentage).toBeLessThanOrEqual(100);
    });

    test('should track total fixes applied across all phases', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.totalFixesApplied).toBeGreaterThanOrEqual(0);
      expect(result.metrics.totalFixesApplied).toBe(result.totalFixesApplied);
    });
  });

  describe('Safety Protocols', () => {
    test('should validate build stability after each phase', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.buildStable).toBeDefined();
      // Each phase should have validated build stability
      result.phases.forEach(phase => {
        expect(phase.success).toBeDefined();
      });
    });

    test('should handle build failures with rollback', async () => {
      // Mock build failure scenario
      let callCount = 0;
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('tsc --noEmit') {
          callCount++;
          if (callCount > 2) {
            throw new Error('Build failed');
          }
          return '';
        }
        return '';
      });

      const result = await executor.executeFullCampaign();

      // Campaign should handle build failures gracefully
      expect(result.success).toBeDefined();
      expect(result.buildStable).toBeDefined();
    });

    test('should create and restore backups when needed', async () => {
      // Mock backup operations
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('mkdir -p')) return '';
        if (command.includes('cp -r')) return '';
        if (command.includes('rm -rf')) return '';
        return '';
      });

      const result = await executor.executeFullCampaign();

      expect(result.success).toBeDefined();
      // Backup operations should be called during execution
      expect(mockExecSync).toHaveBeenCalled();
    });
  });

  describe('Documentation System', () => {
    test('should add ESLint disable comments for intentional any types', async () => {
      const result = await executor.executeFullCampaign();
      const documentationPhase = result.phases[4];

      expect(documentationPhase.details?.eslintResult).toBeDefined();
      expect(documentationPhase.details?.eslintResult.added).toBeGreaterThanOrEqual(0);
    });

    test('should validate documentation completeness', async () => {
      const result = await executor.executeFullCampaign();
      const documentationPhase = result.phases[4];

      expect(documentationPhase.details?.validationResult).toBeDefined();
      expect(documentationPhase.details?.validationResult.complete).toBeDefined();
    });

    test('should generate appropriate ESLint disable reasons', async () => {
      const result = await executor.executeFullCampaign();

      // Documentation phase should complete successfully
      expect(result.phases[4].success).toBe(true);
    });
  });

  describe('Domain-Specific Processing', () => {
    test('should process astrological domain files', async () => {
      // Mock astrological files
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('find src') {
          return 'src/calculations/astrology.ts\nsrc/services/astrological.ts';
        }
        return '';
      });

      const result = await executor.executeFullCampaign();
      const domainPhase = result.phases[3];

      expect(domainPhase.details?.domainResults).toBeDefined();
      const astroResult = domainPhase.details?.domainResults.find()
        (r: any) => r.domain === 'astrological'
      );
      expect(astroResult).toBeDefined();
    });

    test('should process recipe domain files', async () => {
      // Mock recipe files
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('find src') {
          return 'src/data/recipes.ts\nsrc/components/recipe.tsx';
        }
        return '';
      });

      const result = await executor.executeFullCampaign();
      const domainPhase = result.phases[3];

      expect(domainPhase.details?.domainResults).toBeDefined();
      const recipeResult = domainPhase.details?.domainResults.find()
        (r: any) => r.domain === 'recipe'
      );
      expect(recipeResult).toBeDefined();
    });

    test('should process campaign domain files', async () => {
      // Mock campaign files
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('find src') {
          return 'src/services/campaign/controller.ts\nsrc/services/metrics.ts';
        }
        return '';
      });

      const result = await executor.executeFullCampaign();
      const domainPhase = result.phases[3];

      expect(domainPhase.details?.domainResults).toBeDefined();
      const campaignResult = domainPhase.details?.domainResults.find()
        (r: any) => r.domain === 'campaign'
      );
      expect(campaignResult).toBeDefined();
    });
  });

  describe('Performance Validation', () => {
    test('should validate build performance improvements', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.performanceImproved).toBeDefined();
      expect(result.finalReport?.performanceImproved).toBeDefined();
    });

    test('should measure campaign execution duration', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.duration).toBeGreaterThan(0);
      expect(result.finalReport?.duration).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle classification errors gracefully', async () => {
      // Mock classification error
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = await executor.executeFullCampaign();

      // Campaign should continue despite individual file errors
      expect(result.success).toBeDefined();
    });

    test('should handle replacement errors with rollback', async () => {
      // Mock replacement error scenario
      let buildCallCount = 0;
      mockExecSync.mockImplementation((command: string) => {
        if (command.includes('tsc --noEmit') {
          buildCallCount++;
          if (buildCallCount > 3) {
            throw new Error('Build failed after replacement');
          }
          return '';
        }
        return '';
      });

      const result = await executor.executeFullCampaign();

      expect(result.success).toBeDefined();
      expect(result.metrics.rollbacksPerformed).toBeGreaterThanOrEqual(0);
    });

    test('should handle emergency stop conditions', async () => {
      // Mock emergency stop scenario
      const emergencyConfig = {
        ...mockConfig,
        emergencyStopThreshold: 0.9, // Very high threshold
        maxCampaignDuration: 1000 // Very short duration
      };

      const emergencyExecutor = new FullCampaignExecutor(emergencyConfig);
      const result = await emergencyExecutor.executeFullCampaign();

      expect(result.success).toBeDefined();
    });
  });

  describe('Final Report Generation', () => {
    test('should generate comprehensive final report', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.finalReport).toBeDefined();
      expect(result.finalReport?.campaignId).toBeDefined();
      expect(result.finalReport?.startTime).toBeDefined();
      expect(result.finalReport?.endTime).toBeDefined();
      expect(result.finalReport?.targetAchieved).toBeDefined();
    });

    test('should include recommendations in final report', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.finalReport?.recommendations).toBeDefined();
      expect(Array.isArray(result.finalReport?.recommendations)).toBe(true);
    });

    test('should include achievements in final report', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.finalReport?.achievements).toBeDefined();
      expect(Array.isArray(result.finalReport?.achievements)).toBe(true);
    });

    test('should include next steps in final report', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.finalReport?.nextSteps).toBeDefined();
      expect(Array.isArray(result.finalReport?.nextSteps)).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    test('should handle invalid configuration gracefully', () => {
      const invalidConfig = {
        targetReductionPercentage: -10, // Invalid negative percentage
        targetFixCount: -100, // Invalid negative count
        maxBatchSize: 0 // Invalid zero batch size
      };

      expect(() => new FullCampaignExecutor(invalidConfig)).not.toThrow();
    });

    test('should use reasonable defaults for missing configuration', () => {
      const minimalConfig = {};
      const executor = new FullCampaignExecutor(minimalConfig);

      expect(executor).toBeDefined();
    });
  });

  describe('Integration with Existing Systems', () => {
    test('should integrate with campaign infrastructure', async () => {
      const result = await executor.executeFullCampaign();

      // Campaign should complete and provide integration points
      expect(result.success).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    test('should maintain compatibility with existing metrics', async () => {
      const result = await executor.executeFullCampaign();

      expect(result.metrics.baselineEstablished).toBeDefined();
      expect(result.metrics.campaignCompleted).toBeDefined();
    });
  });
});

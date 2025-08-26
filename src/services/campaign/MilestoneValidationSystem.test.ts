/**
 * Milestone Validation System Tests
 * Perfect Codebase Campaign - Comprehensive Testing
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

import { MetricsCollectionSystem } from './MetricsCollectionSystem';
import { MilestoneValidationSystem, MilestoneValidation, PhaseValidationResult } from './MilestoneValidationSystem';

// Mock dependencies
jest.mock('./MetricsCollectionSystem');
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const mockFs = fs as jest.Mocked<typeof fs>;
const MockMetricsCollectionSystem = MetricsCollectionSystem as jest.MockedClass<typeof MetricsCollectionSystem>;

describe('MilestoneValidationSystem', () => {
  let validationSystem: MilestoneValidationSystem;
  let mockMetricsCollector: jest.Mocked<MetricsCollectionSystem>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock metrics collector
    mockMetricsCollector = new MockMetricsCollectionSystem() as jest.Mocked<MetricsCollectionSystem>;

    validationSystem = new MilestoneValidationSystem();
    // Replace the internal metrics collector with our mock
    (validationSystem as any).metricsCollector = mockMetricsCollector;
  });

  describe('Phase 1 Validation - TypeScript Error Elimination', () => {
    test('should validate successful Phase 1 completion', async () => {
      // Mock perfect metrics
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: {
          current: 0,
          target: 0,
          reduction: 86,
          percentage: 100,
        },
        lintingWarnings: {
          current: 0,
          target: 0,
          reduction: 4506,
          percentage: 100,
        },
        buildPerformance: {
          currentTime: 8,
          targetTime: 10,
          cacheHitRate: 0.85,
          memoryUsage: 45,
        },
        enterpriseSystems: {
          current: 200,
          target: 200,
          transformedExports: 200,
        },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: {
          errorReductionRate: 10,
          warningReductionRate: 50,
          buildTimeImprovement: 2,
          systemGrowthRate: 5,
        },
      });

      // Mock successful build
      mockExecSync.mockReturnValue('');

      const result = await validationSystem.validatePhase1();

      expect(result.phaseId).toBe('phase1');
      expect(result.phaseName).toBe('TypeScript Error Elimination');
      expect(result.overallSuccess).toBe(true);
      expect(result.completionPercentage).toBe(100);
      expect(result.criticalFailures).toHaveLength(0);
      expect(result.nextSteps).toContain('Phase 1 complete - proceed to Phase 2: Linting Excellence');
    });

    test('should validate failed Phase 1 with remaining errors', async () => {
      // Mock metrics with remaining errors
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: {
          current: 5,
          target: 0,
          reduction: 81,
          percentage: 94,
        },
        lintingWarnings: {
          current: 0,
          target: 0,
          reduction: 4506,
          percentage: 100,
        },
        buildPerformance: {
          currentTime: 8,
          targetTime: 10,
          cacheHitRate: 0.85,
          memoryUsage: 45,
        },
        enterpriseSystems: {
          current: 200,
          target: 200,
          transformedExports: 200,
        },
        errorBreakdown: {
          TS2352: 3,
          TS2345: 2,
        },
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: {
          errorReductionRate: 10,
          warningReductionRate: 50,
          buildTimeImprovement: 2,
          systemGrowthRate: 5,
        },
      });

      // Mock successful build
      mockExecSync.mockReturnValue('');

      const result = await validationSystem.validatePhase1();

      expect(result.overallSuccess).toBe(false);
      expect(result.completionPercentage).toBeLessThan(100);
      expect(result.criticalFailures.length).toBeGreaterThan(0);
      expect(result.nextSteps).toContain('Continue with Enhanced TypeScript Error Fixer v3.0');
    });

    test('should handle build failures in Phase 1', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      // Mock build failure
      mockExecSync.mockImplementation(() => {
        throw new Error('Build failed');
      });

      const result = await validationSystem.validatePhase1();

      expect(result.overallSuccess).toBe(false);
      expect(result.criticalFailures.some(f => f.includes('Build Stability'))).toBe(true);
    });
  });

  describe('Phase 2 Validation - Linting Excellence', () => {
    test('should validate successful Phase 2 completion', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      const result = await validationSystem.validatePhase2();

      expect(result.phaseId).toBe('phase2');
      expect(result.phaseName).toBe('Linting Excellence Achievement');
      expect(result.overallSuccess).toBe(true);
      expect(result.nextSteps).toContain(
        'Phase 2 complete - proceed to Phase 3: Enterprise Intelligence Transformation',
      );
    });

    test('should validate failed Phase 2 with remaining warnings', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 100, target: 0, reduction: 4406, percentage: 98 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
        errorBreakdown: {},
        warningBreakdown: {
          '@typescript-eslint/no-explicit-any': 50,
          'no-unused-vars': 30,
          'no-console': 20,
        },
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      const result = await validationSystem.validatePhase2();

      expect(result.overallSuccess).toBe(false);
      expect(result.criticalFailures.length).toBeGreaterThan(0);
      expect(result.nextSteps).toContain('Continue with systematic linting fixes');
    });
  });

  describe('Phase 3 Validation - Enterprise Intelligence Transformation', () => {
    test('should validate successful Phase 3 completion', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      // Mock no unused exports
      mockExecSync
        .mockReturnValueOnce('0') // No unused exports
        .mockReturnValueOnce('75') // Analytics count
        .mockReturnValueOnce('75') // Recommendations count
        .mockReturnValueOnce('75'); // Demonstrations count

      const result = await validationSystem.validatePhase3();

      expect(result.phaseId).toBe('phase3');
      expect(result.overallSuccess).toBe(true);
      expect(result.nextSteps).toContain('Phase 3 complete - proceed to Phase 4: Performance Optimization');
    });

    test('should validate failed Phase 3 with insufficient enterprise systems', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 150, target: 200, transformedExports: 150 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('0');

      const result = await validationSystem.validatePhase3();

      expect(result.overallSuccess).toBe(false);
      expect(result.nextSteps).toContain('Continue transforming exports to reach 200+ systems');
    });
  });

  describe('Phase 4 Validation - Performance Optimization', () => {
    test('should validate successful Phase 4 completion', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      const result = await validationSystem.validatePhase4();

      expect(result.phaseId).toBe('phase4');
      expect(result.overallSuccess).toBe(true);
      expect(result.nextSteps).toContain('Perfect Codebase Campaign Complete! 🎉');
    });

    test('should validate failed Phase 4 with poor performance', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 15, targetTime: 10, cacheHitRate: 0.6, memoryUsage: 75 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 15,
          bundleSize: 600,
          cacheHitRate: 0.6,
          memoryUsage: 75,
          cpuUsage: 85,
          diskUsage: 2048,
          compilationSpeed: 10,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 6144, free: 2048, percentage: 75 },
          diskSpace: { total: 1000000, used: 800000, free: 200000, percentage: 80 },
        },
        trendData: { errorReductionRate: 5, warningReductionRate: 25, buildTimeImprovement: -1, systemGrowthRate: 2 },
      });

      const result = await validationSystem.validatePhase4();

      expect(result.overallSuccess).toBe(false);
      expect(result.criticalFailures.length).toBeGreaterThan(0);
      expect(result.nextSteps).toContain('Optimize build performance with caching and bundling improvements');
    });
  });

  describe('Comprehensive Validation', () => {
    test('should validate all phases successfully', async () => {
      // Mock perfect metrics for all phases
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('0');

      const results = await validationSystem.validateAllPhases();

      expect(results).toHaveLength(4);
      expect(results.every(r => r.overallSuccess)).toBe(true);
    });

    test('should handle mixed phase results', async () => {
      // Mock metrics that pass some phases but not others
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 50, target: 0, reduction: 4456, percentage: 99 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 150, target: 200, transformedExports: 150 },
        errorBreakdown: {},
        warningBreakdown: { 'no-console': 50 },
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('0');

      const results = await validationSystem.validateAllPhases();

      expect(results[0].overallSuccess).toBe(true); // Phase 1 should pass
      expect(results[1].overallSuccess).toBe(false); // Phase 2 should fail
      expect(results[2].overallSuccess).toBe(false); // Phase 3 should fail
    });
  });

  describe('Export Functionality', () => {
    test('should export validation results to file', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('0');
      mockFs.writeFileSync.mockImplementation();

      await validationSystem.exportValidationResults('test-validation.json');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test-validation.json',
        expect.stringContaining('"campaignId": "perfect-codebase-campaign"'),
      );
    });
  });

  describe('Helper Methods', () => {
    test('should calculate completion percentage correctly', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 5, target: 0, reduction: 81, percentage: 94 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 200, target: 200, transformedExports: 200 },
        errorBreakdown: { TS2352: 5 },
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('');

      const result = await validationSystem.validatePhase1();

      expect(result.completionPercentage).toBeGreaterThan(0);
      expect(result.completionPercentage).toBeLessThan(100);
    });

    test('should generate appropriate next steps', async () => {
      mockMetricsCollector.collectDetailedMetrics.mockResolvedValue({
        timestamp: new Date(),
        typeScriptErrors: { current: 0, target: 0, reduction: 86, percentage: 100 },
        lintingWarnings: { current: 0, target: 0, reduction: 4506, percentage: 100 },
        buildPerformance: { currentTime: 8, targetTime: 10, cacheHitRate: 0.85, memoryUsage: 45 },
        enterpriseSystems: { current: 250, target: 200, transformedExports: 250 },
        errorBreakdown: {},
        warningBreakdown: {},
        buildMetrics: {
          buildTime: 8,
          bundleSize: 420,
          cacheHitRate: 0.85,
          memoryUsage: 45,
          cpuUsage: 15,
          diskUsage: 1024,
          compilationSpeed: 25,
        },
        resourceMetrics: {
          nodeMemoryUsage: process.memoryUsage(),
          systemMemory: { total: 8192, used: 4096, free: 4096, percentage: 50 },
          diskSpace: { total: 1000000, used: 500000, free: 500000, percentage: 50 },
        },
        trendData: { errorReductionRate: 10, warningReductionRate: 50, buildTimeImprovement: 2, systemGrowthRate: 5 },
      });

      mockExecSync.mockReturnValue('0');

      const result = await validationSystem.validatePhase4();

      expect(result.nextSteps).toContain('Perfect Codebase Campaign Complete! 🎉');
    });
  });
});

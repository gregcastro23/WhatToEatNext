/**
 * Test Suite for Enhanced Safety Protocols
 *
 * This test suite validates the enhanced safety protocols for high-impact files
 * including risk assessment, manual review workflows, and enhanced validation.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { EnhancedSafetyProtocols, FileRiskAssessment, HighImpactFileConfig } from '../EnhancedSafetyProtocols';

// Mock external dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs: any = fs as jest.Mocked<typeof fs>;
const mockExecSync: any = execSync as jest.MockedFunction<typeof execSync>;

describe('EnhancedSafetyProtocols', () => {
  let safetyProtocols: EnhancedSafetyProtocols,

  beforeEach(() => {
    jest.clearAllMocks();

    const config: Partial<HighImpactFileConfig> = { maxVariablesAutoProcess: 20,
      criticalFileBatchSize: 5,
      serviceLayerBatchSize: 8,
      requireManualReview: true,
      enhancedValidation: true,
      createDetailedBackups: true
    };

    safetyProtocols = new EnhancedSafetyProtocols(config);

    // Mock successful TypeScript compilation by default
    mockExecSync.mockReturnValue(Buffer.from(''));
  });

  describe('Risk Assessment', () => {
    test('should assess core calculation files as critical risk', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/calculations/planetary.ts';
        15
      );

      expect(assessment.riskLevel).toBe('critical');
      expect(assessment.fileType).toBe('calculation');
      expect(assessment.requiresManualReview).toBe(true);
      expect(assessment.requiresEnhancedValidation).toBe(true);
      expect(assessment.recommendedBatchSize).toBe(5);
      expect(assessment.riskFactors).toContain('Core astrological calculation file');
    });

    test('should assess service layer files as high risk', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/services/api.ts';
        10
      );

      expect(assessment.riskLevel).toBe('high');
      expect(assessment.fileType).toBe('service');
      expect(assessment.requiresManualReview).toBe(false); // Under 20 variables
      expect(assessment.requiresEnhancedValidation).toBe(true);
      expect(assessment.recommendedBatchSize).toBe(8);
      expect(assessment.riskFactors).toContain('Service layer business logic');
    });

    test('should escalate risk for high unused variable count', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/utils/helper.ts';
        25 // High variable count
      );

      expect(assessment.riskLevel).toBe('medium'); // Escalated from low
      expect(assessment.requiresManualReview).toBe(true);
      expect(assessment.riskFactors).toContain('High unused variable count (25)');
      expect(assessment.mitigationStrategies).toContain('Mandatory manual review required');
    });

    test('should identify high-impact utility files', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/utils/reliableAstronomy.ts';
        8
      );

      expect(assessment.riskLevel).toBe('high');
      expect(assessment.riskFactors).toContain('High-impact utility function');
    });

    test('should detect astrological calculations in file content', () => {
      mockFs.readFileSync.mockReturnValue('const planetary: any = calculatePlanetaryPositions(),');

      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/components/chart.tsx';
        5
      );

      expect(assessment.riskFactors).toContain('Contains astrological calculations');
      expect(assessment.mitigationStrategies).toContain('Validate calculation accuracy after changes');
    });

    test('should detect campaign system logic', () => {
      mockFs.readFileSync.mockReturnValue('const _metrics: any = campaignProgress.getMetrics(),');

      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/dashboard/progress.tsx';
        3
      );

      expect(assessment.riskFactors).toContain('Contains campaign system logic');
      expect(assessment.mitigationStrategies).toContain('Preserve monitoring and intelligence variables');
    });
  });

  describe('Manual Review Workflow', () => {
    test('should create manual review request for high-risk files', () => {
      const assessment: FileRiskAssessment = { filePath: '/project/src/calculations/planetary.ts',,;
        relativePath: 'src/calculations/planetary.ts',
        riskLevel: 'critical',
        fileType: 'calculation',
        unusedVariableCount: 25,
        requiresManualReview: true,
        requiresEnhancedValidation: true,
        recommendedBatchSize: 5,
        riskFactors: ['Core astrological calculation file', 'High unused variable count (25)'],
        mitigationStrategies: ['Use minimum batch size (5 files)', 'Mandatory manual review required']
      };

      const reviewRequest: any = safetyProtocols.createManualReviewRequest(assessment);

      expect(reviewRequest.filePath).toBe(assessment.filePath);
      expect(reviewRequest.unusedVariableCount).toBe(25);
      expect(reviewRequest.approvalRequired).toBe(true); // Critical file
      expect(reviewRequest.reviewInstructions).toContain(
        'Verify that no planetary calculation variables are eliminated'
      );
      expect(reviewRequest.reviewInstructions).toContain(
        'Ensure elemental property variables (Fire, Water, Earth, Air) are preserved'
      );
    });

    test('should generate specific review instructions for service layer files', () => {
      const assessment: FileRiskAssessment = { filePath: '/project/src/services/api.ts',,;
        relativePath: 'src/services/api.ts',
        riskLevel: 'high',
        fileType: 'service',
        unusedVariableCount: 15,
        requiresManualReview: true,
        requiresEnhancedValidation: true,
        recommendedBatchSize: 8,
        riskFactors: ['Service layer business logic'],
        mitigationStrategies: ['Enhanced API integration testing']
      };

      const reviewRequest: any = safetyProtocols.createManualReviewRequest(assessment);

      expect(reviewRequest.reviewInstructions).toContain(
        'Verify API integration points remain functional'
      );
      expect(reviewRequest.reviewInstructions).toContain(
        'Check that error handling variables are preserved'
      );
    });

    test('should track pending manual reviews', () => {
      const assessment: FileRiskAssessment = { filePath: '/project/src/test.ts',,;
        relativePath: 'src/test.ts',
        riskLevel: 'high',
        fileType: 'other',
        unusedVariableCount: 25,
        requiresManualReview: true,
        requiresEnhancedValidation: false,
        recommendedBatchSize: 10,
        riskFactors: [],
        mitigationStrategies: []
      };

      safetyProtocols.createManualReviewRequest(assessment);
      const pendingReviews: any = safetyProtocols.getPendingManualReviews();

      expect(pendingReviews).toHaveLength(1);
      expect(pendingReviews[0].filePath).toBe('/project/src/test.ts');
    });

    test('should approve manual reviews', () => {
      const assessment: FileRiskAssessment = { filePath: '/project/src/test.ts',,;
        relativePath: 'src/test.ts',
        riskLevel: 'medium',
        fileType: 'other',
        unusedVariableCount: 15,
        requiresManualReview: true,
        requiresEnhancedValidation: false,
        recommendedBatchSize: 10,
        riskFactors: [],
        mitigationStrategies: []
      };

      safetyProtocols.createManualReviewRequest(assessment);
      const success: any = safetyProtocols.approveManualReview('/project/src/test.ts', 'Looks good');

      expect(success).toBe(true);
      expect(safetyProtocols.getPendingManualReviews()).toHaveLength(0);
    });

    test('should reject manual reviews', () => {
      const assessment: FileRiskAssessment = { filePath: '/project/src/test.ts',,;
        relativePath: 'src/test.ts',
        riskLevel: 'medium',
        fileType: 'other',
        unusedVariableCount: 15,
        requiresManualReview: true,
        requiresEnhancedValidation: false,
        recommendedBatchSize: 10,
        riskFactors: [],
        mitigationStrategies: []
      };

      safetyProtocols.createManualReviewRequest(assessment);
      const success: any = safetyProtocols.rejectManualReview('/project/src/test.ts', 'Too risky');

      expect(success).toBe(true);
      expect(safetyProtocols.getPendingManualReviews()).toHaveLength(0);
    });
  });

  describe('Enhanced Validation', () => {
    test('should perform TypeScript compilation validation', async () => {
      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/test.ts';
        ['removed unused variable']
      ),

      expect(mockExecSync).toHaveBeenCalledWith(
        'yarn tsc --noEmit --skipLibCheck',
        expect.objectContaining({ stdio: 'pipe' })
      );
      expect(result.passed).toBe(true);
    });

    test('should handle TypeScript compilation failure', async () => {
      mockExecSync.mockImplementation((cmd: any) => {
        if (cmd.toString().includes('tsc')) {
          throw new Error('Compilation failed')
        }
        return Buffer.from('');
      });

      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/test.ts';
        ['removed unused variable']
      );

      expect(result.passed).toBe(false);
      expect(result.requiresRollback).toBe(true);
      expect(result.errors).toContain('TypeScript compilation failed: Erro, r: Compilation failed')
    });

    test('should perform service layer validation', async () => {
      mockFs.readFileSync.mockReturnValue('export const api: any = '/api/test',');

      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/services/api.ts';
        ['removed unused variable']
      ),

      expect(result.passed).toBe(true);
      // Should not have warnings for properly exported API
    });

    test('should detect missing API definitions in service files', async () => {
      mockFs.readFileSync.mockReturnValue('const api: any = '/api/test', // No export');

      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/services/api.ts';
        ['removed unused variable']
      ),

      expect(result.warnings).toContain('API definitions may have been affected');
    });

    test('should validate core calculations', async () => {
      mockFs.readFileSync.mockReturnValue(`
        const Fire: any = 0.8;
        const Water: any = 0.2;
        const Earth: any = 0.5;
        const Air: any = 0.3;
        function calculateElemental() : any { return Fire + Water, }
      `);

      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/calculations/elemental.ts';
        ['removed unused variable']
      );

      expect(result.passed).toBe(true);
      // Should pass because all elemental properties are present
    });

    test('should detect missing elemental properties', async () => {
      mockFs.readFileSync.mockReturnValue(`
        const Fire: any = 0.8;
        const Water: any = 0.2;
        // Missing Earth and Air
        function calculateElemental() : any { return Fire + Water, }
      `);

      const result: any = await safetyProtocols.performEnhancedValidation(;
        '/project/src/calculations/elemental.ts';
        ['removed unused variable']
      );

      expect(result.passed).toBe(false);
      expect(result.errors).toContain('Missing elemental properties: Earth, Air');
    });
  });

  describe('Configuration Options', () => {
    test('should respect disabled manual review option', () => {
      const configWithoutReview: Partial<HighImpactFileConfig> = { requireManualReview: false
      };

      const protocolsNoReview: any = new EnhancedSafetyProtocols(configWithoutReview);
      const assessment: any = protocolsNoReview.assessFileRisk(;
        '/project/src/calculations/planetary.ts';
        25 // High variable count
      );

      expect(assessment.requiresManualReview).toBe(false);
    });

    test('should respect disabled enhanced validation option', () => {
      const configWithoutValidation: Partial<HighImpactFileConfig> = { enhancedValidation: false
      };

      const protocolsNoValidation: any = new EnhancedSafetyProtocols(configWithoutValidation);
      const assessment: any = protocolsNoValidation.assessFileRisk(;
        '/project/src/services/api.ts';
        10
      );

      expect(assessment.requiresEnhancedValidation).toBe(false);
    });

    test('should respect custom variable threshold', () => {
      const configCustomThreshold: Partial<HighImpactFileConfig> = { maxVariablesAutoProcess: 10 // Lower threshold
      };

      const protocolsCustom: any = new EnhancedSafetyProtocols(configCustomThreshold);
      const assessment: any = protocolsCustom.assessFileRisk(;
        '/project/src/utils/helper.ts';
        15 // Above custom threshold
      );

      expect(assessment.requiresManualReview).toBe(true);
    });

    test('should respect custom batch sizes', () => {
      const configCustomBatch: Partial<HighImpactFileConfig> = { criticalFileBatchSize: 3,
        serviceLayerBatchSize: 6
      };

      const protocolsCustom: any = new EnhancedSafetyProtocols(configCustomBatch);

      const criticalAssessment: any = protocolsCustom.assessFileRisk(;
        '/project/src/calculations/planetary.ts';
        10
      );
      expect(criticalAssessment.recommendedBatchSize).toBe(3);

      const serviceAssessment: any = protocolsCustom.assessFileRisk(;
        '/project/src/services/api.ts';
        10
      );
      expect(serviceAssessment.recommendedBatchSize).toBe(6);
    });
  });

  describe('File Classification', () => {
    test('should classify calculation files correctly', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/calculations/astrology.ts';
        5
      );

      expect(assessment.fileType).toBe('calculation');
      expect(assessment.riskLevel).toBe('critical');
    });

    test('should classify service files correctly', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/services/ApiService.ts';
        5
      );

      expect(assessment.fileType).toBe('service');
      expect(assessment.riskLevel).toBe('high');
    });

    test('should classify component files correctly', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/components/Chart.tsx';
        5
      );

      expect(assessment.fileType).toBe('component');
      expect(assessment.riskLevel).toBe('low');
    });

    test('should classify utility files correctly', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/utils/helper.ts';
        5
      );

      expect(assessment.fileType).toBe('utility');
      expect(assessment.riskLevel).toBe('low');
    });

    test('should classify test files correctly', () => {
      const assessment: any = safetyProtocols.assessFileRisk(;
        '/project/src/components/Chart.test.tsx';
        5
      );

      expect(assessment.fileType).toBe('test');
      expect(assessment.riskLevel).toBe('low');
    });
  });
});

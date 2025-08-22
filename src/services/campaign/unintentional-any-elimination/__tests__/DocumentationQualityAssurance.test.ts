/**
 * Tests for DocumentationQualityAssurance
 */

import * as fs from 'fs/promises';
import { glob } from 'glob';
import { DocumentationQualityAssurance, QualityAssuranceConfig } from '../DocumentationQualityAssurance';
import { AnyTypeCategory, ClassificationContext, CodeDomain } from '../types';

// Mock dependencies
jest.mock('fs/promises');
jest.mock('glob');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockGlob = glob as jest.MockedFunction<typeof glob>;

describe('DocumentationQualityAssurance', () => {
  let qas: DocumentationQualityAssurance;
  let mockConfig: Partial<QualityAssuranceConfig>;

  beforeEach(() => {
    mockConfig = {
      sourceDirectories: ['src'],
      excludePatterns: ['**/*.test.ts'],
      minimumCommentLength: 20,
      requiredKeywords: ['intentionally', 'deliberately'],
      qualityThresholds: {
        excellent: 90,
        good: 70,
        fair: 50
      }
    };

    qas = new DocumentationQualityAssurance(mockConfig);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('performQualityAssurance', () => {
    it('should perform comprehensive quality assurance scan', async () => {
      const mockFiles = ['src/service.ts', 'src/component.tsx'];
      mockGlob.mockResolvedValue(mockFiles);

      const fileContent = [
        'export class Service {',
        '  // Intentionally any: External API response with dynamic structure',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any',
        '  processData(data: unknown): void {',
        '    console.log(data);',
        '  }',
        '',
        '  // Poor comment',
        '  handleError(error: unknown): void {',
        '    console.error(error);',
        '  }',
        '',
        '  transform(input: unknown): any {',
        '    return input;',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const report = await qas.performQualityAssurance();

      expect(report.totalIntentionalAnyTypes).toBeGreaterThan(0);
      expect(report.documentationCoverage).toBeLessThan(100);
      expect(report.qualityBreakdown).toHaveProperty('poor');
      expect(report.qualityBreakdown).toHaveProperty('excellent');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });

    it('should handle files with no any types', async () => {
      const mockFiles = ['src/clean.ts'];
      mockGlob.mockResolvedValue(mockFiles);

      const cleanFileContent = [
        'export class CleanService {',
        '  processData(data: string): void {',
        '    console.log(data);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(cleanFileContent);

      const report = await qas.performQualityAssurance();

      expect(report.totalIntentionalAnyTypes).toBe(0);
      expect(report.documentationCoverage).toBe(100);
    });

    it('should handle file read errors gracefully', async () => {
      const mockFiles = ['src/error.ts'];
      mockGlob.mockResolvedValue(mockFiles);
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const report = await qas.performQualityAssurance();

      expect(report).toBeDefined();
      expect(report.totalIntentionalAnyTypes).toBe(0);
    });
  });

  describe('validateDocumentationQuality', () => {
    it('should validate high-quality documentation', async () => {
      const fileContent = [
        'export class Service {',
        '  // Intentionally any: External API response requires flexible typing because structure varies',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API compatibility',
        '  processData(data: unknown): void {',
        '    console.log(data);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const context: ClassificationContext = {
        filePath: 'src/service.ts',
        lineNumber: 4,
        codeSnippet: 'processData(data: unknown): void {',
        surroundingLines: [],
        hasExistingComment: true,
        existingComment: 'Intentionally any: External API response requires flexible typing because structure varies',
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.SERVICE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const validation = await qas.validateDocumentationQuality(context);

      expect(validation.hasComment).toBe(true);
      expect(validation.commentQuality).toBe('excellent');
      expect(validation.hasEslintDisable).toBe(true);
      expect(validation.eslintDisableHasExplanation).toBe(true);
      expect(validation.isComplete).toBe(true);
      expect(validation.suggestions).toContain('Documentation is complete and meets quality standards');
    });

    it('should identify poor quality documentation', async () => {
      const fileContent = [
        'export class Service {',
        '  // any',
        '  processData(data: unknown): void {',
        '    console.log(data);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const context: ClassificationContext = {
        filePath: 'src/service.ts',
        lineNumber: 3,
        codeSnippet: 'processData(data: unknown): void {',
        surroundingLines: [],
        hasExistingComment: true,
        existingComment: 'any',
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.SERVICE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const validation = await qas.validateDocumentationQuality(context);

      expect(validation.hasComment).toBe(true);
      expect(validation.commentQuality).toBe('poor');
      expect(validation.hasEslintDisable).toBe(false);
      expect(validation.isComplete).toBe(false);
      expect(validation.suggestions).toContain('Improve comment quality with more detailed explanation');
    });

    it('should identify missing documentation', async () => {
      const fileContent = [
        'export class Service {',
        '  processData(data: unknown): void {',
        '    console.log(data);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const context: ClassificationContext = {
        filePath: 'src/service.ts',
        lineNumber: 2,
        codeSnippet: 'processData(data: unknown): void {',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.SERVICE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      const validation = await qas.validateDocumentationQuality(context);

      expect(validation.hasComment).toBe(false);
      expect(validation.commentQuality).toBe('poor');
      expect(validation.hasEslintDisable).toBe(false);
      expect(validation.isComplete).toBe(false);
      expect(validation.suggestions).toContain('Add explanatory comment indicating intentional use of any type');
    });

    it('should cache validation results', async () => {
      const fileContent = 'processData(data: unknown): void {}';
      mockFs.readFile.mockResolvedValue(fileContent);

      const context: ClassificationContext = {
        filePath: 'src/service.ts',
        lineNumber: 1,
        codeSnippet: 'processData(data: unknown): void {',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {
          domain: CodeDomain.SERVICE,
          intentionalityHints: [],
          suggestedTypes: [],
          preservationReasons: []
        }
      };

      // First call
      await qas.validateDocumentationQuality(context);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await qas.validateDocumentationQuality(context);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateQualityReport', () => {
    it('should generate comprehensive quality metrics', async () => {
      const mockFiles = ['src/service.ts', 'src/component.tsx'];
      mockGlob.mockResolvedValue(mockFiles);

      const fileContent = [
        'export class Service {',
        '  // Intentionally any: External API response',
        '  processData(data: unknown): void {',
        '    console.log(data);',
        '  }',
        '',
        '  handleError(error: unknown): void {',
        '    console.error(error);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const metrics = await qas.generateQualityReport();

      expect(metrics.totalFiles).toBe(2);
      expect(metrics.filesWithAnyTypes).toBeGreaterThan(0);
      expect(metrics.totalAnyTypes).toBeGreaterThan(0);
      expect(metrics.qualityDistribution).toHaveProperty('poor');
      expect(metrics.qualityDistribution).toHaveProperty('excellent');
      expect(typeof metrics.averageQualityScore).toBe('number');
      expect(typeof metrics.compliancePercentage).toBe('number');
    });
  });

  describe('findAnyTypesInFile', () => {
    it('should find various any type patterns', async () => {
      const fileContent = [
        'const data: unknown = response;',
        'const items: unknown[] = [];',
        'const config: Record<string, unknown> = {};',
        'const result = data as unknown;',
        'function process<T = any>(input: T): T { return input; }',
        'const array: Array<unknown> = [];',
        'catch (error: unknown) {',
        '  console.error(error);',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      // Use reflection to access private method for testing
      const anyTypes = await (qas as unknown).findAnyTypesInFile('test.ts');

      expect(anyTypes.length).toBeGreaterThan(0);
      expect(anyTypes.some((t: unknown) => t.codeSnippet.includes(': unknown'))).toBe(true);
      expect(anyTypes.some((t: unknown) => t.codeSnippet.includes(': unknown[]'))).toBe(true);
      expect(anyTypes.some((t: unknown) => t.codeSnippet.includes('Record<string, unknown>'))).toBe(true);
      expect(anyTypes.some((t: unknown) => t.codeSnippet.includes('as unknown'))).toBe(true);
    });

    it('should categorize any types correctly', async () => {
      const testCases = [
        { code: 'catch (error: unknown) {', expectedCategory: AnyTypeCategory.ERROR_HANDLING },
        { code: 'const response: unknown = await api.fetch();', expectedCategory: AnyTypeCategory.EXTERNAL_API },
        { code: 'const mockData: unknown = jest.fn();', expectedCategory: AnyTypeCategory.TEST_MOCK },
        { code: 'const config: unknown = options;', expectedCategory: AnyTypeCategory.DYNAMIC_CONFIG },
        { code: 'const items: unknown[] = [];', expectedCategory: AnyTypeCategory.ARRAY_TYPE },
        { code: 'const data: Record<string, unknown> = {};', expectedCategory: AnyTypeCategory.RECORD_TYPE }
      ];

      for (const testCase of testCases) {
        const category = (qas as unknown).categorizeAnyType(testCase.code);
        expect(category).toBe(testCase.expectedCategory);
      }
    });

    it('should determine domain correctly', async () => {
      const testCases = [
        { path: 'src/services/astrology/planetary.ts', expectedDomain: CodeDomain.ASTROLOGICAL },
        { path: 'src/components/recipe/RecipeCard.tsx', expectedDomain: CodeDomain.RECIPE },
        { path: 'src/services/campaign/CampaignController.ts', expectedDomain: CodeDomain.CAMPAIGN },
        { path: 'src/services/intelligence/AIService.ts', expectedDomain: CodeDomain.INTELLIGENCE },
        { path: 'src/services/api/ApiService.ts', expectedDomain: CodeDomain.SERVICE },
        { path: 'src/components/ui/Button.tsx', expectedDomain: CodeDomain.COMPONENT },
        { path: 'src/utils/helpers.ts', expectedDomain: CodeDomain.UTILITY },
        { path: 'src/__tests__/service.test.ts', expectedDomain: CodeDomain.TEST }
      ];

      for (const testCase of testCases) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
        const domain = (qas as any).determineDomain(testCase.path);
        expect(domain).toBe(testCase.expectedDomain);
      }
    });
  });

  describe('comment quality assessment', () => {
    const qualityTestCases = [
      {
        comment: '',
        expectedQuality: 'poor',
        description: 'empty comment'
      },
      {
        comment: 'any',
        expectedQuality: 'poor',
        description: 'minimal comment'
      },
      {
        comment: 'Intentionally any for API',
        expectedQuality: 'good',
        description: 'basic intentional comment'
      },
      {
        comment: 'Intentionally any: External API response requires flexible typing',
        expectedQuality: 'excellent',
        description: 'good quality comment with explanation'
      },
      {
        comment: 'Intentionally any: External API response requires flexible typing because the structure varies between different endpoints and versions, and we need to maintain compatibility with legacy systems',
        expectedQuality: 'excellent',
        description: 'excellent quality comment with detailed explanation'
      }
    ];

    qualityTestCases.forEach(({ comment, expectedQuality, description }) => {
      it(`should assess ${description} as ${expectedQuality}`, () => {
        const quality = (qas as unknown).assessCommentQuality(comment);
        expect(quality).toBe(expectedQuality);
      });
    });
  });

  describe('ESLint disable comment detection', () => {
    it('should detect ESLint disable comments', () => {
      const lines = [
        'function test() {',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any',
        '  const data: unknown = response;',
        '}'
      ];

      const hasDisable = (qas as unknown).hasEslintDisableComment(lines, 2);
      expect(hasDisable).toBe(true);
    });

    it('should detect ESLint disable comments with explanations', () => {
      const lines = [
        'function test() {',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API compatibility',
        '  const data: unknown = response;',
        '}'
      ];

      const hasExplanation = (qas as unknown).eslintDisableHasExplanation(lines, 2);
      expect(hasExplanation).toBe(true);
    });

    it('should not detect explanation in basic disable comment', () => {
      const lines = [
        'function test() {',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any',
        '  const data: unknown = response;',
        '}'
      ];

      const hasExplanation = (qas as unknown).eslintDisableHasExplanation(lines, 2);
      expect(hasExplanation).toBe(false);
    });
  });

  describe('severity assessment', () => {
    it('should assess severity correctly', () => {
      const testCases = [
        {
          context: {
            filePath: 'src/service.ts',
            codeSnippet: 'processData(data: unknown): void',
            isInTestFile: false
          },
          expectedSeverity: 'high'
        },
        {
          context: {
            filePath: 'src/component.tsx',
            codeSnippet: 'const props: unknown = {}',
            isInTestFile: false
          },
          expectedSeverity: 'low'
        },
        {
          context: {
            filePath: 'src/test.test.ts',
            codeSnippet: 'const mock: unknown = {}',
            isInTestFile: true
          },
          expectedSeverity: 'low'
        },
        {
          context: {
            filePath: 'src/utils.ts',
            codeSnippet: 'function process(data: unknown[]): any',
            isInTestFile: false
          },
          expectedSeverity: 'medium'
        }
      ];

      testCases.forEach(({ context, expectedSeverity }) => {
        const severity = (qas as unknown).assessSeverity(context);
        expect(severity).toBe(expectedSeverity);
      });
    });
  });

  describe('recommendation generation', () => {
    it('should generate appropriate recommendations for low coverage', () => {
      const recommendations = (qas as unknown).generateRecommendations(
        30, // 30% coverage
        { poor: 5, fair: 2, good: 1, excellent: 0 },
        []
      );

      expect(recommendations.some((r: string) => r.includes('CRITICAL'))).toBe(true);
      expect(recommendations.some((r: string) => r.includes('poor quality'))).toBe(true);
    });

    it('should generate appropriate recommendations for good coverage', () => {
      const recommendations = (qas as unknown).generateRecommendations(
        85, // 85% coverage
        { poor: 1, fair: 2, good: 5, excellent: 3 },
        []
      );

      expect(recommendations.some((r: string) => r.includes('GOOD'))).toBe(true);
      expect(recommendations.some((r: string) => r.includes('remaining'))).toBe(true);
    });

    it('should generate appropriate recommendations for excellent coverage', () => {
      const recommendations = (qas as unknown).generateRecommendations(
        98, // 98% coverage
        { poor: 0, fair: 1, good: 3, excellent: 8 },
        []
      );

      expect(recommendations.some((r: string) => r.includes('EXCELLENT'))).toBe(true);
      expect(recommendations.some((r: string) => r.includes('Maintain'))).toBe(true);
    });
  });
});

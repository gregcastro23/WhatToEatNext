/**
 * Tests for AutoDocumentationGenerator
 */

import * as fs from 'fs/promises';
import { AutoDocumentationGeneratorImpl } from '../AutoDocumentationGenerator';
import {
    AnyTypeCategory,
    AnyTypeClassification,
    ClassificationContext,
    CodeDomain
} from '../types';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('AutoDocumentationGenerator', () => {
  let generator: AutoDocumentationGeneratorImpl;
  let mockContext: ClassificationContext;
  let mockClassification: AnyTypeClassification;

  beforeEach(() => {
    generator = new AutoDocumentationGeneratorImpl();

    mockContext = {
      filePath: '/test/file.ts',
      lineNumber: 10,
      codeSnippet: 'const data: any = response;',
      surroundingLines: [
        'function processResponse() {',
        '  try {',
        '    const data: any = response;',
        '    return data.result;',
        '  } catch (error) {'
      ],
      hasExistingComment: false,
      isInTestFile: false,
      domainContext: {
        domain: CodeDomain.SERVICE,
        intentionalityHints: [],
        suggestedTypes: [],
        preservationReasons: ['External API response structure unknown']
      }
    };

    mockClassification = {
      isIntentional: true,
      confidence: 0.9,
      reasoning: 'External API response with unknown structure',
      requiresDocumentation: true,
      category: AnyTypeCategory.EXTERNAL_API
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('generateDocumentation', () => {
    it('should generate documentation for intentional any type', async () => {
      const fileContent = [
        'function processResponse() {',
        '  try {',
        '    const data: any = response;',
        '    return data.result;',
        '  } catch (error) {',
        '    console.error(error);',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(mockClassification, mockContext);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toContain('Intentionally any');
      expect(result.commentAdded).toContain('External API');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should not generate documentation for unintentional any type', async () => {
      const unintentionalClassification = {
        ...mockClassification,
        isIntentional: false,
        requiresDocumentation: false
      };

      const result = await generator.generateDocumentation(unintentionalClassification, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not intentional');
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should skip documentation if adequate comment exists', async () => {
      const contextWithComment = {
        ...mockContext,
        hasExistingComment: true,
        existingComment: 'Intentionally any: External API response'
      };

      const result = await generator.generateDocumentation(mockClassification, contextWithComment);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toBe('Intentionally any: External API response');
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle different domain contexts', async () => {
      const astrologicalContext = {
        ...mockContext,
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.ASTROLOGICAL
        }
      };

      const astrologicalClassification = {
        ...mockClassification,
        category: AnyTypeCategory.EXTERNAL_API
      };

      const fileContent = 'const positions: any = apiResponse;';
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(astrologicalClassification, astrologicalContext);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toContain('astrological API');
    });

    it('should add ESLint disable comment', async () => {
      const fileContent = 'const data: any = response;';
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(mockClassification, mockContext);

      expect(result.success).toBe(true);
      expect(result.eslintDisableAdded).toContain('eslint-disable-next-line');
      expect(result.eslintDisableAdded).toContain('no-explicit-any');
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await generator.generateDocumentation(mockClassification, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should preserve indentation when adding comments', async () => {
      const fileContent = [
        'class TestClass {',
        '  processData() {',
        '    const data: any = response;',
        '  }',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const indentedContext = {
        ...mockContext,
        lineNumber: 3
      };

      const result = await generator.generateDocumentation(mockClassification, indentedContext);

      expect(result.success).toBe(true);

      // Check that writeFile was called with properly indented content
      const writtenContent = mockFs.writeFile.mock.calls[0][1] as string;
      const lines = writtenContent.split('\n');

      // Find the comment line (should be before the data line)
      const commentLine = lines.find(line => line.includes('Intentionally any'));
      expect(commentLine).toMatch(/^\s{4}\/\//); // Should have 4 spaces indentation
    });
  });

  describe('validateDocumentation', () => {
    it('should validate existing documentation', async () => {
      const fileContent = [
        'function test() {',
        '  // Intentionally any: External API response',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any',
        '  const data: any = response;',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const contextWithComment = {
        ...mockContext,
        lineNumber: 4,
        hasExistingComment: true,
        existingComment: 'Intentionally any: External API response'
      };

      const validation = await generator.validateDocumentation(contextWithComment);

      expect(validation.hasComment).toBe(true);
      expect(validation.commentQuality).toBe('fair');
      expect(validation.hasEslintDisable).toBe(true);
      expect(validation.eslintDisableHasExplanation).toBe(false); // Basic disable comment
      expect(validation.isComplete).toBe(false); // Missing explanation in ESLint disable
    });

    it('should detect poor quality comments', async () => {
      const fileContent = [
        'function test() {',
        '  // any',
        '  const data: any = response;',
        '}'
      ].join('\n');

      mockFs.readFile.mockResolvedValue(fileContent);

      const contextWithPoorComment = {
        ...mockContext,
        lineNumber: 3,
        hasExistingComment: true,
        existingComment: 'any'
      };

      const validation = await generator.validateDocumentation(contextWithPoorComment);

      expect(validation.hasComment).toBe(true);
      expect(validation.commentQuality).toBe('poor');
      expect(validation.isComplete).toBe(false);
      expect(validation.suggestions).toContain('Improve comment quality with more detailed explanation');
    });

    it('should provide suggestions for improvement', async () => {
      const fileContent = 'const data: any = response;';
      mockFs.readFile.mockResolvedValue(fileContent);

      const validation = await generator.validateDocumentation(mockContext);

      expect(validation.hasComment).toBe(false);
      expect(validation.suggestions).toContain('Add explanatory comment indicating intentional use of any type');
      expect(validation.suggestions).toContain('Add ESLint disable comment to suppress warnings');
    });
  });

  describe('generateReport', () => {
    it('should generate basic documentation report', async () => {
      const report = await generator.generateReport();

      expect(report).toHaveProperty('totalIntentionalAnyTypes');
      expect(report).toHaveProperty('documentedTypes');
      expect(report).toHaveProperty('undocumentedTypes');
      expect(report).toHaveProperty('documentationCoverage');
      expect(report).toHaveProperty('qualityBreakdown');
      expect(report).toHaveProperty('recommendations');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('template selection', () => {
    it('should select appropriate template for error handling', async () => {
      const errorContext = {
        ...mockContext,
        codeSnippet: 'catch (error: any) {',
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.UTILITY
        }
      };

      const errorClassification = {
        ...mockClassification,
        category: AnyTypeCategory.ERROR_HANDLING
      };

      const fileContent = 'catch (error: any) {';
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(errorClassification, errorContext);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toContain('Error handling');
      expect(result.commentAdded).toContain('flexible typing');
    });

    it('should select appropriate template for test mocks', async () => {
      const testContext = {
        ...mockContext,
        isInTestFile: true,
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.TEST
        }
      };

      const testClassification = {
        ...mockClassification,
        category: AnyTypeCategory.TEST_MOCK
      };

      const fileContent = 'const mockData: any = {};';
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(testClassification, testContext);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toContain('Test mock');
      expect(result.commentAdded).toContain('comprehensive testing');
    });

    it('should use fallback template for unknown combinations', async () => {
      const unknownContext = {
        ...mockContext,
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.UTILITY
        }
      };

      const unknownClassification = {
        ...mockClassification,
        category: AnyTypeCategory.LEGACY_COMPATIBILITY
      };

      const fileContent = 'const data: any = legacy;';
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue();

      const result = await generator.generateDocumentation(unknownClassification, unknownContext);

      expect(result.success).toBe(true);
      expect(result.commentAdded).toContain('flexible typing');
    });
  });

  describe('comment quality assessment', () => {
    const testCases = [
      {
        comment: '',
        expectedQuality: 'poor'
      },
      {
        comment: 'any',
        expectedQuality: 'poor'
      },
      {
        comment: 'Intentionally any for API',
        expectedQuality: 'good'
      },
      {
        comment: 'Intentionally any: External API response requires flexible typing',
        expectedQuality: 'good'
      },
      {
        comment: 'Intentionally any: External API response requires flexible typing because the structure varies between different endpoints and versions',
        expectedQuality: 'excellent'
      }
    ];

    testCases.forEach(({ comment, expectedQuality }) => {
      it(`should assess "${comment}" as ${expectedQuality} quality`, async () => {
        const fileContent = `// ${comment}\nconst data: any = response;`;
        mockFs.readFile.mockResolvedValue(fileContent);

        const contextWithComment = {
          ...mockContext,
          hasExistingComment: comment.length > 0,
          existingComment: comment
        };

        const validation = await generator.validateDocumentation(contextWithComment);

        expect(validation.commentQuality).toBe(expectedQuality);
      });
    });
  });
});

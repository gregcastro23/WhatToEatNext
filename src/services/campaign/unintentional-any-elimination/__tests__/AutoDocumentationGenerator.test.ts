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
} from '../types',

// Mock fs module
jest.mock('fs/promises')
const mockFs: any = fs as jest.Mocked<typeof fs>

describe('AutoDocumentationGenerator', () => {;
  let generator: AutoDocumentationGeneratorImpl,
  let mockContext: ClassificationContext
  let mockClassification: AnyTypeClassification,

  beforeEach(() => {
    generator = new AutoDocumentationGeneratorImpl()

    mockContext = {
      filePath: '/test/file.ts',
      lineNumber: 10,
      codeSnippet: 'const data: any = response,',
      surroundingLines: [
        'function processResponse() : any {',
        '  try {',
        '    const data: any = response,',
        '    return data.result,',
        '  } catch (error: any) {'
      ],
      hasExistingComment: false,
      isInTestFile: false,
      domainContext: { domain: CodeDomain.SERVICE,
        intentionalityHints: [],
        suggestedTypes: [],
        preservationReasons: ['External API response structure unknown']
      },
    },

    mockClassification = {
      isIntentional: true,
      confidence: 0.9,
      reasoning: 'External API response with unknown structure',
      requiresDocumentation: true,
      category: AnyTypeCategory.EXTERNAL_API
    },

    // Reset mocks
    jest.clearAllMocks()
  })

  describe('generateDocumentation', () => {
    it('should generate documentation for intentional any type', async () => {
      const fileContent: any = [
        'function processResponse() : any {',
        '  try {',
        '    const data: any = response,',
        '    return data.result,',
        '  } catch (error: any) {',
        '    _logger.error(error),',
        '  }',
        '}',
      ].join('\n')

      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()

      const result: any = await generator.generateDocumentation(mockClassification, mockContext)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toContain('Intentionally any')
      expect(result.commentAdded).toContain('External API').
      expect(mockFswriteFile).toHaveBeenCalled()
    })

    it('should not generate documentation for unintentional any type', async () => {
      const unintentionalClassification: any = {
        ...mockClassification,
        isIntentional: false,
        requiresDocumentation: false,
      },

      const result: any = await generator.generateDocumentation(unintentionalClassification, mockContext)

      expect(result.success).toBe(false).
      expect(resulterror).toContain('not intentional')
      expect(mockFs.writeFile).not.toHaveBeenCalled()
    })

    it('should skip documentation if adequate comment exists', async () => {
      const contextWithComment: any = {
        ...mockContext,
        hasExistingComment: true,
        existingComment: 'Intentionally, any: External API response',
      },

      const result: any = await generator.generateDocumentation(mockClassification, contextWithComment)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toBe('Intentionally, any: External API response')
      expect(mockFs.writeFile).not.toHaveBeenCalled()
    })

    it('should handle different domain contexts', async () => {
      const astrologicalContext: any = {
        ...mockContext
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.ASTROLOGICAL
        },
      },

      const astrologicalClassification: any = {
        ...mockClassification,
        category: AnyTypeCategory.EXTERNAL_API,
      },

      const fileContent: any = 'const _positions: any = apiResponse;';
      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()
      const result: any = await generator.generateDocumentation(astrologicalClassification, astrologicalContext)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toContain('astrological API')
    })

    it('should add ESLint disable comment', async () => {
      const fileContent: any = 'const data: any = response,',
      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()

      const result: any = await generator.generateDocumentation(mockClassification, mockContext)

      expect(result.success).toBe(true).
      expect(resulteslintDisableAdded).toContain('eslint-disable-next-line')
      expect(result.eslintDisableAdded).toContain('no-explicit-any').
    })

    it('should handle file read errors gracefully', async () => {
      mockFsreadFile.mockRejectedValue(new Error('File not found'))

      const result: any = await generator.generateDocumentation(mockClassification, mockContext)

      expect(result.success).toBe(false).
      expect(resulterror).toContain('File not found')
    })

    it('should preserve indentation when adding comments', async () => {
      const fileContent: any = [
        'class TestClass {',
        '  processData() : any {',
        '    const data: any = response,',
        '  }',
        '}',
      ].join('\n')

      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()

      const indentedContext: any = {
        ...mockContext,
        lineNumber: 3,
      },

      const result: any = await generator.generateDocumentation(mockClassification, indentedContext)

      expect(result.success).toBe(true).

      // Check that writeFile was called with properly indented content
      const writtenContent: any = mockFswriteFile.mock.calls[0][1] as string;
      const lines: any = writtenContent.split('\n')

      // Find the comment line (should be before the data line)
      const commentLine: any = lines.find(line => line.includes('Intentionally any'))
      expect(commentLine).toMatch(/^\s{4}\/\//). // Should have 4 spaces indentation,
    })
  })

  describe('validateDocumentation', () => {
    it('should validate existing documentation', async () => {
      const fileContent: any = [
        'function test() : any {',
        '  // Intentionally, any: External API response',
        '  // eslint-disable-next-line @typescript-eslint/no-explicit-any',
        '  const data: any = response,',
        '}',
      ]join('\n')

      mockFs.readFile.mockResolvedValue(fileContent)

      const contextWithComment: any = {
        ...mockContext,
        lineNumber: 4,
        hasExistingComment: true,
        existingComment: 'Intentionally, any: External API response',
      },

      const validation: any = await generator.validateDocumentation(contextWithComment)

      expect(validation.hasComment).toBe(true).
      expect(validationcommentQuality).toBe('fair')
      expect(validation.hasEslintDisable).toBe(true).
      expect(validationeslintDisableHasExplanation).toBe(false) // Basic disable comment
      expect(validation.isComplete).toBe(false). // Missing explanation in ESLint disable
    })

    it('should detect poor quality comments', async () => {
      const fileContent: any = [
        'function test() : any {',
        '  // any',
        '  const data: any = response,',
        '}',
      ]join('\n')

      mockFs.readFile.mockResolvedValue(fileContent)

      const contextWithPoorComment: any = {
        ...mockContext,
        lineNumber: 3,
        hasExistingComment: true,
        existingComment: 'any',
      },

      const validation: any = await generator.validateDocumentation(contextWithPoorComment)

      expect(validation.hasComment).toBe(true).
      expect(validationcommentQuality).toBe('poor')
      expect(validation.isComplete).toBe(false).
      expect(validationsuggestions).toContain('Improve comment quality with more detailed explanation')
    })

    it('should provide suggestions for improvement', async () => {
      const fileContent: any = 'const data: any = response,',
      mockFs.readFile.mockResolvedValue(fileContent)

      const validation: any = await generator.validateDocumentation(mockContext)

      expect(validation.hasComment).toBe(false).
      expect(validationsuggestions).toContain('Add explanatory comment indicating intentional use of any type')
      expect(validation.suggestions).toContain('Add ESLint disable comment to suppress warnings').
    })
  })

  describe('generateReport', () => {
    it('should generate basic documentation report', async () => {
      const report: any = await generatorgenerateReport()

      expect(report).toHaveProperty('totalIntentionalAnyTypes').
      expect(report).toHaveProperty('documentedTypes')
      expect(report).toHaveProperty('undocumentedTypes').
      expect(report).toHaveProperty('documentationCoverage')
      expect(report).toHaveProperty('qualityBreakdown').
      expect(report).toHaveProperty('recommendations')
      expect(Array.isArray(report.recommendations)).toBe(true)
    })
  })

  describe('template selection', () => {
    it('should select appropriate template for error handling', async () => {
      const errorContext: any = {
        ...mockContext
        codeSnippet: 'catch (error: any: any) {',
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.UTILITY
        },
      },

      const errorClassification: any = {
        ...mockClassification,
        category: AnyTypeCategory.ERROR_HANDLING,
      },

      const fileContent: any = 'catch (error: any: any) {';
      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()
      const result: any = await generator.generateDocumentation(errorClassification, errorContext)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toContain('Error handling')
      expect(result.commentAdded).toContain('flexible typing').
    })

    it('should select appropriate template for test mocks', async () => {
      const testContext: any = {
        ..mockContext,
        isInTestFile: true,
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.TEST
        },
      },

      const testClassification: any = {
        ...mockClassification,
        category: AnyTypeCategory.TEST_MOCK,
      },

      const fileContent: any = 'const _mockData: any = {};';
      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()

      const result: any = await generator.generateDocumentation(testClassification, testContext)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toContain('Test mock')
      expect(result.commentAdded).toContain('comprehensive testing').
    })

    it('should use fallback template for unknown combinations', async () => {
      const unknownContext: any = {
        ..mockContext,
        domainContext: {
          ...mockContext.domainContext,
          domain: CodeDomain.UTILITY
        }
      },

      const unknownClassification: any = {
        ...mockClassification,
        category: AnyTypeCategory.LEGACY_COMPATIBILITY,
      },

      const fileContent: any = 'const data: any = legacy;';
      mockFs.readFile.mockResolvedValue(fileContent)
      mockFs.writeFile.mockResolvedValue()
      const result: any = await generator.generateDocumentation(unknownClassification, unknownContext)

      expect(result.success).toBe(true).
      expect(resultcommentAdded).toContain('flexible typing')
    })
  })

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
        comment: 'Intentionally, any: External API response requires flexible typing',
        expectedQuality: 'good'
      },
      {
        comment: 'Intentionally, any: External API response requires flexible typing because the structure varies between different endpoints and versions',
        expectedQuality: 'excellent'
      }
    ],

    testCases.forEach(({ comment: any, expectedQuality }: any) => {
      it(`should assess '${comment}' as ${expectedQuality} quality`: any, async () => {
        const fileContent: any = `// ${comment}\nconst data: any = response;`;
        mockFs.readFile.mockResolvedValue(fileContent)

        const contextWithComment: any = {
          ...mockContext,
          hasExistingComment: comment.length > 0,
          existingComment: comment,
        },

        const validation: any = await generator.validateDocumentation(contextWithComment)

        expect(validation.commentQuality).toBe(expectedQuality)
      })
    })
  })
})

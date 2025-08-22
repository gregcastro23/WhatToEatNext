/**
 * AnyTypeClassifier Tests
 * Unit tests for the Any Type Classifier component
 */

import { AnyTypeClassifier } from '../AnyTypeClassifier';
import { AnyTypeCategory, ClassificationContext, CodeDomain } from '../types';

describe('AnyTypeClassifier', () => {
  let classifier: AnyTypeClassifier;

  beforeEach(() => {
    classifier = new AnyTypeClassifier();
  });

  const createContext = (codeSnippet: string, options: Partial<ClassificationContext> = {}): ClassificationContext => ({
    filePath: 'test.ts',
    lineNumber: 1,
    codeSnippet,
    surroundingLines: [],
    hasExistingComment: false,
    isInTestFile: false,
    domainContext: {
      domain: CodeDomain.UTILITY,
      intentionalityHints: [],
      suggestedTypes: [],
      preservationReasons: []
    },
    ...options
  });

  describe('Error Handling Classification', () => {
    test('classifies error handling any as intentional', async () => {
      const context = createContext('} catch (error: unknown) {');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.ERROR_HANDLING);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('classifies error variable as intentional', async () => {
      const context = createContext('const error: unknown = e;');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.ERROR_HANDLING);
    });
  });

  describe('Array Type Classification', () => {
    test('classifies simple array any as unintentional', async () => {
      const context = createContext('const items: unknown[] = [];');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.ARRAY_TYPE);
      expect(result.suggestedReplacement).toBe('unknown[]');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('classifies Array<unknown> as unintentional', async () => {
      const context = createContext('const items: Array<unknown> = [];');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.ARRAY_TYPE);
    });
  });

  describe('Record Type Classification', () => {
    test('classifies Record<string, unknown> as unintentional', async () => {
      const context = createContext('const data: Record<string, unknown> = {};');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.RECORD_TYPE);
      expect(result.suggestedReplacement).toBe('Record<string, unknown>');
    });

    test('classifies index signature as unintentional', async () => {
      const context = createContext('{ [key: string]: unknown }');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.RECORD_TYPE);
    });
  });

  describe('Existing Documentation', () => {
    test('respects existing intentional documentation', async () => {
      const context = createContext(
        'const data: unknown = response;',
        {
          hasExistingComment: true,
          existingComment: '// Intentionally any: External API response'
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.requiresDocumentation).toBe(false);
    });
  });

  describe('Test File Context', () => {
    test('classifies test mocks as intentional', async () => {
      const context = createContext(
        'const mockFn = jest.fn() as unknown;',
        { isInTestFile: true }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.TEST_MOCK);
    });
  });

  describe('Domain-Specific Analysis', () => {
    test('analyzes astrological domain context', async () => {
      const context = createContext(
        'const planetaryPositions: unknown = data;',
        {
          filePath: 'src/calculations/planetary/positions.ts',
          domainContext: {
            domain: CodeDomain.ASTROLOGICAL,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          }
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.EXTERNAL_API);
      expect(result.reasoning).toContain('Astrological');
    });

    test('analyzes recipe domain context', async () => {
      const context = createContext(
        'const ingredient: unknown = data;',
        {
          filePath: 'src/data/ingredients/herbs.ts',
          domainContext: {
            domain: CodeDomain.RECIPE,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          }
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.suggestedReplacement).toBe('Ingredient | Recipe');
    });
  });

  describe('Batch Processing', () => {
    test('processes multiple contexts in batch', async () => {
      const contexts = [
        createContext('const items: unknown[] = [];'),
        createContext('} catch (error: unknown) {'),
        createContext('const data: Record<string, unknown> = {};')
      ];

      const results = await classifier.classifyBatch(contexts);

      expect(results).toHaveLength(3);
      expect(results[0].isIntentional).toBe(false); // array type
      expect(results[1].isIntentional).toBe(true);  // error handling
      expect(results[2].isIntentional).toBe(false); // record type
    });

    test('handles classification errors gracefully in batch', async () => {
      const contexts = [
        createContext('const valid: unknown[] = [];'),
        // This would cause an error in a real scenario
        createContext('') // empty context
      ];

      const results = await classifier.classifyBatch(contexts);

      expect(results).toHaveLength(2);
      expect(results[0].isIntentional).toBe(false);
      // Second result should be default classification (empty context gets default)
      expect(results[1].isIntentional).toBe(false); // Default unintentional
      expect(results[1].confidence).toBeLessThan(0.7); // Low confidence default
    });
  });

  describe('Contextual Analysis', () => {
    test('analyzes surrounding code context for error handling', async () => {
      const context = createContext(
        'const error: unknown = e;',
        {
          surroundingLines: [
            'try {',
            '  performOperation();',
            '} catch (e) {'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.ERROR_HANDLING);
      expect(result.reasoning).toContain('error handling context');
    });

    test('analyzes file type context', async () => {
      const context = createContext(
        'const mockData: unknown = {};',
        {
          filePath: 'src/components/__tests__/Component.test.tsx',
          isInTestFile: true
        }
      );

      const result = await classifier.classify(context);

      expect(result.reasoning).toContain('test file');
    });

    test('detects API interaction context', async () => {
      const context = createContext(
        'const response: unknown = data;',
        {
          surroundingLines: [
            'const response = await fetch("/api/data");',
            'const data = await response.json();'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.EXTERNAL_API);
      expect(result.reasoning).toContain('API interaction context');
    });
  });

  describe('Enhanced Domain-Specific Analysis', () => {
    test('analyzes astrological planetary position patterns', async () => {
      const context = createContext(
        'const positions: unknown = planetaryData;',
        {
          filePath: 'src/calculations/planetary/positions.ts',
          domainContext: {
            domain: CodeDomain.ASTROLOGICAL,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          },
          surroundingLines: [
            'const planetaryData = await getReliablePlanetaryPositions();',
            'const transitDates = validateTransitDate(planet, date, sign);'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.85);
      expect(result.reasoning).toContain('planetary position data');
    });

    test('analyzes recipe ingredient patterns', async () => {
      const context = createContext(
        'const ingredient: unknown = data;',
        {
          filePath: 'src/data/ingredients/herbs.ts',
          domainContext: {
            domain: CodeDomain.RECIPE,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          },
          surroundingLines: [
            'const ingredientData = await fetchIngredientInfo();',
            'const elementalProperties = calculateElementalBalance();'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.suggestedReplacement).toBe('Ingredient');
      expect(result.reasoning).toContain('Ingredient interface type');
    });

    test('analyzes campaign system configuration', async () => {
      const context = createContext(
        'const config: unknown = campaignSettings;',
        {
          filePath: 'src/services/campaign/CampaignController.ts',
          domainContext: {
            domain: CodeDomain.CAMPAIGN,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          },
          surroundingLines: [
            'const campaignSettings = loadDynamicConfig();',
            'const adaptiveStrategy = adjustCampaignBehavior();'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.85);
      expect(result.reasoning).toContain('dynamic behavior adaptation');
    });

    test('analyzes service layer external integration', async () => {
      const context = createContext(
        'const serviceResponse: unknown = response;',
        {
          filePath: 'src/services/ExternalApiService.ts',
          domainContext: {
            domain: CodeDomain.SERVICE,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          },
          surroundingLines: [
            'const response = await externalService.call();',
            'const mappedData = transformServiceResponse(response);'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.EXTERNAL_API);
      expect(result.reasoning).toContain('External service integration');
    });
  });

  describe('Enhanced Documentation Analysis', () => {
    test('detects ESLint disable comments with explanations', async () => {
      const context = createContext(
        'const data: unknown = response;',
        {
          hasExistingComment: true,
          existingComment: '// eslint-disable-next-line @typescript-eslint/no-explicit-any -- External API response structure unknown'
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
      expect(result.requiresDocumentation).toBe(false);
    });

    test('detects flexible typing documentation', async () => {
      const context = createContext(
        'const config: unknown = settings;',
        {
          hasExistingComment: true,
          existingComment: '// Flexible typing needed for dynamic configuration'
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(true);
    });

    test('ignores TODO/FIXME comments as intentional markers', async () => {
      const context = createContext(
        'const data: unknown = response;',
        {
          hasExistingComment: true,
          existingComment: '// TODO: Fix this any type when API schema is available'
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false); // TODO indicates temporary usage
    });
  });

  describe('Function Context Analysis', () => {
    test('analyzes function parameter any types', async () => {
      const context = createContext(
        'function process(data: unknown) {',
        {
          surroundingLines: [
            'function process(data: unknown) {',
            '  return data.toString();',
            '}'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.FUNCTION_PARAM);
      expect(result.suggestedReplacement).toBe('string');
    });

    test('analyzes arrow function return types', async () => {
      const context = createContext(
        'const fn = (): unknown => {',
        {
          surroundingLines: [
            'const fn = (): unknown => {',
            '  return { id: 1, name: "test" };',
            '}'
          ]
        }
      );

      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.category).toBe(AnyTypeCategory.RETURN_TYPE);
      expect(result.suggestedReplacement).toBe('Record<string, unknown>');
    });
  });

  describe('Confidence Scoring', () => {
    test('provides high confidence for clear patterns', async () => {
      const context = createContext('const items: unknown[] = [];');
      const result = await classifier.classify(context);

      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('provides moderate confidence for contextual patterns', async () => {
      const context = createContext(
        'const data: unknown = value;',
        {
          surroundingLines: ['const response = await fetch("/api");']
        }
      );

      const result = await classifier.classify(context);

      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.confidence).toBeLessThan(0.9);
    });

    test('provides low confidence for unclear patterns', async () => {
      const context = createContext('const value: unknown = something;');
      const result = await classifier.classify(context);

      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty code snippet', async () => {
      const context = createContext('');
      const result = await classifier.classify(context);

      expect(result.isIntentional).toBe(false);
      expect(result.confidence).toBeLessThan(0.7);
    });

    test('handles complex nested any types', async () => {
      const context = createContext('const complex: Record<string, unknown[]> = {};');
      const result = await classifier.classify(context);

      // Should detect the Record pattern
      expect(result.category).toBe(AnyTypeCategory.RECORD_TYPE);
    });

    test('handles classification errors gracefully', async () => {
      // Mock a scenario that would cause an error
      const context = createContext('const test: unknown = value;');

      // Spy on the internal method to throw an error
      const originalMethod = classifier['analyzeSurroundingCodeContext'];
      jest.spyOn(classifier as unknown, 'analyzeSurroundingCodeContext').mockImplementation(() => {
        throw new Error('Test error');
      });

      await expect(classifier.classify(context)).rejects.toThrow('Failed to classify any type');

      // Restore the original method
      (classifier as unknown).analyzeSurroundingCodeContext = originalMethod;
    });

    test('handles malformed code snippets', async () => {
      const malformedContexts = [
        createContext('const incomplete: unknown'),
        createContext('function broken(param: unknown'),
        createContext('} catch (error: unknown'),
        createContext('const weird: unknown = {'),
        createContext('return data as unknown;')
      ];

      for (const context of malformedContexts) {
        const result = await classifier.classify(context);
        expect(result).toBeDefined();
        expect(typeof result.isIntentional).toBe('boolean');
        expect(typeof result.confidence).toBe('number');
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    });

    test('handles very long code snippets', async () => {
      const longSnippet = 'const veryLongVariableName: unknown = ' + 'x'.repeat(1000) + ';';
      const context = createContext(longSnippet);

      const result = await classifier.classify(context);
      expect(result).toBeDefined();
      expect(result.reasoning).toBeDefined();
    });

    test('handles unicode and special characters', async () => {
      const unicodeContext = createContext('const 测试: unknown = "unicode";');
      const result = await classifier.classify(unicodeContext);

      expect(result).toBeDefined();
      expect(result.isIntentional).toBe(false);
    });

    test('handles deeply nested surrounding lines', async () => {
      const context = createContext(
        'const data: unknown = response;',
        {
          surroundingLines: Array(50).fill('  // nested comment line')
        }
      );

      const result = await classifier.classify(context);
      expect(result).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Performance and Stress Testing', () => {
    test('handles large batch processing efficiently', async () => {
      const largeBatch = Array(100).fill(null).map((_, i) =>
        createContext(`const item${i}: unknown[] = [];`)
      );

      const startTime = Date.now();
      const results = await classifier.classifyBatch(largeBatch);
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      // All should be classified as unintentional array types
      results.forEach(result => {
        expect(result.isIntentional).toBe(false);
        expect(result.category).toBe(AnyTypeCategory.ARRAY_TYPE);
      });
    });

    test('maintains consistency across repeated classifications', async () => {
      const context = createContext('const data: Record<string, unknown> = {};');

      const results = await Promise.all(
        Array(10).fill(null).map(() => classifier.classify(context))
      );

      // All results should be identical
      const firstResult = results[0];
      results.forEach(result => {
        expect(result.isIntentional).toBe(firstResult.isIntentional);
        expect(result.category).toBe(firstResult.category);
        expect(result.confidence).toBeCloseTo(firstResult.confidence, 2);
      });
    });

    test('handles concurrent classification requests', async () => {
      const contexts = [
        createContext('const items: unknown[] = [];'),
        createContext('} catch (error: unknown) {'),
        createContext('const config: Record<string, unknown> = {};'),
        createContext('const mockFn = jest.fn() as unknown;', { isInTestFile: true }),
        createContext('const response: unknown = await fetch("/api");')
      ];

      const results = await Promise.all(
        contexts.map(context => classifier.classify(context))
      );

      expect(results).toHaveLength(5);
      expect(results[0].category).toBe(AnyTypeCategory.ARRAY_TYPE);
      expect(results[1].category).toBe(AnyTypeCategory.ERROR_HANDLING);
      expect(results[2].category).toBe(AnyTypeCategory.RECORD_TYPE);
      expect(results[3].category).toBe(AnyTypeCategory.TEST_MOCK);
      expect(results[4].category).toBe(AnyTypeCategory.EXTERNAL_API);
    });
  });

  describe('Integration with Domain Context', () => {
    test('integrates with domain analyzer for complex scenarios', async () => {
      const astroContext = createContext(
        'const planetaryData: unknown = await getReliablePlanetaryPositions();',
        {
          filePath: 'src/calculations/planetary/positions.ts',
          domainContext: {
            domain: CodeDomain.ASTROLOGICAL,
            intentionalityHints: [
              {
                reason: 'Planetary position data requires flexible typing',
                confidence: 0.9,
                suggestedAction: 'preserve'
              }
            ],
            suggestedTypes: ['PlanetaryPosition'],
            preservationReasons: ['External API compatibility']
          }
        }
      );

      const result = await classifier.classify(astroContext);
      expect(result.isIntentional).toBe(true);
      expect(result.reasoning).toContain('Astrological');
    });

    test('handles conflicting domain signals correctly', async () => {
      const conflictContext = createContext(
        'const testData: unknown[] = [];',
        {
          filePath: 'src/calculations/test-helper.ts', // Mixed signals: calculations + test
          isInTestFile: true,
          domainContext: {
            domain: CodeDomain.TEST,
            intentionalityHints: [],
            suggestedTypes: [],
            preservationReasons: []
          }
        }
      );

      const result = await classifier.classify(conflictContext);
      // Test context should take precedence for array types
      expect(result.isIntentional).toBe(true);
      expect(result.category).toBe(AnyTypeCategory.TEST_MOCK);
    });
  });
});

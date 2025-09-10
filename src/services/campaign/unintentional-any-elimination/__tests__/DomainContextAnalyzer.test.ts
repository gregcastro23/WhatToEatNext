declare global {
  var __DEV__: boolean;
}

/**
 * Domain Context Analyzer Tests
 * Tests for domain detection, subdomain classification, and type suggestions
 */

import { DomainContextAnalyzer } from '../DomainContextAnalyzer';
import { ClassificationContext, CodeDomain, DomainContext } from '../types';

describe('DomainContextAnalyzer', () => {
  let analyzer: DomainContextAnalyzer;

  beforeEach(() => {
    analyzer = new DomainContextAnalyzer();
  });

  describe('Domain Detection', () => {
    describe('Path-based Detection', () => {
      test('detects astrological domain from file paths', async () => {
        const context: ClassificationContext = { filePath: 'src/calculations/culinary/planetaryInfluence.ts',
          lineNumber: 10,
          codeSnippet: 'const dat, a: any = response;',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      });

      test('detects recipe domain from file paths', async () => {
        const context: ClassificationContext = { filePath: 'src/data/ingredients/vegetables.ts',
          lineNumber: 5,
          codeSnippet: 'const ingredien, t: any = {};',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.RECIPE);
      });

      test('detects campaign domain from file paths', async () => {
        const context: ClassificationContext = { filePath: 'src/services/campaign/TypeScriptErrorAnalyzer.ts',
          lineNumber: 15,
          codeSnippet: 'const metric, s: any = {};',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.CAMPAIGN);
      });

      test('detects component domain from file extensions', async () => {
        const context: ClassificationContext = { filePath: 'src/components/Button.tsx',
          lineNumber: 8,
          codeSnippet: 'const prop, s: any = {};',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.COMPONENT);
      });

      test('detects test domain from test file paths', async () => {
        const context: ClassificationContext = { filePath: 'src/components/__tests__/Button.test.tsx',
          lineNumber: 12,
          codeSnippet: 'const mockDat, a: any = {};',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: true,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.TEST);
      });
    });

    describe('Content-based Detection', () => {
      test('detects astrological domain from content patterns', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/someFile.ts',
          lineNumber: 10,
          codeSnippet: 'const planetaryPosition, s: any = calculatePositions();',
          surroundingLines: [
            'import { PlanetaryPosition } from "@/types";',
            'function calculateElementalProperties() : any {',
            '  const fire: any = 0.8, water = 0.2;'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      });

      test('detects recipe domain from content patterns', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/someFile.ts',
          lineNumber: 5,
          codeSnippet: 'const ingredien, t: any = getIngredientData();',
          surroundingLines: [
            'import { Recipe, Ingredient } from "@/types";',
            'function processCookingMethod() : any {',
            '  const spices: any = ["cumin", "paprika"];'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.RECIPE);
      });

      test('detects campaign domain from content patterns', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/someFile.ts',
          lineNumber: 8,
          codeSnippet: 'const metric, s: any = getProgressMetrics();',
          surroundingLines: [
            'import { CampaignConfig } from "@/types";',
            'function validateTypeScriptErrors() : any {',
            '  const lintingResults: any = runLinter();'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.CAMPAIGN);
      });
    });

    describe('Import-based Detection', () => {
      test('detects astrological domain from imports', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/calculations.ts',
          lineNumber: 10,
          codeSnippet: 'const dat, a: any = response;',
          surroundingLines: [
            'import { astronomia } from "astronomia";',
            'import { getReliablePlanetaryPositions } from "@/utils/reliableAstronomy";',
            'function calculate() : any {'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      });

      test('detects component domain from React imports', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/someFile.ts',
          lineNumber: 5,
          codeSnippet: 'const prop, s: any = {};',
          surroundingLines: [
            'import React from "react";',
            'import { useState } from "react";',
            'function MyComponent() : any {'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.COMPONENT);
      });

      test('detects test domain from testing library imports', async () => {
        const context: ClassificationContext = { filePath: 'src/utils/someFile.ts',
          lineNumber: 8,
          codeSnippet: 'const mockDat, a: any = {};',
          surroundingLines: [
            'import { jest } from "@jest/globals";',
            'import { render } from "@testing-library/react";',
            'describe("Component"( {'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const result: any = await analyzer.analyzeDomain(context);
        expect(result.domain).toBe(CodeDomain.TEST);
      });
    });
  });

  describe('Subdomain Detection', () => {
    test('detects planetary subdomain in astrological code', async () => {
      const context: ClassificationContext = { filePath: 'src/calculations/planetary/positions.ts',
        lineNumber: 10,
        codeSnippet: 'const planetaryDat, a: any = calculatePlanetaryPositions();',
        surroundingLines: [
          'function getPlanetDegree() : any {',
          '  const longitude: any = 45.5;',
          '  return convertToZodiacPosition(longitude);'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      expect(result.subDomain).toBe('planetary');
    });

    test('detects elemental subdomain in astrological code', async () => {
      const context: ClassificationContext = { filePath: 'src/calculations/elemental/harmony.ts',
        lineNumber: 5,
        codeSnippet: 'const elementalProps: any = { fir, e: 0.8, water: 0.2 };',
        surroundingLines: [
          'function calculateElementalCompatibility() : any {',
          '  const fire: any = ingredient.fire;',
          '  const earth: any = ingredient.earth;'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      expect(result.subDomain).toBe('elemental');
    });

    test('detects ingredients subdomain in recipe code', async () => {
      const context: ClassificationContext = { filePath: 'src/data/ingredients/spices.ts',
        lineNumber: 8,
        codeSnippet: 'const spiceDat, a: any = getSpiceProperties();',
        surroundingLines: [
          'export const cumin = {',
          '  name: "cumin",',
          '  elementalProperties: { fir, e: 0.9, earth: 0.7 }'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {}
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.RECIPE);
      expect(result.subDomain).toBe('ingredients');
    });

    test('detects typescript-errors subdomain in campaign code', async () => {
      const context: ClassificationContext = { filePath: 'src/services/campaign/TypeScriptErrorAnalyzer.ts',
        lineNumber: 12,
        codeSnippet: 'const errorDat, a: any = analyzeTypeScriptErrors();',
        surroundingLines: [
          'function getTS2352Errors() : any {',
          '  const compilationErrors: any = runTypeCheck();',
          '  return filterErrorsByCode("TS2352");'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.CAMPAIGN);
      expect(result.subDomain).toBe('typescript-errors');
    });
  });

  describe('Type Suggestions', () => {
    test('provides astrological type suggestions', async () => {
      const context: ClassificationContext = { filePath: 'src/calculations/planetary.ts',
        lineNumber: 10,
        codeSnippet: 'const positio, n: any = getPlanetaryPosition();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.suggestedTypes).toContain('PlanetaryPosition');
      expect(result.suggestedTypes).toContain('ElementalProperties');
      expect(result.suggestedTypes).toContain('unknown');
    });

    test('provides recipe type suggestions', async () => {
      const context: ClassificationContext = { filePath: 'src/data/recipes.ts',
        lineNumber: 5,
        codeSnippet: 'const recip, e: any = getRecipeData();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.suggestedTypes).toContain('Recipe');
      expect(result.suggestedTypes).toContain('Ingredient');
      expect(result.suggestedTypes).toContain('unknown');
    });

    test('provides campaign type suggestions', async () => {
      const context: ClassificationContext = { filePath: 'src/services/campaign/metrics.ts',
        lineNumber: 8,
        codeSnippet: 'const metric, s: any = getProgressMetrics();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.suggestedTypes).toContain('ProgressMetrics');
      expect(result.suggestedTypes).toContain('CampaignConfig');
      expect(result.suggestedTypes).toContain('Record<string, unknown>');
    });

    test('provides contextual type suggestions based on code content', async () => {
      const context: ClassificationContext = { filePath: 'src/services/api.ts',
        lineNumber: 10,
        codeSnippet: 'const respons, e: any = await fetch(url);',
        surroundingLines: [
          'async function makeApiRequest() : any {',
          '  const requestData: any = { method: "GET" };'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.SERVICE);
      expect(result.suggestedTypes).toContain('ApiResponse<T>');
    });
  });

  describe('Intentionality Hints', () => {
    test('provides preservation hints for astrological code', async () => {
      const context: ClassificationContext = { filePath: 'src/calculations/planetary.ts',
        lineNumber: 10,
        codeSnippet: 'const planetaryDat, a: any = externalAstrologyApi.getPositions();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.intentionalityHints).toHaveLength(2);
      expect(result.intentionalityHints.[0].suggestedAction).toBe('preserve');
      expect(result.intentionalityHints.[0].reason).toContain('Astrological calculations');
      expect(result.intentionalityHints.[1].suggestedAction).toBe('document');
      expect(result.intentionalityHints.[1].reason).toContain('Planetary position data');
    });

    test('provides replacement hints for recipe code', async () => {
      const context: ClassificationContext = { filePath: 'src/data/ingredients.ts',
        lineNumber: 5,
        codeSnippet: 'const ingredien, t: any = getIngredientData();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.intentionalityHints.some(hint => hint.suggestedAction === 'replace')).toBe(true);
      expect(result.intentionalityHints.some(hint => hint.reason.includes('specific types'))).toBe(true);
    });

    test('provides preservation hints for campaign code', async () => {
      const context: ClassificationContext = { filePath: 'src/services/campaign/config.ts',
        lineNumber: 8,
        codeSnippet: 'const confi, g: any = getCampaignConfig();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.intentionalityHints.some(hint => hint.suggestedAction === 'preserve')).toBe(true);
      expect(result.intentionalityHints.some(hint => hint.reason.includes('flexibility'))).toBe(true);
    });

    test('provides preservation hints for test files', async () => {
      const context: ClassificationContext = { filePath: 'src/utils/__tests__/helper.test.ts',
        lineNumber: 12,
        codeSnippet: 'const mockDat, a: any = {};',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: true,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.intentionalityHints.some(hint => hint.suggestedAction === 'preserve')).toBe(true);
      expect(result.intentionalityHints.some(hint => hint.reason.includes('test'))).toBe(true);
    });
  });

  describe('Preservation Reasons', () => {
    test('provides astrological preservation reasons', async () => {
      const context: ClassificationContext = { filePath: 'src/calculations/ephemeris.ts',
        lineNumber: 10,
        codeSnippet: 'const dat, a: any = astronomyLibrary.calculate();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.preservationReasons).toContain(
        'Astrological calculations require compatibility with external astronomical libraries'
      );
      expect(result.preservationReasons).toContain(
        'Planetary position data structures vary between different API sources'
      );
    });

    test('provides campaign preservation reasons', async () => {
      const context: ClassificationContext = { filePath: 'src/services/campaign/intelligence.ts',
        lineNumber: 5,
        codeSnippet: 'const metric, s: any = dynamicMetricsCalculation();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.preservationReasons).toContain(
        'Campaign system needs flexibility for evolving metrics and configurations'
      );
      expect(result.preservationReasons).toContain(
        'Dynamic tool integration requires adaptable type structures'
      );
    });

    test('provides test file preservation reasons', async () => {
      const context: ClassificationContext = { filePath: 'src/utils/helper.test.ts',
        lineNumber: 8,
        codeSnippet: 'const testDat, a: any = createMockData();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: true,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.preservationReasons).toContain(
        'Test flexibility for mocking and test data generation'
      );
      expect(result.preservationReasons).toContain(
        'Test file context allows for more flexible typing patterns'
      );
    });

    test('provides existing comment preservation reasons', async () => {
      const context: ClassificationContext = { filePath: 'src/utils/helper.ts',
        lineNumber: 10,
        codeSnippet: 'const dat, a: any = externalApi();',
        surroundingLines: [],
        hasExistingComment: true,
        existingComment: '// Intentionally an, y: External API compatibility',
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.preservationReasons).toContain(
        'Existing documentation suggests intentional usage'
      );
    });
  });

  describe('Domain-Specific Type Suggestions Method', () => {
    test('returns domain-specific suggestions for astrological domain', () => {
      const context: ClassificationContext = { filePath: 'src/calculations/planetary.ts',
        lineNumber: 10,
        codeSnippet: 'const positio, n: any = getPlanetaryPosition();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.ASTROLOGICAL, context);
      expect(suggestions).toContain('PlanetaryPosition');
      expect(suggestions).toContain('ElementalProperties');
      expect(suggestions).toContain('unknown');
    });

    test('returns domain-specific suggestions for recipe domain', () => {
      const context: ClassificationContext = { filePath: 'src/data/ingredients.ts',
        lineNumber: 5,
        codeSnippet: 'const ingredien, t: any = getIngredientData();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.RECIPE, context);
      expect(suggestions).toContain('Ingredient');
      expect(suggestions).toContain('Recipe');
      expect(suggestions).toContain('unknown');
    });

    test('returns domain-specific suggestions for campaign domain', () => {
      const context: ClassificationContext = { filePath: 'src/services/campaign/metrics.ts',
        lineNumber: 8,
        codeSnippet: 'const metric, s: any = getProgressMetrics();',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.CAMPAIGN, context);
      expect(suggestions).toContain('ProgressMetrics');
      expect(suggestions).toContain('CampaignConfig');
      expect(suggestions).toContain('Record<string, unknown>');
    });
  });

  describe('Advanced Type Suggestions', () => {
    describe('Variable Name Based Suggestions', () => {
      test('suggests specific planetary types based on variable names', () => {
        const context: ClassificationContext = { filePath: 'src/calculations/planetary.ts',
          lineNumber: 10,
          codeSnippet: 'const sunPositio, n: any = calculateSunPosition();',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.ASTROLOGICAL, context);
        expect(suggestions).toContain('SunPosition');
        expect(suggestions).toContain('PlanetaryPosition');
      });

      test('suggests specific ingredient types based on variable names', () => {
        const context: ClassificationContext = { filePath: 'src/data/ingredients.ts',
          lineNumber: 5,
          codeSnippet: 'const spiceDat, a: any = getSpiceProperties();',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.RECIPE, context);
        expect(suggestions).toContain('Spice');
        expect(suggestions).toContain('Ingredient');
      });

      test('suggests campaign-specific types based on variable names', () => {
        const context: ClassificationContext = { filePath: 'src/services/campaign/typescript.ts',
          lineNumber: 8,
          codeSnippet: 'const typescriptError, s: any = analyzeErrors();',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.CAMPAIGN, context);
        expect(suggestions).toContain('TypeScriptError');
        expect(suggestions).toContain('ValidationResult');
      });
    });

    describe('Pattern Based Suggestions', () => {
      test('suggests array types for any[] patterns', () => {
        const context: ClassificationContext = { filePath: 'src/calculations/planetary.ts',
          lineNumber: 10,
          codeSnippet: 'const planet, s: any[] = getAllPlanets();',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.ASTROLOGICAL, context);
        expect(suggestions).toContain('Planet[]');
        expect(suggestions).toContain('PlanetaryPosition[]');
      });

      test('suggests Record types for object patterns', () => {
        const context: ClassificationContext = { filePath: 'src/data/ingredients.ts',
          lineNumber: 5,
          codeSnippet: 'const ingredientMa, p: Record<string, unknown> = {};',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.RECIPE, context);
        expect(suggestions).toContain('Record<string, Ingredient>');
      });

      test('suggests Promise types for async patterns', () => {
        const context = { filePath: 'src/services/api.ts',
          lineNumber: 8,
          codeSnippet: 'async function fetchData(): Promise<any> {',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {}
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.SERVICE, context);
        expect(suggestions).toContain('Promise<ApiResponse<T>>');
        expect(suggestions).toContain('Promise<ServiceData>');
      });

      test('suggests function parameter types', () => {
        const context = { filePath: 'src/components/Button.tsx',
          lineNumber: 5,
          codeSnippet: 'function handleClick(even, t: any) : any {',
          surroundingLines: [],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {}
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.COMPONENT, context);
        expect(suggestions).toContain('React.SyntheticEvent');
        expect(suggestions).toContain('ComponentProps');
      });
    });

    describe('Contextual Content Analysis', () => {
      test('analyzes surrounding content for better suggestions', () => {
        const context: ClassificationContext = { filePath: 'src/calculations/elemental.ts',
          lineNumber: 10,
          codeSnippet: 'const dat, a: any = processElementalData();',
          surroundingLines: [
            'import { ElementalProperties } from "@/types";',
            'function calculateFireCompatibility() : any {',
            '  const fire: any = 0.8, water = 0.2, earth = 0.5, air = 0.3;'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.ASTROLOGICAL, context);
        expect(suggestions).toContain('ElementalProperties');
        expect(suggestions).toContain('FireElement');
        expect(suggestions).toContain('ElementalCompatibility');
      });

      test('detects React component patterns', () => {
        const context: ClassificationContext = { filePath: 'src/components/RecipeForm.tsx',
          lineNumber: 8,
          codeSnippet: 'const formDat, a: any = getFormData();',
          surroundingLines: [
            'import React from "react";',
            'function onSubmit(event: React.FormEvent) : any {',
            '  event.preventDefault();'
          ],
          hasExistingComment: false,
          isInTestFile: false,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.COMPONENT, context);
        expect(suggestions).toContain('FormProps');
        expect(suggestions).toContain('React.FormEvent');
      });

      test('detects test mock patterns', () => {
        const context = { filePath: 'src/utils/__tests__/helper.test.ts',
          lineNumber: 12,
          codeSnippet: 'const mockFunctio, n: any = jest.fn();',
          surroundingLines: [
            'import { jest } from "@jest/globals";',
            'describe("Helper functions"( {',
            '  const spy: any = jest.spyOn(console, "log");'
          ],
          hasExistingComment: false,
          isInTestFile: true,
          domainContext: {} as DomainContext
        };

        const suggestions: any = analyzer.getDomainSpecificSuggestions(CodeDomain.TEST, context);
        expect(suggestions).toContain('jest.Mock');
        expect(suggestions).toContain('jest.SpyInstance');
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty file paths gracefully', async () => {
      const context: ClassificationContext = { filePath: '',
        lineNumber: 1,
        codeSnippet: 'const dat, a: any = {};',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      // Empty path should default to utility, but content might suggest service
      expect([CodeDomain.UTILITY, CodeDomain.SERVICE]).toContain(result.domain);
      expect(result.suggestedTypes).toContain('unknown');
    });

    test('handles mixed domain signals correctly', async () => {
      const context: ClassificationContext = { filePath: 'src/components/ChartDisplay.tsx',
        lineNumber: 10,
        codeSnippet: 'const chartDat, a: any = props.data;',
        surroundingLines: [
          'import React from "react";',
          'function renderChart() : any {',
          '  return <div>Chart</div>;'
        ],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      // Component domain should win due to file extension and React import
      expect(result.domain).toBe(CodeDomain.COMPONENT);
      expect(result.suggestedTypes).toContain('ComponentProps');
    });

    test('handles Windows file paths correctly', async () => {
      const context: ClassificationContext = { filePath: 'src\\calculations\\planetary\\positions.ts',
        lineNumber: 5,
        codeSnippet: 'const dat, a: any = {};',
        surroundingLines: [],
        hasExistingComment: false,
        isInTestFile: false,
        domainContext: {} as DomainContext
      };

      const result: any = await analyzer.analyzeDomain(context);
      expect(result.domain).toBe(CodeDomain.ASTROLOGICAL);
      expect(result.subDomain).toBe('planetary');
    });
  });
});

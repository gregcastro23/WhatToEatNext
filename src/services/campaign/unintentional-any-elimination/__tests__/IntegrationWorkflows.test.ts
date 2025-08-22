/**
 * Integration Tests for End-to-End Workflows
 * Tests complete classification and replacement workflows, campaign system integration,
 * safety protocol activation, and realistic batch processing scenarios
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import { AnyTypeClassifier } from '../AnyTypeClassifier';
import { DomainContextAnalyzer } from '../DomainContextAnalyzer';
import { ProgressiveImprovementEngine } from '../ProgressiveImprovementEngine';
import { SafeTypeReplacer } from '../SafeTypeReplacer';
import { UnintentionalAnyEliminationCampaign } from '../UnintentionalAnyEliminationCampaign';
import {
    AnyTypeCategory,
    ClassificationContext,
    CodeDomain,
    UnintentionalAnyConfig
} from '../types';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('Integration Workflows', () => {
  let classifier: AnyTypeClassifier;
  let replacer: SafeTypeReplacer;
  let analyzer: DomainContextAnalyzer;
  let engine: ProgressiveImprovementEngine;
  let campaign: UnintentionalAnyEliminationCampaign;

  beforeEach(() => {
    jest.clearAllMocks();

    classifier = new AnyTypeClassifier();
    replacer = new SafeTypeReplacer('./.test-backups', 0.7, 30000, 3);
    analyzer = new DomainContextAnalyzer();
    engine = new ProgressiveImprovementEngine();
    campaign = new UnintentionalAnyEliminationCampaign();

    // Mock file system defaults
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockImplementation(() => undefined as unknown);
    mockFs.readFileSync.mockReturnValue('const data: unknown = {};');
    mockFs.writeFileSync.mockImplementation(() => undefined);
    mockFs.readdirSync.mockReturnValue([]);
    mockFs.statSync.mockReturnValue({ mtime: new Date() } as unknown);

    // Mock successful TypeScript compilation by default
    mockExecSync.mockImplementation((command) => {
      if (command.includes('grep -c "error TS"')) {
        const error = new Error('No matches') as unknown;
        error.status = 1;
        throw error;
      }
      if (command.includes('grep -r -l')) {
        return 'src/test1.ts\nsrc/test2.ts\n';
      }
      return '';
    });
  });

  describe('Complete Classification and Replacement Workflows', () => {
    test('should execute complete workflow from classification to replacement', async () => {
      // Setup test scenario with various any types
      const testFiles = {
        'src/arrays.ts': 'const items: unknown[] = []; const data: Array<unknown> = [];',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
        'src/records.ts': 'const config: Record<string, unknown> = {}; const map: { [key: string]: unknown } = {};',
        'src/functions.ts': 'function process(param: unknown): any { return param; }',
        'src/errors.ts': '} catch (error: unknown) { console.log(error); }',
        'src/api.ts': 'const response: unknown = await fetch("/api/data");'
      };

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        const fileName = path.toString();
        for (const [file, content] of Object.entries(testFiles)) {
          if (fileName.includes(file.split('/').pop()?.replace('.ts', ''))) {
            return content;
          }
        }
        return 'backup content';
      });

      // Step 1: Analyze domain context for each file
      const contexts: ClassificationContext[] = [];
      for (const [filePath, content] of Object.entries(testFiles)) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(': unknown')) {
            const context: ClassificationContext = {
              filePath,
              lineNumber: i + 1,
              codeSnippet: lines[i],
              surroundingLines: [],
              hasExistingComment: false,
              isInTestFile: false,
              domainContext: await analyzer.analyzeDomain({
                filePath,
                lineNumber: i + 1,
                codeSnippet: lines[i],
                surroundingLines: [],
                hasExistingComment: false,
                isInTestFile: false,
                domainContext: { domain: CodeDomain.UTILITY, intentionalityHints: [], suggestedTypes: [], preservationReasons: [] }
              })
            };
            contexts.push(context);
          }
        }
      }

      expect(contexts.length).toBeGreaterThan(0);

      // Step 2: Classify all any types
      const classifications = await classifier.classifyBatch(contexts);
      expect(classifications).toHaveLength(contexts.length);

      // Verify classification results
      const arrayClassifications = classifications.filter(c => c.category === AnyTypeCategory.ARRAY_TYPE);
      const recordClassifications = classifications.filter(c => c.category === AnyTypeCategory.RECORD_TYPE);
      const errorClassifications = classifications.filter(c => c.category === AnyTypeCategory.ERROR_HANDLING);
      const apiClassifications = classifications.filter(c => c.category === AnyTypeCategory.EXTERNAL_API);

      expect(arrayClassifications.length).toBeGreaterThan(0);
      expect(recordClassifications.length).toBeGreaterThan(0);
      expect(errorClassifications.length).toBeGreaterThan(0);
      expect(apiClassifications.length).toBeGreaterThan(0);

      // Step 3: Create replacements for unintentional types
      const replacements = classifications
        .filter(c => !c.isIntentional && c.suggestedReplacement)
        .map((c, i) => ({
          original: 'any',
          replacement: c.suggestedReplacement!,
          filePath: contexts[i].filePath,
          lineNumber: contexts[i].lineNumber,
          confidence: c.confidence,
          validationRequired: true
        }));

      expect(replacements.length).toBeGreaterThan(0);

      // Step 4: Apply replacements with safety validation
      const replacementResult = await replacer.processBatch(replacements);

      expect(replacementResult.success).toBe(true);
      expect(replacementResult.appliedReplacements.length).toBeGreaterThan(0);
      expect(replacementResult.rollbackPerformed).toBe(false);

      // Verify that intentional types (errors, API responses) were preserved
      const intentionalTypes = classifications.filter(c => c.isIntentional);
      expect(intentionalTypes.length).toBeGreaterThan(0);
      expect(intentionalTypes.some(c => c.category === AnyTypeCategory.ERROR_HANDLING)).toBe(true);
      expect(intentionalTypes.some(c => c.category === AnyTypeCategory.EXTERNAL_API)).toBe(true);
    });

    test('should handle mixed success and failure scenarios', async () => {
      const mixedScenarios = {
        'src/safe.ts': 'const items: unknown[] = []; const data: Record<string, unknown> = {};',
        'src/risky.ts': 'const complex: unknown = getComplexObject(); function dangerous(param: unknown): any { return param; }',
        'src/intentional.ts': '} catch (error: any) { /* Intentionally any: error handling */ }'
      };

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        const fileName = path.toString();
        for (const [file, content] of Object.entries(mixedScenarios)) {
          if (fileName.includes(file.split('/').pop()?.replace('.ts', ''))) {
            return content;
          }
        }
        return 'backup content';
      });

      // Mock compilation to fail for risky replacements
      let compilationAttempts = 0;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('tsc')) {
          compilationAttempts++;
          if (compilationAttempts > 2) { // Fail after a few attempts
            const error = new Error('Compilation failed') as unknown;
            error.stdout = 'error TS2322: Type mismatch in dangerous function';
            throw error;
          }
        }
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      const config: UnintentionalAnyConfig = {
        maxFilesPerBatch: 3,
        targetReductionPercentage: 15,
        confidenceThreshold: 0.8,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'MODERATE',
        validationFrequency: 1
      };

      const batchResult = await engine.executeBatch(config);

      expect(batchResult.filesProcessed).toBeGreaterThan(0);
      expect(batchResult.replacementsAttempted).toBeGreaterThan(0);
      // Some replacements should succeed, others may fail due to compilation issues
      expect(batchResult.replacementsSuccessful).toBeGreaterThanOrEqual(0);

      if (batchResult.rollbacksPerformed > 0) {
        expect(batchResult.safetyScore).toBeLessThan(1.0);
      }
    });

    test('should preserve domain-specific intentional any types', async () => {
      const domainSpecificFiles = {
        'src/calculations/planetary/positions.ts': `
          const planetaryData: unknown = await getReliablePlanetaryPositions();
          const transitDates: unknown = validateTransitDate(planet, date, sign);
        `,
        'src/data/ingredients/spices.ts': `
          const spiceData: unknown = await fetchSpiceInfo();
          const ingredient: unknown = processIngredientData();
        `,
        'src/services/campaign/metrics.ts': `
          const campaignConfig: unknown = getDynamicConfig();
          const metrics: unknown = calculateProgressMetrics();
        `
      };

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        const fileName = path.toString();
        for (const [file, content] of Object.entries(domainSpecificFiles)) {
          if (fileName.includes(file.split('/').slice(-1)[0].replace('.ts', ''))) {
            return content;
          }
        }
        return 'backup content';
      });

      // Process each domain-specific file
      const results = [];
      for (const [filePath, content] of Object.entries(domainSpecificFiles)) {
        const lines = content.trim().split('\n').filter(line => line.trim());

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(': unknown')) {
            const context: ClassificationContext = {
              filePath,
              lineNumber: i + 1,
              codeSnippet: lines[i].trim(),
              surroundingLines: lines.slice(Math.max(0, i-1), i+2),
              hasExistingComment: false,
              isInTestFile: false,
              domainContext: await analyzer.analyzeDomain({
                filePath,
                lineNumber: i + 1,
                codeSnippet: lines[i].trim(),
                surroundingLines: [],
                hasExistingComment: false,
                isInTestFile: false,
                domainContext: { domain: CodeDomain.UTILITY, intentionalityHints: [], suggestedTypes: [], preservationReasons: [] }
              })
            };

            const classification = await classifier.classify(context);
            results.push({ context, classification });
          }
        }
      }

      // Verify domain-specific preservation
      const astrologicalResults = results.filter(r =>
        r.context.filePath.includes('planetary') || r.context.filePath.includes('calculations')
      );
      const recipeResults = results.filter(r =>
        r.context.filePath.includes('ingredients') || r.context.filePath.includes('spices')
      );
      const campaignResults = results.filter(r =>
        r.context.filePath.includes('campaign') || r.context.filePath.includes('metrics')
      );

      // Astrological domain should preserve most any types
      expect(astrologicalResults.some(r => r.classification.isIntentional)).toBe(true);

      // Recipe domain should suggest specific types for some cases
      expect(recipeResults.some(r => !r.classification.isIntentional && r.classification.suggestedReplacement)).toBe(true);

      // Campaign domain should preserve flexible configurations
      expect(campaignResults.some(r => r.classification.isIntentional)).toBe(true);
    });
  });

  describe('Campaign System Integration', () => {
    test('should integrate with existing campaign infrastructure', async () => {
      const campaignConfig: UnintentionalAnyConfig = {
        maxFilesPerBatch: 5,
        targetReductionPercentage: 20,
        confidenceThreshold: 0.85,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'HIGH',
        validationFrequency: 3
      };

      // Mock campaign execution
      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('test')) {
          return 'const items: unknown[] = []; const data: Record<string, unknown> = {};';
        }
        return 'backup content';
      });

      const campaignResult = await campaign.execute(campaignConfig);

      expect(campaignResult).toBeDefined();
      expect(campaignResult.totalAnyTypesAnalyzed).toBeGreaterThanOrEqual(0);
      expect(campaignResult.reductionAchieved).toBeGreaterThanOrEqual(0);
      expect(campaignResult.safetyEvents).toBeInstanceOf(Array);
      expect(campaignResult.validationResults).toBeInstanceOf(Array);
    });

    test('should follow campaign safety protocols', async () => {
      // Mock scenario that triggers safety protocols
      let errorCount = 0;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -c "error TS"')) {
          errorCount++;
          if (errorCount > 2) {
            return '15'; // Return increasing error count
          }
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        if (command.includes('grep -r -l')) {
          return 'src/problematic.ts\n';
        }
        return '';
      });

      mockFs.readFileSync.mockReturnValue('const dangerous: unknown = performRiskyOperation();');

      const campaignConfig: UnintentionalAnyConfig = {
        maxFilesPerBatch: 1,
        targetReductionPercentage: 10,
        confidenceThreshold: 0.7,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'MAXIMUM',
        validationFrequency: 1
      };

      const campaignResult = await campaign.execute(campaignConfig);

      expect(campaignResult.safetyEvents.length).toBeGreaterThan(0);
      expect(campaignResult.safetyEvents.some(event =>
        event.type === 'LOW_SAFETY_SCORE' || event.type === 'BATCH_FAILURE'
      )).toBe(true);
    });

    test('should integrate with progress tracking and metrics', async () => {
      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('metrics')) {
          return 'const progressData: unknown = getMetrics(); const config: Record<string, unknown> = {};';
        }
        return 'const items: unknown[] = [];';
      });

      const initialProgress = await engine.getProgressMetrics();
      expect(initialProgress).toBeDefined();
      expect(initialProgress.totalAnyTypes).toBeGreaterThanOrEqual(0);

      const batchResult = await engine.executeBatch({
        maxFilesPerBatch: 2,
        targetReductionPercentage: 15,
        confidenceThreshold: 0.8,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'MODERATE',
        validationFrequency: 5
      });

      const finalProgress = await engine.getProgressMetrics();
      expect(finalProgress).toBeDefined();

      const batchHistory = engine.getBatchHistory();
      expect(batchHistory).toContain(batchResult);
      expect(batchHistory.length).toBeGreaterThan(0);
    });
  });

  describe('Safety Protocol Activation and Rollback Scenarios', () => {
    test('should activate rollback on compilation failures', async () => {
      mockFs.readFileSync.mockReturnValue('const data: unknown = getValue();');

      // Mock compilation failure
      mockExecSync.mockImplementation((command) => {
        if (command.includes('tsc')) {
          const error = new Error('Compilation failed') as unknown;
          error.stdout = 'error TS2322: Type "unknown" is not assignable to type "string"';
          throw error;
        }
        return '';
      });

      const replacement = {
        original: 'any',
        replacement: 'unknown',
        filePath: 'src/test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('error TS2322');
    });

    test('should handle emergency rollback scenarios', async () => {
      const multipleReplacements = [
        {
          original: 'unknown[]',
          replacement: 'unknown[]',
          filePath: 'src/test1.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'any',
          replacement: 'string',
          filePath: 'src/test2.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        }
      ];

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('test1')) return 'const items: unknown[] = [];';
        if (path.includes('test2')) return 'const data: unknown = getValue();';
        return 'backup content';
      });

      // Mock overall build failure after individual replacements succeed
      let buildCheckCount = 0;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('tsc') && command.includes('--noEmit')) {
          buildCheckCount++;
          if (buildCheckCount > 1) { // Fail on overall build check
            const error = new Error('Overall build failed') as unknown;
            error.stdout = 'error TS2322: Multiple type conflicts detected';
            throw error;
          }
        }
        return '';
      });

      const result = await replacer.processBatch(multipleReplacements);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.compilationErrors).toContain('Multiple type conflicts detected');
    });

    test('should validate rollback integrity', async () => {
      const replacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'src/test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const originalContent = 'const items: unknown[] = [];';
      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('.backup')) {
          return originalContent;
        }
        return originalContent;
      });

      // Mock compilation failure to trigger rollback
      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        error.stdout = 'error TS2322: Type error';
        throw error;
      });

      const result = await replacer.applyReplacement(replacement);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);
      expect(result.backupPath).toBeDefined();

      // Verify backup was created and used for rollback
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.backup'),
        originalContent,
        'utf8'
      );
    });
  });

  describe('Realistic Batch Processing with Actual Codebase Samples', () => {
    test('should process realistic TypeScript codebase patterns', async () => {
      const realisticCodeSamples = {
        'src/components/RecipeCard.tsx': `
          import React from 'react';
          interface Props {
            recipe: unknown;
            onSelect: (recipe: unknown) => void;
          }
          export const RecipeCard: React.FC<Props> = ({ recipe, onSelect }) => {
            const handleClick = (event: unknown) => {
              event.preventDefault();
              onSelect(recipe);
            };
            return <div onClick={handleClick}>{recipe.name}</div>;
          };
        `,
        'src/services/ApiService.ts': `
          class ApiService {
            async fetchData(endpoint: string): Promise<unknown> {
              try {
                const response = await fetch(endpoint);
                const data: unknown = await response.json();
                return this.transformData(data);
              } catch (error: unknown) {
                console.error('API Error:', error);
                throw error;
              }
            }

            private transformData(data: unknown): any {
              return { ...data, processed: true };
            }
          }
        `,
        'src/utils/helpers.ts': `
          export const processItems = (items: unknown[]): unknown[] => {
            return items.map((item: unknown) => ({
              ...item,
              id: item.id || generateId()
            }));
          };

          export const createConfig = (): Record<string, unknown> => {
            return {
              apiUrl: process.env.API_URL,
              timeout: 5000,
              retries: 3
            };
          };
        `,
        'src/__tests__/helpers.test.ts': `
          import { processItems } from '../utils/helpers';

          describe('helpers', () => {
            test('processItems', () => {
              const mockItems: unknown[] = [{ name: 'test' }];
              const result = processItems(mockItems);
              expect(result).toBeDefined();
            });

            test('with mock data', () => {
              const mockFn = jest.fn() as unknown;
              mockFn.mockReturnValue({ data: 'test' });
              expect(mockFn()).toEqual({ data: 'test' });
            });
          });
        `
      };

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        const fileName = path.toString();
        for (const [file, content] of Object.entries(realisticCodeSamples)) {
          if (fileName.includes(file.split('/').pop()?.replace('.tsx', '').replace('.ts', ''))) {
            return content;
          }
        }
        return 'backup content';
      });

      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return Object.keys(realisticCodeSamples).join('\n');
        }
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      const config: UnintentionalAnyConfig = {
        maxFilesPerBatch: 4,
        targetReductionPercentage: 15,
        confidenceThreshold: 0.8,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'MODERATE',
        validationFrequency: 2
      };

      const batchResult = await engine.executeBatch(config);

      expect(batchResult.filesProcessed).toBe(4);
      expect(batchResult.anyTypesAnalyzed).toBeGreaterThan(10); // Multiple any types in samples
      expect(batchResult.replacementsAttempted).toBeGreaterThan(0);

      // Some replacements should be successful (arrays, records)
      // Some should be preserved (error handling, test mocks, API responses)
      expect(batchResult.replacementsSuccessful).toBeGreaterThanOrEqual(0);
      expect(batchResult.safetyScore).toBeGreaterThan(0.5);
    });

    test('should handle large-scale batch processing', async () => {
      // Generate a large number of files with various any type patterns
      const generateFileContent = (index: number) => {
        const patterns = [
          `const items${index}: unknown[] = [];`,
          `const config${index}: Record<string, unknown> = {};`,
          `function process${index}(data: unknown): any { return data; }`,
          `const response${index}: unknown = await fetch("/api/${index}");`,
          `} catch (error${index}: unknown) { console.log(error${index}); }`
        ];
        return patterns[index % patterns.length];
      };

      const fileCount = 50;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('grep -r -l')) {
          return Array(fileCount).fill(null).map((_, i) => `src/file${i}.ts`).join('\n');
        }
        if (command.includes('grep -c "error TS"')) {
          const error = new Error('No matches') as unknown;
          error.status = 1;
          throw error;
        }
        return '';
      });

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        const match = path.toString().match(/file(\d+)\.ts/);
        if (match) {
          const index = parseInt(match[1]);
          return generateFileContent(index);
        }
        return 'backup content';
      });

      const config: UnintentionalAnyConfig = {
        maxFilesPerBatch: 10,
        targetReductionPercentage: 20,
        confidenceThreshold: 0.8,
        enableDomainAnalysis: true,
        enableDocumentation: true,
        safetyLevel: 'MODERATE',
        validationFrequency: 5
      };

      const startTime = Date.now();
      const campaignResult = await campaign.execute(config);
      const endTime = Date.now();

      expect(campaignResult.totalAnyTypesAnalyzed).toBeGreaterThan(0);
      expect(campaignResult.reductionAchieved).toBeGreaterThanOrEqual(0);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Verify performance characteristics
      expect(campaignResult.safetyEvents.length).toBeLessThan(10); // Should have minimal safety issues
    });

    test('should adapt to different codebase characteristics', async () => {
      // Test with different codebase profiles
      const codebases = {
        'test-heavy': {
          files: {
            'src/test1.test.ts': 'const mockData: unknown = {}; const spy: unknown = jest.fn();',
            'src/test2.spec.ts': 'const fixture: unknown = createFixture();'
          },
          expectedBehavior: 'preserve most any types due to test context'
        },
        'api-heavy': {
          files: {
            'src/api1.ts': 'const response: unknown = await fetch("/api"); const data: unknown = response.json();',
            'src/api2.ts': 'const result: unknown = await apiCall();'
          },
          expectedBehavior: 'preserve API-related any types'
        },
        'utility-heavy': {
          files: {
            'src/util1.ts': 'const items: unknown[] = []; const map: Record<string, unknown> = {};',
            'src/util2.ts': 'function transform(data: unknown[]): unknown[] { return data; }'
          },
          expectedBehavior: 'replace many utility any types'
        }
      };

      for (const [codebaseType, { files, expectedBehavior }] of Object.entries(codebases)) {
        mockFs.readFileSync.mockImplementation((path: unknown) => {
          const fileName = path.toString();
          for (const [file, content] of Object.entries(files)) {
            if (fileName.includes(file.split('/').pop()?.replace(/\.(test|spec)\.ts$/, '').replace('.ts', ''))) {
              return content;
            }
          }
          return 'backup content';
        });

        mockExecSync.mockImplementation((command) => {
          if (command.includes('grep -r -l')) {
            return Object.keys(files).join('\n');
          }
          if (command.includes('grep -c "error TS"')) {
            const error = new Error('No matches') as unknown;
            error.status = 1;
            throw error;
          }
          return '';
        });

        const config: UnintentionalAnyConfig = {
          maxFilesPerBatch: Object.keys(files).length,
          targetReductionPercentage: 15,
          confidenceThreshold: 0.8,
          enableDomainAnalysis: true,
          enableDocumentation: true,
          safetyLevel: 'MODERATE',
          validationFrequency: 2
        };

        const batchResult = await engine.executeBatch(config);

        expect(batchResult.filesProcessed).toBe(Object.keys(files).length);
        expect(batchResult.anyTypesAnalyzed).toBeGreaterThan(0);

        // Verify behavior matches expectations
        if (codebaseType === 'test-heavy') {
          // Test files should have lower replacement rates
          expect(batchResult.replacementsSuccessful / Math.max(1, batchResult.replacementsAttempted)).toBeLessThan(0.5);
        } else if (codebaseType === 'utility-heavy') {
          // Utility files should have higher replacement rates
          expect(batchResult.replacementsSuccessful / Math.max(1, batchResult.replacementsAttempted)).toBeGreaterThan(0.3);
        }

        console.log(`${codebaseType}: ${expectedBehavior} - Success rate: ${(batchResult.replacementsSuccessful / Math.max(1, batchResult.replacementsAttempted) * 100).toFixed(1)}%`);
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should recover from transient failures', async () => {
      let failureCount = 0;
      mockExecSync.mockImplementation((command) => {
        if (command.includes('tsc')) {
          failureCount++;
          if (failureCount <= 2) {
            // Fail first two attempts, then succeed
            const error = new Error('Transient failure') as unknown;
            error.stdout = 'error TS2322: Temporary type conflict';
            throw error;
          }
        }
        if (command.includes('grep -r -l')) {
          return 'src/test.ts\n';
        }
        return '';
      });

      mockFs.readFileSync.mockReturnValue('const items: unknown[] = [];');

      const replacement = {
        original: 'unknown[]',
        replacement: 'unknown[]',
        filePath: 'src/test.ts',
        lineNumber: 1,
        confidence: 0.9,
        validationRequired: true
      };

      const result = await replacer.applyReplacement(replacement);

      // Should eventually succeed after retries
      expect(result.success).toBe(true);
      expect(failureCount).toBeGreaterThan(2);
    });

    test('should maintain data integrity during failures', async () => {
      const originalContent = 'const items: unknown[] = []; const data: Record<string, unknown> = {};';
      let backupContent = '';

      mockFs.readFileSync.mockImplementation((path: unknown) => {
        if (path.includes('.backup')) {
          return backupContent;
        }
        return originalContent;
      });

      mockFs.writeFileSync.mockImplementation((path: unknown, content: unknown) => {
        if (path.includes('.backup')) {
          backupContent = content;
        }
      });

      // Mock failure scenario
      mockExecSync.mockImplementation(() => {
        const error = new Error('Compilation failed') as unknown;
        error.stdout = 'error TS2322: Type error';
        throw error;
      });

      const replacements = [
        {
          original: 'unknown[]',
          replacement: 'unknown[]',
          filePath: 'src/test.ts',
          lineNumber: 1,
          confidence: 0.9,
          validationRequired: true
        },
        {
          original: 'Record<string, unknown>',
          replacement: 'Record<string, unknown>',
          filePath: 'src/test.ts',
          lineNumber: 1,
          confidence: 0.8,
          validationRequired: true
        }
      ];

      const result = await replacer.processBatch(replacements);

      expect(result.success).toBe(false);
      expect(result.rollbackPerformed).toBe(true);

      // Verify backup was created with original content
      expect(backupContent).toBe(originalContent);
    });
  });
});

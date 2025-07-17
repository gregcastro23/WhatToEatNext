/**
 * Unused Export Analyzer Tests
 * Perfect Codebase Campaign - Phase 3 Implementation
 */

import { UnusedExportAnalyzer, FilePriority, FileCategory, TransformationComplexity } from './UnusedExportAnalyzer';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and glob
jest.mock('fs');
jest.mock('glob');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockGlob = require('glob') as { glob: jest.MockedFunction<any> };

describe('UnusedExportAnalyzer', () => {
  let analyzer: UnusedExportAnalyzer;

  beforeEach(() => {
    analyzer = new UnusedExportAnalyzer('src');
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default src path', () => {
      const defaultAnalyzer = new UnusedExportAnalyzer();
      expect(defaultAnalyzer).toBeInstanceOf(UnusedExportAnalyzer);
    });

    it('should initialize with custom src path', () => {
      const customAnalyzer = new UnusedExportAnalyzer('custom/src');
      expect(customAnalyzer).toBeInstanceOf(UnusedExportAnalyzer);
    });
  });

  describe('analyzeUnusedExports', () => {
    beforeEach(() => {
      // Mock glob to return test files
      mockGlob.glob.mockResolvedValue([
        '/project/src/components/TestComponent.tsx',
        '/project/src/services/TestService.ts',
        '/project/src/data/recipes/TestRecipe.ts'
      ]);

      // Mock file reading
      mockFs.promises = {
        readFile: jest.fn().mockImplementation((filePath: string) => {
          if (filePath.includes('TestComponent.tsx')) {
            return Promise.resolve(`
export const UnusedComponent = () => <div>Test</div>;
export function UsedFunction() { return 'used'; }
export interface UnusedInterface { id: string; }
            `);
          }
          if (filePath.includes('TestService.ts')) {
            return Promise.resolve(`
export class UnusedService {
  method() { return 'test'; }
}
export const USED_CONSTANT = 'used';
            `);
          }
          if (filePath.includes('TestRecipe.ts')) {
            return Promise.resolve(`
export const unusedRecipeData = { name: 'test' };
export default function UnusedRecipeFunction() { return {}; }
            `);
          }
          return Promise.resolve('');
        })
      } as any;
    });

    it('should analyze unused exports across files', async () => {
      const result = await analyzer.analyzeUnusedExports();

      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('totalUnusedExports');
      expect(result).toHaveProperty('highPriorityFiles');
      expect(result).toHaveProperty('mediumPriorityFiles');
      expect(result).toHaveProperty('lowPriorityFiles');
      expect(result).toHaveProperty('summary');
    });

    it('should categorize files by priority', async () => {
      const result = await analyzer.analyzeUnusedExports();

      // Recipe files should be high priority
      const recipeFile = result.highPriorityFiles.find(f => f.filePath.includes('recipes'));
      expect(recipeFile).toBeDefined();
      expect(recipeFile?.priority).toBe(FilePriority.HIGH);

      // Component files should be medium priority
      const componentFile = result.mediumPriorityFiles.find(f => f.filePath.includes('components'));
      expect(componentFile).toBeDefined();
      expect(componentFile?.priority).toBe(FilePriority.MEDIUM);
    });

    it('should identify transformation candidates', async () => {
      const result = await analyzer.analyzeUnusedExports();

      const fileWithCandidates = [...result.highPriorityFiles, ...result.mediumPriorityFiles, ...result.lowPriorityFiles]
        .find(f => f.transformationCandidates.length > 0);

      expect(fileWithCandidates).toBeDefined();
      expect(fileWithCandidates?.transformationCandidates[0]).toHaveProperty('intelligenceSystemName');
      expect(fileWithCandidates?.transformationCandidates[0]).toHaveProperty('transformationComplexity');
      expect(fileWithCandidates?.transformationCandidates[0]).toHaveProperty('safetyScore');
      expect(fileWithCandidates?.transformationCandidates[0]).toHaveProperty('estimatedBenefit');
    });
  });

  describe('extractExports', () => {
    it('should extract named exports', () => {
      const content = `
export const testConst = 'value';
export function testFunction() {}
export class TestClass {}
export interface TestInterface {}
export type TestType = string;
      `;

      const exports = (analyzer as any).extractExports(content);
      
      expect(exports).toHaveLength(5);
      expect(exports.find((e: any) => e.exportName === 'testConst')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'testFunction')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'TestClass')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'TestInterface')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'TestType')).toBeDefined();
    });

    it('should extract default exports', () => {
      const content = `
export default function DefaultFunction() {}
export default class DefaultClass {}
export default TestComponent;
      `;

      const exports = (analyzer as any).extractExports(content);
      
      expect(exports.length).toBeGreaterThan(0);
      expect(exports.some((e: any) => e.isDefault)).toBe(true);
    });

    it('should extract destructured exports', () => {
      const content = `
export { testA, testB, testC as aliasC };
      `;

      const exports = (analyzer as any).extractExports(content);
      
      expect(exports).toHaveLength(3);
      expect(exports.find((e: any) => e.exportName === 'testA')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'testB')).toBeDefined();
      expect(exports.find((e: any) => e.exportName === 'testC')).toBeDefined();
    });
  });

  describe('determinePriority', () => {
    it('should assign HIGH priority to recipe files', () => {
      const priority = (analyzer as any).determinePriority('/project/src/data/recipes/TestRecipe.ts');
      expect(priority).toBe(FilePriority.HIGH);
    });

    it('should assign MEDIUM priority to component files', () => {
      const priority = (analyzer as any).determinePriority('/project/src/components/TestComponent.tsx');
      expect(priority).toBe(FilePriority.MEDIUM);
    });

    it('should assign LOW priority to type files', () => {
      const priority = (analyzer as any).determinePriority('/project/src/types/TestTypes.ts');
      expect(priority).toBe(FilePriority.LOW);
    });
  });

  describe('determineCategory', () => {
    it('should categorize recipe files correctly', () => {
      const category = (analyzer as any).determineCategory('/project/src/data/recipes/TestRecipe.ts');
      expect(category).toBe(FileCategory.RECIPE);
    });

    it('should categorize core files correctly', () => {
      const category = (analyzer as any).determineCategory('/project/src/components/TestComponent.tsx');
      expect(category).toBe(FileCategory.CORE);
    });

    it('should categorize external files correctly', () => {
      const category = (analyzer as any).determineCategory('/project/src/types/TestTypes.ts');
      expect(category).toBe(FileCategory.EXTERNAL);
    });

    it('should categorize test files correctly', () => {
      const category = (analyzer as any).determineCategory('/project/src/components/TestComponent.test.tsx');
      expect(category).toBe(FileCategory.TEST);
    });
  });

  describe('calculateSafetyScore', () => {
    it('should return high score for simple files', () => {
      const content = 'export const simple = "test";';
      const unusedExports = [{ exportName: 'simple', exportType: 'const' as const, lineNumber: 1, isDefault: false, complexity: 1, usageCount: 0, filePath: '' }];
      
      const score = (analyzer as any).calculateSafetyScore('/project/src/simple.ts', content, unusedExports);
      expect(score).toBeGreaterThan(80);
    });

    it('should return lower score for complex files', () => {
      const content = 'export const complex = "test";\n'.repeat(600); // Large file
      const unusedExports = Array(15).fill({ exportName: 'test', exportType: 'const' as const, lineNumber: 1, isDefault: false, complexity: 1, usageCount: 0, filePath: '' });
      
      const score = (analyzer as any).calculateSafetyScore('/project/src/complex.ts', content, unusedExports);
      expect(score).toBeLessThan(70);
    });

    it('should increase score for test files', () => {
      const content = 'export const testExport = "test";\n'.repeat(300); // Medium complexity file
      const unusedExports = Array(8).fill({ exportName: 'testExport', exportType: 'const' as const, lineNumber: 1, isDefault: false, complexity: 1, usageCount: 0, filePath: '' });
      
      const testScore = (analyzer as any).calculateSafetyScore('/project/src/test.test.ts', content, unusedExports);
      const normalScore = (analyzer as any).calculateSafetyScore('/project/src/normal.ts', content, unusedExports);
      
      expect(testScore).toBeGreaterThan(normalScore);
    });
  });

  describe('generateIntelligenceSystemName', () => {
    it('should generate proper intelligence system names', () => {
      const exportInfo = { exportName: 'TestComponent', exportType: 'function' as const, lineNumber: 1, isDefault: false, complexity: 1, usageCount: 0, filePath: '' };
      
      const name = (analyzer as any).generateIntelligenceSystemName(exportInfo);
      expect(name).toBe('_TEST_COMPONENT_INTELLIGENCE_SYSTEM');
    });

    it('should handle camelCase names', () => {
      const exportInfo = { exportName: 'camelCaseFunction', exportType: 'function' as const, lineNumber: 1, isDefault: false, complexity: 1, usageCount: 0, filePath: '' };
      
      const name = (analyzer as any).generateIntelligenceSystemName(exportInfo);
      expect(name).toBe('CAMEL_CASE_FUNCTION_INTELLIGENCE_SYSTEM');
    });
  });

  describe('assessTransformationComplexity', () => {
    it('should assess SIMPLE complexity for low complexity exports', () => {
      const exportInfo = { exportName: 'simple', exportType: 'const' as const, lineNumber: 1, isDefault: false, complexity: 3, usageCount: 0, filePath: '' };
      
      const complexity = (analyzer as any).assessTransformationComplexity(exportInfo);
      expect(complexity).toBe(TransformationComplexity.SIMPLE);
    });

    it('should assess MODERATE complexity for medium complexity exports', () => {
      const exportInfo = { exportName: 'moderate', exportType: 'function' as const, lineNumber: 1, isDefault: false, complexity: 10, usageCount: 0, filePath: '' };
      
      const complexity = (analyzer as any).assessTransformationComplexity(exportInfo);
      expect(complexity).toBe(TransformationComplexity.MODERATE);
    });

    it('should assess COMPLEX complexity for high complexity exports', () => {
      const exportInfo = { exportName: 'complex', exportType: 'class' as const, lineNumber: 1, isDefault: false, complexity: 25, usageCount: 0, filePath: '' };
      
      const complexity = (analyzer as any).assessTransformationComplexity(exportInfo);
      expect(complexity).toBe(TransformationComplexity.COMPLEX);
    });

    it('should assess VERY_COMPLEX complexity for very high complexity exports', () => {
      const exportInfo = { exportName: 'veryComplex', exportType: 'class' as const, lineNumber: 1, isDefault: false, complexity: 50, usageCount: 0, filePath: '' };
      
      const complexity = (analyzer as any).assessTransformationComplexity(exportInfo);
      expect(complexity).toBe(TransformationComplexity.VERY_COMPLEX);
    });
  });

  describe('generateReport', () => {
    it('should generate a comprehensive report', () => {
      const mockAnalysis = {
        totalFiles: 10,
        totalUnusedExports: 25,
        highPriorityFiles: [],
        mediumPriorityFiles: [],
        lowPriorityFiles: [],
        summary: {
          recipeFiles: 3,
          coreFiles: 5,
          externalFiles: 2,
          totalTransformationCandidates: 20,
          averageSafetyScore: 85.5,
          estimatedIntelligenceSystems: 20
        }
      };

      const report = analyzer.generateReport(mockAnalysis);
      
      expect(report).toContain('# Unused Export Analysis Report');
      expect(report).toContain('Total files analyzed: 10');
      expect(report).toContain('Total unused exports: 25');
      expect(report).toContain('Recipe files: 3');
      expect(report).toContain('Core files: 5');
      expect(report).toContain('External files: 2');
      expect(report).toContain('Average safety score: 85.5');
    });
  });
});
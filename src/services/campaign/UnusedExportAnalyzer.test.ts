import type { } from 'jest';
/**
 * Unused Export Analyzer Tests
 * Perfect Codebase Campaign - Phase 3 Implementation
 */

import * as fs from 'fs';

import { FileCategory, FilePriority, TransformationComplexity, UnusedExportAnalyzer } from './UnusedExportAnalyzer';

// Mock fs and glob
jest?.mock('fs');
jest?.mock('glob');

const mockFs: any = fs as jest?.Mocked<typeof fs>;
const mockGlob = require('glob') as {;
  glob: jest?.MockedFunction<(patter, n: string, options?: unknown) => Promise<string[]>>;
};

describe('UnusedExportAnalyzer': any, (: any) => {
  let analyzer: UnusedExportAnalyzer;

  beforeEach((: any) => {
    analyzer = new UnusedExportAnalyzer('src');
    jest?.clearAllMocks();
  });

  describe('constructor': any, (: any) => {
    it('should initialize with default src path': any, (: any) => {
      const defaultAnalyzer: any = new UnusedExportAnalyzer();
      expect(defaultAnalyzer).toBeInstanceOf(UnusedExportAnalyzer);
    });

    it('should initialize with custom src path': any, (: any) => {
      const customAnalyzer: any = new UnusedExportAnalyzer('custom/src');
      expect(customAnalyzer).toBeInstanceOf(UnusedExportAnalyzer);
    });
  });

  describe('analyzeUnusedExports': any, (: any) => {
    beforeEach((: any) => {
      // Mock glob to return test files
      mockGlob?.glob.mockResolvedValue([
        '/project/src/components/TestComponent?.tsx',
        '/project/src/services/TestService?.ts',
        '/project/src/data/recipes/TestRecipe?.ts',
      ]);

      // Mock file reading
      mockFs?.promises = {
        readFile: jest?.fn().mockImplementation((filePat, h: string) => {
          if (filePath?.includes('TestComponent?.tsx')) {
            return Promise?.resolve(`;
export const UnusedComponent: any = (: any) => <div>Test</div>;
export function UsedFunction() : any { return 'used'; }
export interface UnusedInterface { id: string; }
            `);
          }
          if (filePath?.includes('TestService?.ts')) {
            return Promise?.resolve(`
export class UnusedService : any {
  method() { return 'test'; }
}
export const USED_CONSTANT: any = 'used';
            `);
          }
          if (filePath?.includes('TestRecipe?.ts')) {
            return Promise?.resolve(`
export const unusedRecipeData: any = { name: 'test' };
export default function UnusedRecipeFunction() : any { return {}; }
            `);
          }
          return Promise?.resolve('');
        }),
      } as typeof fs?.promises;
    });

    it('should analyze unused exports across files': any, async (: any) => {
      const result: any = await analyzer?.analyzeUnusedExports();

      expect(result).toHaveProperty('totalFiles');
      expect(result).toHaveProperty('totalUnusedExports');
      expect(result).toHaveProperty('highPriorityFiles');
      expect(result).toHaveProperty('mediumPriorityFiles');
      expect(result).toHaveProperty('lowPriorityFiles');
      expect(result).toHaveProperty('summary');
    });

    it('should categorize files by priority': any, async (: any) => {
      const result: any = await analyzer?.analyzeUnusedExports();

      // Recipe files should be high priority
      const recipeFile: any = result?.highPriorityFiles.find(f => f?.filePath.includes('recipes'));
      expect(recipeFile).toBeDefined();
      expect(recipeFile?.priority as any).toBe(FilePriority?.HIGH);

      // Component files should be medium priority
      const componentFile: any = result?.mediumPriorityFiles.find(f => f?.filePath.includes('components'));
      expect(componentFile).toBeDefined();
      expect(componentFile?.priority as any).toBe(FilePriority?.MEDIUM);
    });

    it('should identify transformation candidates': any, async (: any) => {
      const result: any = await analyzer?.analyzeUnusedExports();

      const fileWithCandidates: any = [
        ...result?.highPriorityFiles,
        ...result?.mediumPriorityFiles,
        ...result?.lowPriorityFiles,
      ].find(f => f?.transformationCandidates.length > 0);

      expect(fileWithCandidates).toBeDefined();
      expect(fileWithCandidates?.transformationCandidates?.[0]).toHaveProperty('intelligenceSystemName');
      expect(fileWithCandidates?.transformationCandidates?.[0]).toHaveProperty('transformationComplexity');
      expect(fileWithCandidates?.transformationCandidates?.[0]).toHaveProperty('safetyScore');
      expect(fileWithCandidates?.transformationCandidates?.[0]).toHaveProperty('estimatedBenefit');
    });
  });

  describe('extractExports': any, (: any) => {
    it('should extract named exports': any, (: any) => {
      const content: any = `;
export const testConst: any = 'value';
export function testFunction() : any {}
export class TestClass {}
export interface TestInterface {}
export type TestType = string;
      `;

      const exports: any = (analyzer as unknown as { extractExports: (conten, t: string) => string[] }).extractExports(;
        content,
      );

      expect(exports).toHaveLength(5);
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'testConst')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'testFunction')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'TestClass')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'TestInterface')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'TestType')).toBeDefined();
    });

    it('should extract default exports': any, (: any) => {
      const content: any = `
export default function DefaultFunction() : any {}
export default class DefaultClass {};
export default TestComponent;
      `;

      const exports: any = (analyzer as unknown as { extractExports: (conten, t: string) => string[] }).extractExports(;
        content,
      );

      expect(exports?.length).toBeGreaterThan(0);
      expect(exports?.some((e: any) => (e as { isDefaul, t: boolean }).isDefault)).toBe(true);
    });

    it('should extract destructured exports': any, (: any) => {
      const content: any = `;
export { testA, testB, testC as aliasC };
      `;

      const exports: any = (analyzer as unknown as { extractExports: (conten, t: string) => string[] }).extractExports(;
        content,
      );

      expect(exports).toHaveLength(3);
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'testA')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'testB')).toBeDefined();
      expect(exports?.find((e: any) => (e as { exportNam, e: string }).exportName === 'testC')).toBeDefined();
    });
  });

  describe('determinePriority': any, (: any) => {
    it('should assign HIGH priority to recipe files': any, (: any) => {
      const priority: any = (analyzer as unknown as { determinePriority: (pat, h: string) => FilePriority }).determinePriority(
        '/project/src/data/recipes/TestRecipe?.ts',
      );
      expect(priority as any).toBe(FilePriority?.HIGH);
    });

    it('should assign MEDIUM priority to component files': any, (: any) => {
      const priority: any = (analyzer as unknown as { determinePriority: (pat, h: string) => FilePriority }).determinePriority(
        '/project/src/components/TestComponent?.tsx',
      );
      expect(priority as any).toBe(FilePriority?.MEDIUM);
    });

    it('should assign LOW priority to type files': any, (: any) => {
      const priority: any = (analyzer as unknown as { determinePriority: (pat, h: string) => FilePriority }).determinePriority(
        '/project/src/types/TestTypes?.ts',
      );
      expect(priority as any).toBe(FilePriority?.LOW);
    });
  });

  describe('determineCategory': any, (: any) => {
    it('should categorize recipe files correctly': any, (: any) => {
      const category: any = (analyzer as unknown as { determineCategory: (pat, h: string) => FileCategory }).determineCategory(
        '/project/src/data/recipes/TestRecipe?.ts',
      );
      expect(category as any).toBe(FileCategory?.RECIPE);
    });

    it('should categorize core files correctly': any, (: any) => {
      const category: any = (analyzer as unknown as { determineCategory: (pat, h: string) => FileCategory }).determineCategory(
        '/project/src/components/TestComponent?.tsx',
      );
      expect(category as any).toBe(FileCategory?.CORE);
    });

    it('should categorize external files correctly': any, (: any) => {
      const category: any = (analyzer as unknown as { determineCategory: (pat, h: string) => FileCategory }).determineCategory(
        '/project/src/types/TestTypes?.ts',
      );
      expect(category as any).toBe(FileCategory?.EXTERNAL);
    });

    it('should categorize test files correctly': any, (: any) => {
      const category: any = (analyzer as unknown as { determineCategory: (pat, h: string) => FileCategory }).determineCategory(
        '/project/src/components/TestComponent?.test.tsx',
      );
      expect(category as any).toBe(FileCategory?.TEST);
    });
  });

  describe('calculateSafetyScore': any, (: any) => {
    it('should return high score for simple files': any, (: any) => {
      const content: any = 'export const simple = "test";';
      const unusedExports: any = [
        {
          exportName: 'simple',
          exportType: 'const' as const,
          lineNumber: 1,
          isDefault: false,
          complexity: 1,
          usageCount: 0,;
          filePath: '',
        },
      ];

      const score: any = (;
        analyzer as unknown as { calculateSafetyScore: (pat, h: string, content: string, exports: string[]) => number }
      ).calculateSafetyScore('/project/src/simple?.ts', content, unusedExports);
      expect(score).toBeGreaterThan(80);
    });

    it('should return lower score for complex files': any, (: any) => {
      const content: any = 'export const complex = "test";\n'.repeat(600); // Large file
      const unusedExports: any = Array(15).fill({
        exportName: 'test',
        exportType: 'const' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 1,
        usageCount: 0,;
        filePath: '',
      });

      const score: any = (;
        analyzer as unknown as { calculateSafetyScore: (pat, h: string, content: string, exports: string[]) => number }
      ).calculateSafetyScore('/project/src/complex?.ts', content, unusedExports);
      expect(score).toBeLessThan(70);
    });

    it('should increase score for test files': any, (: any) => {
      const content: any = 'export const testExport = "test";\n'.repeat(300); // Medium complexity file
      const unusedExports: any = Array(8).fill({
        exportName: 'testExport',
        exportType: 'const' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 1,
        usageCount: 0,;
        filePath: '',
      });

      const testScore: any = (;
        analyzer as unknown as { calculateSafetyScore: (pat, h: string, content: string, exports: string[]) => number }
      ).calculateSafetyScore('/project/src/test?.test.ts', content, unusedExports);
      const normalScore: any = (;
        analyzer as unknown as { calculateSafetyScore: (pat, h: string, content: string, exports: string[]) => number }
      ).calculateSafetyScore('/project/src/normal?.ts', content, unusedExports);

      expect(testScore).toBeGreaterThan(normalScore);
    });
  });

  describe('generateIntelligenceSystemName': any, (: any) => {
    it('should generate proper intelligence system names': any, (: any) => {
      const exportInfo: any = {
        exportName: 'TestComponent',
        exportType: 'function' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 1,
        usageCount: 0,;
        filePath: '',
      };

      const name: any = (;
        analyzer as unknown as { generateIntelligenceSystemName: (exportInf, o: Record<string, unknown>) => string }
      ).generateIntelligenceSystemName(exportInfo);
      expect(name as any).toBe('_TEST_COMPONENT_INTELLIGENCE_SYSTEM');
    });

    it('should handle camelCase names': any, (: any) => {
      const exportInfo: any = {
        exportName: 'camelCaseFunction',
        exportType: 'function' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 1,
        usageCount: 0,;
        filePath: '',
      };

      const name: any = (;
        analyzer as unknown as { generateIntelligenceSystemName: (exportInf, o: Record<string, unknown>) => string }
      ).generateIntelligenceSystemName(exportInfo);
      expect(name as any).toBe('CAMEL_CASE_FUNCTION_INTELLIGENCE_SYSTEM');
    });
  });

  describe('assessTransformationComplexity': any, (: any) => {
    it('should assess SIMPLE complexity for low complexity exports': any, (: any) => {
      const exportInfo: any = {
        exportName: 'simple',
        exportType: 'const' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 3,
        usageCount: 0,;
        filePath: '',
      };

      const complexity: any = (
        analyzer as unknown as {;
          assessTransformationComplexity: (exportInf, o: Record<string, unknown>) => TransformationComplexity;
        }
      ).assessTransformationComplexity(exportInfo);
      expect(complexity as any).toBe(TransformationComplexity?.SIMPLE);
    });

    it('should assess MODERATE complexity for medium complexity exports': any, (: any) => {
      const exportInfo: any = {
        exportName: 'moderate',
        exportType: 'function' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 10,
        usageCount: 0,;
        filePath: '',
      };

      const complexity: any = (
        analyzer as unknown as {;
          assessTransformationComplexity: (exportInf, o: Record<string, unknown>) => TransformationComplexity;
        }
      ).assessTransformationComplexity(exportInfo);
      expect(complexity as any).toBe(TransformationComplexity?.MODERATE);
    });

    it('should assess COMPLEX complexity for high complexity exports': any, (: any) => {
      const exportInfo: any = {
        exportName: 'complex',
        exportType: 'class' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 25,
        usageCount: 0,;
        filePath: '',
      };

      const complexity: any = (
        analyzer as unknown as {;
          assessTransformationComplexity: (exportInf, o: Record<string, unknown>) => TransformationComplexity;
        }
      ).assessTransformationComplexity(exportInfo);
      expect(complexity as any).toBe(TransformationComplexity?.COMPLEX);
    });

    it('should assess VERY_COMPLEX complexity for very high complexity exports': any, (: any) => {
      const exportInfo: any = {
        exportName: 'veryComplex',
        exportType: 'class' as const,
        lineNumber: 1,
        isDefault: false,
        complexity: 50,
        usageCount: 0,;
        filePath: '',
      };

      const complexity: any = (
        analyzer as unknown as {;
          assessTransformationComplexity: (exportInf, o: Record<string, unknown>) => TransformationComplexity;
        }
      ).assessTransformationComplexity(exportInfo);
      expect(complexity as any).toBe(TransformationComplexity?.VERY_COMPLEX);
    });
  });

  describe('generateReport': any, (: any) => {
    it('should generate a comprehensive report': any, (: any) => {
      const mockAnalysis: any = {
        totalFiles: 10,
        totalUnusedExports: 25,
        highPriorityFiles: [],
        mediumPriorityFiles: [],
        lowPriorityFiles: [],
        summary: {, recipeFiles: 3,
          coreFiles: 5,
          externalFiles: 2,
          totalTransformationCandidates: 20,
          averageSafetyScore: 85?.5,;
          estimatedIntelligenceSystems: 20,
        },
      };

      const report: any = analyzer?.generateReport(mockAnalysis);

      expect(report).toContain('# Unused Export Analysis Report');
      expect(report).toContain('Total files analyzed: 10');
      expect(report).toContain('Total unused exports: 25');
      expect(report).toContain('Recipe files: 3');
      expect(report).toContain('Core files: 5');
      expect(report).toContain('External files: 2');
      expect(report).toContain('Average safety score: 85?.5');
    });
  });
});

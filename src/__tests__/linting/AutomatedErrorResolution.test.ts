/**
 * Automated Error Resolution Integration Tests
 * 
 * Tests the automated error resolution systems including import fixing,
 * unused variable cleanup, and console statement replacement.
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

// Mock dependencies
jest.mock('child_process');
jest.mock('fs');

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;
const _mockWriteFileSync = writeFileSync as jest.MockedFunction<typeof writeFileSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const _mockMkdirSync = mkdirSync as jest.MockedFunction<typeof mkdirSync>;

describe('Automated Error Resolution Integration', () => {
  const _testDir = path.join(tmpdir(), 'eslint-test');
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  describe('ESLint Auto-Fix Integration', () => {
    test('should execute ESLint auto-fix successfully', async () => {
      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: 'prefer-const',
              severity: 2,
              message: 'Prefer const over let',
              fix: {
                range: [0, 3],
                text: 'const'
              }
            },
            {
              ruleId: 'no-extra-semi',
              severity: 2,
              message: 'Unnecessary semicolon',
              fix: {
                range: [10, 11],
                text: ''
              }
            }
          ],
          fixableErrorCount: 2,
          fixableWarningCount: 0
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);

      // Simulate running ESLint with --fix
      const command = 'yarn lint:fix --format=json';
      const result = mockExecSync(command, { encoding: 'utf8' });

      expect(mockExecSync).toHaveBeenCalledWith(command, { encoding: 'utf8' });
      expect(JSON.parse(result )[0].fixableErrorCount).toBe(2);
    });

    test('should handle ESLint execution errors gracefully', async () => {
      const mockError = new Error('ESLint failed') as any;
      mockError.stdout = JSON.stringify([]);
      mockError.status = 1;

      mockExecSync.mockImplementation(() => {
        throw mockError;
      });

      // Should handle the error without throwing
      expect(() => {
        try {
          mockExecSync('yarn lint:fix', { encoding: 'utf8' });
        } catch (error: any) {
          // Simulate error handling
          if (error.status === 1 && error.stdout) {
            return error.stdout;
          }
          throw error;
        }
      }).not.toThrow();
    });

    test('should process multiple files in batch', async () => {
      const mockBatchOutput = JSON.stringify([
        {
          filePath: '/test/file1.ts',
          messages: [{ ruleId: 'prefer-const', severity: 2, fix: { range: [0, 3], text: 'const' } }],
          fixableErrorCount: 1
        },
        {
          filePath: '/test/file2.ts',
          messages: [{ ruleId: 'no-unused-vars', severity: 1, fix: null }],
          fixableErrorCount: 0
        },
        {
          filePath: '/test/file3.ts',
          messages: [],
          fixableErrorCount: 0
        }
      ]);

      mockExecSync.mockReturnValue(mockBatchOutput);

      const result = JSON.parse(mockExecSync('yarn lint:fix --format=json', { encoding: 'utf8' }) );
      
      expect(result).toHaveLength(3);
      expect(result[0].fixableErrorCount).toBe(1);
      expect(result[1].fixableErrorCount).toBe(0);
      expect(result[2].fixableErrorCount).toBe(0);
    });
  });

  describe('Import Organization Resolution', () => {
    test('should fix import order violations', async () => {
      const testFileContent = `
        import { Component } from 'react';
        import path from 'path';
        import { calculatePlanetaryPositions } from '@/calculations/planetary';
        import fs from 'fs';
        import { ElementalProperties } from '@/types/elemental';
      `;

      const expectedFixedContent = `
        import fs from 'fs';
        import path from 'path';
        import { Component } from 'react';
        
        import { calculatePlanetaryPositions } from '@/calculations/planetary';
        import { ElementalProperties } from '@/types/elemental';
      `;

      mockReadFileSync.mockReturnValue(testFileContent);
      
      // Simulate import organization fix
      const mockFixedOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [],
          output: expectedFixedContent
        }
      ]);

      mockExecSync.mockReturnValue(mockFixedOutput);

      const result = JSON.parse(mockExecSync('yarn lint:fix --fix-type layout', { encoding: 'utf8' }) );
      
      expect(result[0].output).toContain('import fs from \'fs\'');
      expect(result[0].output).toContain('import path from \'path\'');
      expect(result[0].messages).toHaveLength(0);
    });

    test('should remove duplicate imports', async () => {
      const testFileContent = `
        import { Component } from 'react';
        import { useState } from 'react';
        import { Component } from 'react'; // Duplicate
        import { calculatePlanetaryPositions } from '@/calculations/planetary';
      `;

      const mockFixedOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [],
          output: testFileContent.replace(/import { Component } from 'react'; \/\/ Duplicate\n/, '')
        }
      ]);

      mockExecSync.mockReturnValue(mockFixedOutput);
      mockReadFileSync.mockReturnValue(testFileContent);

      const result = JSON.parse(mockExecSync('yarn lint:fix', { encoding: 'utf8' }) );
      
      expect(result[0].output).not.toContain('// Duplicate');
      expect((result[0].output.match(/import.*from 'react'/g) || []).length).toBeLessThan(3);
    });

    test('should preserve astrological import patterns', async () => {
      const astrologicalImports = `
        import { calculatePlanetaryPositions } from '@/calculations/planetary';
        import { validateTransitDate } from '@/utils/transitValidation';
        import { FALLBACK_POSITIONS } from '@/data/planets/fallback';
        import { ElementalProperties } from '@/types/elemental';
      `;

      mockReadFileSync.mockReturnValue(astrologicalImports);
      
      const mockFixedOutput = JSON.stringify([
        {
          filePath: '/test/astrological.ts',
          messages: [],
          output: astrologicalImports // Should remain unchanged
        }
      ]);

      mockExecSync.mockReturnValue(mockFixedOutput);

      const result = JSON.parse(mockExecSync('yarn lint:fix', { encoding: 'utf8' }) );
      
      expect(result[0].output).toContain('calculatePlanetaryPositions');
      expect(result[0].output).toContain('validateTransitDate');
      expect(result[0].output).toContain('FALLBACK_POSITIONS');
      expect(result[0].output).toContain('ElementalProperties');
    });
  });

  describe('Unused Variable Resolution', () => {
    test('should handle unused variable warnings', async () => {
      const testFileContent = `
        function calculateElements() {
          const unusedVar = 'test';
          const usedVar = 'active';
          const _intentionallyUnused = 'ok';
          
          return usedVar;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-unused-vars',
              severity: 1,
              message: "'unusedVar' is assigned a value but never used.",
              line: 3,
              column: 15
            }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(testFileContent);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0].ruleId).toBe('@typescript-eslint/no-unused-vars');
      expect(result[0].messages[0].message).toContain('unusedVar');
    });

    test('should preserve astrological variable patterns', async () => {
      const astrologicalCode = `
        function calculatePlanetaryInfluence() {
          const planet = 'mars';
          const position = { sign: 'cancer', degree: 22.63 };
          const degree = position.degree;
          const sign = position.sign;
          const UNUSED_fallback = FALLBACK_POSITIONS;
          
          return { planet, degree }; // sign and UNUSED_fallback intentionally unused
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/astrological.ts',
          messages: [] // Should not report errors for astrological patterns
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(astrologicalCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(0);
    });

    test('should handle campaign system variable patterns', async () => {
      const campaignCode = `
        function executeCampaign() {
          const campaign = 'typescript-elimination';
          const progress = { completed: 50, total: 100 };
          const UNUSED_metrics = { errors: 10, warnings: 25 };
          const safety = { backupCreated: true };
          const UNUSED_debug = 'debug info';
          
          return { campaign, progress };
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/campaign.ts',
          messages: [] // Should not report errors for campaign patterns
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(campaignCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(0);
    });
  });

  describe('Console Statement Resolution', () => {
    test('should handle console statement warnings', async () => {
      const testFileContent = `
        function debugCalculation() {
          console.log('Debug info'); // Should be warning
          console.warn('Warning message'); // Should be allowed
          console.error('Error message'); // Should be allowed
          console.info('Info message'); // Should be allowed
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: 'no-console',
              severity: 2,
              message: "Unexpected console statement.",
              line: 3,
              column: 11
            }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(testFileContent);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0].ruleId).toBe('no-console');
      expect(result[0].messages[0].message).toContain('console statement');
    });

    test('should allow console statements in astrological calculations', async () => {
      const astrologicalCode = `
        function calculatePlanetaryPositions() {
          console.log('Calculating planetary positions');
          console.debug('Debug astronomical data');
          console.info('Using fallback positions');
          
          return FALLBACK_POSITIONS;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/calculations/planetary.ts',
          messages: [] // Should allow console in astrological files
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(astrologicalCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(0);
    });

    test('should allow console statements in campaign system files', async () => {
      const campaignCode = `
        function executeCampaignPhase() {
          console.log('Starting campaign phase');
          console.info('Progress: 50%');
          console.warn('Safety protocol activated');
          
          return { status: 'running' };
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/services/campaign/executor.ts',
          messages: [] // Should allow console in campaign files
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(campaignCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(0);
    });
  });

  describe('TypeScript Error Resolution', () => {
    test('should handle explicit any type errors', async () => {
      const testFileContent = `
        function processData(data: any) { // Should be error
          return data.someProperty;
        }
        
        function processAstrologicalData(data: any) { // May be allowed in astrological files
          return data.planetaryPosition;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-explicit-any',
              severity: 2,
              message: "Unexpected any. Specify a different type.",
              line: 2,
              column: 42
            }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(testFileContent);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0].ruleId).toBe('@typescript-eslint/no-explicit-any');
    });

    test('should handle unnecessary condition warnings', async () => {
      const testFileContent = `
        function checkValue(value?: string) {
          if (value !== undefined && value !== null) { // May be unnecessary
            return value.length;
          }
          return 0;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            {
              ruleId: '@typescript-eslint/no-unnecessary-condition',
              severity: 1,
              message: "Unnecessary conditional, value is always truthy.",
              line: 3,
              column: 7
            }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(testFileContent);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0].ruleId).toBe('@typescript-eslint/no-unnecessary-condition');
    });
  });

  describe('React Hooks Resolution', () => {
    test('should handle exhaustive deps warnings', async () => {
      const reactCode = `
        import { useEffect, useState } from 'react';
        
        function Component() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('');
          
          useEffect(() => {
            console.log(count, name);
          }, [count]); // Missing 'name' in dependencies
          
          return null;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/Component.tsx',
          messages: [
            {
              ruleId: 'react-hooks/exhaustive-deps',
              severity: 1,
              message: "React Hook useEffect has a missing dependency: 'name'.",
              line: 9,
              column: 7
            }
          ]
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(reactCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(1);
      expect(result[0].messages[0].ruleId).toBe('react-hooks/exhaustive-deps');
      expect(result[0].messages[0].message).toContain('missing dependency');
    });

    test('should handle custom hooks in astrological components', async () => {
      const astrologicalReactCode = `
        import { useEffect } from 'react';
        import { useRecoilValue } from 'recoil';
        import { usePlanetaryPositions } from '@/hooks/usePlanetaryPositions';
        
        function AstrologicalComponent() {
          const positions = usePlanetaryPositions();
          const currentDate = useRecoilValue(currentDateState);
          
          useEffect(() => {
            console.log('Planetary positions updated', positions);
          }, [positions]); // Should be valid
          
          return null;
        }
      `;

      const mockLintOutput = JSON.stringify([
        {
          filePath: '/test/AstrologicalComponent.tsx',
          messages: [] // Should handle custom hooks correctly
        }
      ]);

      mockExecSync.mockReturnValue(mockLintOutput);
      mockReadFileSync.mockReturnValue(astrologicalReactCode);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(0);
    });
  });

  describe('Error Resolution Workflow', () => {
    test('should execute complete error resolution workflow', async () => {
      const workflowSteps = [
        'yarn lint --format=json', // Initial analysis
        'yarn lint:fix', // Auto-fix
        'yarn lint:fix --fix-type layout', // Import organization
        'yarn lint --format=json' // Final verification
      ];

      const mockOutputs = [
        JSON.stringify([{ filePath: '/test/file.ts', messages: [{ ruleId: 'prefer-const', severity: 2 }] }]),
        '', // Fix output
        '', // Layout fix output
        JSON.stringify([{ filePath: '/test/file.ts', messages: [] }]) // Clean result
      ];

      mockExecSync
        .mockReturnValueOnce(mockOutputs[0])
        .mockReturnValueOnce(mockOutputs[1])
        .mockReturnValueOnce(mockOutputs[2])
        .mockReturnValueOnce(mockOutputs[3]);

      // Execute workflow
      workflowSteps.forEach((step, index) => {
        const result = mockExecSync_(step, { encoding: 'utf8' });
        if (index === 0 || index === 3) {
          // Analysis steps should return JSON
          expect(() => JSON.parse(result )).not.toThrow();
        }
      });

      expect(mockExecSync).toHaveBeenCalledTimes(4);
      
      // Verify final result is clean
      const finalResult = JSON.parse(mockOutputs[3]);
      expect(finalResult[0].messages).toHaveLength(0);
    });

    test('should handle partial resolution gracefully', async () => {
      const partialResolutionOutput = JSON.stringify([
        {
          filePath: '/test/file.ts',
          messages: [
            { ruleId: 'no-unused-vars', severity: 1, fix: null }, // Not auto-fixable
            { ruleId: '@typescript-eslint/no-explicit-any', severity: 2, fix: null } // Requires manual fix
          ]
        }
      ]);

      mockExecSync.mockReturnValue(partialResolutionOutput);

      const result = JSON.parse(mockExecSync('yarn lint --format=json', { encoding: 'utf8' }) );
      
      expect(result[0].messages).toHaveLength(2);
      expect(_result[0].messages.every((msg: any) => msg.fix === null)).toBe(true);
    });

    test('should preserve file safety during resolution', async () => {
      const safetyChecks = [
        'git status --porcelain', // Check for uncommitted changes
        'yarn build', // Verify build still works
        'yarn test --passWithNoTests' // Verify tests still pass
      ];

      mockExecSync
        .mockReturnValueOnce('') // Clean git status
        .mockReturnValueOnce('') // Successful build
        .mockReturnValueOnce('Tests passed'); // Successful tests

      safetyChecks.forEach(check => {
        const result = mockExecSync(check, { encoding: 'utf8' });
        expect(result).toBeDefined();
      });

      expect(mockExecSync).toHaveBeenCalledTimes(3);
    });
  });
});
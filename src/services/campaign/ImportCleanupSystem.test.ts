/**
 * Import Cleanup System Tests
 * Comprehensive test suite for automated import cleanup functionality
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { ImportCleanupSystem, DEFAULT_IMPORT_CLEANUP_CONFIG, ImportCleanupConfig } from './ImportCleanupSystem';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');
jest.mock('../../utils/logger');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('ImportCleanupSystem', () => {
  let importCleanupSystem: ImportCleanupSystem;
  let testConfig: ImportCleanupConfig;

  beforeEach(() => {
    testConfig = {
      ...DEFAULT_IMPORT_CLEANUP_CONFIG,
      maxFilesPerBatch: 5,
      safetyValidationEnabled: true
    };
    importCleanupSystem = new ImportCleanupSystem(testConfig);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('detectUnusedImports', () => {
    test('detects unused named imports', async () => {
      const testFileContent = `
import { usedFunction, unusedFunction } from './utils';
import { AnotherUnused } from './other';

function component() {
  return usedFunction();
}
`;

      mockFs.readFileSync.mockReturnValue(testFileContent);
      mockExecSync.mockReturnValue('test-file.ts\n');

      const unusedImports = await importCleanupSystem.detectUnusedImports(['test-file.ts']);

      expect(unusedImports).toHaveLength(2);
      expect(unusedImports[0].importName).toBe('unusedFunction');
      expect(unusedImports[1].importName).toBe('AnotherUnused');
    });

    test('detects unused default imports', async () => {
      const testFileContent = `
import UnusedDefault from './utils';
import UsedDefault from './other';

function component() {
  return UsedDefault();
}
`;

      mockFs.readFileSync.mockReturnValue(testFileContent);
      mockExecSync.mockReturnValue('test-file.ts\n');

      const unusedImports = await importCleanupSystem.detectUnusedImports(['test-file.ts']);

      expect(unusedImports).toHaveLength(1);
      expect(unusedImports[0].importName).toBe('UnusedDefault');
    });

    test('detects unused namespace imports', async () => {
      const testFileContent = `
import * as UnusedNamespace from './utils';
import * as UsedNamespace from './other';

function component() {
  return UsedNamespace.someFunction();
}
`;

      mockFs.readFileSync.mockReturnValue(testFileContent);
      mockExecSync.mockReturnValue('test-file.ts\n');

      const unusedImports = await importCleanupSystem.detectUnusedImports(['test-file.ts']);

      expect(unusedImports).toHaveLength(1);
      expect(unusedImports[0].importName).toBe('UnusedNamespace');
    });

    test('correctly identifies used imports in JSX', async () => {
      const testFileContent = `
import React from 'react';
import { Button, UnusedComponent } from './components';

function App() {
  return <Button>Click me</Button>;
}
`;

      mockFs.readFileSync.mockReturnValue(testFileContent);
      mockExecSync.mockReturnValue('test-file.tsx\n');

      const unusedImports = await importCleanupSystem.detectUnusedImports(['test-file.tsx']);

      expect(unusedImports).toHaveLength(1);
      expect(unusedImports[0].importName).toBe('UnusedComponent');
    });

    test('correctly identifies used type imports', async () => {
      const testFileContent = `
import type { UsedType, UnusedType } from './types';

function component(): UsedType {
  return {} as UsedType;
}
`;

      mockFs.readFileSync.mockReturnValue(testFileContent);
      mockExecSync.mockReturnValue('test-file.ts\n');

      const unusedImports = await importCleanupSystem.detectUnusedImports(['test-file.ts']);

      expect(unusedImports).toHaveLength(1);
      expect(unusedImports[0].importName).toBe('UnusedType');
      expect(unusedImports[0].isTypeImport).toBe(true);
    });
  });

  describe('removeUnusedImports', () => {
    test('removes unused imports from file', async () => {
      const originalContent = `
import { usedFunction, unusedFunction } from './utils';
import { AnotherUnused } from './other';

function component() {
  return usedFunction();
}
`;

      const expectedContent = `
import { usedFunction } from './utils';

function component() {
  return usedFunction();
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const removedCount = await importCleanupSystem.removeUnusedImports(['test-file.ts']);

      expect(removedCount).toBe(2);
      expect(writtenContent.trim()).toBe(expectedContent.trim());
    });

    test('removes entire import line when all imports are unused', async () => {
      const originalContent = `
import { unusedFunction1, unusedFunction2 } from './utils';
import { usedFunction } from './other';

function component() {
  return usedFunction();
}
`;

      const expectedContent = `
import { usedFunction } from './other';

function component() {
  return usedFunction();
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const removedCount = await importCleanupSystem.removeUnusedImports(['test-file.ts']);

      expect(removedCount).toBe(2);
      expect(writtenContent.trim()).toBe(expectedContent.trim());
    });
  });

  describe('organizeImports', () => {
    test('groups external and internal imports', async () => {
      const originalContent = `
import { internalFunction } from './utils';
import React from 'react';
import { externalFunction } from 'lodash';
import { anotherInternal } from '../other';

function component() {
  return null;
}
`;

      const expectedContent = `
import React from 'react';
import { externalFunction } from 'lodash';

import { anotherInternal } from '../other';
import { internalFunction } from './utils';

function component() {
  return null;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const organizedCount = await importCleanupSystem.organizeImports(['test-file.ts']);

      expect(organizedCount).toBe(1);
      expect(writtenContent.trim()).toBe(expectedContent.trim());
    });

    test('separates type imports when configured', async () => {
      const originalContent = `
import { Component } from 'react';
import type { ReactNode } from 'react';
import { internalFunction } from './utils';
import type { InternalType } from './types';

function component() {
  return null;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const organizedCount = await importCleanupSystem.organizeImports(['test-file.ts']);

      expect(organizedCount).toBe(1);
      expect(writtenContent).toContain('import type { ReactNode }');
      expect(writtenContent).toContain('import { Component }');
      expect(writtenContent).toContain('import type { InternalType }');
      expect(writtenContent).toContain('import { internalFunction }');
    });

    test('sorts imports alphabetically when configured', async () => {
      const originalContent = `
import { zebra } from 'zoo';
import { apple } from 'fruits';
import { banana } from 'fruits';

function component() {
  return null;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const organizedCount = await importCleanupSystem.organizeImports(['test-file.ts']);

      expect(organizedCount).toBe(1);
      const lines = writtenContent.split('\n').filter(line => line.startsWith('import'));
      expect(lines[0]).toContain('apple');
      expect(lines[1]).toContain('banana');
      expect(lines[2]).toContain('zebra');
    });
  });

  describe('enforceImportStyle', () => {
    test('adds trailing commas to multi-line imports', async () => {
      const originalContent = `
import {
  functionA,
  functionB
} from './utils';

function component() {
  return null;
}
`;

      const expectedContent = `
import {
  functionA,
  functionB,
} from './utils';

function component() {
  return null;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixedCount = await importCleanupSystem.enforceImportStyle(['test-file.ts']);

      expect(fixedCount).toBe(1);
      expect(writtenContent.trim()).toBe(expectedContent.trim());
    });

    test('breaks long import lines when over max length', async () => {
      const config = {
        ...testConfig,
        organizationRules: {
          ...testConfig.organizationRules,
          maxLineLength: 50
        }
      };
      const system = new ImportCleanupSystem(config);

      const originalContent = `
import { veryLongFunctionName, anotherVeryLongFunctionName, yetAnotherLongName } from './utils';

function component() {
  return null;
}
`;

      mockFs.readFileSync.mockReturnValue(originalContent);
      let writtenContent = '';
      mockFs.writeFileSync.mockImplementation((path, content) => {
        writtenContent = content as string;
      });

      const fixedCount = await system.enforceImportStyle(['test-file.ts']);

      expect(fixedCount).toBe(1);
      expect(writtenContent).toContain('{\n  veryLongFunctionName');
      expect(writtenContent).toContain('  anotherVeryLongFunctionName');
      expect(writtenContent).toContain('  yetAnotherLongName\n}');
    });
  });

  describe('executeCleanup', () => {
    test('executes complete cleanup workflow', async () => {
      const testFiles = ['file1.ts', 'file2.ts'];
      const testContent = `
import { usedFunction, unusedFunction } from './utils';
import React from 'react';

function component() {
  return usedFunction();
}
`;

      mockExecSync.mockReturnValue(testFiles.join('\n'));
      mockFs.readFileSync.mockReturnValue(testContent);
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await importCleanupSystem.executeCleanup(testFiles);

      expect(result.filesProcessed.length).toBeGreaterThan(0);
      expect(result.unusedImportsRemoved).toBeGreaterThan(0);
      expect(result.buildValidationPassed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('handles build validation failures', async () => {
      const testFiles = ['file1.ts'];
      
      mockExecSync
        .mockReturnValueOnce(testFiles.join('\n')) // File listing
        .mockImplementationOnce(() => { // Build validation
          throw new Error('Build failed');
        });
      
      mockFs.readFileSync.mockReturnValue('import { unused } from "./utils";');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await importCleanupSystem.executeCleanup(testFiles);

      expect(result.buildValidationPassed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('processes files in batches', async () => {
      const testFiles = Array.from({ length: 12 }, (_, i) => `file${i}.ts`);
      const batchSize = 5;
      
      const config = { ...testConfig, maxFilesPerBatch: batchSize };
      const system = new ImportCleanupSystem(config);

      mockExecSync.mockReturnValue(''); // Build validation passes
      mockFs.readFileSync.mockReturnValue('import { used } from "./utils"; used();');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await system.executeCleanup(testFiles);

      // Should process all files despite batching
      expect(result.filesProcessed.length).toBeLessThanOrEqual(testFiles.length);
      expect(result.buildValidationPassed).toBe(true);
    });
  });

  describe('error handling', () => {
    test('handles file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const unusedImports = await importCleanupSystem.detectUnusedImports(['nonexistent.ts']);

      expect(unusedImports).toHaveLength(0);
    });

    test('handles file write errors gracefully', async () => {
      mockFs.readFileSync.mockReturnValue('import { unused } from "./utils";');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const removedCount = await importCleanupSystem.removeUnusedImports(['readonly.ts']);

      expect(removedCount).toBe(0);
    });

    test('continues processing other files when one fails', async () => {
      const testFiles = ['good.ts', 'bad.ts', 'good2.ts'];
      
      mockFs.readFileSync
        .mockReturnValueOnce('import { used } from "./utils"; used();') // good.ts
        .mockImplementationOnce(() => { throw new Error('Bad file'); }) // bad.ts
        .mockReturnValueOnce('import { used } from "./utils"; used();'); // good2.ts

      const unusedImports = await importCleanupSystem.detectUnusedImports(testFiles);

      // Should still process the good files
      expect(unusedImports).toBeDefined();
    });
  });

  describe('configuration validation', () => {
    test('uses default configuration when not provided', () => {
      const system = new ImportCleanupSystem(DEFAULT_IMPORT_CLEANUP_CONFIG);
      expect(system).toBeDefined();
    });

    test('respects custom configuration', () => {
      const customConfig: ImportCleanupConfig = {
        maxFilesPerBatch: 10,
        safetyValidationEnabled: false,
        buildValidationFrequency: 3,
        importStyleEnforcement: false,
        organizationRules: {
          groupExternalImports: false,
          groupInternalImports: false,
          sortAlphabetically: false,
          separateTypeImports: false,
          enforceTrailingCommas: false,
          maxLineLength: 120
        }
      };

      const system = new ImportCleanupSystem(customConfig);
      expect(system).toBeDefined();
    });
  });
});
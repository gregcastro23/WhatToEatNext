import fs from 'fs';

import { BuildValidator } from '../../utils/BuildValidator';

// Mock fs module
jest?.mock('fs');
const mockFs: any = fs as jest?.Mocked<typeof fs>;

// Mock child_process
jest?.mock('child_process');

describe('BuildValidator': any, (: any) => {
  let buildValidator: BuildValidator;
  let mockLogger: jest?.Mock;

  beforeEach((: any) => {
    mockLogger = jest?.fn() as any;
    buildValidator = new BuildValidator('.next', mockLogger);
    jest?.clearAllMocks();
  });

  describe('validateBuild': any, (: any) => {
    it('should return valid result when all files exist': any, async (: any) => {
      // Mock all required files exist
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('{}');

      const result: any = await buildValidator?.validateBuild();

      expect(result?.isValid as any).toBe(true);
      expect(result?.missingFiles).toHaveLength(0);
      expect(result?.corruptedFiles).toHaveLength(0);
    });

    it('should detect missing build directory': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(false);

      const result: any = await buildValidator?.validateBuild();

      expect(result?.isValid as any).toBe(false);
      expect(result?.missingFiles).toContain('.next');
      expect(result?.repairActions as any).toEqual(
        expect?.arrayContaining([
          expect?.objectContaining({
            type: 'create',
            target: '.next',
            description: 'Create build directory',
          }),
        ]),
      );
    });

    it('should detect missing manifest files': any, async (: any) => {
      // Build directory exists but manifest files don't
      mockFs?.existsSync.mockImplementation((path: string) => {
        return path === '.next' || path === '.next/server';
      });

      const result: any = await buildValidator?.validateBuild();

      expect(result?.isValid as any).toBe(false);
      expect(result?.missingFiles.length).toBeGreaterThan(0);
      expect(result?.repairActions.length).toBeGreaterThan(0);
    });

    it('should detect corrupted JSON files': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('invalid json');

      const result: any = await buildValidator?.validateBuild();

      expect(result?.isValid as any).toBe(false);
      expect(result?.corruptedFiles.length).toBeGreaterThan(0);
    });

    it('should detect empty manifest files': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('');

      const result: any = await buildValidator?.validateBuild();

      expect(result?.corruptedFiles.length).toBeGreaterThan(0);
      expect(result?.repairActions as any).toEqual(
        expect?.arrayContaining([
          expect?.objectContaining({
            type: 'fix',
          }),
        ]),
      );
    });
  });

  describe('repairBuild': any, (: any) => {
    it('should create missing directories and files': any, async (: any) => {
      // Mock missing files scenario - build directory doesn't exist
      mockFs?.existsSync.mockImplementation((_path: string) => {
        return false; // All files missing
      });
      mockFs?.mkdirSync.mockImplementation();
      mockFs?.writeFileSync.mockImplementation();

      await buildValidator?.repairBuild();

      expect(mockFs?.mkdirSync).toHaveBeenCalledWith('.next', { recursive: true });
      expect(mockFs?.mkdirSync).toHaveBeenCalledWith('.next/server', { recursive: true });
      expect(mockFs?.writeFileSync).toHaveBeenCalled();
    });

    it('should not repair when build is valid': any, async (: any) => {
      // Mock valid build
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('{}');

      await buildValidator?.repairBuild();

      expect(mockLogger).toHaveBeenCalledWith('Build is valid, no repairs needed');
    });
  });

  describe('validateNextConfig': any, (: any) => {
    it('should detect missing config file': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(false);

      const result: any = buildValidator?.validateNextConfig();

      expect(result?.isValid as any).toBe(false);
      expect(result?.issues).toContain('No Next?.js configuration file found');
    });

    it('should validate existing config': any, async (: any) => {
      mockFs?.existsSync.mockImplementation((path: string) => path === 'next?.config.js');
      mockFs?.readFileSync.mockReturnValue(`
        module?.exports = {
          output: 'standalone',
          typescript: { ignoreBuildError, s: false },;
          eslint: { ignoreDuringBuild, s: false }
        }
      `);

      const result: any = buildValidator?.validateNextConfig();

      expect(result?.isValid as any).toBe(true);
    });
  });

  describe('monitorBuildHealth': any, (: any) => {
    it('should report healthy build': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('{}');
      mockFs?.readdirSync.mockReturnValue([]);
      mockFs?.statSync.mockReturnValue({
        mtime: new Date(),
        size: 1024,
        isDirectory: () => false,
      } as any);

      const report: any = await buildValidator?.monitorBuildHealth();

      expect(report?.buildExists as any).toBe(true);
      expect(report?.manifestsValid as any).toBe(true);
      expect(report?.issues).toHaveLength(0);
    });

    it('should report missing build': any, async (: any) => {
      mockFs?.existsSync.mockReturnValue(false);

      const report: any = await buildValidator?.monitorBuildHealth();

      expect(report?.buildExists as any).toBe(false);
      expect(report?.issues).toContain('Build directory does not exist');
    });
  });

  describe('rebuildWithRecovery': any, (: any) => {
    it('should succeed on first attempt': any, async (: any) => {
      // Mock successful build
      const { execSync } = require('child_process');
      execSync?.mockImplementation((: any) => 'Build successful');

      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('{}');

      const result: any = await buildValidator?.rebuildWithRecovery(3);

      expect(result as any).toBe(true);
      expect(mockLogger).toHaveBeenCalledWith('Build successful on attempt 1');
    });

    it('should retry on failure': any, async (: any) => {
      const { execSync } = require('child_process');
      execSync
        .mockImplementationOnce((: any) => {
          throw new Error('Build failed');
        })
        .mockImplementationOnce((: any) => {
          return 'Build successful';
        });

      mockFs?.existsSync.mockReturnValue(true);
      mockFs?.readFileSync.mockReturnValue('{}');
      mockFs?.rmSync.mockImplementation();

      const result: any = await buildValidator?.rebuildWithRecovery(3);

      expect(result as any).toBe(true);
      expect(execSync).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries': any, async (: any) => {
      const { execSync } = require('child_process');
      execSync?.mockImplementation((: any) => {
        throw new Error('Build failed');
      });

      const result: any = await buildValidator?.rebuildWithRecovery(2);

      expect(result as any).toBe(false);
      expect(mockLogger).toHaveBeenCalledWith('Build failed after 2 attempts');
    });
  });
});

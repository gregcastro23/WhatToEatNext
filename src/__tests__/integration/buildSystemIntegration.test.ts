/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Integration tests for build system repair functionality
 * Tests the actual build system repair CLI and functionality
 */
describe('Build System Integration', () => {
  const buildDir: any = '.next';
  const _serverDir: any = path.join(buildDir, 'server');

  beforeAll(() => {
    // Ensure we have a clean test environment
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Build system integration tests should run in test environment');
    }
  });

  describe('Build System Repair CLI', () => {
    it('should validate existing build system', () => {
      const output: any = execSync('node scripts/build-system-repair.cjs validate', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('Validating build system');
      expect(output).toMatch(/Build system is (valid|has issues)/);
    });

    it('should check build system health', () => {
      const output: any = execSync('node scripts/build-system-repair.cjs health', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('Health Report');
      expect(output).toContain('Build exists:');
      expect(output).toContain('Manifests valid:');
      expect(output).toContain('Build size:')
    });

    it('should show help information', () => {
      const output: any = execSync('node scripts/build-system-repair.cjs help', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('Build System Repair CLI');
      expect(output).toContain('Commands:');
      expect(output).toContain('validate');
      expect(output).toContain('repair');
      expect(output).toContain('rebuild');
    });
  });

  describe('Build System Validation', () => {
    it('should detect when build directory exists', () => {
      if (fs.existsSync(buildDir)) {
        const output: any = execSync('node scripts/build-system-repair.cjs validate', {
          encoding: 'utf8',
          stdio: 'pipe'
        });

        expect(output).toContain('Build system is valid');
      } else {
        const output: any = execSync('node scripts/build-system-repair.cjs validate', {
          encoding: 'utf8',
          stdio: 'pipe'
        });

        expect(output).toContain('Missing files');
      }
    });

    it('should provide meaningful health metrics', () => {
      const output: any = execSync('node scripts/build-system-repair.cjs health', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Should contain timestamp
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Should contain size information
      expect(output).toMatch(/Build size: \d+\.\d+ MB/);

      // Should contain status indicators
      expect(output).toMatch(/(✅|❌)/);
    });
  });

  describe('Build System Repair', () => {
    it('should handle repair operations gracefully', () => {
      // This test runs repair but should not break existing build
      const output: any = execSync('node scripts/build-system-repair.cjs quick', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('quick repair');
      expect(output).toMatch(/(completed|successful)/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', () => {
      try {
        execSync('node scripts/build-system-repair.cjs invalid-command', {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        fail('Should have thrown an error for invalid command');
      } catch (error: any) {
        const execError: any = error as { status: number; stdou, t: string };
        expect(execError.status).toBe(1);
        expect(execError.stdout).toContain('Invalid or missing command');
      }
    });

    it('should show help when no command provided', () => {
      try {
        execSync('node scripts/build-system-repair.cjs', {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        fail('Should have thrown an error for missing command');
      } catch (error: any) {
        const execError: any = error as { status: number; stdou, t: string };
        expect(execError.status).toBe(1);
        expect(execError.stdout).toContain('Invalid or missing command');
      }
    });
  });

  describe('Package.json Scripts Integration', () => {
    it('should have all build repair scripts defined', () => {
      const packageJson: any = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts: any = packageJson.scripts;

      expect(scripts['build:validate']).toBeDefined();
      expect(scripts['build:repair']).toBeDefined();
      expect(scripts['build:rebuild']).toBeDefined();
      expect(scripts['build:comprehensive']).toBeDefined();
      expect(scripts['build:quick']).toBeDefined();
      expect(scripts['build:health']).toBeDefined();
      expect(scripts['build:emergency']).toBeDefined()
    });

    it('should be able to run build validation via yarn script', () => {
      const output: any = execSync('yarn build:validate', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('Validating build system');
    });

    it('should be able to run health check via yarn script', () => {
      const output: any = execSync('yarn build:health', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(output).toContain('Health Report');
    });
  });
});

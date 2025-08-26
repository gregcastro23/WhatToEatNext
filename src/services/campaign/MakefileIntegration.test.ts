/**
 * Tests for Makefile Integration System
 */

import { execSync } from 'child_process';
import fs from 'fs';

import { MakefileIntegration } from './MakefileIntegration';

// Mock fs and execSync
jest.mock('fs');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('MakefileIntegration', () => {
  let makefileIntegration: MakefileIntegration;

  beforeEach(() => {
    makefileIntegration = new MakefileIntegration();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default Makefile path', () => {
      const integration = new MakefileIntegration();
      expect(integration).toBeInstanceOf(MakefileIntegration);
    });

    it('should initialize with custom Makefile path', () => {
      const integration = new MakefileIntegration('/custom/Makefile');
      expect(integration).toBeInstanceOf(MakefileIntegration);
    });
  });

  describe('getCampaignTargets', () => {
    it('should return list of campaign targets', () => {
      const targets = makefileIntegration.getCampaignTargets();

      expect(targets.length).toBeGreaterThan(0);

      const targetNames = targets.map(t => t.name);
      expect(targetNames).toContain('campaign-phase1');
      expect(targetNames).toContain('campaign-phase2');
      expect(targetNames).toContain('campaign-phase3');
      expect(targetNames).toContain('campaign-phase4');
      expect(targetNames).toContain('campaign-status');
      expect(targetNames).toContain('campaign-execute-next');
    });

    it('should return targets with correct structure', () => {
      const targets = makefileIntegration.getCampaignTargets();
      const phase1Target = targets.find(t => t.name === 'campaign-phase1');

      expect(phase1Target).toBeDefined();
      expect(phase1Target?.description).toContain('Phase 1');
      expect(phase1Target!.commands).toHaveLength(4);
      expect(phase1Target!.phony).toBe(true);
    });

    it('should have validation targets for each phase', () => {
      const targets = makefileIntegration.getCampaignTargets();
      const targetNames = targets.map(t => t.name);

      expect(targetNames).toContain('campaign-validate-phase1');
      expect(targetNames).toContain('campaign-validate-phase2');
      expect(targetNames).toContain('campaign-validate-phase3');
      expect(targetNames).toContain('campaign-validate-phase4');
    });

    it('should have safety and recovery targets', () => {
      const targets = makefileIntegration.getCampaignTargets();
      const targetNames = targets.map(t => t.name);

      expect(targetNames).toContain('campaign-safety-check');
      expect(targetNames).toContain('campaign-emergency-rollback');
    });
  });

  describe('executeMakeTarget', () => {
    beforeEach(() => {
      mockExecSync.mockReturnValue('Make target executed successfully');
    });

    it('should execute make target successfully', async () => {
      const result = await makefileIntegration.executeMakeTarget('test-target');

      expect(mockExecSync).toHaveBeenCalledWith('make test-target', expect.any(Object));
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.target).toBe('test-target');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle make target execution failure', async () => {
      const error = new Error('Make failed') as unknown;
      error.status = 2;
      (error as any).stdout = 'Error output';
      mockExecSync.mockImplementation(() => {
        throw error;
      });

      const result = await makefileIntegration.executeMakeTarget('failing-target');

      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(2);
      expect(result.target).toBe('failing-target');
    });

    it('should support dry run mode', async () => {
      const result = await makefileIntegration.executeMakeTarget('test-target', { dryRun: true });

      expect(mockExecSync).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.output).toContain('DRY RUN');
      expect(result.executionTime).toBe(0);
    });

    it('should support silent mode', async () => {
      await makefileIntegration.executeMakeTarget('test-target', { silent: true });

      expect(mockExecSync).toHaveBeenCalledWith('make test-target', expect.objectContaining({ stdio: 'pipe' }));
    });

    it('should respect timeout option', async () => {
      await makefileIntegration.executeMakeTarget('test-target', { timeout: 5000 });

      expect(mockExecSync).toHaveBeenCalledWith('make test-target', expect.objectContaining({ timeout: 5000 }));
    });
  });

  describe('getCampaignProgress', () => {
    beforeEach(() => {
      // Mock successful make errors execution
      mockExecSync
        .mockReturnValueOnce('5') // TypeScript errors
        .mockReturnValueOnce('10') // Linting warnings
        .mockReturnValueOnce('150') // Enterprise systems
        .mockReturnValueOnce(''); // Build (successful)
    });

    it('should return campaign progress with correct phase determination', async () => {
      const progress = await makefileIntegration.getCampaignProgress();

      expect(progress.currentPhase).toBe(1); // Has TS errors, so phase 1
      expect(progress.totalPhases).toBe(4);
      expect(progress.typeScriptErrors).toBe(5);
      expect(progress.lintingWarnings).toBe(10);
      expect(progress.enterpriseSystems).toBe(150);
      expect(progress.lastUpdate).toBeInstanceOf(Date);
    });

    it('should determine phase 2 when TS errors are zero', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // No TypeScript errors
        .mockReturnValueOnce('10') // Still has linting warnings
        .mockReturnValueOnce('150')
        .mockReturnValueOnce('');

      const progress = await makefileIntegration.getCampaignProgress();

      expect(progress.currentPhase).toBe(2);
      expect(progress.typeScriptErrors).toBe(0);
    });

    it('should determine phase 3 when TS errors and linting warnings are zero', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // No TypeScript errors
        .mockReturnValueOnce('0') // No linting warnings
        .mockReturnValueOnce('150') // Not enough enterprise systems
        .mockReturnValueOnce('');

      const progress = await makefileIntegration.getCampaignProgress();

      expect(progress.currentPhase).toBe(3);
    });

    it('should determine phase 4 when first three phases are complete', async () => {
      mockExecSync
        .mockReturnValueOnce('0') // No TypeScript errors
        .mockReturnValueOnce('0') // No linting warnings
        .mockReturnValueOnce('250') // Enough enterprise systems
        .mockReturnValueOnce(''); // Build successful but need to check time

      const progress = await makefileIntegration.getCampaignProgress();

      expect(progress.currentPhase).toBe(4);
    });

    it('should handle errors gracefully', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });

      const progress = await makefileIntegration.getCampaignProgress();

      expect(progress.currentPhase).toBe(1);
      expect(progress.typeScriptErrors).toBe(-1);
      expect(progress.lintingWarnings).toBe(-1);
      expect(progress.buildTime).toBe(-1);
      expect(progress.enterpriseSystems).toBe(-1);
    });
  });

  describe('addCampaignTargetsToMakefile', () => {
    beforeEach(() => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('# Existing Makefile content\nhelp:\n\t@echo "Help"');
    });

    it('should add campaign targets to existing Makefile', async () => {
      const result = await makefileIntegration.addCampaignTargetsToMakefile();

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'Makefile',
        expect.stringContaining('# Campaign Execution Framework'),
        'utf8',
      );
    });

    it('should not add targets if they already exist', async () => {
      mockFs.readFileSync.mockReturnValue('# Campaign Execution Framework\nexisting content');

      const result = await makefileIntegration.addCampaignTargetsToMakefile();

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle missing Makefile', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = await makefileIntegration.addCampaignTargetsToMakefile();

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle file system errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const result = await makefileIntegration.addCampaignTargetsToMakefile();

      expect(result).toBe(false);
    });
  });

  describe('validateExistingTargets', () => {
    it('should validate that required targets exist', async () => {
      mockExecSync.mockReturnValue('Target executed successfully');

      const validation = await makefileIntegration.validateExistingTargets();

      expect(validation.valid).toBe(true);
      expect(validation.missing).toHaveLength(0);
    });

    it('should identify missing targets', async () => {
      mockExecSync.mockImplementation(command => {
        if (command.includes('make errors')) {
          throw new Error('Target not found');
        }
        return 'Success';
      });

      const validation = await makefileIntegration.validateExistingTargets();

      expect(validation.valid).toBe(false);
      expect(validation.missing).toContain('errors');
    });

    it('should check all required targets', async () => {
      const requiredTargets = ['errors', 'errors-by-type', 'errors-by-file', 'check', 'build', 'test', 'lint'];

      await makefileIntegration.validateExistingTargets();

      // Should have called execSync for each required target
      expect(mockExecSync).toHaveBeenCalledTimes(requiredTargets.length);

      requiredTargets.forEach(target => {
        expect(mockExecSync).toHaveBeenCalledWith(`make ${target}`, expect.any(Object));
      });
    });
  });

  describe('generateCampaignMakefileSection', () => {
    it('should generate valid Makefile syntax', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('# Existing content');

      await makefileIntegration.addCampaignTargetsToMakefile();

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Check for proper Makefile syntax
      expect(writtenContent).toContain('.PHONY:');
      expect(writtenContent).toContain('campaign-phase1:');
      expect(writtenContent).toContain('\t@echo'); // Commands should be indented with tabs

      // Check that all campaign targets are included
      const targets = makefileIntegration.getCampaignTargets();
      targets.forEach(target => {
        expect(writtenContent).toContain(`${target.name}:`);
        expect(writtenContent).toContain(target.description);
      });
    });

    it('should include phony targets declaration', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('# Existing content');

      await makefileIntegration.addCampaignTargetsToMakefile();

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;
      const phonyLine = writtenContent.split('\n').find(line => line.startsWith('.PHONY:'));

      expect(phonyLine).toBeDefined();
      expect(phonyLine).toContain('campaign-phase1');
      expect(phonyLine).toContain('campaign-status');
    });

    it('should include target dependencies', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('# Existing content');

      await makefileIntegration.addCampaignTargetsToMakefile();

      const writtenContent = mockFs.writeFileSync.mock.calls[0][1] as string;

      // Phase 2 should depend on phase 1 validation
      expect(writtenContent).toContain('campaign-phase2: campaign-validate-phase1');
    });
  });
});

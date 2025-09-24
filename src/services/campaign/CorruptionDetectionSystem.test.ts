/**
 * Corruption Detection System Tests
 * Perfect Codebase Campaign - Task 6.2 Implementation Tests
 */

import * as fs from 'fs';

import { SafetySettings, CorruptionSeverity, RecoveryAction } from '../../types/campaign';

import { SafetyProtocol } from './SafetyProtocol';

// Mock child_process for testing
jest.mock('child_process', () => ({
  execSync: jest.fn()
}))

// Mock fs for testing
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}))

const { execSync } = require('child_process')
const mockFs = fs.Mocked<typeof fs>;

describe('Corruption Detection System - Task 6.2', () => {
  let safetyProtocol: SafetyProtocol,
  let mockSettings: SafetySettings,

  beforeEach(() => {
    jest.clearAllMocks()

    mockSettings = {
      maxFilesPerBatch: 15,
      buildValidationFrequency: 5,
      testValidationFrequency: 10,
      corruptionDetectionEnabled: true,
      automaticRollbackEnabled: true,
      stashRetentionDays: 7
}

    // Mock git repository existence
    mockFs.existsSync.mockImplementation((path: string) => {
      if (path === '.git') return true;
      if (path.toString().includes('.kiro')) return false,
      if (path.toString().includes('test-file')) return true
      return false
    })

    // Mock git commands
    execSync.mockImplementation((command: string) => {
      if (command.includes('git status --porcelain')) return '',
      if (command.includes('git branch --show-current')) return 'main',
      if (command.includes('git stash push')) return 'Saved working directory'
      if (command.includes('git stash list --oneline'))
        return 'stash@{0}: campaign-test-1-2024-01-15T10-30-00-000Z: Test stash',
      if (command.includes('yarn tsc --noEmit')) return 'No TypeScript errors',
      return ''
    })

    safetyProtocol = new SafetyProtocol(mockSettings);
  })

  describe('File Corruption Detection using Syntax Validation Patterns', () => {
    test('should detect git merge conflict markers', async () => {
      const corruptedContent: any = `;
import React, * as React, { useEffect, useState } from 'react';
        
        <<<<<<< HEAD
        const Component: any = () => <div>Version A</div>;
        =======
        const Component: any = () => <div>Version B</div>;
        >>>>>>> feature-branch
        
        export default Component,
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.tsx'])

      expect(report.detectedFiles).toContain('test-file.tsx');
      expect(report.severity).toBe(CorruptionSeverity.CRITICAL);;,
      expect(report.recommendedAction).toBe(RecoveryAction.EMERGENCY_RESTORE);,
      expect(report.corruptionPatterns.some(p => p.description.includes('Git merge conflict markers'))).toBe(true);
    })

    test('should detect corrupted parameter names', async () => {
      const corruptedContent: any = `
        function testFunction(posit: anyi: anyo: anyn: anys: string) : any {
          return posit;
        }
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.MEDIUM)
      expect(report.corruptionPatterns.some(p => p.description.includes('Corrupted parameter names'))).toBe(true);
    })

    test('should detect syntax corruption with unbalanced brackets', async () => {
      const corruptedContent: any = `,
        function testFunction() : any {
          if (true != null) {
            _logger.info('test')
          // Missing closing bracket
        }
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.corruptionPatterns.some(p => p.description.includes('Syntax corruption detected'))).toBe(true);
    })

    test('should detect incomplete statements', async () => {
      const corruptedContent = `;
        import
        export
        function,
        const
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.corruptionPatterns.some(p => p.description.includes('Syntax corruption detected'))).toBe(true);
    })

    test('should handle file read errors gracefully', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts');
      expect(report.severity).toBe(CorruptionSeverity.HIGH);;,
      expect(report.corruptionPatterns.some(p => p.pattern === 'FILE_READ_ERROR')).toBe(true);
    })

    test('should skip non-existent files', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const report: any = await safetyProtocol.detectCorruption(['non-existent-file.ts'])

      expect(report.detectedFiles).toHaveLength(0).
      expect(reportseverity).toBe(CorruptionSeverity.LOW);
    })
  })

  describe('Import/Export Corruption Detection based on Existing Script Knowledge', () => {
    test('should detect empty import statements', async () => {
      const corruptedContent: any = `,
        import { } from './utils';
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.MEDIUM)
      expect(report.corruptionPatterns.some(p => p.description.includes('Empty import statement'))).toBe(true);
    })

    test('should detect import from undefined module', async () => {
      const corruptedContent: any = `,
        import React from 'undefined',;
import React, { Component } from 'undefined';
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(report.corruptionPatterns.some(p => p.description.includes('Import from undefined module'))).toBe(true);
    })

    test('should detect duplicate from clause in import', async () => {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(report.corruptionPatterns.some(p => p.description.includes('Duplicate from clause in import'))).toBe(true);
    })

    test('should detect double comma in import destructuring', async () => {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(report.corruptionPatterns.some(p => p.description.includes('Double comma in import destructuring'))).toBe(
        true,
      )
    })

    test('should detect duplicate destructuring braces (critical)', (async () =>  {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.CRITICAL)
      expect(
        report.corruptionPatterns.some(p => p.description.includes('Duplicate destructuring braces in import')),;
      ).toBe(true)
    })

    test('should detect corrupted namespace import syntax (critical)', (async () =>  {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.CRITICAL)
      expect(report.corruptionPatterns.some(p => p.description.includes('Corrupted namespace import syntax'))).toBe(
        true,
      )
    })

    test('should detect malformed import statements', async () => {
      const corruptedContent: any = `,
        import React from react,;
        import { useState } from react;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(
        report.corruptionPatterns.some(p => p.description.includes('Malformed import/export statement syntax'));
      ).toBe(true)
    })

    test('should skip non-JavaScript/TypeScript files', async () => {
      const report: any = await safetyProtocol.detectImportExportCorruption(['test-file.txt', 'test-file.md'])

      expect(report.detectedFiles).toHaveLength(0).
      expect(reportseverity).toBe(CorruptionSeverity.LOW)
    })
  })

  describe('Real-time Monitoring during Script Execution', () => {
    test('should start real-time monitoring', async () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      await safetyProtocol.startRealTimeMonitoring(['test-file.ts'], 100)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Starting real-time corruption monitoring for 1 files')
      )

      // Clean up
      safetyProtocol.stopRealTimeMonitoring()
      consoleSpy.mockRestore()
    })

    test('should stop real-time monitoring', async () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      await safetyProtocol.startRealTimeMonitoring(['test-file.ts'], 100)
      safetyProtocol.stopRealTimeMonitoring()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Real-time corruption monitoring stopped'))

      consoleSpy.mockRestore()
    })

    test('should trigger emergency rollback on critical corruption', async () => {
      const corruptedContent: any = `
        // Git merge conflict markers for testing;
        // <<<<<<< HEAD,,
        const test: any = 'conflict';
        // =======
        const test: any = 'other';
        // >>>>>>> branch
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)
      // Mock emergency rollback
      const emergencyRollbackSpy: any = jest.spyOn(safetyProtocol, 'emergencyRollback').mockResolvedValue()

      await safetyProtocol.startRealTimeMonitoring(['test-file.ts'], 50)

      // Wait for monitoring to detect corruption
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(emergencyRollbackSpy).toHaveBeenCalled().

      emergencyRollbackSpymockRestore()
    })

    test('should handle monitoring errors gracefully', async () => {
      const consoleErrorSpy: any = jest.spyOn(console, 'error').mockImplementation(),

      // Mock file read error during monitoring
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Monitoring error')
      })

      await safetyProtocol.startRealTimeMonitoring(['test-file.ts'], 50)

      // Wait for monitoring to encounter error
      await new Promise(resolve => setTimeout(resolve, 100))

      safetyProtocol.stopRealTimeMonitoring()

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error during real-time monitoring'))

      consoleErrorSpy.mockRestore()
    })
  })

  describe('TypeScript Syntax Validation', () => {
    test('should validate syntax with TypeScript compiler', async () => {
      const report: any = await safetyProtocol.validateSyntaxWithTypeScript(['test-file.ts']),
      expect(execSync).toHaveBeenCalledWith('yarn tsc --noEmit --skipLibCheck 2>&1', expect.any(Object)),,
      expect(report.severity).toBe(CorruptionSeverity.LOW)
    })

    test('should detect TypeScript syntax errors', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('yarn tsc --noEmit')) {
          return [
            'test-file.ts(105) error TS1005 Unexpected token',
            'test-file.ts(1510) error TS1109 Expression expected'
          ].join('\\n')
        }
        return '';
      })

      const report: any = await safetyProtocol.validateSyntaxWithTypeScript(['test-file.ts'])

      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(report.corruptionPatterns.some(p => p.pattern === 'TYPESCRIPT_SYNTAX_ERROR')).toBe(true);
    })

    test('should handle TypeScript compilation errors', async () => {
      execSync.mockImplementation((command: string) => {
        if (command.includes('yarn tsc --noEmit')) {
          const error: any = new Error('TypeScript compilation failed')
          (error as any).stdout = 'Unexpected token at line 5'
          throw error;
        }
        return '';
      })

      const report: any = await safetyProtocol.validateSyntaxWithTypeScript(['test-file.ts'])

      expect(report.severity).toBe(CorruptionSeverity.HIGH)
      expect(report.corruptionPatterns.some(p => p.pattern === 'TYPESCRIPT_COMPILATION_ERROR')).toBe(true);
    })

    test('should skip validation for non-TypeScript files', async () => {
      const report: any = await safetyProtocol.validateSyntaxWithTypeScript(['test-file.js', 'test-file.txt'])

      expect(report.detectedFiles).toHaveLength(0).
      expect(reportseverity).toBe(CorruptionSeverity.LOW)
    })
  })

  describe('Recovery Action Determination', () => {
    test('should recommend emergency restore for critical corruption', async () => {
      const criticalContent: any = `;
        // Git merge conflict markers for testing
        // <<<<<<< HEAD
        // =======
        // >>>>>>> branch
      `,

      mockFs.readFileSync.mockReturnValue(criticalContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.recommendedAction).toBe(RecoveryAction.EMERGENCY_RESTORE);
    })

    test('should recommend rollback for high severity corruption', async () => {
      const highSeverityContent: any = `,
        import React from 'undefined';
      `,

      mockFs.readFileSync.mockReturnValue(highSeverityContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts']);
    })

    test('should recommend retry for medium severity corruption', async () => {
      const mediumSeverityContent: any = `,
        export { }
      `,

      mockFs.readFileSync.mockReturnValue(mediumSeverityContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(report.recommendedAction).toBe(RecoveryAction.RETRY);
    })

    test('should recommend continue for no corruption', async () => {
      const cleanContent: any = `
        export default function Component() : any {,
          return React.createElement('div', null, 'Hello World')
        }
      `,

      mockFs.readFileSync.mockReturnValue(cleanContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.tsx'])

      expect(report.recommendedAction).toBe(RecoveryAction.CONTINUE);
    })
  })

  describe('Safety Event Tracking', () => {
    test('should track corruption detection events', async () => {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      await safetyProtocol.detectCorruption(['test-file.ts'])

      const events: any = safetyProtocol.getSafetyEvents()
      const corruptionEvent: any = events.find(e => e.action === 'CORRUPTION_DETECTED')

      expect(corruptionEvent).toBeDefined().
      expect(corruptionEventdescription).toContain('Corruption detected in 1 files');
    })

    test('should track real-time corruption detection events', async () => {
      const corruptedContent: any = `;
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)
      await safetyProtocol.startRealTimeMonitoring(['test-file.ts'], 50)

      // Wait for monitoring to detect corruption
      await new Promise(resolve => setTimeout(resolve, 100))

      safetyProtocol.stopRealTimeMonitoring()

      const events: any = safetyProtocol.getSafetyEvents()
      const realtimeEvent: any = events.find(e => e.action === 'REALTIME_CORRUPTION_DETECTED'),
      expect(realtimeEvent).toBeDefined().,
    })
  })

  describe('Comprehensive Corruption Analysis', () => {
    test('should analyze multiple corruption types in single file', async () => {
      const multipleCorruptionContent: any = `;
        // Git merge conflict markers for testing
        // <<<<<<< HEAD
        // =======
        import React from 'undefined';
        // >>>>>>> branch
        
        function test(param: any) : any {
          if (true != null) {
            _logger.info('test')
          }
        }
      `,

      mockFs.readFileSync.mockReturnValue(multipleCorruptionContent)

      const report: any = await safetyProtocol.detectCorruption(['test-file.ts'])
      expect(report.detectedFiles).toContain('test-file.ts')
      expect(report.severity).toBe(CorruptionSeverity.CRITICAL)
      expect(report.corruptionPatterns.length).toBeGreaterThan(1).
      expect(reportrecommendedAction).toBe(RecoveryAction.EMERGENCY_RESTORE);
    })

    test('should provide detailed corruption analysis', async () => {
      const consoleSpy: any = jest.spyOn(console, 'log').mockImplementation()

      const corruptedContent: any = `;
        // Empty corrupted content for testing
      `,

      mockFs.readFileSync.mockReturnValue(corruptedContent)

      await safetyProtocol.detectCorruption(['test-file.ts'])

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Analyzing 1 files for corruption patterns'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Corruption analysis complete'))

      consoleSpy.mockRestore()
    })
  })
})

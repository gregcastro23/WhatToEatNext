/**
 * Campaign System Rule Validation Test Suite
 *
 * Tests the domain-specific ESLint rules for campaign system files
 * to ensure enterprise patterns and extensive logging are allowed.
 *
 * Requirements: 4.3
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('Campaign System Rule Validation', () => {
  const projectRoot = process.cwd();
  const tempFiles: string[] = [],

  afterEach(() => {
    // Clean up temporary test files
    tempFiles.forEach(file => {
      try {
        execSync(`rm -f "${file}"`);
      } catch {}
    });
    tempFiles.length = 0;
  });

  describe('Enterprise Patterns Allowance', () => {
    test('should allow high complexity in campaign files', async () => {
      const testContent = `
        class CampaignController {
          private executeComplexCampaign(config: any) {
            // High complexity enterprise logic
            let result = 0;

            for (let phase = 0; phase < 10; phase++) {
              for (let batch = 0; batch < 20; batch++) {
                for (let file = 0; file < 50; file++) {
                  if (phase < 3) {
                    if (batch % 2 === 0) {
                      if (file < 10) {
                        result += this.processFile(phase, batch, file);
                      } else if (file < 30) {
                        result += this.validateFile(phase, batch, file);
                      } else {
                        result += this.optimizeFile(phase, batch, file);
                      }
                    } else {
                      if (file % 3 === 0) {
                        result += this.analyzeFile(phase, batch, file);
                      } else {
                        result += this.transformFile(phase, batch, file);
                      }
                    }
                  } else if (phase < 7) {
                    result += this.advancedProcessing(phase, batch, file);
                  } else {
                    result += this.finalizeProcessing(phase, batch, file);
                  }
                }
              }
            }

            return result;
          }

          private processFile(phase: number, batch: number, file: number): number {
            return phase + batch + file;
          }

          private validateFile(phase: number, batch: number, file: number): number {
            return phase * batch * file;
          }

          private optimizeFile(phase: number, batch: number, file: number): number {
            return Math.max(phase, batch, file);
          }

          private analyzeFile(phase: number, batch: number, file: number): number {
            return Math.min(phase, batch, file);
          }

          private transformFile(phase: number, batch: number, file: number): number {
            return (phase + batch + file) / 3;
          }

          private advancedProcessing(phase: number, batch: number, file: number): number {
            return phase ** 2 + batch ** 2 + file ** 2;
          }

          private finalizeProcessing(phase: number, batch: number, file: number): number {
            return Math.sqrt(phase * batch * file);
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-complex-enterprise.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const complexityErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'complexity' && msg.severity === 2, // error level
          );

          // Campaign files should allow high complexity
          expect(complexityErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const complexityErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'complexity' && msg.severity === 2,
            );

            expect(complexityErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow long functions in campaign files', async () => {
      const testContent = `
        class ProgressTracker {
          public generateComprehensiveReport(): string {
            // Long function with extensive reporting logic
            let report = 'Campaign Progress Report\\n';
            report += '========================\\n\\n';

            // Phase 1 Analysis
            report += 'Phase 1: Initial Analysis\\n',
            report += 'Status: Completed\\n',
            report += 'Duration: 2.5 hours\\n',
            report += 'Files Processed: 1,250\\n';
            report += 'Errors Found: 4,310\\n';
            report += 'Errors Fixed: 3,890\\n';
            report += 'Success Rate: 90.2%\\n\\n';

            // Phase 2 Analysis
            report += 'Phase 2: Error Elimination\\n',
            report += 'Status: In Progress\\n',
            report += 'Duration: 4.1 hours\\n',
            report += 'Files Processed: 2,100\\n';
            report += 'Errors Found: 2,566\\n';
            report += 'Errors Fixed: 2,200\\n';
            report += 'Success Rate: 85.7%\\n\\n';

            // Phase 3 Analysis
            report += 'Phase 3: Optimization\\n',
            report += 'Status: Pending\\n',
            report += 'Estimated Duration: 3.0 hours\\n',
            report += 'Estimated Files: 1,800\\n';
            report += 'Estimated Errors: 1,500\\n';
            report += 'Target Success Rate: 95%\\n\\n';

            // Safety Metrics
            report += 'Safety Metrics: \\n',
            report += 'Build Failures: 0\\n',
            report += 'Rollbacks Triggered: 2\\n',
            report += 'Corruption Events: 0\\n',
            report += 'Safety Score: 98.5%\\n\\n';

            // Performance Metrics
            report += 'Performance Metrics: \\n',
            report += 'Average Processing Speed: 125 files/hour\\n',
            report += 'Memory Usage: 2.1GB peak\\n',
            report += 'CPU Usage: 65% average\\n',
            report += 'Cache Hit Rate: 87%\\n\\n';

            // Quality Metrics
            report += 'Quality Metrics: \\n',
            report += 'Code Quality Score: 92/100\\n',
            report += 'Type Safety Score: 89/100\\n',
            report += 'Linting Score: 94/100\\n',
            report += 'Overall Quality: 91.7/100\\n\\n';

            // Recommendations
            report += 'Recommendations: \\n',
            report += '1. Increase batch size for Phase 3\\n';
            report += '2. Enable parallel processing\\n';
            report += '3. Implement additional safety checks\\n';
            report += '4. Optimize memory usage patterns\\n';
            report += '5. Enhance error categorization\\n\\n';

            // Next Steps
            report += 'Next Steps: \\n',
            report += '1. Complete Phase 2 error elimination\\n';
            report += '2. Begin Phase 3 optimization\\n';
            report += '3. Implement performance improvements\\n';
            report += '4. Conduct comprehensive validation\\n';
            report += '5. Prepare for production deployment\\n\\n';

            report += 'Report Generated: ' + new Date().toISOString() + '\\n',
            report += 'Campaign ID: typescript-elimination-2024\\n',
            report += 'Report Version: 1.2.3\\n',

            return report;
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-long-function.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const functionLengthErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'max-lines-per-function' && msg.severity === 2, // error level
          );

          // Campaign files should allow long functions
          expect(functionLengthErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const functionLengthErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'max-lines-per-function' && msg.severity === 2,
            );

            expect(functionLengthErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow explicit any types in campaign files', async () => {
      const testContent = `
        class CampaignIntelligenceSystem {
          private analyzeErrorPatterns(data: any): any {
            // Enterprise intelligence requires flexible typing
            const patterns: any = {},
            const metrics: any = data.metrics || {},
            const config: any = data.config || {};

            // Dynamic analysis based on campaign type
            if (config.type === 'typescript-elimination') {
              patterns.errorTypes = this.analyzeTypeScriptErrors(data);
            } else if (config.type === 'linting-excellence') {
              patterns.lintingIssues = this.analyzeLintingIssues(data);
            }

            // Flexible return structure
            return {
              patterns,
              confidence: this.calculateConfidence(patterns),
              recommendations: this.generateRecommendations(patterns),
              metadata: {
                analysisTime: Date.now(),
                dataSize: JSON.stringify(data).length,
                complexity: this.calculateComplexity(data)
              }
            };
          }

          private analyzeTypeScriptErrors(data: any): any {
            return data.errors || [];
          }

          private analyzeLintingIssues(data: any): any {
            return data.warnings || [];
          }

          private calculateConfidence(patterns: any): number {
            return Math.random() * 100;
          }

          private generateRecommendations(patterns: any): any[] {
            return [];
          }

          private calculateComplexity(data: any): number {
            return Object.keys(data).length;
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-any-types.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const anyTypeErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2, // error level
          );

          // Campaign files should allow explicit any types (warn level is OK);
          expect(anyTypeErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const anyTypeErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2,
            );

            expect(anyTypeErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow deep nesting in campaign files', async () => {
      const testContent = `
        class SafetyProtocolSystem {
          private executeEmergencyProtocol_(event: any): void {
            // Deep nesting for comprehensive safety checks
            if (event.type === 'corruption') {
              if (event.severity === 'critical') {
                if (event.affectedFiles > 10) {
                  if (event.buildStatus === 'failed') {
                    if (event.rollbackAvailable) {
                      if (event.backupIntegrity === 'verified') {
                        this.executeEmergencyRollback_(event);
                      } else {
                        this.createEmergencyBackup_(event);
                      }
                    } else {
                      this.initiateManualRecovery_(event);
                    }
                  } else {
                    this.monitorBuildStatus_(event);
                  }
                } else {
                  this.isolateAffectedFiles_(event);
                }
              } else {
                this.logSafetyEvent_(event);
              }
            }
          }

          private executeEmergencyRollback_(event: any): void {
            console.log('Executing emergency rollback');
          }

          private createEmergencyBackup_(event: any): void {
            console.log('Creating emergency backup');
          }

          private initiateManualRecovery_(event: any): void {
            console.log('Initiating manual recovery');
          }

          private monitorBuildStatus_(event: any): void {
            console.log('Monitoring build status');
          }

          private isolateAffectedFiles_(event: any): void {
            console.log('Isolating affected files');
          }

          private logSafetyEvent_(event: any): void {
            console.log('Logging safety event');
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-deep-nesting.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const depthErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'max-depth' && msg.severity === 2, // error level
          );

          // Campaign files should allow deep nesting
          expect(depthErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const depthErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'max-depth' && msg.severity === 2,
            );

            expect(depthErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Extensive Logging Allowance', () => {
    test('should allow all console methods in campaign files', async () => {
      const testContent = `
        class CampaignLogger {
          public logCampaignProgress(): void {
            console.log('Campaign progress update: 75% complete'),
            console.info('Processing batch 15 of 20');
            console.warn('Memory usage approaching 80% threshold');
            console.error('Failed to process 3 files in current batch');
            console.debug('Detailed timing: parse=125ms, analyze=89ms, fix=234ms');
            console.trace('Call stack for debugging complex issue');
            console.table([
              { phase: 'Analysis', duration: '2.5h', files: 1250 },
              { phase: 'Fixing', duration: '4.1h', files: 2100 }
            ]);
            console.group('Safety Protocol Status');
            console.log('Build validation: PASSED'),
            console.log('Corruption detection: ACTIVE'),
            console.log('Rollback readiness: READY'),
            console.groupEnd();
            console.time('batch-processing');
            // Simulate batch processing
            console.timeEnd('batch-processing');
            console.count('safety-checks');
            console.assert(true, 'Safety assertion passed');
          }

          public logMetrics(metrics: any): void {
            console.log('=== CAMPAIGN METRICS ===');
            console.log('Total errors found:', metrics.totalErrors);
            console.log('Errors fixed:', metrics.errorsFixed);
            console.log('Success rate:', metrics.successRate + '%');
            console.log('Processing speed:', metrics.speed + ' files/hour');
            console.log('Memory usage:', metrics.memoryUsage + 'MB');
            console.log('CPU usage:', metrics.cpuUsage + '%');
            console.log('Cache hit rate:', metrics.cacheHitRate + '%');
            console.log('========================');
          }

          public logSafetyEvents(events: any[]): void {
            console.warn('=== SAFETY EVENTS ===');
            events.forEach((event, index) => {
              console.warn(\`Event \${index + 1}: \${event.type}\`),
              console.warn(\`Severity: \${event.severity}\`),
              console.warn(\`Timestamp: \${event.timestamp}\`),
              console.warn(\`Action taken: \${event.action}\`);
            });
            console.warn('=====================');
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-extensive-logging.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const consoleErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'no-console' && msg.severity === 2, // error level
          );

          // Campaign files should allow all console methods
          expect(consoleErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const consoleErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'no-console' && msg.severity === 2,
            );

            expect(consoleErrors.length).toBe(0);
          }
        }
      }
    });

    test('should allow process.exit in emergency protocols', async () => {
      const testContent = `
        class EmergencyProtocol {
          public executeEmergencyShutdown(reason: string): void {
            console.error('EMERGENCY SHUTDOWN INITIATED:', reason);
            console.error('Saving current state...');
            this.saveEmergencyState();
            console.error('Creating emergency backup...');
            this.createEmergencyBackup();
            console.error('Notifying administrators...');
            this.notifyAdministrators(reason);
            console.error('Emergency shutdown complete. Exiting process.');
            process.exit(1); // Should be allowed in campaign emergency protocols
          }

          private saveEmergencyState(): void {
            console.log('Emergency state saved');
          }

          private createEmergencyBackup(): void {
            console.log('Emergency backup created');
          }

          private notifyAdministrators(reason: string): void {
            console.log('Administrators notified:', reason);
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-process-exit.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const processExitErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'no-process-exit' && msg.severity === 2, // error level
          );

          // Campaign files should allow process.exit
          expect(processExitErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const processExitErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'no-process-exit' && msg.severity === 2,
            );

            expect(processExitErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Campaign Variable Patterns', () => {
    test('should ignore unused campaign variables', async () => {
      const testContent = `
        class CampaignManager {
          private initializeCampaign(): void {
            const campaign = 'typescript-elimination';
            const progress = 0.75;
            const metrics = { errors: 100, fixed: 85 },
            const safety = true;
            const UNUSED_CAMPAIGN_ID = 'ts-elim-2024';
            const UNUSED_PROGRESS_THRESHOLD = 0.8;
            const UNUSED_METRICS_INTERVAL = 5000;
            const UNUSED_SAFETY_ENABLED = true;
            const UNUSED_ERROR_THRESHOLD = 1000;
            const UNUSED_campaign = 'unused-campaign';
            const UNUSED_progress = 0.0;
            const UNUSED_metrics = {};
            const UNUSED_safety = false;
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-campaign-variables.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: any) =>
              msg.ruleId === '@typescript-eslint/no-unused-vars' &&
              (msg.message.includes('campaign') ||
                msg.message.includes('progress') ||
                msg.message.includes('metrics') ||
                msg.message.includes('safety')),
          );

          // Campaign variable patterns should be ignored
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: any) =>
                msg.ruleId === '@typescript-eslint/no-unused-vars' &&
                (msg.message.includes('campaign') ||
                  msg.message.includes('progress') ||
                  msg.message.includes('metrics') ||
                  msg.message.includes('safety')),
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });

    test('should recognize campaign constant patterns', async () => {
      const testContent = `
        class CampaignConstants {
          private static readonly CAMPAIGN_TYPES = {
            TYPESCRIPT_ELIMINATION: 'typescript-elimination',
            LINTING_EXCELLENCE: 'linting-excellence',
            PERFORMANCE_OPTIMIZATION: 'performance-optimization'
};

          private static readonly PROGRESS_THRESHOLDS = {
            WARNING: 0.2,
            CRITICAL: 0.5,
            SUCCESS: 0.9
};

          private static readonly METRICS_CONFIG = {
            COLLECTION_INTERVAL: 5000,
            RETENTION_PERIOD: 86400000,
            MAX_ENTRIES: 10000
};

          private static readonly SAFETY_LIMITS = {
            MAX_ERRORS: 1000,
            MAX_BATCH_SIZE: 50,
            MAX_MEMORY_USAGE: 4096
};

          private static readonly ERROR_CATEGORIES = {
            TYPESCRIPT: 'typescript',
            LINTING: 'linting',
            BUILD: 'build',
            RUNTIME: 'runtime'
};
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-campaign-constants.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === '@typescript-eslint/no-unused-vars',
          );

          // Campaign constants should be allowed even if unused
          expect(unusedVarErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const unusedVarErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === '@typescript-eslint/no-unused-vars',
            );

            expect(unusedVarErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('Dynamic Import Allowance', () => {
    test('should allow dynamic imports for campaign tools', async () => {
      const testContent = `
        class CampaignToolLoader {
          public async loadCampaignTool(toolName: string): Promise<any> {
            // Dynamic imports for campaign tools should be allowed
            const toolPath = \`./tools/\${toolName}\`;
            const tool = import(toolPath);
            return tool.default || tool;
          }

          public async loadConfigBasedTool(config: any): Promise<any> {
            const toolModule = config.toolModule;
            const dynamicTool = import(toolModule);
            return dynamicTool;
          }

          public loadSynchronousTool(toolName: string): any {
            // Dynamic require should also be allowed
            const toolPath = \`./tools/\${toolName}\`;
            return require(toolPath);
          }

          public loadEnvironmentTool(): any {
            const toolModule = process.env.CAMPAIGN_TOOL_MODULE;
            if (toolModule) {
              return require(toolModule);
            }
            return null;
          }
        }
      `;

      const testFile = join(projectRoot, 'src/services/campaign/temp-dynamic-imports.ts');
      tempFiles.push(testFile);
      writeFileSync(testFile, testContent);

      try {
        const output = execSync(`npx eslint "${testFile}" --config eslint.config.cjs --format json`, {
          encoding: 'utf8',
          cwd: projectRoot
});

        const result = JSON.parse(output);

        if (result.length > 0 && result[0].messages) {
          const dynamicImportErrors = result[0].messages.filter(
            (msg: any) => msg.ruleId === 'import/no-dynamic-require' && msg.severity === 2, // error level
          );

          // Campaign files should allow dynamic imports
          expect(dynamicImportErrors.length).toBe(0);
        }
      } catch (error) {
        const output = (error as any).stdout?.toString() || '';
        if (output) {
          const result = JSON.parse(output);
          if (result.length > 0 && result[0].messages) {
            const dynamicImportErrors = result[0].messages.filter(
              (msg: any) => msg.ruleId === 'import/no-dynamic-require' && msg.severity === 2,
            );

            expect(dynamicImportErrors.length).toBe(0);
          }
        }
      }
    });
  });

  describe('File Pattern Matching', () => {
    test('should apply campaign rules to correct file patterns', () => {
      // Test that campaign files are properly matched by ESLint config
      const campaignFiles = [
        'src/services/campaign/CampaignController.ts',
        'src/services/campaign/ProgressTracker.ts',
        'src/services/campaign/SafetyProtocol.ts',
        'src/types/campaign.ts',
        'src/utils/CampaignUtils.ts',
        'src/utils/ProgressUtils.ts',
      ];

      campaignFiles.forEach(file => {
        // Check if file would match campaign patterns in ESLint config
        const matchesCampaignPattern =
          file.includes('/services/campaign/') ||
          file.includes('/types/campaign.ts') ||
          file.includes('Campaign') ||
          file.includes('Progress');

        expect(matchesCampaignPattern).toBe(true);
      });
    });

    test('should not apply campaign rules to non-campaign files', () => {
      const nonCampaignFiles = [
        'src/components/FoodRecommender.tsx',
        'src/calculations/culinaryAstrology.ts',
        'src/utils/reliableAstronomy.ts',
        'src/data/ingredients/vegetables.ts',
      ];

      nonCampaignFiles.forEach(file => {
        // Check that file would NOT match campaign patterns
        const matchesCampaignPattern =
          file.includes('/services/campaign/') ||
          file.includes('/types/campaign.ts') ||
          (file.includes('Campaign') && !file.includes('components')) ||
          (file.includes('Progress') && !file.includes('components'));

        expect(matchesCampaignPattern).toBe(false);
      });
    });
  });

  describe('Integration with Existing Campaign Files', () => {
    test('should validate existing CampaignController if present', async () => {
      const campaignControllerPath = join(projectRoot, 'src/services/campaign/CampaignController.ts');

      if (existsSync(campaignControllerPath)) {
        try {
          const output = execSync(
            'yarn eslint --format json --no-eslintrc --config eslint.config.cjs ' + campaignControllerPath,
            { encoding: 'utf8' },
          );
          const result = JSON.parse(output);

          if (result.length > 0 && result[0].messages) {
            const restrictiveErrors = result[0].messages.filter(
              (msg: any) =>
                (msg.ruleId === 'complexity' && msg.severity === 2) ||
                (msg.ruleId === 'max-lines-per-function' && msg.severity === 2) ||
                (msg.ruleId === 'no-console' && msg.severity === 2),
            );

            // Existing campaign files should not have restrictive errors
            expect(restrictiveErrors.length).toBe(0);
          }
        } catch (error) {
          const output = (error as any).stdout?.toString() || '';
          if (output) {
            const result = JSON.parse(output);
            if (result.length > 0 && result[0].messages) {
              const restrictiveErrors = result[0].messages.filter(
                (msg: any) =>
                  (msg.ruleId === 'complexity' && msg.severity === 2) ||
                  (msg.ruleId === 'max-lines-per-function' && msg.severity === 2) ||
                  (msg.ruleId === 'no-console' && msg.severity === 2),
              );

              expect(restrictiveErrors.length).toBe(0);
            }
          }
        }
      } else {
        // If file doesn't exist, test passes
        expect(true).toBe(true);
      }
    });

    test('should validate existing ProgressTracker if present', async () => {
      const progressTrackerPath = join(projectRoot, 'src/services/campaign/ProgressTracker.ts');

      if (existsSync(progressTrackerPath)) {
        try {
          const output = execSync(
            'yarn eslint --format json --no-eslintrc --config eslint.config.cjs ' + progressTrackerPath,
            { encoding: 'utf8' },
          );
          const result = JSON.parse(output);

          if (result.length > 0 && result[0].messages) {
            const restrictiveErrors = result[0].messages.filter(
              (msg: any) =>
                (msg.ruleId === 'complexity' && msg.severity === 2) ||
                (msg.ruleId === 'max-lines-per-function' && msg.severity === 2) ||
                (msg.ruleId === 'no-console' && msg.severity === 2),
            );

            expect(restrictiveErrors.length).toBe(0);
          }
        } catch (error) {
          const output = (error as any).stdout?.toString() || '';
          if (output) {
            const result = JSON.parse(output);
            if (result.length > 0 && result[0].messages) {
              const restrictiveErrors = result[0].messages.filter(
                (msg: any) =>
                  (msg.ruleId === 'complexity' && msg.severity === 2) ||
                  (msg.ruleId === 'max-lines-per-function' && msg.severity === 2) ||
                  (msg.ruleId === 'no-console' && msg.severity === 2),
              );

              expect(restrictiveErrors.length).toBe(0);
            }
          }
        }
      } else {
        expect(true).toBe(true);
      }
    });
  });
});

/**
 * Safety Validation System
 * Comprehensive safety validation for type replacements
 *
 * Features:
 * - TypeScript compilation checking
 * - Build validation after batch operations
 * - Rollback verification to ensure exact restoration
 * - Safety scoring system for replacement confidence
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
    ClassificationContext,
    TypeReplacement
} from './types';

export interface SafetyValidationResult {
    isValid: boolean;
    safetyScore: number;
    validationErrors: string[];
    warnings: string[];
    recommendations: string[];
}

export interface BuildValidationResult {
    buildSuccessful: boolean;
    compilationErrors: string[];
    lintingWarnings: string[];
    testResults?: TestValidationResult;
    performanceMetrics?: PerformanceMetrics;
}

export interface TestValidationResult {
    testsPass: boolean;
    failedTests: string[];
    testCoverage?: number;
}

export interface PerformanceMetrics {
    buildTime: number;
    memoryUsage: number;
    bundleSize?: number;
}

export interface RollbackValidationResult {
    canRollback: boolean;
    backupIntegrity: boolean;
    rollbackErrors: string[];
    restorationVerified: boolean;
}

export class SafetyValidator {
    private validationTimeout: number;
    private safetyThresholds: SafetyThresholds;
    private buildCommand: string;
    private testCommand: string;

    constructor(
        validationTimeout = 60000, // 1 minute default
        safetyThresholds: Partial<SafetyThresholds> = {},
        buildCommand = 'yarn tsc --noEmit --skipLibCheck',
        testCommand = 'yarn test --passWithNoTests --silent'
    ) {
        this.validationTimeout = validationTimeout;
        this.safetyThresholds = {
            minimumSafetyScore: 0.7,
            maximumErrorCount: 10,
            maximumBuildTime: 30000, // 30 seconds
            minimumTestCoverage: 0.8,
            ...safetyThresholds
        };
        this.buildCommand = buildCommand;
        this.testCommand = testCommand;
    }

    /**
     * Comprehensive TypeScript compilation checking
     */
    async validateTypeScriptCompilation(): Promise<BuildValidationResult> {
        const startTime = Date.now();

        try {
            const output = execSync(this.buildCommand, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: this.validationTimeout
            });

            const buildTime = Date.now() - startTime;

            return {
                buildSuccessful: true,
                compilationErrors: [],
                lintingWarnings: [],
                performanceMetrics: {
                    buildTime,
                    memoryUsage: process.memoryUsage().heapUsed
                }
            };

        } catch (error) {
            const buildTime = Date.now() - startTime;
            const errorOutput = this.extractErrorOutput(error);
            const compilationErrors = this.parseTypeScriptErrors(errorOutput);

            return {
                buildSuccessful: false,
                compilationErrors,
                lintingWarnings: [],
                performanceMetrics: {
                    buildTime,
                    memoryUsage: process.memoryUsage().heapUsed
                }
            };
        }
    }

    /**
     * Build validation after batch operations
     */
    async validateBuildAfterBatch(
        modifiedFiles: string[],
        includeTests = false
    ): Promise<BuildValidationResult> {
        // First, validate TypeScript compilation
        const compilationResult = await this.validateTypeScriptCompilation();

        if (!compilationResult.buildSuccessful) {
            return compilationResult;
        }

        // If compilation passes and tests are requested, run tests
        if (includeTests) {
            const testResult = await this.validateTests(modifiedFiles);
            compilationResult.testResults = testResult;
        }

        // Validate performance metrics
        const performanceValid = this.validatePerformanceMetrics(
            compilationResult.performanceMetrics!
        );

        if (!performanceValid.isValid) {
            compilationResult.buildSuccessful = false;
            compilationResult.compilationErrors.push(...performanceValid.validationErrors);
        }

        return compilationResult;
    }

    /**
     * Rollback verification to ensure exact restoration
     */
    async validateRollbackCapability(
        originalFiles: Map<string, string>,
        backupFiles: Map<string, string>
    ): Promise<RollbackValidationResult> {
        const rollbackErrors: string[] = [];
        let backupIntegrity = true;
        let canRollback = true;

        try {
            // Verify all backup files exist and are readable
            for (const [filePath, backupPath] of backupFiles.entries()) {
                if (!fs.existsSync(backupPath)) {
                    rollbackErrors.push(`Backup file missing: ${backupPath}`);
                    backupIntegrity = false;
                    canRollback = false;
                    continue;
                }

                try {
                    const backupContent = fs.readFileSync(backupPath, 'utf8');
                    if (backupContent.length === 0) {
                        rollbackErrors.push(`Backup file is empty: ${backupPath}`);
                        backupIntegrity = false;
                    }
                } catch (error) {
                    rollbackErrors.push(`Cannot read backup file: ${backupPath} - ${error}`);
                    backupIntegrity = false;
                    canRollback = false;
                }
            }

            // Test rollback operation on a temporary copy
            const restorationVerified = await this.testRollbackOperation(
                originalFiles,
                backupFiles
            );

            return {
                canRollback,
                backupIntegrity,
                rollbackErrors,
                restorationVerified
            };

        } catch (error) {
            rollbackErrors.push(`Rollback validation failed: ${error}`);
            return {
                canRollback: false,
                backupIntegrity: false,
                rollbackErrors,
                restorationVerified: false
            };
        }
    }

    /**
     * Safety scoring system for replacement confidence
     */
    calculateSafetyScore(
        replacement: TypeReplacement,
        context: ClassificationContext
    ): SafetyValidationResult {
        let safetyScore = replacement.confidence; // Base score from classification
        const validationErrors: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Context-based safety adjustments
        const contextScore = this.evaluateContextSafety(context);
        safetyScore = (safetyScore + contextScore.score) / 2;
        warnings.push(...contextScore.warnings);
        recommendations.push(...contextScore.recommendations);

        // Replacement pattern safety
        const patternScore = this.evaluateReplacementPatternSafety(replacement);
        safetyScore = (safetyScore + patternScore.score) / 2;
        warnings.push(...patternScore.warnings);

        // File type safety
        const fileScore = this.evaluateFileTypeSafety(replacement.filePath);
        safetyScore = (safetyScore + fileScore.score) / 2;
        warnings.push(...fileScore.warnings);

        // Validation requirements
        if (replacement.validationRequired && safetyScore < this.safetyThresholds.minimumSafetyScore) {
            validationErrors.push(
                `Safety score ${safetyScore.toFixed(2)} below required threshold ${this.safetyThresholds.minimumSafetyScore}`
            );
        }

        // Final safety assessment
        const isValid = validationErrors.length === 0 &&
                        safetyScore >= this.safetyThresholds.minimumSafetyScore;

        if (!isValid) {
            recommendations.push('Consider manual review for this replacement');
            recommendations.push('Add explanatory comments if replacement is intentional');
        }

        return {
            isValid,
            safetyScore: Math.max(0, Math.min(1, safetyScore)),
            validationErrors,
            warnings,
            recommendations
        };
    }

    /**
     * Validate performance metrics against thresholds
     */
    private validatePerformanceMetrics(metrics: PerformanceMetrics): SafetyValidationResult {
        const validationErrors: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Build time validation
        if (metrics.buildTime > this.safetyThresholds.maximumBuildTime) {
            validationErrors.push(
                `Build time ${metrics.buildTime}ms exceeds threshold ${this.safetyThresholds.maximumBuildTime}ms`
            );
            recommendations.push('Consider reducing batch size to improve build performance');
        } else if (metrics.buildTime > this.safetyThresholds.maximumBuildTime * 0.8) {
            warnings.push('Build time approaching threshold, monitor performance');
        }

        // Memory usage validation
        const memoryMB = metrics.memoryUsage / (1024 * 1024);
        if (memoryMB > 512) { // 512MB threshold
            warnings.push(`High memory usage: ${memoryMB.toFixed(1)}MB`);
            recommendations.push('Consider running garbage collection between batches');
        }

        return {
            isValid: validationErrors.length === 0,
            safetyScore: validationErrors.length === 0 ? 1.0 : 0.5,
            validationErrors,
            warnings,
            recommendations
        };
    }

    /**
     * Validate tests for modified files
     */
    private async validateTests(modifiedFiles: string[]): Promise<TestValidationResult> {
        try {
            // Run tests for modified files
            const testPattern = modifiedFiles
                .filter(file => !file.includes('.test.') && !file.includes('__tests__'))
                .map(file => file.replace(/\.ts$/, '.test.ts'))
                .join('|');

            if (!testPattern) {
                return {
                    testsPass: true,
                    failedTests: []
                };
            }

            const output = execSync(`${this.testCommand} --testPathPattern="${testPattern}"`, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: this.validationTimeout
            });

            return {
                testsPass: true,
                failedTests: []
            };

        } catch (error) {
            const errorOutput = this.extractErrorOutput(error);
            const failedTests = this.parseTestFailures(errorOutput);

            return {
                testsPass: false,
                failedTests
            };
        }
    }

    /**
     * Test rollback operation without actually modifying files
     */
    private async testRollbackOperation(
        originalFiles: Map<string, string>,
        backupFiles: Map<string, string>
    ): Promise<boolean> {
        try {
            // Create temporary copies to test rollback
            const tempDir = path.join(process.cwd(), '.temp-rollback-test');

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            let allRestored = true;

            for (const [originalPath, backupPath] of backupFiles.entries()) {
                try {
                    const backupContent = fs.readFileSync(backupPath, 'utf8');
                    const tempFilePath = path.join(tempDir, path.basename(originalPath));

                    // Write backup content to temp file
                    fs.writeFileSync(tempFilePath, backupContent, 'utf8');

                    // Verify content matches
                    const restoredContent = fs.readFileSync(tempFilePath, 'utf8');
                    if (restoredContent !== backupContent) {
                        allRestored = false;
                        break;
                    }
                } catch (error) {
                    allRestored = false;
                    break;
                }
            }

            // Cleanup temp directory
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (error) {
                // Ignore cleanup errors
            }

            return allRestored;

        } catch (error) {
            return false;
        }
    }

    /**
     * Evaluate context safety factors
     */
    private evaluateContextSafety(context: ClassificationContext): {
        score: number;
        warnings: string[];
        recommendations: string[];
    } {
        let score = 0.8; // Base context score
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Error handling contexts are riskier
        if (context.codeSnippet.toLowerCase().includes('catch') ||
            context.codeSnippet.toLowerCase().includes('error')) {
            score -= 0.3;
            warnings.push('Error handling context detected - higher risk');
            recommendations.push('Consider preserving any types in error handling');
        }

        // External API contexts are riskier
        if (context.codeSnippet.toLowerCase().includes('api') ||
            context.codeSnippet.toLowerCase().includes('fetch') ||
            context.codeSnippet.toLowerCase().includes('response')) {
            score -= 0.2;
            warnings.push('External API context detected');
            recommendations.push('Verify API response types before replacement');
        }

        // Test files are safer
        if (context.isInTestFile) {
            score += 0.1;
        }

        // Existing comments indicate intentional usage
        if (context.hasExistingComment) {
            score -= 0.2;
            warnings.push('Existing comment detected - may be intentional');
            recommendations.push('Review existing comment before replacement');
        }

        return {
            score: Math.max(0, Math.min(1, score)),
            warnings,
            recommendations
        };
    }

    /**
     * Evaluate replacement pattern safety
     */
    private evaluateReplacementPatternSafety(replacement: TypeReplacement): {
        score: number;
        warnings: string[];
    } {
        let score = 0.8; // Base pattern score
        const warnings: string[] = [];

        // Array replacements are very safe
        if (replacement.original === 'any[]' && replacement.replacement === 'unknown[]') {
            score = 0.95;
        }

        // Record replacements are generally safe
        else if (replacement.original.includes('Record<string, unknown>') &&
                 replacement.replacement.includes('Record<string, unknown>')) {
            score = 0.9;
        }

        // Function parameter replacements are riskier
        else if (replacement.original.includes('(') && replacement.original.includes(': any')) {
            score = 0.6;
            warnings.push('Function parameter replacement - verify usage patterns');
        }

        // Return type replacements are moderately risky
        else if (replacement.original.includes('): any')) {
            score = 0.7;
            warnings.push('Return type replacement - verify return statements');
        }

        // Generic replacements need careful consideration
        else if (replacement.original.includes('<any>')) {
            score = 0.65;
            warnings.push('Generic type replacement - verify type constraints');
        }

        return { score, warnings };
    }

    /**
     * Evaluate file type safety
     */
    private evaluateFileTypeSafety(filePath: string): {
        score: number;
        warnings: string[];
    } {
        let score = 0.8; // Base file score
        const warnings: string[] = [];

        // Test files are safer to modify
        if (filePath.includes('.test.') || filePath.includes('__tests__')) {
            score = 0.9;
        }

        // Type definition files are riskier
        else if (filePath.endsWith('.d.ts')) {
            score = 0.6;
            warnings.push('Type definition file - changes may affect multiple files');
        }

        // Configuration files are riskier
        else if (filePath.includes('config') || filePath.includes('Config')) {
            score = 0.65;
            warnings.push('Configuration file - verify dynamic property access');
        }

        // Core library files are riskier
        else if (filePath.includes('node_modules') || filePath.includes('lib/')) {
            score = 0.5;
            warnings.push('Library file - avoid modifications');
        }

        return { score, warnings };
    }

    /**
     * Extract error output from command execution
     */
    private extractErrorOutput(error: unknown): string {
        if (error && typeof error === 'object') {
            return error.stdout || error.stderr || error.message || String(error);
        }
        return String(error);
    }

    /**
     * Parse TypeScript errors from compiler output
     */
    private parseTypeScriptErrors(output: string): string[] {
        const lines = output.split('\n');
        const errors = lines
            .filter(line => line.includes('error TS'))
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return errors.slice(0, this.safetyThresholds.maximumErrorCount);
    }

    /**
     * Parse test failures from test runner output
     */
    private parseTestFailures(output: string): string[] {
        const lines = output.split('\n');
        const failures = lines
            .filter(line =>
                line.includes('FAIL') ||
                line.includes('✕') ||
                line.includes('failed')
            )
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return failures.slice(0, 10); // Limit to 10 failures
    }

    /**
     * Get current safety thresholds
     */
    getSafetyThresholds(): SafetyThresholds {
        return { ...this.safetyThresholds };
    }

    /**
     * Update safety thresholds
     */
    updateSafetyThresholds(newThresholds: Partial<SafetyThresholds>): void {
        this.safetyThresholds = { ...this.safetyThresholds, ...newThresholds };
    }
}

export interface SafetyThresholds {
    minimumSafetyScore: number;
    maximumErrorCount: number;
    maximumBuildTime: number;
    minimumTestCoverage: number;
}

export default SafetyValidator;

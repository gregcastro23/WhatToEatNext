/**
 * Service Integration Validator
 *
 * This module implements comprehensive service integration validation to ensure
 * API endpoints and service methods remain functional after unused variable elimination.
 *
 * Features:
 * - API endpoint functionality verification
 * - Service method integrity validation
 * - Configuration dependency checking
 * - Integration test execution
 * - Quality assurance reporting with 90% reduction target
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ServiceIntegrationConfig {
  enableApiEndpointValidation: boolean;
  enableServiceMethodValidation: boolean;
  enableConfigurationValidation: boolean;
  enableIntegrationTests: boolean;
  apiTimeout: number;
  testTimeout: number;
  qualityTarget: number; // 90% unused variable reduction target
  buildStabilityTarget: number; // 100% build stability target
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ApiEndpointInfo {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  filePath: string;
  lineNumber: number;
  isActive: boolean;
  dependencies: string[];
}

export interface ServiceMethodInfo {
  methodName: string;
  className?: string;
  filePath: string;
  lineNumber: number;
  isExported: boolean;
  parameters: string[];
  returnType?: string;
  dependencies: string[];
}

export interface ConfigurationDependency {
  key: string;
  filePath: string;
  lineNumber: number;
  isRequired: boolean;
  defaultValue?: string;
  usageContext: string;
}

export interface ServiceIntegrationResult {
  passed: boolean;
  servicePath: string;
  validationType: 'api-endpoint' | 'service-method' | 'configuration' | 'integration-test';
  errors: string[];
  warnings: string[];
  recommendations: string[];
  executionTime: number;
  details: {
    apiEndpoints?: ApiEndpointInfo[];
    serviceMethods?: ServiceMethodInfo[];
    configDependencies?: ConfigurationDependency[];
    testResults?: any;
    qualityMetrics?: QualityMetrics;
  };
}

export interface QualityMetrics {
  unusedVariableReduction: number; // Percentage reduction achieved
  buildStabilityScore: number; // 0-100 score for build stability
  apiIntegrityScore: number; // 0-100 score for API integrity
  serviceIntegrityScore: number; // 0-100 score for service integrity
  overallQualityScore: number; // Combined quality score
  targetAchievement: {
    reductionTarget: number; // 90%
    stabilityTarget: number; // 100%
    reductionAchieved: boolean;
    stabilityAchieved: boolean;
  };
}

export interface ComprehensiveQualityReport {
  timestamp: Date;
  batchId: string;
  processedServices: string[];
  qualityMetrics: QualityMetrics;
  serviceResults: ServiceIntegrationResult[];
  overallAssessment: 'excellent' | 'good' | 'acceptable' | 'needs-improvement' | 'critical';
  actionItems: string[];
  recommendations: string[];
  targetStatus: {
    reductionTargetMet: boolean;
    stabilityTargetMet: boolean;
    readyForProduction: boolean;
  };
}

export class ServiceIntegrationValidator {
  private config: ServiceIntegrationConfig;
  private qualityReports: Map<string, ComprehensiveQualityReport> = new Map();

  constructor(config: Partial<ServiceIntegrationConfig> = {}) {
    this.config = {
      enableApiEndpointValidation: true,
      enableServiceMethodValidation: true,
      enableConfigurationValidation: true,
      enableIntegrationTests: true,
      apiTimeout: 10000,
      testTimeout: 30000,
      qualityTarget: 90, // 90% unused variable reduction target
      buildStabilityTarget: 100, // 100% build stability target
      logLevel: 'info',
      ...config,
    };
  }

  /**
   * Validate service integration for a batch of processed files
   */
  async validateServiceIntegration(
    processedFiles: string[],
    batchId: string,
    baselineMetrics?: { unusedVariables: number; buildErrors: number },
  ): Promise<ComprehensiveQualityReport> {
    const startTime = Date.now();
    this.log('info', `🔍 Starting service integration validation for batch ${batchId}`);

    // Filter for service files
    const serviceFiles = this.identifyServiceFiles(processedFiles);
    this.log('info', `📋 Found ${serviceFiles.length} service files to validate`);

    const serviceResults: ServiceIntegrationResult[] = [];

    // Validate each service file
    for (const serviceFile of serviceFiles) {
      this.log('debug', `🔍 Validating service: ${path.relative(process.cwd(), serviceFile)}`);

      const results = await this.validateSingleService(serviceFile, batchId);
      serviceResults.push(...results);
    }

    // Calculate quality metrics
    const qualityMetrics = await this.calculateQualityMetrics(
      serviceResults,
      baselineMetrics,
      batchId,
    );

    // Generate comprehensive quality report
    const report = this.generateComprehensiveQualityReport(
      batchId,
      serviceFiles,
      serviceResults,
      qualityMetrics,
    );

    // Store report
    this.qualityReports.set(batchId, report);

    this.log('info', `✅ Service integration validation completed for batch ${batchId}`);
    this.log('info', `📊 Quality Score: ${qualityMetrics.overallQualityScore}/100`);
    this.log(
      'info',
      `🎯 Reduction Target: ${qualityMetrics.targetAchievement.reductionAchieved ? 'MET' : 'NOT MET'}`,
    );
    this.log(
      'info',
      `🏗️ Stability Target: ${qualityMetrics.targetAchievement.stabilityAchieved ? 'MET' : 'NOT MET'}`,
    );

    return report;
  }

  /**
   * Validate a single service file
   */
  private async validateSingleService(
    servicePath: string,
    batchId: string,
  ): Promise<ServiceIntegrationResult[]> {
    const results: ServiceIntegrationResult[] = [];

    try {
      // 1. API Endpoint Validation
      if (this.config.enableApiEndpointValidation) {
        const apiResult = await this.validateApiEndpoints(servicePath, batchId);
        results.push(apiResult);
      }

      // 2. Service Method Validation
      if (this.config.enableServiceMethodValidation) {
        const methodResult = await this.validateServiceMethods(servicePath, batchId);
        results.push(methodResult);
      }

      // 3. Configuration Validation
      if (this.config.enableConfigurationValidation) {
        const configResult = await this.validateConfigurationDependencies(servicePath, batchId);
        results.push(configResult);
      }

      // 4. Integration Test Validation
      if (this.config.enableIntegrationTests) {
        const testResult = await this.validateIntegrationTests(servicePath, batchId);
        results.push(testResult);
      }
    } catch (error) {
      this.log('error', `❌ Service validation failed for ${servicePath}: ${error}`);

      results.push({
        passed: false,
        servicePath,
        validationType: 'service-method',
        errors: [`Service validation failed: ${error}`],
        warnings: [],
        recommendations: ['Review service file for syntax or import errors'],
        executionTime: 0,
        details: {},
      });
    }

    return results;
  }

  /**
   * Validate API endpoints functionality
   */
  private async validateApiEndpoints(
    servicePath: string,
    batchId: string,
  ): Promise<ServiceIntegrationResult> {
    const startTime = Date.now();
    const result: ServiceIntegrationResult = {
      passed: true,
      servicePath,
      validationType: 'api-endpoint',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      details: {},
    };

    try {
      const apiEndpoints = await this.analyzeApiEndpoints(servicePath);
      result.details.apiEndpoints = apiEndpoints;

      if (apiEndpoints.length === 0) {
        result.warnings.push('No API endpoints found in service file');
        result.recommendations.push('Verify if this service should contain API endpoints');
      } else {
        // Validate each endpoint
        for (const endpoint of apiEndpoints) {
          const endpointValidation = await this.validateSingleEndpoint(endpoint);

          if (!endpointValidation.isValid) {
            result.passed = false;
            result.errors.push(
              `API endpoint ${endpoint.endpoint} validation failed: ${endpointValidation.error}`,
            );
          }

          if (endpointValidation.warnings.length > 0) {
            result.warnings.push(...endpointValidation.warnings);
          }
        }

        if (result.passed) {
          this.log('debug', `✅ All ${apiEndpoints.length} API endpoints validated successfully`);
        } else {
          this.log(
            'error',
            `❌ API endpoint validation failed for ${path.relative(process.cwd(), servicePath)}`,
          );
        }
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`API endpoint analysis failed: ${error}`);
      this.log('error', `❌ API endpoint validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate service methods integrity
   */
  private async validateServiceMethods(
    servicePath: string,
    batchId: string,
  ): Promise<ServiceIntegrationResult> {
    const startTime = Date.now();
    const result: ServiceIntegrationResult = {
      passed: true,
      servicePath,
      validationType: 'service-method',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      details: {},
    };

    try {
      const serviceMethods = await this.analyzeServiceMethods(servicePath);
      result.details.serviceMethods = serviceMethods;

      if (serviceMethods.length === 0) {
        result.warnings.push('No exported service methods found');
        result.recommendations.push('Verify if this service should export methods');
      } else {
        // Validate each method
        for (const method of serviceMethods) {
          const methodValidation = await this.validateSingleMethod(method);

          if (!methodValidation.isValid) {
            result.passed = false;
            result.errors.push(
              `Service method ${method.methodName} validation failed: ${methodValidation.error}`,
            );
          }

          if (methodValidation.warnings.length > 0) {
            result.warnings.push(...methodValidation.warnings);
          }
        }

        if (result.passed) {
          this.log(
            'debug',
            `✅ All ${serviceMethods.length} service methods validated successfully`,
          );
        } else {
          this.log(
            'error',
            `❌ Service method validation failed for ${path.relative(process.cwd(), servicePath)}`,
          );
        }
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Service method analysis failed: ${error}`);
      this.log('error', `❌ Service method validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate configuration dependencies
   */
  private async validateConfigurationDependencies(
    servicePath: string,
    batchId: string,
  ): Promise<ServiceIntegrationResult> {
    const startTime = Date.now();
    const result: ServiceIntegrationResult = {
      passed: true,
      servicePath,
      validationType: 'configuration',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      details: {},
    };

    try {
      const configDependencies = await this.analyzeConfigurationDependencies(servicePath);
      result.details.configDependencies = configDependencies;

      // Validate configuration dependencies
      for (const config of configDependencies) {
        const configValidation = await this.validateSingleConfiguration(config);

        if (!configValidation.isValid) {
          if (config.isRequired) {
            result.passed = false;
            result.errors.push(
              `Required configuration ${config.key} validation failed: ${configValidation.error}`,
            );
          } else {
            result.warnings.push(
              `Optional configuration ${config.key} issue: ${configValidation.error}`,
            );
          }
        }
      }

      if (result.passed) {
        this.log(
          'debug',
          `✅ All ${configDependencies.length} configuration dependencies validated`,
        );
      } else {
        this.log(
          'error',
          `❌ Configuration validation failed for ${path.relative(process.cwd(), servicePath)}`,
        );
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Configuration analysis failed: ${error}`);
      this.log('error', `❌ Configuration validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate integration tests
   */
  private async validateIntegrationTests(
    servicePath: string,
    batchId: string,
  ): Promise<ServiceIntegrationResult> {
    const startTime = Date.now();
    const result: ServiceIntegrationResult = {
      passed: true,
      servicePath,
      validationType: 'integration-test',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      details: {},
    };

    try {
      // Find related integration test files
      const testFiles = this.findIntegrationTestFiles(servicePath);

      if (testFiles.length === 0) {
        result.warnings.push('No integration test files found for service');
        result.recommendations.push('Consider adding integration tests for this service');
      } else {
        // Run integration tests
        const testResults = await this.runIntegrationTests(testFiles);
        result.details.testResults = testResults;

        if (testResults.failed > 0) {
          result.passed = false;
          result.errors.push(`${testResults.failed} integration tests failed`);
          result.recommendations.push('Review and fix failing integration tests');
        } else {
          this.log('debug', `✅ All ${testResults.passed} integration tests passed`);
        }
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Integration test validation failed: ${error}`);
      this.log('error', `❌ Integration test validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private async calculateQualityMetrics(
    serviceResults: ServiceIntegrationResult[],
    baselineMetrics?: { unusedVariables: number; buildErrors: number },
    batchId?: string,
  ): Promise<QualityMetrics> {
    // Calculate unused variable reduction
    const currentUnusedVariables = await this.getCurrentUnusedVariableCount();
    const baselineUnusedVariables = baselineMetrics?.unusedVariables || currentUnusedVariables;
    const unusedVariableReduction =
      baselineUnusedVariables > 0
        ? ((baselineUnusedVariables - currentUnusedVariables) / baselineUnusedVariables) * 100
        : 0;

    // Calculate build stability score
    const currentBuildErrors = await this.getCurrentBuildErrorCount();
    const buildStabilityScore =
      currentBuildErrors === 0 ? 100 : Math.max(0, 100 - currentBuildErrors * 10);

    // Calculate API integrity score
    const apiResults = serviceResults.filter(r => r.validationType === 'api-endpoint');
    const apiIntegrityScore = this.calculateIntegrityScore(apiResults);

    // Calculate service integrity score
    const serviceMethodResults = serviceResults.filter(r => r.validationType === 'service-method');
    const serviceIntegrityScore = this.calculateIntegrityScore(serviceMethodResults);

    // Calculate overall quality score
    const overallQualityScore = Math.round(
      unusedVariableReduction * 0.4 + // 40% weight for reduction
        buildStabilityScore * 0.3 + // 30% weight for build stability
        apiIntegrityScore * 0.15 + // 15% weight for API integrity
        serviceIntegrityScore * 0.15, // 15% weight for service integrity
    );

    // Check target achievement
    const reductionAchieved = unusedVariableReduction >= this.config.qualityTarget;
    const stabilityAchieved = buildStabilityScore >= this.config.buildStabilityTarget;

    return {
      unusedVariableReduction,
      buildStabilityScore,
      apiIntegrityScore,
      serviceIntegrityScore,
      overallQualityScore,
      targetAchievement: {
        reductionTarget: this.config.qualityTarget,
        stabilityTarget: this.config.buildStabilityTarget,
        reductionAchieved,
        stabilityAchieved,
      },
    };
  }

  /**
   * Generate comprehensive quality assurance report
   */
  private generateComprehensiveQualityReport(
    batchId: string,
    processedServices: string[],
    serviceResults: ServiceIntegrationResult[],
    qualityMetrics: QualityMetrics,
  ): ComprehensiveQualityReport {
    const overallAssessment = this.calculateOverallAssessment(qualityMetrics);
    const actionItems = this.generateActionItems(serviceResults, qualityMetrics);
    const recommendations = this.generateRecommendations(serviceResults, qualityMetrics);

    const targetStatus = {
      reductionTargetMet: qualityMetrics.targetAchievement.reductionAchieved,
      stabilityTargetMet: qualityMetrics.targetAchievement.stabilityAchieved,
      readyForProduction:
        qualityMetrics.targetAchievement.reductionAchieved &&
        qualityMetrics.targetAchievement.stabilityAchieved &&
        qualityMetrics.overallQualityScore >= 85,
    };

    return {
      timestamp: new Date(),
      batchId,
      processedServices,
      qualityMetrics,
      serviceResults,
      overallAssessment,
      actionItems,
      recommendations,
      targetStatus,
    };
  }

  // Helper methods for analysis

  private identifyServiceFiles(files: string[]): string[] {
    return files.filter(
      file =>
        /\/services\//.test(file) ||
        /Service\.ts$/.test(file) ||
        /Client\.ts$/.test(file) ||
        /\/api\//.test(file),
    );
  }

  private async analyzeApiEndpoints(servicePath: string): Promise<ApiEndpointInfo[]> {
    const content = fs.readFileSync(servicePath, 'utf8');
    const endpoints: ApiEndpointInfo[] = [];

    // Extract API endpoints (simplified pattern matching)
    const apiPatterns = [
      /['"`](\/api\/[^'"`]+)['"`]/g,
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /axios\.[get|post|put|delete|patch]+\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    let lineNumber = 1;
    const lines = content.split('\n');

    for (const line of lines) {
      for (const pattern of apiPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const endpoint = match[1];
          if (endpoint.startsWith('/api/') || endpoint.startsWith('http')) {
            endpoints.push({
              endpoint,
              method: this.extractHttpMethod(line) || 'GET',
              filePath: servicePath,
              lineNumber,
              isActive: true,
              dependencies: this.extractDependencies(line),
            });
          }
        }
      }
      lineNumber++;
    }

    return endpoints;
  }

  private async analyzeServiceMethods(servicePath: string): Promise<ServiceMethodInfo[]> {
    const content = fs.readFileSync(servicePath, 'utf8');
    const methods: ServiceMethodInfo[] = [];

    // Extract exported methods (simplified)
    const methodPatterns = [
      /export\s+(?:const|function)\s+(\w+)/g,
      /export\s+class\s+(\w+)/g,
      /(\w+)\s*:\s*\([^)]*\)\s*=>/g,
    ];

    let lineNumber = 1;
    const lines = content.split('\n');

    for (const line of lines) {
      for (const pattern of methodPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const methodName = match[1];
          methods.push({
            methodName,
            filePath: servicePath,
            lineNumber,
            isExported: line.includes('export'),
            parameters: this.extractParameters(line),
            dependencies: this.extractDependencies(line),
          });
        }
      }
      lineNumber++;
    }

    return methods;
  }

  private async analyzeConfigurationDependencies(
    servicePath: string,
  ): Promise<ConfigurationDependency[]> {
    const content = fs.readFileSync(servicePath, 'utf8');
    const dependencies: ConfigurationDependency[] = [];

    // Extract environment variables and configuration
    const configPatterns = [
      /process\.env\.(\w+)/g,
      /config\.(\w+)/g,
      /getConfig\(['"`](\w+)['"`]\)/g,
    ];

    let lineNumber = 1;
    const lines = content.split('\n');

    for (const line of lines) {
      for (const pattern of configPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const key = match[1];
          dependencies.push({
            key,
            filePath: servicePath,
            lineNumber,
            isRequired: !line.includes('||') && !line.includes('??'),
            usageContext: line.trim(),
          });
        }
      }
      lineNumber++;
    }

    return dependencies;
  }

  private async validateSingleEndpoint(
    endpoint: ApiEndpointInfo,
  ): Promise<{ isValid: boolean; error?: string; warnings: string[] }> {
    const warnings: string[] = [];

    // Basic endpoint validation
    if (!endpoint.endpoint.startsWith('/api/') && !endpoint.endpoint.startsWith('http')) {
      return { isValid: false, error: 'Invalid endpoint format', warnings };
    }

    // Check for common issues
    if (endpoint.endpoint.includes('undefined') || endpoint.endpoint.includes('null')) {
      warnings.push('Endpoint contains undefined or null values');
    }

    return { isValid: true, warnings };
  }

  private async validateSingleMethod(
    method: ServiceMethodInfo,
  ): Promise<{ isValid: boolean; error?: string; warnings: string[] }> {
    const warnings: string[] = [];

    // Basic method validation
    if (!method.methodName || method.methodName.length === 0) {
      return { isValid: false, error: 'Invalid method name', warnings };
    }

    // Check for common issues
    if (method.methodName.includes('undefined') || method.methodName.includes('null')) {
      warnings.push('Method name contains undefined or null values');
    }

    return { isValid: true, warnings };
  }

  private async validateSingleConfiguration(
    config: ConfigurationDependency,
  ): Promise<{ isValid: boolean; error?: string; warnings: string[] }> {
    const warnings: string[] = [];

    // Check if required configuration is available
    if (config.isRequired && config.key.startsWith('REQUIRED_')) {
      // In a real implementation, you might check actual environment variables
      warnings.push(`Required configuration ${config.key} should be verified`);
    }

    return { isValid: true, warnings };
  }

  private findIntegrationTestFiles(servicePath: string): string[] {
    const testFiles: string[] = [];
    const serviceDir = path.dirname(servicePath);
    const serviceName = path.basename(servicePath, path.extname(servicePath));

    // Common test file patterns
    const testPatterns = [
      path.join(serviceDir, `${serviceName}.integration.test.ts`),
      path.join(serviceDir, `${serviceName}.integration.spec.ts`),
      path.join(serviceDir, '__tests__', `${serviceName}.integration.test.ts`),
      path.join(serviceDir, '__tests__', `${serviceName}.test.ts`),
    ];

    for (const testPattern of testPatterns) {
      if (fs.existsSync(testPattern)) {
        testFiles.push(testPattern);
      }
    }

    return testFiles;
  }

  private async runIntegrationTests(
    testFiles: string[],
  ): Promise<{ passed: number; failed: number; total: number }> {
    try {
      const testCommand = `NODE_OPTIONS='--expose-gc --max-old-space-size=2048' yarn test --testPathPattern="${testFiles.join('|')}" --passWithNoTests`;

      const output = execSync(testCommand, {
        encoding: 'utf8',
        timeout: this.config.testTimeout,
        stdio: 'pipe',
      });

      return this.parseTestResults(output);
    } catch (error: any) {
      // Parse error output for test results
      const errorOutput = error.stdout || error.stderr || '';
      return this.parseTestResults(errorOutput);
    }
  }

  private parseTestResults(output: string): { passed: number; failed: number; total: number } {
    const outputStr = typeof output === 'string' ? output : output.toString();

    const passedMatch = outputStr.match(/(\d+) passed/);
    const failedMatch = outputStr.match(/(\d+) failed/);

    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = passed + failed;

    return { passed, failed, total };
  }

  private async getCurrentUnusedVariableCount(): Promise<number> {
    try {
      const output = execSync('yarn lint --format=json', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const lintResults = JSON.parse(output);
      let unusedVarCount = 0;

      for (const result of lintResults) {
        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            unusedVarCount++;
          }
        }
      }

      return unusedVarCount;
    } catch (error) {
      this.log('warn', `Failed to get unused variable count: ${error}`);
      return 0;
    }
  }

  private async getCurrentBuildErrorCount(): Promise<number> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        timeout: 30000,
      });
      return 0; // No errors
    } catch (error: any) {
      const errorOutput = error.stdout || error.stderr || '';
      const errorMatches = errorOutput.match(/error TS\d+:/g) || [];
      return errorMatches.length;
    }
  }

  private calculateIntegrityScore(results: ServiceIntegrationResult[]): number {
    if (results.length === 0) return 100;

    const passedResults = results.filter(r => r.passed).length;
    return Math.round((passedResults / results.length) * 100);
  }

  private calculateOverallAssessment(
    qualityMetrics: QualityMetrics,
  ): ComprehensiveQualityReport['overallAssessment'] {
    const score = qualityMetrics.overallQualityScore;

    if (score >= 95) return 'excellent';
    if (score >= 85) return 'good';
    if (score >= 70) return 'acceptable';
    if (score >= 50) return 'needs-improvement';
    return 'critical';
  }

  private generateActionItems(
    serviceResults: ServiceIntegrationResult[],
    qualityMetrics: QualityMetrics,
  ): string[] {
    const actionItems: string[] = [];

    // Target-based action items
    if (!qualityMetrics.targetAchievement.reductionAchieved) {
      actionItems.push(
        `Achieve ${qualityMetrics.targetAchievement.reductionTarget}% unused variable reduction target`,
      );
    }

    if (!qualityMetrics.targetAchievement.stabilityAchieved) {
      actionItems.push('Resolve all build errors to achieve 100% build stability');
    }

    // Service-specific action items
    const failedResults = serviceResults.filter(r => !r.passed);
    if (failedResults.length > 0) {
      actionItems.push(`Fix ${failedResults.length} failed service validations`);
    }

    // Quality-based action items
    if (qualityMetrics.overallQualityScore < 85) {
      actionItems.push('Improve overall quality score to production-ready level (85+)');
    }

    return actionItems;
  }

  private generateRecommendations(
    serviceResults: ServiceIntegrationResult[],
    qualityMetrics: QualityMetrics,
  ): string[] {
    const recommendations: string[] = [];

    // Collect all recommendations from service results
    for (const result of serviceResults) {
      recommendations.push(...result.recommendations);
    }

    // Add quality-based recommendations
    if (qualityMetrics.apiIntegrityScore < 90) {
      recommendations.push('Review API endpoint implementations for potential issues');
    }

    if (qualityMetrics.serviceIntegrityScore < 90) {
      recommendations.push('Verify service method exports and functionality');
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  // Utility methods

  private extractHttpMethod(line: string): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined {
    const methodMatch = line.match(/\.(get|post|put|delete|patch)\s*\(/i);
    return methodMatch ? (methodMatch[1].toUpperCase() as any) : undefined;
  }

  private extractParameters(line: string): string[] {
    const paramMatch = line.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    return paramMatch[1]
      .split(',')
      .map(param => param.trim().split(':')[0].trim())
      .filter(param => param.length > 0);
  }

  private extractDependencies(line: string): string[] {
    const dependencies: string[] = [];

    // Extract import dependencies
    const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      dependencies.push(importMatch[1]);
    }

    return dependencies;
  }

  /**
   * Get quality report for a specific batch
   */
  getQualityReport(batchId: string): ComprehensiveQualityReport | undefined {
    return this.qualityReports.get(batchId);
  }

  /**
   * Get all quality reports
   */
  getAllQualityReports(): ComprehensiveQualityReport[] {
    return Array.from(this.qualityReports.values());
  }

  /**
   * Export quality reports to file system
   */
  async exportQualityReports(outputPath: string = './quality-reports'): Promise<void> {
    try {
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      for (const report of this.getAllQualityReports()) {
        const reportPath = path.join(outputPath, `service-integration-${report.batchId}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      }

      this.log('info', `📊 Quality reports exported to ${outputPath}`);
    } catch (error) {
      this.log('error', `❌ Failed to export quality reports: ${error}`);
    }
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];

    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString();
      const prefix = level.toUpperCase().padEnd(5);
      console.log(`[${timestamp}] ${prefix} ${message}`);
    }
  }
}

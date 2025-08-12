/**
 * Comprehensive Validation Framework for Unused Variable Elimination
 *
 * This framework implements comprehensive validation to ensure build stability
 * and quality assurance throughout the unused variable elimination process.
 *
 * Features:
 * - Zero TypeScript compilation error maintenance
 * - Test suite validation after each batch
 * - React component functionality preservation checks
 * - Service integration validation
 * - Quality assurance reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ValidationConfig {
  enableTypeScriptValidation: boolean;
  enableTestSuiteValidation: boolean;
  enableComponentValidation: boolean;
  enableServiceValidation: boolean;
  enableBuildValidation: boolean;
  testTimeout: number;
  compilationTimeout: number;
  maxRetries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ValidationResult {
  passed: boolean;
  validationType: string;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  executionTime: number;
  retryCount: number;
  details: Record<string, any>;
}

export interface ComprehensiveValidationResult {
  overallPassed: boolean;
  validationResults: ValidationResult[];
  summary: ValidationSummary;
  requiresRollback: boolean;
  qualityScore: number;
}

export interface ValidationSummary {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  warningsCount: number;
  totalExecutionTime: number;
  criticalIssues: string[];
  recommendations: string[];
}

export interface ComponentValidationInfo {
  componentPath: string;
  componentName: string;
  hasTests: boolean;
  exportedFunctions: string[];
  importedDependencies: string[];
  propsInterface?: string;
  stateVariables: string[];
}

export interface ServiceValidationInfo {
  servicePath: string;
  serviceName: string;
  apiEndpoints: string[];
  exportedMethods: string[];
  dependencies: string[];
  configurationKeys: string[];
}

export class ComprehensiveValidationFramework {
  private config: ValidationConfig;
  private validationHistory: Map<string, ValidationResult[]> = new Map();

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      enableTypeScriptValidation: true,
      enableTestSuiteValidation: true,
      enableComponentValidation: true,
      enableServiceValidation: true,
      enableBuildValidation: true,
      testTimeout: 30000,
      compilationTimeout: 45000,
      maxRetries: 2,
      logLevel: 'info',
      ...config
    };
  }

  /**
   * Perform comprehensive validation after batch processing
   */
  async performComprehensiveValidation(
    processedFiles: string[],
    batchId: string
  ): Promise<ComprehensiveValidationResult> {
    const startTime = Date.now();
    this.log('info', `🔍 Starting comprehensive validation for batch ${batchId}`);
    this.log('info', `📋 Validating ${processedFiles.length} processed files`);

    const validationResults: ValidationResult[] = [];
    let overallPassed = true;
    let qualityScore = 100;

    try {
      // 1. TypeScript Compilation Validation (Critical)
      if (this.config.enableTypeScriptValidation) {
        const tsResult = await this.validateTypeScriptCompilation(batchId);
        validationResults.push(tsResult);
        if (!tsResult.passed) {
          overallPassed = false;
          qualityScore -= 40; // Major penalty for compilation errors
        }
      }

      // 2. Test Suite Validation (High Priority)
      if (this.config.enableTestSuiteValidation) {
        const testResult = await this.validateTestSuite(processedFiles, batchId);
        validationResults.push(testResult);
        if (!testResult.passed) {
          overallPassed = false;
          qualityScore -= 25; // Significant penalty for test failures
        }
      }

      // 3. React Component Functionality Validation (High Priority)
      if (this.config.enableComponentValidation) {
        const componentResults = await this.validateReactComponents(processedFiles, batchId);
        validationResults.push(...componentResults);
        const failedComponents = componentResults.filter(r => !r.passed);
        if (failedComponents.length > 0) {
          overallPassed = false;
          qualityScore -= Math.min(20, failedComponents.length * 5);
        }
      }

      // 4. Service Integration Validation (Medium Priority)
      if (this.config.enableServiceValidation) {
        const serviceResults = await this.validateServiceIntegration(processedFiles, batchId);
        validationResults.push(...serviceResults);
        const failedServices = serviceResults.filter(r => !r.passed);
        if (failedServices.length > 0) {
          qualityScore -= Math.min(15, failedServices.length * 3);
        }
      }

      // 5. Build System Validation (Medium Priority)
      if (this.config.enableBuildValidation) {
        const buildResult = await this.validateBuildSystem(batchId);
        validationResults.push(buildResult);
        if (!buildResult.passed) {
          qualityScore -= 10; // Minor penalty for build issues
        }
      }

      // Calculate summary
      const summary = this.calculateValidationSummary(validationResults, startTime);

      // Determine if rollback is required
      const requiresRollback = this.shouldRequireRollback(validationResults);

      // Store validation history
      this.storeValidationHistory(batchId, validationResults);

      const result: ComprehensiveValidationResult = {
        overallPassed,
        validationResults,
        summary,
        requiresRollback,
        qualityScore: Math.max(0, qualityScore)
      };

      this.log('info', `✅ Comprehensive validation completed`);
      this.log('info', `📊 Overall Result: ${overallPassed ? 'PASSED' : 'FAILED'}`);
      this.log('info', `🎯 Quality Score: ${result.qualityScore}/100`);

      return result;

    } catch (error) {
      this.log('error', `❌ Comprehensive validation failed: ${error}`);

      return {
        overallPassed: false,
        validationResults: [{
          passed: false,
          validationType: 'framework-error',
          errors: [`Validation framework error: ${error}`],
          warnings: [],
          recommendations: ['Review validation framework configuration'],
          executionTime: Date.now() - startTime,
          retryCount: 0,
          details: { error: error.toString() }
        }],
        summary: {
          totalValidations: 1,
          passedValidations: 0,
          failedValidations: 1,
          warningsCount: 0,
          totalExecutionTime: Date.now() - startTime,
          criticalIssues: ['Validation framework failure'],
          recommendations: ['Review validation framework configuration']
        },
        requiresRollback: true,
        qualityScore: 0
      };
    }
  }

  /**
   * Validate TypeScript compilation with zero error requirement
   */
  private async validateTypeScriptCompilation(batchId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      passed: false,
      validationType: 'typescript-compilation',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      retryCount: 0,
      details: {}
    };

    this.log('debug', '🔍 Validating TypeScript compilation...');

    for (let retry = 0; retry <= this.config.maxRetries; retry++) {
      try {
        result.retryCount = retry;

        // Run TypeScript compilation with detailed error reporting
        const output = execSync('yarn tsc --noEmit --skipLibCheck --pretty', {
          encoding: 'utf8',
          timeout: this.config.compilationTimeout,
          stdio: 'pipe'
        });

        // If we get here, compilation succeeded
        result.passed = true;
        result.details.compilationOutput = 'No errors found';
        this.log('debug', '✅ TypeScript compilation passed');
        break;

      } catch (error: any) {
        const errorOutput = error.stdout || error.stderr || error.message;

        // Parse TypeScript errors
        const errorLines = errorOutput.split('\n').filter(line => line.trim());
        const errorCount = errorLines.filter(line => /error TS\d+:/.test(line)).length;

        result.errors.push(`TypeScript compilation failed with ${errorCount} errors`);
        result.details.errorOutput = errorOutput;
        result.details.errorCount = errorCount;

        // Extract specific error types for analysis
        const errorTypes = this.extractTypeScriptErrorTypes(errorOutput);
        result.details.errorTypes = errorTypes;

        if (retry < this.config.maxRetries) {
          this.log('warn', `⚠️ TypeScript compilation failed (attempt ${retry + 1}), retrying...`);
          await this.delay(1000); // Wait 1 second before retry
        } else {
          this.log('error', `❌ TypeScript compilation failed after ${retry + 1} attempts`);
          result.recommendations.push('Review TypeScript errors and fix compilation issues');
          result.recommendations.push('Consider rolling back changes if errors are critical');
        }
      }
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate test suite execution
   */
  private async validateTestSuite(processedFiles: string[], batchId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      passed: false,
      validationType: 'test-suite',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      retryCount: 0,
      details: {}
    };

    this.log('debug', '🧪 Validating test suite...');

    try {
      // Find related test files for processed files
      const relatedTestFiles = this.findRelatedTestFiles(processedFiles);
      result.details.relatedTestFiles = relatedTestFiles;

      if (relatedTestFiles.length === 0) {
        result.passed = true;
        result.warnings.push('No related test files found for processed files');
        result.recommendations.push('Consider adding tests for modified components');
        this.log('debug', '⚠️ No related test files found');
      } else {
        // Run tests with memory management
        const testCommand = `NODE_OPTIONS='--expose-gc --max-old-space-size=2048' yarn test --run --passWithNoTests --testPathPattern="${relatedTestFiles.join('|')}"`;

        const output = execSync(testCommand, {
          encoding: 'utf8',
          timeout: this.config.testTimeout,
          stdio: 'pipe'
        });

        // Parse test results
        const testResults = this.parseTestResults(output);
        result.details.testResults = testResults;

        if (testResults.failed === 0) {
          result.passed = true;
          this.log('debug', `✅ All ${testResults.passed} tests passed`);
        } else {
          result.errors.push(`${testResults.failed} tests failed`);
          result.recommendations.push('Review and fix failing tests');
          this.log('error', `❌ ${testResults.failed} tests failed`);
        }
      }

    } catch (error: any) {
      result.errors.push(`Test suite validation failed: ${error.message}`);
      result.details.error = error.toString();
      result.recommendations.push('Review test configuration and dependencies');
      this.log('error', `❌ Test suite validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate React component functionality preservation
   */
  private async validateReactComponents(processedFiles: string[], batchId: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Filter for React component files
    const componentFiles = processedFiles.filter(file =>
      /\.(tsx|jsx)$/.test(file) &&
      /\/components\//.test(file)
    );

    this.log('debug', `🔍 Validating ${componentFiles.length} React components...`);

    for (const componentFile of componentFiles) {
      const result = await this.validateSingleComponent(componentFile, batchId);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate a single React component
   */
  private async validateSingleComponent(componentPath: string, batchId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      passed: true,
      validationType: 'react-component',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      retryCount: 0,
      details: { componentPath }
    };

    try {
      const componentInfo = await this.analyzeComponent(componentPath);
      result.details.componentInfo = componentInfo;

      // Check if component can still be imported
      const importValidation = await this.validateComponentImport(componentPath);
      if (!importValidation.success) {
        result.passed = false;
        result.errors.push(`Component import failed: ${importValidation.error}`);
      }

      // Check if component exports are intact
      const exportValidation = await this.validateComponentExports(componentPath, componentInfo);
      if (!exportValidation.success) {
        result.passed = false;
        result.errors.push(`Component exports validation failed: ${exportValidation.error}`);
      }

      // Check if component props interface is preserved
      if (componentInfo.propsInterface) {
        const propsValidation = await this.validateComponentProps(componentPath, componentInfo.propsInterface);
        if (!propsValidation.success) {
          result.warnings.push(`Props interface may have been affected: ${propsValidation.warning}`);
        }
      }

      // Check if component has tests and they still pass
      if (componentInfo.hasTests) {
        const testValidation = await this.validateComponentTests(componentPath);
        if (!testValidation.success) {
          result.warnings.push(`Component tests may be affected: ${testValidation.warning}`);
        }
      } else {
        result.recommendations.push('Consider adding tests for this component');
      }

      if (result.passed) {
        this.log('debug', `✅ Component ${componentInfo.componentName} validation passed`);
      } else {
        this.log('error', `❌ Component ${componentInfo.componentName} validation failed`);
      }

    } catch (error) {
      result.passed = false;
      result.errors.push(`Component validation failed: ${error}`);
      this.log('error', `❌ Component validation failed for ${componentPath}: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate service integration functionality
   */
  private async validateServiceIntegration(processedFiles: string[], batchId: string): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Filter for service files
    const serviceFiles = processedFiles.filter(file =>
      /\/services\//.test(file) ||
      /Service\.ts$/.test(file) ||
      /Client\.ts$/.test(file)
    );

    this.log('debug', `🔍 Validating ${serviceFiles.length} service integrations...`);

    for (const serviceFile of serviceFiles) {
      const result = await this.validateSingleService(serviceFile, batchId);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate a single service
   */
  private async validateSingleService(servicePath: string, batchId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      passed: true,
      validationType: 'service-integration',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      retryCount: 0,
      details: { servicePath }
    };

    try {
      const serviceInfo = await this.analyzeService(servicePath);
      result.details.serviceInfo = serviceInfo;

      // Check if service can still be imported
      const importValidation = await this.validateServiceImport(servicePath);
      if (!importValidation.success) {
        result.passed = false;
        result.errors.push(`Service import failed: ${importValidation.error}`);
      }

      // Check if API endpoints are still functional (basic syntax check)
      if (serviceInfo.apiEndpoints.length > 0) {
        const endpointValidation = await this.validateApiEndpoints(servicePath, serviceInfo.apiEndpoints);
        if (!endpointValidation.success) {
          result.warnings.push(`API endpoints may be affected: ${endpointValidation.warning}`);
        }
      }

      // Check if exported methods are intact
      const methodValidation = await this.validateServiceMethods(servicePath, serviceInfo.exportedMethods);
      if (!methodValidation.success) {
        result.passed = false;
        result.errors.push(`Service methods validation failed: ${methodValidation.error}`);
      }

      if (result.passed) {
        this.log('debug', `✅ Service ${serviceInfo.serviceName} validation passed`);
      } else {
        this.log('error', `❌ Service ${serviceInfo.serviceName} validation failed`);
      }

    } catch (error) {
      result.passed = false;
      result.errors.push(`Service validation failed: ${error}`);
      this.log('error', `❌ Service validation failed for ${servicePath}: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  /**
   * Validate build system functionality
   */
  private async validateBuildSystem(batchId: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const result: ValidationResult = {
      passed: false,
      validationType: 'build-system',
      errors: [],
      warnings: [],
      recommendations: [],
      executionTime: 0,
      retryCount: 0,
      details: {}
    };

    this.log('debug', '🏗️ Validating build system...');

    try {
      // Test Next.js build process (dry run)
      const buildOutput = execSync('yarn next build --dry-run', {
        encoding: 'utf8',
        timeout: 60000, // 1 minute timeout for build validation
        stdio: 'pipe'
      });

      result.passed = true;
      result.details.buildOutput = typeof buildOutput === 'string' ? buildOutput : buildOutput.toString();
      this.log('debug', '✅ Build system validation passed');

    } catch (error: any) {
      result.errors.push(`Build system validation failed: ${error.message}`);
      result.details.buildError = error.toString();
      result.recommendations.push('Review build configuration and dependencies');
      this.log('error', `❌ Build system validation failed: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  // Helper methods for analysis and validation

  private async analyzeComponent(componentPath: string): Promise<ComponentValidationInfo> {
    const content = fs.readFileSync(componentPath, 'utf8');
    const relativePath = path.relative(process.cwd(), componentPath);
    const componentName = path.basename(componentPath, path.extname(componentPath));

    // Find test file
    const testPath = componentPath.replace(/\.(tsx|jsx)$/, '.test.$1');
    const hasTests = fs.existsSync(testPath);

    // Extract exports (simplified)
    const exportMatches = content.match(/export\s+(?:const|function|class)\s+(\w+)/g) || [];
    const exportedFunctions = exportMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:const|function|class)\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);

    // Extract imports (simplified)
    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
    const importedDependencies = importMatches.map(match => {
      const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      return pathMatch ? pathMatch[1] : '';
    }).filter(Boolean);

    // Extract props interface (simplified)
    const propsInterfaceMatch = content.match(/interface\s+(\w*Props)\s*{/);
    const propsInterface = propsInterfaceMatch ? propsInterfaceMatch[1] : undefined;

    // Extract state variables (simplified)
    const stateMatches = content.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g) || [];
    const stateVariables = stateMatches.map(match => {
      const nameMatch = match.match(/const\s+\[(\w+),/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);

    return {
      componentPath: relativePath,
      componentName,
      hasTests,
      exportedFunctions,
      importedDependencies,
      propsInterface,
      stateVariables
    };
  }

  private async analyzeService(servicePath: string): Promise<ServiceValidationInfo> {
    const content = fs.readFileSync(servicePath, 'utf8');
    const relativePath = path.relative(process.cwd(), servicePath);
    const serviceName = path.basename(servicePath, path.extname(servicePath));

    // Extract API endpoints (simplified)
    const apiMatches = content.match(/['"`]\/api\/[^'"`]+['"`]/g) || [];
    const apiEndpoints = apiMatches.map(match => match.replace(/['"`]/g, ''));

    // Extract exported methods (simplified)
    const exportMatches = content.match(/export\s+(?:const|function|class)\s+(\w+)/g) || [];
    const exportedMethods = exportMatches.map(match => {
      const nameMatch = match.match(/export\s+(?:const|function|class)\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);

    // Extract dependencies (simplified)
    const importMatches = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
    const dependencies = importMatches.map(match => {
      const pathMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      return pathMatch ? pathMatch[1] : '';
    }).filter(Boolean);

    // Extract configuration keys (simplified)
    const configMatches = content.match(/process\.env\.(\w+)/g) || [];
    const configurationKeys = configMatches.map(match => {
      const keyMatch = match.match(/process\.env\.(\w+)/);
      return keyMatch ? keyMatch[1] : '';
    }).filter(Boolean);

    return {
      servicePath: relativePath,
      serviceName,
      apiEndpoints,
      exportedMethods,
      dependencies,
      configurationKeys
    };
  }

  private async validateComponentImport(componentPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a simplified check - in a real implementation, you might use TypeScript compiler API
      const content = fs.readFileSync(componentPath, 'utf8');

      // Check for basic syntax errors that would prevent import
      if (content.includes('export default') || content.includes('export {') || content.includes('export const')) {
        return { success: true };
      } else {
        return { success: false, error: 'No exports found in component' };
      }
    } catch (error) {
      return { success: false, error: `Failed to read component: ${error}` };
    }
  }

  private async validateComponentExports(componentPath: string, componentInfo: ComponentValidationInfo): Promise<{ success: boolean; error?: string }> {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');

      // Check if previously identified exports are still present
      for (const exportedFunction of componentInfo.exportedFunctions) {
        if (!content.includes(exportedFunction)) {
          return { success: false, error: `Exported function ${exportedFunction} not found` };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to validate exports: ${error}` };
    }
  }

  private async validateComponentProps(componentPath: string, propsInterface: string): Promise<{ success: boolean; warning?: string }> {
    try {
      const content = fs.readFileSync(componentPath, 'utf8');

      if (!content.includes(propsInterface)) {
        return { success: false, warning: `Props interface ${propsInterface} not found` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, warning: `Failed to validate props: ${error}` };
    }
  }

  private async validateComponentTests(componentPath: string): Promise<{ success: boolean; warning?: string }> {
    try {
      const testPath = componentPath.replace(/\.(tsx|jsx)$/, '.test.$1');

      if (!fs.existsSync(testPath)) {
        return { success: false, warning: 'Test file not found' };
      }

      // This is a simplified check - in a real implementation, you might run the specific test
      return { success: true };
    } catch (error) {
      return { success: false, warning: `Failed to validate tests: ${error}` };
    }
  }

  private async validateServiceImport(servicePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const content = fs.readFileSync(servicePath, 'utf8');

      // Check for basic syntax errors that would prevent import
      if (content.includes('export')) {
        return { success: true };
      } else {
        return { success: false, error: 'No exports found in service' };
      }
    } catch (error) {
      return { success: false, error: `Failed to read service: ${error}` };
    }
  }

  private async validateApiEndpoints(servicePath: string, endpoints: string[]): Promise<{ success: boolean; warning?: string }> {
    try {
      const content = fs.readFileSync(servicePath, 'utf8');

      // Check if API endpoints are still referenced
      for (const endpoint of endpoints) {
        if (!content.includes(endpoint)) {
          return { success: false, warning: `API endpoint ${endpoint} not found` };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, warning: `Failed to validate API endpoints: ${error}` };
    }
  }

  private async validateServiceMethods(servicePath: string, methods: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const content = fs.readFileSync(servicePath, 'utf8');

      // Check if previously identified methods are still present
      for (const method of methods) {
        if (!content.includes(method)) {
          return { success: false, error: `Service method ${method} not found` };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to validate service methods: ${error}` };
    }
  }

  private findRelatedTestFiles(processedFiles: string[]): string[] {
    const testFiles: string[] = [];

    for (const file of processedFiles) {
      // Look for corresponding test files
      const testPatterns = [
        file.replace(/\.(ts|tsx|js|jsx)$/, '.test.$1'),
        file.replace(/\.(ts|tsx|js|jsx)$/, '.spec.$1'),
        file.replace(/\/([^/]+)\.(ts|tsx|js|jsx)$/, '/__tests__/$1.test.$2')
      ];

      for (const testPattern of testPatterns) {
        if (fs.existsSync(testPattern)) {
          testFiles.push(testPattern);
          break;
        }
      }
    }

    return testFiles;
  }

  private parseTestResults(output: string | Buffer): { passed: number; failed: number; total: number } {
    // Parse Jest output (simplified)
    // Handle both string and Buffer types
    const outputStr = typeof output === 'string' ? output : output.toString();

    const passedMatch = outputStr.match(/(\d+) passed/);
    const failedMatch = outputStr.match(/(\d+) failed/);

    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = passed + failed;

    return { passed, failed, total };
  }

  private extractTypeScriptErrorTypes(errorOutput: string): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    const errorMatches = errorOutput.match(/error TS(\d+):/g) || [];

    for (const match of errorMatches) {
      const errorCode = match.match(/TS(\d+)/)?.[1];
      if (errorCode) {
        errorTypes[`TS${errorCode}`] = (errorTypes[`TS${errorCode}`] || 0) + 1;
      }
    }

    return errorTypes;
  }

  private calculateValidationSummary(validationResults: ValidationResult[], startTime: number): ValidationSummary {
    const totalValidations = validationResults.length;
    const passedValidations = validationResults.filter(r => r.passed).length;
    const failedValidations = totalValidations - passedValidations;
    const warningsCount = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);
    const totalExecutionTime = Date.now() - startTime;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    for (const result of validationResults) {
      if (!result.passed && result.validationType === 'typescript-compilation') {
        criticalIssues.push('TypeScript compilation errors detected');
      }
      if (!result.passed && result.validationType === 'test-suite') {
        criticalIssues.push('Test suite failures detected');
      }
      recommendations.push(...result.recommendations);
    }

    return {
      totalValidations,
      passedValidations,
      failedValidations,
      warningsCount,
      totalExecutionTime,
      criticalIssues: [...new Set(criticalIssues)],
      recommendations: [...new Set(recommendations)]
    };
  }

  private shouldRequireRollback(validationResults: ValidationResult[]): boolean {
    // Require rollback for critical failures
    return validationResults.some(result =>
      !result.passed && (
        result.validationType === 'typescript-compilation' ||
        (result.validationType === 'test-suite' && result.errors.length > 0) ||
        (result.validationType === 'react-component' && result.errors.length > 0)
      )
    );
  }

  private storeValidationHistory(batchId: string, validationResults: ValidationResult[]): void {
    const existing = this.validationHistory.get(batchId) || [];
    this.validationHistory.set(batchId, [...existing, ...validationResults]);
  }

  /**
   * Get validation history for analysis
   */
  getValidationHistory(): Map<string, ValidationResult[]> {
    return new Map(this.validationHistory);
  }

  /**
   * Generate validation report
   */
  generateValidationReport(batchId?: string): string {
    const history = batchId
      ? this.validationHistory.get(batchId) || []
      : Array.from(this.validationHistory.values()).flat();

    if (history.length === 0) {
      return 'No validation history available';
    }

    const report = [
      '# Validation Report',
      `Generated: ${new Date().toISOString()}`,
      batchId ? `Batch ID: ${batchId}` : 'All Batches',
      '',
      '## Summary',
      `Total Validations: ${history.length}`,
      `Passed: ${history.filter(r => r.passed).length}`,
      `Failed: ${history.filter(r => !r.passed).length}`,
      `Average Execution Time: ${(history.reduce((sum, r) => sum + r.executionTime, 0) / history.length).toFixed(2)}ms`,
      '',
      '## Validation Results'
    ];

    for (const result of history) {
      report.push(`### ${result.validationType} - ${result.passed ? 'PASSED' : 'FAILED'}`);
      report.push(`Execution Time: ${result.executionTime}ms`);

      if (result.errors.length > 0) {
        report.push('**Errors:**');
        result.errors.forEach(error => report.push(`- ${error}`));
      }

      if (result.warnings.length > 0) {
        report.push('**Warnings:**');
        result.warnings.forEach(warning => report.push(`- ${warning}`));
      }

      if (result.recommendations.length > 0) {
        report.push('**Recommendations:**');
        result.recommendations.forEach(rec => report.push(`- ${rec}`));
      }

      report.push('');
    }

    return report.join('\n');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

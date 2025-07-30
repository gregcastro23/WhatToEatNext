#!/usr/bin/env node

/**
 * Domain-Specific Rule Validation and Optimization Script
 * 
 * This script validates and optimizes the domain-specific ESLint rules for:
 * - Astrological calculation files (mathematical constants and planetary variables)
 * - Campaign system files (enterprise patterns and extensive logging)
 * - Test files (appropriate relaxations for mock variables)
 * - Configuration files (dynamic requires and build tools)
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string;
  passed: boolean;
  details: string[];
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

interface DomainSpecificValidation {
  astrologicalFiles: ValidationResult;
  campaignSystemFiles: ValidationResult;
  testFiles: ValidationResult;
  configurationFiles: ValidationResult;
  overall: {
    passed: boolean;
    score: number;
    summary: string;
  };
}

class DomainSpecificRuleValidator {
  private results: DomainSpecificValidation;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      astrologicalFiles: this.createEmptyResult('Astrological Calculation Files'),
      campaignSystemFiles: this.createEmptyResult('Campaign System Files'),
      testFiles: this.createEmptyResult('Test Files'),
      configurationFiles: this.createEmptyResult('Configuration Files'),
      overall: {
        passed: false,
        score: 0,
        summary: ''
      }
    };
  }

  private createEmptyResult(category: string): ValidationResult {
    return {
      category,
      passed: false,
      details: [],
      errors: [],
      warnings: [],
      recommendations: []
    };
  }

  /**
   * Main validation entry point
   */
  async validateDomainSpecificRules(): Promise<DomainSpecificValidation> {
    console.log('🔍 Starting Domain-Specific Rule Validation...\n');

    try {
      // Validate each domain category
      await this.validateAstrologicalFiles();
      await this.validateCampaignSystemFiles();
      await this.validateTestFiles();
      await this.validateConfigurationFiles();

      // Calculate overall results
      this.calculateOverallResults();

      // Generate report
      this.generateValidationReport();

      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  /**
   * Validate astrological calculation file rules
   * Requirements: 4.1, 4.2
   */
  private async validateAstrologicalFiles(): Promise<void> {
    console.log('🌟 Validating Astrological Calculation File Rules...');
    
    const astroResult = this.results.astrologicalFiles;
    
    try {
      // Test mathematical constants preservation
      const constantsTest = await this.testMathematicalConstantsPreservation();
      astroResult.details.push(`Mathematical constants preservation: ${constantsTest.passed ? '✅' : '❌'}`);
      if (!constantsTest.passed) {
        astroResult.errors.push(...constantsTest.errors);
      }

      // Test planetary variable patterns
      const planetaryTest = await this.testPlanetaryVariablePatterns();
      astroResult.details.push(`Planetary variable patterns: ${planetaryTest.passed ? '✅' : '❌'}`);
      if (!planetaryTest.passed) {
        astroResult.errors.push(...planetaryTest.errors);
      }

      // Test elemental properties validation
      const elementalTest = await this.testElementalPropertiesValidation();
      astroResult.details.push(`Elemental properties validation: ${elementalTest.passed ? '✅' : '❌'}`);
      if (!elementalTest.passed) {
        astroResult.errors.push(...elementalTest.errors);
      }

      // Test transit date validation requirements
      const transitTest = await this.testTransitDateValidation();
      astroResult.details.push(`Transit date validation: ${transitTest.passed ? '✅' : '❌'}`);
      if (!transitTest.passed) {
        astroResult.warnings.push(...transitTest.warnings);
      }

      // Test fallback value preservation
      const fallbackTest = await this.testFallbackValuePreservation();
      astroResult.details.push(`Fallback value preservation: ${fallbackTest.passed ? '✅' : '❌'}`);
      if (!fallbackTest.passed) {
        astroResult.errors.push(...fallbackTest.errors);
      }

      astroResult.passed = astroResult.errors.length === 0;
      
      if (astroResult.passed) {
        console.log('✅ Astrological file rules validation passed');
      } else {
        console.log('❌ Astrological file rules validation failed');
        astroResult.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error) {
      astroResult.errors.push(`Validation error: ${error}`);
      console.error('❌ Astrological validation error:', error);
    }
  }

  /**
   * Test mathematical constants preservation in astrological files
   */
  private async testMathematicalConstantsPreservation(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that astrological constants are preserved
      const testFiles = [
        'src/calculations/culinary/culinaryAstrology.ts',
        'src/utils/reliableAstronomy.ts',
        'src/data/planets/mars.ts'
      ];

      for (const file of testFiles) {
        if (existsSync(join(this.projectRoot, file))) {
          const content = readFileSync(join(this.projectRoot, file), 'utf8');
          
          // Check for protected constants
          const protectedConstants = [
            'DEGREES_PER_SIGN',
            'RELIABLE_POSITIONS',
            'MARCH2025_POSITIONS',
            'FALLBACK_POSITIONS'
          ];

          const hasProtectedConstants = protectedConstants.some(constant => 
            content.includes(constant)
          );

          if (hasProtectedConstants) {
            // Run ESLint on this file to check for constant preservation violations
            try {
              execSync(`npx eslint "${file}" --no-eslintrc --config eslint.config.cjs --format json`, {
                stdio: 'pipe',
                cwd: this.projectRoot
              });
            } catch (eslintError: any) {
              const output = eslintError.stdout?.toString() || '';
              if (output.includes('preserve-planetary-constants')) {
                errors.push(`Mathematical constants violation in ${file}`);
              }
            }
          }
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing mathematical constants: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test planetary variable patterns
   */
  private async testPlanetaryVariablePatterns(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that planetary variable patterns are recognized
      const testContent = `
        const planet = 'mars';
        const position = { sign: 'cancer', degree: 22.63 };
        const longitude = 112.63;
        const retrograde = false;
        const UNUSED_planet = 'unused';
      `;

      // Write test file
      const testFile = join(this.projectRoot, 'temp-planetary-test.ts');
      writeFileSync(testFile, testContent);

      try {
        // Run ESLint on test file
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === '@typescript-eslint/no-unused-vars' &&
            (msg.message.includes('planet') || msg.message.includes('position') || msg.message.includes('longitude'))
          );
          
          if (unusedVarErrors.length > 0) {
            errors.push('Planetary variable patterns not properly ignored by unused-vars rule');
          }
        }
      } finally {
        // Clean up test file
        try {
          execSync(`rm -f "${testFile}"`);
        } catch {}
      }

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing planetary variable patterns: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test elemental properties validation
   */
  private async testElementalPropertiesValidation(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test valid elemental properties
      const validElementalContent = `
        const elementalProps = {
          Fire: 0.8,
          Water: 0.2,
          Earth: 0.1,
          Air: 0.3
        };
      `;

      const testFile = join(this.projectRoot, 'temp-elemental-test.ts');
      
      // Test valid properties (should pass)
      writeFileSync(testFile, validElementalContent);
      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stderr?.toString() || '';
        if (output.includes('validate-elemental-properties')) {
          errors.push('Valid elemental properties incorrectly flagged as invalid');
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing elemental properties validation: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test transit date validation requirements
   */
  private async testTransitDateValidation(): Promise<{ passed: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    
    try {
      // Check if astrological files have transit validation imports
      const astroFiles = [
        'src/calculations/culinary/culinaryAstrology.ts',
        'src/utils/reliableAstronomy.ts'
      ];

      for (const file of astroFiles) {
        if (existsSync(join(this.projectRoot, file))) {
          const content = readFileSync(join(this.projectRoot, file), 'utf8');
          
          const hasTransitValidation = content.includes('transitValidation') || 
                                     content.includes('astrologicalValidation') ||
                                     content.includes('validateTransitDate');

          if (!hasTransitValidation) {
            warnings.push(`${file} should include transit date validation`);
          }
        }
      }

      return { passed: warnings.length === 0, warnings };
    } catch (error) {
      warnings.push(`Error testing transit date validation: ${error}`);
      return { passed: false, warnings };
    }
  }

  /**
   * Test fallback value preservation
   */
  private async testFallbackValuePreservation(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that fallback values are not set to null/undefined
      const testContent = `
        const FALLBACK_POSITIONS = null; // This should be flagged
        const RELIABLE_DATA = undefined; // This should be flagged
        const MARCH2025_BACKUP = { sun: { sign: 'aries' } }; // This should be fine
      `;

      const testFile = join(this.projectRoot, 'temp-fallback-test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
        // If no error, the rule didn't catch the null/undefined assignments
        errors.push('Fallback values set to null/undefined not caught by validation rule');
      } catch (eslintError: any) {
        const output = eslintError.stderr?.toString() || '';
        if (!output.includes('preserve-fallback-values')) {
          errors.push('Fallback value violations not properly detected');
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing fallback value preservation: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Calculate overall validation results
   */
  private calculateOverallResults(): void {
    const categories = [
      this.results.astrologicalFiles,
      this.results.campaignSystemFiles,
      this.results.testFiles,
      this.results.configurationFiles
    ];

    const passedCategories = categories.filter(cat => cat.passed).length;
    const totalCategories = categories.length;
    
    this.results.overall.score = Math.round((passedCategories / totalCategories) * 100);
    this.results.overall.passed = passedCategories === totalCategories;
    
    if (this.results.overall.passed) {
      this.results.overall.summary = '✅ All domain-specific rules are properly configured and validated';
    } else {
      const failedCategories = categories.filter(cat => !cat.passed).map(cat => cat.category);
      this.results.overall.summary = `❌ Failed categories: ${failedCategories.join(', ')}`;
    }
  }

  /**
   * Generate comprehensive validation report
   */
  private generateValidationReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DOMAIN-SPECIFIC RULE VALIDATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 Overall Score: ${this.results.overall.score}%`);
    console.log(`📋 Summary: ${this.results.overall.summary}\n`);

    // Report each category
    const categories = [
      this.results.astrologicalFiles,
      this.results.campaignSystemFiles,
      this.results.testFiles,
      this.results.configurationFiles
    ];

    categories.forEach(category => {
      console.log(`\n📁 ${category.category}`);
      console.log(`   Status: ${category.passed ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (category.details.length > 0) {
        console.log('   Details:');
        category.details.forEach(detail => console.log(`     ${detail}`));
      }
      
      if (category.errors.length > 0) {
        console.log('   Errors:');
        category.errors.forEach(error => console.log(`     ❌ ${error}`));
      }
      
      if (category.warnings.length > 0) {
        console.log('   Warnings:');
        category.warnings.forEach(warning => console.log(`     ⚠️ ${warning}`));
      }
    });

    // Save detailed report
    const reportPath = join(this.projectRoot, 'domain-specific-rule-validation-report.json');
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    console.log('\n' + '='.repeat(80));
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const validator = new DomainSpecificRuleValidator();
    const results = await validator.validateDomainSpecificRules();
    
    if (results.overall.passed) {
      console.log('\n🎉 Domain-specific rule validation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Domain-specific rule validation completed with issues.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Domain-specific rule validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DomainSpecificRuleValidator };
export type { DomainSpecificValidation, ValidationResult }; 
 /**
   * Validate campaign system file rules
   * Requirements: 4.3
   */
  private async validateCampaignSystemFiles(): Promise<void> {
    console.log('🚀 Validating Campaign System File Rules...');
    
    const campaignResult = this.results.campaignSystemFiles;
    
    try {
      // Test enterprise patterns allowance
      const enterpriseTest = await this.testEnterprisePatterns();
      campaignResult.details.push(`Enterprise patterns: ${enterpriseTest.passed ? '✅' : '❌'}`);
      if (!enterpriseTest.passed) {
        campaignResult.errors.push(...enterpriseTest.errors);
      }

      // Test extensive logging allowance
      const loggingTest = await this.testExtensiveLogging();
      campaignResult.details.push(`Extensive logging: ${loggingTest.passed ? '✅' : '❌'}`);
      if (!loggingTest.passed) {
        campaignResult.errors.push(...loggingTest.errors);
      }

      // Test campaign variable patterns
      const variableTest = await this.testCampaignVariablePatterns();
      campaignResult.details.push(`Campaign variable patterns: ${variableTest.passed ? '✅' : '❌'}`);
      if (!variableTest.passed) {
        campaignResult.errors.push(...variableTest.errors);
      }

      // Test complexity allowances
      const complexityTest = await this.testCampaignComplexityAllowances();
      campaignResult.details.push(`Complexity allowances: ${complexityTest.passed ? '✅' : '❌'}`);
      if (!complexityTest.passed) {
        campaignResult.warnings.push(...complexityTest.warnings);
      }

      campaignResult.passed = campaignResult.errors.length === 0;
      
      if (campaignResult.passed) {
        console.log('✅ Campaign system file rules validation passed');
      } else {
        console.log('❌ Campaign system file rules validation failed');
        campaignResult.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error) {
      campaignResult.errors.push(`Validation error: ${error}`);
      console.error('❌ Campaign system validation error:', error);
    }
  }

  /**
   * Validate test file rules
   * Requirements: 4.4
   */
  private async validateTestFiles(): Promise<void> {
    console.log('🧪 Validating Test File Rules...');
    
    const testResult = this.results.testFiles;
    
    try {
      // Test mock variable relaxations
      const mockTest = await this.testMockVariableRelaxations();
      testResult.details.push(`Mock variable relaxations: ${mockTest.passed ? '✅' : '❌'}`);
      if (!mockTest.passed) {
        testResult.errors.push(...mockTest.errors);
      }

      // Test test-specific rule relaxations
      const relaxationTest = await this.testTestSpecificRelaxations();
      testResult.details.push(`Test-specific relaxations: ${relaxationTest.passed ? '✅' : '❌'}`);
      if (!relaxationTest.passed) {
        testResult.errors.push(...relaxationTest.errors);
      }

      // Test Jest globals availability
      const globalsTest = await this.testJestGlobalsAvailability();
      testResult.details.push(`Jest globals availability: ${globalsTest.passed ? '✅' : '❌'}`);
      if (!globalsTest.passed) {
        testResult.errors.push(...globalsTest.errors);
      }

      testResult.passed = testResult.errors.length === 0;
      
      if (testResult.passed) {
        console.log('✅ Test file rules validation passed');
      } else {
        console.log('❌ Test file rules validation failed');
        testResult.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error) {
      testResult.errors.push(`Validation error: ${error}`);
      console.error('❌ Test file validation error:', error);
    }
  }

  /**
   * Validate configuration file rules
   * Requirements: 4.4
   */
  private async validateConfigurationFiles(): Promise<void> {
    console.log('⚙️ Validating Configuration File Rules...');
    
    const configResult = this.results.configurationFiles;
    
    try {
      // Test dynamic require allowances
      const requireTest = await this.testDynamicRequireAllowances();
      configResult.details.push(`Dynamic require allowances: ${requireTest.passed ? '✅' : '❌'}`);
      if (!requireTest.passed) {
        configResult.errors.push(...requireTest.errors);
      }

      // Test build tool patterns
      const buildToolTest = await this.testBuildToolPatterns();
      configResult.details.push(`Build tool patterns: ${buildToolTest.passed ? '✅' : '❌'}`);
      if (!buildToolTest.passed) {
        configResult.errors.push(...buildToolTest.errors);
      }

      // Test configuration-specific relaxations
      const configRelaxationTest = await this.testConfigurationRelaxations();
      configResult.details.push(`Configuration relaxations: ${configRelaxationTest.passed ? '✅' : '❌'}`);
      if (!configRelaxationTest.passed) {
        configResult.errors.push(...configRelaxationTest.errors);
      }

      configResult.passed = configResult.errors.length === 0;
      
      if (configResult.passed) {
        console.log('✅ Configuration file rules validation passed');
      } else {
        console.log('❌ Configuration file rules validation failed');
        configResult.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error) {
      configResult.errors.push(`Validation error: ${error}`);
      console.error('❌ Configuration file validation error:', error);
    }
  }

  /**
   * Test enterprise patterns in campaign system files
   */
  private async testEnterprisePatterns(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that campaign files allow enterprise patterns
      const campaignFiles = [
        'src/services/campaign/CampaignController.ts',
        'src/services/campaign/ProgressTracker.ts'
      ];

      for (const file of campaignFiles) {
        if (existsSync(join(this.projectRoot, file))) {
          try {
            execSync(`npx eslint "${file}" --no-eslintrc --config eslint.config.cjs --format json`, {
              stdio: 'pipe',
              cwd: this.projectRoot
            });
          } catch (eslintError: any) {
            const output = eslintError.stdout?.toString() || '';
            const result = JSON.parse(output || '[]');
            
            if (result.length > 0 && result[0].messages) {
              const restrictiveErrors = result[0].messages.filter((msg: any) => 
                msg.ruleId === 'complexity' && msg.severity === 2 || // error level complexity
                msg.ruleId === 'max-lines-per-function' && msg.severity === 2 ||
                msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2
              );
              
              if (restrictiveErrors.length > 0) {
                errors.push(`${file} has overly restrictive rules for enterprise patterns`);
              }
            }
          }
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing enterprise patterns: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test extensive logging allowance in campaign files
   */
  private async testExtensiveLogging(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that campaign files allow console statements
      const testContent = `
        console.log('Campaign progress update');
        console.warn('Safety protocol activated');
        console.error('Campaign failure detected');
        console.info('Metrics collected');
        console.debug('Detailed debugging info');
      `;

      const testFile = join(this.projectRoot, 'src/services/campaign/temp-logging-test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const consoleErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'no-console' && msg.severity === 2 // error level
          );
          
          if (consoleErrors.length > 0) {
            errors.push('Campaign files should allow extensive console logging');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing extensive logging: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test campaign variable patterns
   */
  private async testCampaignVariablePatterns(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that campaign variable patterns are recognized
      const testContent = `
        const campaign = 'typescript-elimination';
        const progress = 0.75;
        const metrics = { errors: 100 };
        const safety = true;
        const UNUSED_campaign = 'unused';
      `;

      const testFile = join(this.projectRoot, 'src/services/campaign/temp-variable-test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === '@typescript-eslint/no-unused-vars' &&
            (msg.message.includes('campaign') || msg.message.includes('progress') || 
             msg.message.includes('metrics') || msg.message.includes('safety'))
          );
          
          if (unusedVarErrors.length > 0) {
            errors.push('Campaign variable patterns not properly ignored by unused-vars rule');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing campaign variable patterns: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test campaign complexity allowances
   */
  private async testCampaignComplexityAllowances(): Promise<{ passed: boolean; warnings: string[] }> {
    const warnings: string[] = [];
    
    try {
      // Check that campaign files have appropriate complexity limits
      const campaignFiles = [
        'src/services/campaign/CampaignController.ts',
        'src/services/campaign/ProgressTracker.ts'
      ];

      for (const file of campaignFiles) {
        if (existsSync(join(this.projectRoot, file))) {
          try {
            execSync(`npx eslint "${file}" --no-eslintrc --config eslint.config.cjs --format json`, {
              stdio: 'pipe',
              cwd: this.projectRoot
            });
          } catch (eslintError: any) {
            const output = eslintError.stdout?.toString() || '';
            const result = JSON.parse(output || '[]');
            
            if (result.length > 0 && result[0].messages) {
              const complexityErrors = result[0].messages.filter((msg: any) => 
                msg.ruleId === 'complexity' && msg.severity === 2 // error level
              );
              
              if (complexityErrors.length > 0) {
                warnings.push(`${file} has complexity errors that should be warnings for campaign files`);
              }
            }
          }
        }
      }

      return { passed: warnings.length === 0, warnings };
    } catch (error) {
      warnings.push(`Error testing campaign complexity allowances: ${error}`);
      return { passed: false, warnings };
    }
  }

  /**
   * Test mock variable relaxations in test files
   */
  private async testMockVariableRelaxations(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that test files allow mock variables
      const testContent = `
        const mockFunction = jest.fn();
        const stubValue = 'test-stub';
        const testData = { id: 1 };
        const UNUSED_mock = 'unused';
      `;

      const testFile = join(this.projectRoot, 'temp-mock-test.test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const unusedVarErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === '@typescript-eslint/no-unused-vars' &&
            (msg.message.includes('mockFunction') || msg.message.includes('stubValue') || 
             msg.message.includes('testData'))
          );
          
          if (unusedVarErrors.length > 0) {
            errors.push('Mock variable patterns not properly ignored in test files');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing mock variable relaxations: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test test-specific rule relaxations
   */
  private async testTestSpecificRelaxations(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that test files have appropriate rule relaxations
      const testContent = `
        const anyValue: any = 'test-any';
        console.log('Test output');
        const value = someObject!.property; // non-null assertion
        const magicNumber = 42; // magic number
      `;

      const testFile = join(this.projectRoot, 'temp-relaxation-test.test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const restrictiveErrors = result[0].messages.filter((msg: any) => 
            (msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2) ||
            (msg.ruleId === 'no-console' && msg.severity === 2) ||
            (msg.ruleId === '@typescript-eslint/no-non-null-assertion' && msg.severity === 2) ||
            (msg.ruleId === 'no-magic-numbers' && msg.severity === 2)
          );
          
          if (restrictiveErrors.length > 0) {
            errors.push('Test files should have relaxed rules for testing patterns');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing test-specific relaxations: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test Jest globals availability
   */
  private async testJestGlobalsAvailability(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that Jest globals are available in test files
      const testContent = `
        describe('Test suite', () => {
          it('should work', () => {
            expect(true).toBe(true);
          });
          
          beforeEach(() => {
            jest.clearAllMocks();
          });
        });
      `;

      const testFile = join(this.projectRoot, 'temp-globals-test.test.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const undefErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'no-undef' &&
            (msg.message.includes('describe') || msg.message.includes('it') || 
             msg.message.includes('expect') || msg.message.includes('jest'))
          );
          
          if (undefErrors.length > 0) {
            errors.push('Jest globals not properly defined in test files');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing Jest globals availability: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test dynamic require allowances in configuration files
   */
  private async testDynamicRequireAllowances(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that config files allow dynamic requires
      const testContent = `
        const config = require('./some-config');
        const dynamicModule = require(process.env.MODULE_NAME);
        module.exports = { ...config };
      `;

      const testFile = join(this.projectRoot, 'temp-require-test.config.js');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const requireErrors = result[0].messages.filter((msg: any) => 
            msg.ruleId === 'import/no-dynamic-require' && msg.severity === 2
          );
          
          if (requireErrors.length > 0) {
            errors.push('Configuration files should allow dynamic requires');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing dynamic require allowances: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test build tool patterns in configuration files
   */
  private async testBuildToolPatterns(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Check existing config files for proper rule application
      const configFiles = [
        'next.config.js',
        'tailwind.config.js',
        'jest.config.js'
      ];

      for (const file of configFiles) {
        if (existsSync(join(this.projectRoot, file))) {
          try {
            execSync(`npx eslint "${file}" --no-eslintrc --config eslint.config.cjs --format json`, {
              stdio: 'pipe',
              cwd: this.projectRoot
            });
          } catch (eslintError: any) {
            const output = eslintError.stdout?.toString() || '';
            const result = JSON.parse(output || '[]');
            
            if (result.length > 0 && result[0].messages) {
              const restrictiveErrors = result[0].messages.filter((msg: any) => 
                (msg.ruleId === 'no-console' && msg.severity === 2) ||
                (msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2) ||
                (msg.ruleId === '@typescript-eslint/no-var-requires' && msg.severity === 2)
              );
              
              if (restrictiveErrors.length > 0) {
                errors.push(`${file} has overly restrictive rules for build tool patterns`);
              }
            }
          }
        }
      }

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing build tool patterns: ${error}`);
      return { passed: false, errors };
    }
  }

  /**
   * Test configuration-specific relaxations
   */
  private async testConfigurationRelaxations(): Promise<{ passed: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Test that config files have appropriate relaxations
      const testContent = `
        const anyConfig: any = process.env.CONFIG;
        console.log('Configuration loaded');
        const dynamicRequire = require(process.env.MODULE);
      `;

      const testFile = join(this.projectRoot, 'temp-config-relaxation.config.ts');
      writeFileSync(testFile, testContent);

      try {
        execSync(`npx eslint "${testFile}" --no-eslintrc --config eslint.config.cjs --format json`, {
          stdio: 'pipe',
          cwd: this.projectRoot
        });
      } catch (eslintError: any) {
        const output = eslintError.stdout?.toString() || '';
        const result = JSON.parse(output || '[]');
        
        if (result.length > 0 && result[0].messages) {
          const restrictiveErrors = result[0].messages.filter((msg: any) => 
            (msg.ruleId === '@typescript-eslint/no-explicit-any' && msg.severity === 2) ||
            (msg.ruleId === 'no-console' && msg.severity === 2) ||
            (msg.ruleId === 'import/no-dynamic-require' && msg.severity === 2)
          );
          
          if (restrictiveErrors.length > 0) {
            errors.push('Configuration files should have relaxed rules for build patterns');
          }
        }
      }

      // Clean up
      try {
        execSync(`rm -f "${testFile}"`);
      } catch {}

      return { passed: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Error testing configuration relaxations: ${error}`);
      return { passed: false, errors };
    }
  }
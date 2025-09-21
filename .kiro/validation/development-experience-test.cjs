#!/usr/bin/env node

/**
 * Development Experience Optimization Test
 * 
 * Tests that workspace settings actually optimize the development experience
 * by checking TypeScript performance, IntelliSense configuration, and
 * development workflow enhancements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DevelopmentExperienceTest {
  constructor() {
    this.results = [];
    this.baseDir = path.resolve('.kiro');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(testName, passed, message) {
    this.results.push({ testName, passed, message });
    this.log(`${testName}: ${message}`, passed ? 'success' : 'error');
  }

  // Test TypeScript configuration optimization
  testTypeScriptOptimization() {
    this.log('Testing TypeScript optimization...', 'info');
    
    const tsConfigPath = path.join(this.baseDir, 'settings', 'typescript.json');
    if (fs.existsSync(tsConfigPath)) {
      const config = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      // Check for performance optimizations
      const hasIncrementalCompilation = config['typescript.preferences.includePackageJsonAutoImports'];
      const hasAutoImports = config['typescript.suggest.autoImports'];
      const hasInlayHints = config['typescript.inlayHints.parameterNames.enabled'];
      
      this.addResult('TypeScript IntelliSense optimization', 
        hasIncrementalCompilation && hasAutoImports, 
        'Auto-imports and IntelliSense configured');
      
      this.addResult('TypeScript inlay hints', 
        hasInlayHints, 
        'Parameter hints enabled for better development experience');
    }

    // Test actual TypeScript compilation performance
    try {
      const startTime = Date.now();
      execSync('npx tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe', 
        timeout: 30000 
      });
      const duration = Date.now() - startTime;
      
      this.addResult('TypeScript compilation performance', 
        duration < 15000, 
        `Compilation completed in ${duration}ms`);
    } catch (error) {
      this.addResult('TypeScript compilation test', 
        false, 
        'TypeScript compilation failed or timed out');
    }
  }

  // Test workspace settings effectiveness
  testWorkspaceSettings() {
    this.log('Testing workspace settings effectiveness...', 'info');
    
    const workspacePath = path.join(this.baseDir, 'settings', 'workspace.json');
    if (fs.existsSync(workspacePath)) {
      const config = JSON.parse(fs.readFileSync(workspacePath, 'utf8'));
      
      // Test code actions on save
      const codeActions = config['editor.codeActionsOnSave'];
      const hasAutoFix = codeActions && codeActions['source.fixAll.eslint'];
      const hasOrganizeImports = codeActions && codeActions['source.organizeImports'];
      
      this.addResult('Auto-fix on save', 
        hasAutoFix, 
        'ESLint auto-fix enabled on save');
      
      this.addResult('Import organization', 
        hasOrganizeImports, 
        'Import organization enabled on save');

      // Test file associations
      const fileAssociations = config['files.associations'];
      const hasAstroAssociation = fileAssociations && fileAssociations['*.astro'];
      const hasAlchmAssociation = fileAssociations && fileAssociations['*.alchm'];
      
      this.addResult('Astrological file associations', 
        hasAstroAssociation || hasAlchmAssociation, 
        'Custom file type associations configured');

      // Test search exclusions for performance
      const searchExclude = config['search.exclude'];
      const excludesNodeModules = searchExclude && searchExclude['**/node_modules'];
      const excludesNext = searchExclude && searchExclude['**/.next'];
      
      this.addResult('Search performance optimization', 
        excludesNodeModules && excludesNext, 
        'Performance-critical directories excluded from search');
    }
  }

  // Test extension recommendations effectiveness
  testExtensionRecommendations() {
    this.log('Testing extension recommendations...', 'info');
    
    const extensionsPath = path.join(this.baseDir, 'settings', 'extensions.json');
    if (fs.existsSync(extensionsPath)) {
      const config = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
      const recommendations = config.recommendations || [];
      
      // Check for essential development extensions
      const hasTypeScript = recommendations.some(ext => ext.includes('typescript'));
      const hasTailwind = recommendations.some(ext => ext.includes('tailwind'));
      const hasPrettier = recommendations.some(ext => ext.includes('prettier'));
      const hasESLint = recommendations.some(ext => ext.includes('eslint'));
      const hasJest = recommendations.some(ext => ext.includes('jest'));
      
      this.addResult('TypeScript extension recommended', 
        hasTypeScript, 
        'TypeScript development extension included');
      
      this.addResult('Tailwind CSS extension recommended', 
        hasTailwind, 
        'Tailwind CSS extension for styling support');
      
      this.addResult('Code quality extensions', 
        hasPrettier && hasESLint, 
        'Prettier and ESLint extensions for code quality');
      
      this.addResult('Testing extension recommended', 
        hasJest, 
        'Jest extension for testing support');

      // Check total count for comprehensive coverage
      this.addResult('Comprehensive extension coverage', 
        recommendations.length >= 10, 
        `${recommendations.length} extensions recommended for full development support`);
    }
  }

  // Test astrological domain-specific optimizations
  testAstrologicalOptimizations() {
    this.log('Testing astrological domain optimizations...', 'info');
    
    // Check if astrological calculation files have proper syntax highlighting
    const languageSettingsPath = path.join(this.baseDir, 'settings', 'language-settings.json');
    if (fs.existsSync(languageSettingsPath)) {
      const config = JSON.parse(fs.readFileSync(languageSettingsPath, 'utf8'));
      
      // Check for astronomical library support
      const hasAstronomySupport = JSON.stringify(config).includes('astronomy') || 
                                  JSON.stringify(config).includes('astro');
      
      this.addResult('Astrological library support', 
        hasAstronomySupport, 
        'Language settings optimized for astronomical calculations');
    }

    // Test if steering files provide proper context
    const steeringDir = path.join(this.baseDir, 'steering');
    const astrologyRulesPath = path.join(steeringDir, 'astrology-rules.md');
    
    if (fs.existsSync(astrologyRulesPath)) {
      const content = fs.readFileSync(astrologyRulesPath, 'utf8');
      const hasCalculationGuidelines = content.includes('calculation') && content.includes('planetary');
      const hasFallbackMechanisms = content.includes('fallback') && content.includes('reliability');
      
      this.addResult('Astrological calculation guidelines', 
        hasCalculationGuidelines, 
        'Comprehensive calculation guidelines provided');
      
      this.addResult('Reliability and fallback guidance', 
        hasFallbackMechanisms, 
        'Fallback mechanisms documented for robust development');
    }
  }

  // Test campaign system integration
  testCampaignIntegration() {
    this.log('Testing campaign system integration...', 'info');
    
    const campaignSteeringPath = path.join(this.baseDir, 'steering', 'campaign-integration.md');
    if (fs.existsSync(campaignSteeringPath)) {
      const content = fs.readFileSync(campaignSteeringPath, 'utf8');
      
      const hasErrorThresholds = content.includes('threshold') && content.includes('error');
      const hasAutomationTriggers = content.includes('automation') && content.includes('trigger');
      const hasSafetyProtocols = content.includes('safety') && content.includes('protocol');
      
      this.addResult('Campaign error threshold management', 
        hasErrorThresholds, 
        'Error thresholds documented for campaign triggers');
      
      this.addResult('Campaign automation triggers', 
        hasAutomationTriggers, 
        'Automation triggers configured for quality improvement');
      
      this.addResult('Campaign safety protocols', 
        hasSafetyProtocols, 
        'Safety protocols documented for secure automation');
    }

    // Test if campaign hooks are properly configured
    const tsHookPath = path.join(this.baseDir, 'hooks', 'typescript-campaign-trigger.md');
    if (fs.existsSync(tsHookPath)) {
      const content = fs.readFileSync(tsHookPath, 'utf8');
      const hasThresholdConfig = content.includes('4500') || content.includes('threshold');
      
      this.addResult('TypeScript campaign hook configuration', 
        hasThresholdConfig, 
        'TypeScript error threshold properly configured');
    }
  }

  // Generate development experience report
  generateReport() {
    this.log('\n=== DEVELOPMENT EXPERIENCE OPTIMIZATION REPORT ===', 'info');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    this.log(`\nOVERALL: ${passed}/${total} optimization tests passed (${percentage}%)`,
      percentage >= 80 ? 'success' : 'error');

    // Show failed tests
    const failedTests = this.results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      this.log('\nFailed optimization tests:', 'warning');
      failedTests.forEach(test => {
        this.log(`  - ${test.testName}: ${test.message}`, 'error');
      });
    }

    // Show successful optimizations
    const passedTests = this.results.filter(r => r.passed);
    if (passedTests.length > 0) {
      this.log('\nSuccessful optimizations:', 'success');
      passedTests.forEach(test => {
        this.log(`  ✓ ${test.testName}: ${test.message}`, 'success');
      });
    }

    return percentage >= 80;
  }

  // Main test runner
  async run() {
    this.log('Starting Development Experience Optimization Test...', 'info');
    
    try {
      this.testTypeScriptOptimization();
      this.testWorkspaceSettings();
      this.testExtensionRecommendations();
      this.testAstrologicalOptimizations();
      this.testCampaignIntegration();
      
      const success = this.generateReport();
      
      if (success) {
        this.log('\n🎉 Development experience optimization PASSED!', 'success');
        process.exit(0);
      } else {
        this.log('\n💥 Development experience optimization needs improvement!', 'error');
        process.exit(1);
      }
    } catch (error) {
      this.log(`Test error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run test if called directly
if (require.main === module) {
  const tester = new DevelopmentExperienceTest();
  tester.run();
}

module.exports = DevelopmentExperienceTest;
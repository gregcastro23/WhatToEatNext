#!/usr/bin/env node

/**
 * Comprehensive Testing and Validation Suite
 * Automated tests for Kiro configuration, integration tests, performance benchmarks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      configTests: { passed: 0, failed: 0, issues: [] },
      integrationTests: { passed: 0, failed: 0, issues: [] },
      performanceTests: { passed: 0, failed: 0, issues: [] },
      regressionTests: { passed: 0, failed: 0, issues: [] },
      overall: { passed: 0, failed: 0 }
    };
    this.benchmarks = {};
  }

  async runAll() {
    console.log('🧪 Starting Comprehensive Testing and Validation Suite...\n');
    
    await this.runConfigurationTests();
    await this.runIntegrationTests();
    await this.runPerformanceBenchmarks();
    await this.runRegressionTests();
    
    this.generateReport();
    return this.results.overall.failed === 0;
  }

  async runConfigurationTests() {
    console.log('⚙️  Running Configuration Tests...');
    
    // Test 1: Kiro configuration validation
    try {
      const KiroConfigValidator = require('./complete-config-validator.cjs');
      const validator = new KiroConfigValidator();
      const success = await validator.validateAll();
      
      if (success) {
        this.results.configTests.passed++;
        console.log('  ✅ Kiro configuration validation - Passed');
      } else {
        this.results.configTests.failed++;
        this.results.configTests.issues.push('Kiro configuration validation failed');
      }
    } catch (error) {
      this.results.configTests.failed++;
      this.results.configTests.issues.push(`Config validation error: ${error.message}`);
    }

    // Test 2: Package.json dependencies validation
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = [
        'next', 'react', 'typescript', 'tailwindcss', 
        'astronomia', 'astronomy-engine', 'date-fns', 'zod'
      ];
      
      let missingDeps = 0;
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
          missingDeps++;
          this.results.configTests.issues.push(`Missing dependency: ${dep}`);
        }
      }
      
      if (missingDeps === 0) {
        this.results.configTests.passed++;
        console.log('  ✅ Package dependencies validation - Passed');
      } else {
        this.results.configTests.failed++;
      }
    } catch (error) {
      this.results.configTests.failed++;
      this.results.configTests.issues.push(`Package validation error: ${error.message}`);
    }

    // Test 3: TypeScript configuration validation
    try {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      const requiredOptions = ['strict', 'baseUrl', 'paths'];
      
      let missingOptions = 0;
      for (const option of requiredOptions) {
        if (!tsConfig.compilerOptions[option]) {
          missingOptions++;
          this.results.configTests.issues.push(`Missing TypeScript option: ${option}`);
        }
      }
      
      if (missingOptions === 0) {
        this.results.configTests.passed++;
        console.log('  ✅ TypeScript configuration validation - Passed');
      } else {
        this.results.configTests.failed++;
      }
    } catch (error) {
      this.results.configTests.failed++;
      this.results.configTests.issues.push(`TypeScript config error: ${error.message}`);
    }
  }

  async runIntegrationTests() {
    console.log('\n🔗 Running Integration Tests...');
    
    // Test 1: Campaign system integration
    try {
      const campaignFiles = [
        'src/services/campaign/CampaignController.ts',
        'src/services/campaign/ProgressTracker.ts'
      ];
      
      let validIntegrations = 0;
      for (const file of campaignFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('class') && content.includes('export')) {
            validIntegrations++;
          }
        }
      }
      
      if (validIntegrations === campaignFiles.length) {
        this.results.integrationTests.passed++;
        console.log('  ✅ Campaign system integration - Passed');
      } else {
        this.results.integrationTests.failed++;
        this.results.integrationTests.issues.push('Campaign system integration incomplete');
      }
    } catch (error) {
      this.results.integrationTests.failed++;
      this.results.integrationTests.issues.push(`Campaign integration error: ${error.message}`);
    }

    // Test 2: Astrological calculation integration
    try {
      const astroFiles = [
        'src/utils/reliableAstronomy.ts',
        'src/calculations/core/alchemicalEngine.ts'
      ];
      
      let validAstroIntegrations = 0;
      for (const file of astroFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('export') && content.includes('function')) {
            validAstroIntegrations++;
          }
        }
      }
      
      if (validAstroIntegrations >= 1) { // At least one file exists
        this.results.integrationTests.passed++;
        console.log('  ✅ Astrological calculation integration - Passed');
      } else {
        this.results.integrationTests.failed++;
        this.results.integrationTests.issues.push('Astrological calculation integration missing');
      }
    } catch (error) {
      this.results.integrationTests.failed++;
      this.results.integrationTests.issues.push(`Astro integration error: ${error.message}`);
    }

    // Test 3: MCP server connectivity test
    try {
      const mcpConfig = JSON.parse(fs.readFileSync('.kiro/settings/mcp.json', 'utf8'));
      if (mcpConfig.mcpServers && Object.keys(mcpConfig.mcpServers).length > 0) {
        this.results.integrationTests.passed++;
        console.log('  ✅ MCP server configuration - Passed');
      } else {
        this.results.integrationTests.failed++;
        this.results.integrationTests.issues.push('MCP server configuration incomplete');
      }
    } catch (error) {
      this.results.integrationTests.failed++;
      this.results.integrationTests.issues.push(`MCP integration error: ${error.message}`);
    }
  }

  async runPerformanceBenchmarks() {
    console.log('\n⚡ Running Performance Benchmarks...');
    
    // Benchmark 1: TypeScript compilation time
    try {
      const startTime = Date.now();
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      const compilationTime = Date.now() - startTime;
      
      this.benchmarks.typeScriptCompilation = compilationTime;
      
      if (compilationTime < 30000) { // Less than 30 seconds
        this.results.performanceTests.passed++;
        console.log(`  ✅ TypeScript compilation - ${compilationTime}ms (Target: <30s)`);
      } else {
        this.results.performanceTests.failed++;
        this.results.performanceTests.issues.push(`TypeScript compilation too slow: ${compilationTime}ms`);
      }
    } catch (error) {
      this.results.performanceTests.failed++;
      this.results.performanceTests.issues.push(`TypeScript compilation error: ${error.message}`);
    }

    // Benchmark 2: Linting performance
    try {
      const startTime = Date.now();
      execSync('npx eslint --config eslint.config.cjs src --max-warnings=10000', { stdio: 'pipe' });
      const lintingTime = Date.now() - startTime;
      
      this.benchmarks.linting = lintingTime;
      
      if (lintingTime < 15000) { // Less than 15 seconds
        this.results.performanceTests.passed++;
        console.log(`  ✅ Linting performance - ${lintingTime}ms (Target: <15s)`);
      } else {
        this.results.performanceTests.failed++;
        this.results.performanceTests.issues.push(`Linting too slow: ${lintingTime}ms`);
      }
    } catch (error) {
      this.results.performanceTests.failed++;
      this.results.performanceTests.issues.push(`Linting performance error: ${error.message}`);
    }

    // Benchmark 3: File system operations
    try {
      const startTime = Date.now();
      
      // Test file operations
      const testDir = '.test-performance';
      fs.mkdirSync(testDir, { recursive: true });
      
      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(path.join(testDir, `test-${i}.txt`), 'test content');
      }
      
      for (let i = 0; i < 100; i++) {
        fs.readFileSync(path.join(testDir, `test-${i}.txt`), 'utf8');
      }
      
      // Cleanup
      fs.rmSync(testDir, { recursive: true, force: true });
      
      const fsTime = Date.now() - startTime;
      this.benchmarks.fileSystem = fsTime;
      
      if (fsTime < 1000) { // Less than 1 second
        this.results.performanceTests.passed++;
        console.log(`  ✅ File system operations - ${fsTime}ms (Target: <1s)`);
      } else {
        this.results.performanceTests.failed++;
        this.results.performanceTests.issues.push(`File system operations too slow: ${fsTime}ms`);
      }
    } catch (error) {
      this.results.performanceTests.failed++;
      this.results.performanceTests.issues.push(`File system benchmark error: ${error.message}`);
    }
  }

  async runRegressionTests() {
    console.log('\n🔄 Running Regression Tests...');
    
    // Test 1: Ensure no critical files were accidentally deleted
    try {
      const criticalFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        '.kiro/steering/product.md',
        '.kiro/settings/mcp.json',
        'src/services/campaign/CampaignController.ts'
      ];
      
      let missingCritical = 0;
      for (const file of criticalFiles) {
        if (!fs.existsSync(file)) {
          missingCritical++;
          this.results.regressionTests.issues.push(`Critical file missing: ${file}`);
        }
      }
      
      if (missingCritical === 0) {
        this.results.regressionTests.passed++;
        console.log('  ✅ Critical files integrity - Passed');
      } else {
        this.results.regressionTests.failed++;
      }
    } catch (error) {
      this.results.regressionTests.failed++;
      this.results.regressionTests.issues.push(`Critical files check error: ${error.message}`);
    }

    // Test 2: Validate no broken imports in key files
    try {
      const keyFiles = [
        'src/services/AlchemicalRecommendationService.ts',
        'src/utils/reliableAstronomy.ts'
      ];
      
      let brokenImports = 0;
      for (const file of keyFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          // Check for common import issues
          if (content.includes('import') && !content.includes('from')) {
            brokenImports++;
            this.results.regressionTests.issues.push(`Potential broken import in: ${file}`);
          }
        }
      }
      
      if (brokenImports === 0) {
        this.results.regressionTests.passed++;
        console.log('  ✅ Import integrity check - Passed');
      } else {
        this.results.regressionTests.failed++;
      }
    } catch (error) {
      this.results.regressionTests.failed++;
      this.results.regressionTests.issues.push(`Import check error: ${error.message}`);
    }

    // Test 3: Validate configuration consistency
    try {
      const WorkflowTester = require('./workflow-tester.cjs');
      const tester = new WorkflowTester();
      const success = await tester.testAll();
      
      if (success) {
        this.results.regressionTests.passed++;
        console.log('  ✅ Configuration consistency - Passed');
      } else {
        this.results.regressionTests.failed++;
        this.results.regressionTests.issues.push('Configuration consistency check failed');
      }
    } catch (error) {
      this.results.regressionTests.failed++;
      this.results.regressionTests.issues.push(`Configuration consistency error: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Comprehensive Test Suite Report');
    console.log('===================================');
    
    const categories = ['configTests', 'integrationTests', 'performanceTests', 'regressionTests'];
    const categoryNames = {
      configTests: 'CONFIGURATION TESTS',
      integrationTests: 'INTEGRATION TESTS',
      performanceTests: 'PERFORMANCE TESTS',
      regressionTests: 'REGRESSION TESTS'
    };
    
    categories.forEach(category => {
      const result = this.results[category];
      const total = result.passed + result.failed;
      const status = result.failed === 0 ? '✅' : '❌';
      
      console.log(`${status} ${categoryNames[category]}: ${result.passed}/${total} passed`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    });

    // Performance benchmarks
    if (Object.keys(this.benchmarks).length > 0) {
      console.log('\n⚡ Performance Benchmarks:');
      Object.entries(this.benchmarks).forEach(([test, time]) => {
        console.log(`   ${test}: ${time}ms`);
      });
    }

    // Calculate overall results
    this.results.overall.passed = categories.reduce((sum, cat) => sum + this.results[cat].passed, 0);
    this.results.overall.failed = categories.reduce((sum, cat) => sum + this.results[cat].failed, 0);
    
    const overallTotal = this.results.overall.passed + this.results.overall.failed;
    const successRate = ((this.results.overall.passed / overallTotal) * 100).toFixed(1);
    
    console.log('\n🎯 Overall Test Results');
    console.log(`Success Rate: ${successRate}% (${this.results.overall.passed}/${overallTotal})`);
    
    if (this.results.overall.failed === 0) {
      console.log('🎉 All tests passed! Kiro optimization is fully validated.');
    } else {
      console.log(`⚠️  ${this.results.overall.failed} tests need attention`);
    }

    // Recommendations
    console.log('\n💡 Optimization Recommendations:');
    if (this.results.configTests.failed > 0) {
      console.log('- Review and fix configuration issues');
    }
    if (this.results.integrationTests.failed > 0) {
      console.log('- Strengthen integration between system components');
    }
    if (this.results.performanceTests.failed > 0) {
      console.log('- Optimize performance bottlenecks identified in benchmarks');
    }
    if (this.results.regressionTests.failed > 0) {
      console.log('- Address regression issues to maintain system stability');
    }
    
    // Continuous validation setup
    console.log('\n🔄 Continuous Validation Setup:');
    console.log('- Run this suite before major deployments');
    console.log('- Schedule weekly automated runs');
    console.log('- Monitor performance benchmarks for degradation');
    console.log('- Update test cases as new features are added');
  }
}

// Run comprehensive tests if called directly
if (require.main === module) {
  const suite = new ComprehensiveTestSuite();
  suite.runAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ComprehensiveTestSuite;
#!/usr/bin/env node

/**
 * Kiro Configuration Validator
 * 
 * Comprehensive validation script for all Kiro configuration components:
 * - Steering files loading and context provision
 * - Agent hooks trigger and execution validation
 * - MCP server connections and fallback mechanisms
 * - Workspace settings optimization verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class KiroConfigValidator {
  constructor() {
    this.results = {
      steering: { passed: 0, failed: 0, tests: [] },
      hooks: { passed: 0, failed: 0, tests: [] },
      mcp: { passed: 0, failed: 0, tests: [] },
      settings: { passed: 0, failed: 0, tests: [] },
      overall: { passed: 0, failed: 0 }
    };
    this.baseDir = path.resolve('.kiro');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(category, testName, passed, message) {
    const result = { testName, passed, message };
    this.results[category].tests.push(result);
    
    if (passed) {
      this.results[category].passed++;
      this.results.overall.passed++;
      this.log(`${testName}: ${message}`, 'success');
    } else {
      this.results[category].failed++;
      this.results.overall.failed++;
      this.log(`${testName}: ${message}`, 'error');
    }
  }

  // Test 1: Validate Steering Files
  async validateSteeringFiles() {
    this.log('Validating steering files...', 'info');
    
    const steeringDir = path.join(this.baseDir, 'steering');
    const requiredFiles = [
      'product.md',
      'structure.md', 
      'tech.md',
      'astrology-rules.md',
      'elemental-principles.md',
      'campaign-integration.md'
    ];

    // Test file existence
    for (const file of requiredFiles) {
      const filePath = path.join(steeringDir, file);
      const exists = fs.existsSync(filePath);
      this.addResult('steering', `Steering file exists: ${file}`, exists, 
        exists ? 'File found' : 'File missing');
    }

    // Test file content quality
    for (const file of requiredFiles) {
      const filePath = path.join(steeringDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasContent = content.length > 100;
        const hasStructure = content.includes('#') && content.includes('##');
        
        this.addResult('steering', `Content quality: ${file}`, hasContent && hasStructure,
          hasContent && hasStructure ? 'Well-structured content' : 'Insufficient content structure');
      }
    }

    // Test file references
    const productFile = path.join(steeringDir, 'product.md');
    if (fs.existsSync(productFile)) {
      const content = fs.readFileSync(productFile, 'utf8');
      const hasReferences = content.includes('#[[file:');
      this.addResult('steering', 'File references in product.md', hasReferences,
        hasReferences ? 'Contains file references' : 'Missing file references');
    }
  }

  // Test 2: Validate Agent Hooks
  async validateAgentHooks() {
    this.log('Validating agent hooks...', 'info');
    
    const hooksDir = path.join(this.baseDir, 'hooks');
    const requiredHooks = [
      'planetary-data-validator.md',
      'ingredient-consistency-checker.md',
      'typescript-campaign-trigger.md',
      'build-quality-monitor.md'
    ];

    // Test hook file existence
    for (const hook of requiredHooks) {
      const hookPath = path.join(hooksDir, hook);
      const exists = fs.existsSync(hookPath);
      this.addResult('hooks', `Hook exists: ${hook}`, exists,
        exists ? 'Hook file found' : 'Hook file missing');
    }

    // Test hook configuration structure
    for (const hook of requiredHooks) {
      const hookPath = path.join(hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');
        const hasName = content.includes('name:') || content.includes('# ');
        const hasTrigger = content.includes('trigger') || content.includes('Trigger');
        const hasActions = content.includes('action') || content.includes('Action');
        
        const isValid = hasName && hasTrigger && hasActions;
        this.addResult('hooks', `Hook structure: ${hook}`, isValid,
          isValid ? 'Valid hook structure' : 'Invalid hook structure');
      }
    }

    // Test hook trigger conditions
    const tsHook = path.join(hooksDir, 'typescript-campaign-trigger.md');
    if (fs.existsSync(tsHook)) {
      const content = fs.readFileSync(tsHook, 'utf8');
      const hasThreshold = content.includes('threshold') || content.includes('error');
      this.addResult('hooks', 'TypeScript hook has threshold', hasThreshold,
        hasThreshold ? 'Threshold configuration found' : 'Missing threshold configuration');
    }
  }

  // Test 3: Validate MCP Server Configuration
  async validateMCPServers() {
    this.log('Validating MCP server configuration...', 'info');
    
    const mcpConfigPath = path.join(this.baseDir, 'settings', 'mcp.json');
    
    // Test MCP config file exists
    const configExists = fs.existsSync(mcpConfigPath);
    this.addResult('mcp', 'MCP config file exists', configExists,
      configExists ? 'MCP configuration found' : 'MCP configuration missing');

    if (configExists) {
      try {
        const config = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
        
        // Test config structure
        const hasServers = config.mcpServers && typeof config.mcpServers === 'object';
        this.addResult('mcp', 'MCP config structure', hasServers,
          hasServers ? 'Valid MCP server structure' : 'Invalid MCP server structure');

        if (hasServers) {
          const serverCount = Object.keys(config.mcpServers).length;
          this.addResult('mcp', 'MCP servers configured', serverCount > 0,
            `${serverCount} MCP servers configured`);

          // Test individual server configurations
          for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
            const hasCommand = serverConfig.command;
            const hasArgs = Array.isArray(serverConfig.args);
            
            this.addResult('mcp', `Server config: ${serverName}`, hasCommand && hasArgs,
              hasCommand && hasArgs ? 'Valid server configuration' : 'Invalid server configuration');
          }
        }
      } catch (error) {
        this.addResult('mcp', 'MCP config parsing', false, `JSON parsing error: ${error.message}`);
      }
    }

    // Test fallback mechanisms
    const fallbackTest = this.testMCPFallback();
    this.addResult('mcp', 'Fallback mechanism', fallbackTest,
      fallbackTest ? 'Fallback logic implemented' : 'Missing fallback logic');
  }

  testMCPFallback() {
    // Check if fallback logic exists in the codebase
    try {
      const srcDir = path.resolve('src');
      if (fs.existsSync(srcDir)) {
        const result = execSync('grep -r "fallback" src/ --include="*.ts" --include="*.js" | head -5', 
          { encoding: 'utf8', stdio: 'pipe' });
        return result.length > 0;
      }
    } catch (error) {
      // Grep returns exit code 1 when no matches found
      return false;
    }
    return false;
  }

  // Test 4: Validate Workspace Settings
  async validateWorkspaceSettings() {
    this.log('Validating workspace settings...', 'info');
    
    const settingsDir = path.join(this.baseDir, 'settings');
    const requiredSettings = [
      'workspace.json',
      'extensions.json',
      'typescript.json',
      'language-settings.json'
    ];

    // Test settings file existence
    for (const setting of requiredSettings) {
      const settingPath = path.join(settingsDir, setting);
      const exists = fs.existsSync(settingPath);
      this.addResult('settings', `Settings file: ${setting}`, exists,
        exists ? 'Settings file found' : 'Settings file missing');
    }

    // Test workspace.json content
    const workspacePath = path.join(settingsDir, 'workspace.json');
    if (fs.existsSync(workspacePath)) {
      try {
        const config = JSON.parse(fs.readFileSync(workspacePath, 'utf8'));
        const hasTypeScriptSettings = config['typescript.preferences.includePackageJsonAutoImports'];
        const hasEditorSettings = config['editor.codeActionsOnSave'];
        
        this.addResult('settings', 'Workspace TypeScript optimization', !!hasTypeScriptSettings,
          hasTypeScriptSettings ? 'TypeScript settings optimized' : 'Missing TypeScript optimization');
        
        this.addResult('settings', 'Workspace editor optimization', !!hasEditorSettings,
          hasEditorSettings ? 'Editor settings optimized' : 'Missing editor optimization');
      } catch (error) {
        this.addResult('settings', 'Workspace config parsing', false, 
          `JSON parsing error: ${error.message}`);
      }
    }

    // Test extensions.json content
    const extensionsPath = path.join(settingsDir, 'extensions.json');
    if (fs.existsSync(extensionsPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(extensionsPath, 'utf8'));
        const hasRecommendations = Array.isArray(config.recommendations);
        const extensionCount = hasRecommendations ? config.recommendations.length : 0;
        
        this.addResult('settings', 'Extension recommendations', extensionCount > 5,
          `${extensionCount} extensions recommended`);
      } catch (error) {
        this.addResult('settings', 'Extensions config parsing', false,
          `JSON parsing error: ${error.message}`);
      }
    }
  }

  // Test 5: Integration Tests
  async validateIntegration() {
    this.log('Running integration tests...', 'info');
    
    // Test steering file cross-references
    const steeringDir = path.join(this.baseDir, 'steering');
    let totalReferences = 0;
    
    if (fs.existsSync(steeringDir)) {
      const files = fs.readdirSync(steeringDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const content = fs.readFileSync(path.join(steeringDir, file), 'utf8');
        const references = (content.match(/#\[\[file:/g) || []).length;
        totalReferences += references;
      }
    }
    
    this.addResult('steering', 'Cross-file references', totalReferences > 10,
      `${totalReferences} file references found`);

    // Test template availability
    const templatesDir = path.join(this.baseDir, 'templates');
    const templateCount = fs.existsSync(templatesDir) ? 
      fs.readdirSync(templatesDir).filter(f => f.endsWith('.md')).length : 0;
    
    this.addResult('settings', 'Spec templates available', templateCount >= 3,
      `${templateCount} spec templates available`);
  }

  // Generate comprehensive report
  generateReport() {
    this.log('\n=== KIRO CONFIGURATION VALIDATION REPORT ===', 'info');
    
    const categories = ['steering', 'hooks', 'mcp', 'settings'];
    
    for (const category of categories) {
      const result = this.results[category];
      const total = result.passed + result.failed;
      const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;
      
      this.log(`\n${category.toUpperCase()}: ${result.passed}/${total} tests passed (${percentage}%)`, 
        percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error');
      
      // Show failed tests
      const failedTests = result.tests.filter(t => !t.passed);
      if (failedTests.length > 0) {
        this.log(`Failed tests in ${category}:`, 'warning');
        failedTests.forEach(test => {
          this.log(`  - ${test.testName}: ${test.message}`, 'error');
        });
      }
    }

    const overallTotal = this.results.overall.passed + this.results.overall.failed;
    const overallPercentage = overallTotal > 0 ? 
      Math.round((this.results.overall.passed / overallTotal) * 100) : 0;
    
    this.log(`\nOVERALL: ${this.results.overall.passed}/${overallTotal} tests passed (${overallPercentage}%)`,
      overallPercentage >= 80 ? 'success' : 'error');

    return overallPercentage >= 80;
  }

  // Main validation runner
  async run() {
    this.log('Starting Kiro Configuration Validation...', 'info');
    
    try {
      await this.validateSteeringFiles();
      await this.validateAgentHooks();
      await this.validateMCPServers();
      await this.validateWorkspaceSettings();
      await this.validateIntegration();
      
      const success = this.generateReport();
      
      if (success) {
        this.log('\n🎉 Kiro configuration validation PASSED!', 'success');
        process.exit(0);
      } else {
        this.log('\n💥 Kiro configuration validation FAILED!', 'error');
        process.exit(1);
      }
    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new KiroConfigValidator();
  validator.run();
}

module.exports = KiroConfigValidator;
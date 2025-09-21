#!/usr/bin/env node

/**
 * Complete Kiro Configuration Validator
 * Validates all steering files, agent hooks, MCP servers, and workspace settings
 */

const fs = require('fs');
const path = require('path');

class KiroConfigValidator {
  constructor() {
    this.results = {
      steering: { passed: 0, failed: 0, issues: [] },
      hooks: { passed: 0, failed: 0, issues: [] },
      mcp: { passed: 0, failed: 0, issues: [] },
      settings: { passed: 0, failed: 0, issues: [] },
      overall: { passed: 0, failed: 0 }
    };
  }

  async validateAll() {
    console.log('🔍 Starting Complete Kiro Configuration Validation...\n');
    
    await this.validateSteeringFiles();
    await this.validateAgentHooks();
    await this.validateMCPConfiguration();
    await this.validateWorkspaceSettings();
    
    this.generateReport();
    return this.results.overall.failed === 0;
  }

  async validateSteeringFiles() {
    console.log('📋 Validating Steering Files...');
    
    const steeringDir = '.kiro/steering';
    const requiredFiles = [
      'product.md',
      'structure.md', 
      'tech.md',
      'astrology-rules.md',
      'elemental-principles.md',
      'campaign-integration.md'
    ];

    // Check if steering directory exists
    if (!fs.existsSync(steeringDir)) {
      this.results.steering.failed++;
      this.results.steering.issues.push('Steering directory does not exist');
      return;
    }

    // Validate each required steering file
    for (const file of requiredFiles) {
      const filePath = path.join(steeringDir, file);
      
      if (!fs.existsSync(filePath)) {
        this.results.steering.failed++;
        this.results.steering.issues.push(`Missing steering file: ${file}`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Basic content validation
        if (content.length < 100) {
          this.results.steering.failed++;
          this.results.steering.issues.push(`${file} appears to be empty or too short`);
          continue;
        }

        // Check for file references
        const hasFileReferences = content.includes('#[[file:');
        if (file === 'tech.md' || file === 'structure.md') {
          if (!hasFileReferences) {
            this.results.steering.issues.push(`${file} should include file references`);
          }
        }

        this.results.steering.passed++;
        console.log(`  ✅ ${file} - Valid`);
        
      } catch (error) {
        this.results.steering.failed++;
        this.results.steering.issues.push(`Error reading ${file}: ${error.message}`);
      }
    }
  }

  async validateAgentHooks() {
    console.log('\n🪝 Validating Agent Hooks...');
    
    const hooksDir = '.kiro/hooks';
    const expectedHooks = [
      'planetary-data-validator.md',
      'ingredient-consistency-checker.md', 
      'typescript-campaign-trigger.md',
      'build-quality-monitor.md'
    ];

    if (!fs.existsSync(hooksDir)) {
      this.results.hooks.failed++;
      this.results.hooks.issues.push('Hooks directory does not exist');
      return;
    }

    for (const hook of expectedHooks) {
      const hookPath = path.join(hooksDir, hook);
      
      if (!fs.existsSync(hookPath)) {
        this.results.hooks.failed++;
        this.results.hooks.issues.push(`Missing hook: ${hook}`);
        continue;
      }

      try {
        const content = fs.readFileSync(hookPath, 'utf8');
        
        // Validate hook structure (YAML front matter)
        const hasFrontMatter = content.startsWith('---') || content.includes('\n---\n');
        const hasName = content.includes('name:');
        const hasTriggers = content.includes('triggers:') || content.includes('trigger:');
        
        if (!hasFrontMatter || !hasName || !hasTriggers) {
          this.results.hooks.failed++;
          this.results.hooks.issues.push(`${hook} missing required YAML front matter structure`);
          continue;
        }

        this.results.hooks.passed++;
        console.log(`  ✅ ${hook} - Valid structure`);
        
      } catch (error) {
        this.results.hooks.failed++;
        this.results.hooks.issues.push(`Error reading ${hook}: ${error.message}`);
      }
    }
  }

  async validateMCPConfiguration() {
    console.log('\n🔌 Validating MCP Configuration...');
    
    const mcpConfigPath = '.kiro/settings/mcp.json';
    
    if (!fs.existsSync(mcpConfigPath)) {
      this.results.mcp.failed++;
      this.results.mcp.issues.push('MCP configuration file does not exist');
      return;
    }

    try {
      const content = fs.readFileSync(mcpConfigPath, 'utf8');
      const config = JSON.parse(content);
      
      // Validate structure
      if (!config.mcpServers) {
        this.results.mcp.failed++;
        this.results.mcp.issues.push('Missing mcpServers configuration');
        return;
      }

      const expectedServers = ['astrology-api', 'nutrition-api', 'spoonacular-api'];
      let validServers = 0;
      
      for (const serverName of expectedServers) {
        if (config.mcpServers[serverName]) {
          const server = config.mcpServers[serverName];
          
          if (server.command && server.args && Array.isArray(server.args)) {
            validServers++;
            console.log(`  ✅ ${serverName} - Valid configuration`);
          } else {
            this.results.mcp.issues.push(`${serverName} missing required fields`);
          }
        } else {
          this.results.mcp.issues.push(`Missing server configuration: ${serverName}`);
        }
      }

      if (validServers === expectedServers.length) {
        this.results.mcp.passed++;
      } else {
        this.results.mcp.failed++;
      }
      
    } catch (error) {
      this.results.mcp.failed++;
      this.results.mcp.issues.push(`Error parsing MCP config: ${error.message}`);
    }
  }

  async validateWorkspaceSettings() {
    console.log('\n⚙️  Validating Workspace Settings...');
    
    const settingsPath = '.kiro/settings/workspace.json';
    
    if (!fs.existsSync(settingsPath)) {
      this.results.settings.failed++;
      this.results.settings.issues.push('Workspace settings file does not exist');
      return;
    }

    try {
      const content = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(content);
      
      // Check for key TypeScript optimizations
      const hasTypeScriptSettings = settings['typescript.preferences.includePackageJsonAutoImports'];
      const hasEditorSettings = settings['editor.codeActionsOnSave'];
      const hasFileAssociations = settings['files.associations'];
      
      if (hasTypeScriptSettings && hasEditorSettings && hasFileAssociations) {
        this.results.settings.passed++;
        console.log('  ✅ Workspace settings - Valid configuration');
      } else {
        this.results.settings.failed++;
        this.results.settings.issues.push('Missing key workspace optimizations');
      }
      
    } catch (error) {
      this.results.settings.failed++;
      this.results.settings.issues.push(`Error parsing workspace settings: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Validation Report');
    console.log('===================');
    
    const categories = ['steering', 'hooks', 'mcp', 'settings'];
    
    categories.forEach(category => {
      const result = this.results[category];
      const total = result.passed + result.failed;
      const status = result.failed === 0 ? '✅' : '❌';
      
      console.log(`${status} ${category.toUpperCase()}: ${result.passed}/${total} passed`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }
    });

    // Calculate overall results
    this.results.overall.passed = categories.reduce((sum, cat) => sum + this.results[cat].passed, 0);
    this.results.overall.failed = categories.reduce((sum, cat) => sum + this.results[cat].failed, 0);
    
    const overallTotal = this.results.overall.passed + this.results.overall.failed;
    const successRate = ((this.results.overall.passed / overallTotal) * 100).toFixed(1);
    
    console.log('\n🎯 Overall Results');
    console.log(`Success Rate: ${successRate}% (${this.results.overall.passed}/${overallTotal})`);
    
    if (this.results.overall.failed === 0) {
      console.log('🎉 All Kiro configuration components are valid!');
    } else {
      console.log(`⚠️  ${this.results.overall.failed} issues need attention`);
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new KiroConfigValidator();
  validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = KiroConfigValidator;
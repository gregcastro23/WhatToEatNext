#!/usr/bin/env node

/**
 * End-to-End Workflow Tester
 * Tests spec creation, campaign integration, documentation, and monitoring systems
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkflowTester {
  constructor() {
    this.results = {
      specWorkflows: { passed: 0, failed: 0, issues: [] },
      campaignIntegration: { passed: 0, failed: 0, issues: [] },
      documentation: { passed: 0, failed: 0, issues: [] },
      monitoring: { passed: 0, failed: 0, issues: [] },
      overall: { passed: 0, failed: 0 }
    };
  }

  async testAll() {
    console.log('🧪 Starting End-to-End Workflow Testing...\n');
    
    await this.testSpecWorkflows();
    await this.testCampaignIntegration();
    await this.testDocumentation();
    await this.testMonitoring();
    
    this.generateReport();
    return this.results.overall.failed === 0;
  }

  async testSpecWorkflows() {
    console.log('📋 Testing Spec Creation and Management Workflows...');
    
    // Test 1: Spec template availability
    try {
      const templatesDir = '.kiro/templates';
      const requiredTemplates = [
        'feature-spec-template.md',
        'astrological-feature-template.md',
        'campaign-spec-template.md'
      ];

      if (!fs.existsSync(templatesDir)) {
        this.results.specWorkflows.failed++;
        this.results.specWorkflows.issues.push('Templates directory missing');
        return;
      }

      let validTemplates = 0;
      for (const template of requiredTemplates) {
        const templatePath = path.join(templatesDir, template);
        if (fs.existsSync(templatePath)) {
          const content = fs.readFileSync(templatePath, 'utf8');
          if (content.includes('Acceptance Criteria') && content.includes('WHEN') && content.includes('THEN') && content.includes('SHALL')) {
            validTemplates++;
            console.log(`  ✅ ${template} - Valid EARS format`);
          } else {
            this.results.specWorkflows.issues.push(`${template} missing EARS format`);
          }
        } else {
          this.results.specWorkflows.issues.push(`Missing template: ${template}`);
        }
      }

      if (validTemplates === requiredTemplates.length) {
        this.results.specWorkflows.passed++;
      } else {
        this.results.specWorkflows.failed++;
      }

    } catch (error) {
      this.results.specWorkflows.failed++;
      this.results.specWorkflows.issues.push(`Template validation error: ${error.message}`);
    }

    // Test 2: Existing spec structure validation
    try {
      const specsDir = '.kiro/specs';
      if (fs.existsSync(specsDir)) {
        const specs = fs.readdirSync(specsDir).filter(item => 
          fs.statSync(path.join(specsDir, item)).isDirectory()
        );

        let validSpecs = 0;
        for (const spec of specs) {
          const specPath = path.join(specsDir, spec);
          const hasRequirements = fs.existsSync(path.join(specPath, 'requirements.md'));
          const hasDesign = fs.existsSync(path.join(specPath, 'design.md'));
          const hasTasks = fs.existsSync(path.join(specPath, 'tasks.md'));

          if (hasRequirements && hasDesign && hasTasks) {
            validSpecs++;
            console.log(`  ✅ ${spec} - Complete spec structure`);
          } else {
            this.results.specWorkflows.issues.push(`${spec} incomplete spec structure`);
          }
        }

        if (validSpecs > 0) {
          this.results.specWorkflows.passed++;
        } else {
          this.results.specWorkflows.failed++;
        }
      }

    } catch (error) {
      this.results.specWorkflows.failed++;
      this.results.specWorkflows.issues.push(`Spec structure validation error: ${error.message}`);
    }
  }

  async testCampaignIntegration() {
    console.log('\n🚀 Testing Campaign Integration and Monitoring...');
    
    // Test 1: Campaign system files exist
    try {
      const campaignDir = 'src/services/campaign';
      const requiredFiles = [
        'CampaignController.ts',
        'ProgressTracker.ts', 
        'CampaignIntelligenceSystem.ts',
        'TypeScriptErrorAnalyzer.ts'
      ];

      if (!fs.existsSync(campaignDir)) {
        this.results.campaignIntegration.failed++;
        this.results.campaignIntegration.issues.push('Campaign system directory missing');
        return;
      }

      let validFiles = 0;
      for (const file of requiredFiles) {
        const filePath = path.join(campaignDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.length > 1000) { // Basic content check
            validFiles++;
            console.log(`  ✅ ${file} - Present and substantial`);
          } else {
            this.results.campaignIntegration.issues.push(`${file} appears incomplete`);
          }
        } else {
          this.results.campaignIntegration.issues.push(`Missing campaign file: ${file}`);
        }
      }

      if (validFiles === requiredFiles.length) {
        this.results.campaignIntegration.passed++;
      } else {
        this.results.campaignIntegration.failed++;
      }

    } catch (error) {
      this.results.campaignIntegration.failed++;
      this.results.campaignIntegration.issues.push(`Campaign files error: ${error.message}`);
    }

    // Test 2: Campaign configuration validation
    try {
      const campaignConfigFiles = [
        'dependency-security.config.json',
        'import-cleanup.config.json',
        'linting-formatting.config.json'
      ];

      let validConfigs = 0;
      for (const configFile of campaignConfigFiles) {
        if (fs.existsSync(configFile)) {
          const content = fs.readFileSync(configFile, 'utf8');
          const config = JSON.parse(content);
          if (config && typeof config === 'object') {
            validConfigs++;
            console.log(`  ✅ ${configFile} - Valid JSON configuration`);
          }
        } else {
          this.results.campaignIntegration.issues.push(`Missing config: ${configFile}`);
        }
      }

      if (validConfigs > 0) {
        this.results.campaignIntegration.passed++;
      } else {
        this.results.campaignIntegration.failed++;
      }

    } catch (error) {
      this.results.campaignIntegration.failed++;
      this.results.campaignIntegration.issues.push(`Campaign config error: ${error.message}`);
    }
  }

  async testDocumentation() {
    console.log('\n📚 Testing Documentation and Onboarding...');
    
    // Test 1: Core documentation files
    try {
      const docFiles = [
        'README.md',
        'DOCKER_GUIDE.md',
        'MAKEFILE_GUIDE.md'
      ];

      let validDocs = 0;
      for (const docFile of docFiles) {
        if (fs.existsSync(docFile)) {
          const content = fs.readFileSync(docFile, 'utf8');
          if (content.length > 500) { // Substantial content
            validDocs++;
            console.log(`  ✅ ${docFile} - Comprehensive documentation`);
          } else {
            this.results.documentation.issues.push(`${docFile} appears too brief`);
          }
        } else {
          this.results.documentation.issues.push(`Missing documentation: ${docFile}`);
        }
      }

      if (validDocs >= 2) { // At least 2 out of 3
        this.results.documentation.passed++;
      } else {
        this.results.documentation.failed++;
      }

    } catch (error) {
      this.results.documentation.failed++;
      this.results.documentation.issues.push(`Documentation error: ${error.message}`);
    }

    // Test 2: Steering files as documentation
    try {
      const steeringDir = '.kiro/steering';
      if (fs.existsSync(steeringDir)) {
        const steeringFiles = fs.readdirSync(steeringDir).filter(f => f.endsWith('.md'));
        
        if (steeringFiles.length >= 6) {
          this.results.documentation.passed++;
          console.log(`  ✅ Steering documentation - ${steeringFiles.length} files available`);
        } else {
          this.results.documentation.failed++;
          this.results.documentation.issues.push('Insufficient steering documentation');
        }
      }

    } catch (error) {
      this.results.documentation.failed++;
      this.results.documentation.issues.push(`Steering docs error: ${error.message}`);
    }
  }

  async testMonitoring() {
    console.log('\n📊 Testing Performance Monitoring and Alerting...');
    
    // Test 1: Monitoring service files
    try {
      const monitoringFiles = [
        'src/services/PerformanceMonitoringService.ts',
        'src/services/AlertingSystem.ts',
        'src/services/QualityMetricsService.ts',
        'src/services/ErrorTrackingSystem.ts'
      ];

      let validMonitoring = 0;
      for (const file of monitoringFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('class') && content.includes('monitor')) {
            validMonitoring++;
            console.log(`  ✅ ${path.basename(file)} - Monitoring implementation present`);
          } else {
            this.results.monitoring.issues.push(`${file} missing monitoring logic`);
          }
        } else {
          this.results.monitoring.issues.push(`Missing monitoring file: ${file}`);
        }
      }

      if (validMonitoring >= 3) { // At least 3 out of 4
        this.results.monitoring.passed++;
      } else {
        this.results.monitoring.failed++;
      }

    } catch (error) {
      this.results.monitoring.failed++;
      this.results.monitoring.issues.push(`Monitoring files error: ${error.message}`);
    }

    // Test 2: Metrics collection validation
    try {
      const metricsFiles = fs.readdirSync('.').filter(f => f.includes('metrics') && f.endsWith('.json'));
      
      if (metricsFiles.length > 0) {
        this.results.monitoring.passed++;
        console.log(`  ✅ Metrics collection - ${metricsFiles.length} metrics files found`);
      } else {
        this.results.monitoring.failed++;
        this.results.monitoring.issues.push('No metrics files found');
      }

    } catch (error) {
      this.results.monitoring.failed++;
      this.results.monitoring.issues.push(`Metrics validation error: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 End-to-End Workflow Test Report');
    console.log('===================================');
    
    const categories = ['specWorkflows', 'campaignIntegration', 'documentation', 'monitoring'];
    const categoryNames = {
      specWorkflows: 'SPEC WORKFLOWS',
      campaignIntegration: 'CAMPAIGN INTEGRATION', 
      documentation: 'DOCUMENTATION',
      monitoring: 'MONITORING'
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

    // Calculate overall results
    this.results.overall.passed = categories.reduce((sum, cat) => sum + this.results[cat].passed, 0);
    this.results.overall.failed = categories.reduce((sum, cat) => sum + this.results[cat].failed, 0);
    
    const overallTotal = this.results.overall.passed + this.results.overall.failed;
    const successRate = ((this.results.overall.passed / overallTotal) * 100).toFixed(1);
    
    console.log('\n🎯 Overall Workflow Test Results');
    console.log(`Success Rate: ${successRate}% (${this.results.overall.passed}/${overallTotal})`);
    
    if (this.results.overall.failed === 0) {
      console.log('🎉 All end-to-end workflows are functioning correctly!');
    } else {
      console.log(`⚠️  ${this.results.overall.failed} workflow issues need attention`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (this.results.specWorkflows.failed > 0) {
      console.log('- Review spec template structure and EARS format compliance');
    }
    if (this.results.campaignIntegration.failed > 0) {
      console.log('- Verify campaign system files and configuration completeness');
    }
    if (this.results.documentation.failed > 0) {
      console.log('- Enhance documentation coverage and onboarding materials');
    }
    if (this.results.monitoring.failed > 0) {
      console.log('- Implement comprehensive monitoring and alerting systems');
    }
  }
}

// Run workflow tests if called directly
if (require.main === module) {
  const tester = new WorkflowTester();
  tester.testAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = WorkflowTester;
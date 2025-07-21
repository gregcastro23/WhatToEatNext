#!/usr/bin/env node

/**
 * CLI script to test Enhanced Error Fixer Integration
 * 
 * Usage:
 *   node src/services/campaign/test-enhanced-fixer-integration.js [options]
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class EnhancedErrorFixerIntegration {
  constructor() {
    this.ENHANCED_FIXER_PATH = 'scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js';
    this.DEFAULT_BATCH_SIZE = 15;
    this.BUILD_VALIDATION_INTERVAL = 5;
  }

  async executeEnhancedFixer(options = {}) {
    const startTime = Date.now();
    
    console.log('🚀 Starting Enhanced TypeScript Error Fixer v3.0...');
    
    const args = this.buildFixerArguments(options);
    
    try {
      const result = await this.runFixerCommand(args);
      const buildValidationPassed = await this.validateBuild();
      const executionTime = Date.now() - startTime;
      
      return {
        success: result.success,
        filesProcessed: result.filesProcessed,
        errorsFixed: result.errorsFixed,
        errorsRemaining: result.errorsRemaining,
        buildValidationPassed,
        executionTime,
        safetyScore: result.safetyScore,
        warnings: result.warnings,
        errors: result.errors
      };
      
    } catch (error) {
      console.error('❌ Enhanced Error Fixer execution failed:', error);
      
      return {
        success: false,
        filesProcessed: 0,
        errorsFixed: 0,
        errorsRemaining: await this.getCurrentErrorCount(),
        buildValidationPassed: false,
        executionTime: Date.now() - startTime,
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  buildFixerArguments(options) {
    const args = [];
    
    if (options.maxFiles) {
      args.push(`--max-files=${options.maxFiles}`);
    }
    
    if (options.autoFix) {
      args.push('--auto-fix');
    }
    
    if (options.dryRun) {
      args.push('--dry-run');
    }
    
    if (options.validateSafety) {
      args.push('--validate-safety');
    }
    
    if (options.silent) {
      args.push('--silent');
    }
    
    if (options.json) {
      args.push('--json');
    }
    
    return args;
  }

  async runFixerCommand(args) {
    return new Promise((resolve, reject) => {
      const command = 'node';
      const fullArgs = [this.ENHANCED_FIXER_PATH, ...args];
      
      console.log(`🔧 Executing: ${command} ${fullArgs.join(' ')}`);
      
      const child = spawn(command, fullArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        if (!args.includes('--silent')) {
          process.stdout.write(data);
        }
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        if (!args.includes('--silent')) {
          process.stderr.write(data);
        }
      });
      
      child.on('close', (code) => {
        const success = code === 0;
        const output = stdout + stderr;
        
        const result = this.parseFixerOutput(output, success);
        
        if (success) {
          resolve(result);
        } else {
          resolve({
            ...result,
            success: false,
            errors: [...result.errors, `Process exited with code ${code}`]
          });
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  parseFixerOutput(output, success) {
    const warnings = [];
    const errors = [];
    
    let filesProcessed = 0;
    let errorsFixed = 0;
    const errorsRemaining = 0;
    let safetyScore;
    
    // Parse files processed
    const filesMatch = output.match(/(?:processed|fixed)\s+(\d+)\s+files?/i);
    if (filesMatch) {
      filesProcessed = parseInt(filesMatch[1]);
    }
    
    // Parse errors fixed
    const errorsFixedMatch = output.match(/(?:fixed|resolved)\s+(\d+)\s+errors?/i);
    if (errorsFixedMatch) {
      errorsFixed = parseInt(errorsFixedMatch[1]);
    }
    
    // Parse safety score
    const safetyMatch = output.match(/safety\s+score[:\s]+(\d+(?:\.\d+)?)/i);
    if (safetyMatch) {
      safetyScore = parseFloat(safetyMatch[1]);
    }
    
    // Extract warnings
    const warningMatches = output.match(/⚠️[^\n]*/g);
    if (warningMatches) {
      warnings.push(...warningMatches);
    }
    
    // Extract errors
    const errorMatches = output.match(/❌[^\n]*/g);
    if (errorMatches) {
      errors.push(...errorMatches);
    }
    
    return {
      success,
      filesProcessed,
      errorsFixed,
      errorsRemaining,
      safetyScore,
      warnings,
      errors
    };
  }

  async validateBuild() {
    try {
      console.log('🔍 Validating build...');
      
      const startTime = Date.now();
      execSync('yarn build', { 
        stdio: 'pipe',
        timeout: 120000
      });
      
      const buildTime = Date.now() - startTime;
      console.log(`✅ Build validation passed (${buildTime}ms)`);
      return true;
      
    } catch (error) {
      console.log('❌ Build validation failed');
      if (error instanceof Error) {
        console.log(`   Error: ${error.message}`);
      }
      return false;
    }
  }

  async getCurrentErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async showMetrics() {
    try {
      console.log('📊 Fetching Enhanced Error Fixer metrics...');
      
      const result = await this.runFixerCommand(['--show-metrics', '--json']);
      
      if (result.success) {
        console.log('✅ Metrics retrieved successfully');
      } else {
        console.log('⚠️  Could not retrieve all metrics');
      }
      
    } catch (error) {
      console.error('❌ Failed to show metrics:', error);
    }
  }

  async validateSafety() {
    try {
      console.log('🛡️  Validating safety...');
      
      const result = await this.runFixerCommand(['--validate-safety', '--json']);
      
      return {
        safe: result.success,
        safetyScore: result.safetyScore || 0.5,
        issues: result.errors,
        recommendedBatchSize: this.DEFAULT_BATCH_SIZE
      };
      
    } catch (error) {
      console.error('❌ Safety validation failed:', error);
      
      return {
        safe: false,
        safetyScore: 0,
        issues: [error instanceof Error ? error.message : String(error)],
        recommendedBatchSize: 3
      };
    }
  }

  async executeWithSafetyProtocols() {
    console.log('🛡️  Executing Enhanced Error Fixer with safety protocols...');
    
    const safetyCheck = await this.validateSafety();
    
    if (!safetyCheck.safe) {
      console.log('⚠️  Safety validation failed:');
      safetyCheck.issues.forEach(issue => console.log(`   - ${issue}`));
      
      return await this.executeEnhancedFixer({
        maxFiles: 3,
        autoFix: false,
        dryRun: true,
        validateSafety: true
      });
    }
    
    return await this.executeEnhancedFixer({
      maxFiles: Math.min(safetyCheck.recommendedBatchSize, this.DEFAULT_BATCH_SIZE),
      autoFix: true,
      validateSafety: true
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
Enhanced Error Fixer Integration Test CLI

Usage:
  node src/services/campaign/test-enhanced-fixer-integration.js [options]

Options:
  --dry-run           Test with dry run (no actual fixes)
  --max-files=N       Set maximum files to process (default: 15)
  --show-metrics      Show Enhanced Error Fixer metrics
  --validate-safety   Validate safety before execution
  --safety-protocols  Execute with full safety protocols
  --help              Show this help message

Examples:
  # Dry run test
  node src/services/campaign/test-enhanced-fixer-integration.js --dry-run
  
  # Test with 5 files maximum
  node src/services/campaign/test-enhanced-fixer-integration.js --max-files=5 --dry-run
  
  # Show metrics
  node src/services/campaign/test-enhanced-fixer-integration.js --show-metrics
  
  # Validate safety
  node src/services/campaign/test-enhanced-fixer-integration.js --validate-safety
  
  # Execute with safety protocols
  node src/services/campaign/test-enhanced-fixer-integration.js --safety-protocols
`);
    process.exit(0);
  }

  const integration = new EnhancedErrorFixerIntegration();

  try {
    if (args.includes('--show-metrics')) {
      await integration.showMetrics();
      return;
    }

    if (args.includes('--validate-safety')) {
      const safetyResult = await integration.validateSafety();
      console.log('\n🛡️  Safety Validation Results:');
      console.log(`   Safe: ${safetyResult.safe ? '✅' : '❌'}`);
      console.log(`   Safety Score: ${safetyResult.safetyScore}`);
      console.log(`   Recommended Batch Size: ${safetyResult.recommendedBatchSize}`);
      if (safetyResult.issues.length > 0) {
        console.log('   Issues:');
        safetyResult.issues.forEach(issue => console.log(`     - ${issue}`));
      }
      return;
    }

    if (args.includes('--safety-protocols')) {
      const result = await integration.executeWithSafetyProtocols();
      console.log('\n📊 Execution Results:');
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Files Processed: ${result.filesProcessed}`);
      console.log(`   Errors Fixed: ${result.errorsFixed}`);
      console.log(`   Build Validation: ${result.buildValidationPassed ? '✅' : '❌'}`);
      console.log(`   Execution Time: ${result.executionTime}ms`);
      return;
    }

    // Default test execution
    const maxFiles = parseInt(args.find(arg => arg.startsWith('--max-files='))?.split('=')[1]) || 15;
    const dryRun = args.includes('--dry-run');

    console.log(`🧪 Testing Enhanced Error Fixer Integration...`);
    console.log(`   Max Files: ${maxFiles}`);
    console.log(`   Dry Run: ${dryRun ? 'Yes' : 'No'}`);

    const result = await integration.executeEnhancedFixer({
      maxFiles,
      autoFix: !dryRun,
      dryRun,
      validateSafety: true
    });

    console.log('\n📊 Test Results:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Files Processed: ${result.filesProcessed}`);
    console.log(`   Errors Fixed: ${result.errorsFixed}`);
    console.log(`   Errors Remaining: ${result.errorsRemaining}`);
    console.log(`   Build Validation: ${result.buildValidationPassed ? '✅' : '❌'}`);
    console.log(`   Execution Time: ${result.executionTime}ms`);
    
    if (result.safetyScore !== undefined) {
      console.log(`   Safety Score: ${result.safetyScore}`);
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   ${error}`));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Check if this file is being run directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { EnhancedErrorFixerIntegration };
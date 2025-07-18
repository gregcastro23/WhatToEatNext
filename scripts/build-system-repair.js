#!/usr/bin/env node

/**
 * Build System Repair CLI Utility
 * Provides command-line access to build system repair functionality
 */

import { buildSystemRepair } from '../src/utils/buildSystemRepair.js';
import { buildValidator } from '../src/utils/BuildValidator.js';

const commands = {
  validate: async () => {
    console.log('🔍 Validating build system...');
    const result = await buildValidator.validateBuild();
    
    if (result.isValid) {
      console.log('✅ Build system is valid');
    } else {
      console.log('❌ Build system has issues:');
      console.log(`  Missing files: ${result.missingFiles.length}`);
      console.log(`  Corrupted files: ${result.corruptedFiles.length}`);
      
      if (result.missingFiles.length > 0) {
        console.log('\n📁 Missing files:');
        result.missingFiles.forEach(file => console.log(`  - ${file}`));
      }
      
      if (result.corruptedFiles.length > 0) {
        console.log('\n🔧 Corrupted files:');
        result.corruptedFiles.forEach(file => console.log(`  - ${file}`));
      }
    }
  },

  repair: async () => {
    console.log('🔧 Repairing build system...');
    await buildValidator.repairBuild();
    console.log('✅ Build repair completed');
  },

  rebuild: async () => {
    console.log('🏗️  Rebuilding with recovery...');
    const success = await buildValidator.rebuildWithRecovery(3);
    
    if (success) {
      console.log('✅ Rebuild successful');
    } else {
      console.log('❌ Rebuild failed after multiple attempts');
      process.exit(1);
    }
  },

  comprehensive: async () => {
    console.log('🚀 Starting comprehensive build system repair...');
    const result = await buildSystemRepair.performComprehensiveRepair();
    
    console.log('\n📋 Repair Steps:');
    result.steps.forEach(step => console.log(`  ${step}`));
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    if (result.success) {
      console.log('\n✅ Comprehensive repair completed successfully');
    } else {
      console.log('\n❌ Comprehensive repair encountered issues');
      process.exit(1);
    }
  },

  quick: async () => {
    console.log('⚡ Performing quick repair...');
    const success = await buildSystemRepair.quickRepair();
    
    if (success) {
      console.log('✅ Quick repair successful');
    } else {
      console.log('❌ Quick repair failed');
      process.exit(1);
    }
  },

  health: async () => {
    console.log('🏥 Checking build system health...');
    const health = await buildValidator.monitorBuildHealth();
    
    console.log(`\n📊 Health Report (${health.timestamp.toISOString()}):`);
    console.log(`  Build exists: ${health.buildExists ? '✅' : '❌'}`);
    console.log(`  Manifests valid: ${health.manifestsValid ? '✅' : '❌'}`);
    console.log(`  Build size: ${(health.buildSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Last build: ${health.lastBuildTime ? health.lastBuildTime.toISOString() : 'Unknown'}`);
    
    if (health.issues.length > 0) {
      console.log('\n⚠️  Issues:');
      health.issues.forEach(issue => console.log(`  - ${issue}`));
    }
  },

  report: async () => {
    console.log('📊 Generating build system report...');
    const report = await buildSystemRepair.generateBuildReport();
    
    console.log(`\n📋 Build System Report (${report.timestamp.toISOString()}):`);
    
    console.log('\n🔍 Validation:');
    console.log(`  Valid: ${report.validation.isValid ? '✅' : '❌'}`);
    console.log(`  Missing files: ${report.validation.missingFiles.length}`);
    console.log(`  Corrupted files: ${report.validation.corruptedFiles.length}`);
    
    console.log('\n🏥 Health:');
    console.log(`  Build exists: ${report.health.buildExists ? '✅' : '❌'}`);
    console.log(`  Manifests valid: ${report.health.manifestsValid ? '✅' : '❌'}`);
    console.log(`  Build size: ${(report.health.buildSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
  },

  emergency: async () => {
    console.log('🚨 Starting emergency recovery...');
    console.log('⚠️  This will clean the build directory and reinstall dependencies if needed');
    
    const success = await buildSystemRepair.emergencyRecovery();
    
    if (success) {
      console.log('✅ Emergency recovery successful');
    } else {
      console.log('❌ Emergency recovery failed');
      process.exit(1);
    }
  },

  help: () => {
    console.log(`
🔧 Build System Repair CLI

Usage: node scripts/build-system-repair.js <command>

Commands:
  validate      - Validate build system and check for issues
  repair        - Repair missing or corrupted manifest files
  rebuild       - Rebuild application with error recovery
  comprehensive - Perform comprehensive build system repair
  quick         - Perform quick repair for common issues
  health        - Check build system health status
  report        - Generate detailed build system report
  emergency     - Emergency recovery (cleans build and reinstalls)
  help          - Show this help message

Examples:
  node scripts/build-system-repair.js validate
  node scripts/build-system-repair.js comprehensive
  node scripts/build-system-repair.js health
`);
  }
};

// Main execution
async function main() {
  const command = process.argv[2];
  
  if (!command || !commands[command]) {
    console.log('❌ Invalid or missing command');
    commands.help();
    process.exit(1);
  }
  
  try {
    await commands[command]();
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { commands };
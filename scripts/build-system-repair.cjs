#!/usr/bin/env node

/**
 * Build System Repair CLI Utility (CommonJS version)
 * Provides command-line access to build system repair functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Simple BuildValidator implementation for CLI use
 */
class SimpleBuildValidator {
  constructor(buildDir = '.next') {
    this.buildDir = buildDir;
    this.serverDir = path.join(buildDir, 'server');
    this.requiredManifests = [
      'pages-manifest.json',
      'app-paths-manifest.json',
      'next-font-manifest.json',
      'middleware-manifest.json'
    ];
  }

  async validateBuild() {
    const result = {
      isValid: true,
      missingFiles: [],
      corruptedFiles: [],
      repairActions: []
    };

    try {
      // Check if build directory exists
      if (!fs.existsSync(this.buildDir)) {
        result.isValid = false;
        result.missingFiles.push(this.buildDir);
        result.repairActions.push({
          type: 'create',
          target: this.buildDir,
          description: 'Create build directory'
        });
        return result;
      }

      // Check if server directory exists
      if (!fs.existsSync(this.serverDir)) {
        result.isValid = false;
        result.missingFiles.push(this.serverDir);
        result.repairActions.push({
          type: 'create',
          target: this.serverDir,
          description: 'Create server directory'
        });
      }

      // Check required manifest files
      for (const manifest of this.requiredManifests) {
        const manifestPath = path.join(this.serverDir, manifest);
        
        if (!fs.existsSync(manifestPath)) {
          result.isValid = false;
          result.missingFiles.push(manifestPath);
          result.repairActions.push({
            type: 'create',
            target: manifestPath,
            description: `Create missing manifest file: ${manifest}`
          });
        } else {
          // Check if file is corrupted (empty or invalid JSON)
          try {
            const content = fs.readFileSync(manifestPath, 'utf8');
            if (content.trim() === '') {
              result.corruptedFiles.push(manifestPath);
              result.repairActions.push({
                type: 'fix',
                target: manifestPath,
                description: `Fix empty manifest file: ${manifest}`
              });
            } else if (manifest.endsWith('.json')) {
              JSON.parse(content); // Validate JSON
            }
          } catch (error) {
            result.isValid = false;
            result.corruptedFiles.push(manifestPath);
            result.repairActions.push({
              type: 'fix',
              target: manifestPath,
              description: `Fix corrupted manifest file: ${manifest}`
            });
          }
        }
      }

      // Check for essential build files
      const essentialFiles = [
        'build-manifest.json',
        'app-build-manifest.json',
        'react-loadable-manifest.json'
      ];

      for (const file of essentialFiles) {
        const filePath = path.join(this.buildDir, file);
        if (!fs.existsSync(filePath)) {
          result.isValid = false;
          result.missingFiles.push(filePath);
          result.repairActions.push({
            type: 'create',
            target: filePath,
            description: `Create missing build file: ${file}`
          });
        }
      }

    } catch (error) {
      console.error('Build validation failed:', error);
      result.isValid = false;
    }

    return result;
  }

  async repairBuild() {
    const validation = await this.validateBuild();
    
    if (validation.isValid) {
      console.log('Build is valid, no repairs needed');
      return;
    }

    console.log(`Starting build repair. ${validation.repairActions.length} actions to perform.`);

    // Create directories if needed
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
      console.log(`Created build directory: ${this.buildDir}`);
    }

    if (!fs.existsSync(this.serverDir)) {
      fs.mkdirSync(this.serverDir, { recursive: true });
      console.log(`Created server directory: ${this.serverDir}`);
    }

    // Create missing manifest files with minimal content
    const manifestDefaults = this.getManifestDefaults();

    for (const action of validation.repairActions) {
      if (action.type === 'create' || action.type === 'fix') {
        const filename = path.basename(action.target);
        
        if (manifestDefaults[filename]) {
          fs.writeFileSync(action.target, JSON.stringify(manifestDefaults[filename], null, 2));
          console.log(`${action.type === 'create' ? 'Created' : 'Fixed'} ${filename}`);
        }
      }
    }

    console.log('Build repair completed');
  }

  getManifestDefaults() {
    return {
      'pages-manifest.json': {},
      'app-paths-manifest.json': {},
      'next-font-manifest.json': {
        pages: {},
        app: {},
        appUsingSizeAdjust: false,
        pagesUsingSizeAdjust: false
      },
      'middleware-manifest.json': {
        sortedMiddleware: [],
        middleware: {},
        functions: {},
        version: 2
      },
      'build-manifest.json': {
        devFiles: [],
        ampDevFiles: [],
        polyfillFiles: [],
        lowPriorityFiles: [],
        rootMainFiles: [],
        pages: {},
        ampFirstPages: []
      },
      'app-build-manifest.json': {
        pages: {}
      },
      'react-loadable-manifest.json': {}
    };
  }

  async rebuildWithRecovery(maxRetries = 3) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      attempt++;
      console.log(`Build attempt ${attempt}/${maxRetries}`);
      
      try {
        // Clean build directory before retry
        if (attempt > 1) {
          await this.cleanBuild();
          await this.repairBuild();
        }

        // Attempt build
        execSync('yarn build', { 
          stdio: 'inherit',
          timeout: 300000 // 5 minute timeout
        });
        
        // Validate build after completion
        const validation = await this.validateBuild();
        if (validation.isValid) {
          console.log(`Build successful on attempt ${attempt}`);
          return true;
        } else {
          console.log(`Build completed but validation failed on attempt ${attempt}`);
          await this.repairBuild();
        }
        
      } catch (error) {
        console.log(`Build failed on attempt ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying build in 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    console.log(`Build failed after ${maxRetries} attempts`);
    return false;
  }

  async cleanBuild() {
    try {
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
        console.log('Build directory cleaned');
      }
    } catch (error) {
      console.log('Error cleaning build directory:', error);
    }
  }

  async monitorBuildHealth() {
    const report = {
      timestamp: new Date(),
      buildExists: fs.existsSync(this.buildDir),
      manifestsValid: false,
      buildSize: 0,
      lastBuildTime: null,
      issues: []
    };

    try {
      if (report.buildExists) {
        // Calculate build size
        report.buildSize = this.calculateDirectorySize(this.buildDir);
        
        // Check manifest validity
        const validation = await this.validateBuild();
        report.manifestsValid = validation.isValid;
        
        if (!validation.isValid) {
          report.issues.push(...validation.missingFiles.map(file => `Missing: ${file}`));
          report.issues.push(...validation.corruptedFiles.map(file => `Corrupted: ${file}`));
        }

        // Get last build time
        const buildManifestPath = path.join(this.buildDir, 'build-manifest.json');
        if (fs.existsSync(buildManifestPath)) {
          const stats = fs.statSync(buildManifestPath);
          report.lastBuildTime = stats.mtime;
        }
      } else {
        report.issues.push('Build directory does not exist');
      }

    } catch (error) {
      report.issues.push(`Health check error: ${error}`);
    }

    return report;
  }

  calculateDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          size += this.calculateDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible files
    }
    
    return size;
  }
}

const buildValidator = new SimpleBuildValidator();

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

  quick: async () => {
    console.log('⚡ Performing quick repair...');
    await buildValidator.repairBuild();
    console.log('✅ Quick repair completed');
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

  comprehensive: async () => {
    console.log('🚀 Starting comprehensive build system repair...');
    
    // Step 1: Validate
    console.log('Step 1: Validating build system');
    const validation = await buildValidator.validateBuild();
    
    // Step 2: Repair if needed
    if (!validation.isValid) {
      console.log('Step 2: Repairing build system');
      await buildValidator.repairBuild();
    }
    
    // Step 3: Rebuild
    console.log('Step 3: Rebuilding with recovery');
    const success = await buildValidator.rebuildWithRecovery(3);
    
    if (success) {
      console.log('✅ Comprehensive repair completed successfully');
    } else {
      console.log('❌ Comprehensive repair encountered issues');
      process.exit(1);
    }
  },

  emergency: async () => {
    console.log('🚨 Starting emergency recovery...');
    console.log('⚠️  This will clean the build directory');
    
    await buildValidator.cleanBuild();
    await buildValidator.repairBuild();
    
    const success = await buildValidator.rebuildWithRecovery(1);
    
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

Usage: node scripts/build-system-repair.cjs <command>

Commands:
  validate      - Validate build system and check for issues
  repair        - Repair missing or corrupted manifest files
  rebuild       - Rebuild application with error recovery
  comprehensive - Perform comprehensive build system repair
  quick         - Perform quick repair for common issues
  health        - Check build system health status
  emergency     - Emergency recovery (cleans build and rebuilds)
  help          - Show this help message

Examples:
  node scripts/build-system-repair.cjs validate
  node scripts/build-system-repair.cjs comprehensive
  node scripts/build-system-repair.cjs health
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
if (require.main === module) {
  main();
}

module.exports = { commands };
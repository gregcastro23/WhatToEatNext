#!/usr/bin/env node

/**
 * Terminal Freeze Diagnostic and Recovery Tool
 * 
 * Diagnoses and fixes Kiro terminal freezing issues by:
 * - Detecting stuck processes
 * - Killing infinite loops
 * - Clearing process locks
 * - Resetting campaign states
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TerminalFreezeDiagnostic {
  constructor() {
    this.stuckProcesses = [];
    this.campaignLocks = [];
    this.diagnosticResults = {
      stuckProcesses: [],
      infiniteLoops: [],
      memoryLeaks: [],
      fileSystemLocks: [],
      recommendations: []
    };
  }

  /**
   * Run complete diagnostic
   */
  async runDiagnostic() {
    console.log('🔍 KIRO TERMINAL FREEZE DIAGNOSTIC');
    console.log('==================================');
    
    try {
      await this.detectStuckProcesses();
      await this.detectInfiniteLoops();
      await this.detectMemoryLeaks();
      await this.detectFileSystemLocks();
      await this.checkCampaignStates();
      
      this.generateRecommendations();
      this.displayResults();
      
      return this.diagnosticResults;
    } catch (error) {
      console.error('❌ Diagnostic failed:', error.message);
      return null;
    }
  }

  /**
   * Detect stuck processes
   */
  async detectStuckProcesses() {
    console.log('\n🔍 Checking for stuck processes...');
    
    try {
      // Check for long-running TypeScript processes
      const tscProcesses = execSync('ps aux | grep -E "(tsc|typescript)" | grep -v grep', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      
      if (tscProcesses) {
        console.log('⚠️  Found TypeScript processes:');
        console.log(tscProcesses);
        this.diagnosticResults.stuckProcesses.push({
          type: 'typescript',
          processes: tscProcesses.split('\n')
        });
      }
      
      // Check for long-running lint processes
      const lintProcesses = execSync('ps aux | grep -E "(lint|eslint)" | grep -v grep', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      
      if (lintProcesses) {
        console.log('⚠️  Found lint processes:');
        console.log(lintProcesses);
        this.diagnosticResults.stuckProcesses.push({
          type: 'lint',
          processes: lintProcesses.split('\n')
        });
      }
      
      // Check for campaign processes
      const campaignProcesses = execSync('ps aux | grep -E "(campaign|batch)" | grep -v grep', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      
      if (campaignProcesses) {
        console.log('⚠️  Found campaign processes:');
        console.log(campaignProcesses);
        this.diagnosticResults.stuckProcesses.push({
          type: 'campaign',
          processes: campaignProcesses.split('\n')
        });
      }
      
      if (this.diagnosticResults.stuckProcesses.length === 0) {
        console.log('✅ No stuck processes detected');
      }
      
    } catch (error) {
      // No processes found (normal)
      console.log('✅ No stuck processes detected');
    }
  }

  /**
   * Detect infinite loops by checking process runtime
   */
  async detectInfiniteLoops() {
    console.log('\n🔍 Checking for infinite loops...');
    
    try {
      // Check for processes running longer than 10 minutes
      const longRunning = execSync('ps -eo pid,etime,comm | awk \'$2 ~ /[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/ || $2 ~ /[0-9]+-[0-9][0-9]:[0-9][0-9]/ {print}\'', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      
      if (longRunning) {
        const lines = longRunning.split('\n').filter(line => 
          line.includes('node') || line.includes('tsc') || line.includes('lint')
        );
        
        if (lines.length > 0) {
          console.log('⚠️  Found long-running processes (potential infinite loops):');
          lines.forEach(line => console.log(`   ${line}`));
          this.diagnosticResults.infiniteLoops = lines;
        } else {
          console.log('✅ No infinite loops detected');
        }
      } else {
        console.log('✅ No infinite loops detected');
      }
      
    } catch (error) {
      console.log('✅ No infinite loops detected');
    }
  }

  /**
   * Detect memory leaks
   */
  async detectMemoryLeaks() {
    console.log('\n🔍 Checking for memory leaks...');
    
    try {
      // Check for high memory usage processes
      const highMemory = execSync('ps aux --sort=-%mem | head -10 | grep -E "(node|tsc|lint)"', {
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();
      
      if (highMemory) {
        console.log('⚠️  Found high memory usage processes:');
        console.log(highMemory);
        this.diagnosticResults.memoryLeaks.push({
          type: 'high_memory',
          processes: highMemory.split('\n')
        });
      } else {
        console.log('✅ No memory leaks detected');
      }
      
    } catch (error) {
      console.log('✅ No memory leaks detected');
    }
  }

  /**
   * Detect file system locks
   */
  async detectFileSystemLocks() {
    console.log('\n🔍 Checking for file system locks...');
    
    const lockFiles = [
      '.explicit-any-campaign-progress.json',
      '.typescript-campaign-progress.json',
      '.campaign-lock',
      'node_modules/.cache',
      '.next/cache'
    ];
    
    for (const lockFile of lockFiles) {
      if (fs.existsSync(lockFile)) {
        try {
          const stats = fs.statSync(lockFile);
          const age = Date.now() - stats.mtime.getTime();
          
          if (age > 30 * 60 * 1000) { // Older than 30 minutes
            console.log(`⚠️  Found stale lock file: ${lockFile} (${Math.round(age / 60000)} minutes old)`);
            this.diagnosticResults.fileSystemLocks.push({
              file: lockFile,
              age: age,
              stale: true
            });
          }
        } catch (error) {
          // Ignore stat errors
        }
      }
    }
    
    if (this.diagnosticResults.fileSystemLocks.length === 0) {
      console.log('✅ No file system locks detected');
    }
  }

  /**
   * Check campaign states
   */
  async checkCampaignStates() {
    console.log('\n🔍 Checking campaign states...');
    
    const campaignFiles = [
      '.explicit-any-campaign-progress.json',
      '.typescript-campaign-progress.json'
    ];
    
    for (const file of campaignFiles) {
      if (fs.existsSync(file)) {
        try {
          const data = JSON.parse(fs.readFileSync(file, 'utf8'));
          console.log(`📊 Found campaign state: ${file}`);
          console.log(`   Progress: ${data.reductionPercentage || 0}%`);
          console.log(`   Target met: ${data.isTargetMet || false}`);
        } catch (error) {
          console.log(`⚠️  Corrupted campaign file: ${file}`);
          this.diagnosticResults.fileSystemLocks.push({
            file: file,
            corrupted: true
          });
        }
      }
    }
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    console.log('\n💡 Generating recommendations...');
    
    if (this.diagnosticResults.stuckProcesses.length > 0) {
      this.diagnosticResults.recommendations.push({
        priority: 'HIGH',
        action: 'Kill stuck processes',
        command: 'pkill -f "tsc|lint|campaign"'
      });
    }
    
    if (this.diagnosticResults.infiniteLoops.length > 0) {
      this.diagnosticResults.recommendations.push({
        priority: 'HIGH',
        action: 'Kill infinite loop processes',
        command: 'Kill processes running longer than 10 minutes'
      });
    }
    
    if (this.diagnosticResults.memoryLeaks.length > 0) {
      this.diagnosticResults.recommendations.push({
        priority: 'MEDIUM',
        action: 'Restart high memory processes',
        command: 'Kill and restart memory-intensive processes'
      });
    }
    
    if (this.diagnosticResults.fileSystemLocks.length > 0) {
      this.diagnosticResults.recommendations.push({
        priority: 'MEDIUM',
        action: 'Clear stale lock files',
        command: 'Remove old campaign progress files'
      });
    }
    
    // Always recommend timeout protection
    this.diagnosticResults.recommendations.push({
      priority: 'LOW',
      action: 'Enable timeout protection',
      command: 'Use TerminalFreezePreventionSystem for all operations'
    });
  }

  /**
   * Display diagnostic results
   */
  displayResults() {
    console.log('\n📋 DIAGNOSTIC RESULTS');
    console.log('====================');
    
    console.log(`\n🔍 Summary:`);
    console.log(`   Stuck processes: ${this.diagnosticResults.stuckProcesses.length}`);
    console.log(`   Infinite loops: ${this.diagnosticResults.infiniteLoops.length}`);
    console.log(`   Memory leaks: ${this.diagnosticResults.memoryLeaks.length}`);
    console.log(`   File locks: ${this.diagnosticResults.fileSystemLocks.length}`);
    
    if (this.diagnosticResults.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      this.diagnosticResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.action}`);
        console.log(`      Command: ${rec.command}`);
      });
    }
  }

  /**
   * Emergency recovery - kill all problematic processes
   */
  async emergencyRecovery() {
    console.log('\n🚨 EMERGENCY RECOVERY MODE');
    console.log('==========================');
    
    try {
      // Kill TypeScript processes
      console.log('🛑 Killing TypeScript processes...');
      try {
        execSync('pkill -f "tsc --noEmit"', { stdio: 'ignore', timeout: 5000 });
      } catch (error) {
        // Ignore if no processes found
      }
      
      // Kill lint processes
      console.log('🛑 Killing lint processes...');
      try {
        execSync('pkill -f "yarn lint"', { stdio: 'ignore', timeout: 5000 });
      } catch (error) {
        // Ignore if no processes found
      }
      
      // Kill campaign processes
      console.log('🛑 Killing campaign processes...');
      try {
        execSync('pkill -f "campaign"', { stdio: 'ignore', timeout: 5000 });
      } catch (error) {
        // Ignore if no processes found
      }
      
      // Clear stale lock files
      console.log('🧹 Clearing stale lock files...');
      const lockFiles = [
        '.explicit-any-campaign-progress.json',
        '.typescript-campaign-progress.json',
        '.campaign-lock'
      ];
      
      for (const file of lockFiles) {
        if (fs.existsSync(file)) {
          try {
            const stats = fs.statSync(file);
            const age = Date.now() - stats.mtime.getTime();
            
            if (age > 30 * 60 * 1000) { // Older than 30 minutes
              fs.unlinkSync(file);
              console.log(`   Removed stale file: ${file}`);
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }
      
      // Clear Node.js cache
      console.log('🧹 Clearing Node.js cache...');
      try {
        execSync('rm -rf node_modules/.cache', { stdio: 'ignore', timeout: 10000 });
      } catch (error) {
        // Ignore if cache doesn't exist
      }
      
      console.log('✅ Emergency recovery completed');
      console.log('💡 Recommendation: Restart Kiro terminal for best results');
      
    } catch (error) {
      console.error('❌ Emergency recovery failed:', error.message);
    }
  }

  /**
   * Preventive maintenance
   */
  async preventiveMaintenance() {
    console.log('\n🔧 PREVENTIVE MAINTENANCE');
    console.log('=========================');
    
    // Set up process monitoring
    console.log('📊 Setting up process monitoring...');
    
    // Create monitoring script
    const monitorScript = `
#!/bin/bash
# Process monitoring script
while true; do
  # Check for long-running processes
  LONG_RUNNING=$(ps -eo pid,etime,comm | awk '$2 ~ /[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/ {print $1}')
  
  if [ ! -z "$LONG_RUNNING" ]; then
    echo "$(date): Found long-running processes: $LONG_RUNNING" >> .process-monitor.log
  fi
  
  sleep 300 # Check every 5 minutes
done
`;
    
    fs.writeFileSync('.process-monitor.sh', monitorScript);
    execSync('chmod +x .process-monitor.sh');
    
    console.log('✅ Process monitoring script created');
    console.log('💡 Run: nohup ./.process-monitor.sh & to start monitoring');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const diagnostic = new TerminalFreezeDiagnostic();
  
  if (args.includes('--emergency') || args.includes('-e')) {
    await diagnostic.emergencyRecovery();
  } else if (args.includes('--maintenance') || args.includes('-m')) {
    await diagnostic.preventiveMaintenance();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Terminal Freeze Diagnostic Tool

Usage:
  node terminal-freeze-diagnostic.js [options]

Options:
  --emergency, -e    Run emergency recovery (kill stuck processes)
  --maintenance, -m  Set up preventive maintenance
  --help, -h         Show this help message

Examples:
  node terminal-freeze-diagnostic.js              # Run diagnostic
  node terminal-freeze-diagnostic.js --emergency  # Emergency recovery
  node terminal-freeze-diagnostic.js --maintenance # Set up monitoring
`);
  } else {
    await diagnostic.runDiagnostic();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TerminalFreezeDiagnostic };
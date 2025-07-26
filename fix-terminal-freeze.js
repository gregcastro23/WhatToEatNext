#!/usr/bin/env node

/**
 * Quick Terminal Freeze Fix
 * 
 * Immediately fixes Kiro terminal freezing by killing stuck processes
 * and clearing problematic states.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚨 FIXING KIRO TERMINAL FREEZE');
console.log('==============================');

try {
  // 1. Kill all TypeScript compilation processes
  console.log('🛑 Killing TypeScript processes...');
  try {
    execSync('pkill -f "tsc --noEmit"', { stdio: 'ignore', timeout: 5000 });
    console.log('   ✅ TypeScript processes killed');
  } catch (error) {
    console.log('   ℹ️  No TypeScript processes found');
  }

  // 2. Kill all lint processes
  console.log('🛑 Killing lint processes...');
  try {
    execSync('pkill -f "yarn lint"', { stdio: 'ignore', timeout: 5000 });
    console.log('   ✅ Lint processes killed');
  } catch (error) {
    console.log('   ℹ️  No lint processes found');
  }

  // 3. Kill all campaign processes
  console.log('🛑 Killing campaign processes...');
  try {
    execSync('pkill -f "campaign"', { stdio: 'ignore', timeout: 5000 });
    execSync('pkill -f "batch"', { stdio: 'ignore', timeout: 5000 });
    console.log('   ✅ Campaign processes killed');
  } catch (error) {
    console.log('   ℹ️  No campaign processes found');
  }

  // 4. Kill any Node.js processes that might be stuck
  console.log('🛑 Killing potentially stuck Node.js processes...');
  try {
    const nodeProcesses = execSync('ps aux | grep node | grep -E "(tsc|lint|campaign)" | awk \'{print $2}\'', {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    
    if (nodeProcesses) {
      const pids = nodeProcesses.split('\n').filter(pid => pid.trim());
      for (const pid of pids) {
        try {
          process.kill(parseInt(pid), 'SIGTERM');
          console.log(`   ✅ Killed process ${pid}`);
        } catch (error) {
          // Process might already be dead
        }
      }
    } else {
      console.log('   ℹ️  No stuck Node.js processes found');
    }
  } catch (error) {
    console.log('   ℹ️  No stuck Node.js processes found');
  }

  // 5. Clear stale campaign progress files
  console.log('🧹 Clearing stale campaign files...');
  const staleFiles = [
    '.explicit-any-campaign-progress.json',
    '.typescript-campaign-progress.json',
    '.campaign-lock'
  ];

  for (const file of staleFiles) {
    if (fs.existsSync(file)) {
      try {
        const stats = fs.statSync(file);
        const age = Date.now() - stats.mtime.getTime();
        
        // Remove files older than 10 minutes
        if (age > 10 * 60 * 1000) {
          fs.unlinkSync(file);
          console.log(`   ✅ Removed stale file: ${file}`);
        } else {
          console.log(`   ℹ️  Keeping recent file: ${file}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not process file: ${file}`);
      }
    }
  }

  // 6. Clear Node.js cache that might be causing issues
  console.log('🧹 Clearing Node.js cache...');
  try {
    if (fs.existsSync('node_modules/.cache')) {
      execSync('rm -rf node_modules/.cache', { stdio: 'ignore', timeout: 10000 });
      console.log('   ✅ Node.js cache cleared');
    } else {
      console.log('   ℹ️  No Node.js cache found');
    }
  } catch (error) {
    console.log('   ⚠️  Could not clear Node.js cache');
  }

  // 7. Clear TypeScript build info
  console.log('🧹 Clearing TypeScript build info...');
  const tsBuildFiles = [
    'tsconfig.tsbuildinfo',
    'tsconfig.jest.tsbuildinfo'
  ];

  for (const file of tsBuildFiles) {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Removed: ${file}`);
      } catch (error) {
        console.log(`   ⚠️  Could not remove: ${file}`);
      }
    }
  }

  console.log('\n✅ TERMINAL FREEZE FIX COMPLETED');
  console.log('================================');
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Restart your Kiro terminal');
  console.log('   2. The terminal should now respond normally');
  console.log('   3. Campaign systems now have timeout protection');
  console.log('   4. Run diagnostic if issues persist: node src/services/campaign/terminal-freeze-diagnostic.js');
  console.log('');

} catch (error) {
  console.error('❌ Fix failed:', error.message);
  console.log('');
  console.log('💡 Manual steps:');
  console.log('   1. Kill all Node.js processes: pkill node');
  console.log('   2. Restart Kiro terminal');
  console.log('   3. Clear cache: rm -rf node_modules/.cache');
}
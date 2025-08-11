#!/usr/bin/env node

/**
 * Conservative First Wave - One file at a time with validation
 */

const fs = require('fs');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Start with the safest target - array types
const CONSERVATIVE_TARGETS = [
  {
    file: 'src/data/cuisineFlavorProfiles.ts',
    line: 836,
    original: ': any[]',
    replacement: ': unknown[]',
    confidence: 0.95,
    category: 'ARRAY_TYPE'
  }
];

class ConservativeFirstWave {
  constructor() {
    this.results = [];
  }

  async execute() {
    console.log(colorize('\n🚀 Conservative First Wave: Single File Test', 'cyan'));
    console.log(colorize('Testing one high-confidence array type replacement', 'blue'));

    const target = CONSERVATIVE_TARGETS[0];

    // Create backup
    const backupPath = await this.createBackup();
    console.log(colorize(`📦 Backup created: ${backupPath}`, 'blue'));

    try {
      // Get initial build state
      console.log(colorize('🔍 Checking initial build state...', 'blue'));
      const initialBuildOk = await this.validateBuild();
      console.log(colorize(`Initial build: ${initialBuildOk ? 'OK' : 'Has errors (proceeding anyway)'}`, initialBuildOk ? 'green' : 'yellow'));

      // Process the target
      console.log(colorize(`\n🔄 Processing: ${target.file}`, 'cyan'));
      const result = await this.processTarget(target);

      if (!result.success) {
        console.log(colorize(`❌ Failed: ${result.error}`, 'red'));
        return false;
      }

      console.log(colorize(`✅ Applied: ${result.originalLine} → ${result.newLine}`, 'green'));

      // Validate build after change
      console.log(colorize('🔍 Validating build after change...', 'blue'));
      const buildOk = await this.validateBuild();

      if (!buildOk) {
        console.log(colorize('⚠️ Build validation failed, rolling back...', 'yellow'));
        await this.rollback(backupPath);
        console.log(colorize('❌ Change caused build issues, rolled back', 'red'));
        return false;
      }

      console.log(colorize('✅ Build validation passed!', 'green'));

      // Check for any count reduction
      const anyCount = await this.getAnyCount();
      console.log(colorize(`📊 Current explicit any count: ${anyCount}`, 'blue'));

      console.log(colorize('\n🎉 Conservative First Wave Successful!', 'green'));
      console.log(colorize('✅ One array type successfully converted: any[] → unknown[]', 'green'));

      return true;

    } catch (error) {
      console.error(colorize(`❌ Error: ${error.message}`, 'red'));
      await this.rollback(backupPath);
      return false;
    }
  }

  async processTarget(target) {
    try {
      if (!fs.existsSync(target.file)) {
        return { success: false, error: 'File not found' };
      }

      const content = fs.readFileSync(target.file, 'utf8');
      const lines = content.split('\n');

      if (lines.length < target.line) {
        return { success: false, error: 'Line number out of range' };
      }

      const currentLine = lines[target.line - 1];

      if (!currentLine.includes(target.original)) {
        return {
          success: false,
          error: 'Pattern not found',
          currentLine: currentLine.trim()
        };
      }

      const newLine = currentLine.replace(target.original, target.replacement);
      lines[target.line - 1] = newLine;

      const updatedContent = lines.join('\n');
      fs.writeFileSync(target.file, updatedContent);

      return {
        success: true,
        originalLine: currentLine.trim(),
        newLine: newLine.trim()
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `backups/conservative-wave-${timestamp}`;

    try {
      execSync(`mkdir -p ${backupPath}`);
      execSync(`cp -r src ${backupPath}/`);
      return backupPath;
    } catch (error) {
      console.warn(colorize('Warning: Could not create backup', 'yellow'));
      return null;
    }
  }

  async rollback(backupPath) {
    if (!backupPath || !fs.existsSync(backupPath)) {
      console.warn(colorize('Warning: No backup available for rollback', 'yellow'));
      return;
    }

    try {
      execSync(`rm -rf src`);
      execSync(`cp -r ${backupPath}/src .`);
      console.log(colorize('✅ Rollback completed successfully', 'green'));
    } catch (error) {
      console.error(colorize(`❌ Rollback failed: ${error.message}`, 'red'));
    }
  }

  async validateBuild() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAnyCount() {
    try {
      const output = execSync('find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk -F: \'{sum += $2} END {print sum}\' || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch {
      return 0;
    }
  }
}

async function main() {
  const executor = new ConservativeFirstWave();
  const success = await executor.execute();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ConservativeFirstWave };

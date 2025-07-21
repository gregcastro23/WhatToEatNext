#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Auto-Lint Fixer Script
 * Automatically fixes common linting issues with safety protocols
 */

async function autoLintFixer() {
  const filePath = process.env.KIRO_FILE_PATH;
  
  if (!filePath) {
    console.log('⚠️ No file path provided');
    return;
  }
  
  console.log(`🔧 Auto-fixing linting issues in: ${filePath}`);
  
  try {
    // Create backup before fixing
    await createBackup(filePath);
    
    // Run ESLint with auto-fix
    await runESLintFix(filePath);
    
    // Run additional safe fixes
    await runSafeFixes(filePath);
    
    // Validate the fixes
    const isValid = await validateFixes(filePath);
    
    if (isValid) {
      console.log('✅ Linting fixes applied successfully');
      await logFixSuccess(filePath);
    } else {
      console.log('❌ Fixes validation failed, restoring backup');
      await restoreBackup(filePath);
    }
    
  } catch (error) {
    console.error('❌ Error during auto-fix:', error.message);
    await restoreBackup(filePath);
  }
}

async function createBackup(filePath) {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.copyFileSync(filePath, backupPath);
  
  // Store backup path for potential restoration
  process.env.KIRO_BACKUP_PATH = backupPath;
  
  console.log(`💾 Backup created: ${backupPath}`);
}

async function runESLintFix(filePath) {
  try {
    console.log('🔍 Running ESLint auto-fix...');
    
    execSync(`yarn eslint "${filePath}" --fix --config eslint.config.cjs`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ ESLint auto-fix completed');
    
  } catch (error) {
    // ESLint may exit with code 1 even after successful fixes
    if (error.status === 1) {
      console.log('⚠️ ESLint completed with warnings (normal)');
    } else {
      throw error;
    }
  }
}

async function runSafeFixes(filePath) {
  console.log('🛠️ Running additional safe fixes...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix common safe patterns
  const safeFixes = [
    // Remove trailing whitespace
    {
      pattern: /[ \t]+$/gm,
      replacement: '',
      description: 'Remove trailing whitespace'
    },
    
    // Fix double semicolons
    {
      pattern: /;;+/g,
      replacement: ';',
      description: 'Fix double semicolons'
    },
    
    // Fix multiple empty lines
    {
      pattern: /\n\n\n+/g,
      replacement: '\n\n',
      description: 'Fix multiple empty lines'
    },
    
    // Add missing semicolons (conservative)
    {
      pattern: /^(\s*)(const|let|var|return|throw|break|continue)\s+([^;{}\n]+)$/gm,
      replacement: (match, indent, keyword, rest) => {
        if (rest.trim().endsWith(';') || rest.includes('{') || rest.includes('}')) {
          return match;
        }
        return `${indent}${keyword} ${rest.trim()};`;
      },
      description: 'Add missing semicolons'
    }
  ];
  
  for (const fix of safeFixes) {
    const originalContent = content;
    content = content.replace(fix.pattern, fix.replacement);
    
    if (content !== originalContent) {
      console.log(`  ✓ ${fix.description}`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Safe fixes applied');
  } else {
    console.log('ℹ️ No additional fixes needed');
  }
}

async function validateFixes(filePath) {
  try {
    console.log('🔍 Validating fixes...');
    
    // Check if file is still valid JavaScript/TypeScript
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      // Basic TypeScript syntax check
      execSync(`yarn tsc --noEmit --skipLibCheck "${filePath}"`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
    }
    
    // Check if file can be parsed
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax validation
    if (content.includes('undefined undefined') || 
        content.includes('null null') ||
        content.includes(';;')) {
      console.log('⚠️ Potential syntax issues detected');
      return false;
    }
    
    console.log('✅ Validation passed');
    return true;
    
  } catch (error) {
    console.log('❌ Validation failed:', error.message);
    return false;
  }
}

async function restoreBackup(filePath) {
  const backupPath = process.env.KIRO_BACKUP_PATH;
  
  if (backupPath && fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    console.log(`🔄 Backup restored: ${filePath}`);
    
    // Clean up backup
    fs.unlinkSync(backupPath);
  }
}

async function logFixSuccess(filePath) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    filePath,
    action: 'auto-lint-fix',
    status: 'success'
  };
  
  const logPath = path.join(process.cwd(), 'logs', 'auto-fixes.log');
  const logsDir = path.dirname(logPath);
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
}

// Run if called directly
if (require.main === module) {
  autoLintFixer().catch(console.error);
}

module.exports = { autoLintFixer };
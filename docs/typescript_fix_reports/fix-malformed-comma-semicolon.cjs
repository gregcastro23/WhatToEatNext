#!/usr/bin/env node

/**
 * Emergency Fix for Malformed Comma-Semicolon Syntax
 * Targets the specific `,;` patterns causing TS1005 errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MalformedSyntaxFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.malformed-syntax-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get all TypeScript/JavaScript files in src directory
   */
  getAllTSFiles() {
    const files = [];

    function scanDirectory(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    scanDirectory('src');
    return files;
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath.replace(/[\/\\]/g, '_'));
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, content, 'utf8');
  }

  /**
   * Fix malformed syntax patterns
   */
  fixMalformedPatterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Variable declarations with trailing comma instead of semicolon
    // `let variable,` → `let variable;`
    const pattern1 = /^(\s*(?:let|const|var)\s+[^,;=]+),(\s*)$/gm;
    const matches1 = [...fixedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(pattern1, '$1;$2');
      fixes += matches1.length;
      console.log(`    Fixed ${matches1.length} variable declaration trailing commas`);
    }

    // Pattern 2: Function component declarations with trailing comma
    // `const Component: React.FC<any> = (props: any) => <div>Content</div>,` → semicolon
    const pattern2 = /^(\s*const\s+\w+:\s*React\.FC<[^>]*>\s*=\s*\([^)]*\)\s*=>\s*<[^>]*>[^<]*<\/[^>]*>),(\s*)$/gm;
    const matches2 = [...fixedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(pattern2, '$1;$2');
      fixes += matches2.length;
      console.log(`    Fixed ${matches2.length} React component trailing commas`);
    }

    // Pattern 3: Interface/type property declarations with trailing comma at end of line
    // `property: type,` → `property: type;` (when it's the last property)
    const pattern3 = /^(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;]+),(\s*)$/gm;
    const matches3 = [...fixedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(pattern3, '$1;$2');
      fixes += matches3.length;
      console.log(`    Fixed ${matches3.length} property declaration trailing commas`);
    }

    // Pattern 4: Object destructuring with malformed syntax
    // `= {},;` → `= {},`
    const pattern4 = /=\s*\{\s*\}\s*,\s*;/g;
    const matches4 = [...fixedContent.matchAll(pattern4)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(pattern4, '= {},');
      fixes += matches4.length;
      console.log(`    Fixed ${matches4.length} object destructuring patterns`);
    }

    // Pattern 5: Assignment with trailing comma-semicolon
    // `= value,;` → `= value;`
    const pattern5 = /=\s*([^,;]+),\s*;/g;
    const matches5 = [...fixedContent.matchAll(pattern5)];
    if (matches5.length > 0) {
      fixedContent = fixedContent.replace(pattern5, '= $1;');
      fixes += matches5.length;
      console.log(`    Fixed ${matches5.length} assignment trailing comma-semicolons`);
    }

    // Pattern 6: Function parameter trailing commas before closing paren
    const pattern6 = /,(\s*\n\s*\))/g;
    const matches6 = [...fixedContent.matchAll(pattern6)];
    if (matches6.length > 0) {
      fixedContent = fixedContent.replace(pattern6, '$1');
      fixes += matches6.length;
      console.log(`    Fixed ${matches6.length} function parameter trailing commas`);
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Check if file has potential malformed patterns
      if (!originalContent.includes(',;') &&
          !originalContent.match(/^(\s*(?:let|const|var)\s+[^,;=]+),(\s*)$/m) &&
          !originalContent.match(/^(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;]+),(\s*)$/m)) {
        return false; // No patterns to fix
      }

      console.log(`  Processing: ${filePath}`);

      // Create backup
      this.createBackup(filePath);

      // Fix patterns
      const { content: fixedContent, fixes } = this.fixMalformedPatterns(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      }

      return false;

    } catch (error) {
      console.error(`    ❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Get current TS1005 error count
   */
  getTS1005ErrorCount() {
    try {
      const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      const errorCount = (result.match(/error TS1005/g) || []).length;
      return errorCount;
    } catch (error) {
      if (error.stdout) {
        const errorCount = (error.stdout.match(/error TS1005/g) || []).length;
        return errorCount;
      }
      return -1;
    }
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log('🚨 EMERGENCY MALFORMED SYNTAX REPAIR');
    console.log('=' .repeat(50));

    const startTime = Date.now();
    const initialErrors = this.getTS1005ErrorCount();
    console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

    // Get all TypeScript files
    const files = this.getAllTSFiles();
    console.log(`📁 Found ${files.length} TypeScript/JavaScript files`);

    let modifiedFiles = 0;
    let batchCount = 0;

    // Process files in batches of 25
    for (let i = 0; i < files.length; i += 25) {
      const batch = files.slice(i, Math.min(i + 25, files.length));
      batchCount++;

      console.log(`\n🔄 Batch ${batchCount}: Processing files ${i + 1}-${Math.min(i + 25, files.length)}`);

      for (const file of batch) {
        if (this.processFile(file)) {
          modifiedFiles++;
        }
      }

      // Validation checkpoint every batch
      const currentErrors = this.getTS1005ErrorCount();
      console.log(`  📊 Current TS1005 errors: ${currentErrors}`);

      if (i + 25 < files.length) {
        console.log('  ⏸️  Checkpoint - continuing...');
      }
    }

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n🏁 REPAIR COMPLETED');
    console.log('=' .repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📝 Files scanned: ${files.length}`);
    console.log(`🔧 Files modified: ${modifiedFiles}`);
    console.log(`🎯 Total fixes applied: ${this.fixedPatterns}`);
    console.log(`📊 TS1005 errors: ${initialErrors} → ${finalErrors}`);

    if (finalErrors < initialErrors) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(`✅ SUCCESS: Reduced by ${reduction} errors (${percentage}%)`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialErrors,
      finalErrors,
      filesModified: modifiedFiles,
      fixesApplied: this.fixedPatterns,
      duration: parseFloat(duration)
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new MalformedSyntaxFixer();
  fixer.repair()
    .then(results => {
      console.log('\n📋 Emergency repair completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Emergency repair failed:', error);
      process.exit(1);
    });
}

module.exports = MalformedSyntaxFixer;

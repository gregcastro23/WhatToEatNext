#!/usr/bin/env node

/**
 * Safe JSX Entity Fixer
 *
 * This script fixes unescaped JSX entities while avoiding template literal corruption.
 * It uses a conservative approach that only fixes entities in JSX text content,
 * not in template literals, comments, or other contexts.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SafeJSXEntityFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
    this.totalFixes = 0;
  }

  /**
   * Get files with JSX entity issues from ESLint
   */
  getFilesWithJSXEntityIssues() {
    try {
      const output = execSync(
        'npx eslint --config eslint.config.cjs src --format=json',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const results = JSON.parse(output);
      const filesWithIssues = new Map();

      for (const result of results) {
        const entityMessages = result.messages.filter(
          msg => msg.ruleId === 'react/no-unescaped-entities'
        );

        if (entityMessages.length > 0) {
          filesWithIssues.set(result.filePath, entityMessages);
        }
      }

      return filesWithIssues;
    } catch (error) {
      console.error('Error getting ESLint results:', error.message);
      return new Map();
    }
  }

  /**
   * Check if a line contains template literal syntax
   */
  isTemplateLiteral(line) {
    // Check for template literal patterns
    const templatePatterns = [
      /`[^`]*\$\{[^}]*\}[^`]*`/,  // Template literal with interpolation
      /`[^`]*`/,                   // Simple template literal
      /\$\{[^}]*\}/,              // Template interpolation
    ];

    return templatePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Check if a line is within a comment block
   */
  isInComment(lines, lineIndex) {
    // Check for single-line comment
    if (lines[lineIndex].trim().startsWith('//')) {
      return true;
    }

    // Check for multi-line comment
    let inComment = false;
    for (let i = 0; i <= lineIndex; i++) {
      const line = lines[i];
      if (line.includes('/*')) inComment = true;
      if (line.includes('*/')) inComment = false;
    }

    return inComment;
  }

  /**
   * Check if the position is within JSX text content
   */
  isJSXTextContent(line, column) {
    // Simple heuristic: if the character is between > and < and not in attributes
    const beforeChar = line.substring(0, column);
    const afterChar = line.substring(column);

    // Check if we're in an attribute (between quotes)
    const beforeQuotes = (beforeChar.match(/"/g) || []).length;
    const afterQuotes = (afterChar.match(/"/g) || []).length;

    // If odd number of quotes before and after, we're likely in an attribute
    if (beforeQuotes % 2 === 1 && afterQuotes % 2 === 1) {
      return false;
    }

    // Check if we're between JSX tags
    const lastOpenTag = beforeChar.lastIndexOf('>');
    const lastCloseTag = beforeChar.lastIndexOf('<');

    return lastOpenTag > lastCloseTag;
  }

  /**
   * Safely fix JSX entities in a file
   */
  fixJSXEntitiesInFile(filePath, messages) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let modified = false;
      let fileFixCount = 0;

      // Sort messages by line and column in reverse order to avoid offset issues
      const sortedMessages = messages.sort((a, b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.column - a.column;
      });

      for (const message of sortedMessages) {
        const lineIndex = message.line - 1;
        const columnIndex = message.column - 1;

        if (lineIndex >= lines.length) continue;

        const line = lines[lineIndex];

        // Safety checks
        if (this.isTemplateLiteral(line)) {
          console.log(`Skipping template literal in ${filePath}:${message.line}`);
          continue;
        }

        if (this.isInComment(lines, lineIndex)) {
          console.log(`Skipping comment in ${filePath}:${message.line}`);
          continue;
        }

        if (!this.isJSXTextContent(line, columnIndex)) {
          console.log(`Skipping non-JSX text in ${filePath}:${message.line}`);
          continue;
        }

        // Get the character to fix
        const charToFix = line[columnIndex];
        let replacement = '';

        switch (charToFix) {
          case "'":
            replacement = '&apos;';
            break;
          case '"':
            replacement = '&quot;';
            break;
          case '&':
            replacement = '&amp;';
            break;
          case '<':
            replacement = '&lt;';
            break;
          case '>':
            replacement = '&gt;';
            break;
          default:
            continue;
        }

        // Apply the fix
        const newLine = line.substring(0, columnIndex) +
                       replacement +
                       line.substring(columnIndex + 1);

        lines[lineIndex] = newLine;
        modified = true;
        fileFixCount++;

        console.log(`Fixed '${charToFix}' -> '${replacement}' in ${filePath}:${message.line}:${message.column}`);
      }

      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        this.fixedFiles.push(filePath);
        this.totalFixes += fileFixCount;
        console.log(`✅ Fixed ${fileFixCount} JSX entities in ${filePath}`);
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the JSX entity fixing process
   */
  async run() {
    console.log('🔍 Finding files with JSX entity issues...');

    const filesWithIssues = this.getFilesWithJSXEntityIssues();

    if (filesWithIssues.size === 0) {
      console.log('✅ No JSX entity issues found!');
      return;
    }

    console.log(`📝 Found ${filesWithIssues.size} files with JSX entity issues`);

    for (const [filePath, messages] of filesWithIssues) {
      console.log(`\n🔧 Processing ${filePath} (${messages.length} issues)...`);
      this.fixJSXEntitiesInFile(filePath, messages);
    }

    this.generateReport();
  }

  /**
   * Generate a summary report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('JSX ENTITY FIXING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files processed: ${this.fixedFiles.length}`);
    console.log(`Total fixes applied: ${this.totalFixes}`);
    console.log(`Errors encountered: ${this.errors.length}`);

    if (this.fixedFiles.length > 0) {
      console.log('\n✅ Fixed files:');
      this.fixedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }

    // Write detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesProcessed: this.fixedFiles.length,
        totalFixes: this.totalFixes,
        errors: this.errors.length
      },
      fixedFiles: this.fixedFiles,
      errors: this.errors
    };

    fs.writeFileSync('jsx-entity-fixes-report.json', JSON.stringify(report, null, 2));
    console.log('\n📊 Detailed report saved to jsx-entity-fixes-report.json');
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new SafeJSXEntityFixer();
  fixer.run().catch(console.error);
}

module.exports = SafeJSXEntityFixer;

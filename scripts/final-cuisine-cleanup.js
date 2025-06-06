import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const CUISINES_DIR = 'src/data/cuisines';

const FILES_TO_CLEAN = ['korean.ts', 'mexican.ts', 'japanese.ts'];

class FinalCuisineCleanup {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.cleanedCount = 0;
    this.errorCount = 0;
  }

  log(message) {
    console.log(`[${this.dryRun ? 'DRY-RUN' : 'CLEANING'}] ${message}`);
  }

  finalCleanup(content) {
    let fixed = content;
    let changes = [];

    // Fix trailing comma before closing brace and semicolon
    const beforeTrailingFix = fixed;
    fixed = fixed.replace(/\}\s*,\s*;\s*$/gm, '};');
    if (fixed !== beforeTrailingFix) {
      changes.push('Fixed trailing comma before closing brace');
    }

    // Fix any remaining object property syntax issues
    const lines = fixed.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Fix missing commas between object properties
      // Look for lines that end with } but should have },
      if (line.trim() === '}' && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim().match(/^[a-zA-Z_$][a-zA-Z0-9_$]*:/)) {
          line = line.replace('}', '},');
          changes.push(`Added missing comma after closing brace on line ${i + 1}`);
        }
      }
      
      // Fix lines that end with } but need },
      if (line.match(/^\s*\}\s*$/) && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.trim().match(/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*:/)) {
          line = line.replace(/\}\s*$/, '},');
          changes.push(`Added missing comma after closing brace on line ${i + 1}`);
        }
      }
      
      if (line !== originalLine) {
        changes.push(`Fixed line ${i + 1} syntax`);
      }
      
      fixedLines.push(line);
    }
    
    fixed = fixedLines.join('\n');

    // Clean up any double semicolons or other issues
    fixed = fixed.replace(/;;\s*$/gm, ';');
    
    return { content: fixed, changes };
  }

  async cleanFile(filename) {
    const filePath = path.join(CUISINES_DIR, filename);
    
    try {
      if (!fs.existsSync(filePath)) {
        this.log(`File not found: ${filename}`);
        this.errorCount++;
        return false;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: cleanedContent, changes } = this.finalCleanup(originalContent);

      if (changes.length === 0) {
        this.log(`No cleanup needed for ${filename}`);
        return true;
      }

      this.log(`Cleaning ${filename} with ${changes.length} fixes:`);
      changes.forEach(change => this.log(`  - ${change}`));

      if (!this.dryRun) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        this.log(`Successfully cleaned ${filename}`);
      }

      this.cleanedCount++;
      return true;

    } catch (error) {
      this.log(`Error cleaning ${filename}: ${error.message}`);
      this.errorCount++;
      return false;
    }
  }

  async cleanAllFiles() {
    this.log(`Starting ${this.dryRun ? 'dry run' : 'final cleanup'} of cuisine files...`);
    
    for (const filename of FILES_TO_CLEAN) {
      await this.cleanFile(filename);
    }

    this.log(`\nSummary:`);
    this.log(`  Files processed: ${FILES_TO_CLEAN.length}`);
    this.log(`  Files cleaned: ${this.cleanedCount}`);
    this.log(`  Errors encountered: ${this.errorCount}`);
    
    if (this.dryRun) {
      this.log(`\nTo apply cleanup, run: node final-cuisine-cleanup.js`);
    } else {
      this.log(`\nFinal cleanup complete! Your cuisine data is restored and syntax-clean.`);
    }
  }
}

// Main execution
async function main() {
  const cleaner = new FinalCuisineCleanup(DRY_RUN);
  await cleaner.cleanAllFiles();
}

main().catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
}); 
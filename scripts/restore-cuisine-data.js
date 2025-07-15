import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const CUISINES_DIR = 'src/data/cuisines';

// List of files to restore and fix
const FILES_TO_RESTORE = [
  { current: 'korean.ts', backup: 'korean.ts.backup-1747964097413' },
  { current: 'mexican.ts', backup: 'mexican.ts.backup-1747964097416' },
  { current: 'japanese.ts', backup: 'japanese.ts.backup-1747964097419' }
];

class CuisineDataRestorer {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.restoredCount = 0;
    this.errorCount = 0;
  }

  log(message) {
    console.log(`[${this.dryRun ? 'DRY-RUN' : 'RESTORING'}] ${message}`);
  }

  fixSyntaxPreservingData(content) {
    let fixed = content;
    let changes = [];

    // Step 1: Remove the malformed interface declaration
    const interfaceRegex = /export interface Cuisine \{[\s\S]*?\n\}/;
    if (interfaceRegex.test(fixed)) {
      fixed = fixed.replace(interfaceRegex, '');
      changes.push('Removed redundant interface declaration');
    }

    // Step 2: Add proper import at the top
    if (!fixed.includes("import type { Cuisine }")) {
      fixed = `import type { Cuisine } from '@/types/cuisine';\n\n${fixed}`;
      changes.push('Added proper Cuisine import');
    }

    // Step 3: Fix the specific malformed syntax patterns while preserving data
    
    // Fix `: string:, any: any: any,` -> `: string;` (but this shouldn't affect data)
    const beforeInterfaceFix = fixed;
    fixed = fixed.replace(/:\s*string:\s*,\s*any:\s*any:\s*any,/g, ': string;');
    if (fixed !== beforeInterfaceFix) {
      changes.push('Fixed malformed interface syntax');
    }

    // Fix object braces: `{,` -> `{`
    const beforeBraceFix = fixed;
    fixed = fixed.replace(/\{\s*,/g, '{');
    if (fixed !== beforeBraceFix) {
      changes.push('Fixed malformed object braces');
    }

    // Fix property assignments: Find lines that should be property assignments
    const lines = fixed.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Skip comments and empty lines
      if (line.trim().startsWith('//') || line.trim() === '') {
        fixedLines.push(line);
        continue;
      }
      
      // Fix specific pattern: property names that end with `,` but should end with `:`
      // This handles the object property assignment issues
      if (line.match(/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*,\s*$/) && i < lines.length - 1) {
        const nextLine = lines[i + 1];
        // If next line looks like it's continuing the object definition
        if (nextLine && (nextLine.trim().match(/^[a-zA-Z_$]/) || nextLine.includes('{'))) {
          const match = line.match(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*$/);
          if (match) {
            line = `${match[1]}${match[2]}:`;
            changes.push(`Fixed property assignment: ${match[2]}`);
          }
        }
      }
      
      // Fix lines with multiple issues like: `          lunch: {,`
      line = line.replace(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\{\s*,\s*$/, '$1$2: {');
      
      if (line !== originalLine) {
        changes.push(`Fixed line ${i + 1} syntax`);
      }
      
      fixedLines.push(line);
    }
    
    fixed = fixedLines.join('\n');

    // Step 4: Fix remaining structural issues
    // Fix property structure to match interface - change mealsByTime to dishes if needed
    if (fixed.includes('mealsByTime:') && !fixed.includes('dishes:')) {
      fixed = fixed.replace(/mealsByTime:/g, 'dishes:');
      changes.push('Updated mealsByTime to dishes to match interface');
    }

    // Step 5: Ensure proper export
    const exportMatch = fixed.match(/const\s+(\w+Cuisine):\s*Cuisine\s*=/);
    if (exportMatch && !fixed.includes(`export { ${exportMatch[1]} }`)) {
      // Clean up any existing malformed exports
      fixed = fixed.replace(/export default \w+Cuisine;?\s*$/, '');
      
      if (!fixed.trim().endsWith(';')) {
        fixed = fixed.trim() + ';';
      }
      fixed += `\n\nexport { ${exportMatch[1]} };\nexport default ${exportMatch[1]};`;
      changes.push(`Added proper exports for ${exportMatch[1]}`);
    }

    return { content: fixed, changes };
  }

  async restoreFile(fileInfo) {
    const currentPath = path.join(CUISINES_DIR, fileInfo.current);
    const backupPath = path.join(CUISINES_DIR, fileInfo.backup);
    
    try {
      if (!fs.existsSync(backupPath)) {
        this.log(`Backup file not found: ${fileInfo.backup}`);
        this.errorCount++;
        return false;
      }

      // Read the original content from backup
      const originalContent = fs.readFileSync(backupPath, 'utf8');
      
      // Fix syntax while preserving data
      const { content: fixedContent, changes } = this.fixSyntaxPreservingData(originalContent);

      this.log(`Restoring ${fileInfo.current} with data from ${fileInfo.backup}`);
      if (changes.length > 0) {
        this.log(`Applied ${changes.length} syntax fixes:`);
        changes.forEach(change => this.log(`  - ${change}`));
      }

      if (!this.dryRun) {
        fs.writeFileSync(currentPath, fixedContent, 'utf8');
        this.log(`Successfully restored ${fileInfo.current} with original data`);
      }

      this.restoredCount++;
      return true;

    } catch (error) {
      this.log(`Error restoring ${fileInfo.current}: ${error.message}`);
      this.errorCount++;
      return false;
    }
  }

  async restoreAllFiles() {
    this.log(`Starting ${this.dryRun ? 'dry run' : 'restoration'} of cuisine data...`);
    this.log('This will restore your original cuisine data while fixing syntax errors');
    
    for (const fileInfo of FILES_TO_RESTORE) {
      await this.restoreFile(fileInfo);
    }

    this.log(`\nSummary:`);
    this.log(`  Files processed: ${FILES_TO_RESTORE.length}`);
    this.log(`  Files restored: ${this.restoredCount}`);
    this.log(`  Errors encountered: ${this.errorCount}`);
    
    if (this.dryRun) {
      this.log(`\nTo apply restoration, run: node restore-cuisine-data.js`);
    } else {
      this.log(`\nYour original cuisine data has been restored with syntax fixes applied!`);
    }
  }
}

// Main execution
async function main() {
  const restorer = new CuisineDataRestorer(DRY_RUN);
  await restorer.restoreAllFiles();
}

main().catch(error => {
  console.error('Restoration failed:', error);
  process.exit(1);
}); 
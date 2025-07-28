#!/usr/bin/env node

/**
 * Fix Broken Import Statements
 * 
 * Fixes import statements that were broken by the console replacement script
 */

const fs = require('fs');
const path = require('path');

class BrokenImportFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
  }

  async fixBrokenImports() {
    console.log('🔧 Fixing Broken Import Statements');
    console.log('===================================');
    
    const files = this.getFilesWithBrokenImports();
    console.log(`📁 Found ${files.length} files with broken imports\n`);

    let fixedCount = 0;
    
    for (const file of files) {
      try {
        if (this.fixFileImports(file)) {
          console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} files`);
    return fixedCount;
  }

  getFilesWithBrokenImports() {
    const files = [];
    
    const walkDir = (dir) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (this.isTypeScriptFile(fullPath) && this.hasBrokenImports(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(this.srcDir);
    return files;
  }

  isTypeScriptFile(filePath) {
    return /\.(ts|tsx)$/.test(filePath);
  }

  hasBrokenImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for various broken patterns
      return content.includes("import { \nimport { log } from '@/services/LoggingService';") ||
             content.includes("import type {\nimport { log } from '@/services/LoggingService';") ||
             content.includes("} from '@/services/LoggingService';\n}") ||
             content.includes("} from '@/services/LoggingService';\n  ");
    } catch (error) {
      return false;
    }
  }

  fixFileImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix pattern 1: import { \nimport { log }
    content = content.replace(
      /import \{ \nimport \{ log \} from '@\/services\/LoggingService';\n/g,
      "import { log } from '@/services/LoggingService';\nimport { \n"
    );
    
    // Fix pattern 2: import type {\nimport { log }
    content = content.replace(
      /import type \{\nimport \{ log \} from '@\/services\/LoggingService';\n/g,
      "import { log } from '@/services/LoggingService';\nimport type {\n"
    );
    
    // Fix pattern 3: logging import in middle of multiline import
    content = content.replace(
      /(\w+,\s*\n)import \{ log \} from '@\/services\/LoggingService';\n(\s+)/g,
      "$1$2"
    );
    
    // Fix pattern 4: logging import breaking closing brace
    content = content.replace(
      /import \{ log \} from '@\/services\/LoggingService';\n(\s*[^}]*)\} from/g,
      "$1} from"
    );
    
    // Add logging import at the top if it was removed
    if (originalContent.includes("import { log } from '@/services/LoggingService';") && 
        !content.includes("import { log } from '@/services/LoggingService';")) {
      
      // Find the best place to add it
      const lines = content.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import ')) {
          insertIndex = i + 1;
        } else if (line === '' && insertIndex > 0) {
          break;
        } else if (line && !line.startsWith('//') && !line.startsWith('/*') && insertIndex > 0) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, "import { log } from '@/services/LoggingService';");
      content = lines.join('\n');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  }
}

async function main() {
  const fixer = new BrokenImportFixer();
  
  try {
    const fixedCount = await fixer.fixBrokenImports();
    
    if (fixedCount > 0) {
      console.log('\n🔍 Validating fixes...');
      const { execSync } = require('child_process');
      
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        console.log('🎉 All import issues fixed!');
      } catch (error) {
        console.log('⚠️  Some TypeScript errors remain, checking specific issues...');
        
        try {
          const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });
          const errorLines = output.split('\n').filter(line => line.includes('error TS'));
          console.log(`Found ${errorLines.length} remaining TypeScript errors`);
          
          if (errorLines.length < 20) {
            console.log('Remaining errors:');
            errorLines.slice(0, 10).forEach(line => console.log(`  ${line}`));
          }
        } catch (e) {
          // Ignore
        }
      }
    } else {
      console.log('✨ No broken imports found');
    }
  } catch (error) {
    console.error('❌ Failed to fix imports:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BrokenImportFixer };
#!/usr/bin/env node

/**
 * Fix Console Import Issues
 * 
 * Fixes the import placement issues caused by the console replacement script
 */

const fs = require('fs');
const path = require('path');

class ConsoleImportFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), 'src');
  }

  async fixImports() {
    console.log('🔧 Fixing Console Import Issues');
    console.log('================================');
    
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
      
      // Check for the specific pattern that indicates broken imports
      return content.includes("import { log } from '@/services/LoggingService';\nimport {") ||
             content.includes("import { log } from '@/services/LoggingService';\nconst") ||
             content.includes("import { log } from '@/services/LoggingService';\n}");
    } catch (error) {
      return false;
    }
  }

  fixFileImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let fixed = false;
    let loggingImportIndex = -1;
    let lastImportIndex = -1;
    
    // Find the logging import and last real import
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === "import { log } from '@/services/LoggingService';") {
        loggingImportIndex = i;
      } else if (line.startsWith('import ') && !line.includes('@/services/LoggingService')) {
        lastImportIndex = i;
      } else if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('import ') && lastImportIndex >= 0) {
        // Found first non-import line
        break;
      }
    }
    
    // If logging import is not in the right place, move it
    if (loggingImportIndex >= 0 && loggingImportIndex !== lastImportIndex + 1) {
      // Remove the logging import from its current position
      lines.splice(loggingImportIndex, 1);
      
      // Recalculate lastImportIndex after removal
      lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import ') && !line.includes('@/services/LoggingService')) {
          lastImportIndex = i;
        } else if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('import ') && lastImportIndex >= 0) {
          break;
        }
      }
      
      // Insert the logging import after the last import
      const insertIndex = lastImportIndex >= 0 ? lastImportIndex + 1 : 0;
      lines.splice(insertIndex, 0, "import { log } from '@/services/LoggingService';");
      
      fixed = true;
    }
    
    if (fixed) {
      fs.writeFileSync(filePath, lines.join('\n'));
    }
    
    return fixed;
  }
}

async function main() {
  const fixer = new ConsoleImportFixer();
  
  try {
    const fixedCount = await fixer.fixImports();
    
    if (fixedCount > 0) {
      console.log('\n🔍 Validating fixes...');
      const { execSync } = require('child_process');
      
      try {
        execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ TypeScript compilation successful');
        console.log('🎉 All import issues fixed!');
      } catch (error) {
        console.log('⚠️  Some TypeScript errors remain, but imports are fixed');
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

module.exports = { ConsoleImportFixer };
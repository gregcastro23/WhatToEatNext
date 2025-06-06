#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Restoration script to restore abbreviated/placeholder files
 * Prioritizes files with backups first, then applies syntax fixes
 */

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const FORCE = process.argv.includes('--force');

// Priority order for restoration
const RESTORATION_PRIORITIES = [
  // Critical cuisine files
  { pattern: /src\/data\/cuisines\/.*\.ts$/, priority: 1, description: 'Cuisine data files' },
  // Core alchemical engine
  { pattern: /src\/(calculations|lib)\/alchemicalEngine\.ts$/, priority: 2, description: 'Core alchemical engine' },
  { pattern: /src\/utils\/alchemical.*\.ts$/, priority: 2, description: 'Alchemical utilities' },
  // Data standardization (currently broken)
  { pattern: /src\/utils\/dataStandardization\.ts$/, priority: 2, description: 'Data standardization utility' },
  // Key ingredient files
  { pattern: /src\/data\/ingredients\/.*\.ts$/, priority: 3, description: 'Ingredient data files' },
  // Core utilities
  { pattern: /src\/utils\/(elementalUtils|foodRecommender|ingredientRecommender)\.ts$/, priority: 4, description: 'Core utility functions' },
  // Other utilities
  { pattern: /src\/utils\/.*\.ts$/, priority: 5, description: 'Other utility functions' },
  // Components
  { pattern: /src\/components\/.*\.tsx?$/, priority: 6, description: 'React components' },
  // Type definitions
  { pattern: /src\/types\/.*\.ts$/, priority: 7, description: 'Type definitions' }
];

// Critical files that need immediate attention
const CRITICAL_FILES = [
  'src/data/cuisines/japanese.ts',
  'src/data/cuisines/korean.ts', 
  'src/data/cuisines/mexican.ts',
  'src/utils/dataStandardization.ts',
  'src/utils/alchemicalCalculations.ts',
  'src/calculations/alchemicalEngine.ts'
];

// Common syntax error patterns and their fixes
const SYNTAX_FIXES = [
  {
    pattern: /\bany:/g,
    replacement: 'any',
    description: 'Fix TypeScript any: syntax errors'
  },
  {
    pattern: /let\s+([^=]*?)=/g,
    replacement: 'let $1 =',
    description: 'Fix malformed let declarations'
  },
  {
    pattern: /(\w+)\s*},\s*$/gm,
    replacement: '$1\n  },',
    description: 'Fix trailing comma-brace syntax'
  },
  {
    pattern: /import\s+@\/types\s+from\s+'alchemy\s*'/g,
    replacement: "import type { ElementalAffinity } from '@/types/alchemy'",
    description: 'Fix broken import statements'
  },
  {
    pattern: /\bposit:\s*anyi:\s*anyo:\s*anyn:\s*anys:/g,
    replacement: 'positions:',
    description: 'Fix corrupted parameter names'
  },
  {
    pattern: /\bcate:\s*anyg:\s*anyo:\s*anyr:\s*anyy:/g,
    replacement: 'category:',
    description: 'Fix corrupted parameter names'
  }
];

class FileRestorer {
  constructor() {
    this.restored = [];
    this.failed = [];
    this.syntaxFixed = [];
    this.backupRestored = [];
  }

  async restoreFiles() {
    console.log('🔄 Starting systematic file restoration...');
    if (DRY_RUN) {
      console.log('🧪 Running in DRY RUN mode');
    }

    // Step 1: Restore critical files with backups first
    await this.restoreFromBackups();
    
    // Step 2: Fix specific critical files that need manual restoration
    await this.restoreCriticalFiles();
    
    // Step 3: Apply syntax fixes to remaining files
    await this.applySyntaxFixes();
    
    this.generateReport();
  }

  async restoreFromBackups() {
    console.log('\n📂 Phase 1: Restoring files from backups...');
    
    // First, find all backup files
    const backupFiles = await this.findBackupFiles();
    
    // Sort by priority
    const prioritizedBackups = backupFiles.sort((a, b) => {
      const aPriority = this.getFilePriority(a.originalFile);
      const bPriority = this.getFilePriority(b.originalFile);
      return aPriority - bPriority;
    });

    for (const backup of prioritizedBackups) {
      if (CRITICAL_FILES.includes(backup.originalFile)) {
        await this.restoreFromBackup(backup);
      }
    }
  }

  async findBackupFiles() {
    const backupFiles = [];
    
    for (const target of ['src/data', 'src/utils', 'src/components', 'src/lib', 'src/calculations']) {
      await this.scanForBackups(target, backupFiles);
    }
    
    return backupFiles;
  }

  async scanForBackups(dirPath, backupFiles) {
    const fullPath = path.join(__dirname, dirPath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(__dirname, entryPath);
        
        if (entry.isDirectory()) {
          await this.scanForBackups(relativePath, backupFiles);
        } else if (entry.isFile() && this.isBackupFile(entry.name)) {
          const originalFile = this.getOriginalFileName(entry.name);
          const originalPath = path.join(path.dirname(relativePath), originalFile);
          
          backupFiles.push({
            backupFile: relativePath,
            originalFile: originalPath,
            backupName: entry.name
          });
        }
      }
    } catch (error) {
      if (VERBOSE) {
        console.log(`⚠️  Cannot scan ${dirPath}: ${error.message}`);
      }
    }
  }

  isBackupFile(filename) {
    return filename.includes('.backup') || 
           filename.includes('.bak') || 
           filename.includes('.backup-');
  }

  getOriginalFileName(backupFilename) {
    return backupFilename
      .replace(/\.backup.*$/, '')
      .replace(/\.bak.*$/, '');
  }

  getFilePriority(filepath) {
    for (const rule of RESTORATION_PRIORITIES) {
      if (rule.pattern.test(filepath)) {
        return rule.priority;
      }
    }
    return 999; // Lowest priority
  }

  async restoreFromBackup(backup) {
    try {
      if (VERBOSE) {
        console.log(`🔄 Restoring ${backup.originalFile} from ${backup.backupFile}`);
      }

      // Check if we should choose the best backup
      const bestBackup = await this.chooseBestBackup(backup);
      
      if (!DRY_RUN) {
        const backupContent = await fs.readFile(bestBackup.backupFile, 'utf-8');
        await fs.writeFile(backup.originalFile, backupContent, 'utf-8');
      }

      this.backupRestored.push({
        file: backup.originalFile,
        backup: bestBackup.backupFile,
        size: (await fs.stat(bestBackup.backupFile)).size
      });

      if (VERBOSE) {
        console.log(`✅ Restored ${backup.originalFile}`);
      }

    } catch (error) {
      console.error(`❌ Failed to restore ${backup.originalFile}: ${error.message}`);
      this.failed.push({
        file: backup.originalFile,
        error: error.message
      });
    }
  }

  async chooseBestBackup(backup) {
    // Look for multiple backup versions and choose the largest/richest one
    const dir = path.dirname(backup.backupFile);
    const baseName = this.getOriginalFileName(path.basename(backup.backupFile));
    
    try {
      const entries = await fs.readdir(dir);
      const allBackups = entries
        .filter(entry => entry.startsWith(baseName) && this.isBackupFile(entry))
        .map(entry => ({
          backupFile: path.join(dir, entry),
          name: entry
        }));

      if (allBackups.length <= 1) {
        return backup;
      }

      // Choose the largest backup (likely the richest content)
      let bestBackup = backup;
      let bestSize = 0;

      for (const alt of allBackups) {
        try {
          const stats = await fs.stat(alt.backupFile);
          if (stats.size > bestSize) {
            bestSize = stats.size;
            bestBackup = alt;
          }
        } catch (error) {
          // Skip this backup if we can't read it
        }
      }

      return bestBackup;
    } catch (error) {
      return backup; // Fall back to original if scanning fails
    }
  }

  async restoreCriticalFiles() {
    console.log('\n🚨 Phase 2: Restoring critical files...');

    // Special restoration for dataStandardization.ts
    await this.restoreDataStandardization();
    
    // Check if cuisine files need restoration from larger backups
    await this.restoreCuisineFiles();
  }

  async restoreDataStandardization() {
    const filepath = 'src/utils/dataStandardization.ts';
    
    try {
      if (VERBOSE) {
        console.log(`🔄 Restoring ${filepath} with proper implementation`);
      }

      const properImplementation = `import type { ElementalAffinity } from '@/types/alchemy';

// Utility to ensure elementalAffinity is always in object format
export function standardizeElementalAffinity(value: string | { base: string; decanModifiers?: Record<string, unknown> }): ElementalAffinity {
  if (typeof value === 'string') {
    return { base: value };
  }
  return value;
}

// Helper function to update entire ingredient objects
export function standardizeIngredient(ingredient: unknown): unknown {
  if (!ingredient || typeof ingredient !== 'object') {
    return ingredient;
  }
  
  const obj = ingredient as any;
  if (!obj.astrologicalProfile) {
    return ingredient;
  }

  return {
    ...obj,
    astrologicalProfile: {
      ...obj.astrologicalProfile,
      elementalAffinity: standardizeElementalAffinity(obj.astrologicalProfile.elementalAffinity)
    }
  };
}

// Normalize properties to ensure they're valid objects
export function normalizeProperties(properties: Record<string, unknown>): Record<string, unknown> {
  if (!properties || typeof properties !== 'object') {
    return {};
  }
  
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => 
      key && value !== undefined && value !== null
    )
  );
}

// Standard data validation
export function validateDataStructure(data: unknown): boolean {
  return data !== null && data !== undefined && typeof data === 'object';
}
`;

      if (!DRY_RUN) {
        await fs.writeFile(filepath, properImplementation, 'utf-8');
      }

      this.restored.push({
        file: filepath,
        method: 'manual restoration',
        description: 'Restored proper data standardization implementation'
      });

      console.log(`✅ Restored ${filepath} with proper implementation`);

    } catch (error) {
      console.error(`❌ Failed to restore ${filepath}: ${error.message}`);
      this.failed.push({
        file: filepath,
        error: error.message
      });
    }
  }

  async restoreCuisineFiles() {
    // Check if Japanese, Korean, Mexican cuisine files need restoration from .bak files
    const cuisineFiles = [
      'src/data/cuisines/japanese.ts',
      'src/data/cuisines/korean.ts',
      'src/data/cuisines/mexican.ts'
    ];

    for (const cuisineFile of cuisineFiles) {
      await this.restoreCuisineFromBak(cuisineFile);
    }
  }

  async restoreCuisineFromBak(cuisineFile) {
    const bakFile = cuisineFile.replace('.ts', '.ts.bak');
    
    try {
      // Check if .bak file exists and is larger than current file
      const [currentStats, bakStats] = await Promise.all([
        fs.stat(cuisineFile).catch(() => null),
        fs.stat(bakFile).catch(() => null)
      ]);

      if (bakStats && (!currentStats || bakStats.size > currentStats.size * 2)) {
        if (VERBOSE) {
          console.log(`🔄 Restoring ${cuisineFile} from larger .bak file`);
        }

        if (!DRY_RUN) {
          const bakContent = await fs.readFile(bakFile, 'utf-8');
          await fs.writeFile(cuisineFile, bakContent, 'utf-8');
        }

        this.restored.push({
          file: cuisineFile,
          method: 'bak file restoration',
          description: `Restored from ${bakFile} (${bakStats.size} bytes)`
        });

        console.log(`✅ Restored ${cuisineFile} from .bak file`);
      }

    } catch (error) {
      if (VERBOSE) {
        console.log(`⚠️  Could not restore ${cuisineFile}: ${error.message}`);
      }
    }
  }

  async applySyntaxFixes() {
    console.log('\n🔧 Phase 3: Applying syntax fixes...');

    // Apply fixes to files with high syntax error counts
    const targetFiles = await this.findFilesNeedingSyntaxFixes();
    
    for (const file of targetFiles.slice(0, 20)) { // Limit to first 20 for now
      await this.applySyntaxFixesToFile(file);
    }
  }

  async findFilesNeedingSyntaxFixes() {
    // Return a list of files that need syntax fixes, prioritized
    const files = [];
    
    for (const target of ['src/utils', 'src/data', 'src/components']) {
      await this.scanForSyntaxErrorFiles(target, files);
    }
    
    return files.sort((a, b) => this.getFilePriority(a) - this.getFilePriority(b));
  }

  async scanForSyntaxErrorFiles(dirPath, files) {
    const fullPath = path.join(__dirname, dirPath);
    
    try {
      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(fullPath, entry.name);
        const relativePath = path.relative(__dirname, entryPath);
        
        if (entry.isDirectory()) {
          await this.scanForSyntaxErrorFiles(relativePath, files);
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          // Check if file has syntax errors that need fixing
          const hasSyntaxErrors = await this.checkForSyntaxErrors(entryPath);
          if (hasSyntaxErrors) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  async checkForSyntaxErrors(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      
      // Check for common syntax error patterns
      for (const fix of SYNTAX_FIXES) {
        if (fix.pattern.test(content)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async applySyntaxFixesToFile(filepath) {
    try {
      if (VERBOSE) {
        console.log(`🔧 Applying syntax fixes to ${filepath}`);
      }

      let content = await fs.readFile(filepath, 'utf-8');
      let fixesApplied = 0;

      for (const fix of SYNTAX_FIXES) {
        const matches = content.match(fix.pattern);
        if (matches && matches.length > 0) {
          content = content.replace(fix.pattern, fix.replacement);
          fixesApplied += matches.length;
        }
      }

      if (fixesApplied > 0 && !DRY_RUN) {
        await fs.writeFile(filepath, content, 'utf-8');
      }

      if (fixesApplied > 0) {
        this.syntaxFixed.push({
          file: filepath,
          fixesApplied,
          description: `Applied ${fixesApplied} syntax fixes`
        });

        if (VERBOSE) {
          console.log(`✅ Applied ${fixesApplied} fixes to ${filepath}`);
        }
      }

    } catch (error) {
      console.error(`❌ Failed to fix syntax in ${filepath}: ${error.message}`);
      this.failed.push({
        file: filepath,
        error: error.message
      });
    }
  }

  generateReport() {
    console.log('\n📊 RESTORATION REPORT\n');
    console.log('='.repeat(50));

    console.log(`✅ SUCCESSFULLY RESTORED:`);
    console.log(`   Files restored from backups: ${this.backupRestored.length}`);
    console.log(`   Files manually restored: ${this.restored.length}`);
    console.log(`   Files with syntax fixes: ${this.syntaxFixed.length}`);

    if (this.backupRestored.length > 0) {
      console.log(`\n📂 BACKUP RESTORATIONS:`);
      this.backupRestored.forEach(item => {
        console.log(`   ✅ ${item.file} (${item.size} bytes)`);
      });
    }

    if (this.restored.length > 0) {
      console.log(`\n🔄 MANUAL RESTORATIONS:`);
      this.restored.forEach(item => {
        console.log(`   ✅ ${item.file} - ${item.description}`);
      });
    }

    if (this.syntaxFixed.length > 0) {
      console.log(`\n🔧 SYNTAX FIXES:`);
      this.syntaxFixed.slice(0, 10).forEach(item => {
        console.log(`   ✅ ${item.file} - ${item.description}`);
      });
      if (this.syntaxFixed.length > 10) {
        console.log(`   ... and ${this.syntaxFixed.length - 10} more files`);
      }
    }

    if (this.failed.length > 0) {
      console.log(`\n❌ FAILED RESTORATIONS:`);
      this.failed.forEach(item => {
        console.log(`   ❌ ${item.file} - ${item.error}`);
      });
    }

    console.log(`\n💡 NEXT STEPS:`);
    console.log(`1. Run 'yarn build' to check for TypeScript errors`);
    console.log(`2. Run the audit script again to verify improvements`);
    console.log(`3. Test core functionality (alchemical engine, cuisine data)`);
    
    if (!DRY_RUN) {
      console.log(`4. If successful, consider removing .backup/.bak files`);
    } else {
      console.log(`4. Run without --dry-run to apply changes`);
    }
  }
}

async function main() {
  const restorer = new FileRestorer();
  await restorer.restoreFiles();
}

// Run the restoration
main().catch(error => {
  console.error('❌ Restoration failed:', error);
  process.exit(1);
}); 
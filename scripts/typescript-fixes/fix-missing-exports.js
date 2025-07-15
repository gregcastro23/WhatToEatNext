#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

class MissingExportsFixer {
  constructor() {
    this.fixes = [];
    this.errorCount = 0;
  }

  log(message) {
    console.log(`[${DRY_RUN ? 'DRY-RUN' : 'EXECUTE'}] ${message}`);
  }

  error(message) {
    console.error(`[ERROR] ${message}`);
    this.errorCount++;
  }

  /**
   * Fix missing getBaseSignLongitude export
   */
  fixGetBaseSignLongitudeExport(content, filePath) {
    if (!filePath.includes('validatePlanetaryPositions.ts')) return { content, hasChanges: false };

    const patterns = [
      // Export getBaseSignLongitude function
      {
        search: /^function getBaseSignLongitude/m,
        replace: 'export function getBaseSignLongitude'
      }
    ];

    let modified = content;
    let hasChanges = false;

    patterns.forEach(pattern => {
      const newContent = modified.replace(pattern.search, pattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    });

    return { content: modified, hasChanges };
  }

  /**
   * Fix missing allRecipes export
   */
  fixAllRecipesExport(content, filePath) {
    if (!filePath.includes('src/data/recipes.ts')) return { content, hasChanges: false };

    const patterns = [
      // Add allRecipes export alias
      {
        search: /(export const getAllRecipes[^;]*;)/,
        replace: `$1

// Export alias for backward compatibility
export const allRecipes = getAllRecipes;`
      }
    ];

    let modified = content;
    let hasChanges = false;

    patterns.forEach(pattern => {
      const newContent = modified.replace(pattern.search, pattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    });

    return { content: modified, hasChanges };
  }

  /**
   * Fix missing getCurrentElementalState export
   */
  fixGetCurrentElementalStateExport(content, filePath) {
    if (!filePath.includes('elementalUtils.ts')) return { content, hasChanges: false };

    const patterns = [
      // Export getCurrentElementalState function if it exists
      {
        search: /^(function getCurrentElementalState)/m,
        replace: 'export $1'
      },
      // If it doesn't exist, add it based on getDefaultElementalProperties
      {
        search: /(export\s+\{\s*[^}]*\s*\};?\s*$)/m,
        replace: `// Export getCurrentElementalState for backward compatibility
export const getCurrentElementalState = getDefaultElementalProperties;

$1`
      }
    ];

    let modified = content;
    let hasChanges = false;

    // First try to export existing function
    const firstPattern = patterns[0];
    let newContent = modified.replace(firstPattern.search, firstPattern.replace);
    if (newContent !== modified) {
      hasChanges = true;
      modified = newContent;
    } else {
      // If no existing function, add alias
      const secondPattern = patterns[1];
      newContent = modified.replace(secondPattern.search, secondPattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    }

    return { content: modified, hasChanges };
  }

  /**
   * Fix missing CelestialPosition export from alchemy.ts
   */
  fixCelestialPositionExport(content, filePath) {
    if (!filePath.includes('types/alchemy.ts')) return { content, hasChanges: false };

    const patterns = [
      // Add CelestialPosition to export list if it exists in the file
      {
        search: /(export\s+type\s*\{[^}]*)(ZodiacSign[^}]*\})/,
        replace: '$1$2, CelestialPosition'
      },
      // If no export block, check if CelestialPosition interface exists and export it
      {
        search: /^(interface CelestialPosition)/m,
        replace: 'export $1'
      }
    ];

    let modified = content;
    let hasChanges = false;

    patterns.forEach(pattern => {
      const newContent = modified.replace(pattern.search, pattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    });

    return { content: modified, hasChanges };
  }

  /**
   * Fix missing Recipe export from validators.ts
   */
  fixRecipeValidatorExport(content, filePath) {
    if (!filePath.includes('types/validators.ts')) return { content, hasChanges: false };

    const patterns = [
      // Export Recipe type
      {
        search: /^import type { ElementalProperties, Recipe, Ingredient, Season } from '\.\/alchemy';$/m,
        replace: `import type { ElementalProperties, Recipe, Ingredient, Season } from './alchemy';

// Re-export Recipe for convenience
export type { Recipe } from './alchemy';`
      }
    ];

    let modified = content;
    let hasChanges = false;

    patterns.forEach(pattern => {
      const newContent = modified.replace(pattern.search, pattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    });

    return { content: modified, hasChanges };
  }

  /**
   * Fix missing AlchemicalContext types export
   */
  fixAlchemicalContextExport(content, filePath) {
    if (!filePath.includes('contexts/alchemicalTypes')) return { content, hasChanges: false };

    // Create the missing alchemicalTypes file if it doesn't exist
    const alchemicalTypesContent = `import type { ElementalProperties } from '@/types/alchemy';

export interface AlchemicalState {
  elementalProperties: ElementalProperties;
  isCalculating: boolean;
  lastUpdated: Date | null;
}

export interface AlchemicalContextType {
  state: AlchemicalState;
  updateElementalProperties: (properties: Partial<ElementalProperties>) => void;
  resetState: () => void;
}
`;

    return { content: alchemicalTypesContent, hasChanges: true };
  }

  /**
   * Fix missing handleError method in ErrorHandlerService
   */
  fixErrorHandlerService(content, filePath) {
    if (!filePath.includes('errorHandler.ts')) return { content, hasChanges: false };

    const patterns = [
      // Add handleError method if it's missing
      {
        search: /(class ErrorHandlerService\s*\{[^}]*)(logError[^}]*\})/,
        replace: `$1$2

  handleError(error: Error, context?: any): void {
    this.logError(error, context);
  }`
      }
    ];

    let modified = content;
    let hasChanges = false;

    patterns.forEach(pattern => {
      const newContent = modified.replace(pattern.search, pattern.replace);
      if (newContent !== modified) {
        hasChanges = true;
        modified = newContent;
      }
    });

    return { content: modified, hasChanges };
  }

  async processFile(filePath) {
    try {
      let content = '';
      
      // Handle creation of missing files
      if (filePath.includes('contexts/alchemicalTypes') && !fs.existsSync(filePath)) {
        // Create the directory if it doesn't exist
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          if (!DRY_RUN) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }
        const result = this.fixAlchemicalContextExport('', filePath);
        if (result.hasChanges) {
          this.fixes.push(filePath);
          this.log(`Created missing file: ${filePath}`);
          if (!DRY_RUN) {
            fs.writeFileSync(filePath, result.content, 'utf8');
          }
        }
        return;
      }

      if (!fs.existsSync(filePath)) {
        this.log(`File not found: ${filePath}`);
        return;
      }

      content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let totalChanges = false;

      // Apply all fixes
      const fixes = [
        this.fixGetBaseSignLongitudeExport.bind(this),
        this.fixAllRecipesExport.bind(this),
        this.fixGetCurrentElementalStateExport.bind(this),
        this.fixCelestialPositionExport.bind(this),
        this.fixRecipeValidatorExport.bind(this),
        this.fixErrorHandlerService.bind(this)
      ];

      for (const fix of fixes) {
        const result = fix(modified, filePath);
        if (result.hasChanges) {
          modified = result.content;
          totalChanges = true;
        }
      }

      if (totalChanges) {
        this.fixes.push(filePath);
        this.log(`Fixed missing exports in: ${filePath}`);
        
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, modified, 'utf8');
        }
      }
    } catch (error) {
      this.error(`Error processing ${filePath}: ${error.message}`);
    }
  }

  async run() {
    const targetFiles = [
      'src/utils/validatePlanetaryPositions.ts',
      'src/data/recipes.ts',
      'src/utils/elementalUtils.ts',
      'src/types/alchemy.ts',
      'src/types/validators.ts',
      'src/contexts/alchemicalTypes/index.ts',
      'src/services/errorHandler.ts'
    ];

    this.log(`Starting missing exports fixes...`);
    this.log(`Target files: ${targetFiles.length}`);

    for (const file of targetFiles) {
      const fullPath = path.join(process.cwd(), file);
      await this.processFile(fullPath);
    }

    this.log(`\nSummary:`);
    this.log(`Files processed: ${targetFiles.length}`);
    this.log(`Files modified: ${this.fixes.length}`);
    this.log(`Errors encountered: ${this.errorCount}`);

    if (this.fixes.length > 0) {
      this.log(`\nModified files:`);
      this.fixes.forEach(file => this.log(`  - ${file}`));
    }

    if (DRY_RUN) {
      this.log(`\nDry run completed. Use without --dry-run to apply changes.`);
    }
  }
}

const fixer = new MissingExportsFixer();
fixer.run().catch(console.error); 
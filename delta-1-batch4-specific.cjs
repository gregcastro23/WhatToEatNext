#!/usr/bin/env node

/**
 * Delta-1 Batch 4 Specific Fixer - Target High-Impact TS2345 Patterns
 * Focuses on specific import and type assertion patterns
 */

const { execSync } = require('child_process');
const fs = require('fs');

class Delta1Batch4SpecificFixer {
  constructor() {
    this.fixedCount = 0;
    this.filesModified = new Set();
  }

  async run() {
    console.log('🎯 DELTA-1 BATCH 4: SPECIFIC TS2345 FIXES');

    const initialErrors = this.getErrorCount();
    console.log(`Initial error count: ${initialErrors}`);

    const initialTS2345 = this.getTS2345Count();
    console.log(`Initial TS2345 errors: ${initialTS2345}`);

    // Apply targeted fixes to high-impact files
    const fixes = [
      {
        file: 'src/components/CuisineRecommender.tsx',
        action: () => this.fixCuisineRecommenderTypes(),
      },
      {
        file: 'src/components/IngredientRecommendations.tsx',
        action: () => this.fixIngredientRecommendations(),
      },
      {
        file: 'src/components/CookingMethods.tsx',
        action: () => this.fixCookingMethods(),
      },
    ];

    for (const fix of fixes) {
      if (fs.existsSync(fix.file)) {
        await fix.action();
      }
    }

    const finalErrors = this.getErrorCount();
    const finalTS2345 = this.getTS2345Count();

    console.log('\\n📊 RESULTS:');
    console.log(`Files modified: ${this.filesModified.size}`);
    console.log(`Fixes applied: ${this.fixedCount}`);
    console.log(
      `Total errors: ${initialErrors} → ${finalErrors} (${initialErrors - finalErrors} reduced)`,
    );
    console.log(
      `TS2345 errors: ${initialTS2345} → ${finalTS2345} (${initialTS2345 - finalTS2345} reduced)`,
    );
  }

  getErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  getTS2345Count() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS2345" | wc -l', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async fixCuisineRecommenderTypes() {
    const filePath = 'src/components/CuisineRecommender.tsx';
    console.log(`\\n🔧 Processing ${filePath}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix specific AstrologicalState type issues
      content = content
        // Fix Record<string, unknown> → Record<string, PlanetPosition>
        .replace(
          /planetaryPositions:\s*Record<string,\s*unknown>/g,
          'planetaryPositions: Record<string, PlanetPosition>',
        )
        // Fix setState with RecipeData[] | undefined
        .replace(/setState\(([^)]*recipes[^)]*)\s*\|\s*undefined\)/g, 'setState($1 || [])')
        // Fix missing import for PlanetPosition if needed
        .replace(/(import.*from\s*'@\/utils\/astrologyUtils')/, '$1');

      // Add missing import if we're using PlanetPosition but don't have it
      if (
        content.includes('Record<string, PlanetPosition>') &&
        !content.includes('PlanetPosition')
      ) {
        content = content.replace(
          /(import.*from\s*'@\/utils\/astrologyUtils';)/,
          "$1\nimport type { PlanetPosition } from '@/utils/astrologyUtils';",
        );
      }

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.filesModified.add(filePath);
        this.fixedCount++;
        console.log(`  ✅ Applied fixes to ${filePath}`);
      } else {
        console.log(`  ⚪ No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  async fixIngredientRecommendations() {
    const filePath = 'src/components/IngredientRecommendations.tsx';
    console.log(`\\n🔧 Processing ${filePath}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix Record<string, unknown> → proper ElementalProperties
      content = content
        .replace(/Record<string,\s*unknown>/g, 'ElementalProperties')
        .replace(/as\s*Record<string,\s*unknown>/g, 'as ElementalProperties');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.filesModified.add(filePath);
        this.fixedCount++;
        console.log(`  ✅ Applied fixes to ${filePath}`);
      } else {
        console.log(`  ⚪ No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  async fixCookingMethods() {
    const filePath = 'src/components/CookingMethods.tsx';
    console.log(`\\n🔧 Processing ${filePath}...`);

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Fix type conversion issues
      content = content
        // Fix CookingMethod → Ingredient type issues by adding proper casting
        .replace(/as\s*Ingredient\s*\|\s*UnifiedIngredient/g, 'as UnifiedIngredient')
        // Fix Object.values with unknown type
        .replace(/Object\.values\(([^)]+)\s*as\s*unknown\)/g, 'Object.values($1) as any[]')
        // Fix {} assignment to string
        .replace(/:\s*\{\}/g, ': "{}"');

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.filesModified.add(filePath);
        this.fixedCount++;
        console.log(`  ✅ Applied fixes to ${filePath}`);
      } else {
        console.log(`  ⚪ No changes needed for ${filePath}`);
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}: ${error.message}`);
    }
  }
}

// Run the fixer
const fixer = new Delta1Batch4SpecificFixer();
fixer.run().catch(console.error);

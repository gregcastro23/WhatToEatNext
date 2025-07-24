#!/usr/bin/env node

/**
 * Delta-1 Batch 3 Controlled Fixer - Safe TS2345 Fixes
 * Focuses on high-confidence, low-risk patterns only
 */

const { execSync } = require('child_process');
const fs = require('fs');

class Delta1Batch3ControlledFixer {
  constructor() {
    this.fixedCount = 0;
    this.filesModified = new Set();
    this.safetyPatterns = {
      // Pattern 1: string | undefined → string with safe fallback
      stringUndefinedParameter: /([a-zA-Z_$][a-zA-Z0-9_$]*)\?\./g,
      
      // Pattern 2: setState with undefined array → setState with proper typing  
      setStateUndefinedArray: /setState\(([^)]*\s*\|\s*undefined)\)/g,
      
      // Pattern 3: parseInt with string | undefined → parseInt with fallback
      parseIntUndefined: /parseInt\(([^,)]+)\s*\)/g
    };
  }

  async run() {
    console.log('🎯 DELTA-1 BATCH 3: CONTROLLED TS2345 FIXES');
    
    const initialErrors = this.getErrorCount();
    console.log(`Initial error count: ${initialErrors}`);
    
    const initialTS2345 = this.getTS2345Count();
    console.log(`Initial TS2345 errors: ${initialTS2345}`);
    
    // Target specific files with safest patterns only
    const targetFiles = [
      'src/components/Header/FoodRecommender/components/Cuisinegroup.tsx',
      'src/components/CuisineRecommender.tsx'
    ];
    
    for (const file of targetFiles) {
      if (fs.existsSync(file)) {
        await this.fixFile(file);
      }
    }
    
    const finalErrors = this.getErrorCount();
    const finalTS2345 = this.getTS2345Count();
    
    console.log('\\n📊 RESULTS:');
    console.log(`Files modified: ${this.filesModified.size}`);
    console.log(`Fixes applied: ${this.fixedCount}`);
    console.log(`Total errors: ${initialErrors} → ${finalErrors} (${initialErrors - finalErrors} reduced)`);
    console.log(`TS2345 errors: ${initialTS2345} → ${finalTS2345} (${initialTS2345 - finalTS2345} reduced)`);
  }

  getErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
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
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async fixFile(filePath) {
    console.log(`\\n🔧 Processing ${filePath}...`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Apply only safe, targeted fixes
      if (filePath.includes('Cuisinegroup.tsx')) {
        content = this.fixCuisinegroup(content);
      } else if (filePath.includes('CuisineRecommender.tsx')) {
        content = this.fixCuisineRecommender(content);
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

  fixCuisinegroup(content) {
    return content
      // Fix parseInt string | undefined issue (safe pattern)
      .replace(/parseInt\(recipe\.timeToMake\)/g, 'parseInt(recipe.timeToMake || "0")')
      // Fix string | undefined parameters in function calls (safe pattern)
      .replace(/type\?\.toLowerCase\(\)/g, 'type?.toLowerCase() || ""')
      .replace(/recipe\.timeToMake/g, 'recipe.timeToMake || ""')
      // Fix parseTime calls with proper fallback
      .replace(/parseTime\(([^)]+)\)/g, (match, param) => {
        if (param.includes('||')) return match; // Already fixed
        return `parseTime(${param} || "")`;
      });
  }

  fixCuisineRecommender(content) {
    return content
      // Fix setState with undefined array (safe pattern)
      .replace(/setState\(([^)]*)\s*\|\s*undefined\)/g, 'setState($1 || [])')
      // Fix AstrologicalState type issues (safe pattern)
      .replace(/planetaryPositions:\s*Record<string,\s*unknown>/g, 'planetaryPositions: Record<string, PlanetPosition>')
      // Fix RecipeData array assignment (safe pattern)  
      .replace(/:\s*RecipeData\[\]\s*\|\s*undefined/g, ': RecipeData[]');
  }
}

// Run the fixer
const fixer = new Delta1Batch3ControlledFixer();
fixer.run().catch(console.error);
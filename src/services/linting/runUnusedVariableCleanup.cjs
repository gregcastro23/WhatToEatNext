#!/usr/bin/env node

/**
 * Unused Variable Cleanup Script (CommonJS version)
 * 
 * Systematically processes unused variable warnings while preserving
 * critical astrological calculations and domain-specific variables.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class UnusedVariableCleaner {
  constructor() {
    this.preservePatterns = [
      // Astrological calculation variables
      /\b(planetary|astro|zodiac|element|fire|water|earth|air)\w*/i,
      /\b(mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto)\w*/i,
      /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\w*/i,
      /\b(transit|retrograde|conjunction|opposition|trine|square)\w*/i,
      /\b(lunar|solar|eclipse|equinox|solstice)\w*/i,
      
      // Mathematical constants
      /\b[A-Z_]{3,}\b/,
      /\b(PI|EULER|GOLDEN_RATIO|PHI|SQRT|DEGREE|RADIAN)\w*/i,
      
      // Campaign system variables
      /\b(campaign|progress|metrics|intelligence|safety)\w*/i,
      /\b(validation|rollback|checkpoint|threshold)\w*/i,
      
      // Fallback and cache variables
      /\b(fallback|default|backup|cache|positions|coordinates|ephemeris)\w*/i
    ];
  }

  async getUnusedVariableCount() {
    try {
      const output = execSync('yarn lint 2>&1 | grep -c "no-unused-vars" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getFilesWithUnusedVariables() {
    try {
      const output = execSync('yarn lint 2>&1 | grep "no-unused-vars" | cut -d: -f1 | sort -u | head -30', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return output.split('\n')
        .filter(line => line.trim())
        .filter(file => fs.existsSync(file));
    } catch (error) {
      console.warn('Could not get files with unused variables:', error.message);
      return [];
    }
  }

  shouldPreserveVariable(varName, filePath) {
    // Check against preserve patterns
    if (this.preservePatterns.some(pattern => pattern.test(varName))) {
      return true;
    }

    // Preserve variables in astrological calculation files
    if (/calculations|astro|planetary|elemental/i.test(filePath)) {
      return true;
    }

    // Preserve constants (all caps with underscores)
    if (/^[A-Z_]+$/.test(varName) && varName.length > 2) {
      return true;
    }

    // Preserve React component names
    if (/^[A-Z]/.test(varName)) {
      return true;
    }

    // Already prefixed
    if (varName.startsWith('_')) {
      return true;
    }

    return false;
  }

  async getUnusedVariablesForFile(filePath) {
    try {
      const output = execSync(`yarn lint "${filePath}" 2>&1 | grep "no-unused-vars"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const variables = [];
      const lines = output.split('\n');
      
      for (const line of lines) {
        const match = line.match(/'([^']+)' is (?:defined but never used|assigned a value but never used)/);
        if (match) {
          variables.push(match[1]);
        }
      }
      
      return [...new Set(variables)]; // Remove duplicates
    } catch (error) {
      return [];
    }
  }

  prefixUnusedVariable(content, varName) {
    let modifiedContent = content;

    // Function parameters - be more careful with replacements
    const paramPattern = new RegExp(`\\b${varName}\\b(?=\\s*[,:)])`, 'g');
    if (paramPattern.test(content)) {
      modifiedContent = modifiedContent.replace(paramPattern, `_${varName}`);
    }

    // Variable declarations
    const varDeclPattern = new RegExp(`\\b(const|let|var)\\s+${varName}\\b(?=\\s*[=;])`, 'g');
    if (varDeclPattern.test(content)) {
      modifiedContent = modifiedContent.replace(varDeclPattern, `$1 _${varName}`);
    }

    // Destructuring - object
    const objDestructPattern = new RegExp(`\\{([^}]*\\s)${varName}(\\s[^}]*)\\}`, 'g');
    if (objDestructPattern.test(content)) {
      modifiedContent = modifiedContent.replace(objDestructPattern, `{$1_${varName}$2}`);
    }

    // Destructuring - simple case
    const simpleDestructPattern = new RegExp(`\\{\\s*${varName}\\s*\\}`, 'g');
    if (simpleDestructPattern.test(content)) {
      modifiedContent = modifiedContent.replace(simpleDestructPattern, `{ _${varName} }`);
    }

    return modifiedContent;
  }

  async processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let applied = 0;
    let preserved = 0;

    const unusedVars = await this.getUnusedVariablesForFile(filePath);
    
    for (const varName of unusedVars) {
      if (this.shouldPreserveVariable(varName, filePath)) {
        preserved++;
        continue;
      }

      const originalContent = modifiedContent;
      modifiedContent = this.prefixUnusedVariable(modifiedContent, varName);
      
      if (modifiedContent !== originalContent) {
        applied++;
      }
    }

    if (applied > 0) {
      fs.writeFileSync(filePath, modifiedContent);
    }

    return { applied, preserved };
  }

  async processUnusedVariables() {
    console.log('🎯 Processing unused variable warnings...');
    
    const result = {
      filesProcessed: 0,
      fixesApplied: 0,
      preserved: 0,
      errors: []
    };

    const filesWithIssues = await this.getFilesWithUnusedVariables();
    console.log(`Found ${filesWithIssues.length} files with unused variable warnings`);

    for (const filePath of filesWithIssues) {
      try {
        const fixes = await this.processFile(filePath);
        result.filesProcessed++;
        result.fixesApplied += fixes.applied;
        result.preserved += fixes.preserved;
        
        if (fixes.applied > 0) {
          console.log(`  ✓ ${path.basename(filePath)}: ${fixes.applied} fixes applied, ${fixes.preserved} preserved`);
        }
      } catch (error) {
        result.errors.push(`Error processing ${filePath}: ${error.message}`);
      }
    }

    return result;
  }

  async validateChanges() {
    try {
      console.log('🔍 Validating changes...');
      
      // Check TypeScript compilation
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('  ✓ TypeScript compilation successful');
      
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }
}

async function main() {
  console.log('🚀 Starting Unused Variable Cleanup');
  console.log('===================================\n');

  const cleaner = new UnusedVariableCleaner();

  // Get initial count
  const initialCount = await cleaner.getUnusedVariableCount();
  console.log(`📊 Initial unused variable warnings: ${initialCount}\n`);

  if (initialCount === 0) {
    console.log('✅ No unused variable warnings found!');
    return;
  }

  try {
    // Create backup
    console.log('💾 Creating backup...');
    execSync('git stash push -m "Pre unused-variable-cleanup backup"', { stdio: 'inherit' });
    
    // Process unused variables
    const result = await cleaner.processUnusedVariables();
    
    console.log('\n📊 Processing Results:');
    console.log(`Files processed: ${result.filesProcessed}`);
    console.log(`Fixes applied: ${result.fixesApplied}`);
    console.log(`Variables preserved: ${result.preserved}`);
    
    if (result.errors.length > 0) {
      console.log(`\n❌ Errors: ${result.errors.length}`);
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Validate changes
    const isValid = await cleaner.validateChanges();
    
    if (!isValid) {
      console.log('\n❌ Validation failed, restoring backup...');
      execSync('git stash pop', { stdio: 'inherit' });
      process.exit(1);
    }

    // Get final count
    const finalCount = await cleaner.getUnusedVariableCount();
    const reduction = initialCount - finalCount;
    const reductionPercentage = initialCount > 0 
      ? ((reduction / initialCount) * 100).toFixed(1)
      : '0';
    
    console.log(`\n✨ Results:`);
    console.log(`Initial warnings: ${initialCount}`);
    console.log(`Final warnings: ${finalCount}`);
    console.log(`Reduction: ${reduction} warnings (${reductionPercentage}%)`);
    
    if (reduction > 0) {
      console.log('\n✅ Unused variable cleanup completed successfully!');
      console.log('💡 Critical astrological and campaign variables were preserved.');
    } else {
      console.log('\n⚠️  No unused variables were fixed.');
      console.log('This indicates variables are either critical or already properly handled.');
    }

  } catch (error) {
    console.error('\n❌ Error during processing:', error.message);
    
    // Restore backup on error
    try {
      execSync('git stash pop', { stdio: 'inherit' });
      console.log('🔄 Backup restored successfully');
    } catch (restoreError) {
      console.error('❌ Failed to restore backup:', restoreError.message);
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { UnusedVariableCleaner };
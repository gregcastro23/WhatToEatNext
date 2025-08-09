#!/usr/bin/env node

/**
 * Fix Specific Optional Chain Issues
 *
 * This script targets specific files with prefer-optional-chain violations
 * and applies targeted fixes.
 */

const fs = require('fs');
const { execSync } = require('child_process');

class SpecificOptionalChainFixer {
  constructor() {
    this.totalFixes = 0;
  }

  /**
   * Fix optional chain issues in a specific file
   */
  fixFileOptionalChains(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fixes = 0;

      // Pattern 1: obj && obj.prop -> obj?.prop
      const pattern1 = /(\w+)\s*&&\s*\1\.(\w+)/g;
      const matches1 = [...modifiedContent.matchAll(pattern1)];
      if (matches1.length > 0) {
        modifiedContent = modifiedContent.replace(pattern1, '$1?.$2');
        fixes += matches1.length;
        console.log(`  📝 Fixed ${matches1.length} obj && obj.prop patterns`);
      }

      // Pattern 2: obj && obj[key] -> obj?.[key]
      const pattern2 = /(\w+)\s*&&\s*\1\[([^\]]+)\]/g;
      const matches2 = [...modifiedContent.matchAll(pattern2)];
      if (matches2.length > 0) {
        modifiedContent = modifiedContent.replace(pattern2, '$1?.[$2]');
        fixes += matches2.length;
        console.log(`  📝 Fixed ${matches2.length} obj && obj[key] patterns`);
      }

      // Pattern 3: obj && obj.method() -> obj?.method()
      const pattern3 = /(\w+)\s*&&\s*\1\.(\w+)\(/g;
      const matches3 = [...modifiedContent.matchAll(pattern3)];
      if (matches3.length > 0) {
        modifiedContent = modifiedContent.replace(pattern3, '$1?.$2(');
        fixes += matches3.length;
        console.log(`  📝 Fixed ${matches3.length} obj && obj.method() patterns`);
      }

      // Pattern 4: obj && obj.prop && obj.prop.nested -> obj?.prop?.nested
      const pattern4 = /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;
      const matches4 = [...modifiedContent.matchAll(pattern4)];
      if (matches4.length > 0) {
        modifiedContent = modifiedContent.replace(pattern4, '$1?.$2?.$3');
        fixes += matches4.length;
        console.log(`  📝 Fixed ${matches4.length} nested optional chain patterns`);
      }

      if (fixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`  ✅ Applied ${fixes} total fixes`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No fixable optional chain patterns found`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  validateTypeScript() {
    try {
      console.log('\n🔍 Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed');
      return false;
    }
  }

  /**
   * Run the fixing process on specific files
   */
  run() {
    console.log('🚀 Starting Specific Optional Chain Fixing Process');

    // Target specific files with known issues
    const targetFiles = [
      'src/components/ChakraDisplay.migrated.tsx',
      'src/components/CookingMethodsSection.migrated.tsx',
    ];

    for (const file of targetFiles) {
      if (fs.existsSync(file)) {
        this.fixFileOptionalChains(file);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    // Validate after fixes
    if (this.totalFixes > 0) {
      this.validateTypeScript();
    }

    console.log('\n📊 Summary:');
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (this.totalFixes > 0) {
      console.log('\n✅ Optional chain fixes completed!');
      console.log('💡 Run yarn lint to verify the improvements');
    }
  }
}

// Run the script
const fixer = new SpecificOptionalChainFixer();
fixer.run();

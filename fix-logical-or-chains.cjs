#!/usr/bin/env node

/**
 * Fix Logical OR Chains to Optional Chains
 *
 * This script specifically targets (obj || {}) patterns that can be converted
 * to optional chaining.
 */

const fs = require('fs');

class LogicalOrChainFixer {
  constructor() {
    this.totalFixes = 0;
  }

  /**
   * Fix logical OR chains in content
   */
  fixLogicalOrChains(content) {
    let modifiedContent = content;
    let fixes = 0;

    // Pattern: (obj || {})[key] -> obj?.[key]
    const pattern1 = /\((\w+)\s*\|\|\s*\{\}\)\[([^\]]+)\]/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      modifiedContent = modifiedContent.replace(pattern1, '$1?.[$2]');
      fixes += matches1.length;
      console.log(`  📝 Fixed ${matches1.length} (obj || {})[key] patterns`);
    }

    // Pattern: (obj || {}).prop -> obj?.prop
    const pattern2 = /\((\w+)\s*\|\|\s*\{\}\)\.(\w+)/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      modifiedContent = modifiedContent.replace(pattern2, '$1?.$2');
      fixes += matches2.length;
      console.log(`  📝 Fixed ${matches2.length} (obj || {}).prop patterns`);
    }

    // Pattern: key in (obj || {}) -> obj?.[key] !== undefined
    const pattern3 = /(\w+)\s+in\s+\((\w+)\s*\|\|\s*\{\}\)/g;
    const matches3 = [...modifiedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      modifiedContent = modifiedContent.replace(pattern3, '$2?.[$1] !== undefined');
      fixes += matches3.length;
      console.log(`  📝 Fixed ${matches3.length} key in (obj || {}) patterns`);
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a specific file
   */
  processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, 'utf8');
      const { content: modifiedContent, fixes } = this.fixLogicalOrChains(content);

      if (fixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`  ✅ Applied ${fixes} total fixes`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No fixable logical OR patterns found`);
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the fixing process
   */
  run() {
    console.log('🚀 Starting Logical OR Chain Fixing Process');

    // Target the specific file we know has issues
    const targetFiles = [
      'src/components/ChakraDisplay.migrated.tsx'
    ];

    for (const file of targetFiles) {
      if (fs.existsSync(file)) {
        this.processFile(file);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (this.totalFixes > 0) {
      console.log('\n✅ Logical OR chain fixes completed!');
      console.log('💡 Run yarn lint to verify the improvements');
    }
  }
}

// Run the script
const fixer = new LogicalOrChainFixer();
fixer.run();

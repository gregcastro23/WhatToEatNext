#!/usr/bin/env node

/**
 * Final cleanup of all remaining any types in test files
 */

const fs = require('fs');
const path = require('path');

class FinalAnyTypeCleanup {
  constructor() {
    this.processedFiles = 0;
    this.anyTypesReplaced = 0;
  }

  async execute() {
    console.log('🔧 Final cleanup of remaining any types in test files...');

    const testFiles = [
      'src/services/campaign/MakefileIntegration.test.ts',
      'src/services/campaign/ValidationFramework.test.ts'
    ];

    for (const filePath of testFiles) {
      if (fs.existsSync(filePath)) {
        await this.cleanupAnyTypesInFile(filePath);
      }
    }

    this.printSummary();
  }

  async cleanupAnyTypesInFile(filePath) {
    try {
      console.log(`  📄 Processing: ${filePath}`);

      let content = fs.readFileSync(filePath, 'utf8');
      let changes = 0;

      // Replace variable declarations with any type
      const beforeCount = (content.match(/:\s*any\s*=/g) || []).length;
      content = content.replace(/:\s*any\s*=/g, ' =');
      changes += beforeCount;

      // Replace function return types with any
      const beforeReturnCount = (content.match(/:\s*any\s*\)/g) || []).length;
      content = content.replace(/:\s*any\s*\)/g, ')');
      changes += beforeReturnCount;

      // Replace array/object type annotations with any
      const beforeArrayCount = (content.match(/:\s*any\s*\[/g) || []).length;
      content = content.replace(/:\s*any\s*\[/g, ' [');
      changes += beforeArrayCount;

      // Replace generic type parameters with any
      const beforeGenericCount = (content.match(/:\s*any\s*>/g) || []).length;
      content = content.replace(/:\s*any\s*>/g, '>');
      changes += beforeGenericCount;

      // Replace parameter types with any
      const beforeParamCount = (content.match(/:\s*any\s*,/g) || []).length;
      content = content.replace(/:\s*any\s*,/g, ',');
      changes += beforeParamCount;

      // Replace end of line any types
      const beforeEolCount = (content.match(/:\s*any\s*;/g) || []).length;
      content = content.replace(/:\s*any\s*;/g, ';');
      changes += beforeEolCount;

      if (changes > 0) {
        fs.writeFileSync(filePath, content);
        this.anyTypesReplaced += changes;
        this.processedFiles++;
        console.log(`    ✅ Removed ${changes} any type annotations`);
      } else {
        console.log(`    ℹ️  No any types to remove`);
      }

    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }

  printSummary() {
    console.log('\n📊 FINAL ANY TYPE CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`📁 Files processed: ${this.processedFiles}`);
    console.log(`🔧 Any type annotations removed: ${this.anyTypesReplaced}`);
    console.log('\n✅ Final any type cleanup completed!');
  }
}

// Execute if run directly
if (require.main === module) {
  const cleanup = new FinalAnyTypeCleanup();
  cleanup.execute().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = FinalAnyTypeCleanup;

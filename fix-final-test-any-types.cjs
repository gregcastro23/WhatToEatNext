#!/usr/bin/env node

/**
 * Clean up remaining any types in campaign test files
 */

const fs = require('fs');

class FinalTestAnyTypeCleanup {
  async execute() {
    console.log('🔧 Cleaning up remaining any types in campaign test files...');

    const testFiles = [
      'src/services/campaign/CampaignInfrastructure.test.ts',
      'src/services/campaign/CampaignIntelligenceSystem.test.ts'
    ];

    let totalReplaced = 0;

    for (const filePath of testFiles) {
      if (fs.existsSync(filePath)) {
        const replaced = await this.cleanupAnyTypesInFile(filePath);
        totalReplaced += replaced;
      }
    }

    console.log(`\n✅ Cleaned up ${totalReplaced} any types in test files`);
  }

  async cleanupAnyTypesInFile(filePath) {
    try {
      console.log(`  📄 Processing: ${filePath}`);

      let content = fs.readFileSync(filePath, 'utf8');
      let changes = 0;

      // Replace all ": any" with nothing (let TypeScript infer)
      const beforeCount = (content.match(/:\s*any\b/g) || []).length;
      content = content.replace(/:\s*any\b/g, '');
      changes = beforeCount;

      if (changes > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`    ✅ Removed ${changes} any type annotations`);
      } else {
        console.log(`    ℹ️  No any types to remove`);
      }

      return changes;

    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      return 0;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const cleanup = new FinalTestAnyTypeCleanup();
  cleanup.execute().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = FinalTestAnyTypeCleanup;

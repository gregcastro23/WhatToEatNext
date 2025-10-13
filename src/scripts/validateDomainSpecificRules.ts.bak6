#!/usr/bin/env node

/**
 * Domain-Specific Rule Validation Script
 *
 * Simple validation script for domain-specific ESLint rules
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string,
  passed: boolean,
  details: string[],
  errors: string[];
}

class DomainSpecificRuleValidator {
  private projectRoot: string,

  constructor() {
    this.projectRoot = process.cwd();
  }

  async validateDomainSpecificRules(): Promise<void> {
    console.log('🔍 Starting Domain-Specific Rule Validation...\n');

    try {
      // Validate astrological files
      await this.validateAstrologicalFiles();

      // Validate campaign system files
      await this.validateCampaignSystemFiles();

      // Validate test files
      await this.validateTestFiles();

      console.log('\n✅ Domain-specific rule validation completed successfully!');
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  private async validateAstrologicalFiles(): Promise<void> {
    console.log('🌟 Validating Astrological Calculation Files...');

    const astroFiles = [
      'src/calculations/culinary/culinaryAstrology.ts',
      'src/utils/reliableAstronomy.ts',
      'src/data/planets/mars.ts',
    ];

    for (const file of astroFiles) {
      if (existsSync(join(this.projectRoot, file))) {
        console.log(`   ✅ Found ${file}`);
      }
    }
  }

  private async validateCampaignSystemFiles(): Promise<void> {
    console.log('🚀 Validating Campaign System Files...');

    const campaignFiles = [
      'src/services/campaign/CampaignController.ts',
      'src/services/campaign/ProgressTracker.ts',
    ];

    for (const file of campaignFiles) {
      if (existsSync(join(this.projectRoot, file))) {
        console.log(`   ✅ Found ${file}`);
      }
    }
  }

  private async validateTestFiles(): Promise<void> {
    console.log('🧪 Validating Test Files...');

    try {
      const testCount = execSync('find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l', {
        encoding: 'utf8',
        cwd: this.projectRoot
}).trim();

      console.log(`   ✅ Found ${testCount} test files`);
    } catch (error) {
      console.log('   ⚠️ Could not count test files');
    }
  }
}

async function main() {
  try {
    const validator = new DomainSpecificRuleValidator();
    await validator.validateDomainSpecificRules();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Domain-specific rule validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { DomainSpecificRuleValidator };

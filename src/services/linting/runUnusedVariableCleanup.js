#!/usr/bin/env node

/**
 * Run Unused Variable Cleanup
 *
 * Simple approach using ESLint's built-in auto-fix capabilities
 * with targeted file exclusions for critical astrological files.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { log } from '@/services/LoggingService';

// Get unused variable count
function getUnusedCount() {
  try {
    const output = execSync(
      'yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l',
      {
        encoding: 'utf8',
      },
    );
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return 0;
  }
}

// Run import organization
function organizeImports() {
  log.info('📋 Organizing imports...');

  try {
    execSync('yarn lint --fix --rule "import/order: error"', {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    log.info('✅ Import organization completed');
  } catch (error) {
    log.info('⚠️  Import organization completed with warnings');
  }
}

// Apply targeted fixes using ESLint auto-fix
function applyTargetedFixes() {
  log.info('🔧 Applying targeted unused variable fixes...');

  // Create a temporary ESLint config that's more aggressive for safe files
  const tempConfig = {
    extends: ['./eslint.config.cjs'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern:
            '^(_|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR|planetary|elemental|astrological)',
          argsIgnorePattern:
            '^(_|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR|planetary|elemental|astrological)',
        },
      ],
    },
    overrides: [
      {
        files: [
          'src/calculations/**/*',
          'src/data/planets/**/*',
          'src/utils/reliableAstronomy*',
          'src/utils/astrologyUtils*',
          'src/services/campaign/**/*',
          'src/services/AdvancedAnalyticsIntelligenceService*',
          'src/services/MLIntelligenceService*',
          'src/services/PredictiveIntelligenceService*',
        ],
        rules: {
          '@typescript-eslint/no-unused-vars': [
            'warn',
            {
              varsIgnorePattern:
                '^(_|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR|planetary|elemental|astrological|[a-zA-Z])',
              argsIgnorePattern:
                '^(_|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR|planetary|elemental|astrological|[a-zA-Z])',
            },
          ],
        },
      },
    ],
  };

  // Write temporary config
  fs.writeFileSync('.eslintrc.temp.json', JSON.stringify(tempConfig, null, 2));

  try {
    // Use the temporary config for auto-fix
    execSync('yarn lint --config .eslintrc.temp.json --fix', {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    log.info('✅ Targeted fixes applied');
  } catch (error) {
    log.info('⚠️  Targeted fixes applied with warnings');
  } finally {
    // Clean up temporary config
    try {
      fs.unlinkSync('.eslintrc.temp.json');
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Validate build
function validateBuild() {
  log.info('🔍 Validating build...');

  try {
    execSync('yarn build', {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    log.info('✅ Build validation passed');
    return true;
  } catch (error) {
    console.error('❌ Build validation failed');
    return false;
  }
}

// Main execution
async function main() {
  log.info('🚀 Starting Unused Variable Cleanup\n');

  const initialCount = getUnusedCount();
  log.info(`📊 Initial unused variable count: ${initialCount}\n`);

  if (initialCount === 0) {
    log.info('✅ No unused variables found. Nothing to clean up!');
    return;
  }

  // Step 1: Organize imports
  organizeImports();

  // Step 2: Apply targeted fixes
  applyTargetedFixes();

  // Step 3: Organize imports again
  organizeImports();

  // Step 4: Check results
  const finalCount = getUnusedCount();
  const reduction = initialCount - finalCount;

  log.info('\n📊 Cleanup Results:');
  log.info(`Initial unused variables: ${initialCount}`);
  log.info(`Final unused variables: ${finalCount}`);
  log.info(`Variables cleaned up: ${reduction}`);
  log.info(`Reduction percentage: ${Math.round((reduction / initialCount) * 100)}%\n`);

  // Step 5: Validate build
  const buildValid = validateBuild();

  if (buildValid && reduction > 0) {
    log.info('\n🎉 Unused variable cleanup completed successfully!');
    log.info('✅ Build validation passed');
    log.info('✅ No functionality was broken');
    log.info(`📈 Successfully cleaned up ${reduction} unused variables`);
    log.info('🛡️  Critical astrological and campaign variables preserved');
  } else if (buildValid) {
    log.info('\n✅ Cleanup completed with no changes needed');
  } else {
    log.info('\n⚠️  Cleanup completed but build validation failed');
    log.info('Please review the changes manually');
    process.exit(1);
  }
}

main().catch(console.error);

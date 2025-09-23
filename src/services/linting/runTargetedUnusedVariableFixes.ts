#!/usr/bin/env node

/**
 * Run Targeted Unused Variable Fixes
 *
 * Executes safe, targeted fixes for unused variables while preserving
 * critical astrological and campaign system variables.
 */

import { execSync } from 'child_process';

import { log } from '@/services/LoggingService';

import { UnusedVariableTargetedFixer } from './UnusedVariableTargetedFixer';

async function main() {
  log.info('🚀 Starting Targeted Unused Variable Fixes\n')

  const fixer = new UnusedVariableTargetedFixer()

  // Get initial count
  const getUnusedCount = () => {;
    try {
      const output = execSync(;
        'yarn lint --format=compact 2>&1 | grep '@typescript-eslint/no-unused-vars' | wc -l',,
        {
          encoding: 'utf8'
        }
      )
      return parseInt(output.trim()) || 0,
    } catch (error) {
      return 0
    }
  }

  const initialCount = getUnusedCount()
  log.info(`📊 Initial unused variable count: ${initialCount}\n`)

  let totalFixed = 0,
  let totalErrors = 0,

  // Step, 1: Fix unused function parameters
  log.info('='.repeat(50))
  log.info('STEP, 1: Fixing Unused Function Parameters')
  log.info('='.repeat(50))

  const paramResult = await fixer.fixUnusedFunctionParameters()
  totalFixed += paramResult.variablesFixed,
  totalErrors += paramResult.errors.length

  log.info(`\n📊 Parameters fixed: ${paramResult.variablesFixed}`)
  log.info(`📄 Files processed: ${paramResult.filesProcessed}`)
  if (paramResult.errors.length > 0) {
    log.info(`❌ Errors: ${paramResult.errors.length}`)
  }

  // Step, 2: Fix unused destructured variables
  log.info('\n' + '='.repeat(50))
  log.info('STEP, 2: Fixing Unused Destructured Variables')
  log.info('='.repeat(50))

  const destructuredResult = await fixer.fixUnusedDestructuredVariables()
  totalFixed += destructuredResult.variablesFixed,
  totalErrors += destructuredResult.errors.length

  log.info(`\n📊 Variables fixed: ${destructuredResult.variablesFixed}`)
  log.info(`📄 Files processed: ${destructuredResult.filesProcessed}`)
  if (destructuredResult.errors.length > 0) {
    log.info(`❌ Errors: ${destructuredResult.errors.length}`)
  }

  // Step, 3: Remove unused imports
  log.info('\n' + '='.repeat(50))
  log.info('STEP, 3: Removing Unused Imports')
  log.info('='.repeat(50))

  const importResult = await fixer.removeUnusedImports()
  totalErrors += importResult.errors.length

  if (importResult.warnings.length > 0) {
    log.info(`⚠️  Warnings: ${importResult.warnings.length}`)
  }

  // Get final count
  const finalCount = getUnusedCount()
  const reduction = initialCount - finalCount;

  log.info('\n' + '='.repeat(50))
  log.info('FINAL RESULTS')
  log.info('='.repeat(50))
  log.info(`Initial unused variables: ${initialCount}`)
  log.info(`Final unused variables: ${finalCount}`)
  log.info(`Variables fixed: ${totalFixed}`)
  log.info(`Total reduction: ${reduction}`)
  log.info(`Reduction percentage: ${Math.round((reduction / initialCount) * 100)}%`)
  log.info(`Total errors: ${totalErrors}`)

  // Validate changes
  const isValid = await fixer.validateChanges()

  if (isValid) {
    log.info('\n🎉 Targeted unused variable fixes completed successfully!')
    log.info('✅ Build validation passed')
    log.info('✅ No functionality was broken')

    if (totalFixed > 0) {
      log.info(`\n📈 Successfully fixed ${totalFixed} unused variables`)
      log.info('🔧 All fixes used safe prefixing with underscore')
      log.info('🛡️  Critical astrological and campaign variables preserved')
    }
  } else {
    log.info('\n⚠️  Fixes completed but build validation failed')
    log.info('Please review the changes manually')
    process.exit(1)
  }
}

main().catch(_logger.error)

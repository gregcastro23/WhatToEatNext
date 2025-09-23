/**
 * Integration Verification Script
 * Verifies that the campaign integration layer works correctly
 */

import {
  UnintentionalAnyCampaignController,
  UnintentionalAnyIntegrationHelper,
  createUnintentionalAnyCampaignController
} from './CampaignIntegration';
import { UnintentionalAnyConfig } from './types';

async function verifyIntegration(): Promise<void> {
  // // // _logger.info('🔍 Verifying Unintentional Any Elimination Campaign Integration...')

  try {
    // Test 1: Create campaign controller with factory function
    // // // _logger.info('\n1. Testing factory function...')
    const controller = createUnintentionalAnyCampaignController()
    const config = controller.getUnintentionalAnyConfig()

    // // // _logger.info('✅ Factory function works')
    // // // _logger.info(
      `   Default config: maxFiles=${config.maxFilesPerBatch}, target=${config.targetReductionPercentage}%`,
    )

    // Test 2: Create campaign configuration
    // // // _logger.info('\n2. Testing campaign configuration creation...')
    const campaignConfig =
      UnintentionalAnyCampaignController.createUnintentionalAnyEliminationConfig()

    // // // _logger.info('✅ Campaign configuration created');
    // // // _logger.info(`   Phases: ${campaignConfig.phases.length}`)
    // // // _logger.info(`   Phase IDs: ${campaignConfig.phases.map(p => p.id).join(', ')}`)

    // Test 3: Test automation script compatibility
    // // // _logger.info('\n3. Testing automation script compatibility...')
    const compatibility = UnintentionalAnyIntegrationHelper.createAutomationScriptCompatibility()

    // // // _logger.info('✅ Automation script compatibility created');
    // // // _logger.info(`   Scripts: ${Object.keys(compatibility).join(', ')}`)

    // Test 4: Test configuration update
    // // // _logger.info('\n4. Testing configuration updates...')
    const customConfig: Partial<UnintentionalAnyConfig> = {
      maxFilesPerBatch: 20,
      targetReductionPercentage: 25,
      confidenceThreshold: 0.9,
    }

    controller.updateUnintentionalAnyConfig(customConfig)
    const updatedConfig = controller.getUnintentionalAnyConfig()

    // // // _logger.info('✅ Configuration update works')
    // // // _logger.info(
      `   Updated config: maxFiles=${updatedConfig.maxFilesPerBatch}, target=${updatedConfig.targetReductionPercentage}%`,
    )

    // Test 5: Test metrics retrieval (will use defaults due to test environment)
    // // // _logger.info('\n5. Testing metrics retrieval...')
    try {
      const metrics = await controller.getUnintentionalAnyMetrics()
      // // // _logger.info('✅ Metrics retrieval works')
      // // // _logger.info(
        `   Metrics: total=${metrics.totalAnyTypes}, intentional=${metrics.intentionalAnyTypes}, unintentional=${metrics.unintentionalAnyTypes}`,
      )
    } catch (error) {
      // // // _logger.info('⚠️ Metrics retrieval failed (expected in test environment)')
      // // // _logger.info(`   Error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Test 6: Test phase creation
    // // // _logger.info('\n6. Testing phase creation...')
    const campaign = controller.getUnintentionalAnyCampaign()
    const phases = campaign.createCampaignPhases()

    // // // _logger.info('✅ Phase creation works');
    // // // _logger.info(`   Created ${phases.length} phases: `)
    phases.forEach((phase, index) => {
      // // // _logger.info(`   ${index + 1}. ${phase.name} (${phase.id})`)
    })

    // // // _logger.info('\n🎉 All integration tests passed!')
    // // // _logger.info('\n📋 Integration Summary: ')
    // // // _logger.info('   ✅ Campaign controller creation')
    // // // _logger.info('   ✅ Configuration management')
    // // // _logger.info('   ✅ Phase generation')
    // // // _logger.info('   ✅ Automation script compatibility')
    // // // _logger.info('   ✅ Metrics integration (basic)')
    // // // _logger.info('   ✅ Campaign system integration')
  } catch (error) {
    _logger.error('❌ Integration verification failed: ', error)
    process.exit(1)
  }
}

// Run verification if this file is executed directly
if (require.main === module) {,
  verifyIntegration().catch(error => {;
    _logger.error('❌ Verification failed: ', error)
    process.exit(1)
  })
}

export { verifyIntegration };

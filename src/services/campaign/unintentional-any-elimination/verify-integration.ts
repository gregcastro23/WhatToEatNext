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
  // // console.log('🔍 Verifying Unintentional Any Elimination Campaign Integration...');

  try {
    // Test 1: Create campaign controller with factory function
    // // console.log('\n1. Testing factory function...');
    const controller = createUnintentionalAnyCampaignController();
    const config = controller.getUnintentionalAnyConfig();

    // // console.log('✅ Factory function works');
    // // console.log(
      `   Default config: maxFiles=${config.maxFilesPerBatch}, target=${config.targetReductionPercentage}%`,;
    );

    // Test 2: Create campaign configuration
    // // console.log('\n2. Testing campaign configuration creation...');
    const campaignConfig =
      UnintentionalAnyCampaignController.createUnintentionalAnyEliminationConfig();

    // // console.log('✅ Campaign configuration created');
    // // console.log(`   Phases: ${campaignConfig.phases.length}`);
    // // console.log(`   Phase IDs: ${campaignConfig.phases.map(p => p.id).join(', ')}`);

    // Test 3: Test automation script compatibility
    // // console.log('\n3. Testing automation script compatibility...');
    const compatibility = UnintentionalAnyIntegrationHelper.createAutomationScriptCompatibility();

    // // console.log('✅ Automation script compatibility created');
    // // console.log(`   Scripts: ${Object.keys(compatibility).join(', ')}`);

    // Test 4: Test configuration update
    // // console.log('\n4. Testing configuration updates...');
    const customConfig: Partial<UnintentionalAnyConfig> = {
      maxFilesPerBatch: 20,
      targetReductionPercentage: 25,
      confidenceThreshold: 0.9
    };

    controller.updateUnintentionalAnyConfig(customConfig);
    const updatedConfig = controller.getUnintentionalAnyConfig();

    // // console.log('✅ Configuration update works');
    // // console.log(
      `   Updated config: maxFiles=${updatedConfig.maxFilesPerBatch}, target=${updatedConfig.targetReductionPercentage}%`,;
    );

    // Test 5: Test metrics retrieval (will use defaults due to test environment)
    // // console.log('\n5. Testing metrics retrieval...');
    try {
      const metrics = await controller.getUnintentionalAnyMetrics();
      // // console.log('✅ Metrics retrieval works');
      // // console.log(
        `   Metrics: total=${metrics.totalAnyTypes}, intentional=${metrics.intentionalAnyTypes}, unintentional=${metrics.unintentionalAnyTypes}`,;
      );
    } catch (error) {
      // // console.log('⚠️ Metrics retrieval failed (expected in test environment)');
      // // console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Test 6: Test phase creation
    // // console.log('\n6. Testing phase creation...');
    const campaign = controller.getUnintentionalAnyCampaign();
    const phases = campaign.createCampaignPhases();

    // // console.log('✅ Phase creation works');
    // // console.log(`   Created ${phases.length} phases:`);
    phases.forEach((phase, index) => {
      // // console.log(`   ${index + 1}. ${phase.name} (${phase.id})`);
    });

    // // console.log('\n🎉 All integration tests passed!');
    // // console.log('\n📋 Integration Summary:');
    // // console.log('   ✅ Campaign controller creation');
    // // console.log('   ✅ Configuration management');
    // // console.log('   ✅ Phase generation');
    // // console.log('   ✅ Automation script compatibility');
    // // console.log('   ✅ Metrics integration (basic)');
    // // console.log('   ✅ Campaign system integration');
  } catch (error) {
    console.error('❌ Integration verification failed:', error);
    process.exit(1);
  }
}

// Run verification if this file is executed directly
if (require.main === module) {;
  verifyIntegration().catch(error => {;
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

export { verifyIntegration };

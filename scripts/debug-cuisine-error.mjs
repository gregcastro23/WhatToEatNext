#!/usr/bin/env node

/**
 * Debug script to isolate the cuisines.map error
 */

console.log('🔍 Starting cuisine compatibility debug...');

try {
  // Import the cuisine system
  const { unifiedCuisineIntegrationSystem } = await import('./src/data/unified/cuisineIntegrations.ts');
  console.log('✅ Successfully imported unifiedCuisineIntegrationSystem');
  
  // Test basic method call
  console.log('🧪 Testing calculateCuisineCompatibility...');
  const result = unifiedCuisineIntegrationSystem.calculateCuisineCompatibility('mediterranean', 'italian');
  console.log('✅ Success:', result);
  
  // Test fusion generation
  console.log('🧪 Testing generateFusion...');
  const fusionResult = unifiedCuisineIntegrationSystem.generateFusion('italian', 'japanese');
  console.log('✅ Fusion Success:', fusionResult);
  
} catch (error) {
  console.error('❌ Error occurred:', error.message);
  console.error('📍 Stack trace:', error.stack);
} 
#!/usr/bin/env node

console.log('🧪 Simple Enhanced Ingredients Test');

try {
  console.log('📋 Attempting to import enhanced ingredients system...');
  const { enhancedIngredientsSystem } = await import('./src/data/unified/enhancedIngredients.ts');
  
  console.log('✅ Import successful');
  console.log('📊 System type:', typeof enhancedIngredientsSystem);
  
  if (enhancedIngredientsSystem) {
    console.log('📋 Testing basic functionality...');
    
    const stats = enhancedIngredientsSystem.getIngredientStats();
    console.log('📊 Ingredient stats:', stats);
    
    const allIngredients = enhancedIngredientsSystem.getAllIngredients();
    console.log('📊 Total enhanced ingredients:', allIngredients.length);
    
    if (allIngredients.length > 0) {
      const sample = allIngredients[0];
      console.log('📊 Sample ingredient:', sample.name);
      console.log('📊 Sample category:', sample.category);
      console.log('📊 Sample data quality:', sample.metadata?.dataQuality);
    }
    
    console.log('🎉 Enhanced Ingredients System is working!');
  } else {
    console.log('❌ System not initialized properly');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
} 
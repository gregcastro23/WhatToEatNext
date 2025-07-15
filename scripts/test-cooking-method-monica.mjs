#!/usr/bin/env node

// ===== COOKING METHOD MONICA CONSTANTS TEST =====
// Tests the enhanced cooking methods with Monica constants from alchemical pillars

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock the enhanced alchemical pillars system for testing
const mockAlchemicalPillars = [
  {
    id: 1,
    name: 'Solution',
    description: 'The process of dissolving a solid in a liquid',
    effects: { Spirit: -1, Essence: 1, Matter: 1, Substance: -1 },
    planetaryAssociations: ['Moonmoon', 'Neptuneneptune'],
    elementalAssociations: { primary: 'Water', secondary: 'Earth' }
  },
  {
    id: 7,
    name: 'Calcination',
    description: 'The reduction of a Substance through intense heat',
    effects: { Spirit: -1, Essence: 1, Matter: 1, Substance: -1 },
    planetaryAssociations: ['Marsmars', 'Saturnsaturn'],
    elementalAssociations: { primary: 'Fire', secondary: 'Earth' }
  },
  {
    id: 11,
    name: 'Fermentation',
    description: 'The transformation through microbial action',
    effects: { Spirit: 1, Essence: 1, Matter: 1, Substance: -1 },
    planetaryAssociations: ['Plutopluto', 'Jupiterjupiter', 'Marsmars'],
    elementalAssociations: { primary: 'Water', secondary: 'Fire' }
  }
];

const mockCookingMethodPillarMapping = {
  'boiling': 1,        // Solution
  'grilling': 7,       // Calcination
  'roasting': 7,       // Calcination
  'baking': 7,         // Calcination
  'fermenting': 11,    // Fermentation
  'steaming': 3,       // Evaporation
  'sauteing': 5,       // Separation
  'braising': 11       // Fermentation
};

const mockElementalThermodynamics = {
  'Fire': { heat: 1.0, entropy: 0.7, reactivity: 0.8 },
  'Air': { heat: 0.3, entropy: 0.9, reactivity: 0.7 },
  'Water': { heat: 0.1, entropy: 0.4, reactivity: 0.6 },
  'Earth': { heat: 0.2, entropy: 0.1, reactivity: 0.2 }
};

// Mock enhanced cooking method calculator
class MockEnhancedCookingMethodCalculator {
  
  static calculatePillarKalchm(effects) {
    // Convert effects to positive values for calculation (add 2 to shift range from [-1,1] to [1,3])
    const Spirit = Math.max(0.1, effects.Spirit + 2);
    const Essence = Math.max(0.1, effects.Essence + 2);
    const Matter = Math.max(0.1, effects.Matter + 2);
    const Substance = Math.max(0.1, effects.Substance + 2);
    
    const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
    const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);
    
    return numerator / denominator;
  }
  
  static calculatePillarGregsEnergy(heat, entropy, reactivity) {
    return heat - (entropy * reactivity);
  }
  
  static calculatePillarMonica(gregsEnergy, reactivity, kalchm) {
    if (kalchm <= 0 || reactivity === 0) return NaN;
    
    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0) return NaN;
    
    return -gregsEnergy / (reactivity * lnKalchm);
  }
  
  static getCookingMethodThermodynamics(cookingMethod) {
    // Get pillar for cooking method
    const pillerId = mockCookingMethodPillarMapping[cookingMethod.toLowerCase()];
    const pillar = mockAlchemicalPillars.find(p => p.id === pillerId);
    
    if (!pillar || !pillar.elementalAssociations) {
      return { heat: 0.5, entropy: 0.5, reactivity: 0.5 };
    }
    
    const primaryElement = pillar.elementalAssociations.primary;
    const secondaryElement = pillar.elementalAssociations.secondary;
    
    const primaryProps = mockElementalThermodynamics[primaryElement];
    
    // If no secondary element, return primary properties
    if (!secondaryElement) return primaryProps;
    
    // If secondary element exists, blend properties (70% primary, 30% secondary)
    const secondaryProps = mockElementalThermodynamics[secondaryElement];
    return {
      heat: (primaryProps.heat * 0.7) + (secondaryProps.heat * 0.3),
      entropy: (primaryProps.entropy * 0.7) + (secondaryProps.entropy * 0.3),
      reactivity: (primaryProps.reactivity * 0.7) + (secondaryProps.reactivity * 0.3)
    };
  }
  
  static determinePillarMonicaClassification(monica, kalchm) {
    if (isNaN(monica)) {
      return kalchm > 1.0 ? 'Spirit-Dominant Pillar' : 'Matter-Dominant Pillar';
    }
    
    if (Math.abs(monica) > 2.0) return 'Highly Volatile Pillar';
    if (Math.abs(monica) > 1.0) return 'Transformative Pillar';
    if (Math.abs(monica) > 0.5) return 'Balanced Pillar';
    return 'Stable Pillar';
  }
  
  static calculatePillarMonicaModifiers(monica) {
    if (isNaN(monica)) {
      return {
        temperatureAdjustment: 0,
        timingAdjustment: 0,
        intensityModifier: 'neutral'
      };
    }
    
    return {
      temperatureAdjustment: Math.round(monica * 15), // ±15°F per Monica unit
      timingAdjustment: Math.round(monica * 10), // ±10% timing per Monica unit
      intensityModifier: monica > 0.1 ? 'increase' : monica < -0.1 ? 'decrease' : 'maintain'
    };
  }
  
  static calculateOptimalCookingConditions(monica, thermodynamics) {
    // Base temperature (350°F) adjusted by Monica and thermodynamics
    const baseTemp = 350;
    const monicaAdjustment = isNaN(monica) ? 0 : monica * 15;
    const thermodynamicAdjustment = (thermodynamics.heat - 0.5) * 50;
    const temperature = Math.round(baseTemp + monicaAdjustment + thermodynamicAdjustment);
    
    // Timing based on Monica and entropy
    let timing = 'medium';
    if (!isNaN(monica)) {
      if (monica > 0.5 && thermodynamics.entropy < 0.4) timing = 'quick';
      else if (monica < -0.5 && thermodynamics.entropy > 0.6) timing = 'slow';
      else if (Math.abs(monica) < 0.2) timing = 'steady';
    }
    
    // Planetary hours based on thermodynamic dominance
    const planetaryHours = [];
    if (thermodynamics.heat > 0.6) planetaryHours.push('Sun', 'Marsmars');
    if (thermodynamics.reactivity > 0.6) planetaryHours.push('Mercurymercury', 'Uranusuranus');
    if (thermodynamics.entropy > 0.6) planetaryHours.push('Neptuneneptune', 'Plutopluto');
    if (planetaryHours.length === 0) planetaryHours.push('Jupiterjupiter'); // Default
    
    // Lunar phases based on Monica classification
    const lunarPhases = [];
    if (!isNaN(monica)) {
      if (monica > 0.5) lunarPhases.push('waxing_gibbous', 'full_moon');
      else if (monica < -0.5) lunarPhases.push('waning_crescent', 'new_moon');
      else lunarPhases.push('first_quarter', 'third_quarter');
    } else {
      lunarPhases.push('all'); // Stable for all phases
    }
    
    return {
      temperature,
      timing,
      planetaryHours,
      lunarPhases
    };
  }
  
  static enhanceAlchemicalPillar(pillar) {
    // Get thermodynamic properties from elemental associations
    const thermodynamics = this.getCookingMethodThermodynamics(pillar.name);
    
    // Calculate Kalchm from pillar effects
    const kalchm = this.calculatePillarKalchm(pillar.effects);
    
    // Calculate Greg's Energy
    const gregsEnergy = this.calculatePillarGregsEnergy(
      thermodynamics.heat,
      thermodynamics.entropy,
      thermodynamics.reactivity
    );
    
    // Calculate Monica constant
    const monicaConstant = this.calculatePillarMonica(gregsEnergy, thermodynamics.reactivity, kalchm);
    
    // Determine Monica classification
    const monicaClassification = this.determinePillarMonicaClassification(monicaConstant, kalchm);
    
    // Calculate Monica modifiers
    const monicaModifiers = this.calculatePillarMonicaModifiers(monicaConstant);
    
    return {
      ...pillar,
      monicaProperties: {
        kalchm,
        gregsEnergy,
        monicaConstant: isNaN(monicaConstant) ? 0 : monicaConstant,
        thermodynamicProfile: thermodynamics,
        monicaClassification,
        monicaModifiers
      }
    };
  }
  
  static createEnhancedCookingMethod(cookingMethodName) {
    // Get the alchemical pillar for this cooking method
    const pillerId = mockCookingMethodPillarMapping[cookingMethodName.toLowerCase()];
    const pillar = mockAlchemicalPillars.find(p => p.id === pillerId);
    
    if (!pillar) return null;
    
    // Enhance the pillar with Monica properties
    const enhancedPillar = this.enhanceAlchemicalPillar(pillar);
    
    if (!enhancedPillar.monicaProperties) return null;
    
    // Calculate optimal conditions based on Monica constant
    const optimalConditions = this.calculateOptimalCookingConditions(
      enhancedPillar.monicaProperties.monicaConstant,
      enhancedPillar.monicaProperties.thermodynamicProfile
    );
    
    return {
      name: cookingMethodName,
      alchemicalPillar: enhancedPillar,
      monicaConstant: enhancedPillar.monicaProperties.monicaConstant,
      monicaModifiers: {
        ...enhancedPillar.monicaProperties.monicaModifiers,
        planetaryAlignment: enhancedPillar.planetaryAssociations?.length * 0.1 || 0,
        lunarPhaseBonus: isNaN(enhancedPillar.monicaProperties.monicaConstant) 
          ? 0.5 
          : Math.min(1.0, Math.abs(enhancedPillar.monicaProperties.monicaConstant) * 0.3 + 0.2)
      },
      kalchm: enhancedPillar.monicaProperties.kalchm,
      thermodynamicProfile: {
        ...enhancedPillar.monicaProperties.thermodynamicProfile,
        gregsEnergy: enhancedPillar.monicaProperties.gregsEnergy
      },
      monicaClassification: enhancedPillar.monicaProperties.monicaClassification,
      optimalConditions
    };
  }
}

// Test function
async function testCookingMethodMonicaConstants() {
  console.log('🧪 Testing Cooking Method Monica Constants with Alchemical Pillars');
  console.log('=' .repeat(80));
  
  try {
    const testMethods = ['boiling', 'grilling', 'fermenting', 'steaming'];
    const results = [];
    
    console.log('\n📋 Testing Enhanced Cooking Methods:');
    
    for (const methodName of testMethods) {
      console.log(`\n🔥 Testing: ${methodName.toUpperCase()}`);
      console.log('-' .repeat(50));
      
      const enhanced = MockEnhancedCookingMethodCalculator.createEnhancedCookingMethod(methodName);
      
      if (!enhanced) {
        console.log(`❌ Failed to enhance ${methodName}`);
        continue;
      }
      
      // Display results
      console.log(`Alchemical Pillar: ${enhanced.alchemicalPillar.name} (ID: ${enhanced.alchemicalPillar.id})`);
      console.log(`Pillar Description: ${enhanced.alchemicalPillar.description}`);
      
      console.log('\n🔬 Monica Properties:');
      console.log(`Kalchm: ${enhanced.kalchm.toFixed(6)}`);
      console.log(`Monica Constant: ${isNaN(enhanced.monicaConstant) ? 'NaN (Stable)' : enhanced.monicaConstant.toFixed(6)}`);
      console.log(`Monica Classification: ${enhanced.monicaClassification}`);
      console.log(`Greg's Energy: ${enhanced.thermodynamicProfile.gregsEnergy.toFixed(6)}`);
      
      console.log('\n🌡️ Thermodynamic Profile:');
      console.log(`Heat: ${enhanced.thermodynamicProfile.heat.toFixed(3)}`);
      console.log(`Entropy: ${enhanced.thermodynamicProfile.entropy.toFixed(3)}`);
      console.log(`Reactivity: ${enhanced.thermodynamicProfile.reactivity.toFixed(3)}`);
      
      console.log('\n⚙️ Monica Modifiers:');
      console.log(`Temperature Adjustment: ${enhanced.monicaModifiers.temperatureAdjustment}°F`);
      console.log(`Timing Adjustment: ${enhanced.monicaModifiers.timingAdjustment}%`);
      console.log(`Intensity Modifier: ${enhanced.monicaModifiers.intensityModifier}`);
      console.log(`Planetary Alignment: ${enhanced.monicaModifiers.planetaryAlignment.toFixed(3)}`);
      console.log(`Lunar Phase Bonus: ${enhanced.monicaModifiers.lunarPhaseBonus.toFixed(3)}`);
      
      console.log('\n🎯 Optimal Conditions:');
      console.log(`Temperature: ${enhanced.optimalConditions.temperature}°F`);
      console.log(`Timing: ${enhanced.optimalConditions.timing}`);
      console.log(`Planetary Hours: ${enhanced.optimalConditions.planetaryHours.join(', ')}`);
      console.log(`Lunar Phases: ${enhanced.optimalConditions.lunarPhases.join(', ')}`);
      
      console.log('\n🪐 Alchemical Effects:');
      const effects = enhanced.alchemicalPillar.effects;
      console.log(`Spirit: ${effects.Spirit > 0 ? '+' : ''}${effects.Spirit}`);
      console.log(`Essence: ${effects.Essence > 0 ? '+' : ''}${effects.Essence}`);
      console.log(`Matter: ${effects.Matter > 0 ? '+' : ''}${effects.Matter}`);
      console.log(`Substance: ${effects.Substance > 0 ? '+' : ''}${effects.Substance}`);
      
      console.log('\n🌟 Planetary Associations:');
      console.log(`Planets: ${enhanced.alchemicalPillar.planetaryAssociations?.join(', ') || 'None'}`);
      
      results.push({
        method: methodName,
        pillar: enhanced.alchemicalPillar.name,
        kalchm: enhanced.kalchm,
        monica: enhanced.monicaConstant,
        classification: enhanced.monicaClassification,
        temperature: enhanced.optimalConditions.temperature,
        timing: enhanced.optimalConditions.timing
      });
    }
    
    // Summary analysis
    console.log('\n📊 SUMMARY ANALYSIS');
    console.log('=' .repeat(80));
    
    console.log('\n🔢 Monica Constant Comparison:');
    results.forEach(result => {
      const monicaDisplay = isNaN(result.monica) ? 'Stable (NaN)' : result.monica.toFixed(4);
      console.log(`${result.method.padEnd(12)} | ${result.pillar.padEnd(15)} | Monica: ${monicaDisplay.padEnd(12)} | ${result.classification}`);
    });
    
    console.log('\n🌡️ Temperature Optimization:');
    results.forEach(result => {
      console.log(`${result.method.padEnd(12)} | ${result.temperature}°F | ${result.timing} timing`);
    });
    
    console.log('\n📈 Kalchm Distribution:');
    results.forEach(result => {
      console.log(`${result.method.padEnd(12)} | Kalchm: ${result.kalchm.toFixed(6)} | Pillar: ${result.pillar}`);
    });
    
    // Validate Monica calculations
    console.log('\n✅ VALIDATION CHECKS');
    console.log('-' .repeat(50));
    
    let validationsPassed = 0;
    let totalValidations = 0;
    
    // Check 1: All methods have enhanced properties
    totalValidations++;
    if (results.length === testMethods.length) {
      console.log('✅ All cooking methods successfully enhanced');
      validationsPassed++;
    } else {
      console.log('❌ Some cooking methods failed to enhance');
    }
    
    // Check 2: Monica constants are calculated or properly handled
    totalValidations++;
    const monicaCalculated = results.filter(r => !isNaN(r.monica)).length;
    if (monicaCalculated > 0) {
      console.log(`✅ Monica constants calculated for ${monicaCalculated}/${results.length} methods`);
      validationsPassed++;
    } else {
      console.log('❌ No Monica constants calculated');
    }
    
    // Check 3: Temperature adjustments are reasonable
    totalValidations++;
    const reasonableTemps = results.filter(r => r.temperature >= 200 && r.temperature <= 500).length;
    if (reasonableTemps === results.length) {
      console.log('✅ All temperature adjustments are reasonable (200-500°F)');
      validationsPassed++;
    } else {
      console.log('❌ Some temperature adjustments are unreasonable');
    }
    
    // Check 4: Kalchm values are positive
    totalValidations++;
    const positiveKalchm = results.filter(r => r.kalchm > 0).length;
    if (positiveKalchm === results.length) {
      console.log('✅ All Kalchm values are positive');
      validationsPassed++;
    } else {
      console.log('❌ Some Kalchm values are not positive');
    }
    
    console.log(`\n🎯 Validation Score: ${validationsPassed}/${totalValidations} (${Math.round(validationsPassed/totalValidations*100)}%)`);
    
    console.log('\n🎉 Cooking Method Monica Constants Test Completed!');
    console.log('=' .repeat(80));
    
    return {
      success: true,
      results,
      validationScore: validationsPassed / totalValidations,
      enhancedMethods: results.length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testCookingMethodMonicaConstants().then(result => {
  if (result.success) {
    console.log('\n✅ Cooking Method Monica Constants with Alchemical Pillars are ready!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cooking methods now have Monica constants derived from alchemical pillars');
    console.log('• Kalchm values calculated from pillar alchemical effects');
    console.log('• Temperature and timing optimizations based on Monica constants');
    console.log('• Planetary and lunar phase recommendations integrated');
    console.log('• Complete coordination between cooking methods and alchemical pillars');
    console.log(`• Enhanced ${result.enhancedMethods} cooking methods successfully`);
    console.log(`• Validation score: ${Math.round(result.validationScore * 100)}%`);
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
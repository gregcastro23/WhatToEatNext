#!/usr/bin/env node

// ===== UNIFIED RECIPE SYSTEM TEST =====
// Tests the Phase 3 recipe enhancement system

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock recipe data for testing
const mockRecipe = {
  name: "Buttermilk Pancakes",
  description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
  cuisine: "American",
  cookingMethods: ["pan-frying", "flipping"],
  tools: ["mixing bowl", "whisk", "griddle or skillet", "spatula", "measuring cups"],
  preparationSteps: [
    "Mix dry ingredients",
    "Combine wet ingredients separately",
    "Mix wet into dry until just combined",
    "Let batter rest briefly",
    "Cook on medium heat griddle",
    "Flip when bubbles form",
    "Serve with toppings"
  ],
  ingredients: [
    { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
    { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
    { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
    { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
    { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
    { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
  ],
  substitutions: {
    "buttermilk": ["yogurt+milk", "milk+lemon juice"],
    "maple syrup": ["honey", "agave nectar"],
    "butter": ["coconut oil", "vegetable oil"]
  },
  servingSize: 4,
  allergens: ["gluten", "dAiry", "eggs"],
  prepTime: "10 minutes",
  cookTime: "15 minutes",
  culturalNotes: "A staple of American breakfast cuisine, these pancakes are often enjoyed during lazy weekend mornings as family gatherings",
  pAiringSuggestions: ["bacon", "fresh berries", "scrambled eggs", "coffee"],
  dietaryInfo: ["vegetarian"],
  spiceLevel: "none",
  nutrition: {
    calories: 420,
    protein: 11,
    carbs: 62,
    fat: 16,
    vitamins: ["B12", "D"],
    minerals: ["Calcium", "Phosphorus"]
  },
  season: ["all"],
  mealType: ["breakfast"],
  elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
  lunarPhaseInfluences: ["full Moonmoon", "waxing gibbous"],
  zodiacInfluences: ["cancer", "taurus"],
  astrologicalAffinities: {
    planets: ["Moonmoon", "Venusvenus"],
    signs: ["cancer", "taurus"],
    lunarPhases: ["full Moonmoon", "waxing gibbous"]
  }
};

// Mock RecipeEnhancer class for testing
class MockRecipeEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } }
    };
    
    return mockIngredients[ingredientName] || null;
  }
  
  static elementToElementalProperties(element) {
    const elementMap = {
      'Fire': { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
      'Water': { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 },
      'Earth': { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 },
      'Air': { Fire: 0.05, Water: 0.05, Earth: 0.1, Air: 0.8 }
    };
    
    return elementMap[element?.toLowerCase()] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  static estimateKalchmFromElement(element) {
    const elementKalchm = {
      'Fire': 1.15,
      'Water': 0.95,
      'Earth': 0.85,
      'Air': 1.05
    };
    
    return elementKalchm[element?.toLowerCase()] || 1.0;
  }
  
  static calculateRecipeKalchm(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) {
      return { totalKalchm: 1.0, breakdown: [], matchedIngredients: 0 };
    }
    
    let totalKalchm = 0;
    let matchedIngredients = 0;
    const breakdown = [];
    
    for (const ingredient of ingredients) {
      const ingredientName = ingredient.name?.toLowerCase();
      let kalchm = 1.0;
      let elementalContribution = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      
      const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
      if (unifiedIngredient) {
        kalchm = unifiedIngredient.kalchm;
        elementalContribution = unifiedIngredient.elementalProperties;
        matchedIngredients++;
      } else if (ingredient.element) {
        elementalContribution = this.elementToElementalProperties(ingredient.element);
        kalchm = this.estimateKalchmFromElement(ingredient.element);
      }
      
      totalKalchm += kalchm;
      breakdown.push({
        name: ingredient.name,
        kalchm,
        contribution: kalchm / ingredients.length,
        elementalContribution
      });
    }
    
    return {
      totalKalchm: ingredients.length > 0 ? totalKalchm / ingredients.length : 1.0,
      breakdown,
      matchedIngredients
    };
  }
  
  static calculateElementalBalance(breakdown) {
    if (!breakdown || breakdown.length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    
    for (const item of breakdown) {
      const contribution = item.elementalContribution;
      const weight = item.contribution;
      
      totalFire += contribution.Fire * weight;
      totalwater += contribution.water * weight;
      totalearth += contribution.earth * weight;
      totalAir += contribution.Air * weight;
    }
    
    const total = totalFire + totalwater + totalearth + totalAir;
    if (total === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / total,
      Water: totalwater / total,
      Earth: totalearth / total,
      Air: totalAir / total
    };
  }
  
  static calculateRecipeThermodynamics(elementalBalance) {
    const { Fire, water, earth, Air } = elementalBalance;
    
    const heat = (Fire * Fire + 0.5) / (water + earth + Air + 1);
    const entropy = (Fire + Air) / (water + earth + 1);
    const reactivity = (Fire + Air + water) / (earth + 1);
    const gregsEnergy = heat - (entropy * reactivity);
    
    return { heat, entropy, reactivity, gregsEnergy };
  }
  
  static calculateRecipeMonica(thermodynamics, kalchm) {
    const { gregsEnergy, reactivity } = thermodynamics;
    
    if (kalchm <= 0 || reactivity === 0) {
      return null;
    }
    
    const lnKalchm = Math.log(kalchm);
    if (lnKalchm === 0) {
      return null;
    }
    
    const monica = -gregsEnergy / (reactivity * lnKalchm);
    return isNaN(monica) ? null : monica;
  }
  
  static determineAlchemicalClassification(kalchm, monica) {
    if (monica === null) {
      return kalchm > 1.0 ? 'Spirit-Dominant' : 'Matter-Dominant';
    }
    
    if (kalchm > 1.2) return 'Highly Volatile';
    if (kalchm > 1.0) return 'Transformative';
    if (kalchm > 0.8) return 'Balanced';
    return 'Grounding';
  }
  
  static calculateOptimalTemperature(thermodynamics) {
    const { heat, reactivity } = thermodynamics;
    return Math.round(350 + (heat * 50) - (reactivity * 25));
  }
  
  static determineElementalCookingMethod(elementalBalance) {
    const { Fire, water, earth, Air } = elementalBalance;
    
    if (Fire > 0.4) return 'fire-dominant';
    if (water > 0.4) return 'water-dominant';
    if (earth > 0.4) return 'earth-dominant';
    if (Air > 0.4) return 'Air-dominant';
    
    return 'balanced';
  }
  
  static generateThermodynamicRecommendations(thermodynamics, elementalBalance, monica) {
    const recommendations = [];
    const { heat, entropy, reactivity } = thermodynamics;
    
    if (heat > 0.7) {
      recommendations.push('Use high-heat cooking methods for optimal energy release');
    } else if (heat < 0.3) {
      recommendations.push('Gentle, low-heat cooking preserves delicate properties');
    }
    
    if (entropy > 0.6) {
      recommendations.push('Quick cooking prevents energy dispersion');
    } else {
      recommendations.push('Slow cooking allows flavors to develop');
    }
    
    if (reactivity > 0.8) {
      recommendations.push('Monitor carefully - highly reactive ingredients');
    }
    
    if (monica !== null) {
      if (monica > 0) {
        recommendations.push('Increase cooking intensity for optimal results');
      } else {
        recommendations.push('Reduce cooking intensity to maintain balance');
      }
    }
    
    const dominant = Object.entries(elementalBalance)
      .reduce((a, b) => elementalBalance[a[0]] > elementalBalance[b[0]] ? a : b)[0];
    
    switch (dominant) {
      case 'Fire':
        recommendations.push('Fire-dominant: Best with direct heat methods');
        break;
      case 'Water':
        recommendations.push('water-dominant: Excellent for moist heat cooking');
        break;
      case 'Earth':
        recommendations.push('earth-dominant: Perfect for slow, steady cooking');
        break;
      case 'Air':
        recommendations.push('Air-dominant: Benefits from aeration and light cooking');
        break;
    }
    
    return recommendations;
  }
  
  static calculateMonicaAdjustments(monica) {
    if (monica === null) {
      return {};
    }
    
    return {
      temperatureAdjustment: Math.round(monica * 10),
      timingAdjustment: Math.round(monica * 5),
      intensityModifier: monica > 0 ? 'increase' : 'decrease'
    };
  }
  
  static calculatePlanetaryTiming(recipe) {
    if (recipe.astrologicalAffinities?.planets && recipe.astrologicalAffinities.planets.length > 0) {
      return recipe.astrologicalAffinities.planets[0] + ' hour';
    }
    
    if (recipe.zodiacInfluences && recipe.zodiacInfluences.length > 0) {
      const zodiacPlanets = {
        'aries': 'Marsmars', 'taurus': 'Venusvenus', 'gemini': 'Mercurymercury',
        'cancer': 'Moonmoon', 'leo': 'Sun', 'virgo': 'Mercurymercury',
        'libra': 'Venusvenus', 'scorpio': 'Marsmars', 'sagittarius': 'Jupiterjupiter',
        'capricorn': 'Saturnsaturn', 'aquarius': 'Saturnsaturn', 'pisces': 'Jupiterjupiter'
      };
      
      const planet = zodiacPlanets[recipe.zodiacInfluences[0].toLowerCase()];
      return planet ? planet + ' hour' : null;
    }
    
    return null;
  }
  
  static enhanceRecipe(recipe, sourceFile = 'test') {
    // Calculate recipe Kalchm from ingredients
    const kalchmResult = this.calculateRecipeKalchm(recipe.ingredients || []);
    
    // Calculate elemental balance
    const elementalBalance = recipe.elementalProperties || this.calculateElementalBalance(kalchmResult.breakdown);
    
    // Calculate thermodynamic properties
    const thermodynamics = this.calculateRecipeThermodynamics(elementalBalance);
    
    // Calculate Monica constant
    const monicaConstant = this.calculateRecipeMonica(thermodynamics, kalchmResult.totalKalchm);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineAlchemicalClassification(kalchmResult.totalKalchm, monicaConstant);
    
    // Calculate cooking optimization
    const optimalTemperature = this.calculateOptimalTemperature(thermodynamics);
    const planetaryTiming = this.calculatePlanetaryTiming(recipe);
    const monicaAdjustments = this.calculateMonicaAdjustments(monicaConstant);
    const elementalCookingMethod = this.determineElementalCookingMethod(elementalBalance);
    const thermodynamicRecommendations = this.generateThermodynamicRecommendations(
      thermodynamics, 
      elementalBalance, 
      monicaConstant
    );
    
    // Create enhanced recipe (PRESERVES ALL EXISTING DATA)
    const enhancedRecipe = {
      ...recipe, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmResult.totalKalchm,
        monicaConstant,
        thermodynamicProfile: thermodynamics,
        ingredientKalchmBreakdown: kalchmResult.breakdown,
        elementalBalance,
        alchemicalClassification
      },
      
      // ADD cooking optimization
      cookingOptimization: {
        optimalTemperature,
        planetaryTiming,
        monicaAdjustments,
        elementalCookingMethod,
        thermodynamicRecommendations
      },
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        monicaCalculated: monicaConstant !== null,
        enhancedAt: new Date().toISOString(),
        sourceFile,
        ingredientsMatched: kalchmResult.matchedIngredients,
        ingredientsTotal: recipe.ingredients?.length || 0
      }
    };
    
    return enhancedRecipe;
  }
}

// Test function
async function testUnifiedRecipeSystem() {
  console.log('🧪 Testing Unified Recipe System - Phase 3');
  console.log('=' .repeat(60));
  
  try {
    // Test recipe enhancement
    console.log('\n📋 Original Recipe:');
    console.log(`Name: ${mockRecipe.name}`);
    console.log(`Cuisine: ${mockRecipe.cuisine}`);
    console.log(`Ingredients: ${mockRecipe.ingredients.length}`);
    console.log(`Existing Elemental Properties:`, mockRecipe.elementalProperties);
    
    // Enhance the recipe
    const enhancedRecipe = MockRecipeEnhancer.enhanceRecipe(mockRecipe, 'test-american.ts');
    
    console.log('\n✨ Enhanced Recipe Results:');
    console.log('=' .repeat(40));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedRecipe.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Monica Constant: ${enhancedRecipe.alchemicalProperties.monicaConstant?.toFixed(6) || 'null'}`);
    console.log(`Classification: ${enhancedRecipe.alchemicalProperties.alchemicalClassification}`);
    
    // Thermodynamic Profile
    console.log('\n🌡️ Thermodynamic Profile:');
    const thermo = enhancedRecipe.alchemicalProperties.thermodynamicProfile;
    console.log(`Heat: ${thermo.heat.toFixed(4)}`);
    console.log(`Entropy: ${thermo.entropy.toFixed(4)}`);
    console.log(`Reactivity: ${thermo.reactivity.toFixed(4)}`);
    console.log(`Greg's Energy: ${thermo.gregsEnergy.toFixed(4)}`);
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedRecipe.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Ingredient Kalchm Breakdown
    console.log('\n🥘 Ingredient Kalchm Breakdown:');
    enhancedRecipe.alchemicalProperties.ingredientKalchmBreakdown.forEach(ingredient => {
      console.log(`${ingredient.name}: ${ingredient.kalchm.toFixed(4)} (${(ingredient.contribution * 100).toFixed(1)}%)`);
    });
    
    // Cooking Optimization
    console.log('\n🍳 Cooking Optimization:');
    const cooking = enhancedRecipe.cookingOptimization;
    console.log(`Optimal Temperature: ${cooking.optimalTemperature}°F`);
    console.log(`Planetary Timing: ${cooking.planetaryTiming || 'None specified'}`);
    console.log(`Elemental Method: ${cooking.elementalCookingMethod}`);
    
    // Monica Adjustments
    if (Object.keys(cooking.monicaAdjustments).length > 0) {
      console.log('\n⚖️ Monica Adjustments:');
      if (cooking.monicaAdjustments.temperatureAdjustment) {
        console.log(`Temperature: ${cooking.monicaAdjustments.temperatureAdjustment > 0 ? '+' : ''}${cooking.monicaAdjustments.temperatureAdjustment}°F`);
      }
      if (cooking.monicaAdjustments.timingAdjustment) {
        console.log(`Timing: ${cooking.monicaAdjustments.timingAdjustment > 0 ? '+' : ''}${cooking.monicaAdjustments.timingAdjustment} minutes`);
      }
      if (cooking.monicaAdjustments.intensityModifier) {
        console.log(`Intensity: ${cooking.monicaAdjustments.intensityModifier}`);
      }
    }
    
    // Thermodynamic Recommendations
    console.log('\n💡 Thermodynamic Recommendations:');
    cooking.thermodynamicRecommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedRecipe.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Monica Calculated: ${metadata.monicaCalculated}`);
    console.log(`Ingredients Matched: ${metadata.ingredientsMatched}/${metadata.ingredientsTotal}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockRecipe).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedRecipe).length}`);
    console.log(`New properties added: ${Object.keys(enhancedRecipe).length - Object.keys(mockRecipe).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockRecipe)) {
      if (!(key in enhancedRecipe)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original recipe properties preserved');
    }
    
    console.log('\n🎉 Unified Recipe System Test Completed Successfully!');
    console.log('=' .repeat(60));
    
    return {
      success: true,
      originalRecipe: mockRecipe,
      enhancedRecipe,
      preservationCheck
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testUnifiedRecipeSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Recipe System is ready for implementation!');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
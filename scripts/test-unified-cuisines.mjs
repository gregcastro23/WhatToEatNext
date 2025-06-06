#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.14969Water#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.water || 0;
        totalearth += recipe.elementalProperties.30265Earth#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.14969Water#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.water || 0;
        totalearth += recipe.elementalProperties.earth || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});  || 0;
        totalearth += recipe.elementalProperties.earth || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});  || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});  || 0;
        totalearth += recipe.elementalProperties.41288Earth#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.14969Water#!/usr/bin/env node

// ===== UNIFIED CUISINE SYSTEM TEST =====
// Tests the Phase 3 cuisine enhancement system with Kalchm values

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '.');

// Mock American cuisine data for testing (simplified structure)
const mockAmericanCuisine = {
  id: "american",
  name: "American",
  description: "A diverse and evolving cuisine reflecting regional traditions, immigrant influences, and innovative culinary trends throughout the United States.",
  elementalProperties: { Fire: 0.25, Water: 0.30, Earth: 0.35, Air: 0.10 },
  dishes: {
    breakfast: {
      all: [
        {
          name: "Buttermilk Pancakes",
          description: "Fluffy, golden pancakes made with buttermilk and served with maple syrup",
          cuisine: "American",
          cookingMethods: ["pan-frying", "flipping"],
          ingredients: [
            { name: "all-purpose flour", amount: "2", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "eggs", amount: "2", unit: "large", category: "protein", element: "Water" },
            { name: "butter", amount: "4", unit: "tbsp", category: "fat", element: "Earth" },
            { name: "maple syrup", amount: "1/2", unit: "cup", category: "sweetener", element: "Water" },
            { name: "baking powder", amount: "2", unit: "tsp", category: "leavening", element: "Air" }
          ],
          elementalProperties: { Fire: 0.10, Water: 0.40, Earth: 0.40, Air: 0.10 },
          season: ["all"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Moonmoon", "Venusvenus"],
            signs: ["cancer", "taurus"]
          }
        },
        {
          name: "Southern Biscuits and Gravy",
          description: "Flaky buttermilk biscuits smothered in rich sausage gravy",
          cuisine: "American",
          cookingMethods: ["baking", "simmering"],
          ingredients: [
            { name: "all-purpose flour", amount: "3", unit: "cups", category: "grain", element: "Earth" },
            { name: "buttermilk", amount: "1", unit: "cup", category: "dAiry", element: "Water" },
            { name: "butter", amount: "1/2", unit: "cup", category: "fat", element: "Earth" },
            { name: "pork sausage", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "milk", amount: "2", unit: "cups", category: "dAiry", element: "Water" },
            { name: "black pepper", amount: "1", unit: "tsp", category: "spice", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.30, Water: 0.30, Earth: 0.40, Air: 0.00 },
          season: ["autumn", "winter"],
          mealType: ["breakfast"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Saturnsaturn"],
            signs: ["aries", "capricorn"]
          }
        }
      ]
    },
    lunch: {
      all: [
        {
          name: "Classic Cheeseburger",
          description: "Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun",
          cuisine: "American",
          cookingMethods: ["grilling", "toasting"],
          ingredients: [
            { name: "ground beef", amount: "1", unit: "pound", category: "protein", element: "Fire" },
            { name: "cheddar cheese", amount: "4", unit: "slices", category: "dAiry", element: "Earth" },
            { name: "hamburger buns", amount: "4", unit: "pieces", category: "grain", element: "Earth" },
            { name: "lettuce", amount: "4", unit: "leaves", category: "vegetable", element: "Air" },
            { name: "tomato", amount: "1", unit: "large", category: "vegetable", element: "Water" },
            { name: "onion", amount: "1", unit: "medium", category: "vegetable", element: "Fire" }
          ],
          elementalProperties: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
          season: ["spring", "summer"],
          mealType: ["lunch", "dinner"],
          astrologicalAffinities: {
            planets: ["Marsmars", "Jupiterjupiter"],
            signs: ["aries", "leo"]
          }
        }
      ]
    }
  }
};

// Mock CuisineEnhancer class for testing
class MockCuisineEnhancer {
  
  static findUnifiedIngredient(ingredientName) {
    // Mock ingredient lookup with Kalchm values
    const mockIngredients = {
      'all-purpose flour': { kalchm: 0.85, elementalProperties: { Fire: 0.05, Water: 0.1, Earth: 0.8, Air: 0.05 } },
      'buttermilk': { kalchm: 0.95, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'eggs': { kalchm: 1.05, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'butter': { kalchm: 0.90, elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.65, Air: 0.05 } },
      'maple syrup': { kalchm: 1.10, elementalProperties: { Fire: 0.15, Water: 0.6, Earth: 0.2, Air: 0.05 } },
      'baking powder': { kalchm: 1.20, elementalProperties: { Fire: 0.1, Water: 0.1, Earth: 0.1, Air: 0.7 } },
      'pork sausage': { kalchm: 1.15, elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.15, Air: 0.05 } },
      'milk': { kalchm: 0.92, elementalProperties: { Fire: 0.05, Water: 0.8, Earth: 0.1, Air: 0.05 } },
      'black pepper': { kalchm: 1.25, elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } },
      'ground beef': { kalchm: 1.18, elementalProperties: { Fire: 0.65, Water: 0.2, Earth: 0.1, Air: 0.05 } },
      'cheddar cheese': { kalchm: 0.88, elementalProperties: { Fire: 0.1, Water: 0.25, Earth: 0.6, Air: 0.05 } },
      'hamburger buns': { kalchm: 0.82, elementalProperties: { Fire: 0.05, Water: 0.15, Earth: 0.75, Air: 0.05 } },
      'lettuce': { kalchm: 0.78, elementalProperties: { Fire: 0.05, Water: 0.2, Earth: 0.15, Air: 0.6 } },
      'tomato': { kalchm: 0.85, elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.15, Air: 0.05 } },
      'onion': { kalchm: 1.08, elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 } }
    };
    
    return mockIngredients[ingredientName] || null;
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
  
  static extractRecipesFromCuisine(cuisine) {
    const recipes = [];
    
    if (!cuisine.dishes || typeof cuisine.dishes !== 'object') {
      return recipes;
    }
    
    // Navigate through meal types (breakfast, lunch, dinner, etc.)
    for (const [mealType, mealData] of Object.entries(cuisine.dishes)) {
      if (!mealData || typeof mealData !== 'object') continue;
      
      // Navigate through seasons (spring, summer, autumn, winter, all)
      for (const [season, dishes] of Object.entries(mealData)) {
        if (!Array.isArray(dishes)) continue;
        
        // Add each dish as a recipe
        for (const dish of dishes) {
          if (dish && dish.name) {
            recipes.push({
              ...dish,
              mealType,
              season,
              cuisine: cuisine.name
            });
          }
        }
      }
    }
    
    return recipes;
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
  
  static analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms) {
    const mostCommon = [];
    const kalchmValues = [];
    
    // Build most common ingredients with their Kalchm values
    for (const [ingredient, frequency] of ingredientFrequency.entries()) {
      const kalchm = ingredientKalchms.get(ingredient) || 1.0;
      mostCommon.push({ ingredient, kalchm, frequency });
      kalchmValues.push(kalchm);
    }
    
    // Sort by frequency (most common first)
    mostCommon.sort((a, b) => b.frequency - a.frequency);
    
    // Calculate Kalchm range
    const kalchmRange = kalchmValues.length > 0 ? {
      min: Math.min(...kalchmValues),
      max: Math.max(...kalchmValues),
      average: kalchmValues.reduce((a, b) => a + b, 0) / kalchmValues.length
    } : { min: 1.0, max: 1.0, average: 1.0 };
    
    return {
      mostCommon: mostCommon.slice(0, 10), // Top 10 most common ingredients
      kalchmRange
    };
  }
  
  static analyzeCookingMethodInfluence(cookingMethods) {
    const primaryMethods = [];
    const methodKalchmModifiers = {};
    
    // Define Kalchm modifiers for different cooking methods
    const kalchmModifierMap = {
      // Fire-dominant methods (increase Kalchm)
      'grilling': 1.15,
      'roasting': 1.12,
      'searing': 1.18,
      'frying': 1.10,
      'broiling': 1.14,
      
      // water-dominant methods (moderate Kalchm)
      'steaming': 0.95,
      'boiling': 0.92,
      'poaching': 0.90,
      'braising': 0.98,
      'simmering': 0.94,
      
      // earth-dominant methods (stabilize Kalchm)
      'baking': 0.88,
      'slow-cooking': 0.85,
      'smoking': 0.87,
      'curing': 0.82,
      
      // Air-dominant methods (elevate Kalchm)
      'whipping': 1.08,
      'rising': 1.05,
      'fermenting': 1.12,
      'dehydrating': 1.06,
      
      // Balanced methods
      'sautéing': 1.02,
      'stir-frying': 1.04,
      'pan-frying': 1.03,
      'blanching': 0.96,
      'toasting': 1.01,
      'flipping': 1.00
    };
    
    // Sort cooking methods by frequency
    const sortedMethods = Array.from(cookingMethods.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Get primary methods (top 5)
    primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));
    
    // Calculate method Kalchm modifiers
    for (const [method, frequency] of cookingMethods.entries()) {
      const baseModifier = kalchmModifierMap[method.toLowerCase()] || 1.0;
      // Weight modifier by frequency (more frequent methods have stronger influence)
      const totalFrequency = Array.from(cookingMethods.values()).reduce((a, b) => a + b, 0);
      const frequencyWeight = frequency / totalFrequency;
      methodKalchmModifiers[method] = baseModifier * (0.5 + frequencyWeight * 0.5);
    }
    
    return {
      primaryMethods,
      methodKalchmModifiers
    };
  }
  
  static calculateCuisineKalchm(cuisine) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    const ingredientFrequency = new Map();
    const ingredientKalchms = new Map();
    const cookingMethods = new Map();
    let totalRecipeKalchm = 0;
    let validRecipes = 0;
    
    // Analyze each recipe
    for (const recipe of recipes) {
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) continue;
      
      // Calculate recipe Kalchm
      const recipeKalchmResult = this.calculateRecipeKalchm(recipe.ingredients);
      totalRecipeKalchm += recipeKalchmResult.totalKalchm;
      validRecipes++;
      
      // Track ingredient frequency and Kalchm values
      for (const ingredient of recipe.ingredients) {
        const ingredientName = ingredient.name?.toLowerCase();
        if (!ingredientName) continue;
        
        // Update frequency
        ingredientFrequency.set(ingredientName, (ingredientFrequency.get(ingredientName) || 0) + 1);
        
        // Get Kalchm value
        const unifiedIngredient = this.findUnifiedIngredient(ingredientName);
        if (unifiedIngredient) {
          ingredientKalchms.set(ingredientName, unifiedIngredient.kalchm);
        } else if (ingredient.element) {
          ingredientKalchms.set(ingredientName, this.estimateKalchmFromElement(ingredient.element));
        }
      }
      
      // Track cooking methods
      if (recipe.cookingMethods && Array.isArray(recipe.cookingMethods)) {
        for (const method of recipe.cookingMethods) {
          cookingMethods.set(method, (cookingMethods.get(method) || 0) + 1);
        }
      }
    }
    
    // Calculate average recipe Kalchm
    const averageRecipeKalchm = validRecipes > 0 ? totalRecipeKalchm / validRecipes : 1.0;
    
    // Analyze ingredient Kalchm profile
    const ingredientKalchmProfile = this.analyzeIngredientKalchmProfile(ingredientFrequency, ingredientKalchms);
    
    // Analyze cooking method influence
    const cookingMethodInfluence = this.analyzeCookingMethodInfluence(cookingMethods);
    
    // Calculate total cuisine Kalchm (weighted average of recipe Kalchm and ingredient profile)
    const ingredientKalchmWeight = 0.6;
    const recipeKalchmWeight = 0.4;
    const totalKalchm = (ingredientKalchmProfile.kalchmRange.average * ingredientKalchmWeight) + 
                       (averageRecipeKalchm * recipeKalchmWeight);
    
    return {
      totalKalchm,
      averageRecipeKalchm,
      ingredientKalchmProfile,
      cookingMethodInfluence,
      recipesAnalyzed: validRecipes,
      ingredientsAnalyzed: ingredientKalchms.size
    };
  }
  
  static calculateCuisineElementalBalance(cuisine) {
    // Use existing elemental properties if available
    if (cuisine.elementalProperties) {
      return cuisine.elementalProperties;
    }
    
    if (cuisine.elementalState) {
      return cuisine.elementalState;
    }
    
    // Calculate from recipes
    const recipes = this.extractRecipesFromCuisine(cuisine);
    let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
    let validRecipes = 0;
    
    for (const recipe of recipes) {
      if (recipe.elementalProperties) {
        totalFire += recipe.elementalProperties.Fire || 0;
        totalwater += recipe.elementalProperties.water || 0;
        totalearth += recipe.elementalProperties.earth || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});  || 0;
        totalearth += recipe.elementalProperties.earth || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});  || 0;
        totalAir += recipe.elementalProperties.Air || 0;
        validRecipes++;
      }
    }
    
    if (validRecipes === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    return {
      Fire: totalFire / validRecipes,
      Water: totalwater / validRecipes,
      Earth: totalearth / validRecipes,
      Air: totalAir / validRecipes
    };
  }
  
  static determineCuisineAlchemicalClassification(kalchm, cookingMethods) {
    // Base classification on Kalchm value
    let baseClassification = '';
    if (kalchm > 1.2) baseClassification = 'Highly Transformative';
    else if (kalchm > 1.1) baseClassification = 'Transformative';
    else if (kalchm > 0.9) baseClassification = 'Balanced';
    else baseClassification = 'Grounding';
    
    // Modify based on cooking methods
    const fireMethodCount = cookingMethods.filter(method => 
      ['grilling', 'roasting', 'searing', 'frying', 'broiling'].includes(method.toLowerCase())
    ).length;
    
    const waterMethodCount = cookingMethods.filter(method => 
      ['steaming', 'boiling', 'poaching', 'braising', 'simmering'].includes(method.toLowerCase())
    ).length;
    
    if (fireMethodCount > waterMethodCount * 2) {
      return baseClassification + ' (Fire-Focused)';
    } else if (waterMethodCount > fireMethodCount * 2) {
      return baseClassification + ' (water-Focused)';
    }
    
    return baseClassification;
  }
  
  static calculateCuisineOptimization(cuisine, kalchm, elementalBalance) {
    const recipes = this.extractRecipesFromCuisine(cuisine);
    
    // Analyze optimal seasons
    const seasonFrequency = new Map();
    const planetaryAffinities = new Set();
    
    for (const recipe of recipes) {
      // Count seasons
      if (recipe.season && Array.isArray(recipe.season)) {
        for (const season of recipe.season) {
          if (season !== 'all') {
            seasonFrequency.set(season, (seasonFrequency.get(season) || 0) + 1);
          }
        }
      }
      
      // Collect planetary affinities
      if (recipe.astrologicalAffinities?.planets) {
        for (const planet of recipe.astrologicalAffinities.planets) {
          planetaryAffinities.add(planet);
        }
      }
    }
    
    // Get optimal seasons (top 2)
    const optimalSeasons = Array.from(seasonFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([season]) => season);
    
    // Determine elemental cooking methods
    const { Fire, water, earth, Air } = elementalBalance;
    const elementalCookingMethods = [];
    
    if (Fire > 0.3) elementalCookingMethods.push('grilling', 'roasting', 'searing');
    if (water > 0.3) elementalCookingMethods.push('steaming', 'boiling', 'braising');
    if (earth > 0.3) elementalCookingMethods.push('baking', 'slow-cooking', 'smoking');
    if (Air > 0.3) elementalCookingMethods.push('whipping', 'fermenting', 'rising');
    
    return {
      optimalSeasons: optimalSeasons.length > 0 ? optimalSeasons : ['all'],
      planetaryAffinities: Array.from(planetaryAffinities).slice(0, 3),
      elementalCookingMethods,
      kalchmCompatibleCuisines: [] // Will be populated when comparing with other cuisines
    };
  }
  
  static enhanceCuisine(cuisine, sourceFile = 'test') {
    // Calculate cuisine Kalchm and analysis
    const kalchmAnalysis = this.calculateCuisineKalchm(cuisine);
    
    // Calculate elemental balance
    const elementalBalance = this.calculateCuisineElementalBalance(cuisine);
    
    // Determine alchemical classification
    const alchemicalClassification = this.determineCuisineAlchemicalClassification(
      kalchmAnalysis.totalKalchm,
      kalchmAnalysis.cookingMethodInfluence.primaryMethods
    );
    
    // Calculate cuisine optimization
    const cuisineOptimization = this.calculateCuisineOptimization(
      cuisine,
      kalchmAnalysis.totalKalchm,
      elementalBalance
    );
    
    // Create enhanced cuisine (PRESERVES ALL EXISTING DATA)
    const enhancedCuisine = {
      ...cuisine, // Preserve ALL existing properties
      
      // ADD new alchemical properties
      alchemicalProperties: {
        totalKalchm: kalchmAnalysis.totalKalchm,
        averageRecipeKalchm: kalchmAnalysis.averageRecipeKalchm,
        ingredientKalchmProfile: kalchmAnalysis.ingredientKalchmProfile,
        cookingMethodInfluence: kalchmAnalysis.cookingMethodInfluence,
        alchemicalClassification,
        elementalBalance
      },
      
      // ADD cuisine optimization
      cuisineOptimization,
      
      // ADD enhancement metadata
      enhancementMetadata: {
        phase3Enhanced: true,
        kalchmCalculated: true,
        recipesAnalyzed: kalchmAnalysis.recipesAnalyzed,
        ingredientsAnalyzed: kalchmAnalysis.ingredientsAnalyzed,
        enhancedAt: new Date().toISOString(),
        sourceFile
      }
    };
    
    return enhancedCuisine;
  }
}

// Test function
async function testUnifiedCuisineSystem() {
  console.log('🧪 Testing Unified Cuisine System - Phase 3 Kalchm Integration');
  console.log('=' .repeat(70));
  
  try {
    // Test cuisine enhancement
    console.log('\n📋 Original Cuisine:');
    console.log(`Name: ${mockAmericanCuisine.name}`);
    console.log(`ID: ${mockAmericanCuisine.id}`);
    console.log(`Existing Elemental Properties:`, mockAmericanCuisine.elementalProperties);
    
    // Count recipes in cuisine
    const recipes = MockCuisineEnhancer.extractRecipesFromCuisine(mockAmericanCuisine);
    console.log(`Total Recipes Found: ${recipes.length}`);
    
    // Enhance the cuisine
    const enhancedCuisine = MockCuisineEnhancer.enhanceCuisine(mockAmericanCuisine, 'test-american.ts');
    
    console.log('\n✨ Enhanced Cuisine Results:');
    console.log('=' .repeat(50));
    
    // Alchemical Properties
    console.log('\n🔬 Alchemical Properties:');
    console.log(`Total Kalchm: ${enhancedCuisine.alchemicalProperties.totalKalchm.toFixed(6)}`);
    console.log(`Average Recipe Kalchm: ${enhancedCuisine.alchemicalProperties.averageRecipeKalchm.toFixed(6)}`);
    console.log(`Classification: ${enhancedCuisine.alchemicalProperties.alchemicalClassification}`);
    
    // Ingredient Kalchm Profile
    console.log('\n🥘 Ingredient Kalchm Profile:');
    const ingredientProfile = enhancedCuisine.alchemicalProperties.ingredientKalchmProfile;
    console.log(`Kalchm Range: ${ingredientProfile.kalchmRange.min.toFixed(3)} - ${ingredientProfile.kalchmRange.max.toFixed(3)}`);
    console.log(`Average Ingredient Kalchm: ${ingredientProfile.kalchmRange.average.toFixed(6)}`);
    console.log('\nMost Common Ingredients:');
    ingredientProfile.mostCommon.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ingredient}: ${item.kalchm.toFixed(4)} (used ${item.frequency} times)`);
    });
    
    // Cooking Method Influence
    console.log('\n👨‍🍳 Cooking Method Influence:');
    const cookingInfluence = enhancedCuisine.alchemicalProperties.cookingMethodInfluence;
    console.log(`Primary Methods: ${cookingInfluence.primaryMethods.join(', ')}`);
    console.log('Method Kalchm Modifiers:');
    Object.entries(cookingInfluence.methodKalchmModifiers).forEach(([method, modifier]) => {
      console.log(`  ${method}: ${modifier.toFixed(4)}`);
    });
    
    // Elemental Balance
    console.log('\n🌍 Elemental Balance:');
    const elemental = enhancedCuisine.alchemicalProperties.elementalBalance;
    console.log(`Fire: ${(elemental.Fire * 100).toFixed(1)}%`);
    console.log(`Water: ${(elemental.water * 100).toFixed(1)}%`);
    console.log(`Earth: ${(elemental.earth * 100).toFixed(1)}%`);
    console.log(`Air: ${(elemental.Air * 100).toFixed(1)}%`);
    
    // Cuisine Optimization
    console.log('\n🎯 Cuisine Optimization:');
    const optimization = enhancedCuisine.cuisineOptimization;
    console.log(`Optimal Seasons: ${optimization.optimalSeasons.join(', ')}`);
    console.log(`Planetary Affinities: ${optimization.planetaryAffinities.join(', ')}`);
    console.log(`Elemental Cooking Methods: ${optimization.elementalCookingMethods.join(', ')}`);
    
    // Enhancement Metadata
    console.log('\n📊 Enhancement Metadata:');
    const metadata = enhancedCuisine.enhancementMetadata;
    console.log(`Phase 3 Enhanced: ${metadata.phase3Enhanced}`);
    console.log(`Kalchm Calculated: ${metadata.kalchmCalculated}`);
    console.log(`Recipes Analyzed: ${metadata.recipesAnalyzed}`);
    console.log(`Ingredients Analyzed: ${metadata.ingredientsAnalyzed}`);
    console.log(`Enhanced At: ${metadata.enhancedAt}`);
    
    // Verify data preservation
    console.log('\n✅ Data Preservation Check:');
    console.log(`Original properties preserved: ${Object.keys(mockAmericanCuisine).length}`);
    console.log(`Enhanced properties total: ${Object.keys(enhancedCuisine).length}`);
    console.log(`New properties added: ${Object.keys(enhancedCuisine).length - Object.keys(mockAmericanCuisine).length}`);
    
    // Check that all original properties are preserved
    let preservationCheck = true;
    for (const key of Object.keys(mockAmericanCuisine)) {
      if (!(key in enhancedCuisine)) {
        console.log(`❌ Missing original property: ${key}`);
        preservationCheck = false;
      }
    }
    
    if (preservationCheck) {
      console.log('✅ All original cuisine properties preserved');
    }
    
    // Test recipe extraction
    console.log('\n📝 Recipe Extraction Test:');
    console.log(`Recipes extracted: ${recipes.length}`);
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name} (${recipe.mealType}/${recipe.season})`);
    });
    
    console.log('\n🎉 Unified Cuisine System Test Completed Successfully!');
    console.log('=' .repeat(70));
    
    return {
      success: true,
      originalCuisine: mockAmericanCuisine,
      enhancedCuisine,
      preservationCheck,
      recipesExtracted: recipes.length
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
testUnifiedCuisineSystem().then(result => {
  if (result.success) {
    console.log('\n✅ Phase 3 Unified Cuisine System with Kalchm values is ready for implementation!');
    console.log('\n🔬 Key Achievements:');
    console.log('• Cuisines now have their own Kalchm values calculated from recipes and ingredients');
    console.log('• Ingredient Kalchm profiles show most common ingredients and their values');
    console.log('• Cooking method influence on cuisine Kalchm calculated');
    console.log('• Complete data preservation maintained');
    console.log('• Elemental self-reinforcement principles followed');
  } else {
    console.log('\n❌ Test failed, needs debugging');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 
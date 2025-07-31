#!/usr/bin/env node

const fs = require('fs');

const filePath = 'src/data/cuisineFlavorProfiles.ts';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Define the missing cuisines
const missingCuisines = `
  // American Cuisines
  american: {
    id: 'american',
    name: 'American',
    description: 'Diverse cuisine with regional specialties and comfort food traditions.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.6,
      sour: 0.3,
      bitter: 0.2,
      salty: 0.7,
      umami: 0.5,
    },
    elementalAlignment: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.1,
    },
    signatureTechniques: ['grilling', 'barbecuing', 'frying', 'baking'],
    signatureIngredients: ['beef', 'corn', 'potatoes', 'cheese'],
    traditionalMealPatterns: ['breakfast', 'lunch', 'dinner'],
    planetaryResonance: ['Jupiter', 'Venus'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'some-vegetarian'],
  },

  // Middle Eastern Cuisines
  middleEastern: {
    id: 'middleEastern',
    name: 'Middle Eastern',
    description: 'Rich cuisine with aromatic spices, grains, and ancient traditions.',
    flavorProfiles: {
      spicy: 0.5,
      sweet: 0.4,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.4,
    },
    elementalAlignment: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.1,
    },
    signatureTechniques: ['roasting', 'grilling', 'stewing', 'stuffing'],
    signatureIngredients: ['lamb', 'rice', 'chickpeas', 'tahini', 'sumac'],
    traditionalMealPatterns: ['mezze', 'family-style', 'communal'],
    planetaryResonance: ['Mars', 'Sun'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'vegetarian-friendly'],
  },

  // Vietnamese Cuisine
  vietnamese: {
    id: 'vietnamese',
    name: 'Vietnamese',
    description: 'Fresh, herb-forward cuisine with balanced flavors and healthy preparations.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.5,
      sour: 0.7,
      bitter: 0.2,
      salty: 0.6,
      umami: 0.6,
    },
    elementalAlignment: {
      Fire: 0.2,
      Water: 0.5,
      Earth: 0.2,
      Air: 0.1,
    },
    signatureTechniques: ['steaming', 'stir-frying', 'grilling', 'fresh preparation'],
    signatureIngredients: ['rice', 'fish sauce', 'herbs', 'lime', 'chili'],
    traditionalMealPatterns: ['pho', 'family-style', 'fresh rolls'],
    planetaryResonance: ['Mercury', 'Moon'],
    seasonalPreference: ['spring', 'summer'],
    dietarySuitability: ['omnivore', 'pescatarian-friendly'],
  },

  // African Cuisine
  african: {
    id: 'african',
    name: 'African',
    description: 'Diverse continental cuisine with bold spices and hearty preparations.',
    flavorProfiles: {
      spicy: 0.7,
      sweet: 0.3,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.4,
    },
    elementalAlignment: {
      Fire: 0.5,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.1,
    },
    signatureTechniques: ['stewing', 'grilling', 'steaming', 'fermentation'],
    signatureIngredients: ['yams', 'plantains', 'millet', 'berbere', 'peanuts'],
    traditionalMealPatterns: ['communal', 'one-pot', 'grain-based'],
    planetaryResonance: ['Mars', 'Sun', 'Jupiter'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'vegetarian-options'],
  },

  // Russian Cuisine
  russian: {
    id: 'russian',
    name: 'Russian',
    description: 'Hearty cuisine adapted to cold climates with preserved foods and warming dishes.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.4,
      sour: 0.6,
      bitter: 0.3,
      salty: 0.7,
      umami: 0.5,
    },
    elementalAlignment: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1,
    },
    signatureTechniques: ['braising', 'pickling', 'smoking', 'slow-cooking'],
    signatureIngredients: ['beets', 'cabbage', 'potatoes', 'dill', 'sour cream'],
    traditionalMealPatterns: ['zakuski', 'hearty meals', 'tea culture'],
    planetaryResonance: ['Saturn', 'Moon'],
    seasonalPreference: ['autumn', 'winter'],
    dietarySuitability: ['omnivore', 'some-vegetarian'],
  },
`;

// Replace the "More cuisines as needed..." comment with the actual cuisines
content = content.replace(
  /\s*\/\/ More cuisines as needed\.\.\.\s*\n/,
  missingCuisines + '\n  // More cuisines as needed...\n'
);

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('✅ Added missing cuisine entries to flavorProfiles');

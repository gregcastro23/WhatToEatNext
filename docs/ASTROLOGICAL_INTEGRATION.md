# Astrological Integration Guide

This document explains how the astrological features are integrated into the "What To Eat Next" application, providing accurate planetary data and detailed explanations for food recommendations.

## Overview

The astrological integration provides:
- Live astrological data from astronomy calculations
- Improved planetary influence calculations
- Detailed astrological explanations for food recommendations
- Historical tracking of planetary positions

## How It Works

### 1. Astrological Data Sources

The system uses multiple sources to ensure reliable astrological data:

- **Primary Source**: [astronomy-engine](https://github.com/cosinekitty/astronomy) library for accurate ephemeris calculations
- **Fallback**: Static reference data for when live calculations aren't available

### 2. Key Components

#### AstrologyService
- Singleton service that provides planetary positions, lunar phases, and other astrological data
- Uses astronomy-engine for accurate calculations
- Includes fallback mechanisms for reliability

```typescript
// Example usage
import astrologyService from '../services/AstrologyService';

// Get current planetary positions
const positions = await astrologyService.getPlanetaryPositions();

// Get lunar phase
const lunarPhase = astrologyService.getLunarPhase();
```

#### AstrologyApi
- Interface layer that standardizes astrological data
- Caches results to improve performance
- Handles error cases gracefully

```typescript
// Example usage
import { getCurrentCelestialPositions } from '../services/astrologyApi';

// Get current positions
const positions = await getCurrentCelestialPositions();
```

#### AstrologicalFoodRecommendationService
- Provides detailed astrological explanations for food recommendations
- Links planetary influences to specific ingredients and recipes
- Considers planetary aspects, dignities, and other traditional astrological concepts

```typescript
// Example usage
import astrologicalFoodService from '../services/AstrologicalFoodRecommendationService';

// Get astrological explanation
const explanation = await astrologicalFoodService.getAstrologicalExplanation(elementalProfile);

// Get ingredient recommendations
const ingredients = await astrologicalFoodService.getAstrologicalIngredientRecommendations();
```

### 3. Data Flow

```
+-----------------+     +------------------+     +----------------------------+
| astronomy-engine|---->| AstrologyService |---->| AstrologicalFoodRecommender|
+-----------------+     +------------------+     +----------------------------+
                               |                               |
                               v                               v
                        +-------------+                +----------------+
                        | AstrologyApi|                | Food          |
                        +-------------+                | Recommendations|
                               |                       +----------------+
                               v
                        +--------------+
                        | Cached Data  |
                        +--------------+
```

## Utilities and Scripts

### 1. Validation Tool
The `astroValidation.ts` utility compares calculations from different sources to ensure accuracy.

To run the validation:
```bash
yarn check-astro
```

### 2. Data Update Script
The `updateAstrologyData.ts` script collects and saves current astrological data for historical tracking.

To update the data:
```bash
yarn update-astro-data
```

### 3. Food Explanation Generator
The `generateAstrologicalFoodExplanations.ts` script demonstrates how astrological data is used for food recommendations.

To generate sample recommendations:
```bash
yarn generate-food-explanations
```

## Planetary Influence Calculations

The system calculates planetary influences using several factors:

1. **Basic Position**: The zodiac sign and degree of each planet
2. **Planetary Dignity**: Whether a planet is in rulership, exaltation, detriment, or fall
3. **Retrograde Status**: Adjusts influence for retrograde planets
4. **House Position**: Considers the placement in houses (when available)
5. **Aspects**: Evaluates relationships between planets

## Elemental Profile Calculation

Elemental profiles (Fire, Water, Earth, Air) are calculated from planetary positions:

```typescript
// Example result
{
  Fire: 0.35,
  Water: 0.25,
  Earth: 0.20,
  Air: 0.20
}
```

These profiles influence food recommendations in accordance with elemental theory.

## Adding Detailed Astrological Explanations

To add astrological explanations to a recipe recommendation:

```typescript
// 1. Get recipe details
const recipe = {
  name: 'Spicy Tomato Pasta',
  elements: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
  ingredients: ['tomato', 'garlic', 'chili', 'olive oil', 'pasta', 'basil']
};

// 2. Get astrological explanation
const alignment = await astrologicalFoodService.getRecipeAstrologicalAlignment(
  recipe.name, 
  recipe.elements
);

// 3. Get planetary messages
const messages = await astrologicalFoodService.getPlanetaryMessages(recipe);

// 4. Include in response
const recommendation = {
  recipe,
  astrologicalAlignment: alignment,
  planetaryMessages: messages
};
```

## Troubleshooting

### Common Issues

1. **Missing or inaccurate planetary data**
   - Check that astronomy-engine is properly installed
   - Run the validation tool to compare sources
   - Verify system date and time are correct

2. **Inconsistent food recommendations**
   - Ensure elemental profiles are correctly calculated
   - Validate recipe elemental classifications

## Future Enhancements

Planned improvements to the astrological integration:

1. Add support for more celestial bodies (asteroids, fixed stars)
2. Implement more sophisticated aspect calculations
3. Integrate with personal birth chart data for personalized recommendations
4. Add predictive features based on upcoming transits 
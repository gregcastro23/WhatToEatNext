# Cooking Methods

This document provides an overview of the cooking methods system in the
WhatToEatNext application.

## Data Structure

The cooking methods data is organized into two main levels:

1. **Simplified Overview** (`/src/data/cooking/cookingMethods.ts`):
   - Contains basic information for quick reference
   - Includes elemental properties, benefits, and astrological influences
   - Used for simpler UI components and quick lookups

2. **Detailed Database** (`/src/data/cooking/methods/`):
   - Comprehensive data organized by cooking method categories
   - Each method has extensive metadata and properties
   - Used for detailed views and advanced recommendations

## Categories

Cooking methods are organized into the following categories:

- **Dry Methods**: Cooking using hot air, radiation, or hot oil
  - Examples: Roasting, baking, grilling, frying, broiling
  - Located in: `/src/data/cooking/methods/dry/`

- **Wet Methods**: Cooking using water or steam
  - Examples: Steaming, boiling, poaching, braising
  - Located in: `/src/data/cooking/methods/wet/`

- **Molecular Methods**: Modern scientific cooking techniques
  - Examples: Spherification, foaming, sous vide
  - Located in: `/src/data/cooking/methods/molecular/`

- **Traditional Methods**: Historical and cultural techniques
  - Examples: Smoking, curing, fermenting
  - Located in: `/src/data/cooking/methods/traditional/`

- **Raw Methods**: Techniques that don't apply heat
  - Examples: Curing, marinating, pickling
  - Located in: `/src/data/cooking/methods/raw/`

## Data Fields

Each cooking method includes:

- **Basic Information**:
  - `name`: Unique identifier
  - `description`: Short description
  - `duration`: Min and max cooking time

- **Elemental Properties**:
  - `elementalEffect`: Influence on Fire, Water, Earth, Air elements
  - `thermodynamicProperties`: Heat, entropy, reactivity, energy

- **Astrological Influences**:
  - `favorableZodiac`: Compatible zodiac signs
  - `unfavorableZodiac`: Incompatible zodiac signs
  - `dominantPlanets`: Planetary influences
  - `lunarPhaseEffect`: Effect modifications based on moon phase

- **Technical Information**:
  - `toolsRequired`: Equipment needed
  - `optimalTemperatures`: Ideal temps for different foods
  - `commonMistakes`: Errors to avoid
  - `scientificPrinciples`: Chemical/physical processes

- **Food Pairing**:
  - `suitable_for`: Types of ingredients that work well
  - `pairingSuggestions`: Specific foods that pair well
  - `benefits`: Advantages of this cooking method

## Helper Functions

- `getDetailedCookingMethod(methodName)`: Get detailed data for a specific
  method
- `getCookingMethodNames()`: Get list of all method names
- `getCookingMethodsByElement(element, threshold)`: Find methods compatible with
  an element

## Usage Examples

```typescript
// Import the cooking methods data
import { cookingMethods, getDetailedCookingMethod } from '../data/cooking/cookingMethods';

// Get basic info about roasting
const roastingBasic = cookingMethods.roasting;

// Get detailed info about roasting
const roastingDetailed = getDetailedCookingMethod('roasting');

// Get methods compatible with Fire element (threshold 0.7)
const fireMethods = getCookingMethodsByElement('Fire', 0.7);
```

## Adding New Methods

To add a new cooking method:

1. Create a new file in the appropriate category directory
2. Follow the template structure from `/src/data/cooking/methods/template.ts`
3. Export the method from the category's index.ts file
4. Add it to the simplified overview in cookingMethods.ts if needed

## Related Components

- `CookingMethods.tsx`: Main component for displaying methods
- `CookingMethodsSection.tsx`: Component for displaying categorized methods

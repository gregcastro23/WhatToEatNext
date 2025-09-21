# Chakra System Integration

This module integrates chakra energy mapping with the existing astrological
energy system to provide food recommendations based on chakra balances.

## Components

### Constants and Types

- **chakraMappings.ts**: Defines the seven chakras, their properties, and
  mappings to zodiac signs
  - Provides constants for chakra colors, elements, and associated planets
  - Maps chakras to zodiac signs and vice versa
  - Includes food recommendations for each chakra

### Services

- **ChakraService.ts**: Calculates chakra energy states based on zodiac sign
  energies
  - Determines balance state of each chakra (balanced, underactive, overactive)
  - Suggests dietary adjustments based on chakra imbalances
  - Maps astrological energies to chakra system

### Utilities

- **chakraFoodUtils.ts**: Provides food recommendation functionality
  - Maps food groups to chakras
  - Generates specific food recommendations based on chakra states
  - Creates balanced meal suggestions for chakra healing
  - Maps zodiac signs to food recommendations via chakra correspondences

## Usage

```typescript
// Calculate sign energy states from planetary positions
const signEnergyStates = calculateSignEnergyStates(planetaryPositions, aspects);

// Create chakra service
const chakraService = new ChakraService();

// Calculate chakra energy states
const chakraEnergyStates = chakraService.calculateChakraEnergyStates(signEnergyStates);

// Get food recommendations based on chakra states
const foodRecommendations = getFoodRecommendationsFromChakras(chakraEnergyStates);

// Get food recommendations for a specific zodiac sign
const ariesFoods = getZodiacSignFoodRecommendations('aries');

// Get dietary suggestions based on chakra balances
const suggestions = chakraService.suggestDietaryAdjustments(chakraEnergyStates);
```

## Integration Points

This chakra system integrates with the existing astrological system:

1. Uses the `signEnergyStates.ts` zodiac sign energy calculations
2. Maps planetary positions to chakra energies
3. Enhances food recommendations with chakra-balancing properties
4. Provides a holistic approach to dietary suggestions

## Chakra and Zodiac Correspondences

| Chakra       | Primary Zodiac Signs    | Element(s) | Planet  |
| ------------ | ----------------------- | ---------- | ------- |
| Root         | capricorn, taurus       | Earth      | Saturn  |
| Sacral       | cancer, Scorpio, pisces | Water      | Jupiter |
| Solar Plexus | aries, leo, sagittarius | Fire       | Mars    |
| Heart        | Libra, taurus           | Air        | Venus   |
| Throat       | gemini, virgo           | Ether      | Mercury |
| Third Eye    | pisces, sagittarius     | Light      | Moon    |
| Crown        | aquarius, pisces        | Thought    | Sun     |

## Food Categories by Chakra

| Chakra       | Food Colors/Types                     | Example Foods                            |
| ------------ | ------------------------------------- | ---------------------------------------- |
| Root         | Red foods, root vegetables, proteins  | Beets, carrots, red apples, nuts         |
| Sacral       | Orange foods, watery foods, seeds     | Oranges, melons, pumpkin seeds           |
| Solar Plexus | Yellow foods, whole grains, spices    | Corn, bananas, turmeric, brown rice      |
| Heart        | Green foods, leafy greens             | Avocados, kale, spinach, green tea       |
| Throat       | Blue/purple foods, fruit juices, teas | Blueberries, plums, elderberry tea       |
| Third Eye    | Purple foods, omega-rich foods        | Eggplant, purple grapes, salmon, walnuts |
| Crown        | Violet/white foods, purifying foods   | Cauliflower, garlic, mushrooms           |

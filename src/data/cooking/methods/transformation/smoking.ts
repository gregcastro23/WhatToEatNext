import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Smoking: A preservation and flavoring technique that exposes food to smoke
 * from burning or smoldering material (usually wood)
 */
export const smoking: CookingMethodData = {
  name: 'Smoking',
  description: 'A cooking and preservation method that exposes food to smoke from burning wood, herbs, or other materials, imparting flavor and helping preserve the food.',
  history: 'Smoking has been used for thousands of years across many cultures as a way to preserve and flavor food, particularly meats and fish. It was an essential preservation technique before refrigeration.',
  science: 'Smoking preserves food through a combination of dehydration, low heat cooking, and the deposition of antimicrobial compounds found in the smoke. These compounds include phenols and aldehydes that inhibit bacterial growth while adding flavor.',
  alchemical_properties: {
    element: 'Air',
    planetary_influence: 'Mars',
    effect_on_ingredients: 'Increases Spirit and Matter, transforms Substance into Essence'
  },
  suitable_for: [
    'Meats',
    'Fish',
    'Cheese',
    'Vegetables',
    'Salt',
    'Spices'
  ],
  variations: [
    'Hot smoking (higher temperatures, cooks and flavors)',
    'Cold smoking (lower temperatures, primarily for flavor and preservation)',
    'Liquid smoke (concentrated smoke flavor for adding to dishes)'
  ],
  time_range: {
    min: 30, // minutes
    max: 1440 // 24 hours
  },
  temperature_range: {
    cold_smoking: {
      min: 20, // °C
      max: 30  // °C
    },
    hot_smoking: {
      min: 65, // °C
      max: 120 // °C
    }
  },
  tools: [
    'Smoker',
    'Wood chips or pellets',
    'Thermometer',
    'Rack'
  ],
  famous_dishes: [
    'Smoked salmon',
    'Bacon',
    'Texas brisket',
    'Smoked cheese',
    'Pastrami'
  ],
  health_benefits: [
    'Can add flavor without additional fat',
    'Helps preserve food without artificial preservatives'
  ],
  health_considerations: [
    'Smoked foods may contain polycyclic aromatic hydrocarbons (PAHs)',
    'High consumption of smoked foods has been linked to increased cancer risk',
    'Often high in sodium'
  ]
}; 
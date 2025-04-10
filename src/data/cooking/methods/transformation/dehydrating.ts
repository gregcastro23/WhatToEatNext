import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Dehydrating: A preservation method that removes moisture from food,
 * concentrating flavors and extending shelf life
 */
export const dehydrating: CookingMethodData = {
  name: 'Dehydrating',
  description: 'A preservation method that removes moisture from food through controlled evaporation, concentrating flavors and nutrients while extending shelf life.',
  history: 'Dehydration is one of humanity\'s oldest food preservation techniques, dating back to prehistoric times. Sun-drying fruits, vegetables, and meats was practiced across ancient civilizations including Egypt, China, and the Middle East.',
  science: 'Dehydration works by removing water that microorganisms need to survive. By reducing the water activity to below 0.6, bacterial growth is inhibited. The process also concentrates flavors and nutrients while reducing weight and volume.',
  alchemical_properties: {
    element: 'Air',
    planetary_influence: 'Mercury',
    effect_on_ingredients: 'Increases Spirit, concentrates Essence, transforms Water into Air'
  },
  suitable_for: [
    'Fruits',
    'Vegetables', 
    'Herbs',
    'Meats',
    'Mushrooms',
    'Flowers',
    'Seeds'
  ],
  variations: [
    'Sun drying (traditional method using solar heat)',
    'Air drying (hanging in a cool, dry place)',
    'Oven drying (using low heat in a conventional oven)',
    'Food dehydrator (using specialized equipment)',
    'Freeze-drying (removing water through sublimation)'
  ],
  time_range: {
    min: 120, // 2 hours
    max: 2880 // 48 hours
  },
  temperature_range: {
    min: 35, // °C (95°F)
    max: 70  // °C (158°F)
  },
  tools: [
    'Food dehydrator',
    'Oven',
    'Drying racks',
    'Cheesecloth',
    'Parchment paper',
    'Knife or mandoline for thin slicing',
    'Airtight containers for storage'
  ],
  famous_dishes: [
    'Beef jerky',
    'Dried apricots',
    'Sun-dried tomatoes',
    'Fruit leather',
    'Dried mushrooms',
    'Herb blends',
    'Biltong'
  ],
  health_benefits: [
    'Preserves most nutrients',
    'Creates lightweight, portable food',
    'No additives or preservatives needed',
    'Concentrates antioxidants and nutrients',
    'Reduces food waste'
  ],
  health_considerations: [
    'Concentrated sugars in dried fruits',
    'Potential loss of heat-sensitive vitamins',
    'Proper storage needed to prevent moisture reabsorption',
    'Insufficient drying can lead to mold growth'
  ]
}; 
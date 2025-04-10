import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Marinating: A technique that soaks food in a flavorful liquid to enhance taste,
 * tenderize, and sometimes partially preserve it
 */
export const marinating: CookingMethodData = {
  name: 'Marinating',
  description: 'A technique that immerses food in a seasoned liquid mixture to enhance flavor, tenderize textures, and sometimes begin the preservation or cooking process.',
  history: 'Marinating has been practiced for thousands of years, originally as a preservation method using acidic liquids like vinegar or citrus juice. The technique evolved across cultures, with each developing unique marinades reflecting local ingredients and tastes.',
  science: 'Marinades work through several mechanisms: acids denature proteins and tenderize meat; enzymes break down connective tissues; salt helps proteins retain moisture; and flavoring agents diffuse into the food. Oil in marinades helps carry fat-soluble flavors and keeps food moist.',
  alchemical_properties: {
    element: 'Water',
    planetary_influence: 'Moon',
    effect_on_ingredients: 'Transforms Matter, enhances Essence, prepares for alchemical change'
  },
  suitable_for: [
    'Meats',
    'Poultry',
    'Fish',
    'Seafood',
    'Vegetables',
    'Tofu',
    'Fruits'
  ],
  variations: [
    'Acid-based marinades (with vinegar, citrus, wine)',
    'Enzyme-based marinades (with pineapple, papaya, yogurt)',
    'Oil-based marinades (with herbs and spices in oil)',
    'Dry marinades/rubs (with salt and spices)',
    'Brines (salt water solutions)',
    'Ceviche (acid "cooking" of fish)'
  ],
  time_range: {
    min: 15, // 15 minutes
    max: 1440 // 24 hours
  },
  temperature_range: {
    min: 1, // °C (refrigeration temperature)
    max: 4 // °C (safe refrigeration)
  },
  tools: [
    'Non-reactive containers (glass, ceramic, plastic)',
    'Resealable bags',
    'Whisk',
    'Measuring tools',
    'Refrigerator',
    'Plastic wrap',
    'Timer'
  ],
  famous_dishes: [
    'Tandoori chicken',
    'Ceviche',
    'Korean bulgogi',
    'Jamaican jerk chicken',
    'Sauerbraten',
    'Adobo',
    'Escabeche'
  ],
  health_benefits: [
    'Can infuse foods with antioxidants from herbs and spices',
    'Reduces formation of harmful compounds during high-heat cooking',
    'Tenderizes tough cuts of meat without mechanical processing',
    'Can reduce salt needed for flavoring'
  ],
  health_considerations: [
    'Marinades that contain raw meat should not be reused without cooking',
    'Acidic marinades can "cook" seafood if left too long',
    'Some marinades contain high amounts of sodium, sugar, or fat',
    'Proper refrigeration is essential for food safety'
  ]
}; 
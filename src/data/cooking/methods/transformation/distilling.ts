import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Distilling: A process that separates and concentrates flavors, aromas, and other
 * compounds through evaporation and condensation
 */
export const distilling: CookingMethodData = {
  name: 'Distilling',
  description: 'A process that separates and concentrates volatile compounds by vaporizing them and then recondensing the vapor, used to extract essential flavors, aromas, and alcohols.',
  history: 'Distillation has ancient origins, with evidence of the technique dating back to at least 3000 BCE in Mesopotamia. It was further developed by alchemists and has been crucial in perfumery, medicine, and spirits production throughout history.',
  science: 'Distillation works by exploiting different boiling points of compounds. When a mixture is heated, compounds with lower boiling points vaporize first. These vapors are then cooled and condensed back into liquid form, resulting in a concentrated extract.',
  alchemical_properties: {
    element: 'Fire',
    planetary_influence: 'Mercury',
    effect_on_ingredients: 'Separates Spirit from Matter, concentrates Essence, transforms Substance'
  },
  suitable_for: [
    'Herbs',
    'Flowers',
    'Fruits',
    'Grains',
    'Spices',
    'Fermented liquids'
  ],
  variations: [
    'Simple distillation (single vaporization and condensation)',
    'Fractional distillation (multiple vaporization-condensation cycles)',
    'Steam distillation (for heat-sensitive plant materials)',
    'Vacuum distillation (at lower temperatures)',
    'Molecular distillation (for specific compounds at very low pressures)'
  ],
  time_range: {
    min: 60, // 1 hour
    max: 480 // 8 hours
  },
  temperature_range: {
    min: 78, // °C (ethanol boiling point)
    max: 200 // °C (for higher boiling point compounds)
  },
  tools: [
    'Still (pot still or column still)',
    'Condenser',
    'Collection vessel',
    'Heat source',
    'Thermometer',
    'Cooling system',
    'Hydrometer (for measuring alcohol content)'
  ],
  famous_dishes: [
    'Spirits (whiskey, gin, vodka, rum)',
    'Essential oils',
    'Hydrosols (floral waters)',
    'Flavored extracts (vanilla, almond, etc.)',
    'Aromatic waters'
  ],
  health_benefits: [
    'Creates concentrated extracts with medicinal properties',
    'Removes impurities from volatile compounds',
    'Preserves delicate aromas that might be lost in other extraction methods'
  ],
  health_considerations: [
    'Home distillation of alcohol is illegal in many places',
    'Improperly distilled spirits can contain harmful compounds like methanol',
    'Concentrated plant compounds can be toxic if not properly identified',
    'High proof spirits should be consumed in moderation'
  ]
}; 
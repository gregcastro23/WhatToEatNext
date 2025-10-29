import type { CookingMethodData } from '@/types/cookingMethod';
import type { CookingMethod } from '@/types/shared';

/**
 * Infusing: A technique that transfers flavors, colors, or medicinal properties
 * from one ingredient into a liquid or oil base
 */
export const infusing: CookingMethodData = {
  name: 'Infusing' as CookingMethod,
  description: 'A technique that transfers flavors, colors, aromasor medicinal properties from herbs, spices, fruitsor other ingredients into a liquid base such as oil, water, alcohol, or vinegar.',
  elementalEffect: {
    Fire: 0.1,
    Water: 0.7,
    Earth: 0.1,
    Air: 0.5
},
  duration: {
    min: 15, // 15 minutes,
    max: 10080, // 7 days
  },
  suitable_for ['Oils', 'Alcohols', 'Water', 'Vinegars', 'Honey', 'Milk', 'Cream'],
  benefits: [
    'Extracts beneficial compounds from herbs and spices',
    'Creates flavorful alternatives to salt and sugar',
    'Preserves volatile compounds that might be lost in high-heat cooking',
    'Allows for creation of medicinal preparations'
  ],
  history: 'Infusion has ancient roots in culinary and medicinal traditions around the world. It was widely used in traditional medicine for creating herbal remedies and in cuisine for imparting subtle flavors to foods and beverages.',
  modernVariations: [
    'Hot infusion (using heat to speed extraction)',
    'Cold infusion (steeping ingredients at room temperature or refrigerated)',
    'Sous-vide infusion (temperature-controlled method)',
    'Pressure infusion (using pressure to speed up the process)',
    'Fat infusion (infusing solid fats like butter)'
  ],
  optimalTemperatures: {
    cold: 2, // °C,
    hot: 80, // °C
  },
  toolsRequired: [
    'Jars or containers',
    'Strainers or filters',
    'Heat source (for hot infusions)',
    'Thermometer',
    'Funnel',
    'Bottles for storage',
    'Cheesecloth'
  ],
  healthConsiderations: [
    'Oil infusions can develop botulism if not properly prepared and stored',
    'Must ensure proper sanitation to prevent microbial growth',
    'Some infused products need refrigeration',
    'Some herbs and plants are toxic and should not be used for infusions'
  ]
}

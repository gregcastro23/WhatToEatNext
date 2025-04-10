import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Infusing: A technique that transfers flavors, colors, or medicinal properties
 * from one ingredient into a liquid or oil base
 */
export const infusing: CookingMethodData = {
  name: 'Infusing',
  description: 'A technique that transfers flavors, colors, aromas, or medicinal properties from herbs, spices, fruits, or other ingredients into a liquid base such as oil, water, alcohol, or vinegar.',
  history: 'Infusion has ancient roots in culinary and medicinal traditions around the world. It was widely used in traditional medicine for creating herbal remedies and in cuisine for imparting subtle flavors to foods and beverages.',
  science: 'Infusion works through the principle of diffusion, where compounds from the flavoring ingredients dissolve into the base liquid. Heat often accelerates this process by increasing the solubility of flavor compounds and breaking down cell walls.',
  alchemical_properties: {
    element: 'Water',
    planetary_influence: 'Venus',
    effect_on_ingredients: 'Releases Essence, transforms Matter into Spirit, enhances Substance'
  },
  suitable_for: [
    'Oils',
    'Alcohols',
    'Water',
    'Vinegars',
    'Honey',
    'Milk',
    'Cream'
  ],
  variations: [
    'Hot infusion (using heat to speed extraction)',
    'Cold infusion (steeping ingredients at room temperature or refrigerated)',
    'Sous-vide infusion (temperature-controlled method)',
    'Pressure infusion (using pressure to speed up the process)',
    'Fat infusion (infusing solid fats like butter)'
  ],
  time_range: {
    min: 15, // 15 minutes
    max: 10080 // 7 days
  },
  temperature_range: {
    cold: {
      min: 2, // °C
      max: 25 // °C
    },
    hot: {
      min: 60, // °C
      max: 100 // °C
    }
  },
  tools: [
    'Jars or containers',
    'Strainers or filters',
    'Heat source (for hot infusions)',
    'Thermometer',
    'Funnel',
    'Bottles for storage',
    'Cheesecloth'
  ],
  famous_dishes: [
    'Herb-infused oils',
    'Vanilla extract',
    'Tea',
    'Limoncello',
    'Chili oil',
    'Lavender honey',
    'Herb-infused vinegars'
  ],
  health_benefits: [
    'Extracts beneficial compounds from herbs and spices',
    'Creates flavorful alternatives to salt and sugar',
    'Preserves volatile compounds that might be lost in high-heat cooking',
    'Allows for creation of medicinal preparations'
  ],
  health_considerations: [
    'Oil infusions can develop botulism if not properly prepared and stored',
    'Must ensure proper sanitation to prevent microbial growth',
    'Some infused products need refrigeration',
    'Some herbs and plants are toxic and should not be used for infusions'
  ]
}; 
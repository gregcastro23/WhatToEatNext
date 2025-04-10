import type { CookingMethodData } from '@/types/cookingMethod';

/**
 * Emulsification: A molecular gastronomy technique for creating stable mixtures
 * of normally immiscible liquids, such as oil and water
 */
export const emulsification: CookingMethodData = {
  name: 'Emulsification',
  description: 'A technique that combines normally immiscible liquids, such as oil and water, into a stable, homogeneous mixture through the use of emulsifiers, agitation, or specialized equipment.',
  history: 'While emulsification has been used traditionally in cooking for centuries (mayonnaise, hollandaise), modern molecular gastronomy has refined the technique using scientific principles and new ingredients, popularized by chefs like Ferran Adrià and Heston Blumenthal since the 1990s.',
  science: 'Emulsification works by creating tiny droplets of one liquid suspended in another with the help of emulsifying agents that have both hydrophilic and hydrophobic parts. These agents form a protective layer around the droplets, preventing them from coalescing.',
  alchemical_properties: {
    element: 'Water',
    planetary_influence: 'Venus',
    effect_on_ingredients: 'Unifies opposites, transforms Matter, enhances Essence'
  },
  suitable_for: [
    'Oils',
    'Vinegars',
    'Fats',
    'Juices',
    'Dairy',
    'Purees',
    'Stocks'
  ],
  variations: [
    'Foams (light, airy emulsions)',
    'Espumas (created with siphons)',
    'Airs (extremely light foams)',
    'Stable emulsions (like modern mayonnaise)',
    'Flavored butters (solid emulsions)',
    'Fluid gels (emulsions stabilized with hydrocolloids)'
  ],
  time_range: {
    min: 5, // minutes
    max: 30 // minutes
  },
  temperature_range: {
    cold: {
      min: 4, // °C
      max: 20 // °C
    },
    hot: {
      min: 60, // °C
      max: 80 // °C
    }
  },
  tools: [
    'Immersion blender',
    'Food processor',
    'Whisk',
    'Siphon/whipping canister',
    'Lecithin',
    'Soy lecithin',
    'Xanthan gum',
    'Ultrasonic homogenizer (high-end)'
  ],
  famous_dishes: [
    'Olive oil foam',
    'Parmesan air',
    'Modern mayonnaise',
    'Balsamic vinegar pearls',
    'Espuma de patata (potato foam)',
    'Flavored butters with unusual textures'
  ],
  health_benefits: [
    'Can reduce the amount of fat needed in a dish while preserving flavor',
    'Creates light, airy textures with concentrated flavors',
    'Allows for even distribution of flavor compounds'
  ],
  health_considerations: [
    'Some emulsifiers may cause digestive discomfort in sensitive individuals',
    'Modern emulsifying agents should be used in appropriate quantities',
    'Hot emulsions can break if not properly stabilized'
  ]
}; 
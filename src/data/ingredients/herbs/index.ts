import { medicinalHerbs } from './medicinalHerbs';
import { freshHerbs } from './freshHerbs';
import { driedHerbs } from './driedHerbs';
import { aromaticHerbs } from './aromatic';
import type { IngredientMapping } from '@/types/alchemy';

// Define cuisine types as string literals
const CUISINE_TYPES = {
  ITALIAN: 'italian',
  THAI: 'thai',
  VIETNAMESE: 'vietnamese',
  FRENCH: 'french',
  CHINESE: 'chinese',
  JAPANESE: 'japanese',
  KOREAN: 'korean',
  INDIAN: 'indian',
  MEXICAN: 'mexican',
  MEDITERRANEAN: 'mediterranean',
  MIDDLE_EASTERN: 'middle_eastern',
  GREEK: 'greek',
  SPANISH: 'spanish',
  MOROCCAN: 'moroccan',
  TURKISH: 'turkish',
  LEBANESE: 'lebanese'
} as const;

// Helper function to generate meaningful herb values
function generateHerbValues(elementalProps: Record<string, number>): Record<string, number> {
  // Normalize elements to ensure they sum to 1
  const totalElements = Object.values(elementalProps).reduce((sum, val) => sum + val, 0);
  const normalized = Object.entries(elementalProps).reduce((acc, [key, val]) => {
    acc[key] = val / totalElements;
    return acc;
  }, {} as Record<string, number>);
  
  // Find dominant element
  const dominant = Object.entries(normalized)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  // Calculate unique values
  const aromaticStrength = Math.round((normalized['Air'] * 6 + normalized['Fire'] * 4) + Math.random() * 2);
  const potency = Math.round((normalized[dominant] * 7) + Math.random() * 3);
  const flavor_complexity = Math.round(
    (Object.keys(normalized).filter(k => normalized[k] > 0.15).length * 2) + Math.random() * 3
  );
  const preservation_factor = Math.round((normalized['Earth'] * 5 + normalized['Water'] * 3) + Math.random());
  
  return {
    aromatics: Math.min(10, Math.max(1, aromaticStrength)),
    potency: Math.min(10, Math.max(1, potency)),
    flavor_complexity: Math.min(10, Math.max(1, flavor_complexity)),
    preservation_factor: Math.min(10, Math.max(1, preservation_factor)),
    infusion_speed: Math.min(10, Math.max(1, Math.round(10 - preservation_factor + Math.random() * 2)))
  };
}

// Helper function to standardize ingredient mappings with enhanced values
function createIngredientMapping(
  id: string,
  properties: Partial<IngredientMapping>
): IngredientMapping {
  // Default elemental properties if none provided
  const elementalProps = properties.elementalProperties || { 
    Earth: 0.25, 
    Water: 0.25, 
    Fire: 0.25, 
    Air: 0.25 
  };
  
  // Generate meaningful numeric values based on elemental properties
  const herbValues = generateHerbValues(elementalProps);
  
  return {
    name: id,
    elementalProperties: elementalProps,
    category: properties.category || '',
    ...herbValues,
    ...properties
  };
}

// Combine all herbs into one record
export const herbs: Record<string, IngredientMapping> = {
  ...freshHerbs,
  ...driedHerbs,
  ...aromaticHerbs,
  ...medicinalHerbs,
  
  // Custom herbs
  'basil': createIngredientMapping('basil', {
    elementalProperties: { Air: 0.43, Water: 0.27, Fire: 0.22, Earth: 0.08 },
    qualities: ['aromatic', 'sweet', 'peppery'],
    category: 'culinary_herb',
    varieties: {
      'sweet_basil': {
        aroma: 'clove-like, sweet',
        best_uses: ['italian', 'thai', 'fresh'],
        aromatic_compounds: ['linalool', 'eugenol'],
        flavor_profile: 'sweet with slight peppery notes',
        oil_content: 0.7 // percentage
      },
      'thai_basil': {
        aroma: 'anise-like, spicy',
        best_uses: ['asian', 'stir-fry', 'soups'],
        aromatic_compounds: ['methyl chavicol', 'eugenol'],
        flavor_profile: 'anise-like with spicy notes',
        oil_content: 0.6
      },
      'holy_basil': {
        aroma: 'spicy, complex',
        best_uses: ['indian', 'tea', 'medicinal'],
        pairings: ['curry', 'stir-fry', 'tea'],
        aromatic_compounds: ['eugenol', 'caryophyllene'],
        flavor_profile: 'peppery, clove-like',
        oil_content: 0.8
      }
    },
    culinaryTraditions: {
      [CUISINE_TYPES.ITALIAN]: {
        name: 'basilico',
        usage: ['pesto', 'caprese', 'pasta'],
        regional_importance: 9
      },
      [CUISINE_TYPES.THAI]: {
        name: 'horapha',
        usage: ['pad kra pao', 'green curry', 'drunken noodles'],
        preparation: 'whole leaves, quick-cooked',
        pairings: ['chili', 'fish sauce', 'garlic', 'chicken'],
        cultural_notes: 'Essential in spicy stir-fries',
        regional_importance: 8
      },
      [CUISINE_TYPES.VIETNAMESE]: {
        name: 'rau quế',
        usage: ['pho', 'fresh rolls', 'bánh mì'],
        preparation: 'fresh, served raw',
        pairings: ['rice noodles', 'bean sprouts', 'mint'],
        cultural_notes: 'Part of fresh herb plate',
        regional_importance: 7
      }
    },
    preparation: {
      fresh: {
        storage: 'stem in water, room temp',
        duration: '1 week',
        tips: ['avoid cold', 'avoid cutting'],
        quality_retention: 0.8 // 80% of flavor retained
      },
      dried: {
        storage: 'airtight container',
        duration: '6 months',
        tips: ['crush just before use'],
        flavor_retention: 0.4 // 40% of flavor retained compared to fresh
      }
    }
  }),
  
  'mint': createIngredientMapping('mint', {
    elementalProperties: { Water: 0.55, Air: 0.32, Earth: 0.08, Fire: 0.05 },
    qualities: ['cooling', 'refreshing', 'aromatic'],
    category: 'culinary_herb',
    varieties: {
      'peppermint': {
        aroma: 'strong, mentholated',
        cooling_factor: 8,
        aromatic_compounds: ['menthol', 'menthone'],
        oil_content: 1.2
      },
      'spearmint': {
        aroma: 'sweet, less intense than peppermint',
        cooling_factor: 6,
        aromatic_compounds: ['carvone', 'limonene'],
        oil_content: 0.7
      }
    }
  }),
  
  'rosemary': createIngredientMapping('rosemary', {
    elementalProperties: { Fire: 0.4, Earth: 0.35, Air: 0.2, Water: 0.05 },
    qualities: ['piney', 'resinous', 'aromatic'],
    category: 'culinary_herb',
    heat_resistance: 8, // Ability to withstand cooking heat
    extraction_efficiency: 6, // How easily flavors infuse into oils/liquids
    varieties: {
      'upright': {
        oil_content: 1.5,
        growth_habit: 'tall, straight stems'
      },
      'creeping': {
        oil_content: 1.3,
        growth_habit: 'low, spreading'
      }
    }
  }),

  'preparation_methods': createIngredientMapping('preparation_methods', {
    elementalProperties: { Earth: 0.25, Water: 0.25, Fire: 0.25, Air: 0.25 },
    category: 'preparation',
    drying: {
      'air_drying': {
        method: 'bundle and hang',
        conditions: 'warm, dry, good airflow',
        duration: '1-2 weeks',
        best_for: ['woody herbs', 'large leaf herbs']
      },
      'dehydrator': {
        temperature: '95-115°F',
        duration: '2-6 hours',
        best_for: ['tender herbs', 'flowers']
      }
    },
    storage: {
      'dried_herbs': {
        container: 'airtight, dark glass',
        location: 'cool, dark place',
        duration: '6-12 months',
        tips: [
          'check for moisture',
          'label with date',
          'crush to release oils'
        ]
      },
      'fresh_herbs': {
        methods: {
          'refrigerator': {
            technique: 'wrap in damp paper',
            duration: '1-2 weeks'
          },
          'freezing': {
            technique: 'oil or water in ice cube trays',
            duration: '6 months'
          }
        }
      }
    }
  })
};

// Improved validation with better error handling and fix
Object.entries(herbs).forEach(([id, herb]) => {
  // Skip if not an object or already has a problem
  if (!herb || typeof herb !== 'object') {
    console.error(`Invalid herb entry for id: ${id}`);
    herbs[id] = createIngredientMapping(id, {});
    return;
  }
  
  // Add missing elemental properties with default values
  if (!herb.elementalProperties) {
    console.warn(`Adding default elemental properties for herb: ${herb.name || id}`);
    herbs[id] = createIngredientMapping(id, herb);
    return;
  }
  
  // Ensure all elements are present and sum to 1.0
  const elements = herb.elementalProperties;
  const air = elements.Air || 0;
  const water = elements.Water || 0;
  const fire = elements.Fire || 0;
  const earth = elements.Earth || 0;
  const total = air + water + fire + earth;
  
  // Normalize if needed
  if (Math.abs(total - 1) > 0.01) {
    console.warn(`Normalizing elemental properties for herb: ${herb.name || id}`);
    const factor = 1 / total;
    herbs[id].elementalProperties = {
      Air: air * factor,
      Water: water * factor,
      Fire: fire * factor,
      Earth: earth * factor
    };
  }
});

export {
  freshHerbs,
  driedHerbs,
  medicinalHerbs,
  aromaticHerbs,
  CUISINE_TYPES
};

export default herbs;

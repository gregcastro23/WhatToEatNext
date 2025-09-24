import type { IngredientMapping } from '@/data/ingredients/types';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawTropicalFruits: Record<string, Partial<IngredientMapping>> = {
  mango: {
    name: 'Mango',
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ['Sun', 'Jupiter'],
      favorableZodiac: ['leo', 'taurus'],
      elementalAffinity: {
        base: 'Fire',
        decanModifiers: {
          first: { element: 'Fire', planet: 'Sun' },
          second: { element: 'Earth', planet: 'Venus' },
          third: { element: 'Air', planet: 'Mercury' }
        }
      }
    },
    qualities: ['sweet', 'cooling', 'nourishing'],
    season: ['summer'],
    category: 'fruit',
    subCategory: 'tropical',
    affinities: ['lime', 'chili', 'coconut', 'mint', 'ginger'],
    cookingMethods: ['raw', 'grilled', 'puréed', 'dried'],
    nutritionalProfile: {
      fiber: 'moderate',
      vitamins: ['a', 'c', 'b6'],
      minerals: ['copper', 'potassium'],
      calories: 60,
      carbs_g: 15,
      fiber_g: 1.6,
      antioxidants: ['beta-carotene', 'zeaxanthin']
    },
    preparation: {
      washing: true,
      peeling: 'required',
      cutting: 'slice along pit',
      ripeness: 'slight give when pressed',
      notes: 'Can be ripened in paper bag'
    },
    storage: {
      temperature: 'room temp until ripe',
      duration: '5-7 days',
      ripening: 'room temperature',
      notes: 'Refrigerate when ripe'
    },
    sensoryProfile: {
      taste: ['sweet', 'tangy', 'juicy'],
      aroma: ['tropical', 'fragrant'],
      texture: ['soft', 'fibrous'],
      notes: 'Characteristic mango profile'
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ['sweet', 'tropical'],
        secondary: ['tangy', 'fragrant'],
        notes: 'Sweet tropical fruit'
      },
      cookingMethods: ['raw', 'grilled', 'puréed'],
      cuisineAffinity: ['Asian', 'Latin American', 'Caribbean'],
      preparationTips: ['Choose ripe fruit', 'Peel before eating']
    },
    origin: ['India', 'Southeast Asia'],
    varieties: {}
  }
};

// Fix the ingredient mappings to ensure they have all required properties
export const tropical: Record<string, IngredientMapping> = fixIngredientMappings(rawTropicalFruits);

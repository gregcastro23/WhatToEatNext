import { ElementalProperties } from '@/types/elemental';

export interface CookingMethod {
  id: string;
  name: string;
  description: string;
  elementalProperties: ElementalProperties;
  astrologicalInfluences?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    unfavorableZodiac?: string[];
  };
  benefits?: string[];
  duration?: {
    min: number;
    max: number;
  };
}

// Basic cooking methods with elemental associations
export const cookingMethods: CookingMethod[] = [
  {
    id: 'baking',
    name: 'Baking',
    description: 'Cooking food by exposing it to dry heat in an enclosed space',
    elementalProperties: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Water: 0.1
    },
    astrologicalInfluences: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['leo', 'aries', 'sagittarius']
    },
    benefits: ['even cooking', 'develops flavors', 'retains moisture']
  },
  {
    id: 'boiling',
    name: 'Boiling',
    description: 'Hydration-based cooking through water submersion',
    elementalProperties: {
      Water: 0.6,
      Earth: 0.2,
      Fire: 0.1,
      Air: 0.1
    },
    astrologicalInfluences: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'Scorpio', 'pisces']
    },
    benefits: ['gelatinization of starches', 'even heat distribution']
  },
  {
    id: 'grilling',
    name: 'Grilling',
    description: 'Cooking food with direct heat from below',
    elementalProperties: {
      Fire: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Water: 0
    },
    astrologicalInfluences: {
      rulingPlanets: ['Mars', 'Sun'],
      favorableZodiac: ['aries', 'leo']
    },
    benefits: ['adds smoky flavor', 'creates char marks', 'quick cooking']
  },
  {
    id: 'steaming',
    name: 'Steaming',
    description: 'Cooking with steam heat from boiling water',
    elementalProperties: {
      Water: 0.7,
      Air: 0.2,
      Fire: 0.1,
      Earth: 0
    },
    astrologicalInfluences: {
      rulingPlanets: ['Moon', 'Neptune'],
      favorableZodiac: ['cancer', 'pisces']
    },
    benefits: ['preserves nutrients', 'gentle cooking method', 'adds moisture']
  },
  {
    id: 'frying',
    name: 'Frying',
    description: 'Cooking in hot oil or fat',
    elementalProperties: {
      Fire: 0.6,
      Earth: 0.2,
      Air: 0.1,
      Water: 0.1
    },
    astrologicalInfluences: {
      rulingPlanets: ['Mars', 'Jupiter'],
      favorableZodiac: ['aries', 'sagittarius']
    },
    benefits: ['creates crispy texture', 'fast cooking', 'enhances flavors']
  },
  {
    id: 'roasting',
    name: 'Roasting',
    description: 'Cooking food with dry heat in an oven or over fire',
    elementalProperties: {
      Fire: 0.5,
      Air: 0.3, 
      Earth: 0.2,
      Water: 0
    },
    astrologicalInfluences: {
      rulingPlanets: ['Sun', 'Mars'],
      favorableZodiac: ['leo', 'aries']
    },
    benefits: ['caramelizes sugars', 'develops deep flavors', 'creates crispy exteriors']
  },
  {
    id: 'braising',
    name: 'Braising',
    description: 'Combination cooking method using both dry and moist heat',
    elementalProperties: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    astrologicalInfluences: {
      rulingPlanets: ['Saturn', 'Venus'],
      favorableZodiac: ['capricorn', 'taurus']
    },
    benefits: ['tenderizes tough cuts', 'develops rich flavors', 'makes flavorful sauce']
  },
  {
    id: 'poaching',
    name: 'Poaching',
    description: 'Gentle cooking in liquid just below boiling point',
    elementalProperties: {
      Water: 0.8,
      Fire: 0.1,
      Air: 0.1,
      Earth: 0
    },
    astrologicalInfluences: {
      rulingPlanets: ['Moon', 'Venus'],
      favorableZodiac: ['cancer', 'taurus', 'pisces']
    },
    benefits: ['gentle cooking method', 'preserves moisture', 'subtle flavor infusion']
  }
]; 
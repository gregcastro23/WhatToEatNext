import { 
  ElementalProperties, 
  ZodiacSign,
  IngredientMapping
} from '@/types/alchemy';

export interface AstrologicalProfile {
  rulingPlanets: string[];
  favorableZodiac: ZodiacSign[];
  elementalAffinity: {
    base: keyof ElementalProperties;
    decanModifiers: Record<string, {
      element: keyof ElementalProperties;
      planet: string;
    }>;
  };
  aspectEnhancers?: string[];
}

export interface Ingredient {
  name: string;
  category?: string;
  amount?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    elementalAffinity: {
      base: string;
      secondary?: string;
    } | string;
    rulingPlanets: string[];
    favorableZodiac?: string[];
    zodiacAffinity?: string[];
  };
  flavorProfile?: {
    spicy: number;
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
  qualities?: string[];
  
  isInSeason?: boolean;
  seasonalScore?: number;
  temperatureEffect?: string;
  medicinalProperties?: string[];
  textureProfile?: {
    hardness: number;
    moisture: number;
    density: number;
    chew: number;
  };
  season?: string[];
}

export type IngredientMappings = Record<string, IngredientMapping>;

export interface AstrologicalInfluence {
  planet: string;
  sign: ZodiacSign;
  element: keyof ElementalProperties;
  strength: number;
} 
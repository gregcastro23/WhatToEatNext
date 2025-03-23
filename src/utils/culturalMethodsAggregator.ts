import { thai } from '@/data/cuisines/thai';
import { vietnamese } from '@/data/cuisines/vietnamese';
import { italian } from '@/data/cuisines/italian';
import { chinese } from '@/data/cuisines/chinese';
import { indian } from '@/data/cuisines/indian';
import { japanese } from '@/data/cuisines/japanese';
import { korean } from '@/data/cuisines/korean';
import { mexican } from '@/data/cuisines/mexican';
import { middleEastern } from '@/data/cuisines/middle-eastern';
import { russian } from '@/data/cuisines/russian';
import { greek } from '@/data/cuisines/greek';
import { french } from '@/data/cuisines/french';
import { african } from '@/data/cuisines/african';

// Define a standardized cooking method interface to use across the app
export interface CulturalCookingMethod {
  id: string;
  name: string;
  description: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  culturalOrigin: string;
  toolsRequired?: string[];
  bestFor?: string[];
  astrologicalInfluences?: {
    favorableZodiac?: string[];
    unfavorableZodiac?: string[];
    dominantPlanets?: string[];
  };
}

/**
 * Extracts cooking techniques from all cuisine files and formats them
 * into a standardized structure
 */
export function extractCulturalCookingMethods(): CulturalCookingMethod[] {
  const cuisines = [
    { data: thai, name: 'Thai' },
    { data: vietnamese, name: 'Vietnamese' },
    { data: italian, name: 'Italian' },
    { data: chinese, name: 'Chinese' },
    { data: indian, name: 'Indian' },
    { data: japanese, name: 'Japanese' },
    { data: korean, name: 'Korean' },
    { data: mexican, name: 'Mexican' },
    { data: middleEastern, name: 'Middle Eastern' },
    { data: russian, name: 'Russian' },
    { data: greek, name: 'Greek' },
    { data: french, name: 'French' },
    { data: african, name: 'African' }
  ];

  const methods: CulturalCookingMethod[] = [];

  // Extract cooking techniques from each cuisine
  cuisines.forEach(cuisine => {
    if (!cuisine.data.cookingTechniques) return;
    
    cuisine.data.cookingTechniques.forEach((technique, index) => {
      // Generate a unique ID for each cooking method
      const methodId = `${cuisine.name.toLowerCase()}_${technique.name.toLowerCase().replace(/\s+/g, '_')}`;
      
      methods.push({
        id: methodId,
        name: technique.name,
        description: technique.description,
        elementalProperties: technique.elementalProperties,
        culturalOrigin: cuisine.name,
        toolsRequired: technique.toolsRequired,
        bestFor: technique.bestFor,
        // Add placeholder for astrological influences that we can map later
        astrologicalInfluences: {
          dominantPlanets: []
        }
      });
    });
  });

  return methods;
}

// Export a ready-to-use object with all cultural cooking methods
export const culturalCookingMethods = extractCulturalCookingMethods();

// Helper to get methods by cultural origin
export function getMethodsByCulture(culture: string): CulturalCookingMethod[] {
  return culturalCookingMethods.filter(method => 
    method.culturalOrigin.toLowerCase() === culture.toLowerCase()
  );
}

// Helper to map elemental properties to astrological influences
export function mapElementsToAstrology(methods: CulturalCookingMethod[]): CulturalCookingMethod[] {
  // This is where we could add logic to derive astrological influences from elemental properties
  // For now, returning as-is
  return methods;
} 
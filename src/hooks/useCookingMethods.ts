import { useState, useEffect } from 'react';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { allCookingMethods } from '@/data/cooking/methods';

// Define the interface for cooking methods that the component expects
interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
}

export function useCookingMethods() {
  const [methods, setMethods] = useState<CookingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Convert the cooking methods data to the format expected by CookingMethodsSection
      const convertedMethods: CookingMethod[] = Object.entries(cookingMethods).map(([key, methodData]) => {
        const data = methodData as any;
        
        // Calculate a score based on alchemical properties and elemental effects
        const spirit = data.alchemicalProperties?.Spirit || 0.5;
        const essence = data.alchemicalProperties?.Essence || 0.5;
        const matter = data.alchemicalProperties?.Matter || 0.5;
        const substance = data.alchemicalProperties?.Substance || 0.5;
        
        const fire = data.elementalEffect?.Fire || 0.25;
        const water = data.elementalEffect?.Water || 0.25;
        const earth = data.elementalEffect?.Earth || 0.25;
        const air = data.elementalEffect?.Air || 0.25;
        
        // Calculate score based on alchemical balance and elemental harmony
        const alchemicalBalance = (spirit + essence + matter + substance) / 4;
        const elementalHarmony = Math.max(fire, water, earth, air);
        const score = (alchemicalBalance * 0.6) + (elementalHarmony * 0.4);
        
        return {
          id: key,
          name: data.name || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          description: data.description || `A cooking method that transforms ingredients through ${key.replace(/_/g, ' ')}.`,
          score: Math.min(1.0, Math.max(0.3, score)), // Ensure score is between 0.3 and 1.0
          elementalEffect: data.elementalEffect || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
          duration: data.duration || {
            min: 10,
            max: 60
          },
          suitable_for: data.suitable_for || ['various ingredients'],
          benefits: data.benefits || ['cooking'],
          alchemicalProperties: data.alchemicalProperties || {
            Spirit: 0.5,
            Essence: 0.5,
            Matter: 0.5,
            Substance: 0.5
          }
        };
      });

      // Sort methods by score in descending order
      const sortedMethods = convertedMethods.sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return scoreB - scoreA;
      });

      setMethods(sortedMethods);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cooking methods');
      setIsLoading(false);
    }
  }, []);

  const selectMethod = (methodId: string) => {
    // This could be used to track selected methods or trigger other actions
    // console.log('Selected cooking method:', methodId);
  };

  return {
    methods,
    isLoading,
    error,
    selectMethod
  };
} 
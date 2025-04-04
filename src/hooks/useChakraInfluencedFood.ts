import { useState, useEffect, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { ChakraAlchemyService } from '@/lib/ChakraAlchemyService';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { getRecommendedIngredients, EnhancedIngredient } from '@/utils/foodRecommender';
import type { ChakraEnergies, AstrologicalState, Planet } from '@/types/alchemy';

/**
 * Interface for the chakra-influenced food recommendations
 */
interface ChakraInfluencedFoodResult {
  recommendations: EnhancedIngredient[];
  chakraEnergies: ChakraEnergies;
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  chakraRecommendations: Record<string, EnhancedIngredient[]>;
}

/**
 * A hook that combines chakra energy calculations with food recommendations
 */
export const useChakraInfluencedFood = (options?: {
  limit?: number;
  filter?: (ingredient: EnhancedIngredient) => boolean;
}): ChakraInfluencedFoodResult => {
  // Get astrological data
  const { state, planetaryPositions } = useAlchemical();
  const { 
    currentPlanetaryAlignment, 
    activePlanets, 
    lunarPhase, 
    currentZodiac,
    loading: astroLoading 
  } = useAstrologicalState();
  
  // Initialize states
  const [recommendations, setRecommendations] = useState<EnhancedIngredient[]>([]);
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies>({
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    brow: 0,
    crown: 0
  });
  const [chakraRecommendations, setChakraRecommendations] = useState<Record<string, EnhancedIngredient[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planetaryHour, setPlanetaryHour] = useState<Planet>('sun');
  
  // Create service instances using useMemo
  const chakraService = useMemo(() => new ChakraAlchemyService(), []);
  const planetaryHourCalculator = useMemo(() => new PlanetaryHourCalculator(), []);
  
  // Get the current planetary hour
  useEffect(() => {
    try {
      const hourInfo = planetaryHourCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {
        setPlanetaryHour(hourInfo.planet.toLowerCase() as Planet);
      }
    } catch (error) {
      console.error('Error getting planetary hour:', error);
    }
  }, [planetaryHourCalculator]);
  
  // Memoize the astrological state to prevent unnecessary re-renders
  const astroState = useMemo<AstrologicalState>(() => {
    return {
      currentZodiac: currentZodiac || 'aries',
      moonPhase: lunarPhase || 'NEW_MOON',
      currentPlanetaryAlignment: currentPlanetaryAlignment || {},
      activePlanets: activePlanets || ['sun', 'moon'],
      planetaryPositions: planetaryPositions || {},
      lunarPhase: lunarPhase || 'NEW_MOON',
      zodiacSign: currentZodiac || 'aries',
      planetaryHours: planetaryHour,
      aspects: state.astrologicalState?.aspects || [],
      tarotElementBoosts: state.astrologicalState?.tarotElementBoosts || {},
      tarotPlanetaryBoosts: state.astrologicalState?.tarotPlanetaryBoosts || {}
    };
  }, [
    currentZodiac,
    lunarPhase,
    currentPlanetaryAlignment,
    activePlanets,
    planetaryPositions,
    planetaryHour,
    state.astrologicalState?.aspects,
    state.astrologicalState?.tarotElementBoosts,
    state.astrologicalState?.tarotPlanetaryBoosts
  ]);
  
  // Calculate chakra energies based on astrological data
  useEffect(() => {
    if (!astroLoading && currentZodiac && activePlanets) {
      // Calculate chakra energies
      const energies = chakraService.calculateChakraEnergies(
        currentZodiac || 'aries',
        (planetaryPositions?.moon?.sign || 'taurus') as any,
        activePlanets?.slice(0, 3) as Planet[] || ['sun', 'moon', 'mercury'],
        planetaryHour
      );
      
      setChakraEnergies(energies);
    }
  }, [
    astroLoading,
    currentZodiac,
    activePlanets,
    planetaryPositions?.moon?.sign,
    planetaryHour,
    chakraService
  ]);
  
  // Generate food recommendations with chakra influence
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get base food recommendations
        const results = getRecommendedIngredients(astroState);
        
        // Create chakra-filtered recommendations
        const chakraFiltered: Record<string, EnhancedIngredient[]> = {};
        
        // Group ingredients by which chakra they support the most
        Object.keys(chakraEnergies).forEach(chakraKey => {
          const energy = chakraEnergies[chakraKey as keyof ChakraEnergies];
          
          // Get ingredients that match the chakra's elemental properties
          let matchingIngredients: EnhancedIngredient[] = [];
          
          // Match ingredients to chakras based on elemental affinities
          if (chakraKey === 'root') {
            // Root chakra - Earth dominant
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Earth > 0.6
            );
          } else if (chakraKey === 'sacral') {
            // Sacral chakra - Water dominant
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Water > 0.6
            );
          } else if (chakraKey === 'solarPlexus') {
            // Solar Plexus - Fire dominant
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Fire > 0.6
            );
          } else if (chakraKey === 'heart') {
            // Heart chakra - Air and Fire balance
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.4 && ing.elementalProperties.Fire > 0.3
            );
          } else if (chakraKey === 'throat') {
            // Throat chakra - Air dominant
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.6
            );
          } else if (chakraKey === 'brow') {
            // Brow chakra - Water and Air balance
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Water > 0.4 && ing.elementalProperties.Air > 0.4
            );
          } else if (chakraKey === 'crown') {
            // Crown chakra - Air and Water, ethereal elements
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.5 && ing.elementalProperties.Water > 0.3
            );
          }
          
          // Sort by score and limit
          chakraFiltered[chakraKey] = matchingIngredients
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
        });
        
        setChakraRecommendations(chakraFiltered);
        
        // Apply any additional filtering if provided
        const filteredResults = options?.filter 
          ? results.filter(options.filter)
          : results;
          
        // Apply limit if specified
        const limitedResults = options?.limit 
          ? filteredResults.slice(0, options.limit) 
          : filteredResults;
        
        // Modify scores based on chakra energy levels
        const chakraModifiedResults = limitedResults.map(ingredient => {
          const basedElemental = ingredient.astrologicalProfile.elementalAffinity.base;
          
          // Apply chakra influence to scoring
          let chakraScore = 0.5; // Default neutral score
          
          // Calculate a chakra influence score based on the element's relationship with chakras
          if (basedElemental === 'Earth') {
            chakraScore = (chakraEnergies.root / 10) * 0.8 + 0.2; // Mostly root chakra
          } else if (basedElemental === 'Water') {
            chakraScore = (chakraEnergies.sacral / 10) * 0.6 + (chakraEnergies.brow / 10) * 0.2 + 0.2; // Sacral and some brow
          } else if (basedElemental === 'Fire') {
            chakraScore = (chakraEnergies.solarPlexus / 10) * 0.7 + (chakraEnergies.heart / 10) * 0.1 + 0.2; // Solar plexus mainly
          } else if (basedElemental === 'Air') {
            chakraScore = (chakraEnergies.throat / 10) * 0.5 + (chakraEnergies.crown / 10) * 0.3 + 0.2; // Throat and crown
          }
          
          // Add the chakra score to the ingredient's scoreDetails
          return {
            ...ingredient,
            scoreDetails: {
              ...(ingredient.scoreDetails || {}),
              chakraScore: chakraScore
            },
            // Adjust the overall score to incorporate chakra influence (30% influence)
            score: (ingredient.score || 0) * 0.7 + chakraScore * 0.3
          };
        }).sort((a, b) => (b.score || 0) - (a.score || 0));
        
        setRecommendations(chakraModifiedResults);
      } catch (err) {
        console.error('Error fetching chakra-influenced food recommendations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [astroState, chakraEnergies, options?.filter, options?.limit]);
  
  // Function to manually refresh recommendations
  const refreshRecommendations = async () => {
    try {
      setLoading(true);
      
      // Recalculate chakra energies
      const energies = chakraService.calculateChakraEnergies(
        currentZodiac || 'aries',
        (planetaryPositions?.moon?.sign || 'taurus') as any,
        activePlanets?.slice(0, 3) as Planet[] || ['sun', 'moon', 'mercury'],
        planetaryHour
      );
      
      setChakraEnergies(energies);
      
      // Get base food recommendations
      const results = getRecommendedIngredients(astroState);
      
      // Create chakra-filtered recommendations - simplified for refresh function
      const chakraFiltered: Record<string, EnhancedIngredient[]> = {};
      
      // Apply filters and limits
      const filteredResults = options?.filter 
        ? results.filter(options.filter)
        : results;
        
      const limitedResults = options?.limit 
        ? filteredResults.slice(0, options.limit) 
        : filteredResults;
      
      // Apply chakra influence to scores (simplified)
      const chakraModifiedResults = limitedResults.map(ingredient => {
        const baseElement = ingredient.astrologicalProfile.elementalAffinity.base;
        let chakraScore = 0.5; // Default
        
        // Simple elemental mapping to chakras
        if (baseElement === 'Earth') chakraScore = (chakraEnergies.root / 10) * 0.8 + 0.2;
        else if (baseElement === 'Water') chakraScore = (chakraEnergies.sacral / 10) * 0.6 + 0.2;
        else if (baseElement === 'Fire') chakraScore = (chakraEnergies.solarPlexus / 10) * 0.7 + 0.2;
        else if (baseElement === 'Air') chakraScore = (chakraEnergies.throat / 10) * 0.5 + 0.2;
        
        return {
          ...ingredient,
          scoreDetails: {
            ...(ingredient.scoreDetails || {}),
            chakraScore: chakraScore
          },
          score: (ingredient.score || 0) * 0.7 + chakraScore * 0.3
        };
      }).sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setRecommendations(chakraModifiedResults);
      setError(null);
    } catch (err) {
      console.error('Error refreshing chakra-influenced food recommendations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    recommendations,
    chakraEnergies,
    loading,
    error,
    refreshRecommendations,
    chakraRecommendations
  };
};

export default useChakraInfluencedFood; 
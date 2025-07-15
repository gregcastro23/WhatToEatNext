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
    thirdEye: 0,
    crown: 0
  });
  const [chakraRecommendations, setChakraRecommendations] = useState<Record<string, EnhancedIngredient[]>>({
    root: [],
    sacral: [],
    solarPlexus: [],
    heart: [],
    throat: [],
    thirdEye: [],
    crown: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planetaryHour, setPlanetaryHour] = useState<Planet>('sun' as unknown as Planet);
  
  // Create service instances using useMemo
  const chakraService = useMemo(() => new ChakraAlchemyService(), []);
  const planetaryHourCalculator = useMemo(() => new PlanetaryHourCalculator(), []);
  
  // Get the current planetary hour
  useEffect(() => {
    try {
      const hourInfo = planetaryHourCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {
        // Pattern X: Safe Planet type casting with proper validation
        const planetName = hourInfo.planet.toLowerCase();
        const validPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
        if (validPlanets.includes(planetName)) {
          setPlanetaryHour(planetName as unknown as Planet);
        }
      }
    } catch (error) {
      console.error('Error getting planetary hour:', error);
    }
  }, [planetaryHourCalculator]);
  
  // Memoize the astrological state to prevent unnecessary re-renders
  const astroState = useMemo(() => {
    return {
      currentZodiac: currentZodiac || 'aries',
      moonPhase: lunarPhase || 'NEW_MOON',
      currentPlanetaryAlignment: currentPlanetaryAlignment || {},
      activePlanets: activePlanets || ['sun', 'moon'],
      planetaryPositions: planetaryPositions || {},
      lunarPhase: lunarPhase || 'NEW_MOON',
      zodiacSign: currentZodiac || 'aries',
      planetaryHour: planetaryHour as unknown as Planet,
      aspects: state.astrologicalState?.aspects || [],
      tarotElementBoosts: state.astrologicalState?.tarotElementBoosts || {},
      tarotPlanetaryBoosts: state.astrologicalState?.tarotPlanetaryBoosts || {}
    } as unknown as AstrologicalState;
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
        ((planetaryPositions?.moon as Record<string, unknown>)?.sign || 'taurus') as Record<string, unknown>,
        // Pattern Y: Safe Planet array casting with validation and null checking
        (activePlanets ? activePlanets.slice(0, 3).map(p => typeof p === 'string' ? p.toLowerCase() : p) : ['sun', 'moon', 'mercury']) as unknown as Planet[],
        planetaryHour
      );
      
      setChakraEnergies(energies);
    }
  }, [
    astroLoading,
    currentZodiac,
    activePlanets,
    (planetaryPositions?.moon as Record<string, unknown>)?.sign,
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
          
          // Match ingredients to chakras based on elemental affinities and alchemical energy states
          if (chakraKey === 'root') {
            // Root chakra - Matter energy state: Water and Earth (no Fire)
            // (-) Heat, (-) Entropy, (-) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Earth > 0.5 && 
                    ing.elementalProperties.Water > 0.3 &&
                    ing.elementalProperties.Fire < 0.3
            );
          } else if (chakraKey === 'sacral') {
            // Sacral chakra - Essence energy state: region between Fire and Water
            // (-) Heat, (-) Entropy, (+) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Water > 0.5 && 
                    ing.elementalProperties.Fire > 0.3
            );
          } else if (chakraKey === 'solarPlexus') {
            // Solar Plexus - Essence energy state: region between Fire and Water
            // (-) Heat, (-) Entropy, (+) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Fire > 0.5 && 
                    ing.elementalProperties.Water > 0.3
            );
          } else if (chakraKey === 'heart') {
            // Heart chakra - Transition between Essence and Spirit
            // Balance of elements
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.4 && 
                    ing.elementalProperties.Fire > 0.3
            );
          } else if (chakraKey === 'throat') {
            // Throat chakra - Substance energy state: Air and Earth (no Fire)
            // (-) Heat, (+) Entropy, (+) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.5 && 
                    ing.elementalProperties.Earth > 0.3 &&
                    ing.elementalProperties.Fire < 0.3
            );
          } else if (chakraKey === 'thirdEye') {
            // Third Eye chakra - Essence energy state: region between Fire and Water
            // (-) Heat, (-) Entropy, (+) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Water > 0.4 && 
                    ing.elementalProperties.Air > 0.3 &&
                    ing.elementalProperties.Fire > 0.2
            );
          } else if (chakraKey === 'crown') {
            // Crown chakra - Spirit energy state: Fire and Air (NOT Water)
            // (+) Heat, (+) Entropy, (+) Reactivity
            matchingIngredients = results.filter(
              ing => ing.elementalProperties.Air > 0.5 && 
                    ing.elementalProperties.Fire > 0.4 &&
                    ing.elementalProperties.Water < 0.3
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
          // and thermodynamic properties according to alchemical energy states
          if (basedElemental === 'Earth') {
            // Earth is strongest in Root (Matter) and Throat (Substance)
            chakraScore = (chakraEnergies.root / 10) * 0.6 + (chakraEnergies.throat / 10) * 0.3 + 0.1;
          } else if (basedElemental === 'Water') {
            // Water is strongest in Root (Matter), Sacral and Solar Plexus (Essence)
            // Avoid Crown (Spirit) which should not include Water
            chakraScore = (chakraEnergies.sacral / 10) * 0.5 + 
                         (chakraEnergies.root / 10) * 0.3 + 
                         ((chakraEnergies as Record<string, unknown>)?.thirdEye || chakraEnergies.throat) / 10 * 0.1 + 0.1;
          } else if (basedElemental === 'Fire') {
            // Fire is strongest in Crown and Heart (Spirit) and Solar Plexus (Essence)
            // Avoid Root (Matter) and Throat (Substance) which should not include Fire
            chakraScore = (chakraEnergies.solarPlexus / 10) * 0.5 + 
                         (chakraEnergies.crown / 10) * 0.3 + 
                         (chakraEnergies.heart / 10) * 0.1 + 0.1;
          } else if (basedElemental === 'Air') {
            // Air is strongest in Crown (Spirit), Throat (Substance), and Heart
            chakraScore = (chakraEnergies.throat / 10) * 0.4 + 
                         (chakraEnergies.crown / 10) * 0.4 + 
                         (chakraEnergies.heart / 10) * 0.1 + 0.1;
          }
          
          // Additionally factor in thermodynamic properties if available
          if (ingredient.thermodynamicProperties) {
            // Use safe type casting for thermodynamic properties
            const thermoData = ingredient.thermodynamicProperties as BasicThermodynamicProperties;
            const { heat = 0.5, entropy = 0.5, reactivity = 0.5 } = thermoData || {};
            
            // Crown (Spirit): (+) Heat, (+) Entropy, (+) Reactivity
            if (heat > 0.6 && entropy > 0.6 && reactivity > 0.6) {
              chakraScore = (chakraScore + (chakraEnergies.crown / 10)) / 2;
            }
            
            // Throat (Substance): (-) Heat, (+) Entropy, (+) Reactivity
            if (heat < 0.4 && entropy > 0.6 && reactivity > 0.6) {
              chakraScore = (chakraScore + (chakraEnergies.throat / 10)) / 2;
            }
            
            // Brow, Solar Plexus, Sacral (Essence): (-) Heat, (-) Entropy, (+) Reactivity
            if (heat < 0.4 && entropy < 0.4 && reactivity > 0.6) {
              chakraScore = (chakraScore + 
                (((chakraEnergies as Record<string, unknown>)?.thirdEye || chakraEnergies.throat) / 10 + chakraEnergies.solarPlexus / 10 + chakraEnergies.sacral / 10) / 3) / 2;
            }
            
            // Root (Matter): (-) Heat, (-) Entropy, (-) Reactivity
            if (heat < 0.4 && entropy < 0.4 && reactivity < 0.4) {
              chakraScore = (chakraScore + (chakraEnergies.root / 10)) / 2;
            }
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
        ((planetaryPositions?.moon as Record<string, unknown>)?.sign || 'taurus') as Record<string, unknown>,
        // Pattern Z: Safe Planet array casting with validation and null checking for refresh function
        (activePlanets ? activePlanets.slice(0, 3).map(p => typeof p === 'string' ? p.toLowerCase() : p) : ['sun', 'moon', 'mercury']) as unknown as Planet[],
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
        
        // Apply alchemical energy state principles to score calculation
        if (baseElement === 'Earth') {
          // Earth is strongest in Root (Matter) and Throat (Substance)
          chakraScore = (chakraEnergies.root / 10) * 0.6 + (chakraEnergies.throat / 10) * 0.3 + 0.1;
        } else if (baseElement === 'Water') {
          // Water is strongest in Root (Matter), Sacral and Third Eye (Essence)
          // Avoid Crown (Spirit) which should not include Water
          chakraScore = (chakraEnergies.sacral / 10) * 0.5 + 
                       (chakraEnergies.root / 10) * 0.3 + 
                       ((chakraEnergies as Record<string, unknown>)?.thirdEye || chakraEnergies.throat) / 10 * 0.1 + 0.1;
        } else if (baseElement === 'Fire') {
          // Fire is strongest in Crown (Spirit) and Solar Plexus (Essence)
          // Avoid Root (Matter) and Throat (Substance) which should not include Fire
          chakraScore = (chakraEnergies.solarPlexus / 10) * 0.5 + 
                       (chakraEnergies.crown / 10) * 0.3 + 
                       (chakraEnergies.heart / 10) * 0.1 + 0.1;
        } else if (baseElement === 'Air') {
          // Air is strongest in Crown (Spirit), Throat (Substance), and Heart
          chakraScore = (chakraEnergies.throat / 10) * 0.4 + 
                       (chakraEnergies.crown / 10) * 0.4 + 
                       (chakraEnergies.heart / 10) * 0.1 + 0.1;
        }
        
        // Additionally factor in thermodynamic properties if available
        if (ingredient.thermodynamicProperties) {
          // Use safe type casting for thermodynamic properties
          const thermoData = ingredient.thermodynamicProperties as BasicThermodynamicProperties;
          const { heat = 0.5, entropy = 0.5, reactivity = 0.5 } = thermoData || {};
          
          // Apply alchemical energy state rules
          // Crown (Spirit): (+) Heat, (+) Entropy, (+) Reactivity
          if (heat > 0.6 && entropy > 0.6 && reactivity > 0.6) {
            chakraScore = (chakraScore + (chakraEnergies.crown / 10)) / 2;
          }
          
          // Throat (Substance): (-) Heat, (+) Entropy, (+) Reactivity
          if (heat < 0.4 && entropy > 0.6 && reactivity > 0.6) {
            chakraScore = (chakraScore + (chakraEnergies.throat / 10)) / 2;
          }
          
          // Brow, Solar Plexus, Sacral (Essence): (-) Heat, (-) Entropy, (+) Reactivity
          if (heat < 0.4 && entropy < 0.4 && reactivity > 0.6) {
            chakraScore = (chakraScore + 
              (((chakraEnergies as Record<string, unknown>)?.thirdEye || chakraEnergies.throat) / 10 + chakraEnergies.solarPlexus / 10 + chakraEnergies.sacral / 10) / 3) / 2;
          }
          
          // Root (Matter): (-) Heat, (-) Entropy, (-) Reactivity
          if (heat < 0.4 && entropy < 0.4 && reactivity < 0.4) {
            chakraScore = (chakraScore + (chakraEnergies.root / 10)) / 2;
          }
        }
        
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
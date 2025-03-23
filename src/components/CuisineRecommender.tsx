'use client';

import { useState, useEffect } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Flame, Droplets, Mountain, Wind, GalleryVertical, Sparkles, ArrowLeft } from 'lucide-react';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import dynamic from 'next/dynamic';
import { RecommendationAdapter } from '@/services/RecommendationAdapter';
import { ElementalItem, AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { AlchemicalProperty, ElementalCharacter } from '@/constants/planetaryElements';
import { getCuisineRecommendations } from '@/lib/cuisineCalculations';
import styles from './CuisineRecommender.module.css';
import { PlanetaryPosition, Planet } from '@/types/alchemy';

const RecipeList = dynamic(
  () => import('@/components/RecipeList')
    .then(mod => {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-cuisine-recommender', 'true');
      document.head.appendChild(styleElement);
      return mod.default;
    })
    .catch(() => {
      return () => <div>Failed to load recipes.</div>;
    }),
  { 
    loading: () => <div className="text-center py-8 text-white text-lg">Preparing celestial recipes...</div>, 
    ssr: false 
  }
);

interface Cuisine {
  id: string;
  name: string;
  description: string;
  alchemicalProperties?: Record<string, number>;
  astrologicalInfluences: string[];
}

interface CuisineStyles {
  error: string;
  loading: string;
  loadingText: string;
  container: string;
  title: string;
  cuisineList: string;
  cuisineCard: string;
  cuisineName: string;
  description: string;
  alchemicalProperties: string;
  subtitle: string;
  propertyList: string;
  property: string;
  propertyName: string;
  propertyValue: string;
  astrologicalInfluences: string;
  influenceList: string;
  influence: string;
}

export default function CuisineRecommender() {
  const { currentPlanetaryAlignment, currentZodiac, activePlanets, isDaytime, loading: astroLoading } = useAstrologicalState();
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const cssStyles = styles as unknown as CuisineStyles;

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        setLoading(true);
        const recommendations = await getCuisineRecommendations();
        setCuisines(recommendations);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cuisines');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCuisines();

    return () => {
      // Cleanup function to prevent HMR issues
      const styleElements = document.querySelectorAll(`[data-cuisine-recommender]`);
      styleElements.forEach(element => element.remove());
    };
  }, []);

  useEffect(() => {
    if (!astroLoading && currentPlanetaryAlignment) {
      const fetchData = async () => {
        setLoading(true);
        
        try {
          // Convert cuisines to ElementalItem format
          const cuisinesAsElementalItems: ElementalItem[] = Object.entries(culinaryTraditions).map(([id, cuisine]) => ({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            elementalProperties: cuisine.elementalAlignment || {
              Fire: 0.25,
              Water: 0.25,
              Earth: 0.25,
              Air: 0.25
            },
            astrologicalProfile: cuisine.astrologicalProfile,
            signatureModifications: cuisine.signatureModifications,
            techniquesSuggestion: cuisine.astrologicalProfile?.techniques?.[0]
          }));

          // Create planetary positions from astrological state
          const planetPositions: Record<string, number> = {};
          
          // Add active planets with higher strength
          if (activePlanets && activePlanets.length > 0) {
            activePlanets.forEach(planet => {
              planetPositions[planet] = 0.8; // Active planets have higher influence
            });
          }
          
          // Add sun and moon positions
          if (currentPlanetaryAlignment?.sun) {
            planetPositions['Sun'] = 1.0; // Sun has strongest influence
          }
          
          if (currentPlanetaryAlignment?.moon) {
            planetPositions['Moon'] = 0.7; // Moon has strong influence
          }
          
          // Add zodiac-associated planets
          const zodiacPlanetMap: Record<string, string[]> = {
            'aries': ['Mars'],
            'taurus': ['Venus'],
            'gemini': ['Mercury'],
            'cancer': ['Moon'],
            'leo': ['Sun'],
            'virgo': ['Mercury'],
            'libra': ['Venus'],
            'scorpio': ['Pluto', 'Mars'],
            'sagittarius': ['Jupiter'],
            'capricorn': ['Saturn'],
            'aquarius': ['Uranus', 'Saturn'],
            'pisces': ['Neptune', 'Jupiter']
          };
          
          if (currentZodiac && zodiacPlanetMap[currentZodiac.toLowerCase()]) {
            zodiacPlanetMap[currentZodiac.toLowerCase()].forEach(planet => {
              planetPositions[planet] = (planetPositions[planet] || 0) + 0.5;
            });
          }
          
          // Use the RecommendationAdapter to get transformed cuisines
          const adapter = new RecommendationAdapter([], [], cuisinesAsElementalItems);
          await adapter.updatePlanetaryData(planetPositions, isDaytime || true);
          
          // Get the transformed cuisines
          const recommendedCuisines = adapter.getRecommendedCuisines(5);
          setTransformedCuisines(recommendedCuisines);
        } catch (error) {
          console.error("Error getting alchemical cuisine recommendations:", error);
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [astroLoading, currentPlanetaryAlignment, currentZodiac, activePlanets, isDaytime]);

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-5 h-5 text-red-400" />;
      case 'Water': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Earth': return <Mountain className="w-5 h-5 text-green-400" />;
      case 'Air': return <Wind className="w-5 h-5 text-purple-400" />;
      default: return null;
    }
  };
  
  const getAlchemicalPropertyIcon = (property: AlchemicalProperty) => {
    return <Sparkles className="w-5 h-5 text-yellow-400" />;
  };

  const handleCuisineSelect = (cuisineId: string) => {
    setSelectedCuisine(cuisineId);
  };

  const handleBackToList = () => {
    setSelectedCuisine(null);
  };
  
  if (error) {
    return <div className={cssStyles.error}>Error: {error}</div>;
  }
  
  if (loading || transformedCuisines.length === 0) {
    return (
      <div className={cssStyles.loading}>
        <p className={cssStyles.loadingText}>Discovering celestial cuisine influences...</p>
      </div>
    );
  }

  // If a cuisine is selected, show the RecipeList for that cuisine
  if (selectedCuisine) {
    return (
      <div className={cssStyles.container} data-cuisine-recommender="true">
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToList}
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cuisines
          </button>
          <h1 className="ml-4 text-2xl font-bold">
            {selectedCuisine.charAt(0).toUpperCase() + selectedCuisine.slice(1)} Recipes
          </h1>
        </div>
        <RecipeList cuisineFilter={selectedCuisine} />
      </div>
    );
  }

  // Otherwise, show the list of cuisines
  return (
    <div className={cssStyles.container} data-cuisine-recommender="true">
      <h1 className={cssStyles.title}>Recommended Cuisines</h1>
      <div className={cssStyles.cuisineList}>
        {cuisines.map(cuisine => (
          <div 
            key={cuisine.id} 
            className={`${cssStyles.cuisineCard} cursor-pointer hover:shadow-lg transition-all duration-200`}
            onClick={() => handleCuisineSelect(cuisine.id)}
          >
            <h2 className={cssStyles.cuisineName}>{cuisine.name}</h2>
            <p className={cssStyles.description}>{cuisine.description}</p>
            
            {cuisine.alchemicalProperties && (
              <div className={cssStyles.alchemicalProperties}>
                <h4 className={cssStyles.subtitle}>Alchemical Properties:</h4>
                <div className={cssStyles.propertyList}>
                  {Object.entries(cuisine.alchemicalProperties)
                    .filter(([propertyName, propertyValue]) => propertyValue > 0)
                    .sort(([nameA, valueA], [nameB, valueB]) => valueB - valueA)
                    .map(([propName, propValue]) => (
                      <div key={propName} className={cssStyles.property}>
                        <span className={cssStyles.propertyName}>{propName}</span>
                        <span className={cssStyles.propertyValue}>
                          {Math.round(propValue * 100)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            <div className={cssStyles.astrologicalInfluences}>
              <h4 className={cssStyles.subtitle}>Astrological Influences:</h4>
              <div className={cssStyles.influenceList}>
                {cuisine.astrologicalInfluences.map(influence => (
                  <span key={influence} className={cssStyles.influence}>
                    {influence}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
import { useAstrologicalState } from '../context/AstrologicalContext';
import { useEffect, useState, useMemo } from 'react';
import { ElementalCalculator } from '../services/ElementalCalculator';
import { ElementalProperties } from '../types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations } from '../utils/ingredientRecommender';
import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useChakraInfluencedFood } from '../hooks/useChakraInfluencedFood';
import { normalizeChakraKey } from '../constants/chakraSymbols';
import { herbsCollection, oilsCollection, vinegarsCollection, grainsCollection } from '../data/ingredients';
import { similarity } from 'ml-distance';
import { getAllIngredients, getRecommendedIngredients, getTopIngredientMatches } from '../utils/foodRecommender';
import { PlanetaryHourCalculator } from '../lib/PlanetaryHourCalculator';
import styles from './IngredientRecommender.module.css';
import { ZodiacSign, LunarPhase, Element } from '../types/celestial';
import { IngredientRecommendation as BaseIngredientRecommendation } from '../types/ingredient';
import { Ingredient } from '../types/ingredient';

// Create a more inclusive type that handles all recommendation formats
interface EnhancedIngredient {
  name: string;
  ingredient?: Ingredient | string;
  score?: number;
  matchScore?: number;
  elementalScore?: number;
  modalityScore?: number;
  seasonalScore?: number;
  planetaryScore?: number;
  elementalProperties?: ElementalProperties;
  category?: string;
  type?: string;
  qualities?: string[];
  description?: string;
  pairingRecommendations?: {
    complementary?: string[];
    contrasting?: string[];
  };
  recommendedCookingMethods?: Array<{
    name: string;
    cookingTime?: {
      min: number;
      max: number;
      unit: string;
    };
  }>;
}

// Type guard for enhanced ingredient
function isEnhancedIngredient(obj: unknown): obj is EnhancedIngredient {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof (obj as any).name === 'string'
  );
}

// Extended interface to include additional properties needed by the component
interface IngredientRecommendation extends BaseIngredientRecommendation {
  name: string;
  description?: string;
  pairingRecommendations?: {
    complementary?: string[];
    contrasting?: string[];
  };
  recommendedCookingMethods?: Array<{
    name: string;
    cookingTime?: {
      min: number;
      max: number;
      unit: string;
    };
  }>;
  matchScore?: number;
  qualities?: string[];
}

// Type guard to check if an object is an extended IngredientRecommendation
function isIngredientRecommendation(obj: unknown): obj is IngredientRecommendation {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'ingredient' in obj &&
    'score' in obj &&
    typeof (obj as Record<string, unknown>).score === 'number'
  );
}

// Define category display names
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  proteins: 'Proteins',
  vegetables: 'Vegetables',
  grains: 'Grains & Starches',
  fruits: 'Fruits',
  herbs: 'Herbs & Aromatics',
  spices: 'Spices & Seasonings',
  oils: 'Oils & Fats',
  vinegars: 'Vinegars & Acidifiers'
};

// Define category display counts
const CATEGORY_DISPLAY_COUNTS: Record<string, number> = {
  proteins: 10,
  vegetables: 10,
  grains: 10,
  fruits: 10,
  herbs: 10,
  spices: 10,
  oils: 10,
  vinegars: 10
};

// Define category icons
const CATEGORY_ICONS: Record<string, string> = {
  proteins: '🥩',
  vegetables: '🥦',
  grains: '🌾',
  fruits: '🍎',
  herbs: '🌿',
  spices: '🧂',
  oils: '🫒',
  vinegars: '🧪'
};

// Using inline styles to avoid CSS module conflicts
export default function IngredientRecommender() {
  // Use the context to get astrological data including chakra energies
  const { 
    chakraEnergies: contextChakraEnergies, 
    planetaryPositions, 
    isLoading: astroLoading, 
    error: astroError 
  } = useAstrologicalState();
  
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [selectedIngredient, setSelectedIngredient] = useState<EnhancedIngredient | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState<string | null>(null);
  const [planetaryHourChakras, setPlanetaryHourChakras] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentZodiac, setCurrentZodiac] = useState<string>('aries');
  
  // Use the custom hook for food recommendations
  const { 
    recommendations: foodRecommendations, 
    chakraEnergies,
    loading: foodLoading, 
    error: foodError,
    refreshRecommendations
  } = useChakraInfluencedFood({ limit: 300 });
  
  // Time calculation
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the time every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Initialize planetary hour calculator
  useEffect(() => {
    try {
      const planetaryCalculator = new PlanetaryHourCalculator();
      
      // Get current planetary hour
      const hourInfo = planetaryCalculator.getCurrentPlanetaryHour();
      if (hourInfo && hourInfo.planet) {
        // First cast to unknown, then to string to avoid type errors
        const planetName = String(hourInfo.planet as unknown);
        setCurrentPlanetaryHour(planetName);
        
        // Get associated chakras for this planet (simplified approach)
        const planetLowerCase = planetName.toLowerCase();
        
        if (['sun', 'jupiter'].includes(planetLowerCase)) {
          setPlanetaryHourChakras(['crown', 'heart', 'solarPlexus']);
        } else if (['moon', 'venus'].includes(planetLowerCase)) {
          setPlanetaryHourChakras(['sacral', 'heart']);
        } else if (planetLowerCase === 'mercury') {
          setPlanetaryHourChakras(['throat', 'brow']);
        } else if (planetLowerCase === 'mars') {
          setPlanetaryHourChakras(['root', 'solarPlexus']);
        } else if (planetLowerCase === 'saturn') {
          setPlanetaryHourChakras(['root', 'brow']);
        }
      }
    } catch (error) {
      console.error('Error calculating planetary hour:', error);
    }
  }, []);
  
  // Helper function to get element icon with inline styles
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className={`${styles.elementIcon} ${styles.fire}`} size={16} />;
      case 'Water': return <Droplets className={`${styles.elementIcon} ${styles.water}`} size={16} />;
      case 'Earth': return <Mountain className={`${styles.elementIcon} ${styles.earth}`} size={16} />;
      case 'Air': return <Wind className={`${styles.elementIcon} ${styles.air}`} size={16} />;
      default: return null;
    }
  };
  
  // Handle ingredient selection to display details
  const handleIngredientSelect = (
    item: EnhancedIngredient, 
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    
    // Toggle selected ingredient
    if (selectedIngredient?.name === item.name) {
      setSelectedIngredient(null);
    } else {
      setSelectedIngredient(item as EnhancedIngredient);
    }
  };
  
  // Toggle expansion for a category
  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Reset selected ingredient when recommendations change
  useEffect(() => {
    setSelectedIngredient(null);
  }, [astroRecommendations, foodRecommendations]);
  
  // Helper function to get current zodiac sign
  const getCurrentZodiacSign = (): string => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    
    if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) return 'aries';
    if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) return 'taurus';
    if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return 'gemini';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) return 'cancer';
    if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) return 'leo';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'virgo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'libra';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 21)) return 'scorpio';
    if ((month === 10 && day >= 22) || (month === 11 && day <= 21)) return 'sagittarius';
    if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) return 'capricorn';
    if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) return 'aquarius';
    return 'pisces';
  };
  
  // Update current zodiac sign on component mount
  useEffect(() => {
    setCurrentZodiac(getCurrentZodiacSign());
  }, []);
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  useEffect(() => {
    if (!astroLoading && !astroError) {
      // Create a combined approach using both chakra and standard recommendations
      const chakraRecommendations = contextChakraEnergies ? getChakraBasedRecommendations(contextChakraEnergies, 16) : {};
      
      // Create a basic set of elemental properties instead of using the calculator directly
      let elementalProps: ElementalProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
      
      // Import the astronomiaCalculator to get current planetary positions and enhance our basic properties
      import('../utils/astronomiaCalculator').then(({ calculatePlanetaryPositions }) => {
        const currentDate = new Date();
        let actualPlanetaryPositions = {};
        
        if (calculatePlanetaryPositions) {
          actualPlanetaryPositions = calculatePlanetaryPositions(currentDate);
          
          // Use the dominant planet logic to adjust elemental properties
          const dominantPlanets = calculateDominantPlanets(actualPlanetaryPositions);
          
          // Adjust elemental properties based on dominant planets
          dominantPlanets.forEach(planet => {
            switch(planet.toLowerCase()) {
              case 'sun':
              case 'mars':
                elementalProps.Fire += 0.05;
                break;
              case 'moon':
              case 'neptune':
                elementalProps.Water += 0.05;
                break;
              case 'mercury':
              case 'uranus':
                elementalProps.Air += 0.05;
                break;
              case 'saturn':
              case 'venus':
                elementalProps.Earth += 0.05;
                break;
              default:
                break;
            }
          });
          
          // Normalize the elemental properties to ensure they sum to 1
          const total = Object.values(elementalProps).reduce((sum, val) => sum + val, 0);
          if (total > 0) {
            Object.keys(elementalProps).forEach(key => {
              elementalProps[key as keyof ElementalProperties] /= total;
            });
          }
        }
        
        // Continue with the recommendation process
        proceedWithRecommendations(elementalProps, actualPlanetaryPositions);
      });
    }
    
    // Helper function to determine dominant planets based on their positions
    const calculateDominantPlanets = (positions: Record<string, unknown>): string[] => {
      if (!positions) return ['sun', 'moon']; // Default to luminaries
      
      // Dignity and strength scoring system
      const planetStrengths: Record<string, number> = {};
      
      // Planetary rulerships - which planets rule which signs
      const rulerships: Record<string, string[]> = {
        'aries': ['mars'],
        'taurus': ['venus'],
        'gemini': ['mercury'],
        'cancer': ['moon'],
        'leo': ['sun'],
        'virgo': ['mercury'],
        'libra': ['venus'],
        'scorpio': ['mars', 'pluto'],
        'sagittarius': ['jupiter'],
        'capricorn': ['saturn'],
        'aquarius': ['uranus', 'saturn'],
        'pisces': ['neptune', 'jupiter']
      };
      
      // Exaltation positions for each planet
      const exaltations: Record<string, string> = {
        'sun': 'aries',
        'moon': 'taurus',
        'mercury': 'virgo', 
        'venus': 'pisces',
        'mars': 'capricorn',
        'jupiter': 'cancer',
        'saturn': 'libra',
        'uranus': 'scorpio',
        'neptune': 'leo',
        'pluto': 'aquarius'
      };
      
      // Calculate strengths for each planet
      Object.entries(positions).forEach(([planet, data]) => {
        const planetName = planet.toLowerCase();
        
        // Initialize strength for this planet (base value)
        if (!planetStrengths[planetName]) {
          planetStrengths[planetName] = 1;
        }
        
        // Get the sign this planet is in
        const sign = typeof data === 'object' && data.sign ? data.sign.toLowerCase() : '';
        if (!sign) return;
        
        // Check if planet is in its rulership (highest dignity)
        if (rulerships[sign]?.includes(planetName)) {
          planetStrengths[planetName] += 5;
        }
        
        // Check if planet is in its exaltation
        if (exaltations[planetName] === sign) {
          planetStrengths[planetName] += 4;
        }
        
        // Base dignities for traditional planets
        switch (planetName) {
          case 'sun':
          case 'moon':
            // Luminaries always have extra weight
            planetStrengths[planetName] += 3;
            break;
          case 'mercury':
          case 'venus':
          case 'mars':
            // Personal planets have strong influence
            planetStrengths[planetName] += 2;
            break;
          case 'jupiter':
          case 'saturn':
            // Social planets have medium influence
            planetStrengths[planetName] += 1;
            break;
        }
      });
      
      // Sort planets by strength and return top ones
      return Object.entries(planetStrengths)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)  // Take top 5 most influential planets
        .map(([planet]) => planet);
    };
    
    // Function to continue processing with calculated or default elemental properties
    function proceedWithRecommendations(
      elementalProps: ElementalProperties,
      planetaryAlignment: any = {}
    ) {
      // Create an object with astrological state data that matches the required interface
      const astroState = {
        elementalProperties: elementalProps,
        timestamp: new Date(),
        currentStability: 1.0,
        planetaryAlignment: planetaryAlignment,
        dominantElement: Object.entries(elementalProps).sort((a, b) => b[1] - a[1])[0][0],
        currentZodiac: currentZodiac || 'aries', // To match AstrologicalState interface
        sunSign: currentZodiac as ZodiacSign || 'aries', // Fix: Cast to ZodiacSign
        zodiacSign: currentZodiac || 'aries',
        moonSign: 'taurus' as ZodiacSign, // Fix: Cast to ZodiacSign
        lunarPhase: 'full_moon' as LunarPhase, 
        moonPhase: 'full_moon' as LunarPhase, // Alternative name for same property
        activePlanets: calculateDominantPlanets(planetaryAlignment),
        dominantPlanets: calculateDominantPlanets(planetaryAlignment).map(name => ({ 
          name: name as any, 
          influence: 1
        })),
        retrograde: [],
        currentPlanetaryAlignment: planetaryAlignment,
        season: getCurrentSeason(),
        isDaytime: true
      };
      
      // Generate ingredient recommendations based on astrological state
      const inputProps = {
        ...astroState.elementalProperties,
        timestamp: astroState.timestamp,
        currentStability: astroState.currentStability,
        planetaryAlignment: astroState.planetaryAlignment
      };
      
      const recommendationOptions = {
        currentZodiac: astroState.zodiacSign,
        limit: 48
      };
      
      // Get recommendations using the ingredient recommender
      const recommendations = getIngredientRecommendations(inputProps, recommendationOptions);
      
      // Also get top ingredients using the food recommender for comparison and enrichment
      const topIngredients = getTopIngredientMatches({
        ...astroState,
        currentZodiac: astroState.currentZodiac as ZodiacSign,
        moonPhase: astroState.moonPhase as LunarPhase,
        lunarPhase: astroState.lunarPhase as LunarPhase,
        dominantElement: astroState.dominantElement as Element
      }, 50);
      
      // Combine recommendations
      setAstroRecommendations(recommendations);
    }
  }, [astroLoading, astroError, planetaryPositions, contextChakraEnergies, currentZodiac]);
  
  // Detect oil-based ingredients
  const isOil = (ingredient: IngredientRecommendation): boolean => {
    if (!ingredient.name) return false;
    const name = ingredient.name.toLowerCase();
    
    // Check the ingredient name against the oil types
    return name.includes('oil') || 
           name.includes('butter') ||
           name.includes('fat') ||
           name.includes('ghee') ||
           name.includes('lard') ||
           name.includes('tallow') ||
           Object.keys(oilsCollection).some(oil => name.includes(oil.toLowerCase()));
  };
  
  // Detect vinegar-based ingredients
  const isVinegar = (ingredient: unknown): boolean => {
    if (typeof ingredient !== 'object' || ingredient === null) return false;
    
    // Check if it has a name property
    if (!('name' in ingredient) || typeof ingredient.name !== 'string') return false;
    
    const name = ingredient.name.toLowerCase();
    
    // Check the ingredient name against vinegar terms
    return name.includes('vinegar') || 
           name.includes('acetic') ||
           Object.keys(vinegarsCollection).some(vinegar => name.includes(vinegar.toLowerCase()));
  };
  
  // Get normalized category based on ingredient
  const getNormalizedCategory = (ingredient: unknown): string => {
    if (typeof ingredient !== 'object' || ingredient === null) return 'other';
    
    // Check if it has a category property
    let category = 'other';
    
    if ('category' in ingredient && typeof ingredient.category === 'string') {
      category = ingredient.category.toLowerCase();
    }
    
    // If no category, determine based on name
    if (category === 'other' && 'name' in ingredient && typeof ingredient.name === 'string') {
      const name = ingredient.name.toLowerCase();
      
      // Check various category keywords
      if (isOil(ingredient as IngredientRecommendation)) {
        return 'oils';
      } else if (isVinegar(ingredient)) {
        return 'vinegars';
      } else if (['rice', 'wheat', 'oat', 'barley', 'rye', 'corn', 'quinoa', 'millet'].some(g => name.includes(g))) {
        return 'grains';
      } else if (['basil', 'thyme', 'oregano', 'mint', 'cilantro', 'dill', 'parsley', 'sage'].some(h => name.includes(h))) {
        return 'herbs';
      } else if (['pepper', 'salt', 'cumin', 'cinnamon', 'nutmeg', 'cardamom', 'clove'].some(s => name.includes(s))) {
        return 'spices';
      } else if (['apple', 'banana', 'orange', 'grape', 'mango', 'berry', 'melon', 'pear', 'peach'].some(f => name.includes(f))) {
        return 'fruits';
      } else if (['chicken', 'beef', 'pork', 'lamb', 'tofu', 'tempeh', 'fish', 'shrimp', 'egg', 'bean'].some(p => name.includes(p))) {
        return 'proteins';
      } else if (['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'potato', 'onion'].some(v => name.includes(v))) {
        return 'vegetables';
      }
    }
    
    // Normalize the category name
    switch (category) {
      case 'vegetable':
      case 'veg':
      case 'veggies':
        return 'vegetables';
      case 'protein':
      case 'meat':
      case 'meats':
      case 'dairy':
      case 'poultry':
      case 'seafood':
      case 'bean':
      case 'beans':
      case 'legume':
      case 'legumes':
        return 'proteins';
      case 'fruit':
        return 'fruits';
      case 'herb':
        return 'herbs';
      case 'spice':
        return 'spices';
      case 'grain':
      case 'cereal':
      case 'pasta':
      case 'noodle':
      case 'rice':
        return 'grains';
      case 'oil':
      case 'fat':
      case 'fats':
        return 'oils';
      case 'vinegar':
      case 'acid':
      case 'acidifier':
        return 'vinegars';
      default:
        return category;
    }
  };
  
  // Get current season
  const getCurrentSeason = (): string => {
    const date = new Date();
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };
  
  // Calculate ingredient compatibility
  const calculateIngredientCompatibility = (ingredient1: unknown, ingredient2: unknown): number => {
    if (typeof ingredient1 !== 'object' || ingredient1 === null || typeof ingredient2 !== 'object' || ingredient2 === null) {
      return 0.5; // Default compatibility if data is invalid
    }
    
    // Extract elemental properties
    let element1: Partial<ElementalProperties> = {};
    let element2: Partial<ElementalProperties> = {};
    
    if ('elementalProperties' in ingredient1 && ingredient1.elementalProperties) {
      element1 = ingredient1.elementalProperties as Partial<ElementalProperties>;
    }
    
    if ('elementalProperties' in ingredient2 && ingredient2.elementalProperties) {
      element2 = ingredient2.elementalProperties as Partial<ElementalProperties>;
    }
    
    // If no elemental data, use default compatibility
    if (Object.keys(element1).length === 0 || Object.keys(element2).length === 0) {
      return 0.7; // Reasonable default compatibility
    }
    
    // Calculate cosine similarity between elemental profiles
    const keys = ['Fire', 'Water', 'Earth', 'Air'] as const;
    const vec1 = keys.map(k => element1[k] || 0);
    const vec2 = keys.map(k => element2[k] || 0);
    
    try {
      // Use cosine similarity from ml-distance
      return similarity.cosine(vec1, vec2);
    } catch (e) {
      console.error('Error calculating compatibility:', e);
      return 0.7; // Default on error
    }
  };
  
  // Calculate astrological compatibility
  const calculateAstroCompatibility = (ingredient: unknown): number => {
    if (typeof ingredient !== 'object' || ingredient === null) {
      return 0.5; // Default compatibility if data is invalid
    }
    
    // Get the current zodiac sign
    const zodiacSign = currentZodiac?.toLowerCase() || 'aries';
    
    // Check if ingredient has astrological info
    if ('astrologicalProfile' in ingredient && 
        ingredient.astrologicalProfile && 
        typeof ingredient.astrologicalProfile === 'object') {
      const profile = ingredient.astrologicalProfile as Record<string, unknown>;
      
      // Check favorable zodiac signs
      if ('favorableZodiac' in profile && Array.isArray(profile.favorableZodiac)) {
        const favorable = profile.favorableZodiac as string[];
        if (favorable.some(z => z.toLowerCase() === zodiacSign)) {
          return 0.9; // High compatibility for favorable zodiac
        }
      }
    }
    
    return 0.6; // Moderate default compatibility
  };

  // Format recommendations for display
  const getEnhancedRecommendations = (ingredients: unknown[]): unknown[] => {
    // Enhancement function
    return ingredients.map(ingredient => {
      if (typeof ingredient !== 'object' || ingredient === null) return ingredient;
      
      // Make a copy to avoid modifying the original
      const enhanced = { ...ingredient } as Record<string, unknown>;
      
      // Calculate actual compatibility scores
      enhanced.astroCompatibility = calculateAstroCompatibility(ingredient);
      
      // Normalize category
      enhanced.category = getNormalizedCategory(ingredient);
      
      return enhanced;
    });
  };
  
  // Determine the category for an ingredient
  function determineCategory(name: string): string {
    name = name.toLowerCase();
    
    // Map of category indicators
    const categoryMap: Record<string, string[]> = {
      proteins: ['chicken', 'beef', 'pork', 'lamb', 'fish', 'shrimp', 'tofu', 'tempeh', 'egg', 'yogurt', 'cheese'],
      vegetables: ['carrot', 'broccoli', 'spinach', 'kale', 'lettuce', 'tomato', 'potato', 'onion', 'garlic', 'pepper'],
      fruits: ['apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'kiwi', 'peach', 'mango', 'pear'],
      grains: ['rice', 'wheat', 'oat', 'barley', 'quinoa', 'corn', 'pasta', 'bread', 'cereal', 'flour'],
      herbs: ['basil', 'thyme', 'oregano', 'mint', 'cilantro', 'parsley', 'dill', 'rosemary', 'sage', 'chive'],
      spices: ['pepper', 'salt', 'cumin', 'coriander', 'cardamom', 'cinnamon', 'nutmeg', 'clove', 'paprika'],
      oils: ['oil', 'butter', 'ghee', 'lard', 'fat'],
      vinegars: ['vinegar', 'acid', 'citrus']
    };
    
    // Check each category
    for (const [category, indicators] of Object.entries(categoryMap)) {
      if (indicators.some(indicator => name.includes(indicator))) {
        return category;
      }
    }
    
    // Default category
    return 'other';
  }

  // Render recommendations by category
  const renderCategoryRecommendations = () => {
    const validCategories = Object.keys(CATEGORY_DISPLAY_NAMES);
    
    // Get all categories from the recommendations
    return validCategories.map(category => {
      const normalizedCategory = category.toLowerCase();
      const items = astroRecommendations[normalizedCategory] || [];
      
      if (items.length === 0) return null;
      
      const isExpanded = expanded[normalizedCategory] !== false; // Default to expanded
      
      return (
        <div key={normalizedCategory} className={styles.categorySection}>
          <div 
            className={styles.categoryHeader}
            onClick={(e) => toggleCategoryExpansion(normalizedCategory, e)}
          >
            <h3 className={styles.categoryTitle}>
              <span className={styles.categoryIcon}>{CATEGORY_ICONS[normalizedCategory] || '🍽️'}</span>
              {CATEGORY_DISPLAY_NAMES[normalizedCategory] || normalizedCategory}
              <span className={styles.itemCount}>({items.length})</span>
            </h3>
            <button className={styles.expandButton}>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {isExpanded && (
            <div className={styles.ingredientsGrid}>
              {items.slice(0, CATEGORY_DISPLAY_COUNTS[normalizedCategory] || 10).map((item, index) => {
                // Ensure item is treated as EnhancedIngredient
                const enhancedItem = item as unknown as EnhancedIngredient;
                
                return (
                  <div 
                    key={`${enhancedItem.name}-${index}`}
                    className={`${styles.ingredientCard} ${selectedIngredient?.name === enhancedItem.name ? styles.selected : ''}`}
                    onClick={(e) => handleIngredientSelect(enhancedItem, e)}
                  >
                    <h4 className={styles.ingredientName}>{enhancedItem.name}</h4>
                    
                    <div className={styles.elementTags}>
                      {enhancedItem.elementalProperties && 
                       Object.entries(enhancedItem.elementalProperties)
                        .sort(([_, a], [__, b]) => b - a)
                        .slice(0, 2) // Show top 2 elements
                        .map(([element, value]) => (
                          <span key={element} className={`${styles.elementTag} ${styles[element.toLowerCase()]}`}>
                            {getElementIcon(element)}
                            {element}: {Math.round(value * 100)}%
                          </span>
                        ))}
                    </div>
                    
                    {enhancedItem.matchScore !== undefined && (
                      <div className={styles.scoreBar}>
                        <div 
                          className={styles.scoreBarFill}
                          style={{ width: `${Math.round(enhancedItem.matchScore * 100)}%` }}
                        ></div>
                        <span className={styles.scoreValue}>{Math.round(enhancedItem.matchScore * 100)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };
  
  // Render detailed information for selected ingredient
  const renderIngredientDetail = () => {
    if (!selectedIngredient) return null;
    
    const enhancedItem = selectedIngredient as EnhancedIngredient;
    
    return (
      <div className={styles.detailSection}>
        <h3>{enhancedItem.name}</h3>
        
        {enhancedItem.category && (
          <span className={styles.categoryBadge}>
            {enhancedItem.category}
          </span>
        )}
        
        {enhancedItem.qualities && enhancedItem.qualities.length > 0 && (
          <div className={styles.qualityTags}>
            {enhancedItem.qualities.map((quality, idx) => (
              <span key={idx} className={styles.qualityTag}>{quality}</span>
            ))}
          </div>
        )}
        
        <div className={styles.elementBars}>
          {enhancedItem.elementalProperties && 
           Object.entries(enhancedItem.elementalProperties).map(([element, value]) => (
            <div key={element} className={styles.elementBar}>
              <span className={styles.elementLabel}>
                {getElementIcon(element)}
                {element}
              </span>
              <div className={styles.elementBarContainer}>
                <div 
                  className={`${styles.elementBarFill} ${styles[`${element.toLowerCase()}Fill`]}`}
                  style={{ width: `${Math.round(value * 100)}%` }}
                ></div>
              </div>
              <span className={styles.elementValue}>{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
        
        {enhancedItem.description && (
          <p className={styles.description}>{enhancedItem.description}</p>
        )}
        
        {enhancedItem.pairingRecommendations && (
          <div className={styles.pairings}>
            <h4>Pairs Well With</h4>
            {enhancedItem.pairingRecommendations.complementary && (
              <div className={styles.pairingList}>
                {enhancedItem.pairingRecommendations.complementary.map((item, idx) => (
                  <span key={idx} className={styles.pairingItem}>{item}</span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {enhancedItem.recommendedCookingMethods && (
          <div className={styles.cookingMethods}>
            <h4>Cooking Methods</h4>
            <div className={styles.methodsList}>
              {enhancedItem.recommendedCookingMethods.map((method, idx) => (
                <div key={idx} className={styles.methodItem}>
                  <span className={styles.methodName}>{method.name}</span>
                  {method.cookingTime && (
                    <span className={styles.cookingTime}>
                      {method.cookingTime.min}-{method.cookingTime.max} {method.cookingTime.unit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (astroLoading || foodLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Finding the perfect ingredients based on cosmic influences...</p>
      </div>
    );
  }

  // Error state
  if (errorMessage || astroError || foodError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          {errorMessage || astroError || foodError || 'Something went wrong. Please try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cosmic Ingredient Recommender</h2>
        <div className={styles.celestialInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Current Zodiac</span>
            <span className={styles.infoValue}>{currentZodiac || 'Aries'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Season</span>
            <span className={styles.infoValue}>{getCurrentSeason()}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Planetary Hour</span>
            <span className={styles.infoValue}>{currentPlanetaryHour || 'Unknown'}</span>
          </div>
        </div>
      </div>
      
      {/* Category navigation */}
      <div className={styles.categoryNav}>
        {Object.keys(CATEGORY_DISPLAY_NAMES).map(category => {
          const items = astroRecommendations[category.toLowerCase()] || [];
          if (items.length === 0) return null;
          
          return (
            <button 
              key={category}
              className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span className={styles.categoryIcon}>{CATEGORY_ICONS[category.toLowerCase()] || '🍽️'}</span>
              <span>{CATEGORY_DISPLAY_NAMES[category]}</span>
            </button>
          );
        })}
      </div>
      
      <div className={styles.contentGrid}>
        <div className={styles.recommendationsPanel}>
          {Object.keys(astroRecommendations).length > 0 ? (
            renderCategoryRecommendations()
          ) : (
            <div className={styles.emptyMessage}>
              No ingredient recommendations available. Try refreshing the page.
            </div>
          )}
        </div>
        
        <div className={styles.detailPanel}>
          {selectedIngredient ? (
            renderIngredientDetail()
          ) : (
            <div className={styles.placeholderMessage}>
              Select an ingredient to see details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
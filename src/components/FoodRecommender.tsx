'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import styles from './FoodRecommender.module.css';
import { 
  ChakraEnergies, 
  Planet as AlchemyPlanet
} from '@/types/alchemy';
import { 
  CHAKRA_SYMBOLS, 
  CHAKRA_BIJA_MANTRAS,
  CHAKRA_BG_COLORS, 
  CHAKRA_TEXT_COLORS, 
  CHAKRA_SANSKRIT_NAMES,
  normalizeChakraKey
} from '@/constants/chakraSymbols';
import { CHAKRA_BALANCING_FOODS } from '@/constants/chakraMappings';
import { isChakraKey } from '@/utils/typeGuards';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { useAlchemicalState } from '../context/AlchemicalContext';
import ElementalCalculator from '../utils/ElementalCalculator';
import IngredientsLibrary from './IngredientsLibrary';
import DateTimeDisplay from './DateTimeDisplay';
import { CelestialCharts } from './CelestialCharts';
import FoodMenu from './FoodMenu/FoodMenu';
import ProductsSelector from './ProductsSelector';
import MenuBuilder from './MenuBuilder';
import { SynastryChart } from './SynastryChart';
import { IngredientRecommendations } from './FoodRecommender/IngredientRecommendations';
import ElementalAlignmentChart from './ElementalAlignmentChart';
import PlanetaryHourWidget from './PlanetaryHourWidget';
import { calculatePlanetaryHourChakras } from '../utils/planetaryUtils';
import { herbsCollection, oilsCollection, vinegarsCollection, grainsCollection } from '@/data/ingredients';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { ChevronUpIcon as SolidChevronUpIcon, ChevronDownIcon as SolidChevronDownIcon } from '@heroicons/react/solid';
import { Ingredient } from '../types/ingredients';
import IngredientDisplay from './FoodRecommender/IngredientDisplay';

// Type guard functions
function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Define the structure of our ingredient object
interface Ingredient {
  name: string;
  chakra: string;
  score: number;
  category: string;
  subCategory?: string;
  qualities?: string[];
  origin?: string[];
  astrologicalProfile?: {
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    elementalAffinity: string | {
      base: string;
      decanModifiers?: Record<string, any>;
    };
  };
  varieties?: Record<string, {
    name?: string;
    appearance?: string;
    flavor?: string;
    texture?: string;
    notes?: string;
    uses?: string;
  }>;
  culinaryApplications?: Record<string, {
    name?: string;
    method?: string;
    timing?: string | Record<string, string>;
    accompaniments?: string[];
    toppings?: string[];
    temperature?: string | Record<string, number>;
    techniques?: Record<string, any>;
    preparations?: Record<string, any>;
    recipes?: string[];
    notes?: string;
  }>;
  nutritionalProfile?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    minerals: Record<string, string>;
  };
  healthBenefits?: string[];
  seasonality?: {
    peak: string[];
    notes: string;
  };
  safetyNotes?: {
    handling: string;
    consumption: string;
    storage: string;
    quality: string;
  };
}

// Type guard for ingredients
function isIngredient(obj: any): obj is Ingredient {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.chakra === 'string' &&
    typeof obj.score === 'number' &&
    typeof obj.category === 'string'
  );
}

// Type guard for chakra energies object
function isChakraEnergies(obj: any): obj is Record<string, number> {
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Check all keys and values
  return Object.entries(obj).every(
    ([key, value]) => isChakraKey(key) && typeof value === 'number'
  );
}

// Define food categories
const FOOD_CATEGORIES = ['Vegetables', 'Fruits', 'Proteins', 'Grains', 'Spices', 'Oils', 'Vinegars'];

// Define category display names and display counts
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

// Score display component
const ScoreDisplay = ({ score }: { score?: number }) => {
  if (!score && score !== 0) return null;
  
  // Color based on score
  let color = 'text-gray-500';
  if (score >= 90) color = 'text-green-600';
  else if (score >= 75) color = 'text-green-500';
  else if (score >= 60) color = 'text-blue-500';
  else if (score >= 45) color = 'text-yellow-500';
  else if (score >= 30) color = 'text-orange-500';
  
  return (
    <span className={`text-xs font-medium ${color}`}>
      {score.toFixed(1)}
    </span>
  );
};

export default function FoodRecommender() {
  // Use the existing category display counts from above
  // Remove this duplicate definition
  // const MIN_ITEMS_PER_CATEGORY = 8;
  
  // Remove the duplicate CATEGORY_DISPLAY_COUNTS
  // const CATEGORY_DISPLAY_COUNTS = {
  //   'default': 10,
  //   'oils': 12,
  //   'vinegars': 12
  // };
  
  // Use the hook to get consistent planetary data and ingredient recommendations
  const { planetaryPositions, isLoading: astroLoading } = useAstrologicalState();
  
  // Derive activePlanets and lunarPhase from planetaryPositions
  const activePlanets = useMemo(() => {
    if (!planetaryPositions) return [];
    return Object.keys(planetaryPositions);
  }, [planetaryPositions]);
  
  const lunarPhase = useMemo(() => {
    // Default to new moon if no data
    if (!planetaryPositions?.moon?.phase) return 'new moon';
    return planetaryPositions.moon.phase;
  }, [planetaryPositions]);
  
  const { 
    recommendations, 
    chakraEnergies,
    chakraRecommendations,
    loading: recommendationsLoading, 
    error,
    refreshRecommendations,
  } = useChakraInfluencedFood({ limit: 300 }); // Increased from 200 to 300 to ensure all categories have plenty of items
  
  // State for selected ingredient
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // State for expanded categories
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // State for active category (for navigation highlighting)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Track which category is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const categories = Object.keys(categorizedRecommendations);
      if (categories.length === 0) return;

      // Find the category that's most visible in the viewport
      for (const category of categories) {
        const element = document.getElementById(category);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        // Consider an element in view if its top is in the top half of the viewport
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          setActiveCategory(category);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [categorizedRecommendations]);

  // Function to scroll to category
  const scrollToCategory = (category: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveCategory(category);
    }
  };
  
  // Planetary hours calculation
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState<string | null>(null);
  const [planetaryHourChakras, setPlanetaryHourChakras] = useState<string[]>([]);

  // Initialize planetary hour calculator
  useEffect(() => {
    try {
      const planetaryCalculator = new PlanetaryHourCalculator();
      
      // Get current planetary hour
      const hourInfo = planetaryCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {
        const planetName = hourInfo.planet;
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
  
  // Get current season
  const currentSeason = (() => {
    const date = new Date();
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  })();
  
  // Get current zodiac from recommendations if available
  const currentZodiac = recommendations[0]?.astrologicalProfile?.favorableZodiac?.[0] || 'aries';
  
  // Remove duplicate recommendations
  const uniqueRecommendations = useMemo(() => {
    const uniqueNames = new Set();
    return recommendations.filter(rec => {
      if (uniqueNames.has(rec.name.toLowerCase())) {
        return false;
      }
      uniqueNames.add(rec.name.toLowerCase());
      return true;
    });
  }, [recommendations]);
  
  // Enhanced nutritional score with improved logic for affinity
  const boostedRecommendations = useMemo(() => {
    if (!currentPlanetaryHour || planetaryHourChakras.length === 0) {
      return uniqueRecommendations;
    }
    
    return uniqueRecommendations.map(ingredient => {
      // Check if this ingredient is associated with the current planetary hour's chakras
      const chakraKey = normalizeChakraKey(ingredient.chakra);
      const boostFactor = planetaryHourChakras.includes(chakraKey) ? 1.2 : 1.0;
      
      // Enhance categorization for oils and vinegars
      let category = ingredient.category?.toLowerCase() || '';
      
      // Check if this is an oil or vinegar that's not properly categorized
      if (!category || category === 'other') {
        const name = ingredient.name.toLowerCase();
        if (name.includes('oil')) {
          category = 'oils';
        } else if (name.includes('vinegar')) {
          category = 'vinegars';
        }
      }
      
      return {
        ...ingredient,
        category,
        score: ingredient.score * boostFactor,
        boostedByPlanetaryHour: boostFactor > 1.0
      };
    }).sort((a, b) => b.score - a.score);
  }, [uniqueRecommendations, currentPlanetaryHour, planetaryHourChakras]);

  // Define herb names to improve herb detection
  const herbNames = Object.keys(herbsCollection);
  
  // Define oil types for better oil detection - use the keys from oilsCollection
  const oilTypes = Object.keys(oilsCollection).concat([
    'oil', 'olive oil', 'vegetable oil', 'sunflower oil', 'sesame oil', 'coconut oil',
    'avocado oil', 'walnut oil', 'peanut oil', 'grapeseed oil', 'canola oil',
    'flaxseed oil', 'almond oil', 'truffle oil', 'palm oil', 'corn oil',
    'ghee', 'butter', 'lard', 'tallow', 'duck fat', 'schmaltz', 'bacon fat',
    'pumpkin seed oil', 'hemp seed oil', 'macadamia oil', 'hazelnut oil',
    'pistachio oil', 'perilla oil', 'mustard oil', 'rice bran oil',
    'argan oil', 'tea seed oil', 'apricot kernel oil', 'safflower oil',
    'mct oil', 'mct'
  ]);
  
  // Define vinegar types for better vinegar detection - use the keys from vinegarsCollection
  const vinegarTypes = Object.keys(vinegarsCollection).concat([
    'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'rice vinegar', 'red wine vinegar',
    'white wine vinegar', 'sherry vinegar', 'champagne vinegar', 'malt vinegar',
    'distilled vinegar', 'black vinegar', 'coconut vinegar',
    'cane vinegar', 'beer vinegar', 'fruit vinegar', 'herb vinegar', 'honey vinegar',
    'kombucha vinegar', 'date vinegar', 'raspberry vinegar', 'fig vinegar', 
    'tarragon vinegar', 'palm vinegar', 'plum vinegar', 'white balsamic',
    'pomegranate vinegar', 'umeboshi vinegar', 'ume plum vinegar'
  ]);

  // Categorize recommendations
  const categorizedRecommendations = useMemo(() => {
    const categories: Record<string, Ingredient[]> = {
      proteins: [],
      vegetables: [],
      grains: [],
      fruits: [],
      herbs: [],
      spices: [],
      oils: [],
      vinegars: []
    };
    
    if (!boostedRecommendations) return categories;

    // Add all available oils from the collection with formatted names
    Object.entries(oilsCollection).forEach(([key, data]) => {
      // Get the display name either from the data object or format the key
      const displayName = data.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      categories.oils.push({
        name: displayName,
        category: 'oils',
        score: 0.75, // Slightly higher base score
        chakra: 'sacral', // Update default chakra for oils
        elementalAffinity: { base: 'water' }
      });
    });

    // Add all available vinegars from the collection with formatted names
    Object.entries(vinegarsCollection).forEach(([key, data]) => {
      // Get the display name either from the data object or format the key
      const displayName = data.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      categories.vinegars.push({
        name: displayName,
        category: 'vinegars',
        score: 0.78, // Slightly higher base score
        chakra: 'throat', // Update default chakra for vinegars
        elementalAffinity: { base: 'water' }
      });
    });

    // Helper function to check if an ingredient is an oil
    const isOil = (ingredient: Ingredient): boolean => {
      const category = ingredient.category?.toLowerCase() || '';
      if (category === 'oil' || category === 'oils') return true;
      
      const name = ingredient.name.toLowerCase();
      
      // Explicitly exclude common vegetables that might be mistaken for oils
      if (name.includes('butternut squash') || name.includes('pumpkin') || 
          name.includes('acorn squash') || name.includes('spaghetti squash')) {
        return false;
      }
      
      return oilTypes.some(oil => name.includes(oil.toLowerCase()));
    };

    // Helper function to check if an ingredient is a vinegar
    const isVinegar = (ingredient: Ingredient): boolean => {
      const category = ingredient.category?.toLowerCase() || '';
      if (category === 'vinegar' || category === 'vinegars') return true;
      
      const name = ingredient.name.toLowerCase();
      return vinegarTypes.some(vinegar => name.includes(vinegar.toLowerCase()));
    };

    // Helper function to get normalized category
    const getNormalizedCategory = (ingredient: Ingredient): string | null => {
      if (!ingredient.category) return null;
      
      const category = ingredient.category.toLowerCase();
      
      // Map categories to our standard ones
      if (['vegetable', 'vegetables'].includes(category)) return 'vegetables';
      if (['protein', 'meat', 'seafood', 'fish', 'poultry'].includes(category)) return 'proteins';
      if (['herb', 'herbs'].includes(category)) return 'herbs';
      if (['spice', 'spices', 'seasoning', 'seasonings'].includes(category)) return 'spices';
      if (['grain', 'grains', 'pasta', 'rice', 'cereal'].includes(category)) return 'grains';
      if (['fruit', 'fruits', 'berry', 'berries'].includes(category)) return 'fruits';
      if (['oil', 'oils', 'fat', 'fats'].includes(category)) return 'oils';
      if (['vinegar', 'vinegars', 'acid', 'acids'].includes(category)) return 'vinegars';
      
      return null;
    };

    // Categorize each ingredient from the recommendations and add to our categories
    boostedRecommendations.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const explicitCategory = getNormalizedCategory(ingredient);
      
      // If the ingredient has an explicit category, respect it
      if (explicitCategory && categories[explicitCategory]) {
        categories[explicitCategory].push(ingredient);
        return;
      }
      
      // Seafood proteins - check first to prevent miscategorization
      if (
        name.includes('cod') || name.includes('sole') || name.includes('scallop') || 
        name.includes('salmon') || name.includes('squid') || name.includes('shrimp') || 
        name.includes('flounder') || name.includes('halibut') || name.includes('sea bass') || 
        name.includes('octopus') || name.includes('fish') || name.includes('trout') || 
        name.includes('tuna') || name.includes('crab') || name.includes('lobster')
      ) {
        categories.proteins.push(ingredient);
      }
      // Spices and seasonings
      else if (
        name.includes('pepper') || name.includes('saffron') || name.includes('szechuan') || 
        name.includes('peppercorn') || name.includes('cumin') || name.includes('spice') || 
        ingredient.category === 'spice'
      ) {
        categories.spices.push(ingredient);
      }
      // Protein legumes
      else if (
        name.includes('lentil') || name.includes('lima bean')
      ) {
        categories.proteins.push(ingredient);
      }
      // Check for vegetable squashes
      else if (name.includes('squash') || name.includes('pumpkin')) {
        categories.vegetables.push(ingredient);
      }
      // Root and allium vegetables
      else if (
        name.includes('ginger') || name.includes('garlic') || name.includes('onion') || 
        name.includes('shallot') || name.includes('leek') || name.includes('scallion')
      ) {
        categories.vegetables.push(ingredient);
      }
      // Leafy and cruciferous vegetables
      else if (
        name.includes('cabbage') || name.includes('kale') || name.includes('broccoli') || 
        name.includes('cauliflower') || name.includes('brussels') || name.includes('bok choy') || 
        name.includes('collard') || name.includes('spinach') || name.includes('lettuce')
      ) {
        categories.vegetables.push(ingredient);
      }
      // Other common vegetables
      else if (
        name.includes('carrot') || name.includes('artichoke') || name.includes('tomato') || 
        name.includes('eggplant') || name.includes('peas') || name.includes('bean') || 
        name.includes('radish') || name.includes('kohlrabi') || name.includes('edamame')
      ) {
        categories.vegetables.push(ingredient);
      }
      // Oils
      else if (isOil(ingredient)) {
        const existingIndex = categories.oils.findIndex(
          oil => oil.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          categories.oils[existingIndex] = ingredient;
        } else {
          categories.oils.push(ingredient);
        }
      }
      // Vinegars
      else if (isVinegar(ingredient)) {
        const existingIndex = categories.vinegars.findIndex(
          vinegar => vinegar.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          categories.vinegars[existingIndex] = ingredient;
        } else {
          categories.vinegars.push(ingredient);
        }
      }
      // Proteins - general check
      else if (
        ingredient.category === 'protein' || name.includes('meat') || 
        name.includes('cheese') || name.includes('eggs') || name.includes('tofu')
      ) {
        categories.proteins.push(ingredient);
      }
      // Herbs
      else if (ingredient.category === 'herb' || name.includes('herb') || herbNames.some(herb => name.includes(herb.toLowerCase()))) {
        categories.herbs.push(ingredient);
      }
      // Grains
      else if (ingredient.category === 'grain' || name.includes('rice') || name.includes('pasta') || Object.keys(grainsCollection).some(grainKey => name.includes(grainKey.toLowerCase()))) {
        categories.grains.push(ingredient);
      }
      // Fruits
      else if (ingredient.category === 'fruit' || ['apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'melon', 'grape'].some(fruit => name.includes(fruit))) {
        categories.fruits.push(ingredient);
      }
      // Default to vegetables for anything unmatched
      else {
        categories.vegetables.push(ingredient);
      }
    });

    // Sort each category by score
    Object.keys(categories).forEach(category => {
      categories[category] = categories[category].sort((a, b) => (b.score || 0) - (a.score || 0));
    });

    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    ) as Record<string, Ingredient[]>;
  }, [boostedRecommendations]);

  // Toggle expansion for a category
  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    // Stop event propagation
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Handle ingredient selection to display details
  const handleIngredientSelect = (ingredient: Ingredient, category: string, e: React.MouseEvent) => {
    // Stop propagation to prevent category toggle
    e.stopPropagation();
    
    // Toggle expanded ingredient
    if (selectedIngredient?.name === ingredient.name) {
      setSelectedIngredient(null);
    } else {
      setSelectedIngredient(ingredient);
    }
  };

  useEffect(() => {
    // Reset selected ingredient when recommendations change
    setSelectedIngredient(null);
    // Reset expanded state
    setExpanded({});
  }, [recommendations]);

  // Get chakra symbol (using bija mantras for this component)
  function getChakraSymbol(chakraKey: string): string {
    const normalizedKey = normalizeChakraKey(chakraKey);
    return normalizedKey ? CHAKRA_SYMBOLS[normalizedKey] || '?' : '?';
  }

  // Get sanskrit name for chakra
  function getChakraName(chakraKey: string): string {
    const normalizedKey = normalizeChakraKey(chakraKey);
    return normalizedKey ? CHAKRA_SANSKRIT_NAMES[normalizedKey] || chakraKey : chakraKey;
  }

  // Render loading state if needed
  if (astroLoading || recommendationsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Calculating celestial influences on ingredients...</p>
      </div>
    );
  }
  
  // Render error state if there's an issue
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-700 font-medium mb-2">Error Loading Recommendations</h3>
        <p>{error}</p>
        <button 
          onClick={refreshRecommendations}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Type-safe chakraEnergies
  const safeChakraEnergies: ChakraEnergies = isObject(chakraEnergies) 
    ? {
        root: isNumber(chakraEnergies.root) ? chakraEnergies.root : 0,
        sacral: isNumber(chakraEnergies.sacral) ? chakraEnergies.sacral : 0,
        solarPlexus: isNumber(chakraEnergies.solarPlexus) ? chakraEnergies.solarPlexus : 0,
        heart: isNumber(chakraEnergies.heart) ? chakraEnergies.heart : 0,
        throat: isNumber(chakraEnergies.throat) ? chakraEnergies.throat : 0,
        brow: isNumber(chakraEnergies.brow) ? chakraEnergies.brow : 0,
        crown: isNumber(chakraEnergies.crown) ? chakraEnergies.crown : 0
      }
    : {
        root: 0,
        sacral: 0,
        solarPlexus: 0,
        heart: 0,
        throat: 0,
        brow: 0,
        crown: 0
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center">Recommended Ingredients</h2>
      <p className="text-center text-gray-600 mb-2">Click on any ingredient to view detailed information</p>
      
      {/* Category navigation links */}
      <div className={styles.categoryNav}>
        {Object.entries(categorizedRecommendations).map(([category]) => {
          const displayName = CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
          const isActive = category === activeCategory;
          const icon = CATEGORY_ICONS[category] || '🍽️';
          
          return (
            <a 
              key={`nav-${category}`}
              href={`#${category}`}
              onClick={(e) => scrollToCategory(category, e)}
              className={`${styles.categoryLink} ${isActive ? styles.activeCategoryLink : styles.inactiveCategoryLink}`}
            >
              <span className="mr-1">{icon}</span> {displayName}
            </a>
          );
        })}
      </div>
      
      {/* Recommendations by category */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(categorizedRecommendations).map(([category, items]) => {
          const displayName = CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
          const displayCount = CATEGORY_DISPLAY_COUNTS[category] || 5;
          const isExpanded = expanded[category] || false;
          const itemsToShow = isExpanded ? items : items.slice(0, displayCount);
          
          return (
            <div id={category} key={category} className="bg-white rounded-lg shadow-md p-4 scroll-mt-20">
              <div 
                className="flex justify-between items-center cursor-pointer mb-2"
                onClick={(e) => toggleCategoryExpansion(category, e)}
              >
                <h3 className="text-xl font-semibold text-gray-800">{displayName}</h3>
                <button className="text-gray-500 hover:text-gray-700">
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemsToShow.map((item, idx) => {
                  const isSelected = selectedIngredient?.name === item.name;
                  
                  return (
                    <div 
                      key={`${item.name}-${idx}`}
                      className={`bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-sm'} ${isSelected ? 'md:col-span-3 lg:col-span-3 h-auto' : 'h-28'} flex flex-col justify-between`}
                      onClick={(e) => handleIngredientSelect(item, category, e)}
                    >
                      <div className="font-medium text-gray-800">{item.name}</div>
                      
                      {!isSelected && (
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-gray-500">
                            <ScoreDisplay score={item.score} />
                          </div>
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="mt-2 animate-fade-in">
                          <div className="flex justify-between">
                            <div className="text-sm text-gray-500">
                              <ScoreDisplay score={item.score} />
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIngredient(null);
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                              aria-label="Close details"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="mt-2 text-sm grid grid-cols-1 gap-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Category:</span> {item.category}
                              {item.subCategory && ` (${item.subCategory})`}
                            </p>
                            
                            <p className="text-gray-600">
                              <span className="font-medium">Chakra:</span> 
                              {item.chakra ? `${getChakraName(item.chakra)} ${getChakraSymbol(item.chakra)}` : 
                               <span className="text-red-500 text-xs italic">No data</span>}
                            </p>
                            
                            <p className="text-gray-600">
                              <span className="font-medium">Qualities:</span> 
                              {item.qualities && item.qualities.length > 0 ? item.qualities.join(', ') : 
                               <span className="text-red-500 text-xs italic">No data</span>}
                            </p>
                            
                            <p className="text-gray-600">
                              <span className="font-medium">Origin:</span> 
                              {item.origin && item.origin.length > 0 ? item.origin.join(', ') : 
                               <span className="text-red-500 text-xs italic">No data</span>}
                            </p>
                            
                            <p className="text-gray-600">
                              <span className="font-medium">Health:</span> 
                              {item.healthBenefits && item.healthBenefits.length > 0 ? 
                                <>{item.healthBenefits[0]}{item.healthBenefits.length > 1 && '...'}</> : 
                                <span className="text-red-500 text-xs italic">No data</span>}
                            </p>
                            
                            <p className="text-gray-600">
                              <span className="font-medium">Planets:</span> 
                              {item.astrologicalProfile && item.astrologicalProfile.rulingPlanets ? 
                                item.astrologicalProfile.rulingPlanets.join(', ') : 
                                <span className="text-red-500 text-xs italic">No data</span>}
                            </p>
                            
                            {/* Always show nutritional profile section */}
                            <div className="mt-2">
                              <p className="font-medium text-gray-700 text-xs">Nutritional Profile:</p>
                              {!item.nutritionalProfile && (
                                <div className="bg-red-50 text-red-600 p-2 rounded text-xs mt-1">
                                  Nutritional information needed for this ingredient
                                </div>
                              )}
                              {item.nutritionalProfile && (
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  <div className="flex justify-between text-xs bg-blue-50 p-1 rounded">
                                    <span>Calories:</span>
                                    <span className="font-medium">
                                      {item.nutritionalProfile.calories !== undefined ? 
                                       item.nutritionalProfile.calories : 
                                       <span className="text-red-500 italic">?</span>}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs bg-green-50 p-1 rounded">
                                    <span>Protein:</span>
                                    <span className="font-medium">
                                      {item.nutritionalProfile.protein !== undefined ? 
                                       `${item.nutritionalProfile.protein}g` : 
                                       <span className="text-red-500 italic">?</span>}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs bg-yellow-50 p-1 rounded">
                                    <span>Fat:</span>
                                    <span className="font-medium">
                                      {item.nutritionalProfile.fat !== undefined ? 
                                       `${item.nutritionalProfile.fat}g` : 
                                       <span className="text-red-500 italic">?</span>}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs bg-purple-50 p-1 rounded">
                                    <span>Carbs:</span>
                                    <span className="font-medium">
                                      {item.nutritionalProfile.carbohydrates !== undefined ? 
                                       `${item.nutritionalProfile.carbohydrates}g` : 
                                       <span className="text-red-500 italic">?</span>}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {items.length > displayCount && (
                <div className="mt-3 text-center">
                  <button
                    onClick={(e) => toggleCategoryExpansion(category, e)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {isExpanded ? 'Show Less' : `Show ${items.length - displayCount} More`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
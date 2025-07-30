import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp, Beaker, Brain, ExternalLink, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';


import EnterpriseIntelligencePanel from '@/components/intelligence/EnterpriseIntelligencePanel';
import { normalizeChakraKey } from '@/constants/chakraSymbols';
import { herbsCollection, oilsCollection, vinegarsCollection, grainsCollection } from '@/data/ingredients';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { log } from '@/services/LoggingService';
import { ElementalProperties } from '@/types/alchemy';
import type { Ingredient , UnifiedIngredient } from '@/types/ingredient';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations, IngredientRecommendation } from '@/utils/ingredientRecommender';

// Props interface for IngredientRecommender
interface IngredientRecommenderProps {
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  maxDisplayed?: number;
  onCategorySelect?: (category: string) => void;
  onIngredientSelect?: (ingredient: IngredientRecommendation) => void;
}

/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
  'Sun': { diurnal: 'Fire', nocturnal: 'Fire' },
  'Moon': { diurnal: 'Water', nocturnal: 'Water' },
  'Mercury': { diurnal: 'Air', nocturnal: 'Earth' },
  'Venus': { diurnal: 'Water', nocturnal: 'Earth' },
  'Mars': { diurnal: 'Fire', nocturnal: 'Water' },
  'Jupiter': { diurnal: 'Air', nocturnal: 'Fire' },
  'Saturn': { diurnal: 'Air', nocturnal: 'Earth' },
  'Uranus': { diurnal: 'Water', nocturnal: 'Air' },
  'Neptune': { diurnal: 'Water', nocturnal: 'Water' },
  'Pluto': { diurnal: 'Earth', nocturnal: 'Water' }
};

// Define a styles object for animations and custom styles
const customStyles = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 }
  },
  animateFadeIn: {
    animation: 'fadeIn 0.3s ease-in-out'
  }
};

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
  proteins: 12,
  vegetables: 12,
  grains: 10,
  fruits: 12,
  herbs: 10,
  spices: 12,
  oils: 8,
  vinegars: 8
};

// Using inline styles to avoid CSS module conflicts
export default function IngredientRecommender({
  initialCategory = null,
  initialSelectedIngredient = null,
  isFullPageVersion = false,
  maxDisplayed = 12,
  onCategorySelect,
  onIngredientSelect
}: IngredientRecommenderProps = {}) {
  const router = useRouter();
  // Use the hook to get astrological data
  const astroState = useAstrologicalState();
  const { 
    currentZodiac, 
    currentPlanetaryAlignment, 
    loading: astroLoading, 
    isDaytime 
  } = astroState;
  
  // Note: chakraEnergies are not available from useAstrologicalState
  // We'll rely on the useChakraInfluencedFood hook for chakra-based recommendations
  const contextChakraEnergies = null; // Not available from this hook
  const planetaryPositions = currentPlanetaryAlignment;
  const astroError = null; // Hook doesn't expose error state
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  // States for selected item and expansion
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'proteins');

  // Initialize state from props
  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
    if (initialSelectedIngredient) {
      // Find the ingredient in recommendations and set it as selected
      // This will be handled after recommendations are loaded
    }
  }, [initialCategory, initialSelectedIngredient]);
  
  // Enterprise Intelligence state
  const [showEnterpriseIntelligence, setShowEnterpriseIntelligence] = useState<boolean>(false);
  const [enterpriseIntelligenceAnalysis, setEnterpriseIntelligenceAnalysis] = useState<any>(null);
  
  // Use the custom hook for food recommendations
  const { 
    recommendations: foodRecommendations, 
    chakraEnergies,
    loading: foodLoading, 
    error: foodError,
    refreshRecommendations
  } = useChakraInfluencedFood({ limit: 300 }); // Increased from 200 to 300 to ensure all categories have plenty of items
  
  // Helper function to get element icon with inline styles
  const getElementIcon = (element: string) => {
    const iconStyle = { 
      marginRight: '2px',
      color: element === 'Fire' ? '#ff6b6b' : 
            element === 'Water' ? '#6bb5ff' :
            element === 'Earth' ? '#6bff8e' :
            '#d9b3ff' // Air
    };
    
    switch (element) {
      case 'Fire': return <Flame style={iconStyle} size={16} />;
      case 'Water': return <Droplets style={iconStyle} size={16} />;
      case 'Earth': return <Mountain style={iconStyle} size={16} />;
      case 'Air': return <Wind style={iconStyle} size={16} />;
      default: return null;
    }
  };
  
  // Handle ingredient selection to display details
  const handleIngredientSelect = (item: unknown, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // ✅ Pattern MM-1: Safe type assertion for ingredient data
    const itemData = (item ) as Record<string, unknown>;
    
    // Toggle selected ingredient
    if (selectedIngredient?.name === String(itemData.name || '')) {
      setSelectedIngredient(null);
    } else {
      setSelectedIngredient(item as IngredientRecommendation);
      
      // Call prop callback if provided
      if (onIngredientSelect) {
        onIngredientSelect(item as IngredientRecommendation);
      }
      
      // Store selection in session storage for context preservation
      try {
        sessionStorage.setItem('selectedIngredient', JSON.stringify({
          name: String(itemData.name || ''),
          category: String(itemData.category || ''),
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to store selected ingredient in session storage:', error);
      }
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    
    // Call prop callback if provided
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    
    // Store selection in session storage for context preservation
    try {
      sessionStorage.setItem('selectedIngredientCategory', category);
    } catch (error) {
      console.warn('Failed to store selected category in session storage:', error);
    }
  };

  // Handle navigation to full ingredients page
  const handleViewMore = () => {
    // Preserve current context in URL parameters
    const params = new URLSearchParams();
    if (activeCategory) {
      params.set('category', activeCategory);
    }
    if (selectedIngredient) {
      params.set('ingredient', selectedIngredient.name);
    }
    
    const url = `/ingredients${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url);
  };
  
  // Toggle expansion for a category
  const toggleCategoryExpansion = (_category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [_category]: !prev[_category]
    }));
  };
  
  // Reset selected ingredient when recommendations change
  useEffect(() => {
    setSelectedIngredient(null);
  }, [astroRecommendations, foodRecommendations]);
  
  // Use chakra energies and planetary positions to generate ingredient recommendations
  useEffect(() => {
    if (!astroLoading && !astroError) {
      // Create a combined approach using both chakra and standard recommendations
      const chakraRecommendations = contextChakraEnergies ? getChakraBasedRecommendations(contextChakraEnergies, 16) : {};
      
      // Get elemental properties from planetary positions
      let elementalProps: ElementalProperties | undefined;
      if (planetaryPositions) {
        const calculator = new ElementalCalculator();
        elementalProps = calculator.calculateElementalState(planetaryPositions);
      }
      
      // Determine current planetary day and hour
      const now = new Date();
      // Extract planetary day and hour from context if available
      const planetaryDay = (planetaryPositions as any)?.planetaryDay?.planet || 'Sun';
      const planetaryHour = (planetaryPositions as any)?.planetaryHour?.planet || 'Sun';
      const isDaytime = now.getHours() >= 6 && now.getHours() < 18;
      
      // Create an object with astrological state data
      const astroState = {
        elementalProperties: elementalProps || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        timestamp: new Date(),
        currentStability: 1.0,
        planetaryAlignment: planetaryPositions || {},
        dominantElement: elementalProps ? 
          Object.entries(elementalProps).sort((a, b) => b[1] - a[1])[0][0] : 'Fire',
        zodiacSign: currentZodiac || 'aries',
        activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
        // Add standardized planetary day and hour information
        planetaryDay: planetaryDay,
        planetaryHour: planetaryHour,
        isDaytime: isDaytime
      };
      
      // Get standard recommendations with all planets
      const standardRecommendations = getIngredientRecommendations({
        ...astroState,
        lunarPhase: 'new moon',
        aspects: []
      } as any, { limit: 40 });
      
      // Merge the recommendations, prioritizing chakra-based ones
      const mergedRecommendations: GroupedIngredientRecommendations = {};
      
      // Process all categories
      const allCategories = new Set([
        ...Object.keys(chakraRecommendations),
        ...Object.keys(standardRecommendations)
      ]);
      
      allCategories.forEach(_category => {
        const chakraItems = chakraRecommendations[_category] || [];
        const standardItems = standardRecommendations[_category] || [];
        
        // Create a unique set of items using name as the key
        const uniqueItems = new Map();
        
        // Add chakra items first (higher priority)
        chakraItems.forEach(item => {
          uniqueItems.set(item.name, item);
        });
        
        // Add standard items that aren't already included
        standardItems.forEach(item => {
          if (!uniqueItems.has(item.name)) {
            uniqueItems.set(item.name, item);
          }
        });
        
        // Convert back to array and limit to prevent overwhelming the user
        mergedRecommendations[_category] = Array.from(uniqueItems.values()).slice(0, 32);
      });
      
      setAstroRecommendations(mergedRecommendations);
    }
  }, [astroLoading, contextChakraEnergies, planetaryPositions, astroError, currentZodiac]);
  
  // Define herb names to improve herb detection
  const herbNames = useMemo(() => Object.keys(herbsCollection), []);
  
  // Define oil types for better oil detection
  const oilTypes = useMemo(() => 
    Object.keys(oilsCollection).concat([
      'oil', 'olive oil', 'vegetable oil', 'sunflower oil', 'sesame oil', 'coconut oil',
      'avocado oil', 'walnut oil', 'peanut oil', 'grapeseed oil', 'canola oil'
    ]), 
  []);
  
  // Define vinegar types for better vinegar detection
  const vinegarTypes = useMemo(() => 
    Object.keys(vinegarsCollection).concat([
      'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'rice vinegar', 'red wine vinegar',
      'white wine vinegar', 'champagne vinegar', 'sherry vinegar', 'malt vinegar', 
      'distilled vinegar', 'black vinegar', 'rice wine vinegar', 'white balsamic',
      'balsamic glaze', 'raspberry vinegar', 'fig vinegar', 'coconut vinegar'
    ]), 
  []);
  
  // Helper function to check if an ingredient is an oil
  const isOil = (ingredient: Ingredient | UnifiedIngredient): boolean => {
    const _category = ingredient.category.toLowerCase() || '';
    if (_category === 'oil' || _category === 'oils') return true;
    
    const name = ingredient.name.toLowerCase();
    return oilTypes.some(oil => name.includes(oil.toLowerCase()));
  };
  
  // Helper function to check if an ingredient is a vinegar
  const isVinegar = (ingredient: unknown): boolean => {
    // ✅ Pattern MM-1: Safe type assertion for ingredient data
    const ingredientData = (ingredient ) as Record<string, unknown>;
    const _category = String(ingredientData.category || '').toLowerCase();
    if (_category === 'vinegar' || _category === 'vinegars') return true;
    
    const name = String(ingredientData.name || '').toLowerCase();
    return vinegarTypes.some(vinegar => name.includes(vinegar.toLowerCase()));
  };
  
  // Helper function to get normalized category
  const getNormalizedCategory = (ingredient: unknown): string => {
    // ✅ Pattern MM-1: Safe type assertion for ingredient data
    const ingredientData = (ingredient ) as Record<string, unknown>;
    const categoryProperty = ingredientData.category;
    
    if (!categoryProperty) return 'other';
    
    const _category = String(categoryProperty || '').toLowerCase();
    
    // Map categories to our standard ones
    if (['vegetable', 'vegetables'].includes(_category)) return 'vegetables';
    if (['protein', 'meat', 'seafood', 'fish', 'poultry'].includes(_category)) return 'proteins';
    if (['herb', 'herbs', 'culinary_herb', 'medicinal_herb'].includes(_category)) return 'herbs';
    if (['spice', 'spices', 'seasoning', 'seasonings'].includes(_category)) return 'spices';
    if (['grain', 'grains', 'pasta', 'rice', 'cereal'].includes(_category)) return 'grains';
    if (['fruit', 'fruits', 'berry', 'berries'].includes(_category)) return 'fruits';
    if (['oil', 'oils', 'fat', 'fats'].includes(_category)) return 'oils';
    if (['vinegar', 'vinegars', 'acid', 'acids'].includes(_category)) return 'vinegars';
    
    return 'other';
  };
  
  // Combine and categorize all recommendations
  const combinedCategorizedRecommendations = useMemo(() => {
    // Start with empty categories
    const categories: Record<string, any[]> = {
      proteins: [],
      vegetables: [],
      grains: [],
      fruits: [],
      herbs: [],
      spices: [],
      oils: [],
      vinegars: []
    };
    
    // Helper function to normalize ingredient names for comparison
    const normalizeIngredientName = (name: string): string => {
      return name.toLowerCase()
        .replace(/atlantic |wild |farmed |fresh |frozen |organic |raw |cooked /g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Improved function for ingredient name similarity checking with fuzzy matching
    const areSimilarIngredients = (name1: string, name2: string): boolean => {
      // Normalize both names
      const normalized1 = normalizeIngredientName(name1);
      const normalized2 = normalizeIngredientName(name2);
      
      // If normalized names are identical, they're definitely similar
      if (normalized1 === normalized2) return true;
      
      // Check if one name is contained within the other
      if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        return true;
      }
      
      // Simple fuzzy matching - check if they share a significant number of characters
      const commonWords = normalized1.split(' ').filter(word => 
        word.length > 3 && normalized2.includes(word)
      );
      
      if (commonWords.length > 0) return true;
      
      // Check for plurals or slight variations
      if (normalized1.endsWith('s') && normalized2 === normalized1.slice(0, -1)) return true;
      if (normalized2.endsWith('s') && normalized1 === normalized2.slice(0, -1)) return true;
      
      // Check for common substitutions (e.g., "beef" and "beef steak")
      const ingredientPairs = [
        ['chicken', 'chicken breast', 'chicken thigh', 'chicken leg'],
        ['beef', 'beef steak', 'ground beef', 'beef chuck'],
        ['pork', 'pork chop', 'pork loin', 'pork shoulder'],
        ['salmon', 'salmon fillet', 'smoked salmon', 'fresh salmon'],
        ['tomato', 'tomatoes', 'cherry tomato', 'roma tomato'],
        ['pepper', 'bell pepper', 'sweet pepper', 'chili pepper'],
        ['rice', 'brown rice', 'white rice', 'wild rice'],
        ['olive oil', 'extra virgin olive oil', 'evoo']
      ];
      
      // Check if both names are in the same ingredient family
      for (const group of ingredientPairs) {
        if (group.some(item => normalized1.includes(item)) && 
            group.some(item => normalized2.includes(item))) {
          return true;
        }
      }
      
      return false;
    };

    // Add food recommendations first (they are already categorized)
    if (foodRecommendations && foodRecommendations.length > 0) {
      foodRecommendations.forEach(ingredient => {
        const name = ingredient.name.toLowerCase();
        
        // For seafood proteins - check first to prevent miscategorization
        if (
          name.includes('cod') || name.includes('sole') || name.includes('scallop') || 
          name.includes('salmon') || name.includes('squid') || name.includes('shrimp') || 
          name.includes('flounder') || name.includes('halibut') || name.includes('sea bass') || 
          name.includes('octopus') || name.includes('fish') || name.includes('trout') || 
          name.includes('tuna') || name.includes('crab') || name.includes('lobster')
        ) {
          categories.proteins.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Spices and seasonings
        else if (
          // Exclude common vegetable peppers
          (name.includes('pepper') && 
           !name.includes('bell pepper') && 
           !name.includes('sweet pepper') && 
           !name.includes('jalapeno') && 
           !name.includes('poblano') && 
           !name.includes('anaheim') && 
           !name.includes('banana pepper') && 
           !name.includes('chili pepper') && 
           !name.includes('paprika')) || 
          name.includes('cinnamon') || 
          name.includes('nutmeg') || 
          name.includes('cumin') || 
          name.includes('turmeric') || 
          name.includes('cardamom') ||
          name.includes('spice') || 
          name.includes('seasoning')
        ) {
          categories.spices.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Vegetable Peppers
        else if (
          name.includes('bell pepper') || 
          name.includes('sweet pepper') || 
          name.includes('jalapeno') || 
          name.includes('poblano') || 
          name.includes('anaheim') || 
          name.includes('banana pepper') || 
          name.includes('chili pepper') || 
          name.includes('paprika')
        ) {
          categories.vegetables.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Oils
        else if (isOil(ingredient as any)) {
          categories.oils.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Vinegars
        else if (isVinegar(ingredient)) {
          categories.vinegars.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Herbs
        else if (ingredient.category === 'herb' || name.includes('herb') || herbNames.some(herb => name.includes(herb.toLowerCase()))) {
          categories.herbs.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // For other ingredients, use explicit category if available
        else {
          const _category = getNormalizedCategory(ingredient);
          if (categories[_category]) {
            categories[_category].push({
              ...ingredient,
              matchScore: ingredient.score || 0.5
            });
          } else {
            if (
              name.includes('ginger') || name.includes('garlic') || name.includes('onion') || 
              name.includes('carrot') || name.includes('broccoli') || name.includes('tomato') ||
              name.includes('zucchini') || name.includes('cucumber') || name.includes('lettuce') ||
              name.includes('spinach') || name.includes('kale') || name.includes('cabbage') ||
              name.includes('cauliflower') || name.includes('celery') || name.includes('potato') ||
              name.includes('squash') || name.includes('eggplant') || name.includes('beet') ||
              name.includes('asparagus') || name.includes('artichoke') || name.includes('radish') ||
              name.includes('arugula') || name.includes('turnip') || name.includes('leek') ||
              ingredient.category?.toLowerCase() === 'vegetable' || ingredient.category?.toLowerCase() === 'vegetables'
            ) {
              categories.vegetables.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            } else if (
              name.includes('apple') || name.includes('orange') || name.includes('lemon') || 
              name.includes('melon') || name.includes('berry') || name.includes('pineapple')
            ) {
              categories.fruits.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            } else {
              // Default to vegetables for unmatched items
              categories.vegetables.push({
                ...ingredient,
                matchScore: ingredient.score || 0.5
              });
            }
          }
        }
      });
    }
    
    // Now add the astrological recommendations
    Object.entries(astroRecommendations).forEach(([_category, items]) => {
      (items ?? []).forEach(item => {
        const normalizedCategory = getNormalizedCategory(item);
        const targetCategory = normalizedCategory === 'other' ? determineCategory(item.name) : normalizedCategory;
        
        if (categories[targetCategory]) {
          // Check if this item already exists in the category (with improved duplicate detection)
          const existingItemIndex = categories[targetCategory].findIndex(
            existing => areSimilarIngredients(existing.name, item.name)
          );
          
          if (existingItemIndex >= 0) {
            // Update the existing item with better score if needed
            if (item.matchScore > categories[targetCategory][existingItemIndex].matchScore) {
              categories[targetCategory][existingItemIndex] = {
                ...item,
                category: targetCategory
              };
            }
          } else {
            // Add as a new item
            categories[targetCategory].push({
              ...item,
              category: targetCategory
            });
          }
        }
      });
    });
    
    // Ensure vinegars are always present by adding them from the collection if needed
    if (!categories.vinegars || categories.vinegars.length === 0) {
      categories.vinegars = Object.entries(vinegarsCollection).map(([key, vinegarData]) => {
        const displayName = vinegarData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return {
          name: displayName,
          type: 'vinegars',
          category: 'vinegars',
          matchScore: 0.6,
          elementalProperties: vinegarData.elementalProperties || { 
            Water: 0.4, 
            Earth: 0.3, 
            Air: 0.2, 
            Fire: 0.1 
          },
          // ✅ Pattern GG-6: Safe property access for vinegar qualities
          qualities: Array.isArray(((vinegarData as unknown) as Record<string, unknown>).qualities) ? 
            ((vinegarData as unknown) as Record<string, unknown>).qualities as string[] : 
            ['acidic', 'tangy', 'flavorful'],
          description: `${displayName} - A versatile acidic component for your culinary creations.`
        } as IngredientRecommendation;
      });
    }
    
    // Add any missing oils from the oils collection
    if (!categories.oils || categories.oils.length < 3) {
      const existingOilNames = new Set((categories.oils || []).map(oil => oil.name.toLowerCase()));
      const additionalOils = Object.entries(oilsCollection)
        .filter(([_, oilData]) => 
          !existingOilNames.has(oilData.name.toLowerCase() || '')
        )
        .slice(0, 10) // Limit to 10 additional oils
        .map(([key, oilData]) => {
          return {
            name: oilData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: 'oils',
            category: 'oils',
            matchScore: 0.6,
            elementalProperties: oilData.elementalProperties || { 
              Fire: 0.3, 
              Water: 0.2, 
              Earth: 0.3, 
              Air: 0.2 
            },
            // ✅ Pattern GG-6: Safe property access for oil qualities
            qualities: Array.isArray(((oilData as unknown) as Record<string, unknown>).qualities) ? 
              ((oilData as unknown) as Record<string, unknown>).qualities as string[] : 
              ['cooking', 'flavoring'],
            // ✅ Pattern MM-1: Safe type assertion for oil description
            description: `${oilData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${String(((oilData as unknown) as Record<string, unknown>).description || "A versatile cooking oil with various applications.")}`
          } as IngredientRecommendation;
        });
      
      categories.oils = [...(categories.oils || []), ...additionalOils]
        .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Sort each category by matchScore
    Object.keys(categories).forEach(category => {
      categories[category] = categories[category]
        .sort((a, b) => b.matchScore - a.matchScore)
        .filter(item => item.matchScore > 0);
    });
    
    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    );
  }, [foodRecommendations, astroRecommendations, herbNames, oilTypes, vinegarTypes]);
  
  // Helper function to determine the category of a food by name
  function determineCategory(name: string): string {
    const lowercaseName = name.toLowerCase();
    
    // Proteins
    if (
      lowercaseName.includes('beef') || lowercaseName.includes('chicken') || 
      lowercaseName.includes('pork') || lowercaseName.includes('lamb') || 
      lowercaseName.includes('fish') || lowercaseName.includes('seafood') ||
      lowercaseName.includes('tofu') || lowercaseName.includes('tempeh') ||
      lowercaseName.includes('seitan') || lowercaseName.includes('protein')
    ) {
      return 'proteins';
    }
    
    // Herbs
    if (
      lowercaseName.includes('basil') || lowercaseName.includes('oregano') || 
      lowercaseName.includes('thyme') || lowercaseName.includes('rosemary') || 
      lowercaseName.includes('mint') || lowercaseName.includes('cilantro') ||
      lowercaseName.includes('sage') || lowercaseName.includes('herb')
    ) {
      return 'herbs';
    }
    
    // Spices
    if (
      (lowercaseName.includes('pepper') && 
       !lowercaseName.includes('bell pepper') && 
       !lowercaseName.includes('sweet pepper') && 
       !lowercaseName.includes('jalapeno') && 
       !lowercaseName.includes('poblano') && 
       !lowercaseName.includes('anaheim') && 
       !lowercaseName.includes('banana pepper') && 
       !lowercaseName.includes('chili pepper') && 
       !lowercaseName.includes('paprika')) || 
      lowercaseName.includes('cinnamon') || 
      lowercaseName.includes('nutmeg') || 
      lowercaseName.includes('cumin') || 
      lowercaseName.includes('turmeric') || 
      lowercaseName.includes('cardamom') ||
      lowercaseName.includes('spice') || 
      lowercaseName.includes('seasoning')
    ) {
      return 'spices';
    }
    
    // Vegetable Peppers
    if (
      lowercaseName.includes('bell pepper') || 
      lowercaseName.includes('sweet pepper') || 
      lowercaseName.includes('jalapeno') || 
      lowercaseName.includes('poblano') || 
      lowercaseName.includes('anaheim') || 
      lowercaseName.includes('banana pepper') || 
      lowercaseName.includes('chili pepper') || 
      lowercaseName.includes('paprika')
    ) {
      return 'vegetables';
    }
    
    // Vinegars
    if (
      lowercaseName.includes('vinegar') || lowercaseName.includes('balsamic') || 
      lowercaseName.includes('cider') || lowercaseName.includes('rice wine') || 
      lowercaseName.includes('sherry vinegar') || lowercaseName.includes('red wine vinegar') ||
      lowercaseName.includes('white wine vinegar') || lowercaseName.includes('champagne vinegar')
    ) {
      return 'vinegars';
    }
    
    // Grains
    if (
      lowercaseName.includes('rice') || lowercaseName.includes('pasta') || 
      lowercaseName.includes('bread') || lowercaseName.includes('quinoa') || 
      lowercaseName.includes('barley') || lowercaseName.includes('oat') ||
      lowercaseName.includes('grain') || lowercaseName.includes('wheat')
    ) {
      return 'grains';
    }
    
    // Fruits
    if (
      lowercaseName.includes('apple') || lowercaseName.includes('orange') || 
      lowercaseName.includes('banana') || lowercaseName.includes('berry') || 
      lowercaseName.includes('melon') || lowercaseName.includes('pear') ||
      lowercaseName.includes('grape') || lowercaseName.includes('fruit')
    ) {
      return 'fruits';
    }
    
    // Vegetables
    if (
      lowercaseName.includes('ginger') || lowercaseName.includes('garlic') || lowercaseName.includes('onion') || 
      lowercaseName.includes('carrot') || lowercaseName.includes('broccoli') || lowercaseName.includes('tomato') ||
      lowercaseName.includes('zucchini') || lowercaseName.includes('cucumber') || lowercaseName.includes('lettuce') ||
      lowercaseName.includes('spinach') || lowercaseName.includes('kale') || lowercaseName.includes('cabbage') ||
      lowercaseName.includes('cauliflower') || lowercaseName.includes('celery') || lowercaseName.includes('potato') ||
      lowercaseName.includes('squash') || lowercaseName.includes('eggplant') || lowercaseName.includes('beet') ||
      lowercaseName.includes('asparagus') || lowercaseName.includes('artichoke') || lowercaseName.includes('radish') ||
      lowercaseName.includes('arugula') || lowercaseName.includes('turnip') || lowercaseName.includes('leek') ||
      lowercaseName.includes('vegetable')
    ) {
      return 'vegetables';
    }
    
    // Default to vegetables for anything else
    return 'vegetables';
  }
  
  // Create match score class based on percentage with enhanced visual styling
  const getMatchScoreClass = (matchScore?: number): string => {
    // Use safe score value with default
    const safeScore = typeof matchScore === 'number' && !isNaN(matchScore) ? matchScore : 0.5;
    const matchPercentage = Math.round(safeScore * 100);
    
    // Enhanced styling with gradients and more distinct ranges
    if (matchPercentage >= 95) {
      return "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white dark:from-indigo-600 dark:to-indigo-400 dark:text-white font-semibold shadow-sm";
    } else if (matchPercentage >= 90) {
      return "bg-gradient-to-r from-blue-500 to-indigo-400 text-white dark:from-blue-600 dark:to-indigo-500 dark:text-white font-semibold shadow-sm";
    } else if (matchPercentage >= 85) {
      return "bg-gradient-to-r from-blue-400 to-blue-300 text-blue-900 dark:from-blue-600 dark:to-blue-500 dark:text-blue-100 font-medium";
    } else if (matchPercentage >= 80) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-800/40 dark:text-blue-200 font-medium";
    } else if (matchPercentage >= 75) {
      return "bg-green-100 text-green-800 dark:bg-green-800/40 dark:text-green-200";
    } else if (matchPercentage >= 70) {
      return "bg-green-50 text-green-700 dark:bg-green-800/30 dark:text-green-300";
    } else if (matchPercentage >= 65) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/40 dark:text-yellow-200";
    } else if (matchPercentage >= 60) {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300";
    } else if (matchPercentage >= 50) {
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
  };

  // Format the match score for display
  const formatMatchScore = (matchScore?: number): string => {
    const safeScore = typeof matchScore === 'number' && !isNaN(matchScore) ? matchScore : 0.5;
    return `${Math.round(safeScore * 100)}%`;
  };
  
  // Render loading state if needed
  if (astroLoading || foodLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-800 dark:text-indigo-300">Loading celestial influences...</p>
        </div>
      </div>
    );
  }
  
  if (astroError || foodError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300">
        <p className="font-medium">Error: {astroError || foodError}</p>
      </div>
    );
  }
  
  // Display the recommendations
  return (
    <div className="mt-6 w-full max-w-none">
      <div className="bg-gradient-to-r from-indigo-800/10 via-purple-800/10 to-indigo-800/10 p-4 rounded-xl backdrop-blur-sm border border-indigo-100 dark:border-indigo-950 mb-6">
        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">Celestial Ingredient Recommendations</h2>
        <p className="text-indigo-700 dark:text-indigo-400 text-sm">
          Ingredients aligned with your current celestial influences for optimal alchemical harmony.
        </p>
        <p className="text-indigo-600 dark:text-indigo-500 text-xs mt-1 italic">
          Click on any ingredient card to view detailed information.
        </p>
        
        {/* Enterprise Intelligence Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEnterpriseIntelligence(!showEnterpriseIntelligence)}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded transition-colors ${
                showEnterpriseIntelligence 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Brain size={16} />
              <span>Enterprise Intelligence</span>
            </button>
          </div>
        </div>

        {/* Enterprise Intelligence Panel */}
        {showEnterpriseIntelligence && (
          <div className="mt-4">
            <EnterpriseIntelligencePanel
              recipeData={null}
              ingredientData={{ ingredients: Object.values(combinedCategorizedRecommendations).flat() }}
              astrologicalContext={{
                zodiacSign: (currentZodiac || 'aries') as any,
                lunarPhase: 'new moon' as any,
                elementalProperties: (astroState as any).elementalProperties || {
                  Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
                },
                planetaryPositions: currentPlanetaryAlignment
              }}
              className="border-t pt-4"
              showDetailedMetrics={true}
              autoAnalyze={true}
              onAnalysisComplete={(analysis) => {
                setEnterpriseIntelligenceAnalysis(analysis);
                log.info('Enterprise Intelligence Analysis completed:', {
                  overallScore: analysis.overallScore,
                  systemHealth: analysis.systemHealth
                });
              }}
            />
          </div>
        )}
        
        {/* Category navigation links */}
        <div className="flex flex-wrap justify-center gap-2 mt-4 bg-white/70 dark:bg-gray-800/70 p-2 rounded-lg shadow-sm">
          {Object.entries(combinedCategorizedRecommendations).map(([category]) => {
            const displayName = CATEGORY_DISPLAY_NAMES[category] || (category.charAt(0).toUpperCase() + category.slice(1));
            const isActive = category === activeCategory;
            
            // Define icons for each category
            let icon;
            if (category === 'proteins') icon = <Tag className="mr-1 text-rose-500" size={14} />;
            else if (category === 'vegetables') icon = <Leaf className="mr-1 text-emerald-500" size={14} />;
            else if (category === 'grains') icon = <Wind className="mr-1 text-amber-500" size={14} />;
            else if (category === 'herbs') icon = <Leaf className="mr-1 text-green-500" size={14} />;
            else if (category === 'spices') icon = <Flame className="mr-1 text-orange-500" size={14} />;
            else if (category === 'fruits') icon = <Droplets className="mr-1 text-cyan-500" size={14} />;
            else if (category === 'oils') icon = <Droplets className="mr-1 text-yellow-500" size={14} />;
            else if (category === 'vinegars') icon = <Beaker className="mr-1 text-purple-500" size={14} />;
            
            return (
              <a 
                key={`nav-${category}`}
                href={`#${category}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(category);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    handleCategorySelect(category);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-sm transition-colors duration-200 ${
                  isActive 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-300'
                }`}
              >
                {icon}
                {displayName}
              </a>
            );
          })}
        </div>
      </div>
      
      {Object.keys(combinedCategorizedRecommendations).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(combinedCategorizedRecommendations).map(([category, items]) => {
            const displayName = CATEGORY_DISPLAY_NAMES[category] || (category.charAt(0).toUpperCase() + category.slice(1));
            const displayCount = CATEGORY_DISPLAY_COUNTS[category] || 5;
            const isExpanded = expanded[category] || false;
            const itemsToShow = isExpanded ? items : items.slice(0, displayCount);
            
            return (
              <div id={category} key={category} className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 scroll-mt-16">
                <div 
                  className="flex justify-between items-center mb-3 cursor-pointer"
                  onClick={(e) => toggleCategoryExpansion(category, e)}
                >
                  <h3 className="text-lg font-semibold capitalize text-gray-800 dark:text-gray-200 flex items-center">
                    {category === 'proteins' && <Tag className="mr-2 text-rose-500" size={18} />}
                    {category === 'vegetables' && <Leaf className="mr-2 text-emerald-500" size={18} />}
                    {category === 'grains' && <Wind className="mr-2 text-amber-500" size={18} />}
                    {category === 'herbs' && <Leaf className="mr-2 text-green-500" size={18} />}
                    {category === 'spices' && <Flame className="mr-2 text-orange-500" size={18} />}
                    {category === 'fruits' && <Droplets className="mr-2 text-cyan-500" size={18} />}
                    {category === 'oils' && <Droplets className="mr-2 text-yellow-500" size={18} />}
                    {category === 'vinegars' && <Beaker className="mr-2 text-purple-500" size={18} />}
                    {displayName}
                  </h3>
                  <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                  {itemsToShow.map((item) => {
                    // Get element color class
                    const elementalProps = item.elementalProperties || {
                      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
                    };
                    
                    // Find dominant element
                    // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
                    const dominantElement = Object.entries(elementalProps)
                      .sort((a, b) => {
                        const aValue = Number(a[1]) || 0;
                        const bValue = Number(b[1]) || 0;
                        return bValue - aValue;
                      })[0][0];
                    
                    const elementColor = {
                      'Fire': 'border-red-400 bg-red-50/70 dark:bg-red-900/30',
                      'Water': 'border-blue-400 bg-blue-50/70 dark:bg-blue-900/30',
                      'Earth': 'border-green-400 bg-green-50/70 dark:bg-green-900/30',
                      'Air': 'border-purple-400 bg-purple-50/70 dark:bg-purple-900/30'
                    }[dominantElement] || 'border-gray-400 bg-gray-50/70 dark:bg-gray-900/30';
                    
                    // Find sensory properties if available
                    const defaultSeason = ['Spring', 'Summer', 'Fall', 'Winter'][Math.floor(Math.random() * 4)];
                    let seasonality;
                    
                    // Handle both string and object seasonality formats
                    if (item.seasonality) {
                      if (typeof item.seasonality === 'string') {
                        seasonality = item.seasonality;
                      } else if (typeof item.seasonality === 'object') {
                        // Handle both array and object formats
                        if (Array.isArray(item.seasonality)) {
                          seasonality = item.seasonality.join(', ');
                        } else if (item.seasonality.peak) {
                          // Handle {peak: [...], notes: string} format
                          seasonality = Array.isArray(item.seasonality.peak) 
                            ? item.seasonality.peak.join(', ')
                            : item.seasonality.peak;
                        }
                      }
                    } else {
                      seasonality = defaultSeason;
                    }
                    
                    const qualities = item.qualities || [];
                    
                    // Use the new getMatchScoreClass function
                    const matchScoreClass = getMatchScoreClass(item.matchScore);
                    
                    const isSelected = selectedIngredient?.name === item.name;
                    
                    return (
                      <div 
                        key={`${item.name}-${category}-${item.subCategory || ''}-${Math.random().toString(36).substr(2, 5)}`} 
                        className={`p-3 rounded-lg border-l-4 ${elementColor} hover:shadow-md transition-all flex flex-col ${isSelected ? 'ring-2 ring-indigo-500 shadow-md min-h-[200px] sm:col-span-2 md:col-span-2 lg:col-span-2' : 'h-full'} cursor-pointer`}
                        onClick={(e) => handleIngredientSelect(item, e)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.name}</h4>
                          <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-sm ${matchScoreClass}`}>
                            {formatMatchScore(item.matchScore)}
                          </span>
                        </div>
                        
                        {/* Quick info row */}
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1 gap-2">
                          {item.category && (
                            <span className="flex items-center">
                              <Tag size={10} className="mr-0.5" />
                              {item.category.split(' ')[0]}
                            </span>
                          )}
                          
                          {seasonality && (
                            <span className="flex items-center">
                              <Clock size={10} className="mr-0.5" />
                              {seasonality}
                            </span>
                          )}
                        </div>
                        
                        {/* Expanded view */}
                        {isSelected ? (
                          <div className="mt-2 pt-1" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                            {/* Close button */}
                            <div className="flex justify-end">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIngredient(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                                aria-label="Close details"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            
                            {/* More detailed information */}
                            <div className="mt-1 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                              {item.description && (
                                <p>{item.description}</p>
                              )}
                              
                              {item.qualities && item.qualities.length > 0 && (
                                <div>
                                  <span className="font-semibold">Qualities:</span> {item.qualities.join(', ')}
                                </div>
                              )}
                              
                              {/* Show culinary applications */}
                              {item.culinaryApplications && (
                                <div>
                                  <span className="font-semibold">Culinary Applications:</span>{' '}
                                  {Object.keys(item.culinaryApplications).slice(0, 3).join(', ')}
                                </div>
                              )}

                              {/* Show varieties if available */}
                              {item.varieties && Object.keys(item.varieties).length > 0 && (
                                <div>
                                  <span className="font-semibold">Varieties:</span>{' '}
                                  {Object.keys(item.varieties).slice(0, 3).join(', ')}
                                </div>
                              )}

                              {/* Show storage information */}
                              {item.storage && (
                                <div>
                                  <span className="font-semibold">Storage:</span>{' '}
                                  {item.storage.duration}
                                  {item.storage.temperature && typeof item.storage.temperature === 'object' && 
                                   ` at ${item.storage.temperature.fahrenheit}°F`}
                                </div>
                              )}
                              
                              {/* Show smoke point for oils */}
                              {category === 'oils' && item.smokePoint && (
                                <div>
                                  <span className="font-semibold">Smoke Point:</span> {item.smokePoint.fahrenheit}°F / {item.smokePoint.celsius}°C
                                </div>
                              )}
                              
                              {/* Show recommended culinary applications for oils */}
                              {category === 'oils' && item.culinaryApplications && (
                                <div>
                                  <span className="font-semibold">Best for:</span> {
                                    Object.entries(item.culinaryApplications)
                                      .map(([type, data]) => {
                                        if (typeof data === 'object') {
                                          // Extract data with safe property access
                                          const culinaryData = data as Record<string, unknown>;
                                          const techniques = culinaryData.techniques;
                                          if (Array.isArray(techniques)) {
                                            return techniques.slice(0, 2).join(', ');
                                          }
                                        }
                                        return type;
                                      })
                                      .filter(Boolean)
                                      .join(', ')
                                  }
                                </div>
                              )}
                              
                              {/* Show seasonal adjustments */}
                              {item.seasonalAdjustments && (
                                <div>
                                  <span className="font-semibold">Seasonal Preparations:</span>{' '}
                                  {Object.keys(item.seasonalAdjustments).join(', ')}
                                </div>
                              )}

                              {/* Show cooking time/methods for proteins */}
                              {category === 'proteins' && item.culinaryApplications && (
                                <div>
                                  <span className="font-semibold">Cooking Times:</span>{' '}
                                  {Object.entries(item.culinaryApplications).map(([method, details], index) => {
                                    let cookingTime = '';
                                    
                                    // Handle different data formats for cooking time
                                    // Extract details data with safe property access
                                    const detailsData = details as Record<string, unknown>;
                                    const timing = detailsData.timing;
                                    
                                    if (timing) {
                                      if (typeof timing === 'string') {
                                        cookingTime = timing;
                                      } else if (typeof timing === 'object') {
                                        // Extract timing properties with safe access
                                        const timingData = timing as Record<string, unknown>;
                                        const minimum = timingData.minimum;
                                        const maximum = timingData.maximum;
                                        const optimal = timingData.optimal;
                                        
                                        if (minimum && maximum) {
                                          cookingTime = `${minimum}-${maximum}`;
                                        } else if (optimal) {
                                          cookingTime = optimal as string;
                                        } else {
                                          const times = Object.values(timing).filter(t => typeof t === 'string');
                                          if (times.length) cookingTime = times.join('-');
                                        }
                                      }
                                    }
                                    
                                    return cookingTime ? (
                                      <span key={method}>
                                        {index > 0 ? ', ' : ''}
                                        {method.replace(/_/g, ' ')}: {cookingTime}
                                      </span>
                                    ) : null;
                                  }).filter(Boolean)}
                                </div>
                              )}

                              {/* Show temperature recommendations for proteins */}
                              {category === 'proteins' && item.culinaryApplications && (
                                <div>
                                  <span className="font-semibold">Cooking Temperatures:</span>{' '}
                                  {Object.entries(item.culinaryApplications).map(([method, details], index) => {
                                    let temp = '';
                                    
                                    // Handle different data formats for temperature
                                    // Extract details data with safe property access
                                    const tempDetailsData = details as Record<string, unknown>;
                                    const temperature = tempDetailsData.temperature;
                                    
                                    if (temperature) {
                                      if (typeof temperature === 'string') {
                                        temp = temperature;
                                      } else if (typeof temperature === 'object') {
                                        // Extract temperature properties with safe access
                                        const temperatureData = temperature as Record<string, unknown>;
                                        const fahrenheit = temperatureData.fahrenheit;
                                        const min = temperatureData.min;
                                        const max = temperatureData.max;
                                        const unit = temperatureData.unit;
                                        
                                        if (fahrenheit) {
                                          temp = `${fahrenheit}°F`;
                                        } else if (min && max) {
                                          temp = `${min}-${max}°${unit === 'celsius' ? 'C' : 'F'}`;
                                        }
                                      }
                                    }
                                    
                                    return temp ? (
                                      <span key={method}>
                                        {index > 0 ? ', ' : ''}
                                        {method.replace(/_/g, ' ')}: {temp}
                                      </span>
                                    ) : null;
                                  }).filter(Boolean)}
                                </div>
                              )}

                              {/* Show cuts for seafood and proteins */}
                              {item.cuts && Object.keys(item.cuts).length > 0 && (
                                <div>
                                  <span className="font-semibold">Available Cuts:</span>{' '}
                                  {Object.values(item.cuts).map(cut => {
                                    if (typeof cut === 'object') {
                                      // Extract cut data with safe property access
                                      const cutData = cut as Record<string, unknown>;
                                      const name = cutData.name;
                                      return name ? name : '';
                                    }
                                    return '';
                                  }).filter(Boolean).join(', ')}
                                </div>
                              )}

                              {/* Show health benefits */}
                              {item.healthBenefits && item.healthBenefits.length > 0 && (
                                <div>
                                  <span className="font-semibold">Health Benefits:</span>{' '}
                                  {Array.isArray(item.healthBenefits) 
                                    ? item.healthBenefits.slice(0, 2).join(', ')
                                    : typeof item.healthBenefits === 'string' ? item.healthBenefits : ''}
                                </div>
                              )}
                              
                              {/* Show thermodynamic properties for oils and other ingredients */}
                              {item.thermodynamicProperties && (
                                <div>
                                  <span className="font-semibold">Properties:</span> {
                                    Object.entries(item.thermodynamicProperties)
                                      .filter(([key]) => ['heat', 'reactivity', 'energy'].includes(key))
                                      .map(([key, value]) => `${key}: ${Math.round((Number(value) || 0) * 100)}%`)
                                      .join(', ')
                                  }
                                </div>
                              )}
                              
                              {item.culinaryUses && item.culinaryUses.length > 0 && (
                                <div>
                                  <span className="font-semibold">Uses:</span> {item.culinaryUses.join(', ')}
                                </div>
                              )}

                              {/* Show nutritional highlights if available */}
                              {item.nutritionalProfile && (
                                <div>
                                  <span className="font-semibold">Nutrition:</span>{' '}
                                  {item.nutritionalProfile.calories && `${item.nutritionalProfile.calories} cal`}
                                  {item.nutritionalProfile.macros && item.nutritionalProfile.macros.protein && 
                                   `, ${item.nutritionalProfile.macros.protein}g protein`}
                                </div>
                              )}
                              
                              {item.astrologicalProfile && item.astrologicalProfile.rulingPlanets && (
                                <div>
                                  <span className="font-semibold">Planets:</span> {item.astrologicalProfile.rulingPlanets.join(', ')}
                                </div>
                              )}
                            </div>
                            
                            {/* Elemental properties - show in expanded view */}
                            <div className="mt-2 pt-1 space-y-1">
                              <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">Elemental Balance:</div>
                              {Object.entries(elementalProps).map(([element, value]) => (
                                <div key={element} className="flex items-center text-xs">
                                  {getElementIcon(element)}
                                  <div className="flex-grow ml-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${(Number(value) || 0) * 100}%`,
                                        backgroundColor: 
                                          element === 'Fire' ? '#ff6b6b' : 
                                          element === 'Water' ? '#6bb5ff' :
                                          element === 'Earth' ? '#6bff8e' :
                                          '#d9b3ff' // Air
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-1 w-7 text-right text-gray-600 dark:text-gray-400">{Math.round((Number(value) || 0) * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Elemental properties in collapsed view */}
                            <div className="mt-2 pt-1 space-y-1">
                              {Object.entries(elementalProps).map(([element, value]) => (
                                <div key={element} className="flex items-center text-xs">
                                  {getElementIcon(element)}
                                  <div className="flex-grow ml-1 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${(Number(value) || 0) * 100}%`,
                                        backgroundColor: 
                                          element === 'Fire' ? '#ff6b6b' : 
                                          element === 'Water' ? '#6bb5ff' :
                                          element === 'Earth' ? '#6bff8e' :
                                          '#d9b3ff' // Air
                                      }}
                                    ></div>
                                  </div>
                                  <span className="ml-1 w-7 text-right text-gray-600 dark:text-gray-400">{Math.round((Number(value) || 0) * 100)}%</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Qualities tags if space allows */}
                            {qualities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {qualities.slice(0, 2).map(quality => (
                                  <span key={quality} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-[10px]">
                                    {quality}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Compact smoke point display for oils */}
                            {category === 'oils' && item.smokePoint && (
                              <div className="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Smoke Point:</span> {item.smokePoint.fahrenheit}°F
                              </div>
                            )}

                            {/* Compact cooking methods for proteins */}
                            {category === 'proteins' && item.culinaryApplications && (
                              <div className="mt-1 text-[10px] text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Cook:</span>{' '}
                                {Object.keys(item.culinaryApplications).slice(0, 2).map((method, idx) => (
                                  <span key={method}>
                                    {idx > 0 && ', '}
                                    {method.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Show more/less button */}
                  {items.length > displayCount && (
                    <div 
                      className="col-span-full flex justify-center mt-2"
                    >
                      <button 
                        onClick={(e) => toggleCategoryExpansion(category, e)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors py-1 px-3 rounded-full border border-indigo-200 dark:border-indigo-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      >
                        {isExpanded ? (
                          <span className="flex items-center">Show Less <ChevronUp size={14} className="ml-1" /></span>
                        ) : (
                          <span className="flex items-center">Show {items.length - displayCount} More <ChevronDown size={14} className="ml-1" /></span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">No recommendations available. Try refreshing your astrological data.</p>
        </div>
      )}
      
      <div className="mt-6 text-center space-y-3">
        {/* Navigation to full ingredients page - only show if not already on full page */}
        {!isFullPageVersion && (
          <button 
            className="px-5 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
            onClick={handleViewMore}
          >
            View All Ingredients <ExternalLink size={16} />
          </button>
        )}
        
        <button 
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all"
          onClick={() => window.location.reload()}
        >
          Refresh Celestial Recommendations
        </button>
      </div>
    </div>
  );
} 
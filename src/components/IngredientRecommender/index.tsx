import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, /* X, */ ChevronDown, ChevronUp, Beaker } from 'lucide-react';
// Removed unused import: X
import { useEffect, useState, useMemo } from 'react';



// Removed unused import: normalizeChakraKey
import { herbsCollection, oilsCollection, vinegarsCollection /* , grainsCollection, spicesCollection */ } from '@/data/ingredients';
// Removed unused imports: grainsCollection, spicesCollection
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
// Removed unused import: createAstrologicalBridge
// Removed unused import: CookingMethod
import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations, IngredientRecommendation } from '@/utils/ingredientRecommender';



import styles from './IngredientRecommender.module.css';

// Extended IngredientRecommendation interface to handle missing properties
interface ExtendedIngredientRecommendation extends IngredientRecommendation {
  culinaryApplications?: Record<string, {
    notes?: string[];
    techniques?: string[];
  }>;
  pairings?: string[] | Record<string, string[]>;
  nutritionalHighlights?: Record<string, string | number>;
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

// Update display count for more balanced presentation
const CATEGORY_DISPLAY_COUNTS: Record<string, number> = {
  proteins: 8,
  vegetables: 8,
  fruits: 8,
  grains: 8,
  herbs: 8,
  spices: 12,
  seasonings: 8,
  oils: 6,
  vinegars: 6
};

// Define the ordered categories for display 
const ORDERED_CATEGORIES = [
  'proteins',
  'vegetables',
  'fruits',
  'grains',
  'herbs',
  'spices',
  'seasonings',
  'oils',
  'vinegars'
];

export default function IngredientRecommender() {
  // Use the hook to get astrological data
  const astroState = useAstrologicalState();
  const { 
    currentZodiac, 
    currentPlanetaryAlignment, 
    loading: astroLoading, 
    isDaytime // Used for time-based ingredient recommendations 
  } = astroState;
  
  // Note: chakraEnergies are not available from useAstrologicalState
  // We'll rely on the useChakraInfluencedFood hook for chakra-based recommendations
  const contextChakraEnergies = null; // Not available from this hook
  const planetaryPositions = currentPlanetaryAlignment;
  const astroError = null; // Hook doesn't expose error state
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [selectedIngredient, setSelectedIngredient] = useState<ExtendedIngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  const [showAll, setShowAll] = useState<boolean>(false);
  // Removed unused state: combinedCategorizedState, setCombinedCategorizedState
  
  // Use the custom hook for food recommendations
  const { 
    recommendations: foodRecommendations, 
    chakraEnergies, // Used for chakra-based ingredient filtering
    loading: foodLoading, // Used for loading state display
    error: foodError, // Used for error handling display
    refreshRecommendations // Used for refresh functionality
  } = useChakraInfluencedFood({ limit: 300 }); // Increased from 200 to 300 to ensure all categories have plenty of items

  // Handle category filter
  const handleCategoryFilter = (_category: string) => {
    setActiveCategory(_category);
  };
  
  // Helper function to get element icon
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
  
  // Get background gradient for element
  const getElementGradient = (element: string) => {
    switch (element) {
      case 'Fire': return 'rgba(255, 107, 107, 0.05)';
      case 'Water': return 'rgba(107, 181, 255, 0.05)';
      case 'Earth': return 'rgba(107, 255, 142, 0.05)';
      case 'Air': return 'rgba(217, 179, 255, 0.05)';
      default: return 'rgba(229, 231, 235, 0.05)';
    }
  };
  
  // Get border color for element
  const getElementBorderColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'rgba(255, 107, 107, 0.6)';
      case 'Water': return 'rgba(107, 181, 255, 0.6)';
      case 'Earth': return 'rgba(107, 255, 142, 0.6)';
      case 'Air': return 'rgba(217, 179, 255, 0.6)';
      default: return 'rgba(229, 231, 235, 0.6)';
    }
  };
  
  // Handle ingredient selection to display details
  const handleIngredientSelect = (item: unknown, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent event bubbling
    
    setSelectedIngredient(prevSelected => {
      // If the same item is clicked, toggle it off (set to null)
      if (prevSelected?.name === (item as ExtendedIngredientRecommendation).name) {
        return null;
      }
      // Otherwise, select the new item
      return item as ExtendedIngredientRecommendation;
    });
  };
  
  // Toggle expansion for a category
  const toggleCategoryExpansion = (_category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [_category]: !prev[_category]
    }));
  };
  
  // Toggle show all ingredients
  const toggleShowAll = () => {
    setShowAll(prev => !prev);
  };
  
  // Reset selected ingredient when recommendations change
  useEffect(() => {
    setSelectedIngredient(null);
  }, [astroRecommendations, foodRecommendations]);
  
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
    
    const name = String(ingredient.name).toLowerCase();
    return oilTypes.some(oil => name.includes(oil.toLowerCase()));
  };
  
  // Helper function to check if an ingredient is a vinegar
  const isVinegar = (ingredient: Ingredient | UnifiedIngredient): boolean => {
    const _category = ingredient.category.toLowerCase() || '';
    if (_category === 'vinegar' || _category === 'vinegars') return true;
    
    const name = String(ingredient.name).toLowerCase();
    return vinegarTypes.some(vinegar => name.includes(vinegar.toLowerCase()));
  };
  
  // Helper function to get normalized category
  const getNormalizedCategory = (ingredient: Ingredient | UnifiedIngredient): string => {
    if (!ingredient.category) return 'other';
    
    const _category = ingredient.category.toLowerCase();
    
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
  
  // Improved: Update the ingredient recommendation filtering to remove duplicates
  const getUniqueRecommendations = (recommendations: IngredientRecommendation[]): IngredientRecommendation[] => {
    const uniqueMap = new Map<string, IngredientRecommendation>();
    const spiceVariationMap = new Map<string, IngredientRecommendation[]>();
    const spiceBaseNames = new Map<string, string[]>();
    
    // Define base names for common spices to group variations
    spiceBaseNames.set('cumin', ['cumin', 'ground cumin', 'cumin seed', 'cumin powder', 'whole cumin']);
    spiceBaseNames.set('cinnamon', ['cinnamon', 'ground cinnamon', 'cinnamon stick', 'cinnamon powder', 'ceylon cinnamon']);
    spiceBaseNames.set('pepper', ['black pepper', 'white pepper', 'green pepper', 'pink pepper', 'ground pepper', 'pepper powder', 'peppercorn']);
    spiceBaseNames.set('cardamom', ['cardamom', 'green cardamom', 'black cardamom', 'ground cardamom', 'cardamom pod']);
    spiceBaseNames.set('chili', ['chili', 'chili powder', 'red chili', 'dried chili', 'chili flake']);
    spiceBaseNames.set('paprika', ['paprika', 'sweet paprika', 'hot paprika', 'smoked paprika']);
    
    // First pass - identify spices/seasonings and group them by base name
    recommendations.forEach(item => {
      const _category = categorizeIngredient(item as unknown as Ingredient | UnifiedIngredient);
      const normalizedName = String(item.name).toLowerCase().trim();
      
      // Special handling for spices and seasonings
      if (_category === 'spices' || _category === 'seasonings') {
        // Try to find a base spice name that matches this item
        let baseNameFound = false;
        
        // Check if this spice matches any of our base name groups
        for (const [baseName, variations] of spiceBaseNames.entries()) {
          if (variations.some(v => normalizedName.includes(v))) {
            // This is a variation of a known spice, add it to that group
            if (!spiceVariationMap.has(baseName)) {
              spiceVariationMap.set(baseName, []);
            }
            spiceVariationMap.get(baseName)?.push(item);
            baseNameFound = true;
            break;
          }
        }
        
        // If no base name was found, treat it as its own unique spice
        if (!baseNameFound) {
          if (!spiceVariationMap.has(normalizedName)) {
            spiceVariationMap.set(normalizedName, []);
          }
          spiceVariationMap.get(normalizedName)?.push(item);
        }
      } else {
        // For non-spice categories, keep only the highest scoring duplicate
        const existingItem = uniqueMap.get(normalizedName);
        if (!existingItem || (existingItem ).matchScore < (item ).matchScore) {
          uniqueMap.set(normalizedName, item);
        }
      }
    });
    
    // Second pass - select the best variation for each spice group
    spiceVariationMap.forEach((variations, spiceKey) => {
      // Sort by match score
      variations.sort((a, b) => b.matchScore - a.matchScore);
      
      // Take the top variation from each group
      if (variations.length > 0) {
        // Use the actual name as the key to avoid overwriting
        uniqueMap.set(variations[0].name.toLowerCase(), variations[0]);
        
        // If this is a big group with multiple variations, maybe take a second one too
        if (variations.length > 2 && spiceKey !== 'cumin') { // Avoid multiple cumins
          uniqueMap.set(variations[1].name.toLowerCase(), variations[1]);
        }
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  // Improved: Ensure all ingredients are categorized properly
  const categorizeIngredient = (ingredient: Ingredient | UnifiedIngredient): string => {
    // Normalize the name for consistent checking
    const name = String(ingredient.name).toLowerCase().trim();
    
    // First check for explicit category
    if (ingredient.category) {
      const _category = ingredient.category.toLowerCase();
      
      // Handle specific category mappings
      if (['protein', 'meat', 'egg', 'dairy', 'plant_based', 'seafood', 'poultry'].includes(_category)) {
        return 'proteins';
      }
      
      if (['culinary_herb', 'medicinal_herb', 'herb', 'herbs'].includes(_category)) {
        return 'herbs';
      }
      
      if (['spice', 'spices'].includes(_category)) {
        return 'spices';
      }
      
      if (['seasoning', 'seasonings'].includes(_category)) {
        return 'seasonings';
      }
      
      if (['vegetable', 'vegetables'].includes(_category)) {
        return 'vegetables';
      }
      
      if (['fruit', 'fruits'].includes(_category)) {
        return 'fruits';
      }
      
      if (['grain', 'grains', 'cereal', 'cereals', 'pasta', 'rice'].includes(_category)) {
        return 'grains';
      }
      
      if (['oil', 'oils', 'fat', 'fats'].includes(_category)) {
        return 'oils';
      }
      
      if (['vinegar', 'vinegars', 'acid', 'acids'].includes(_category)) {
        return 'vinegars';
      }
    }
    
    // Check if it's an oil by name
    if (isOil(ingredient)) {
      return 'oils';
    }
    
    // Check if it's a vinegar by name
    if (isVinegar(ingredient)) {
      return 'vinegars';
    }
    
    // Check for known herb names
    if (herbNames.some(herb => name.includes(herb.toLowerCase()))) {
      return 'herbs';
    }
      
    // Known spices list for more accurate categorization
    const knownSpices = [
      'pepper', 'cinnamon', 'nutmeg', 'cumin', 'turmeric', 'cardamom',
      'clove', 'allspice', 'paprika', 'coriander', 'fennel', 'oregano',
      'thyme', 'basil', 'sage', 'marjoram', 'cayenne', 'chile', 
      'chili', 'curry', 'garam masala', 'five spice', 'star anise',
      'bay leaf', 'caraway', 'fenugreek', 'sumac', 'saffron', 'vanilla',
      'za\'atar', 'mustard', 'pepper', 'peppercorn'
    ];
    
    // Check for spices but exclude common vegetables that might include "pepper"
    if (knownSpices.some(spice => name.includes(spice)) &&
        !name.includes('bell pepper') && 
        !name.includes('sweet pepper') && 
        !name.includes('chili pepper') &&
        !name.includes('jalapeno') && 
        !name.includes('poblano') && 
        !name.includes('anaheim') && 
        !name.includes('banana pepper')) {
      
      // Differentiate between spice blends and individual spices
      if (name.includes('blend') || 
          name.includes('mix') ||
          name.includes('seasoning') ||
          name.includes('rub') ||
          name.includes('masala')) {
        return 'seasonings';
      }
      return 'spices';
    }
      
    // Known fruits list
    const knownFruits = [
      'apple', 'orange', 'banana', 'berry', 'strawberry', 'blueberry',
      'raspberry', 'blackberry', 'melon', 'watermelon', 'cantaloupe',
      'pear', 'grape', 'kiwi', 'mango', 'papaya', 'pineapple', 'peach',
      'plum', 'apricot', 'cherry', 'fig', 'lemon', 'lime', 'grapefruit',
      'avocado', 'coconut', 'date', 'pomegranate', 'persimmon'
    ];
    
    // Check for fruits
    if (knownFruits.some(fruit => name.includes(fruit)) || 
        name.includes('fruit')) {
      return 'fruits';
    }
    
    // Known vegetables list
    const knownVegetables = [
      'carrot', 'broccoli', 'cauliflower', 'spinach', 'kale', 'lettuce',
      'cabbage', 'onion', 'garlic', 'leek', 'shallot', 'asparagus',
      'zucchini', 'cucumber', 'eggplant', 'bell pepper', 'sweet pepper',
      'tomato', 'potato', 'sweet potato', 'yam', 'beet', 'radish',
      'turnip', 'rutabaga', 'celery', 'fennel', 'artichoke', 'brussels sprout',
      'mushroom', 'pea', 'green bean', 'corn', 'squash'
    ];
    
    // Check for vegetables
    if (knownVegetables.some(vegetable => name.includes(vegetable)) || 
        name.includes('vegetable')) {
      return 'vegetables';
    }
    
    // Known grains list
    const knownGrains = [
      'rice', 'pasta', 'bread', 'quinoa', 'barley', 'oat', 'oatmeal',
      'wheat', 'corn', 'cornmeal', 'polenta', 'flour', 'cereal',
      'bulgur', 'couscous', 'farro', 'amaranth', 'buckwheat', 'spelt',
      'millet', 'rye', 'noodle'
    ];
    
    // Check for grains
    if (knownGrains.some(grain => name.includes(grain)) || 
        name.includes('grain')) {
      return 'grains';
    }
    
    // Known proteins list
    const knownProteins = [
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'goose',
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'crab',
      'lobster', 'scallop', 'clam', 'mussel', 'oyster', 'tofu', 'tempeh',
      'seitan', 'bean', 'lentil', 'chickpea', 'edamame', 'egg', 'cheese',
      'yogurt', 'milk', 'dairy'
    ];
    
    // Check for proteins
    if (knownProteins.some(protein => name.includes(protein)) || 
        name.includes('protein')) {
      return 'proteins';
    }
    
    // Default category based on dominant element if available
    if (ingredient.elementalProperties) {
      // Pattern KK-1: Safe arithmetic comparison with type validation
      const dominantElement = Object.entries(ingredient.elementalProperties)
        .sort(([, a], [, b]) => {
          const numericA = typeof a === 'number' ? a : 0;
          const numericB = typeof b === 'number' ? b : 0;
          return numericB - numericA;
        })[0][0];
        
      switch (dominantElement) {
        case 'Fire': return 'spices';
        case 'Water': return 'vegetables';
        case 'Earth': return 'grains';
        case 'Air': return 'herbs';
        default: return 'vegetables';
      }
    }
    
    // Final fallback
    return 'vegetables';
  };
  
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
        activePlanets: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
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
          uniqueItems.set(String(item.name), item);
        });
        
        // Add standard items that aren't already included
        standardItems.forEach(item => {
          if (!uniqueItems.has(item.name)) {
            uniqueItems.set(String(item.name), item);
          }
        });
        
        // Convert back to array and limit to prevent overwhelming the user
        mergedRecommendations[_category] = Array.from(uniqueItems.values()).slice(0, 32);
      });
      
      setAstroRecommendations(mergedRecommendations);
    }
  }, [astroLoading, contextChakraEnergies, planetaryPositions, astroError, currentZodiac]);
  
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
    
    // Add food recommendations first (they are already categorized)
    if (foodRecommendations && foodRecommendations.length > 0) {
      foodRecommendations.forEach(ingredient => {
        const name = String(ingredient.name).toLowerCase();
        
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
        else if (isOil(ingredient as UnifiedIngredient | Ingredient)) {
          categories.oils.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // Vinegars
        else if (isVinegar(ingredient as UnifiedIngredient | Ingredient)) {
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
          const _category = getNormalizedCategory(ingredient as unknown as Ingredient | UnifiedIngredient);
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
        const normalizedCategory = getNormalizedCategory(item as unknown as Ingredient | UnifiedIngredient);
        const targetCategory = normalizedCategory === 'other' ? determineCategory(String(item.name)) : normalizedCategory;
        
        if (categories[targetCategory]) {
          // Check if this item already exists in the category
          const existingItemIndex = categories[targetCategory].findIndex(
            existing => String(existing.name).toLowerCase() === String(item.name).toLowerCase()
          );
          
          if (existingItemIndex >= 0) {
            // Update the existing item with better score if needed
            if ((item ).matchScore > categories[targetCategory][existingItemIndex].matchScore) {
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
          qualities: (vinegarData as unknown as Record<string, unknown>).qualities as string[] || ['acidic', 'tangy', 'flavorful'],
          description: `${displayName} - A versatile acidic component for your culinary creations.`
        } as IngredientRecommendation;
      });
    }
    
    // Add any missing oils from the oils collection
    if (!categories.oils || categories.oils.length < 3) {
      const existingOilNames = new Set((categories.oils || []).map(oil => oil?.name?.toLowerCase()));
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
            qualities: (oilData as unknown as Record<string, unknown>).qualities as string[] || ['cooking', 'flavoring'],
            description: `${oilData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${(oilData as unknown as Record<string, unknown>).description as string || "A versatile cooking oil with various applications."}`
          } as IngredientRecommendation;
        });
      
      categories.oils = [...(categories.oils || []), ...additionalOils]
        .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Apply the getUniqueRecommendations function to each category to remove duplicates
    Object.keys(categories).forEach(category => {
      // First sort by matchScore
      categories[category] = categories[category]
        .sort((a, b) => b.matchScore - a.matchScore);
      
      // Then apply the unique filter if needed
      if (category === 'spices' || category === 'seasonings') {
        categories[category] = getUniqueRecommendations(categories[category] as IngredientRecommendation[]);
      } else {
        // For other categories, filter duplicates by name
        const uniqueMap = new Map<string, IngredientRecommendation>();
        categories[category].forEach(item => {
          const normalizedName = String(item.name).toLowerCase().trim();
          if (!uniqueMap.has(normalizedName) || item.matchScore > (uniqueMap.get(normalizedName)?.matchScore || 0)) {
            uniqueMap.set(normalizedName, item);
          }
        });
        categories[category] = Array.from(uniqueMap.values());
      }
      
      // Filter out items with very low match scores
      categories[category] = categories[category].filter(item => item.matchScore > 0);
    });
    
    // Filter out empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    );
  }, [foodRecommendations, astroRecommendations, herbNames, oilTypes, vinegarTypes]);
  
  // Render ingredient details when selected
  const renderIngredientDetails = (item: unknown) => {
    const itemData = item as Record<string, unknown>;
    return (
      <div className={styles.ingredientDetails}>
        {String(/* Description if available */)}
        {Boolean(itemData.description) && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              About {String(itemData.name)}:
            </h4>
            <p style={{ 
              margin: '0 0 0.75rem 0',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              color: '#4b5563'
            }}>
              {String(itemData.description)}
            </p>
          </div>
        )}
        
        {/* Elemental Properties with improved visualization */}
        {Boolean(itemData.elementalProperties) && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              <Beaker size={16} /> Elemental Properties
            </h4>
            <div className={styles.elementPropertiesGrid}>
              {Object.entries(itemData.elementalProperties as Record<string, unknown>)
                .sort(([, a], [, b]) => {
                  // Pattern KK-1: Safe arithmetic comparison with type validation
                  const numericA = typeof a === 'number&apos; ? a : 0;
                  const numericB = typeof b === 'number&apos; ? b : 0;
                  return numericB - numericA;
                })
                .map(([element, value]) => {
                  // Calculate width for progress bar (25% minimum width)
                  // Pattern KK-9: Cross-Module Arithmetic Safety for UI calculations
                  const numericValue = Number(value) || 0;
                  const barWidth = Math.max(25, Math.round(numericValue * 100));
                  return (
                    <div 
                      key={element} 
                      className={styles.elementProperty} 
                      style={{ 
                        backgroundColor: getElementGradient(element) 
                      }}
                    >
                      <div className={styles.elementLabel}>
                        {getElementIcon(element)}
                        <span style={{ marginLeft: '0.25rem' }}>{element}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ 
                            width: `${barWidth}%`,
                            backgroundColor: getElementBorderColor(element)
                          }} 
                        />
                      </div>
                      <div className={styles.progressValue}>
                        {Math.round(numericValue * 100)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        
        {/* Culinary Applications with improved structure */}
        {Boolean((item as ExtendedIngredientRecommendation).culinaryApplications) && Object.keys((item as ExtendedIngredientRecommendation).culinaryApplications || {}).length > 0 && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              <Leaf size={16} /> Culinary Applications
            </h4>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries((item as ExtendedIngredientRecommendation).culinaryApplications || {}).map(([method, details]) => {
                const detailsData = details as Record<string, unknown>;
                return (
                  <div key={method} style={{
                    border: '1px solid rgba(229, 231, 235, 0.8)',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(249, 250, 251, 0.5)'
                  }}>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '0.25rem',
                      fontSize: '0.9rem',
                      color: '#374151'
                    }}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </div>
                    {(detailsData.notes && Array.isArray(detailsData.notes) && detailsData.notes.length > 0) ? (
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: '#4b5563',
                        lineHeight: '1.4' 
                      }}>
                        {detailsData.notes[0]}
                      </div>
                    ) : null}
                    {(detailsData.techniques && Array.isArray(detailsData.techniques) && detailsData.techniques.length > 0) ? (
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: '#6b7280',
                        marginTop: '0.5rem' 
                      }}>
                        <strong>Techniques:</strong> {detailsData.techniques.join(', ')}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {(item as ExtendedIngredientRecommendation).pairings ? (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              <Tag size={16} /> Pairs Well With
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {Array.isArray((item as ExtendedIngredientRecommendation).pairings) 
                ? ((item as ExtendedIngredientRecommendation).pairings as string[]).slice(0, 10).map(pairing => (
                    <span key={pairing} style={{ 
                      backgroundColor: 'rgba(167, 139, 250, 0.1)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      color: '#5b21b6',
                      border: '1px solid rgba(167, 139, 250, 0.2)'
                    }}>
                      {pairing}
                    </span>
                  ))
                : Object.keys(((item as ExtendedIngredientRecommendation).pairings as unknown as Record<string, unknown>) || {}).slice(0, 10).map(pairing => (
                    <span key={pairing} style={{ 
                      backgroundColor: 'rgba(167, 139, 250, 0.1)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      color: '#5b21b6',
                      border: '1px solid rgba(167, 139, 250, 0.2)'
                    }}>
                      {pairing}
                    </span>
                  ))
              }
            </div>
          </div>
        ) : null}
        
        {/* Nutritional Highlights if available */}
        {(item as ExtendedIngredientRecommendation).nutritionalHighlights && Object.keys((item as ExtendedIngredientRecommendation).nutritionalHighlights || {}).length > 0 && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              <Info size={16} /> Nutritional Highlights
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              {Object.entries((item as ExtendedIngredientRecommendation).nutritionalHighlights || {}).map(([nutrient, value]) => (
                <div key={nutrient} style={{ 
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'rgba(249, 250, 251, 0.8)',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  minWidth: '120px',
                  flex: '1'
                }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                  </div>
                  <div style={{ color: '#4b5563', marginTop: '0.25rem' }}>
                    {typeof value === 'string' ? value : 
                     typeof value === 'number' ? `${value}mg` : 
                     JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Astrological Profile with improved styling */}
        {(item as Record<string, unknown>).astrologicalProfile && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>
              <Clock size={16} /> Astrological Influence
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(243, 244, 246, 0.6)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              border: '1px solid rgba(229, 231, 235, 0.8)'
            }}>
              {(((item as Record<string, unknown>).astrologicalProfile as Record<string, unknown>).rulingPlanets) ? (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', width: '140px', color: '#4b5563' }}>Planetary influence: </span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>
                    {(((item as Record<string, unknown>).astrologicalProfile as Record<string, unknown>).rulingPlanets as string[]).join(', ')}
                  </span>
                </div>
              ) : null}
              
              {(((item as Record<string, unknown>).astrologicalProfile as Record<string, unknown>).favorableZodiac) ? (
                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', width: '140px', color: '#4b5563' }}>Favorable zodiac: </span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>
                    {(((item as Record<string, unknown>).astrologicalProfile as Record<string, unknown>).favorableZodiac as string[]).map((sign: string) => 
                      sign.charAt(0).toUpperCase() + sign.slice(1)
                    ).join(', ')}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Modified ingredient card rendering function to use in both views
  const renderIngredientCard = (item: unknown) => {
    const itemData = item as Record<string, unknown>;
    
    // Get dominant element for styling
    // Pattern KK-9: Cross-Module Arithmetic Safety for sort operations
    const dominantElement = Object.entries((itemData.elementalProperties as Record<string, unknown>) || {})
      .sort(([, a], [, b]) => {
        const numericA = Number(a) || 0;
        const numericB = Number(b) || 0;
        return numericB - numericA;
      })[0]?.[0] || 'Fire';
    
    // Check if this card is selected
    const isSelected = selectedIngredient?.name === String(itemData.name);
    
    return (
      <div
        key={String(itemData.name)}
        className={styles.ingredientCard}
        style={{
          borderTop: `3px solid ${getElementBorderColor(dominantElement)}`,
          // Add subtle highlight if selected
          boxShadow: isSelected ? 
            `0 0 0 2px ${getElementBorderColor(dominantElement)}, 0 4px 12px rgba(0, 0, 0, 0.1)` : 
            undefined
        }}
      >
        <div className={styles.cardContent}>
          <div className={styles.nameRow}>
            {getElementIcon(dominantElement)}
            <h3 className={styles.ingredientName}>
              {String(itemData.name)}
            </h3>
          </div>
          
          <div className={styles.matchScore}>
            Match: {Math.round((Number(itemData.matchScore) || 0) * 100)}%
          </div>
          
          {(itemData.qualities && (itemData.qualities as unknown[]).length > 0) ? (
            <div className={styles.qualitiesList}>
              {(itemData.qualities as unknown[]).slice(0, 3).map((quality) => (
                <span key={String(quality)} className={styles.qualityTag}>
                  {String(quality)}
                </span>
              ))}
            </div>
          ) : null}
          
          <button
            className={`${styles.detailsButton} ${isSelected ? styles.detailsButtonActive : ''}`}
            onClick={(e) => handleIngredientSelect(item, e)}
          >
            {isSelected ? 'Hide Details&apos; : 'View Details&apos;}
          </button>
          
          {isSelected && renderIngredientDetails(item)}
        </div>
      </div>
    );
  };
  
  // Error and loading state displays (enterprise pattern)
  if (foodError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Error loading recommendations. 
          <button onClick={refreshRecommendations}>Retry</button>
        </div>
      </div>
    );
  }

  if (foodLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading ingredient recommendations...</div>
      </div>
    );
  }

  // JSX rendering
  return (
    <div className={styles.container} data-time-of-day={isDaytime ? 'day' : 'night'}>
      <div className={styles.innerContainer}>
        <h1 className={styles.title}>
          Celestial Ingredient Recommendations
        </h1>
        
        {/* Chakra energy indicator */}
        {chakraEnergies &amp;&amp; (
          <div className={styles.chakraIndicator}>
            <div>Chakra Balance: {Object.keys(chakraEnergies).length} energies active</div>
          </div>
        )}
        
        {showAll ? (
          <div>
            {ORDERED_CATEGORIES
              .filter(category => Object.keys(combinedCategorizedRecommendations).includes(category))
              .map(category => (
                <div key={category}>
                  <div
                    className={styles.categoryHeader}
                    onClick={(e) => toggleCategoryExpansion(category, e)}
                  >
                    <h2 className={styles.categoryTitle}>
                      {CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                    </h2>
                    <span style={{ marginLeft: 'auto' }}>
                      {expanded[category] ? '▼' : '►'}
                    </span>
                  </div>
                  
                  {expanded[category] && (
                    <div className={styles.categoryGrid}>
                      {combinedCategorizedRecommendations[category].slice(0, CATEGORY_DISPLAY_COUNTS[category] || 8).map((item) => {
                        return renderIngredientCard(item);
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <>
            <div>
              {/* Display only the active category when not showing all */}
              {combinedCategorizedRecommendations[activeCategory] && (
                <div>
                  <div className={styles.categoryHeader}>
                    <h2 className={styles.categoryTitle}>
                      {CATEGORY_DISPLAY_NAMES[activeCategory] || activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
                    </h2>
                  </div>
                  
                  <div className={styles.categoryGrid}>
                    {combinedCategorizedRecommendations[activeCategory]
                      .slice(0, CATEGORY_DISPLAY_COUNTS[activeCategory] || 8)
                      .map((item) => renderIngredientCard(item))}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                className={styles.showAllButton}
                onClick={toggleShowAll}
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    View all {Object.values(combinedCategorizedRecommendations).reduce((total, category) => total + category.length, 0)} ingredients
                  </>
                )}
              </button>
            </div>
          </>
        )}
        
        <div className={styles.filters}>
          <h3 className={styles.filterHeading}>Filter by category:</h3>
          <div className={styles.categoryFilters}>
            <div className={styles.categoryFilterRow}>
              {ORDERED_CATEGORIES.slice(0, 3).map(category => (
                Object.keys(combinedCategorizedRecommendations).includes(category) &amp;&amp; (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${activeCategory === category ? styles.activeCategory : ''}`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )
              ))}
            </div>
            <div className={styles.categoryFilterRow}>
              {ORDERED_CATEGORIES.slice(3, 6).map(category => (
                Object.keys(combinedCategorizedRecommendations).includes(category) &amp;&amp; (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${activeCategory === category ? styles.activeCategory : ''}`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )
              ))}
            </div>
            <div className={styles.categoryFilterRow}>
              {ORDERED_CATEGORIES.slice(6).map(category => (
                Object.keys(combinedCategorizedRecommendations).includes(category) &amp;&amp; (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${activeCategory === category ? styles.activeCategory : ''}`}
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {CATEGORY_DISPLAY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
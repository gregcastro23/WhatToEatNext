import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState, useMemo } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties } from '@/types/alchemy';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations, IngredientRecommendation } from '@/utils/ingredientRecommender';
import { Flame, Droplets, Mountain, Wind, Info, Clock, Tag, Leaf, X, ChevronDown, ChevronUp, Beaker } from 'lucide-react';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import { normalizeChakraKey } from '@/constants/chakraSymbols';
import { herbsCollection, oilsCollection, vinegarsCollection, grainsCollection, spicesCollection } from '@/data/ingredients';

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

// Using inline styles to avoid CSS module conflicts
export default function IngredientRecommender() {
  // Use the context to get astrological data including chakra energies
  const { chakraEnergies: contextChakraEnergies, planetaryPositions, isLoading: astroLoading, error: astroError, currentZodiac } = useAstrologicalState();
  const [astroRecommendations, setAstroRecommendations] = useState<GroupedIngredientRecommendations>({});
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientRecommendation | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('proteins');
  const [showAll, setShowAll] = useState<boolean>(false);
  const [combinedCategorizedRecommendations, setCombinedCategorizedRecommendations] = useState<Record<string, IngredientRecommendation[]>>({});
  
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
  
  // Get background gradient for element
  const getElementGradient = (element: string) => {
    switch (element) {
      case 'Fire': return 'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%)';
      case 'Water': return 'linear-gradient(135deg, rgba(107, 181, 255, 0.15) 0%, rgba(107, 181, 255, 0.05) 100%)';
      case 'Earth': return 'linear-gradient(135deg, rgba(107, 255, 142, 0.15) 0%, rgba(107, 255, 142, 0.05) 100%)';
      case 'Air': return 'linear-gradient(135deg, rgba(217, 179, 255, 0.15) 0%, rgba(217, 179, 255, 0.05) 100%)';
      default: return 'linear-gradient(135deg, rgba(229, 231, 235, 0.15) 0%, rgba(229, 231, 235, 0.05) 100%)';
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
  const handleIngredientSelect = (item: IngredientRecommendation, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Prevent event bubbling
    
    setSelectedIngredient(prevSelected => {
      // If the same item is clicked, toggle it off (set to null)
      if (prevSelected?.name === item.name) {
        return null;
      }
      // Otherwise, select the new item
      return item;
    });
  };
  
  // Toggle expansion for a category
  const toggleCategoryExpansion = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
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
      const standardRecommendations = getIngredientRecommendations(astroState, { limit: 40 });
      
      // Merge the recommendations, prioritizing chakra-based ones
      const mergedRecommendations: GroupedIngredientRecommendations = {};
      
      // Process all categories
      const allCategories = new Set([
        ...Object.keys(chakraRecommendations),
        ...Object.keys(standardRecommendations)
      ]);
      
      allCategories.forEach(category => {
        const chakraItems = chakraRecommendations[category] || [];
        const standardItems = standardRecommendations[category] || [];
        
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
        mergedRecommendations[category] = Array.from(uniqueItems.values()).slice(0, 32);
      });
      
      setAstroRecommendations(mergedRecommendations);
    }
  }, [astroLoading, contextChakraEnergies, planetaryPositions, astroError, currentZodiac]);
  
  // Define herb names to improve herb detection
  const herbNames = useMemo(() => {
    try {
      const keys = Object.keys(herbsCollection || {});
      return keys.filter(key => typeof key === 'string' && key.length > 0);
    } catch (error) {
      console.warn('Error loading herb names:', error);
      return [];
    }
  }, []);
  
  // Define oil types for better oil detection
  const oilTypes = useMemo(() => {
    try {
      const baseOils = Object.keys(oilsCollection || {}).filter(key => typeof key === 'string');
      const additionalOils = [
        'oil', 'olive oil', 'vegetable oil', 'sunflower oil', 'sesame oil', 'coconut oil',
        'avocado oil', 'walnut oil', 'peanut oil', 'grapeseed oil', 'canola oil'
      ];
      return [...baseOils, ...additionalOils];
    } catch (error) {
      console.warn('Error loading oil types:', error);
      return ['oil', 'olive oil', 'vegetable oil'];
    }
  }, []);
  
  // Define vinegar types for better vinegar detection
  const vinegarTypes = useMemo(() => {
    try {
      const baseVinegars = Object.keys(vinegarsCollection || {}).filter(key => typeof key === 'string');
      const additionalVinegars = [
        'vinegar', 'balsamic vinegar', 'apple cider vinegar', 'rice vinegar', 'red wine vinegar',
        'white wine vinegar', 'champagne vinegar', 'sherry vinegar', 'malt vinegar', 
        'distilled vinegar', 'black vinegar', 'rice wine vinegar', 'white balsamic',
        'balsamic glaze', 'raspberry vinegar', 'fig vinegar', 'coconut vinegar'
      ];
      return [...baseVinegars, ...additionalVinegars];
    } catch (error) {
      console.warn('Error loading vinegar types:', error);
      return ['vinegar', 'balsamic vinegar', 'apple cider vinegar'];
    }
  }, []);
  
  // Helper function to check if an ingredient is an oil
  const isOil = (ingredient: IngredientRecommendation): boolean => {
    const category = ingredient.category?.toLowerCase() || '';
    if (category === 'oil' || category === 'oils') return true;
    
    const name = ingredient.name.toLowerCase();
    return oilTypes.some(oil => typeof oil === 'string' && name.includes(oil.toLowerCase()));
  };
  
  // Helper function to check if an ingredient is a vinegar
  const isVinegar = (ingredient: any): boolean => {
    const category = ingredient.category?.toLowerCase() || '';
    if (category === 'vinegar' || category === 'vinegars') return true;
    
    const name = ingredient.name.toLowerCase();
    return vinegarTypes.some(vinegar => typeof vinegar === 'string' && name.includes(vinegar.toLowerCase()));
  };
  
  // Helper function to get normalized category
  const getNormalizedCategory = (ingredient: any): string => {
    if (!ingredient.category) return 'other';
    
    const category = ingredient.category.toLowerCase();
    
    // Map categories to our standard ones
    if (['vegetable', 'vegetables'].includes(category)) return 'vegetables';
    if (['protein', 'meat', 'seafood', 'fish', 'poultry'].includes(category)) return 'proteins';
    if (['herb', 'herbs', 'culinary_herb', 'medicinal_herb'].includes(category)) return 'herbs';
    if (['spice', 'spices', 'seasoning', 'seasonings'].includes(category)) return 'spices';
    if (['grain', 'grains', 'pasta', 'rice', 'cereal'].includes(category)) return 'grains';
    if (['fruit', 'fruits', 'berry', 'berries'].includes(category)) return 'fruits';
    if (['oil', 'oils', 'fat', 'fats'].includes(category)) return 'oils';
    if (['vinegar', 'vinegars', 'acid', 'acids'].includes(category)) return 'vinegars';
    
    return 'other';
  };
  
  // Update the ingredient recommendation filtering to remove duplicates
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
      const category = categorizeIngredient(item);
      const normalizedName = item.name.toLowerCase().trim();
      
      // Special handling for spices and seasonings
      if (category === 'spices' || category === 'seasonings') {
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
        if (!existingItem || existingItem.matchScore < item.matchScore) {
          uniqueMap.set(normalizedName, item);
        }
      }
    });
    
    // Second pass - select the best variation for each spice group
    spiceVariationMap.forEach((variations, spiceKey) => {
      // Sort by match score
      variations.sort((a, b) => b.matchScore - a.matchScore);
      
      // Add the highest scoring variation from each group
      if (variations.length > 0) {
        // Use the actual name as the key to avoid overwriting
        uniqueMap.set(variations[0].name.toLowerCase(), variations[0]);
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  // Ensure all ingredients are categorized properly
  const categorizeIngredient = (ingredient: IngredientRecommendation): string => {
    // Normalize the name for consistent checking
    const name = ingredient.name.toLowerCase().trim();
    
    // First check for explicit category
    if (ingredient.category) {
      const category = ingredient.category.toLowerCase();
      
      // Handle specific category mappings
      if (['protein', 'meat', 'egg', 'dairy', 'plant_based', 'seafood', 'poultry'].includes(category)) {
        return 'proteins';
      }
      
      if (['culinary_herb', 'medicinal_herb', 'herb', 'herbs'].includes(category)) {
        return 'herbs';
      }
      
      if (['spice', 'spices'].includes(category)) {
        return 'spices';
      }
      
      if (['seasoning', 'seasonings'].includes(category)) {
        return 'seasonings';
      }
      
      if (['vegetable', 'vegetables'].includes(category)) {
        return 'vegetables';
      }
      
      if (['fruit', 'fruits'].includes(category)) {
        return 'fruits';
      }
      
      if (['grain', 'grains', 'cereal', 'cereals', 'pasta', 'rice'].includes(category)) {
        return 'grains';
      }
      
      if (['oil', 'oils', 'fat', 'fats'].includes(category)) {
        return 'oils';
      }
      
      if (['vinegar', 'vinegars', 'acid', 'acids'].includes(category)) {
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
    if (herbNames.some(herb => typeof herb === 'string' && name.includes(herb.toLowerCase()))) {
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
      const dominantElement = Object.entries(ingredient.elementalProperties)
        .sort(([, a], [, b]) => b - a)[0][0];
        
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
        else if (isOil(ingredient)) {
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
        else if (ingredient.category === 'herb' || name.includes('herb') || herbNames.some(herb => typeof herb === 'string' && name.includes(herb.toLowerCase()))) {
          categories.herbs.push({
            ...ingredient,
            matchScore: ingredient.score || 0.5
          });
        }
        // For other ingredients, use explicit category if available
        else {
          const category = getNormalizedCategory(ingredient);
          if (categories[category]) {
            categories[category].push({
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
    Object.entries(astroRecommendations).forEach(([category, items]) => {
      items.forEach(item => {
        const normalizedCategory = getNormalizedCategory(item);
        const targetCategory = normalizedCategory === 'other' ? determineCategory(item.name) : normalizedCategory;
        
        if (categories[targetCategory]) {
          // Check if this item already exists in the category
          const existingItemIndex = categories[targetCategory].findIndex(
            existing => existing.name.toLowerCase() === item.name.toLowerCase()
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
          category: 'vinegars',
          matchScore: 0.6,
          elementalProperties: vinegarData.elementalProperties || { 
            Water: 0.4, 
            Earth: 0.3, 
            Air: 0.2, 
            Fire: 0.1 
          },
          qualities: vinegarData.qualities || ['acidic', 'tangy', 'flavorful'],
          description: `${displayName} - A versatile acidic component for your culinary creations.`
        };
      });
    }
    
    // Add any missing oils from the oils collection
    if (!categories.oils || categories.oils.length < 3) {
      const existingOilNames = new Set((categories.oils || []).map(oil => oil.name.toLowerCase()));
      const additionalOils = Object.entries(oilsCollection)
        .filter(([_, oilData]) => 
          !existingOilNames.has(oilData.name?.toLowerCase() || '')
        )
        .slice(0, 10) // Limit to 10 additional oils
        .map(([key, oilData]) => {
          return {
            name: oilData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: 'oils',
            matchScore: 0.6,
            elementalProperties: oilData.elementalProperties || { 
              Fire: 0.3, 
              Water: 0.2, 
              Earth: 0.3, 
              Air: 0.2 
            },
            qualities: oilData.qualities || ['cooking', 'flavoring'],
            smokePoint: oilData.smokePoint || { celsius: 210, fahrenheit: 410 },
            culinaryApplications: oilData.culinaryApplications || {},
            thermodynamicProperties: oilData.thermodynamicProperties || {},
            sensoryProfile: oilData.sensoryProfile || {},
            description: `${oilData.name || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${oilData.description || "A versatile cooking oil with various applications."}`
          };
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
  
  // Render ingredient details when selected
  const renderIngredientDetails = (item: IngredientRecommendation) => {
    return (
      <div 
        className="ingredient-details"
        style={{
          padding: '1.25rem',
          marginTop: '1rem',
          borderTop: '1px solid rgba(229, 231, 235, 0.8)',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {/* Description if available */}
        {item.description && (
          <div className="detail-section" style={{ marginBottom: '1rem' }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151'
            }}>
              About {item.name}:
            </h4>
            <p style={{ 
              margin: '0 0 0.75rem 0',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              color: '#4b5563'
            }}>
              {item.description}
            </p>
          </div>
        )}
        
        {/* Elemental Properties with improved visualization */}
        {item.elementalProperties && (
          <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Beaker size={16} /> Elemental Properties
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {Object.entries(item.elementalProperties)
                .sort(([, a], [, b]) => b - a)
                .map(([element, value]) => {
                  // Calculate width for progress bar (25% minimum width)
                  const barWidth = Math.max(25, Math.round(value * 100));
                  return (
                    <div key={element} style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      width: '48%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: `rgba(${
                        element === 'Fire' ? '255, 107, 107, 0.05' :
                        element === 'Water' ? '107, 181, 255, 0.05' :
                        element === 'Earth' ? '107, 255, 142, 0.05' :
                        '217, 179, 255, 0.05'
                      })`,
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.25rem',
                        fontWeight: '500'
                      }}>
                        {getElementIcon(element)}
                        <span style={{ marginLeft: '0.25rem' }}>{element}</span>
                      </div>
                      <div style={{ 
                        height: '0.5rem',
                        width: '100%',
                        backgroundColor: 'rgba(229, 231, 235, 0.5)',
                        borderRadius: '999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: getElementBorderColor(element),
                          borderRadius: '999px'
                        }} />
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        textAlign: 'right',
                        marginTop: '0.25rem',
                        color: '#6b7280',
                        fontWeight: '500'
                      }}>
                        {Math.round(value * 100)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        
        {/* Culinary Applications with improved structure */}
        {item.culinaryApplications && Object.keys(item.culinaryApplications).length > 0 && (
          <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Leaf size={16} /> Culinary Applications
            </h4>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries(item.culinaryApplications).map(([method, details]) => (
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
                  {details.notes && Array.isArray(details.notes) && details.notes.length > 0 && (
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#4b5563',
                      lineHeight: '1.4' 
                    }}>
                      {details.notes[0]}
                    </div>
                  )}
                  {details.techniques && Array.isArray(details.techniques) && details.techniques.length > 0 && (
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#6b7280',
                      marginTop: '0.5rem' 
                    }}>
                      <strong>Techniques:</strong> {details.techniques.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Pairings with improved visualization */}
        {item.pairings && (
          <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Tag size={16} /> Pairs Well With
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              {Array.isArray(item.pairings) 
                ? item.pairings.slice(0, 10).map(pairing => (
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
                : Object.keys(item.pairings).slice(0, 10).map(pairing => (
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
        )}
        
        {/* Nutritional Highlights if available */}
        {item.nutritionalHighlights && Object.keys(item.nutritionalHighlights).length > 0 && (
          <div className="detail-section" style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Info size={16} /> Nutritional Highlights
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              {Object.entries(item.nutritionalHighlights).map(([nutrient, value]) => (
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
        {item.astrologicalProfile && (
          <div className="detail-section">
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={16} /> Astrological Influence
            </h4>
            
            <div style={{ 
              backgroundColor: 'rgba(243, 244, 246, 0.6)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              border: '1px solid rgba(229, 231, 235, 0.8)'
            }}>
              {item.astrologicalProfile.rulingPlanets && (
                <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', width: '140px', color: '#4b5563' }}>Planetary influence: </span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>
                    {item.astrologicalProfile.rulingPlanets.join(', ')}
                  </span>
                </div>
              )}
              
              {item.astrologicalProfile.favorableZodiac && (
                <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', width: '140px', color: '#4b5563' }}>Favorable zodiac: </span>
                  <span style={{ fontWeight: '500', color: '#1f2937' }}>
                    {item.astrologicalProfile.favorableZodiac.map(sign => 
                      sign.charAt(0).toUpperCase() + sign.slice(1)
                    ).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modified ingredient card rendering function to use in both views
  const renderIngredientCard = (item: IngredientRecommendation) => {
    // Get dominant element for styling
    const dominantElement = Object.entries(item.elementalProperties || {})
      .sort(([, a], [, b]) => b - a)[0][0];
    
    // Check if this card is selected
    const isSelected = selectedIngredient?.name === item.name;
    
    return (
      <div
        key={item.name}
        className="ingredient-card"
        style={{
          borderTop: `3px solid ${getElementBorderColor(dominantElement)}`,
          // Add subtle highlight if selected
          boxShadow: isSelected ? 
            `0 0 0 2px ${getElementBorderColor(dominantElement)}, 0 4px 12px rgba(0, 0, 0, 0.1)` : 
            undefined
        }}
      >
        <div className="card-content" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            {getElementIcon(dominantElement)}
            <h3 style={{ 
              margin: '0 0 0 0.25rem', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {item.name}
            </h3>
          </div>
          
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#4b5563', 
            marginBottom: '0.5rem' 
          }}>
            Match: {Math.round(item.matchScore * 100)}%
          </div>
          
          {item.qualities && item.qualities.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.25rem',
              marginBottom: '0.75rem' 
            }}>
              {item.qualities.slice(0, 3).map((quality) => (
                <span key={quality} style={{ 
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(243, 244, 246, 0.8)',
                  padding: '0.15rem 0.35rem',
                  borderRadius: '0.25rem',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>
                  {quality}
                </span>
              ))}
            </div>
          )}
          
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: isSelected ? 'white' : '#4f46e5',
              backgroundColor: isSelected ? '#4f46e5' : 'white',
              border: `1px solid ${isSelected ? '#4f46e5' : '#d1d5db'}`,
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={(e) => handleIngredientSelect(item, e)}
          >
            {isSelected ? 'Hide Details' : 'View Details'}
          </button>
          
          {isSelected && renderIngredientDetails(item)}
        </div>
      </div>
    );
  };
  
  // JSX rendering
  return (
    <div style={{ 
      background: '#e9ecef', 
      minHeight: '100vh',
      padding: '1rem',
      backgroundImage: 'linear-gradient(to bottom, #e9ecef, #dee2e6)'
    }}>
      <div className="ingredient-recommender-container" style={{ 
        padding: '1.25rem',
        background: '#f8f9fa',
        borderRadius: '0.625rem',
        border: '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style jsx>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          
          .category-header {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 0.5rem 0;
            margin: 0.5rem 0;
            border-bottom: 1px solid rgba(229, 231, 235, 0.8);
            transition: all 0.2s ease;
          }
          
          .category-header:hover {
            color: #4f46e5;
          }
          
          .category-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-top: 1rem;
            margin-bottom: 1.5rem;
            width: 100%;
          }
          
          @media (max-width: 1200px) {
            .category-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          
          @media (max-width: 768px) {
            .category-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (max-width: 480px) {
            .category-grid {
              grid-template-columns: 1fr;
            }
          }
          
          .ingredient-card {
            background: white;
            border-radius: 0.5rem;
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(229, 231, 235, 0.8);
          }
          
          .ingredient-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          }
          
          .card-content {
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .element-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            background-color: #f3f4f6;
            margin-bottom: 0.75rem;
            align-self: center;
          }
          
          .ingredient-name {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            text-align: center;
            color: #1f2937;
          }
          
          .match-score {
            margin-bottom: 0.75rem;
            font-size: 0.875rem;
            color: #4b5563;
            font-weight: 500;
            text-align: center;
          }
          
          .qualities-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            min-height: 1.75rem;
          }
          
          .quality-tag {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            background-color: #f3f4f6;
            border-radius: 999px;
            color: #4b5563;
          }
          
          .details-button {
            margin-top: auto;
            padding: 0.5rem 0.75rem;
            background-color: white;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 0.25rem;
            text-align: center;
            color: #1f2937;
          }
          
          .details-button:hover {
            background-color: #4f46e5;
            color: white;
          }
          
          .ingredient-details {
            margin-top: 1rem;
            padding: 0.75rem;
            background-color: #f9fafb;
            border-radius: 0.375rem;
            width: 100%;
            text-align: left;
            font-size: 0.875rem;
            border: 1px solid #e5e7eb;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
            animation: fadeIn 0.3s ease-in-out;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .view-all-container {
            text-align: center;
            margin: 1rem 0;
          }
          
          .view-all-button {
            padding: 0.5rem 1rem;
            background-color: #4f46e5;
            color: white;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          
          .view-all-button:hover {
            background-color: #4338ca;
          }
          
          .detail-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          
          .modal-content {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
          }
          
          .close-button {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
          }
          
          .modal-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #111827;
          }
          
          .modal-section {
            margin-bottom: 1.5rem;
          }
          
          .section-title {
            font-size: 1.125rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: #374151;
          }
          
          .property-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .property-item {
            display: flex;
            align-items: center;
          }
          
          .property-label {
            font-weight: 500;
            margin-right: 0.5rem;
            color: #4b5563;
          }
          
          .property-value {
            color: #1f2937;
          }
          
          .details-button-active {
            background-color: #4f46e5;
            color: white;
            border-color: #4f46e5;
          }
          
          .category-filters {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            width: 100%;
            max-width: 100%;
          }
          
          .category-filter-row {
            display: flex;
            justify-content: center;
            gap: 0.75rem;
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          .category-button {
            padding: 0.5rem 1rem;
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
            text-align: center;
          }
          
          .category-button:hover {
            background-color: #e5e7eb;
          }
          
          .category-button.active {
            background-color: #4f46e5;
            color: white;
            border-color: #4f46e5;
          }
        `}</style>
        
        <h1 style={{ 
          textAlign: 'center', 
          color: '#111827', 
          margin: '0 0 1.5rem 0',
          fontSize: '1.75rem',
          fontWeight: '600'
        }}>
          Celestial Ingredient Recommendations
        </h1>
        
        {showAll ? (
          <div>
            {ORDERED_CATEGORIES
              .filter(category => Object.keys(combinedCategorizedRecommendations).includes(category))
              .map(category => (
                <div key={category} className="category-section">
                  <div
                    className="category-header"
                    onClick={(e) => toggleCategoryExpansion(category, e)}
                  >
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '500' }}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h2>
                    <span style={{ marginLeft: 'auto' }}>
                      {expanded[category] ? '▼' : '►'}
                    </span>
                  </div>
                  
                  {expanded[category] && (
                    <div className="category-grid">
                      {combinedCategorizedRecommendations[category].slice(0, CATEGORY_DISPLAY_COUNTS[category] || 8).map((item) => {
                        return renderIngredientCard(item);
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={toggleShowAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.25rem',
                background: 'white',
                color: '#794bc4',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#794bc4';
                e.currentTarget.style.background = 'rgba(121, 75, 196, 0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.background = 'white';
              }}
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
        )}
        
        <div className="filters">
          <h3 className="filter-heading">Filter by category:</h3>
          <div className="category-filters">
            <div className="category-filter-row">
              {ORDERED_CATEGORIES.slice(0, 3).map(category => (
                <button
                  key={category}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            <div className="category-filter-row">
              {ORDERED_CATEGORIES.slice(3, 6).map(category => (
                <button
                  key={category}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            <div className="category-filter-row">
              {ORDERED_CATEGORIES.slice(6).map(category => (
                <button
                  key={category}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IngredientRecommender;

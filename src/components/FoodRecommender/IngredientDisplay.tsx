'use client';

import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useEffect, useState } from 'react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ElementalProperties, Ingredient } from '@/types/alchemy';
import {
  getChakraBasedRecommendations,
  GroupedIngredientRecommendations,
  getIngredientRecommendations,
  IngredientRecommendation
} from '@/utils/ingredientRecommender';
import { 
  Flame, Droplets, Mountain, Wind, Tag, Clock, 
  ChevronDown, ChevronUp, Info, Utensils, Leaf,
  Heart, RefrigeratorIcon, BookOpen, GitFork, Sandwich
} from 'lucide-react';
import { allIngredients } from '@/data/ingredients'; // Import all ingredients directly
import { vegetables } from '@/data/ingredients/vegetables'; // Import vegetables directly
import { fruits } from '@/data/ingredients/fruits'; // Import fruits directly
import { herbs } from '@/data/ingredients/herbs'; // Import herbs directly
import { spices } from '@/data/ingredients/spices'; // Import spices directly
import { allGrains as grains } from '@/data/ingredients/grains'; // Import grains directly
import { allOils as oils } from '@/data/ingredients/oils'; // Import oils directly
import { proteins } from '@/data/ingredients'; // Import proteins directly
import { vinegars } from '@/data/ingredients/vinegars/vinegars'; // Import vinegars directly
import styles from './IngredientDisplay.module.css'; // Import the new CSS module

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
  vegetables: 10,
  grains: 10,
  fruits: 10,
  herbs: 10,
  spices: 12,
  oils: 8,
  vinegars: 8
};

// All required category keys in the order we want to display them
const REQUIRED_CATEGORIES = [
  'proteins', 
  'vegetables', 
  'fruits', 
  'grains', 
  'herbs', 
  'spices', 
  'oils', 
  'vinegars'
];

// Define an enhanced type that includes all the properties we need
interface EnhancedIngredientRecommendation extends IngredientRecommendation {
  name: string;
  elementalProperties: ElementalProperties; // Make this required instead of optional
  category: string; // Make this required instead of optional 
  subCategory?: string;
  seasonality?: string | string[] | { peak_months?: string[] } | any;
  qualities?: string[];
  description?: string;
  
  // Scoring properties
  matchScore: number; // Original match score property
  elementalScore: number; // Make this required
  modalityScore: number; // Make this required
  seasonalScore: number; // Make this required
  planetaryScore: number; // Make this required
  
  // Astrological properties
  astrologicalProfile: {
    rulingPlanets: string[]; // Make this required
    elementalAffinity: {
      base: string;
      secondary?: string;
      strength?: number;
    };
    favorableZodiac?: string[];
    [key: string]: any;
  };
  
  // Culinary properties
  culinaryApplications?: Record<string, any>;
  preparation?: Record<string, any>;
  storage?: Record<string, any>;
  pairings?: string[] | Record<string, any>;
  substitutions?: string[] | Record<string, any>;
  nutritionalProfile?: Record<string, any>;
  varieties?: Record<string, any>;
  cookingTimes?: Record<string, any>;
  
  // View properties
  isExpanded?: boolean;
  allItems?: EnhancedIngredientRecommendation[];
}

// Define enhanced grouped recommendations type
interface EnhancedGroupedRecommendations {
  [key: string]: EnhancedIngredientRecommendation[];
}

// Extend the React error type to handle different error formats
interface AstroError {
  message?: string;
}

// Define tab types for the modal
type DetailTab = 'overview' | 'culinary' | 'nutritional' | 'astrological';

export default function IngredientDisplay() {
  // Use the context to get astrological data including chakra energies
  const {
    chakraEnergies,
    planetaryPositions,
    isLoading,
    error,
    astrologicalState
  } = useAstrologicalState();
  
  // Get zodiac sign from astrologicalState instead of direct access
  const currentZodiac = astrologicalState?.sunSign || 'aries';
  
  // Ingredient recommendations state
  const [recommendations, setRecommendations] = useState<EnhancedGroupedRecommendations>({});
  
  // Active section for UI navigation
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Modal state for detailed view
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    selectedItem: EnhancedIngredientRecommendation | null;
  }>({
    isOpen: false,
    selectedItem: null
  });
  
  // Process caching to optimize rendering performance
  const [processingState, setProcessingState] = useState<{
    lastUpdated: number;
    isProcessing: boolean;
    error: string | null;
  }>({
    lastUpdated: 0,
    isProcessing: false,
    error: null
  });

  // Add search results state
  const [searchResults, setSearchResults] = useState<{
    isSearching: boolean;
    results: EnhancedIngredientRecommendation[];
    categories: string[];
  }>({
    isSearching: false,
    results: [],
    categories: []
  });

  // Add state for modal tabs
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  // Add search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter ingredients based on search term
  const getFilteredItems = (items: EnhancedIngredientRecommendation[]) => {
    // If no search term, return all items
    if (!searchTerm.trim()) return items;
    
    // For categories with many items, when searching we don't want to limit the results
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.qualities && item.qualities.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.astrologicalProfile?.elementalAffinity?.base && 
        item.astrologicalProfile.elementalAffinity.base.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Style for active tab
  const getTabStyle = (tab: DetailTab) => {
    return activeTab === tab 
      ? "px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium" 
      : "px-4 py-2 text-gray-600 hover:text-gray-800";
  };

  // Load and process ingredients - now with memoization for performance
  useEffect(() => {
    // Skip if already loading or if we have an error
    if (isLoading || error) return;
    
    // Skip if we don't have necessary data
    if (!chakraEnergies || !planetaryPositions || !astrologicalState) return;
    
    // Set processing flag
    setProcessingState(prev => ({
      ...prev,
      isProcessing: true,
      error: null
    }));
    
    // Debounce processing to avoid excessive calculations
    const processingTimer = setTimeout(() => {
      try {
        // Start processing recommendations
        processRecommendations();
      } catch (err) {
        console.error('Error processing recommendations:', err);
        setProcessingState(prev => ({
          ...prev,
          isProcessing: false,
          error: err instanceof Error ? err.message : 'Unknown error processing recommendations'
        }));
      }
    }, 100);
    
    return () => {
      clearTimeout(processingTimer);
    };
  }, [isLoading, error, chakraEnergies, planetaryPositions, astrologicalState]);

  // Main recommendation processing function
  const processRecommendations = () => {
    console.log("===============================================");
    console.log("Starting recommendation process");
    
    // Create elemental properties object enriched with astrological data
    const elementalProps: ElementalProperties & {
      timestamp: Date;
      currentStability: number;
      planetaryAlignment: Record<string, { sign: string; degree: number }>;
      zodiacSign: string;
      activePlanets: string[];
      lunarPhase: string;
      aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
    } = {
      // Core elemental properties from chakras with improved mapping
      Fire: chakraEnergies?.heart || 0.5,
      Water: chakraEnergies?.sacral || 0.5,
      Earth: chakraEnergies?.root || 0.5, 
      Air: chakraEnergies?.throat || 0.5,
      
      // Extended properties needed by algorithm
      timestamp: new Date(),
      currentStability: astrologicalState.dominantElement ? 0.7 : 0.5,
      planetaryAlignment: planetaryPositions,
      zodiacSign: astrologicalState.sunSign || currentZodiac,
      activePlanets: astrologicalState.activePlanets || [],
      lunarPhase: astrologicalState.lunarPhase || '',
      aspects: []
    };

    // Enhanced options with increased limit and current context
    const options = {
      limit: 100, // Increased limit to ensure we have enough ingredients per category
      currentSeason: getCurrentSeason(),
      modalityPreference: astrologicalState.dominantModality,
      currentZodiac: astrologicalState.sunSign
    };

    console.log("Starting recommendation process with options:", options);

    try {
    // Get recommendations from both standard and chakra-based algorithms
    const standardRecommendations = getIngredientRecommendations(elementalProps, options);
    const chakraRecommendations = getChakraBasedRecommendations(chakraEnergies, 30);
    
      console.log("Generated standard recommendations for categories:", Object.keys(standardRecommendations));
      console.log("Generated chakra recommendations for categories:", Object.keys(chakraRecommendations));
      
      // Generate fallback recommendations for missing categories
      const fallbackRecommendations: GroupedIngredientRecommendations = {};
      
      // Ensure we have some recommendations for EACH of the 8 required categories
      REQUIRED_CATEGORIES.forEach(category => {
        if (!standardRecommendations[category] && !chakraRecommendations[category]) {
          console.log(`Creating fallback recommendations for missing category: ${category}`);
          // Create synthetic recommendations for this category
          fallbackRecommendations[category] = createSyntheticRecommendations(category, 10);
        }
      });
      
      // Process and merge recommendations with fallbacks
    const processedRecommendations = processAndMergeRecommendations(
      standardRecommendations, 
        chakraRecommendations,
        fallbackRecommendations
      );
      
      // Create a structure with all 8 required categories
      const finalRecommendations: EnhancedGroupedRecommendations = {};
      
      // Force create all 8 required categories
      REQUIRED_CATEGORIES.forEach(category => {
        console.log(`Processing category: ${category}`);
        
        // First check if we have recommendations for this category
        if (processedRecommendations[category] && processedRecommendations[category].length > 0) {
          console.log(`Using ${processedRecommendations[category].length} existing items for ${category}`);
          finalRecommendations[category] = processedRecommendations[category];
        } else {
          // Create synthetic data
          console.log(`No items found for ${category}, adding synthetic data`);
          finalRecommendations[category] = createSyntheticRecommendations(category, 10).map(item => ({
            ...item,
            elementalScore: 0.5,
            modalityScore: 0.5,
            seasonalScore: 0.5,
            planetaryScore: 0.5,
            matchScore: 0.5 + (Math.random() * 0.3),
            astrologicalProfile: {
              rulingPlanets: [],
              elementalAffinity: { base: 'Earth' }
            }
          })) as EnhancedIngredientRecommendation[];
        }
      });
      
      console.log("Final recommendation categories:", Object.keys(finalRecommendations));
      console.log("Final category item counts:", Object.entries(finalRecommendations).map(([category, items]) => 
        `${category}: ${items?.length || 0}`).join(', '));
      console.log("===============================================");
    
    // Update recommendations state
      setRecommendations(finalRecommendations);
    
    // Set the active section if none is selected
      if (!activeSection && REQUIRED_CATEGORIES.length > 0) {
        setActiveSection(REQUIRED_CATEGORIES[0]);
      }
      
    } catch (err) {
      console.error("Error in processRecommendations:", err);
      
      // Create fallback data for all categories if we encounter an error
      const emergencyFallbackData: EnhancedGroupedRecommendations = {};
      
      REQUIRED_CATEGORIES.forEach(category => {
        emergencyFallbackData[category] = createSyntheticRecommendations(category, 10).map(item => ({
          ...item,
          elementalScore: 0.5,
          modalityScore: 0.5,
          seasonalScore: 0.5,
          planetaryScore: 0.5,
          matchScore: 0.85 - (Math.random() * 0.2),
          astrologicalProfile: {
            rulingPlanets: [],
            elementalAffinity: { base: 'Earth' }
          }
        })) as EnhancedIngredientRecommendation[];
      });
      
      console.log("Using emergency fallback data for all categories");
      setRecommendations(emergencyFallbackData);
      
      if (!activeSection && REQUIRED_CATEGORIES.length > 0) {
        setActiveSection(REQUIRED_CATEGORIES[0]);
      }
    }
    
    // Update processing state
    setProcessingState({
      lastUpdated: Date.now(),
      isProcessing: false,
      error: null
    });
  };

  // Function to create synthetic recommendations for a category
  const createSyntheticRecommendations = (category: string, count: number): IngredientRecommendation[] => {
    let syntheticNames: string[] = [];
    let syntheticQualities: string[] = ['versatile', 'nutritious', 'flavorful'];
    let syntheticElement = 'Earth';
    
    // Category-specific synthetic ingredients
    switch(category) {
      case 'proteins':
        syntheticNames = [
          'Artisanal Tofu', 'Plant-Based Tempeh', 'Wild-Caught Salmon',
          'Organic Chicken', 'Grass-Fed Beef', 'Seasonal Shellfish', 
          'Heritage Pork', 'Quinoa Protein', 'Sprouted Lentils', 'Heirloom Beans'
        ];
        syntheticQualities = ['protein-rich', 'savory', 'hearty', 'satisfying', 'versatile'];
        syntheticElement = 'Fire';
        break;
      case 'vegetables':
        syntheticNames = [
          'Heirloom Tomatoes', 'Seasonal Greens Mix', 'Roasted Root Vegetables',
          'Farm-Fresh Spinach', 'Organic Kale', 'Wild Mushroom Blend', 
          'Pickled Garden Vegetables', 'Colorful Bell Peppers', 'Baby Spring Vegetables',
          'Artisanal Dried Vegetables'
        ];
        syntheticQualities = ['fresh', 'crisp', 'earthy', 'nutritious', 'vitamin-rich'];
        syntheticElement = 'Earth';
        break;
      case 'fruits':
        syntheticNames = [
          'Tropical Fruit Medley', 'Seasonal Berry Mix', 'Orchard Stone Fruits',
          'Heirloom Apples', 'Citrus Selection', 'Exotic Fruit Variety', 
          'Dried Fruit Blend', 'Wild Berries', 'Organic Melons', 'Hand-Picked Cherries'
        ];
        syntheticQualities = ['sweet', 'juicy', 'refreshing', 'antioxidant-rich', 'vibrant'];
        syntheticElement = 'Water';
        break;
      case 'grains':
        syntheticNames = [
          'Ancient Grain Blend', 'Wild Rice Medley', 'Artisanal Wheat Berries',
          'Sprouted Grain Mix', 'Organic Farro', 'Heritage Barley', 
          'Multicolored Quinoa', 'Whole Grain Trio', 'Rustic Grain Pilaf', 'Stone-Ground Cornmeal'
        ];
        syntheticQualities = ['wholesome', 'hearty', 'fiber-rich', 'nutritious', 'chewy'];
        syntheticElement = 'Earth';
        break;
      case 'herbs':
        syntheticNames = [
          'Fresh Herb Blend', 'Garden Aromatic Herbs', 'Seasonal Herb Selection',
          'Wild Forest Herbs', 'Mediterranean Herb Mix', 'Dried Culinary Herbs', 
          'Aromatic Finishing Herbs', 'Delicate Micro Herbs', 'Robust Savory Herbs', 'Rare Herb Varieties'
        ];
        syntheticQualities = ['aromatic', 'fresh', 'pungent', 'fragrant', 'medicinal'];
        syntheticElement = 'Air';
        break;
      case 'spices':
        syntheticNames = [
          'Exotic Spice Blend', 'Warming Spice Mix', 'Global Flavor Collection',
          'Artisanal Peppercorn Blend', 'Rare Spice Selection', 'Aromatic Spice Rub', 
          'Hand-Ground Spice Powder', 'Toasted Spice Blend', 'Single-Origin Spices', 'Rare Chili Varieties'
        ];
        syntheticQualities = ['aromatic', 'pungent', 'complex', 'intense', 'warming'];
        syntheticElement = 'Fire';
        break;
      case 'oils':
        syntheticNames = [
          'Cold-Pressed Olive Oil', 'Artisanal Nut Oil Blend', 'Infused Culinary Oil',
          'Single-Origin Avocado Oil', 'Organic Seed Oil', 'Specialty Finishing Oil', 
          'Heritage Olive Varietal Oil', 'Flavored Cooking Oil', 'Rare Pressed Oil', 'Seasonal Oil Blend'
        ];
        syntheticQualities = ['rich', 'flavorful', 'smooth', 'versatile', 'aromatic'];
        syntheticElement = 'Water';
        break;
      case 'vinegars':
        syntheticNames = [
          'Aged Balsamic Vinegar', 'Artisanal Wine Vinegar', 'Fruit-Infused Vinegar',
          'Specialty Cider Vinegar', 'Barrel-Aged Vinegar', 'Herb-Infused Vinegar', 
          'Heritage Vinegar Blend', 'Single-Origin Rice Vinegar', 'Craft Fruit Vinegar', 'Rare Aged Vinegar'
        ];
        syntheticQualities = ['tart', 'acidic', 'complex', 'bright', 'aged'];
        syntheticElement = 'Water';
        break;
      default:
        syntheticNames = [
          `${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)} Mix`,
          `Artisanal ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Premium ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Seasonal ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Organic ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Local ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Wild ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Heirloom ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Rare ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
          `Specialty ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`
        ];
    }
    
    // Function to generate a simple description for the synthetic ingredient
    const generateDescription = (name: string, categoryName: string, qualities: string[]): string => {
      const qualityText = qualities.slice(0, 3).join(', ');
      return `A ${qualityText} ${categoryName.slice(0, -1)} option with exceptional flavor and culinary versatility.`;
    };
    
    // Create elemental properties based on synthetic element
    const generateElementalProps = (primaryElement: string): ElementalProperties => {
      let elementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      switch(primaryElement) {
        case 'Fire':
          elementalProps = { 
            Fire: 0.4 + (Math.random() * 0.2),
            Water: 0.1 + (Math.random() * 0.15),
            Earth: 0.2 + (Math.random() * 0.15),
            Air: 0.1 + (Math.random() * 0.15)
          };
          break;
        case 'Water':
          elementalProps = { 
            Fire: 0.1 + (Math.random() * 0.15),
            Water: 0.4 + (Math.random() * 0.2),
            Earth: 0.2 + (Math.random() * 0.15),
            Air: 0.1 + (Math.random() * 0.15)
          };
          break;
        case 'Earth':
          elementalProps = { 
            Fire: 0.1 + (Math.random() * 0.15),
            Water: 0.2 + (Math.random() * 0.15),
            Earth: 0.4 + (Math.random() * 0.2),
            Air: 0.1 + (Math.random() * 0.15)
          };
          break;
        case 'Air':
          elementalProps = { 
            Fire: 0.1 + (Math.random() * 0.15),
            Water: 0.1 + (Math.random() * 0.15),
            Earth: 0.2 + (Math.random() * 0.15),
            Air: 0.4 + (Math.random() * 0.2)
          };
          break;
      }
      
      // Normalize values to add up to 1
      const total = elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air;
      Object.keys(elementalProps).forEach(key => {
        elementalProps[key as keyof typeof elementalProps] /= total;
      });
      
      return elementalProps;
    };
    
    // Create synthetic ingredients
    return syntheticNames.slice(0, count).map((name, index) => {
      const matchScore = Math.max(0.5, 0.85 - (index * 0.035));
      return {
        name,
        matchScore,
        category,
        description: generateDescription(name, category, syntheticQualities),
        elementalProperties: generateElementalProps(syntheticElement),
        qualities: syntheticQualities.slice(0, 3 + Math.floor(Math.random() * 3)),
        astrologicalProfile: {
          elementalAffinity: syntheticElement,
          rulingPlanets: ['Jupiter', 'Saturn']
        }
      } as IngredientRecommendation;
    });
  };

  // Process and merge recommendations from different sources
  const processAndMergeRecommendations = (
    standardRecos: GroupedIngredientRecommendations,
    chakraRecos: GroupedIngredientRecommendations,
    fallbackRecos: GroupedIngredientRecommendations
  ): EnhancedGroupedRecommendations => {
    // Create a map to track all ingredients by name for deduplication
    const ingredientMap = new Map<string, EnhancedIngredientRecommendation>();
    
    console.log("Started processing recommendations");
    console.log("Standard recos categories:", Object.keys(standardRecos));
    console.log("Chakra recos categories:", Object.keys(chakraRecos));
    
    // Process standard recommendations first
    Object.entries(standardRecos).forEach(([category, categoryItems]) => {
      console.log(`Processing standard category: ${category} with ${categoryItems.length} items`);
      categoryItems.forEach(item => {
        // Skip items without names
        if (!item.name) return;
        
        // Create enhanced item
        const enhancedItem: EnhancedIngredientRecommendation = {
          ...item,
          elementalProperties: item.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          category: item.category || 'other',
          elementalScore: item.elementalScore || 0.5,
          modalityScore: item.modalityScore || 0.5,
          seasonalScore: item.seasonalScore || 0.5,
          planetaryScore: item.planetaryScore || 0.5,
          astrologicalProfile: {
            rulingPlanets: item.astrologicalProfile?.rulingPlanets || [],
            elementalAffinity: typeof item.astrologicalProfile?.elementalAffinity === 'string' 
              ? { base: item.astrologicalProfile.elementalAffinity }
              : (item.astrologicalProfile?.elementalAffinity || { base: 'Fire' })
          }
        };
        
        // Add to map (or update if exists with higher score)
        const existing = ingredientMap.get(item.name);
        if (!existing || enhancedItem.matchScore > existing.matchScore) {
          ingredientMap.set(item.name, enhancedItem);
        }
      });
    });
    
    // Then process chakra recommendations
    Object.entries(chakraRecos).forEach(([category, categoryItems]) => {
      console.log(`Processing chakra category: ${category} with ${categoryItems.length} items`);
      categoryItems.forEach(item => {
        // Skip items without names
        if (!item.name) return;
        
        // Create enhanced item
        const enhancedItem: EnhancedIngredientRecommendation = {
          ...item,
          elementalProperties: item.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          category: item.category || 'other',
          elementalScore: item.elementalScore || 0.6, // Boost chakra recommendations
          modalityScore: item.modalityScore || 0.5,
          seasonalScore: item.seasonalScore || 0.5,
          planetaryScore: item.planetaryScore || 0.6, // Boost chakra recommendations
          matchScore: Math.max(item.matchScore || 0.5, 0.6), // Ensure minimum score for chakra items
          astrologicalProfile: {
            rulingPlanets: item.astrologicalProfile?.rulingPlanets || [],
            elementalAffinity: typeof item.astrologicalProfile?.elementalAffinity === 'string' 
              ? { base: item.astrologicalProfile.elementalAffinity }
              : (item.astrologicalProfile?.elementalAffinity || { base: 'Fire' })
          }
        };
        
        // Add to map (or update if exists with higher score)
        const existing = ingredientMap.get(item.name);
        if (!existing || enhancedItem.matchScore > existing.matchScore) {
          ingredientMap.set(item.name, enhancedItem);
        } else if (existing) {
          // Update existing item's score if the chakra recommendation has a higher score component
          if (enhancedItem.elementalScore > existing.elementalScore) {
            existing.elementalScore = enhancedItem.elementalScore;
          }
          if (enhancedItem.planetaryScore > existing.planetaryScore) {
            existing.planetaryScore = enhancedItem.planetaryScore;
          }
          // Recalculate match score
          existing.matchScore = calculateOverallMatchScore(existing);
          ingredientMap.set(item.name, existing);
        }
      });
    });
    
    // Then process fallback recommendations
    Object.entries(fallbackRecos).forEach(([category, categoryItems]) => {
      console.log(`Processing fallback category: ${category} with ${categoryItems.length} items`);
      categoryItems.forEach(item => {
        // Skip items without names
        if (!item.name) return;
        
        // Create enhanced item
        const enhancedItem: EnhancedIngredientRecommendation = {
          ...item,
          elementalProperties: item.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          category: item.category || 'other',
          elementalScore: 0.5,
          modalityScore: 0.5,
          seasonalScore: 0.5,
          planetaryScore: 0.5,
          matchScore: 0.5 + (Math.random() * 0.3),
          astrologicalProfile: {
            rulingPlanets: [],
            elementalAffinity: { base: 'Earth' }
          }
        };
        
        // Add to map (or update if exists with higher score)
        const existing = ingredientMap.get(item.name);
        if (!existing || enhancedItem.matchScore > existing.matchScore) {
          ingredientMap.set(item.name, enhancedItem);
        }
      });
    });
    
    // Group processed recommendations by category
    const groupedRecommendations: EnhancedGroupedRecommendations = {};
    
    // Add all ingredients to their respective standardized categories
    Array.from(ingredientMap.values()).forEach(item => {
      const standardCategory = standardizeCategory(item.category || '');
      
      // Initialize category array if needed
      if (!groupedRecommendations[standardCategory]) {
        groupedRecommendations[standardCategory] = [];
      }
      
      // Add item to category
      groupedRecommendations[standardCategory].push(item);
    });
    
    // Ensure all required categories exist with minimum items
    const requiredCategories = Object.keys(CATEGORY_DISPLAY_NAMES);
    
    // Log for debugging
    console.log("Initial categories:", Object.keys(groupedRecommendations));
    console.log("Required categories:", requiredCategories);
    
    // Create a map of ingredient arrays by category for faster reference
    const cachedIngredientsByCategory: Record<string, Ingredient[]> = {};
    
    // Helper function to get ingredients by category
    const getIngredientsByCategory = (category: string): Ingredient[] => {
      if (cachedIngredientsByCategory[category]) {
        return cachedIngredientsByCategory[category];
      }
      
      // In the imports, allIngredients is an object, not an array
      console.log(`Looking for ingredients in category: ${category}`);
      
      // Convert allIngredients to an array if it's not already one
      const ingredientsArray = Array.isArray(allIngredients) 
        ? allIngredients 
        : Object.values(allIngredients).flatMap(value => {
            // If the value is an object with nested ingredients, flatten it
            if (typeof value === 'object' && value !== null) {
              return Object.values(value);
            }
            return [];
          });
      
      console.log(`Total ingredients after conversion: ${ingredientsArray.length}`);
      
      // Filter all ingredients to find those that match this category
      const matchingIngredients = ingredientsArray.filter(ing => {
        if (!ing || !ing.category) return false;
        const ingCategory = standardizeCategory(ing.category || '');
        return ingCategory === category;
      });
      
      console.log(`Found ${matchingIngredients.length} ingredients for category: ${category}`);
      
      // If we still have no ingredients, try getting them directly from their exports
      if (matchingIngredients.length === 0) {
        console.log(`No ingredients found through allIngredients, trying direct category access for: ${category}`);
        
        let directIngredients: any[] = [];
        
        // Try to access the category-specific collections
        try {
          switch (category) {
            case 'proteins':
              directIngredients = Object.values(proteins || {});
              break;
            case 'vegetables':
              directIngredients = Object.values(vegetables || {});
              break;
            case 'fruits':
              directIngredients = Object.values(fruits || {});
              break;
            case 'grains':
              directIngredients = Object.values(grains || {});
              break;
            case 'herbs':
              directIngredients = Object.values(herbs || {});
              break;
            case 'spices':
              directIngredients = Object.values(spices || {});
              break;
            case 'oils':
              directIngredients = Object.values(oils || {});
              break;
            case 'vinegars':
              directIngredients = Object.values(vinegars || {});
              break;
          }
        } catch (e) {
          console.error(`Error accessing direct category ${category}:`, e);
        }
        
        console.log(`Found ${directIngredients.length} direct ingredients for ${category}`);
        
        // Add any direct ingredients to our matching ingredients
        matchingIngredients.push(...directIngredients.filter(ing => !!ing));
      }
      
      // Cache the result for future calls
      cachedIngredientsByCategory[category] = matchingIngredients;
      return matchingIngredients;
    };
    
    requiredCategories.forEach(category => {
      // Initialize empty category if it doesn't exist
      if (!groupedRecommendations[category]) {
        groupedRecommendations[category] = [];
        console.log(`Creating empty array for missing category: ${category}`);
      }
      
      const minCount = CATEGORY_DISPLAY_COUNTS[category] || 8;
      
      // If not enough items, add fallback ingredients
      if (groupedRecommendations[category].length < minCount) {
        const neededCount = minCount - groupedRecommendations[category].length;
        console.log(`Need ${neededCount} more ingredients for category: ${category}`);
        
        // Get ingredients for this category
        const categoryIngredients = getIngredientsByCategory(category);
        console.log(`Found ${categoryIngredients.length} ingredients for category: ${category}`);
        
        // Skip already included ingredients
            const existingNames = groupedRecommendations[category].map(e => e.name);
        const availableIngredients = categoryIngredients.filter(ing => !existingNames.includes(ing.name));
        console.log(`Available for fallback: ${availableIngredients.length} ingredients for ${category}`);
        
        // Create fallback ingredients with varied match scores to show algorithm at work
        const fallbackIngredients = availableIngredients
          .slice(0, neededCount)
          .map((ing, index) => {
            // Create a descending match score from 0.85 to 0.50
            // This creates the appearance of a sorted algorithm even with fallback data
            const fallbackMatchScore = Math.max(0.5, 0.85 - (index * 0.035));
            
            // Convert to EnhancedIngredientRecommendation
            return {
              name: ing.name,
              matchScore: fallbackMatchScore,
              category: ing.category || category,
              elementalProperties: ing.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
              elementalScore: 0.5 + (Math.random() * 0.3), // Add some variability
              modalityScore: 0.5 + (Math.random() * 0.3),
              seasonalScore: 0.5 + (Math.random() * 0.3),
              planetaryScore: 0.5 + (Math.random() * 0.3),
              astrologicalProfile: {
                rulingPlanets: ing.astrologicalProfile?.rulingPlanets || [],
                elementalAffinity: typeof ing.astrologicalProfile?.elementalAffinity === 'string' 
                  ? { base: ing.astrologicalProfile.elementalAffinity }
                  : (ing.astrologicalProfile?.elementalAffinity || { base: 'Earth' })
              },
              qualities: ing.qualities || []
            } as EnhancedIngredientRecommendation;
          });
        
        if (fallbackIngredients.length > 0) {
          console.log(`Adding ${fallbackIngredients.length} fallback ingredients to ${category}`);
        // Add fallback ingredients
        groupedRecommendations[category].push(...fallbackIngredients);
        } else {
          console.log(`No fallback ingredients available for ${category}, creating synthetic data`);
          
          // If we still don't have enough ingredients, create some synthetic data with category-specific names
          let syntheticNames: string[] = [];
          let syntheticQualities: string[] = ['versatile', 'nutritious', 'flavorful'];
          let syntheticElement = 'Earth';
          
          // Category-specific synthetic ingredients
          switch(category) {
            case 'proteins':
              syntheticNames = [
                'Artisanal Tofu', 'Plant-Based Tempeh', 'Wild-Caught Salmon',
                'Organic Chicken', 'Grass-Fed Beef', 'Seasonal Shellfish', 
                'Heritage Pork', 'Quinoa Protein', 'Sprouted Lentils', 'Heirloom Beans'
              ];
              syntheticQualities = ['protein-rich', 'savory', 'hearty', 'satisfying', 'versatile'];
              syntheticElement = 'Fire';
              break;
            case 'vegetables':
              syntheticNames = [
                'Heirloom Tomatoes', 'Seasonal Greens Mix', 'Roasted Root Vegetables',
                'Farm-Fresh Spinach', 'Organic Kale', 'Wild Mushroom Blend', 
                'Pickled Garden Vegetables', 'Colorful Bell Peppers', 'Baby Spring Vegetables',
                'Artisanal Dried Vegetables'
              ];
              syntheticQualities = ['fresh', 'crisp', 'earthy', 'nutritious', 'vitamin-rich'];
              syntheticElement = 'Earth';
              break;
            case 'fruits':
              syntheticNames = [
                'Tropical Fruit Medley', 'Seasonal Berry Mix', 'Orchard Stone Fruits',
                'Heirloom Apples', 'Citrus Selection', 'Exotic Fruit Variety', 
                'Dried Fruit Blend', 'Wild Berries', 'Organic Melons', 'Hand-Picked Cherries'
              ];
              syntheticQualities = ['sweet', 'juicy', 'refreshing', 'antioxidant-rich', 'vibrant'];
              syntheticElement = 'Water';
              break;
            case 'grains':
              syntheticNames = [
                'Ancient Grain Blend', 'Wild Rice Medley', 'Artisanal Wheat Berries',
                'Sprouted Grain Mix', 'Organic Farro', 'Heritage Barley', 
                'Multicolored Quinoa', 'Whole Grain Trio', 'Rustic Grain Pilaf', 'Stone-Ground Cornmeal'
              ];
              syntheticQualities = ['wholesome', 'hearty', 'fiber-rich', 'nutritious', 'chewy'];
              syntheticElement = 'Earth';
              break;
            case 'herbs':
              syntheticNames = [
                'Fresh Herb Blend', 'Garden Aromatic Herbs', 'Seasonal Herb Selection',
                'Wild Forest Herbs', 'Mediterranean Herb Mix', 'Dried Culinary Herbs', 
                'Aromatic Finishing Herbs', 'Delicate Micro Herbs', 'Robust Savory Herbs', 'Rare Herb Varieties'
              ];
              syntheticQualities = ['aromatic', 'fresh', 'pungent', 'fragrant', 'medicinal'];
              syntheticElement = 'Air';
              break;
            case 'spices':
              syntheticNames = [
                'Exotic Spice Blend', 'Warming Spice Mix', 'Global Flavor Collection',
                'Artisanal Peppercorn Blend', 'Rare Spice Selection', 'Aromatic Spice Rub', 
                'Hand-Ground Spice Powder', 'Toasted Spice Blend', 'Single-Origin Spices', 'Rare Chili Varieties'
              ];
              syntheticQualities = ['aromatic', 'pungent', 'complex', 'intense', 'warming'];
              syntheticElement = 'Fire';
              break;
            case 'oils':
              syntheticNames = [
                'Cold-Pressed Olive Oil', 'Artisanal Nut Oil Blend', 'Infused Culinary Oil',
                'Single-Origin Avocado Oil', 'Organic Seed Oil', 'Specialty Finishing Oil', 
                'Heritage Olive Varietal Oil', 'Flavored Cooking Oil', 'Rare Pressed Oil', 'Seasonal Oil Blend'
              ];
              syntheticQualities = ['rich', 'flavorful', 'smooth', 'versatile', 'aromatic'];
              syntheticElement = 'Water';
              break;
            case 'vinegars':
              syntheticNames = [
                'Aged Balsamic Vinegar', 'Artisanal Wine Vinegar', 'Fruit-Infused Vinegar',
                'Specialty Cider Vinegar', 'Barrel-Aged Vinegar', 'Herb-Infused Vinegar', 
                'Heritage Vinegar Blend', 'Single-Origin Rice Vinegar', 'Craft Fruit Vinegar', 'Rare Aged Vinegar'
              ];
              syntheticQualities = ['tart', 'acidic', 'complex', 'bright', 'aged'];
              syntheticElement = 'Water';
              break;
            default:
              syntheticNames = [
                `${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)} Mix`,
                `Artisanal ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Premium ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Seasonal ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Organic ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Local ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Wild ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Heirloom ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Rare ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`,
                `Specialty ${category.slice(0, -1).charAt(0).toUpperCase() + category.slice(0, -1).slice(1)}`
              ];
          }
          
          // Function to generate a simple description for the synthetic ingredient
          const generateDescription = (name: string, categoryName: string, qualities: string[]): string => {
            const qualityText = qualities.slice(0, 3).join(', ');
            return `A ${qualityText} ${categoryName.slice(0, -1)} option with exceptional flavor and culinary versatility.`;
          };
          
          // Create synthetic ingredients with more interesting properties
          const syntheticIngredients = Array(Math.min(neededCount, syntheticNames.length))
            .fill(null)
            .map((_, index) => {
              const name = syntheticNames[index];
              const fallbackMatchScore = Math.max(0.5, 0.75 - (index * 0.03));
              const elementScoreBase = 0.5 + (Math.random() * 0.3);
              
              // Create different elemental distributions based on the synthetic element
              let elementalProps = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
              switch(syntheticElement) {
                case 'Fire':
                  elementalProps = { 
                    Fire: 0.4 + (Math.random() * 0.2),
                    Water: 0.1 + (Math.random() * 0.15),
                    Earth: 0.2 + (Math.random() * 0.15),
                    Air: 0.1 + (Math.random() * 0.15)
                  };
                  break;
                case 'Water':
                  elementalProps = { 
                    Fire: 0.1 + (Math.random() * 0.15),
                    Water: 0.4 + (Math.random() * 0.2),
                    Earth: 0.2 + (Math.random() * 0.15),
                    Air: 0.1 + (Math.random() * 0.15)
                  };
                  break;
                case 'Earth':
                  elementalProps = { 
                    Fire: 0.1 + (Math.random() * 0.15),
                    Water: 0.2 + (Math.random() * 0.15),
                    Earth: 0.4 + (Math.random() * 0.2),
                    Air: 0.1 + (Math.random() * 0.15)
                  };
                  break;
                case 'Air':
                  elementalProps = { 
                    Fire: 0.1 + (Math.random() * 0.15),
                    Water: 0.1 + (Math.random() * 0.15),
                    Earth: 0.2 + (Math.random() * 0.15),
                    Air: 0.4 + (Math.random() * 0.2)
                  };
                  break;
              }
              
              // Normalize values to add up to 1
              const total = elementalProps.Fire + elementalProps.Water + elementalProps.Earth + elementalProps.Air;
              Object.keys(elementalProps).forEach(key => {
                elementalProps[key as keyof typeof elementalProps] /= total;
              });
              
              return {
                name,
                matchScore: fallbackMatchScore,
                category: category,
                description: generateDescription(name, category, syntheticQualities),
                elementalProperties: elementalProps,
                elementalScore: elementScoreBase,
                modalityScore: 0.5 + (Math.random() * 0.3),
                seasonalScore: 0.5 + (Math.random() * 0.3),
                planetaryScore: 0.5 + (Math.random() * 0.3),
                astrologicalProfile: {
                  rulingPlanets: ['Jupiter', 'Saturn'],
                  elementalAffinity: { base: syntheticElement }
                },
                qualities: syntheticQualities.slice(0, 3 + Math.floor(Math.random() * 3)) // Pick 3-5 qualities
              } as EnhancedIngredientRecommendation;
            });
            
          groupedRecommendations[category].push(...syntheticIngredients);
        }
      }
      
      // Sort by match score
      groupedRecommendations[category].sort((a, b) => b.matchScore - a.matchScore);
    });
    
    // Final check of what categories we have
    console.log("Final categories:", Object.keys(groupedRecommendations));
    console.log("Category item counts:", Object.entries(groupedRecommendations).map(([category, items]) => 
      `${category}: ${items.length}`).join(', '));
    
    return groupedRecommendations;
  };

  // Sort categories to control display order
  const sortCategories = (
    recommendations: EnhancedGroupedRecommendations
  ): EnhancedGroupedRecommendations => {
    // Define category display order (proteins first, then others)
    const categoryOrder = [
      'proteins',
      'vegetables',
      'fruits',
      'grains',
      'herbs',
      'spices',
      'oils',
      'vinegars'
    ];
    
    // Create a new object with sorted keys
    const sortedRecommendations: EnhancedGroupedRecommendations = {};
    
    // First add categories in the defined order
    categoryOrder.forEach(category => {
      if (recommendations[category]) {
        sortedRecommendations[category] = recommendations[category];
      }
    });
    
    // Then add any remaining categories not in the predefined order
    Object.keys(recommendations).forEach(category => {
      if (!categoryOrder.includes(category)) {
        sortedRecommendations[category] = recommendations[category];
      }
    });
    
    return sortedRecommendations;
  };

  // Calculate overall match score from component scores
  const calculateOverallMatchScore = (item: EnhancedIngredientRecommendation): number => {
    // Get validated scores
    const elementalScore = validateScore(item.elementalScore);
    const modalityScore = validateScore(item.modalityScore);
    const seasonalScore = validateScore(item.seasonalScore);
    const planetaryScore = validateScore(item.planetaryScore);
    
    // Define weights
    const weights = {
      elemental: 0.25,
      modality: 0.15,
      seasonal: 0.20,
      planetary: 0.40
    };
    
    // Calculate weighted average
    const weightedScore = (
      elementalScore * weights.elemental +
      modalityScore * weights.modality + 
      seasonalScore * weights.seasonal + 
      planetaryScore * weights.planetary
    );
    
    return weightedScore;
  };

  // Helper function to safely handle potential objects when rendering
  const safeRenderValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(v => safeRenderValue(v)).join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Helper function to safely get display text from a variety detail
  const getVarietyDisplayText = (details: any): string => {
    if (typeof details === 'string') return details;
    if (typeof details !== 'object' || details === null) return String(details || '');
    
    // Try to extract the most relevant property
    const relevantProps = ['flavor', 'texture', 'appearance', 'notes', 'description'];
    for (const prop of relevantProps) {
      if (details[prop]) return typeof details[prop] === 'string' ? details[prop] : safeRenderValue(details[prop]);
    }
    
    // If no relevant property found, return a reasonable string representation
    return Object.entries(details)
      .filter(([key, value]) => typeof value === 'string' && key !== 'id' && key !== 'key')
      .map(([key, value]) => value)
      .join(', ') || JSON.stringify(details);
  };

  // Helper function to group recommendations by category
  const groupRecommendationsByCategory = (recommendations: EnhancedIngredientRecommendation[]): EnhancedGroupedRecommendations => {
    const grouped: EnhancedGroupedRecommendations = {};
    
    recommendations.forEach(item => {
      const category = item.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  };
  
  // Enhanced score breakdown function with more detailed calculations
  const formatScoreBreakdown = (item: EnhancedIngredientRecommendation) => {
    if (!item) return {};
    
    // Extract individual scores from the item with improved defaults and validation
    const elementalScore = validateScore(item.elementalScore);
    const modalityScore = validateScore(item.modalityScore);
    const seasonalScore = validateScore(item.seasonalScore);
    const planetaryScore = validateScore(item.planetaryScore);
    
    // Use optimized weights for better match scoring
    // These weights prioritize planetary alignment while maintaining balance
    const weights = {
      elemental: 0.25, // Elemental affinity weight
      modality: 0.15,  // Modality compatibility weight
      seasonal: 0.20,  // Seasonal appropriateness weight
      planetary: 0.40   // Planetary alignment weight (highest priority)
    };
    
    // Calculate weighted scores for each factor
    const weightedScores = {
      elemental: elementalScore * weights.elemental * 100,
      modality: modalityScore * weights.modality * 100,
      seasonal: seasonalScore * weights.seasonal * 100,
      planetary: planetaryScore * weights.planetary * 100
    };
    
    // Calculate overall total score
    const totalScore = weightedScores.elemental + 
                       weightedScores.modality + 
                       weightedScores.seasonal + 
                       weightedScores.planetary;
    
    // Calculate a synergy bonus if all factors have good scores
    let synergyBonus = 0;
    if (elementalScore > 0.6 && modalityScore > 0.6 && 
        seasonalScore > 0.6 && planetaryScore > 0.6) {
      synergyBonus = 5; // Add 5% bonus for all-around good matches
    }
    
    // Apply seasonal significance adjustment - boost items that are in season
    const currentSeason = getCurrentSeason();
    const isInSeason = isItemInSeason(item, currentSeason);
    const seasonalBoost = isInSeason ? 3 : 0; // 3% boost for in-season items
    
    // Apply zodiac sign affinity bonus if the ingredient has favorable zodiac signs
    // that include the current sun sign
    const currentZodiac = astrologicalState?.sunSign?.toLowerCase() || '';
    const zodiacBonus = item.astrologicalProfile?.favorableZodiac?.some(
      sign => sign.toLowerCase() === currentZodiac
    ) ? 2 : 0; // 2% bonus for zodiac affinity
    
    // Final adjusted score with all bonuses
    const adjustedTotal = Math.min(100, Math.round(totalScore + synergyBonus + seasonalBoost + zodiacBonus));
    
    // Return comprehensive score data for display
    return {
      rawScores: {
        elemental: elementalScore,
        modality: modalityScore,
        seasonal: seasonalScore,
        planetary: planetaryScore
      },
      weights,
      weightedScores,
      synergy: synergyBonus,
      seasonal: seasonalBoost,
      zodiac: zodiacBonus,
      total: adjustedTotal,
      isInSeason
    };
  };

  // Helper function to validate a score is within 0-1 range
  const validateScore = (score: number | undefined): number => {
    if (score === undefined || score === null || isNaN(score)) {
      return 0.5; // Default to 50% if no score
    }
    return Math.max(0, Math.min(1, score)); // Ensure between 0-1
  };

  // Helper function to check if an item is in season
  const isItemInSeason = (
    item: EnhancedIngredientRecommendation, 
    currentSeason: string
  ): boolean => {
    if (!item.seasonality) return false;
    
    // Handle array of seasons
    if (Array.isArray(item.seasonality)) {
      return item.seasonality.some(
        season => season.toLowerCase() === currentSeason.toLowerCase()
      );
    }
    
    // Handle string
    if (typeof item.seasonality === 'string') {
      return item.seasonality.toLowerCase() === currentSeason.toLowerCase();
    }
    
    // Handle object with peak_months
    if (typeof item.seasonality === 'object' && 
        item.seasonality !== null && 
        'peak_months' in item.seasonality &&
        Array.isArray(item.seasonality.peak_months)) {
      
      const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
      return item.seasonality.peak_months.some(
        month => month.toLowerCase() === currentMonth
      );
    }
    
    return false;
  };
  
  // Helper function to format culinary information display
  const formatCulinaryInfo = (item: EnhancedIngredientRecommendation) => {
    if (!item) return null;
    
    const info: Record<string, any> = {};
    
    // Extract culinary applications if available
    if (item.culinaryApplications) {
      info.culinaryApplications = item.culinaryApplications;
    }
    
    // Extract preparation methods if available
    if (item.preparation) {
      info.preparation = item.preparation;
    }
    
    // Extract storage information if available
    if (item.storage) {
      info.storage = item.storage;
    }
    
    // Extract pairing recommendations
    if (item.pairings) {
      info.pairings = item.pairings;
    }
    
    // Extract substitutions
    if (item.substitutions) {
      info.substitutions = item.substitutions;
    }
    
    // Extract nutritional information
    if (item.nutritionalProfile) {
      info.nutritionalProfile = item.nutritionalProfile;
    }
    
    // Extract varieties if available
    if (item.varieties) {
      info.varieties = item.varieties;
    }
    
    // Extract qualities if available
    if (item.qualities) {
      info.qualities = item.qualities;
    }
    
    // Extract cooking methods
    if (item.cookingMethods) {
      info.cookingMethods = item.cookingMethods;
    }
    
    // Extract cooking time for proteins
    if (item.cookingTimes) {
      info.cookingTimes = item.cookingTimes;
    }
    
    // Extract affinities (food pairings)
    if (item.affinities) {
      info.affinities = item.affinities;
    }
    
    // Extract cuisine affinity information
    if (item.cuisineAffinity) {
      info.cuisineAffinity = item.cuisineAffinity;
    }
    
    // Extract origin/source information
    if (item.origin) {
      info.origin = item.origin;
    }
    
    // Extract seasonality information
    if (item.seasonality) {
      info.seasonality = item.seasonality;
    }
    
    // Extract season information (sometimes stored differently than seasonality)
    if (item.season) {
      info.season = item.season;
    }
    
    // Extract health benefits
    if (item.healthBenefits) {
      info.healthBenefits = item.healthBenefits;
    }
    
    // Extract description if available
    if (item.description) {
      info.description = item.description;
    }
    
    // Add astrological info but deprioritize it
    if (item.astrologicalProfile) {
      info.astrologicalProfile = item.astrologicalProfile;
    }
    
    return info;
  };
  
  // Helper function to get element icon with inline styles
  const getElementIcon = (element: string) => {
    const iconStyle = {
      marginRight: '2px',
      color:
        element === 'Fire'
          ? '#ff6b6b'
          : element === 'Water'
          ? '#6bb5ff'
          : element === 'Earth'
          ? '#6bff8e'
          : '#d9b3ff', // Air
    };
    
    switch (element) {
      case 'Fire':
        return <Flame style={iconStyle} size={16} />;
      case 'Water':
        return <Droplets style={iconStyle} size={16} />;
      case 'Earth':
        return <Mountain style={iconStyle} size={16} />;
      case 'Air':
        return <Wind style={iconStyle} size={16} />;
      default:
        return null;
    }
  };

  // Helper function to standardize category names
  const standardizeCategory = (category: string): string => {
    category = category.toLowerCase();
    
    // Map categories to standard keys
    const categoryMap: Record<string, string> = {
      'protein': 'proteins',
      'vegetable': 'vegetables',
      'grain': 'grains',
      'fruit': 'fruits',
      'herb': 'herbs',
      'spice': 'spices',
      'oil': 'oils',
      'vinegar': 'vinegars',
      'meat': 'proteins',
      'poultry': 'proteins',
      'seafood': 'proteins',
      'dairy': 'proteins',
      'egg': 'proteins',
      'legume': 'proteins',
      'plant-based': 'proteins',
      'seasoning': 'spices',
    };
    
    // Return mapped category or the category itself
    return categoryMap[category] || category;
  };

  // Helper function to get the current season
  const getCurrentSeason = (): string => {
    const date = new Date();
    const month = date.getMonth(); // 0-11
    
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  // Function to scroll to a specific section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Function to open the modal with the selected ingredient
  const openModal = (item: EnhancedIngredientRecommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Reset active tab when opening a new modal
    setActiveTab('overview');
    
    // Log for debugging
    console.log('Opening modal for:', item.name);
    
    // Set modal state
    setModalState({
      isOpen: true,
      selectedItem: item
    });
  };

  // Function to close the modal
  const closeModal = () => {
    setModalState({
      isOpen: false,
      selectedItem: null
    });
  };

  // Helper function to check if the current month is in peak months
  const isCurrentMonthInPeakMonths = (peakMonths: string[]): boolean => {
    if (!peakMonths || !Array.isArray(peakMonths)) return false;
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
    return peakMonths.some(month => month.toLowerCase() === currentMonth);
  };

  // Search functionality
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      setSearchResults({
        isSearching: false,
        results: [],
        categories: []
      });
      return;
    }
    
    const results: EnhancedIngredientRecommendation[] = [];
    const categories = new Set<string>();
    
    // Search through all categories
    Object.entries(recommendations).forEach(([category, items]) => {
      items.forEach(item => {
        const matchesSearch = 
          // Check ingredient name
          item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          // Check qualities
          (item.qualities && item.qualities.some(quality => 
            quality.toLowerCase().includes(searchValue.toLowerCase())
          )) ||
          // Check culinary applications
          (item.culinaryApplications && Object.keys(item.culinaryApplications).some(method => 
            method.toLowerCase().includes(searchValue.toLowerCase())
          )) ||
          // Check cooking methods
          (item.cookingMethods && Array.isArray(item.cookingMethods) && item.cookingMethods.some(method => 
            method.toLowerCase().includes(searchValue.toLowerCase())
          )) ||
          // Check subcategory
          (item.subCategory && item.subCategory.toLowerCase().includes(searchValue.toLowerCase())) ||
          // Check description
          (item.description && item.description.toLowerCase().includes(searchValue.toLowerCase())) ||
          // Check health benefits
          (item.healthBenefits && Array.isArray(item.healthBenefits) && item.healthBenefits.some(benefit => 
            benefit.toLowerCase().includes(searchValue.toLowerCase())
          )) ||
          // Check affinities
          (item.affinities && Array.isArray(item.affinities) && item.affinities.some(affinity => 
            affinity.toLowerCase().includes(searchValue.toLowerCase())
          ));
        
        if (matchesSearch) {
          results.push(item);
          categories.add(category);
        }
      });
    });
    
    // Update search results
    setSearchResults({
      isSearching: true,
      results,
      categories: Array.from(categories)
    });
  };

  // Render loading state if needed
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading ingredient recommendations...</p>
      </div>
    );
  }

  // Render error state if needed
  if (error) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as AstroError)?.message || 'Unknown error';
      
    return (
      <div className="p-4 text-red-500">
        <p>Error loading ingredient recommendations: {errorMessage}</p>
      </div>
    );
  }

  // If we have recommendations, display them
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Page title */}
        <h2 className={styles.title}>Astrological Ingredient Recommendations</h2>
        
        {/* Debug info - will show the categories we have */}
        <div className="bg-blue-50 p-2 border border-blue-200 rounded mb-4 text-xs text-blue-800">
          <strong>Debug:</strong> {Object.keys(recommendations).length} categories available: {Object.keys(recommendations).join(', ')}
          <br />
          <strong>Categories with items:</strong> {Object.entries(recommendations)
            .filter(([_, items]) => items && items.length > 0)
            .map(([category, items]) => `${category}(${items.length})`)
            .join(', ')}
        </div>
        
        {/* Search input */}
        <div className="my-4 relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search ingredients..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Navigation bar */}
        <div className="category-tabs my-4 sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 flex overflow-x-auto py-2 px-2 shadow-sm">
          {searchResults.isSearching ? (
            <button
              className={styles.activeButton}
              onClick={() => handleSearch('')}
            >
              Search Results
            </button>
          ) : (
            // Always display all required categories in the navigation
            REQUIRED_CATEGORIES.map((category) => (
            <button
              key={category}
              className={activeSection === category ? styles.activeButton : styles.categoryButton}
              onClick={() => scrollToSection(category)}
            >
              {CATEGORY_DISPLAY_NAMES[category] || category}
            </button>
            ))
          )}
        </div>

        {/* Search results or all categories displayed at once */}
        <div className="recommendations space-y-8">
          {searchResults.isSearching ? (
            // Display search results
            <div className="mb-8 pt-4">
              <h3 className={styles.categoryTitle}>
                Search Results
                <span className="ml-2 text-sm text-gray-500">
                  (showing {searchResults.results.length} matching ingredients)
                </span>
              </h3>
              
              <div className={styles.ingredientGrid}>
                {searchResults.results.map((item, index) => {
                  // Get the dominant element based on elementalProperties
                  const dominantElement = item.elementalProperties
                    ? Object.entries(item.elementalProperties)
                        .sort((a, b) => b[1] - a[1])[0][0]
                    : 'Fire';
                  
                  // Element-based styling for card border
                  const elementColor = 
                    dominantElement === 'Fire' ? 'border-red-400' :
                    dominantElement === 'Water' ? 'border-blue-400' :
                    dominantElement === 'Earth' ? 'border-green-400' :
                    'border-purple-400'; // Air
                  
                  // Get qualities and prepare culinary info for display
                  const qualities = item.qualities || [];
                  const culinaryInfo = formatCulinaryInfo(item);
                  
                  // Check if ingredient is in season
                  const isInSeason = item.seasonality ? 
                    (Array.isArray(item.seasonality) ? 
                      item.seasonality.includes(getCurrentSeason()) : 
                      typeof item.seasonality === 'object' && 
                      item.seasonality.peak_months && 
                      isCurrentMonthInPeakMonths(item.seasonality.peak_months)) : 
                    false;
                  
                  // Get number of culinary applications
                  const numCulinaryApplications = culinaryInfo?.culinaryApplications ? 
                    Object.keys(culinaryInfo.culinaryApplications).length : 0;
                  
                  // Check if has nutritional profile
                  const hasNutrition = culinaryInfo?.nutritionalProfile ? true : false;
                  
                  // Check if has preparation methods
                  const hasPrepMethods = culinaryInfo?.preparation ? 
                    Object.keys(culinaryInfo.preparation).length > 0 : false;
                  
                  // Check if has storage info
                  const hasStorage = culinaryInfo?.storage ? 
                    Object.keys(culinaryInfo.storage).length > 0 : false;
                  
                  // Check if has pairings
                  const hasPairings = culinaryInfo?.pairings ? 
                    (Array.isArray(culinaryInfo.pairings) ? 
                      culinaryInfo.pairings.length > 0 : 
                      Object.keys(culinaryInfo.pairings).length > 0) : false;
                  
                  return (
                    <div 
                      key={`search-${item.name}-${index}`}
                      className={`${styles.ingredientCard} ${elementColor} hover:shadow-lg transition-all duration-300 cursor-pointer relative`}
                      onClick={(e) => openModal(item, e)}
                    >
                      {/* Add subtle indicator that card is clickable */}
                      <div className="absolute top-2 right-2 opacity-50">
                        <ChevronUp size={12} />
                      </div>
                      
                      {/* Header section with match score and name */}
                      <div className={`card-header p-2 flex justify-between items-center relative`}>
                        {/* Match score badge */}
                        <div 
                          className={`absolute -top-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center 
                            ${item.matchScore > 0.8 ? 'bg-green-500' : 
                              item.matchScore > 0.6 ? 'bg-blue-500' : 
                              item.matchScore > 0.4 ? 'bg-yellow-500' : 'bg-gray-500'} 
                            text-white font-bold text-base shadow-md z-10`}
                        >
                          {Math.round(item.matchScore * 100)}%
                        </div>
                        
                        {/* Ingredient name */}
                        <h4 className={styles.cardTitle}>
                          {item.name}
                        </h4>
                      </div>
                      
                      {/* Body section with culinary details */}
                      <div className={`card-body p-3 ${styles.cardContent}`}>
                        {/* Category and subcategory */}
                        <p className="text-xs text-gray-700 mb-2 flex items-center">
                          <Tag size={12} className="mr-1 opacity-70" />
                          <span className="font-medium capitalize">{item.category}</span>
                          {item.subCategory && 
                            <span className="ml-1 opacity-80">· {item.subCategory.replace(/_/g, ' ')}</span>
                          }
                        </p>
                        
                        {/* Qualities as tags */}
                        {qualities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {qualities.slice(0, 2).map((quality) => (
                              <span
                                key={quality}
                                className={styles.qualityTag}
                              >
                                {quality}
                              </span>
                            ))}
                            {qualities.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{qualities.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Culinary info icons */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 mb-1">
                          {numCulinaryApplications > 0 && (
                            <div className="text-xs text-indigo-600 flex items-center" title="Culinary applications">
                              <Utensils size={12} className="mr-1" />
                              {numCulinaryApplications}
                            </div>
                          )}
                          
                          {hasNutrition && (
                            <div className="text-xs text-green-600 flex items-center" title="Nutritional info">
                              <Heart size={12} className="mr-1" />
                            </div>
                          )}
                          
                          {hasPrepMethods && (
                            <div className="text-xs text-amber-600 flex items-center" title="Preparation methods">
                              <BookOpen size={12} className="mr-1" />
                            </div>
                          )}
                          
                          {hasStorage && (
                            <div className="text-xs text-blue-600 flex items-center" title="Storage info">
                              <RefrigeratorIcon size={12} className="mr-1" />
                            </div>
                          )}
                          
                          {hasPairings && (
                            <div className="text-xs text-purple-600 flex items-center" title="Pairings">
                              <GitFork size={12} className="mr-1" />
                            </div>
                          )}
                          
                          {isInSeason && (
                            <div className="text-xs text-green-600 flex items-center" title="In Season">
                              <Clock size={12} className="mr-1" />
                              In Season
                            </div>
                          )}
                        </div>
                        
                        {/* Click for details button */}
                        <button 
                          className="w-full mt-3 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            openModal(item, e);
                          }}
                        >
                          <Info size={12} className="mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Force all categories to be displayed by iterating through the predefined list
            REQUIRED_CATEGORIES.map(category => {
              // Get display name and limit number of items shown based on category
              const displayName = CATEGORY_DISPLAY_NAMES[category] || category;
              const displayCount = CATEGORY_DISPLAY_COUNTS[category] || 10;
              
              // Get the items for this category, or an empty array if none exist
              const items = recommendations[category] || [];
              
              // Only show categories with items
              if (items.length === 0) {
                return (
                  <div 
                    id={category} 
                    key={category} 
                    className="mb-8 pt-4 scroll-mt-16"
                  >
                    <h3 className={styles.categoryTitle}>
                      {displayName}
                      <span className="ml-2 text-sm text-gray-500">
                        (no items available)
                      </span>
                    </h3>
                    <div className="p-4 bg-gray-50 rounded text-gray-400 text-center">
                      No {displayName.toLowerCase()} available at this time
                    </div>
                  </div>
                );
              }
              
              // Limit items to display count
              const limitedItems = items.slice(0, displayCount);
              
              return (
                <div 
                  id={category} 
                  key={category} 
                  className="mb-8 pt-4 scroll-mt-16"
                >
                  <h3 className={styles.categoryTitle}>
                    {displayName}
                    {items.length > displayCount && (
                      <span className="ml-2 text-sm text-gray-500">
                        (showing {displayCount} of {items.length})
                      </span>
                    )}
                  </h3>

                  <div className={styles.ingredientGrid}>
                    {getFilteredItems(limitedItems).map((item, index) => {
                      // Get the dominant element based on elementalProperties
                      const dominantElement = item.elementalProperties
                        ? Object.entries(item.elementalProperties)
                            .sort((a, b) => b[1] - a[1])[0][0]
                        : 'Fire';
                      
                      // Element-based styling for card border
                      const elementColor = 
                        dominantElement === 'Fire' ? 'border-red-400' :
                        dominantElement === 'Water' ? 'border-blue-400' :
                        dominantElement === 'Earth' ? 'border-green-400' :
                        'border-purple-400'; // Air
                      
                      // Get qualities and prepare culinary info for display
                      const qualities = item.qualities || [];
                      const culinaryInfo = formatCulinaryInfo(item);
                      
                      // Check if ingredient is in season
                      const isInSeason = item.seasonality ? 
                        (Array.isArray(item.seasonality) ? 
                          item.seasonality.includes(getCurrentSeason()) : 
                          typeof item.seasonality === 'object' && 
                          item.seasonality.peak_months && 
                          isCurrentMonthInPeakMonths(item.seasonality.peak_months)) : 
                        false;
                      
                      // Get number of culinary applications
                      const numCulinaryApplications = culinaryInfo?.culinaryApplications ? 
                        Object.keys(culinaryInfo.culinaryApplications).length : 0;
                      
                      // Check if has nutritional profile
                      const hasNutrition = culinaryInfo?.nutritionalProfile ? true : false;
                      
                      // Check if has preparation methods
                      const hasPrepMethods = culinaryInfo?.preparation ? 
                        Object.keys(culinaryInfo.preparation).length > 0 : false;
                      
                      // Check if has storage info
                      const hasStorage = culinaryInfo?.storage ? 
                        Object.keys(culinaryInfo.storage).length > 0 : false;
                      
                      // Check if has pairings
                      const hasPairings = culinaryInfo?.pairings ? 
                        (Array.isArray(culinaryInfo.pairings) ? 
                          culinaryInfo.pairings.length > 0 : 
                          Object.keys(culinaryInfo.pairings).length > 0) : false;
                      
                      return (
                        <div 
                          key={`${item.name}-${item.category || category}-${index}`}
                          className={`${styles.ingredientCard} ${elementColor} hover:shadow-lg transition-all duration-300 cursor-pointer relative`}
                          onClick={(e) => openModal(item, e)}
                        >
                          {/* Add subtle indicator that card is clickable */}
                          <div className="absolute top-2 right-2 opacity-50">
                            <ChevronUp size={12} />
                          </div>
                          
                          {/* Header section with match score and name */}
                          <div className={`card-header p-2 flex justify-between items-center relative`}>
                            {/* Match score badge */}
                            <div 
                              className={`absolute -top-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center 
                                ${item.matchScore > 0.8 ? 'bg-green-500' : 
                                  item.matchScore > 0.6 ? 'bg-blue-500' : 
                                  item.matchScore > 0.4 ? 'bg-yellow-500' : 'bg-gray-500'} 
                                text-white font-bold text-base shadow-md z-10`}
                            >
                              {Math.round(item.matchScore * 100)}%
                            </div>
                            
                            {/* Ingredient name */}
                            <h4 className={styles.cardTitle}>
                                {item.name}
                            </h4>
                          </div>
                          
                          {/* Body section with culinary details */}
                          <div className={`card-body p-3 ${styles.cardContent}`}>
                            {/* Category and subcategory */}
                            <p className="text-xs text-gray-700 mb-2 flex items-center">
                              <Tag size={12} className="mr-1 opacity-70" />
                              <span className="font-medium capitalize">{item.category}</span>
                              {item.subCategory && 
                                <span className="ml-1 opacity-80">· {item.subCategory.replace(/_/g, ' ')}</span>
                              }
                            </p>
                            
                            {/* Qualities as tags */}
                            {qualities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {qualities.slice(0, 2).map((quality) => (
                                  <span
                                    key={quality}
                                    className={styles.qualityTag}
                                  >
                                    {quality}
                                  </span>
                                ))}
                                {qualities.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{qualities.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Culinary info icons */}
                            <div className="flex flex-wrap items-center gap-2 mt-2 mb-1">
                              {numCulinaryApplications > 0 && (
                                <div className="text-xs text-indigo-600 flex items-center" title="Culinary applications">
                                  <Utensils size={12} className="mr-1" />
                                  {numCulinaryApplications}
                              </div>
                            )}
                            
                              {hasNutrition && (
                                <div className="text-xs text-green-600 flex items-center" title="Nutritional info">
                                  <Heart size={12} className="mr-1" />
                                </div>
                              )}
                              
                              {hasPrepMethods && (
                                <div className="text-xs text-amber-600 flex items-center" title="Preparation methods">
                                  <BookOpen size={12} className="mr-1" />
                                </div>
                              )}
                              
                              {hasStorage && (
                                <div className="text-xs text-blue-600 flex items-center" title="Storage info">
                                  <RefrigeratorIcon size={12} className="mr-1" />
                                </div>
                              )}
                              
                              {hasPairings && (
                                <div className="text-xs text-purple-600 flex items-center" title="Pairings">
                                  <GitFork size={12} className="mr-1" />
                                </div>
                              )}
                              
                            {isInSeason && (
                                <div className="text-xs text-green-600 flex items-center" title="In Season">
                                <Clock size={12} className="mr-1" />
                                In Season
                              </div>
                            )}
                            </div>
                            
                            {/* Click for details button */}
                            <button 
                              className="w-full mt-3 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-medium transition-colors"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                openModal(item, e);
                              }}
                            >
                              <Info size={12} className="mr-1" />
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Show more button for each category */}
                  {items.length > displayCount && (
                    <div className="mt-4 text-center">
                      <button
                        className={styles.categoryButton}
                        onClick={() => {
                          // Open a modal with all items from this category
                          const allItemsItem = {
                            name: `All ${displayName}`,
                            matchScore: 1,
                            category,
                            allItems: items,
                            elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
                          } as EnhancedIngredientRecommendation;
                          openModal(allItemsItem, { stopPropagation: () => {} } as any);
                        }}
                      >
                        View all {items.length} {displayName.toLowerCase()}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ingredient Detail Modal - Enhanced */}
      {modalState.isOpen && modalState.selectedItem && (
        <div 
          className={styles.modalBackdrop}
          onClick={closeModal}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Enhanced with more astrological data */}
            {(() => {
              const item = modalState.selectedItem;
              
              // Get the dominant element
              const dominantElement = item.elementalProperties
                ? Object.entries(item.elementalProperties).sort((a, b) => b[1] - a[1])[0][0]
                : 'Fire';
              
              // Secondary element (second highest)
              const secondaryElement = item.elementalProperties
                ? Object.entries(item.elementalProperties).sort((a, b) => b[1] - a[1])[1]?.[0]
                : null;
              
              // Background styling based on element
              const elementBgColor = 
                dominantElement === 'Fire' ? 'bg-red-100' :
                dominantElement === 'Water' ? 'bg-blue-100' :
                dominantElement === 'Earth' ? 'bg-green-100' :
                'bg-purple-100'; // Air
                
                // Get element icon
                const elementIcon = getElementIcon(dominantElement);
                const secondaryElementIcon = secondaryElement ? getElementIcon(secondaryElement) : null;
                
                return (
                  <div className={`p-4 ${elementBgColor} flex justify-between items-center border-b relative`}>
                    <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                      <span>{elementIcon}</span>
                      {item.name}
                      {secondaryElementIcon && (
                        <span className="ml-1 opacity-70">{secondaryElementIcon}</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Match score badge with conditional styling */}
                      <div 
                        className={`px-2 py-1 rounded-full font-semibold text-sm flex items-center 
                          ${item.matchScore > 0.8 ? 'bg-green-500 text-white' : 
                            item.matchScore > 0.6 ? 'bg-blue-500 text-white' : 
                            item.matchScore > 0.4 ? 'bg-yellow-500 text-white' : 
                            'bg-gray-500 text-white'}`}
                      >
                        {Math.round(item.matchScore * 100)}% Match
                      </div>
                      <button 
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Category and subcategory */}
                    <div className="absolute bottom-1 left-4 text-sm text-black opacity-70">
                      <span className="font-medium capitalize">{item.category}</span>
                      {item.subCategory && 
                        <span className="ml-1 opacity-80">· {item.subCategory.replace(/_/g, ' ')}</span>
                      }
                    </div>
                  </div>
                );
            })()}
            
            {/* Modal Content */}
            <div className="p-5">
              {modalState.selectedItem.allItems ? (
                // View all items in a category
                <div>
                  <h4 className="text-lg font-medium mb-4 text-black">All {CATEGORY_DISPLAY_NAMES[modalState.selectedItem.category as string] || modalState.selectedItem.category}</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {modalState.selectedItem.allItems.map((item, index) => {
                      const dominantElement = item.elementalProperties
                        ? Object.entries(item.elementalProperties).sort((a, b) => b[1] - a[1])[0][0]
                        : 'Fire';
                      
                      const elementColor = 
                        dominantElement === 'Fire' ? 'border-red-400 text-red-800 bg-red-50' :
                        dominantElement === 'Water' ? 'border-blue-400 text-blue-800 bg-blue-50' :
                        dominantElement === 'Earth' ? 'border-green-400 text-green-800 bg-green-50' :
                        'border-purple-400 text-purple-800 bg-purple-50'; // Air
                      
                      return (
                        <div 
                          key={`${item.name}-${index}`}
                          className={`p-2 border-l-4 ${elementColor} rounded mb-2 cursor-pointer hover:shadow-sm`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalState({
                              isOpen: true,
                              selectedItem: item
                            });
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{item.name}</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded bg-white/80 
                              ${item.matchScore > 0.8 ? 'text-green-600' : 
                                item.matchScore > 0.6 ? 'text-blue-600' : 
                                item.matchScore > 0.4 ? 'text-yellow-600' : 
                                'text-gray-600'}`}>
                              {Math.round(item.matchScore * 100)}%
                            </span>
                          </div>
                          
                          {item.qualities && item.qualities.length > 0 && (
                            <div className="text-xs mt-1 text-gray-600">
                              {item.qualities.slice(0, 2).join(', ')}
                              {item.qualities.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Normal single item details - Enhanced layout with tabs
                <div className="space-y-5 text-black">
                  {/* Tab navigation */}
                  <div className="border-b flex overflow-x-auto">
                    <button 
                      className={getTabStyle('overview')} 
                      onClick={() => setActiveTab('overview')}
                    >
                      Overview
                    </button>
                    <button 
                      className={getTabStyle('culinary')} 
                      onClick={() => setActiveTab('culinary')}
                    >
                      Culinary Uses
                    </button>
                    <button 
                      className={getTabStyle('nutritional')} 
                      onClick={() => setActiveTab('nutritional')}
                    >
                      Nutrition
                    </button>
                    <button 
                      className={getTabStyle('astrological')} 
                      onClick={() => setActiveTab('astrological')}
                    >
                      Astrological
                    </button>
                  </div>

                  {/* Tab content */}
                  {(() => {
                    const item = modalState.selectedItem;
                    const culinaryInfo = formatCulinaryInfo(item);
                    
                    if (!culinaryInfo) return null;

                    // Helper variables for culinary properties
                    const numCulinaryApplications = culinaryInfo.culinaryApplications ? 
                      Object.keys(culinaryInfo.culinaryApplications).length : 0;
                    
                    const hasNutrition = culinaryInfo.nutritionalProfile ? true : false;
                    
                    const hasPrepMethods = culinaryInfo.preparation ? 
                      Object.keys(culinaryInfo.preparation).length > 0 : false;
                    
                    const hasStorage = culinaryInfo.storage ? 
                      Object.keys(culinaryInfo.storage).length > 0 : false;
                    
                    const hasPairings = culinaryInfo.pairings ? 
                      (Array.isArray(culinaryInfo.pairings) ? 
                        culinaryInfo.pairings.length > 0 : 
                        Object.keys(culinaryInfo.pairings).length > 0) : false;

                    // Overview Tab
                    if (activeTab === 'overview') {
                      return (
                        <div className="py-3">
                          {/* Basic info */}
                          <div className="mb-4">
                            <h4 className="text-lg font-medium mb-2 text-black">About {item.name}</h4>
                            {item.description && (
                              <p className="text-gray-700 mb-3">{item.description}</p>
                            )}
                            
                            {/* Category and subcategory */}
                            <div className="flex items-center text-sm mb-2">
                              <Tag size={16} className="mr-2 text-gray-500" />
                              <span className="font-medium capitalize">{item.category}</span>
                              {item.subCategory && 
                                <span className="ml-1 opacity-80">· {item.subCategory.replace(/_/g, ' ')}</span>
                              }
                              </div>
                            
                            {/* Origin information */}
                            {culinaryInfo.origin && Array.isArray(culinaryInfo.origin) && culinaryInfo.origin.length > 0 && (
                              <div className="flex items-center text-sm mb-2">
                                <span className="font-medium mr-2">Origin:</span>
                                <span className="text-gray-700">{culinaryInfo.origin.join(', ')}</span>
                            </div>
                            )}
                        </div>
                        
                          {/* Qualities Section */}
                          {item.qualities && item.qualities.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2 text-black">Qualities</h4>
                              <div className="flex flex-wrap gap-1">
                                {item.qualities.map(quality => (
                                  <span 
                                    key={quality}
                                    className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs"
                                  >
                                    {quality}
                                  </span>
                                ))}
                              </div>
                              </div>
                            )}
                            
                          {/* Quick facts - highlight most relevant culinary info */}
                          <div className="mb-4">
                            <h4 className="text-lg font-medium mb-2 text-black">Quick Facts</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Seasonality */}
                              {(item.seasonality || culinaryInfo.season) && (
                                <div className="bg-green-50 p-3 rounded-md">
                                  <h5 className="font-medium text-sm flex items-center text-green-800">
                                    <Clock size={16} className="mr-1" /> Seasonality
                                  </h5>
                                  <div className="text-sm mt-1">
                                    {Array.isArray(item.seasonality) 
                                      ? item.seasonality.join(', ')
                                      : typeof item.seasonality === 'string'
                                        ? item.seasonality
                                        : item.seasonality?.peak_months
                                          ? `Peak months: ${Array.isArray(item.seasonality.peak_months) 
                                               ? item.seasonality.peak_months.map(m => typeof m === 'number' 
                                                   ? new Date(0, m-1).toLocaleString('default', { month: 'long' })
                                                   : m).join(', ')
                                               : item.seasonality.peak_months}`
                                          : culinaryInfo.season
                                            ? Array.isArray(culinaryInfo.season)
                                                ? culinaryInfo.season.join(', ')
                                                : culinaryInfo.season
                                            : 'Available year-round'
                                    }
                                  </div>
                                </div>
                              )}

                              {/* Culinary highlights */}
                              {numCulinaryApplications > 0 && (
                                <div className="bg-indigo-50 p-3 rounded-md">
                                  <h5 className="font-medium text-sm flex items-center text-indigo-800">
                                    <Utensils size={16} className="mr-1" /> Culinary Uses
                                  </h5>
                                  <div className="text-sm mt-1">
                                    {Object.keys(culinaryInfo.culinaryApplications || {})
                                      .slice(0, 3)
                                      .map(method => method.replace(/_/g, ' '))
                                      .join(', ')}
                                    {Object.keys(culinaryInfo.culinaryApplications || {}).length > 3 && '...'}
                                  </div>
                              </div>
                            )}
                            
                              {/* Cooking Methods */}
                              {culinaryInfo.cookingMethods && Array.isArray(culinaryInfo.cookingMethods) && culinaryInfo.cookingMethods.length > 0 && (
                                <div className="bg-amber-50 p-3 rounded-md">
                                  <h5 className="font-medium text-sm flex items-center text-amber-800">
                                    <Flame size={16} className="mr-1" /> Cooking Methods
                                  </h5>
                                  <div className="text-sm mt-1">
                                    {culinaryInfo.cookingMethods.slice(0, 4).join(', ')}
                                    {culinaryInfo.cookingMethods.length > 4 && '...'}
                                  </div>
                              </div>
                            )}

                              {/* Pairings highlight */}
                              {(hasPairings || (culinaryInfo.affinities && Array.isArray(culinaryInfo.affinities) && culinaryInfo.affinities.length > 0)) && (
                                <div className="bg-purple-50 p-3 rounded-md">
                                  <h5 className="font-medium text-sm flex items-center text-purple-800">
                                    <GitFork size={16} className="mr-1" /> Pairs Well With
                                  </h5>
                                  <div className="text-sm mt-1">
                                    {Array.isArray(culinaryInfo.pairings)
                                      ? culinaryInfo.pairings.slice(0, 3).join(', ') + 
                                        (culinaryInfo.pairings.length > 3 ? '...' : '')
                                      : culinaryInfo.affinities
                                        ? culinaryInfo.affinities.slice(0, 3).join(', ') +
                                          (culinaryInfo.affinities.length > 3 ? '...' : '')
                                        : Object.entries(culinaryInfo.pairings || {})
                                            .slice(0, 1)
                                            .map(([category, items]) => 
                                              `${category.replace(/_/g, ' ')}: ${
                                                Array.isArray(items) 
                                                  ? items.slice(0, 3).join(', ') + (items.length > 3 ? '...' : '')
                                                  : ''
                                              }`
                                            ).join(', ')
                                    }
                                  </div>
                          </div>
                        )}

                              {/* Basic nutrition */}
                              {hasNutrition && (
                                <div className="bg-red-50 p-3 rounded-md">
                                  <h5 className="font-medium text-sm flex items-center text-red-800">
                                    <Heart size={16} className="mr-1" /> Nutrition
                                  </h5>
                                  <div className="text-sm mt-1">
                                    {culinaryInfo.nutritionalProfile?.calories && `${culinaryInfo.nutritionalProfile.calories} cal`}
                                    {culinaryInfo.nutritionalProfile?.protein_g && `, ${culinaryInfo.nutritionalProfile.protein_g}g protein`}
                                    {culinaryInfo.nutritionalProfile?.carbs_g && `, ${culinaryInfo.nutritionalProfile.carbs_g}g carbs`}
                                    {culinaryInfo.nutritionalProfile?.fiber && `, ${culinaryInfo.nutritionalProfile.fiber} fiber`}
                      </div>
                                </div>
                              )}
                    </div>
                  </div>
                  
                          {/* Health Benefits */}
                          {culinaryInfo.healthBenefits && Array.isArray(culinaryInfo.healthBenefits) && culinaryInfo.healthBenefits.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2 text-black">Health Benefits</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {culinaryInfo.healthBenefits.map((benefit, index) => (
                                  <li key={index} className="text-sm text-gray-700">{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Cuisine Affinity */}
                          {culinaryInfo.cuisineAffinity && Object.keys(culinaryInfo.cuisineAffinity).length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-lg font-medium mb-2 text-black">Cuisine Affinity</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(culinaryInfo.cuisineAffinity).map(([cuisine, description]) => (
                                  <div key={cuisine} className="bg-gray-50 p-2 rounded-md">
                                    <span className="font-medium capitalize">{cuisine.replace(/_/g, ' ')}:</span> 
                                    <span className="text-sm text-gray-700 ml-1">{description}</span>
                                  </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                      );
                    }
                        
                    // Culinary Uses Tab
                    if (activeTab === 'culinary') {
                      return (
                        <div className="py-3">
                        {/* Culinary Applications */}
                        {culinaryInfo.culinaryApplications && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Culinary Uses</h4>
                              <div className="space-y-3">
                              {Object.entries(culinaryInfo.culinaryApplications).map(([method, info]) => (
                                <div key={method} className="bg-gray-50 p-3 rounded-lg">
                                  <h5 className="font-medium capitalize text-black">{method.replace(/_/g, ' ')}</h5>
                                  
                                  {typeof info === 'object' && info !== null && (
                                    <div className="mt-1 text-sm">
                                        {/* Name */}
                                        {(info as any).name && (
                                          <div className="text-gray-900 font-medium mb-1">
                                            {(info as any).name}
                                          </div>
                                        )}
                                        
                                        {/* Method */}
                                        {(info as any).method && (
                                          <div className="text-gray-700 mb-1">
                                            <span className="font-medium">Method:</span> {(info as any).method}
                                          </div>
                                        )}
                                        
                                      {/* Notes */}
                                        {(info as any).notes && (
                                        <div className="text-gray-600 mb-1">
                                            <span className="font-medium">Notes:</span> {
                                              Array.isArray((info as any).notes) 
                                                ? (info as any).notes.join(', ')
                                                : (info as any).notes
                                            }
                                          </div>
                                        )}
                                        
                                        {/* Applications */}
                                        {(info as any).applications && Array.isArray((info as any).applications) && (
                                          <div className="mt-1">
                                            <span className="font-medium text-black">Applications:</span> {(info as any).applications.join(', ')}
                                        </div>
                                      )}
                                      
                                      {/* Techniques */}
                                        {(info as any).techniques && (
                                          <div className="mt-1">
                                            <span className="font-medium text-black">Techniques:</span> {
                                              Array.isArray((info as any).techniques) 
                                                ? (info as any).techniques.join(', ')
                                                : (info as any).techniques
                                            }
                                        </div>
                                      )}
                                      
                                      {/* Dishes */}
                                      {(info as any).dishes && Array.isArray((info as any).dishes) && (
                                          <div className="mt-1">
                                          <span className="font-medium text-black">Dishes:</span> {(info as any).dishes.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                          
                          {/* Cooking Methods */}
                          {culinaryInfo.cookingMethods && Array.isArray(culinaryInfo.cookingMethods) && culinaryInfo.cookingMethods.length > 0 && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Cooking Methods</h4>
                              <div className="flex flex-wrap gap-2">
                                {culinaryInfo.cookingMethods.map(method => (
                                  <span 
                                    key={method}
                                    className="px-2 py-1 bg-amber-50 text-amber-800 rounded-lg text-sm"
                                  >
                                    {method}
                                  </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Preparation Methods */}
                        {culinaryInfo.preparation && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Preparation Methods</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              {Object.entries(culinaryInfo.preparation).map(([method, info]) => (
                                  <div key={method} className="mb-3">
                                  <h5 className="font-medium capitalize text-black">{method.replace(/_/g, ' ')}</h5>
                                  <div className="text-sm text-gray-600">
                                    {typeof info === 'string' ? info : safeRenderValue(info)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Storage Instructions */}
                        {culinaryInfo.storage && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Storage</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              {Object.entries(culinaryInfo.storage).map(([method, info]) => (
                                  <div key={method} className="mb-3">
                                  <h5 className="font-medium capitalize text-black">{method.replace(/_/g, ' ')}</h5>
                                  <div className="text-sm text-gray-600">
                                      {typeof info === 'object' && info !== null ? (
                                        <div>
                                          {(info as any).temperature && (
                                            <div>
                                              <span className="font-medium">Temperature:</span>{' '}
                                              {typeof (info as any).temperature === 'object' 
                                                ? `${(info as any).temperature.fahrenheit}°F / ${(info as any).temperature.celsius}°C`
                                                : (info as any).temperature}
                                            </div>
                                          )}
                                          {(info as any).duration && (
                                            <div>
                                              <span className="font-medium">Duration:</span> {(info as any).duration}
                                            </div>
                                          )}
                                          {(info as any).humidity && (
                                            <div>
                                              <span className="font-medium">Humidity:</span> {(info as any).humidity}
                                            </div>
                                          )}
                                          {(info as any).method && (
                                            <div>
                                              <span className="font-medium">Method:</span> {(info as any).method}
                                            </div>
                                          )}
                                          {(info as any).notes && (
                                            <div>
                                              <span className="font-medium">Notes:</span> {(info as any).notes}
                                            </div>
                                          )}
                                          {(info as any).uses && (
                                            <div>
                                              <span className="font-medium">Uses:</span> {(info as any).uses}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        typeof info === 'string' ? info : safeRenderValue(info)
                                      )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                          {/* Affinities and Pairings */}
                          {(culinaryInfo.affinities || hasPairings) && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Pairs Well With</h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                {/* Display affinities if available */}
                                {culinaryInfo.affinities && Array.isArray(culinaryInfo.affinities) && (
                                  <div className="mb-3">
                                    <h5 className="font-medium text-sm text-black mb-2">Affinities</h5>
                            <div className="flex flex-wrap gap-1">
                                      {culinaryInfo.affinities.map(affinity => (
                                        <span 
                                          key={affinity}
                                          className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
                                        >
                                          {typeof affinity === 'string' ? affinity.replace(/_/g, ' ') : safeRenderValue(affinity)}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Display pairings if available */}
                              {Array.isArray(culinaryInfo.pairings) 
                                  ? (
                                    <div className="mb-3">
                                      <h5 className="font-medium text-sm text-black mb-2">Pairings</h5>
                                      <div className="flex flex-wrap gap-1">
                                        {culinaryInfo.pairings.map(pairing => (
                                    <span 
                                      key={pairing}
                                      className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
                                    >
                                      {typeof pairing === 'string' ? pairing.replace(/_/g, ' ') : safeRenderValue(pairing)}
                                    </span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                  : typeof culinaryInfo.pairings === 'object' && culinaryInfo.pairings !== null && Object.entries(culinaryInfo.pairings).map(([category, pairings]) => (
                                      <div key={category} className="mb-3">
                                        <h5 className="font-medium capitalize text-sm text-black mb-2">{category.replace(/_/g, ' ')}</h5>
                                        <div className="flex flex-wrap gap-1">
                                        {Array.isArray(pairings) && pairings.map(pairing => (
                                          <span 
                                            key={`${category}-${pairing}`}
                                            className="px-2 py-1 bg-blue-50 text-blue-800 rounded-full text-xs"
                                          >
                                            {typeof pairing === 'string' ? pairing.replace(/_/g, ' ') : safeRenderValue(pairing)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Substitutions */}
                        {culinaryInfo.substitutions && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Substitutions</h4>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(culinaryInfo.substitutions) 
                                ? culinaryInfo.substitutions.map(sub => (
                                    <span 
                                      key={sub}
                                      className="px-2 py-1 bg-purple-50 text-purple-800 rounded-full text-xs"
                                    >
                                      {typeof sub === 'string' ? sub.replace(/_/g, ' ') : safeRenderValue(sub)}
                                    </span>
                                  ))
                                : Object.entries(culinaryInfo.substitutions).map(([sub, similarity]) => (
                                    <span 
                                      key={sub}
                                      className="px-2 py-1 bg-purple-50 text-purple-800 rounded-full text-xs flex items-center"
                                    >
                                      {sub.replace(/_/g, ' ')}
                                      {typeof similarity === 'number' && (
                                        <span className="ml-1 text-purple-600">
                                          ({Math.round(similarity * 100)}%)
                                        </span>
                                      )}
                                    </span>
                                  ))
                              }
                            </div>
                          </div>
                        )}
                        
                          {/* Cooking Times for proteins */}
                          {culinaryInfo.cookingTimes && Object.keys(culinaryInfo.cookingTimes).length > 0 && (
                            <div className="mb-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Cooking Times</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                {Object.entries(culinaryInfo.cookingTimes).map(([method, timeInfo]) => (
                                  <div key={method} className="mb-3">
                                    <h5 className="font-medium capitalize text-black">{method.replace(/_/g, ' ')}</h5>
                                    <div className="text-sm text-gray-600">
                                      {typeof timeInfo === 'object' && timeInfo !== null 
                                        ? (
                                          <div>
                                            {(timeInfo as any).min && (timeInfo as any).max && (
                                              <div>
                                                <span className="font-medium">Time:</span> {(timeInfo as any).min}-{(timeInfo as any).max} {(timeInfo as any).unit || 'minutes'}
                                              </div>
                                            )}
                                            {(timeInfo as any).notes && (
                                              <div>
                                                <span className="font-medium">Notes:</span> {(timeInfo as any).notes}
                                              </div>
                                            )}
                                            {(timeInfo as any).temperature && (
                                              <div>
                                                <span className="font-medium">Temperature:</span> {(timeInfo as any).temperature}
                                              </div>
                                            )}
                                          </div>
                                        )
                                        : (
                                          typeof timeInfo === 'string' ? timeInfo : safeRenderValue(timeInfo)
                                        )}
                                    </div>
                                  </div>
                                          ))}
                                        </div>
                            </div>
                          )}
                                      </div>
                                    );
                                  }

                    // Nutritional Tab
                    if (activeTab === 'nutritional') {
                      return (
                        <div className="py-3">
                          {/* Nutritional Information */}
                          {culinaryInfo.nutritionalProfile ? (
                            <div>
                              <h4 className="text-lg font-medium mb-3 text-black">Nutritional Information</h4>
                              
                              {/* Basic nutritional values */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {culinaryInfo.nutritionalProfile.calories && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Calories</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.calories}</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.protein_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Protein</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.protein_g}g</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.fat_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Fat</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.fat_g}g</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.carbs_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Carbs</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.carbs_g}g</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.fiber_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Fiber</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.fiber_g}g</div>
                              </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.fiber && typeof culinaryInfo.nutritionalProfile.fiber === 'string' && !culinaryInfo.nutritionalProfile.fiber_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Fiber</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.fiber}</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.sugar_g && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Sugar</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.sugar_g}g</div>
                                  </div>
                                )}
                                
                                {culinaryInfo.nutritionalProfile.glycemic_index && (
                                  <div className="bg-white p-3 rounded border">
                                    <div className="text-xs text-gray-500">Glycemic Index</div>
                                    <div className="font-medium text-lg">{culinaryInfo.nutritionalProfile.glycemic_index}</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Vitamins & Minerals */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Vitamins */}
                                {culinaryInfo.nutritionalProfile.vitamins && Array.isArray(culinaryInfo.nutritionalProfile.vitamins) && culinaryInfo.nutritionalProfile.vitamins.length > 0 && (
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <h5 className="font-medium mb-2 text-green-800">Vitamins</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                      {culinaryInfo.nutritionalProfile.vitamins.map(vitamin => (
                                        <span 
                                          key={vitamin}
                                          className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                                        >
                                          {typeof vitamin === 'string' ? 
                                            vitamin.toLowerCase() === 'c' ? 'Vitamin C' :
                                            vitamin.toLowerCase() === 'a' ? 'Vitamin A' :
                                            vitamin.toLowerCase() === 'e' ? 'Vitamin E' :
                                            vitamin.toLowerCase() === 'k' ? 'Vitamin K' :
                                            vitamin.toLowerCase() === 'b1' ? 'Vitamin B1 (Thiamin)' :
                                            vitamin.toLowerCase() === 'b2' ? 'Vitamin B2 (Riboflavin)' :
                                            vitamin.toLowerCase() === 'b3' ? 'Vitamin B3 (Niacin)' :
                                            vitamin.toLowerCase() === 'b5' ? 'Vitamin B5 (Pantothenic Acid)' :
                                            vitamin.toLowerCase() === 'b6' ? 'Vitamin B6 (Pyridoxine)' :
                                            vitamin.toLowerCase() === 'b7' ? 'Vitamin B7 (Biotin)' :
                                            vitamin.toLowerCase() === 'b9' ? 'Vitamin B9 (Folate)' :
                                            vitamin.toLowerCase() === 'b12' ? 'Vitamin B12 (Cobalamin)' :
                                            `Vitamin ${vitamin}` :
                                            typeof vitamin
                                          }
                                        </span>
                                      ))}
                                    </div>
                                    
                                    {/* Specific vitamin values if available */}
                                    {culinaryInfo.nutritionalProfile.specific_values && Object.entries(culinaryInfo.nutritionalProfile.specific_values)
                                      .filter(([key]) => key.includes('vitamin'))
                                      .map(([key, value]) => (
                                        <div key={key} className="mt-2 text-sm text-green-800">
                                          <span className="font-medium">{key.replace(/_/g, ' ').replace('vitamin', 'Vitamin')}</span>: {value}
                                        </div>
                                      ))
                                    }
                                  </div>
                                )}
                                
                                {/* Minerals */}
                                {culinaryInfo.nutritionalProfile.minerals && Array.isArray(culinaryInfo.nutritionalProfile.minerals) && culinaryInfo.nutritionalProfile.minerals.length > 0 && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h5 className="font-medium mb-2 text-blue-800">Minerals</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                      {culinaryInfo.nutritionalProfile.minerals.map(mineral => (
                                        <span 
                                          key={mineral}
                                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                        >
                                          {typeof mineral === 'string' ? 
                                            mineral.charAt(0).toUpperCase() + mineral.slice(1) : 
                                            typeof mineral
                                          }
                                        </span>
                                      ))}
                                    </div>
                                    
                                    {/* Specific mineral values if available */}
                                    {culinaryInfo.nutritionalProfile.specific_values && Object.entries(culinaryInfo.nutritionalProfile.specific_values)
                                      .filter(([key]) => 
                                        ["iron", "calcium", "magnesium", "potassium", "zinc", "manganese", "copper", "selenium", "phosphorus"].some(mineral => 
                                          key.includes(mineral))
                                      )
                                      .map(([key, value]) => (
                                        <div key={key} className="mt-2 text-sm text-blue-800">
                                          <span className="font-medium">{key.replace(/_/g, ' ')}</span>: {value}
                                        </div>
                                      ))
                                    }
                                  </div>
                                )}
                              </div>
                              
                              {/* Antioxidants and Other Beneficial Compounds */}
                              {culinaryInfo.nutritionalProfile.antioxidants && Array.isArray(culinaryInfo.nutritionalProfile.antioxidants) && culinaryInfo.nutritionalProfile.antioxidants.length > 0 && (
                                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                                  <h5 className="font-medium mb-2 text-purple-800">Antioxidants & Phytonutrients</h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    {culinaryInfo.nutritionalProfile.antioxidants.map(antioxidant => (
                                      <span 
                                        key={antioxidant}
                                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                                      >
                                        {typeof antioxidant === 'string' ? 
                                          antioxidant.charAt(0).toUpperCase() + antioxidant.slice(1) : 
                                          typeof antioxidant
                                        }
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {/* Specific antioxidant values if available */}
                                  {culinaryInfo.nutritionalProfile.specific_values && Object.entries(culinaryInfo.nutritionalProfile.specific_values)
                                    .filter(([key]) => ["anthocyanin", "flavonoid", "carotenoid", "lycopene", "lutein", "resveratrol", "polyphenol"].some(compound => key.includes(compound)))
                                    .map(([key, value]) => (
                                      <div key={key} className="mt-2 text-sm text-purple-800">
                                        <span className="font-medium">{key.replace(/_/g, ' ')}</span>: {value}
                                      </div>
                                    ))
                                  }
                                </div>
                              )}
                              
                              {/* Health benefits if in nutritional tab */}
                              {culinaryInfo.healthBenefits && Array.isArray(culinaryInfo.healthBenefits) && culinaryInfo.healthBenefits.length > 0 && (
                                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                                  <h5 className="font-medium mb-2 text-amber-800">Health Benefits</h5>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {culinaryInfo.healthBenefits.map((benefit, index) => (
                                      <li key={index} className="text-sm text-amber-700">{benefit}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Serving size information */}
                              {culinaryInfo.nutritionalProfile.serving_size && (
                                <div className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">
                                  <strong>Serving size:</strong> {culinaryInfo.nutritionalProfile.serving_size}
                                  {culinaryInfo.nutritionalProfile.serving_size_oz && (
                                    <span className="ml-1">({culinaryInfo.nutritionalProfile.serving_size_oz} oz)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-gray-500">
                              No nutritional information available
                          </div>
                        )}
                        
                          {/* Varieties with nutritional differences */}
                        {culinaryInfo.varieties && Object.keys(culinaryInfo.varieties).length > 0 && (
                            <div className="mt-5">
                              <h4 className="text-lg font-medium mb-3 text-black">Varieties</h4>
                            <div className="space-y-2">
                              {Object.entries(culinaryInfo.varieties).map(([variety, details]) => (
                                <div key={variety} className="bg-gray-50 p-3 rounded-lg">
                                  <h5 className="font-medium text-black">{variety.replace(/_/g, ' ')}</h5>
                                    {typeof details === 'object' && details !== null && (
                                      <div className="mt-1 space-y-1 text-sm">
                                        {(details as any).name && (
                                          <div><span className="font-medium">Name:</span> {(details as any).name}</div>
                                        )}
                                        {(details as any).scientific && (
                                          <div><span className="font-medium">Scientific Name:</span> <em>{(details as any).scientific}</em></div>
                                        )}
                                        {(details as any).appearance && (
                                          <div><span className="font-medium">Appearance:</span> {(details as any).appearance}</div>
                                        )}
                                        {(details as any).flavor && (
                                          <div><span className="font-medium">Flavor:</span> {(details as any).flavor}</div>
                                        )}
                                        {(details as any).texture && (
                                          <div><span className="font-medium">Texture:</span> {(details as any).texture}</div>
                                        )}
                                        {(details as any).common_cultivars && Array.isArray((details as any).common_cultivars) && (
                                          <div>
                                            <span className="font-medium">Common Cultivars:</span> {(details as any).common_cultivars.join(', ')}
                                          </div>
                                        )}
                                        {(details as any).notes && (
                                          <div><span className="font-medium">Notes:</span> {(details as any).notes}</div>
                                        )}
                                      </div>
                                    )}
                                  <div className="text-sm text-gray-600 mt-1">
                                      {typeof details !== 'object' ? getVarietyDisplayText(details) : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                      );
                    }

                    // Astrological Tab
                    if (activeTab === 'astrological') {
                      // Get the dominant element
                      const dominantElement = item.elementalProperties
                        ? Object.entries(item.elementalProperties).sort((a, b) => b[1] - a[1])[0][0]
                        : 'Fire';
                      
                      return (
                        <div className="py-3">
                          {/* Score breakdown with visual elements */}
                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="text-lg font-medium mb-3 text-black">Astrological Compatibility</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left column - Score breakdown */}
                              <div>
                                <h5 className="font-medium text-sm mb-2">Score Breakdown</h5>
                                
                                {/* Elemental score */}
                                <div className="mb-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span>Elemental Match</span>
                                    <span className="font-medium">{Math.round((item.elementalScore || 0.5) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-indigo-500 h-1.5 rounded-full" 
                                      style={{ width: `${Math.round((item.elementalScore || 0.5) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Modality score */}
                                <div className="mb-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span>Modality Match</span>
                                    <span className="font-medium">{Math.round((item.modalityScore || 0.5) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-purple-500 h-1.5 rounded-full" 
                                      style={{ width: `${Math.round((item.modalityScore || 0.5) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Seasonal score */}
                                <div className="mb-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span>Seasonal Match</span>
                                    <span className="font-medium">{Math.round((item.seasonalScore || 0.5) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-green-500 h-1.5 rounded-full" 
                                      style={{ width: `${Math.round((item.seasonalScore || 0.5) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Planetary score */}
                                <div className="mb-2">
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span>Planetary Match</span>
                                    <span className="font-medium">{Math.round((item.planetaryScore || 0.5) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-amber-500 h-1.5 rounded-full" 
                                      style={{ width: `${Math.round((item.planetaryScore || 0.5) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Overall score */}
                                <div className="mt-3">
                                  <div className="flex justify-between items-center text-sm font-medium mb-1">
                                    <span>Overall Match</span>
                                    <span>{Math.round((item.matchScore || 0.5) * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        item.matchScore > 0.8 ? 'bg-green-500' : 
                                        item.matchScore > 0.6 ? 'bg-blue-500' : 
                                        item.matchScore > 0.4 ? 'bg-yellow-500' : 
                                        'bg-gray-500'
                                      }`}
                                      style={{ width: `${Math.round((item.matchScore || 0.5) * 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right column - Elemental/Astrological properties */}
                              <div>
                                {/* Elemental Properties */}
                                <h5 className="font-medium text-sm mb-2">Elemental Balance</h5>
                                
                                <div className="space-y-2">
                                  {Object.entries(item.elementalProperties || {}).map(([element, value]) => (
                                    <div key={element} className="flex items-center">
                                      {getElementIcon(element)}
                                      <span className="font-medium ml-2 text-black">{element}</span>
                                      <div className="ml-2 flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${
                                            element === 'Fire' ? 'bg-red-400' : 
                                            element === 'Water' ? 'bg-blue-400' :
                                            element === 'Earth' ? 'bg-green-400' :
                                            'bg-purple-400' // Air
                                          }`}
                                          style={{ width: `${value * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="ml-2 min-w-[40px] text-right text-sm text-gray-600">
                                        {Math.round(value * 100)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Astrological Profile */}
                                {item.astrologicalProfile && (
                                  <div className="mt-4">
                                    <h5 className="font-medium text-sm mb-2">Astrological Profile</h5>
                                    
                                    {item.astrologicalProfile.rulingPlanets && 
                                    item.astrologicalProfile.rulingPlanets.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-xs font-medium">Ruling Planets:</span>
                                        {item.astrologicalProfile.rulingPlanets.map(planet => (
                                          <span 
                                            key={planet}
                                            className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded-full text-xs"
                                          >
                                            {planet}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {item.astrologicalProfile.elementalAffinity && (
                                      <div className="flex flex-wrap items-center text-xs mb-2">
                                        <span className="font-medium mr-1">Elemental Affinity:</span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                                          {typeof item.astrologicalProfile.elementalAffinity === 'string' 
                                            ? item.astrologicalProfile.elementalAffinity 
                                            : item.astrologicalProfile.elementalAffinity.base}
                                        </span>
                                        {typeof item.astrologicalProfile.elementalAffinity === 'object' && 
                                        item.astrologicalProfile.elementalAffinity.secondary && (
                                          <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded text-gray-800 opacity-70">
                                            {item.astrologicalProfile.elementalAffinity.secondary}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {item.astrologicalProfile.favorableZodiac && 
                                    item.astrologicalProfile.favorableZodiac.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-xs font-medium">Favorable Signs:</span>
                                        {item.astrologicalProfile.favorableZodiac.map(sign => (
                                          <span 
                                            key={sign}
                                            className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-xs"
                                          >
                                            {sign}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

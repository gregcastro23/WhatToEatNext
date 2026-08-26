'use client';

import { Flame, Droplets, Mountain, Wind } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef, type JSX } from 'react';
import type { AlchemicalItem } from '@/calculations/alchemicalTransformation';
import { useToast } from '@/components/ToastProvider';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useAlchemicalData } from '@/contexts/AlchemicalDataContext';
import { useGroceryCart } from '@/contexts/GroceryCartContext';
import { resolveAsin, AMAZON_ASSOCIATE_TAG, getStandardizedQuantity } from '@/data/amazon';
import { getRecipesForCuisineMatch } from '@/data/cuisineFlavorProfiles';
import { _logger } from '@/lib/logger';
import type { ZodiacSign, LunarPhase, ElementalProperties } from '@/types/alchemy';
import { _transformCuisines as transformCuisines, _sortByAlchemicalCompatibility as sortByAlchemicalCompatibility } from '@/utils/alchemicalTransformationUtils';
import styles from './CuisineRecommender.module.css';

// Keep the interface exports for any code that depends on them
export interface Cuisine {
  id: string;
  name: string;
  description: string;
  elementalProperties: Record<string, number | undefined>;
  astrologicalInfluences: string[];
  zodiacInfluences?: ZodiacSign[];
  lunarPhaseInfluences?: LunarPhase[];
}

interface CuisineStyles {
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
  loading: string;
  error: string;
}

// Local boundary views over untyped recipe/sauce JSON blobs; only fields read below are declared.
type IngredientLike =
  | string
  | {
      name?: string;
      amount?: number;
      unit?: string;
      category?: string;
      notes?: string;
      preparation?: string;
    };

interface RecipeLike {
  id?: string;
  name?: string;
  description?: string;
  matchScore?: number;
  matchPercentage?: number;
  hasDualMatch?: boolean;
  elementalProperties?: Record<string, number | undefined>;
  ingredients?: IngredientLike[];
  instructions?: string[];
  preparationSteps?: string[];
  procedure?: string[];
  cookTime?: string;
  prepTime?: string;
  servingSize?: number | string;
  numberOfServings?: number;
  servings?: number;
  dietaryInfo?: string[] | string;
  culturalNotes?: string;
  pairingSuggestions?: string[] | string;
  flavorProfile?: Record<string, number | undefined>;
  astrologicalInfluences?: string[] | string;
}

interface SauceLike {
  id?: string;
  name?: string;
  description?: string;
  matchPercentage?: number;
  isTraditional?: boolean;
  elementalProperties?: Record<string, number | undefined>;
  ingredients?: string[];
  preparationSteps?: string[] | string;
  procedure?: string[] | string;
  instructions?: string[] | string;
  prepTime?: string;
  cookTime?: string;
  yield?: string;
  difficulty?: string;
  storageInstructions?: string;
  technicalTips?: string;
  culinaryUses?: string[] | string;
  variants?: string[] | string;
  pairsWith?: string[] | string;
  usage?: string;
}

interface RawSauce {
  name?: string;
  description?: string;
  elementalProperties?: Record<string, number | undefined>;
  [key: string]: unknown;
}

interface AmazonCartItem {
  name: string;
  asin: string | null;
  amount: number;
}

interface NormalizedCartIngredient {
  name: string;
  amount: number;
  unit: string;
  category?: string;
  notes?: string;
}

// Add this helper function near the top of the file, outside any components
const getSafeScore = (score: unknown): number => {
  const numScore = typeof score === 'number' ? score : (typeof score === 'string' ? parseFloat(score) : NaN);
  return !isNaN(numScore) ? numScore : 0.5;
};

/**
 * Enter/Space activate an element carrying role="button" — the behaviour a
 * native <button> supplies for free. These cards cannot BE buttons: several
 * nest their own links and controls, which a button may not contain. So the
 * keyboard half of "this thing is clickable" is provided explicitly.
 */
function activateOnKey(activate: (event: React.KeyboardEvent) => void): (event: React.KeyboardEvent) => void {
  return (event: React.KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    activate(event);
  };
}

export default function CuisineRecommender(): React.JSX.Element {
  const { cuisines, sauces: allSauces, recipes: allRecipes, loading: dataLoading, error: dataError } = useAlchemicalData();
  
  // Provide fallback values in case AlchemicalContext is not available
  const alchemicalContext = useAlchemical();
  const { 
    isDaytime, 
    planetaryPositions, 
    astrologicalState,
    elementalState,
    zodiacSign: currentZodiac,
    lunarPhase
  } = alchemicalContext;
  
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [transformedCuisines, setTransformedCuisines] = useState<AlchemicalItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cuisinesList, setCuisines] = useState<Cuisine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [_filter, _setFilter] = useState<string>('all');
  const [cuisineRecipes, setCuisineRecipes] = useState<RecipeLike[]>([]);
  const [sauceRecommendations, setSauceRecommendations] = useState<SauceLike[]>([]);
  const [showAllRecipes, setShowAllRecipes] = useState<boolean>(false);
  const [showAllSauces, setShowAllSauces] = useState<boolean>(false);
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string | number, boolean>>({});
  const [topRecommendedSauces, setTopRecommendedSauces] = useState<SauceLike[]>([]);
  const [expandedSauceCards, setExpandedSauceCards] = useState<Record<string, boolean>>({});
  const [showCuisineDetails, setShowCuisineDetails] = useState<boolean>(false);
  const [amazonLoading, setAmazonLoading] = useState<string | null>(null);
  const recipesSectionRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { addRecipe: addRecipeToGroceryCart, open: openGroceryCart } = useGroceryCart();
  const { showToast } = useToast();

  const handleViewRecipes = useCallback((cuisineId: string): void => {
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    requestAnimationFrame(() => {
      recipesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleOrderCuisine = useCallback((cuisineName: string): void => {
    router.push(`/restaurants?cuisine=${encodeURIComponent(cuisineName)}`);
  }, [router]);

  const handleShopOnAmazon = (recipe: RecipeLike): void => {
    setAmazonLoading(recipe.id ?? recipe.name ?? null);
    try {
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients.map((ing: IngredientLike): AmazonCartItem | null => {
        const name = typeof ing === 'string' ? ing : ing.name;
        const amount = typeof ing === 'object' ? (ing.amount ?? 1) : 1;
        return name ? { name, asin: resolveAsin(name), amount } : null;
      }).filter((x): x is AmazonCartItem & { asin: string } => Boolean(x?.asin)) : [];

      if (ingredients.length === 0) {
        showToast('No ingredients could be matched to Amazon products.', 'error');
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.amazon.com/gp/aws/cart/add.html';
      form.target = '_blank';
      form.style.display = 'none';

      const tagInput = document.createElement('input');
      tagInput.type = 'hidden';
      tagInput.name = 'AssociateTag';
      tagInput.value = AMAZON_ASSOCIATE_TAG;
      form.appendChild(tagInput);

      const cartTypeInput = document.createElement('input');
      cartTypeInput.type = 'hidden';
      cartTypeInput.name = 'cart-type';
      cartTypeInput.value = 'fresh';
      form.appendChild(cartTypeInput);

      const addInput = document.createElement('input');
      addInput.type = 'hidden';
      addInput.name = 'add';
      addInput.value = 'add';
      form.appendChild(addInput);

      const submitAddInput = document.createElement('input');
      submitAddInput.type = 'hidden';
      submitAddInput.name = 'submit.add';
      submitAddInput.value = '1';
      form.appendChild(submitAddInput);

      ingredients.forEach((item: AmazonCartItem, idx: number) => {
        const pos = idx + 1;
        const asinInput = document.createElement('input');
        asinInput.type = 'hidden';
        asinInput.name = `ASIN.${pos}`;
        asinInput.value = item.asin ?? '';
        form.appendChild(asinInput);

        const qtyInput = document.createElement('input');
        qtyInput.type = 'hidden';
        qtyInput.name = `Quantity.${pos}`;
        qtyInput.value = String(getStandardizedQuantity(item.name, item.amount));
        form.appendChild(qtyInput);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open Amazon';
      showToast(message, 'error');
    } finally {
      setAmazonLoading(null);
    }
  };

  const buildRecipeHref = useCallback((recipe: RecipeLike): string | null => {
    const slug = recipe.id ?? recipe.name;
    if (!slug) return null;
    return `/recipes/${encodeURIComponent(String(slug))}`;
  }, []);

  const handleAddRecipeToCart = useCallback((recipe: RecipeLike): void => {
    if (!recipe.name) return;
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const normalized = ingredients
      .map((ing: IngredientLike) => {
        if (!ing) return null;
        if (typeof ing === 'string') {
          return { name: ing, amount: 1, unit: 'each' };
        }
        return {
          name: ing.name,
          amount: typeof ing.amount === 'number' ? ing.amount : 1,
          unit: ing.unit ?? 'each',
          category: ing.category,
          notes: ing.notes,
        };
      })
      .filter((x): x is NormalizedCartIngredient => Boolean(x?.name));

    if (normalized.length === 0) {
      showToast('This recipe has no ingredients to add.', 'warning');
      return;
    }

    const baseServings = Number(recipe.servingSize ?? recipe.numberOfServings ?? recipe.servings) || 1;
    const recipeId = String(recipe.id ?? recipe.name);
    addRecipeToGroceryCart(
      { id: recipeId, name: recipe.name, baseServings, ingredients: normalized },
      baseServings,
    );
    showToast(`Added ${normalized.length} ingredient${normalized.length === 1 ? '' : 's'} from ${recipe.name}`, 'success', {
      action: { label: 'View cart', onClick: openGroceryCart },
    });
  }, [addRecipeToGroceryCart, openGroceryCart, showToast]);
  
  const [currentMomentElementalProfile, setCurrentMomentElementalProfile] = useState<ElementalProperties>(elementalState);
  const [matchingRecipes, _setMatchingRecipes] = useState<RecipeLike[]>([]);

  // Calculate elemental contributions from planetary positions
  const calculateElementalContributionsFromPlanets = useCallback((positions: Record<string, unknown>): ElementalProperties => {
    const contributions: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    const planetElementMap: Record<string, keyof ElementalProperties> = {
      Sun: 'Fire',
      Moon: 'Water',
      Mercury: 'Air',
      Venus: 'Earth',
      Mars: 'Fire',
      Jupiter: 'Air',
      Saturn: 'Earth',
      Uranus: 'Air',
      Neptune: 'Water',
      Pluto: 'Water'
    };
    
    for (const [planet] of Object.entries(positions)) {
      const element = planetElementMap[planet];
      if (element) {
        const weight = (planet === 'Sun' || planet === 'Moon') ? 0.3 : 0.1;
        contributions[element] += weight;
      }
    }
    
    return contributions;
  }, []);

  // Calculate elemental profile from zodiac and lunar phase
  const calculateElementalProfileFromZodiac = useCallback((zodiacSign: ZodiacSign, lunarPhaseValue?: LunarPhase): ElementalProperties => {
    const zodiacElementMap: Record<string, keyof ElementalProperties> = {
      aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
      taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
      gemini: 'Air', libra: 'Air', aquarius: 'Air',
      cancer: 'Water', scorpio: 'Water', pisces: 'Water'
    };
    
    const primaryElement = zodiacElementMap[zodiacSign] ?? 'Fire';
    
    const elementalProfile: ElementalProperties = {
      Fire: 0.15,
      Water: 0.15,
      Earth: 0.15,
      Air: 0.15
    };
    
    elementalProfile[primaryElement] = 0.6;
    
    if (lunarPhaseValue) {
      const lunarElementMap: Record<string, keyof ElementalProperties> = {
        'new moon': 'Fire',
        'waxing crescent': 'Fire',
        'first quarter': 'Air',
        'waxing gibbous': 'Air',
        'full moon': 'Water',
        'waning gibbous': 'Water',
        'last quarter': 'Earth',
        'waning crescent': 'Earth'
      };
      
      const lunarElement = lunarElementMap[lunarPhaseValue];
      if (lunarElement) {
        elementalProfile[lunarElement] += 0.2;
      }
    }
    
    if (Object.keys(planetaryPositions).length > 0) {
      const elementalContributions = calculateElementalContributionsFromPlanets(planetaryPositions);
      for (const element of Object.keys(elementalProfile) as Array<keyof ElementalProperties>) {
        if (elementalContributions[element]) {
          elementalProfile[element] += elementalContributions[element] * 0.1;
        }
      }
    }
    
    const sum = Object.values(elementalProfile).reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      for (const element of Object.keys(elementalProfile) as Array<keyof ElementalProperties>) {
        elementalProfile[element] = elementalProfile[element] / sum;
      }
    }
    
    return elementalProfile;
  }, [planetaryPositions, calculateElementalContributionsFromPlanets]);

  // Update current moment elemental profile when astrological state changes
  useEffect(() => {
    if (astrologicalState.elementalState) {
      setCurrentMomentElementalProfile({ ...(astrologicalState.elementalState as ElementalProperties) });
    } else if (currentZodiac) {
      const zodiacElements = calculateElementalProfileFromZodiac(currentZodiac as ZodiacSign, lunarPhase as LunarPhase);
      setCurrentMomentElementalProfile(zodiacElements);
    }
  }, [astrologicalState.elementalState, currentZodiac, lunarPhase, calculateElementalProfileFromZodiac]);

  const _cssStyles = styles as unknown as CuisineStyles;

  /**
   * Calculate elemental match score between two elemental property sets
   */
  const calculateElementalMatch = (
    recipeElements: ElementalProperties | undefined,
    userElements: ElementalProperties
  ): number => {
    if (!recipeElements) return 0.5;
    const elements = Object.keys(recipeElements) as Array<keyof ElementalProperties>;
    
    let dotProduct = 0;
    let recipeNorm = 0;
    let userNorm = 0;
    
    for (const element of elements) {
      const recipeValue = recipeElements[element] || 0;
      const userValue = userElements[element] || 0;
      
      dotProduct += recipeValue * userValue;
      recipeNorm += recipeValue * recipeValue;
      userNorm += userValue * userValue;
    }
    
    recipeNorm = Math.sqrt(recipeNorm);
    userNorm = Math.sqrt(userNorm);
    
    if (recipeNorm === 0 || userNorm === 0) {
      return 0.5;
    }
    
    return dotProduct / (recipeNorm * userNorm);
  };

  // Function to get match score CSS class based on the score
  const getMatchScoreClass = (score: number): string => {
    if (score >= 0.96) return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
    if (score >= 0.90) return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
    if (score >= 0.85) return 'bg-green-200 text-green-800 font-semibold';
    if (score >= 0.80) return 'bg-green-100 text-green-700 font-medium';
    if (score >= 0.75) return 'bg-green-50 text-green-600';
    if (score >= 0.70) return 'bg-yellow-100 text-yellow-700';
    if (score >= 0.65) return 'bg-yellow-50 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };
  
  // Function to render a score badge with stars for high scores
  const renderScoreBadge = (score: number, hasDualMatch = false): JSX.Element => {
    const formattedScore = Math.round(score * 100);
    let tooltipText = 'Match score based on cuisine, season, and elemental balance';
    
    if (score >= 0.96) {
      tooltipText = 'Perfect match: Highly recommended for your preferences';
    } else if (score >= 0.90) {
      tooltipText = 'Excellent match for your preferences';
    } else if (score >= 0.85) {
      tooltipText = 'Very good match for your preferences';
    }
    
    if (hasDualMatch) {
      tooltipText = `${tooltipText} (Matches multiple criteria)`;
    }
    
    return (
      <span 
        className={`text-sm ${getMatchScoreClass(score)} px-2 py-1 rounded flex items-center gap-1 transition-all duration-300 hover:scale-105`}
        title={tooltipText}
      >
        {hasDualMatch && <span className="h-2 w-2 bg-yellow-400 rounded-full" />}
        <span>{formattedScore}% match</span>
      </span>
    );
  };

  // Get sauce recommendations for the current elemental profile
  const generateTopSauceRecommendations = useCallback((): SauceLike[] => {
    const saucesRecord = (allSauces ?? {}) as Record<string, RawSauce>;
    const saucesArray = Object.values(saucesRecord);
    _logger.info(`Total available sauces: ${saucesArray.length}`);
    
    const saucesWithMatches: SauceLike[] = saucesArray.map((sauce, index) => {
      const matchScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties | undefined,
        currentMomentElementalProfile
      );
      
      return {
        ...sauce,
        id: sauce.name?.replace(/\s+/g, '-').toLowerCase() ?? `sauce-${index}`,
        matchPercentage: Math.round(getSafeScore(matchScore) * 100)
      };
    });
    
    const sortedSauces = [...saucesWithMatches].sort(
      (a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
    );
    
    const result = sortedSauces.slice(0, 8);
    _logger.info(`Returning ${result.length} top recommended sauces`);
    return result;
  }, [allSauces, currentMomentElementalProfile]);

  // Load top sauce recommendations when component mounts or when elemental profile changes
  useEffect(() => {
    const topSauces = generateTopSauceRecommendations();
    _logger.info(`Setting ${topSauces.length} top recommended sauces`);
    setTopRecommendedSauces(topSauces);
  }, [currentMomentElementalProfile, currentZodiac, generateTopSauceRecommendations]);

  // Update cuisineRecipes whenever matchingRecipes changes
  useEffect(() => {
    setCuisineRecipes(matchingRecipes);
  }, [matchingRecipes]);

  // Load cuisines synchronously now that we have data from context
  const loadCuisines = useCallback((): void => {
    try {
      setLoading(true);
      const allCuisines = (cuisines ?? {}) as Record<string, Cuisine | undefined>;
      
      const cuisinesArray: Cuisine[] = Object.entries(allCuisines).map(([id, cuisine]) => ({
        id,
        name: cuisine?.name ?? id,
        elementalProperties: cuisine?.elementalProperties ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        description: cuisine?.description ?? '',
        astrologicalInfluences: cuisine?.astrologicalInfluences ?? []
      }));
      
      setCuisines(cuisinesArray);
      
      const transformed = transformCuisines(
        cuisinesArray as unknown as Parameters<typeof transformCuisines>[0],
        planetaryPositions as unknown as Record<string, number>,
        isDaytime,
        currentZodiac,
        lunarPhase as LunarPhase
      );
      
      const sorted = sortByAlchemicalCompatibility(
        transformed,
        currentMomentElementalProfile
      );
      
      setTransformedCuisines(sorted);
      
      if (sorted.length > 0) {
        const topSauces = generateTopSauceRecommendations();
        setTopRecommendedSauces(topSauces);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load cuisine data');
      setLoading(false);
      _logger.error('Error loading cuisines:', err);
    }
  }, [cuisines, planetaryPositions, isDaytime, currentZodiac, lunarPhase, currentMomentElementalProfile, generateTopSauceRecommendations]);

  useEffect(() => {
    if (cuisines && !dataLoading && !dataError) {
      loadCuisines();
    }
  }, [currentMomentElementalProfile, currentZodiac, lunarPhase, cuisines, dataLoading, dataError, loadCuisines]);

  // Function to generate sauce recommendations for a specific cuisine
  const generateSauceRecommendationsForCuisine = (cuisine: Cuisine): SauceLike[] => {
    if (!allSauces) return [];
    
    const saucesRecord = allSauces as Record<string, RawSauce>;
    const saucesArray = Object.values(saucesRecord);
    
    const traditionalSauces: SauceLike[] = [];
    const allCuisinesData = (cuisines ?? {}) as Record<string, { traditionalSauces?: Record<string, RawSauce> } | undefined>;
    
    const cuisineTraditional = allCuisinesData[cuisine.id]?.traditionalSauces;
    if (cuisineTraditional) {
      Object.entries(cuisineTraditional).forEach(([id, sauceData]) => {
        const matchScore = calculateElementalMatch(
          sauceData.elementalProperties as ElementalProperties | undefined,
          cuisine.elementalProperties as unknown as ElementalProperties
        );
        
        traditionalSauces.push({
          ...sauceData,
          id: `${cuisine.id}-${id}`,
          matchPercentage: Math.round(getSafeScore(matchScore) * 100),
          isTraditional: true
        });
      });
    }
    
    const saucesWithMatches: SauceLike[] = saucesArray.map((sauce) => {
      const matchScore = calculateElementalMatch(
        sauce.elementalProperties as ElementalProperties | undefined,
        cuisine.elementalProperties as unknown as ElementalProperties
      );
      
      return {
        ...sauce,
        matchPercentage: Math.round(getSafeScore(matchScore) * 100)
      };
    });
    
    const sortedSauces = [...saucesWithMatches].sort(
      (a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
    );
    
    const combinedSauces = [...traditionalSauces];
    
    const incompatiblePairs: Record<string, string[] | undefined> = {
      thai: ['marinara', 'bolognese', 'bechamel', 'alfredo', 'ragu', 'gravy'],
      italian: ['fish sauce', 'soy sauce', 'curry paste', 'gochujang', 'teriyaki'],
      indian: ['aioli', 'bechamel', 'hollandaise', 'carbonara'],
      japanese: ['chimichurri', 'guacamole', 'marinara', 'bechamel'],
      mexican: ['soy sauce', 'fish sauce', 'oyster sauce', 'teriyaki'],
      french: ['soy sauce', 'gochujang', 'sweet chili', 'curry paste'],
      korean: ['marinara', 'bechamel', 'pesto', 'carbonara'],
      chinese: ['guacamole', 'chimichurri', 'aioli', 'hollandaise'],
      middle_eastern: ['soy sauce', 'teriyaki', 'alfredo', 'carbonara'],
      greek: ['soy sauce', 'teriyaki', 'gochujang', 'curry paste']
    };
    
    for (const sauce of sortedSauces) {
      if (!combinedSauces.some((s) => s.name === sauce.name)) {
        const incompatibleSauces = incompatiblePairs[cuisine.id.toLowerCase()];
        if (incompatibleSauces) {
          const sauceNameLower = sauce.name?.toLowerCase() ?? '';
          
          if (incompatibleSauces.some((term) => sauceNameLower.includes(term.toLowerCase()))) {
            continue;
          }
        }
        
        if ((sauce.matchPercentage ?? 0) >= 80) {
          combinedSauces.push(sauce);
        }
      }
      
      if (combinedSauces.length >= 6) {
        break;
      }
    }
    
    return combinedSauces.sort(
      (a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
    );
  };

  const handleCuisineSelect = async (cuisineId: string): Promise<void> => {
    if (selectedCuisine === cuisineId) {
      setShowCuisineDetails(!showCuisineDetails);
      return;
    }
    
    setSelectedCuisine(cuisineId);
    setShowCuisineDetails(true);
    
    const selectedCuisineData = cuisinesList.find((c) => c.id === cuisineId);
    if (selectedCuisineData) {
      setExpandedRecipes({});
      setShowAllRecipes(false);
      
      const recipes = await getRecipesForCuisineMatch(selectedCuisineData.name, allRecipes ?? [], 10);
      
      const uniqueRecipes = recipes.filter((recipe, index, self) => 
        index === self.findIndex((r) => r.name === recipe.name)
      );
      
      const sortedRecipes = [...uniqueRecipes].sort((a, b) => 
        ((b.matchScore as number | undefined) ?? 0) - ((a.matchScore as number | undefined) ?? 0)
      );
      
      setCuisineRecipes(sortedRecipes);
      
      const sauces = generateSauceRecommendationsForCuisine(selectedCuisineData);
      setSauceRecommendations(sauces);
    }
  };

  const toggleRecipeExpansion = (
    index: number,
    event: React.MouseEvent | React.KeyboardEvent,
  ): void => {
    event.stopPropagation();
    setExpandedRecipes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSauceCard = (sauceId: string): void => {
    setExpandedSauceCards((prev) => ({
      ...prev,
      [sauceId]: !prev[sauceId]
    }));
  };

  if (loading || dataLoading) {
    return <div className="p-4 text-center">Loading cuisine recommendations...</div>;
  }

  if (error || dataError) {
    return <div className="p-4 bg-red-50 text-red-500 rounded">{error ?? dataError}</div>;
  }

  // Get the currently selected cuisine data
  const selectedCuisineData = cuisinesList.find((c) => c.id === selectedCuisine);
  
  // Get the compatibility score for the selected cuisine
  const _selectedCuisineScore = transformedCuisines.find(
    (tc) => tc.id === selectedCuisine
  )?.compatibilityScore ?? 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium mb-3">Celestial Cuisine Guide</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        {transformedCuisines.slice(0, 9).map((cuisine) => {
          const cuisineData = cuisinesList.find((c) => c.id === cuisine.id);
          if (!cuisineData) return null;
          
          // Calculate match percentage
          const score = typeof cuisine.compatibilityScore === "number" ? cuisine.compatibilityScore : 0.5;
          const matchPercentage = Math.round(score * 100);
          
          return (
            <div 
              key={cuisine.id}
              className={`rounded border p-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCuisine === cuisine.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}
              onClick={() => {
                handleCuisineSelect(cuisine.id).catch(() => {});
              }}
              onKeyDown={activateOnKey(() => {
                handleCuisineSelect(cuisine.id).catch(() => {});
              })}
              role="button"
              tabIndex={0}
              aria-pressed={selectedCuisine === cuisine.id}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-sm">{cuisineData.name}</h3>
                <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass(matchPercentage / 100)}`}>
                  {matchPercentage}%
                </span>
              </div>
              
              {/* Only show elemental icons as a simple visual */}
              <div className="flex space-x-1">
                {(cuisineData.elementalProperties.Fire ?? 0) >= 0.3 && <Flame size={14} className="text-red-500" />}
                {(cuisineData.elementalProperties.Water ?? 0) >= 0.3 && <Droplets size={14} className="text-blue-500" />}
                {(cuisineData.elementalProperties.Earth ?? 0) >= 0.3 && <Mountain size={14} className="text-green-500" />}
                {(cuisineData.elementalProperties.Air ?? 0) >= 0.3 && <Wind size={14} className="text-yellow-500" />}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Display expanded details for selected cuisine */}
      {selectedCuisineData && showCuisineDetails && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">{selectedCuisineData.name} Cuisine</h3>
            {(((): React.JSX.Element => {
              const selectedCompat = transformedCuisines.find((c) => c.id === selectedCuisine)?.compatibilityScore;
              const selectedScore = typeof selectedCompat === "number" ? selectedCompat : 0.5;
              return (
                <span className={`text-xs px-2 py-1 rounded ${getMatchScoreClass(selectedScore)}`}>
                  {Math.round(selectedScore * 100)}% match
                </span>
              );
            })())}
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{selectedCuisineData.description}</p>

          {/* Cuisine action buttons: cook it (recipes) or order it (restaurants) */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleViewRecipes(selectedCuisineData.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-sm hover:from-amber-400 hover:to-orange-400 transition-all"
            >
              <span aria-hidden>🥘</span> Recipes
            </button>
            <button
              type="button"
              onClick={() => handleOrderCuisine(selectedCuisineData.name)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-bold shadow-sm hover:from-rose-400 hover:to-purple-400 transition-all"
            >
              <span aria-hidden>📍</span> Order Local
            </button>
          </div>

          {/* Recipe Recommendations - Shown Immediately */}
          {cuisineRecipes.length > 0 ? (
            <div ref={recipesSectionRef} className="mt-2">
              <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Recipes</h4>
              <div className="grid grid-cols-2 gap-2">
                {cuisineRecipes.slice(0, showAllRecipes ? undefined : 5).map((recipe, index) => (
                  <div 
                    key={index} 
                    className="border rounded p-2 bg-white cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={(event) => toggleRecipeExpansion(index, event)}
                    onKeyDown={activateOnKey((event) => toggleRecipeExpansion(index, event))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-medium text-sm">{recipe.name}</h5>
                      {renderScoreBadge((recipe.matchPercentage ?? 0) / 100, recipe.hasDualMatch)}
                    </div>
                    <p className="text-xs text-gray-600 truncate" title={recipe.description}>
                      {recipe.description}
                    </p>
                    
                    {/* Expanded recipe details */}
                    {expandedRecipes[index] && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex space-x-1 mb-1">
                          {(recipe.elementalProperties?.Fire ?? 0) >= 0.3 && <Flame size={12} className="text-red-500" />}
                          {(recipe.elementalProperties?.Water ?? 0) >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                          {(recipe.elementalProperties?.Earth ?? 0) >= 0.3 && <Mountain size={12} className="text-green-500" />}
                          {(recipe.elementalProperties?.Air ?? 0) >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                        </div>
                        
                        {recipe.ingredients && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Ingredients:</h6>
                            <ul className="pl-4 list-disc">
                              {recipe.ingredients.map((ingredient, i) => (
                                <li key={i}>
                                  {typeof ingredient === 'string' 
                                    ? ingredient 
                                    : `${ingredient.amount ?? 1} ${ingredient.unit ?? 'each'} ${ingredient.name ?? ''}${ingredient.preparation ? `, ${ingredient.preparation}` : ''}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Procedure section */}
                        {(() : JSX.Element | null => {
                          const steps = recipe.instructions ?? recipe.preparationSteps ?? recipe.procedure;
                          if (!steps || !Array.isArray(steps) || steps.length === 0) return null;
                          const stepsToShow = steps.length > 6 ? 3 : 6;
                          return (
                            <div className="mt-2">
                              <h6 className="font-medium mb-1">Procedure:</h6>
                              <ol className="pl-4 list-decimal">
                                {steps.map((step, i) => {
                                  if (!expandedRecipes[`${index}-steps`] && i >= stepsToShow) return null;
                                  return (
                                    <li key={i}>{step}</li>
                                  );
                                })}
                              </ol>
                              
                              {steps.length > 6 && (
                                <button
                                  type="button"
                                  className="text-xs text-blue-500 mt-1 hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedRecipes((prev) => ({
                                      ...prev,
                                      [`${index}-steps`]: !prev[`${index}-steps`]
                                    }));
                                  }}
                                >
                                  {expandedRecipes[`${index}-steps`] ? 'Show fewer steps' : 'Show all steps'}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        
                        {/* Additional recipe information */}
                        {recipe.cookTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Cooking time: </span>
                            <span>{recipe.cookTime}</span>
                          </div>
                        )}
                        
                        {recipe.prepTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Prep time: </span>
                            <span>{recipe.prepTime}</span>
                          </div>
                        )}
                        
                        {recipe.servingSize && (
                          <div className="mt-1">
                            <span className="text-gray-500">Servings: </span>
                            <span>{recipe.servingSize}</span>
                          </div>
                        )}
                        
                        {recipe.dietaryInfo && recipe.dietaryInfo.length > 0 && (
                          <div className="mt-1">
                            <span className="text-gray-500">Dietary: </span>
                            <span>{Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo.join(', ') : recipe.dietaryInfo}</span>
                          </div>
                        )}
                        
                        {recipe.culturalNotes && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Cultural Notes:</h6>
                            <p>{recipe.culturalNotes}</p>
                          </div>
                        )}
                        
                        {recipe.pairingSuggestions && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Pairs Well With:</h6>
                            <p>{Array.isArray(recipe.pairingSuggestions) ? recipe.pairingSuggestions.join(', ') : recipe.pairingSuggestions}</p>
                          </div>
                        )}
                        
                        {recipe.flavorProfile && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Flavor Profile:</h6>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(recipe.flavorProfile).map(([flavor, value]) => 
                                typeof value === 'number' && value > 0.3 ? (
                                  <span key={flavor} className="px-1 bg-gray-100 rounded text-gray-700">
                                    {flavor}: {Math.round(value * 100)}%
                                  </span>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                        
                        {recipe.astrologicalInfluences && recipe.astrologicalInfluences.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Astrological Influences:</h6>
                            <p>{Array.isArray(recipe.astrologicalInfluences) ? recipe.astrologicalInfluences.join(', ') : recipe.astrologicalInfluences}</p>
                          </div>
                        )}

                        {/* Recipe sub-card actions: open full page, add to grocery cart, shop on Amazon */}
                        <div
                          className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-2"
                          role="presentation"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {buildRecipeHref(recipe) && (
                            <Link
                              href={buildRecipeHref(recipe) as string}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-500 transition-colors"
                            >
                              View full recipe →
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecipeToCart(recipe);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-orange-600 text-white text-[11px] font-semibold hover:bg-orange-500 transition-colors"
                          >
                            🛒 Add to grocery cart
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShopOnAmazon(recipe);
                            }}
                            disabled={amazonLoading === (recipe.id ?? recipe.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FF9900] text-black text-[11px] font-semibold hover:bg-[#FFB347] transition-colors disabled:opacity-50"
                          >
                            {amazonLoading === (recipe.id ?? recipe.name) ? '⟳ Opening...' : '🛒 Shop on Amazon'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {cuisineRecipes.length > 5 && (
                <button 
                  type="button"
                  className="text-xs text-blue-500 mt-2 hover:underline"
                  onClick={() => setShowAllRecipes(!showAllRecipes)}
                >
                  {showAllRecipes ? 'Show Less' : `Show All Recipes (${cuisineRecipes.length})`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No recipes available for this cuisine.</div>
          )}
          
          {/* Sauce Recommendations - Shown after recipes */}
          {sauceRecommendations.length > 0 && (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">Recommended Sauces</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sauceRecommendations.slice(0, showAllSauces ? undefined : 6).map((sauce, index) => (
                  <div 
                    key={index} 
                    className="border rounded p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-all duration-200 min-h-[180px] flex flex-col"
                    onClick={() => toggleSauceCard(sauce.id ?? `sauce-${index}`)}
                    onKeyDown={activateOnKey(() => toggleSauceCard(sauce.id ?? `sauce-${index}`))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm leading-tight mr-1 max-w-[75%]">{sauce.name}</h5>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getMatchScoreClass((sauce.matchPercentage ?? 0) / 100)}`}>
                        {sauce.matchPercentage}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-600 line-clamp-4 grow" title={sauce.description}>
                      {sauce.description}
                    </p>
                    
                    {/* Expanded sauce details */}
                    {expandedSauceCards[sauce.id ?? `sauce-${index}`] && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex space-x-1 mb-1">
                          {(sauce.elementalProperties?.Fire ?? 0) >= 0.3 && <Flame size={12} className="text-red-500" />}
                          {(sauce.elementalProperties?.Water ?? 0) >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                          {(sauce.elementalProperties?.Earth ?? 0) >= 0.3 && <Mountain size={12} className="text-green-500" />}
                          {(sauce.elementalProperties?.Air ?? 0) >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                        </div>
                        
                        {sauce.ingredients && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Ingredients:</h6>
                            <ul className="pl-4 list-disc">
                              {sauce.ingredients.map((ingredient: string, i: number) => (
                                <li key={i}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Consistently display preparation steps using various possible field names */}
                        {(() : JSX.Element | null => {
                          const prep = sauce.preparationSteps ?? sauce.procedure ?? sauce.instructions;
                          if (!prep) return null;
                          return (
                            <div className="mt-2">
                              <h6 className="font-medium mb-1">Preparation:</h6>
                              {Array.isArray(prep) ? (
                                <ol className="pl-4 list-decimal">
                                  {prep.map((step: string, i: number) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              ) : (
                                <p>{prep}</p>
                              )}
                            </div>
                          );
                        })()}
                        
                        {/* Add additional sauce information */}
                        {sauce.prepTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Prep time: </span>
                            <span>{sauce.prepTime}</span>
                          </div>
                        )}
                        
                        {sauce.cookTime && (
                          <div className="mt-1">
                            <span className="text-gray-500">Cook time: </span>
                            <span>{sauce.cookTime}</span>
                          </div>
                        )}
                        
                        {sauce.yield && (
                          <div className="mt-1">
                            <span className="text-gray-500">Yield: </span>
                            <span>{sauce.yield}</span>
                          </div>
                        )}
                        
                        {sauce.difficulty && (
                          <div className="mt-1">
                            <span className="text-gray-500">Difficulty: </span>
                            <span>{sauce.difficulty}</span>
                          </div>
                        )}
                        
                        {sauce.storageInstructions && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Storage:</h6>
                            <p>{sauce.storageInstructions}</p>
                          </div>
                        )}
                        
                        {sauce.technicalTips && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Technical Tips:</h6>
                            <p>{sauce.technicalTips}</p>
                          </div>
                        )}
                        
                        {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Culinary Uses:</h6>
                            <ul className="pl-4 list-disc">
                              {Array.isArray(sauce.culinaryUses) ? 
                                sauce.culinaryUses.map((use: string, i: number) => (
                                  <li key={i}>{use}</li>
                                )) : 
                                <li>{sauce.culinaryUses}</li>
                              }
                            </ul>
                          </div>
                        )}
                        
                        {sauce.variants && sauce.variants.length > 0 && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Variants:</h6>
                            <ul className="pl-4 list-disc">
                              {Array.isArray(sauce.variants) ? 
                                sauce.variants.map((variant: string, i: number) => (
                                  <li key={i}>{variant}</li>
                                )) : 
                                <li>{sauce.variants}</li>
                              }
                            </ul>
                          </div>
                        )}
                        
                        {sauce.pairsWith && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Pairs Well With:</h6>
                            {Array.isArray(sauce.pairsWith) ? (
                              <ul className="pl-4 list-disc">
                                {sauce.pairsWith.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <p>{sauce.pairsWith}</p>
                            )}
                          </div>
                        )}
                        
                        {sauce.usage && (
                          <div className="mt-1">
                            <h6 className="font-medium mb-1">Usage:</h6>
                            <p>{sauce.usage}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {sauceRecommendations.length > 6 && (
                <button 
                  type="button"
                  className="text-xs text-blue-500 mt-2 hover:underline"
                  onClick={() => setShowAllSauces(!showAllSauces)}
                >
                  {showAllSauces ? 'Show Less' : `Show All Sauces (${sauceRecommendations.length})`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Top Recommended Sauces Based on Current Astrological State - Always visible */}
      {topRecommendedSauces.length > 0 && (
        <div className="mt-4 pt-2 border-t border-gray-100">
          <h4 className="text-xs uppercase font-medium text-gray-500 mb-2">
            Celestially Aligned Sauces
            <span className="ml-1 text-gray-400 normal-case font-normal">(based on current astrological state)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {topRecommendedSauces.slice(0, 8).map((sauce, index) => (
              <div 
                key={index} 
                className="border rounded p-4 bg-gray-50 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col min-h-[180px]"
                onClick={() => toggleSauceCard(sauce.id ?? `top-sauce-${index}`)}
                onKeyDown={activateOnKey(() => toggleSauceCard(sauce.id ?? `top-sauce-${index}`))}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm leading-tight mr-1 max-w-[75%]">{sauce.name}</h5>
                  <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${getMatchScoreClass((sauce.matchPercentage ?? 0) / 100)}`}>
                    {sauce.matchPercentage}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 line-clamp-4 grow" title={sauce.description}>
                  {sauce.description}
                </p>
                
                {/* Expanded sauce details */}
                {expandedSauceCards[sauce.id ?? `top-sauce-${index}`] && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    <div className="flex space-x-1 mb-1">
                      {(sauce.elementalProperties?.Fire ?? 0) >= 0.3 && <Flame size={12} className="text-red-500" />}
                      {(sauce.elementalProperties?.Water ?? 0) >= 0.3 && <Droplets size={12} className="text-blue-500" />}
                      {(sauce.elementalProperties?.Earth ?? 0) >= 0.3 && <Mountain size={12} className="text-green-500" />}
                      {(sauce.elementalProperties?.Air ?? 0) >= 0.3 && <Wind size={12} className="text-yellow-500" />}
                    </div>
                    
                    {sauce.ingredients && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Ingredients:</h6>
                        <ul className="pl-4 list-disc">
                          {sauce.ingredients.map((ingredient: string, i: number) => (
                            <li key={i}>{ingredient}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Consistently display preparation steps using various possible field names */}
                    {(() : JSX.Element | null => {
                      const prep = sauce.preparationSteps ?? sauce.procedure ?? sauce.instructions;
                      if (!prep) return null;
                      return (
                        <div className="mt-2">
                          <h6 className="font-medium mb-1">Preparation:</h6>
                          {Array.isArray(prep) ? (
                            <ol className="pl-4 list-decimal">
                              {prep.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          ) : (
                            <p>{prep}</p>
                          )}
                        </div>
                      );
                    })()}
                    
                    {/* Add additional sauce information */}
                    {sauce.prepTime && (
                      <div className="mt-1">
                        <span className="text-gray-500">Prep time: </span>
                        <span>{sauce.prepTime}</span>
                      </div>
                    )}
                    
                    {sauce.cookTime && (
                      <div className="mt-1">
                        <span className="text-gray-500">Cook time: </span>
                        <span>{sauce.cookTime}</span>
                      </div>
                    )}
                    
                    {sauce.yield && (
                      <div className="mt-1">
                        <span className="text-gray-500">Yield: </span>
                        <span>{sauce.yield}</span>
                      </div>
                    )}
                    
                    {sauce.difficulty && (
                      <div className="mt-1">
                        <span className="text-gray-500">Difficulty: </span>
                        <span>{sauce.difficulty}</span>
                      </div>
                    )}
                    
                    {sauce.storageInstructions && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Storage:</h6>
                        <p>{sauce.storageInstructions}</p>
                      </div>
                    )}
                    
                    {sauce.technicalTips && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Technical Tips:</h6>
                        <p>{sauce.technicalTips}</p>
                      </div>
                    )}
                    
                    {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Culinary Uses:</h6>
                        <ul className="pl-4 list-disc">
                          {Array.isArray(sauce.culinaryUses) ? 
                            sauce.culinaryUses.map((use: string, i: number) => (
                              <li key={i}>{use}</li>
                            )) : 
                            <li>{sauce.culinaryUses}</li>
                          }
                        </ul>
                      </div>
                    )}
                    
                    {sauce.variants && sauce.variants.length > 0 && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Variants:</h6>
                        <ul className="pl-4 list-disc">
                          {Array.isArray(sauce.variants) ? 
                            sauce.variants.map((variant: string, i: number) => (
                              <li key={i}>{variant}</li>
                            )) : 
                            <li>{sauce.variants}</li>
                          }
                        </ul>
                      </div>
                    )}
                    
                    {sauce.pairsWith && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Pairs Well With:</h6>
                        {Array.isArray(sauce.pairsWith) ? (
                          <ul className="pl-4 list-disc">
                            {sauce.pairsWith.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{sauce.pairsWith}</p>
                        )}
                      </div>
                    )}
                    
                    {sauce.usage && (
                      <div className="mt-1">
                        <h6 className="font-medium mb-1">Usage:</h6>
                        <p>{sauce.usage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
// Type Harmony imports

import { ElementalItem } from '@/calculations/alchemicalTransformation';
import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import { RulingPlanet } from '@/constants/planets';
import {
  BalancedElementalProperties,
  DefaultAlchemicalProperties as _DefaultAlchemicalProperties,
  createSafeElementalProperties
} from '@/constants/typeDefaults';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { cookingMethods } from '@/data/cooking/cookingMethods';
import { cuisines } from '@/data/cuisines';
import allIngredients from '@/data/ingredients';
import type { Modality } from '@/data/ingredients/types';
import { useAlchemicalRecommendations } from '@/hooks/useAlchemicalRecommendations';
import type {
  AlchemicalServiceResponse as _AlchemicalServiceResponse,
  AlchemicalRecommendations,
  ElementalRecommendation
} from '@/services/AlchemicalService';
import { LunarPhaseWithSpaces as _LunarPhaseWithSpaces, ZodiacSign as _ZodiacSign, PlanetaryAspect } from '@/types/alchemy';

// Import the correct data sources

// Add import for modality type and utils
import type {
  ElementalPropertiesType,
  AlchemicalPropertiesType,
  ZodiacSignType,
  LunarPhaseType,
  PlanetaryPositionsType
} from '@/types/alchemy';
import { createAstrologicalBridge } from '@/types/bridges/astrologicalBridge';
import { determineIngredientModality } from '@/utils/ingredientUtils';
import { safelyExtractElementalProperties, createDefaultElementalProperties as _createDefaultElementalProperties } from '@/utils/typeGuards/astrologicalGuards';

// ========== PHASE 4: UPDATED IMPORTS TO USE TYPE ALIASES ==========

interface AlchemicalRecommendationsProps {
  // Updated to use standardized type aliases
  planetPositions?: PlanetaryPositionsType;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSignType | null;
  lunarPhase?: LunarPhaseType;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  aspects?: PlanetaryAspect[];
  targetElementalProfile?: ElementalPropertiesType;
  targetAlchemicalProfile?: AlchemicalPropertiesType;
  maxRecommendations?: number;
  includeDetailedAnalysis?: boolean;
}

const AlchemicalRecommendationsView: React.FC<AlchemicalRecommendationsProps> = ({
  planetPositions,
  isDaytime = true,
  currentZodiac,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
  aspects = [],
  targetElementalProfile: _targetElementalProfile,
  targetAlchemicalProfile: _targetAlchemicalProfile,
  maxRecommendations = 5,
  includeDetailedAnalysis: _includeDetailedAnalysis = false
}) => {
  // Use AlchemicalContext to get current astronomical state if not provided
  const alchemicalContext = useAlchemical();
  
  // Use context values as fallbacks if props aren't provided
  const resolvedPlanetaryPositions = useMemo(() => {
    // Convert planetary positions to the format expected by the hook: Record<RulingPlanet, number>
    const convertToHookFormat = (positions: unknown): Record<RulingPlanet, number> => {
      // Default base positions (in degrees)
      const defaultPositions: Record<RulingPlanet, number> = {
        Sun: 0,        // Aries 0°
        Moon: 90,      // Cancer 0°
        Mercury: 60,   // Gemini 0°
        Venus: 30,     // Taurus 0°
        Mars: 0,       // Aries 0°
        Jupiter: 240,  // Sagittarius 0°
        Saturn: 270,   // Capricorn 0°
        Uranus: 300,   // Aquarius 0°
        Neptune: 330,  // Pisces 0°
        Pluto: 210     // Scorpio 0°
      };
      
      if (!positions) return defaultPositions;
      
      // Convert zodiac signs to approximate degrees
      const zodiacToDegrees = (sign: string): number => {
        const signMapping: Record<string, number> = {
          'aries': 0, 'taurus': 30, 'gemini': 60, 'cancer': 90,
          'leo': 120, 'virgo': 150, 'libra': 180, 'scorpio': 210,
          'sagittarius': 240, 'capricorn': 270, 'aquarius': 300, 'pisces': 330
        };
        return signMapping[sign.toLowerCase()] || 0;
      };
      
      const result: Record<RulingPlanet, number> = { ...defaultPositions };
      
      // Convert each position
      Object.entries(positions).forEach(([planet, value]) => {
        if (planet in result) {
          if (typeof value === 'string') {
            result[planet as RulingPlanet] = zodiacToDegrees(value);
          } else if (typeof value === 'number') {
            result[planet as RulingPlanet] = value;
          } else if (value && typeof value === 'object' && (value as Record<string, unknown>).sign) {
            const signValue = (value as Record<string, unknown>).sign;
            if (typeof signValue === 'string') {
              result[planet as RulingPlanet] = zodiacToDegrees(signValue);
            }
          }
        }
      });
      
      return result;
    };
    
    if (planetPositions) {
      return convertToHookFormat(planetPositions);
    }
    
    // Convert from context planetary positions
    if (alchemicalContext.planetaryPositions) {
      return convertToHookFormat(alchemicalContext.planetaryPositions);
    }
    
    // Return default positions
    return convertToHookFormat(null);
  }, [planetPositions, alchemicalContext.planetaryPositions]);
  
  const resolvedIsDaytime = isDaytime !== undefined ? isDaytime : alchemicalContext.isDaytime;
  const resolvedCurrentZodiac: ZodiacSignType | null = currentZodiac || 
    (alchemicalContext.state.astrologicalState.zodiacSign as ZodiacSignType) || null;
  
  // Fix the lunar phase type resolution
  const resolvedLunarPhase: LunarPhaseType = lunarPhase || 
    (alchemicalContext.state.astrologicalState.lunarPhase as LunarPhaseType) || 
    'new moon';
  
  // State for targeting specific elements or properties using type aliases
  const [targetElement, setTargetElement] = useState<ElementalCharacter | undefined>(undefined);
  const [targetProperty, setTargetProperty] = useState<AlchemicalProperty | undefined>(undefined);
  const [modalityFilter, setModalityFilter] = useState<Modality | 'all'>('all');
  
  // State for displaying recommendations using standardized types
  const [_recommendations, _setRecommendations] = useState<AlchemicalRecommendations | null>(null);
  const [elementalRecommendation, setElementalRecommendation] = useState<ElementalRecommendation | null>(null);
  const [_isLoading, _setIsLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);
  
  // Convert ingredients object to an array of ElementalItem objects using safe type creation
  const ingredientsArray = useMemo(() => {
    return Object.entries(allIngredients).map(([key, ingredient]) => {
      // Get ingredient elemental properties or calculate them
      let elementalProps: ElementalPropertiesType;
      
      // Use Type Harmony approach for safe property extraction
      const extractedProps = safelyExtractElementalProperties(ingredient);
      if (extractedProps) {
        elementalProps = createSafeElementalProperties(extractedProps);
      } else {
        // Calculate based on ingredient category and attributes
        const category = (ingredient as Record<string, unknown>).category || '';
        const astrologicalProfile = (ingredient as Record<string, unknown>).astrologicalProfile;
        const rulingPlanets = (astrologicalProfile && typeof astrologicalProfile === 'object' && 
          Array.isArray((astrologicalProfile as Record<string, unknown>).rulingPlanets)) 
          ? (astrologicalProfile as Record<string, unknown>).rulingPlanets as string[] 
          : [];
        
        // Start with balanced properties
        const tempProps = { ...BalancedElementalProperties };
        
        // Adjust by category
        const categoryStr = typeof category === 'string' ? category : '';
        if (categoryStr.toLowerCase().includes('vegetable')) {
          tempProps.Earth += 0.5;
          tempProps.Water += 0.3;
        } else if (categoryStr.toLowerCase().includes('fruit')) {
          tempProps.Water += 0.4;
          tempProps.Air += 0.3;
        } else if (categoryStr.toLowerCase().includes('protein') || categoryStr.toLowerCase().includes('meat')) {
          tempProps.Fire += 0.4;
          tempProps.Earth += 0.3;
        } else if (categoryStr.toLowerCase().includes('grain')) {
          tempProps.Earth += 0.5;
          tempProps.Air += 0.2;
        } else if (categoryStr.toLowerCase().includes('herb') || categoryStr.toLowerCase().includes('spice')) {
          tempProps.Fire += 0.3;
          tempProps.Air += 0.4;
        }
        
        // Adjust by ruling planets
        rulingPlanets.forEach((planet: unknown) => {
          const planetStr = typeof planet === 'string' ? planet : '';
          switch (planetStr.toLowerCase()) {
            case 'sun':
              tempProps.Fire += 0.2;
              break;
            case 'moon':
              tempProps.Water += 0.2;
              break;
            case 'mercury':
              tempProps.Air += 0.2;
              break;
            case 'venus':
              tempProps.Earth += 0.1;
              tempProps.Water += 0.1;
              break;
            case 'mars':
              tempProps.Fire += 0.2;
              break;
            case 'jupiter':
              tempProps.Air += 0.1;
              tempProps.Fire += 0.1;
              break;
            case 'saturn':
              tempProps.Earth += 0.2;
              break;
          }
        });
        
        // Use safe creation to normalize values
        elementalProps = createSafeElementalProperties(tempProps);
      }
      
      // Use Type Harmony approach for safe object creation
      const bridge = createAstrologicalBridge();
      const ingredientName = bridge.safeAccess<string>(ingredient, 'name') || key;
      const qualities = bridge.safeAccess<string[]>(ingredient, 'qualities') || [];
      const modality = bridge.safeAccess(ingredient, 'modality') || 'cardinal';
      
      return {
        id: key,
        name: ingredientName,
        elementalProperties: elementalProps,
        qualities: qualities,
        modality: modality,
        // Add required ElementalItem properties
        category: bridge.safeAccess<string>(ingredient, 'category') || 'ingredient',
        description: bridge.safeAccess<string>(ingredient, 'description') || ''
      } as ElementalItem;
    });
  }, []);
  
  // Convert cooking methods to ElementalItem array
  const cookingMethodsArray = useMemo(() => {
    return Object.entries(cookingMethods).map(([key, method]) => {
      // Get cooking method elemental effect or calculate it
      let elementalEffect: ElementalPropertiesType;
      if ((method as Record<string, unknown>).elementalEffect) {
        elementalEffect = (method as Record<string, unknown>).elementalEffect as ElementalPropertiesType;
      } else {
        // Calculate based on cooking method characteristics
        elementalEffect = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        const methodName = (method.name || key).toLowerCase();
        
        // Adjust by cooking method type
        if (methodName.includes('grill') || methodName.includes('roast') || methodName.includes('bake') ||
            methodName.includes('broil') || methodName.includes('fry')) {
          elementalEffect.Fire += 0.6;
          elementalEffect.Air += 0.2;
        } else if (methodName.includes('steam') || methodName.includes('boil') || methodName.includes('poach') ||
                  methodName.includes('simmer')) {
          elementalEffect.Water += 0.6;
          elementalEffect.Air += 0.2;
        } else if (methodName.includes('saute') || methodName.includes('stir-fry')) {
          elementalEffect.Fire += 0.4;
          elementalEffect.Air += 0.4;
        } else if (methodName.includes('braise') || methodName.includes('stew')) {
          elementalEffect.Water += 0.4;
          elementalEffect.Earth += 0.4;
        } else if (methodName.includes('smoke') || methodName.includes('cure')) {
          elementalEffect.Air += 0.5;
          elementalEffect.Fire += 0.3;
        } else if (methodName.includes('ferment') || methodName.includes('pickle')) {
          elementalEffect.Water += 0.4;
          elementalEffect.Earth += 0.4;
        } else {
          // Generic cooking method - slight emphasis on fire
          elementalEffect.Fire += 0.3;
          elementalEffect.Earth += 0.3;
          elementalEffect.Water += 0.2;
          elementalEffect.Air += 0.2;
        }
        
        // Normalize values
        // Pattern KK-8: Advanced calculation safety for reduction and division operations
        const total = Object.values(elementalEffect).reduce((sum, val) => {
          const numericSum = Number(sum) || 0;
          const numericVal = Number(val) || 0;
          return numericSum + numericVal;
        }, 0);
        const numericTotal = Number(total) || 0;
        if (numericTotal > 0) {
          for (const element in elementalEffect) {
            const currentValue = Number(elementalEffect[element as keyof typeof elementalEffect]) || 1;
            elementalEffect[element as keyof typeof elementalEffect] = currentValue / numericTotal;
          }
        }
      }
      
      return {
        id: key,
        name: (method as Record<string, unknown>).name || key,
        elementalProperties: elementalEffect
      } as ElementalItem;
    });
  }, []);
  
  // Convert cuisines to ElementalItem array
  const cuisinesArray = useMemo(() => {
    return Object.entries(cuisines).map(([key, cuisine]) => {
      // Get cuisine elemental state or calculate it
      let elementalState: ElementalPropertiesType;
      if ((cuisine as Record<string, unknown>).elementalState) {
        elementalState = (cuisine as Record<string, unknown>).elementalState as ElementalPropertiesType;
      } else {
        // Calculate based on cuisine characteristics
        elementalState = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
        
        const cuisineName = ((cuisine as Record<string, unknown>).name || key).toString().toLowerCase();
        const _region = ((cuisine as Record<string, unknown>).region || '').toString().toLowerCase();
        
        // Adjust by cuisine type/region
        if (cuisineName.includes('indian') || cuisineName.includes('thai') || 
            cuisineName.includes('mexican') || cuisineName.includes('cajun')) {
          // Spicy cuisines tend to have more Fire
          elementalState.Fire += 0.5;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('japanese') || cuisineName.includes('nordic') ||
                  cuisineName.includes('korean')) {
          // More balanced cuisines
          elementalState.Water += 0.4;
          elementalState.Earth += 0.3;
          elementalState.Air += 0.2;
        } else if (cuisineName.includes('french') || cuisineName.includes('italian')) {
          // Hearty European cuisines
          elementalState.Earth += 0.4;
          elementalState.Fire += 0.3;
          elementalState.Water += 0.2;
        } else if (cuisineName.includes('mediter')) {
          // Mediterranean cuisines
          elementalState.Earth += 0.3;
          elementalState.Air += 0.3;
          elementalState.Fire += 0.2;
        } else if (cuisineName.includes('greek') || cuisineName.includes('spanish')) {
          // Mediterranean cuisines
          elementalState.Earth += 0.3;
          elementalState.Fire += 0.3;
          elementalState.Air += 0.2;
        } else {
          // Default profile with slight Earth emphasis for unknown cuisines
          elementalState.Earth += 0.3;
          elementalState.Water += 0.3;
          elementalState.Fire += 0.2;
          elementalState.Air += 0.2;
        }
        
        // Normalize values
        // Pattern KK-8: Advanced calculation safety for reduction and division operations
        const total = Object.values(elementalState).reduce((sum, val) => {
          const numericSum = Number(sum) || 0;
          const numericVal = Number(val) || 0;
          return numericSum + numericVal;
        }, 0);
        const numericTotal = Number(total) || 0;
        if (numericTotal > 0) {
          for (const element in elementalState) {
            const currentValue = Number(elementalState[element as keyof typeof elementalState]) || 1;
            elementalState[element as keyof typeof elementalState] = currentValue / numericTotal;
          }
        }
      }
      
      return {
        id: key,
        name: (cuisine as Record<string, unknown>).name || key,
        elementalProperties: elementalState
      } as ElementalItem;
    });
  }, []);
  
  // Filter ingredients array by modality
  const filteredIngredientsArray = useMemo(() => {
    if (modalityFilter === 'all') return ingredientsArray;
    
    return ingredientsArray.filter(ingredient => {
      const elementalProps = ingredient.elementalProperties;
      const qualities = ingredient.qualities || [];
      const modality = ingredient.modality || 
        determineIngredientModality(qualities as string[], elementalProps);
      return modality === modalityFilter;
    });
  }, [ingredientsArray, modalityFilter]);
  
  // Get recommendations using our hook
  const {
    recommendations: alchemicalRecommendations,
    transformedIngredients: _transformedIngredients,
    transformedMethods: _transformedMethods,
    transformedCuisines: _transformedCuisines,
    loading,
    error: alchemicalError,
    energeticProfile
  } = useAlchemicalRecommendations({
    ingredients: filteredIngredientsArray,
    cookingMethods: cookingMethodsArray,
    cuisines: cuisinesArray,
    planetPositions: resolvedPlanetaryPositions,
    isDaytime: resolvedIsDaytime,
    targetElement,
    targetAlchemicalProperty: targetProperty,
    count: maxRecommendations,
    currentZodiac: resolvedCurrentZodiac,
    lunarPhase: resolvedLunarPhase,
    tarotElementBoosts: tarotElementBoosts as Record<ElementalCharacter, number>,
    tarotPlanetaryBoosts,
    aspects
  });
  
  // Generate elemental recommendation based on current astrological state
  React.useEffect(() => {
    if (alchemicalRecommendations && energeticProfile) {
      const generateElementalRecommendation = (): ElementalRecommendation => {
        const dominantElement = alchemicalRecommendations.dominantElement;
        // Use a fallback if elementalBalance doesn't exist
        const elementalBalance = (alchemicalRecommendations as any).elementalBalance || {
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        };
        
        // Calculate harmony score based on elemental balance
        const harmony = Object.values(elementalBalance).reduce((acc: number, val: unknown) => acc + ((val as number) * (val as number)), 0);
        const harmonyScore = Math.max(0, Math.min(1, 1 - (Math.abs(Number(harmony) - 0.25) * 2)));
        
        // Generate cooking techniques based on dominant element
        const cookingTechniques = dominantElement === 'Fire' 
          ? ['grilling', 'roasting', 'searing', 'flambéing']
          : dominantElement === 'Water'
          ? ['steaming', 'boiling', 'poaching', 'sous vide']
          : dominantElement === 'Earth' 
          ? ['braising', 'slow cooking', 'stewing', 'baking']
          : ['smoking', 'dehydrating', 'whipping', 'fermentation'];
        
        // Generate complementary ingredients
        const complementaryIngredients = dominantElement === 'Fire'
          ? ['peppers', 'ginger', 'cinnamon', 'garlic']
          : dominantElement === 'Water'
          ? ['cucumber', 'melon', 'fish', 'coconut']
          : dominantElement === 'Earth'
          ? ['root vegetables', 'grains', 'mushrooms', 'potatoes']
          : ['herbs', 'leafy greens', 'citrus', 'seeds'];
        
        // Generate flavor profiles
        const flavorProfiles = dominantElement === 'Fire'
          ? ['spicy', 'pungent', 'warming', 'stimulating']
          : dominantElement === 'Water'
          ? ['cool', 'refreshing', 'soothing', 'cleansing']
          : dominantElement === 'Earth'
          ? ['grounding', 'nourishing', 'stabilizing', 'satisfying']
          : ['light', 'uplifting', 'clarifying', 'energizing'];
        
        return {
          dominantElement: dominantElement,
          elementalProfile: elementalBalance,
          cookingTechniques,
          complementaryIngredients,
          flavorProfiles,
          healthBenefits: [`Supports ${dominantElement.toLowerCase()} constitution`, 'Promotes elemental balance'],
          timeOfDay: resolvedIsDaytime ? ['morning', 'midday'] : ['evening', 'night'],
          seasonalBest: dominantElement === 'Fire' ? ['summer'] : dominantElement === 'Water' ? ['spring'] : 
                       dominantElement === 'Earth' ? ['autumn'] : ['winter'],
          moodEffects: [`Enhances ${dominantElement.toLowerCase()} qualities`, 'Balances energy'],
          culinaryHerbs: dominantElement === 'Fire' ? ['basil', 'rosemary'] : dominantElement === 'Water' ? ['mint', 'parsley'] :
                        dominantElement === 'Earth' ? ['thyme', 'sage'] : ['dill', 'cilantro'],
          compatibility: harmonyScore
        };
      };
      
      setElementalRecommendation(generateElementalRecommendation());
    }
  }, [alchemicalRecommendations, energeticProfile, resolvedIsDaytime, resolvedLunarPhase]);
  
  if (loading) return <div>Loading alchemical recommendations...</div>;
  if (alchemicalError) return <div>Error: {alchemicalError.message}</div>;
  
  return (
    <div className="alchemical-recommendations">
      <h2>Alchemical Recommendations</h2>
      
      <div className="alchemical-stats">
        <h3>Dominant Influences</h3>
        <div className="stat-grid">
          <div className="stat">
            <span className="label">Dominant Element:</span>
            <span className="value">{alchemicalRecommendations.dominantElement}</span>
          </div>
          <div className="stat">
            <span className="label">Dominant Alchemical Property:</span>
            <span className="value">{alchemicalRecommendations.dominantAlchemicalProperty}</span>
          </div>
          {resolvedCurrentZodiac && (
            <div className="stat">
              <span className="label">Current Zodiac:</span>
              <span className="value">{resolvedCurrentZodiac}</span>
            </div>
          )}
          {resolvedLunarPhase && (
            <div className="stat">
              <span className="label">Lunar Phase:</span>
              <span className="value">{resolvedLunarPhase}</span>
            </div>
          )}
        </div>
        
        <h3>Energetic Profile</h3>
        <div className="stat-grid">
          <div className="stat">
            <span className="label">Heat:</span>
            <span className="value">{alchemicalRecommendations.heat.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Entropy:</span>
            <span className="value">{alchemicalRecommendations.entropy.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Reactivity:</span>
            <span className="value">{alchemicalRecommendations.reactivity.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span className="label">Greg's Energy:</span>
            <span className="value">{alchemicalRecommendations.gregsEnergy.toFixed(2)}</span>
          </div>
        </div>
        
        {/* New section to display the energetic profile details */}
        {energeticProfile && (
          <div className="elemental-balance">
            <h3>Elemental Balance</h3>
            <div className="balance-bars">
              {Object.entries(energeticProfile.elementalBalance as Record<string, number>).map(([element, value]: [string, number]) => (
                <div key={element} className="balance-bar">
                  <span className="element-label">{element}</span>
                  <div className="bar-container">
                    <div 
                      className={`bar-fill ${element.toLowerCase()}`} 
                      style={{ width: `${Math.min(100, value * 100)}%` }}
                    />
                  </div>
                  <span className="percentage">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
            
            <h3>Alchemical Properties</h3>
            <div className="balance-bars">
              {Object.entries(energeticProfile.alchemicalProperties).map(([property, value]) => (
                <div key={property} className="balance-bar">
                  <span className="property-label">{property}</span>
                  <div className="bar-container">
                    <div 
                      className={`bar-fill ${property.toLowerCase()}`} 
                      style={{ width: `${Math.min(100, value * 100)}%` }}
                    />
                  </div>
                  <span className="percentage">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="recommendations-filters">
        <h3>Filter Recommendations</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Element:</label>
            <select 
              value={targetElement || ''} 
              onChange={(e) => setTargetElement(e.target.value as ElementalCharacter || undefined)}
            >
              <option value="">Any Element</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Air">Air</option>
              <option value="Earth">Earth</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Alchemical Property:</label>
            <select 
              value={targetProperty || ''} 
              onChange={(e) => setTargetProperty(e.target.value as AlchemicalProperty || undefined)}
            >
              <option value="">Any Property</option>
              <option value="Spirit">Spirit</option>
              <option value="Essence">Essence</option>
              <option value="Matter">Matter</option>
              <option value="Substance">Substance</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="modality-filter">Quality:</label>
            <select 
              id="modality-filter" 
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as Modality | 'all')}
            >
              <option value="all">All</option>
              <option value="Cardinal">Cardinal</option>
              <option value="Fixed">Fixed</option>
              <option value="Mutable">Mutable</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="recommendation-sections">
        {/* Recommended Ingredients */}
        <div className="recommendation-section">
          <h3>Recommended Ingredients</h3>
          {alchemicalRecommendations.topIngredients.length > 0 ? (
            <ul className="recommendation-list">
              {alchemicalRecommendations.topIngredients.map(ingredient => (
                <li key={ingredient.id} className="recommendation-item">
                  <h4>{ingredient.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{ingredient.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{ingredient.dominantAlchemicalProperty}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Greg's Energy:</span>
                      <span className="value">{ingredient.gregsEnergy.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = ingredient.modality;
                      const modalityStr = typeof modalityData === 'string' ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {(ingredient.modality as React.ReactNode) || 'Unknown'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredient recommendations available.</p>
          )}
        </div>
        
        {/* Recommended Cooking Methods */}
        <div className="recommendation-section">
          <h3>Recommended Cooking Methods</h3>
          {alchemicalRecommendations.topMethods.length > 0 ? (
            <ul className="recommendation-list">
              {alchemicalRecommendations.topMethods.map(method => (
                <li key={method.id} className="recommendation-item">
                  <h4>{method.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{method.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{method.dominantAlchemicalProperty}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = method.modality;
                      const modalityStr = typeof modalityData === 'string' ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {(method.modality as React.ReactNode) || 'Unknown'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No cooking method recommendations available.</p>
          )}
        </div>
        
        {/* Recommended Cuisines */}
        <div className="recommendation-section">
          <h3>Recommended Cuisines</h3>
          {alchemicalRecommendations.topCuisines.length > 0 ? (
            <ul className="recommendation-list">
              {alchemicalRecommendations.topCuisines.map(cuisine => (
                <li key={cuisine.id} className="recommendation-item">
                  <h4>{cuisine.name}</h4>
                  <div className="item-details">
                    <div className="detail">
                      <span className="label">Dominant Element:</span>
                      <span className="value">{cuisine.dominantElement}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Alchemical Property:</span>
                      <span className="value">{cuisine.dominantAlchemicalProperty}</span>
                    </div>
                  </div>
                  <div className="item-modality">
                    <span className={`modality-badge ${(() => {
                      const modalityData = cuisine.modality;
                      const modalityStr = typeof modalityData === 'string' ? modalityData.toLowerCase() : (modalityData || '').toString().toLowerCase();
                      return modalityStr;
                    })()}`}>
                      {(cuisine.modality as React.ReactNode) || 'Unknown'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No cuisine recommendations available.</p>
          )}
        </div>
        
        {/* Elemental Harmony Recommendations */}
        {elementalRecommendation && (
          <div className="recommendation-section elemental-section">
            <h3>🔥 Elemental Harmony Analysis</h3>
            <div className="elemental-recommendation">
              <div className="elemental-summary">
                <h4>Primary Element: {elementalRecommendation.dominantElement}</h4>
                <p className="harmony-score">
                  Compatibility Score: <span className={`score ${elementalRecommendation.compatibility > 0.7 ? 'high' : elementalRecommendation.compatibility > 0.4 ? 'medium' : 'low'}`}>
                    {Math.round(elementalRecommendation.compatibility * 100)}%
                  </span>
                </p>
              </div>
              
              <div className="techniques-section">
                <h4>🍳 Recommended Cooking Techniques</h4>
                <div className="technique-list">
                  {elementalRecommendation.cookingTechniques.map((technique, index) => (
                    <span key={index} className="technique-badge">{technique}</span>
                  ))}
                </div>
              </div>
              
              <div className="ingredients-section">
                <h4>🌿 Complementary Ingredients</h4>
                <div className="ingredient-list">
                  {elementalRecommendation.complementaryIngredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-badge">{ingredient}</span>
                  ))}
                </div>
              </div>
              
              <div className="flavor-section">
                <h4>👅 Flavor Profile</h4>
                <div className="flavor-list">
                  {elementalRecommendation.flavorProfiles.map((flavor, index) => (
                    <span key={index} className="flavor-badge">{flavor}</span>
                  ))}
                </div>
              </div>
              
              <div className="timing-section">
                <h4>⏰ Optimal Timing</h4>
                <div className="timing-grid">
                  <div className="timing-item">
                    <strong>Time of Day:</strong> {elementalRecommendation.timeOfDay.join(', ')}
                  </div>
                  <div className="timing-item">
                    <strong>Best Season:</strong> {elementalRecommendation.seasonalBest.join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="herbs-section">
                <h4>🌿 Culinary Herbs</h4>
                <div className="herbs-list">
                  {elementalRecommendation.culinaryHerbs.map((herb, index) => (
                    <span key={index} className="herb-badge">{herb}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .alchemical-recommendations {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .label {
          font-weight: 600;
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
        }
        
        .value {
          font-size: 1.2rem;
          color: #222;
        }
        
        .filter-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-group select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #ccc;
          min-width: 150px;
        }
        
        .recommendation-sections {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .recommendation-section {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          padding: 1.5rem;
        }
        
        .recommendation-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .recommendation-item {
          border-bottom: 1px solid #eee;
          padding: 1rem 0;
        }
        
        .recommendation-item:last-child {
          border-bottom: none;
        }
        
        .item-details {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .detail {
          font-size: 0.9rem;
        }
        
        .item-modality {
          margin-top: 0.5rem;
          text-align: right;
        }
        
        .modality-badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background-color: #f0f0f0;
          color: #555;
          font-size: 0.8rem;
        }
        
        /* Elemental Recommendation Styles */
        .elemental-section {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border: 2px solid #dee2e6;
          border-radius: 12px;
          margin-top: 2rem;
        }
        
        .elemental-recommendation {
          display: grid;
          gap: 1.5rem;
          padding: 1rem;
        }
        
        .elemental-summary {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .harmony-score .score.high {
          color: #28a745;
          font-weight: bold;
        }
        
        .harmony-score .score.medium {
          color: #ffc107;
          font-weight: bold;
        }
        
        .harmony-score .score.low {
          color: #dc3545;
          font-weight: bold;
        }
        
        .balance-suggestions {
          display: grid;
          gap: 0.75rem;
        }
        
        .balance-suggestion {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .element-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
          color: white;
        }
        
        .element-badge.fire {
          background-color: #dc3545;
        }
        
        .element-badge.water {
          background-color: #007bff;
        }
        
        .element-badge.earth {
          background-color: #28a745;
        }
        
        .element-badge.air {
          background-color: #6c757d;
        }
        
        .suggestion-text {
          font-size: 0.9rem;
          color: #495057;
        }
        
        .adjustment-indicator {
          font-weight: bold;
          font-size: 0.9rem;
          color: #6c757d;
        }
        
        .optimal-timing {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 1.5rem;
        }
        
        .timing-details p {
          margin: 0.5rem 0;
        }
        
        /* New Elemental Recommendation Badge Styles */
        .technique-list, .ingredient-list, .flavor-list, .herbs-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .technique-badge, .ingredient-badge, .flavor-badge, .herb-badge {
          padding: 0.3rem 0.75rem;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
          color: white;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .technique-badge {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        .ingredient-badge {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        .flavor-badge {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        
        .herb-badge {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
        
        .timing-grid {
          display: grid;
          gap: 1rem;
          margin-top: 0.75rem;
        }
        
        .timing-item {
          background-color: rgba(255, 255, 255, 0.7);
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 4px solid #ffeaa7;
        }
      `}</style>
    </div>
  );
};

export default AlchemicalRecommendationsView; 
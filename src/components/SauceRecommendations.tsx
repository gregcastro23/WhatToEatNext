'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Droplets,
  Star,
  Sparkles,
  Info,
  Flame,
  Wind,
  Mountain
} from 'lucide-react';
import { ElementalProperties } from '@/types/alchemy';
import { calculateElementalMatch, getMatchScoreClass } from '@/utils/cuisineRecommender';

// ========== INTERFACES ==========

interface SauceData {
  id: string;
  name: string;
  description?: string;
  elementalProperties?: ElementalProperties;
  keyIngredients?: string[];
  astrologicalInfluences?: string[];
  matchPercentage?: number;
  score?: number;
  reasoning?: string[];
  [key: string]: unknown;
}

interface EnhancedSauceData extends SauceData {
  elementalCompatibility: number;
  seasonalRelevance: number;
  astrologicalAlignment: number;
  monicaOptimization: number;
  overallScore: number;
  compatibilityFactors: string[];
  recipeCompatibility?: number;
}

interface SauceRecommendationsProps {
  sauces: SauceData[];
  cuisineName?: string;
  selectedRecipe?: any;
  currentElementalProfile: ElementalProperties;
  currentZodiac?: string;
  lunarPhase?: string;
  currentSeason?: string;
  maxDisplayed?: number;
  onSauceSelect?: (sauce: SauceData) => void;
}

// ========== HELPER FUNCTIONS ==========

const calculateSeasonalRelevance = (sauce: SauceData, currentSeason?: string): number => {
  if (!currentSeason) return 0.7; // Default neutral score
  
  // Seasonal sauce preferences
  const seasonalPreferences: Record<string, string[]> = {
    spring: ['light', 'fresh', 'herb', 'citrus', 'vinaigrette', 'pesto'],
    summer: ['fresh', 'cold', 'gazpacho', 'salsa', 'yogurt', 'cucumber'],
    autumn: ['warm', 'rich', 'mushroom', 'wine', 'butter', 'cream'],
    winter: ['hearty', 'warm', 'gravy', 'cheese', 'cream', 'wine']
  };
  
  const seasonKeywords = seasonalPreferences[currentSeason.toLowerCase()] || [];
  const sauceName = sauce.name.toLowerCase();
  const sauceDescription = (sauce.description || '').toLowerCase();
  
  let relevanceScore = 0.5; // Base score
  
  seasonKeywords.forEach(keyword => {
    if (sauceName.includes(keyword) || sauceDescription.includes(keyword)) {
      relevanceScore += 0.1;
    }
  });
  
  return Math.min(1, relevanceScore);
};

const calculateAstrologicalAlignment = (
  sauce: SauceData, 
  currentZodiac?: string, 
  lunarPhase?: string
): number => {
  let alignmentScore = 0.5; // Base score
  
  // Check zodiac influences
  if (currentZodiac && sauce.astrologicalInfluences) {
    if (sauce.astrologicalInfluences.includes(currentZodiac)) {
      alignmentScore += 0.3;
    }
  }
  
  // Check lunar phase influences
  if (lunarPhase && sauce.astrologicalInfluences) {
    if (sauce.astrologicalInfluences.includes(lunarPhase)) {
      alignmentScore += 0.2;
    }
  }
  
  // Planetary day influence (simplified)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const planetaryDays = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const currentPlanetaryDay = planetaryDays[dayOfWeek];
  
  if (sauce.astrologicalInfluences?.includes(currentPlanetaryDay)) {
    alignmentScore += 0.15;
  }
  
  return Math.min(1, alignmentScore);
};

const calculateMonicaOptimization = (elementalProperties?: ElementalProperties): number => {
  if (!elementalProperties) return 0.7;
  
  // Simplified Monica constant calculation based on elemental balance
  const { Fire, Water, Earth, Air } = elementalProperties;
  const balance = Math.abs(Fire - Water) + Math.abs(Earth - Air);
  const harmony = 1 - (balance / 2); // Lower balance difference = higher harmony
  
  // Monica optimization favors balanced elemental properties
  return Math.max(0.3, Math.min(1, harmony + 0.2));
};

const calculateRecipeCompatibility = (sauce: SauceData, selectedRecipe?: any): number => {
  if (!selectedRecipe) return 0.7;
  
  let compatibilityScore = 0.5;
  
  // Check if sauce ingredients complement recipe ingredients
  if (sauce.keyIngredients && selectedRecipe.ingredients) {
    const recipeIngredientNames = selectedRecipe.ingredients.map((ing: any) => 
      typeof ing === 'string' ? ing.toLowerCase() : (ing.name || '').toLowerCase()
    );
    
    const complementaryIngredients = sauce.keyIngredients.filter(sauceIng =>
      recipeIngredientNames.some((recipeIng: string) => 
        recipeIng.includes(sauceIng.toLowerCase()) || 
        sauceIng.toLowerCase().includes(recipeIng)
      )
    );
    
    if (complementaryIngredients.length > 0) {
      compatibilityScore += 0.2;
    }
  }
  
  // Check cooking method compatibility
  if (selectedRecipe.cookingMethods || selectedRecipe.tags) {
    const cookingMethods = [
      ...(selectedRecipe.cookingMethods || []),
      ...(selectedRecipe.tags || [])
    ].map((method: string) => method.toLowerCase());
    
    // Sauce-cooking method compatibility
    const sauceMethodCompatibility: Record<string, string[]> = {
      grilled: ['chimichurri', 'bbq', 'marinade', 'herb'],
      roasted: ['gravy', 'jus', 'wine', 'butter'],
      fried: ['aioli', 'mayo', 'ranch', 'hot sauce'],
      steamed: ['soy', 'ginger', 'light', 'broth'],
      baked: ['cheese', 'cream', 'tomato', 'herb']
    };
    
    cookingMethods.forEach(method => {
      const compatibleSauces = sauceMethodCompatibility[method] || [];
      const sauceName = sauce.name.toLowerCase();
      
      if (compatibleSauces.some(compatible => sauceName.includes(compatible))) {
        compatibilityScore += 0.15;
      }
    });
  }
  
  return Math.min(1, compatibilityScore);
};

const enhanceSauceWithAnalytics = (
  sauce: SauceData,
  currentElementalProfile: ElementalProperties,
  currentZodiac?: string,
  lunarPhase?: string,
  currentSeason?: string,
  selectedRecipe?: any
): EnhancedSauceData => {
  // 1. Elemental Compatibility (40% weight)
  const elementalCompatibility = sauce.elementalProperties 
    ? calculateElementalMatch(sauce.elementalProperties, currentElementalProfile)
    : 0.6;
  
  // 2. Seasonal Relevance (25% weight)
  const seasonalRelevance = calculateSeasonalRelevance(sauce, currentSeason);
  
  // 3. Astrological Alignment (20% weight)
  const astrologicalAlignment = calculateAstrologicalAlignment(sauce, currentZodiac, lunarPhase);
  
  // 4. Monica Optimization (15% weight)
  const monicaOptimization = calculateMonicaOptimization(sauce.elementalProperties);
  
  // 5. Recipe Compatibility (bonus factor)
  const recipeCompatibility = calculateRecipeCompatibility(sauce, selectedRecipe);
  
  // Calculate overall score with weights
  const overallScore = (
    elementalCompatibility * 0.40 +
    seasonalRelevance * 0.25 +
    astrologicalAlignment * 0.20 +
    monicaOptimization * 0.15
  ) * (recipeCompatibility > 0.7 ? 1.1 : 1.0); // Bonus for recipe compatibility
  
  // Generate compatibility factors
  const compatibilityFactors: string[] = [];
  
  if (elementalCompatibility > 0.7) {
    compatibilityFactors.push(`${Math.round(elementalCompatibility * 100)}% elemental harmony`);
  }
  if (seasonalRelevance > 0.7) {
    compatibilityFactors.push(`Perfect for ${currentSeason || 'current season'}`);
  }
  if (astrologicalAlignment > 0.7) {
    compatibilityFactors.push('Aligned with celestial energies');
  }
  if (monicaOptimization > 0.8) {
    compatibilityFactors.push('Optimal alchemical balance');
  }
  if (recipeCompatibility > 0.7) {
    compatibilityFactors.push('Complements selected recipe');
  }
  
  return {
    ...sauce,
    elementalCompatibility,
    seasonalRelevance,
    astrologicalAlignment,
    monicaOptimization,
    recipeCompatibility,
    overallScore,
    matchPercentage: Math.round(overallScore * 100),
    compatibilityFactors
  };
};

// ========== SAUCE CARD COMPONENT ==========

const SauceCard: React.FC<{
  sauce: EnhancedSauceData;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect?: (sauce: SauceData) => void;
}> = ({ sauce, isExpanded, onToggle, onSelect }) => {
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(sauce);
    }
  }, [onSelect, sauce]);

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={handleCardClick}>
        {/* Sauce Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <Droplets size={16} className="text-blue-500" />
            <h4 className="font-medium text-base text-gray-900 flex-1">
              {sauce.name}
            </h4>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${getMatchScoreClass(sauce.overallScore)}`}>
              {sauce.matchPercentage}%
            </span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* Compatibility Factors */}
        {sauce.compatibilityFactors.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Sparkles size={12} />
              <span>{sauce.compatibilityFactors[0]}</span>
            </div>
          </div>
        )}

        {/* Short Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {sauce.description}
        </p>

        {/* Key Ingredients Preview */}
        {sauce.keyIngredients && sauce.keyIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {sauce.keyIngredients.slice(0, 3).map((ingredient, index) => (
              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {ingredient}
              </span>
            ))}
            {sauce.keyIngredients.length > 3 && (
              <span className="text-xs text-gray-500">+{sauce.keyIngredients.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Full Description */}
          {sauce.description && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Description</h5>
              <p className="text-sm text-gray-600">{sauce.description}</p>
            </div>
          )}

          {/* Detailed Compatibility Scores */}
          <div className="mb-4">
            <h5 className="font-medium text-sm mb-2">Compatibility Analysis</h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-blue-600 font-medium">Elemental</div>
                <div className="text-sm font-semibold text-blue-800">
                  {Math.round(sauce.elementalCompatibility * 100)}%
                </div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-green-600 font-medium">Seasonal</div>
                <div className="text-sm font-semibold text-green-800">
                  {Math.round(sauce.seasonalRelevance * 100)}%
                </div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-xs text-purple-600 font-medium">Astrological</div>
                <div className="text-sm font-semibold text-purple-800">
                  {Math.round(sauce.astrologicalAlignment * 100)}%
                </div>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="text-xs text-yellow-600 font-medium">Monica</div>
                <div className="text-sm font-semibold text-yellow-800">
                  {Math.round(sauce.monicaOptimization * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* All Compatibility Factors */}
          {sauce.compatibilityFactors.length > 1 && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Why This Sauce?</h5>
              <ul className="list-disc pl-4 space-y-1">
                {sauce.compatibilityFactors.map((factor, index) => (
                  <li key={index} className="text-xs text-gray-600">{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {/* All Key Ingredients */}
          {sauce.keyIngredients && sauce.keyIngredients.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Key Ingredients</h5>
              <div className="flex flex-wrap gap-1">
                {sauce.keyIngredients.map((ingredient, index) => (
                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Elemental Properties Visualization */}
          {sauce.elementalProperties && (
            <div className="mb-4">
              <h5 className="font-medium text-sm mb-2">Elemental Properties</h5>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(sauce.elementalProperties).map(([element, value]) => (
                  <div key={element} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {element === 'Fire' && <Flame size={12} className="text-red-500" />}
                      {element === 'Water' && <Droplets size={12} className="text-blue-500" />}
                      {element === 'Air' && <Wind size={12} className="text-gray-500" />}
                      {element === 'Earth' && <Mountain size={12} className="text-green-500" />}
                      <span className="text-xs">{element}</span>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ width: `${Math.round(Number(value) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {onSelect && (
            <button
              onClick={handleSelectClick}
              className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Star size={16} />
              <span>Select This Sauce</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ========== MAIN COMPONENT ==========

export const SauceRecommendations: React.FC<SauceRecommendationsProps> = ({
  sauces,
  cuisineName,
  selectedRecipe,
  currentElementalProfile,
  currentZodiac,
  lunarPhase,
  currentSeason,
  maxDisplayed = 6,
  onSauceSelect
}) => {
  const [expandedSauces, setExpandedSauces] = useState<Record<string, boolean>>({});
  const [showAllSauces, setShowAllSauces] = useState(false);

  // Enhance and sort sauces
  const enhancedSauces = useMemo(() => {
    return sauces
      .map(sauce => enhanceSauceWithAnalytics(
        sauce, 
        currentElementalProfile, 
        currentZodiac, 
        lunarPhase, 
        currentSeason,
        selectedRecipe
      ))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [sauces, currentElementalProfile, currentZodiac, lunarPhase, currentSeason, selectedRecipe]);

  // Determine which sauces to display
  const displayedSauces = useMemo(() => {
    return showAllSauces ? enhancedSauces : enhancedSauces.slice(0, maxDisplayed);
  }, [enhancedSauces, showAllSauces, maxDisplayed]);

  const toggleSauceExpansion = useCallback((sauceId: string) => {
    setExpandedSauces(prev => ({
      ...prev,
      [sauceId]: !prev[sauceId]
    }));
  }, []);

  const toggleShowAll = useCallback(() => {
    setShowAllSauces(prev => !prev);
  }, []);

  if (enhancedSauces.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Droplets size={48} className="mx-auto mb-4 text-gray-300" />
        <p>No sauce recommendations available.</p>
        <p className="text-sm mt-1">Try selecting a different cuisine or recipe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Droplets className="text-blue-500" size={20} />
          <h3 className="text-lg font-medium text-gray-900">
            Celestial Sauce Harmonizer
            {cuisineName && ` for ${cuisineName}`}
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          {enhancedSauces.length} sauce{enhancedSauces.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Discover sauces that complement the current moment's alchemical alignment
        {selectedRecipe && ` and enhance your ${selectedRecipe.name}`}.
      </p>

      {/* Sauce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSauces.map((sauce) => (
          <SauceCard
            key={sauce.id}
            sauce={sauce}
            isExpanded={expandedSauces[sauce.id] || false}
            onToggle={() => toggleSauceExpansion(sauce.id)}
            onSelect={onSauceSelect}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {enhancedSauces.length > maxDisplayed && (
        <div className="text-center">
          <button
            onClick={toggleShowAll}
            className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAllSauces ? (
              <>
                <ChevronUp size={16} />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span>Show All {enhancedSauces.length} Sauces</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SauceRecommendations;
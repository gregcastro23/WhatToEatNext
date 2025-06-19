import React from 'react';
import { Flame, Droplets, Mountain, Wind, Beaker, ChefHat, Star, Thermometer } from 'lucide-react';
import { Ingredient } from '@/types';

interface IngredientDisplayProps {
  ingredient: Ingredient;
  showDetails?: boolean;
}

export const IngredientDisplay = ({ ingredient, showDetails = false }: IngredientDisplayProps) => {
  // Safe accessor function for nested properties
  const safeGet = (obj: unknown, path: string, defaultValue: unknown = 'N/A') => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : undefined;
    }, obj) ?? defaultValue;
  };

  // Safe formatter for numbers
  const formatNumber = (value: unknown, decimals: number = 2) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value !== 'number') return String(value);
    return value.toFixed(decimals);
  };

  // Get the dominant element to highlight
  const getDominantElement = () => {
    if (!ingredient.elementalProperties) return null;
    
    const elements = Object.entries(ingredient.elementalProperties);
    if (elements.length === 0) return null;
    
    const sorted = [...elements].sort((a, b) => b[1] - a[1]);
    return sorted[0][0]; // Return the name of the dominant element
  };
  
  const dominantElement = getDominantElement();
  
  // Helper function to get icon for element
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Water': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'Earth': return <Mountain className="w-4 h-4 text-green-500" />;
      case 'Air': return <Wind className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className={`ingredient-card p-4 rounded-lg shadow-md transition-all duration-300 bg-gradient-to-br ${
      dominantElement === 'Fire' ? 'from-red-50 to-orange-50 border-l-4 border-red-500' :
      dominantElement === 'Water' ? 'from-blue-50 to-cyan-50 border-l-4 border-blue-500' :
      dominantElement === 'Earth' ? 'from-green-50 to-emerald-50 border-l-4 border-green-500' :
      dominantElement === 'Air' ? 'from-purple-50 to-indigo-50 border-l-4 border-purple-500' :
      'from-gray-50 to-slate-50 border-l-4 border-gray-400'
    } hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{ingredient.name || 'Unknown Ingredient'}</h3>
        {dominantElement && (
          <div className="element-badge flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
            {getElementIcon(dominantElement)}
          </div>
        )}
      </div>
      
      {/* Show description if available with safe property access */}
      {(() => {
        const ingredientData = ingredient as any;
        const description = ingredientData?.description;
        return description ? (
          <p className="text-sm text-gray-600 mt-2 italic">{description}</p>
        ) : null;
      })()}
      
      {/* Show category if available */}
      {ingredient.category && (
        <div className="mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          {ingredient.category}
        </div>
      )}
      
      {showDetails && (
        <div className="mt-4 space-y-4">
          {/* Elemental Properties Section */}
          <div className="bg-white/60 rounded-md p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <Beaker className="w-4 h-4 mr-2 text-indigo-600" />
              <h4 className="text-sm font-medium">Elemental Properties</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => (
                <div key={element} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getElementIcon(element)}
                    <span className="text-xs ml-1">{element}</span>
                  </div>
                  <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full rounded-full ${
                        element === 'Fire' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        element === 'Water' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        element === 'Earth' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        element === 'Air' ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min(100, (value as number * 100) || 0)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Energy Profile Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as any;
            const energyProfile = ingredientData?.energyProfile;
            
            if (!energyProfile) return null;
            
            return (
              <div className="bg-white/60 rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 mr-2 text-amber-500" />
                  <h4 className="text-sm font-medium">Energy Profile</h4>
                </div>
                <div className="text-xs space-y-1">
                  {(() => {
                    const zodiac = energyProfile?.zodiac;
                    return zodiac?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="font-medium">Zodiac:</span>
                        {zodiac.map((sign: string) => (
                          <span key={sign} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{sign}</span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  
                  {(() => {
                    const lunar = energyProfile?.lunar;
                    return lunar?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="font-medium">Lunar:</span>
                        {lunar.map((phase: string) => (
                          <span key={phase} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">{phase}</span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  
                  {(() => {
                    const planetary = energyProfile?.planetary;
                    return planetary?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="font-medium">Planetary:</span>
                        {planetary.map((alignment: string) => (
                          <span key={alignment} className="px-2 py-0.5 bg-violet-100 text-violet-800 rounded-full">{alignment}</span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })()}
          
          {/* Sensory Profile Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as any;
            const sensoryProfile = ingredientData?.sensoryProfile;
            
            if (!sensoryProfile) return null;
            
            return (
              <div className="bg-white/60 rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <Thermometer className="w-4 h-4 mr-2 text-orange-500" />
                  <h4 className="text-sm font-medium">Sensory Profile</h4>
                </div>
                {(() => {
                  const taste = sensoryProfile?.taste;
                  return taste ? (
                    <div>
                      <h5 className="text-xs font-medium mb-1">Taste</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(taste).map(([tasteName, value]) => (
                          <div key={tasteName} className="flex items-center justify-between">
                            <span className="text-xs capitalize">{tasteName}</span>
                            <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="absolute h-full bg-gradient-to-r from-orange-300 to-orange-500 rounded-full"
                                style={{ width: `${Math.min(100, (value as number * 100) || 0)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {(() => {
                  const aroma = sensoryProfile?.aroma;
                  return aroma ? (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium mb-1">Aroma</h5>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(aroma)
                          .filter(([_, value]) => (value as number) > 0.3) // Only show significant aromas
                          .map(([aromaName, _]) => (
                            <span key={aromaName} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">
                              {aromaName}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}
          
          {/* Cooking Methods Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as any;
            const recommendedCookingMethods = ingredientData?.recommendedCookingMethods;
            
            return recommendedCookingMethods?.length > 0 ? (
              <div className="bg-white/60 rounded-md p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <ChefHat className="w-4 h-4 mr-2 text-emerald-600" />
                  <h4 className="text-sm font-medium">Cooking Methods</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recommendedCookingMethods.map((method: string) => (
                    <span key={method} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
          
          {/* Pairing Recommendations with safe property access */}
          {(() => {
            const ingredientData = ingredient as any;
            const pairingRecommendations = ingredientData?.pairingRecommendations;
            
            if (!pairingRecommendations) return null;
            
            return (
              <div className="bg-white/60 rounded-md p-3 shadow-sm">
                <h4 className="text-sm font-medium mb-2">Pairing Recommendations</h4>
                
                {(() => {
                  const complementary = pairingRecommendations?.complementary;
                  return complementary?.length > 0 ? (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-green-600 mb-1">Complementary</h5>
                      <div className="flex flex-wrap gap-1">
                        {complementary.map((item: string) => (
                          <span key={item} className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {(() => {
                  const contrasting = pairingRecommendations?.contrasting;
                  return contrasting?.length > 0 ? (
                    <div className="mb-2">
                      <h5 className="text-xs font-medium text-amber-600 mb-1">Contrasting</h5>
                      <div className="flex flex-wrap gap-1">
                        {contrasting.map((item: string) => (
                          <span key={item} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {(() => {
                  const toAvoid = pairingRecommendations?.toAvoid;
                  return toAvoid?.length > 0 ? (
                    <div>
                      <h5 className="text-xs font-medium text-red-600 mb-1">To Avoid</h5>
                      <div className="flex flex-wrap gap-1">
                        {toAvoid.map((item: string) => (
                          <span key={item} className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}
          
          {/* Nutrition Details with safe property access */}
          {(() => {
            const ingredientData = ingredient as any;
            const nutrition = ingredientData?.nutrition;
            
            return nutrition ? (
              <div className="bg-white/60 rounded-md p-3 shadow-sm">
                <h4 className="text-sm font-medium mb-2">Nutrition (per 100g)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs">
                    <span className="font-medium">Calories:</span> {formatNumber(nutrition.calories, 0)}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Protein:</span> {formatNumber(nutrition.protein)}g
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Carbs:</span> {formatNumber(nutrition.carbs)}g
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Fat:</span> {formatNumber(nutrition.fat)}g
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}; 
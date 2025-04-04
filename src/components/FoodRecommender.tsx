import { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import styles from './FoodRecommender.module.css';

export default function FoodRecommender() {
  // Use the hook to get consistent planetary data and ingredient recommendations
  const { activePlanets, lunarPhase, loading: astroLoading } = useAstrologicalState();
  const { 
    recommendations, 
    chakraEnergies,
    chakraRecommendations,
    loading: recommendationsLoading, 
    error,
    refreshRecommendations,
  } = useChakraInfluencedFood({ limit: 200 }); // Increased from 100 to 200 to ensure all categories have enough items
  
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
  
  // Score breakdowns for the selected ingredient
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [showChakraRecommendations, setShowChakraRecommendations] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  // Group recommendations by category
  const categorizedRecommendations = useMemo(() => {
    const categories: Record<string, any[]> = {
      'proteins': [],
      'vegetables': [],
      'grains': [],
      'other': []
    };
    
    console.log("Total recommendations:", uniqueRecommendations.length);
    
    uniqueRecommendations.forEach(ingredient => {
      const category = ingredient.category?.toLowerCase() || 'other';
      console.log(`Ingredient: ${ingredient.name}, Category: ${category}`);
      
      if (category.includes('protein') || 
          category.includes('meat') || 
          category.includes('poultry') || 
          category.includes('seafood') || 
          category === 'meats') {
        categories['proteins'].push(ingredient);
      } else if (category.includes('vegetable')) {
        categories['vegetables'].push(ingredient);
      } else if (category.includes('grain') || category.includes('rice') || category.includes('wheat')) {
        categories['grains'].push(ingredient);
      } else {
        // Combine herbs, seasonings, spices, oils, fruits and other into a single category
        categories['other'].push(ingredient);
      }
    });
    
    // Log the count of each category
    Object.keys(categories).forEach(key => {
      console.log(`Category '${key}' count: ${categories[key].length}`);
      if (key === 'vegetables') {
        console.log("Vegetable names:", categories[key].map(v => v.name).join(", "));
      }
    });
    
    // Sort each category by score
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => (b.score || 0) - (a.score || 0));
    });
    
    return categories;
  }, [uniqueRecommendations]);

  // Toggle expansion for a category
  const toggleCategoryExpansion = (category: string) => {
    setExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    // Reset selected ingredient when recommendations change
    setSelectedIngredient(null);
    // Reset expanded state
    setExpanded({});
  }, [recommendations]);

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

  // Category display names
  const categoryDisplayNames: Record<string, string> = {
    'proteins': 'Proteins',
    'vegetables': 'Vegetables',
    'grains': 'Grains',
    'other': 'Herbs, Spices & Other'
  };

  return (
    <div className={styles.container} style={{ width: '100%', maxWidth: '100%' }}>
      <div className={styles.header}>
        <h2>Celestial Ingredient Recommendations</h2>

        {/* Display top controls */}
        <div className="mt-2 flex justify-between items-center">
          <button
            onClick={() => setShowChakraRecommendations(!showChakraRecommendations)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {showChakraRecommendations ? 'Hide Chakra Insights' : 'Show Chakra Insights'}
          </button>
          
          <button 
            onClick={refreshRecommendations} 
            className={styles.refreshButton}
          >
            Refresh Recommendations
          </button>
        </div>
        
        {/* Compact chakra energy display */}
        {showChakraRecommendations && (
          <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Chakra Energy Influences</h3>
            <div className="flex items-center space-x-2 mb-3">
              {Object.entries(chakraEnergies).map(([chakra, energy]) => {
                // Get chakra color
                const colorClass = 
                  chakra === 'root' ? 'bg-red-500' :
                  chakra === 'sacral' ? 'bg-orange-400' :
                  chakra === 'solarPlexus' ? 'bg-yellow-300' :
                  chakra === 'heart' ? 'bg-green-400' :
                  chakra === 'throat' ? 'bg-blue-400' :
                  chakra === 'brow' ? 'bg-indigo-500' :
                  chakra === 'crown' ? 'bg-purple-400' : 'bg-gray-400';
                
                return (
                  <div 
                    key={chakra}
                    className="flex flex-col items-center"
                    title={`${chakra}: ${energy.toFixed(1)}`}
                  >
                    <div className="text-xs text-gray-600">{energy.toFixed(1)}</div>
                    <div 
                      className={`${colorClass} w-4 h-4 rounded-full`}
                      style={{ opacity: Math.max(0.3, energy / 10) }}
                    />
                    <div className="text-xs mt-1">{chakra.slice(0, 1)}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Show chakra-specific ingredient recommendations */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(chakraRecommendations).map(([chakra, ingredients]) => {
                if (ingredients.length === 0) return null;
                
                const chakraColorText = 
                  chakra === 'root' ? 'text-red-500' :
                  chakra === 'sacral' ? 'text-orange-400' :
                  chakra === 'solarPlexus' ? 'text-yellow-300' :
                  chakra === 'heart' ? 'text-green-400' :
                  chakra === 'throat' ? 'text-blue-400' :
                  chakra === 'brow' ? 'text-indigo-500' :
                  chakra === 'crown' ? 'text-purple-400' : 'text-gray-400';
                
                return (
                  <div key={chakra} className="text-xs">
                    <div className={`font-medium ${chakraColorText}`}>{chakra} Chakra</div>
                    <ul className="pl-2">
                      {ingredients.slice(0, 2).map((ingredient, idx) => (
                        <li key={idx}>{ingredient.name}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Selected ingredient details */}
      {selectedIngredient && (
        <div className={`${styles.detailSection} mb-6 transition-all duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-purple-900">
              {selectedIngredient.name}
            </h3>
            <button 
              onClick={() => setSelectedIngredient(null)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            {/* Match Percentage */}
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-800 mb-2">Celestial Match: {Math.round((selectedIngredient.score || 0) * 100)}%</h5>
              {selectedIngredient.scoreDetails && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(selectedIngredient.scoreDetails).map(([factor, score]) => (
                    <div key={factor} className="text-xs">
                      <span className="block text-gray-600">{factor}:</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-purple-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.round((score as number) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ingredient Description */}
              {selectedIngredient.description && (
                <div className="col-span-2">
                  <p className="text-gray-700">{selectedIngredient.description}</p>
                </div>
              )}
              
              {/* Basic Properties */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-2">Basic Properties</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedIngredient.category && (
                    <li><span className="font-medium">Category:</span> {selectedIngredient.category}</li>
                  )}
                  {selectedIngredient.subCategory && (
                    <li><span className="font-medium">Sub-Category:</span> {selectedIngredient.subCategory}</li>
                  )}
                  {selectedIngredient.origin && (
                    <li>
                      <span className="font-medium">Origin:</span> {
                        Array.isArray(selectedIngredient.origin) 
                          ? selectedIngredient.origin.join(', ') 
                          : selectedIngredient.origin
                      }
                    </li>
                  )}
                  {selectedIngredient.modality && (
                    <li><span className="font-medium">Modality:</span> {selectedIngredient.modality}</li>
                  )}
                  {selectedIngredient.season && (
                    <li>
                      <span className="font-medium">Seasonal:</span> {
                        Array.isArray(selectedIngredient.season) 
                          ? selectedIngredient.season.join(', ') 
                          : selectedIngredient.season
                      }
                    </li>
                  )}
                  {selectedIngredient.qualities && selectedIngredient.qualities.length > 0 && (
                    <li>
                      <span className="font-medium">Qualities:</span> {
                        Array.isArray(selectedIngredient.qualities) 
                          ? selectedIngredient.qualities.join(', ') 
                          : selectedIngredient.qualities
                      }
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Astrological Profile */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <h5 className="font-medium text-indigo-900 mb-2">Astrological Profile</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedIngredient.astrologicalProfile?.rulingPlanets && (
                    <li>
                      <span className="font-medium">Ruling Planets:</span> {
                        selectedIngredient.astrologicalProfile.rulingPlanets.join(', ')
                      }
                    </li>
                  )}
                  {selectedIngredient.astrologicalProfile?.favorableZodiac && (
                    <li>
                      <span className="font-medium">Favorable Zodiac:</span> {
                        selectedIngredient.astrologicalProfile.favorableZodiac.map(
                          z => z.charAt(0).toUpperCase() + z.slice(1)
                        ).join(', ')
                      }
                    </li>
                  )}
                  {selectedIngredient.elementalProperties && (
                    <li>
                      <span className="font-medium">Elemental Properties:</span>
                      <ul className="list-none pl-0 mt-1">
                        {Object.entries(selectedIngredient.elementalProperties).map(([element, value]) => 
                          value > 0.1 && (
                            <li key={element} className="pl-2 text-sm">
                              {element}: {Math.round((value as number) * 100)}%
                            </li>
                          )
                        )}
                      </ul>
                    </li>
                  )}
                </ul>
              </div>
              
              {/* Nutritional Information if available */}
              {selectedIngredient.nutritionalProfile && (
                <div className="col-span-2 mt-2">
                  <h5 className="font-medium text-gray-900 mb-2">Nutritional Information</h5>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedIngredient.nutritionalProfile.calories && (
                        <div className="p-2 bg-white rounded shadow-sm">
                          <span className="font-medium block text-blue-700">Calories:</span> 
                          <span className="text-lg">{selectedIngredient.nutritionalProfile.calories}</span>
                        </div>
                      )}
                      {selectedIngredient.nutritionalProfile.macros && (
                        <>
                          {Object.entries(selectedIngredient.nutritionalProfile.macros).map(([macro, value]) => (
                            <div key={macro} className="p-2 bg-white rounded shadow-sm">
                              <span className="font-medium block text-blue-700">{macro.charAt(0).toUpperCase() + macro.slice(1)}:</span> 
                              <span className="text-lg">{value}g</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* Display vitamins and minerals if available */}
                    {(selectedIngredient.nutritionalProfile.vitamins || selectedIngredient.nutritionalProfile.minerals) && (
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        {selectedIngredient.nutritionalProfile.vitamins && Object.keys(selectedIngredient.nutritionalProfile.vitamins).length > 0 && (
                          <div>
                            <h6 className="font-medium text-blue-700 mb-1">Vitamins</h6>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(selectedIngredient.nutritionalProfile.vitamins).map(([vitamin, value]) => (
                                <div key={vitamin} className="text-sm">
                                  <span className="font-medium">{vitamin}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedIngredient.nutritionalProfile.minerals && Object.keys(selectedIngredient.nutritionalProfile.minerals).length > 0 && (
                          <div>
                            <h6 className="font-medium text-blue-700 mb-1">Minerals</h6>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(selectedIngredient.nutritionalProfile.minerals).map(([mineral, value]) => (
                                <div key={mineral} className="text-sm">
                                  <span className="font-medium">{mineral}:</span> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Load Spoonacular Data button if no nutritional data */}
              {!selectedIngredient.nutritionalProfile && (
                <div className="col-span-2 mt-2">
                  <button 
                    onClick={() => {
                      // This would trigger loading Spoonacular data
                      console.log(`Loading Spoonacular data for ${selectedIngredient.name}`);
                      // You'd implement a function to fetch this data
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                  >
                    Load Additional Nutritional Data
                  </button>
                </div>
              )}

              {/* Pairing Recommendations */}
              {selectedIngredient.pairingRecommendations && (
                <div className="col-span-2 mt-2">
                  <h5 className="font-medium text-gray-900 mb-2">Suggested Pairings</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedIngredient.pairingRecommendations.complementary && (
                      <div className="p-2 bg-green-50 rounded">
                        <h6 className="font-medium text-green-700 mb-1">Complementary</h6>
                        <div className="text-base">{selectedIngredient.pairingRecommendations.complementary.join(', ')}</div>
                      </div>
                    )}
                    {selectedIngredient.pairingRecommendations.contrasting && (
                      <div className="p-2 bg-blue-50 rounded">
                        <h6 className="font-medium text-blue-700 mb-1">Contrasting</h6>
                        <div className="text-base">{selectedIngredient.pairingRecommendations.contrasting.join(', ')}</div>
                      </div>
                    )}
                    {selectedIngredient.pairingRecommendations.toAvoid && (
                      <div className="p-2 bg-red-50 rounded">
                        <h6 className="font-medium text-red-700 mb-1">Avoid</h6>
                        <div className="text-base">{selectedIngredient.pairingRecommendations.toAvoid.join(', ')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Preparation Methods */}
              {selectedIngredient.preparation && (
                <div className="col-span-2 mt-2">
                  <h5 className="font-medium text-gray-900 mb-2">Preparation & Usage</h5>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    {selectedIngredient.cookingMethods && (
                      <div className="mb-2">
                        <h6 className="font-medium text-yellow-800 mb-1">Cooking Methods</h6>
                        <div className="text-base">
                          {Array.isArray(selectedIngredient.cookingMethods) 
                            ? selectedIngredient.cookingMethods.join(', ') 
                            : typeof selectedIngredient.cookingMethods === 'object'
                              ? Object.keys(selectedIngredient.cookingMethods).join(', ')
                              : String(selectedIngredient.cookingMethods)}
                        </div>
                      </div>
                    )}
                    {selectedIngredient.preparation && (
                      <div className="mb-2">
                        <h6 className="font-medium text-yellow-800 mb-1">Recommended Methods</h6>
                        <div className="text-base">
                          {/* Handle all possible data formats for preparation methods */}
                          {selectedIngredient.preparation.methods ? (
                            Array.isArray(selectedIngredient.preparation.methods) 
                              ? selectedIngredient.preparation.methods.join(', ') 
                              : typeof selectedIngredient.preparation.methods === 'object'
                                ? Object.keys(selectedIngredient.preparation.methods).join(', ')
                                : String(selectedIngredient.preparation.methods)
                          ) : (
                            typeof selectedIngredient.preparation === 'object'
                              ? Object.keys(selectedIngredient.preparation)
                                .filter(key => key !== 'methods') // Exclude methods as we handle it separately
                                .map(key => (
                                  <div key={key} className="mb-1">
                                    <strong>{key}: </strong>
                                    {typeof selectedIngredient.preparation[key] === 'object'
                                      ? Object.keys(selectedIngredient.preparation[key]).join(', ')
                                      : String(selectedIngredient.preparation[key])
                                    }
                                  </div>
                                ))
                              : String(selectedIngredient.preparation)
                          )}
                        </div>
                      </div>
                    )}
                    {selectedIngredient.affinities && (
                      <div>
                        <h6 className="font-medium text-yellow-800 mb-1">Flavor Affinities</h6>
                        <div className="text-base">{Array.isArray(selectedIngredient.affinities) 
                          ? selectedIngredient.affinities.join(', ') 
                          : typeof selectedIngredient.affinities === 'object'
                            ? Object.keys(selectedIngredient.affinities).join(', ')
                            : String(selectedIngredient.affinities)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Additional Properties if available */}
              {selectedIngredient.varieties && Object.keys(selectedIngredient.varieties).length > 0 && (
                <div className="col-span-2 mt-2">
                  <h5 className="font-medium text-gray-900 mb-2">Varieties</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedIngredient.varieties).map(([variety, info]) => (
                      <div key={variety} className="p-3 bg-gray-50 rounded">
                        <h6 className="font-medium mb-1">{variety}</h6>
                        <ul className="text-sm">
                          {Object.entries(info as Record<string, any>).map(([key, value]) => (
                            <li key={key} className="mb-1">
                              <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>{' '}
                              {typeof value === 'object' 
                                ? (Array.isArray(value) 
                                    ? value.join(', ') 
                                    : Object.keys(value).join(', '))
                                : String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sensory Profile if available */}
              {selectedIngredient.sensoryProfile && (
                <div className="col-span-2 mt-2">
                  <h5 className="font-medium text-gray-900 mb-2">Sensory Profile</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedIngredient.sensoryProfile.taste && (
                      <div className="bg-indigo-50 p-3 rounded">
                        <h6 className="font-medium text-indigo-800 mb-1">Taste</h6>
                        {Object.entries(selectedIngredient.sensoryProfile.taste).map(([taste, value]) => (
                          <div key={taste} className="flex items-center justify-between mb-1">
                            <span className="text-sm">{taste}</span>
                            <div className="w-1/2 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-2" 
                                style={{ width: `${Math.round((value as number) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedIngredient.sensoryProfile.aroma && (
                      <div className="bg-green-50 p-3 rounded">
                        <h6 className="font-medium text-green-800 mb-1">Aroma</h6>
                        {Object.entries(selectedIngredient.sensoryProfile.aroma).map(([aroma, value]) => (
                          <div key={aroma} className="flex items-center justify-between mb-1">
                            <span className="text-sm">{aroma}</span>
                            <div className="w-1/2 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-green-500 h-2" 
                                style={{ width: `${Math.round((value as number) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedIngredient.sensoryProfile.texture && (
                      <div className="bg-amber-50 p-3 rounded">
                        <h6 className="font-medium text-amber-800 mb-1">Texture</h6>
                        {Object.entries(selectedIngredient.sensoryProfile.texture).map(([texture, value]) => (
                          <div key={texture} className="flex items-center justify-between mb-1">
                            <span className="text-sm">{texture}</span>
                            <div className="w-1/2 bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-500 h-2" 
                                style={{ width: `${Math.round((value as number) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Display ingredients by category */}
      <div className="w-full" style={{ width: '100%' }}>
        {Object.entries(categorizedRecommendations).map(([category, ingredients]) => {
          if (ingredients.length === 0) return null;
          
          const displayName = categoryDisplayNames[category] || category;
          const isExpanded = expanded[category] || false;
          const displayIngredients = isExpanded ? ingredients : ingredients.slice(0, 5);
          
          return (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader} onClick={() => toggleCategoryExpansion(category)}>
                <h3>{displayName} ({ingredients.length})</h3>
                <span>{isExpanded ? '▲' : '▼'}</span>
              </div>
              
              <div className={`${styles.ingredientsGrid} ${styles.fullWidth}`}>
                {displayIngredients.map((ingredient, index) => (
                  <div 
                    key={`${ingredient.name}-${index}`} 
                    className={`${styles.ingredientCard} ${selectedIngredient?.name === ingredient.name ? styles.selected : ''}`}
                    onClick={() => setSelectedIngredient(ingredient)}
                  >
                    <h3 className={styles.ingredientName}>{ingredient.name}</h3>
                    <div className={styles.ingredientInfo}>
                      {ingredient.subCategory && (
                        <span className={styles.subCategory}>{ingredient.subCategory}</span>
                      )}
                      {ingredient.season && Array.isArray(ingredient.season) && (
                        <span className={styles.seasonTag}>
                          In season: {ingredient.season.includes(currentSeason) ? 'Yes' : 'No'}
                        </span>
                      )}
                    </div>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{ width: `${Math.round((ingredient.score || 0) * 100)}%` }}
                      />
                      <span className={styles.scoreValue}>{Math.round((ingredient.score || 0) * 100)}% match</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {ingredients.length > 5 && (
                <div className="flex justify-center mt-2 mb-4">
                  <button 
                    onClick={() => toggleCategoryExpansion(category)}
                    className={styles.expandButton}
                  >
                    {isExpanded ? `Show Less (5)` : `Show More (${ingredients.length})`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Moved lunar information to the bottom */}
      <div className={`${styles.celestialInfo} ${styles.bottomInfo} mt-6`}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Current Zodiac:</span>
          <span className={styles.infoValue}>{currentZodiac || 'Unknown'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Lunar Phase:</span>
          <span className={styles.infoValue}>{lunarPhase || 'Unknown'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Season:</span>
          <span className={styles.infoValue}>{currentSeason}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Active Planets:</span>
          <span className={styles.infoValue}>{activePlanets?.join(', ') || 'None'}</span>
        </div>
      </div>
    </div>
  );
}
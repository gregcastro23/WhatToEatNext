'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAstrologicalState } from '@/context/AstrologicalContext';
import { useChakraInfluencedFood } from '@/hooks/useChakraInfluencedFood';
import styles from './FoodRecommender.module.css';
import { ChakraEnergies } from '@/types/alchemy';
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
import { Planet as AlchemyPlanet } from '@/types/alchemy';

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
const FOOD_CATEGORIES = ['Vegetables', 'Fruits', 'Proteins', 'Grains', 'Spices', 'Other'];

export default function FoodRecommender() {
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
  } = useChakraInfluencedFood({ limit: 200 }); // Increased from 100 to 200 to ensure all categories have enough items
  
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
  
  // Score breakdowns for the selected ingredient
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
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
  
  // Boost ingredients that align with the current planetary hour
  const boostedRecommendations = useMemo(() => {
    if (!currentPlanetaryHour || planetaryHourChakras.length === 0) {
      return uniqueRecommendations;
    }
    
    return uniqueRecommendations.map(ingredient => {
      // Check if this ingredient is associated with the current planetary hour's chakras
      const chakraKey = normalizeChakraKey(ingredient.chakra);
      const boostFactor = planetaryHourChakras.includes(chakraKey) ? 1.2 : 1.0;
      
      return {
        ...ingredient,
        score: ingredient.score * boostFactor,
        boostedByPlanetaryHour: boostFactor > 1.0
      };
    }).sort((a, b) => b.score - a.score);
  }, [uniqueRecommendations, currentPlanetaryHour, planetaryHourChakras]);

  // Group recommendations by category
  const categorizedRecommendations = useMemo(() => {
    const categories: Record<string, any[]> = {
      'proteins': [],
      'vegetables': [],
      'grains': [],
      'fruits': [],
      'herbs': [],
      'spices': [], // Separate spices from herbs
      'other': []
    };
    
    console.log("Total recommendations:", boostedRecommendations.length);
    
    // Define actual grain names based on our data files
    const trueGrainNames = [
      // Whole grains
      'rice', 'brown rice', 'white rice', 'wild rice', 'black rice', 'red rice',
      'wheat', 'wheat berries', 'bulgur', 'cracked wheat', 'wheat bran',
      'barley', 'pearl barley', 'hulled barley',
      'oats', 'rolled oats', 'steel-cut oats', 'oat groats',
      'corn', 'cornmeal', 'polenta', 'grits', 'popcorn',
      'rye', 'rye berries', 'rye flour',
      'millet', 'teff', 'sorghum', 'triticale', 'farro', 'kamut', 'spelt',
      // Refined grains
      'white flour', 'bread flour', 'all-purpose flour', 'semolina', 'couscous',
      // Pseudograins
      'quinoa', 'amaranth', 'buckwheat', 'chia', 'flaxseed'
    ];
    
    // Define specific spice items
    const spiceItems = [
      'peppercorn', 'pepper', 'cinnamon', 'nutmeg', 'cardamom', 'clove', 'cumin',
      'coriander', 'turmeric', 'paprika', 'cayenne', 'saffron', 'vanilla',
      'allspice', 'anise', 'caraway', 'fennel', 'mustard seed', 'ginger powder'
    ];
    
    // Debug: Count and categorization tracking
    let grainCandidates = 0;
    let actualGrains = 0;
    
    boostedRecommendations.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const category = ingredient.category?.toLowerCase() || 'other';
      const subCategory = ingredient.subCategory?.toLowerCase() || '';
      
      // Check for specific spices first
      if (spiceItems.some(spice => name.includes(spice)) || 
          name === 'peppercorn' ||  // Explicit check for peppercorn
          category.includes('spice') ||
          subCategory.includes('spice')) {
        categories['spices'].push(ingredient);
      }
      // Check for proteins
      else if (category.includes('protein') || 
          category.includes('meat') || 
          category.includes('poultry') || 
          category.includes('seafood') || 
          category === 'meats') {
        categories['proteins'].push(ingredient);
      } 
      // Check for vegetables
      else if (category.includes('vegetable')) {
        categories['vegetables'].push(ingredient);
      } 
      // Check for grains - using more inclusive categorization
      else if (
          // Track grain candidates
          (grainCandidates++,
          // Explicit grain categories
          category === 'whole_grain' ||
          category === 'refined_grain' ||
          category.includes('grain') ||
          subCategory.includes('grain') ||
          // Grain file names
          name.includes('rice') || 
          name.includes('wheat') ||
          name.includes('barley') ||
          name.includes('oat') ||
          name.includes('corn') ||
          name.includes('quinoa') ||
          name.includes('farro') ||
          name.includes('millet') ||
          // Check against specific grain names
          trueGrainNames.some(grain => name.includes(grain)) ||
          // Common bread and flour items
          name === 'bread' || 
          name.includes(' bread') || 
          name.includes('pasta') ||
          name.includes('noodle') ||
          name.includes('flour')
        )
        ) {
        // Exclude specific non-grain products
        if (!(
          name.includes('vinegar') || 
          name.includes('wine') || 
          name.includes('sake') ||
          name.includes('peppercorn') ||
          spiceItems.some(spice => name === spice) // Check for exact spice matches
        )) {
          actualGrains++;
          categories['grains'].push(ingredient);
        } else {
          if (name.includes('peppercorn')) {
            categories['spices'].push(ingredient);
          } else {
            categories['other'].push(ingredient);
          }
        }
      } 
      // Check for fruits
      else if (category.includes('fruit') || 
               subCategory.includes('fruit')) {
        categories['fruits'].push(ingredient);
      } 
      // Check for herbs
      else if (category.includes('herb') || 
               subCategory.includes('herb')) {
        categories['herbs'].push(ingredient);
      }
      // Other seasonings go to spices
      else if (category.includes('seasoning')) {
        categories['spices'].push(ingredient);
      }
      // All other items
      else {
        categories['other'].push(ingredient);
      }
    });
    
    // Log the count of each category
    Object.keys(categories).forEach(key => {
      console.log(`Category '${key}' count: ${categories[key].length}`);
      if (key === 'grains') {
        console.log(`Grain candidates: ${grainCandidates}, Actual grains: ${actualGrains}`);
        console.log("Grains names:", categories[key].map(v => v.name).join(", "));
      }
      if (key === 'spices') {
        console.log("Spices names:", categories[key].map(v => v.name).join(", "));
      }
    });
    
    // Sort each category by score
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => (b.score || 0) - (a.score || 0));
    });
    
    return categories;
  }, [boostedRecommendations]);

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

  // Category display names
  const categoryDisplayNames: Record<string, string> = {
    'proteins': 'Proteins',
    'vegetables': 'Vegetables',
    'grains': 'Grains',
    'fruits': 'Fruits', 
    'herbs': 'Herbs',
    'spices': 'Spices & Seasonings',
    'other': 'Other Ingredients'
  };

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
    <div className={styles.container} style={{ width: '100%', maxWidth: '100%' }}>
      <div className={styles.header}>
        <h2>Celestial Ingredient Recommendations</h2>

        {/* Display top controls */}
        <div className="mt-2 flex justify-end items-center">
          <button 
            onClick={refreshRecommendations} 
            className={styles.refreshButton}
          >
            Refresh Recommendations
          </button>
        </div>
      </div>
      
      {/* Selected ingredient details */}
      {selectedIngredient && (
        <div className={styles.selectedIngredient}>
          <div className={styles.selectedDetails}>
            <h3>{selectedIngredient.name}</h3>
            <div className={styles.detailGrid}>
              <div>
                <p className={styles.detailLabel}>Match Score</p>
                <p className={styles.detailValue}>{selectedIngredient.score?.toFixed(1) || 'N/A'}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Category</p>
                <p className={styles.detailValue}>
                  {selectedIngredient.category}
                  {selectedIngredient.subCategory ? ` (${selectedIngredient.subCategory})` : ''}
                </p>
              </div>
              {selectedIngredient.astrologicalProfile && (
                <>
                  <div>
                    <p className={styles.detailLabel}>Element</p>
                    <p className={styles.detailValue}>
                      {typeof selectedIngredient.astrologicalProfile.elementalAffinity === 'object' 
                        ? selectedIngredient.astrologicalProfile.elementalAffinity.base
                        : selectedIngredient.astrologicalProfile.elementalAffinity || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={styles.detailLabel}>Planets</p>
                    <p className={styles.detailValue}>
                      {Array.isArray(selectedIngredient.astrologicalProfile.rulingPlanets) 
                        ? selectedIngredient.astrologicalProfile.rulingPlanets.join(', ')
                        : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {selectedIngredient.qualities && selectedIngredient.qualities.length > 0 && (
              <div className={styles.detailSection}>
                <h4>Qualities</h4>
                <p>{selectedIngredient.qualities.join(', ')}</p>
              </div>
            )}

            {selectedIngredient.origin && selectedIngredient.origin.length > 0 && (
              <div className={styles.detailSection}>
                <h4>Origin</h4>
                <p>{selectedIngredient.origin.join(', ')}</p>
              </div>
            )}

            {selectedIngredient.varieties && Object.keys(selectedIngredient.varieties).length > 0 && (
              <div className={styles.detailSection}>
                <h4>Varieties</h4>
                <div className={styles.varietiesList}>
                  {Object.entries(selectedIngredient.varieties).map(([key, varietyData]) => {
                    const variety = varietyData as { 
                      name?: string; 
                      appearance?: string; 
                      flavor?: string; 
                      texture?: string; 
                      notes?: string; 
                    };
                    return (
                      <div key={key} className={styles.varietyItem}>
                        <h5>{variety.name || key}</h5>
                        <ul className={styles.varietyDetails}>
                          {variety.appearance && <li><strong>Appearance:</strong> {variety.appearance}</li>}
                          {variety.flavor && <li><strong>Flavor:</strong> {variety.flavor}</li>}
                          {variety.texture && <li><strong>Texture:</strong> {variety.texture}</li>}
                          {variety.notes && <li><strong>Notes:</strong> {variety.notes}</li>}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedIngredient.culinaryApplications && Object.keys(selectedIngredient.culinaryApplications).length > 0 && (
              <div className={styles.detailSection}>
                <h4>Culinary Applications</h4>
                <div className={styles.culinaryList}>
                  {Object.entries(selectedIngredient.culinaryApplications).map(([key, appData]) => {
                    const application = appData as {
                      name?: string;
                      method?: string;
                      timing?: string | Record<string, string>;
                      accompaniments?: string[];
                      toppings?: string[];
                    };
                    return (
                      <div key={key} className={styles.applicationItem}>
                        <h5>{application.name || key}</h5>
                        <ul className={styles.applicationDetails}>
                          {application.method && <li><strong>Method:</strong> {application.method}</li>}
                          {application.timing && (
                            <li>
                              <strong>Timing:</strong> {
                                typeof application.timing === 'object' 
                                  ? Object.entries(application.timing).map(([k, v]) => `${k}: ${v}`).join(', ')
                                  : application.timing
                              }
                            </li>
                          )}
                          {application.accompaniments && (
                            <li><strong>Accompaniments:</strong> {application.accompaniments.join(', ')}</li>
                          )}
                          {application.toppings && (
                            <li><strong>Toppings:</strong> {application.toppings.join(', ')}</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {selectedIngredient.nutritionalProfile && (
              <div className={styles.detailSection}>
                <h4>Nutritional Information</h4>
                <div className={styles.nutritionalInfo}>
                  <div className={styles.macroNutrients}>
                    <p><strong>Calories:</strong> {selectedIngredient.nutritionalProfile.calories}</p>
                    <p><strong>Protein:</strong> {selectedIngredient.nutritionalProfile.protein}g</p>
                    <p><strong>Fat:</strong> {selectedIngredient.nutritionalProfile.fat}g</p>
                    <p><strong>Carbohydrates:</strong> {selectedIngredient.nutritionalProfile.carbohydrates}g</p>
                  </div>
                  {selectedIngredient.nutritionalProfile.minerals && (
                    <div className={styles.minerals}>
                      <h5>Minerals & Vitamins</h5>
                      <ul>
                        {Object.entries(selectedIngredient.nutritionalProfile.minerals).map(([mineral, value]) => (
                          <li key={mineral}><strong>{mineral.replace('_', ' ')}:</strong> {String(value)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedIngredient.healthBenefits && selectedIngredient.healthBenefits.length > 0 && (
              <div className={styles.detailSection}>
                <h4>Health Benefits</h4>
                <ul className={styles.benefitsList}>
                  {selectedIngredient.healthBenefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedIngredient.seasonality && (
              <div className={styles.detailSection}>
                <h4>Seasonality</h4>
                <div className={styles.seasonalityInfo}>
                  <p><strong>Peak Season:</strong> {selectedIngredient.seasonality.peak.join(', ')}</p>
                  <p>{selectedIngredient.seasonality.notes}</p>
                </div>
              </div>
            )}

            {selectedIngredient.safetyNotes && (
              <div className={styles.detailSection}>
                <h4>Safety & Handling</h4>
                <ul className={styles.safetyList}>
                  <li><strong>Handling:</strong> {selectedIngredient.safetyNotes.handling}</li>
                  <li><strong>Storage:</strong> {selectedIngredient.safetyNotes.storage}</li>
                  <li><strong>Consumption:</strong> {selectedIngredient.safetyNotes.consumption}</li>
                  <li><strong>Quality Check:</strong> {selectedIngredient.safetyNotes.quality}</li>
                </ul>
              </div>
            )}

            <button 
              onClick={() => setSelectedIngredient(null)}
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Display recommendations by category in a grid layout */}
      <div className={styles.categoriesContainer}>
        {Object.keys(categorizedRecommendations).map(category => (
          categorizedRecommendations[category].length > 0 && (
            <div key={category} className={styles.category}>
              <h3 
                className={styles.categoryHeader}
                onClick={() => toggleCategoryExpansion(category)}
              >
                <span>{categoryDisplayNames[category] || category}</span>
                <span className={styles.itemCount}>{categorizedRecommendations[category].length} items</span>
              </h3>
              
              <div className={`${styles.itemsGrid} ${expanded[category] ? styles.expanded : ''}`}>
                {(expanded[category] 
                  ? categorizedRecommendations[category] 
                  : categorizedRecommendations[category].slice(0, 6)
                ).map((ingredient, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.ingredientCard} ${selectedIngredient?.name === ingredient.name ? styles.selected : ''}`}
                    onClick={() => setSelectedIngredient(ingredient)}
                  >
                    <h4 className={styles.ingredientName}>{ingredient.name}</h4>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreBarFill} 
                        style={{ width: `${Math.min(100, (ingredient.score || 0) * 100)}%` }}
                      ></div>
                      <span className={styles.scoreValue}>
                        {typeof ingredient.score === 'number' ? ingredient.score.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    {ingredient.astrologicalProfile?.elementalAffinity && (
                      <div className={styles.elementTag}>
                        {typeof ingredient.astrologicalProfile.elementalAffinity === 'object' 
                          ? ingredient.astrologicalProfile.elementalAffinity.base
                          : ingredient.astrologicalProfile.elementalAffinity}
                      </div>
                    )}
                  </div>
                ))}
                
                {!expanded[category] && categorizedRecommendations[category].length > 6 && (
                  <div 
                    className={styles.viewMoreCard}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategoryExpansion(category);
                    }}
                  >
                    <div className={styles.viewMoreContent}>
                      <span>+{categorizedRecommendations[category].length - 6} more</span>
                      <span>Click to view all</span>
                    </div>
                  </div>
                )}
              </div>
              
              {expanded[category] && categorizedRecommendations[category].length > 6 && (
                <button 
                  className={styles.showLessButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryExpansion(category);
                  }}
                >
                  Show less
                </button>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
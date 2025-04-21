import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain, Search, ArrowUp, ArrowDown, Zap, Sparkles, Minus, Info, List, ThumbsUp, Clock } from 'lucide-react'; // Added Zap, Sparkles, and Minus icons
import { useIngredientMapping } from '../hooks'; // Import our new hook
import styles from './CookingMethods.module.css';
import { getTechnicalTips, getIdealIngredients } from '../utils/cookingMethodTips';
import { cookingMethods, getDetailedCookingMethod } from '../data/cooking/cookingMethods';

// Define proper types for the methods
interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  suitable_for?: string[];
  benefits?: string[];
  alchemicalProperties?: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  astrologicalInfluences?: {
    dominantPlanets?: string[];
    favorableZodiac?: string[];
    lunarPhaseEffect?: Record<string, number>;
  };
}

interface CookingMethodsProps {
  methods: CookingMethod[];
  onSelectMethod?: (method: CookingMethod) => void;
  selectedMethodId?: string | null;
  showToggle?: boolean;
  initiallyExpanded?: boolean;
}

export const CookingMethodsSection: React.FC<CookingMethodsProps> = ({
  methods,
  onSelectMethod,
  selectedMethodId,
  showToggle = true,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllMethods, setShowAllMethods] = useState(false);
  const [showDetailedInfo, setShowDetailedInfo] = useState<string | null>(null);
  
  // Get top method based on score
  const topMethod = useMemo(() => {
    if (!methods.length) return null;
    return [...methods].sort((a, b) => {
      const scoreA = a.score !== undefined ? a.score : 0;
      const scoreB = b.score !== undefined ? b.score : 0;
      return scoreB - scoreA;
    })[0];
  }, [methods]);
  
  // Sort methods by score and limit display unless showAll is true
  const displayMethods = useMemo(() => {
    const sortedMethods = [...methods].sort((a, b) => {
      const scoreA = a.score !== undefined ? a.score : 0;
      const scoreB = b.score !== undefined ? b.score : 0;
      return scoreB - scoreA;
    });
    
    return showAllMethods ? sortedMethods : sortedMethods.slice(0, 8);
  }, [methods, showAllMethods]);
  
  // Use our new ingredient mapping hook
  const { suggestAlternatives, calculateCompatibility, isLoading: ingredientMappingLoading, error: ingredientMappingError } = useIngredientMapping();
  
  // Auto-expand the section if we have methods and a pre-selected method
  useEffect(() => {
    if (methods.length > 0) {
      // Always keep expanded if ≤5 methods
      if (methods.length <= 5) {
        setIsExpanded(true);
      }
      
      // Also expand if there's a selected method
      if (selectedMethodId) {
        setIsExpanded(true);
        
        // Find the selected method
        const selectedMethod = methods.find(m => m.id === selectedMethodId);
        
        if (selectedMethod) {
          // If the selected method has variations, expand it
          if (selectedMethod.variations?.length) {
            setExpandedMethods(prev => ({
              ...prev,
              [selectedMethodId]: true
            }));
          }
          
          // If this is a variation, find and expand its parent method
          const parentMethod = methods.find(m => 
            m.variations?.some(v => v.id === selectedMethodId)
          );
          
          if (parentMethod) {
            setExpandedMethods(prev => ({
              ...prev,
              [parentMethod.id]: true
            }));
          }
        }
      }
    }
  }, [methods, selectedMethodId]);
  
  // Handle ingredient compatibility calculation
  const calculateIngredientCompatibility = () => {
    if (!searchIngredient.trim()) return;
    
    // Calculate compatibility with each cooking method based on elemental properties
    const compatibilityResults: Record<string, number> = {};
    
    methods.forEach(method => {
      if (method.elementalEffect) {
        // First try to find the ingredient by name
        try {
          // Calculate compatibility between ingredient name and cooking method name
          const result = calculateCompatibility(searchIngredient, method.name);
          
          if (result.success) {
            compatibilityResults[method.id] = result.compatibility;
          }
          
          // Also calculate for variations if they exist
          if (method.variations) {
            method.variations.forEach(variation => {
              try {
                const variationResult = calculateCompatibility(searchIngredient, variation.name);
                
                if (variationResult.success) {
                  compatibilityResults[variation.id] = variationResult.compatibility;
                }
              } catch (err) {
                console.error(`Error calculating compatibility for variation ${variation.name}:`, err);
              }
            });
          }
        } catch (err) {
          console.error(`Error calculating compatibility for method ${method.name}:`, err);
        }
      }
    });
    
    setIngredientCompatibility(compatibilityResults);
  };
  
  const toggleExpanded = () => {
    // Only allow toggling if there are more than 5 methods
    if (methods.length > 5) {
      setIsExpanded(prev => !prev);
    }
  };
  
  const toggleMethodExpanded = (methodId: string, e: React.MouseEvent) => {
    // Prevent the click from selecting the method
    e.stopPropagation();
    setExpandedMethods(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };
  
  // Toggle ingredient search section
  const toggleIngredientSearch = () => {
    setShowIngredientSearch(prev => !prev);
    // Clear results when hiding
    if (showIngredientSearch) {
      setIngredientCompatibility({});
      setSearchIngredient('');
    }
  };

  // Toggle detailed information for a method
  const toggleDetailedInfo = (methodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailedInfo(prev => prev === methodId ? null : methodId);
  };
  
  // Get additional details for a cooking method from the expanded data
  const getAdditionalMethodDetails = (methodName: string) => {
    const methodKey = methodName.toLowerCase().replace(/\s+/g, '');
    const simplifiedMethod = Object.entries(cookingMethods).find(
      ([key, method]) => key === methodKey || method.name.toLowerCase() === methodName.toLowerCase()
    );
    
    const detailedMethod = getDetailedCookingMethod(methodName);
    
    if (detailedMethod) {
      return {
        astrologicalInfluences: detailedMethod.astrologicalInfluences || 
                               (simplifiedMethod ? simplifiedMethod[1].astrologicalInfluences : undefined),
        scientificPrinciples: detailedMethod.scientificPrinciples || [],
        optimalTemperatures: detailedMethod.optimalTemperatures || {},
        nutrientRetention: detailedMethod.nutrientRetention || {},
        commonMistakes: detailedMethod.commonMistakes || [],
        regionVariations: detailedMethod.regionalVariations || {},
        pairingSuggestions: detailedMethod.pairingSuggestions || [],
        toolsRequired: detailedMethod.toolsRequired || [],
        history: detailedMethod.history || "",
        safetyFeatures: detailedMethod.safetyFeatures || []
      };
    }
    
    return simplifiedMethod ? {
      astrologicalInfluences: simplifiedMethod[1].astrologicalInfluences,
      scientificPrinciples: [],
      optimalTemperatures: {},
      nutrientRetention: {},
      commonMistakes: []
    } : null;
  };
  
  // Calculate elemental transformation capacity from alchemical properties
  const getElementalTransformations = (method: CookingMethod) => {
    const transformations = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };

    // If method has alchemical properties, use them to calculate transformations
    if (method.alchemicalProperties) {
      // Spirit primarily influences Fire and Air
      if (method.alchemicalProperties.Spirit > 0) {
        transformations.Fire += method.alchemicalProperties.Spirit * 0.6;
        transformations.Air += method.alchemicalProperties.Spirit * 0.4;
      }
      
      // Essence primarily influences Water and Air
      if (method.alchemicalProperties.Essence > 0) {
        transformations.Water += method.alchemicalProperties.Essence * 0.6;
        transformations.Air += method.alchemicalProperties.Essence * 0.4;
      }
      
      // Matter primarily influences Earth and Water
      if (method.alchemicalProperties.Matter > 0) {
        transformations.Earth += method.alchemicalProperties.Matter * 0.6;
        transformations.Water += method.alchemicalProperties.Matter * 0.4;
      }
      
      // Substance primarily influences Earth and Fire
      if (method.alchemicalProperties.Substance > 0) {
        transformations.Earth += method.alchemicalProperties.Substance * 0.6;
        transformations.Fire += method.alchemicalProperties.Substance * 0.4;
      }
    } 
    // If no alchemical properties, use elementalEffect as directional indicators
    else if (method.elementalEffect) {
      transformations.Fire = method.elementalEffect.Fire;
      transformations.Water = method.elementalEffect.Water;
      transformations.Earth = method.elementalEffect.Earth;
      transformations.Air = method.elementalEffect.Air;
    }

    return transformations;
  };

  // Determine if an element is increased or decreased by the method
  const getElementalDirection = (value: number): {direction: 'increase' | 'decrease' | 'neutral', intensity: number} => {
    if (value > 0.5) return { direction: 'increase', intensity: (value - 0.5) * 2 };
    if (value < 0.5) return { direction: 'decrease', intensity: (0.5 - value) * 2 };
    return { direction: 'neutral', intensity: 0 };
  };

  // Get alchemical essence label from properties
  const getAlchemicalLabel = (method: CookingMethod): { primary: string, secondary: string } | null => {
    if (!method.alchemicalProperties) return null;
    
    const { Spirit, Essence, Matter, Substance } = method.alchemicalProperties;
    const alchemical = [
      { name: 'Spirit', value: Spirit || 0 },
      { name: 'Essence', value: Essence || 0 },
      { name: 'Matter', value: Matter || 0 },
      { name: 'Substance', value: Substance || 0 }
    ].sort((a, b) => b.value - a.value);
    
    if (alchemical[0].value === 0) return null;
    
    return {
      primary: alchemical[0].name,
      secondary: alchemical[1].name
    };
  };
  
  // Map compatibility score to color and label
  const getCompatibilityLabel = (score: number): { label: string; className: string } => {
    if (score >= 0.8) return { label: 'Excellent', className: 'compatibility-excellent' };
    if (score >= 0.6) return { label: 'Good', className: 'compatibility-good' };
    if (score >= 0.4) return { label: 'Fair', className: 'compatibility-fair' };
    if (score >= 0.2) return { label: 'Poor', className: 'compatibility-poor' };
    return { label: 'Incompatible', className: 'compatibility-bad' };
  };

  // Get score class for styling
  const getScoreClass = (score: number): string => {
    if (score >= 0.8) return styles['score-excellent'];
    if (score >= 0.6) return styles['score-good'];
    if (score >= 0.4) return styles['score-fair'];
    if (score >= 0.2) return styles['score-poor'];
    return styles['score-bad'];
  };
  
  return (
    <div className={styles['cooking-methods-container']}>
      <div 
        className={`${styles['cooking-methods-header']} ${!showToggle ? styles['no-toggle'] : ''}`} 
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3 className={styles.title}>
          <Sparkles size={18} className={styles.titleIcon} />
          <span className={styles.titleText}>Alchemical Cooking Methods</span>
          <span className={styles.titleCount}>({methods.length})</span>
        </h3>
        
        {topMethod && (
          <div className={styles['top-recommendation']}>
            Top: <span>{topMethod.name}</span>
          </div>
        )}
        
        {/* Add ingredient search toggle button */}
        <button 
          className={`${styles['ingredient-search-toggle']} ${showIngredientSearch ? styles.active : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleIngredientSearch();
          }}
          title="Check ingredient compatibility"
        >
          <Search size={18} />
        </button>
        
        {showToggle && (
          <button className={styles['toggle-button']}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>
      
      {/* Ingredient search form */}
      {showIngredientSearch && (
        <div className={styles['ingredient-search-container']}>
          <div className={styles['search-form']}>
            <input
              type="text"
              placeholder="Enter ingredient name..."
              value={searchIngredient}
              onChange={(e) => setSearchIngredient(e.target.value)}
              className={styles['ingredient-search-input']}
            />
            <button 
              onClick={calculateIngredientCompatibility}
              disabled={isLoading || !searchIngredient.trim()}
              className={styles['search-button']}
            >
              {isLoading ? 'Loading...' : 'Check Compatibility'}
            </button>
          </div>
          
          {error && (
            <div className={styles['error-message']}>{error}</div>
          )}
          
          {Object.keys(ingredientCompatibility).length > 0 && (
            <div className={styles['compatibility-info']}>
              <p>Showing compatibility for: <strong>{searchIngredient}</strong></p>
            </div>
          )}
        </div>
      )}
      
      {isExpanded && (
        <div className={styles['cooking-methods-content']}>
          <div className={styles['methods-grid']}>
            {displayMethods.map((method) => (
              <div 
                key={method.id} 
                className={`${styles['method-card']} ${selectedMethodId === method.id ? styles.selected : ''}`}
                onClick={() => onSelectMethod && onSelectMethod(method)}
              >
                <div className={styles['method-header']}>
                  <h4 className={styles['method-name']}>{method.name}</h4>
                  
                  {method.score !== undefined && (
                    <div className={`${styles['method-score']} ${getScoreClass(method.score)}`}>
                      <span className={styles['score-value']}>{Math.round(method.score * 100)}%</span>
                      <div className={styles['score-bar']}>
                        <div className={styles['score-bar-fill']} style={{width: `${Math.round(method.score * 100)}%`}}></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show ingredient compatibility if available */}
                  {ingredientCompatibility[method.id] !== undefined && (
                    <div className={`${styles['ingredient-compatibility']} ${styles[getCompatibilityLabel(ingredientCompatibility[method.id]).className]}`}>
                      <span>{getCompatibilityLabel(ingredientCompatibility[method.id]).label}</span>
                      <span className={styles['compatibility-value']}>{Math.round(ingredientCompatibility[method.id] * 100)}%</span>
                      <div className={styles['compatibility-bar']}>
                        <div className={styles['compatibility-bar-fill']} style={{width: `${Math.round(ingredientCompatibility[method.id] * 100)}%`}}></div>
                      </div>
                    </div>
                  )}
                  
                  {method.variations && method.variations.length > 0 && (
                    <button 
                      className={styles['toggle-variations']}
                      onClick={(e) => toggleMethodExpanded(method.id, e)}
                      aria-label={expandedMethods[method.id] ? "Collapse variations" : "Expand variations"}
                    >
                      <span className={styles['variations-count']}>{method.variations.length}</span>
                      {expandedMethods[method.id] ? 
                        <ChevronUp size={16} /> : 
                        <ChevronDown size={16} />
                      }
                    </button>
                  )}
                </div>
                
                <p className={styles['method-description']}>{method.description}</p>
                
                {/* Always display elemental transformation capacity */}
                <div className={styles['transformation-container']}>
                  <div className={styles['transformation-header']}>
                    <span>Elemental Transformations</span>
                  </div>
                  <div className={styles['elemental-transformations']}>
                    {(() => {
                      const transformations = getElementalTransformations(method);
                      
                      return Object.entries(transformations).map(([element, value]) => {
                        const { direction, intensity } = getElementalDirection(value);
                        const displayIntensity = Math.min(Math.round(intensity * 100), 100); // 0-100 range
                        
                        // Skip elements with no significant change
                        if (direction === 'neutral') return null;
                        
                        return (
                          <div 
                            key={element} 
                            className={`${styles['transformation-item']} ${styles[element.toLowerCase()]} ${styles[`transform-${direction}`]}`} 
                            title={`${direction === 'increase' ? 'Increases' : 'Decreases'} ${element} by ${displayIntensity}%`}
                          >
                            <div className={styles['element-icon']}>
                              {element === 'Fire' && <Flame size={16} />}
                              {element === 'Water' && <Droplets size={16} />}
                              {element === 'Earth' && <Mountain size={16} />}
                              {element === 'Air' && <Wind size={16} />}
                            </div>
                            
                            <div className={styles['transformation-label']}>
                              <span className={styles['element-name']}>{element}</span>
                              <div className={styles['direction-indicator']}>
                                {direction === 'increase' ? <ArrowUp size={14} /> : direction === 'decrease' ? <ArrowDown size={14} /> : <Minus size={14} />}
                              </div>
                            </div>
                            
                            {displayIntensity > 0 && (
                              <span className={styles['intensity-value']}>
                                {direction === 'increase' ? '+' : '-'}{displayIntensity}%
                              </span>
                            )}
                          </div>
                        );
                      }).filter(Boolean); // Filter out null items
                    })()}
                  </div>
                </div>
                
                {/* Benefits section */}
                {method.benefits && method.benefits.length > 0 && (
                  <div className={styles['benefits-container']}>
                    <div className={styles['benefits-header']}>
                      <ThumbsUp size={16} />
                      <span>Benefits</span>
                    </div>
                    <ul className={styles['benefits-list']}>
                      {method.benefits.slice(0, 4).map((benefit, index) => (
                        <li key={index} className={styles['benefit-item']}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Duration information */}
                {method.duration && (
                  <div className={styles['duration-container']}>
                    <Clock size={16} />
                    <span>
                      {method.duration.min === method.duration.max 
                        ? `${method.duration.min} minutes` 
                        : `${method.duration.min}-${method.duration.max} minutes`}
                    </span>
                  </div>
                )}
                
                {/* Add show details button */}
                <div className={styles['method-footer']}>
                  <button 
                    className={`${styles['details-button']} ${showDetailedInfo === method.id ? styles.active : ''}`}
                    onClick={(e) => toggleDetailedInfo(method.id, e)}
                  >
                    <Info size={16} />
                    <span>{showDetailedInfo === method.id ? 'Hide Details' : 'Show Details'}</span>
                  </button>
                </div>
                
                {/* Show detailed info when toggled */}
                {showDetailedInfo === method.id && (
                  <div className={styles['detailed-info']}>
                    {(() => {
                      const details = getAdditionalMethodDetails(method.name);
                      return details ? (
                        <>
                          {details.astrologicalInfluences?.favorableZodiac && (
                            <div className={styles['detail-section']}>
                              <h5>Favorable Zodiac</h5>
                              <p>{details.astrologicalInfluences.favorableZodiac.join(', ')}</p>
                            </div>
                          )}
                          
                          {details.history && (
                            <div className={styles['detail-section']}>
                              <h5>Historical Background</h5>
                              <p>{details.history.substring(0, 150)}...</p>
                            </div>
                          )}
                          
                          {details.scientificPrinciples && details.scientificPrinciples.length > 0 && (
                            <div className={styles['detail-section']}>
                              <h5>Scientific Principles</h5>
                              <ul>
                                {details.scientificPrinciples.slice(0, 3).map((principle, i) => (
                                  <li key={i}>{principle}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {details.commonMistakes && details.commonMistakes.length > 0 && (
                            <div className={styles['detail-section']}>
                              <h5>Common Mistakes</h5>
                              <ul>
                                {details.commonMistakes.slice(0, 3).map((mistake, i) => (
                                  <li key={i}>{mistake}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {details.pairingSuggestions && details.pairingSuggestions.length > 0 && (
                            <div className={styles['detail-section']}>
                              <h5>Food Pairings</h5>
                              <ul>
                                {details.pairingSuggestions.slice(0, 3).map((pairing, i) => (
                                  <li key={i}>{pairing}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {details.toolsRequired && details.toolsRequired.length > 0 && (
                            <div className={styles['detail-section']}>
                              <h5>Recommended Tools</h5>
                              <p>{details.toolsRequired.slice(0, 3).join(', ')}</p>
                            </div>
                          )}
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Show more/less button */}
          {methods.length > 8 && (
            <div className={styles['show-more-container']}>
              <button 
                className={styles['show-more-button']}
                onClick={() => setShowAllMethods(!showAllMethods)}
              >
                {showAllMethods ? (
                  <>Show Less <ChevronUp size={16} /></>
                ) : (
                  <>Show More ({methods.length - 8} more) <ChevronDown size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CookingMethodsSection; 
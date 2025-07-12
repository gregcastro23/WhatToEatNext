import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain, Search, ArrowUp, ArrowDown, Zap, Sparkles, Minus, Info, List, ThumbsUp, Clock } from 'lucide-react'; // Added Zap, Sparkles, and Minus icons
import { useIngredientMapping } from '@/hooks/useIngredientMapping'; // Import our new hook
import styles from './CookingMethods.module.css';
import { getTechnicalTips, getIdealIngredients } from '@/utils/cookingMethodTips';

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
        // Create a compatibility object from method's elemental effect
        const methodElemental = {
          Fire: method.elementalEffect.Fire || 0,
          Water: method.elementalEffect.Water || 0,
          Earth: method.elementalEffect.Earth || 0,
          Air: method.elementalEffect.Air || 0
        };
        
        // Calculate compatibility between ingredient and cooking method
        const result = calculateCompatibility(searchIngredient as unknown as string, {
          name: method.name,
          elementalProperties: methodElemental,
          category: 'cooking_method'
        } as unknown);
        
        if (result.success) {
          compatibilityResults[method.id] = result.compatibility;
        }
        
        // Also calculate for variations if they exist
        if (method.variations) {
          method.variations.forEach(variation => {
            // Use parent method's elemental effect if variation doesn't have one
            const variationElemental = variation.elementalEffect || method.elementalEffect;
            
            if (variationElemental) {
              const variationResult = calculateCompatibility(searchIngredient as unknown as string, {
                name: variation.name,
                elementalProperties: variationElemental,
                category: 'cooking_method'
              } as unknown);
              
              if (variationResult.success) {
                compatibilityResults[variation.id] = variationResult.compatibility;
              }
            }
          });
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
  
  // Enhanced elemental transformation calculation with better descriptions
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

  // Enhanced elemental direction with better descriptions
  const getElementalDirection = (value: number): {
    direction: 'increase' | 'decrease' | 'neutral', 
    intensity: number,
    description: string
  } => {
    if (value > 0.6) {
      return { 
        direction: 'increase', 
        intensity: (value - 0.6) * 2.5,
        description: 'Significantly amplifies'
      };
    } else if (value > 0.4) {
      return { 
        direction: 'increase', 
        intensity: (value - 0.4) * 2.5,
        description: 'Moderately enhances'
      };
    } else if (value > 0.2) {
      return { 
        direction: 'neutral', 
        intensity: 0,
        description: 'Minimally affects'
      };
    } else if (value > 0.1) {
      return { 
        direction: 'decrease', 
        intensity: (0.2 - value) * 2.5,
        description: 'Slightly reduces'
      };
    } else {
      return { 
        direction: 'decrease', 
        intensity: (0.2 - value) * 2.5,
        description: 'Significantly diminishes'
      };
    }
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

  // Get score class for styling - updated ranges for Monica-enhanced scoring
  const getScoreClass = (score: number): string => {
    if (score >= 0.85) return styles['score-excellent'];
    if (score >= 0.70) return styles['score-good'];
    if (score >= 0.55) return styles['score-fair'];
    if (score >= 0.35) return styles['score-poor'];
    return styles['score-bad'];
  };

  // Enhanced method information display
  const getMethodDescription = (method: CookingMethod): string => {
    if (method.description) return method.description;
    
    // Generate description based on elemental properties
    const elemental = method.elementalEffect;
    if (elemental) {
      const dominantElement = Object.entries(elemental)
        .reduce((max, [element, value]) => 
          (value as number) > (max.value as number) ? { element, value } : max, 
          { element: 'Fire', value: 0 }
        ).element;
      
      return `A ${dominantElement.toLowerCase()}-dominant cooking technique that transforms ingredients through controlled application of heat and energy.`;
    }
    
    return `A cooking method that transforms ingredients through controlled application of heat and energy.`;
  };

  // Get elemental transformation descriptions
  const getElementalTransformationDescription = (method: CookingMethod): string => {
    const transformations = getElementalTransformations(method);
    const dominantElements = Object.entries(transformations)
      .filter(([_, value]) => value > 0.4)
      .sort(([_, a], [__, b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([element, _]) => element);
    
    if (dominantElements.length === 0) {
      return "Balanced elemental transformation";
    } else if (dominantElements.length === 1) {
      return `Primarily enhances ${dominantElements[0]} energy`;
    } else {
      return `Enhances ${dominantElements[0]} and ${dominantElements[1]} energies`;
    }
  };
  
  return (
    <div className={styles['cooking-methods-container']}>
      <div 
        className={`${styles['cooking-methods-header']} ${!showToggle ? styles['no-toggle'] : ''}`} 
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3 className={styles.title}>
          <Sparkles size={18} className={styles.titleIcon} />
          <span className={styles.titleText}>🔥 Alchemical Cooking Methods</span>
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
          {methods.length === 0 ? (
            <div className={styles['no-methods']}>
              <p>No cooking methods available. Please check your data sources.</p>
            </div>
          ) : (
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
                  
                  <p className={styles['method-description']}>{getMethodDescription(method)}</p>
                  
                  {/* Enhanced Elemental Transformations Display */}
                  <div className={styles['transformation-container']}>
                    <div className={styles['transformation-header']}>
                      <Zap size={14} className={styles['transformation-icon']} />
                      <span className={styles['transformation-title']}>Elemental Transformations</span>
                      <span className={styles['transformation-description']}>
                        {getElementalTransformationDescription(method)}
                      </span>
                    </div>
                    <div className={styles['elemental-transformations']}>
                      {(() => {
                        const transformations = getElementalTransformations(method);
                        const significantTransformations = Object.entries(transformations)
                          .map(([element, value]) => {
                            const { direction, intensity, description } = getElementalDirection(value);
                            const displayIntensity = Math.min(Math.round(intensity * 100), 100);
                            
                            return {
                              element,
                              direction,
                              intensity: displayIntensity,
                              description,
                              value
                            };
                          })
                          .filter(item => item.intensity > 15 || item.direction !== 'neutral'); // Show significant changes
                        
                        if (significantTransformations.length === 0) {
                          return (
                            <div className={styles['no-transformations']}>
                              <span className={styles['neutral-text']}>Balanced elemental approach</span>
                            </div>
                          );
                        }
                        
                        return significantTransformations.map(({ element, direction, intensity, description }) => (
                          <div 
                            key={element} 
                            className={`${styles['transformation-item']} ${styles[element.toLowerCase()]} ${styles[`transform-${direction}`]}`} 
                            title={`${description} ${element} energy by ${intensity}%`}
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
                            
                            {intensity > 0 && (
                              <span className={styles['intensity-value']}>
                                {direction === 'increase' ? '+' : direction === 'decrease' ? '-' : ''}{intensity}%
                              </span>
                            )}
                            
                            <div className={styles['intensity-bar']}>
                              <div 
                                className={styles['intensity-bar-fill']} 
                                style={{
                                  width: `${intensity}%`,
                                  backgroundColor: direction === 'increase' ? '#10b981' : direction === 'decrease' ? '#ef4444' : '#6b7280'
                                }}
                              ></div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  {/* Display alchemical properties with enhanced descriptions */}
                  {method.alchemicalProperties && (
                    <div className={styles['alchemical-properties']}>
                      <div className={styles['alchemy-header']}>
                        <Sparkles size={14} className={styles['alchemy-icon']} />
                        <span className={styles['alchemy-title']}>Alchemical Properties</span>
                      </div>
                      
                      {/* Alchemical properties grid */}
                      <div className={styles['alchemy-grid']}>
                        {Object.entries(method.alchemicalProperties).map(([property, value]) => {
                          const percentage = Math.round(value * 100);
                          const intensity = Math.min(percentage, 100);
                          
                          return (
                            <div key={property} className={styles['alchemy-item']}>
                              <div className={styles['alchemy-property']}>
                                <span className={styles['property-name']}>{property}</span>
                                <span className={styles['property-value']}>{percentage}%</span>
                              </div>
                              <div className={styles['alchemy-bar']}>
                                <div 
                                  className={styles['alchemy-bar-fill']} 
                                  style={{
                                    width: `${intensity}%`,
                                    backgroundColor: intensity > 70 ? '#10b981' : intensity > 40 ? '#f59e0b' : '#6b7280'
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Alchemical summary */}
                      {getAlchemicalLabel(method) && (
                        <div className={styles['alchemy-summary']}>
                          <span className={styles['summary-label']}>Primary Focus:</span>
                          <span className={styles['summary-primary']}>{getAlchemicalLabel(method)?.primary}</span>
                          {getAlchemicalLabel(method)?.secondary && (
                            <>
                              <span className={styles['summary-label']}>Secondary:</span>
                              <span className={styles['summary-secondary']}>{getAlchemicalLabel(method)?.secondary}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Show duration and suitable ingredients */}
                  <div className={styles['method-details']}>
                    {method.duration && (
                      <div className={styles['detail-item']}>
                        <Clock size={14} className={styles['detail-icon']} />
                        <span className={styles['detail-label']}>Duration:</span> 
                        <span className={styles['detail-value']}>
                          {method.duration.min}-{method.duration.max} min
                          {method.duration.max > 60 && (
                            <span className={styles['duration-note']}> (slow method)</span>
                          )}
                          {method.duration.max <= 15 && (
                            <span className={styles['duration-note']}> (quick method)</span>
                          )}
                        </span>
                      </div>
                    )}
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <div className={styles['detail-item']}>
                        <List size={14} className={styles['detail-icon']} />
                        <span className={styles['detail-label']}>Ideal for:</span> 
                        <div className={styles['suitable-ingredients']}>
                          {method.suitable_for.slice(0, 4).map((ingredient, index) => (
                            <span key={index} className={styles['ingredient-tag']}>{ingredient}</span>
                          ))}
                          {method.suitable_for.length > 4 && (
                            <span className={styles['more-ingredients']}>+{method.suitable_for.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                    {method.benefits && method.benefits.length > 0 && (
                      <div className={styles['detail-item']}>
                        <ThumbsUp size={14} className={styles['detail-icon']} />
                        <span className={styles['detail-label']}>Benefits:</span> 
                        <div className={styles['benefits-list']}>
                          {method.benefits.slice(0, 2).map((benefit, index) => (
                            <span key={index} className={styles['benefit-tag']}>{benefit}</span>
                          ))}
                          {method.benefits.length > 2 && (
                            <span className={styles['more-benefits']}>+{method.benefits.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Show cultural variations if expanded */}
                  {method.variations && method.variations.length > 0 && expandedMethods[method.id] && (
                    <div className={styles['variations-container']}>
                      <h5 className={styles['variations-header']}>
                        <Globe size={14} className={styles['variations-icon']} />
                        Variations & Subcategories
                      </h5>
                      <div className={styles['variations-list']}>
                        {method.variations.map((variation) => (
                          <div 
                            key={variation.id} 
                            className={`${styles['variation-item']} ${selectedMethodId === variation.id ? styles.selected : ''}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click
                              onSelectMethod && onSelectMethod(variation);
                            }}
                          >
                            <div className={styles['variation-header']}>
                              <span className={styles['variation-name']}>{variation.name}</span>
                              {variation.culturalOrigin && (
                                <span className={styles['cultural-origin']}>{variation.culturalOrigin}</span>
                              )}
                              
                              {/* Show ingredient compatibility for variations if available */}
                              {ingredientCompatibility[variation.id] !== undefined && (
                                <div className={`${styles['ingredient-compatibility']} ${styles.small} ${styles[getCompatibilityLabel(ingredientCompatibility[variation.id]).className]}`}>
                                  <span>{getCompatibilityLabel(ingredientCompatibility[variation.id]).label}</span>
                                  <span className={styles['compatibility-value']}>
                                    {Math.round(ingredientCompatibility[variation.id] * 100)}%
                                  </span>
                                  <div className={styles['compatibility-bar']}>
                                    <div className={styles['compatibility-bar-fill']} style={{width: `${Math.round(ingredientCompatibility[variation.id] * 100)}%`}}></div>
                                  </div>
                                </div>
                              )}
                              
                              {variation.score !== undefined && (
                                <div className={`${styles['variation-score']} ${getScoreClass(variation.score)}`}>
                                  <span>{Math.round(variation.score * 100)}%</span>
                                  <div className={styles['score-bar']}>
                                    <div className={styles['score-bar-fill']} style={{width: `${Math.round(variation.score * 100)}%`}}></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Show elemental transformations for variations too */}
                            {(variation.elementalEffect || variation.alchemicalProperties) && (
                              <div className={styles['elemental-transformations-small']}>
                                {(() => {
                                  const transformations = getElementalTransformations(variation);
                                  
                                  return Object.entries(transformations).map(([element, value]) => {
                                    const { direction, intensity } = getElementalDirection(value);
                                    const displayIntensity = Math.min(Math.round(intensity * 100), 100); // 0-100 range
                                    
                                    // Skip elements with no significant change
                                    if (direction === 'neutral' || displayIntensity < 5) return null;
                                    
                                    return (
                                      <div 
                                        key={element} 
                                        className={`${styles['transformation-item-small']} ${styles[element.toLowerCase()]} ${styles[`transform-${direction}`]}`} 
                                        title={`${direction === 'increase' ? 'Increases' : 'Decreases'} ${element} by ${displayIntensity}%`}
                                      >
                                        <div className={styles['element-icon-small']}>
                                          {element === 'Fire' && <Flame size={12} />}
                                          {element === 'Water' && <Droplets size={12} />}
                                          {element === 'Earth' && <Mountain size={12} />}
                                          {element === 'Air' && <Wind size={12} />}
                                        </div>
                                        
                                        <div className={styles['direction-indicator-small']}>
                                          {direction === 'increase' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                        </div>
                                        
                                        {displayIntensity > 0 && (
                                          <span className={styles['intensity-value-small']}>
                                            {direction === 'increase' ? '+' : '-'}{displayIntensity}%
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }).filter(Boolean); // Filter out null items
                                })()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedMethodId === method.id && (
                    <div className={styles['expanded-details']}>
                      {/* Technical Tips Section */}
                      <div className={styles['technical-tips']}>
                        <div className={styles['section-header']}>
                          <Info size={14} className={styles['section-icon']} />
                          <span>Expert Technical Tips</span>
                        </div>
                        <div className={styles['tips-grid']}>
                          {getTechnicalTips(method.name).slice(0, 5).map((tip, index) => (
                            <div key={index} className={styles['tip-item']}>
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Ideal Ingredients Section */}
                      <div className={styles['ideal-ingredients']}>
                        <div className={styles['section-header']}>
                          <List size={14} className={styles['section-icon']} />
                          <span>Ideal Ingredients</span>
                        </div>
                        <div className={styles['ingredients-grid']}>
                          {getIdealIngredients(method.name).slice(0, 8).map((ingredient, index) => (
                            <div key={index} className={styles['ingredient-item']}>
                              {ingredient}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
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
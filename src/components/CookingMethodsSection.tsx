import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain, Search, ArrowUp, ArrowDown, Zap, Sparkles, Minus, Info, List, ThumbsUp, Clock } from 'lucide-react'; // Added Zap, Sparkles, and Minus icons
import { useIngredientMapping } from '@/hooks'; // Import our new hook
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
        const result = calculateCompatibility(searchIngredient, {
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
              const variationResult = calculateCompatibility(searchIngredient, {
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

  // Get score class for styling - updated ranges for Monica-enhanced scoring
  const getScoreClass = (score: number): string => {
    if (score >= 0.85) return styles['score-excellent'];
    if (score >= 0.70) return styles['score-good'];
    if (score >= 0.55) return styles['score-fair'];
    if (score >= 0.35) return styles['score-poor'];
    return styles['score-bad'];
  };

  // Format Monica constant for display
  const formatMonicaConstant = (monicaConstant: number): string => {
    if (isNaN(monicaConstant) || !isFinite(monicaConstant)) {
      return 'Stable';
    }
    if (Math.abs(monicaConstant) < 0.001) {
      return '~0';
    }
    return monicaConstant.toFixed(3);
  };

  // Get enhanced method information including Monica properties
  const getEnhancedMethodInfo = (method: CookingMethod) => {
    // This would ideally call the enhanced thermodynamics function
    // For now, we'll create a simplified version based on available data
    const alchemicalProps = method.alchemicalProperties || {
      Spirit: 0.5,
      Essence: 0.5, 
      Matter: 0.5,
      Substance: 0.5
    };
    
    const elementalProps = method.elementalEffect || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    // Use the same formulas as in the user's notepad and test endpoint
    const heat = (Math.pow(alchemicalProps.Spirit, 2) + Math.pow(elementalProps.Fire, 2)) /
                 Math.pow(alchemicalProps.Substance + alchemicalProps.Essence + alchemicalProps.Matter + 
                         elementalProps.Water + elementalProps.Air + elementalProps.Earth, 2);
    
    const entropy = (Math.pow(alchemicalProps.Spirit, 2) + Math.pow(alchemicalProps.Substance, 2) + 
                    Math.pow(elementalProps.Fire, 2) + Math.pow(elementalProps.Air, 2)) /
                    Math.pow(alchemicalProps.Essence + alchemicalProps.Matter + elementalProps.Earth + elementalProps.Water, 2);
    
    const reactivity = (Math.pow(alchemicalProps.Spirit, 2) + Math.pow(alchemicalProps.Substance, 2) + 
                       Math.pow(alchemicalProps.Essence, 2) + Math.pow(elementalProps.Fire, 2) + 
                       Math.pow(elementalProps.Air, 2) + Math.pow(elementalProps.Water, 2)) /
                       Math.pow(alchemicalProps.Matter + elementalProps.Earth, 2);
    
    const gregsEnergy = heat - (entropy * reactivity);
    
    // Simplified Kalchm calculation for display with safe values
    const kalchm = (Math.pow(Math.max(0.001, alchemicalProps.Spirit), alchemicalProps.Spirit) * 
                    Math.pow(Math.max(0.001, alchemicalProps.Essence), alchemicalProps.Essence)) /
                   (Math.pow(Math.max(0.001, alchemicalProps.Matter), alchemicalProps.Matter) * 
                    Math.pow(Math.max(0.001, alchemicalProps.Substance), alchemicalProps.Substance));

    // Monica constant using the exact formula from user's notepad
    const monicaConstant = kalchm > 0 && reactivity !== 0 && Math.log(kalchm) !== 0 ? 
                          -gregsEnergy / (reactivity * Math.log(kalchm)) : 0;

    let monicaClassification = 'Stable';
    if (!isNaN(monicaConstant) && isFinite(monicaConstant)) {
      if (Math.abs(monicaConstant) > 10) monicaClassification = 'Highly Transformative';
      else if (Math.abs(monicaConstant) > 5) monicaClassification = 'Transformative';
      else if (Math.abs(monicaConstant) > 1) monicaClassification = 'Moderately Active';
    }

    return {
      kalchm,
      monicaConstant,
      monicaClassification,
      heat,
      entropy,
      reactivity,
      gregsEnergy
    };
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
                
                {/* Display alchemical properties with Monica constants */}
                {method.alchemicalProperties && (
                  <div className={styles['alchemical-properties']}>
                    <div className={styles['alchemy-header']}>
                      <Zap size={14} className={styles['alchemy-icon']} />
                      <span>Alchemical Properties</span>
                    </div>
                    {getAlchemicalLabel(method) && (
                      <div className={styles['alchemy-label']}>
                        Primary: <span className={styles['alchemy-value']}>{getAlchemicalLabel(method)?.primary}</span>
                        {getAlchemicalLabel(method)?.secondary && (
                          <> | Secondary: <span className={styles['alchemy-value']}>{getAlchemicalLabel(method)?.secondary}</span></>
                        )}
                      </div>
                    )}
                    
                    {/* Monica Constant Display */}
                    {(() => {
                      const enhancedInfo = getEnhancedMethodInfo(method);
                      return (
                        <div className={styles['monica-properties']}>
                          <div className={styles['monica-header']}>
                            <Sparkles size={12} className={styles['monica-icon']} />
                            <span>Monica Analysis</span>
                          </div>
                          <div className={styles['monica-details']}>
                            <div className={styles['monica-item']}>
                              <span className={styles['monica-label']}>Constant:</span>
                              <span className={styles['monica-value']}>
                                {formatMonicaConstant(enhancedInfo.monicaConstant)}
                              </span>
                            </div>
                            <div className={styles['monica-item']}>
                              <span className={styles['monica-label']}>Class:</span>
                              <span className={`${styles['monica-value']} ${styles[enhancedInfo.monicaClassification.toLowerCase().replace(/\s+/g, '-')]}`}>
                                {enhancedInfo.monicaClassification}
                              </span>
                            </div>
                            <div className={styles['monica-item']}>
                              <span className={styles['monica-label']}>Kalchm:</span>
                              <span className={styles['monica-value']}>
                                {enhancedInfo.kalchm.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {/* Show duration and suitable ingredients */}
                <div className={styles['method-details']}>
                  {method.duration && (
                    <div className={styles['detail-item']}>
                      <Clock size={14} className={styles['detail-icon']} />
                      <span className={styles['detail-label']}>Duration:</span> 
                      <span className={styles['detail-value']}>{method.duration.min}-{method.duration.max} min</span>
                    </div>
                  )}
                  {method.suitable_for && method.suitable_for.length > 0 && (
                    <div className={styles['detail-item']}>
                      <List size={14} className={styles['detail-icon']} />
                      <span className={styles['detail-label']}>Ideal for:</span> 
                      <span className={styles['detail-value']}>
                        {method.suitable_for.slice(0, 3).join(', ')}
                        {method.suitable_for.length > 3 && '...'}
                      </span>
                    </div>
                  )}
                  {method.benefits && method.benefits.length > 0 && (
                    <div className={styles['detail-item']}>
                      <ThumbsUp size={14} className={styles['detail-icon']} />
                      <span className={styles['detail-label']}>Benefits:</span> 
                      <span className={styles['detail-value']}>
                        {method.benefits.slice(0, 1).join(', ')}
                        {method.benefits.length > 1 && '...'}
                      </span>
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
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain, Search, ArrowUp, ArrowDown, Zap, Sparkles, Minus, Info, List, ThumbsUp, Clock } from 'lucide-react'; // Added Zap, Sparkles, and Minus icons
import { useIngredientMapping } from '@/hooks'; // Import from hooks index
import styles from './CookingMethods.module.css';
import { getTipsForMethod } from '@/utils/cookingMethodTips';
import { cookingMethods } from '@/data/cooking/cookingMethods';

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

// Utility function to get ideal ingredients by method name
const getIdealIngredients = (methodName: string): string[] => {
  // Convert to lowercase for more flexible matching
  const method = methodName.toLowerCase();
  
  // Check if the method exists in the cooking methods 
  const methodObj = Object.values(cookingMethods).find(
    m => m.name?.toLowerCase() === method
  );
  
  // If the method has suitable_for, use that
  if (methodObj?.suitable_for) {
    return methodObj.suitable_for;
  }
  
  // Default mappings for common methods
  const defaultIngredients: Record<string, string[]> = {
    'roasting': ['chicken', 'beef', 'root vegetables', 'potatoes', 'turkey', 'lamb', 'pork loin', 'winter squash'],
    'baking': ['bread', 'cakes', 'cookies', 'fish', 'casseroles', 'potatoes', 'pasta dishes', 'pies'],
    'grilling': ['steak', 'burgers', 'chicken', 'fish', 'vegetables', 'tofu', 'corn', 'kebabs'],
    'steaming': ['vegetables', 'fish', 'dumplings', 'shellfish', 'rice', 'custards', 'puddings', 'buns'],
    'sauteing': ['vegetables', 'mushrooms', 'chicken cutlets', 'fish fillets', 'tofu', 'shrimp', 'greens', 'stir-fries'],
    'boiling': ['pasta', 'eggs', 'rice', 'potatoes', 'vegetables', 'grains', 'beans', 'stocks'],
    'braising': ['short ribs', 'chuck roast', 'chicken thighs', 'lamb shanks', 'pork shoulder', 'vegetables', 'lentils', 'beans'],
    'broiling': ['steaks', 'fish', 'chicken', 'lamb chops', 'kebabs', 'vegetables', 'fruit crumbles', 'gratins'],
    'poaching': ['eggs', 'fish', 'chicken breasts', 'fruits', 'delicate proteins', 'salmon', 'pears', 'shellfish'],
    'frying': ['chicken', 'fish', 'vegetables', 'fritters', 'tofu', 'tempura', 'potatoes', 'donuts'],
    'smoking': ['brisket', 'pork shoulder', 'ribs', 'fish', 'chicken', 'turkey', 'cheese', 'nuts'],
    'sous vide': ['steak', 'fish', 'chicken breasts', 'eggs', 'pork chops', 'vegetables', 'custards', 'infusions'],
    'pressure cooking': ['beans', 'grains', 'tough meats', 'stews', 'broths', 'stocks', 'vegetables', 'pulses'],
    'fermenting': ['cabbage', 'vegetables', 'milk', 'grains', 'fruits', 'meat', 'soybeans', 'tea'],
    'pickling': ['cucumbers', 'vegetables', 'eggs', 'fruits', 'peppers', 'onions', 'beets', 'garlic'],
    'dehydrating': ['fruits', 'vegetables', 'herbs', 'jerky', 'mushrooms', 'tomatoes', 'berries', 'citrus']
  };
  
  // Handle common method name variations
  for (const [key, ingredients] of Object.entries(defaultIngredients)) {
    if (method.includes(key) || key.includes(method)) {
      return ingredients;
    }
  }
  
  // Generic fallback
  return [
    'vegetables', 
    'proteins', 
    'grains', 
    'fruits',
    'refer to specific recipes for more suggestions'
  ];
};

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
        });
        
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
              });
              
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
    setIsExpanded(prev => !prev);
  };
  
  const toggleMethodExpanded = (methodId: string, e: React.MouseEvent) => {
    // Prevent the click from bubbling up
    e.preventDefault();
    e.stopPropagation();
    
    // Update expanded state for this method
    setExpandedMethods(prev => {
      console.log(`Toggling expansion for method ${methodId}: ${!prev[methodId]}`);
      return {
        ...prev,
        [methodId]: !prev[methodId]
      };
    });
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
                className={`${styles['method-card']} 
                  ${showIngredientSearch && ingredientCompatibility[method.id] !== undefined ? styles['with-compatibility'] : ''} 
                  ${selectedMethodId === method.id ? styles.selected : ''} 
                  ${expandedMethods[method.id] ? styles['expanded'] : ''}`}
                onClick={() => {
                  // Call the onSelectMethod handler if provided
                  onSelectMethod && onSelectMethod(method);
                  
                  // Also toggle the expanded state for this method
                  setExpandedMethods(prev => ({
                    ...prev,
                    [method.id]: !prev[method.id]
                  }));
                }}
                data-expanded={expandedMethods[method.id] ? 'true' : 'false'}
              >
                <div className={styles['method-header']}>
                  <h4 className={styles['method-name']}>{method.name}</h4>
                  
                  <div className={styles['header-right']}>
                    {method.score !== undefined && (
                      <div className={`${styles['method-score']} ${getScoreClass(method.score)}`}>
                        <span className={styles['score-value']}>{Math.round(method.score * 100)}%</span>
                        <div className={styles['score-bar']}>
                          <div className={styles['score-bar-fill']} style={{width: `${Math.round(method.score * 100)}%`}}></div>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className={styles['expand-indicator']}
                      aria-label={expandedMethods[method.id] ? "Collapse method details" : "Expand method details"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMethods(prev => ({
                          ...prev,
                          [method.id]: !prev[method.id]
                        }));
                      }}
                    >
                      {expandedMethods[method.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  
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
                
                {/* Display alchemical properties if available */}
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
                
                {/* Add expanded content section that shows when card is expanded */}
                {expandedMethods[method.id] && (
                  <div className={styles['expanded-content']}>
                    <div className={styles['expanded-section']}>
                      <h5 className={styles['expanded-header']}>
                        <Info size={14} className={styles['section-icon']} />
                        Technical Tips
                      </h5>
                      <ul className={styles['tip-list']}>
                        {getTipsForMethod(method.name).slice(0, 3).map((tip, index) => (
                          <li key={index} className={styles['tip-item']}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {method.suitable_for && method.suitable_for.length > 0 && (
                      <div className={styles['expanded-section']}>
                        <h5 className={styles['expanded-header']}>
                          <List size={14} className={styles['section-icon']} />
                          Ideal Ingredients
                        </h5>
                        <div className={styles['ingredients-grid']}>
                          {method.suitable_for.map((ingredient, index) => (
                            <div key={index} className={styles['ingredient-item']}>{ingredient}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show cultural variations if expanded */}
                {method.variations && method.variations.length > 0 && (
                  <div 
                    className={styles['variations-container']} 
                    style={{ display: expandedMethods[method.id] ? 'block' : 'none' }}
                    data-expanded={expandedMethods[method.id] ? 'true' : 'false'}
                  >
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
              </div>
            ))}
          </div>
          
          {/* Show more / (less || 1) button */}
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
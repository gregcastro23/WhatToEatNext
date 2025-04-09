import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe, Flame, Droplets, Wind, Mountain, Search } from 'lucide-react'; // Added Search icon
import { useIngredientMapping } from '@/hooks'; // Import our new hook
import styles from './CookingMethods.module.css';

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
}

interface Props {
  methods: CookingMethod[];
  onSelectMethod?: (method: CookingMethod) => void;
  selectedMethodId?: string;
  initiallyExpanded?: boolean;
}

const CookingMethodsSection: React.FC<Props> = ({ 
  methods, 
  onSelectMethod,
  selectedMethodId,
  initiallyExpanded = false
}) => {
  // Initialize expanded state based on method count (always expanded for ≤5 methods)
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded || methods.length <= 5);
  const [expandedMethods, setExpandedMethods] = useState<Record<string, boolean>>({});
  
  // New state for ingredient search and compatibility
  const [searchIngredient, setSearchIngredient] = useState('');
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [ingredientCompatibility, setIngredientCompatibility] = useState<Record<string, number>>({});
  
  // Use our new ingredient mapping hook
  const { suggestAlternatives, calculateCompatibility, isLoading, error } = useIngredientMapping();
  
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
  
  // Get the top method from the list
  const topMethod = methods.length > 0 ? methods[0] : null;
  
  // Determine if the toggle button should be shown (only for >5 methods)
  const showToggle = methods.length > 5;
  
  // Get compatibility label and CSS class based on score
  const getCompatibilityLabel = (score: number): { label: string, className: string } => {
    if (score >= 0.8) return { label: 'Excellent', className: 'excellent' };
    if (score >= 0.6) return { label: 'Good', className: 'good' };
    if (score >= 0.4) return { label: 'Fair', className: 'fair' };
    return { label: 'Poor', className: 'poor' };
  };
  
  return (
    <div className={styles['cooking-methods-container']}>
      <div 
        className={`${styles['cooking-methods-header']} ${!showToggle ? styles['no-toggle'] : ''}`} 
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3>Cooking Methods</h3>
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
          {methods.map((method) => (
            <div 
              key={method.id} 
              className={`${styles['cooking-method-item']} ${selectedMethodId === method.id ? styles.selected : ''}`}
              onClick={() => onSelectMethod && onSelectMethod(method)}
            >
              <div className={styles['method-header']}>
                <h4>{method.name}</h4>
                {method.score !== undefined && (
                  <div className={styles['method-score']}>
                    <div 
                      className={styles['score-bar']}
                      style={{ width: `${Math.round(method.score * 100)}%` }}
                    />
                    <span>{Math.round(method.score * 100)}%</span>
                  </div>
                )}
                
                {/* Show ingredient compatibility if available */}
                {ingredientCompatibility[method.id] !== undefined && (
                  <div className={`${styles['ingredient-compatibility']} ${styles[getCompatibilityLabel(ingredientCompatibility[method.id]).className]}`}>
                    <span>{getCompatibilityLabel(ingredientCompatibility[method.id]).label}</span>
                    <div 
                      className={styles['compatibility-bar']}
                      style={{ width: `${Math.round(ingredientCompatibility[method.id] * 100)}%` }}
                    />
                  </div>
                )}
                
                {method.variations && method.variations.length > 0 && (
                  <button 
                    className={styles['toggle-variations']}
                    onClick={(e) => toggleMethodExpanded(method.id, e)}
                  >
                    {expandedMethods[method.id] ? 
                      <ChevronUp size={16} /> : 
                      <ChevronDown size={16} />
                    }
                  </button>
                )}
              </div>
              
              <p className={styles['method-description']}>{method.description}</p>
              
              {/* Show elemental balance */}
              {method.elementalEffect && (
                <div className={styles['elemental-balance']}>
                  {method.elementalEffect.Fire > 0.2 && (
                    <div className={`${styles.element} ${styles.fire}`} title={`Fire: ${Math.round(method.elementalEffect.Fire * 100)}%`}>
                      <Flame size={14} />
                      <span>{Math.round(method.elementalEffect.Fire * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Water > 0.2 && (
                    <div className={`${styles.element} ${styles.water}`} title={`Water: ${Math.round(method.elementalEffect.Water * 100)}%`}>
                      <Droplets size={14} />
                      <span>{Math.round(method.elementalEffect.Water * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Air > 0.2 && (
                    <div className={`${styles.element} ${styles.air}`} title={`Air: ${Math.round(method.elementalEffect.Air * 100)}%`}>
                      <Wind size={14} />
                      <span>{Math.round(method.elementalEffect.Air * 100)}%</span>
                    </div>
                  )}
                  {method.elementalEffect.Earth > 0.2 && (
                    <div className={`${styles.element} ${styles.earth}`} title={`Earth: ${Math.round(method.elementalEffect.Earth * 100)}%`}>
                      <Mountain size={14} />
                      <span>{Math.round(method.elementalEffect.Earth * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show duration and suitable ingredients */}
              <div className={styles['method-details']}>
                {method.duration && (
                  <div className={styles.duration}>
                    <span className={styles['detail-label']}>Duration:</span> 
                    {method.duration.min}-{method.duration.max} min
                  </div>
                )}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div className={styles['suitable-for']}>
                    <span className={styles['detail-label']}>Ideal for:</span> 
                    {method.suitable_for.slice(0, 3).join(', ')}
                    {method.suitable_for.length > 3 && '...'}
                  </div>
                )}
              </div>
              
              {/* Show cultural variations if expanded */}
              {method.variations && method.variations.length > 0 && expandedMethods[method.id] && (
                <div className={styles['variations-container']}>
                  <h5 className={styles['variations-header']}>
                    Variations & Subcategories ({method.variations.length})
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
                          <Globe size={14} className={styles['culture-icon']} />
                          <span className={styles['variation-name']}>{variation.name}</span>
                          {variation.culturalOrigin && (
                            <span className={styles['cultural-origin']}>{variation.culturalOrigin}</span>
                          )}
                          
                          {/* Show ingredient compatibility for variations if available */}
                          {ingredientCompatibility[variation.id] !== undefined && (
                            <div className={`${styles['ingredient-compatibility']} ${styles.small} ${styles[getCompatibilityLabel(ingredientCompatibility[variation.id]).className]}`}>
                              <span>{getCompatibilityLabel(ingredientCompatibility[variation.id]).label}</span>
                              <div 
                                className={styles['compatibility-bar']}
                                style={{ width: `${Math.round(ingredientCompatibility[variation.id] * 100)}%` }}
                              />
                            </div>
                          )}
                          
                          {variation.score !== undefined && (
                            <div className={styles['variation-score']}>
                              <div 
                                className={styles['score-bar']}
                                style={{ width: `${Math.round(variation.score * 100)}%` }}
                              />
                              <span>{Math.round(variation.score * 100)}%</span>
                            </div>
                          )}
                        </div>
                        <p className={styles['variation-description']}>{variation.description}</p>
                        
                        {/* Show elemental balance for variations too */}
                        {variation.elementalEffect && (
                          <div className={`${styles['elemental-balance']} ${styles.small}`}>
                            {variation.elementalEffect.Fire > 0.2 && (
                              <div className={`${styles.element} ${styles.fire}`} title={`Fire: ${Math.round(variation.elementalEffect.Fire * 100)}%`}>
                                <Flame size={12} />
                                <span>{Math.round(variation.elementalEffect.Fire * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Water > 0.2 && (
                              <div className={`${styles.element} ${styles.water}`} title={`Water: ${Math.round(variation.elementalEffect.Water * 100)}%`}>
                                <Droplets size={12} />
                                <span>{Math.round(variation.elementalEffect.Water * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Air > 0.2 && (
                              <div className={`${styles.element} ${styles.air}`} title={`Air: ${Math.round(variation.elementalEffect.Air * 100)}%`}>
                                <Wind size={12} />
                                <span>{Math.round(variation.elementalEffect.Air * 100)}%</span>
                              </div>
                            )}
                            {variation.elementalEffect.Earth > 0.2 && (
                              <div className={`${styles.element} ${styles.earth}`} title={`Earth: ${Math.round(variation.elementalEffect.Earth * 100)}%`}>
                                <Mountain size={12} />
                                <span>{Math.round(variation.elementalEffect.Earth * 100)}%</span>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default CookingMethodsSection; 
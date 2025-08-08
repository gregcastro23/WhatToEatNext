'use client';

import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Clock, Droplets, Flame, Globe, Minus, Mountain, Search, Sparkles, ThumbsUp, Wind, Zap } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { useServices } from '@/hooks/useServices';
// Removed unused Element import
import { logger } from '@/utils/logger';

import styles from './CookingMethods.module.css';
// TODO: Fix CSS module import - was: import from "./CookingMethods.module.css.ts"
// Define proper types for the methods
interface CookingMethod {
  id: string;
  name: string;
  description: string;
  score?: number;
  culturalOrigin?: string;
  variations?: CookingMethod[];
  elementalEffect?: { Fire: number;
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

/**
 * CookingMethodsSection Component - Migrated Version
 *
 * This component displays a list of cooking methods with their details, including:
 * - Elemental effects
 * - Alchemical properties
 * - Ingredient compatibility
 * - Method variations
 *
 * It has been migrated from using direct hook imports to service-based architecture.
 */
export function CookingMethodsSectionMigrated({ methods,
  onSelectMethod,
  selectedMethodId,
  showToggle = true,
  initiallyExpanded = false }: CookingMethodsProps) {
  // Replace direct hook with services
  const {
    isLoading: servicesLoading,
    error: servicesError,
    ingredientService
  } = useServices();

  // Component state
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
    if (!methods || methods.length === 0) return null;
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

  // Auto-expand the section if we have methods and a pre-selected method
  useEffect(() => {
    if (methods?.length > 0) {
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
          if (selectedMethod.variations && selectedMethod.variations.length > 0) {
            setExpandedMethods(prev => ({
              ...prev,
              [selectedMethodId]: true
            }));
          }

          // If this is a variation, find and expand its parent method
          const parentMethod = methods.find(m =>
            m.variations && m.variations.some(v => v.id === selectedMethodId)
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
  const calculateIngredientCompatibility = async () => {
    if (!searchIngredient.trim() || !ingredientService) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get ingredient data
      const ingredientData = await ingredientService.getIngredientByName(searchIngredient);

      if (!ingredientData) {
        setError(`Ingredient '${searchIngredient}' not found`);
        setIsLoading(false);
        return;
      }

      // Calculate compatibility with each cooking method based on elemental properties
      const compatibilityResults: { [key: string]: number } = {};

      for (const method of methods || []) {
        if (method.elementalEffect) {
          try {
            // Mock elemental harmony calculation
            const ingredientProps = ingredientData.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
            const methodProps = method.elementalEffect;

            // Simple compatibility calculation based on elemental similarity
            let harmony = 0;
            Object.keys(ingredientProps).forEach(element => {
              const ingredientValue = ingredientProps[element as keyof typeof ingredientProps] || 0;
              const methodValue = methodProps[element as keyof typeof methodProps] || 0;
              harmony += Math.min(ingredientValue, methodValue);
            });

            compatibilityResults[method.id] = harmony;

            // Also calculate for variations if they exist
            if (method.variations) {
              for (const variation of method.variations) {
                // Use parent method's elemental effect if variation doesn't have one
                const variationElemental = variation.elementalEffect || method.elementalEffect;

                if (variationElemental) {
                  // Simple compatibility calculation for variations
                  let variationHarmony = 0;
                  Object.keys(ingredientProps).forEach(element => {
                    const ingredientValue = ingredientProps[element as keyof typeof ingredientProps] || 0;
                    const variationValue = variationElemental[element as keyof typeof variationElemental] || 0;
                    variationHarmony += Math.min(ingredientValue, variationValue);
                  });

                  compatibilityResults[variation.id] = variationHarmony;
                }
              }
            }
          } catch (err) {
            logger.error(`Error calculating compatibility for method ${method.name}:`, err);
          }
        }
      }

      setIngredientCompatibility(compatibilityResults);
    } catch (err) {
      logger.error('Error calculating ingredient compatibility:', err);
      setError('Error calculating compatibility. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = () => {
    // Only allow toggling if there are more than 5 methods
    if (methods?.length > 5) {
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
    const transformations = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

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

  // Get the alchemical label for a method
  const getAlchemicalLabel = (method: CookingMethod): { primary: string, secondary: string } | null => {
    if (!method.alchemicalProperties) return null;

    const properties = method.alchemicalProperties;
    const sortedProps = Object.entries(properties).sort((a, b) => b[1] - a[1]);

    if ((sortedProps || []).length < 2) return null;

    return {
      primary: sortedProps[0][0],
      secondary: sortedProps[1][0]
    };
  };

  // Get compatibility label for ingredient search
  const getCompatibilityLabel = (score: number): { label: string; className: string } => {
    if (score >= 0.85) return { label: 'Excellent', className: 'excellent' };
    if (score >= 0.7) return { label: 'Good', className: 'good' };
    if (score >= 0.5) return { label: 'FAir', className: 'fAir' };
    if (score >= 0.3) return { label: 'Poor', className: 'poor' };
    return { label: 'Bad', className: 'bad' };
  };

  // Get CSS class based on method score
  const getScoreClass = (score: number): string => {
    if (score >= 0.8) return styles['high-score'];
    if (score >= 0.6) return styles['medium-score'];
    return styles['low-score'];
  };

  // Handle loading state
  if (servicesLoading) {
    return (
      <div className={styles['cooking-methods-container']}>
        <div className={styles['cooking-methods-header']}>
          <h3 className={'title-class'}>
            <Sparkles size={18} className={'titleIcon-class'} />
            <span className={'titleText-class'}>Loading Cooking Methods...</span>
          </h3>
        </div>
        <div className="mt-4 p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError) {
    return (
      <div className={styles['cooking-methods-container']}>
        <div className={styles['cooking-methods-header']}>
          <h3 className={'title-class'}>
            <Sparkles size={18} className={'titleIcon-class'} />
            <span className={'titleText-class'}>Alchemical Cooking Methods</span>
          </h3>
        </div>
        <div className="mt-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
          <p>Error loading cooking methods: {servicesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['cooking-methods-container']}>
      <div
        className={`${styles['cooking-methods-header']} ${!showToggle ? styles['no-toggle'] : ''}`}
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3 className={'title-class'}>
          <Sparkles size={18} className={'titleIcon-class'} />
          <span className={'titleText-class'}>Alchemical Cooking Methods</span>
          <span className={'titleCount-class'}>({methods.length})</span>
        </h3>

        {topMethod && (
          <div className={styles['top-recommendation']}>
            Top: <span>{topMethod.name}</span>
          </div>
        )}

        {/* Add ingredient search toggle button */}
        <button
          className={`${styles['ingredient-search-toggle']} ${showIngredientSearch ? 'active-class' : ''}`}
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
        <div className={styles['ingredient-search']}>
          <div className={styles['search-form']}>
            <div className={styles['search-input-container']}>
              <input
                type="text"
                value={searchIngredient}
                onChange={(e) => setSearchIngredient(e.target.value)}
                placeholder="Enter ingredient name..."
                className={styles['search-input']}
              />
              <button
                onClick={() => calculateIngredientCompatibility()}
                disabled={isLoading || !searchIngredient.trim()}
                className={styles['search-button']}
              >
                {isLoading ? 'Loading...' : 'Calculate Compatibility'}
              </button>
            </div>

            {error && (
              <div className={styles['search-error']}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className={styles['cooking-methods-content']}>
          <div className={styles['methods-grid']}>
            {(displayMethods || []).map((method) => (
              <div
                key={method.id}
                className={`${styles['method-card']} ${selectedMethodId === method.id ? 'selected-class' : ''}`}
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
                {(method.elementalEffect || method.alchemicalProperties) && (
                  <div className={styles['method-elemental']}>
                    <div className={styles['elemental-label']}>Elemental Effects:</div>
                    <div className={styles['elemental-grid']}>
                      {Object.entries(getElementalTransformations(method)).map(([element, value]) => {
                        const { direction, intensity } = getElementalDirection(value);
                        return (
                          <div key={element} className={`${styles['elemental-effect']} ${styles[`effect-${direction}`]}`}>
                            {element === 'Fire' && <Flame size={14} />}
                            {element === 'Water' && <Droplets size={14} />}
                            {element === 'Earth' && <Mountain size={14} />}
                            {element === 'Air' && <Wind size={14} />}
                            <span>{element}</span>
                            {direction !== 'neutral' && (
                              <span className={styles['effect-icon']}>
                                {direction === 'increase' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show alchemical properties if available */}
                {method.alchemicalProperties && (
                  <div className={styles['method-alchemical']}>
                    <div className={styles['alchemical-label']}>Alchemical Properties:</div>
                    <div className={styles['alchemical-badges']}>
                      {getAlchemicalLabel(method) && (
                        <>
                          <div className={styles['alchemical-primary']}>
                            <Zap size={14} />
                            <span>{getAlchemicalLabel(method)?.primary}</span>
                          </div>
                          <div className={styles['alchemical-secondary']}>
                            <Minus size={14} />
                            <span>{getAlchemicalLabel(method)?.secondary}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration information if available */}
                {method.duration && (
                  <div className={styles['method-duration']}>
                    <Clock size={14} />
                    <span>
                      {method.duration.min}
                      {method.duration.max !== method.duration.min && `-${method.duration.max}`} min
                    </span>
                  </div>
                )}

                {/* Cultural origin if available */}
                {method.culturalOrigin && (
                  <div className={styles['method-origin']}>
                    <Globe size={14} />
                    <span>{method.culturalOrigin}</span>
                  </div>
                )}

                {/* Suitable for if available */}
                {method.suitable_for && method.suitable_for.length > 0 && (
                  <div className={styles['method-suitable']}>
                    <ThumbsUp size={14} />
                    <span>Best for: {method.suitable_for.join(', ')}</span>
                  </div>
                )}

                {/* Show variations if expanded */}
                {method.variations && method.variations.length > 0 && expandedMethods[method.id] && (
                  <div className={styles['method-variations']}>
                    <div className={styles['variations-label']}>Variations:</div>
                    <div className={styles['variations-list']}>
                      {method.variations.map(variation => (
                        <div
                          key={variation.id}
                          className={`${styles['variation-item']} ${selectedMethodId === variation.id ? 'selected-class' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMethod && onSelectMethod(variation);
                          }}
                        >
                          <h5 className={styles['variation-name']}>{variation.name}</h5>
                          <p className={styles['variation-description']}>{variation.description}</p>

                          {/* Show ingredient compatibility for variation if available */}
                          {ingredientCompatibility[variation.id] !== undefined && (
                            <div className={`${styles['variation-compatibility']} ${styles[getCompatibilityLabel(ingredientCompatibility[variation.id]).className]}`}>
                              <span>{getCompatibilityLabel(ingredientCompatibility[variation.id]).label} match with {searchIngredient}</span>
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

          {/* Show all/less button */}
          {(methods || []).length > 8 && (
            <div className={styles['methods-footer']}>
              <button
                className={styles['toggle-all-button']}
                onClick={() => setShowAllMethods(!showAllMethods)}
              >
                {showAllMethods ? 'Show Less' : `Show All (${methods.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

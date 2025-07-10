import React, { useState, useEffect } from 'react';
import { Ingredient, RecipeIngredient } from '@/types/alchemy';
import { ChefHat, Info, Clock, Heart, Star, Thermometer, Flame, Droplets, Mountain, Wind, ChevronDown, ChevronUp, Utensils, Globe, Award, Zap, Leaf, Beaker, Sun, Moon, Archive, Sparkles, BookOpen, Scissors } from 'lucide-react';
import { _allIngredients } from '@/data/ingredients/index';
import { 
  normalizeIngredientData, 
  normalizeVitamins, 
  normalizeMinerals, 
  normalizeAntioxidants,
  hasRichNutritionalData,
  normalizeCulinaryApplications,
  normalizeVarieties,
  formatVitaminName,
  formatMineralName
} from '@/utils/ingredientDataNormalizer';
import styles from './IngredientCard.module.css';

interface IngredientCardProps {
  ingredient: Ingredient | RecipeIngredient;
  showAmount?: boolean;
  onClick?: (ingredient: Ingredient | RecipeIngredient) => void;
  initiallyExpanded?: boolean;
  emphasizeCulinary?: boolean;
}

// Enhanced tab types showcasing wealth of culinary database information
type TabType = 'overview' | 'culinary-methods' | 'culinary-traditions' | 'flavors-pairing' | 'preparation' | 'nutrition' | 'astrology' | 'varieties' | 'storage';

// Helper function to check if ingredient is a recipe ingredient
const isRecipeIngredient = (ingredient: Ingredient | RecipeIngredient): ingredient is RecipeIngredient => {
  return 'amount' in ingredient && 'unit' in ingredient;
};

export const IngredientCard: React.FC<IngredientCardProps> = ({ 
  ingredient, 
  showAmount = false,
  onClick,
  initiallyExpanded = false,
  emphasizeCulinary = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [activeTab, setActiveTab] = useState<TabType>(emphasizeCulinary ? 'culinary-methods' : 'overview');

  // Update expansion state when initiallyExpanded prop changes
  useEffect(() => {
    setIsExpanded(initiallyExpanded);
    if (initiallyExpanded && emphasizeCulinary) {
      setActiveTab('culinary-methods');
    }
  }, [initiallyExpanded, emphasizeCulinary]);

  // Helper functions for better match score color contrast
  const getMatchScoreBackground = (score: number): string => {
    const percentage = Math.round(score * 100);
    if (percentage >= 90) return '#10b981'; // Green 500
    if (percentage >= 80) return '#3b82f6'; // Blue 500  
    if (percentage >= 70) return '#f59e0b'; // Amber 500
    if (percentage >= 60) return '#ef4444'; // Red 500
    return '#6b7280'; // Gray 500
  };

  const getMatchScoreTextColor = (score: number): string => {
    return '#ffffff'; // Always white for good contrast on colored backgrounds
  };

  const handleClick = () => {
    // Toggle expansion on card click (unless initially expanded from parent)
    if (!initiallyExpanded) {
      setIsExpanded(!isExpanded);
    }
    
    // Still call the optional onClick prop if provided
    if (onClick) {
      onClick(ingredient);
    }
  };

  // Get rich ingredient data from our database by looking up the ingredient name
  const normalizeIngredientName = (name: string): string => {
    return name.toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  // Try to find the ingredient in our rich database with multiple lookup strategies
  const lookupKey = normalizeIngredientName(ingredient.name);
  const databaseIngredient = allIngredients[lookupKey] || 
                            allIngredients[ingredient.name.toLowerCase()] ||
                            allIngredients[ingredient.name] ||
                            // Try variations for common ingredient patterns
                            allIngredients[ingredient.name.toLowerCase().replace(/\s+/g, '_')] ||
                            // Try finding by category if it's a protein like "beef"
                            Object.values(allIngredients).find(ing => 
                              ing.name?.toLowerCase() === ingredient.name.toLowerCase() ||
                              ing.name?.toLowerCase().includes(ingredient.name.toLowerCase())
                            );

  // Merge the passed ingredient data with the rich database data (database takes precedence)
  const ingredientData = {
    ...ingredient,
    ...(databaseIngredient || {}),
    // Keep the match score and other dynamic properties from the passed ingredient
    matchScore: (ingredient as unknown).matchScore,
    elementalProperties: ingredient.elementalProperties || databaseIngredient?.elementalProperties
  };

  // Determine available tabs - emphasize culinary tabs when requested
  const availableTabs: TabType[] = ['overview'];
  
  // Always show enhanced culinary tabs for richer experience
  availableTabs.push('culinary-methods', 'culinary-traditions', 'flavors-pairing');
  
  const extendedIngredient = ingredientData as unknown;
  
  // Show preparation tab if there's any preparation-related data
  if (extendedIngredient?.preparation || 
      extendedIngredient?.cookingTips || 
      extendedIngredient?.healthProperties ||
      extendedIngredient?.storage) {
    availableTabs.push('preparation');
  }
  
  // Show nutrition tab if there's any nutritional data
  if (extendedIngredient?.nutritionalProfile || 
      extendedIngredient?.healthBenefits || 
      extendedIngredient?.healthProperties ||
      extendedIngredient?.calories ||
      extendedIngredient?.vitamins) {
    availableTabs.push('nutrition');
  }

  // Show astrology tab if there's any astrological data
  if (extendedIngredient?.astrologicalProfile || 
      extendedIngredient?.astrologicalCorrespondence ||
      extendedIngredient?.magicalProperties ||
      extendedIngredient?.lunarPhaseModifiers ||
      extendedIngredient?.rulingPlanets ||
      extendedIngredient?.elementalAffinity) {
    availableTabs.push('astrology');
  }

  // Show varieties tab if there are any varieties (even just 1)
  if (extendedIngredient?.varieties && Object.keys(extendedIngredient.varieties).length > 0) {
    availableTabs.push('varieties');
  }

  // Show storage tab if there's any storage information
  if (extendedIngredient?.storage || 
      extendedIngredient?.preservation ||
      extendedIngredient?.shelf_life ||
      extendedIngredient?.duration) {
    availableTabs.push('storage');
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            {/* Enhanced description with better formatting */}
            {extendedIngredient?.description && (
              <div className="info-section">
                <h4 className="section-title">
                  <Info className="section-icon" />
                  About {ingredient.name}
                </h4>
                <p className="description-text">{extendedIngredient.description}</p>
              </div>
            )}

            {/* Origin and cultural information */}
            {extendedIngredient?.origin && (
              <div className="info-section">
                <h4 className="section-title">
                  <Globe className="section-icon" />
                  Origin
                </h4>
                <div className="origin-info">
                  {Array.isArray(extendedIngredient.origin) ? 
                    extendedIngredient.origin.join(', ') : 
                    extendedIngredient.origin}
                </div>
              </div>
            )}
            
            {/* Enhanced qualities display */}
            {extendedIngredient?.qualities && extendedIngredient.qualities.length > 0 && (
              <div className="info-section">
                <h4 className="section-title">
                  <Award className="section-icon" />
                  Qualities
                </h4>
                <div className="qualities-grid">
                  {extendedIngredient.qualities.map((quality: string, index: number) => (
                    <span key={index} className="quality-badge">{quality}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Facts section */}
            <div className="info-section">
              <h4 className="section-title">
                <Zap className="section-icon" />
                Quick Facts
              </h4>
              <div className="quick-facts">
                {extendedIngredient?.category && (
                  <div className="fact-item">
                    <span className="fact-label">Category:</span>
                    <span className="fact-value">{extendedIngredient.category}</span>
                  </div>
                )}
                {extendedIngredient?.seasonality && (
                  <div className="fact-item">
                    <span className="fact-label">Season:</span>
                    <span className="fact-value">
                      {Array.isArray(extendedIngredient.seasonality) ? 
                        extendedIngredient.seasonality.join(', ') : 
                        extendedIngredient.seasonality}
                    </span>
                  </div>
                )}
                {extendedIngredient?.heatLevel && (
                  <div className="fact-item">
                    <span className="fact-label">Heat Level:</span>
                    <div className="heat-level-display">
                      <div className="heat-dots">
                        {[...Array(10)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`heat-dot ${i < extendedIngredient.heatLevel ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="heat-value">{extendedIngredient.heatLevel}/10</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced varieties with better layout */}
            {extendedIngredient?.varieties && Object.keys(extendedIngredient.varieties).length > 0 && (
              <div className="info-section">
                <h4 className="section-title">
                  <Leaf className="section-icon" />
                  Varieties
                </h4>
                <div className="varieties-grid">
                  {Object.entries(extendedIngredient.varieties).slice(0, 3).map(([variety, data]: [string, any]) => (
                    <div key={variety} className="variety-card">
                      <h5 className="variety-name">{variety}</h5>
                      {data.flavor && <div className="variety-detail"><strong>Flavor:</strong> {data.flavor}</div>}
                      {data.best_uses && (
                        <div className="variety-uses">
                          {Array.isArray(data.best_uses) ? data.best_uses.slice(0, 2).map((use: string, index: number) => (
                            <span key={index} className="use-tag">{use}</span>
                          )) : <span className="use-tag">{data.best_uses}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'culinary-methods':
        return (
          <div className="tab-content">
            {/* Enhanced culinary applications */}
            {extendedIngredient?.culinaryApplications && (
              <div className="info-section">
                <h4 className="section-title">
                  <ChefHat className="section-icon" />
                  Cooking Methods & Applications
                </h4>
                <div className="culinary-methods">
                  {Object.entries(extendedIngredient.culinaryApplications).map(([method, data]: [string, any]) => (
                    <div key={method} className="culinary-method-card">
                      <h5 className="method-name">{method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                      {data.notes && (
                        <div className="method-notes">
                          {Array.isArray(data.notes) ? data.notes.slice(0, 3).map((note: string, index: number) => (
                            <p key={index} className="note">• {note}</p>
                          )) : <p className="note">• {data.notes}</p>}
                        </div>
                      )}
                      {data.dishes && (
                        <div className="method-dishes">
                          <strong>Perfect for:</strong>
                          <div className="dishes-grid">
                            {Array.isArray(data.dishes) ? data.dishes.slice(0, 4).map((dish: string, index: number) => (
                              <span key={index} className="dish-tag">{dish}</span>
                            )) : <span className="dish-tag">{data.dishes}</span>}
                          </div>
                        </div>
                      )}
                      {data.temperature && (
                        <div className="method-temp">
                          <strong>Temperature:</strong> {
                            typeof data.temperature === 'object' && data.temperature?.fahrenheit && data.temperature?.celsius
                              ? `${data.temperature.fahrenheit}°F (${data.temperature.celsius}°C)`
                              : data.temperature
                          }
                        </div>
                      )}
                      {data.timing && (
                        <div className="method-timing">
                          <strong>Timing:</strong> {
                            typeof data.timing === 'object' && data.timing !== null
                              ? JSON.stringify(data.timing)
                              : data.timing
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic culinary info - always show if no detailed applications */}
            {!extendedIngredient?.culinaryApplications && (
              <div className="info-section">
                <h4 className="section-title">
                  <ChefHat className="section-icon" />
                  Culinary Information
                </h4>
                <div className="basic-culinary-info">
                  {extendedIngredient?.category && (
                    <div className="culinary-detail">
                      <strong>Category:</strong> {extendedIngredient.category}
                    </div>
                  )}
                  {extendedIngredient?.subCategory && (
                    <div className="culinary-detail">
                      <strong>Type:</strong> {extendedIngredient.subCategory}
                    </div>
                  )}
                  {extendedIngredient?.qualities && extendedIngredient.qualities.length > 0 && (
                    <div className="culinary-detail">
                      <strong>Qualities:</strong> {extendedIngredient.qualities.join(', ')}
                    </div>
                  )}
                  <div className="culinary-detail">
                    <strong>Usage:</strong> This ingredient can be used in a variety of culinary applications. 
                    Experiment with different cooking methods to discover its full potential.
                  </div>
                </div>
              </div>
            )}

            {/* Smoke point for oils */}
            {extendedIngredient?.smokePoint && (
              <div className="info-section">
                <h4 className="section-title">
                  <Flame className="section-icon" />
                  Smoke Point & Cooking Guidelines
                </h4>
                <div className="smoke-point-display">
                  <div className="temperature-reading">
                    <span className="temp-value">{extendedIngredient.smokePoint.fahrenheit}°F</span>
                    <span className="temp-celsius">({extendedIngredient.smokePoint.celsius}°C)</span>
                  </div>
                  <p className="smoke-point-note">Best for cooking methods below this temperature</p>
                  <div className="cooking-recommendations">
                    <div className="cooking-method-rec">
                      <strong>Suitable:</strong> Sautéing, light frying, baking
                    </div>
                    <div className="cooking-method-rec">
                      <strong>Avoid:</strong> High-heat deep frying if temperature exceeds smoke point
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preparation techniques */}
            <div className="info-section">
              <h4 className="section-title">
                <Scissors className="section-icon" />
                Preparation Techniques
              </h4>
              <div className="prep-techniques">
                <div className="prep-method">
                  <strong>Fresh:</strong> Use immediately for best flavor and nutritional value
                </div>
                <div className="prep-method">
                  <strong>Chopping:</strong> Cut to desired size based on cooking method and dish requirements
                </div>
                <div className="prep-method">
                  <strong>Storage prep:</strong> Clean and dry thoroughly before storing
                </div>
              </div>
            </div>
          </div>
        );

      case 'culinary-traditions':
        return (
          <div className="tab-content">
            {/* Regional uses */}
            {extendedIngredient?.regionalUses && (
              <div className="info-section">
                <h4 className="section-title">
                  <Globe className="section-icon" />
                  Regional Culinary Traditions
                </h4>
                <div className="regional-uses">
                  {Object.entries(extendedIngredient.regionalUses).map(([region, use]: [string, any]) => (
                    <div key={region} className="regional-card">
                      <h5 className="region-name">{region}</h5>
                      <p className="region-use">{use}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural significance */}
            <div className="info-section">
              <h4 className="section-title">
                <BookOpen className="section-icon" />
                Cultural & Historical Uses
              </h4>
              <div className="cultural-info">
                {extendedIngredient?.origin && (
                  <div className="cultural-section">
                    <h5>Historical Origins</h5>
                    <p>Originally cultivated in {Array.isArray(extendedIngredient.origin) ? 
                      extendedIngredient.origin.join(' and ') : extendedIngredient.origin}, 
                      this ingredient has been prized for centuries for its unique properties.</p>
                  </div>
                )}
                
                <div className="cultural-section">
                  <h5>Traditional Applications</h5>
                  <div className="traditional-uses">
                    <div className="tradition-item">🍽️ Culinary traditions across different cultures</div>
                    <div className="tradition-item">🌿 Traditional medicine and wellness practices</div>
                    <div className="tradition-item">🎭 Ceremonial and festive preparations</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seasonal and festival uses */}
            <div className="info-section">
              <h4 className="section-title">
                <Star className="section-icon" />
                Seasonal & Festival Cooking
              </h4>
              <div className="seasonal-cooking">
                {extendedIngredient?.seasonality && (
                  <div className="seasonal-info">
                    <h5>Peak Season</h5>
                    <p>Best enjoyed during {Array.isArray(extendedIngredient.seasonality) ? 
                      extendedIngredient.seasonality.join(', ') : extendedIngredient.seasonality} 
                      when flavors are at their most vibrant.</p>
                  </div>
                )}
                
                <div className="festival-uses">
                  <h5>Festival & Holiday Traditions</h5>
                  <div className="festival-list">
                    <div className="festival-item">🎃 Harvest celebrations and autumn dishes</div>
                    <div className="festival-item">🎄 Winter solstice and warming preparations</div>
                    <div className="festival-item">🌸 Spring festivals and renewal cuisines</div>
                    <div className="festival-item">☀️ Summer gatherings and cooling preparations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'flavors-pairing':
        return (
          <div className="tab-content">
            {/* Enhanced pairings */}
            {extendedIngredient?.pairings && extendedIngredient.pairings.length > 0 && (
              <div className="info-section">
                <h4 className="section-title">
                  <Heart className="section-icon" />
                  Perfect Flavor Pairings
                </h4>
                <div className="pairings-grid">
                  {extendedIngredient.pairings.map((pairing: string, index: number) => (
                    <span key={index} className="pairing-badge">{pairing.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor profile analysis */}
            <div className="info-section">
              <h4 className="section-title">
                <Beaker className="section-icon" />
                Flavor Profile Analysis
              </h4>
              <div className="flavor-analysis">
                {extendedIngredient?.flavorProfile ? (
                  <div className="flavor-wheel">
                    {Object.entries(extendedIngredient.flavorProfile).map(([flavor, intensity]: [string, any]) => (
                      <div key={flavor} className="flavor-component">
                        <span className="flavor-name">{flavor.charAt(0).toUpperCase() + flavor.slice(1)}</span>
                        <div className="flavor-bar">
                          <div 
                            className="flavor-fill"
                            style={{ width: `${Math.min(100, Number(intensity) * 100)}%` }}
                          />
                        </div>
                        <span className="flavor-value">{Math.round(Number(intensity) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="default-flavor-info">
                    <p>This ingredient contributes unique flavors and aromas to dishes. The flavor profile varies based on preparation method, freshness, and cooking technique.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Complementary ingredients by category */}
            <div className="info-section">
              <h4 className="section-title">
                <Utensils className="section-icon" />
                Ingredient Harmony Guide
              </h4>
              <div className="harmony-guide">
                <div className="harmony-category">
                  <h5>🌿 Herbs & Aromatics</h5>
                  <p>Pairs beautifully with fresh herbs that complement its natural character</p>
                </div>
                <div className="harmony-category">
                  <h5>🥄 Spices & Seasonings</h5>
                  <p>Enhanced by warm spices and carefully balanced seasonings</p>
                </div>
                <div className="harmony-category">
                  <h5>🍋 Acids & Brightness</h5>
                  <p>Benefits from acidic ingredients that brighten and balance flavors</p>
                </div>
                <div className="harmony-category">
                  <h5>🧈 Fats & Richness</h5>
                  <p>Combines well with oils and fats that carry and enhance flavors</p>
                </div>
              </div>
            </div>

            {/* Elemental flavor connections */}
            <div className="info-section">
              <h4 className="section-title">
                <Wind className="section-icon" />
                Elemental Flavor Connections
              </h4>
              <div className="elemental-flavors">
                {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => {
                  const flavorNotes = {
                    Fire: "Warming, stimulating, energizing - brings heat and intensity",
                    Water: "Cooling, soothing, flowing - provides moisture and gentle flavors", 
                    Earth: "Grounding, nourishing, substantial - offers depth and richness",
                    Air: "Light, aromatic, uplifting - contributes bright and fresh notes"
                  };
                  
                  const icons = {
                    Fire: <Flame size={12} style={{ color: '#ef4444' }} />,
                    Water: <Droplets size={12} style={{ color: '#3b82f6' }} />,
                    Earth: <Mountain size={12} style={{ color: '#22c55e' }} />,
                    Air: <Wind size={12} style={{ color: '#a855f7' }} />
                  };
                  
                  return (
                    <div key={element} className="elemental-flavor">
                      <div className="element-header">
                        {icons[element as keyof typeof icons] ?? null}
                        <span className="element-name">{element}</span>
                        <span className="element-percentage">{Math.round(Number(value) * 100)}%</span>
                      </div>
                      <p className="element-flavor-note">{flavorNotes[element as keyof typeof flavorNotes]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'preparation':
        return (
          <div className="tab-content">
            {/* Storage information */}
            {extendedIngredient?.storage && (
              <div className="info-section">
                <h4 className="section-title">
                  <Thermometer className="section-icon" />
                  Storage
                </h4>
                <div className="storage-info">
                  {typeof extendedIngredient.storage === 'object' ? (
                    Object.entries(extendedIngredient.storage).map(([key, value]: [string, any]) => (
                      <div key={key} className="storage-detail">
                        <span className="storage-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                        <span className="storage-value">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                      </div>
                    ))
                  ) : (
                    <p>{extendedIngredient.storage}</p>
                  )}
                </div>
              </div>
            )}

            {/* Health properties */}
            {extendedIngredient?.healthProperties && (
              <div className="info-section">
                <h4 className="section-title">
                  <Heart className="section-icon" />
                  Health Properties
                </h4>
                <div className="health-properties">
                  {extendedIngredient.healthProperties.benefits && (
                    <div className="health-section">
                      <h5 className="health-subtitle">Benefits</h5>
                      <div className="health-list">
                        {Array.isArray(extendedIngredient.healthProperties.benefits) ? 
                          extendedIngredient.healthProperties.benefits.slice(0, 4).map((benefit: string, index: number) => (
                            <div key={index} className="health-item">• {benefit}</div>
                          )) : 
                          <div className="health-item">{extendedIngredient.healthProperties.benefits}</div>
                        }
                      </div>
                    </div>
                  )}
                  {extendedIngredient.healthProperties.cautions && (
                    <div className="health-section">
                      <h5 className="health-subtitle cautions">Cautions</h5>
                      <div className="health-list">
                        {Array.isArray(extendedIngredient.healthProperties.cautions) ? 
                          extendedIngredient.healthProperties.cautions.slice(0, 2).map((caution: string, index: number) => (
                            <div key={index} className="health-item caution">⚠️ {caution}</div>
                          )) : 
                          <div className="health-item caution">⚠️ {extendedIngredient.healthProperties.cautions}</div>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preparation methods */}
            {extendedIngredient?.preparation && (
              <div className="info-section">
                <h4 className="section-title">
                  <Utensils className="section-icon" />
                  Preparation
                </h4>
                <div className="preparation-methods">
                  {Object.entries(extendedIngredient.preparation).map(([method, data]: [string, any]) => (
                    <div key={method} className="prep-method">
                      <h5 className="prep-name">{method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                      {data.duration && <div className="prep-detail"><strong>Duration:</strong> {data.duration}</div>}
                      {data.tips && Array.isArray(data.tips) && (
                        <div className="prep-tips">
                          {data.tips.slice(0, 2).map((tip: string, index: number) => (
                            <div key={index} className="tip-item">💡 {tip}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'nutrition':
        return (
          <div className="tab-content">
            {/* Enhanced nutritional profile */}
            {extendedIngredient?.nutritionalProfile && (
              <div className="info-section">
                <h4 className="section-title">
                  <Heart className="section-icon" />
                  Nutrition Facts
                </h4>
                <div className="nutrition-grid">
                  {extendedIngredient.nutritionalProfile.serving_size && (
                    <div className="nutrition-item serving-size">
                      <span className="nutrition-label">Serving Size</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.serving_size}</span>
                    </div>
                  )}
                  {extendedIngredient.nutritionalProfile.calories && (
                    <div className="nutrition-item calories">
                      <span className="nutrition-label">Calories</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.calories}</span>
                    </div>
                  )}
                  {extendedIngredient.nutritionalProfile.fat_g && (
                    <div className="nutrition-item">
                      <span className="nutrition-label">Total Fat</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.fat_g}g</span>
                    </div>
                  )}
                  {extendedIngredient.nutritionalProfile.carbs_g && (
                    <div className="nutrition-item">
                      <span className="nutrition-label">Carbs</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.carbs_g}g</span>
                    </div>
                  )}
                  {extendedIngredient.nutritionalProfile.protein_g && (
                    <div className="nutrition-item">
                      <span className="nutrition-label">Protein</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.protein_g}g</span>
                    </div>
                  )}
                  {extendedIngredient.nutritionalProfile.fiber_g && (
                    <div className="nutrition-item">
                      <span className="nutrition-label">Fiber</span>
                      <span className="nutrition-value">{extendedIngredient.nutritionalProfile.fiber_g}g</span>
                    </div>
                  )}
                </div>

                {/* Vitamins and minerals with safe normalization */}
                {extendedIngredient.nutritionalProfile.vitamins && (
                  <div className="vitamins-section">
                    <h5 className="nutrition-subtitle">Key Vitamins</h5>
                    <div className="vitamin-tags">
                      {normalizeVitamins(extendedIngredient.nutritionalProfile.vitamins).map((vitamin, index) => (
                        <span key={index} className="vitamin-tag">
                          {formatVitaminName(vitamin.name)}
                          {vitamin.value && <span className="vitamin-value"> ({vitamin.value}{vitamin.unit})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {extendedIngredient.nutritionalProfile.minerals && (
                  <div className="minerals-section">
                    <h5 className="nutrition-subtitle">Essential Minerals</h5>
                    <div className="mineral-tags">
                      {normalizeMinerals(extendedIngredient.nutritionalProfile.minerals).map((mineral, index) => (
                        <span key={index} className="mineral-tag">
                          {formatMineralName(mineral.name)}
                          {mineral.value && <span className="mineral-value"> ({mineral.value}{mineral.unit})</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Antioxidants section */}
                {extendedIngredient.nutritionalProfile.antioxidants && (
                  <div className="antioxidants-section">
                    <h5 className="nutrition-subtitle">Antioxidants</h5>
                    <div className="antioxidant-tags">
                      {normalizeAntioxidants(extendedIngredient.nutritionalProfile.antioxidants).map((antioxidant, index) => (
                        <span key={index} className="antioxidant-tag">{antioxidant}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Health benefits */}
            {extendedIngredient?.healthBenefits && (
              <div className="info-section">
                <h4 className="section-title">
                  <Award className="section-icon" />
                  Health Benefits
                </h4>
                <div className="health-benefits">
                  {Object.entries(extendedIngredient.healthBenefits).map(([category, benefit]: [string, any]) => (
                    <div key={category} className="benefit-item">
                      <span className="benefit-category">{category.replace(/\b\w/g, l => l.toUpperCase())}:</span>
                      <span className="benefit-description">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic nutrition info - always show if no detailed profile */}
            {!extendedIngredient?.nutritionalProfile && !extendedIngredient?.healthBenefits && (
              <div className="info-section">
                <h4 className="section-title">
                  <Heart className="section-icon" />
                  Nutritional Information
                </h4>
                <div className="basic-nutrition-info">
                  <div className="nutrition-note">
                    This ingredient provides unique culinary and health benefits as part of a balanced diet.
                    {extendedIngredient?.category && (
                      <span> As a {extendedIngredient.category}, it contributes valuable nutrients and flavor to your meals.</span>
                    )}
                  </div>
                  {extendedIngredient?.qualities && extendedIngredient.qualities.length > 0 && (
                    <div className="nutrition-qualities">
                      <strong>Key Qualities:</strong>
                      <div className="quality-tags">
                        {extendedIngredient.qualities.map((quality: string, index: number) => (
                          <span key={index} className="quality-tag">{quality}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!extendedIngredient?.qualities && (
                    <div className="nutrition-general">
                      <div className="general-benefit">
                        <strong>Nutritional Value:</strong> This ingredient contributes to a well-rounded diet with its unique properties and flavor profile.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Always show elemental nutrition connection */}
            {ingredient.elementalProperties && (
              <div className="info-section">
                <h4 className="section-title">
                  <Zap className="section-icon" />
                  Energetic Properties
                </h4>
                <div className="elemental-nutrition">
                  <div className="elemental-grid">
                    {Object.entries(ingredient.elementalProperties).map(([element, value]) => {
                      const elementInfo = {
                        Fire: { color: '#ef4444', benefit: 'Warming, energizing, aids metabolism' },
                        Water: { color: '#3b82f6', benefit: 'Cooling, hydrating, supports circulation' },
                        Earth: { color: '#22c55e', benefit: 'Grounding, nourishing, builds strength' },
                        Air: { color: '#a855f7', benefit: 'Lightening, clarifying, aids digestion' }
                      };
                      
                      const icons = {
                        Fire: <Flame size={12} style={{ color: '#ef4444' }} />,
                        Water: <Droplets size={12} style={{ color: '#3b82f6' }} />,
                        Earth: <Mountain size={12} style={{ color: '#22c55e' }} />,
                        Air: <Wind size={12} style={{ color: '#a855f7' }} />
                      };
                      
                      return (
                        <div key={element} className="elemental-nutrition-item">
                          <div className="element-header">
                            <span className="element-name" style={{ color: elementInfo[element as keyof typeof elementInfo]?.color }}>
                              {element}
                            </span>
                            <span className="element-percentage">{Math.round((Number(value) || 0) * 100)}%</span>
                          </div>
                          <div className="element-benefit">
                            {elementInfo[element as keyof typeof elementInfo]?.benefit}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'astrology':
        return (
          <div className="tab-content">
            {/* Astrological correspondences */}
            {extendedIngredient?.astrologicalProfile && (
              <div className="info-section">
                <h4 className="section-title">
                  <Sun className="section-icon" />
                  Planetary Rulers
                </h4>
                <div className="planetary-info">
                  {extendedIngredient.astrologicalProfile.rulingPlanets && (
                    <div className="planetary-rulers">
                      {extendedIngredient.astrologicalProfile.rulingPlanets.map((planet: string, index: number) => (
                        <span key={index} className="planet-badge">{planet}</span>
                      ))}
                    </div>
                  )}
                  {extendedIngredient.astrologicalProfile.favorableZodiac && (
                    <div className="zodiac-section">
                      <h5 className="astro-subtitle">Favorable Signs</h5>
                      <div className="zodiac-signs">
                        {extendedIngredient.astrologicalProfile.favorableZodiac.map((sign: string, index: number) => (
                          <span key={index} className="zodiac-badge">{sign.charAt(0).toUpperCase() + sign.slice(1)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lunar phase modifiers */}
            {extendedIngredient?.lunarPhaseModifiers && (
              <div className="info-section">
                <h4 className="section-title">
                  <Moon className="section-icon" />
                  Lunar Influences
                </h4>
                <div className="lunar-phases">
                  {Object.entries(extendedIngredient.lunarPhaseModifiers).slice(0, 3).map(([phase, data]: [string, any]) => (
                    <div key={phase} className="lunar-phase-card">
                      <h5 className="phase-name">{phase.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h5>
                      {data.preparationTips && Array.isArray(data.preparationTips) && (
                        <div className="phase-tips">
                          {data.preparationTips.slice(0, 2).map((tip: string, index: number) => (
                            <div key={index} className="lunar-tip">🌙 {tip}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Magical properties */}
            {extendedIngredient?.magicalProperties && (
              <div className="info-section">
                <h4 className="section-title">
                  <Beaker className="section-icon" />
                  Magical Correspondences
                </h4>
                <div className="magical-info">
                  {extendedIngredient.magicalProperties.correspondences && (
                    <div className="correspondences">
                      <h5 className="magical-subtitle">Correspondences</h5>
                      <div className="correspondence-tags">
                        {extendedIngredient.magicalProperties.correspondences.slice(0, 6).map((corr: string, index: number) => (
                          <span key={index} className="correspondence-tag">{corr}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {extendedIngredient.magicalProperties.uses && (
                    <div className="magical-uses">
                      <h5 className="magical-subtitle">Traditional Uses</h5>
                      <div className="magical-use-list">
                        {extendedIngredient.magicalProperties.uses.slice(0, 3).map((use: string, index: number) => (
                          <div key={index} className="magical-use">✨ {use}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Always show elemental info if no detailed astrology */}
            {!extendedIngredient?.astrologicalProfile && !extendedIngredient?.lunarPhaseModifiers && !extendedIngredient?.magicalProperties && (
              <div className="info-section">
                <h4 className="section-title">
                  <Sparkles className="section-icon" />
                  Elemental Properties
                </h4>
                <div className="basic-astrology-info">
                  {ingredient.elementalProperties && (
                    <div className="elemental-breakdown">
                      <div className="elemental-grid">
                        {Object.entries(ingredient.elementalProperties).map(([element, value]) => {
                          const elementDescriptions = {
                            Fire: 'Associated with energy, transformation, and warming qualities',
                            Water: 'Connected to emotion, intuition, and cooling properties',
                            Earth: 'Linked to grounding, stability, and nourishing aspects',
                            Air: 'Related to communication, intellect, and lightening effects'
                          };
                          
                          const icons = {
                            Fire: <Flame size={12} style={{ color: '#ef4444' }} />,
                            Water: <Droplets size={12} style={{ color: '#3b82f6' }} />,
                            Earth: <Mountain size={12} style={{ color: '#22c55e' }} />,
                            Air: <Wind size={12} style={{ color: '#a855f7' }} />
                          };
                          
                          return (
                            <div key={element} className="elemental-item-detailed">
                              <div className="element-header">
                                <span className="element-name">{element}</span>
                                <span className="element-value">{Math.round((Number(value) || 0) * 100)}%</span>
                              </div>
                              <div className="element-description">
                                {elementDescriptions[element as keyof typeof elementDescriptions]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="astrology-note">
                    This ingredient's elemental balance influences its culinary applications and energetic properties.
                    The dominant elements suggest how it might best be used in cooking and its effects on the body.
                  </div>
                </div>
              </div>
            )}

            {/* Always show general astrological connections */}
            <div className="info-section">
              <h4 className="section-title">
                <Sun className="section-icon" />
                General Correspondences
              </h4>
              <div className="general-astrology">
                {extendedIngredient?.category && (
                  <div className="astro-category">
                    <strong>Category:</strong> {extendedIngredient.category} ingredients are traditionally associated with 
                    {extendedIngredient.category === 'spice' && ' Mars and fire energy, bringing warmth and stimulation'}
                    {extendedIngredient.category === 'herb' && ' Mercury and air energy, supporting communication and healing'}
                    {extendedIngredient.category === 'vegetable' && ' Earth energy, providing grounding and nourishment'}
                    {extendedIngredient.category === 'fruit' && ' Venus and water energy, bringing sweetness and harmony'}
                    {extendedIngredient.category === 'oil' && ' Venus and earth energy, providing richness and stability'}
                    {extendedIngredient.category === 'grain' && ' Ceres and earth energy, offering sustenance and abundance'}
                    {!['spice', 'herb', 'vegetable', 'fruit', 'oil', 'grain'].includes(extendedIngredient.category) && ' nourishing and balancing energies'}
                    .
                  </div>
                )}
                <div className="seasonal-note">
                  {extendedIngredient?.seasonality && Array.isArray(extendedIngredient.seasonality) && (
                    <div><strong>Seasonal Harmony:</strong> Best used during {extendedIngredient.seasonality.join(', ')} for optimal energetic alignment.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'varieties':
        return (
          <div className="tab-content">
            {/* Detailed varieties information */}
            {extendedIngredient?.varieties && (
              <div className="info-section">
                <h4 className="section-title">
                  <Leaf className="section-icon" />
                  Available Varieties
                </h4>
                <div className="varieties-detailed">
                  {Object.entries(extendedIngredient.varieties).map(([variety, data]: [string, any]) => (
                    <div key={variety} className="variety-detailed-card">
                      <h5 className="variety-detailed-name">{variety}</h5>
                      
                      {data.appearance && (
                        <div className="variety-detail">
                          <strong>Appearance:</strong> {data.appearance}
                        </div>
                      )}
                      
                      {data.flavor && (
                        <div className="variety-detail">
                          <strong>Flavor Profile:</strong> {data.flavor}
                        </div>
                      )}
                      
                      {data.texture && (
                        <div className="variety-detail">
                          <strong>Texture:</strong> {data.texture}
                        </div>
                      )}
                      
                      {data.best_uses && (
                        <div className="variety-uses-detailed">
                          <strong>Best Uses:</strong>
                          <div className="use-tags-detailed">
                            {Array.isArray(data.best_uses) ? 
                              data.best_uses.map((use: string, index: number) => (
                                <span key={index} className="use-tag-detailed">{use}</span>
                              )) : 
                              <span className="use-tag-detailed">{data.best_uses}</span>
                            }
                          </div>
                        </div>
                      )}
                      
                      {data.notes && (
                        <div className="variety-notes">
                          <em>{data.notes}</em>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'storage':
        return (
          <div className="tab-content">
            {/* Comprehensive storage information */}
            {extendedIngredient?.storage && (
              <div className="info-section">
                <h4 className="section-title">
                  <Thermometer className="section-icon" />
                  Storage Guidelines
                </h4>
                <div className="storage-comprehensive">
                  {typeof extendedIngredient.storage === 'object' ? (
                    Object.entries(extendedIngredient.storage).map(([method, data]: [string, any]) => (
                      <div key={method} className="storage-method-card">
                        <h5 className="storage-method-name">
                          {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h5>
                        
                        {typeof data === 'object' ? (
                          <div className="storage-details">
                            {data.temperature && (
                              <div className="storage-detail">
                                <strong>Temperature:</strong> {
                                  typeof data.temperature === 'object' && data.temperature?.fahrenheit && data.temperature?.celsius
                                    ? `${data.temperature.fahrenheit}°F (${data.temperature.celsius}°C)`
                                    : data.temperature
                                }
                              </div>
                            )}
                            {data.duration && (
                              <div className="storage-detail">
                                <strong>Duration:</strong> {data.duration}
                              </div>
                            )}
                            {data.humidity && (
                              <div className="storage-detail">
                                <strong>Humidity:</strong> {data.humidity}
                              </div>
                            )}
                            {data.container && (
                              <div className="storage-detail">
                                <strong>Container:</strong> {data.container}
                              </div>
                            )}
                            {data.notes && (
                              <div className="storage-notes">
                                <em>{data.notes}</em>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="storage-simple">{data}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="storage-simple">{extendedIngredient.storage}</div>
                  )}
                </div>
              </div>
            )}

            {/* Shelf life and preservation */}
            {(extendedIngredient?.shelf_life || extendedIngredient?.preservation) && (
              <div className="info-section">
                <h4 className="section-title">
                  <Clock className="section-icon" />
                  Preservation & Shelf Life
                </h4>
                <div className="preservation-info">
                  {extendedIngredient.shelf_life && (
                    <div className="shelf-life">
                      <strong>Shelf Life:</strong> {extendedIngredient.shelf_life}
                    </div>
                  )}
                  {extendedIngredient.preservation && (
                    <div className="preservation-methods">
                      <strong>Preservation Methods:</strong>
                      {Array.isArray(extendedIngredient.preservation) ? 
                        extendedIngredient.preservation.join(', ') : 
                        extendedIngredient.preservation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General storage advice - always show */}
            <div className="info-section">
              <h4 className="section-title">
                <Archive className="section-icon" />
                {extendedIngredient?.storage ? 'Additional Tips' : 'General Storage Guidelines'}
              </h4>
              <div className="general-storage">
                <div className="storage-category-advice">
                  {extendedIngredient?.category === 'spice' && (
                    <div className="category-storage">
                      <strong>Spice Storage:</strong> Store in airtight containers away from light, heat, and moisture. 
                      Ground spices typically last 1-3 years, whole spices 2-4 years.
                    </div>
                  )}
                  {extendedIngredient?.category === 'herb' && (
                    <div className="category-storage">
                      <strong>Herb Storage:</strong> Fresh herbs should be refrigerated and used within a week. 
                      Dried herbs keep best in cool, dark places for 1-3 years.
                    </div>
                  )}
                  {extendedIngredient?.category === 'vegetable' && (
                    <div className="category-storage">
                      <strong>Vegetable Storage:</strong> Most vegetables benefit from refrigeration with proper humidity. 
                      Root vegetables often store well in cool, dark places.
                    </div>
                  )}
                  {extendedIngredient?.category === 'fruit' && (
                    <div className="category-storage">
                      <strong>Fruit Storage:</strong> Some fruits ripen at room temperature, then refrigerate. 
                      Others are best kept cool from the start. Check ripeness regularly.
                    </div>
                  )}
                  {extendedIngredient?.category === 'oil' && (
                    <div className="category-storage">
                      <strong>Oil Storage:</strong> Store in cool, dark places in tightly sealed containers. 
                      Some oils benefit from refrigeration after opening.
                    </div>
                  )}
                  {extendedIngredient?.category === 'grain' && (
                    <div className="category-storage">
                      <strong>Grain Storage:</strong> Store in airtight containers in cool, dry places. 
                      Whole grains have shorter shelf life than refined grains due to natural oils.
                    </div>
                  )}
                  {!['spice', 'herb', 'vegetable', 'fruit', 'oil', 'grain'].includes(extendedIngredient?.category || '') && (
                    <div className="category-storage">
                      <strong>General Storage:</strong> Keep in a cool, dry place away from direct sunlight. 
                      Use airtight containers when possible to maintain freshness and prevent contamination.
                    </div>
                  )}
                </div>
                
                <div className="storage-tips">
                  <h5>Storage Tips:</h5>
                  <div className="tip-list">
                    <div className="storage-tip">🌡️ Keep away from heat sources like stoves and direct sunlight</div>
                    <div className="storage-tip">💧 Maintain proper humidity levels to prevent spoilage</div>
                    <div className="storage-tip">🔒 Use airtight containers to preserve freshness and flavor</div>
                    <div className="storage-tip">📅 Label with dates to track freshness and rotation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.ingredientCard} onClick={handleClick}>
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 className={styles.cardTitle}>{ingredient.name}</h3>
          </div>
          
          {extendedIngredient?.category && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.875rem'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {extendedIngredient.category}
              </span>
              {extendedIngredient?.subCategory && (
                <span style={{
                  color: '#374151',
                  fontWeight: 500
                }}>
                  · {extendedIngredient.subCategory}
                </span>
              )}
              
              {/* Expansion indicator */}
              <div style={{ marginLeft: 'auto', color: '#6b7280' }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>
                  {isExpanded ? 'Less' : 'More'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced amount display for recipe ingredients */}
      {showAmount && isRecipeIngredient(ingredient) && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '8px 12px',
          margin: '8px 0'
        }}>
          <span style={{
            fontWeight: 600,
            color: '#0c4a6e',
            fontSize: '0.9rem'
          }}>
            {ingredient.amount} {ingredient.unit}
            {ingredient.preparation && (
              <span style={{
                fontWeight: 400,
                color: '#0369a1',
                fontStyle: 'italic'
              }}> ({ingredient.preparation as any})</span>
            )}
          </span>
        </div>
      )}

      {/* Compact elemental properties in collapsed view */}
      {!isExpanded && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => {
            const icons = {
              Fire: <Flame size={12} style={{ color: '#ef4444' }} />,
              Water: <Droplets size={12} style={{ color: '#3b82f6' }} />,
              Earth: <Mountain size={12} style={{ color: '#22c55e' }} />,
              Air: <Wind size={12} style={{ color: '#a855f7' }} />
            };
            
            return (
              <div key={element} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {icons[element as keyof typeof icons] ?? null}
                <span style={{ color: '#64748b' }}>
                  {Math.round((Number(value) || 0) * 100)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Enhanced expanded view */}
      {isExpanded && (
        <>
          {/* Tab navigation */}
          <div className={styles.tabNavigation}>
            {availableTabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab);
                }}
              >
                {tab === 'overview' && <Info size={14} className={styles.sectionIcon} />}
                {tab === 'culinary-methods' && <ChefHat size={14} className={styles.sectionIcon} />}
                {tab === 'culinary-traditions' && <BookOpen size={14} className={styles.sectionIcon} />}
                {tab === 'flavors-pairing' && <Heart size={14} className={styles.sectionIcon} />}
                {tab === 'preparation' && <Clock size={14} className={styles.sectionIcon} />}
                {tab === 'nutrition' && <Heart size={14} className={styles.sectionIcon} />}
                {tab === 'astrology' && <Sparkles size={14} className={styles.sectionIcon} />}
                {tab === 'varieties' && <Leaf size={14} className={styles.sectionIcon} />}
                {tab === 'storage' && <Thermometer size={14} className={styles.sectionIcon} />}
                <span>{tab.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className={styles.tabContent}>
            {renderTabContent()}
          </div>
        </>
      )}

    </div>
  );
}; 
import React, { useEffect, useState, useRef } from 'react';
import @/hooks  from 'useAstrologicalState ';
import @/data  from 'cooking ';
import @/utils  from 'cookingMethodRecommender ';
import { ChevronDown, ChevronUp, Flame, Droplets, Wind, Mountain, Info } from 'lucide-react';
import styles from './CookingMethods.module.css';
import @/utils  from 'cookingMethodTips ';

// Define proper types for the methods with scores
interface CookingMethodWithScore {
  id: string;
  name: string;
  description: string;
  score: number;
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
  astrologicalInfluences?: {
    favorableZodiac?: string[];
    unfavorableZodiac?: string[];
    dominantPlanets?: string[];
  };
  toolsRequired?: string[];
}

export default function MethodsRecommender() {
  // Use the hook to get consistent planetary data
  const { currentPlanetaryAlignment, loading } = useAstrologicalState();
  const [methods, setMethods] = useState<CookingMethodWithScore[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  
  // Add a ref to store the initial scores so they don't change
  let methodScoresRef = useRef<Record<string, number>>({});
  
  // Calculate method scores using the imported function from cookingMethodRecommender.ts
  useEffect(() => {
    if (!loading && currentPlanetaryAlignment) {
      // Convert currentPlanetaryAlignment to AstrologicalState format
      let astroState = {
        zodiacSign: currentPlanetaryAlignment.sun?.sign || 'Aries',
        lunarPhase: currentPlanetaryAlignment.moon?.phase || 'New Moon',
        elementalState: {
          Fire: ['Aries', 'Leo', 'Sagittarius'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Water: ['Cancer', 'Scorpio', 'Pisces'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Earth: ['Taurus', 'Virgo', 'Capricorn'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2,
          Air: ['Gemini', 'Libra', 'Aquarius'].includes(currentPlanetaryAlignment.sun?.sign || '') ? 0.8 : 0.2
        },
        planets: currentPlanetaryAlignment
      };
      
      // Calculate scores for each cooking method and transform into our format
      const methodsWithScores: CookingMethodWithScore[] = Object.entries(allCookingMethods)
        .map(([methodName, methodData]) => {
          // Calculate base score from the recommender utils
          let baseScore = calculateMethodScore(methodData, astroState);
          
          // Add additional variance factors
          // 1. Use method name length to create a pseudorandom variance
          let nameVariance = (methodName.length % 7) * 0.015;
          // 2. Use first character code as another variance factor
          let charCodeVariance = (methodName.charCodeAt(0) % 10) * 0.01;
          // 3. Apply a position-based variance to ensure different ordering
          let positionVariance = Math.random() * 0.05;
          
          // Combine all variance factors
          let totalVariance = nameVariance + charCodeVariance + positionVariance;
          
          // Final adjusted score with variance (capped between 0.35 and 0.95)
          let adjustedScore = Math.min(0.95, Math.max(0.35, baseScore - totalVariance));
          
          return {
            id: methodName,
            name: methodName.replace(/_ / (g || 1), ' ').replace(/\b\w / (g || 1), c => c.toUpperCase()), // Capitalize words
            description: methodData.description || 'A cooking method that transforms food with heat, moisture, or chemical processes.',
            score: adjustedScore,
            elementalEffect: methodData.elementalEffect || methodData.elementalProperties,
            duration: methodData.duration,
            suitable_for: methodData.suitable_for || [],
            benefits: methodData.benefits || [],
            astrologicalInfluences: methodData.astrologicalInfluences,
            toolsRequired: methodData.toolsRequired
          };
        })
        .sort((a, b) => b.score - a.score);
      
      // Store the scores in the ref to make sure they don't change on re-renders
      const scoreMap: Record<string, number> = {};
      methodsWithScores.forEach((method) => {
        scoreMap[method.id] = method.score;
      });
      methodScoresRef.current = scoreMap;
      
      setMethods(methodsWithScores);
    }
  }, [loading, currentPlanetaryAlignment]);
  
  let toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  let handleMethodSelect = (methodId: string) => {
    setSelectedMethodId(methodId === selectedMethodId ? null : methodId);
  };
  
  // Find the selected method details
  let selectedMethod = methods.find(m => m.id === selectedMethodId);
  
  // Get technical tips and ideal ingredients for selected method
  let technicalTips = selectedMethod ? getTechnicalTips(selectedMethod.name) : [];
  let idealIngredients = selectedMethod ? getIdealIngredients(selectedMethod.name) : [];
  
  // Handle loading state
  if (loading) {
    return <div className={styles['cooking-methods-container']}>
      <div className={styles['cooking-methods-header']}>
        <h3>Recommended Cooking Methods</h3>
        <div className={styles['top-recommendation']}>
          Analyzing celestial energies...
        </div>
      </div>
    </div>;
  }
  
  // Get the top method from the list
  let topMethod = methods.length > 0 ? methods[0] : null;
  
  // Determine if the toggle button should be shown (only for >5 methods)
  let showToggle = methods.length > 5;
  
  return (
    <div className={styles['cooking-methods-container']}>
      <div 
        className={`${styles['cooking-methods-header']} ${!showToggle ? styles['no-toggle'] : ''}`} 
        onClick={showToggle ? toggleExpanded : undefined}
      >
        <h3>Recommended Cooking Methods</h3>
        
        {showToggle && (
          <button className={styles['toggle-button']}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className={styles['cooking-methods-content']}>
          {methods.map((method) => (
            <div 
              key={method.id} 
              className={`${styles['cooking-method-item']} ${selectedMethodId === method.id ? styles.selected : ''}`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <div className={styles['method-header']}>
                <h4>{method.name}</h4>
                <div className={styles['method-score']}>
                  <div 
                    className={styles['score-bar']}
                    style={{ width: `${Math.round((methodScoresRef.current[method.id] || method.score) * 100)}%` }}
                  />
                  <span>{Math.round((methodScoresRef.current[method.id] || method.score) * 100)}%</span>
                </div>
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
                
                {/* Add benefits section */}
                {method.benefits && method.benefits.length > 0 && (
                  <div className={styles['benefits']}>
                    <span className={styles['detail-label']}>Benefits:</span> 
                    {method.benefits[0]}
                    {method.benefits.length > 1 && '...'}
                  </div>
                )}
              </div>
              
              {/* Show expanded details for selected method */}
              {selectedMethodId === method.id && (
                <div className={styles['expanded-details']}>
                  {/* Technical Tips Section - Updated with a more compact design */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 border-l-2 border-purple-500 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Info size={14} className="text-purple-500 mr-1" />
                      Expert Technical Tips
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {technicalTips.map((tip, index) => (
                        <div key={index} className="text-xs bg-white p-2 rounded border-l-2 border-purple-400 text-gray-600">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Ideal Ingredients Section - Updated with a more compact design */}
                  <div className="bg-blue-50 rounded-lg p-3 border-l-2 border-blue-500 shadow-sm">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                      <Info size={14} className="text-blue-500 mr-1" />
                      Ideal Ingredients
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {idealIngredients.map((ingredient, index) => (
                        <div key={index} className="text-xs bg-white p-2 rounded border-l-2 border-blue-400 text-gray-600">
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
    </div>
  );
} 
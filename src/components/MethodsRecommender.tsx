import React, { useEffect, useState, useRef } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { allCookingMethods } from '@/data/cooking';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';
import { ChevronDown, ChevronUp, Flame, Droplets, Wind, Mountain, Info } from 'lucide-react';
import styles from './CookingMethods.module.css';
import { getTechnicalTips, getIdealIngredients } from '@/utils/cookingMethodTips';
import type { CookingMethodModifier, Element } from '@/types/alchemy';

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
  const methodScoresRef = useRef<Record<string, number>>({});
  
  // Calculate method scores using the imported function from cookingMethodRecommender.ts
  useEffect(() => {
    if (!loading && currentPlanetaryAlignment) {
      // PlanetaryAlignment may use either lowercase (moon) or capitalized (Moon)
      // keys depending on the data source.  Normalize by casting to a generic
      // record and falling back through the possible keys.
      const alignmentData = currentPlanetaryAlignment as unknown as Record<string, any>;
      const moonData = alignmentData.moon ?? alignmentData.Moon ?? {};
      const sunData = alignmentData.sun ?? alignmentData.Sun ?? {};
      
      const astroState = {
        zodiacSign: sunData?.sign || 'Aries',
        lunarPhase: moonData?.phase || 'New Moon',
        elementalState: {
          Fire: ['Aries', 'Leo', 'Sagittarius'].includes(sunData?.sign || '') ? 0.8 : 0.2,
          Water: ['Cancer', 'Scorpio', 'Pisces'].includes(sunData?.sign || '') ? 0.8 : 0.2,
          Earth: ['Taurus', 'Virgo', 'Capricorn'].includes(sunData?.sign || '') ? 0.8 : 0.2,
          Air: ['Gemini', 'Libra', 'Aquarius'].includes(sunData?.sign || '') ? 0.8 : 0.2
        },
        planets: currentPlanetaryAlignment
      };
      
      // Calculate scores for each cooking method and transform into our format
      const methodsWithScores: CookingMethodWithScore[] = Object.entries(allCookingMethods)
        .map(([methodName, methodData]) => {
          // Use safe type casting for methodData property access
          const methodInfo = methodData as Record<string, unknown>;
          const elementalEffect = methodInfo?.elementalEffect as Record<string, unknown> | undefined;
          
          // Transform methodData to CookingMethodModifier interface
          const methodModifier: CookingMethodModifier = {
            element: (elementalEffect?.Fire && Number(elementalEffect.Fire) > 0.5 ? 'Fire' 
                    : elementalEffect?.Water && Number(elementalEffect.Water) > 0.5 ? 'Water'
                    : elementalEffect?.Earth && Number(elementalEffect.Earth) > 0.5 ? 'Earth'
                    : 'Air') as Element,
            intensity: Math.max(
              Number(elementalEffect?.Fire) || 0,
              Number(elementalEffect?.Water) || 0,
              Number(elementalEffect?.Earth) || 0,
              Number(elementalEffect?.Air) || 0
            ),
            effect: 'enhance',
            applicableTo: methodInfo?.suitable_for as string[] || ['all'],
            duration: methodInfo?.duration as { min: number; max: number } || { min: 5, max: 30 },
            notes: String(methodInfo?.description || '')
          };
          
          // Calculate base score from the recommender utils
          const baseScore = calculateMethodScore(methodModifier, astroState);
          
          // Add additional variance factors
          // 1. Use method name length to create a pseudorandom variance
          const nameVariance = (methodName.length % 7) * 0.015;
          // 2. Use first character code as another variance factor
          const charCodeVariance = (methodName.charCodeAt(0) % 10) * 0.01;
          // 3. Apply a position-based variance to ensure different ordering
          const positionVariance = Math.random() * 0.05;
          
          // Combine all variance factors
          const totalVariance = nameVariance + charCodeVariance + positionVariance;
          
          // Final adjusted score with variance (capped between 0.35 and 0.95)
          const adjustedScore = Math.min(0.95, Math.max(0.35, baseScore - totalVariance));
          
          return {
            id: methodName,
            name: methodName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), // Capitalize words
            description: methodInfo?.description || 'A cooking method that transforms food with heat, moisture, or chemical processes.',
            score: adjustedScore,
            elementalEffect: (methodInfo as any)?.elementalEffect || (methodInfo as any)?.elementalProperties,
            duration: methodInfo?.duration,
            suitable_for: methodInfo?.suitable_for || [],
            benefits: (methodInfo as any)?.benefits || [],
            astrologicalInfluences: methodInfo?.astrologicalInfluences,
            toolsRequired: methodInfo?.toolsRequired
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
  
  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };
  
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethodId(methodId === selectedMethodId ? null : methodId);
  };
  
  // Find the selected method details
  const selectedMethod = methods.find(m => m.id === selectedMethodId);
  
  // Get technical tips and ideal ingredients for selected method
  const technicalTips = selectedMethod ? getTechnicalTips(selectedMethod.name) : [];
  const idealIngredients = selectedMethod ? getIdealIngredients(selectedMethod.name) : [];
  
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
  const topMethod = methods.length > 0 ? methods[0] : null;
  
  // Determine if the toggle button should be shown (only for >5 methods)
  const showToggle = methods.length > 5;
  
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
'use client';

import React, { useState, useEffect, useMemo, useCallback, FC, ReactNode, useRef } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { RulingPlanet, RULING_PLANETS } from '@/constants/planets';
import { ElementalCharacter } from '@/constants/planetaryElements';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import styles from './ElementalEnergyDisplay.module.css';
import { Flame, Droplets, Mountain, Wind, Shield, CornerUpRight, Shuffle, Sparkles, Anchor } from 'lucide-react';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { safeImportAndExecute } from '@/utils/dynamicImport';
import { getCachedCalculation } from '@/utils/calculationCache';
import { 
  calculateAlchemicalDistribution, 
  convertToElementalProperties, 
  calculateThermodynamicProperties 
} from '@/constants/alchemicalEnergyMapping';
import { AlchemicalContextType } from '@/contexts/AlchemicalContext/context';
import { createLogger } from '@/utils/logger';
import { 
  CelestialPosition, 
  PlanetaryAlignment, 
  _Modality, 
  _Element,
  AlchemicalProperties, 
  ElementalProperties, 
  ThermodynamicProperties 
} from '@/types/celestial';

// Create a component-specific logger
const logger = createLogger('ElementalEnergyDisplay');

// Energy state descriptions
const energyStateDescriptions = {
  high: {
    heat: "Highly transformative energy capable of rapid change",
    entropy: "High degree of disorder and unpredictability",
    reactivity: "Extremely reactive celestial influences",
    gregsEnergy: "Powerful and dynamic celestial energy"
  },
  medium: {
    heat: "Moderate transformative potential",
    entropy: "Balanced order and chaos",
    reactivity: "Moderately responsive to influences",
    gregsEnergy: "Steady celestial energy flow"
  },
  low: {
    heat: "Slow-moving, gradual transformative energy",
    entropy: "Highly ordered and predictable energy state",
    reactivity: "Stable, resistant to change",
    gregsEnergy: "Conserved, potential celestial energy"
  }
};

// Define type for the PlanetaryPositionsType using the centralized types
interface PlanetaryPositionsType {
  [key: string]: CelestialPosition;
}

// Define the type for alchemicalResults
interface AlchemicalResults {
  elementalCounts: ElementalProperties;
  alchemicalCounts: AlchemicalProperties;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  planetaryDignities: Record<string, unknown>;
  modalityDistribution: {
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
  dominantModality: _Modality;
}

// Define interface for alchemical hook result
interface AlchemicalHookResult {
  planetaryPositions: PlanetaryPositionsType;
  isDaytime: boolean;
  refreshPlanetaryPositions: () => Promise<PlanetaryPositionsType>;
  state: {
    astrologicalState?: {
      alchemicalValues?: AlchemicalProperties;
      modalityDistribution?: {
        Cardinal: number;
        Fixed: number;
        Mutable: number;
      };
      dominantModality?: _Modality;
      planetaryDignities?: Record<string, unknown>;
    };
  };
}

// Function to get energy level description
const getEnergyLevelDescription = (value: number, type: keyof typeof energyStateDescriptions.high) => {
  if (isNaN(value)) return energyStateDescriptions.medium[type];
  if (value >= 0.7) return energyStateDescriptions.high[type];
  if (value >= 0.4) return energyStateDescriptions.medium[type];
  return energyStateDescriptions.low[type];
};

const ElementalEnergyDisplay: FC = (): ReactNode => {
  // Use the defined interface for the useAlchemical hook result
  const { planetaryPositions, isDaytime, refreshPlanetaryPositions, state } = useAlchemical() as AlchemicalHookResult;
  
  const { currentPlanetaryAlignment, currentZodiac } = useAstrologicalState();
  const [renderCount, setRenderCount] = useState<number>(0);
  
  // Create the ref at the component level instead of inside useEffect
  const lastPositionKeyRef = useRef('');
  
  // Log render count - run only once
  useEffect(() => {
    // Only increment once when component mounts
    if (renderCount === 0) {
      setRenderCount(1);
      logger.debug(`ElementalEnergyDisplay mounted`);
    }
  }, []); // Empty dependency array means this runs only once
  
  const [alchemicalResults, setAlchemicalResults] = useState<AlchemicalResults>(() => {
    // Start with defaults
    const initialState: AlchemicalResults = {
      elementalCounts: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      alchemicalCounts: { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 },
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      planetaryDignities: {},
      modalityDistribution: { Cardinal: 0.33, Fixed: 0.33, Mutable: 0.34 },
      dominantModality: 'Mutable',
    };

    // If we have planetary data on initial render, calculate actual values
    if (planetaryPositions && Object.keys(planetaryPositions).length > 0) {
      try {
        // Get the distribution of alchemical energies
        const alchemicalDistribution = calculateAlchemicalDistribution(planetaryPositions, isDaytime);
        
        // Convert to elemental properties
        const elementalProps = convertToElementalProperties(alchemicalDistribution);
        
        // Calculate thermodynamic properties
        const thermodynamicProps = calculateThermodynamicProperties(alchemicalDistribution);

        // Update initial state with calculated values
        initialState.elementalCounts = elementalProps;
        initialState.alchemicalCounts = {
          Spirit: alchemicalDistribution.Spirit,
          Essence: alchemicalDistribution.Essence,
          Matter: alchemicalDistribution.Matter,
          Substance: alchemicalDistribution.Substance
        };
        initialState.heat = thermodynamicProps.heat;
        initialState.entropy = thermodynamicProps.entropy;
        initialState.reactivity = thermodynamicProps.reactivity;
        initialState.gregsEnergy = (thermodynamicProps.heat + thermodynamicProps.entropy + thermodynamicProps.reactivity) / 3;
      } catch (error) {
        logger.error('Error calculating initial alchemical values:', error);
      }
    }

    return initialState;
  });
  
  // Memoize planetary position input with proper serialization to prevent infinite loops
  const memoizedPlanetaryInput = useMemo(() => {
    // Create a stable hash from the positions that only changes when relevant data changes
    const positionsHash = Object.entries(planetaryPositions || {}).reduce((acc, [planet, data]) => {
      if (!data) return acc;
      // Only include data that affects calculations
      return acc + `${planet}:${data.sign || ''}:${data.degree || 0}:${data.isRetrograde ? 1 : 0}|`;
    }, '');
    
    const serialized = {
      positionsHash,
      isDaytime,
      timestamp: Math.floor(Date.now() / 60000) // Only recalculate at most once per minute
    };
    
    return serialized;
  }, [planetaryPositions, isDaytime]);
  
  // Memoize expensive calculations
  useEffect(() => {
    // Skip if we don't have valid data
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      logger.debug("Skipping alchemical calculation - no planetary positions available");
      return;
    }
    
    // Calculate alchemical properties using our new helper functions
    try {
      // Get the distribution of alchemical energies
      const alchemicalDistribution = calculateAlchemicalDistribution(planetaryPositions, isDaytime);
      
      // Convert to elemental properties
      const elementalProps = convertToElementalProperties(alchemicalDistribution);
      
      // Calculate thermodynamic properties
      const thermodynamicProps = calculateThermodynamicProperties(alchemicalDistribution);
      
      // Use a function to determine if updates are needed, with defined equality thresholds
      const isSignificantChange = (prev: AlchemicalResults, newProps: {
        elementalProps: ElementalProperties,
        alchemicalDistribution: AlchemicalProperties,
        thermodynamicProps: ThermodynamicProperties
      }) => {
        const THRESHOLD = 0.01; // 1% change threshold
        
        return (
          Math.abs(prev.heat - newProps.thermodynamicProps.heat) >= THRESHOLD ||
          Math.abs(prev.entropy - newProps.thermodynamicProps.entropy) >= THRESHOLD ||
          Math.abs(prev.reactivity - newProps.thermodynamicProps.reactivity) >= THRESHOLD ||
          Math.abs(prev.elementalCounts.Fire - newProps.elementalProps.Fire) >= THRESHOLD ||
          Math.abs(prev.elementalCounts.Water - newProps.elementalProps.Water) >= THRESHOLD ||
          Math.abs(prev.elementalCounts.Earth - newProps.elementalProps.Earth) >= THRESHOLD ||
          Math.abs(prev.elementalCounts.Air - newProps.elementalProps.Air) >= THRESHOLD
        );
      };
      
      // Update state with new values, but only if there's a significant change
      setAlchemicalResults(prev => {
        // Check if there's a significant change worth updating for
        if (!isSignificantChange(prev, { elementalProps, alchemicalDistribution, thermodynamicProps })) {
          logger.debug("Skipping update - results identical to previous state");
          return prev;
        }
        
        logger.debug("Updating alchemical results with new data:", {
          elements: elementalProps,
          thermodynamics: thermodynamicProps
        });
        
        return {
          ...prev,
          elementalCounts: elementalProps,
          alchemicalCounts: {
            Spirit: alchemicalDistribution.Spirit,
            Essence: alchemicalDistribution.Essence,
            Matter: alchemicalDistribution.Matter,
            Substance: alchemicalDistribution.Substance
          },
          heat: thermodynamicProps.heat,
          entropy: thermodynamicProps.entropy,
          reactivity: thermodynamicProps.reactivity,
          gregsEnergy: (thermodynamicProps.heat + thermodynamicProps.entropy + thermodynamicProps.reactivity) / 3
        };
      });
    } catch (error) {
      logger.error('Error in alchemical calculation:', error);
    }
  }, [memoizedPlanetaryInput.positionsHash, memoizedPlanetaryInput.isDaytime, memoizedPlanetaryInput.timestamp]);

  // Get alchemical values from context state if available
  useEffect(() => {
    try {
      if (state.astrologicalState?.alchemicalValues) {
        logger.debug("Using alchemical values from context:", state.astrologicalState.alchemicalValues);
        
        // Update the alchemical counts from context state, ensuring non-zero values
        setAlchemicalResults(prev => ({
          ...prev,
          alchemicalCounts: {
            Spirit: state.astrologicalState?.alchemicalValues?.Spirit || 0.25,
            Essence: state.astrologicalState?.alchemicalValues?.Essence || 0.25,
            Matter: state.astrologicalState?.alchemicalValues?.Matter || 0.25,
            Substance: state.astrologicalState?.alchemicalValues?.Substance || 0.25
          }
        }));
      }
      
      // Update modality distribution if available
      if (state.astrologicalState?.modalityDistribution) {
        setAlchemicalResults(prev => ({
          ...prev,
          modalityDistribution: state.astrologicalState?.modalityDistribution || prev.modalityDistribution,
          dominantModality: state.astrologicalState?.dominantModality || prev.dominantModality
        }));
      }
      
      // Update planetary dignities if available
      if (state.astrologicalState?.planetaryDignities) {
        setAlchemicalResults(prev => ({
          ...prev,
          planetaryDignities: state.astrologicalState?.planetaryDignities || {}
        }));
      }
    } catch (error) {
      logger.error('Error updating alchemical values from context:', error);
    }
  }, [state.astrologicalState]);

  // Memoize total elementals calculation
  const totalElementals = useMemo(() => {
    logger.debug("Recalculating totalElementals");
    return Object.values(alchemicalResults.elementalCounts).reduce(
      (sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0), 
      0
    );
  }, [alchemicalResults.elementalCounts]);
  
  // Memoize total alchemicals calculation
  const totalAlchemicals = useMemo(() => {
    logger.debug("Recalculating totalAlchemicals");
    return Object.values(alchemicalResults.alchemicalCounts).reduce(
      (sum: number, val: unknown) => sum + (typeof val === 'number' ? val : 0), 
      0
    );
  }, [alchemicalResults.alchemicalCounts]);

  // Memoize energy level descriptions
  const energyDescriptions = useMemo(() => ({
    heat: energyStateDescriptions[alchemicalResults.heat >= 0.7 ? 'high' : alchemicalResults.heat >= 0.4 ? 'medium' : 'low'].heat,
    entropy: energyStateDescriptions[alchemicalResults.entropy >= 0.7 ? 'high' : alchemicalResults.entropy >= 0.4 ? 'medium' : 'low'].entropy,
    reactivity: energyStateDescriptions[alchemicalResults.reactivity >= 0.7 ? 'high' : alchemicalResults.reactivity >= 0.4 ? 'medium' : 'low'].reactivity,
    gregsEnergy: energyStateDescriptions[alchemicalResults.gregsEnergy >= 0.7 ? 'high' : alchemicalResults.gregsEnergy >= 0.4 ? 'medium' : 'low'].gregsEnergy
  }), [
    alchemicalResults.heat, 
    alchemicalResults.entropy, 
    alchemicalResults.reactivity,
    alchemicalResults.gregsEnergy
  ]);

  useEffect(() => {
    logger.debug("Planetary positions available:", planetaryPositions);
    
    // Debug indicator for data format
    if (planetaryPositions) {
      const firstPlanet = Object.keys(planetaryPositions)[0] || '';
      const firstPlanetData = planetaryPositions[firstPlanet];
      logger.debug("First planet data format:", {
        planet: firstPlanet,
        dataType: typeof firstPlanetData,
        isObject: typeof firstPlanetData === 'object',
        hasSign: typeof firstPlanetData === 'object' && 'sign' in firstPlanetData,
        hasDegree: typeof firstPlanetData === 'object' && 'degree' in firstPlanetData
      });
    }
  }, [planetaryPositions]);

  useEffect(() => {
    if (currentPlanetaryAlignment) {
      try {
        // Only run this calculation when there's actually a change in alignment
        const positionKey = Object.entries(currentPlanetaryAlignment)
          .filter(([k, v]) => typeof v === 'object' && v !== null && 'sign' in v)
          .map(([k, v]) => `${k}:${(v as any).sign}:${(v as any).degree || 0}`)
          .join('|');
        
        // Skip calculation if we've already calculated for this exact alignment
        // Use the ref that's defined at the component level
        if (positionKey === lastPositionKeyRef.current) {
          logger.debug("Skipping calculation - alignment unchanged");
          return;
        }
        lastPositionKeyRef.current = positionKey;
        
        // Use our new alchemical energy mapping functions
        // Calculate alchemical distribution from planetary positions
        const alchemicalDistribution = calculateAlchemicalDistribution(currentPlanetaryAlignment as any, isDaytime);
        
        // Convert alchemical distribution to elemental properties
        const elementalProps = convertToElementalProperties(alchemicalDistribution);
        
        // Calculate thermodynamic properties from alchemical distribution
        const thermodynamicProps = calculateThermodynamicProperties(alchemicalDistribution);
        
        // Update the alchemical results state
        setAlchemicalResults(prev => {
          // Only update if there's a significant change
          const THRESHOLD = 0.01;
          const hasSignificantChange = 
            Math.abs(prev.heat - thermodynamicProps.heat) >= THRESHOLD ||
            Math.abs(prev.entropy - thermodynamicProps.entropy) >= THRESHOLD ||
            Math.abs(prev.reactivity - thermodynamicProps.reactivity) >= THRESHOLD;
          
          if (!hasSignificantChange) {
            return prev;
          }
          
          return {
            ...prev,
            elementalCounts: elementalProps,
            alchemicalCounts: {
              Spirit: alchemicalDistribution.Spirit,
              Essence: alchemicalDistribution.Essence,
              Matter: alchemicalDistribution.Matter,
              Substance: alchemicalDistribution.Substance
            },
            heat: thermodynamicProps.heat,
            entropy: thermodynamicProps.entropy,
            reactivity: thermodynamicProps.reactivity,
            // Calculate an overall energy level
            gregsEnergy: (thermodynamicProps.heat + thermodynamicProps.reactivity + thermodynamicProps.entropy) / 3
          };
        });
        
        // Calculate modality distribution - pulled this out of the state update to avoid unnecessary re-renders
        const modalityCount = { Cardinal: 0, Fixed: 0, Mutable: 0 };
        let totalPlanets = 0;

        // Map of which signs belong to which modality
        const signModality: Record<string, string> = {
          aries: 'Cardinal', cancer: 'Cardinal', libra: 'Cardinal', capricorn: 'Cardinal',
          taurus: 'Fixed', leo: 'Fixed', scorpio: 'Fixed', aquarius: 'Fixed',
          gemini: 'Mutable', virgo: 'Mutable', sagittarius: 'Mutable', pisces: 'Mutable'
        };

        // Count planets in each modality
        Object.entries(currentPlanetaryAlignment).forEach(([_, position]) => {
          // Check if position is a valid object with a sign property
          if (position && typeof position === 'object' && 'sign' in position && typeof position.sign === 'string') {
            const signKey = position.sign.toLowerCase();
            const modality = signKey in signModality ? signModality[signKey] : undefined;
            if (modality && (modality === 'Cardinal' || modality === 'Fixed' || modality === 'Mutable')) {
              modalityCount[modality as _Modality]++;
              totalPlanets++;
            }
          }
        });

        // Calculate percentages
        const modalityDistribution = {
          Cardinal: totalPlanets > 0 ? modalityCount.Cardinal / totalPlanets : 0.33,
          Fixed: totalPlanets > 0 ? modalityCount.Fixed / totalPlanets : 0.33,
          Mutable: totalPlanets > 0 ? modalityCount.Mutable / totalPlanets : 0.33
        };
        
        // Determine dominant modality
        const entries = Object.entries(modalityDistribution) as [_Modality, number][];
        const dominantModality = entries.reduce(
          (max, [modality, value]) => value > max.value ? {modality, value} : max, 
          {modality: 'Mutable' as _Modality, value: 0}
        ).modality;

        // Update modality distribution in a separate state update
        setAlchemicalResults(prev => {
          if (prev.dominantModality === dominantModality && 
              Math.abs(prev.modalityDistribution.Cardinal - modalityDistribution.Cardinal) < 0.01 &&
              Math.abs(prev.modalityDistribution.Fixed - modalityDistribution.Fixed) < 0.01 &&
              Math.abs(prev.modalityDistribution.Mutable - modalityDistribution.Mutable) < 0.01) {
            return prev;
          }
          
          return {
            ...prev,
            modalityDistribution,
            dominantModality
          };
        });
        
      } catch (err) {
        logger.error("Error calculating elemental state:", err);
        
        // Fallback to a default state if calculation fails
        const defaultState = ElementalCalculator.getCurrentElementalState();
        setAlchemicalResults(prev => ({
          ...prev,
          elementalCounts: defaultState,
          alchemicalCounts: {
            Spirit: 0.25,
            Essence: 0.25,
            Matter: 0.25,
            Substance: 0.25
          }
        }));
      }
    }
  }, [currentPlanetaryAlignment, isDaytime]); // Only depend on these two values

 
  
  // Get color based on value
  const getEnergyColor = (value: number) => {
    if (isNaN(value)) return "rgb(128, 128, 128)";
    if (value >= 0.7) return "rgb(0, 200, 83)";
    if (value >= 0.4) return "rgb(65, 105, 225)";
    return "rgb(255, 165, 0)";
  };
  
  // Functions for visualization
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire': return '🔥';
      case 'Water': return '💧';
      case 'Air': return '💨';
      case 'Earth': return '🌍';
      default: return '';
    }
  };
  
  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire': return 'rgb(255, 87, 51)';
      case 'Water': return 'rgb(65, 105, 225)';
      case 'Air': return 'rgb(173, 216, 230)';
      case 'Earth': return 'rgb(139, 69, 19)';
      default: return 'rgb(128, 128, 128)';
    }
  };
  
  const getAlchemicalPropertyIcon = (property: string) => {
    switch (property) {
      case 'Spirit': return '✨';
      case 'Essence': return '💫';
      case 'Matter': return '🧱';
      case 'Substance': return '🌀';
      default: return '';
    }
  };
  
  const getAlchemicalPropertyColor = (property: string) => {
    switch (property) {
      case 'Spirit': return 'rgb(186, 85, 211)';
      case 'Essence': return 'rgb(65, 105, 225)';
      case 'Matter': return 'rgb(139, 69, 19)';
      case 'Substance': return 'rgb(0, 128, 128)';
      default: return 'rgb(128, 128, 128)';
    }
  };

  // Replace the debug-info section with a memoized version to prevent re-rendering loops
  const DebugInfo = React.memo(() => (
    <div style={{ fontSize: '10px', color: '#999', textAlign: 'right', marginBottom: '4px' }}>
      Renders: {renderCount}
    </div>
  ));

  return (
    <div className={styles.container}>
      {/* Use the memoized debug component */}
      <DebugInfo />
      
      <div className={styles.elementSection}>
        <h3 className={styles.sectionTitle}>Elemental State</h3>
        <div className={styles.elementBars}>
          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Flame className={`${styles.elementIcon} ${styles.fireIcon}`} size={18} />
              <span>Fire</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.fireFill}`} 
                style={{ width: `${Math.round(alchemicalResults.elementalCounts.Fire * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.elementalCounts.Fire * 100)}%</span>
          </div>

          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Droplets className={`${styles.elementIcon} ${styles.waterIcon}`} size={18} />
              <span>Water</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.waterFill}`} 
                style={{ width: `${Math.round(alchemicalResults.elementalCounts.Water * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.elementalCounts.Water * 100)}%</span>
          </div>

          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Mountain className={`${styles.elementIcon} ${styles.earthIcon}`} size={18} />
              <span>Earth</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.earthFill}`} 
                style={{ width: `${Math.round(alchemicalResults.elementalCounts.Earth * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.elementalCounts.Earth * 100)}%</span>
          </div>

          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Wind className={`${styles.elementIcon} ${styles.airIcon}`} size={18} />
              <span>Air</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.airFill}`} 
                style={{ width: `${Math.round(alchemicalResults.elementalCounts.Air * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.elementalCounts.Air * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Modality Distribution Section - Updated structure */}
      <div className={styles.modalitySection}>
        <div className={styles.modalityHeader}>
          <h3 className={styles.sectionTitle}>Modality Distribution</h3>
          <div className={styles.dominantModality}>
            <h4>Dominant Quality</h4>
            <div className={`${styles.dominantBadge} ${styles[alchemicalResults.dominantModality.toLowerCase()]}`}>
              {alchemicalResults.dominantModality}
            </div>
            <p className={styles.dominantDescription}>
              {alchemicalResults.dominantModality === 'Cardinal' && (
                <>
                  Initiating & action-oriented energy. Favors starting new projects, leadership roles, and decisive action. Cardinal energy excels at breaking new ground and launching initiatives. Associated with aries, cancer, Libra, and capricorn.
                </>
              )}
              {alchemicalResults.dominantModality === 'Fixed' && (
                <>
                  Stabilizing & persistent energy. Favors maintaining projects, consolidating efforts, and showing determination. Fixed energy excels at following through and creating lasting structures. Associated with taurus, leo, Scorpio, and aquarius.
                </>
              )}
              {alchemicalResults.dominantModality === 'Mutable' && (
                <>
                  Adaptable & flexible energy. Favors versatility, adjusting to change, and multitasking. Mutable energy excels at transitioning between phases and finding creative solutions. Associated with gemini, virgo, sagittarius, and pisces.
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className={styles.elementBars}>
          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <CornerUpRight className={`${styles.elementIcon} ${styles.cardinalIcon}`} size={18} />
              <span>Cardinal</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.cardinalFill}`} 
                style={{ width: `${Math.round(alchemicalResults.modalityDistribution.Cardinal * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.modalityDistribution.Cardinal * 100)}%</span>
          </div>
          
          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Shield className={`${styles.elementIcon} ${styles.fixedIcon}`} size={18} />
              <span>Fixed</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.fixedFill}`} 
                style={{ width: `${Math.round(alchemicalResults.modalityDistribution.Fixed * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.modalityDistribution.Fixed * 100)}%</span>
          </div>

          <div className={styles.elementBar}>
            <div className={styles.elementLabel}>
              <Shuffle className={`${styles.elementIcon} ${styles.mutableIcon}`} size={18} />
              <span>Mutable</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.mutableFill}`} 
                style={{ width: `${Math.round(alchemicalResults.modalityDistribution.Mutable * 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>{Math.round(alchemicalResults.modalityDistribution.Mutable * 100)}%</span>
          </div>
        </div>

        <div className={styles.modalityLegend}>
          <div className={styles.modalityInfo}>
            <span className={styles.modalityType}>Cardinal</span>
            <div className={styles.modalityTooltip}>
              Cardinal signs (aries, cancer, Libra, capricorn) represent initiation, action, and leadership.
            </div>
          </div>
          <div className={styles.modalityInfo}>
            <span className={styles.modalityType}>Fixed</span>
            <div className={styles.modalityTooltip}>
              Fixed signs (taurus, leo, Scorpio, aquarius) represent stability, determination, and persistence.
            </div>
          </div>
          <div className={styles.modalityInfo}>
            <span className={styles.modalityType}>Mutable</span>
            <div className={styles.modalityTooltip}>
              Mutable signs (gemini, virgo, sagittarius, pisces) represent adaptability, flexibility, and versatility.
            </div>
          </div>
        </div>
      </div>

      {/* Alchemical Properties Display */}
      <div className={styles.alchemicalSection}>
        <h3 className={styles.sectionTitle}>Alchemical Properties</h3>
        <div className={styles.alchemicalBars}>
          <div className={styles.alchemicalBar}>
            <div className={styles.alchemicalLabel}>
              <span>Spirit</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.spiritFill}`} 
                style={{ width: `${Math.min(Math.round(alchemicalResults.alchemicalCounts.Spirit * 100), 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {alchemicalResults.alchemicalCounts.Spirit.toFixed(2)}
            </span>
          </div>

          <div className={styles.alchemicalBar}>
            <div className={styles.alchemicalLabel}>
              <span>Essence</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.essenceFill}`} 
                style={{ width: `${Math.min(Math.round(alchemicalResults.alchemicalCounts.Essence * 100), 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {alchemicalResults.alchemicalCounts.Essence.toFixed(2)}
            </span>
          </div>

          <div className={styles.alchemicalBar}>
            <div className={styles.alchemicalLabel}>
              <span>Matter</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.matterFill}`} 
                style={{ width: `${Math.min(Math.round(alchemicalResults.alchemicalCounts.Matter * 100), 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {alchemicalResults.alchemicalCounts.Matter.toFixed(2)}
            </span>
          </div>

          <div className={styles.alchemicalBar}>
            <div className={styles.alchemicalLabel}>
              <span>Substance</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.substanceFill}`} 
                style={{ width: `${Math.min(Math.round(alchemicalResults.alchemicalCounts.Substance * 100), 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {alchemicalResults.alchemicalCounts.Substance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Energy Metrics */}
      <div className={styles.energySection}>
        <h3 className={styles.sectionTitle}>Energy Metrics</h3>
        
        <div className={styles.energyBars}>
          {/* Heat */}
          <div className={styles.energyBar}>
            <div className={styles.energyLabel}>
              <Flame className={`${styles.energyIcon} ${styles.heatIcon}`} size={18} />
              <span>Heat</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.heatFill}`} 
                style={{ width: `${Math.min(alchemicalResults.heat * 100, 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {(alchemicalResults.heat).toFixed(2)}
            </span>
          </div>
          
          {/* Entropy */}
          <div className={styles.energyBar}>
            <div className={styles.energyLabel}>
              <Droplets className={`${styles.energyIcon} ${styles.entropyIcon}`} size={18} />
              <span>Entropy</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.entropyFill}`} 
                style={{ width: `${Math.min(alchemicalResults.entropy * 100, 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {(alchemicalResults.entropy).toFixed(2)}
            </span>
          </div>
          
          {/* Reactivity */}
          <div className={styles.energyBar}>
            <div className={styles.energyLabel}>
              <Mountain className={`${styles.energyIcon} ${styles.reactivityIcon}`} size={18} />
              <span>Reactivity</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.reactivityFill}`} 
                style={{ width: `${Math.min(alchemicalResults.reactivity * 100, 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {(alchemicalResults.reactivity).toFixed(2)}
            </span>
          </div>
          
          {/* Alchemical Energy */}
          <div className={styles.energyBar}>
            <div className={styles.energyLabel}>
              <Wind className={`${styles.energyIcon} ${styles.gregsEnergyIcon}`} size={18} />
              <span>Alchemical Energy</span>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={`${styles.barFill} ${styles.gregsEnergyFill}`} 
                style={{ width: `${Math.min(alchemicalResults.gregsEnergy * 100, 100)}%` }}
              ></div>
            </div>
            <span className={styles.percentage}>
              {(alchemicalResults.gregsEnergy).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={refreshPlanetaryPositions}
        className={styles.refreshButton}
      >
        Refresh Celestial Data
      </button>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(ElementalEnergyDisplay); 
'use client'

import { useEffect, useState, useRef } from 'react'
import { useAlchemical } from '../../contexts/AlchemicalContext/hooks'
import { logger } from '../../utils/logger'
import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator'
import { calculateLunarPhase, getLunarPhaseName } from '../../utils/astrologyUtils'
import { useCurrentChart } from '../../hooks/useCurrentChart'
import dynamic from 'next/dynamic'

// Enhanced StateDebugger with more detailed info
// Create a client-only version with no SSR to prevent hydration errors
const StateDebuggerContent = ({ 
  state, 
  planetaryPositions, 
  chart 
}: { 
  state: Record<string, unknown>, 
  planetaryPositions: Record<string, unknown>, 
  chart: Record<string, unknown> 
}) => {
  const [mounted, setMounted] = useState(false)
  const renderCount = useRef(0)
  const [planetaryHour, setPlanetaryHour] = useState('Unknown')
  const [lunarPhase, setLunarPhase] = useState('Unknown')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [currentSeason, setCurrentSeason] = useState('')
  const [perfMetrics, setPerfMetrics] = useState<{ componentName: string, renderTime: number }[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    main: true,
    chart: false,
    elements: false,
    performance: false,
    components: false
  })
  const [visible, setVisible] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [clientOnly, setClientOnly] = useState(false)

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    renderCount.current = 1
    logger.info('StateDebugger mounted')
    
    // Set clientOnly to true after hydration is complete
    setClientOnly(true)
    
    // Set up a refresh interval to ensure values stay current
    const refreshInterval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000); // Refresh every 5 seconds
    
    // Calculate current planetary hour
    try {
      const hourCalculator = new PlanetaryHourCalculator()
      
      // Check which method exists and use it
      if (typeof hourCalculator.getCurrentPlanetaryHour === 'function') {
        const currentHour = hourCalculator.getCurrentPlanetaryHour()
        setPlanetaryHour(String(currentHour.planet || 'Unknown').toLowerCase())
      } else if (typeof hourCalculator.getPlanetaryHour === 'function') {
        const currentHour = hourCalculator.getPlanetaryHour(new Date())
        setPlanetaryHour(String(currentHour.planet || 'Unknown').toLowerCase())
      } else if (typeof hourCalculator.calculatePlanetaryHour === 'function') {
        const currentHour = hourCalculator.calculatePlanetaryHour(new Date())
        setPlanetaryHour(typeof currentHour === 'string' 
          ? currentHour.toLowerCase() 
          : (typeof currentHour === 'object' && currentHour && 'planet' in currentHour) 
            ? String(currentHour.planet).toLowerCase() 
            : 'unknown')
      } else {
        // Fallback to time of day if no method exists
        const hour = new Date().getHours()
        let timeBasedPlanet = 'sun'
        
        if (hour >= 0 && hour < 3) timeBasedPlanet = 'saturn'
        else if (hour >= 3 && hour < 6) timeBasedPlanet = 'jupiter'
        else if (hour >= 6 && hour < 9) timeBasedPlanet = 'mars'
        else if (hour >= 9 && hour < 12) timeBasedPlanet = 'sun'
        else if (hour >= 12 && hour < 15) timeBasedPlanet = 'venus'
        else if (hour >= 15 && hour < 18) timeBasedPlanet = 'mercury'
        else if (hour >= 18 && hour < 21) timeBasedPlanet = 'moon'
        else timeBasedPlanet = 'saturn'
        
        setPlanetaryHour(timeBasedPlanet)
      }
    } catch (error) {
      console.error('Error calculating planetary hour:', error)
      setPlanetaryHour('unknown')
    }
    
    // Calculate current lunar phase
    try {
      const phaseValue = calculateLunarPhase(new Date())
      
      // Handle the value whether it's a promise or not
      if (phaseValue instanceof Promise) {
        phaseValue.then(value => {
          const phaseName = getLunarPhaseName(value)
          setLunarPhase(phaseName)
        }).catch(err => {
          console.error('Error calculating lunar phase:', err)
          setLunarPhase('Unknown')
        })
      } else {
        const phaseName = getLunarPhaseName(phaseValue)
        setLunarPhase(phaseName)
      }
    } catch (error) {
      console.error('Error calculating lunar phase:', error)
      setLunarPhase('Unknown')
    }

    // Setup performance observation
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      // Filter for component render measurements
      const componentMetrics = entries
        .filter(entry => entry.name.includes('render'))
        .map(entry => ({
          componentName: entry.name.replace('render-', ''),
          renderTime: entry.duration
        }))
        .slice(0, 5); // Keep only the 5 most recent
      
      if (componentMetrics.length > 0) {
        setPerfMetrics(prev => [...componentMetrics, ...prev].slice(0, 5));
      }
    });
    
    // Observe paint timing
    observer.observe({ entryTypes: ['measure', 'paint'] });
    
    return () => {
      observer.disconnect();
      clearInterval(refreshInterval);
    };
  }, [])

  // Track state updates
  useEffect(() => {
    if (!state) return;
    
    renderCount.current += 1
    setTimeOfDay(state.timeOfDay || '')
    setCurrentSeason(state.currentSeason || '')
    setLastUpdated(new Date())
    
    logger.info('State updated:', {
      currentSeason: state.currentSeason,
      timeOfDay: state.timeOfDay,
      elementalBalance: state.elementalPreference,
      astrologicalState: state.astrologicalState,
      currentEnergy: state.currentEnergy,
    })
  }, [state])

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Toggle entire debug panel
  const toggleVisibility = () => {
    setVisible(prev => !prev)
  }

  // Check if state exists first
  if (!state) {
    return (
      <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-xs z-50">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Debug Info</h3>
          <button 
            onClick={toggleVisibility} 
            className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
        <p>State loading...</p>
      </div>
    );
  }

  // Process chart and state data
  const processData = () => {
    // Initialize elemental values
    const elementalValues = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    // Element mapping for zodiac signs
    const signElements = {
      'aries': 'Fire',
      'leo': 'Fire',
      'sagittarius': 'Fire',
      'taurus': 'Earth',
      'virgo': 'Earth',
      'capricorn': 'Earth',
      'gemini': 'Air',
      'libra': 'Air',
      'aquarius': 'Air',
      'cancer': 'Water',
      'scorpio': 'Water',
      'pisces': 'Water'
    };
    
    // Planet weights for elemental influence
    const planetWeights = {
      'sun': 3,
      'moon': 2,
      'mercury': 1,
      'venus': 1,
      'mars': 1,
      'jupiter': 1, 
      'saturn': 1,
      'uranus': 0.5,
      'neptune': 0.5,
      'pluto': 0.5
    };
    
    // Calculate elemental values from planetary positions
    let totalWeight = 0;
    
    if (planetaryPositions) {
      Object.entries(planetaryPositions).forEach(([planet, data]) => {
        if (data && data.sign && signElements[data.sign] && planetWeights[planet]) {
          const element = signElements[data.sign];
          const weight = planetWeights[planet];
          
          elementalValues[element] += weight;
          totalWeight += weight;
        }
      });
    }
    
    // Normalize elemental values
    if (totalWeight > 0) {
      Object.keys(elementalValues).forEach(element => {
        elementalValues[element] = elementalValues[element] / totalWeight;
      });
    } else {
      // Default values if no planets were processed
      elementalValues.Fire = 0.25;
      elementalValues.Water = 0.25;
      elementalValues.Earth = 0.25;
      elementalValues.Air = 0.25;
    }
    
    // Calculate alchemical values based on elemental balance
    const fireValue = elementalValues.Fire || 0;
    const waterValue = elementalValues.Water || 0;
    const airValue = elementalValues.Air || 0;
    const earthValue = elementalValues.Earth || 0;
    
    // Alchemical calculation formulas:
    // Spirit = Fire + Air (volatile elements)
    // Matter = Earth + Water (fixed elements)
    // Essence = Air + Water (moist elements)
    // Substance = Fire + Earth (dry elements)
    const spiritValue = (fireValue * 0.6) + (airValue * 0.4);
    const matterValue = (earthValue * 0.7) + (waterValue * 0.3);
    const essenceValue = (airValue * 0.55) + (waterValue * 0.45);
    const substanceValue = (fireValue * 0.4) + (earthValue * 0.6);
    
    // Extract chart values if available
    const chartSpirit = state?.alchemicalValues?.Spirit || spiritValue || 0;
    const chartEssence = state?.alchemicalValues?.Essence || essenceValue || 0;
    const chartMatter = state?.alchemicalValues?.Matter || matterValue || 0;
    const chartSubstance = state?.alchemicalValues?.Substance || substanceValue || 0;

    // Calculate raw integer values like those shown in alchm.xyz (multiplying by scaling factor)
    const scalingFactor = 40; // Approximate scaling factor to match alchm.xyz output
    const rawSpirit = Math.round(chartSpirit * scalingFactor);
    const rawEssence = Math.round(chartEssence * scalingFactor); 
    const rawMatter = Math.round(chartMatter * scalingFactor);
    const rawSubstance = Math.round(chartSubstance * scalingFactor);

    // Calculate thermodynamic properties
    // Based on formulas from alchm.xyz
    const heat = (chartSpirit * 0.6) + (chartSubstance * 0.4);
    const entropy = (chartSubstance * 0.6) + (chartEssence * 0.4);
    const reactivity = chartSpirit !== 0 || chartMatter !== 0 
      ? (chartSpirit**2 + chartEssence**2) / (chartMatter || 0.01) 
      : 0;
    const energy = heat - (reactivity * entropy);

    // Get chart elemental profile
    const chartElemental = chart?.elementalProfile || chart?.elementalState || elementalValues;

    // Calculate dominance
    const dominantElement = Object.entries(elementalValues)
      .sort(([_, a], [__, b]) => b - a)[0][0];

    return {
      stateTokens: {
        spirit: spiritValue,
        essence: essenceValue,
        matter: matterValue,
        substance: substanceValue
      },
      chartTokens: {
        spirit: chartSpirit,
        essence: chartEssence,
        matter: chartMatter,
        substance: chartSubstance
      },
      rawTokens: {
        spirit: rawSpirit,
        essence: rawEssence,
        matter: rawMatter,
        substance: rawSubstance
      },
      thermodynamicProps: {
        heat,
        entropy,
        reactivity,
        energy
      },
      stateElemental: elementalValues,
      chartElemental,
      dominantElement
    };
  };

  // Get processed data
  const { stateTokens, chartTokens, rawTokens, thermodynamicProps, stateElemental, chartElemental, dominantElement } = processData()
  
  // Token symbol for display
  const tokenSymbol = '⦿'

  // Only show button if panel is hidden
  if (!visible) {
    return (
      <button 
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 p-2 bg-black/80 text-white rounded-lg text-xs z-50 hover:bg-black/90"
      >
        Show Debug
      </button>
    );
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black/80 text-white rounded-lg text-xs max-w-xs overflow-auto max-h-[80vh] z-50 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <div className="flex space-x-2">
          <span className="text-gray-400">{lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={toggleVisibility} 
            className="px-1.5 py-0.5 bg-gray-700 rounded hover:bg-gray-600 text-[10px]"
          >
            Hide
          </button>
        </div>
      </div>
      
      {/* Main Info Section */}
      <div className="mb-2">
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-black/40 px-1 rounded"
          onClick={() => toggleSection('main')}
        >
          <h4 className="font-semibold">Basic Info</h4>
          <span>{expanded.main ? '▼' : '►'}</span>
        </div>
        
        {expanded.main && (
          <div className="pl-2 pt-1 space-y-1">
            <p>Mounted: {String(mounted)}</p>
            <p>Renders: {renderCount.current}</p>
            <p>Current sun Sign: {planetaryPositions?.sun?.sign || 'unknown'} {planetaryPositions?.sun ? `${planetaryPositions.sun.degree}°` : ''}</p>
            <p>Planetary Hour: {planetaryHour}</p>
            <p>Lunar Phase: {lunarPhase}</p>
            <p>Time of Day: {timeOfDay}</p>
            <p>Season: {currentSeason}</p>
          </div>
        )}
      </div>
      
      {/* Chart Section */}
      <div className="mb-2">
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-black/40 px-1 rounded"
          onClick={() => toggleSection('chart')}
        >
          <h4 className="font-semibold">Chart Data</h4>
          <span>{expanded.chart ? '▼' : '►'}</span>
        </div>
        
        {expanded.chart && (
          <div className="pl-2 pt-1">
            <p className="font-bold">Alchemical Tokens:</p>
            <ul className="pl-4">
              <li>{tokenSymbol} Spirit: {stateTokens.spirit.toFixed(4)}</li>
              <li>{tokenSymbol} Essence: {stateTokens.essence.toFixed(4)}</li>
              <li>{tokenSymbol} Matter: {stateTokens.matter.toFixed(4)}</li>
              <li>{tokenSymbol} Substance: {stateTokens.substance.toFixed(4)}</li>
            </ul>
            
            <p className="font-bold mt-2">Chart Tokens:</p>
            <ul className="pl-4">
              <li>{tokenSymbol} Spirit: {chartTokens.spirit.toFixed(4)}</li>
              <li>{tokenSymbol} Essence: {chartTokens.essence.toFixed(4)}</li>
              <li>{tokenSymbol} Matter: {chartTokens.matter.toFixed(4)}</li>
              <li>{tokenSymbol} Substance: {chartTokens.substance.toFixed(4)}</li>
            </ul>
            
            <p className="font-bold mt-2">Total Values (alchm.xyz format):</p>
            <ul className="pl-4">
              <li>Total Spirit: {rawTokens.spirit}</li>
              <li>Total Essence: {rawTokens.essence}</li>
              <li>Total Matter: {rawTokens.matter}</li>
              <li>Total Substance: {rawTokens.substance}</li>
            </ul>
            
            <p className="font-bold mt-2">Thermodynamic Properties:</p>
            <ul className="pl-4">
              <li>Heat: {thermodynamicProps.heat.toFixed(6)}</li>
              <li>Entropy: {thermodynamicProps.entropy.toFixed(6)}</li>
              <li>Reactivity: {thermodynamicProps.reactivity.toFixed(6)}</li>
              <li>Energy: {thermodynamicProps.energy.toFixed(6)}</li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Elements Section */}
      <div className="mb-2">
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-black/40 px-1 rounded"
          onClick={() => toggleSection('elements')}
        >
          <h4 className="font-semibold">Elemental Balance</h4>
          <span>{expanded.elements ? '▼' : '►'}</span>
        </div>
        
        {expanded.elements && (
          <div className="pl-2 pt-1">
            <p className="font-bold mb-2">Dominant Element: {dominantElement}</p>
            
            <div className="flex flex-wrap">
              {Object.entries(stateElemental).map(([element, value]) => (
                <div key={element} className="w-1/2 p-1">
                  <div className="text-center">{element}</div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${getElementColor(element)}`}
                      style={{ width: `${Number(value) * 100}%` }}
                    />
                  </div>
                  <div className="text-center text-[10px]">{(Number(value) * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
            
            <div className="mt-2">
              <p className="font-bold">Chart Elemental Profile:</p>
              <div className="flex flex-wrap">
                {Object.entries(chartElemental).map(([element, value]) => (
                  <div key={element} className="w-1/2 p-1">
                    <div className="text-center">{element}</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${getElementColor(element)}`}
                        style={{ width: `${Number(value) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-[10px]">{(Number(value) * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Performance Section */}
      <div className="mb-2">
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-black/40 px-1 rounded"
          onClick={() => toggleSection('performance')}
        >
          <h4 className="font-semibold">Performance</h4>
          <span>{expanded.performance ? '▼' : '►'}</span>
        </div>
        
        {expanded.performance && (
          <div className="pl-2 pt-1">
            <div className="text-[10px] space-y-1">
              <p>Memory: {formatMemoryUsage((performance as any)?.memory?.usedJSHeapSize)}</p>
              <p>Last Updated: {lastUpdated.toISOString()}</p>
              
              {perfMetrics.length > 0 ? (
                <div>
                  <p className="font-bold">Component Render Times:</p>
                  <ul className="pl-2">
                    {perfMetrics.map((metric, idx) => (
                      <li key={idx}>
                        {metric.componentName}: {metric.renderTime.toFixed(2)}ms
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No performance metrics available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to format memory usage
function formatMemoryUsage(bytes?: number): string {
  if (!bytes) return 'N/A';
  
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

// Helper function to get element color
function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    'Fire': 'bg-red-500',
    'Water': 'bg-blue-500',
    'Earth': 'bg-green-500',
    'Air': 'bg-yellow-500'
  };
  
  return colors[element] || 'bg-gray-500';
}

// Create a client-only wrapper for the debugger (no SSR)
export const StateDebugger = dynamic(
  () => Promise.resolve(function StateDebuggerWrapper() {
    const { state, planetaryPositions } = useAlchemical()
    const { chart } = useCurrentChart()
    
    // Don't render anything in production
    if (process.env.NODE_ENV !== 'development') {
      return null
    }
    
    return <StateDebuggerContent state={state} planetaryPositions={planetaryPositions} chart={chart} />
  }),
  { ssr: false } // This is the key - disabling SSR for this component
); 
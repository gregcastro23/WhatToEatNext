'use client';

import { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { createLogger } from '@/utils/logger';
import { calculatePlanetaryHour } from '@/lib/PlanetaryHourCalculator';
import { safeCalculatePlanetaryPositions } from '@/utils/safeAstrology';

// Add missing functions with stable return values for SSR
function getMoonIllumination() {
  // Consistent value for server/client hydration
  return 0.75; // Fixed value to avoid hydration mismatch
}

function calculateLunarPhase() {
  // Consistent value for server/client hydration
  return 12.09; // Updated value to avoid hydration mismatch
}

function getLunarPhaseName(age: number) {
  // Simplified implementation
  if (age < 1.5) return 'new moon';
  if (age < 7) return 'waxing crescent';
  if (age < 10) return 'first quarter';
  if (age < 14) return 'waxing gibbous';
  if (age < 16) return 'full moon';
  if (age < 21) return 'waning gibbous';
  if (age < 24) return 'last quarter';
  return 'waning crescent';
}

// Create a logger
const logger = createLogger('StateDebugger');

export default function StateDebugger() {
  const { state, planetaryPositions, refreshPlanetaryPositions } = useAlchemical();
  const [mounted, setMounted] = useState(false);
  const [renderCount, setRenderCount] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Client-side only values for moon data - only use after mounted
  const [clientValues, setClientValues] = useState({
    moonIllumination: 0,
    lunarAge: 0,
    lunarPhase: ''
  });
  
  // Update lunar values after component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Now it's safe to use random values or different calculations client-side
    const illumination = getMoonIllumination() * 100;
    const age = calculateLunarPhase();
    
    setClientValues({
      moonIllumination: illumination,
      lunarAge: age,
      lunarPhase: getLunarPhaseName(age)
    });
    
    logger.info('StateDebugger mounted');
  }, []);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
    logger.info('State updated:', {
      currentSeason: state?.currentSeason,
      timeOfDay: state?.timeOfDay,
      elementalBalance: state?.elementalPreference,
      astrologicalState: state?.astrologicalState,
      currentEnergy: state?.currentEnergy,
    });
  }, [state]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Extract alchemical values if available
  let spiritValue = 0;
  let essenceValue = 0;
  let matterValue = 0;
  let substanceValue = 0;

  if (state?.astrologicalState?.alchemicalValues) {
    spiritValue = state.astrologicalState.alchemicalValues.Spirit || 0;
    essenceValue = state.astrologicalState.alchemicalValues.Essence || 0;
    matterValue = state.astrologicalState.alchemicalValues.Matter || 0;
    substanceValue = state.astrologicalState.alchemicalValues.Substance || 0;
  }

  // Token symbol for display
  let tokenSymbol = '⦿';
  
  // Toggle section expansion
  let toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Format percentage value
  let formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Use fixed values for server rendering and during hydration
  const moonIllumination = mounted ? clientValues.moonIllumination : 92;
  const lunarAge = mounted ? clientValues.lunarAge : 12.09;
  const lunarPhase = mounted ? clientValues.lunarPhase : 'waxing gibbous';
  
  // Get planetary hour from state or use fallback
  let planetaryHour = state?.astrologicalState?.planetaryHour || 'Unknown';

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs w-80 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <button 
          onClick={() => refreshPlanetaryPositions()} 
          className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="space-y-1 mb-2 border-b border-gray-700 pb-2">
        <p>Mounted: {String(mounted)}</p>
        <p>Renders: {renderCount}</p>
      </div>
      
      {/* Basic Astrological Info */}
      <div className="mb-2 border-b border-gray-700 pb-2">
        <p>Current Sun Sign: <span className="font-semibold text-yellow-400">{state?.astrologicalState?.sunSign || planetaryPositions?.sun?.sign || 'unknown'}</span></p>
        <p>
          Planetary Hour: <span className="font-semibold text-purple-400">{planetaryHour}</span>
        </p>
        <p>
          Lunar Phase: <span className="font-semibold text-blue-400">{lunarPhase}</span>
          <span className="text-gray-400 ml-1">
            {`${moonIllumination.toFixed(0)}%, ${lunarAge.toFixed(2)} days old`}
          </span>
        </p>
      </div>
      
      {/* Alchemical Tokens */}
      <div className="mb-2">
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-gray-800 px-1 rounded"
          onClick={() => toggleSection('alchemical')}
        >
          <p className="font-bold">Alchemical Tokens:</p>
          <span>{expandedSection === 'alchemical' ? '▼' : '▶'}</span>
        </div>
        
        {(expandedSection === 'alchemical' || !expandedSection) && (
          <ul className="pl-2 mt-1 space-y-1">
            <li>
              {tokenSymbol} Spirit: <span className="font-mono">{spiritValue.toFixed(4)}</span>
            </li>
            <li>
              {tokenSymbol} Essence: <span className="font-mono">{essenceValue.toFixed(4)}</span>
            </li>
            <li>
              {tokenSymbol} Matter: <span className="font-mono">{matterValue.toFixed(4)}</span>
            </li>
            <li>
              {tokenSymbol} Substance: <span className="font-mono">{substanceValue.toFixed(4)}</span>
            </li>
          </ul>
        )}
      </div>
      
      {/* Elemental Balance */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer hover:bg-gray-800 px-1 rounded"
          onClick={() => toggleSection('elements')}
        >
          <p className="font-bold">Elemental Balance:</p>
          <span>{expandedSection === 'elements' ? '▼' : '▶'}</span>
        </div>
        
        {(expandedSection === 'elements' || !expandedSection) && (
          <div className="mt-1 space-y-1">
            {Object.entries(state?.elementalPreference || {}).map(([element, value]) => (
              <div key={element} className="flex items-center">
                <div className="w-12">{element}:</div>
                <div className="flex-grow bg-gray-700 h-1.5 rounded-full mx-1">
                  <div 
                    className={`h-1.5 rounded-full ${
                      element === 'Fire' ? 'bg-red-500' : 
                      element === 'Water' ? 'bg-blue-500' : 
                      element === 'Earth' ? 'bg-green-500' : 
                      'bg-purple-500'
                    }`}
                    style={{width: `${(value as number || 0) * 100}%`}}
                  ></div>
                </div>
                <div className="w-12 text-right">{formatPercentage(value as number || 0)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700 text-center text-[10px] text-gray-500">
        <span>Click sections to expand/collapse • Access full debug at <a href="/debug" className="underline">Debug Page</a></span>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';

const DebugInfo = memo(function DebugInfo() {
  const renderCountRef = useRef(1); // Initialize with 1 for the first render
  const hasRenderedRef = useRef(false);
  const { planetaryPositions, state } = useAlchemical();
  const [expandedSections, setExpandedSections] = useState({
    system: true,
    astrological: false,
    alchemical: false,
    elemental: false,
    thermodynamic: false,
    performance: false
  });
  const [stateHistory, setStateHistory] = useState<Array<{
    timestamp: number;
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  }>>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Only run once to mark component as mounted
  useEffect(() => {
    if (!hasRenderedRef.current) {
      hasRenderedRef.current = true;
    }
    
    // Track state changes for visualization
    const interval = setInterval(() => {
      if (state?.alchemicalValues) {
        setStateHistory(prev => {
          const newEntry = {
            timestamp: Date.now(),
            spirit: state.alchemicalValues.Spirit || 0,
            essence: state.alchemicalValues.Essence || 0,
            matter: state.alchemicalValues.Matter || 0,
            substance: state.alchemicalValues.Substance || 0
          };
          // Keep last 10 entries
          return [...prev.slice(-9), newEntry];
        });
        setLastUpdate(Date.now());
      }
    }, 5000);
    
    // Cleanup function to prevent memory leaks
    return () => {
      hasRenderedRef.current = false;
      clearInterval(interval);
    };
  }, [state]);

  // Only increment for renders after the initial one
  if (hasRenderedRef.current) {
    renderCountRef.current += 1;
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const renderProgressBar = (value: number, max: number = 1) => {
    const percentage = (value / max) * 100;
  return (
      <div className="h-4 bg-gray-200 rounded w-full">
        <div 
          className="h-full bg-blue-500 rounded" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // Calculate thermodynamic properties based on planetary positions and elemental balance
  const calculateThermodynamicProperties = () => {
    const elementalState = state?.elementalState || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    const alchemicalValues = state?.alchemicalValues || { Spirit: 0.25, Essence: 0.25, Matter: 0.25, Substance: 0.25 };
    
    // Extract the necessary values with safe fallbacks
    const fire = elementalState.Fire || 0.25;
    const water = elementalState.Water || 0.25;
    const earth = elementalState.Earth || 0.25;
    const air = elementalState.Air || 0.25;
    
    const spirit = alchemicalValues.Spirit || 0.25;
    const essence = alchemicalValues.Essence || 0.25;
    const matter = alchemicalValues.Matter || 0.25;
    const substance = alchemicalValues.Substance || 0.25;
    
    // Make sure we have non-zero values to avoid division by zero
    const safeValue = (val: number) => Math.max(val, 0.01);
    
    // Heat formula based on elementalUtils.ts: 
    // (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
    let heat = (Math.pow(safeValue(spirit), 2) + Math.pow(safeValue(fire), 2)) / 
              Math.pow(safeValue(substance + essence + matter + water + air + earth), 2);
              
    // Entropy formula:
    // (spirit^2 + substance^2 + fire^2 + air^2) / (essence + matter + earth + water)^2
    let entropy = (Math.pow(safeValue(spirit), 2) + Math.pow(safeValue(substance), 2) + 
                 Math.pow(safeValue(fire), 2) + Math.pow(safeValue(air), 2)) / 
                 Math.pow(safeValue(essence + matter + earth + water), 2);
                 
    // Reactivity formula:
    // (spirit^2 + substance^2 + essence^2 + fire^2 + air^2 + water^2) / (matter + earth)^2
    let reactivity = (Math.pow(safeValue(spirit), 2) + Math.pow(safeValue(substance), 2) + 
                     Math.pow(safeValue(essence), 2) + Math.pow(safeValue(fire), 2) + 
                     Math.pow(safeValue(air), 2) + Math.pow(safeValue(water), 2)) / 
                     Math.pow(safeValue(matter + earth), 2);
    
    // Apply modifiers based on planetary positions if available
    if (planetaryPositions) {
      // Mars increases heat and reactivity
      if (planetaryPositions.mars?.sign === 'Aries' || planetaryPositions.mars?.sign === 'Leo') {
        heat += 0.15;
        reactivity += 0.05;
      }
      
      // mercury increases entropy
      if (planetaryPositions.mercury?.sign === 'Gemini' || planetaryPositions.mercury?.sign === 'Virgo') {
        entropy += 0.12;
      }
      
      // Jupiter affects entropy and reactivity
      if (planetaryPositions.jupiter?.sign === 'Sagittarius' || planetaryPositions.jupiter?.sign === 'Pisces') {
        entropy += 0.08;
        reactivity += 0.1;
      }
      
      // Moon in water signs increases reactivity
      if (planetaryPositions.moon?.sign === 'Cancer' || planetaryPositions.moon?.sign === 'Scorpio' || 
          planetaryPositions.moon?.sign === 'Pisces') {
        reactivity += 0.08;
      }
      
      // sun in fire signs increases heat
      if (planetaryPositions.sun?.sign === 'Aries' || planetaryPositions.sun?.sign === 'Leo' || 
          planetaryPositions.sun?.sign === 'Sagittarius') {
        heat += 0.1;
      }
      
      // Uranus increases entropy dramatically
      if (planetaryPositions.uranus?.sign === 'Aquarius') {
        entropy += 0.18;
      }
      
      // Neptune in water signs increases entropy
      if (planetaryPositions.neptune?.sign === 'Pisces') {
        entropy += 0.15;
        heat -= 0.05; // Cooling effect
      }
      
      // Saturn in earth signs decreases reactivity but increases stability
      if (planetaryPositions.saturn?.sign === 'Capricorn' || planetaryPositions.saturn?.sign === 'Taurus') {
        reactivity -= 0.1;
        heat -= 0.05;
      }
    }
    
    // Apply lunar phase modifiers - these have significant effects
    if (state?.lunarPhase) {
      const phaseLower = state.lunarPhase.toLowerCase();
      
      if (phaseLower.includes('new moon')) {
        // New moon - subtle energy, reduced reactivity
        reactivity -= 0.05;
        heat -= 0.07;
      } else if (phaseLower.includes('full moon')) {
        // Full moon - heightened energy, increased reactivity
        reactivity += 0.1;
        heat += 0.05;
        entropy += 0.05;
      } else if (phaseLower.includes('waxing')) {
        // Waxing - increasing energy
        heat += 0.05;
      } else if (phaseLower.includes('waning')) {
        // Waning - decreasing energy, increasing entropy
        heat -= 0.03;
        entropy += 0.05;
      }
    }
    
    // Apply time of day effects
    if (state?.timeOfDay) {
      const timeLower = state.timeOfDay.toLowerCase();
      
      if (timeLower.includes('morning')) {
        // Morning - fresh energy
        heat += 0.03;
        reactivity += 0.02;
      } else if (timeLower.includes('night')) {
        // Night - reduced heat, increased entropy
        heat -= 0.05;
        entropy += 0.03;
      } else if (timeLower.includes('evening')) {
        // Evening - transition state
        entropy += 0.04;
      }
    }
    
    // Apply seasonal effects
    if (state?.currentSeason) {
      const seasonLower = state.currentSeason.toLowerCase();
      
      if (seasonLower.includes('summer')) {
        heat += 0.08;
      } else if (seasonLower.includes('winter')) {
        heat -= 0.08;
        reactivity -= 0.03;
      } else if (seasonLower.includes('spring')) {
        reactivity += 0.06;
      } else if (seasonLower.includes('autumn') || seasonLower.includes('fall')) {
        entropy += 0.07;
      }
    }
    
    // Normalize values to 0-1 range
    return {
      heat: Math.min(Math.max(heat, 0), 1),
      entropy: Math.min(Math.max(entropy, 0), 1),
      reactivity: Math.min(Math.max(reactivity, 0), 1)
    };
  };

  // Get the thermodynamic properties
  const thermodynamicProps = calculateThermodynamicProperties();

  const renderSystemSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('system')}
      >
        <h3 className="font-medium">System Info</h3>
        <span>{expandedSections.system ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.system && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
        <p>Mounted: {hasRenderedRef.current ? 'true' : 'false'}</p>
        <p>Renders: {renderCountRef.current}</p>
          <p>Last Update: {formatTimeAgo(lastUpdate)}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>Time of Day: {state?.timeOfDay || 'Unknown'}</p>
          <p>Season: {state?.currentSeason || 'Unknown'}</p>
        </div>
      )}
    </div>
  );

  const renderAstrologicalSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('astrological')}
      >
        <h3 className="font-medium">Astrological State</h3>
        <span>{expandedSections.astrological ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.astrological && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
          <div className="grid grid-cols-2 gap-2">
            <p className="text-sm"><span className="font-medium">sun:</span> {planetaryPositions?.sun?.sign || 'unknown'}</p>
            <p className="text-sm"><span className="font-medium">Moon:</span> {planetaryPositions?.moon?.sign || 'unknown'}</p>
            <p className="text-sm"><span className="font-medium">mercury:</span> {planetaryPositions?.mercury?.sign || 'unknown'}</p>
            <p className="text-sm"><span className="font-medium">venus:</span> {planetaryPositions?.venus?.sign || 'unknown'}</p>
            <p className="text-sm"><span className="font-medium">Mars:</span> {planetaryPositions?.mars?.sign || 'unknown'}</p>
            <p className="text-sm"><span className="font-medium">Jupiter:</span> {planetaryPositions?.jupiter?.sign || 'unknown'}</p>
          </div>
          <p className="mt-2"><span className="font-medium">Planetary Hour:</span> {state?.astrologicalState?.planetaryHour || 'Unknown'}</p>
          <p><span className="font-medium">Lunar Phase:</span> {state?.lunarPhase || 'Unknown'}</p>
        </div>
      )}
    </div>
  );

  const renderAlchemicalSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('alchemical')}
      >
        <h3 className="font-medium">Alchemical Tokens</h3>
        <span>{expandedSections.alchemical ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.alchemical && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between">
                <span>⦿ Spirit</span>
                <span>{state?.alchemicalValues?.Spirit.toFixed(4) || '0.0000'}</span>
              </div>
              {renderProgressBar(state?.alchemicalValues?.Spirit || 0)}
            </div>
            <div>
              <div className="flex justify-between">
                <span>⦿ Essence</span>
                <span>{state?.alchemicalValues?.Essence.toFixed(4) || '0.0000'}</span>
              </div>
              {renderProgressBar(state?.alchemicalValues?.Essence || 0)}
            </div>
            <div>
              <div className="flex justify-between">
                <span>⦿ Matter</span>
                <span>{state?.alchemicalValues?.Matter.toFixed(4) || '0.0000'}</span>
              </div>
              {renderProgressBar(state?.alchemicalValues?.Matter || 0)}
            </div>
            <div>
              <div className="flex justify-between">
                <span>⦿ Substance</span>
                <span>{state?.alchemicalValues?.Substance.toFixed(4) || '0.0000'}</span>
              </div>
              {renderProgressBar(state?.alchemicalValues?.Substance || 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderElementalSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('elemental')}
      >
        <h3 className="font-medium">Elemental Balance</h3>
        <span>{expandedSections.elemental ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.elemental && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between">
                <span className="text-red-500">Fire</span>
                <span>{(state?.elementalState?.Fire * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-red-500 rounded" 
                  style={{ width: `${(state?.elementalState?.Fire || 0) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-blue-500">Water</span>
                <span>{(state?.elementalState?.Water * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${(state?.elementalState?.Water || 0) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-green-500">Earth</span>
                <span>{(state?.elementalState?.Earth * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-green-500 rounded" 
                  style={{ width: `${(state?.elementalState?.Earth || 0) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-purple-500">Air</span>
                <span>{(state?.elementalState?.Air * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-purple-500 rounded" 
                  style={{ width: `${(state?.elementalState?.Air || 0) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderThermodynamicSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('thermodynamic')}
      >
        <h3 className="font-medium">Thermodynamic Properties</h3>
        <span>{expandedSections.thermodynamic ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.thermodynamic && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between">
                <span className="text-orange-500">Heat</span>
                <span>{(thermodynamicProps.heat * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-orange-500 rounded" 
                  style={{ width: `${thermodynamicProps.heat * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-teal-500">Entropy</span>
                <span>{(thermodynamicProps.entropy * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-teal-500 rounded" 
                  style={{ width: `${thermodynamicProps.entropy * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-indigo-500">Reactivity</span>
                <span>{(thermodynamicProps.reactivity * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full">
                <div 
                  className="h-full bg-indigo-500 rounded" 
                  style={{ width: `${thermodynamicProps.reactivity * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformanceSection = () => (
    <div className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleSection('performance')}
      >
        <h3 className="font-medium">Performance History</h3>
        <span>{expandedSections.performance ? '▼' : '►'}</span>
      </div>
      
      {expandedSections.performance && (
        <div className="pl-2 mt-2 border-l-2 border-gray-300">
          <div className="space-y-1">
            {stateHistory.length > 0 ? (
              <div className="text-xs">
                <div className="grid grid-cols-5 gap-1 font-medium mb-1">
                  <div>Time</div>
                  <div>Spirit</div>
                  <div>Essence</div>
                  <div>Matter</div>
                  <div>Substance</div>
                </div>
                {stateHistory.map((entry, index) => (
                  <div key={index} className="grid grid-cols-5 gap-1">
                    <div>{formatTimeAgo(entry.timestamp)}</div>
                    <div>{entry.spirit.toFixed(3)}</div>
                    <div>{entry.essence.toFixed(3)}</div>
                    <div>{entry.matter.toFixed(3)}</div>
                    <div>{entry.substance.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No state history recorded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg my-4 text-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-gray-200">Debug Panel</h2>
        <div className="space-x-2">
          <button 
            onClick={() => setStateHistory([])}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear History
          </button>
          <button 
            onClick={() => console.log('Current State:', state)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Log State
          </button>
        </div>
      </div>

      <div className="space-y-2 dark:text-gray-300">
        {renderSystemSection()}
        {renderAstrologicalSection()}
        {renderAlchemicalSection()}
        {renderElementalSection()}
        {renderThermodynamicSection()}
        {renderPerformanceSection()}
      </div>
    </div>
  );
});

export default DebugInfo; 
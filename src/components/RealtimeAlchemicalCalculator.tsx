import React from 'react';

import { useRealtimePlanetaryPositions } from '@/hooks/useRealtimePlanetaryPositions';
import { Element } from "@/types/alchemy";
import type { PlanetPosition } from '@/utils/astrologyUtils';

// Alchemical calculation functions (based on your notepad)
function calculateHeat(
  Spirit: number, Fire: number, Substance: number, Essence: number,
  Matter: number, Water: number, Air: number, Earth: number
): number {
  const numerator = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
  const denominator = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateEntropy(
  Spirit: number, Substance: number, Fire: number, Air: number,
  Essence: number, Matter: number, Earth: number, Water: number
): number {
  const numerator = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
  const denominator = Math.pow(Essence + Matter + Earth + Water, 2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateReactivity(
  Spirit: number, Substance: number, Essence: number, Fire: number,
  Air: number, Water: number, Matter: number, Earth: number
): number {
  const numerator = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2)
    + Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2);
  const denominator = Math.pow(Matter + Earth, 2);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateGregsEnergy(heat: number, entropy: number, reactivity: number): number {
  return heat - (entropy * reactivity);
}

function calculateKAlchm(Spirit: number, Essence: number, Matter: number, Substance: number): number {
  if (Matter === 0 || Substance === 0) return 0;
  return (Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence)) /
         (Math.pow(Matter, Matter) * Math.pow(Substance, Substance));
}

function calculateMonicaConstant(gregsEnergy: number, reactivity: number, K_alchm: number): number {
  const ln_K = Math.log(K_alchm);
  if (K_alchm > 0 && ln_K !== 0 && reactivity !== 0) {
    return -gregsEnergy / (reactivity * ln_K);
  } else {
    return NaN;
  }
}

// Convert planetary positions to alchemical values using sophisticated mapping
function planetaryPositionsToAlchemicalValues(positions: { [key: string]: any }) {
  // Element mapping based on zodiac signs
  const elementMap: { [key: string]: string } = {
    aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
    taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth', 
    gemini: 'Air', libra: 'Air', aquarius: 'Air',
    cancer: 'Water', scorpio: 'Water', pisces: 'Water'
  };

  // Planetary elemental affinities and alchemical properties
  const planetaryAlchemy: { [key: string]: { Spirit: number, Essence: number, Matter: number, Substance: number } } = {
    Sun: { Spirit: 3, Essence: 0, Matter: 0, Substance: 0 },
    moon: { Spirit: 0, Essence: 3, Matter: 1, Substance: 0 },
    Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 2 },
    Venus: { Spirit: 0, Essence: 2, Matter: 2, Substance: 0 },
    Mars: { Spirit: 0, Essence: 2, Matter: 1, Substance: 0 },
    Jupiter: { Spirit: 2, Essence: 1, Matter: 0, Substance: 0 },
    Saturn: { Spirit: 1, Essence: 0, Matter: 2, Substance: 0 },
    Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
    Neptune: { Spirit: 0, Essence: 2, Matter: 0, Substance: 1 },
    Pluto: { Spirit: 0, Essence: 1, Matter: 2, Substance: 0 }
  };

  // Initialize counters
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  let Spirit = 0, Essence = 0, Matter = 0, Substance = 0;

  // Process each planetary position
  Object.entries(positions || {}).forEach(([planet, position]) => {
    if (!position || typeof position !== 'object') return;
    
    // Get element from sign
    const sign = position.sign?.toLowerCase();
    const element = elementMap[sign];
    if (element) {
      elementCounts[element as keyof typeof elementCounts]++;
    }

    // Add planetary alchemical properties
    const alchemy = planetaryAlchemy[planet];
    if (alchemy) {
      Spirit += alchemy.Spirit;
      Essence += alchemy.Essence;
      Matter += alchemy.Matter;
      Substance += alchemy.Substance;
    }
  });

  // Normalize elemental values (convert to 0-1 scale for calculations)
  const totalPlanets = Object.keys(positions || {}).length || 1;
  const Fire = elementCounts.Fire / totalPlanets;
  const Water = elementCounts.Water / totalPlanets;
  const Air = elementCounts.Air / totalPlanets;
  const Earth = elementCounts.Earth / totalPlanets;

  return { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth };
}

export default function RealtimeAlchemicalCalculator() {
  const { 
    positions, 
    loading, 
    error, 
    lastUpdated, 
    source, 
    refresh, 
    isRealtime, 
    isConnected 
  } = useRealtimePlanetaryPositions({
    refreshInterval: 0, // Disabled to prevent API spam
    autoStart: true // Enable auto-start to get initial data
  });

  if (loading && !positions) {
    return (
      <div className="p-6 bg-purple-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span>Loading real-time planetary positions from astrologize API...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry with astrologize API
        </button>
      </div>
    );
  }

  if (!positions) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p>No planetary data available</p>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load Real Data
        </button>
      </div>
    );
  }

  // Calculate alchemical values from current planetary positions
  const alchemicalValues = planetaryPositionsToAlchemicalValues(positions);
  const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } = alchemicalValues;

  // Perform Kalchm and Monica constant calculations
  const heat = calculateHeat(Spirit, Fire, Substance, Essence, Matter, Water, Air, Earth);
  const entropy = calculateEntropy(Spirit, Substance, Fire, Air, Essence, Matter, Earth, Water);
  const reactivity = calculateReactivity(Spirit, Substance, Essence, Fire, Air, Water, Matter, Earth);
  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);
  const K_alchm = calculateKAlchm(Spirit, Essence, Matter, Substance);
  const monicaConstant = calculateMonicaConstant(gregsEnergy, reactivity, K_alchm);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Real-time Alchemical Calculator</h2>
            <p className="opacity-90">Kalchm &amp; Monica Constant System</p>
            <p className="text-sm opacity-75">
              {source?.includes('astrologize') ? '✨ Using Real Astrologize Calculations' : '⚠️ Using Fallback Data'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
            <p className="text-sm opacity-75">
              {isRealtime ? 'Real-time data' : 'Cached data'}
            </p>
            {lastUpdated && (
              <p className="text-xs opacity-60">
                Updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <button 
              onClick={refresh}
              className="mt-1 text-xs bg-white bg-opacity-20 px-2 py-1 rounded hover:bg-opacity-30"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Current Planetary Positions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Current Planetary Positions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(positions || {}).map(([planet, position]) => (
            <div key={planet} className="text-center p-3 bg-gray-50 rounded">
              <div className="font-semibold text-gray-800">{planet}</div>
              <div className="text-sm text-gray-600 capitalize">{position.sign}</div>
              <div className="text-xs text-gray-500">
                {position.degree}°{position.minute || 0}'
              </div>
              {position.isRetrograde && (
                <div className="text-xs text-red-500">Retrograde</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Data source: {source || 'Unknown'}
        </div>
      </div>

      {/* Alchemical Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Elemental Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Alchemical Components</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Spirit:</span>
              <span className="text-purple-600">{Spirit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Essence:</span>
              <span className="text-blue-600">{Essence.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Matter:</span>
              <span className="text-green-600">{Matter.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Substance:</span>
              <span className="text-orange-600">{Substance.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold">Elemental Balance</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-red-600">Fire:</span>
                <span>{(Fire * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Water:</span>
                <span>{(Water * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Air:</span>
                <span>{(Air * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Earth:</span>
                <span>{(Earth * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermodynamic Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Thermodynamic Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Heat:</span>
              <span className="text-red-600">{heat.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Entropy:</span>
              <span className="text-orange-600">{entropy.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reactivity:</span>
              <span className="text-yellow-600">{reactivity.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Greg's Energy:</span>
              <span className="text-green-600">{gregsEnergy.toFixed(4)}</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Advanced Constants</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>K_alchm:</span>
                <span className="text-purple-600">{K_alchm.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Monica Constant:</span>
                <span className="text-indigo-600">
                  {isNaN(monicaConstant) ? 'Undefined' : monicaConstant.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretive Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Alchemical Interpretation</h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Dominant Alchemical Quality:</strong> {
              Math.max(Spirit, Essence, Matter, Substance) === Spirit ? 'Spirit (Active Principle)' :
              Math.max(Spirit, Essence, Matter, Substance) === Essence ? 'Essence (Vital Force)' :
              Math.max(Spirit, Essence, Matter, Substance) === Matter ? 'Matter (Physical Form)' :
              'Substance (Structural Foundation)'
            }
          </p>
          <p>
            <strong>Elemental Emphasis:</strong> {
              Math.max(Fire, Water, Air, Earth) === Fire ? 'Fire (Creative Energy)' :
              Math.max(Fire, Water, Air, Earth) === Water ? 'Water (Emotional Flow)' :
              Math.max(Fire, Water, Air, Earth) === Air ? 'Air (Mental Activity)' :
              'Earth (Material Stability)'
            }
          </p>
          <p>
            <strong>System State:</strong> {
              gregsEnergy > 0 ? 
                gregsEnergy > 0.1 ? 'High Energy - Dynamic Phase' : 'Moderate Energy - Balanced Phase' :
                'Low Energy - Consolidation Phase'
            }
          </p>
        </div>
      </div>
    </div>
  );
} 
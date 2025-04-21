'use client';

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { useCurrentChart } from '../hooks/useCurrentChart';

// Mapping for element colors
const elementColors = {
  Fire: 'text-red-500',
  Water: 'text-blue-500',
  Earth: 'text-green-500',
  Air: 'text-purple-500'
};

// Mapping for zodiac sign to element
const zodiacElements = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water'
};

// Mapping for zodiac sign to modality
const zodiacModalities = {
  aries: 'Cardinal',
  taurus: 'Fixed',
  gemini: 'Mutable',
  cancer: 'Cardinal',
  leo: 'Fixed',
  virgo: 'Mutable',
  libra: 'Cardinal',
  scorpio: 'Fixed',
  sagittarius: 'Mutable',
  capricorn: 'Cardinal',
  aquarius: 'Fixed',
  pisces: 'Mutable'
};

// Zodiac sign symbols
const zodiacSymbols = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓'
};

// Planet symbols
const planetSymbols = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

const AstroDebug: React.FC = () => {
  const { planetaryPositions, state } = useAlchemical();
  const { chart } = useCurrentChart();
  const [expanded, setExpanded] = useState(false);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [aspectList, setAspectList] = useState<any[]>([]);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    // Calculate aspects between planets
    if (planetaryPositions) {
      const aspects = calculateAspects(planetaryPositions);
      setAspectList(aspects);
    }
  }, [planetaryPositions]);

  // Calculate planetary aspects (simplified version for debug)
  const calculateAspects = (positions) => {
    const aspects = [];
    const planets = Object.keys(positions).filter(key => positions[key]?.sign);
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const pos1 = positions[planet1];
        const pos2 = positions[planet2];
        
        if (pos1 && pos2 && pos1.position !== undefined && pos2.position !== undefined) {
          const angle = Math.abs(pos1.position - pos2.position);
          const normalizedAngle = angle > 180 ? 360 - angle : angle;
          
          let aspectType = '';
          if (Math.abs(normalizedAngle - 0) <= 10) aspectType = 'Conjunction';
          else if (Math.abs(normalizedAngle - 60) <= 10) aspectType = 'Sextile';
          else if (Math.abs(normalizedAngle - 90) <= 10) aspectType = 'Square';
          else if (Math.abs(normalizedAngle - 120) <= 10) aspectType = 'Trine';
          else if (Math.abs(normalizedAngle - 180) <= 10) aspectType = 'Opposition';
          
          if (aspectType) {
            aspects.push({
              planet1,
              planet2,
              angle: normalizedAngle.toFixed(1),
              type: aspectType
            });
          }
        }
      }
    }
    
    return aspects;
  };

  // Display details for a specific planet
  const renderPlanetDetails = (planetName) => {
    const planet = planetaryPositions?.[planetName];
    if (!planet || !planet.sign) return null;
    
    const sign = planet.sign.toLowerCase();
    const element = zodiacElements[sign] || 'Unknown';
    const modality = zodiacModalities[sign] || 'Unknown';
    
    return (
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold flex items-center">
          <span className="mr-2">{planetSymbols[planetName] || ''}</span>
          {planetName.charAt(0).toUpperCase() + planetName.slice(1)} Details
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
          <div>Sign:</div>
          <div className="flex items-center">
            <span className="mr-1">{zodiacSymbols[sign] || ''}</span>
            {planet.sign}
          </div>
          <div>Element:</div>
          <div className={elementColors[element] || ''}>
            {element}
          </div>
          <div>Modality:</div>
          <div>{modality}</div>
          <div>Position:</div>
          <div>{planet.degree?.toFixed(2)}°</div>
          <div>House:</div>
          <div>{(planet as any).house || 'Unknown'}</div>
          <div>Retrograde:</div>
          <div>{planet.isRetrograde ? 'Yes' : 'No'}</div>
        </div>
        <div className="mt-3">
          <h4 className="font-medium text-sm">Aspects:</h4>
          <ul className="mt-1 text-xs space-y-1">
            {aspectList
              .filter(aspect => aspect.planet1 === planetName || aspect.planet2 === planetName)
              .map((aspect, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="mr-1">
                    {planetSymbols[aspect.planet1 === planetName ? aspect.planet2 : aspect.planet1] || ''}
                  </span>
                  {aspect.planet1 === planetName ? aspect.planet2 : aspect.planet1}
                  <span className="mx-1">-</span>
                  {aspect.type}
                  <span className="ml-1">({aspect.angle}°)</span>
                </li>
              ))}
            {aspectList.filter(aspect => 
              aspect.planet1 === planetName || aspect.planet2 === planetName
            ).length === 0 && (
              <li className="text-gray-500">No significant aspects</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  // Get the current zodiac season based on sun position
  const getCurrentSeason = () => {
    const sunSign = planetaryPositions?.sun?.sign?.toLowerCase();
    if (!sunSign) return null;
    
    return {
      season: `${sunSign.charAt(0).toUpperCase() + sunSign.slice(1)} Season`,
      element: zodiacElements[sunSign],
      modality: zodiacModalities[sunSign]
    };
  };

  const season = getCurrentSeason();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold dark:text-white">Astrological Debugger</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {showRawData ? 'Show Chart' : 'Show Raw Data'}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Current Astrological Season */}
      {season && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
          <h3 className="font-medium text-sm dark:text-white">Current Cosmic Influence</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>Season:</div>
            <div>{season.season}</div>
            <div>Dominant Element:</div>
            <div className={elementColors[season.element] || ''}>
              {season.element}
            </div>
            <div>Modal Quality:</div>
            <div>{season.modality}</div>
            <div>Lunar Phase:</div>
            <div>{state?.lunarPhase || 'Unknown'}</div>
            <div>Planetary Hour:</div>
            <div>{state?.astrologicalState?.planetaryHour || 'Unknown'}</div>
          </div>
        </div>
      )}

      {/* Show raw data or interactive chart */}
      {showRawData ? (
        <div className="mt-4 text-xs font-mono overflow-x-auto">
          <pre className="p-3 bg-gray-100 dark:bg-gray-700 rounded dark:text-gray-200 max-h-72 overflow-y-auto">
            {JSON.stringify(planetaryPositions, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="font-medium text-sm mb-3 dark:text-white">
            Current Planetary Positions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(planetaryPositions || {})
              .filter(([_, data]) => data?.sign)
              .map(([planet, data]) => {
                const sign = data.sign.toLowerCase();
                const element = zodiacElements[sign];
                
                return (
                  <div
                    key={planet}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      activePlanet === planet 
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                    onClick={() => setActivePlanet(activePlanet === planet ? null : planet)}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <span className="mr-1">{planetSymbols[planet] || ''}</span>
                        <span className="font-medium">{planet.charAt(0).toUpperCase() + planet.slice(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">{zodiacSymbols[sign] || ''}</span>
                        <span>{data.sign}</span>
                      </div>
                    </div>
                    <div className="mt-1 text-xs">
                      <span className={`${elementColors[element] || ''} font-medium`}>
                        {element}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{data.degree?.toFixed(2)}°</span>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Show details for active planet */}
          {activePlanet && renderPlanetDetails(activePlanet)}
          
          {/* Show aspects table if expanded */}
          {expanded && (
            <div className="mt-6">
              <h3 className="font-medium text-sm mb-3 dark:text-white">Planetary Aspects</h3>
              {aspectList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="p-2 text-left">Planet 1</th>
                        <th className="p-2 text-left">Planet 2</th>
                        <th className="p-2 text-left">Aspect</th>
                        <th className="p-2 text-left">Angle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aspectList.map((aspect, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="p-2">{aspect.planet1}</td>
                          <td className="p-2">{aspect.planet2}</td>
                          <td className="p-2">{aspect.type}</td>
                          <td className="p-2">{aspect.angle}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No aspects calculated.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Debug tools */}
      {expanded && (
        <div className="mt-6 border-t pt-4 dark:border-gray-700">
          <h3 className="font-medium text-sm mb-3 dark:text-white">Debug Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => console.log('Chart Data:', chart)}
              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Log Chart Data
            </button>
            <button
              onClick={() => console.log('Planetary Positions:', planetaryPositions)}
              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Log Positions
            </button>
            <button
              onClick={() => console.log('Aspects:', aspectList)}
              className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Log Aspects
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstroDebug; 
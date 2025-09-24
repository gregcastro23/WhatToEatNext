'use client';

import React, { useEffect, useState } from 'react';
import { usePlanetaryKinetics } from '@/hooks/usePlanetaryKinetics';

interface PlanetaryPowerWidgetProps {
  location?: { lat: number; lon: number };
  className?: string;
  compact?: boolean;
}

export default function PlanetaryPowerWidget({
  location = { lat: 40.7128, lon: -74.0060 }, // Default NYC
  className = '',
  compact = false
}: PlanetaryPowerWidgetProps) {
  const {
    kinetics,
    isLoading,
    currentPowerLevel,
    dominantElement,
    seasonalInfluence,
    isOnline
  } = usePlanetaryKinetics({
    location,
    updateInterval: 300000, // Update every 5 minutes
    enableAutoUpdate: true
  });

  const [currentPlanet, setCurrentPlanet] = useState<string>('Sun');
  const [planetaryHour, setPlanetaryHour] = useState<string>('');

  useEffect(() => {
    if (kinetics?.data?.base?.power) {
      const currentHour = new Date().getHours();
      const currentHourData = kinetics.data.base.power.find(p => p.hour === currentHour);
      if (currentHourData) {
        setCurrentPlanet(currentHourData.planetary);
      }
    }
    if (kinetics?.data?.base?.timing?.planetaryHours) {
      setPlanetaryHour(kinetics.data.base.timing.planetaryHours[0] || 'Sun');
    }
  }, [kinetics]);

  const getPlanetSymbol = (planet: string): string => {
    const symbols: Record<string, string> = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄'
    };
    return symbols[planet] || '☉';
  };

  const getElementColor = (element: string): string => {
    const colors: Record<string, string> = {
      'Fire': 'from-red-400 to-orange-500',
      'Water': 'from-blue-400 to-cyan-500',
      'Earth': 'from-green-400 to-emerald-500',
      'Air': 'from-purple-400 to-indigo-500'
    };
    return colors[element] || 'from-gray-400 to-gray-500';
  };

  const getPowerLevelColor = (level: number): string => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-yellow-600';
    if (level >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isOnline && !kinetics) {
    return null; // Hide widget if offline and no cached data
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full shadow-sm ${className}`}>
        <span className="text-2xl" title={`Current: ${currentPlanet}`}>
          {getPlanetSymbol(currentPlanet)}
        </span>
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${getPowerLevelColor(currentPowerLevel)}`}>
            {(currentPowerLevel * 100).toFixed(0)}%
          </span>
          <span className="text-xs text-gray-500">{dominantElement}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Planetary Influence</h3>
        {!isOnline && (
          <span className="text-xs text-gray-400">Offline</span>
        )}
      </div>

      {isLoading && !kinetics ? (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          {/* Current Planetary Hour */}
          <div className="flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-4xl mb-1" title={currentPlanet}>
                {getPlanetSymbol(currentPlanet)}
              </div>
              <div className="text-xs text-gray-600">Hour of {currentPlanet}</div>
            </div>
          </div>

          {/* Power Level */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Power Level</span>
              <span className={`font-semibold ${getPowerLevelColor(currentPowerLevel)}`}>
                {(currentPowerLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  currentPowerLevel >= 0.8 ? 'bg-green-500' :
                  currentPowerLevel >= 0.6 ? 'bg-yellow-500' :
                  currentPowerLevel >= 0.4 ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${currentPowerLevel * 100}%` }}
              />
            </div>
          </div>

          {/* Elemental Dominance */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Dominant Element</span>
              <span className="font-semibold">{dominantElement}</span>
            </div>
            <div className={`h-1 rounded-full bg-gradient-to-r ${getElementColor(dominantElement)}`} />
          </div>

          {/* Elemental Balance Mini Chart */}
          {kinetics?.data?.base?.elemental?.totals && (
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Object.entries(kinetics.data.base.elemental.totals).map(([element, value]) => (
                <div key={element} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{element.substring(0, 3)}</div>
                  <div className="relative h-8">
                    <div className="absolute bottom-0 left-0 right-0 mx-auto w-6">
                      <div
                        className={`w-full bg-gradient-to-t ${getElementColor(element)} rounded-t opacity-75`}
                        style={{ height: `${Math.min(100, (value / 5) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seasonal Influence */}
          <div className="text-xs text-center text-gray-600 pt-2 border-t">
            {seasonalInfluence} Season
          </div>

          {/* Next Planetary Hours */}
          {kinetics?.data?.base?.timing?.planetaryHours && (
            <div className="mt-2 flex justify-center gap-2">
              {kinetics.data.base.timing.planetaryHours.slice(0, 3).map((planet, idx) => (
                <span
                  key={idx}
                  className="text-xs text-gray-400"
                  title={`Upcoming: ${planet}`}
                >
                  {getPlanetSymbol(planet)}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
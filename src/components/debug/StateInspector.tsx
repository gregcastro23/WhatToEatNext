'use client';

import React from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';

export function StateInspector() {
  const { 
    currentZodiac,
    currentPlanetaryAlignment,
    lunarPhase,
    activePlanets,
    domElements,
    loading,
    isReady,
    isDaytime,
    currentPlanetaryHour
  } = useAstrologicalState();

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2 text-yellow-400">Astrological State</h3>
        <div>Loading state...</div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2 text-yellow-400">Astrological State</h3>
        <div>Astrological state not ready.</div>
      </div>
    );
  }

  // Extract main planetary positions for display
  const sunPosition = currentPlanetaryAlignment?.Sun;
  const moonPosition = currentPlanetaryAlignment?.Moon;
  const ascendantPosition = currentPlanetaryAlignment?.Ascendant;

  // Helper function to format planetary position for display
  const formatPosition = (position: any): string => {
    if (!position) return 'N/A';
    if (typeof position === 'string') return position;
    if (typeof position === 'object' && position.sign) {
      const degree = position.degree ? ` ${Math.round(position.degree)}°` : '';
      return `${position.sign}${degree}`;
    }
    return 'N/A';
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2 text-cyan-400">Live Astrological State</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Sun Sign: </span>
          <span>{formatPosition(sunPosition) || currentZodiac || 'N/A'}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Moon Sign: </span>
          <span>{formatPosition(moonPosition)}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Ascendant: </span>
          <span>{formatPosition(ascendantPosition)}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Lunar Phase: </span>
          <span>{lunarPhase || 'N/A'}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Planetary Hour: </span>
          <span>{currentPlanetaryHour || 'N/A'}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="font-semibold text-gray-400">Day/Night: </span>
          <span>{isDaytime ? 'Day' : 'Night'}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded col-span-2">
          <span className="font-semibold text-gray-400">Active Planets: </span>
          <span>{activePlanets?.join(', ') || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
} 
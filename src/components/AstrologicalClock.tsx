'use client';

import { useEffect, useState } from 'react';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import { Clock, Sun, Moon, Star } from 'lucide-react';
import type { ZodiacSign, PlanetaryAlignment, PlanetaryPosition } from '@/types/alchemy';
import { calculatePlanetaryPositions, longitudeToZodiacPosition, getPlanetaryDignity } from '@/utils/astrologyUtils';
import PlanetaryPositionValidation from './PlanetaryPositionValidation';

// Use the imported PlanetaryPosition type directly
function isValidPosition(pos: PlanetaryPosition): boolean {
  return pos && 
         typeof pos.sign === 'string' &&
         typeof pos.degree === 'number' &&
         pos.degree >= 0 && pos.degree < 30;
}

interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  dignity?: string;
  dignityValue?: number;
  dignityDescription?: string;
  exactLongitude?: number; // Add optional exactLongitude
  isRetrograde?: boolean;
}

export default function AstrologicalClock() {
  const { currentPlanetaryAlignment, loading } = useAstrologicalState();
  // The rest of the component can now use currentPlanetaryAlignment directly
  // No need for separate state and useEffect logic

  // Function to render degree symbol with the value
  const formatDegree = (degree: number): string => {
    if (degree === undefined) return '—';
    const wholeDegree = Math.floor(degree);
    const minutes = Math.floor((degree - wholeDegree) * 60);
    return `${wholeDegree}°${minutes}'`;
  };

  // List of planets to display, now including Ascendant
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ascendant'];
  
  // Get dignity color
  const getDignityColor = (dignity: string): string => {
    switch (dignity) {
      case 'Domicile': return 'text-green-400';
      case 'Exaltation': return 'text-blue-400';
      case 'Neutral': return 'text-gray-400';
      case 'Detriment': return 'text-orange-400';
      case 'Fall': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get dignity full name instead of abbreviation
  const getDignityFullName = (dignity: string): string => {
    switch (dignity) {
      case 'D': return 'Domicile';
      case 'E': return 'Exaltation';
      case 'F': return 'Fall';
      case 'DT': return 'Detriment';
      case 'N': 
      default: return 'Neutral';
    }
  };

  // Create zodiac icon mapping
  const getZodiacIcon = (sign: string): string => {
    if (!sign) return '?';
    
    const zodiacSymbols: Record<string, string> = {
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
    
    return zodiacSymbols[sign.toLowerCase()] || '?';
  };
  
  // Create planet icon mapping
  const getPlanetIcon = (planet: string): string => {
    const planetSymbols: Record<string, string> = {
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
    
    return planetSymbols[planet.toLowerCase()] || '?';
  };

  function renderPlanetaryPositions() {
    return Object.entries(currentPlanetaryAlignment).map(([planet, pos]) => {
      // Add null check for exactLongitude
      const longitude = pos.exactLongitude ?? 0;
      return (
        <div key={planet} className="planet-marker" 
             style={{ 
               left: `${(longitude / 360) * 100}%`,
               backgroundColor: isValidPosition(pos) ? 'green' : 'red'
             }}>
          {planet}
        </div>
      );
    });
  }

  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 shadow-lg border border-purple-700">
      <h2 className="text-xl font-medium mb-4 text-white">Current Celestial Positions</h2>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-cyan-300">Calculating planetary positions...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {planets.map((planet) => {
              // Use calculated positions instead of the state values
              const planetData = currentPlanetaryAlignment[planet];
              
              if (!planetData) return null;
              
              return (
                <div key={planet} className="flex items-center justify-between py-1 border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg w-6 text-center text-cyan-300">{getPlanetIcon(planet)}</span>
                    <span className="capitalize text-white font-medium">{planet}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-2xl mr-2 text-yellow-400">{getZodiacIcon(planetData.sign)}</span>
                    <span className="text-cyan-200 text-lg font-mono font-semibold">
                      {formatDegree(planetData.degree)}
                      {planetData.isRetrograde && <span className="ml-1 text-red-400">R</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <PlanetaryPositionValidation />
        </>
      )}
    </div>
  );
} 
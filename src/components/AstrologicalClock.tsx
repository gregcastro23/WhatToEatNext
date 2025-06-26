'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useCurrentChart } from '@/hooks/useCurrentChart';
import { Clock, Sun, Moon, Star, Loader2, Info } from 'lucide-react';
import type { ZodiacSign, PlanetaryAlignment } from '@/types/alchemy';
import { _calculatePlanetaryPositions, longitudeToZodiacPosition, getPlanetaryDignity } from '@/utils/astrologyUtils';
import PlanetaryPositionValidation from './PlanetaryPositionValidation';
import { PlanetInfoModal } from './PlanetInfoModal';

// Define planet and zodiac symbols for the legend
const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Northnode': '☊',
  'NorthNode': '☊',
  'Southnode': '☋',
  'SouthNode': '☋'
};

const ZODIAC_SYMBOLS: Record<string, string> = {
  'aries': '♈',
  'taurus': '♉',
  'gemini': '♊',
  'cancer': '♋',
  'leo': '♌',
  'virgo': '♍',
  'libra': '♎',
  'scorpio': '♏',
  'sagittarius': '♐',
  'capricorn': '♑',
  'aquarius': '♒',
  'pisces': '♓'
};

// Use the imported PlanetaryPosition type directly
function isValidPosition(pos: unknown): boolean {
  // Apply surgical type casting with variable extraction
  const posData = pos as unknown;
  const sign = posData?.sign;
  const degree = posData?.degree;
  
  return pos && 
         typeof sign === 'string' &&
         typeof degree === 'number' &&
         degree >= 0 && degree < 30;
}

// Rename this interface to avoid the conflict
interface ClockPlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  dignity?: string;
  dignityValue?: number;
  dignityDescription?: string;
  exactLongitude?: number; 
  isRetrograde?: boolean;
}

const AstrologicalClock: React.FC = () => {
  const { planetaryPositions } = useAlchemical();
  const { chartData, createChartSvg, isLoading, error } = useCurrentChart();
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    if (!isLoading && svgContainerRef.current) {
      const { svgContent } = createChartSvg();
      svgContainerRef.current.innerHTML = svgContent;
    }
  }, [isLoading, createChartSvg]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Astrological Clock</h2>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Astrological Clock</h2>
        <div className="flex items-center justify-center h-48 text-red-500">
          <p>Error loading chart: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Astrological Clock</h2>
        <button 
          onClick={() => setShowLegend(!showLegend)} 
          className="text-blue-500 hover:text-blue-700"
          title="Show symbol legend"
        >
          <Info size={16} />
        </button>
      </div>
      
      {showLegend && (
        <div className="mb-4 p-2 bg-gray-50 rounded-md text-sm">
          <h3 className="font-medium mb-1">Symbol Legend</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <h4 className="text-xs font-medium text-gray-500">Planets</h4>
              {Object.entries(PLANET_SYMBOLS).map(([planet, symbol]) => (
                <div key={planet} className="flex items-center justify-between">
                  <span className="text-gray-700">{planet}</span>
                  <span className="text-xl">{symbol}</span>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500">Zodiac Signs</h4>
              <div className="grid grid-cols-2 gap-x-2">
                {Object.entries(ZODIAC_SYMBOLS).slice(0, 6).map(([sign, symbol]) => (
                  <div key={sign} className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">{sign}</span>
                    <span>{symbol}</span>
                  </div>
                ))}
                {Object.entries(ZODIAC_SYMBOLS).slice(6).map(([sign, symbol]) => (
                  <div key={sign} className="flex items-center justify-between">
                    <span className="text-gray-700 text-xs">{sign}</span>
                    <span>{symbol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-center" ref={svgContainerRef}></div>
      
      <div className="mt-3 text-sm">
        <p>Ascendant: {ZODIAC_SYMBOLS[chartData.ascendant || 'Libra']} {chartData.ascendant || 'Not available'}</p>
        <p className="text-xs text-gray-500 mt-1">
          Showing current planetary positions
        </p>
        <p className="text-xs text-gray-500">
          North Node (☊) and South Node (☋) are displayed outside the chart for clarity
        </p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <details className="text-sm">
          <summary className="text-blue-600 cursor-pointer font-medium">
            View Planetary Details
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 text-left">Planet</th>
                  <th className="px-2 py-1 text-left">Sign</th>
                  <th className="px-2 py-1 text-left">Position</th>
                  <th className="px-2 py-1 text-left">Dignity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(chartData.planets).map(([planet, data]) => {
                  // Apply surgical type casting with variable extraction
                  const planetData = data as unknown;
                  const sign = planetData?.sign;
                  const degree = planetData?.degree;
                  const isRetrograde = planetData?.isRetrograde;
                  
                  // Special handling for nodes
                  const isNode = planet === 'NorthNode' || planet === 'SouthNode';
                  const nodeClass = planet === 'NorthNode' ? 'text-blue-600' : 'text-red-600';
                  
                  // Only calculate dignity for actual planets, not nodes
                  const dignity = isNode 
                    ? { type: 'N/A', strength: 0 } 
                    : getPlanetaryDignity(planet, sign);
                    
                  const dignityClass = isNode
                    ? nodeClass 
                    : dignity.strength > 0 
                      ? 'text-green-600' 
                      : dignity.strength < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600';
                  
                  return (
                    <tr key={planet} className={`border-t border-gray-100 ${isNode ? 'bg-gray-50' : ''}`}>
                      <td className={`px-2 py-1 font-medium ${isNode ? nodeClass : ''}`}>
                        <span className="mr-1">{PLANET_SYMBOLS[planet]}</span>
                        {planet === 'NorthNode' ? 'North Node' : planet === 'SouthNode' ? 'South Node' : planet}
                      </td>
                      <td className="px-2 py-1">
                        <span className="mr-1">{ZODIAC_SYMBOLS[sign]}</span>
                        {sign}
                      </td>
                      <td className="px-2 py-1">
                        {degree?.toFixed(1)}°
                        {isRetrograde && <span className="ml-1 text-orange-500">℞</span>}
                      </td>
                      <td className={`px-2 py-1 ${dignityClass}`}>
                        {dignity.type}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AstrologicalClock; 
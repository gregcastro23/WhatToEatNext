'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { log } from '@/services/LoggingService';
import { getPlanetInfo, getDignityDescription, getAspectDescription, PlanetInfo } from '@/utils/planetInfoUtils';

interface PlanetInfoModalProps {
  planetName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PlanetInfoModal({ planetName, isOpen, onClose }: PlanetInfoModalProps) {
  const { planetaryPositions } = useAlchemical();
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processPlanetInfo = useCallback(() => {
    if (isOpen && planetName && Object.keys(planetaryPositions).length > 0) {
      setLoading(true);
      setError(null);
      
      try {
        log.info(`Processing planet info for ${planetName}:`, { planetData: planetaryPositions[planetName.toLowerCase()] });
        const info = getPlanetInfo(planetName, planetaryPositions);
        
        if (!info) {
          setError(`Could not retrieve information for ${planetName}`);
          console.error(`Failed to get planet info for ${planetName}`);
        } else {
          log.info(`Successfully processed info for ${planetName}:`, info);
        }
        
        setPlanetInfo(info);
      } catch (err) {
        console.error(`Error in PlanetInfoModal for ${planetName}:`, err);
        setError(`Error loading planet information: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
  }, [isOpen, planetName, planetaryPositions]);

  useEffect(() => {
    processPlanetInfo();
  }, [processPlanetInfo]);

  if (!isOpen) return null;

  // Helper function to get aspect color
  const getAspectColor = (aspectType: string): string => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return 'bg-purple-500';
      case 'sextile': return 'bg-green-500';
      case 'square': return 'bg-red-500';
      case 'trine': return 'bg-blue-500';
      case 'opposition': return 'bg-orange-500';
      case 'quincunx': return 'bg-yellow-500';
      case 'semisextile': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {loading ? 'Loading...' : error ? 'Error&apos; : `${planetInfo?.name} in ${planetInfo?.sign}`}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading planet information...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-500">
              <p>{error}</p>
            </div>
          ) : !planetInfo ? (
            <div className="flex justify-center items-center h-40">
              <p>Planet information not available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{planetInfo.name}</h3>
                  <p className="capitalize">{planetInfo.sign} {planetInfo.degree.toFixed(1)}°</p>
                  {planetInfo.isRetrograde &amp;&amp; (
                    <p className="text-red-500 dark:text-red-400">Retrograde</p>
                  )}
                </div>
                <div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs rounded-full font-medium capitalize bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {planetInfo.dignity.type}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tarot Card */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Major Arcana</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-20 bg-indigo-100 dark:bg-indigo-900 rounded flex items-center justify-center text-2xl">
                    {getTarotSymbol(planetInfo.tarotCard.name)}
                  </div>
                  <div>
                    <p className="font-medium">{planetInfo.tarotCard.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Element: {planetInfo.tarotCard.element}</p>
                  </div>
                </div>
              </div>
              
              {/* Dignity */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Dignity</h3>
                <p className="text-sm">{getDignityDescription(planetInfo.dignity.type)}</p>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${planetInfo.dignity.strength > 0 ? 'bg-green-500' : planetInfo.dignity.strength < 0 ? 'bg-red-500' : 'bg-gray-400'}`}
                    style={{ 
                      width: `${Math.abs(planetInfo.dignity.strength) * 25}%`,
                      marginLeft: planetInfo.dignity.strength === 0 ? '50%' : planetInfo.dignity.strength > 0 ? '50%' : '',
                      marginRight: planetInfo.dignity.strength < 0 ? '50%' : ''
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Debilitated</span>
                  <span>Neutral</span>
                  <span>Dignified</span>
                </div>
              </div>
              
              {/* Aspects */}
              {planetInfo.aspects.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold mb-2">Aspects</h3>
                  <ul className="space-y-2">
                    {planetInfo.aspects.map((aspect, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className={`inline-block w-2 h-2 mt-1.5 mr-2 rounded-full ${getAspectColor(aspect.type)}`}></span>
                        <div>
                          <p className="font-medium capitalize">
                            {aspect.type} to {aspect.planet.charAt(0).toUpperCase() + aspect.planet.slice(1)}
                            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                              ({aspect.orb.toFixed(1)}° orb)
                            </span>
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{getAspectDescription(aspect.type)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Elemental Influence */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Elemental Influence</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${planetInfo.elementalInfluence.fire >= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.abs(planetInfo.elementalInfluence.fire) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Fire</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${planetInfo.elementalInfluence.water >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(planetInfo.elementalInfluence.water) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Water</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${planetInfo.elementalInfluence.air >= 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(planetInfo.elementalInfluence.air) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Air</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${planetInfo.elementalInfluence.earth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.abs(planetInfo.elementalInfluence.earth) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Earth</p>
                  </div>
                </div>
              </div>
              
              {/* Token Influence */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2">Token Influence</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.abs(planetInfo.tokenInfluence.spirit) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Spirit</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500"
                        style={{ width: `${Math.abs(planetInfo.tokenInfluence.essence) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Essence</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500"
                        style={{ width: `${Math.abs(planetInfo.tokenInfluence.matter) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Matter</p>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500"
                        style={{ width: `${Math.abs(planetInfo.tokenInfluence.substance) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">Substance</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get tarot card symbol
function getTarotSymbol(cardName: string): string {
  const symbols: Record<string, string> = {
    'The Fool': '0',
    'The Magician': 'I',
    'The High Priestess': 'II',
    'The Empress': 'III',
    'The Emperor': 'IV',
    'The Hierophant': 'V',
    'The Lovers': 'VI',
    'The Chariot': 'VII',
    'Strength': 'VIII',
    'The Hermit': 'IX',
    'Wheel of Fortune': 'X',
    'Justice': 'XI',
    'The Hanged Man': 'XII',
    'Death': 'XIII',
    'Temperance': 'XIV',
    'The Devil': 'XV',
    'The Tower': 'XVI',
    'The Star': 'XVII',
    'The Moon': 'XVIII',
    'The Sun': 'XIX',
    'Judgement': 'XX',
    'The World': 'XXI'
  };

  return symbols[cardName] || '?';
} 
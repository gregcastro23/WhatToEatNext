'use client';

import React, { useState, useEffect } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { calculateAlchemicalProperties } from '@/calculations/alchemicalCalculations';
import { RulingPlanet, RULING_PLANETS } from '@/constants/planets';
import { ElementalCharacter } from '@/constants/planetaryElements';

// Energy state descriptions
const energyStateDescriptions = {
  high: {
    heat: "Highly transformative energy capable of rapid change",
    entropy: "High degree of disorder and unpredictability",
    reactivity: "Extremely reactive celestial influences",
    gregsEnergy: "Powerful and dynamic celestial energy"
  },
  medium: {
    heat: "Moderate transformative potential",
    entropy: "Balanced order and chaos",
    reactivity: "Moderately responsive to influences",
    gregsEnergy: "Steady celestial energy flow"
  },
  low: {
    heat: "Slow-moving, gradual transformative energy",
    entropy: "Highly ordered and predictable energy state",
    reactivity: "Stable, resistant to change",
    gregsEnergy: "Conserved, potential celestial energy"
  }
};

const ElementalEnergyDisplay: React.FC = () => {
  const { planetaryPositions, isDaytime, refreshPlanetaryPositions } = useAlchemical();
  const [alchemicalResults, setAlchemicalResults] = useState<any>({
    elementalCounts: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    alchemicalCounts: { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 },
    heat: 0,
    entropy: 0,
    reactivity: 0,
    gregsEnergy: 0,
    planetaryDignities: {}
  });
  
  useEffect(() => {
    // Force calculation even if we only have partial or malformed data
    let results;
    try {
      console.log("Processing planetary positions:", planetaryPositions);
      
      // Create a clean version of the planetary data
      const cleanedPositions: Record<string, any> = {};
      
      // Process each planet entry to ensure proper format
      if (planetaryPositions && Object.keys(planetaryPositions).length > 0) {
        Object.entries(planetaryPositions).forEach(([planet, position]) => {
          if (position) {
            if (typeof position === 'object') {
              // Keep object data but ensure it has the right properties
              cleanedPositions[planet] = {
                sign: position.sign || '',
                degree: position.degree || 0
              };
            } else if (typeof position === 'string') {
              // Convert string to object format
              // Extract degree if present
              const degreeMatch = position.match(/(\d+)°(\d+)'/);
              const degree = degreeMatch ? 
                parseFloat(degreeMatch[1]) + (parseFloat(degreeMatch[2]) / 60) : 0;
              
              // Extract sign if present
              const signSymbols: Record<string, string> = {
                '♈': 'aries', '♉': 'taurus', '♊': 'gemini', '♋': 'cancer',
                '♌': 'leo', '♍': 'virgo', '♎': 'libra', '♏': 'scorpio',
                '♐': 'sagittarius', '♑': 'capricorn', '♒': 'aquarius', '♓': 'pisces'
              };
              
              const signMatch = position.match(/[♈♉♊♋♌♍♎♏♐♑♒♓]/);
              const sign = signMatch && signMatch[0] in signSymbols ? 
                signSymbols[signMatch[0]] : '';
              
              cleanedPositions[planet] = { sign, degree };
            } else {
              // Just use as is for other types
              cleanedPositions[planet] = position;
            }
          }
        });
      } else {
        // If we have no planetary positions, add some basic ones so we get calculations
        cleanedPositions['Sun'] = { sign: 'aries', degree: 15 };
        cleanedPositions['Moon'] = { sign: 'cancer', degree: 22 };
        cleanedPositions['Mercury'] = { sign: 'taurus', degree: 5 };
        cleanedPositions['Venus'] = { sign: 'gemini', degree: 10 };
        console.log("Created default positions because none were provided");
      }
      
      console.log("Cleaned planetary positions:", cleanedPositions);
      
      // Make sure we're passing the correct parameters
      results = calculateAlchemicalProperties(cleanedPositions, isDaytime);
      console.log("Calculation results:", results);
    } catch (error) {
      console.error("Error in calculations:", error);
      
      // Provide minimal fallback data in case of error
      results = {
        elementalCounts: { Fire: 0.01, Water: 0.01, Earth: 0.01, Air: 0.01 },
        alchemicalCounts: { Spirit: 0.01, Essence: 0.01, Matter: 0.01, Substance: 0.01 },
        heat: 0.01,
        entropy: 0.01,
        reactivity: 0.01,
        gregsEnergy: 0.01,
        planetaryDignities: {}
      };
    }
    
    // Always update with whatever we got
    setAlchemicalResults(results);
  }, [planetaryPositions, isDaytime]);

  useEffect(() => {
    console.log("Planetary positions available:", planetaryPositions);
    
    // Debug indicator for data format
    if (planetaryPositions) {
      const firstPlanet = Object.keys(planetaryPositions)[0] || '';
      const firstPlanetData = planetaryPositions[firstPlanet];
      console.log("First planet data format:", {
        planet: firstPlanet,
        dataType: typeof firstPlanetData,
        isObject: typeof firstPlanetData === 'object',
        hasSign: typeof firstPlanetData === 'object' && 'sign' in firstPlanetData,
        hasDegree: typeof firstPlanetData === 'object' && 'degree' in firstPlanetData
      });
    }
  }, [planetaryPositions]);

  // Direct percentage calculation for elements
  const calculateElementalPercentage = (element: string) => {
    const totalElemental = 
      alchemicalResults.elementalCounts.Fire + 
      alchemicalResults.elementalCounts.Water + 
      alchemicalResults.elementalCounts.Earth + 
      alchemicalResults.elementalCounts.Air;
    
    // Use actual calculation, show 0 if total is 0
    return totalElemental > 0 
      ? Math.round((alchemicalResults.elementalCounts[element as ElementalCharacter] / totalElemental) * 100) 
      : 0; // Show actual 0 instead of defaulting to 25%
  };

  // Get the actual value for alchemical energy states
  const getAlchemicalValue = (property: string) => {
    const value = alchemicalResults.alchemicalCounts[property as keyof typeof alchemicalResults.alchemicalCounts];
    return isNaN(value) ? 0 : value; // Return 0 if NaN, but don't default to arbitrary value
  };

  // Calculate percentage for display purposes
  const calculateAlchemicalPercentage = (property: string) => {
    const totalAlchemical = 
      alchemicalResults.alchemicalCounts.Spirit + 
      alchemicalResults.alchemicalCounts.Essence + 
      alchemicalResults.alchemicalCounts.Matter + 
      alchemicalResults.alchemicalCounts.Substance;
    
    // Use actual calculation, show 0 if total is 0
    return totalAlchemical > 0 
      ? Math.round((alchemicalResults.alchemicalCounts[property as keyof typeof alchemicalResults.alchemicalCounts] / totalAlchemical) * 100) 
      : 0; // Show actual 0 instead of defaulting to 25%
  };
  
  // Function to get energy level description
  const getEnergyLevelDescription = (value: number, type: keyof typeof energyStateDescriptions.high) => {
    if (isNaN(value)) return energyStateDescriptions.medium[type];
    if (value >= 0.7) return energyStateDescriptions.high[type];
    if (value >= 0.4) return energyStateDescriptions.medium[type];
    return energyStateDescriptions.low[type];
  };
  
  // Get color class for energy metrics
  const getEnergyColor = (value: number) => {
    if (isNaN(value)) return "text-gray-500";
    if (value >= 0.7) return "text-emerald-600 font-semibold";
    if (value >= 0.4) return "text-blue-600";
    return "text-amber-600";
  };
  
  // Get dominant planet based on dignities
  const getDominantPlanet = () => {
    const dignities = alchemicalResults.planetaryDignities || {};
    let dominant = { planet: 'None', type: 'neutral', strength: 0 };
    
    Object.entries(dignities).forEach(([planet, dignity]: [string, any]) => {
      const dignityStrength = 
        dignity.type === 'rulership' ? 5 :
        dignity.type === 'exaltation' ? 4 :
        dignity.type === 'neutral' ? 2 :
        dignity.type === 'detriment' ? 1 :
        dignity.type === 'fall' ? 0 : 2;
      
      if (dignityStrength > dominant.strength) {
        dominant = { planet, type: dignity.type, strength: dignityStrength };
      }
    });
    
    return dominant;
  };
  
  const dominantPlanet = getDominantPlanet();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Celestial Energy Profile</h2>
        {dominantPlanet.planet !== 'None' && (
          <div className="text-sm bg-indigo-100 px-3 py-1 rounded-full">
            <span className="font-medium">Dominant: {dominantPlanet.planet}</span>
            <span className={`ml-1 ${
              dominantPlanet.type === 'rulership' || dominantPlanet.type === 'exaltation' 
                ? 'text-green-600' 
                : dominantPlanet.type === 'detriment' || dominantPlanet.type === 'fall'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              ({dominantPlanet.type})
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elemental Energy section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Elemental Character</h3>
          <div className="space-y-3">
            {Object.entries(alchemicalResults.elementalCounts).map(([element, value]) => {
              // Calculate percentage of total elemental energy
              const totalElemental = 
                alchemicalResults.elementalCounts.Fire + 
                alchemicalResults.elementalCounts.Water + 
                alchemicalResults.elementalCounts.Earth + 
                alchemicalResults.elementalCounts.Air;
              
              // Direct percentage calculation (not using the helper function)
              const pct = totalElemental > 0 
                ? Math.round((value as number / totalElemental) * 100) 
                : 0; // Use 0 instead of 25% default
              
              return (
                <div key={element} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{element}</span>
                    <span className="text-sm">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        element === 'Fire' ? 'bg-red-500' : 
                        element === 'Water' ? 'bg-blue-500' : 
                        element === 'Air' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  
                  {/* Element influence from planetary dignities */}
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.entries(alchemicalResults.planetaryDignities || {})
                      .filter(([_, dignity]: [string, any]) => {
                        const dignitySign = dignity.description.split(' ').pop();
                        const signElement = 
                          /aries|leo|sagittarius/i.test(dignitySign) ? 'Fire' :
                          /taurus|virgo|capricorn/i.test(dignitySign) ? 'Earth' :
                          /gemini|libra|aquarius/i.test(dignitySign) ? 'Air' :
                          /cancer|scorpio|pisces/i.test(dignitySign) ? 'Water' : '';
                        return signElement === element;
                      })
                      .map(([planet, dignity]: [string, any]) => (
                        <span key={planet} className="inline-block mr-2">
                          {planet}
                          <span className={`ml-1 ${
                            dignity.type === 'rulership' || dignity.type === 'exaltation' 
                              ? 'text-green-600' 
                              : dignity.type === 'detriment' || dignity.type === 'fall'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            ({dignity.type === 'neutral' ? 'neut' : dignity.type.substring(0,3)})
                          </span>
                        </span>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Alchemical Energies</h3>
          <div className="space-y-3">
            {Object.entries(alchemicalResults.alchemicalCounts).map(([property, value]) => {
              // Display actual value for alchemical energy states, not percentage
              // We'll keep the percentage visual display for consistency
              const totalAlchemical = 
                alchemicalResults.alchemicalCounts.Spirit + 
                alchemicalResults.alchemicalCounts.Essence + 
                alchemicalResults.alchemicalCounts.Matter + 
                alchemicalResults.alchemicalCounts.Substance;
              
              const pct = totalAlchemical > 0 
                ? Math.round((value as number / totalAlchemical) * 100) 
                : 0; // Use 0 instead of 25% default
              
              return (
                <div key={property} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{property}</span>
                    <span className="text-sm">
                      {Number(value).toFixed(2)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        property === 'Spirit' ? 'bg-purple-500' : 
                        property === 'Essence' ? 'bg-cyan-500' : 
                        property === 'Matter' ? 'bg-amber-500' : 
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  
                  {/* Property influence from planetary dignities */}
                  <div className="text-xs text-gray-600 mt-1">
                    {Object.entries(alchemicalResults.planetaryDignities || {})
                      .filter(([planet]: [string, any]) => {
                        const planetProperty = 
                          /Sun|Mars/i.test(planet) ? 'Spirit' :
                          /Moon|Venus|Neptune/i.test(planet) ? 'Essence' :
                          /Saturn|Pluto/i.test(planet) ? 'Matter' :
                          /Mercury|Jupiter|Uranus/i.test(planet) ? 'Substance' : '';
                        return planetProperty === property;
                      })
                      .map(([planet, dignity]: [string, any]) => (
                        <span key={planet} className="inline-block mr-2">
                          {planet}
                          <span className={`ml-1 ${
                            dignity.type === 'rulership' || dignity.type === 'exaltation' 
                              ? 'text-green-600' 
                              : dignity.type === 'detriment' || dignity.type === 'fall'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            ({dignity.type === 'neutral' ? 'neut' : dignity.type.substring(0,3)})
                          </span>
                        </span>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Energy Metrics section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Energy Dynamics</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Heat</h4>
                    <p className="text-xs text-gray-500">Transformative potential</p>
                  </div>
                  <span className={getEnergyColor(alchemicalResults.heat)}>
                    {alchemicalResults.heat.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-red-500" 
                       style={{ 
                         width: `${isNaN(alchemicalResults.heat) ? 0 : Math.min(100, Math.max(0, alchemicalResults.heat * 100))}%` 
                       }}></div>
                </div>
                <p className="text-xs italic mt-1">{getEnergyLevelDescription(alchemicalResults.heat, 'heat')}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Entropy</h4>
                    <p className="text-xs text-gray-500">Cosmic disorder level</p>
                  </div>
                  <span className={getEnergyColor(alchemicalResults.entropy)}>
                    {alchemicalResults.entropy.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-blue-500" 
                       style={{ 
                         width: `${isNaN(alchemicalResults.entropy) ? 0 : Math.min(100, Math.max(0, alchemicalResults.entropy * 100))}%` 
                       }}></div>
                </div>
                <p className="text-xs italic mt-1">{getEnergyLevelDescription(alchemicalResults.entropy, 'entropy')}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Reactivity</h4>
                    <p className="text-xs text-gray-500">Celestial response intensity</p>
                  </div>
                  <span className={getEnergyColor(alchemicalResults.reactivity)}>
                    {alchemicalResults.reactivity.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-yellow-500" 
                       style={{ 
                         width: `${isNaN(alchemicalResults.reactivity) ? 0 : Math.min(100, Math.max(0, alchemicalResults.reactivity * 100))}%` 
                       }}></div>
                </div>
                <p className="text-xs italic mt-1">{getEnergyLevelDescription(alchemicalResults.reactivity, 'reactivity')}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Celestial Energy</h4>
                    <p className="text-xs text-gray-500">Available cosmic force</p>
                  </div>
                  <span className={`text-lg ${getEnergyColor(alchemicalResults.gregsEnergy)}`}>
                    {alchemicalResults.gregsEnergy.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className="h-3 rounded-full bg-purple-500" 
                       style={{ 
                         width: `${isNaN(alchemicalResults.gregsEnergy) ? 0 : Math.min(100, Math.max(0, alchemicalResults.gregsEnergy * 100))}%` 
                       }}></div>
                </div>
                <p className="text-xs italic mt-1">{getEnergyLevelDescription(alchemicalResults.gregsEnergy, 'gregsEnergy')}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Planetary Influences on Energy</h4>
              <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(alchemicalResults.planetaryDignities || {}).map(([planet, dignity]: [string, any]) => {
                  // Calculate energy contribution
                  const contribution = 
                    dignity.type === 'rulership' ? 'strong positive' :
                    dignity.type === 'exaltation' ? 'positive' :
                    dignity.type === 'neutral' ? 'neutral' :
                    dignity.type === 'detriment' ? 'negative' :
                    dignity.type === 'fall' ? 'strong negative' : 'minor';
                  
                  return (
                    <div key={planet} className="flex justify-between">
                      <span className="font-medium">{planet}</span>
                      <span className={
                        dignity.type === 'rulership' || dignity.type === 'exaltation' 
                          ? 'text-green-600' 
                          : dignity.type === 'detriment' || dignity.type === 'fall'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }>
                        {contribution} ({dignity.type})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={refreshPlanetaryPositions}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-200"
      >
        Refresh Celestial Data
      </button>
    </div>
  );
};

export default ElementalEnergyDisplay; 
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';
// TODO: Fix CSS module import - was: import from "./AstrologyChart.module.css.ts"


interface AstrologyChartProps {
  size?: number;
  showAspects?: boolean;
  title?: string;
}

const AstrologyChartMigrated: React.FC<AstrologyChartProps> = ({ 
  size = 400,
  showAspects = true,
  title = "Current Astrological Chart" 
}) => {
  // Replace context hooks with services hook
  const { 
    isLoading, 
    error, 
    astrologyService 
  } = useServices();

  // State for chart data
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, number>>({});
  const [aspectsData, setAspectsData] = useState<any[]>([]);
  const [risingDegree, setRisingDegree] = useState<number>(0);
  const [isDaytime, setIsDaytime] = useState<boolean>(true);

  // Chart constants
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;

  // Helper data
  const zodiacSigns = [
    { name: 'Aries', symbol: '♈', start: 0, element: 'Fire' },
    { name: 'Taurus', symbol: '♉', start: 30, element: 'Earth' },
    { name: 'Gemini', symbol: '♊', start: 60, element: 'Air' },
    { name: 'Cancer', symbol: '♋', start: 90, element: 'Water' },
    { name: 'Leo', symbol: '♌', start: 120, element: 'Fire' },
    { name: 'Virgo', symbol: '♍', start: 150, element: 'Earth' },
    { name: 'Libra', symbol: '♎', start: 180, element: 'Air' },
    { name: 'Scorpio', symbol: '♏', start: 210, element: 'Water' },
    { name: 'Sagittarius', symbol: '♐', start: 240, element: 'Fire' },
    { name: 'Capricorn', symbol: '♑', start: 270, element: 'Earth' },
    { name: 'Aquarius', symbol: '♒', start: 300, element: 'Air' },
    { name: 'Pisces', symbol: '♓', start: 330, element: 'Water' }
  ];

  const planetSymbols: Record<string, string> = {
    Sun: '☉',
    moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Rising: 'ASC'
  };

  const elementColors: Record<string, string> = {
    Fire: '#ff6b6b',
    Earth: '#51c23b',
    Air: '#4dabf7',
    Water: '#339af0'
  };

  // Helper functions
  const calculatePosition = (degree: number, r: number = radius) => {
    const radians = (degree - 90) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(radians),
      y: centerY + r * Math.sin(radians)
    };
  };

  const getSignForDegree = (degree: number) => {
    const signIndex = Math.floor(degree / 30);
    return zodiacSigns[signIndex] || zodiacSigns[0];
  };

  const getDegreeInSign = (degree: number) => {
    return Math.floor(degree % 30);
  };

  // Load astrological data when services are available
  useEffect(() => {
    if (isLoading || !astrologyService) {
      return;
    }

    const loadAstrologicalData = async () => {
      try {
        // Mock data for now - replace with actual service calls
        setPlanetaryPositions({
          Sun: 75,
          moon: 120,
          Mercury: 85,
          Venus: 95,
          Mars: 200,
          Jupiter: 180,
          Saturn: 310
        });
        setRisingDegree(15);
        setIsDaytime(new Date().getHours() >= 6 && new Date().getHours() < 18);
      } catch (err) {
        console.error('Error loading astrological data:', err);
      }
    };

    loadAstrologicalData();
  }, [isLoading, astrologyService]);

  // Calculate elemental balance
  const elementalBalance = useMemo(() => {
    try {
      return {
        Fire: 25,
        Water: 25,
        Earth: 25,
        Air: 25
      };
    } catch (err) {
      console.error('Error calculating elemental balance:', err);
      return { Fire: 25, Earth: 25, Air: 25, Water: 25 };
    }
  }, []);

  // Calculate alchemical principles
  const alchemicalPrinciples = useMemo(() => {
    return {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25
    };
  }, []);

  // Calculate major aspects  
  const majorAspects = useMemo(() => {
    if (!aspectsData || !Array.isArray(aspectsData)) {
      return [];
    }
    return (aspectsData || []).filter(aspect => 
      aspect && 
      aspect.type && 
      ['conjunction', 'opposition', 'trine', 'square'].includes(aspect.type) &&
      aspect.planet1 && aspect.planet2 &&
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Rising'].includes(aspect.planet1) &&
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Rising'].includes(aspect.planet2)
    );
  }, [aspectsData]);

  // Component render logic
  if (isLoading) {
    return (
      <div className="text-center p-6">
        <h3>{title}</h3>
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div className="animate-pulse h-96 bg-gray-100 rounded-full w-96 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 border border-red-200 rounded bg-red-50">
        <h3>{title}</h3>
        <p className="font-medium">Error Loading Astrological Data</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (Object.keys(planetaryPositions).length === 0) {
    return (
      <div className="text-center p-4 border border-gray-200 rounded bg-gray-50">
        <h3>{title}</h3>
        <p className="font-medium">No Astrological Data Available</p>
        <p className="text-sm mt-1">Loading chart data...</p>
      </div>
    );
  }

  // Add rising sign to planetary positions if not already included
  const allPositions = { ...planetaryPositions };
  if (risingDegree !== undefined && !allPositions.Rising) {
    allPositions.Rising = risingDegree;
  }

  return (
    <div className="astroChartContainer">
      <h3>{title}</h3>
      
      <div className="chartWithInfo">
        <div className="chartSvgContainer">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
            {/* Outer circle */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#ccc" strokeWidth="1" />
            
            {/* Middle circle for planets */}
            <circle cx={centerX} cy={centerY} r={radius - 20} fill="none" stroke="#eee" strokeWidth="0.5" />
            
            {/* Zodiac sign divisions (every 30 degrees) */}
            {(zodiacSigns || []).map(sign => {
              const startPos = calculatePosition(sign.start);
              return (
                <React.Fragment key={sign.name}>
                  <line 
                    x1={centerX} 
                    y1={centerY} 
                    x2={startPos.x} 
                    y2={startPos.y} 
                    stroke="#ddd" 
                    strokeWidth="0.5" 
                  />
                  <text 
                    x={calculatePosition(sign.start + 15, radius + 20)?.x} 
                    y={calculatePosition(sign.start + 15, radius + 20)?.y} 
                    fontSize="12" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill={elementColors[sign.element]}
                  >
                    {sign.symbol}
                  </text>
                </React.Fragment>
              );
            })}
            
            {/* Aspects (only major ones) */}
            {showAspects && (majorAspects || []).map((aspect, index) => {
              if (!planetaryPositions[aspect.planet1] || !planetaryPositions[aspect.planet2]) {
                return null;
              }
              
              const pos1 = calculatePosition(planetaryPositions[aspect.planet1], radius - 40);
              const pos2 = calculatePosition(planetaryPositions[aspect.planet2], radius - 40);
              
              let strokeColor = "#aaa";
              let strokeWidth = 0.5;
              let strokeDasharray = "";
              
              // Style based on aspect type
              switch (aspect.type) {
                case 'conjunction':
                  strokeColor = "#66bb6a"; // Green
                  strokeWidth = 1;
                  break;
                case 'opposition':
                  strokeColor = "#ef5350"; // Red
                  strokeWidth = 1;
                  strokeDasharray = "2 2";
                  break;
                case 'trine':
                  strokeColor = "#42a5f5"; // Blue
                  strokeWidth = 1;
                  break;
                case 'square':
                  strokeColor = "#ff9800"; // Orange
                  strokeWidth = 1;
                  strokeDasharray = "5 2";
                  break;
              }
              
              return (
                <line 
                  key={`aspect-${index}`}
                  x1={pos1.x} 
                  y1={pos1.y} 
                  x2={pos2.x} 
                  y2={pos2.y} 
                  stroke={strokeColor} 
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  opacity={0.6}
                />
              );
            })}
            
            {/* Planets */}
            {Object.entries(allPositions).map(([planet, degree]) => {
              const planetPos = calculatePosition(degree, radius - 25);
              const sign = getSignForDegree(degree);
              const signColor = elementColors[sign.element];
              return (
                <g key={planet}>
                  {/* Planet symbol */}
                  <circle 
                    cx={planetPos.x} 
                    cy={planetPos.y} 
                    r="10" 
                    fill="white" 
                    stroke={signColor} 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x={planetPos.x} 
                    y={planetPos.y} 
                    fontSize="10" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fontFamily="Arial Unicode MS, sans-serif"
                    fill={planet === 'Rising' ? '#ff6b6b' : '#333'}
                  >
                    {planetSymbols[planet] || planet.charAt(0)}
                  </text>
                  
                  {/* Planet degree indicator on outer circle */}
                  <circle 
                    cx={calculatePosition(degree)?.x} 
                    cy={calculatePosition(degree)?.y} 
                    r="2" 
                    fill={signColor} 
                  />
                </g>
              );
            })}
            
            {/* Center point */}
            <circle cx={centerX} cy={centerY} r="3" fill="#333" />
          </svg>
        </div>
        
        <div className="chartInfo">
          <div className="infoSection">
            <h4>Elemental Balance</h4>
            <div className="elementalBars">
              {Object.entries({ Fire: 25, Water: 25, Earth: 25, Air: 25 }).map(([element, percentage]) => (
                <div key={element} className="elementBarWrapper">
                  <div className="elementLabel">
                    <span>{element}</span>
                  </div>
                  <div className="elementBarContainer">
                    <div 
                      className="elementBar" 
                      style={{ width: `${percentage}%`, backgroundColor: elementColors[element as keyof typeof elementColors] }}
                    />
                    <span className="elementPercentage">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="infoSection">
            <h4>Alchemical Principles</h4>
            <div className="alchemicalGrid">
              {Object.entries(alchemicalPrinciples).map(([principle, value]) => (
                <div key={principle} className="alchemicalItem">
                  <div className="alchemicalName">{principle}</div>
                  <div className="alchemicalValue">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="chartLegend">
        {Object.entries(allPositions).map(([planet, degree]) => {
          const sign = getSignForDegree(degree);
          const signDegree = getDegreeInSign(degree);
          return (
            <div 
              key={planet} 
              className="legendItem" 
              style={{ '--element-color': elementColors[sign.element] } as React.CSSProperties}
            >
              <span className="planetSymbol">{planetSymbols[planet] || planet.charAt(0)}</span>
              <span className="planetName">{planet}</span>
              <span className="planetPosition">
                {sign.symbol} {signDegree}° ({sign.name})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AstrologyChartMigrated; 
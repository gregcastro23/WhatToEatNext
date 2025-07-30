import React from 'react';

import { PlanetaryPosition } from "@/types/celestial";

interface PlanetaryPositionDisplayProps {
  planet: string;
  position: {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
  };
}

export const PlanetaryPositionDisplayMigrated: React.FC<PlanetaryPositionDisplayProps> = ({ 
  planet, 
  position 
}) => {
  const formatDegree = (degree: number): string => {
    const wholeDegree = Math.floor(degree);
    const minutes = Math.floor((degree - wholeDegree) * 60);
    return `${wholeDegree}°${minutes}'`;
  };

  // Planet symbols lookup
  const planetSymbols: { [key: string]: string } = {
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
    NorthNode: '☊',
    SouthNode: '☋'
  };

  const symbol = planetSymbols[planet.toLowerCase()] || planet;
  const displayName = planet.charAt(0).toUpperCase() + planet.slice(1);

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-300 flex items-center">
        <span className="text-xl mr-2">{symbol}</span>
        {displayName}:
      </span>
      <span className="text-cyan-200">
        {position.sign.charAt(0).toUpperCase() + position.sign.slice(1)} {formatDegree(position.degree)}
        {position.isRetrograde &amp;&amp; <span className="text-orange-300 ml-1">℞</span>}
      </span>
    </div>
  );
}; 
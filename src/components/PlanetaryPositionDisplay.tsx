import React from 'react';

interface PlanetaryPositionDisplayProps {
  planet: string;
  position: {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
  };
}

export const PlanetaryPositionDisplay: React.FC<PlanetaryPositionDisplayProps> = ({ 
  planet, 
  position 
}) => {
  const formatDegree = (degree: number): string => {
    const wholeDegree = Math.floor(degree);
    const minutes = Math.floor((degree - wholeDegree) * 60);
    return `${wholeDegree}°${minutes}'`;
  };

  // Planet symbols lookup
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
    pluto: '♇',
    northnode: '☊',
    southnode: '☋'
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
        {position.isRetrograde && <span className="text-orange-300 ml-1">℞</span>}
      </span>
    </div>
  );
}; 
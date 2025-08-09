import React from 'react';

import { PlanetaryPosition } from '@/types/celestial';

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
  position,
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
    SouthNode: '☋',
  };

  const symbol = planetSymbols[planet.toLowerCase()] || planet;
  const displayName = planet.charAt(0).toUpperCase() + planet.slice(1);

  return (
    <div className='flex items-center justify-between py-1'>
      <span className='flex items-center text-gray-300'>
        <span className='mr-2 text-xl'>{symbol}</span>
        {displayName}:
      </span>
      <span className='text-cyan-200'>
        {position.sign.charAt(0).toUpperCase() + position.sign.slice(1)}{' '}
        {formatDegree(position.degree)}
        {position.isRetrograde && <span className='ml-1 text-orange-300'>℞</span>}
      </span>
    </div>
  );
};

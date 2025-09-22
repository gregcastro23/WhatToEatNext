'use client';

import React from 'react';
import { useAlchmWebSocket } from '@/hooks/useAlchmWebSocket';
import { logger } from '@/lib/logger';

interface PlanetaryHourProps {
  showDetails?: boolean;
  className?: string;
}

const PLANET_COLORS = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#FFA500',
  Venus: '#FF69B4',
  Mars: '#FF0000',
  Jupiter: '#4169E1',
  Saturn: '#8B4513',
} as const;

const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
} as const;

export function PlanetaryHourDisplay({ showDetails = true, className = '' }: PlanetaryHourProps) {
  const { isConnected, lastPlanetaryHour } = useAlchmWebSocket();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (lastPlanetaryHour) {
      logger.debug('PlanetaryHourDisplay received update', lastPlanetaryHour);
    }
  }, [lastPlanetaryHour]);

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeRemaining = () => {
    if (!lastPlanetaryHour?.end) return null;

    try {
      const endTime = new Date(lastPlanetaryHour.end);
      const diff = endTime.getTime() - currentTime.getTime();

      if (diff <= 0) return 'Ended';

      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${remainingMinutes}m`;
    } catch {
      return null;
    }
  };

  const planetColor = lastPlanetaryHour?.planet
    ? PLANET_COLORS[lastPlanetaryHour.planet]
    : '#888';

  const planetSymbol = lastPlanetaryHour?.planet
    ? PLANET_SYMBOLS[lastPlanetaryHour.planet]
    : '?';

  return (
    <div className={`planetary-hour-display ${className}`}
         style={{
           border: `2px solid ${planetColor}`,
           borderRadius: '8px',
           padding: '16px',
           backgroundColor: 'rgba(0,0,0,0.05)',
           minWidth: '200px'
         }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{
          fontSize: '24px',
          color: planetColor,
          textShadow: '0 0 4px rgba(0,0,0,0.3)'
        }}>
          {planetSymbol}
        </span>
        <div>
          <h3 style={{
            margin: 0,
            color: planetColor,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {lastPlanetaryHour?.planet || 'Unknown'} Hour
          </h3>
          <div style={{
            fontSize: '12px',
            color: isConnected ? '#28a745' : '#dc3545',
            fontWeight: '500'
          }}>
            {isConnected ? '● Live' : '● Offline'}
          </div>
        </div>
      </div>

      {showDetails && lastPlanetaryHour && (
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Started:</strong> {formatTime(lastPlanetaryHour.start)}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Ends:</strong> {formatTime(lastPlanetaryHour.end)}
          </div>
          <div style={{
            fontWeight: '600',
            color: planetColor
          }}>
            <strong>Remaining:</strong> {getTimeRemaining()}
          </div>
        </div>
      )}

      {!lastPlanetaryHour && (
        <div style={{
          fontSize: '14px',
          color: '#999',
          fontStyle: 'italic'
        }}>
          {isConnected ? 'Waiting for planetary hour data...' : 'WebSocket disconnected'}
        </div>
      )}
    </div>
  );
}
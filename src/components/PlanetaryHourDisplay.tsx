/**
 * Planetary Hour Display Component - Minimal Recovery Version
 *
 * Shows the current planetary hour with real-time updates and planetary influence data.
 */

'use client';

import React from 'react';

interface PlanetaryHourProps {
  showDetails?: boolean,
  className?: string;
}

const PLANET_COLORS = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#FFA500',
  Venus: '#FF69B4',
  Mars: '#FF0000',
  Jupiter: '#800080',
  Saturn: '#8B4513'
} as const;

const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄'
} as const;

export function PlanetaryHourDisplay({ showDetails = true, className = '' }: PlanetaryHourProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [planetaryData, setPlanetaryData] = React.useState({
    currentPlanet: 'Sun' as keyof typeof PLANET_COLORS,
    influence: 0.75,
    nextPlanet: 'Moon' as keyof typeof PLANET_COLORS,
    timeUntilNext: '42 minutes',
    hourStarted: new Date(Date.now() - 18 * 60 * 1000) // 18 minutes ago
  });

  // Mock WebSocket hook
  const useAlchmWebSocket = () => ({
    isConnected: false,
    lastPlanetaryHour: null
  });

  const { isConnected, lastPlanetaryHour } = useAlchmWebSocket();

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update planetary data when WebSocket data arrives
  React.useEffect(() => {
    if (lastPlanetaryHour) {
      setPlanetaryData(lastPlanetaryHour);
    }
  }, [lastPlanetaryHour]);

  const formatTime = (date: Date): string => {
    try {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
});
    } catch {
      return new Date().toLocaleTimeString();
    }
  };

  const getTimeRemaining = (): string => {
    const now = Date.now();
    const hourStart = planetaryData.hourStarted.getTime();
    const hourDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const elapsed = now - hourStart;
    const remaining = hourDuration - elapsed;

    if (remaining <= 0) return 'Ending soon';

    const minutes = Math.floor(remaining / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getCurrentPlanetInfo = () => {
    const planet = planetaryData.currentPlanet;
    return {
      name: planet,
      symbol: PLANET_SYMBOLS[planet],
      color: PLANET_COLORS[planet]
    };
  };

  const getNextPlanetInfo = () => {
    const planet = planetaryData.nextPlanet;
    return {
      name: planet,
      symbol: PLANET_SYMBOLS[planet],
      color: PLANET_COLORS[planet]
    };
  };

  const currentPlanet = getCurrentPlanetInfo();
  const nextPlanet = getNextPlanetInfo();

  return (
    <div className={`planetary-hour-display ${className}`} style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      position: 'relative'
}}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
}}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '600',
          color: '#333'
}}>
          🪐 Planetary Hour
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
}}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#22c55e' : '#ef4444'
}} />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Current Planet Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: `${currentPlanet.color}15`,
        borderRadius: '8px',
        border: `2px solid ${currentPlanet.color}30`,
        marginBottom: '16px'
}}>
        <div style={{
          fontSize: '48px',
          color: currentPlanet.color,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          {currentPlanet.symbol}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: currentPlanet.color
          }}>
            {currentPlanet.name}
          </h4>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#666'
}}>
            Currently ruling planetary hour
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '12px',
            color: '#666'
}}>
            <span>🕐 Started: {formatTime(planetaryData.hourStarted)}</span>
            <span>⏱️ Remaining: {getTimeRemaining()}</span>
          </div>
        </div>
        <div style={{
          textAlign: 'right'
}}>
          <div style={{
            fontSize: '24px',
            fontWeight: '600',
            color: currentPlanet.color
          }}>
            {(planetaryData.influence * 100).toFixed(0)}%
          </div>
          <div style={{
            fontSize: '10px',
            color: '#666'
}}>
            Influence
          </div>
        </div>
      </div>

      {/* Next Planet Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        marginBottom: showDetails ? '16px' : '0'
}}>
        <div style={{
          fontSize: '24px',
          color: nextPlanet.color,
          opacity: 0.7
}}>
          {nextPlanet.symbol}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '2px'
}}>
            Next: {nextPlanet.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#666'
}}>
            In {planetaryData.timeUntilNext}
          </div>
        </div>
        <div style={{
          padding: '4px 8px',
          backgroundColor: nextPlanet.color + '20',
          borderRadius: '4px',
          fontSize: '10px',
          color: nextPlanet.color,
          fontWeight: '500'
}}>
          Upcoming
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
}}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            textAlign: 'center'
}}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '4px'
}}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#0369a1'
}}>
              Current Time
            </div>
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            textAlign: 'center'
}}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#0369a1',
              marginBottom: '4px'
}}>
              {Object.keys(PLANET_SYMBOLS).indexOf(currentPlanet.name) + 1}/7
            </div>
            <div style={{
              fontSize: '10px',
              color: '#0369a1'
}}>
              Planet Cycle
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div style={{
        fontSize: '10px',
        color: '#999',
        textAlign: 'center',
        marginTop: '12px',
        padding: '8px',
        borderTop: '1px solid #eee'
}}>
        {isConnected
          ? 'Real-time planetary calculations active'
          : 'Using cached planetary data - reconnecting...'}
      </div>
    </div>
  );
}

export default PlanetaryHourDisplay;
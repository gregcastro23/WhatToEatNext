import React from 'react';

import { useUnifiedState } from '../../context/UnifiedContext';

interface MoonInfoDisplayProps {
  className?: string;
}

export const MoonInfoDisplay: React.FC<MoonInfoDisplayProps> = ({ className = '' }) => {
  const { astrologicalData, alchemicalData } = useUnifiedState();

  // Extract moon data from astrological data
  // Handle the actual data structure from astrologize API
  const moonPosition = astrologicalData?.moon || astrologicalData?.Moon;
  const lunarPhase = astrologicalData?.lunarPhase;
  const moonDignity = (astrologicalData?.dignity as unknown as Record<string, unknown>).Moon || 0;

  // Early return if no data available
  if (!astrologicalData) {
    return (
      <div className={`moon-info-display ${className}`}>
        <div className='moon-header'>
          <h3>🌙 Lunar Information</h3>
        </div>
        <div className='loading-message'>Loading lunar data...</div>
      </div>
    );
  }

  // Calculate moon's Kalchm score (individual contribution)
  const moonKalchmScore = calculateMoonKalchm(moonPosition, lunarPhase);

  // Find aspects involving the Moon
  const moonAspects =
    (astrologicalData.aspects as unknown as any[]).filter(
      (aspect: any) => aspect.planet1 === 'Moon' || aspect.planet2 === 'Moon',
    ) || [];

  // Calculate lunar nodes (simplified calculation)
  const lunarNodes = calculateLunarNodes(moonPosition);

  return (
    <div className={`moon-info-display ${className}`}>
      <div className='moon-header'>
        <h3>🌙 Lunar Information</h3>
      </div>

      <div className='moon-content'>
        {/* Moon Position */}
        <div className='moon-section'>
          <h4>Position</h4>
          <div className='moon-position'>
            <span className='moon-sign'>
              {moonPosition?.sign ? formatSign(moonPosition.sign) : 'Unknown'}
            </span>
            <span className='moon-degree'>
              {moonPosition?.degree ? `${moonPosition.degree.toFixed(1)}°` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Lunar Phase */}
        <div className='moon-section'>
          <h4>Phase</h4>
          <div className='lunar-phase'>
            <div className='phase-icon'>
              {getLunarPhaseIcon((lunarPhase as unknown as Record<string, unknown>).name as string)}
            </div>
            <div className='phase-info'>
              <span className='phase-name'>
                {(lunarPhase as unknown as Record<string, unknown>).name
                  ? formatPhaseName(
                      (lunarPhase as unknown as Record<string, unknown>).name as string,
                    )
                  : 'Unknown'}
              </span>
              <span className='phase-illumination'>
                {(lunarPhase as unknown as Record<string, unknown>).illumination
                  ? `${(((lunarPhase as unknown as Record<string, unknown>).illumination as number) * 100).toFixed(0)}% illuminated`
                  : 'N/A'}
              </span>
              <span className='phase-effect'>
                {String((lunarPhase as unknown as Record<string, unknown>).effect || 'Neutral')}
              </span>
            </div>
          </div>
        </div>

        {/* Moon Dignity (Kalchm Score) */}
        <div className='moon-section'>
          <h4>Dignity</h4>
          <div className='moon-dignity'>
            <div className='dignity-score'>
              <span className='dignity-value'>{(moonDignity as number).toFixed(2)}</span>
              <span className='dignity-label'>Traditional</span>
            </div>
            <div className='kalchm-score'>
              <span className='kalchm-value'>{moonKalchmScore.toFixed(3)}</span>
              <span className='kalchm-label'>Kalchm Score</span>
            </div>
          </div>
        </div>

        {/* Lunar Nodes */}
        <div className='moon-section'>
          <h4>Nodes</h4>
          <div className='lunar-nodes'>
            <div className='north-node'>
              <span className='node-label'>North Node ☊</span>
              <span className='node-position'>
                {lunarNodes.north.sign} {lunarNodes.north.degree.toFixed(1)}°
              </span>
            </div>
            <div className='south-node'>
              <span className='node-label'>South Node ☋</span>
              <span className='node-position'>
                {lunarNodes.south.sign} {lunarNodes.south.degree.toFixed(1)}°
              </span>
            </div>
          </div>
        </div>

        {/* Moon Aspects */}
        <div className='moon-section'>
          <h4>Current Aspects</h4>
          <div className='moon-aspects'>
            {moonAspects.length > 0 ? (
              moonAspects.map((aspect, index) => (
                <div key={index} className='aspect-item'>
                  <span className='aspect-planets'>
                    {aspect.planet1 === 'Moon'
                      ? `Moon ${getAspectSymbol(aspect.type)} ${aspect.planet2}`
                      : `${aspect.planet1} ${getAspectSymbol(aspect.type)} Moon`}
                  </span>
                  <span className='aspect-strength'>
                    {aspect.strength ? `${(aspect.strength * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <span className='no-aspects'>No notable aspects</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .moon-info-display {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 12px;
          padding: 16px;
          color: #e0e0e0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .moon-header h3 {
          margin: 0 0 16px 0;
          font-size: 1.2em;
          color: #c9d1d9;
          text-align: center;
        }

        .moon-content {
          display: grid;
          gap: 16px;
        }

        .moon-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 12px;
        }

        .moon-section h4 {
          margin: 0 0 8px 0;
          font-size: 0.9em;
          color: #7dd3fc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .moon-position {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .moon-sign {
          font-size: 1.1em;
          font-weight: 600;
          color: #fbbf24;
        }

        .moon-degree {
          font-size: 0.9em;
          color: #9ca3af;
        }

        .lunar-phase {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .phase-icon {
          font-size: 1.5em;
        }

        .phase-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .phase-name {
          font-weight: 600;
          color: #e0e0e0;
          text-transform: capitalize;
        }

        .phase-illumination {
          font-size: 0.8em;
          color: #9ca3af;
        }

        .phase-effect {
          font-size: 0.8em;
          color: #7dd3fc;
        }

        .moon-dignity {
          display: flex;
          gap: 20px;
        }

        .dignity-score,
        .kalchm-score {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dignity-value,
        .kalchm-value {
          font-size: 1.2em;
          font-weight: 600;
          color: #10b981;
        }

        .dignity-label,
        .kalchm-label {
          font-size: 0.7em;
          color: #9ca3af;
          text-transform: uppercase;
        }

        .lunar-nodes {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .north-node,
        .south-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .node-label {
          font-size: 0.9em;
          color: #c9d1d9;
        }

        .node-position {
          font-size: 0.9em;
          color: #fbbf24;
        }

        .moon-aspects {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .aspect-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }

        .aspect-planets {
          font-size: 0.9em;
          color: #e0e0e0;
        }

        .aspect-strength {
          font-size: 0.8em;
          color: #10b981;
        }

        .no-aspects {
          font-size: 0.9em;
          color: #9ca3af;
          text-align: center;
          padding: 8px;
        }

        .loading-message {
          text-align: center;
          color: #9ca3af;
          font-size: 0.9em;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

// Helper functions
function formatSign(sign: string): string {
  return sign.charAt(0).toUpperCase() + sign.slice(1);
}

function formatPhaseName(phase: string): string {
  return phase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getLunarPhaseIcon(phase?: string): string {
  if (!phase) return '🌙';

  const icons: Record<string, string> = {
    'new moon': '🌑',
    'waxing crescent': '🌒',
    'first quarter': '🌓',
    'waxing gibbous': '🌔',
    'full moon': '🌕',
    'waning gibbous': '🌖',
    'last quarter': '🌗',
    'waning crescent': '🌘',
  };

  return icons[phase] || '🌙';
}

function getAspectSymbol(aspectType: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚻',
  };

  return symbols[aspectType] || '◯';
}

function calculateMoonKalchm(moonPosition: any, lunarPhase: any): number {
  if (!moonPosition || !lunarPhase) return 0;

  // Simplified Kalchm calculation for Moon
  const signBonus = getSignBonus(moonPosition.sign);
  const phaseBonus = getPhaseBonus(lunarPhase.name);
  const degreeBonus = (moonPosition.degree || 0) / 30; // Normalize to 0-1

  return (signBonus + phaseBonus + degreeBonus) / 3;
}

function getSignBonus(sign: string): number {
  const bonuses: Record<string, number> = {
    cancer: 1.0, // Moon's domicile
    taurus: 0.8, // Moon's exaltation
    scorpio: 0.2, // Moon's detriment
    capricorn: 0.1, // Moon's fall
  };

  return bonuses[sign.toLowerCase()] || 0.5;
}

function getPhaseBonus(phase?: string): number {
  if (!phase) return 0.5;

  const bonuses: Record<string, number> = {
    'new moon': 0.3,
    'waxing crescent': 0.5,
    'first quarter': 0.7,
    'waxing gibbous': 0.8,
    'full moon': 1.0,
    'waning gibbous': 0.8,
    'last quarter': 0.6,
    'waning crescent': 0.4,
  };

  return bonuses[phase] || 0.5;
}

function calculateLunarNodes(moonPosition: any): {
  north: { sign: string; degree: number };
  south: { sign: string; degree: number };
} {
  if (!moonPosition || !moonPosition.degree) {
    return {
      north: { sign: 'Unknown', degree: 0 },
      south: { sign: 'Unknown', degree: 0 },
    };
  }

  // Simplified node calculation - in reality this would be much more complex
  // North Node is typically about 180° from the Moon's position
  const northNodeDegree = (moonPosition.degree + 180) % 360;
  const southNodeDegree = (northNodeDegree + 180) % 360;

  return {
    north: {
      sign: getSignFromDegree(northNodeDegree),
      degree: northNodeDegree % 30,
    },
    south: {
      sign: getSignFromDegree(southNodeDegree),
      degree: southNodeDegree % 30,
    },
  };
}

function getSignFromDegree(degree: number): string {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const signIndex = Math.floor(degree / 30);
  return signs[signIndex] || 'Unknown';
}

export default MoonInfoDisplay;

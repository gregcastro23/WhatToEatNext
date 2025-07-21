import { useState, useEffect } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

// Don't import from context to avoid potential circular dependency
// import { useCurrentChart as useContextCurrentChart } from '@/context/CurrentChartContext';

export interface ChartData {
  ascendant?: string;
  midheaven?: string;
  planets: Record<string, {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
  }>;
  houses?: Record<number, {
    sign: string;
    degree: number;
  }>;
}

/**
 * Standalone hook to access current astrological chart data
 */
export function useCurrentChart() {
  const { planetaryPositions } = useAlchemical();
  const [chartData, setChartData] = useState<ChartData>({
    planets: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Object.keys(planetaryPositions).length > 0) {
      try {
        // Convert planetary positions to chart format
        const planets: Record<string, unknown> = {};
        
        Object.entries(planetaryPositions).forEach(([key, data]) => {
          // Skip non-planetary keys like ascendant
          if (key === 'ascendant') {
            return;
          }
          
          // Format each planet entry with proper capitalization
          let planetName = key.charAt(0).toUpperCase() + key.slice(1);
          
          // Special handling for nodes to ensure consistent casing
          if (key === 'northnode') {
            planetName = 'NorthNode';
          } else if (key === 'southnode') {
            planetName = 'SouthNode';
          }
          
          planets[planetName] = {
            sign: (data as any)?.sign || 'Aries',
            degree: (data as any)?.degree || 0,
            isRetrograde: (data as any)?.isRetrograde || false,
            exactLongitude: (data as any)?.exactLongitude || 0,
          };
        });
        
        // Set ascendant if available
        const newChartData: ChartData = {
          planets: planets as Record<string, { sign: string; degree: number; isRetrograde?: boolean; exactLongitude?: number; }>,
        };
        
        if (planetaryPositions.ascendant) {
          newChartData.ascendant = (planetaryPositions.ascendant as any)?.sign;
        }
        
        setChartData(newChartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error processing chart data');
        console.error('Chart processing error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [planetaryPositions]);

  const createChartSvg = () => {
    // Map of planet names to their astronomical symbols
    const planetSymbols: Record<string, string> = {
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

    // Map of zodiac signs to their symbols
    const zodiacSymbols: Record<string, string> = {
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

    // Map colors for each sign based on their element
    const signColors: Record<string, string> = {
      'aries': '#ff5757', // Fire
      'leo': '#ff8c33', // Fire
      'sagittarius': '#ffb84d', // Fire
      'taurus': '#70a35e', // Earth
      'virgo': '#8bc34a', // Earth
      'capricorn': '#5d9c59', // Earth
      'gemini': '#7ac7ff', // Air
      'libra': '#a8d1f7', // Air
      'aquarius': '#64b5f6', // Air
      'cancer': '#64b5f6', // Water
      'scorpio': '#0d6efd', // Water
      'pisces': '#00bcd4' // Water
    };

    // Map planet colors
    const planetColors: Record<string, string> = {
      'Sun': '#ff9500',
      'Moon': '#b8b8b8',
      'Mercury': '#a6a6a6',
      'Venus': '#ff84bb',
      'Mars': '#ff4747',
      'Jupiter': '#8860d0',
      'Saturn': '#5d5d5d',
      'Uranus': '#5c94bd',
      'Neptune': '#438bca',
      'Pluto': '#7d2e68'
    };

    // Calculate actual positions based on exact longitude
    const planetPositions = Object.entries(chartData.planets).map(([planet, data]) => {
      const exactLong = data.exactLongitude || 0;
      const angle = (exactLong * Math.PI) / 180; // Convert to radians
      return {
        planet,
        symbol: planetSymbols[planet] || planet,
        sign: data.sign,
        signSymbol: zodiacSymbols[data.sign] || data.sign,
        degree: data.degree,
        isRetrograde: data.isRetrograde,
        angle,
        x: 150 + 100 * Math.sin(angle), // Use sine for x
        y: 150 - 100 * Math.cos(angle), // Use negative cosine for y
        color: planetColors[planet] || '#555555'
      };
    });

    // Create a more attractive circular chart with signs in the outer ring
    return {
      planetPositions: chartData.planets,
      ascendantSign: chartData.ascendant || 'Libra',
      svgContent: `
      <svg width="320" height="320" viewBox="0 0 320 320">
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="glow" />
            <feMerge>
              <feMergeNode in="glow"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="chart-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Chart background with subtle gradient -->
        <circle cx="160" cy="160" r="155" fill="url(#chart-bg)" stroke="#e0e0e0" stroke-width="1"/>
        
        <!-- Zodiac ring -->
        <g class="zodiac-ring">
          ${Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * Math.PI / 180; // Start from top (270 deg or -90 deg)
            const sign = Object.keys(zodiacSymbols)[i];
            const color = signColors[sign] || '#999';
            const startAngle = (i * 30 - 90) * Math.PI / 180;
            const endAngle = ((i + 1) * 30 - 90) * Math.PI / 180;
            
            const startX = 160 + 145 * Math.cos(startAngle);
            const startY = 160 + 145 * Math.sin(startAngle);
            const endX = 160 + 145 * Math.cos(endAngle);
            const endY = 160 + 145 * Math.sin(endAngle);
            
            // Use arc paths for the zodiac segments
            const largeArcFlag = 0; // 0 for arcs less than 180 degrees
            
            return `
              <path d="M 160 160 L ${startX} ${startY} A 145 145 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
                    fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="0.5" />
              <text x="${160 + 135 * Math.cos((i * 30 + 15 - 90) * Math.PI / 180)}" 
                    y="${160 + 135 * Math.sin((i * 30 + 15 - 90) * Math.PI / 180)}" 
                    text-anchor="middle" dominant-baseline="middle" 
                    fill="${color}" font-size="14" font-weight="bold">
                ${zodiacSymbols[sign]}
              </text>
            `;
          }).join('')}
        </g>
        
        <!-- Degree circles -->
        <circle cx="160" cy="160" r="120" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        <circle cx="160" cy="160" r="80" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        <circle cx="160" cy="160" r="40" fill="none" stroke="#ccc" stroke-width="0.5" stroke-dasharray="2,2"/>
        
        <!-- Ascendant marker -->
        ${chartData.ascendant ? (() => {
          // Get the sign index
          const signIndex = Object.keys(zodiacSymbols).findIndex(sign => sign === chartData.ascendant);
          const ascAngle = ((signIndex * 30) - 90) * Math.PI / 180; // Start from top
          const ascX = 160 + 155 * Math.cos(ascAngle);
          const ascY = 160 + 155 * Math.sin(ascAngle);
          
          return `
            <line x1="160" y1="160" x2="${ascX}" y2="${ascY}" 
                  stroke="#ff4d4d" stroke-width="2" stroke-dasharray="5,3" />
            <text x="${160 + 165 * Math.cos(ascAngle)}" 
                  y="${160 + 165 * Math.sin(ascAngle)}" 
                  text-anchor="middle" dominant-baseline="middle" 
                  fill="#ff4d4d" font-weight="bold" font-size="12">
              ASC
            </text>
          `;
        })() : ''}
        
        <!-- North Node (outside the circle at the top) -->
        <g class="node north-node">
          <circle cx="160" cy="30" r="15" fill="#7272f7" fill-opacity="0.2" stroke="#7272f7" stroke-width="0.5" />
          <text x="160" y="30" text-anchor="middle" dominant-baseline="middle" fill="#7272f7" font-size="14" font-weight="bold">
            ☊
          </text>
          <text x="160" y="50" text-anchor="middle" dominant-baseline="middle" fill="#7272f7" font-size="10">
            North Node
          </text>
        </g>
        
        <!-- South Node (outside the circle at the bottom) -->
        <g class="node south-node">
          <circle cx="160" cy="290" r="15" fill="#e06c75" fill-opacity="0.2" stroke="#e06c75" stroke-width="0.5" />
          <text x="160" y="290" text-anchor="middle" dominant-baseline="middle" fill="#e06c75" font-size="14" font-weight="bold">
            ☋
          </text>
          <text x="160" y="310" text-anchor="middle" dominant-baseline="middle" fill="#e06c75" font-size="10">
            South Node
          </text>
        </g>
        
        <!-- Planets and their connections to signs -->
        <g class="planets">
          ${planetPositions.map(p => {
            // Skip the North and South Nodes as they're now drawn separately
            if (p.planet === 'NorthNode' || p.planet === 'SouthNode') return '';
            
            return `
              <g class="planet" filter="url(#glow)">
                <circle cx="${p.x}" cy="${p.y}" r="15" 
                        fill="${p.color}" fill-opacity="0.2" stroke="${p.color}" stroke-width="0.5" />
                <text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" 
                      fill="${p.color}" font-size="14" font-weight="bold">
                  ${p.symbol}
                </text>
                <text x="${p.x}" y="${p.y + 22}" text-anchor="middle" dominant-baseline="middle" 
                      fill="${p.color}" font-size="8">
                  ${p.degree.toFixed(0)}° ${p.isRetrograde ? '℞' : ''}
                </text>
              </g>
            `;
          }).join('')}
        </g>
        
        <!-- Chart title and info -->
        <text x="160" y="20" text-anchor="middle" fill="#333" font-size="14" font-weight="bold">
          Current Astrological Chart
        </text>
      </svg>
      `
    };
  };

  // Create chart object compatible with what CookingMethods.tsx expects
  const chartObj = {
    planetaryPositions: Object.entries(chartData.planets).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    }, {} as Record<string, unknown>),
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {}
  };

  return {
    chartData,
    createChartSvg,
    isLoading,
    error,
    refreshChart: async () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    },
    // Add the chart property for CookingMethods.tsx
    chart: chartObj
  };
}

// For backward compatibility with both named and default imports
export default useCurrentChart; 
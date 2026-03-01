'use client';

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart, Planet, ZodiacSignType } from '@/types/natalChart';

interface NatalTransitChartProps {
  natalChart: NatalChart;
}

const ZODIAC_SIGNS: ZodiacSignType[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647', Ascendant: 'AC',
};

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
  leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
  sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water',
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444', Water: '#3b82f6', Earth: '#22c55e', Air: '#eab308',
};

const PLANETS: Planet[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];

interface TransitData {
  sign: string;
  degree: number;
  isRetrograde?: boolean;
}

/**
 * NatalTransitChart - Renders an SVG wheel showing natal placements with
 * current transit overlay. The outer ring shows the 12 zodiac signs,
 * the middle ring has natal planet positions, and the inner ring
 * shows current transit positions.
 */
export const NatalTransitChart: React.FC<NatalTransitChartProps> = ({ natalChart }) => {
  const { planetaryPositions: currentPositionsRaw } = useAlchemical();
  const [transitData, setTransitData] = useState<Record<string, TransitData>>({});

  useEffect(() => {
    if (!currentPositionsRaw || Object.keys(currentPositionsRaw).length === 0) return;

    const parsed: Record<string, TransitData> = {};
    for (const [planet, data] of Object.entries(currentPositionsRaw)) {
      if (planet === 'ascendant' || !data) continue;
      const pd = data as any;
      if (pd.sign) {
        parsed[planet.charAt(0).toUpperCase() + planet.slice(1)] = {
          sign: typeof pd.sign === 'string' ? pd.sign.toLowerCase() : '',
          degree: pd.degree ?? pd.exactLongitude ?? 0,
          isRetrograde: pd.isRetrograde ?? false,
        };
      }
    }
    setTransitData(parsed);
  }, [currentPositionsRaw]);

  const cx = 200;
  const cy = 200;
  const outerR = 185;
  const signR = 165;
  const natalR = 130;
  const transitR = 95;
  const innerR = 60;

  // Convert sign + degree to absolute angle (0-360 measured from Aries=0)
  const toAbsoluteAngle = (sign: string, degree: number): number => {
    const signIndex = ZODIAC_SIGNS.indexOf(sign.toLowerCase() as ZodiacSignType);
    if (signIndex < 0) return 0;
    return signIndex * 30 + (degree % 30);
  };

  // Convert absolute angle to SVG angle (0=top, clockwise)
  const toSvgAngle = (absAngle: number): number => {
    return absAngle - 90; // rotate so Aries starts at top
  };

  const polarToXY = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  // Build natal positions
  const natalPositions: Array<{ planet: string; sign: string; degree: number; absAngle: number }> = [];
  if (natalChart.planetaryPositions) {
    for (const planet of PLANETS) {
      const sign = natalChart.planetaryPositions[planet];
      if (!sign) continue;
      // Find degree from planets array if available
      const planetInfo = natalChart.planets?.find(p => p.name === planet);
      const deg = planetInfo?.position ? planetInfo.position % 30 : 15; // default mid-sign
      natalPositions.push({
        planet,
        sign: typeof sign === 'string' ? sign : '',
        degree: deg,
        absAngle: toAbsoluteAngle(typeof sign === 'string' ? sign : '', deg),
      });
    }
  }

  // Build transit positions
  const transitPositions: Array<{ planet: string; sign: string; degree: number; absAngle: number; isRetrograde?: boolean }> = [];
  for (const planet of PLANETS) {
    const td = transitData[planet];
    if (!td) continue;
    const deg = td.degree % 30;
    transitPositions.push({
      planet,
      sign: td.sign,
      degree: deg,
      absAngle: toAbsoluteAngle(td.sign, deg),
      isRetrograde: td.isRetrograde,
    });
  }

  // Spread overlapping labels
  const spreadPositions = (positions: Array<{ absAngle: number; [key: string]: any }>, minGap: number) => {
    const sorted = [...positions].sort((a, b) => a.absAngle - b.absAngle);
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i].absAngle - sorted[i - 1].absAngle;
        if (diff < minGap) {
          const shift = (minGap - diff) / 2;
          sorted[i - 1].absAngle -= shift;
          sorted[i].absAngle += shift;
        }
      }
    }
    return sorted;
  };

  const spreadNatal = spreadPositions(natalPositions, 8);
  const spreadTransit = spreadPositions(transitPositions, 8);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full h-auto">
          {/* Background */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={signR} fill="none" stroke="#d1d5db" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={natalR} fill="none" stroke="#d1d5db" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={transitR} fill="none" stroke="#d1d5db" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={innerR} fill="#faf5ff" stroke="#e9d5ff" strokeWidth="1" />

          {/* Zodiac sign sectors */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const startAngle = toSvgAngle(i * 30);
            const midAngle = toSvgAngle(i * 30 + 15);
            const lineEnd = polarToXY(startAngle, outerR);
            const lineStart = polarToXY(startAngle, innerR);
            const labelPos = polarToXY(midAngle, (outerR + signR) / 2);
            const element = SIGN_ELEMENTS[sign];
            const color = ELEMENT_COLORS[element];

            return (
              <g key={sign}>
                <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="#e5e7eb" strokeWidth="0.5" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="14"
                  fontWeight="600"
                >
                  {SIGN_SYMBOLS[sign]}
                </text>
              </g>
            );
          })}

          {/* Natal planet markers (outer ring) */}
          {spreadNatal.map((pos) => {
            const angle = toSvgAngle(pos.absAngle);
            const pt = polarToXY(angle, natalR);
            return (
              <g key={`natal-${pos.planet}`}>
                <circle cx={pt.x} cy={pt.y} r="12" fill="#7c3aed" fillOpacity="0.15" stroke="#7c3aed" strokeWidth="1.5" />
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#7c3aed"
                  fontSize="10"
                  fontWeight="700"
                >
                  {PLANET_SYMBOLS[pos.planet] || pos.planet.slice(0, 2)}
                </text>
              </g>
            );
          })}

          {/* Transit planet markers (inner ring) */}
          {spreadTransit.map((pos) => {
            const angle = toSvgAngle(pos.absAngle);
            const pt = polarToXY(angle, transitR);
            return (
              <g key={`transit-${pos.planet}`}>
                <circle cx={pt.x} cy={pt.y} r="11" fill="#ea580c" fillOpacity="0.15" stroke="#ea580c" strokeWidth="1.5" />
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ea580c"
                  fontSize="9"
                  fontWeight="700"
                >
                  {PLANET_SYMBOLS[pos.planet] || pos.planet.slice(0, 2)}
                </text>
                {pos.isRetrograde && (
                  <text
                    x={pt.x + 10}
                    y={pt.y - 8}
                    fill="#ea580c"
                    fontSize="7"
                    fontWeight="700"
                  >
                    R
                  </text>
                )}
              </g>
            );
          })}

          {/* Center label */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#6b21a8" fontSize="10" fontWeight="700">
            NATAL
          </text>
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#6b21a8" fontSize="8">
            x
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#c2410c" fontSize="10" fontWeight="700">
            TRANSIT
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
          <span className="text-gray-600">Natal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
          <span className="text-gray-600">Current Transit</span>
        </div>
      </div>

      {/* Natal Placements Table */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Natal Placements</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PLANETS.map((planet) => {
            const sign = natalChart.planetaryPositions?.[planet];
            if (!sign) return null;
            const signStr = typeof sign === 'string' ? sign : '';
            const planetInfo = natalChart.planets?.find(p => p.name === planet);
            const degree = planetInfo?.position ? Math.floor(planetInfo.position % 30) : null;
            const transit = transitData[planet];

            return (
              <div key={planet} className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-center">
                <div className="text-lg" title={planet}>{PLANET_SYMBOLS[planet]}</div>
                <div className="text-[10px] text-gray-500 font-medium uppercase">{planet}</div>
                <div className="text-xs font-semibold text-purple-700 capitalize mt-0.5">
                  {SIGN_SYMBOLS[signStr]} {signStr}
                  {degree !== null && <span className="text-gray-500 ml-0.5">{degree}&deg;</span>}
                </div>
                {transit && (
                  <div className="text-[10px] text-orange-600 mt-0.5">
                    T: {SIGN_SYMBOLS[transit.sign]} {transit.sign} {Math.floor(transit.degree)}&deg;
                    {transit.isRetrograde ? ' R' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

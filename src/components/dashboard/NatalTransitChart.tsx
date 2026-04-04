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
  Fire: '#ef4444', Water: '#60a5fa', Earth: '#34d399', Air: '#a78bfa',
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

  const toAbsoluteAngle = (sign: string, degree: number): number => {
    const signIndex = ZODIAC_SIGNS.indexOf(sign.toLowerCase() as ZodiacSignType);
    if (signIndex < 0) return 0;
    return signIndex * 30 + (degree % 30);
  };

  const toSvgAngle = (absAngle: number): number => {
    return absAngle - 90;
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
      const planetInfo = natalChart.planets?.find(p => p.name === planet);
      const rawPos = planetInfo?.position ?? 0;
      const deg = rawPos > 0 ? rawPos % 30 : 15;
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
          <defs>
            <radialGradient id="chart-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Dark background circle */}
          <circle cx={cx} cy={cy} r={outerR + 5} fill="rgba(3,7,18,0.6)" />

          {/* Ring structures */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx={cx} cy={cy} r={signR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={natalR} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={transitR} fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r={innerR} fill="url(#chart-center-glow)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />

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
                <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={color}
                  fontSize="14"
                  fontWeight="600"
                  opacity="0.7"
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
                <circle cx={pt.x} cy={pt.y} r="14" fill="rgba(139,92,246,0.08)" />
                <circle cx={pt.x} cy={pt.y} r="12" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.5)" strokeWidth="1" />
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#a78bfa"
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
                <circle cx={pt.x} cy={pt.y} r="13" fill="rgba(249,115,22,0.08)" />
                <circle cx={pt.x} cy={pt.y} r="11" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.5)" strokeWidth="1" />
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fb923c"
                  fontSize="9"
                  fontWeight="700"
                >
                  {PLANET_SYMBOLS[pos.planet] || pos.planet.slice(0, 2)}
                </text>
                {pos.isRetrograde && (
                  <text
                    x={pt.x + 10}
                    y={pt.y - 8}
                    fill="#f87171"
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
          <text x={cx} y={cy - 10} textAnchor="middle" fill="rgba(167,139,250,0.8)" fontSize="9" fontWeight="700" letterSpacing="0.15em">
            NATAL
          </text>
          <text x={cx} y={cy + 3} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8">
            &times;
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(251,146,60,0.8)" fontSize="9" fontWeight="700" letterSpacing="0.15em">
            TRANSIT
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#a78bfa', boxShadow: '0 0 6px rgba(167,139,250,0.4)' }} />
          <span className="text-white/40">Natal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: '#fb923c', boxShadow: '0 0 6px rgba(251,146,60,0.4)' }} />
          <span className="text-white/40">Transit</span>
        </div>
      </div>

      {/* Natal Placements Table */}
      <div className="mt-2">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Natal Placements</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PLANETS.map((planet) => {
            const sign = natalChart.planetaryPositions?.[planet];
            if (!sign) return null;
            const signStr = typeof sign === 'string' ? sign : '';
            const planetInfo = natalChart.planets?.find(p => p.name === planet);
            const rawPos = planetInfo?.position ?? 0;
            const degree = rawPos > 0 ? Math.floor(rawPos % 30) : null;
            const minute = rawPos > 0 ? Math.round(((rawPos % 30) - Math.floor(rawPos % 30)) * 60) : null;
            const transit = transitData[planet];

            return (
              <div key={planet} className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5 text-center">
                <div className="text-base text-purple-400" title={planet}>{PLANET_SYMBOLS[planet]}</div>
                <div className="text-[9px] text-white/30 font-medium uppercase tracking-wider mt-0.5">{planet}</div>
                <div className="text-xs font-semibold text-white/70 capitalize mt-1">
                  <span className="text-purple-400 mr-0.5">{SIGN_SYMBOLS[signStr]}</span> {signStr}
                  {degree !== null && (
                    <span className="text-white/30 font-mono text-[10px] ml-0.5">
                      {degree}&deg;{minute !== null && minute > 0 ? `${minute}\u2032` : ''}
                    </span>
                  )}
                </div>
                {transit && (
                  <div className="text-[10px] text-orange-400/60 mt-1 font-mono">
                    T: {SIGN_SYMBOLS[transit.sign]} {Math.floor(transit.degree)}&deg;
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

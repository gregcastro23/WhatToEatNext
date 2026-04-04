'use client';

import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';

interface ElementalWheelProps {
  natalChart: NatalChart;
}

const ELEMENTS = [
  { name: 'Fire' as const, color: '#ef4444', darkColor: 'rgba(239,68,68,0.15)', angle: -90 },
  { name: 'Air' as const, color: '#a78bfa', darkColor: 'rgba(167,139,250,0.15)', angle: 0 },
  { name: 'Water' as const, color: '#60a5fa', darkColor: 'rgba(96,165,250,0.15)', angle: 90 },
  { name: 'Earth' as const, color: '#34d399', darkColor: 'rgba(52,211,153,0.15)', angle: 180 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const ElementalWheel: React.FC<ElementalWheelProps> = ({ natalChart }) => {
  const { getDominantElement } = useAlchemical();
  const natal = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const dominantElement = natalChart.dominantElement || getDominantElement();
  const dominantConfig = ELEMENTS.find(e => e.name === dominantElement) || ELEMENTS[0];

  const cx = 90;
  const cy = 90;
  const outerR = 72;

  return (
    <div className="bg-gray-950 rounded-3xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Elemental Balance</h3>
          <p className="text-white/30 text-xs mt-0.5">Natal element distribution</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border"
          style={{ color: dominantConfig.color, borderColor: `${dominantConfig.color}40`, backgroundColor: dominantConfig.darkColor }}
        >
          {dominantElement}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <svg width="180" height="180" viewBox="0 0 180 180" className="flex-shrink-0">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />

          {/* Elemental arcs */}
          {ELEMENTS.map((elem, i) => {
            const val = natal[elem.name] ?? 0;
            const startAngle = elem.angle;
            const sweep = Math.max(val * 86, 3);
            return (
              <path
                key={elem.name}
                d={describeArc(cx, cy, outerR, startAngle, startAngle + sweep)}
                fill="none"
                stroke={elem.color}
                strokeWidth="14"
                strokeLinecap="round"
                opacity={elem.name === dominantElement ? 1 : 0.5}
                className="transition-all duration-700"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            );
          })}

          {/* Center */}
          <circle cx={cx} cy={cy} r="28" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.3)" fontWeight="500" letterSpacing="0.1em">
            DOMINANT
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="14" fill="white" fontWeight="700">
            {dominantElement}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {ELEMENTS.map((elem) => {
            const val = natal[elem.name] ?? 0;
            const pct = Math.round(val * 100);
            const isDominant = elem.name === dominantElement;
            return (
              <div key={elem.name} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: elem.color,
                    opacity: isDominant ? 1 : 0.5,
                    boxShadow: isDominant ? `0 0 6px ${elem.color}` : 'none',
                  }}
                />
                <span className={`text-sm flex-1 ${isDominant ? 'text-white font-semibold' : 'text-white/40'}`}>
                  {elem.name}
                </span>
                <span className={`text-sm font-mono tabular-nums ${isDominant ? 'text-white' : 'text-white/30'}`}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

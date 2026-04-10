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
    <div className="glass-base rounded-[2.5rem] p-8 border-white/10 shadow-3xl group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] group-hover:text-purple-400 transition-colors">Elemental Balance</h3>
          <p className="text-white/20 text-[10px] font-medium italic">Natal elemental distribution</p>
        </div>
        <span
          className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-all duration-500 scale-110"
          style={{ 
            color: dominantConfig.color, 
            borderColor: `${dominantConfig.color}40`, 
            backgroundColor: dominantConfig.darkColor,
            boxShadow: `0 0 15px ${dominantConfig.darkColor}`
          }}
        >
          {dominantElement}
        </span>
      </div>

      <div className="flex items-center gap-10">
        <div className="relative">
          {/* Subtle background glow for the wheel */}
          <div 
            className="absolute inset-0 blur-[30px] opacity-20 transition-all duration-1000"
            style={{ backgroundColor: dominantConfig.color }}
          />
          <svg width="180" height="180" viewBox="0 0 180 180" className="flex-shrink-0 relative z-10">
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="18" />

            {/* Elemental arcs */}
            {ELEMENTS.map((elem, i) => {
              const val = natal[elem.name] ?? 0;
              const startAngle = elem.angle;
              const sweep = Math.max(val * 86, 4);
              return (
                <path
                  key={elem.name}
                  d={describeArc(cx, cy, outerR, startAngle, startAngle + sweep)}
                  fill="none"
                  stroke={elem.color}
                  strokeWidth="16"
                  strokeLinecap="round"
                  opacity={elem.name === dominantElement ? 1 : 0.35}
                  className="transition-all duration-700 ease-in-out hover:opacity-100 cursor-pointer"
                  style={{ animationDelay: `${i * 150}ms`, filter: elem.name === dominantElement ? `drop-shadow(0 0 8px ${elem.color}60)` : 'none' }}
                />
              );
            })}

            {/* Center Hub */}
            <circle cx={cx} cy={cy} r="32" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.2)" fontWeight="900" letterSpacing="0.2em">
              DOMINANT
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fill="white" fontWeight="900" letterSpacing="0.05em">
              {dominantElement.toUpperCase()}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4">
          {ELEMENTS.map((elem) => {
            const val = natal[elem.name] ?? 0;
            const pct = Math.round(val * 100);
            const isDominant = elem.name === dominantElement;
            return (
              <div key={elem.name} className="flex items-center gap-4 group/legend">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-300 group-hover/legend:scale-125"
                  style={{
                    backgroundColor: elem.color,
                    opacity: isDominant ? 1 : 0.3,
                    boxShadow: isDominant ? `0 0 10px ${elem.color}` : 'none',
                  }}
                />
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black tracking-widest transition-colors ${isDominant ? 'text-white' : 'text-white/30 group-hover/legend:text-white/50'}`}>
                      {elem.name.toUpperCase()}
                    </span>
                    <span className={`text-xs font-mono tabular-nums tracking-tighter ${isDominant ? 'text-white shadow-sm' : 'text-white/10'}`}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.02] h-[2px] mt-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000"
                      style={{ width: `${pct}%`, backgroundColor: elem.color, opacity: isDominant ? 0.8 : 0.2 }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';

interface ElementalWheelProps {
  natalChart: NatalChart;
}

const ELEMENTS = [
  { name: 'Fire' as const, color: '#ef4444', angle: -90 },
  { name: 'Air' as const, color: '#eab308', angle: 0 },
  { name: 'Water' as const, color: '#3b82f6', angle: 90 },
  { name: 'Earth' as const, color: '#22c55e', angle: 180 },
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

  const cx = 100;
  const cy = 100;
  const outerR = 80;
  const innerR = 55;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-800">Elemental Balance</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          {dominantElement}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <svg width="200" height="200" viewBox="0 0 200 200" className="flex-shrink-0">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#f1f5f9" strokeWidth="20" />

          {/* Natal elemental arcs */}
          {ELEMENTS.map((elem, i) => {
            const val = natal[elem.name] ?? 0;
            const startAngle = elem.angle;
            const sweep = Math.max(val * 88, 2); // max 88deg per quadrant
            return (
              <path
                key={elem.name}
                d={describeArc(cx, cy, outerR, startAngle, startAngle + sweep)}
                fill="none"
                stroke={elem.color}
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.85"
                className="transition-all duration-700"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            );
          })}

          {/* Center label */}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
            Dominant
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="16" fill="#1e293b" fontWeight="700">
            {dominantElement}
          </text>

          {/* Element labels on the wheel */}
          {ELEMENTS.map((elem) => {
            const pos = polarToCartesian(cx, cy, innerR - 14, elem.angle + 20);
            return (
              <text
                key={`label-${elem.name}`}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                fontSize="10"
                fill={elem.color}
                fontWeight="600"
                dominantBaseline="central"
              >
                {elem.name}
              </text>
            );
          })}
        </svg>

        {/* Legend with percentages */}
        <div className="flex-1 space-y-2.5">
          {ELEMENTS.map((elem) => {
            const val = natal[elem.name] ?? 0;
            const pct = Math.round(val * 100);
            return (
              <div key={elem.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: elem.color }} />
                <span className="text-sm text-gray-700 flex-1">{elem.name}</span>
                <span className="text-sm font-semibold text-gray-800 font-mono">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

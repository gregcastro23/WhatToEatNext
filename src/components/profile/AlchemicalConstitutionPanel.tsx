'use client';

import React from 'react';
import type { NatalChart } from '@/types/natalChart';

interface AlchemicalConstitutionPanelProps {
  natalChart: NatalChart;
}

const ESMS_CONFIG = [
  { key: 'Spirit' as const, color: '#ef4444', bgColor: 'bg-red-50', textColor: 'text-red-700', barColor: 'bg-red-500', description: 'Governs intuitive cooking and creative impulse' },
  { key: 'Essence' as const, color: '#3b82f6', bgColor: 'bg-blue-50', textColor: 'text-blue-700', barColor: 'bg-blue-500', description: 'The flow of feeling and flavor connection' },
  { key: 'Matter' as const, color: '#22c55e', bgColor: 'bg-green-50', textColor: 'text-green-700', barColor: 'bg-green-600', description: 'Physical nourishment and grounding sustenance' },
  { key: 'Substance' as const, color: '#f97316', bgColor: 'bg-orange-50', textColor: 'text-orange-700', barColor: 'bg-orange-500', description: 'The building blocks and metabolic fuel' },
];

export const AlchemicalConstitutionPanel: React.FC<AlchemicalConstitutionPanelProps> = ({ natalChart }) => {
  const alch = natalChart.alchemicalProperties || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const total = alch.Spirit + alch.Essence + alch.Matter + alch.Substance;
  const norm = total > 0 ? total : 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">Alchemical Constitution</h3>
        <span className="text-xs text-gray-400 font-mono">
          A# = {total.toFixed(1)}
        </span>
      </div>

      <div className="space-y-4">
        {ESMS_CONFIG.map((item, idx) => {
          const val = alch[item.key] ?? 0;
          const pct = (val / norm) * 100;
          return (
            <div key={item.key} className="group" title={item.description}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-gray-700">{item.key}</span>
                <span className="text-gray-500 font-mono text-xs">{val.toFixed(1)} ({pct.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.barColor} transition-all duration-700 ease-out`}
                  style={{
                    width: `${pct}%`,
                    animationDelay: `${idx * 100}ms`,
                  }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

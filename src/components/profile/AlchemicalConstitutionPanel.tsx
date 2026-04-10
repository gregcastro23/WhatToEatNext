'use client';

import React from 'react';
import type { NatalChart } from '@/types/natalChart';

interface AlchemicalConstitutionPanelProps {
  natalChart: NatalChart;
}

const ESMS_CONFIG = [
  { key: 'Spirit' as const, color: '#ef4444', label: 'SPI', description: 'Governs intuitive cooking and creative impulse' },
  { key: 'Essence' as const, color: '#60a5fa', label: 'ESS', description: 'The flow of feeling and flavor connection' },
  { key: 'Matter' as const, color: '#34d399', label: 'MAT', description: 'Physical nourishment and grounding sustenance' },
  { key: 'Substance' as const, color: '#f97316', label: 'SUB', description: 'The building blocks and metabolic fuel' },
];

export const AlchemicalConstitutionPanel: React.FC<AlchemicalConstitutionPanelProps> = ({ natalChart }) => {
  const alch = natalChart.alchemicalProperties || { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const total = alch.Spirit + alch.Essence + alch.Matter + alch.Substance;
  const norm = total > 0 ? total : 1;

  // Find dominant
  const dominant = ESMS_CONFIG.reduce((max, item) => {
    const val = alch[item.key] ?? 0;
    return val > (alch[max.key] ?? 0) ? item : max;
  }, ESMS_CONFIG[0]);

  return (
    <div className="alchm-card rounded-[2.5rem] p-7 border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Alchemical Constitution</h3>
          <p className="text-white/30 text-[10px] mt-1 italic">Your natal ESMS signature</p>
        </div>
        <span className="text-[10px] font-bold text-white/20 font-mono tracking-tighter uppercase">A# {total.toFixed(1)}</span>
      </div>

      <div className="space-y-4">
        {ESMS_CONFIG.map((item) => {
          const val = alch[item.key] ?? 0;
          const pct = (val / norm) * 100;
          const isDominant = item.key === dominant.key;
          return (
            <div key={item.key} className="group" title={item.description}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: isDominant ? `0 0 8px ${item.color}` : 'none' }}
                  />
                  <span className={`text-sm font-semibold ${isDominant ? 'text-white' : 'text-white/60'}`}>
                    {item.key}
                  </span>
                </div>
                <span className="text-white/40 text-xs font-mono tabular-nums">
                  {val.toFixed(1)} <span className="text-white/20">({pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color,
                    opacity: isDominant ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

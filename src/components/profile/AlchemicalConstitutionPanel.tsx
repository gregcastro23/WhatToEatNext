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
    <div className="glass-card-premium rounded-[2.5rem] p-8 border-white/10 shadow-3xl group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] group-hover:text-purple-400 transition-colors">Alchemical Constitution</h3>
          <p className="text-white/20 text-[10px] font-medium italic">Signature Natal ESMS Distribution</p>
        </div>
        <div className="px-3 py-1 glass-highlight rounded-full">
          <span className="text-[10px] font-black text-white/40 font-mono tracking-tighter uppercase transition-colors group-hover:text-white/60">A# {total.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-6">
        {ESMS_CONFIG.map((item) => {
          const val = alch[item.key] ?? 0;
          const pct = (val / norm) * 100;
          const isDominant = item.key === dominant.key;
          const gradClass = `grad-${item.key.toLowerCase()}-${item.name?.toLowerCase() || ''}`.replace('--', '-');
          // Map to the premium gradients in globals.css
          const gradMap: Record<string, string> = {
            Spirit: 'grad-spirit-fire',
            Essence: 'grad-essence-water',
            Matter: 'grad-matter-earth',
            Substance: 'grad-substance-air'
          };

          return (
            <div key={item.key} className="group/item cursor-help" title={item.description}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isDominant ? 'scale-125' : 'opacity-40'}`}
                    style={{ backgroundColor: item.color, boxShadow: isDominant ? `0 0 12px ${item.color}` : 'none' }}
                  />
                  <span className={`text-sm font-black tracking-wide transition-colors ${isDominant ? 'text-white' : 'text-white/40 group-hover/item:text-white/60'}`}>
                    {item.key.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white font-mono text-sm tabular-nums tracking-tighter">
                    {val.toFixed(1)}
                  </span>
                  <span className="text-white/20 text-[10px] font-mono uppercase">
                    ({pct.toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-white/[0.03] rounded-full h-2 overflow-hidden border border-white/5 p-[1px]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-[0.16,1,0.3,1] ${gradMap[item.key]}`}
                  style={{
                    width: `${pct}%`,
                    opacity: isDominant ? 1 : 0.4,
                    boxShadow: isDominant ? '0 0 15px rgba(255,255,255,0.1)' : 'none'
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

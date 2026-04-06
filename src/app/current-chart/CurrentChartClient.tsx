'use client';

import React from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { CurrentTransitAnalysis } from '@/components/dashboard/CurrentTransitAnalysis';

export function CurrentChartClient({ natalChart }: { natalChart: any }) {
  const { state } = useAlchemical();
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-950 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Season</div>
          <div className="text-sm font-bold text-white capitalize">{state.currentSeason || 'Unknown'}</div>
        </div>
        <div className="bg-gray-950 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Time of Day</div>
          <div className="text-sm font-bold text-white capitalize">{state.timeOfDay || 'Unknown'}</div>
        </div>
        <div className="bg-gray-950 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Lunar Phase</div>
          <div className="text-sm font-bold text-white capitalize">{state.lunarPhase || 'Unknown'}</div>
        </div>
        <div className="bg-gray-950 rounded-2xl p-4 border border-white/5 text-center">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Dominant Element</div>
          <div className="text-sm font-bold text-white capitalize">{state.dominantElement || 'Unknown'}</div>
        </div>
      </div>

      <div className="bg-black/50 p-6 rounded-3xl border border-white/[0.05] shadow-2xl">
        <div className="mb-6 border-b border-white/5 pb-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Global Planetary Alignments</h3>
          <p className="text-white/40 text-sm mt-1">
            Reflecting the sky directly above at this very moment, accurate to the exact arc-minute.
          </p>
        </div>
        <CurrentTransitAnalysis natalChart={natalChart} />
      </div>
    </>
  );
}

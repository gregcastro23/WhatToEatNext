'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { NatalChart } from '@/types/natalChart';

interface CosmicAlignmentCardProps {
  natalChart: NatalChart;
}

const MOON_PHASES = [
  { name: 'New Moon', icon: '\u{1F311}' },
  { name: 'Waxing Crescent', icon: '\u{1F312}' },
  { name: 'First Quarter', icon: '\u{1F313}' },
  { name: 'Waxing Gibbous', icon: '\u{1F314}' },
  { name: 'Full Moon', icon: '\u{1F315}' },
  { name: 'Waning Gibbous', icon: '\u{1F316}' },
  { name: 'Last Quarter', icon: '\u{1F317}' },
  { name: 'Waning Crescent', icon: '\u{1F318}' },
];

function getMoonPhase(): { name: string; icon: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const c = Math.floor(365.25 * year) + Math.floor(30.6 * month) + day - 694039.09;
  const phase = ((c / 29.53058867) % 1 + 1) % 1;
  const idx = Math.floor(phase * 8) % 8;
  return MOON_PHASES[idx];
}

const PLANETARY_HOURS = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
function getPlanetaryHour(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dayPlanetOrder = [3, 6, 2, 5, 1, 4, 0];
  const hourOfDay = now.getHours();
  const startPlanet = dayPlanetOrder[dayOfWeek];
  const idx = (startPlanet + hourOfDay) % 7;
  return PLANETARY_HOURS[idx];
}

export const CosmicAlignmentCard: React.FC<CosmicAlignmentCardProps> = ({ natalChart }) => {
  const { getDominantElement } = useAlchemical();
  const [moonPhase, setMoonPhase] = useState(getMoonPhase);
  const [planetaryHour, setPlanetaryHour] = useState(getPlanetaryHour);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMoonPhase(getMoonPhase());
      setPlanetaryHour(getPlanetaryHour());
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentDominant = getDominantElement();
  const natalDominant = natalChart.dominantElement || 'Fire';
  const aligned = currentDominant === natalDominant;

  return (
    <div className="glass-card-premium rounded-[2.5rem] p-8 border-white/10 shadow-3xl group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.3em] group-hover:text-purple-400 transition-colors">Cosmic Alignment</h3>
          <p className="text-white/20 text-[10px] font-medium italic">Pulse of the Celestial Sphere</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 glass-highlight rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {[
          { label: 'Planetary Hour', value: planetaryHour, sub: 'Current Governor' },
          { label: 'Moon Phase', value: moonPhase.name, icon: moonPhase.icon, sub: 'Lunar Cycle' },
          { label: 'Current Element', value: currentDominant, sub: 'Celestial State' },
          { label: 'Natal Status', value: aligned ? 'In Harmony' : 'Contrast', sub: 'Personal Resonance', highlighted: true, alert: aligned }
        ].map((item, idx) => (
          <div 
            key={idx} 
            className="glass-highlight rounded-[1.75rem] p-5 border border-white/5 hover:border-white/10 transition-all hover:translate-y-[-2px] group/item"
          >
            <div className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2.5 group-hover/item:text-white/40 transition-colors">{item.label}</div>
            <div className="flex flex-col">
              <div className={`text-white font-black text-[13px] uppercase tracking-widest flex items-center gap-2 ${item.highlighted ? (item.alert ? 'text-emerald-400' : 'text-amber-400') : ''}`}>
                {item.icon && <span className="opacity-80 text-lg">{item.icon}</span>}
                {item.value}
              </div>
              <span className="text-[8px] text-white/10 uppercase tracking-widest mt-1 group-hover/item:text-white/20 transition-colors">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="mt-8 block text-center text-[10px] text-purple-400 font-black hover:text-purple-300 transition-all uppercase tracking-[0.3em] hover:tracking-[0.35em]"
      >
        Sync Recommendations &rarr;
      </Link>
    </div>
  );
};

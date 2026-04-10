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
    <div className="alchm-card rounded-[2.5rem] p-7 border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Today&apos;s Cosmic Alignment</h3>
          <p className="text-white/30 text-[10px] mt-1 italic">Real-time celestial weather</p>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
          <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Planetary Hour</div>
          <div className="text-white font-bold text-[13px] uppercase tracking-widest">{planetaryHour}</div>
        </div>
        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
          <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Moon Phase</div>
          <div className="text-white font-bold text-[13px] uppercase tracking-widest flex items-center gap-1.5">
            <span className="opacity-80">{moonPhase.icon}</span>
            <span className="text-[11px]">{moonPhase.name}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
          <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Current Element</div>
          <div className="text-white font-bold text-[13px] uppercase tracking-widest">{currentDominant}</div>
        </div>
        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
          <div className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-2">Natal Alignment</div>
          <div className={`font-bold text-[11px] uppercase tracking-[0.15em] ${aligned ? 'text-green-400' : 'text-amber-400'}`}>
            {aligned ? 'In Harmony' : 'Contrast'}
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-[10px] text-purple-400 font-bold hover:text-purple-300 transition-colors uppercase tracking-[0.2em]"
      >
        Explore Today&apos;s Recommendations &rarr;
      </Link>
    </div>
  );
};

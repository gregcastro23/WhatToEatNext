'use client';

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
  // Simple Metonic cycle approximation
  const c = Math.floor(365.25 * year) + Math.floor(30.6 * month) + day - 694039.09;
  const phase = ((c / 29.53058867) % 1 + 1) % 1;
  const idx = Math.floor(phase * 8) % 8;
  return MOON_PHASES[idx];
}

const PLANETARY_HOURS = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
function getPlanetaryHour(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const dayPlanetOrder = [3, 6, 2, 5, 1, 4, 0]; // Sun=3,Mon=6,...
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
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">Today&apos;s Cosmic Alignment</h3>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Planetary Hour</div>
          <div className="text-sm font-bold text-gray-800">{planetaryHour}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Moon Phase</div>
          <div className="text-sm font-bold text-gray-800">
            <span className="mr-1">{moonPhase.icon}</span>
            {moonPhase.name}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Current Element</div>
          <div className="text-sm font-bold text-gray-800">{currentDominant}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Natal Alignment</div>
          <div className={`text-sm font-bold ${aligned ? 'text-green-600' : 'text-amber-600'}`}>
            {aligned ? 'In Harmony' : 'Contrast'}
          </div>
        </div>
      </div>

      <a
        href="/"
        className="mt-4 block text-center text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors"
      >
        See today&apos;s recommended cuisines &rarr;
      </a>
    </div>
  );
};

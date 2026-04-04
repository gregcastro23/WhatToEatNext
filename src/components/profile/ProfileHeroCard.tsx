'use client';

import React from 'react';
import type { UserTier } from '@/lib/tiers';
import type { NatalChart } from '@/types/natalChart';

interface ProfileHeroCardProps {
  userName: string;
  email: string;
  natalChart: NatalChart;
  tier: UserTier;
  onEditProfile: () => void;
  onOpenSettings: () => void;
}

const ELEMENT_GRADIENTS: Record<string, string> = {
  Fire: 'from-red-600 via-orange-500 to-amber-500',
  Water: 'from-blue-700 via-blue-500 to-cyan-400',
  Earth: 'from-green-700 via-emerald-500 to-lime-400',
  Air: 'from-yellow-500 via-amber-400 to-orange-300',
};

const ELEMENT_SIGIL: Record<string, string> = {
  Fire: '\u{1F525}',
  Water: '\u{1F30A}',
  Earth: '\u{1F33F}',
  Air: '\u{1F32C}\uFE0F',
};

function CosmicSigil({ natalChart }: { natalChart: NatalChart }) {
  const el = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const elements = [
    { name: 'Fire', value: el.Fire ?? 0, color: '#ef4444', angle: 0 },
    { name: 'Air', value: el.Air ?? 0, color: '#eab308', angle: 90 },
    { name: 'Water', value: el.Water ?? 0, color: '#3b82f6', angle: 180 },
    { name: 'Earth', value: el.Earth ?? 0, color: '#22c55e', angle: 270 },
  ];
  const r = 28;
  const cx = 36;
  const cy = 36;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="drop-shadow-lg">
      <circle cx={cx} cy={cy} r="34" fill="rgba(139,92,246,0.15)" />
      <circle cx={cx} cy={cy} r="30" fill="rgba(10,10,15,0.6)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      {elements.map((elem) => {
        const rad = (elem.angle * Math.PI) / 180;
        const dist = r * Math.min(elem.value * 2.5, 1);
        const x = cx + dist * Math.cos(rad);
        const y = cy + dist * Math.sin(rad);
        return (
          <circle
            key={elem.name}
            cx={x}
            cy={y}
            r={4 + elem.value * 8}
            fill={elem.color}
            opacity={0.7 + elem.value * 0.3}
            className="transition-all duration-700"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#8b5cf6" />
    </svg>
  );
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  userName,
  email: _email,
  natalChart,
  tier,
  onEditProfile,
  onOpenSettings,
}) => {
  const dominantElement = natalChart.dominantElement || 'Fire';
  const gradient = ELEMENT_GRADIENTS[dominantElement] || ELEMENT_GRADIENTS.Fire;
  const sunSign = natalChart.planetaryPositions?.Sun || '';
  const moonSign = natalChart.planetaryPositions?.Moon || '';

  // Look up exact degree positions for sub-arcminute display
  const sunPlanet = natalChart.planets?.find(p => p.name === 'Sun');
  const moonPlanet = natalChart.planets?.find(p => p.name === 'Moon');
  const formatDeg = (position: number | undefined): string => {
    if (!position || position <= 0) return '';
    const degInSign = position % 30;
    return `${Math.floor(degInSign)}\u00B0`;
  };
  const sunDeg = formatDeg(sunPlanet?.position);
  const moonDeg = formatDeg(moonPlanet?.position);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg">
      <div className={`bg-gradient-to-r ${gradient} p-6 md:p-8`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          <CosmicSigil natalChart={natalChart} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {userName}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                tier === 'premium'
                  ? 'bg-amber-400/90 text-amber-900'
                  : 'bg-white/20 text-white/90 backdrop-blur-sm border border-white/30'
              }`}>
                {tier === 'premium' ? 'Premium' : 'Free'}
              </span>
            </div>
            <p className="text-white/80 text-sm mt-1.5">
              {ELEMENT_SIGIL[dominantElement]} {dominantElement} dominant
              {sunSign && <span className="capitalize"> &middot; {sunDeg && <span className="font-mono">{sunDeg} </span>}{sunSign} Sun</span>}
              {moonSign && <span className="capitalize"> &middot; {moonDeg && <span className="font-mono">{moonDeg} </span>}{moonSign} Moon</span>}
              {natalChart.dominantModality && <span> &middot; {natalChart.dominantModality}</span>}
            </p>
            {natalChart.ascendant && (
              <p className="text-white/60 text-xs mt-0.5 capitalize">
                {natalChart.ascendant} rising
              </p>
            )}
          </div>
          <div className="flex gap-2 self-start md:self-center">
            <button
              onClick={onEditProfile}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium border border-white/30"
            >
              Edit Profile
            </button>
            <button
              onClick={onOpenSettings}
              className="px-3 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/20"
              title="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

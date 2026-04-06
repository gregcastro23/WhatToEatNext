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

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

function formatDeg(position: number | undefined): string {
  if (!position || position <= 0) return '';
  const degInSign = position % 30;
  const deg = Math.floor(degInSign);
  const min = Math.round((degInSign - deg) * 60);
  return `${deg}\u00B0${min}\u2032`;
}

function CosmicSigil({ natalChart }: { natalChart: NatalChart }) {
  const el = natalChart.elementalBalance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const elements = [
    { name: 'Fire', value: el.Fire ?? 0, color: '#ef4444', angle: -90 },
    { name: 'Air', value: el.Air ?? 0, color: '#a78bfa', angle: 0 },
    { name: 'Water', value: el.Water ?? 0, color: '#60a5fa', angle: 90 },
    { name: 'Earth', value: el.Earth ?? 0, color: '#34d399', angle: 180 },
  ];
  const r = 32;
  const cx = 44;
  const cy = 44;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <defs>
        <radialGradient id="sigil-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139,92,246,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r="42" fill="url(#sigil-bg)" />
      <circle cx={cx} cy={cy} r="36" fill="rgba(15,15,20,0.7)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
      {/* Orbital ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth="0.5" />
      {elements.map((elem) => {
        const rad = (elem.angle * Math.PI) / 180;
        const dist = r * Math.min(elem.value * 2.2, 0.95);
        const x = cx + dist * Math.cos(rad);
        const y = cy + dist * Math.sin(rad);
        const size = 3 + elem.value * 10;
        return (
          <g key={elem.name}>
            <circle cx={x} cy={y} r={size + 2} fill={elem.color} opacity={0.1} />
            <circle cx={x} cy={y} r={size} fill={elem.color} opacity={0.8} className="transition-all duration-700" />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#a78bfa" />
      <circle cx={cx} cy={cy} r="1.5" fill="white" opacity="0.9" />
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
  const sunSign = (natalChart.planetaryPositions?.Sun || '') as string;
  const moonSign = (natalChart.planetaryPositions?.Moon || '') as string;
  const ascendant = (natalChart.ascendant || '') as string;

  const sunPlanet = natalChart.planets?.find(p => p.name === 'Sun');
  const moonPlanet = natalChart.planets?.find(p => p.name === 'Moon');
  const ascPlanet = natalChart.planets?.find(p => p.name === 'Ascendant');

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Dark gradient background — Co-Star inspired */}
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-6 md:p-8">
        {/* Subtle radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(99,102,241,0.1),_transparent_60%)]" />

        <div className="relative z-10">
          {/* Top row: name + actions */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {userName}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  tier === 'premium'
                    ? 'bg-amber-400/90 text-amber-950'
                    : 'bg-white/10 text-white/60 border border-white/10'
                }`}>
                  {tier === 'premium' ? 'Premium' : 'Free'}
                </span>
              </div>
              <p className="text-white/40 text-xs tracking-wide uppercase">Your Cosmic Profile</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onEditProfile}
                className="px-3.5 py-1.5 bg-white/10 text-white/80 rounded-full hover:bg-white/15 transition-colors text-xs font-medium border border-white/10"
              >
                Edit Profile
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 bg-white/5 text-white/50 rounded-full hover:bg-white/10 transition-colors border border-white/10"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Big Three + Sigil */}
          <div className="flex items-center gap-6">
            <CosmicSigil natalChart={natalChart} />
            <div className="flex-1 grid grid-cols-3 gap-4">
              {/* Sun */}
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Sun</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl text-amber-400">{SIGN_SYMBOLS[sunSign] || ''}</span>
                  <span className="text-white font-bold capitalize text-lg">{sunSign}</span>
                </div>
                <div className="text-white/30 text-xs font-mono mt-0.5">{formatDeg(sunPlanet?.position)}</div>
              </div>
              {/* Moon */}
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Moon</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl text-blue-400">{SIGN_SYMBOLS[moonSign] || ''}</span>
                  <span className="text-white font-bold capitalize text-lg">{moonSign}</span>
                </div>
                <div className="text-white/30 text-xs font-mono mt-0.5">{formatDeg(moonPlanet?.position)}</div>
              </div>
              {/* Rising */}
              <div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Rising</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl text-purple-400">{SIGN_SYMBOLS[ascendant] || ''}</span>
                  <span className="text-white font-bold capitalize text-lg">{ascendant}</span>
                </div>
                <div className="text-white/30 text-xs font-mono mt-0.5">{formatDeg(ascPlanet?.position)}</div>
              </div>
            </div>
          </div>

          {/* Bottom tags */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5">
            {natalChart.dominantElement && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 uppercase tracking-wider">
                {natalChart.dominantElement} dominant
              </span>
            )}
            {natalChart.dominantModality && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 uppercase tracking-wider">
                {natalChart.dominantModality}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
            opacity={0.8 + elem.value * 0.2}
            className="transition-all duration-700 hover:scale-110 cursor-pointer origin-center shadow-lg"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#ffffff" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
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

  return (
    <div className="group relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`} />
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden mix-blend-overlay">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse-slow" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black rounded-full mix-blend-overlay filter blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 md:p-10 backdrop-blur-[2px]">
        <div className="shrink-0 relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-110" />
          <CosmicSigil natalChart={natalChart} />
        </div>
        
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              {userName}
            </h1>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm ${
              tier === 'premium'
                ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-950 border border-amber-300'
                : 'bg-white/10 text-white/90 backdrop-blur-md border border-white/20'
            }`}>
              {tier === 'premium' ? 'Premium Tier' : 'Free Tier'}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-2 mt-3 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="text-lg leading-none">{ELEMENT_SIGIL[dominantElement]}</span> 
              {dominantElement} dominant
            </span>
            {sunSign && (
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm capitalize">
                &#x2609; {sunSign} Sun
              </span>
            )}
            {moonSign && (
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm shadow-sm capitalize">
                &#x263D; {moonSign} Moon
              </span>
            )}
            {natalChart.ascendant && (
              <span className="flex items-center gap-1.5 bg-purple-900/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-purple-500/20 capitalize">
                AC {natalChart.ascendant} Rising
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <button
            onClick={onEditProfile}
            className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white rounded-xl transition-all duration-200 text-sm font-bold border border-white/20 shadow-lg text-center"
          >
            Edit Profile
          </button>
          <button
            onClick={onOpenSettings}
            className="flex-none p-3 bg-black/20 hover:bg-black/30 active:bg-black/40 backdrop-blur-md text-white rounded-xl transition-all duration-200 border border-white/10 shadow-lg items-center justify-center hidden md:flex text-sm font-medium"
            title="Settings"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

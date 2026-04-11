'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react';
import { QuestPanel } from '@/components/economy/QuestPanel';
import { TokenBalanceBar } from '@/components/economy/TokenBalanceBar';
import { PremiumGate } from '@/components/PremiumGate';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard';
import { TierUpgradePrompt } from '@/components/profile/TierUpgradePrompt';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { reportQuestEvent } from '@/lib/questReporter';
import type { UserTier } from '@/lib/tiers';
import type { NatalChart } from '@/types/natalChart';
import type { SavedRestaurant } from '@/types/restaurant';
import { CommensalManager } from './CommensalManager';
import { CurrentTransitAnalysis } from './CurrentTransitAnalysis';
import { FoodLabBook } from './FoodLabBook';
import { NatalTransitChart } from './NatalTransitChart';
import { NotificationPanel } from './NotificationPanel';
import { RecommendationsPanel } from './RecommendationsPanel';

const SIGN_SYMBOLS: Record<string, string> = {
  aries: '\u2648', taurus: '\u2649', gemini: '\u264A', cancer: '\u264B',
  leo: '\u264C', virgo: '\u264D', libra: '\u264E', scorpio: '\u264F',
  sagittarius: '\u2650', capricorn: '\u2651', aquarius: '\u2652', pisces: '\u2653',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '\u2609', Moon: '\u263D', Mercury: '\u263F', Venus: '\u2640',
  Mars: '\u2642', Jupiter: '\u2643', Saturn: '\u2644', Uranus: '\u2645',
  Neptune: '\u2646', Pluto: '\u2647',
};

/**
 * Format a planet's ecliptic longitude to degree+minute within its sign.
 * Returns empty string if position is unknown (0 or missing).
 */
function formatDegreeMinute(position: number | undefined): string {
  if (!position || position <= 0) return '';
  const degInSign = position % 30;
  const deg = Math.floor(degInSign);
  const min = Math.round((degInSign - deg) * 60);
  return `${deg}\u00B0${min}\u2032`;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
  savedRestaurants?: SavedRestaurant[];
}

interface UserDashboardProps {
  session: any;
  profileData: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}

/* ─── Live Transit Status Bar ──────────────────────────────── */

function LiveTransitBar({ natalChart }: { natalChart: NatalChart }) {
  const { planetaryPositions: currentPositionsRaw } = useAlchemical();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const sunData = currentPositionsRaw?.sun as any;
  const moonData = currentPositionsRaw?.moon as any;
  const transitSunSign = (sunData?.sign || natalChart.planetaryPositions?.Sun || '') as string;
  const transitMoonSign = (moonData?.sign || natalChart.planetaryPositions?.Moon || '') as string;

  const sunDeg = sunData?.degree != null ? `${Math.floor(sunData.degree % 30)}\u00B0` : '';
  const moonDeg = moonData?.degree != null ? `${Math.floor(moonData.degree % 30)}\u00B0` : '';

  return (
    <div className="glass-card-premium rounded-full px-8 py-4 border-white/10 shadow-3xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Live Transits</span>
            <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase mt-0.5">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase">
          {transitSunSign && (
            <div className="flex items-center gap-2 group/sun">
              <span className="text-amber-400 text-xl group-hover/sun:scale-125 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                {SIGN_SYMBOLS[transitSunSign.toLowerCase()] || '\u2609'}
              </span>
              <div className="flex flex-col">
                <span className="text-white/70 group-hover/sun:text-white transition-colors tracking-[0.15em]">{transitSunSign}</span>
                {sunDeg && <span className="text-white/20 font-mono text-[9px] tracking-tighter">{sunDeg} Solar Transit</span>}
              </div>
            </div>
          )}
          <div className="w-px h-6 bg-white/5" />
          {transitMoonSign && (
            <div className="flex items-center gap-2 group/moon">
              <span className="text-blue-300 text-xl group-hover/moon:scale-125 transition-transform duration-500 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]">
                {SIGN_SYMBOLS[transitMoonSign.toLowerCase()] || '\u263D'}
              </span>
              <div className="flex flex-col">
                <span className="text-white/70 group-hover/moon:text-white transition-colors tracking-[0.15em]">{transitMoonSign}</span>
                {moonDeg && <span className="text-white/20 font-mono text-[9px] tracking-tighter">{moonDeg} Lunar Flow</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Collapsible Section ────────────────────────────────── */

function CollapsibleSection({
  title,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-base rounded-[2.5rem] overflow-hidden border-white/10 shadow-3xl transition-all duration-500">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-white/[0.04] transition-all"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]">{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-amber-950 rounded-full min-w-[20px] text-center shadow-lg shadow-amber-500/20">
              {badge}
            </span>
          )}
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          className="w-4 h-4 text-white/20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-7 pb-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Settings Panel ─────────────────────────────────────── */

function SettingsPanel({
  userName,
  email,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}: {
  userName: string;
  email: string;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}) {
  const chartDate = natalChart?.birthData?.dateTime
    ? new Date(natalChart.birthData.dateTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="glass-card-premium rounded-[2.5rem] p-8 border-white/10">
        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">Account Identity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs text-white/40">Name</span>
            <span className="text-xs font-semibold text-white">{userName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-xs text-white/40">Email</span>
            <span className="text-xs font-semibold text-white">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-white/40">Dominant Element</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{natalChart.dominantElement}</span>
          </div>
        </div>
      </div>

      <div className="glass-card-premium rounded-[2.5rem] p-8 border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Temporal Origin</h3>
          <button onClick={onEditBirthData} className="text-[10px] text-purple-400 font-black hover:text-purple-300 transition-colors uppercase tracking-[0.25em]">
            Recalibrate
          </button>
        </div>
        {chartDate && <p className="text-sm text-white/90 font-medium mb-1.5">{chartDate}</p>}
        {natalChart.birthData && (
          <p className="text-[10px] text-white/30 font-mono tracking-tighter">
            {natalChart.birthData.latitude.toFixed(4)}, {natalChart.birthData.longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="glass-card-premium rounded-[2.5rem] p-8 border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Culinary Vectors</h3>
          <button onClick={onEditPreferences} className="text-[10px] text-purple-400 font-black hover:text-purple-300 transition-colors uppercase tracking-[0.25em]">
            Reconfigure
          </button>
        </div>
        <div className="space-y-3 text-xs">
          {preferences.dietaryRestrictions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-white/30 mr-1">Dietary:</span>
              <span className="text-white/80 font-medium">{preferences.dietaryRestrictions.join(', ')}</span>
            </div>
          )}
          {preferences.preferredCuisines.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-white/30 mr-1">Preferred:</span>
              <span className="text-white/80 font-medium">{preferences.preferredCuisines.join(', ')}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white/30 mr-2">Spice:</span>
              <span className="text-white/80 font-medium capitalize">{preferences.spicePreference}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div>
              <span className="text-white/30 mr-2">Complexity:</span>
              <span className="text-white/80 font-medium capitalize">{preferences.complexity}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={() => { void signOut({ callbackUrl: '/' }); }}
          className="px-8 py-3 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-all text-[10px] font-bold uppercase tracking-[0.2em] border border-red-500/20"
        >
          Initiate Logout
        </button>
      </div>
    </div>
  );
}

/* ─── Birth Chart Section ────────────────────────────────── */

function BirthChartSection({ natalChart }: { natalChart: NatalChart }) {
  const sunSign = (natalChart.planetaryPositions?.Sun || '') as string;
  const moonSign = (natalChart.planetaryPositions?.Moon || '') as string;
  const rising = (natalChart.ascendant || '') as string;

  const findPlanet = (name: string) => natalChart.planets?.find(p => p.name === name);

  return (
    <Link href="/birth-chart" className="block bg-gray-950 rounded-3xl p-6 border border-white/5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Birth Chart</h3>
          <p className="text-white/30 text-xs mt-0.5">Natal planetary placements</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
          <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {/* Big Three omitted for brevity inside the card content, standard rendering happens below */}


      {/* Big Three */}
      <div className="flex gap-3 mb-5">
        {[
          { label: 'Sun', sign: sunSign, color: 'amber', planet: findPlanet('Sun') },
          { label: 'Moon', sign: moonSign, color: 'blue', planet: findPlanet('Moon') },
          { label: 'Rising', sign: rising, color: 'purple', planet: findPlanet('Ascendant') },
        ].map(({ label, sign, color, planet }) => sign && (
          <div key={label} className="flex-1 bg-white/[0.03] rounded-2xl p-3 border border-white/5 text-center">
            <div className={`text-${color}-400 text-xl mb-1`}>{SIGN_SYMBOLS[sign.toLowerCase()] || ''}</div>
            <div className="text-white/30 text-[9px] uppercase tracking-widest">{label}</div>
            <div className="text-white font-bold capitalize text-sm mt-0.5">{sign}</div>
            {planet && formatDegreeMinute(planet.position) && (
              <div className="text-white/20 text-[10px] font-mono mt-0.5">{formatDegreeMinute(planet.position)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Remaining planets */}
      <div className="grid grid-cols-4 gap-2">
        {(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const).map((planet) => {
          const sign = natalChart.planetaryPositions?.[planet];
          if (!sign) return null;
          const signStr = typeof sign === 'string' ? sign : '';
          const pos = formatDegreeMinute(findPlanet(planet)?.position);
          return (
            <div key={planet} className="text-center p-2 bg-white/[0.02] rounded-xl border border-white/5">
              <div className="text-white/50 text-sm mb-0.5">{PLANET_SYMBOLS[planet] || ''}</div>
              <div className="text-[9px] text-white/20 uppercase tracking-wider">{planet}</div>
              <div className="text-xs font-semibold text-white/70 capitalize mt-0.5">{signStr}</div>
              {pos && <div className="text-[9px] font-mono text-white/20 mt-0.5">{pos}</div>}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

/* ─── Pending Requests Badge ────────────────────────────────── */

function usePendingRequestCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/commensals', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setCount(data.pendingReceived?.length ?? 0);
        }
      } catch {
        // ignore
      }
    }
    void fetchCount();
  }, []);

  return count;
}

/* ─── Main Dashboard ─────────────────────────────────────── */

type ViewMode = 'dashboard' | 'chart-detail' | 'recommendations' | 'companions' | 'labbook' | 'cosmic-quests' | 'settings';

export const UserDashboard: React.FC<UserDashboardProps> = ({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const pendingRequests = usePendingRequestCount();

  // Fire quest events when navigating to specific views
  const handleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'chart-detail') reportQuestEvent('view_chart');
    if (mode === 'recommendations') reportQuestEvent('view_insight');
  }, []);

  const email = session?.user?.email || '';
  const userName = session?.user?.name || 'User';

  const tier: UserTier = (profileData?.subscription?.tier as UserTier) || 'free';

  const BackButton = () => (
    <motion.button
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      onClick={() => setViewMode('dashboard')}
      className="inline-flex items-center gap-1.5 text-[10px] text-white/40 font-bold hover:text-white/80 transition-colors mb-4 uppercase tracking-[0.2em]"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
      </svg>
      Return to Dashboard
    </motion.button>
  );

  if (viewMode === 'chart-detail') {
    return (
      <div className="space-y-4">
        <BackButton />
        <div className="bg-gray-950 rounded-3xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Natal &amp; Transit Chart</h3>
          <p className="text-xs text-white/30 mb-5">Your natal placements (purple) overlaid with current transits (orange)</p>
          <NatalTransitChart natalChart={natalChart} />
        </div>
        <BirthChartSection natalChart={natalChart} />
      </div>
    );
  }

  if (viewMode === 'recommendations') {
    return (
      <div className="space-y-4">
        <BackButton />
        <RecommendationsPanel email={email} natalChart={natalChart} preferences={preferences} />
      </div>
    );
  }

  if (viewMode === 'companions') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <BackButton />
        <div className="alchm-card rounded-[2.5rem] p-1 shadow-2xl overflow-hidden border-white/5">
          <PremiumGate feature="diningCompanions" showPreview>
            <CommensalManager />
          </PremiumGate>
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'labbook') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <BackButton />
        <div className="alchm-card rounded-[2.5rem] p-4 shadow-2xl overflow-hidden border-white/5">
          <FoodLabBook />
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'cosmic-quests') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <BackButton />
        <TokenBalanceBar className="mb-4" />
        <QuestPanel />
      </motion.div>
    );
  }

  if (viewMode === 'settings') {
    return (
      <div className="space-y-4">
        <BackButton />
        <SettingsPanel
          userName={userName}
          email={email}
          natalChart={natalChart}
          preferences={preferences}
          onEditBirthData={onEditBirthData}
          onEditPreferences={onEditPreferences}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-6 py-12 space-y-12"
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <span className="w-12 h-px bg-purple-500/30" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Alchm.kitchen // Adept Core</span>
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter alchm-gradient-text uppercase leading-[0.9]">
            Adept<br />Dashboard
          </h1>
        </div>
        <div className="w-full md:w-auto">
          <LiveTransitBar natalChart={natalChart} />
        </div>
      </header>

      {/* Token Economy Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <TokenBalanceBar />
      </motion.div>

      {/* Main Grid: Identity & Cosmic Pulse */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Core Identity */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <ProfileHeroCard
              userName={userName}
              email={email}
              natalChart={natalChart}
              tier={tier}
              onEditProfile={onEditBirthData}
              onOpenSettings={() => setViewMode('settings')}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
              <AlchemicalConstitutionPanel natalChart={natalChart} />
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              <ElementalWheel natalChart={natalChart} />
            </motion.div>
          </div>
        </div>

        {/* Right Column: Active Transits & Actions */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <CosmicAlignmentCard natalChart={natalChart} />
          </motion.div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-2">Quick Modules</h4>
            <div className="grid grid-cols-1 gap-4">
              <NavCard
                label="Full Natal Chart"
                description="Explore the deep architecture of your natal celestial alignment."
                onClick={() => handleViewMode('chart-detail')}
                delay={0.7}
              />
              <NavCard
                label="Cosmic Quests"
                description="Complete daily rituals and weekly quests to earn ESMS tokens."
                onClick={() => setViewMode('cosmic-quests')}
                delay={0.75}
              />
              <NavCard
                label="Commensal Sync"
                description="Coordinate culinary harmony with your dining companions."
                onClick={() => setViewMode('companions')}
                badge={pendingRequests}
                delay={0.8}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lab Logs & Notifications Section */}
      <section className="pt-12 border-t border-white/5 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em]">Esoteric Logs</h2>
            <p className="text-white/20 text-[10px] italic">Insights, notifications, and transit events</p>
          </div>
          <div className="h-px flex-1 bg-white/5 hidden md:block mx-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Logs Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="glass-base rounded-[2.5rem] p-8 border border-white/10"
            >
              <NotificationPanel />
            </motion.div>
          </div>

          {/* Side Transits/Premium */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <CollapsibleSection title="Active Transits" defaultOpen>
                <CurrentTransitAnalysis natalChart={natalChart} />
              </CollapsibleSection>
            </motion.div>

            {tier === 'free' && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <TierUpgradePrompt />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Meta */}
      <footer className="pt-12 pb-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em]">
          Codex Revision 4.2.0 // System Operational
        </div>
        <div className="flex gap-8">
          <button className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Documentation</button>
          <button className="text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Support Registry</button>
        </div>
      </footer>
    </motion.div>
  );
};

/* ─── Navigation Card ────────────────────────────────────── */

function NavCard({
  label,
  description,
  onClick,
  badge,
  delay = 0,
}: {
  label: string;
  description: string;
  onClick: () => void;
  badge?: number;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative glass-card-premium rounded-[1.5rem] p-6 text-left transition-all group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
      
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-4 right-4 w-5 h-5 flex items-center justify-center text-[10px] font-black bg-amber-400 text-amber-950 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.4)] ring-4 ring-gray-950/20 z-10">
          {badge}
        </span>
      )}
      
      <div className="relative z-10">
        <div className="text-[11px] font-black text-white/40 uppercase tracking-[0.25em] mb-2 group-hover:text-purple-300 transition-colors">
          {label}
        </div>
        <div className="text-[10px] text-white/25 leading-relaxed font-medium group-hover:text-white/50 transition-colors max-w-[80%]">
          {description}
        </div>
      </div>
    </motion.button>
  );
}

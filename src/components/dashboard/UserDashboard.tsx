'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumGate } from '@/components/PremiumGate';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard';
import { TierUpgradePrompt } from '@/components/profile/TierUpgradePrompt';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import type { UserTier } from '@/lib/tiers';
import type { NatalChart } from '@/types/natalChart';
import type { SavedRestaurant } from '@/types/restaurant';
import { CommensalManager } from './CommensalManager';
import { CurrentTransitAnalysis } from './CurrentTransitAnalysis';
import { DashboardOverview } from './DashboardOverview';
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
    <div className="alchm-card rounded-[2rem] px-7 py-4 border-white/5 shadow-2xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" />
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live Transits</span>
          <span className="text-[10px] text-white/20 font-mono tracking-tighter uppercase">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase">
          {transitSunSign && (
            <span className="flex items-center gap-1.5 group">
              <span className="text-amber-400 text-lg group-hover:scale-125 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">{SIGN_SYMBOLS[transitSunSign.toLowerCase()] || '\u2609'}</span>
              <span className="text-white/60 group-hover:text-white transition-colors tracking-widest">{transitSunSign}</span>
              {sunDeg && <span className="text-white/20 font-mono text-[9px] tracking-tighter">{sunDeg}</span>}
            </span>
          )}
          {transitMoonSign && (
              <span className="text-white/70 capitalize font-medium">{ascendant}</span>
            </span>
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
    <div className="alchm-card rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-white/[0.03] transition-colors"
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
    <div className="space-y-4">
      <div className="alchm-card rounded-[2.5rem] p-7 border-white/5">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-5">Account</h3>
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

      <div className="alchm-card rounded-[2.5rem] p-7 border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Birth Data</h3>
          <button onClick={onEditBirthData} className="text-[10px] text-purple-400 font-bold hover:text-purple-300 transition-colors uppercase tracking-widest">
            Edit
          </button>
        </div>
        {chartDate && <p className="text-sm text-white/90 font-medium mb-1.5">{chartDate}</p>}
        {natalChart.birthData && (
          <p className="text-[10px] text-white/30 font-mono tracking-tighter">
            {natalChart.birthData.latitude.toFixed(4)}, {natalChart.birthData.longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="alchm-card rounded-[2.5rem] p-7 border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Food Preferences</h3>
          <button onClick={onEditPreferences} className="text-[10px] text-purple-400 font-bold hover:text-purple-300 transition-colors uppercase tracking-widest">
            Edit
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

function CurrentChartSection() {
  const { planetaryPositions } = useAlchemical();
  const sunData = planetaryPositions?.sun as any;
  const moonData = planetaryPositions?.moon as any;
  
  return (
    <Link href="/current-chart" className="block bg-gray-950 rounded-3xl p-6 border border-white/5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-900/20 transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Current Transits</h3>
          <p className="text-white/30 text-xs mt-0.5">Real-time planetary alignments</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
          <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        {[
          { label: 'Sun', sign: sunData?.sign, color: 'amber' },
          { label: 'Moon', sign: moonData?.sign, color: 'blue' },
        ].map(({ label, sign, color }) => sign && (
          <div key={label} className="flex-1 bg-white/[0.03] rounded-2xl p-3 border border-white/5 text-center">
            <div className={`text-${color}-400 text-xl mb-1`}>{SIGN_SYMBOLS[sign.toLowerCase()] || ''}</div>
            <div className="text-white/30 text-[9px] uppercase tracking-widest">{label}</div>
            <div className="text-white font-bold capitalize text-sm mt-0.5">{sign}</div>
          </div>
        ))}
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

type ViewMode = 'dashboard' | 'chart-detail' | 'recommendations' | 'companions' | 'labbook' | 'settings';

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Live Transit Status Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LiveTransitBar natalChart={natalChart} />
      </motion.div>

      {/* Hero Identity Card */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
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

      {/* Alchemical Self + Cosmic Alignment — dark cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <AlchemicalConstitutionPanel natalChart={natalChart} />
        </motion.div>
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <CosmicAlignmentCard natalChart={natalChart} />
        </motion.div>
      </div>

      {/* Elemental Wheel + Birth/Transit Action Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <ElementalWheel natalChart={natalChart} />
        </motion.div>
        <div className="flex flex-col gap-5">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
            <BirthChartSection natalChart={natalChart} />
          </motion.div>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }}>
            <CurrentChartSection />
          </motion.div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NavCard
          label="Full Chart"
          description="Natal & transit overlay"
          onClick={() => setViewMode('chart-detail')}
          delay={0.7}
        />
        <NavCard
          label="Recommendations"
          description="Cuisines & methods"
          onClick={() => setViewMode('recommendations')}
          delay={0.8}
        />
        <NavCard
          label="Companions"
          description="Dining group harmony"
          onClick={() => setViewMode('companions')}
          badge={pendingRequests}
          delay={0.9}
        />
        <NavCard
          label="Lab Book"
          description="Experiments & notes"
          onClick={() => setViewMode('labbook')}
          delay={1.0}
        />
      </div>

      {/* Cosmic Harmony Overview */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <DashboardOverview profileData={profileData} natalChart={natalChart} email={email} />
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <CollapsibleSection title="Notifications" defaultOpen>
          <NotificationPanel />
        </CollapsibleSection>
      </motion.div>

      {/* Transits */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <CollapsibleSection title="Current Transits" defaultOpen>
          <CurrentTransitAnalysis natalChart={natalChart} />
        </CollapsibleSection>
      </motion.div>

      {/* Premium Upsell */}
      {tier === 'free' && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
        >
          <TierUpgradePrompt />
        </motion.div>
      )}
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
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative alchm-card rounded-2xl p-5 border-white/5 text-left transition-all group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-amber-950 rounded-full shadow-lg shadow-amber-500/30 ring-2 ring-gray-950">
          {badge}
        </span>
      )}
      <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1 group-hover:text-purple-400 transition-colors">
        {label}
      </div>
      <div className="text-[10px] text-white/20 leading-relaxed font-medium group-hover:text-white/40 transition-colors">
        {description}
      </div>
    </motion.button>
  );
}

'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
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
  const ascendant = (natalChart.ascendant || '') as string;

  const sunDeg = sunData?.degree != null ? `${Math.floor(sunData.degree % 30)}\u00B0` : '';
  const moonDeg = moonData?.degree != null ? `${Math.floor(moonData.degree % 30)}\u00B0` : '';

  return (
    <div className="bg-gray-950 rounded-2xl px-5 py-3.5 border border-white/5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Transits</span>
          <span className="text-[10px] text-white/20">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs">
          {transitSunSign && (
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 text-sm">{SIGN_SYMBOLS[transitSunSign.toLowerCase()] || '\u2609'}</span>
              <span className="text-white/70 capitalize font-medium">{transitSunSign}</span>
              {sunDeg && <span className="text-white/30 font-mono text-[10px]">{sunDeg}</span>}
            </span>
          )}
          {transitMoonSign && (
            <span className="flex items-center gap-1.5">
              <span className="text-blue-400 text-sm">{SIGN_SYMBOLS[transitMoonSign.toLowerCase()] || '\u263D'}</span>
              <span className="text-white/70 capitalize font-medium">{transitMoonSign}</span>
              {moonDeg && <span className="text-white/30 font-mono text-[10px]">{moonDeg}</span>}
            </span>
          )}
          {ascendant && (
            <span className="flex items-center gap-1.5">
              <span className="text-purple-400 text-xs font-bold">AC</span>
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] text-center">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
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
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-gray-900">{userName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Dominant Element</span>
            <span className="text-sm font-medium text-gray-900">{natalChart.dominantElement}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Birth Data</h3>
          <button onClick={onEditBirthData} className="text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors uppercase tracking-wider">
            Edit
          </button>
        </div>
        {chartDate && <p className="text-sm text-gray-700 mb-1">{chartDate}</p>}
        {natalChart.birthData && (
          <p className="text-xs text-gray-400 font-mono">
            {natalChart.birthData.latitude.toFixed(4)}, {natalChart.birthData.longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Food Preferences</h3>
          <button onClick={onEditPreferences} className="text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors uppercase tracking-wider">
            Edit
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {preferences.dietaryRestrictions.length > 0 && (
            <div>
              <span className="text-gray-400">Dietary: </span>
              <span className="text-gray-700">{preferences.dietaryRestrictions.join(', ')}</span>
            </div>
          )}
          {preferences.preferredCuisines.length > 0 && (
            <div>
              <span className="text-gray-400">Preferred: </span>
              <span className="text-gray-700">{preferences.preferredCuisines.join(', ')}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400">Spice: </span>
            <span className="text-gray-700 capitalize">{preferences.spicePreference}</span>
            <span className="text-gray-200 mx-2">|</span>
            <span className="text-gray-400">Complexity: </span>
            <span className="text-gray-700 capitalize">{preferences.complexity}</span>
          </div>
          {preferences.dislikedIngredients.length > 0 && (
            <div>
              <span className="text-gray-400">Avoiding: </span>
              <span className="text-gray-700">{preferences.dislikedIngredients.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 border border-red-50">
        <button
          onClick={() => { void signOut({ callbackUrl: '/' }); }}
          className="px-4 py-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors text-xs font-bold uppercase tracking-wider border border-red-100"
        >
          Log Out
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
    <button
      onClick={() => setViewMode('dashboard')}
      className="inline-flex items-center gap-1.5 text-xs text-white/50 font-medium hover:text-white/80 transition-colors mb-2 uppercase tracking-wider"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Dashboard
    </button>
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
      <div className="space-y-4">
        <BackButton />
        <PremiumGate feature="diningCompanions" showPreview>
          <CommensalManager />
        </PremiumGate>
      </div>
    );
  }

  if (viewMode === 'labbook') {
    return (
      <div className="space-y-4">
        <BackButton />
        <FoodLabBook />
      </div>
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
    <div className="space-y-5">
      {/* Live Transit Status Bar */}
      <LiveTransitBar natalChart={natalChart} />

      {/* Hero Identity Card */}
      <ProfileHeroCard
        userName={userName}
        email={email}
        natalChart={natalChart}
        tier={tier}
        onEditProfile={onEditBirthData}
        onOpenSettings={() => setViewMode('settings')}
      />

      {/* Alchemical Self + Cosmic Alignment — dark cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <AlchemicalConstitutionPanel natalChart={natalChart} />
        <CosmicAlignmentCard natalChart={natalChart} />
      </div>

      {/* Elemental Wheel + Birth/Transit Action Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <ElementalWheel natalChart={natalChart} />
        <div className="flex flex-col gap-4">
          <BirthChartSection natalChart={natalChart} />
          <CurrentChartSection />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NavCard
          label="Full Chart"
          description="Natal & transit overlay"
          onClick={() => setViewMode('chart-detail')}
        />
        <NavCard
          label="Recommendations"
          description="Cuisines & methods"
          onClick={() => setViewMode('recommendations')}
        />
        <NavCard
          label="Companions"
          description="Dining group harmony"
          onClick={() => setViewMode('companions')}
          badge={pendingRequests}
        />
        <NavCard
          label="Lab Book"
          description="Experiments & notes"
          onClick={() => setViewMode('labbook')}
        />
      </div>

      {/* Cosmic Harmony Overview */}
      <DashboardOverview profileData={profileData} natalChart={natalChart} email={email} />

      {/* Notifications */}
      <CollapsibleSection title="Notifications" defaultOpen>
        <NotificationPanel />
      </CollapsibleSection>

      {/* Transits */}
      <CollapsibleSection title="Current Transits" defaultOpen>
        <CurrentTransitAnalysis natalChart={natalChart} />
      </CollapsibleSection>

      {/* Premium Upsell */}
      {tier === 'free' && <TierUpgradePrompt />}
    </div>
  );
};

/* ─── Navigation Card ────────────────────────────────────── */

function NavCard({
  label,
  description,
  onClick,
  badge,
}: {
  label: string;
  description: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-gray-200 hover:shadow-md transition-all group"
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
      <div className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{label}</div>
      <div className="text-[11px] text-gray-400 mt-1">{description}</div>
    </button>
  );
}

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { PremiumGate } from '@/components/PremiumGate';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard';
import { TierUpgradePrompt } from '@/components/profile/TierUpgradePrompt';
import type { UserTier } from '@/lib/tiers';
import type { NatalChart } from '@/types/natalChart';
import type { SavedRestaurant } from '@/types/restaurant';
import { CommensalManager } from './CommensalManager';
import { CurrentTransitAnalysis } from './CurrentTransitAnalysis';
import { DashboardOverview } from './DashboardOverview';
import { FoodLabBook } from './FoodLabBook';
import { NatalTransitChart } from './NatalTransitChart';
import { RecommendationsPanel } from './RecommendationsPanel';
import { NotificationPanel } from './NotificationPanel';

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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const sunSign = natalChart.planetaryPositions?.Sun;
  const moonSign = natalChart.planetaryPositions?.Moon;
  const ascendant = natalChart.ascendant;

  // Determine season emoji from Sun sign
  const seasonInfo: Record<string, string> = {
    aries: 'Aries Season', taurus: 'Taurus Season', gemini: 'Gemini Season',
    cancer: 'Cancer Season', leo: 'Leo Season', virgo: 'Virgo Season',
    libra: 'Libra Season', scorpio: 'Scorpio Season', sagittarius: 'Sagittarius Season',
    capricorn: 'Capricorn Season', aquarius: 'Aquarius Season', pisces: 'Pisces Season',
  };

  const currentSeason = sunSign ? seasonInfo[sunSign] || '' : '';

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-xl px-4 py-3 text-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-purple-200">LIVE TRANSITS</span>
          <span className="text-xs text-purple-300">
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {sunSign && (
            <span className="flex items-center gap-1">
              <span className="text-amber-300">&#x2609;</span>
              <span className="capitalize">{sunSign}</span>
            </span>
          )}
          {moonSign && (
            <span className="flex items-center gap-1">
              <span className="text-blue-300">&#x263D;</span>
              <span className="capitalize">{moonSign}</span>
            </span>
          )}
          {ascendant && (
            <span className="flex items-center gap-1">
              <span className="text-purple-300">AC</span>
              <span className="capitalize">{ascendant}</span>
            </span>
          )}
          {currentSeason && (
            <span className="text-purple-300 hidden sm:inline">{currentSeason}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Collapsible Section ────────────────────────────────── */

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
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
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-base font-bold text-gray-800 mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-800">{userName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-800">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Dominant Element</span>
            <span className="text-sm font-medium text-gray-800">{natalChart.dominantElement}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">Birth Data</h3>
          <button onClick={onEditBirthData} className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors">
            Edit
          </button>
        </div>
        {chartDate && <p className="text-sm text-gray-700 mb-1">{chartDate}</p>}
        {natalChart.birthData && (
          <p className="text-xs text-gray-500">
            Lat: {natalChart.birthData.latitude.toFixed(4)}, Long: {natalChart.birthData.longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">Food Preferences</h3>
          <button onClick={onEditPreferences} className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors">
            Edit
          </button>
        </div>
        <div className="space-y-2 text-sm">
          {preferences.dietaryRestrictions.length > 0 && (
            <div>
              <span className="text-gray-500">Dietary: </span>
              <span className="text-gray-800">{preferences.dietaryRestrictions.join(', ')}</span>
            </div>
          )}
          {preferences.preferredCuisines.length > 0 && (
            <div>
              <span className="text-gray-500">Preferred cuisines: </span>
              <span className="text-gray-800">{preferences.preferredCuisines.join(', ')}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Spice: </span>
            <span className="text-gray-800 capitalize">{preferences.spicePreference}</span>
            <span className="text-gray-300 mx-2">|</span>
            <span className="text-gray-500">Complexity: </span>
            <span className="text-gray-800 capitalize">{preferences.complexity}</span>
          </div>
          {preferences.dislikedIngredients.length > 0 && (
            <div>
              <span className="text-gray-500">Avoiding: </span>
              <span className="text-gray-800">{preferences.dislikedIngredients.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 border border-red-100">
        <h3 className="text-base font-bold text-red-700 mb-3">Actions</h3>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

/* ─── Birth Chart Section ────────────────────────────────── */

function BirthChartSection({ natalChart }: { natalChart: NatalChart }) {
  const sunSign = natalChart.planetaryPositions?.Sun;
  const moonSign = natalChart.planetaryPositions?.Moon;
  const rising = natalChart.ascendant;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <h3 className="text-base font-bold text-gray-800 mb-3">Birth Chart</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        {sunSign && (
          <span className="text-sm px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 capitalize">
            &#x2609; Sun in {sunSign}
          </span>
        )}
        {moonSign && (
          <span className="text-sm px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 capitalize">
            &#x263D; Moon in {moonSign}
          </span>
        )}
        {rising && (
          <span className="text-sm px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-200 capitalize">
            AC {rising} Rising
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const).map((planet) => {
          const sign = natalChart.planetaryPositions?.[planet];
          if (!sign) return null;
          const signStr = typeof sign === 'string' ? sign : '';
          return (
            <div key={planet} className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-[10px] text-gray-500 uppercase">{planet}</div>
              <div className="text-xs font-semibold text-gray-700 capitalize">{signStr}</div>
            </div>
          );
        })}
      </div>
    </div>
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

type ViewMode = 'dashboard' | 'chart-detail' | 'recommendations' | 'companions' | 'labbook' | 'settings' | 'budget';


/* ─── Budget Settings Panel ────────────────────────────────── */

function BudgetSettingsPanel() {
  const [budgetVal, setBudgetVal] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem('weeklyBudget');
    if (val) setBudgetVal(val);
  }, []);

  const handleSave = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed > 0) {
      localStorage.setItem('weeklyBudget', parsed.toString());
    } else {
      localStorage.removeItem('weeklyBudget');
      setBudgetVal('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentBudget = parseFloat(budgetVal);
  const perMeal = !isNaN(currentBudget) && currentBudget > 0 ? (currentBudget / 21).toFixed(2) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-emerald-100 flex flex-col items-center">
      <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4">
        &#x1F4B0;
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Weekly Grocery Budget</h3>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-sm">
        Set your weekly grocery limits to receive cost-effective recipe recommendations tailored to your astrological alignment.
      </p>

      <div className="w-full max-w-xs space-y-5">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
          <input
            type="number"
            min="0"
            max="2000"
            value={budgetVal}
            onChange={(e) => setBudgetVal(e.target.value)}
            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all font-semibold text-gray-800 outline-none"
            placeholder="e.g. 150 (Leave blank for none)"
          />
        </div>

        {perMeal && (
          <div className="text-center bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
            <span className="text-xs text-emerald-700/70 font-semibold block uppercase tracking-wide mb-1">Estimated Base Meal Cost</span>
            <span className="text-2xl font-black text-emerald-600">${perMeal}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Based on 21 meals per week</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-sm active:scale-[0.98]"
        >
          {saved ? '&#x2713; Saved!' : 'Save Budget Preference'}
        </button>
      </div>
    </div>
  );
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}) => {
  const pendingRequests = usePendingRequestCount();

  const email = session?.user?.email || '';
  const userName = session?.user?.name || 'User';

  const tier: UserTier = (profileData?.subscription?.tier as UserTier) || 'free';

  return (
    <div className="space-y-5">
      <LiveTransitBar natalChart={natalChart} />

      <CollapsibleSection title="Notifications" icon="&#x1F9EA;" defaultOpen>
        <NotificationPanel />
      </CollapsibleSection>

      <ProfileHeroCard
        userName={userName}
        email={email}
        natalChart={natalChart}
        tier={tier}
        onEditProfile={onEditBirthData}
        onOpenSettings={onEditPreferences}
      />

      <div className="grid md:grid-cols-2 gap-5">
        <AlchemicalConstitutionPanel natalChart={natalChart} />
        <CosmicAlignmentCard natalChart={natalChart} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <NavCard
          icon="&#x1F52E;"
          label="Birth Chart"
          description="Detailed planetary analysis and placements"
          href="/profile/birthchart"
          gradient="from-purple-500/10 to-indigo-500/10"
        />
        <NavCard
          icon="&#x1F316;"
          label="Day/Night"
          description="View your active sectarian shifts"
          href="/profile/day-night-effects"
          gradient="from-amber-500/10 to-blue-500/10"
        />
        <NavCard
          icon="&#x1F37D;&#xFE0F;"
          label="Food Prefs"
          description="Manage dietary constraints and tastes"
          href="/profile/preferences"
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <NavCard
          icon="&#x1F4B0;"
          label="Budget"
          description="Manage total food grocery limits"
          onClick={() => {}}
          gradient="from-slate-500/10 to-gray-500/10"
        />
      </div>

      <DashboardOverview profileData={profileData} natalChart={natalChart} email={email} />

      <CollapsibleSection title="Current Transits" icon="&#x1F30C;" defaultOpen>
        <CurrentTransitAnalysis natalChart={natalChart} />
      </CollapsibleSection>
    </div>
  );
};

/* ─── Navigation Card ────────────────────────────────────── */

function NavCard({
  icon,
  label,
  description,
  href,
  onClick,
  badge,
  gradient = 'from-purple-500/10 to-indigo-500/10',
}: {
  icon: string;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  gradient?: string;
}) {
  const content = (
    <div className={`relative h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between overflow-hidden group hover:shadow-lg hover:border-purple-200 transition-all duration-300 z-10`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
      
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-[11px] font-bold bg-red-500 text-white rounded-full shadow-sm animate-pulse-slow">
          {badge}
        </span>
      )}
      
      <div>
        <span className="text-3xl block mb-3 group-hover:scale-110 group-hover:-rotate-3 origin-bottom-left transition-transform duration-300" dangerouslySetInnerHTML={{ __html: icon }} />
        <div className="text-base font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{label}</div>
      </div>
      <div className="text-xs text-gray-500 mt-2 leading-relaxed">{description}</div>
      
      <div className="absolute right-4 bottom-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-purple-600">
        &rarr;
      </div>
    </div>
  );

  const className = "block w-full h-full text-left outline-none focus:ring-2 focus:ring-purple-500 rounded-2xl focus:ring-offset-2 transition-all active:scale-[0.98]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}

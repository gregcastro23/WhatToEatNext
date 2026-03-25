'use client';

import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import type { NatalChart } from '@/types/natalChart';
import type { SavedRestaurant } from '@/types/restaurant';
import type { UserTier } from '@/lib/tiers';
import { ProfileHeroCard } from '@/components/profile/ProfileHeroCard';
import { AlchemicalConstitutionPanel } from '@/components/profile/AlchemicalConstitutionPanel';
import { CosmicAlignmentCard } from '@/components/profile/CosmicAlignmentCard';
import { ElementalWheel } from '@/components/profile/ElementalWheel';
import { TierUpgradePrompt } from '@/components/profile/TierUpgradePrompt';
import { FeatureGate } from '@/components/profile/FeatureGate';
import { CommensalManager } from './CommensalManager';
import { CurrentTransitAnalysis } from './CurrentTransitAnalysis';
import { DashboardOverview } from './DashboardOverview';
import { FoodLabBook } from './FoodLabBook';
import { NatalTransitChart } from './NatalTransitChart';
import { RecommendationsPanel } from './RecommendationsPanel';
import { SocialManager } from './SocialManager';

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

/* ─── Collapsible Section ────────────────────────────────── */

function CollapsibleSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
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

/* ─── Main Dashboard ─────────────────────────────────────── */

type ViewMode = 'dashboard' | 'chart-detail' | 'recommendations' | 'companions' | 'social' | 'labbook' | 'settings';

export const UserDashboard: React.FC<UserDashboardProps> = ({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  const email = session?.user?.email || '';
  const userName = session?.user?.name || 'User';

  // Default to free tier (real tier would come from subscription service)
  const tier: UserTier = (profileData?.subscription?.tier as UserTier) || 'free';

  if (viewMode === 'chart-detail') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Natal &amp; Transit Chart</h3>
          <p className="text-xs text-gray-500 mb-4">Your natal placements (purple) overlaid with current transits (orange)</p>
          <NatalTransitChart natalChart={natalChart} />
        </div>
        <BirthChartSection natalChart={natalChart} />
      </div>
    );
  }

  if (viewMode === 'recommendations') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
        <RecommendationsPanel email={email} natalChart={natalChart} preferences={preferences} />
      </div>
    );
  }

  if (viewMode === 'companions') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
        <CommensalManager />
      </div>
    );
  }

  if (viewMode === 'social') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
        <SocialManager />
      </div>
    );
  }

  if (viewMode === 'labbook') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
        <FoodLabBook />
      </div>
    );
  }

  if (viewMode === 'settings') {
    return (
      <div className="space-y-4">
        <button onClick={() => setViewMode('dashboard')} className="text-sm text-purple-600 font-medium hover:text-purple-800">
          &larr; Back to Dashboard
        </button>
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
      {/* Hero Identity Card */}
      <ProfileHeroCard
        userName={userName}
        email={email}
        natalChart={natalChart}
        tier={tier}
        onEditProfile={onEditBirthData}
        onOpenSettings={() => setViewMode('settings')}
      />

      {/* Alchemical Self + Cosmic Alignment */}
      <div className="grid md:grid-cols-2 gap-5">
        <AlchemicalConstitutionPanel natalChart={natalChart} />
        <CosmicAlignmentCard natalChart={natalChart} />
      </div>

      {/* Elemental Wheel + Birth Chart Summary */}
      <div className="grid md:grid-cols-2 gap-5">
        <ElementalWheel natalChart={natalChart} />
        <BirthChartSection natalChart={natalChart} />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <NavCard
          icon="&#x1F52E;"
          label="Full Chart"
          description="Natal & transit overlay"
          onClick={() => setViewMode('chart-detail')}
        />
        <NavCard
          icon="&#x1F37D;&#xFE0F;"
          label="Recommendations"
          description="Cuisines & methods"
          onClick={() => setViewMode('recommendations')}
        />
        <NavCard
          icon="&#x1F465;"
          label="Companions"
          description="Dining group harmony"
          onClick={() => setViewMode('companions')}
        />
        <NavCard
          icon="&#x1F9EA;"
          label="Lab Book"
          description="Experiments & notes"
          onClick={() => setViewMode('labbook')}
        />
      </div>

      {/* Cosmic Harmony Overview (from existing DashboardOverview) */}
      <DashboardOverview profileData={profileData} natalChart={natalChart} email={email} />

      {/* Transits (collapsible) */}
      <CollapsibleSection title="Current Transits" icon="&#x1F30C;" defaultOpen={false}>
        <CurrentTransitAnalysis natalChart={natalChart} />
      </CollapsibleSection>

      {/* Social (collapsible) */}
      <CollapsibleSection title="Social &amp; Friends" icon="&#x1F91D;" defaultOpen={false}>
        <SocialManager />
      </CollapsibleSection>

      {/* Premium Upsell (only for free tier) */}
      {tier === 'free' && <TierUpgradePrompt />}
    </div>
  );
};

/* ─── Navigation Card ────────────────────────────────────── */

function NavCard({
  icon,
  label,
  description,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 text-left hover:border-purple-200 hover:shadow-md transition-all group"
    >
      <span className="text-2xl block mb-2" dangerouslySetInnerHTML={{ __html: icon }} />
      <div className="text-sm font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{description}</div>
    </button>
  );
}

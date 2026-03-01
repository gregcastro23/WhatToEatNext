'use client';

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import type { NatalChart } from '@/types/natalChart';
import { DashboardOverview } from './DashboardOverview';
import { NatalTransitChart } from './NatalTransitChart';
import { RecommendationsPanel } from './RecommendationsPanel';

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface UserDashboardProps {
  session: any;
  profileData: any;
  natalChart: NatalChart;
  preferences: UserPreferences;
  onEditBirthData: () => void;
  onEditPreferences: () => void;
}

type DashboardTab = 'overview' | 'chart' | 'recommendations' | 'settings';

const TAB_CONFIG: Array<{ key: DashboardTab; label: string; icon: string }> = [
  { key: 'overview', label: 'Overview', icon: '\u2728' },
  { key: 'chart', label: 'My Chart', icon: '\uD83D\uDD2E' },
  { key: 'recommendations', label: 'Recommendations', icon: '\uD83C\uDF7D\uFE0F' },
  { key: 'settings', label: 'Settings', icon: '\u2699\uFE0F' },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  session,
  profileData,
  natalChart,
  preferences,
  onEditBirthData,
  onEditPreferences,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const email = session?.user?.email || '';
  const userName = session?.user?.name || 'User';

  // Extract birth chart date for display
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
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-orange-500 p-5 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {userName.split(' ')[0]}
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                {natalChart.dominantElement} dominant &middot; {natalChart.dominantModality} modality
                {natalChart.ascendant && (
                  <span className="capitalize"> &middot; {natalChart.ascendant} rising</span>
                )}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium border border-white/30"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-0 border-b border-gray-200">
          <div className="flex gap-0 overflow-x-auto">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <DashboardOverview
          profileData={profileData}
          natalChart={natalChart}
          email={email}
        />
      )}

      {activeTab === 'chart' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Natal &amp; Transit Chart</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your natal placements (purple) overlaid with current transits (orange)
                </p>
              </div>
              {chartDate && (
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                  Born: {chartDate}
                </span>
              )}
            </div>
            <NatalTransitChart natalChart={natalChart} />
          </div>

          {/* Aspect Summary */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-3">Chart Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailCard
                label="Sun Sign"
                value={natalChart.planetaryPositions?.Sun}
                icon="\u2609"
              />
              <DetailCard
                label="Moon Sign"
                value={natalChart.planetaryPositions?.Moon}
                icon="\u263D"
              />
              <DetailCard
                label="Rising Sign"
                value={natalChart.ascendant}
                icon="AC"
              />
              <DetailCard
                label="Dominant Element"
                value={natalChart.dominantElement}
                icon="\u2B50"
              />
              <DetailCard
                label="Modality"
                value={natalChart.dominantModality}
                icon="\u2B53"
              />
              <DetailCard
                label="Chart Date"
                value={natalChart.calculatedAt ? new Date(natalChart.calculatedAt).toLocaleDateString() : '—'}
                icon="\uD83D\uDCC5"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <RecommendationsPanel
          email={email}
          natalChart={natalChart}
          preferences={preferences}
        />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm p-5">
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
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Dominant Element</span>
                <span className="text-sm font-medium text-gray-800">{natalChart.dominantElement}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Chart Calculated</span>
                <span className="text-sm font-medium text-gray-800">
                  {natalChart.calculatedAt ? new Date(natalChart.calculatedAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Birth Data */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800">Birth Data</h3>
              <button
                onClick={onEditBirthData}
                className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors"
              >
                Edit
              </button>
            </div>
            {chartDate && (
              <p className="text-sm text-gray-700 mb-1">
                {chartDate}
              </p>
            )}
            {natalChart.birthData && (
              <p className="text-xs text-gray-500">
                Lat: {natalChart.birthData.latitude.toFixed(4)}, Long: {natalChart.birthData.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Food Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-gray-800">Food Preferences</h3>
              <button
                onClick={onEditPreferences}
                className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3 text-sm">
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
              {preferences.dietaryRestrictions.length === 0 &&
                preferences.preferredCuisines.length === 0 &&
                preferences.dislikedIngredients.length === 0 && (
                  <p className="text-gray-400 italic">No preferences set yet</p>
                )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-red-100">
            <h3 className="text-base font-bold text-red-700 mb-3">Actions</h3>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Detail Card ──────────────────────────────────────────── */

function DetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: string;
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-gray-500 font-medium uppercase">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-800 capitalize">{value || '—'}</span>
    </div>
  );
}

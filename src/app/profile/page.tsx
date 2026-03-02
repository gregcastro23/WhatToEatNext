'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { LocationSearch } from '@/components/onboarding/LocationSearch';
import { UserDashboard } from '@/components/dashboard';
import { FoodPreferences } from '@/components/profile/FoodPreferences';
import type { BirthData } from '@/types/natalChart';

type ProfileStep = 'birth-data' | 'preferences' | 'dashboard';

interface UserPreferences {
  dietaryRestrictions: string[];
  preferredCuisines: string[];
  dislikedIngredients: string[];
  spicePreference: 'mild' | 'medium' | 'hot';
  complexity: 'simple' | 'moderate' | 'complex';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: [],
  preferredCuisines: [],
  dislikedIngredients: [],
  spicePreference: 'medium',
  complexity: 'moderate',
};

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const { state } = useAlchemical();

  const [profileData, setProfileData] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [currentStep, setCurrentStep] = useState<ProfileStep>('birth-data');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prefsCompleted, setPrefsCompleted] = useState(false);

  // Birth data form state
  const [birthDateTime, setBirthDateTime] = useState('');
  const [birthLocation, setBirthLocation] = useState<{
    displayName: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  // Read preferencesCompleted flag on mount (SSR-safe)
  useEffect(() => {
    setPrefsCompleted(!!getStorageItem('preferencesCompleted'));
  }, []);

  // Determine step based on profile data
  // After birth data is complete, go directly to dashboard.
  // Preferences are optional and can be edited from the dashboard settings tab.
  const determineStep = useCallback((profile: any, _prefs: UserPreferences, _prefsComplete: boolean): ProfileStep => {
    if (!profile?.natalChart) return 'birth-data';
    return 'dashboard';
  }, []);

  // Fetch existing profile on mount
  useEffect(() => {
    async function fetchProfile() {
      if (status !== 'authenticated' || !session) {
        setIsFetchingProfile(false);
        return;
      }

      let profile: any = null;

      // 1. Try server API first
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.profile) {
            profile = data.profile;
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile from API:', err);
      }

      // 2. Fall back to localStorage (populated during onboarding)
      if (!profile?.natalChart) {
        try {
          const stored = getStorageItem('userProfile');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.natalChart) {
              profile = {
                ...parsed,
                userId: parsed.userId || session.user?.id,
                name: parsed.name || session.user?.name,
                email: parsed.email || session.user?.email,
              };
            }
          }
        } catch {
          // localStorage parse failed, continue without
        }
      }

      if (profile) {
        setProfileData(profile);
      }

      // Load preferences from localStorage
      const storedPrefs = getStorageItem('userFoodPreferences');
      const loadedPrefs = storedPrefs ? JSON.parse(storedPrefs) : DEFAULT_PREFERENCES;
      setPreferences(loadedPrefs);

      const prefsComplete = !!getStorageItem('preferencesCompleted');
      setPrefsCompleted(prefsComplete);
      setCurrentStep(determineStep(profile, loadedPrefs, prefsComplete));
      setIsFetchingProfile(false);
    }
    fetchProfile();
  }, [status, session, determineStep]);

  // Handle birth data submission
  const handleBirthDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!session?.user?.email || !session?.user?.name) {
      setError('Session missing user info. Please log out and log in again.');
      return;
    }
    if (!birthLocation) {
      setError('Please select a birth location.');
      return;
    }
    if (!birthDateTime) {
      setError('Please enter your birth date and time.');
      return;
    }

    setIsLoading(true);

    try {
      const birthData: BirthData = {
        dateTime: new Date(birthDateTime).toISOString(),
        latitude: birthLocation.latitude,
        longitude: birthLocation.longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          birthData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Chart calculation failed');
      }

      // Store in localStorage as a fallback for the dashboard
      const enrichedChart = {
        ...result.natalChart,
        birthData,
        ascendant: result.natalChart?.planetaryPositions?.Ascendant || 'aries',
        dominantModality: 'Cardinal',
        calculatedAt: new Date().toISOString(),
      };
      localStorage.setItem('userProfile', JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        birthData,
        natalChart: enrichedChart,
      }));

      // Update session so middleware knows onboarding is complete
      await updateSession();

      // Refresh profile from server
      let serverProfile: any = null;
      try {
        const profileRes = await fetch('/api/user/profile', { credentials: 'include' });
        if (profileRes.ok) {
          const profileResult = await profileRes.json();
          if (profileResult.success && profileResult.profile) {
            serverProfile = profileResult.profile;
          }
        }
      } catch {
        // Server fetch failed — we'll use the localStorage data below
      }

      // Use server profile if available, otherwise fall back to localStorage data
      setProfileData(serverProfile || {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        birthData,
        natalChart: enrichedChart,
      });

      // Go directly to dashboard after birth data is saved
      setCurrentStep('dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred while calculating your chart');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preferences save
  const handlePreferencesSave = (updatedPrefs: UserPreferences) => {
    setPreferences(updatedPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userFoodPreferences', JSON.stringify(updatedPrefs));
      localStorage.setItem('preferencesCompleted', 'true');
    }
    setPrefsCompleted(true);

    // Also sync to server profile
    fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        preferences: updatedPrefs,
      }),
    }).catch(() => {
      // Silently fail - localStorage is our fallback
    });

    setCurrentStep('dashboard');
  };

  // Loading states
  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        <p className="ml-4 text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-purple-50 via-orange-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Main content */}
        {isFetchingProfile ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-white/60 rounded-xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/60 rounded-xl" />
              <div className="h-64 bg-white/60 rounded-xl" />
            </div>
          </div>
        ) : currentStep === 'birth-data' ? (
          <div className="space-y-6">
            {/* Step indicator for onboarding flow */}
            <div className="flex items-center justify-center gap-2">
              {['birth-data', 'preferences', 'dashboard'].map((step, idx) => {
                const labels = ['Birth Chart', 'Preferences', 'Dashboard'];
                const isActive = currentStep === step;
                const isCompleted =
                  (step === 'birth-data' && profileData?.natalChart) ||
                  (step === 'preferences' && prefsCompleted);
                return (
                  <div key={step} className="flex items-center gap-2">
                    {idx > 0 && <div className="w-8 h-px bg-gray-300" />}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted && !isActive ? '\u2713' : idx + 1}
                      </div>
                      <span className={`text-xs font-medium hidden sm:inline ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                        {labels[idx]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <BirthDataStep
              birthDateTime={birthDateTime}
              setBirthDateTime={setBirthDateTime}
              birthLocation={birthLocation}
              setBirthLocation={setBirthLocation}
              onSubmit={handleBirthDataSubmit}
              isLoading={isLoading}
              hasExistingChart={!!profileData?.natalChart}
              onSkip={profileData?.natalChart ? () => setCurrentStep('dashboard') : undefined}
            />
          </div>
        ) : currentStep === 'preferences' ? (
          <FoodPreferences
            preferences={preferences}
            onSave={handlePreferencesSave}
            onBack={() => setCurrentStep('birth-data')}
          />
        ) : profileData?.natalChart ? (
          /* Full User Dashboard — shown after birth data + preferences are complete */
          <UserDashboard
            session={session}
            profileData={profileData}
            natalChart={profileData.natalChart}
            preferences={preferences}
            onEditBirthData={() => setCurrentStep('birth-data')}
            onEditPreferences={() => setCurrentStep('preferences')}
          />
        ) : (
          /* Fallback if no natal chart (shouldn't happen but safe) */
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-600">Please complete your birth chart to access the dashboard.</p>
            <button
              onClick={() => setCurrentStep('birth-data')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Enter Birth Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Birth Data Step ────────────────────────────────────────────────────── */

function BirthDataStep({
  birthDateTime,
  setBirthDateTime,
  birthLocation,
  setBirthLocation,
  onSubmit,
  isLoading,
  hasExistingChart,
  onSkip,
}: {
  birthDateTime: string;
  setBirthDateTime: (v: string) => void;
  birthLocation: { displayName: string; latitude: number; longitude: number } | null;
  setBirthLocation: (v: { displayName: string; latitude: number; longitude: number } | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  hasExistingChart: boolean;
  onSkip?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
          {hasExistingChart ? 'Update Your Birth Chart' : 'Calculate Your Birth Chart'}
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          Your birth time and location allow us to calculate your natal chart, which powers personalized food recommendations.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birth Date &amp; Time
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="datetime-local"
            value={birthDateTime}
            onChange={(e) => setBirthDateTime(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter as precisely as possible for the most accurate chart.
          </p>
        </div>

        <LocationSearch
          onLocationSelect={(location) => setBirthLocation(location)}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Calculating Chart...
              </span>
            ) : hasExistingChart ? (
              'Recalculate Chart'
            ) : (
              'Calculate My Chart'
            )}
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </form>

      {/* Info cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-2xl mb-2">&#x1F52E;</div>
          <h3 className="font-semibold text-purple-800 mb-1 text-sm">Natal Chart</h3>
          <p className="text-xs text-purple-700">
            Your unique astrological profile based on planetary positions at birth
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
          <div className="text-2xl mb-2">&#x2697;&#xFE0F;</div>
          <h3 className="font-semibold text-orange-800 mb-1 text-sm">Alchemical Properties</h3>
          <p className="text-xs text-orange-700">
            Spirit, Essence, Matter &amp; Substance from your cosmic alignment
          </p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-2xl mb-2">&#x1F37D;&#xFE0F;</div>
          <h3 className="font-semibold text-blue-800 mb-1 text-sm">Personalized Picks</h3>
          <p className="text-xs text-blue-700">
            Cuisine &amp; ingredient suggestions tailored to your chart
          </p>
        </div>
      </div>
    </div>
  );
}
